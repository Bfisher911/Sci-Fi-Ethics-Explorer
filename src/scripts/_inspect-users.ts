/**
 * Quick recon: list every Firestore users/{uid} doc with its email +
 * createdAt. Use to figure out why the email-lookup in
 * provision-test-license isn't finding the freshly signed-in account.
 *
 * Usage:
 *   npx tsx src/scripts/_inspect-users.ts
 *   npx tsx src/scripts/_inspect-users.ts zoomedic911
 *      (filter substring — case-insensitive)
 */

import { config as loadEnv } from 'dotenv';
loadEnv();

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const filter = (process.argv[2] || '').toLowerCase();

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const app = getApps()[0] ?? initializeApp(cfg);
const db = getFirestore(app);

async function main() {
  const snap = await getDocs(collection(db, 'users'));
  console.log(`\n[users] ${snap.size} total user docs\n`);
  const rows = snap.docs.map((d) => {
    const data = d.data() as Record<string, any>;
    const created =
      data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : '(unknown)';
    return {
      uid: d.id,
      email: data.email || '(no email)',
      name: data.name || data.displayName || '(no name)',
      created,
      isAdmin: data.isAdmin === true,
      activeLicenseId: data.activeLicenseId || '',
      subscriptionStatus: data.subscriptionStatus || 'none',
    };
  });
  rows.sort((a, b) => b.created.localeCompare(a.created));
  const filtered = filter
    ? rows.filter(
        (r) =>
          r.email.toLowerCase().includes(filter) ||
          r.name.toLowerCase().includes(filter) ||
          r.uid.toLowerCase().includes(filter)
      )
    : rows;
  for (const r of filtered.slice(0, 30)) {
    console.log(`uid=${r.uid}`);
    console.log(`  email=${r.email}  name=${r.name}`);
    console.log(`  created=${r.created}  isAdmin=${r.isAdmin}  status=${r.subscriptionStatus}  license=${r.activeLicenseId || '-'}`);
  }
  if (filtered.length === 0 && filter) {
    console.log(`(no users matched "${filter}")`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
