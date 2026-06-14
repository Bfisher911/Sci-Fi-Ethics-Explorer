'use server';

/**
 * @fileOverview Generates a "Technology Role Fit Reflection Report" from
 * a student's cumulative ethical-framework profile.
 *
 * This is a REFLECTION tool, not a hiring instrument. It translates the
 * student's recurring ethical tendencies into possible technology-role
 * strengths and perspectives — always framed as "may be useful," with a
 * mandatory caveat that it is educational and not a psychological
 * diagnosis, employment test, or final judgment of ability.
 *
 * Same defensive contract as generate-ethics-report.ts: never throws,
 * returns a structured payload with optional error/errorCode, parses
 * the model's JSON defensively, and guards on insufficient data + a
 * missing API key.
 */

import { ai } from '@/ai/genkit';
import { generateProse } from '@/ai/generate';
import { z } from 'genkit';
import {
  MIN_DECISIONS_FOR_REPORT,
  type RoleFitReport,
} from '@/lib/ethics/report-types';

const RankedSchema = z.object({
  label: z.string(),
  score: z.number(),
});

const GenerateRoleFitInputSchema = z.object({
  totalDecisions: z.number(),
  dominant: z.array(RankedSchema),
  secondary: z.array(RankedSchema),
  /** Underrepresented frameworks (low/zero score) — for the blind-spot lens. */
  underrepresented: z.array(z.string()),
  /** Technology topics where the student showed strong engagement. */
  strongTopics: z.array(z.string()),
});
export type GenerateRoleFitInput = z.infer<typeof GenerateRoleFitInputSchema>;

const STANDARD_CAVEAT =
  'This is a reflective, educational report based on your responses to ethics scenarios. It is not a psychological diagnosis, an employment test, or a final judgment of your abilities. Your ethical instincts are one of many strengths you bring, and they will keep evolving as you complete more activities.';

function hasGeminiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY,
  );
}

function emptyOut(): Omit<RoleFitReport, 'error' | 'errorCode'> {
  return {
    summary: '',
    topTendencies: [],
    workplaceBehaviors: [],
    strengths: [],
    blindSpots: [],
    roleAffinities: [],
    helpfulPerspectiveFor: [],
    reflectionQuestions: [],
    caveat: STANDARD_CAVEAT,
  };
}

export async function generateRoleFitReport(
  input: GenerateRoleFitInput,
): Promise<RoleFitReport> {
  if (!input || input.totalDecisions < MIN_DECISIONS_FOR_REPORT) {
    return {
      ...emptyOut(),
      errorCode: 'insufficient_data',
      error: `Complete at least ${MIN_DECISIONS_FOR_REPORT} ethics activities to generate a role-fit reflection. You have ${input?.totalDecisions ?? 0} so far.`,
    };
  }
  if (!hasGeminiKey()) {
    return {
      ...emptyOut(),
      errorCode: 'missing_api_key',
      error:
        'The role-fit reflection is not configured. The deployment is missing the GEMINI_API_KEY environment variable.',
    };
  }
  try {
    return await generateRoleFitFlow(input);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[generateRoleFitReport] flow failed:', raw);
    if (raw.toLowerCase().includes('429') || raw.toLowerCase().includes('rate')) {
      return {
        ...emptyOut(),
        errorCode: 'rate_limited',
        error: 'The Gemini API is rate-limiting requests right now. Try again in a minute.',
      };
    }
    return {
      ...emptyOut(),
      errorCode: 'upstream_error',
      error: `Role-fit report generation failed: ${raw}`,
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

const SYSTEM_PROMPT = `You are a thoughtful career-and-ethics mentor writing a REFLECTIVE report that helps a student think about where their ethical instincts might be useful in technology work. You are encouraging but honest, and you treat ethical tendencies as one strength among many. You NEVER claim a student is suited only for one role, NEVER tell an employer to assign or screen anyone, and NEVER frame this as a test or diagnosis. You always present role ideas as possibilities ("may be a natural fit for…", "could offer a helpful perspective on…"), and you always name possible blind spots alongside strengths. You ground every suggestion in the student's actual ethical tendencies.`;

const RoleFitOutputSchema = z.object({
  summary: z.string(),
  topTendencies: z.array(z.string()),
  workplaceBehaviors: z.array(z.string()),
  strengths: z.array(z.string()),
  blindSpots: z.array(z.string()),
  roleAffinities: z.array(z.object({ role: z.string(), why: z.string() })),
  helpfulPerspectiveFor: z.array(z.string()),
  reflectionQuestions: z.array(z.string()),
  caveat: z.string(),
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

const generateRoleFitFlow = ai.defineFlow(
  {
    name: 'generateRoleFitFlow',
    inputSchema: GenerateRoleFitInputSchema,
    outputSchema: RoleFitOutputSchema,
  },
  async (input): Promise<RoleFitReport> => {
    const dominantList = input.dominant.map((d) => `${d.label} (weight ${d.score})`).join(', ');
    const secondaryList = input.secondary.map((d) => `${d.label} (weight ${d.score})`).join(', ');

    const userPrompt = `Write a Technology Role Fit Reflection Report for a student based ONLY on the ethical-tendency data below. This is a reflection tool, not a hiring test.

Dominant ethical frameworks: ${dominantList || 'none yet'}
Secondary frameworks: ${secondaryList || 'none'}
Underrepresented frameworks (possible growth areas / blind spots): ${input.underrepresented.join(', ') || 'none notable'}
Technology topics they engaged with most: ${input.strongTopics.join(', ') || 'a range of topics'}

Use these illustrative mappings as guidance (do not state them mechanically — synthesize for THIS student):
- Care ethics → user advocacy, support, accessibility, student success, patient-facing tech, customer-facing design.
- Utilitarian / consequentialist reasoning → large-scale policy, risk analysis, emergency management, systems design, resource allocation.
- Deontological / rights-based reasoning → compliance, governance, policy enforcement, privacy review, procedural accountability.
- Virtue ethics → leadership development, mentoring, professional culture, trust-centered team roles.
- Justice / capabilities frameworks → equity review, AI fairness, accessibility, public-interest technology, institutional policy.
- Pragmatism → implementation, operations, product management, cross-functional decision-making.

Respond with ONLY a JSON object (no markdown, no preface) in exactly this shape:
{
  "summary": "<2-3 sentences on how their ethical instincts might show up in technology work, framed as possibility>",
  "topTendencies": [ "<a recurring ethical tendency, grounded in the data>" ],
  "workplaceBehaviors": [ "<how a tendency may show up in real workplace decision-making>" ],
  "strengths": [ "<a possible strength>" ],
  "blindSpots": [ "<a possible blind spot to stay aware of, tied to underrepresented frameworks where relevant>" ],
  "roleAffinities": [ { "role": "<a technology role or responsibility>", "why": "<why their tendencies may make this a natural fit>" } ],
  "helpfulPerspectiveFor": [ "<a kind of team or decision where they may offer a helpful perspective>" ],
  "reflectionQuestions": [ "<an open question for the student to reflect on>" ]
}

Rules:
- Provide 3-5 roleAffinities, each grounded in their actual dominant/secondary frameworks.
- Always include at least 2 blindSpots; balance every strength honestly.
- Use possibility language ("may", "could", "often"). Never deterministic claims.
- Do NOT include a caveat field — it is added separately.`;

    const { text } = await generateProse({ system: SYSTEM_PROMPT, prompt: userPrompt });
    const parsed = extractJsonObject(text);
    if (!parsed || typeof parsed !== 'object') {
      return {
        ...emptyOut(),
        errorCode: 'parse_error',
        error: 'The model returned an unparseable response. Try again.',
      };
    }

    const p = parsed as Record<string, unknown>;
    const strArr = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

    const out: RoleFitReport = {
      summary: typeof p.summary === 'string' ? p.summary : '',
      topTendencies: strArr(p.topTendencies),
      workplaceBehaviors: strArr(p.workplaceBehaviors),
      strengths: strArr(p.strengths),
      blindSpots: strArr(p.blindSpots),
      roleAffinities: Array.isArray(p.roleAffinities)
        ? (p.roleAffinities as Array<Record<string, unknown>>)
            .map((r) => ({
              role: typeof r.role === 'string' ? r.role : '',
              why: typeof r.why === 'string' ? r.why : '',
            }))
            .filter((r) => r.role && r.why)
        : [],
      helpfulPerspectiveFor: strArr(p.helpfulPerspectiveFor),
      reflectionQuestions: strArr(p.reflectionQuestions),
      caveat: STANDARD_CAVEAT,
    };

    if (!out.summary && out.roleAffinities.length === 0) {
      return {
        ...emptyOut(),
        errorCode: 'empty_output',
        error: 'The model returned an empty report. Try again.',
      };
    }
    return out;
  },
);
