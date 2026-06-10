'use server';
/**
 * @fileOverview Rubric evaluation of a completed assessment-mode dialogue.
 *
 * Reads the full conversation transcript and scores the STUDENT's
 * reasoning against the common dialogue rubric (six criteria, 0–3).
 * The pass/fail decision is NOT made here — the server action applies
 * `computeAssessmentResult` so the pass rule lives in one tested place.
 *
 * There is deliberately NO deterministic fallback: awarding certificates
 * without a real evaluation would be worse than failing loudly, so a
 * missing API key returns `errorCode: 'missing_api_key'`.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  RUBRIC_CRITERIA,
  RUBRIC_VERSION,
  normalizeRubricScores,
  type RubricScores,
} from '@/lib/dialogues/rubric';
import {
  getActiveEthicalFrameworks,
  normalizeFrameworkId,
} from '@/lib/ethical-framework-registry';
import { buildPersonaSystemPrompt } from '@/lib/dialogues/prompts';
import {
  getDialoguePersona,
  isDialogueCategory,
  type DialogueCategory,
} from '@/lib/dialogues/personas';

const TranscriptMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const EvaluateInputSchema = z.object({
  category: z.enum(['philosopher', 'scifi-author', 'scifi-media', 'framework']),
  personaId: z.string().min(1),
  messages: z.array(TranscriptMessageSchema).min(2),
});
export type EvaluatePersonaAssessmentInput = z.infer<typeof EvaluateInputSchema>;

export interface PersonaAssessmentEvaluation {
  scores: RubricScores;
  criticalMisunderstanding: boolean;
  criticalMisunderstandingNote?: string;
  /** Canonical framework ids the student demonstrably used. */
  frameworksUsed: string[];
  strengths: string[];
  growthAreas: string[];
  /** Specific guidance for a retry — shown on a non-passing result. */
  coaching: string;
  /** Short quotes/paraphrases from the student grounding the scores. */
  evidence: string[];
  /** 2–3 sentence student-friendly summary of the performance. */
  summary: string;
  rubricVersion: string;
}

export interface EvaluatePersonaAssessmentOutput {
  evaluation?: PersonaAssessmentEvaluation;
  error?: string;
  errorCode?:
    | 'missing_api_key'
    | 'rate_limited'
    | 'upstream_error'
    | 'unknown_persona'
    | 'parse_error'
    | 'invalid_input';
}

function hasGeminiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY
  );
}

function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through */
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
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
      /* fall through */
    }
  }
  return null;
}

function asStringArray(value: unknown, max = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim())
    .slice(0, max);
}

function buildTranscript(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  personaName: string
): string {
  return messages
    .map(
      (m) =>
        `${m.role === 'user' ? 'STUDENT' : personaName.toUpperCase()}: ${m.content}`
    )
    .join('\n\n');
}

export async function evaluatePersonaAssessment(
  input: EvaluatePersonaAssessmentInput
): Promise<EvaluatePersonaAssessmentOutput> {
  const parsed = EvaluateInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      errorCode: 'invalid_input',
      error: 'The conversation could not be evaluated — invalid request.',
    };
  }
  if (!isDialogueCategory(parsed.data.category)) {
    return { errorCode: 'unknown_persona', error: 'Unknown dialogue.' };
  }
  const persona = getDialoguePersona(
    parsed.data.category as DialogueCategory,
    parsed.data.personaId
  );
  if (!persona) {
    return { errorCode: 'unknown_persona', error: 'Unknown dialogue.' };
  }
  if (!hasGeminiKey()) {
    return {
      errorCode: 'missing_api_key',
      error:
        'Assessment evaluation is not configured (missing GEMINI_API_KEY). Your conversation is saved — try submitting again once the site is configured.',
    };
  }

  try {
    const frameworkList = getActiveEthicalFrameworks()
      .map((f) => `- ${f.id}: ${f.name}`)
      .join('\n');
    const criteriaList = RUBRIC_CRITERIA.map(
      (c) => `- "${c.id}" (${c.label}): ${c.description}`
    ).join('\n');

    // Reuse the persona context block so the evaluator knows what
    // "understanding this perspective" means, without re-deriving it.
    const personaBrief = buildPersonaSystemPrompt(persona, 'open')
      .split('\n\n')
      .slice(0, 2)
      .join('\n\n');

    const prompt = `You are a strict but fair ethics educator evaluating a student's reasoning in the conversation below. The student was in a goal-based assessment dialogue about the following perspective:

${personaBrief}

Safety and fairness rules:
- Evaluate ONLY the reasoning the student showed. Do not judge their character, identity, politics, or values.
- Do not pass vague agreement: require evidence of understanding, application, reflection, and tradeoff analysis.
- Quote or closely paraphrase the student when citing evidence.
- Return strict JSON only. No markdown.

Rubric — score each criterion 0 (missing), 1 (emerging), 2 (adequate), or 3 (strong):
${criteriaList}

Known ethical framework ids (use ONLY these ids in frameworksUsed):
${frameworkList}

Conversation transcript:
${buildTranscript(parsed.data.messages, persona.displayName)}

Return exactly this JSON shape:
{
  "scores": { "understanding": 0, "application": 0, "tradeoffs": 0, "reflection": 0, "evidence": 0, "transfer": 0 },
  "criticalMisunderstanding": false,
  "criticalMisunderstandingNote": "<empty string, or one sentence naming a fundamental misunderstanding>",
  "frameworksUsed": ["<framework id>"],
  "strengths": ["<short, specific strength>"],
  "growthAreas": ["<short, specific growth area>"],
  "coaching": "<2-4 sentences of specific guidance for improving on a retry, without giving away answers>",
  "evidence": ["<short quote or close paraphrase from the student>"],
  "summary": "<2-3 student-friendly sentences summarizing the performance>"
}`;

    const result = await ai.generate(prompt);
    const raw = extractJsonObject(result.text ?? '');
    if (!raw || typeof raw !== 'object') {
      return {
        errorCode: 'parse_error',
        error:
          'The evaluator returned an unreadable result. Your conversation is saved — submit again.',
      };
    }
    const obj = raw as Record<string, unknown>;
    const frameworksUsed = asStringArray(obj.frameworksUsed, 12)
      .map((f) => normalizeFrameworkId(f))
      .filter((f): f is string => Boolean(f));

    return {
      evaluation: {
        scores: normalizeRubricScores(
          (obj.scores as Record<string, unknown>) ?? null
        ),
        criticalMisunderstanding: obj.criticalMisunderstanding === true,
        criticalMisunderstandingNote:
          typeof obj.criticalMisunderstandingNote === 'string' &&
          obj.criticalMisunderstandingNote.trim()
            ? obj.criticalMisunderstandingNote.trim()
            : undefined,
        frameworksUsed: Array.from(new Set(frameworksUsed)),
        strengths: asStringArray(obj.strengths),
        growthAreas: asStringArray(obj.growthAreas),
        coaching:
          typeof obj.coaching === 'string' && obj.coaching.trim()
            ? obj.coaching.trim()
            : 'Revisit the core ideas of this perspective, then try the scenario again with more specific reasoning.',
        evidence: asStringArray(obj.evidence),
        summary:
          typeof obj.summary === 'string' && obj.summary.trim()
            ? obj.summary.trim()
            : 'Evaluation complete.',
        rubricVersion: RUBRIC_VERSION,
      },
    };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[evaluatePersonaAssessment] failed:', raw);
    if (raw.toLowerCase().includes('429') || raw.toLowerCase().includes('rate')) {
      return {
        errorCode: 'rate_limited',
        error: 'The evaluator is rate-limited right now. Try again in a minute.',
      };
    }
    return {
      errorCode: 'upstream_error',
      error:
        'Evaluation hit a temporary problem. Your conversation is saved — submit again.',
    };
  }
}
