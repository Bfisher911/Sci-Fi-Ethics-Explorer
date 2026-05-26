import { z } from 'zod';
import { getActiveFrameworkIdSet, normalizeFrameworkId } from '@/lib/ethical-framework-registry';
import type { EthicalJudgmentAnalysis, EthicalJudgmentEvent } from '@/types';

const activeFrameworkIds = () => getActiveFrameworkIdSet();

function ensureKnownFramework(frameworkId: string, ctx: z.RefinementCtx, path: (string | number)[]): void {
  const canonicalId = normalizeFrameworkId(frameworkId);
  if (!canonicalId || !activeFrameworkIds().has(canonicalId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: `Unknown ethical framework: ${frameworkId}`,
    });
  }
}

export const EthicalFrameworkScoreSchema = z
  .object({
    frameworkId: z.string().min(1),
    score: z.number().min(0, 'score must be at least 0').max(100, 'score must be at most 100'),
    confidence: z.number().min(0).max(1).optional(),
    rationale: z.string().optional(),
  })
  .superRefine((score, ctx) => {
    ensureKnownFramework(score.frameworkId, ctx, ['frameworkId']);
  });

export const EthicalFrameworkTensionSchema = z
  .object({
    frameworks: z.array(z.string().min(1)).min(2),
    description: z.string().min(1),
  })
  .superRefine((tension, ctx) => {
    tension.frameworks.forEach((frameworkId, index) => {
      ensureKnownFramework(frameworkId, ctx, ['frameworks', index]);
    });
  });

export const EthicalJudgmentAnalysisSchema = z
  .object({
    frameworkScores: z.array(EthicalFrameworkScoreSchema).min(1),
    primaryFrameworks: z.array(z.string().min(1)).default([]),
    secondaryFrameworks: z.array(z.string().min(1)).default([]),
    tensions: z.array(EthicalFrameworkTensionSchema).default([]),
    confidence: z.number().min(0).max(1),
    reasoningSummary: z.string().min(1),
    evidenceFromResponse: z.array(z.string()).default([]),
    blindSpots: z.array(z.string()).default([]),
    challengeQuestion: z.string().min(1),
    suggestedNextFrameworkToExplore: z.string().optional(),
    profileUpdateWeight: z.number().min(0).max(2).default(1),
    aiExplanation: z.string().optional(),
  })
  .superRefine((analysis, ctx) => {
    [...analysis.primaryFrameworks, ...analysis.secondaryFrameworks]
      .filter(Boolean)
      .forEach((frameworkId, index) => ensureKnownFramework(frameworkId, ctx, ['primaryFrameworks', index]));
    if (analysis.suggestedNextFrameworkToExplore) {
      ensureKnownFramework(analysis.suggestedNextFrameworkToExplore, ctx, [
        'suggestedNextFrameworkToExplore',
      ]);
    }
  });

const dateLikeSchema = z.union([z.date(), z.string(), z.number(), z.any()]);

export const EthicalJudgmentEventInputSchema = z.object({
  id: z.string().min(1).optional(),
  userId: z.string().min(1),
  interactionType: z.string().min(1),
  sourceContentType: z.string().min(1),
  sourceContentId: z.string().min(1),
  sourceTitle: z.string().min(1),
  promptText: z.string().min(1),
  userChoice: z.string().optional(),
  responseText: z.string().optional(),
  selectedOptionId: z.string().optional(),
  explanation: z.string().optional(),
  analysis: EthicalJudgmentAnalysisSchema,
  affectsProfile: z.boolean(),
  activityContext: z.string().min(1),
  courseId: z.string().optional(),
  moduleId: z.string().optional(),
  modelUsed: z.string().min(1),
  promptVersion: z.string().min(1),
  rawResponse: z.record(z.unknown()).optional(),
  createdAt: dateLikeSchema.optional(),
});

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid ethical judgment data: ${details}`);
  }
  return result.data;
}

export function validateEthicalJudgmentAnalysis(input: unknown): EthicalJudgmentAnalysis {
  return parseOrThrow(EthicalJudgmentAnalysisSchema, input) as EthicalJudgmentAnalysis;
}

export function validateEthicalJudgmentEventInput(
  input: unknown,
): Omit<EthicalJudgmentEvent, 'id' | 'createdAt'> & { id?: string; createdAt?: unknown } {
  return parseOrThrow(EthicalJudgmentEventInputSchema, input) as Omit<
    EthicalJudgmentEvent,
    'id' | 'createdAt'
  > & { id?: string; createdAt?: unknown };
}
