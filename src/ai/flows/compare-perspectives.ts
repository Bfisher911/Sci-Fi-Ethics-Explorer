
'use server';

/**
 * @fileOverview Compares how different ethical frameworks would evaluate
 * a given scenario and user choice.
 *
 * IMPORTANT: this server action *never* throws. Next.js production
 * scrubs thrown server-action errors, which previously surfaced as
 * the vague "Analysis failed. An error occurred while analyzing
 * perspectives." toast. We now return `{ comparisons, synthesis, error?,
 * errorCode? }` — clients check `error` / `errorCode` and show a
 * specific diagnostic instead.
 *
 * We also moved OFF Genkit's `definePrompt` + structured-JSON output
 * path. That path forced the model to emit a very specific JSON shape,
 * and whenever Gemini slipped (even a stray preamble or trailing text)
 * the schema parse returned `null` and the `output!` force-throw
 * bubbled up as a production "Server Components render" error. The new
 * path asks for JSON directly, then parses defensively with a
 * fallback that extracts a `{...}` block out of any preamble the
 * model might prepend.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ComparePerspectivesInputSchema = z.object({
  scenario: z.string().describe('The ethical scenario or dilemma.'),
  userChoice: z.string().describe('The choice the user made.'),
  frameworks: z
    .array(z.string())
    .describe(
      'The ethical frameworks to compare (e.g., Utilitarianism, Deontology, Virtue Ethics, Social Contract Theory).',
    ),
});
export type ComparePerspectivesInput = z.infer<
  typeof ComparePerspectivesInputSchema
>;

const ComparisonSchema = z.object({
  framework: z.string(),
  analysis: z.string(),
  verdict: z.string(),
  strength: z.enum(['supports', 'opposes', 'neutral']),
});
export type Comparison = z.infer<typeof ComparisonSchema>;

const ComparePerspectivesOutputSchema = z.object({
  comparisons: z.array(ComparisonSchema),
  synthesis: z.string(),
  error: z.string().optional(),
  errorCode: z
    .enum([
      'missing_api_key',
      'rate_limited',
      'upstream_error',
      'empty_input',
      'empty_output',
      'parse_error',
    ])
    .optional(),
});
export type ComparePerspectivesOutput = z.infer<
  typeof ComparePerspectivesOutputSchema
>;

function hasGeminiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY,
  );
}

export async function comparePerspectives(
  input: ComparePerspectivesInput,
): Promise<ComparePerspectivesOutput> {
  // Input sanity — match the UI's own validation so the server's
  // error message agrees with the client's if someone manages to
  // bypass the form (API call, stale client, etc.).
  if (!input?.scenario?.trim() || !input?.userChoice?.trim()) {
    return {
      comparisons: [],
      synthesis: '',
      errorCode: 'empty_input',
      error:
        'Both the scenario and your choice are required to run the comparison.',
    };
  }
  if (!Array.isArray(input.frameworks) || input.frameworks.length === 0) {
    return {
      comparisons: [],
      synthesis: '',
      errorCode: 'empty_input',
      error: 'Select at least one ethical framework to compare.',
    };
  }

  if (!hasGeminiKey()) {
    return {
      comparisons: [],
      synthesis: '',
      errorCode: 'missing_api_key',
      error:
        'The perspective analyzer is not configured. The deployment is missing the GEMINI_API_KEY environment variable. Set it in Netlify (Site settings → Environment variables) and redeploy.',
    };
  }

  try {
    const out = await comparePerspectivesFlow(input);
    return out;
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[comparePerspectives] flow failed:', raw);
    const lower = raw.toLowerCase();
    if (lower.includes('429') || lower.includes('rate')) {
      return {
        comparisons: [],
        synthesis: '',
        errorCode: 'rate_limited',
        error:
          'The Gemini API is rate-limiting requests right now. Try again in a minute.',
      };
    }
    return {
      comparisons: [],
      synthesis: '',
      errorCode: 'upstream_error',
      error: `Perspective analysis failed: ${raw}`,
    };
  }
}

/**
 * Extract the outermost JSON object from a blob of model text, even
 * when the model prepends a conversational preface or wraps the JSON
 * in a markdown code fence. Returns `null` if no valid JSON object
 * can be recovered.
 */
function extractJsonObject(text: string): unknown | null {
  if (!text) return null;
  const trimmed = text.trim();
  // Direct parse — the happy path.
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to extraction
  }
  // Strip markdown code fences.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // fall through
    }
  }
  // Last resort: grab the first balanced {...} block.
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
}

const SYSTEM_PROMPT = `You are an ethics professor specializing in applied ethics through science fiction. You are precise, fair, and willing to disagree with a reader while respecting their autonomy.`;

const comparePerspectivesFlow = ai.defineFlow(
  {
    name: 'comparePerspectivesFlow',
    inputSchema: ComparePerspectivesInputSchema,
    outputSchema: ComparePerspectivesOutputSchema,
  },
  async (input): Promise<ComparePerspectivesOutput> => {
    const frameworksList = input.frameworks.map((f) => `- ${f}`).join('\n');

    const userPrompt = `Analyze the following scenario and the user's choice through the lens of each requested ethical framework. For each framework, explain (a) how it would evaluate the choice, (b) what verdict it would render (support / oppose / mixed), and (c) the concise one-word "strength" label. Then write a short synthesis that highlights agreements and disagreements across frameworks.

Scenario:
${input.scenario}

User's Choice:
${input.userChoice}

Frameworks to analyze:
${frameworksList}

Respond with **ONLY** a JSON object. Do not wrap in markdown. Do not add prose before or after. Use exactly this shape:

{
  "comparisons": [
    {
      "framework": "<framework name exactly as given>",
      "analysis": "<2-4 sentences on how this framework evaluates the choice>",
      "verdict": "<one short sentence: what would this framework tell the reader?>",
      "strength": "<one of: supports | opposes | neutral>"
    }
  ],
  "synthesis": "<2-4 sentences summarizing agreements and disagreements across the frameworks>"
}

Rules:
- Include one object in "comparisons" for every framework requested, in the same order.
- "strength" must be exactly "supports", "opposes", or "neutral" (lowercase).
- Never leave "analysis" or "verdict" empty.
- Do not invent frameworks that weren't requested.`;

    const result = await ai.generate({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    const text = result.text ?? '';
    const parsed = extractJsonObject(text);
    if (!parsed) {
      console.error(
        '[comparePerspectives] could not parse model output. Raw:',
        text.slice(0, 500),
      );
      return {
        comparisons: [],
        synthesis: '',
        errorCode: 'parse_error',
        error:
          'The model returned an unparseable response. Try running the comparison again — it usually succeeds on a retry.',
      };
    }

    // Lightly validate + normalize. We don't re-run the full zod
    // outputSchema because the optional `error` / `errorCode` fields
    // aren't part of what the model returns; we only add those on
    // failure.
    const p = parsed as {
      comparisons?: unknown;
      synthesis?: unknown;
    };
    const comparisonsRaw = Array.isArray(p.comparisons) ? p.comparisons : [];
    const comparisons: Comparison[] = [];
    for (const c of comparisonsRaw as Array<Record<string, unknown>>) {
      const framework = typeof c.framework === 'string' ? c.framework : '';
      const analysis = typeof c.analysis === 'string' ? c.analysis : '';
      const verdict = typeof c.verdict === 'string' ? c.verdict : '';
      const strengthRaw = typeof c.strength === 'string' ? c.strength.toLowerCase() : '';
      const strength: Comparison['strength'] =
        strengthRaw === 'supports' || strengthRaw === 'opposes'
          ? (strengthRaw as 'supports' | 'opposes')
          : 'neutral';
      if (framework && analysis) {
        comparisons.push({ framework, analysis, verdict, strength });
      }
    }
    const synthesis = typeof p.synthesis === 'string' ? p.synthesis : '';

    if (comparisons.length === 0) {
      return {
        comparisons: [],
        synthesis: '',
        errorCode: 'empty_output',
        error:
          'The model returned an empty analysis. Try rephrasing the scenario or running the comparison again.',
      };
    }

    return { comparisons, synthesis };
  },
);
