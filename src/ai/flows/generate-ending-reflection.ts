'use server';

/**
 * @fileOverview Generates a personalized reflection based on the choices made in an interactive story.
 *
 * - generateEndingReflection — A function that generates the reflection.
 * - GenerateEndingReflectionInput — The input type.
 * - GenerateEndingReflectionOutput — The return type.
 *
 * IMPORTANT: this server action *never* throws. Next.js production mode
 * scrubs thrown server-action errors to a generic "Server Components
 * render" string, which the client used to surface as the unhelpful
 * "Failed to generate reflection. Please try again later." toast. We
 * return `{ reflection, error?, errorCode? }` instead so the client
 * can render the real diagnostic (missing API key, upstream rate
 * limit, empty model output, etc.).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEndingReflectionInputSchema = z.object({
  storyTitle: z.string().describe('The title of the interactive story.'),
  userChoices: z
    .array(z.string())
    .describe('An array of the user choices made during the story.'),
  /** Optional — story genre passed as extra context for the reflection. */
  storyGenre: z.string().optional(),
  /** Optional — ethical theme of the story. */
  storyTheme: z.string().optional(),
});
export type GenerateEndingReflectionInput = z.infer<
  typeof GenerateEndingReflectionInputSchema
>;

const GenerateEndingReflectionOutputSchema = z.object({
  reflection: z
    .string()
    .describe(
      'A personalized reflection based on the user choices and the story.'
    ),
  /** Populated when the flow couldn't produce a real reflection. */
  error: z.string().optional(),
  errorCode: z
    .enum([
      'missing_api_key',
      'rate_limited',
      'upstream_error',
      'empty_input',
      'empty_output',
    ])
    .optional(),
});
export type GenerateEndingReflectionOutput = z.infer<
  typeof GenerateEndingReflectionOutputSchema
>;

/** Detect whether the runtime has a usable Google AI API key configured. */
function hasGeminiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY
  );
}

/**
 * Public entry point. Always resolves — never throws — so client code
 * can react to a structured `{ error, errorCode }` payload instead of
 * Next.js's redacted production stub.
 */
export async function generateEndingReflection(
  input: GenerateEndingReflectionInput
): Promise<GenerateEndingReflectionOutput> {
  // Input sanity. `userChoices` is an array on the schema but runtime
  // callers have been known to pass `undefined` — bail early with a
  // clear code instead of crashing inside the prompt.
  if (!input?.storyTitle || !Array.isArray(input.userChoices) || input.userChoices.length === 0) {
    return {
      reflection: '',
      errorCode: 'empty_input',
      error:
        'Not enough story context to generate a reflection (missing title or choices).',
    };
  }

  if (!hasGeminiKey()) {
    return {
      reflection: '',
      errorCode: 'missing_api_key',
      error:
        'The reflection engine is not configured. The deployment is missing the GEMINI_API_KEY environment variable. Set it in Netlify (Site settings → Environment variables) and redeploy.',
    };
  }

  try {
    const out = await generateEndingReflectionFlow(input);
    if (!out.reflection || !out.reflection.trim()) {
      return {
        reflection: '',
        errorCode: 'empty_output',
        error:
          'The model returned an empty reflection. This is usually transient — try again.',
      };
    }
    return out;
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[generateEndingReflection] flow failed:', raw);
    const lower = raw.toLowerCase();
    if (lower.includes('429') || lower.includes('rate')) {
      return {
        reflection: '',
        errorCode: 'rate_limited',
        error:
          'The Gemini API is rate-limiting requests right now. Try again in a minute.',
      };
    }
    return {
      reflection: '',
      errorCode: 'upstream_error',
      error: `Reflection generation failed: ${raw}`,
    };
  }
}

const SYSTEM_PROMPT = `You are an ethics professor and literary companion. The user has just finished an interactive science-fiction story and made a series of choices that shaped the ending. Write a short, second-person reflection (150-220 words) that:
  1. Acknowledges the specific path they walked, referencing at least two of their choices by name.
  2. Surfaces the ethical tension the choices revealed — not moralizing, but naming the tradeoff.
  3. Draws a thin, specific thread to one real ethical framework (utilitarianism, deontology, virtue ethics, social contract theory, ethics of care, capabilities approach) when relevant — but never more than one.
  4. Ends with a single open question for the reader to sit with — no lecture.

Write in the second person ("you"). Keep the tone warm but intellectually sharp. Avoid generic praise. Avoid bullet points. One or two paragraphs, plain prose.`;

const generateEndingReflectionFlow = ai.defineFlow(
  {
    name: 'generateEndingReflectionFlow',
    inputSchema: GenerateEndingReflectionInputSchema,
    outputSchema: GenerateEndingReflectionOutputSchema,
  },
  async (input) => {
    // Build the prompt as plain text instead of using definePrompt +
    // Handlebars, which relied on schema-constrained JSON output. The
    // old path failed silently when Gemini returned text that didn't
    // parse cleanly to the schema; the `output!` force-throw then
    // hit Next.js's redacted production error path. Free-text output
    // is far more resilient for short creative prose like this.
    const choicesBlock = input.userChoices
      .map((c, i) => `  ${i + 1}. ${c}`)
      .join('\n');

    const contextBits: string[] = [];
    if (input.storyGenre) contextBits.push(`Genre: ${input.storyGenre}`);
    if (input.storyTheme) contextBits.push(`Theme: ${input.storyTheme}`);
    const contextBlock =
      contextBits.length > 0 ? `\n${contextBits.join(' · ')}\n` : '';

    const userPrompt = `Story: "${input.storyTitle}"${contextBlock}
Choices the reader made, in order:
${choicesBlock}

Write the reflection now.`;

    const result = await ai.generate({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    return { reflection: (result.text ?? '').trim() };
  }
);
