'use server';

/**
 * Ethical-journey persistence.
 *
 * Stores each Story decision a signed-in user makes as a document in
 * the top-level `ethicsJourney` collection (mirrors the pattern used
 * by textbookHighlights / textbookReflections). One document per
 * (user, story, segment) so replaying a story updates that decision
 * point rather than duplicating it.
 *
 * The "Your Path" card updates instantly from LOCAL React state during
 * a story session; this persistence runs in the background so the
 * profile breakdown and the AI report can read a durable history.
 * Anonymous users simply skip persistence — their card still works
 * from local state for the duration of the session.
 */

import {
  collection,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import type { ChoiceFrameworkImpact } from '@/types';
import {
  buildJourneyProfile,
  frameworkResponsesToEntries,
  topicBreakdown,
  buildTimeline,
  type EthicsJourneyEntry,
  type JourneyProfile,
  type FrameworkScores,
  type TimelinePoint,
} from '@/lib/ethics/journey';
import { normalizeFrameworkId, FRAMEWORK_META } from '@/lib/ethics/frameworks';
import { generateEthicsReport } from '@/ai/flows/generate-ethics-report';
import type { EthicsReport } from '@/lib/ethics/report-types';
import { getAllFrameworkResponses } from '@/app/actions/framework-explorer';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const COLLECTION = 'ethicsJourney';

/** Stable doc id so replays overwrite rather than duplicate. */
function docIdFor(userId: string, storyId: string, segmentId: string): string {
  const safeSeg = segmentId || 'seg';
  return `${userId}_${storyId}_${safeSeg}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export interface RecordDecisionInput {
  userId: string;
  storyId: string;
  storyTitle?: string;
  segmentId?: string;
  prompt: string;
  choiceText: string;
  impacts: ChoiceFrameworkImpact[];
  interpretation: string;
  sequence: number;
}

/**
 * Persist a single ethical decision. Best-effort: never throws so a
 * storage hiccup can't break the story flow. Returns success=false
 * with a message the caller can log but doesn't need to surface.
 */
export async function recordEthicsDecision(
  input: RecordDecisionInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!input.userId || !input.storyId) {
      return { success: false, error: 'Missing user or story id.' };
    }
    const segmentId = input.segmentId || 'seg';
    const id = docIdFor(input.userId, input.storyId, segmentId);
    // Cap stored text so a pathological choice/prompt can't bloat the doc.
    const trimmedImpacts = (input.impacts || []).slice(0, 8).map((i) => ({
      framework: String(i.framework),
      weight: Number.isFinite(i.weight) ? i.weight : 1,
      rationale: (i.rationale || '').slice(0, 400),
    }));
    await setDoc(
      doc(db, COLLECTION, id),
      {
        userId: input.userId,
        storyId: input.storyId,
        storyTitle: input.storyTitle || null,
        segmentId,
        prompt: (input.prompt || '').slice(0, 600),
        choiceText: (input.choiceText || '').slice(0, 600),
        impacts: trimmedImpacts,
        interpretation: (input.interpretation || '').slice(0, 600),
        sequence: input.sequence ?? 0,
        recordedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return { success: true, data: { id } };
  } catch (error) {
    console.error('[ethics-journey] recordEthicsDecision error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch a user's full ethical journey, newest-first by recordedAt
 * (falling back to sequence). Capped at 500 entries. Returns [] for
 * anonymous / empty.
 */
export async function getEthicsJourney(
  userId: string,
): Promise<ActionResult<EthicsJourneyEntry[]>> {
  try {
    if (!userId) return { success: true, data: [] };
    const q = query(collection(db, COLLECTION), where('userId', '==', userId));
    const snap = await getDocs(q);
    const out: EthicsJourneyEntry[] = [];
    snap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const recordedAt =
        timestampToDate(
          data.recordedAt as Parameters<typeof timestampToDate>[0],
        ) ?? undefined;
      out.push({
        id: d.id,
        storyId: String(data.storyId || ''),
        storyTitle: (data.storyTitle as string | null) || undefined,
        segmentId: (data.segmentId as string | undefined) || undefined,
        prompt: String(data.prompt || ''),
        choiceText: String(data.choiceText || ''),
        impacts: Array.isArray(data.impacts)
          ? (data.impacts as ChoiceFrameworkImpact[])
          : [],
        interpretation: String(data.interpretation || ''),
        sequence: Number(data.sequence ?? 0),
        recordedAt: recordedAt ? recordedAt.toISOString() : new Date(0).toISOString(),
      });
    });
    out.sort((a, b) => {
      const at = new Date(a.recordedAt).getTime();
      const bt = new Date(b.recordedAt).getTime();
      if (bt !== at) return bt - at;
      return b.sequence - a.sequence;
    });
    return { success: true, data: out.slice(0, 500) };
  } catch (error) {
    console.error('[ethics-journey] getEthicsJourney error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Pull every ethical-decision source for a user — story/dilemma/debate
 * journey entries AND Framework Explorer responses — as one combined
 * EthicsJourneyEntry list. This is the single input to the unified
 * profile, so all activities feed one score.
 */
async function getUnifiedEntries(
  userId: string,
): Promise<{ entries: EthicsJourneyEntry[]; feResponses: Awaited<ReturnType<typeof getAllFrameworkResponses>> }> {
  const [journeyRes, feRes] = await Promise.all([
    getEthicsJourney(userId),
    getAllFrameworkResponses(userId),
  ]);
  const journeyEntries = journeyRes.success ? journeyRes.data : [];
  const feEntries =
    feRes.success ? frameworkResponsesToEntries(feRes.data) : [];
  return { entries: [...journeyEntries, ...feEntries], feResponses: feRes };
}

export interface UnifiedEthicsProfile {
  profile: JourneyProfile;
  /** Per-technology-topic framework scores (Framework Explorer only). */
  topics: Record<string, FrameworkScores>;
  /** Cumulative-over-time series across all sources. */
  timeline: TimelinePoint[];
  /** Count of decisions from each source. */
  counts: { story: number; frameworkExplorer: number; total: number };
}

/**
 * The unified ethical profile combining all site activities. Powers the
 * profile visualizations (radar, bar, timeline, topic + module
 * breakdown, dominant tendencies).
 */
export async function getUnifiedEthicsProfile(
  userId: string,
): Promise<ActionResult<UnifiedEthicsProfile>> {
  try {
    if (!userId) {
      return {
        success: true,
        data: {
          profile: buildJourneyProfile([]),
          topics: {},
          timeline: [],
          counts: { story: 0, frameworkExplorer: 0, total: 0 },
        },
      };
    }
    const { entries, feResponses } = await getUnifiedEntries(userId);
    const fe = feResponses.success ? feResponses.data : [];
    const storyCount = entries.length - fe.length;
    return {
      success: true,
      data: {
        profile: buildJourneyProfile(entries),
        topics: topicBreakdown(fe),
        timeline: buildTimeline(entries),
        counts: {
          story: storyCount,
          frameworkExplorer: fe.length,
          total: entries.length,
        },
      },
    };
  } catch (error) {
    console.error('[ethics-journey] getUnifiedEthicsProfile error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Generate an AI ethical-journey report for a user. Reads their unified
 * journey (all sources), computes the dominant/secondary/tensions
 * profile, and feeds a compact, grounded summary to the report flow.
 * The flow is the insufficient-data / missing-key gatekeeper.
 */
export async function generateEthicsReportForUser(
  userId: string,
): Promise<ActionResult<EthicsReport>> {
  try {
    if (!userId) {
      return { success: false, error: 'Not signed in.' };
    }
    const { entries } = await getUnifiedEntries(userId);
    const profile = buildJourneyProfile(entries);

    // Compact, newest-last decision list (cap 24 to keep the prompt bounded).
    const decisions = [...entries]
      .sort((a, b) => a.sequence - b.sequence)
      .slice(-24)
      .map((e) => ({
        storyTitle: e.storyTitle,
        prompt: e.prompt,
        choiceText: e.choiceText,
        frameworks: (e.impacts || [])
          .map((i) => {
            const id = normalizeFrameworkId(i.framework);
            return id ? FRAMEWORK_META[id].label : i.framework;
          })
          .join(', '),
        interpretation: e.interpretation,
      }));

    const report = await generateEthicsReport({
      totalDecisions: profile.totalDecisions,
      dominant: profile.dominant.map((d) => ({ label: d.label, score: d.score })),
      secondary: profile.secondary.map((d) => ({ label: d.label, score: d.score })),
      tensions: profile.tensions.map((t) => ({
        a: t.aLabel,
        b: t.bLabel,
        note: t.note,
      })),
      decisions,
    });

    return { success: true, data: report };
  } catch (error) {
    console.error('[ethics-journey] generateEthicsReportForUser error:', error);
    return { success: false, error: String(error) };
  }
}
