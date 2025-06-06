
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  console.log(`[SERVER ACTION] getUserProfile: Received UID to fetch: '${uid}'`);

  if (!uid || uid.trim() === "") {
    console.error("[SERVER ACTION] getUserProfile: Called with undefined, null, or empty UID.");
    throw new Error("User UID is required to fetch profile and was not provided or was empty.");
  }
  console.log(`[SERVER ACTION] getUserProfile: Attempting to fetch profile for UID: ${uid} from 'users' collection`);
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log(`[SERVER ACTION] getUserProfile: Raw profile data found for UID ${uid}:`, JSON.stringify(data));

      const toDate = (timestamp: Timestamp | Date | undefined): Date | undefined => {
        if (!timestamp) return undefined;
        if (timestamp instanceof Date) return timestamp;
        // @ts-ignore Firestore Timestamps have a toDate method
        if (timestamp.toDate) return timestamp.toDate();
        if (typeof timestamp === 'string') return new Date(timestamp); // Handle ISO string if necessary
        return undefined;
      };

      const profile: UserProfile = {
        uid: data.uid || uid,
        email: data.email,
        displayName: data.displayName,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        avatarUrl: data.avatarUrl,
        favoriteGenre: data.favoriteGenre,
        storiesCompleted: data.storiesCompleted || 0,
        dilemmasAnalyzed: data.dilemmasAnalyzed || 0,
        communitySubmissions: data.communitySubmissions || 0,
        role: data.role || 'Explorer',
        isAdmin: data.isAdmin || false,
        createdAt: toDate(data.createdAt as Timestamp | Date | undefined),
        lastUpdated: toDate(data.lastUpdated as Timestamp | Date | undefined),
      };
      console.log(`[SERVER ACTION] getUserProfile: Processed profile for UID ${uid}:`, JSON.stringify(profile));
      return profile;
    } else {
      console.log(`[SERVER ACTION] getUserProfile: No profile document found for UID: ${uid} in 'users' collection.`);
      return null;
    }
  } catch (error) {
    console.error(`[SERVER ACTION] getUserProfile: Error fetching user profile from Firestore for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not fetch user profile. Original error: ${specificErrorMessage}`);
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  console.log(`[SERVER ACTION] updateUserProfile: Received UID: '${uid}', Data:`, JSON.stringify(data));
  if (!uid || uid.trim() === "") {
    console.error("[SERVER ACTION] updateUserProfile: Called with undefined, null, or empty UID.");
    throw new Error("User UID is required to update profile and was not provided or was empty.");
  }
  console.log(`[SERVER ACTION] updateUserProfile: Attempting to update/create profile for UID: ${uid} in 'users' collection`);
  try {
    const userDocRef = doc(db, 'users', uid);

    const updateData: Record<string, any> = {
      ...data,
      lastUpdated: serverTimestamp(),
      uid: uid, // Ensure uid is always part of the data being set/merged
    };

    // Remove uid from data if it was destructured, as it's already in updateData.uid
    // However, by explicitly setting updateData.uid = uid, we ensure it's correct.
    // No need to delete `data.uid` as `...data` spread comes first.

    await setDoc(userDocRef, updateData, { merge: true });
    console.log(`[SERVER ACTION] updateUserProfile: Successfully updated/created profile for UID: ${uid}`);
  } catch (error) {
    console.error(`[SERVER ACTION] updateUserProfile: Error updating/creating user profile for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not update/create user profile. Original error: ${specificErrorMessage}`);
  }
}

export async function createUserProfile(uid: string, email: string | null, displayName?: string, avatarUrl?: string): Promise<void> {
  console.log(`[SERVER ACTION] createUserProfile: Received UID: '${uid}', Email: ${email}, DisplayName: ${displayName}`);
  if (!uid || uid.trim() === "") {
    console.error("[SERVER ACTION] createUserProfile: Called with undefined, null, or empty UID.");
    throw new Error("User UID is required to create profile and was not provided or was empty.");
  }
  console.log(`[SERVER ACTION] createUserProfile: Attempting to create profile for UID: ${uid} in 'users' collection`);
  try {
    const userDocRef = doc(db, 'users', uid);
    const now = serverTimestamp();

    let initialFirstName = '';
    let initialLastName = '';
    if (displayName) {
        const nameParts = displayName.trim().split(/\s+/);
        if (nameParts.length > 0) {
            initialFirstName = nameParts[0];
            if (nameParts.length > 1) {
                initialLastName = nameParts.slice(1).join(' ');
            }
        }
    }

    const initialProfileData: UserProfile = {
      uid: uid, // CRITICAL: This must match request.auth.uid for create rule and be present in the document
      email: email || null,
      displayName: displayName || email?.split('@')[0] || 'Anonymous Explorer',
      firstName: initialFirstName,
      lastName: initialLastName,
      avatarUrl: avatarUrl || '',
      favoriteGenre: '',
      storiesCompleted: 0,
      dilemmasAnalyzed: 0,
      communitySubmissions: 0,
      role: 'Explorer',
      isAdmin: false,
      // @ts-ignore serverTimestamp will be converted by Firestore
      createdAt: now,
      // @ts-ignore serverTimestamp will be converted by Firestore
      lastUpdated: now,
    };

    await setDoc(userDocRef, initialProfileData);
    console.log(`[SERVER ACTION] createUserProfile: Successfully created profile for UID: ${uid} with data:`, JSON.stringify(initialProfileData).replace(/"now"/g, "serverTimestamp()"));
  } catch (error) {
    console.error(`[SERVER ACTION] createUserProfile: Error creating user profile for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not create user profile. Original error: ${specificErrorMessage}`);
  }
}
