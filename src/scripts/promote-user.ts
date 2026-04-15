
/**
 * Promotes a user to full instructor with admin privileges.
 *
 * Usage:
 *   npx tsx src/scripts/promote-user.ts <email>
 *
 * Requirements:
 *   - Firebase Admin credentials available via GOOGLE_APPLICATION_CREDENTIALS
 *     env var (path to service account JSON), OR
 *   - Run after `gcloud auth application-default login` to use ADC
 *   - FIREBASE_PROJECT_ID env var (or NEXT_PUBLIC_FIREBASE_PROJECT_ID)
 *
 * Sets:
 *   - accountRole = 'instructor'
 *   - subscriptionStatus = 'active'
 *   - onboardingComplete = true
 *   - isAdmin = true
 *   - role = 'Instructor'
 */

import 'dotenv/config';
import * as admin from 'firebase-admin';

const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx src/scripts/promote-user.ts <email>');
  process.exit(1);
}

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  'sci-fi-ethics-explorer-rlmgn';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId,
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function promote() {
  console.log(`\nLooking up user with email: ${email}`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (err: any) {
    console.error(`\n❌ Could not find Firebase Auth user with email "${email}".`);
    console.error('The user must sign up first before being promoted.');
    console.error('Error:', err.message);
    process.exit(1);
  }

  const uid = userRecord.uid;
  console.log(`✓ Found user: ${uid}`);

  // Update Firestore user profile
  const userRef = db.doc(`users/${uid}`);
  await userRef.set(
    {
      uid,
      email: userRecord.email,
      accountRole: 'instructor',
      subscriptionStatus: 'active',
      onboardingComplete: true,
      isAdmin: true,
      role: 'Instructor',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log('✓ Updated Firestore profile:');
  console.log('    accountRole: instructor');
  console.log('    subscriptionStatus: active');
  console.log('    onboardingComplete: true');
  console.log('    isAdmin: true');
  console.log('    role: Instructor');

  // Create a permanent subscription record so getUserSubscription() returns valid data
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 10); // 10-year comp subscription

  const subRef = await db.collection('subscriptions').add({
    userId: uid,
    planId: 'instructor-individual',
    billingPeriod: 'annual',
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    comp: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await userRef.set(
    { subscriptionId: subRef.id },
    { merge: true }
  );
  console.log(`✓ Created comp subscription: ${subRef.id}`);

  // Set custom auth claims so the sidebar Admin link appears immediately
  await auth.setCustomUserClaims(uid, {
    ...(userRecord.customClaims || {}),
    isAdmin: true,
    accountRole: 'instructor',
  });
  console.log('✓ Set custom auth claims: isAdmin=true, accountRole=instructor');

  console.log('\n✅ Promotion complete.');
  console.log(`   ${email} is now a full instructor with admin privileges.`);
  console.log('   They may need to sign out and back in for claims to refresh.\n');
}

promote()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Promotion failed:', err);
    process.exit(1);
  });
