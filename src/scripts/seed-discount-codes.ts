/**
 * seed-discount-codes.ts
 *
 * One-shot operator script that seeds the starter class discount codes
 * for the Ethics of Technology through Science Fiction class on Off
 * World Clause. Run once per environment; idempotent — if a code with
 * the same text already exists, the script logs a notice and leaves it
 * alone (so it never resets `redemptionCount` or overrides admin
 * changes).
 *
 * Usage:
 *   npx tsx src/scripts/seed-discount-codes.ts
 *
 * The codes created here grant FOUR MONTHS of free access to Off World
 * Clause for the Ethics of Technology through Science Fiction course.
 * They do NOT create Stripe customers or subscriptions — there is no
 * billing object that could later charge a student.
 *
 * To create additional codes (or different durations), use the admin
 * UI at /admin/discount-codes, or edit STARTER_CODES below and re-run.
 */

import { config as loadEnv } from 'dotenv';
loadEnv();

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  limit as fbLimit,
} from 'firebase/firestore';
import type { DiscountCode } from '../types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  console.error(
    'Missing Firebase config in env. Make sure .env has NEXT_PUBLIC_FIREBASE_*.'
  );
  process.exit(2);
}

const app = getApps()[0] ?? initializeApp(firebaseConfig);
const db = getFirestore(app);

const COURSE_NAME = 'The Ethics of Technology through Science Fiction';
const PLATFORM_NAME = 'Off World Clause';
const ACCESS_DURATION_MONTHS = 4;

interface SeedCode {
  code: string;
  name: string;
  description: string;
  maxRedemptions?: number | null;
}

const STARTER_CODES: SeedCode[] = [
  {
    code: 'OFFWORLD-CLASS-2026',
    name: 'Ethics of Tech (2026) — Class Access',
    description:
      `4-month free access to ${PLATFORM_NAME} for students of ` +
      `${COURSE_NAME}. No credit card required, no auto-charge after expiry.`,
  },
  {
    code: 'OFFWORLD-ETHICS-2026',
    name: 'Ethics of Tech (2026) — Class Access (alt)',
    description:
      `Alternate code for ${COURSE_NAME}. Same 4-month free access as ` +
      'OFFWORLD-CLASS-2026.',
  },
  {
    code: 'OFFWORLD-STUDENT-ACCESS',
    name: 'Generic Student Access',
    description:
      `Generic student access to ${PLATFORM_NAME} for ${COURSE_NAME}. ` +
      '4-month free access, no auto-charge after expiry.',
  },
];

async function findExisting(code: string): Promise<string | null> {
  const snap = await getDocs(
    query(
      collection(db, 'discountCodes'),
      where('code', '==', code),
      fbLimit(1),
    ),
  );
  return snap.empty ? null : snap.docs[0].id;
}

async function main(): Promise<void> {
  console.log('\n[seed-discount-codes] Creating starter class codes…\n');
  let created = 0;
  let skipped = 0;
  for (const seed of STARTER_CODES) {
    const code = seed.code.toUpperCase();
    const existingId = await findExisting(code);
    if (existingId) {
      console.log(`  • ${code} — already exists (id=${existingId}); skipping.`);
      skipped += 1;
      continue;
    }
    const doc: Omit<DiscountCode, 'id'> = {
      code,
      name: seed.name,
      description: seed.description,
      discountType: 'free_access',
      accessScope: 'platform_course',
      courseName: COURSE_NAME,
      platformName: PLATFORM_NAME,
      accessDurationMonths: ACCESS_DURATION_MONTHS,
      maxRedemptions: seed.maxRedemptions ?? null,
      redemptionCount: 0,
      oneUsePerUser: true,
      requiresStripe: false,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    // Drop undefined keys
    const cleaned = Object.fromEntries(
      Object.entries(doc).filter(([, v]) => v !== undefined),
    );
    const ref = await addDoc(collection(db, 'discountCodes'), cleaned);
    console.log(`  ✓ ${code} — created (id=${ref.id})`);
    created += 1;
  }
  console.log(`\n[seed-discount-codes] Done. Created ${created}, skipped ${skipped}.\n`);
  console.log(
    `Students can now enter any of these codes during signup, on the ` +
      `onboarding page, or on the billing page to receive ${ACCESS_DURATION_MONTHS} ` +
      'months of free access. No credit card required. No charge afterward.\n',
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed-discount-codes] Fatal:', err);
  process.exit(1);
});
