import {
  getActiveEthicalFrameworks,
  normalizeFrameworkId,
} from '@/lib/ethical-framework-registry';
import type {
  EthicalFrameworkTension,
  EthicalJudgmentEvent,
  EthicalProfileAggregate,
  EthicalProfileContentSummary,
  EthicalProfileFrameworkSummary,
} from '@/types';

interface ScoreAccumulator {
  total: number;
  weight: number;
  eventCount: number;
}

function emptyAccumulator(): ScoreAccumulator {
  return { total: 0, weight: 0, eventCount: 0 };
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function average(accumulator: ScoreAccumulator): number {
  if (accumulator.weight <= 0) return 0;
  return Math.round((accumulator.total / accumulator.weight) * 10) / 10;
}

function makeAccumulatorMap(): Record<string, ScoreAccumulator> {
  return Object.fromEntries(
    getActiveEthicalFrameworks().map((framework) => [framework.id, emptyAccumulator()]),
  );
}

function makeScoreRecord(accumulators: Record<string, ScoreAccumulator>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(accumulators).map(([frameworkId, accumulator]) => [
      frameworkId,
      average(accumulator),
    ]),
  );
}

function addEventScores(
  accumulators: Record<string, ScoreAccumulator>,
  event: EthicalJudgmentEvent,
): void {
  const eventWeight = Math.max(0, Math.min(2, event.analysis.profileUpdateWeight ?? 1));
  const analysisConfidence = event.analysis.confidence ?? 0.5;

  for (const score of event.analysis.frameworkScores) {
    const frameworkId = normalizeFrameworkId(score.frameworkId);
    if (!frameworkId || !accumulators[frameworkId]) continue;
    const confidence = score.confidence ?? analysisConfidence;
    const weight = eventWeight * Math.max(0.1, Math.min(1, confidence));
    accumulators[frameworkId].total += score.score * weight;
    accumulators[frameworkId].weight += weight;
    accumulators[frameworkId].eventCount += 1;
  }
}

function summarizeFrameworks(
  scores: Record<string, number>,
  accumulators: Record<string, ScoreAccumulator>,
  direction: 'strongest' | 'least-used',
): EthicalProfileFrameworkSummary[] {
  return Object.entries(scores)
    .map(([frameworkId, score]) => ({
      frameworkId,
      score,
      eventCount: accumulators[frameworkId]?.eventCount ?? 0,
    }))
    .sort((a, b) => {
      if (direction === 'least-used') {
        if (a.eventCount !== b.eventCount) return a.eventCount - b.eventCount;
        return a.score - b.score;
      }
      return b.score - a.score;
    })
    .slice(0, 6);
}

function summarizeByContentType(events: EthicalJudgmentEvent[]): Record<string, EthicalProfileContentSummary> {
  const groups: Record<string, { eventCount: number; accumulators: Record<string, ScoreAccumulator> }> = {};

  for (const event of events) {
    const contentType = event.sourceContentType || 'other';
    if (!groups[contentType]) {
      groups[contentType] = { eventCount: 0, accumulators: makeAccumulatorMap() };
    }
    groups[contentType].eventCount += 1;
    addEventScores(groups[contentType].accumulators, event);
  }

  return Object.fromEntries(
    Object.entries(groups).map(([contentType, group]) => [
      contentType,
      {
        eventCount: group.eventCount,
        frameworkScores: makeScoreRecord(group.accumulators),
      },
    ]),
  );
}

function summarizeOverTime(events: EthicalJudgmentEvent[]) {
  const groups: Record<string, { eventCount: number; accumulators: Record<string, ScoreAccumulator> }> = {};

  for (const event of events) {
    const day = toDate(event.createdAt).toISOString().slice(0, 10);
    if (!groups[day]) {
      groups[day] = { eventCount: 0, accumulators: makeAccumulatorMap() };
    }
    groups[day].eventCount += 1;
    addEventScores(groups[day].accumulators, event);
  }

  return Object.entries(groups)
    .map(([date, group]) => ({
      date,
      eventCount: group.eventCount,
      frameworkScores: makeScoreRecord(group.accumulators),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function uniqueTensions(events: EthicalJudgmentEvent[]): EthicalFrameworkTension[] {
  const seen = new Set<string>();
  const tensions: EthicalFrameworkTension[] = [];
  for (const event of events) {
    for (const tension of event.analysis.tensions ?? []) {
      const normalizedFrameworks = tension.frameworks
        .map((frameworkId) => normalizeFrameworkId(frameworkId))
        .filter((frameworkId): frameworkId is string => Boolean(frameworkId))
        .sort();
      if (normalizedFrameworks.length < 2) continue;
      const key = `${normalizedFrameworks.join('|')}::${tension.description}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tensions.push({ frameworks: normalizedFrameworks, description: tension.description });
    }
  }
  return tensions.slice(0, 8);
}

export function aggregateEthicalProfile(
  userId: string,
  events: EthicalJudgmentEvent[],
): EthicalProfileAggregate {
  const eligibleEvents = events.filter(
    (event) => event.affectsProfile && event.interactionType !== 'knowledge_quiz',
  );
  const accumulators = makeAccumulatorMap();
  for (const event of eligibleEvents) {
    addEventScores(accumulators, event);
  }

  const overallFrameworkScores = makeScoreRecord(accumulators);
  const contentAreasIncluded = Array.from(
    new Set(eligibleEvents.map((event) => event.sourceContentType).filter(Boolean)),
  );
  const eventConfidence = Math.min(0.7, eligibleEvents.length / 12);
  const diversityConfidence = Math.min(0.3, contentAreasIncluded.length / 10);

  return {
    userId,
    eventCount: eligibleEvents.length,
    overallFrameworkScores,
    strongestFrameworks: summarizeFrameworks(overallFrameworkScores, accumulators, 'strongest'),
    leastUsedFrameworks: summarizeFrameworks(overallFrameworkScores, accumulators, 'least-used'),
    frameworkTensions: uniqueTensions(eligibleEvents),
    byContentType: summarizeByContentType(eligibleEvents),
    overTime: summarizeOverTime(eligibleEvents),
    contentAreasIncluded,
    confidenceLevel: Math.round((eventConfidence + diversityConfidence) * 100) / 100,
    recentEvents: eligibleEvents
      .slice()
      .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
      .slice(0, 8),
    updatedAt: new Date(),
  };
}

export function shouldScoreDebateReply(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (normalized.length < 40) return false;
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length < 8) return false;
  return /\b(because|since|therefore|consent|rights?|duty|harm|fair|justice|tradeoff|responsib|should|ought)\b/.test(
    normalized,
  );
}
