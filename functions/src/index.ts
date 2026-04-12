
import { logger } from "firebase-functions";
import { identity } from "firebase-functions";
import { https } from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Creates a Firestore user profile document when a new user signs up.
 */
export const createUserDoc = identity.beforeUserCreated(async (event) => {
  const u = event.data!;
  logger.info(`New user signing up: UID = ${u.uid}, Email = ${u.email}`);

  if (!u.email) {
    logger.info(`User ${u.uid} has no email, skipping profile creation.`);
    return;
  }

  try {
    await db.doc(`users/${u.uid}`).set(
      {
        uid: u.uid,
        name: u.displayName ?? "",
        email: u.email,
        bio: "",
        role: "Explorer",
        isAdmin: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    logger.info(`Successfully created Firestore profile for user ${u.uid}`);
  } catch (error) {
    logger.error(
      `Error creating Firestore profile for user ${u.uid}:`,
      error
    );
  }
});

/**
 * Callable function to set organization custom claims on a user's auth token.
 */
export const setOrganizationClaims = https.onCall(
  { region: "us-central1" },
  async (request) => {
    const { userId, orgId, role } = request.data;
    logger.info(
      `setOrganizationClaims called: userId=${userId}, orgId=${orgId}, role=${role}`
    );

    if (!userId || !orgId || !role) {
      throw new https.HttpsError(
        "invalid-argument",
        "userId, orgId, and role are required."
      );
    }

    const validRoles = ["owner", "leader", "member"];
    if (!validRoles.includes(role)) {
      throw new https.HttpsError(
        "invalid-argument",
        `Invalid role. Must be one of: ${validRoles.join(", ")}.`
      );
    }

    try {
      const userRecord = await admin.auth().getUser(userId);
      const currentClaims = userRecord.customClaims || {};

      const newClaims = {
        ...currentClaims,
        teamId: orgId,
        role: role,
      };

      if (JSON.stringify(newClaims).length > 1000) {
        throw new https.HttpsError(
          "resource-exhausted",
          "Claims payload exceeds maximum size."
        );
      }

      await admin.auth().setCustomUserClaims(userId, newClaims);
      logger.info(
        `Set custom claims for user ${userId}: ${JSON.stringify(newClaims)}`
      );
      return { success: true, message: `Claims set for user ${userId}.` };
    } catch (error: any) {
      logger.error(`Error setting claims for user ${userId}:`, error);
      throw new https.HttpsError(
        error.code || "internal",
        error.message || "Unable to set custom claims."
      );
    }
  }
);
