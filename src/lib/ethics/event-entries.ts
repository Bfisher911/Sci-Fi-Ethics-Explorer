/**
 * Convert a canonical `EthicalJudgmentEvent` into an `EthicsJourneyEntry` so
 * the unified Ethical Journey profile (the "Your Ethical Journey" card,
 * framework breakdown, and timeline) can be built from EVERY activity source —
 * stories, dilemmas, debates, textbook discussion, Promise-vs-Reality, and the
 * Studio AI tools — not just stories.
 *
 * Weighting (documented for the journey calculations): each event contributes
 * its strongest frameworks, with weight ∝ the analysis score (0–100 → a 0–3
 * weight that matches the authored story-choice scale). At most
 * MAX_IMPACTS_PER_EVENT frameworks per event so a single activity can't flood
 * the breakdown. Activities are otherwise equally weighted — one debate counts
 * like one story decision.
 */

import type { ChoiceFrameworkImpact, EthicalJudgmentEvent } from '@/types';
import type { EthicsJourneyEntry } from '@/lib/ethics/journey';

const MAX_IMPACTS_PER_EVENT = 5;

/** Human label for an interactionType, used for per-source counts + display. */
export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  story_choice: 'Story',
  story_reflection: 'Story Reflection',
  framework_explorer: 'Framework Explorer',
  framework_quiz: 'Framework Quiz',
  debate_stance: 'Debate',
  debate_reply: 'Debate',
  debate_response: 'Debate',
  weekly_dilemma_response: 'Dilemma',
  weekly_dilemma_reply: 'Dilemma',
  dilemma_response: 'Dilemma',
  perspective_comparison: 'Studio Compare',
  studio_compare: 'Studio Compare',
  studio_analyze: 'Studio Analyze',
  studio_reflect: 'Studio Reflect',
  media_scenario_reflection: 'Studio Reflect',
  textbook_reflection: 'Textbook Discussion',
  textbook_discussion: 'Textbook Discussion',
  promise_reality_score: 'Promise vs Reality',
  promise_vs_reality: 'Promise vs Reality',
  knowledge_quiz: 'Quiz',
  other: 'Activity',
};

export function activityTypeLabel(t: string | undefined | null): string {
  return ACTIVITY_TYPE_LABELS[String(t || 'other')] || 'Activity';
}

function toIso(v: unknown): string {
  try {
    if (!v) return new Date(0).toISOString();
    if (v instanceof Date) return v.toISOString();
    const anyV = v as { toDate?: () => Date; seconds?: number };
    if (typeof anyV?.toDate === 'function') return anyV.toDate().toISOString();
    if (typeof anyV?.seconds === 'number') return new Date(anyV.seconds * 1000).toISOString();
    if (typeof v === 'string') {
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
    }
  } catch {
    /* fall through */
  }
  return new Date(0).toISOString();
}

/**
 * Map an `EthicalJudgmentEvent` to an `EthicsJourneyEntry`. The entry's
 * `storyTitle`/`segmentId` are reused to carry the activity title + type so the
 * existing journey/timeline UI renders without schema changes.
 */
export function eventToJourneyEntry(
  event: EthicalJudgmentEvent,
  sequence = 0,
): EthicsJourneyEntry {
  const scores = Array.isArray(event.analysis?.frameworkScores)
    ? event.analysis.frameworkScores
    : [];
  const impacts: ChoiceFrameworkImpact[] = scores
    .filter((s) => s && s.frameworkId && typeof s.score === 'number' && s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_IMPACTS_PER_EVENT)
    .map((s) => ({
      framework: s.frameworkId,
      weight: Math.max(0.1, Math.min(3, (s.score / 100) * 3)),
      rationale: (s.rationale || event.analysis?.reasoningSummary || '').trim(),
    }));

  return {
    id: event.id,
    storyId: '',
    storyTitle: event.sourceTitle || activityTypeLabel(event.interactionType),
    segmentId: String(event.interactionType || 'other'),
    prompt: String(event.promptText || '').slice(0, 300),
    choiceText: String(
      event.userChoice || event.responseText || event.explanation || '',
    ).trim(),
    impacts,
    interpretation: String(event.analysis?.reasoningSummary || '').trim(),
    sequence,
    recordedAt: toIso(event.createdAt),
  };
}
