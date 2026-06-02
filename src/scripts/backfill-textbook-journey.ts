/**
 * ONE-TIME backfill: score existing saved textbook reflections and
 * Promise-vs-Reality scores into the Ethical Journey, so history made BEFORE
 * the live journey-wiring also shows up in the framework breakdown + report.
 *
 * It reads every doc in `textbookReflections` (admin SDK, all users) and writes
 * one `ethicalJudgmentEvent` per (user, chapter, prompt) using the SAME
 * deterministic eventId as the live wiring — so it is idempotent and a later
 * edit in the app upserts the same event:
 *   - Discussion answers (have `response`)  → interactionType 'textbook_reflection',
 *       AI-scored from the answer (throttled), or deterministic with --deterministic.
 *   - Promise-vs-Reality (promptId='promise-reality', have `scores`)
 *       → 'promise_reality_score', deterministic from the chapter's frameworks.
 *
 * The event `createdAt` is taken from the saved doc so the timeline stays
 * accurate. Already-backfilled events are skipped (cheap re-runs) unless --force.
 * The unified card + report re-aggregate from events on read, so no profile
 * write is needed.
 *
 * Requires FIREBASE_ADMIN_* (admin) and, for AI scoring, GEMINI_API_KEY.
 *
 *   npx tsx src/scripts/backfill-textbook-journey.ts            # AI-score reflections
 *   npx tsx src/scripts/backfill-textbook-journey.ts --dry-run  # count only, no writes/AI
 *   npx tsx src/scripts/backfill-textbook-journey.ts --deterministic  # no AI
 *   npx tsx src/scripts/backfill-textbook-journey.ts --force    # re-score existing events
 */

import 'dotenv/config';

import { getAdminDb } from '../lib/firebase/admin';
import { getChapterBySlug } from '../data/textbook';
import { buildDeterministicEthicalAnalysis } from '../lib/ethical-judgment/recording';
import { validateEthicalJudgmentEventInput } from '../lib/ethical-judgment/validation';
import { scoreEthicalJudgment } from '../ai/flows/score-ethical-judgment';
import type { EthicalJudgmentAnalysis } from '../types';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const DETERMINISTIC = process.argv.includes('--deterministic');
const AI_DELAY_MS = 1500;
const MIN_RESPONSE_CHARS = 40;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const safeId = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '-');

interface AdminLike {
  collection: (name: string) => any;
}

async function eventExists(db: AdminLike, id: string): Promise<boolean> {
  const snap = await db.collection('ethicalJudgmentEvents').doc(id).get();
  return snap.exists;
}

async function writeEvent(
  db: AdminLike,
  fields: {
    eventId: string;
    userId: string;
    interactionType: string;
    sourceContentId: string;
    sourceTitle: string;
    promptText: string;
    responseText: string;
    analysis: EthicalJudgmentAnalysis;
    createdAt: Date;
  },
): Promise<void> {
  const event = validateEthicalJudgmentEventInput({
    id: fields.eventId,
    userId: fields.userId,
    interactionType: fields.interactionType,
    sourceContentType: 'textbook',
    sourceContentId: fields.sourceContentId,
    sourceTitle: fields.sourceTitle,
    promptText: fields.promptText,
    responseText: fields.responseText,
    analysis: fields.analysis,
    affectsProfile: true,
    activityContext: 'textbook',
    modelUsed: 'backfill',
    promptVersion: 'backfill-v1',
    createdAt: fields.createdAt,
  });
  if (DRY_RUN) return;
  await db
    .collection('ethicalJudgmentEvents')
    .doc(fields.eventId)
    .set({ ...event, createdAt: fields.createdAt }, { merge: false });
}

/** AI-score a reflection, retrying once on a transient rate limit. */
async function scoreReflection(
  promptText: string,
  responseText: string,
  sourceTitle: string,
): Promise<EthicalJudgmentAnalysis | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await scoreEthicalJudgment({
      promptText,
      responseText,
      sourceTitle,
      interactionType: 'textbook_reflection',
    });
    if (res.success) return res.analysis;
    if (res.errorCode === 'rate_limited' && attempt === 0) {
      console.warn('  rate-limited; backing off 30s…');
      await sleep(30_000);
      continue;
    }
    console.warn(`  scoring failed (${res.errorCode}): ${res.error}`);
    return null;
  }
  return null;
}

async function main(): Promise<void> {
  const db = getAdminDb() as AdminLike | null;
  if (!db) {
    throw new Error(
      'Firebase Admin credentials missing — set FIREBASE_ADMIN_* in the environment.',
    );
  }

  const snap = await db.collection('textbookReflections').get();
  console.log(
    `Scanning ${snap.size} textbookReflections docs ` +
      `(${DRY_RUN ? 'DRY RUN' : DETERMINISTIC ? 'deterministic' : 'AI scoring'})…\n`,
  );

  const stats = { reflections: 0, pvr: 0, written: 0, skipped: 0, failed: 0 };

  for (const docSnap of snap.docs) {
    const d = docSnap.data() as Record<string, any>;
    const userId = String(d.userId || '');
    const slug = String(d.slug || '');
    if (!userId || !slug) {
      stats.skipped++;
      continue;
    }
    const createdAt: Date =
      typeof d.updatedAt?.toDate === 'function' ? d.updatedAt.toDate() : new Date();
    const chapter = getChapterBySlug(slug);
    const chapterTitle = chapter?.title ?? slug;
    const isPvr = d.promptId === 'promise-reality' || (d.scores && !d.response);

    if (isPvr) {
      stats.pvr++;
      const eventId = safeId(`pvr_${userId}_${slug}`);
      if (!FORCE && (await eventExists(db, eventId))) {
        stats.skipped++;
        continue;
      }
      const fw = (chapter?.relatedFrameworkIds ?? []).filter(Boolean);
      const scores: Record<string, number> = d.scores || {};
      const scoredCount = Object.keys(scores).length;
      if (fw.length === 0 || scoredCount === 0) {
        stats.skipped++;
        continue;
      }
      const avg =
        Object.values(scores).reduce((a, b) => a + (Number(b) || 0), 0) / scoredCount;
      const analysis = buildDeterministicEthicalAnalysis({
        frameworkWeights: Object.fromEntries(fw.map((f) => [f, 60])),
        promptText: 'Promise vs. Reality self-assessment',
        userText: `Scored ${scoredCount} technologies at avg ${avg.toFixed(1)}/5.`,
        confidence: 0.7,
      });
      await writeEvent(db, {
        eventId,
        userId,
        interactionType: 'promise_reality_score',
        sourceContentId: `${slug}:promise-vs-reality`,
        sourceTitle: `Promise vs. Reality — ${chapterTitle}`,
        promptText: 'Promise vs. Reality self-assessment',
        responseText: `Promise-vs-Reality self-assessment: scored ${scoredCount} technolog${
          scoredCount === 1 ? 'y' : 'ies'
        } at an average of ${avg.toFixed(1)}/5 on whether they deliver on their promise.`,
        analysis,
        createdAt,
      });
      stats.written++;
      continue;
    }

    // Discussion reflection.
    stats.reflections++;
    const promptId = String(d.promptId || '');
    const response = String(d.response || '').trim();
    if (!promptId || response.length < MIN_RESPONSE_CHARS) {
      stats.skipped++;
      continue;
    }
    const eventId = safeId(`tbref_${userId}_${slug}_${promptId}`);
    if (!FORCE && (await eventExists(db, eventId))) {
      stats.skipped++;
      continue;
    }

    let analysis: EthicalJudgmentAnalysis | null = null;
    if (DETERMINISTIC) {
      const fw = (chapter?.relatedFrameworkIds ?? []).filter(Boolean);
      if (fw.length === 0) {
        stats.skipped++;
        continue;
      }
      analysis = buildDeterministicEthicalAnalysis({
        frameworkWeights: Object.fromEntries(fw.map((f) => [f, 55])),
        promptText: 'Textbook discussion question',
        userText: response,
        confidence: 0.5,
      });
    } else if (!DRY_RUN) {
      analysis = await scoreReflection(
        `Textbook discussion (${chapterTitle})`,
        response,
        chapterTitle,
      );
      await sleep(AI_DELAY_MS);
      if (!analysis) {
        stats.failed++;
        continue;
      }
    }

    if (DRY_RUN) {
      stats.written++;
      continue;
    }
    await writeEvent(db, {
      eventId,
      userId,
      interactionType: 'textbook_reflection',
      sourceContentId: `${slug}:${promptId}`,
      sourceTitle: `Textbook discussion — ${chapterTitle}`,
      promptText: `Textbook discussion (${chapterTitle})`,
      responseText: response,
      analysis: analysis!,
      createdAt,
    });
    stats.written++;
  }

  console.log('\nBackfill complete:', JSON.stringify(stats, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
