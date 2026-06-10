/**
 * Common assessment rubric for goal-based persona dialogues.
 *
 * Six criteria scored 0–3 (missing / emerging / adequate / strong). The
 * pass rule is configurable but defaults to: adequate (≥2) on most
 * criteria, no criterion missing (0), and no critical misunderstanding.
 *
 * Pure module — no Firestore, no AI. The AI evaluation flow produces a
 * `RubricScores` object; this module decides what it means.
 */

export const RUBRIC_VERSION = 'dialogue-rubric-v1';

export type RubricCriterionId =
  | 'understanding'
  | 'application'
  | 'tradeoffs'
  | 'reflection'
  | 'evidence'
  | 'transfer';

export interface RubricCriterion {
  id: RubricCriterionId;
  label: string;
  /** What the evaluator looks for — also shown to students. */
  description: string;
}

export const RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: 'understanding',
    label: 'Understanding',
    description:
      'Shows accurate understanding of this thinker, work, or framework — not vague agreement.',
  },
  {
    id: 'application',
    label: 'Application',
    description:
      'Applies the perspective to the technology-ethics scenario concretely.',
  },
  {
    id: 'tradeoffs',
    label: 'Tradeoff Reasoning',
    description:
      'Identifies competing values and reasons about the tensions between them.',
  },
  {
    id: 'reflection',
    label: 'Reflection',
    description:
      'Explains, examines, or revises their own view in response to challenge.',
  },
  {
    id: 'evidence',
    label: 'Evidence',
    description:
      'Grounds reasoning in the conversation, the scenario, or course concepts.',
  },
  {
    id: 'transfer',
    label: 'Transfer',
    description:
      'Connects the lesson to another technology context beyond the scenario.',
  },
];

export const RUBRIC_SCORE_LABELS: Record<number, string> = {
  0: 'Missing',
  1: 'Emerging',
  2: 'Adequate',
  3: 'Strong',
};

export const MAX_CRITERION_SCORE = 3;

export type RubricScores = Record<RubricCriterionId, number>;

export interface AssessmentPassOptions {
  /** Minimum criteria that must score ≥ 2. Default 4 of 6. */
  minAdequateCriteria?: number;
  /** Whether any criterion scoring 0 blocks a pass. Default true. */
  failOnMissingCriterion?: boolean;
}

export interface AssessmentResult {
  /** 0–100, sum of criterion scores over the maximum possible. */
  scorePercent: number;
  passed: boolean;
  adequateCriteria: number;
  missingCriteria: RubricCriterionId[];
  rubricVersion: string;
}

function clampCriterion(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(MAX_CRITERION_SCORE, Math.round(n)));
}

/** Coerce arbitrary AI output into a complete, clamped score map. */
export function normalizeRubricScores(
  raw: Partial<Record<string, unknown>> | null | undefined
): RubricScores {
  const out = {} as RubricScores;
  for (const c of RUBRIC_CRITERIA) {
    out[c.id] = clampCriterion(raw?.[c.id]);
  }
  return out;
}

export function computeAssessmentResult(
  scores: RubricScores,
  criticalMisunderstanding: boolean,
  options: AssessmentPassOptions = {}
): AssessmentResult {
  const { minAdequateCriteria = 4, failOnMissingCriterion = true } = options;

  const total = RUBRIC_CRITERIA.reduce((sum, c) => sum + scores[c.id], 0);
  const max = RUBRIC_CRITERIA.length * MAX_CRITERION_SCORE;
  const scorePercent = Math.round((total / max) * 100);

  const adequateCriteria = RUBRIC_CRITERIA.filter(
    (c) => scores[c.id] >= 2
  ).length;
  const missingCriteria = RUBRIC_CRITERIA.filter(
    (c) => scores[c.id] === 0
  ).map((c) => c.id);

  const passed =
    !criticalMisunderstanding &&
    adequateCriteria >= minAdequateCriteria &&
    (!failOnMissingCriterion || missingCriteria.length === 0);

  return {
    scorePercent,
    passed,
    adequateCriteria,
    missingCriteria,
    rubricVersion: RUBRIC_VERSION,
  };
}

/** Minimum student turns before an assessment can be submitted — keeps
 *  one-sentence drive-by submissions from reaching the evaluator. */
export const MIN_ASSESSMENT_STUDENT_TURNS = 3;
