
/**
 * Seed script to push mock stories into Firestore.
 *
 * Run from the project root:
 *   npx tsx src/scripts/seed-stories.ts
 *
 * Requires NEXT_PUBLIC_FIREBASE_* env vars to be set (loads from .env).
 */

import 'dotenv/config';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { mockStories, mockEthicalTheories } from '../data/mock-data';

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
  console.log(`Seeding ${mockStories.length} stories...`);

  for (const story of mockStories) {
    const { id, ...data } = story;
    await setDoc(doc(db, 'stories', id), {
      ...data,
      status: 'published',
      publishedAt: serverTimestamp(),
      viewCount: 0,
      tags: [data.genre, data.theme].filter(Boolean),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`  ✓ ${story.title} (${id})`);
  }

  console.log('Stories seeded successfully.\n');
}

async function seedTheories(): Promise<void> {
  console.log(`Seeding ${mockEthicalTheories.length} ethical theories...`);

  for (const theory of mockEthicalTheories) {
    const { id, ...data } = theory;
    await setDoc(doc(db, 'ethicalTheories', id), {
      ...data,
      createdAt: serverTimestamp(),
    });
    console.log(`  ✓ ${theory.name} (${id})`);
  }

  console.log('Theories seeded successfully.\n');
}

async function main(): Promise<void> {
  try {
    await seedStories();
    await seedTheories();
    console.log('All seed data written successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();
