/**
 * Seed the 66 static Sci-Fi Media quizzes (src/data/scifi-media-quizzes.ts)
 * into Firestore so the `quizzes/{scifi-media-{id}}` docs exist and can be
 * queried directly — parity with philosopher / theory / textbook quizzes
 * that ship BOTH as static data AND as seeded Firestore docs.
 *
 * The app already works without this (getQuizForSubject falls back to
 * the static data if the Firestore doc is missing), but seeding enables:
 *   - analytics queries that scan the `quizzes` collection
 *   - admin tools that list / edit quizzes in-place
 *   - future cross-quiz features (leaderboards by quiz, etc.)
 *
 * Usage:
 *   npx tsx src/scripts/seed-scifi-media-quizzes.ts
 *   npx tsx src/scripts/seed-scifi-media-quizzes.ts --dry-run
 *   npx tsx src/scripts/seed-scifi-media-quizzes.ts --force   # re-write existing
 *
 * Idempotent: re-running without --force upserts; re-running with --force
 * overwrites. Each document id is deterministic (`scifi-media-{mediaId}`),
 * so re-runs never create duplicates.
 */

import { config as loadEnv } from 'dotenv';
loadEnv();

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { scifiMediaQuizzes } from '../data/scifi-media-quizzes';

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const FORCE = args.has('--force');

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missing = Object.entries(cfg).filter(([, v]) => !v);
if (missing.length) {
  console.error(
    `[seed-scifi-media-quizzes] Firebase config incomplete — missing: ${missing.map(([k]) => k).join(', ')}`,
  );
  process.exit(1);
}

const app = getApps()[0] ?? initializeApp(cfg);
const db = getFirestore(app);

async function main() {
  console.log(
    `\n[seed] ${scifiMediaQuizzes.length} sci-fi media quizzes to process.`,
  );
  console.log(
    `[seed] mode: ${DRY_RUN ? 'DRY-RUN (no writes)' : FORCE ? 'FORCE (overwrite existing)' : 'UPSERT (merge, skip existing bodies)'}\n`,
  );

  let wrote = 0;
  let skipped = 0;
  let errored = 0;

  for (const quiz of scifiMediaQuizzes) {
    const id = `scifi-media-${quiz.subjectId}`;
    try {
      const existing = await getDoc(doc(db, 'quizzes', id));
      const exists = existing.exists();

      if (exists && !FORCE) {
        console.log(`  = ${id}  (exists — skipping; use --force to overwrite)`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(
          `  ${exists ? '~' : '+'} ${id}  (dry-run — would ${exists ? 'overwrite' : 'create'})`,
        );
        wrote++;
        continue;
      }

      await setDoc(
        doc(db, 'quizzes', id),
        {
          // Strip the client-side id/createdAt/updatedAt; use server-side.
          subjectType: quiz.subjectType,
          subjectId: quiz.subjectId,
          subjectName: quiz.subjectName,
          title: quiz.title,
          description: quiz.description,
          questions: quiz.questions,
          estimatedMinutes: quiz.estimatedMinutes,
          passingScorePercent: quiz.passingScorePercent,
          createdAt: exists ? existing.data()?.createdAt ?? serverTimestamp() : serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: !FORCE },
      );
      console.log(`  ${exists ? '~' : '+'} ${id}  (${exists ? 'updated' : 'created'})`);
      wrote++;
    } catch (err) {
      errored++;
      console.error(`  ! ${id}  FAILED:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(
    `\n[seed] done. wrote=${wrote} skipped=${skipped} errored=${errored}\n`,
  );
  if (errored > 0) process.exit(1);
}

main().catch((err) => {
  console.error('[seed-scifi-media-quizzes] fatal:', err);
  process.exit(1);
});
