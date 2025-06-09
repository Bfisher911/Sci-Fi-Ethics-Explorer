
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
const db = getFirestore(); // This db is for admin operations within functions

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
    // Use 'name' field in Firestore for what UserProfile type calls 'displayName'
    // and 'bio' as an empty string.
    await db.doc(`users/${u.uid}`).set({
      uid:  u.uid,
      name: u.displayName ?? '', 
      email: u.email,
      bio: '', // Default bio
      role: 'Explorer', // Default platform role
      isAdmin: false, // Default admin status
      createdAt: FieldValue.serverTimestamp() // Firestore server timestamp
    }, { merge: true }); // Use merge:true to avoid overwriting if doc somehow exists
    logger.info(`Successfully created Firestore profile for user ${u.uid}`);
  } catch (error) {
    logger.error(`Error creating Firestore profile for user ${u.uid}:`, error);
  }
});
// 🔁 END PATCH

// 🔁 PATCH: Add setOrganizationClaims callable function (BF 2025-06-06)
import { HttpsError, onCall } from 'firebase-functions/v2/https';
// admin and logger already imported above.

export const setOrganizationClaims = onCall({ region: 'us-central1' }, async (request) => {
  // App Check can be enforced here for enhanced security if needed:
  // if (request.app == undefined) {
  //   throw new HttpsError('failed-precondition', 'The function must be called from an App Check verified app.');
  // }

  // Authentication check (optional if only called by trusted server actions, but good for direct client calls)
  // For server-to-server, the calling server action's identity might be more relevant.
  // If request.auth is not populated, it means the call wasn't made by an authenticated Firebase user client-side.
  // This function is intended to be called by a server action, which itself should verify the user's identity.
  // So, we primarily rely on the data passed.

  const { userId, orgId, role } = request.data;
  logger.info(`setOrganizationClaims called with: userId=${userId}, orgId=${orgId}, role=${role}`);

  if (!userId || !orgId || !role) {
    logger.error('setOrganizationClaims: Missing userId, orgId, or role in request data.', request.data);
    throw new HttpsError('invalid-argument', 'The function must be called with userId, orgId, and role in the data payload.');
  }

  // Validate role (optional, but good practice)
  const validRoles = ['owner', 'leader', 'member'];
  if (!validRoles.includes(role)) {
    logger.error(`setOrganizationClaims: Invalid role "${role}" for user ${userId}.`);
    throw new HttpsError('invalid-argument', `Invalid role specified. Must be one of: ${validRoles.join(', ')}.`);
  }

  try {
    const userRecord = await admin.auth().getUser(userId);
    const currentClaims = userRecord.customClaims || {};
    
    // Prepare new claims, preserving existing ones not related to organization
    const newClaims = {
      ...currentClaims,
      teamId: orgId,   // As per architectural plan
      role: role,      // 'owner', 'leader', 'member' for the specified teamId
      // Example: to add a timestamp for when these specific org claims were set
      // org_orgId_roleSetAt: Date.now(), // Not standard, but demonstrates dynamic claim naming
    };
    
    // Firebase custom claims are limited to 1000 bytes for the entire JSON payload.
    if (JSON.stringify(newClaims).length > 1000) {
        logger.error(`setOrganizationClaims: New claims for user ${userId} would exceed 1000 bytes. Current: ${JSON.stringify(currentClaims)}, Attempted New: ${JSON.stringify(newClaims)}`);
        // Implement strategy to handle oversized claims, e.g., by removing older or less critical claims, or by storing some info in Firestore.
        // For now, this will throw an error via setCustomUserClaims if too large.
        throw new HttpsError('resource-exhausted', 'Cannot set claims, payload exceeds maximum size.');
    }

    await admin.auth().setCustomUserClaims(userId, newClaims);
    logger.info(`setOrganizationClaims: Successfully set custom claims for user ${userId}: ${JSON.stringify(newClaims)}`);
    return { success: true, message: `Custom claims set for user ${userId}. New claims: ${JSON.stringify(newClaims)}` };
  } catch (error: any) {
    logger.error(`setOrganizationClaims: Error setting custom claims for user ${userId}:`, error);
    // Provide a more specific error message if possible
    const errorMessage = error.message || 'Unable to set custom claims.';
    const errorCode = error.code || 'internal';
    throw new HttpsError(errorCode, errorMessage, error);
  }
});
// 🔁 END PATCH

// Example of existing genkit-sample export, ensure it's not removed if present in user's file
// export * from "./genkit-sample"; 
