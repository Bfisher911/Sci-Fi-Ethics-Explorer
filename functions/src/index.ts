
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// 🔁 PATCH: create users/{uid} doc on sign-up (BF 2025-06-06)
import { onAuthUserCreate } from 'firebase-functions/v2/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK only if it hasn't been initialized yet.
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = getFirestore();

export const createUserDoc = onAuthUserCreate(async (event) => {
  const u = event.data;
  logger.info(`New user signed up: UID = ${u.uid}, Email = ${u.email}`);
  // We only proceed if the user has an email. This helps avoid issues with anonymous or phone auth users
  // if you're not intending to create profiles for them, or if email is a required field.
  if (!u.email) {
    logger.info(`User ${u.uid} has no email, skipping profile creation.`);
    return;
  }

  try {
    await db.doc(`users/${u.uid}`).set({
      uid:  u.uid,
      name: u.displayName ?? '', // Use displayName from Auth, or empty string
      email: u.email,
      bio: '', // Default bio
      createdAt: FieldValue.serverTimestamp() // Firestore server timestamp
    }, { merge: true }); // Use merge:true to avoid overwriting if doc somehow exists (e.g., client-side write succeeded first)
    logger.info(`Successfully created Firestore profile for user ${u.uid}`);
  } catch (error) {
    logger.error(`Error creating Firestore profile for user ${u.uid}:`, error);
  }
});
// 🔁 END PATCH
