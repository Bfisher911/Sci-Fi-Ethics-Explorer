import {
  getActiveEthicalFrameworks,
  getFrameworkDisplayName,
  normalizeFrameworkId,
} from '@/lib/ethical-framework-registry';
import { aggregateEthicalProfile } from '@/lib/ethical-judgment/aggregation';
import {
  validateEthicalJudgmentAnalysis,
  validateEthicalJudgmentEventInput,
} from '@/lib/ethical-judgment/validation';
import type {
  EthicalJudgmentAnalysis,
  EthicalJudgmentEvent,
  EthicalProfileAggregate,
} from '@/types';

export interface DeterministicAnalysisInput {
  frameworkWeights: Record<string, number>;
  userText?: string;
  promptText: string;
  confidence?: number;
}

export interface RecordEthicalJudgmentInput {
  userId: string;
  /**
   * Optional stable id for idempotent upsert. When provided, re-recording the
   * same key (e.g. a textbook reflection that is edited) updates one event
   * instead of creating duplicates. Omit (stories, per-choice) to get a fresh
   * event each time.
   */
  eventId?: string;
  interactionType: string;
  sourceContentType: string;
  sourceContentId: string;
  sourceTitle: string;
  promptText: string;
  userChoice?: string;
  responseText?: string;
  selectedOptionId?: string;
  explanation?: string;
  frameworkWeights?: Record<string, number>;
  analysis?: EthicalJudgmentAnalysis;
  affectsProfile?: boolean;
  activityContext: string;
  courseId?: string;
  moduleId?: string;
  modelUsed?: string;
  promptVersion?: string;
  rawResponse?: Record<string, unknown>;
}

export interface EthicalJudgmentStore {
  writeEvent(event: EthicalJudgmentEvent): Promise<void>;
  loadUserEvents(userId: string): Promise<EthicalJudgmentEvent[]>;
  writeProfile(profile: EthicalProfileAggregate): Promise<void>;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

function normalizeWeight(value: number): number {
  return value <= 1 ? value * 100 : value;
}

export function normalizeAffectsProfile(interactionType: string, requested = true): boolean {
  if (interactionType === 'knowledge_quiz') return false;
  return requested;
}

export function buildDeterministicEthicalAnalysis(
  input: DeterministicAnalysisInput,
): EthicalJudgmentAnalysis {
  const scoreMap = new Map<string, number>();
  for (const [rawFrameworkId, rawWeight] of Object.entries(input.frameworkWeights)) {
    const frameworkId = normalizeFrameworkId(rawFrameworkId);
    if (!frameworkId) continue;
    scoreMap.set(frameworkId, Math.max(scoreMap.get(frameworkId) ?? 0, clampScore(normalizeWeight(rawWeight))));
  }

  const frameworks = getActiveEthicalFrameworks();
  const frameworkScores = frameworks.map((framework) => ({
    frameworkId: framework.id,
    score: scoreMap.get(framework.id) ?? 0,
    confidence: input.confidence ?? 0.65,
    rationale:
      scoreMap.has(framework.id)
        ? `Mapped option or response cue aligns with ${framework.name}.`
        : `No strong deterministic cue for ${framework.name}.`,
  }));

  const ranked = frameworkScores
    .filter((score) => score.score > 0)
    .sort((a, b) => b.score - a.score);
  const primaryFrameworks = ranked.slice(0, 1).map((score) => score.frameworkId);
  const secondaryFrameworks = ranked.slice(1, 4).map((score) => score.frameworkId);
  const primaryNames = primaryFrameworks.map(getFrameworkDisplayName).join(', ') || 'open ethical reasoning';
  const evidence = [input.userText?.trim()].filter((text): text is string => Boolean(text));

  return validateEthicalJudgmentAnalysis({
    frameworkScores,
    primaryFrameworks,
    secondaryFrameworks,
    tensions:
      primaryFrameworks.length > 1
        ? [
            {
              frameworks: primaryFrameworks,
              description: 'The response combines multiple ethical priorities that may pull in different directions.',
            },
          ]
        : [],
    confidence: input.confidence ?? 0.65,
    reasoningSummary: `This response tends to emphasize ${primaryNames}. Treat this as an interpretive learning signal, not a fixed label.`,
    evidenceFromResponse: evidence,
    blindSpots: ['Consider which affected perspective may be least visible in this response.'],
    challengeQuestion: 'What tradeoff would make you reconsider this decision?',
    suggestedNextFrameworkToExplore:
      primaryFrameworks[0] === 'utilitarianism' ? 'ethics-of-care' : 'utilitarianism',
    profileUpdateWeight: 1,
    aiExplanation:
      'This deterministic score was generated from explicit framework mappings rather than an open-ended AI analysis.',
  });
}

function buildFallbackAnalysis(input: RecordEthicalJudgmentInput): EthicalJudgmentAnalysis {
  return buildDeterministicEthicalAnalysis({
    frameworkWeights: input.frameworkWeights ?? {},
    userText: input.explanation ?? input.responseText ?? input.userChoice,
    promptText: input.promptText,
    confidence: input.frameworkWeights ? 0.7 : 0.35,
  });
}

function omitUndefinedDeep<T>(value: T): T {
  if (value === undefined) return null as T;
  if (value === null || value instanceof Date || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => omitUndefinedDeep(item)) as T;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .map(([key, child]) => [key, omitUndefinedDeep(child)]),
  ) as T;
}

export async function recordEthicalJudgmentEvent(
  input: RecordEthicalJudgmentInput,
  store: EthicalJudgmentStore,
): Promise<{ event: EthicalJudgmentEvent; profile: EthicalProfileAggregate }> {
  const analysis = input.analysis
    ? validateEthicalJudgmentAnalysis(input.analysis)
    : buildFallbackAnalysis(input);
  const now = new Date();
  const event = omitUndefinedDeep(
    validateEthicalJudgmentEventInput({
      id:
        input.eventId ||
        `ethical-event-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: input.userId,
      interactionType: input.interactionType,
      sourceContentType: input.sourceContentType,
      sourceContentId: input.sourceContentId,
      sourceTitle: input.sourceTitle,
      promptText: input.promptText,
      userChoice: input.userChoice,
      responseText: input.responseText,
      selectedOptionId: input.selectedOptionId,
      explanation: input.explanation,
      analysis,
      affectsProfile: normalizeAffectsProfile(input.interactionType, input.affectsProfile ?? true),
      activityContext: input.activityContext,
      courseId: input.courseId,
      moduleId: input.moduleId,
      modelUsed: input.modelUsed ?? (input.analysis ? 'provided-analysis' : 'deterministic-mapping'),
      promptVersion: input.promptVersion ?? 'ethical-judgment-v1',
      rawResponse: input.rawResponse,
      createdAt: now,
    }),
  ) as EthicalJudgmentEvent;

  await store.writeEvent(event);
  const userEvents = await store.loadUserEvents(input.userId);
  const profile = aggregateEthicalProfile(input.userId, userEvents);
  await store.writeProfile(profile);

  return { event, profile };
}
