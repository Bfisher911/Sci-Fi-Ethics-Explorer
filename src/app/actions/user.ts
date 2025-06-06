
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) {
    console.error("getUserProfile called with undefined or empty UID.");
    // Consider throwing a specific error or returning null based on how you want to handle this upstream
    throw new Error("User UID is required to fetch profile.");
  }
  console.log(`Attempting to fetch profile for UID: ${uid}`);
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log(`Raw profile data found for UID ${uid}:`, JSON.stringify(data));
      
      // Helper to convert Firestore Timestamp to JS Date
      const toDate = (timestamp: Timestamp | undefined): Date | undefined => {
        return timestamp?.toDate ? timestamp.toDate() : undefined;
      };

      const profile: UserProfile = {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        favoriteGenre: data.favoriteGenre,
        storiesCompleted: data.storiesCompleted || 0,
        dilemmasAnalyzed: data.dilemmasAnalyzed || 0,
        communitySubmissions: data.communitySubmissions || 0,
        createdAt: toDate(data.createdAt as Timestamp | undefined),
        lastUpdated: toDate(data.lastUpdated as Timestamp | undefined),
      };
      console.log(`Processed profile for UID ${uid}:`, JSON.stringify(profile));
      return profile;
    } else {
      console.log(`No profile document found for UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching user profile from Firestore for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    // This new Error is what gets shown to the client if the action fails
    throw new Error(`Could not fetch user profile. Original error: ${specificErrorMessage}`);
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  if (!uid) {
    throw new Error("User UID is required to update profile.");
  }
  console.log(`Attempting to update profile for UID: ${uid} with data:`, JSON.stringify(data));
  try {
    const userDocRef = doc(db, 'users', uid);
    
    const updateData: Record<string, any> = { ...data, lastUpdated: serverTimestamp() };
    
    // Remove fields that shouldn't be directly updated this way or are handled by serverTimestamp
    delete updateData.uid;
    delete updateData.email; // Email is usually managed by Firebase Auth, not directly in profile doc updates
    delete updateData.createdAt; // createdAt should not change after initial creation

    await updateDoc(userDocRef, updateData);
    console.log(`Successfully updated profile for UID: ${uid}`);
  } catch (error) {
    console.error(`Error updating user profile for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not update user profile. Original error: ${specificErrorMessage}`);
  }
}

export async function createUserProfile(uid: string, email: string | null, displayName?: string, avatarUrl?: string): Promise<void> {
  if (!uid) {
    throw new Error("User UID is required to create profile.");
  }
  console.log(`Attempting to create profile for UID: ${uid}`);
  try {
    const userDocRef = doc(db, 'users', uid);
    const now = serverTimestamp();
    
    // Constructing the profile with explicit fields expected by UserProfile (excluding optional ones if not provided)
    const initialProfileData: Record<string, any> = {
      uid,
      email: email || null,
      displayName: displayName || email?.split('@')[0] || 'Anonymous User',
      avatarUrl: avatarUrl || '',
      favoriteGenre: '',
      storiesCompleted: 0,
      dilemmasAnalyzed: 0,
      communitySubmissions: 0,
      createdAt: now,
      lastUpdated: now,
    };

    await setDoc(userDocRef, initialProfileData);
    console.log(`Successfully created profile for UID: ${uid} with data:`, JSON.stringify(initialProfileData).replace(/"now"/g, "serverTimestamp()")); // For logging, show serverTimestamp placeholder
  } catch (error) {
    console.error(`Error creating user profile for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not create user profile. Original error: ${specificErrorMessage}`);
  }
}
