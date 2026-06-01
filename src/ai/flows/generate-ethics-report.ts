'use server';

/**
 * @fileOverview Generates a personalized "ethical journey" report from
 * the user's actual Story decisions and their cumulative framework
 * scores.
 *
 * Follows the same defensive contract as compare-perspectives.ts: this
 * server action NEVER throws. It returns a structured payload with an
 * optional `error` / `errorCode`, so the client shows a specific
 * diagnostic rather than a scrubbed "Server Components" error. Output
 * is requested as JSON and parsed defensively.
 *
 * The report is grounded in the user's real choices — the prompt is
 * fed the actual decisions, the dominant/secondary frameworks, and the
 * detected tensions — and is instructed NOT to invent decisions the
 * user did not make.
 */

import { ai } from '@/ai/genkit';
import { generateProse } from '@/ai/generate';
import { z } from 'genkit';
import {
  MIN_DECISIONS_FOR_REPORT,
  type EthicsReport,
} from '@/lib/ethics/report-types';

const DecisionSchema = z.object({
  storyTitle: z.string().optional(),
  prompt: z.string(),
  choiceText: z.string(),
  /** Comma-joined framework labels this choice leaned toward. */
  frameworks: z.string(),
  interpretation: z.string(),
});

const RankedSchema = z.object({
  label: z.string(),
  score: z.number(),
});

const TensionSchema = z.object({
  a: z.string(),
  b: z.string(),
  note: z.string(),
});

const GenerateEthicsReportInputSchema = z.object({
  totalDecisions: z.number(),
  dominant: z.array(RankedSchema),
  secondary: z.array(RankedSchema),
  tensions: z.array(TensionSchema),
  decisions: z.array(DecisionSchema),
});
export type GenerateEthicsReportInput = z.infer<
  typeof GenerateEthicsReportInputSchema
>;

const GenerateEthicsReportOutputSchema = z.object({
  /** 2–3 sentence headline characterizing the reader's ethical style. */
  reflectiveSummary: z.string(),
  /** The reader's dominant frameworks, each with a grounded gloss. */
  dominantFrameworks: z.array(
    z.object({ framework: z.string(), summary: z.string() }),
  ),
  /** Patterns observed across decisions. */
  patterns: z.array(z.string()),
  /** Concrete examples tied to specific choices the reader made. */
  examples: z.array(
    z.object({ choice: z.string(), insight: z.string() }),
  ),
  /** Ethical tensions / tradeoffs evident in the choices. */
  tensions: z.array(z.string()),
  error: z.string().optional(),
  errorCode: z
    .enum([
      'missing_api_key',
      'rate_limited',
      'upstream_error',
      'insufficient_data',
      'empty_output',
      'parse_error',
    ])
    .optional(),
});
/**
 * The flow's output type. Structurally identical to the shared
 * EthicsReport interface (which lives in report-types.ts so the
 * client card can import it without pulling in this 'use server' file).
 */
type GenerateEthicsReportOutput = EthicsReport;

function hasGeminiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY,
  );
}

function emptyOut(): Omit<GenerateEthicsReportOutput, 'error' | 'errorCode'> {
  return {
    reflectiveSummary: '',
    dominantFrameworks: [],
    patterns: [],
    examples: [],
    tensions: [],
  };
}

export async function generateEthicsReport(
  input: GenerateEthicsReportInput,
): Promise<GenerateEthicsReportOutput> {
  if (!input || input.totalDecisions < MIN_DECISIONS_FOR_REPORT) {
    return {
      ...emptyOut(),
      errorCode: 'insufficient_data',
      error: `Make at least ${MIN_DECISIONS_FOR_REPORT} Story decisions to generate a report. You have ${input?.totalDecisions ?? 0} so far.`,
    };
  }

  if (!hasGeminiKey()) {
    return {
      ...emptyOut(),
      errorCode: 'missing_api_key',
      error:
        'The ethical-journey report is not configured. The deployment is missing the GEMINI_API_KEY environment variable. Set it in Netlify and redeploy.',
    };
  }

  try {
    return await generateEthicsReportFlow(input);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[generateEthicsReport] flow failed:', raw);
    const lower = raw.toLowerCase();
    if (lower.includes('429') || lower.includes('rate')) {
      return {
        ...emptyOut(),
        errorCode: 'rate_limited',
        error:
          'The Gemini API is rate-limiting requests right now. Try again in a minute.',
      };
    }
    return {
      ...emptyOut(),
      errorCode: 'upstream_error',
      error: `Report generation failed: ${raw}`,
    };
  }
}

function extractJsonObject(text: string): unknown | null {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through */
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      /* fall through */
    }
  }
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

const SYSTEM_PROMPT = `You are an ethics professor writing a warm, precise, intellectually honest reflection on a student's decision-making in a series of interactive science-fiction ethics scenarios. You ground every observation in the specific choices they actually made. You never flatter, never invent decisions, and you are willing to name tensions and blind spots respectfully.`;

const generateEthicsReportFlow = ai.defineFlow(
  {
    name: 'generateEthicsReportFlow',
    inputSchema: GenerateEthicsReportInputSchema,
    outputSchema: GenerateEthicsReportOutputSchema,
  },
  async (input): Promise<GenerateEthicsReportOutput> => {
    const dominantList = input.dominant
      .map((d) => `${d.label} (weight ${d.score})`)
      .join(', ');
    const secondaryList = input.secondary
      .map((d) => `${d.label} (weight ${d.score})`)
      .join(', ');
    const tensionList = input.tensions
      .map((t) => `${t.a} vs ${t.b}: ${t.note}`)
      .join('\n');
    const decisionList = input.decisions
      .map(
        (d, i) =>
          `${i + 1}. [${d.storyTitle ?? 'Story'}] Prompt: "${d.prompt}"\n   Chose: "${d.choiceText}"\n   Leaned: ${d.frameworks}\n   Note: ${d.interpretation}`,
      )
      .join('\n');

    const userPrompt = `Write an ethical-journey report for a reader based ONLY on the data below. Do not invent choices they did not make. Reference specific choices by their wording when giving examples.

Cumulative dominant frameworks: ${dominantList || 'none'}
Secondary frameworks: ${secondaryList || 'none'}
Detected tensions:
${tensionList || 'none detected'}

The reader's actual decisions (${input.totalDecisions} total):
${decisionList}

Respond with ONLY a JSON object (no markdown, no preface) in exactly this shape:
{
  "reflectiveSummary": "<2-3 sentences characterizing their overall ethical style, grounded in the data>",
  "dominantFrameworks": [ { "framework": "<framework name>", "summary": "<1-2 sentences on how this showed up in their choices>" } ],
  "patterns": [ "<a pattern you observed across multiple decisions>" ],
  "examples": [ { "choice": "<short quote or paraphrase of a specific choice they made>", "insight": "<what this choice reveals about their reasoning>" } ],
  "tensions": [ "<an ethical tension or tradeoff evident in their choices>" ]
}

Rules:
- Ground every dominantFrameworks entry in the actual frameworks listed above.
- Provide 2-4 examples, each tied to a real decision from the list.
- If tensions were detected, reflect them; if none, you may infer subtle ones from the decisions but say so.
- Be specific and concrete. Avoid generic ethics-textbook descriptions.`;

    const { text } = await generateProse({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    const parsed = extractJsonObject(text);
    if (!parsed || typeof parsed !== 'object') {
      return {
        ...emptyOut(),
        errorCode: 'parse_error',
        error:
          'The model returned an unparseable response. Try generating the report again.',
      };
    }

    const p = parsed as Record<string, unknown>;
    const asStringArray = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];

    const out: GenerateEthicsReportOutput = {
      reflectiveSummary:
        typeof p.reflectiveSummary === 'string' ? p.reflectiveSummary : '',
      dominantFrameworks: Array.isArray(p.dominantFrameworks)
        ? (p.dominantFrameworks as Array<Record<string, unknown>>)
            .map((d) => ({
              framework: typeof d.framework === 'string' ? d.framework : '',
              summary: typeof d.summary === 'string' ? d.summary : '',
            }))
            .filter((d) => d.framework && d.summary)
        : [],
      patterns: asStringArray(p.patterns),
      examples: Array.isArray(p.examples)
        ? (p.examples as Array<Record<string, unknown>>)
            .map((e) => ({
              choice: typeof e.choice === 'string' ? e.choice : '',
              insight: typeof e.insight === 'string' ? e.insight : '',
            }))
            .filter((e) => e.choice && e.insight)
        : [],
      tensions: asStringArray(p.tensions),
    };

    if (!out.reflectiveSummary && out.dominantFrameworks.length === 0) {
      return {
        ...emptyOut(),
        errorCode: 'empty_output',
        error:
          'The model returned an empty report. Try again, or make a few more decisions first.',
      };
    }

    return out;
  },
);
