/**
 * Seed the new first-party content into Firestore:
 *   - 6 interactive stories  → `stories`        (client SDK; rules allow)
 *   - 9 structured debates   → `debates`        (client SDK; rules allow)
 *   - 9 ethical dilemmas      → `weeklyDilemmas`  (ADMIN SDK; client writes are denied)
 *
 * Idempotent: fixed doc ids + setDoc/merge, so re-running updates in place.
 * Requires NEXT_PUBLIC_FIREBASE_* (client) and FIREBASE_ADMIN_* (admin) env
 * vars (loaded from .env).
 *
 *   npx tsx src/scripts/seed-new-content.ts
 */

import 'dotenv/config';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { getAdminDb } from '../lib/firebase/admin';
import { EXTRA_STORIES } from '../data/stories-extra';
import { NEW_DEBATES } from '../data/debates';
import { NEW_DILEMMAS } from '../data/dilemmas';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedStories(): Promise<void> {
  console.log(`Seeding ${EXTRA_STORIES.length} stories...`);
  for (const story of EXTRA_STORIES) {
    const { id, ...data } = story;
    await setDoc(
      doc(db, 'stories', id),
      {
        ...data,
        status: 'published',
        publishedAt: serverTimestamp(),
        viewCount: 0,
        tags: [data.genre, data.theme].filter(Boolean),
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log(`  ✓ ${story.title} (${id})`);
  }
}

async function seedDebates(): Promise<void> {
  console.log(`Seeding ${NEW_DEBATES.length} debates...`);
  for (const debate of NEW_DEBATES) {
    const { id, ...data } = debate;
    await setDoc(
      doc(db, 'debates', id),
      { ...data, createdAt: serverTimestamp() },
      { merge: true },
    );
    console.log(`  ✓ ${debate.title} (${id})`);
  }
}

async function seedDilemmas(): Promise<void> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    throw new Error(
      'Firebase Admin credentials missing — cannot seed weeklyDilemmas (client writes are denied by rules). Set FIREBASE_ADMIN_* in .env.',
    );
  }
  console.log(`Seeding ${NEW_DILEMMAS.length} dilemmas...`);
  for (const dilemma of NEW_DILEMMAS) {
    const { id, publishDate, ...data } = dilemma;
    await adminDb
      .collection('weeklyDilemmas')
      .doc(id)
      .set(
        {
          ...data,
          publishDate: new Date(publishDate),
          generatedAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true },
      );
    console.log(`  ✓ ${dilemma.title} (${id})`);
  }
}

async function main(): Promise<void> {
  try {
    await seedStories();
    await seedDebates();
    await seedDilemmas();
    console.log('\nAll new content seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();
