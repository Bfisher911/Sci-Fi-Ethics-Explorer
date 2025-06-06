
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types';

type GetUserProfileResult = { success: true; data: UserProfile | null } | { success: false; error: string };
type MutateUserProfileResult = { success: true } | { success: false; error: string };


export async function getUserProfile(uid: string): Promise<GetUserProfileResult> {
  console.log(`[SERVER ACTION] getUserProfile: Received UID to fetch: '${uid}'`);

  if (!uid || uid.trim() === "") {
    const errorMsg = "[SERVER ACTION] getUserProfile: Called with undefined, null, or empty UID. User UID is required to fetch profile.";
    console.error(errorMsg);
    return { success: false, error: "User UID is required to fetch profile and was not provided or was empty." };
  }

  if (!db) {
    const errorMsg = "[SERVER ACTION] getUserProfile: Firestore database instance (db) is not initialized. Check Firebase config in /src/lib/firebase/config.ts and ensure environment variables are available.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
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
        if (typeof timestamp === 'string') return new Date(timestamp);
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
      return { success: true, data: profile };
    } else {
      console.log(`[SERVER ACTION] getUserProfile: No profile document found for UID: ${uid} in 'users' collection.`);
      return { success: true, data: null };
    }
  } catch (error) {
    console.error(`[SERVER ACTION] getUserProfile: Error fetching user profile from Firestore for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    if (specificErrorMessage.toLowerCase().includes("permission") || specificErrorMessage.toLowerCase().includes("permission_denied")) {
        return { success: false, error: `Could not fetch user profile due to permissions. Original error: ${specificErrorMessage}. Please check Firestore security rules.` };
    }
    return { success: false, error: `Could not fetch user profile. Original error: ${specificErrorMessage}` };
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<MutateUserProfileResult> {
  console.log(`[SERVER ACTION] updateUserProfile: Received UID: '${uid}', Data:`, JSON.stringify(data));
  if (!uid || uid.trim() === "") {
    const errorMsg = "[SERVER ACTION] updateUserProfile: Called with undefined, null, or empty UID. User UID is required to update profile.";
    console.error(errorMsg);
    return { success: false, error: "User UID is required to update profile and was not provided or was empty."};
  }

  if (!db) {
    const errorMsg = "[SERVER ACTION] updateUserProfile: Firestore database instance (db) is not initialized. Check Firebase config and environment variables.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  console.log(`[SERVER ACTION] updateUserProfile: Attempting to update/create profile for UID: ${uid} in 'users' collection`);
  try {
    const userDocRef = doc(db, 'users', uid);

    const updateData: Record<string, any> = {
      ...data,
      uid: uid, 
      lastUpdated: serverTimestamp(),
    };

    await setDoc(userDocRef, updateData, { merge: true });
    console.log(`[SERVER ACTION] updateUserProfile: Successfully updated/created profile for UID: ${uid}`);
    return { success: true };
  } catch (error) {
    console.error(`[SERVER ACTION] updateUserProfile: Error updating/creating user profile for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
     if (specificErrorMessage.toLowerCase().includes("permission") || specificErrorMessage.toLowerCase().includes("permission_denied")) {
        return { success: false, error: `Could not update user profile due to permissions. Original error: ${specificErrorMessage}. Please check Firestore security rules.` };
    }
    return { success: false, error: `Could not update/create user profile. Original error: ${specificErrorMessage}` };
  }
}

export async function createUserProfile(uid: string, email: string | null, displayName?: string, firstNameProp?: string, lastNameProp?: string, avatarUrl?: string): Promise<MutateUserProfileResult> {
  console.log(`[SERVER ACTION] createUserProfile: Received UID: '${uid}', Email: ${email}, DisplayName: ${displayName}, FirstName: ${firstNameProp}, LastName: ${lastNameProp}`);
  if (!uid || uid.trim() === "") {
    const errorMsg = "[SERVER ACTION] createUserProfile: Called with undefined, null, or empty UID. User UID is required to create profile.";
    console.error(errorMsg);
    return { success: false, error: "User UID is required to create profile and was not provided or was empty." };
  }

  if (!db) {
    const errorMsg = "[SERVER ACTION] createUserProfile: Firestore database instance (db) is not initialized. Check Firebase config and environment variables.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  
  console.log(`[SERVER ACTION] createUserProfile: Attempting to create profile for UID: ${uid} in 'users' collection`);
  try {
    const userDocRef = doc(db, 'users', uid);
    const now = serverTimestamp();

    let finalFirstName = firstNameProp || '';
    let finalLastName = lastNameProp || '';

    if (!finalFirstName && !finalLastName && displayName) {
        const nameParts = displayName.trim().split(/\s+/);
        if (nameParts.length > 0) {
            finalFirstName = nameParts[0];
            if (nameParts.length > 1) {
                finalLastName = nameParts.slice(1).join(' ');
            }
        }
    }
    
    const initialProfileData: UserProfile = {
      uid: uid,
      email: email || null,
      displayName: displayName || email?.split('@')[0] || 'Anonymous Explorer',
      firstName: finalFirstName,
      lastName: finalLastName,
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
    return { success: true };
  } catch (error) {
    console.error(`[SERVER ACTION] createUserProfile: Error creating user profile for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    if (specificErrorMessage.toLowerCase().includes("permission") || specificErrorMessage.toLowerCase().includes("permission_denied")) {
        return { success: false, error: `Could not create user profile due to permissions. Original error: ${specificErrorMessage}. Please check Firestore security rules.` };
    }
    return { success: false, error: `Could not create user profile. Original error: ${specificErrorMessage}` };
  }
}
