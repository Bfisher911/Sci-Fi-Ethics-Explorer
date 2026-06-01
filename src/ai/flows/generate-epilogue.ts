'use server';

/**
 * @fileOverview Generates "What Happened Next" epilogues showing long-term
 * consequences of ethical choices made in stories.
 *
 * IMPORTANT: this server action *never* throws. Next.js production mode
 * scrubs thrown server-action errors to a generic "Server Components
 * render" string, which the client used to surface as the unhelpful
 * "Failed to generate epilogue. Please try again." message. We return
 * `{ epilogueText, consequences, error?, errorCode? }` instead so the
 * client can render the real diagnostic (missing API key, upstream rate
 * limit, empty model output, etc.).
 *
 * It also builds the prompt as plain text and parses the model's free-text
 * output instead of relying on `definePrompt` + schema-constrained JSON.
 * The old schema-constrained path failed silently whenever Gemini returned
 * prose that didn't parse cleanly to the Zod schema; the `output!`
 * force-throw then hit Next.js's redacted production error path. Free-text
 * output with defensive parsing is far more resilient.
 */

import { generateProse } from '@/ai/generate';
import { z } from 'genkit';

const GenerateEpilogueInputSchema = z.object({
  storyTitle: z.string().describe('The title of the story.'),
  storyEnding: z.string().describe('A brief summary of how the story ended.'),
  userChoices: z
    .array(z.string())
    .describe('The choices the user made during the story.'),
  timeframe: z
    .enum(['1 year', '5 years', '50 years'])
    .describe('How far into the future to project.'),
  /** Optional — the reader's ending reflection, for richer continuity. */
  reflection: z.string().optional(),
  /** Optional — the reader's dominant ethical framework / leaning. */
  ethicalProfile: z.string().optional(),
});

export type GenerateEpilogueInput = z.infer<typeof GenerateEpilogueInputSchema>;

const EpilogueConsequenceSchema = z.object({
  area: z
    .string()
    .describe('The area of impact (e.g., Society, Technology, Individual).'),
  description: z.string().describe('Description of the consequence.'),
  sentiment: z
    .enum(['positive', 'negative', 'mixed'])
    .describe('Whether this consequence is positive, negative, or mixed.'),
});

export type EpilogueConsequence = z.infer<typeof EpilogueConsequenceSchema>;

const GenerateEpilogueOutputSchema = z.object({
  epilogueText: z
    .string()
    .describe(
      'A narrative epilogue describing what happened after the story ended.'
    ),
  consequences: z
    .array(EpilogueConsequenceSchema)
    .describe('Specific consequences broken down by area.'),
  /** Populated when the flow couldn't produce a real epilogue. */
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

export type GenerateEpilogueOutput = z.infer<
  typeof GenerateEpilogueOutputSchema
>;

/** Detect whether the runtime has a usable Google AI API key configured. */
function hasGeminiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY
  );
}

const SENTIMENTS = ['positive', 'negative', 'mixed'] as const;

/**
 * Pull the structured consequences out of the model's free-text response.
 * Looks first for a `<consequences>…</consequences>` block, then for any
 * bare JSON array. Every field is validated and defaulted, so a malformed
 * or partial array degrades to `[]` rather than throwing.
 */
function parseConsequences(raw: string): EpilogueConsequence[] {
  const tagged = raw.match(/<consequences>([\s\S]*?)<\/consequences>/i);
  let jsonStr = tagged ? tagged[1] : '';
  if (!jsonStr.trim()) {
    const bareArray = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    jsonStr = bareArray ? bareArray[0] : '';
  }
  if (!jsonStr.trim()) return [];

  try {
    const parsed = JSON.parse(jsonStr.trim());
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((c) => {
        const sentiment = SENTIMENTS.includes(c?.sentiment)
          ? c.sentiment
          : 'mixed';
        return {
          area: typeof c?.area === 'string' ? c.area.trim() : '',
          description:
            typeof c?.description === 'string' ? c.description.trim() : '',
          sentiment: sentiment as EpilogueConsequence['sentiment'],
        };
      })
      .filter((c) => c.area && c.description)
      .slice(0, 6);
  } catch (err) {
    console.warn('[generateEpilogue] consequence parse failed:', err);
    return [];
  }
}

/** Remove the machine-readable consequence block from the prose epilogue. */
function stripConsequenceBlock(raw: string): string {
  return raw
    .replace(/<consequences>[\s\S]*?<\/consequences>/i, '')
    .replace(/```json[\s\S]*?```/gi, '')
    .replace(/\[\s*\{[\s\S]*\}\s*\]\s*$/, '')
    .trim();
}

const SYSTEM_PROMPT = `You are a sci-fi ethics storyteller. The reader has just finished an interactive story and made a series of choices that shaped its ending. Your job is to project, vividly and specifically, what happens later as a consequence of those choices.

Write in two parts:

PART 1 — Narrative epilogue: 2-3 short paragraphs of plain prose set the given number of years after the story ends. Reference the reader's actual choices and how they rippled outward. Show consequences across society, technology, individual lives, ethics, and politics where relevant. Make it concrete and grounded, not generic. Do not moralize.

PART 2 — A machine-readable summary of the key consequences. Output it LAST, wrapped EXACTLY in <consequences></consequences> tags, as a JSON array of 2-4 objects, each: {"area": string, "description": string, "sentiment": "positive" | "negative" | "mixed"}. Use only those three sentiment values. Do not add any text after the closing tag.`;

/**
 * Public entry point. Always resolves — never throws — so client code can
 * react to a structured `{ error, errorCode }` payload instead of Next.js's
 * redacted production stub.
 */
export async function generateEpilogue(
  input: GenerateEpilogueInput
): Promise<GenerateEpilogueOutput> {
  if (
    !input?.storyTitle ||
    !Array.isArray(input.userChoices) ||
    input.userChoices.length === 0
  ) {
    return {
      epilogueText: '',
      consequences: [],
      errorCode: 'empty_input',
      error:
        'Not enough story context to generate an epilogue (missing title or choices).',
    };
  }

  if (!hasGeminiKey()) {
    return {
      epilogueText: '',
      consequences: [],
      errorCode: 'missing_api_key',
      error:
        'The epilogue engine is not configured. The deployment is missing the GEMINI_API_KEY environment variable. Set it in Netlify (Site settings → Environment variables) and redeploy.',
    };
  }

  try {
    const choicesBlock = input.userChoices
      .map((c, i) => `  ${i + 1}. ${c}`)
      .join('\n');

    const contextBits: string[] = [];
    if (input.reflection?.trim()) {
      contextBits.push(`The reader's ending reflection:\n${input.reflection.trim()}`);
    }
    if (input.ethicalProfile?.trim()) {
      contextBits.push(`The reader's ethical leaning: ${input.ethicalProfile.trim()}`);
    }
    const contextBlock =
      contextBits.length > 0 ? `\n\n${contextBits.join('\n\n')}` : '';

    const userPrompt = `Story: "${input.storyTitle}"
How the story ended: ${input.storyEnding}
Choices the reader made, in order:
${choicesBlock}${contextBlock}

Project ${input.timeframe} into the future. Write the narrative epilogue, then the <consequences> JSON block.`;

    const { text } = await generateProse({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    if (!text) {
      return {
        epilogueText: '',
        consequences: [],
        errorCode: 'empty_output',
        error:
          'The model returned an empty epilogue. This is usually transient — try again.',
      };
    }

    const consequences = parseConsequences(text);
    const epilogueText = stripConsequenceBlock(text) || text;

    return { epilogueText, consequences };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[generateEpilogue] flow failed:', raw);
    const lower = raw.toLowerCase();
    if (lower.includes('429') || lower.includes('rate')) {
      return {
        epilogueText: '',
        consequences: [],
        errorCode: 'rate_limited',
        error:
          'The Gemini API is rate-limiting requests right now. Try again in a minute.',
      };
    }
    return {
      epilogueText: '',
      consequences: [],
      errorCode: 'upstream_error',
      error: `Epilogue generation failed: ${raw}`,
    };
  }
}
