
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { UserProfile, AccountRole } from '@/types';
import {
  OFFICIAL_AUTHOR_PROFILE,
  OFFICIAL_AUTHOR_UID,
  isOfficialAuthor,
} from '@/lib/official-author';

type GetUserProfileResult = { success: true; data: UserProfile | null } | { success: false; error: string };
type MutateUserProfileResult = { success: true } | { success: false; error: string };


export async function getUserProfile(uid: string): Promise<GetUserProfileResult> {
  console.log(`[SERVER ACTION] getUserProfile: Received UID to fetch: '${uid}'`);

  if (!uid || uid.trim() === "") {
    const errorMsg = "[SERVER ACTION] getUserProfile: Called with undefined, null, or empty UID. User UID is required to fetch profile.";
    console.error(errorMsg);
    return { success: false, error: "User UID is required to fetch profile and was not provided or was empty." };
  }

  // Synthetic profile for the canonical official site author. This is
  // virtual — there is no Firestore `users/{OFFICIAL_AUTHOR_UID}` doc —
  // so visiting /users/system-professor-paradox renders cleanly.
  if (isOfficialAuthor(uid)) {
    return { success: true, data: { ...OFFICIAL_AUTHOR_PROFILE, uid: OFFICIAL_AUTHOR_UID } };
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

      const toDate = (timestampField: Timestamp | Date | undefined): Date | undefined => {
        if (!timestampField) return undefined;
        if (timestampField instanceof Date) return timestampField;
        if (typeof (timestampField as Timestamp).toDate === 'function') return (timestampField as Timestamp).toDate();
        if (typeof timestampField === 'string') return new Date(timestampField); // Fallback for string dates
        return undefined; 
      };
      
      const profile: UserProfile = {
        uid: data.uid || uid,
        email: data.email,
        displayName: data.name || data.displayName || '', // Ensure displayName is always a string
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
        favoriteGenre: data.favoriteGenre || '',
        storiesCompleted: data.storiesCompleted || 0,
        dilemmasAnalyzed: data.dilemmasAnalyzed || 0,
        communitySubmissions: data.communitySubmissions || 0,
        role: data.role || 'Explorer',
        isAdmin: data.isAdmin || false,
        anonymousOnLeaderboard: data.anonymousOnLeaderboard === true,
        // Preserve the raw value (including undefined) so consumers can tell the
        // difference between "unset" (treat as public) and "explicitly false".
        isPublicProfile:
          data.isPublicProfile === undefined ? undefined : data.isPublicProfile !== false,
        dominantFramework: data.dominantFramework || undefined,
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
    return { success: false, error: "User UID is required to update profile and was not provided or was empty."};
  }
  if (!db) {
    return { success: false, error: "Firestore database instance (db) is not initialized." };
  }

  console.log(`[SERVER ACTION] updateUserProfile: Attempting to update/create profile for UID: ${uid} in 'users' collection`);
  try {
    const userDocRef = doc(db, 'users', uid);
    const firestoreUpdateData: Record<string, any> = {
      uid: uid, // Ensure uid is part of the data for setDoc with merge
      lastUpdated: serverTimestamp(),
    };

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = (data as any)[key];
        if (key === 'displayName') {
          if (value !== undefined) {
            firestoreUpdateData.name = value; // Map UserProfile's displayName to Firestore 'name' field
          }
          // Explicitly do not copy 'displayName' itself to firestoreUpdateData
        } else if (value !== undefined) {
          firestoreUpdateData[key] = value; // Copy other defined fields
        }
      }
    }

    await setDoc(userDocRef, firestoreUpdateData, { merge: true });
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

export async function createUserProfile(
  uid: string,
  email: string | null,
  displayNameInput?: string | null,
  firstNameProp?: string,
  lastNameProp?: string,
  avatarUrl?: string,
  accountRole?: AccountRole
): Promise<MutateUserProfileResult> {
  console.log(`[SERVER ACTION] createUserProfile: UID: '${uid}', Email: ${email}, DisplayName: ${displayNameInput}`);
  if (!uid || uid.trim() === "") {
    return { success: false, error: "User UID is required to create profile and was not provided or was empty." };
  }
  if (!db) {
    return { success: false, error: "Firestore database instance (db) is not initialized." };
  }
  
  console.log(`[SERVER ACTION] createUserProfile: Creating profile for UID: ${uid}`);
  // Hoisted into the outer scope so the catch block can reference it
  // for diagnostics. Previously the catch tried to log this variable
  // which was declared inside the try, hitting a ReferenceError that
  // masked every real Firestore failure (most notably the
  // permission-denied that broke every Google sign-in).
  let firestoreDataToWrite: Record<string, any> | null = null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const now = serverTimestamp();

    let finalFirstName = firstNameProp || '';
    let finalLastName = lastNameProp || '';

    // Ensure currentDisplayName is always a string, defaulting if input is null/undefined
    const currentDisplayName = displayNameInput || email?.split('@')[0] || 'Anonymous Explorer';

    if (!finalFirstName && !finalLastName && currentDisplayName) {
        const nameParts = currentDisplayName.trim().split(/\s+/);
        if (nameParts.length > 0) {
            finalFirstName = nameParts[0];
            if (nameParts.length > 1) {
                finalLastName = nameParts.slice(1).join(' ');
            }
        }
    }
    
    // This is the object matching UserProfile type, used for intermediate representation
    const internalUserProfileObject: UserProfile = {
      uid: uid,
      email: email || null, // Store as null if that's what email is
      displayName: currentDisplayName, // This is the UserProfile's displayName field
      firstName: finalFirstName,
      lastName: finalLastName,
      bio: '', 
      avatarUrl: avatarUrl || '',
      favoriteGenre: '',
      storiesCompleted: 0,
      dilemmasAnalyzed: 0,
      communitySubmissions: 0,
      role: 'Explorer',
      isAdmin: false,
      createdAt: now,
      lastUpdated: now,
    };

    // Prepare the actual data to write to Firestore.
    // We will use 'name' field in Firestore for what UserProfile calls 'displayName'.
    firestoreDataToWrite = {
      uid: internalUserProfileObject.uid,
      email: internalUserProfileObject.email,
      name: internalUserProfileObject.displayName, // Map UserProfile's displayName to Firestore 'name'
      firstName: internalUserProfileObject.firstName,
      lastName: internalUserProfileObject.lastName,
      bio: internalUserProfileObject.bio,
      avatarUrl: internalUserProfileObject.avatarUrl,
      favoriteGenre: internalUserProfileObject.favoriteGenre,
      storiesCompleted: internalUserProfileObject.storiesCompleted,
      dilemmasAnalyzed: internalUserProfileObject.dilemmasAnalyzed,
      communitySubmissions: internalUserProfileObject.communitySubmissions,
      role: internalUserProfileObject.role,
      isAdmin: internalUserProfileObject.isAdmin,
      createdAt: internalUserProfileObject.createdAt,
      lastUpdated: internalUserProfileObject.lastUpdated,
      // The 'displayName' field itself is NOT included in this object sent to Firestore.
      subscriptionStatus: 'none',
      onboardingComplete: false,
      ...(accountRole ? { accountRole } : {}),
    };

    await setDoc(userDocRef, firestoreDataToWrite, { merge: true }); 
    console.log(`[SERVER ACTION] createUserProfile: Successfully created/merged profile for UID: ${uid}`);
    return { success: true };
  } catch (error) {
    console.error(`[SERVER ACTION] createUserProfile: Error creating user profile for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    if (specificErrorMessage.toLowerCase().includes("unsupported field value") && specificErrorMessage.toLowerCase().includes("displayname")){
        console.error("[SERVER ACTION] createUserProfile: Firestore still rejected displayName. Data sent:", JSON.stringify(firestoreDataToWrite));
    }
    if (specificErrorMessage.toLowerCase().includes("permission") || specificErrorMessage.toLowerCase().includes("permission_denied")) {
        return { success: false, error: `Could not create user profile due to permissions. Original error: ${specificErrorMessage}. Please check Firestore security rules.` };
    }
    return { success: false, error: `Could not create user profile. Original error: ${specificErrorMessage}` };
  }
}
