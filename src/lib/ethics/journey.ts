/**
 * Ethical-journey domain logic: the data shape of a single recorded
 * decision, plus pure functions to aggregate decisions into framework
 * scores, rank guiding principles, and detect ethical tensions.
 *
 * All functions here are pure (no I/O, no React) so they can be unit
 * tested and reused on the server (AI report) and client (Your Path
 * card, profile breakdown) alike.
 */

import type { ChoiceFrameworkImpact } from '@/types';
import type { FrameworkResponse } from '@/types/framework-explorer';
import {
  FRAMEWORK_IDS,
  FRAMEWORK_META,
  normalizeFrameworkId,
  type FrameworkId,
} from './frameworks';

/**
 * One recorded ethical decision. Persisted per-user (newest entries
 * kept) and also held in local React state during a story session so
 * the Your Path card updates instantly.
 */
export interface EthicsJourneyEntry {
  /** Stable id (storyId + segmentId + sequence) so re-records dedupe. */
  id: string;
  /** Story the decision was made in. */
  storyId: string;
  /** Human-readable story title, for the profile + report. */
  storyTitle?: string;
  /** Segment / scenario id within the story. */
  segmentId?: string;
  /** The prompt the user was responding to (trimmed). */
  prompt: string;
  /** The option text the user selected. */
  choiceText: string;
  /** Framework impacts attributed to this choice (canonical IDs). */
  impacts: ChoiceFrameworkImpact[];
  /** Short ethical interpretation of the choice (one sentence). */
  interpretation: string;
  /** Monotonic sequence number within the session/journey. */
  sequence: number;
  /** ISO timestamp the decision was recorded. */
  recordedAt: string;
}

export type FrameworkScores = Record<FrameworkId, number>;

/** A zeroed score map across all 18 frameworks. */
export function emptyScores(): FrameworkScores {
  const out = {} as FrameworkScores;
  for (const id of FRAMEWORK_IDS) out[id] = 0;
  return out;
}

/**
 * Sum weighted impacts across a list of journey entries into a score
 * per framework. Tolerant of legacy / loosely-typed framework strings
 * via normalizeFrameworkId.
 */
export function computeFrameworkScores(
  entries: EthicsJourneyEntry[],
): FrameworkScores {
  const scores = emptyScores();
  for (const entry of entries) {
    for (const impact of entry.impacts ?? []) {
      const id = normalizeFrameworkId(impact.framework);
      if (!id) continue;
      const w = Number.isFinite(impact.weight) ? impact.weight : 1;
      scores[id] += Math.max(0, w);
    }
  }
  return scores;
}

export interface RankedFramework {
  id: FrameworkId;
  label: string;
  score: number;
  /** Share of total weight, 0–1. */
  share: number;
}

/**
 * Rank frameworks by cumulative score, descending. Frameworks with a
 * zero score are included at the tail (share 0) so the full 18 are
 * always available to the breakdown chart; callers slice as needed.
 */
export function rankFrameworks(scores: FrameworkScores): RankedFramework[] {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  return FRAMEWORK_IDS.map((id) => ({
    id,
    label: FRAMEWORK_META[id].label,
    score: scores[id],
    share: total > 0 ? scores[id] / total : 0,
  })).sort((a, b) => b.score - a.score);
}

export interface JourneyProfile {
  totalDecisions: number;
  totalWeight: number;
  ranked: RankedFramework[];
  /** Highest-scoring frameworks with a non-zero score (up to 3). */
  dominant: RankedFramework[];
  /** Next tier of non-zero frameworks (up to 3 after the dominant set). */
  secondary: RankedFramework[];
  /** Pairs of opposing frameworks the user has both leaned into. */
  tensions: FrameworkTension[];
}

export interface FrameworkTension {
  a: FrameworkId;
  b: FrameworkId;
  aLabel: string;
  bLabel: string;
  /** Combined score across the pair — higher = more pronounced tension. */
  intensity: number;
  note: string;
}

/**
 * Pairs of frameworks that classically pull against each other. When a
 * user has accrued meaningful weight in BOTH members of a pair, that's
 * a sign of genuine ethical tension in their decision pattern (rather
 * than a one-note profile). Used by the profile + AI report.
 */
const TENSION_PAIRS: { a: FrameworkId; b: FrameworkId; note: string }[] = [
  {
    a: 'utilitarianism',
    b: 'deontology',
    note: 'You weigh outcomes against inviolable rules — the classic ends-vs-means tension.',
  },
  {
    a: 'utilitarianism',
    b: 'ethics-of-care',
    note: 'You balance the aggregate good against your obligations to particular people.',
  },
  {
    a: 'utilitarianism',
    b: 'contractualism',
    note: 'You weigh maximizing welfare against what could be justified to each individual.',
  },
  {
    a: 'deontology',
    b: 'existentialist-ethics',
    note: 'You move between universal duty and self-authored, situation-specific freedom.',
  },
  {
    a: 'social-contract-theory',
    b: 'ethics-of-care',
    note: 'You weigh impartial agreed-upon rules against the pull of specific relationships.',
  },
  {
    a: 'divine-command',
    b: 'existentialist-ethics',
    note: 'You move between external moral authority and radically self-chosen values.',
  },
  {
    a: 'environmental-ethics',
    b: 'utilitarianism',
    note: 'You weigh human welfare against the standing of ecosystems and non-human life.',
  },
  {
    a: 'stoicism',
    b: 'ethics-of-care',
    note: 'You balance detachment from what you can\'t control against deep engagement with others.',
  },
];

export function detectTensions(scores: FrameworkScores): FrameworkTension[] {
  const out: FrameworkTension[] = [];
  for (const pair of TENSION_PAIRS) {
    const sa = scores[pair.a];
    const sb = scores[pair.b];
    // Both members must have real weight, and be roughly comparable
    // (neither dwarfs the other by more than 4x), to count as tension.
    if (sa <= 0 || sb <= 0) continue;
    const ratio = Math.max(sa, sb) / Math.min(sa, sb);
    if (ratio > 4) continue;
    out.push({
      a: pair.a,
      b: pair.b,
      aLabel: FRAMEWORK_META[pair.a].label,
      bLabel: FRAMEWORK_META[pair.b].label,
      intensity: sa + sb,
      note: pair.note,
    });
  }
  return out.sort((x, y) => y.intensity - x.intensity);
}

/**
 * Build the full derived profile from a journey. Single entry point for
 * the card, the profile breakdown, and the AI report so they always
 * agree on dominant/secondary/tensions.
 */
export function buildJourneyProfile(
  entries: EthicsJourneyEntry[],
): JourneyProfile {
  const scores = computeFrameworkScores(entries);
  const ranked = rankFrameworks(scores);
  const nonZero = ranked.filter((r) => r.score > 0);
  const dominant = nonZero.slice(0, 3);
  const secondary = nonZero.slice(3, 6);
  const tensions = detectTensions(scores);
  const totalWeight = Object.values(scores).reduce((a, b) => a + b, 0);
  return {
    totalDecisions: entries.length,
    totalWeight,
    ranked,
    dominant,
    secondary,
    tensions,
  };
}

/**
 * Convert Framework Explorer responses into the same EthicsJourneyEntry
 * shape used by stories / dilemmas / debates, so a single scoring
 * engine aggregates every source into one unified profile. The
 * `source` field (via storyId prefix) keeps them distinguishable.
 */
export function frameworkResponsesToEntries(
  responses: FrameworkResponse[],
): EthicsJourneyEntry[] {
  return responses.map((r, i) => ({
    id: `fe:${r.questionId}`,
    storyId: `framework-explorer:${r.moduleId}`,
    storyTitle: `Framework Explorer · Module ${r.moduleNumber}`,
    segmentId: r.questionId,
    prompt: r.technologyTopic ?? 'Framework Explorer',
    choiceText: r.optionId,
    impacts: Object.entries(r.frameworkWeights || {}).map(([framework, weight]) => ({
      framework,
      weight,
      rationale: '',
    })),
    interpretation: '',
    sequence: i + 1,
    recordedAt: r.recordedAt,
  }));
}

/** Per-technology-topic framework scores, for the profile's category breakdown. */
export function topicBreakdown(
  responses: FrameworkResponse[],
): Record<string, FrameworkScores> {
  const out: Record<string, FrameworkScores> = {};
  for (const r of responses) {
    const topic = r.technologyTopic || 'Other';
    if (!out[topic]) out[topic] = emptyScores();
    for (const [rawKey, weight] of Object.entries(r.frameworkWeights || {})) {
      const id = normalizeFrameworkId(rawKey);
      if (!id) continue;
      out[topic][id] += Math.max(0, Number(weight) || 0);
    }
  }
  return out;
}

/**
 * Cumulative-over-time series for the timeline visualization. Returns,
 * for each entry in chronological order, the running total weight and
 * the leading framework so far.
 */
export interface TimelinePoint {
  recordedAt: string;
  totalWeight: number;
  leadingFramework: FrameworkId | null;
  leadingLabel: string | null;
}
export function buildTimeline(entries: EthicsJourneyEntry[]): TimelinePoint[] {
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
  const running = emptyScores();
  const out: TimelinePoint[] = [];
  for (const entry of sorted) {
    for (const impact of entry.impacts ?? []) {
      const id = normalizeFrameworkId(impact.framework);
      if (!id) continue;
      running[id] += Math.max(0, impact.weight || 0);
    }
    let leading: FrameworkId | null = null;
    let max = 0;
    for (const id of FRAMEWORK_IDS) {
      if (running[id] > max) {
        max = running[id];
        leading = id;
      }
    }
    out.push({
      recordedAt: entry.recordedAt,
      totalWeight: Object.values(running).reduce((a, b) => a + b, 0),
      leadingFramework: leading,
      leadingLabel: leading ? FRAMEWORK_META[leading].label : null,
    });
  }
  return out;
}

/**
 * Compose a one-sentence interpretation of a single choice from its
 * impacts. Used when authored metadata doesn't supply its own
 * interpretation. Mentions the strongest 1–2 frameworks by rationale.
 */
export function interpretChoice(impacts: ChoiceFrameworkImpact[]): string {
  if (!impacts || impacts.length === 0) {
    // Neutral, non-judgmental fallback. Authored story choices always carry
    // framework metadata, so this only appears for unannotated/navigation
    // options — and it must never read like "you failed to align".
    return 'This choice reflects a blend of ethical considerations.';
  }
  const sorted = [...impacts].sort((a, b) => b.weight - a.weight);
  const top = sorted[0];
  const id = normalizeFrameworkId(top.framework);
  const label = id ? FRAMEWORK_META[id].label : top.framework;
  if (top.rationale && !/heuristic/i.test(top.rationale)) {
    return top.rationale;
  }
  return `This choice leans ${label.toLowerCase()}.`;
}

export interface FrameworkBreakdownItem {
  id: FrameworkId;
  label: string;
  score: number;
  /** Share of total weight, 0–1. */
  share: number;
  /** Rounded percentage of total weight. */
  percent: number;
  /** Distinct authored rationales that fed this framework, for display. */
  rationales: string[];
}

/**
 * Aggregate a playthrough's journey entries into a ranked, display-ready
 * ethical-framework breakdown: which frameworks the user's choices aligned
 * with, how strongly, and why (the authored rationales). Powers the
 * end-of-story breakdown card and is captured into the saved evidence record.
 * Pure — reused on client and in the report content builder.
 */
export function buildFrameworkBreakdown(
  entries: EthicsJourneyEntry[],
  maxItems = 6,
): FrameworkBreakdownItem[] {
  const scores = computeFrameworkScores(entries);
  const ranked = rankFrameworks(scores).filter((r) => r.score > 0);

  const rationalesById = new Map<string, string[]>();
  for (const entry of entries) {
    for (const impact of entry.impacts ?? []) {
      const id = normalizeFrameworkId(impact.framework);
      if (!id) continue;
      const r = (impact.rationale || '').trim();
      if (!r || /heuristic/i.test(r)) continue;
      const list = rationalesById.get(id) ?? [];
      if (!list.includes(r)) list.push(r);
      rationalesById.set(id, list);
    }
  }

  return ranked.slice(0, maxItems).map((r) => ({
    id: r.id,
    label: r.label,
    score: r.score,
    share: r.share,
    percent: Math.round(r.share * 100),
    rationales: rationalesById.get(r.id) ?? [],
  }));
}
