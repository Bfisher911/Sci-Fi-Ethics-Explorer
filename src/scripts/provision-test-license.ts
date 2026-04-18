/**
 * provision-test-license.ts
 *
 * One-shot operator script that provisions a paid 200-seat semester
 * license for a real user account, so you can exercise the
 * seat-assignment / instructor flows end-to-end without going through
 * Stripe checkout.
 *
 * Usage:
 *   npx tsx src/scripts/provision-test-license.ts <email>
 *   npx tsx src/scripts/provision-test-license.ts zoomedic911@gmail.com
 *
 *   Override seats/term:
 *   SEATS=200 TERM=semester npx tsx src/scripts/provision-test-license.ts <email>
 *
 * Idempotent: if the user already has an active license, the script
 * updates that license in place instead of stacking a second one.
 *
 * Uses the same client SDK + .env config as the app itself, so it
 * needs no service-account credentials. Firestore rules on this
 * project already permit writes from any client (auth is enforced
 * in app code), so this works against production.
 */

import { config as loadEnv } from 'dotenv';
loadEnv();

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const email = (process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.error('Usage: npx tsx src/scripts/provision-test-license.ts <email>');
  process.exit(1);
}

const TOTAL_SEATS = Number(process.env.SEATS || 200);
const TERM: 'semester' | 'annual' =
  (process.env.TERM as 'semester' | 'annual') || 'semester';
const PRICE_PER_SEAT = TERM === 'semester' ? 12 : 24; // arbitrary placeholder
const PRICE_TOTAL = PRICE_PER_SEAT * TOTAL_SEATS;
const ORG_NAME =
  process.env.ORG || 'Test Cohort — Blaine Fisher (200-seat trial)';

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

async function main(): Promise<void> {
  console.log(`\n[provision] Looking up user "${email}" in Firestore…`);

  // The app stores the email on the users/{uid} doc on signup, so we
  // can resolve the uid via Firestore (no admin SDK needed).
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) {
    console.error(
      `\n❌ No Firestore user doc for "${email}".\n` +
        '   Make sure the account has signed in at least once at\n' +
        '   https://scifi-ethics-explorer.netlify.app/login first,\n' +
        '   then re-run this script.\n'
    );
    process.exit(3);
  }
  if (snap.size > 1) {
    console.warn(
      `[provision] Found ${snap.size} user docs with this email — using the first.`
    );
  }

  const userDoc = snap.docs[0];
  const uid = userDoc.id;
  const profile = userDoc.data() as Record<string, unknown>;
  const displayName =
    (profile.name as string | undefined) ||
    (profile.displayName as string | undefined) ||
    'Test Operator';
  console.log(`[provision] Found uid=${uid} (${displayName})`);

  // Build the license document
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + (TERM === 'semester' ? 4 : 12));

  // If a license already exists for this purchaser, update it in place
  // to keep this script idempotent (re-runs won't pile up duplicates).
  const existingQ = query(
    collection(db, 'licenses'),
    where('purchaserId', '==', uid),
    where('status', '==', 'active')
  );
  const existingSnap = await getDocs(existingQ);

  let licenseId: string;
  if (!existingSnap.empty) {
    const existing = existingSnap.docs[0];
    licenseId = existing.id;
    console.log(
      `[provision] Existing active license ${licenseId} — updating in place.`
    );
    await updateDoc(doc(db, 'licenses', licenseId), {
      organizationName: ORG_NAME,
      purchaserName: displayName,
      planId: 'organization-license',
      totalSeats: TOTAL_SEATS,
      term: TERM,
      startDate: Timestamp.fromDate(now),
      endDate: Timestamp.fromDate(endDate),
      status: 'active',
      priceTotal: PRICE_TOTAL,
      updatedAt: serverTimestamp(),
    });
  } else {
    const ref = await addDoc(collection(db, 'licenses'), {
      organizationName: ORG_NAME,
      purchaserId: uid,
      purchaserName: displayName,
      planId: 'organization-license',
      totalSeats: TOTAL_SEATS,
      usedSeats: 0,
      term: TERM,
      startDate: Timestamp.fromDate(now),
      endDate: Timestamp.fromDate(endDate),
      status: 'active',
      priceTotal: PRICE_TOTAL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    licenseId = ref.id;
    console.log(`[provision] Created license ${licenseId}`);
  }

  // Update the user profile to reference the license
  await updateDoc(doc(db, 'users', uid), {
    activeLicenseId: licenseId,
    subscriptionStatus: 'active',
    accountRole: profile.accountRole || 'instructor',
    role: profile.role || 'Instructor',
    onboardingComplete: true,
    lastUpdated: serverTimestamp(),
  });
  console.log('[provision] Updated user profile:');
  console.log(`    activeLicenseId       ${licenseId}`);
  console.log('    subscriptionStatus    active');
  console.log('    accountRole           instructor');

  // Verify
  const verify = await getDoc(doc(db, 'users', uid));
  console.log('\n[provision] ✅ Done. Verification snapshot:');
  console.log(JSON.stringify(verify.data(), null, 2));
  console.log(`\nLicense docId: ${licenseId}`);
  console.log(`Total seats: ${TOTAL_SEATS}`);
  console.log(`Term: ${TERM} (ends ${endDate.toLocaleDateString()})`);
  console.log(`Org name: ${ORG_NAME}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[provision] Fatal:', err);
  process.exit(1);
});
