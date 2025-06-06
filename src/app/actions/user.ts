
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) {
    console.error("getUserProfile called with undefined or empty UID.");
    throw new Error("User UID is required to fetch profile.");
  }
  console.log(`Attempting to fetch profile for UID: ${uid}`);
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log(`Raw profile data found for UID ${uid}:`, JSON.stringify(data));
      
      const toDate = (timestamp: Timestamp | Date | undefined): Date | undefined => {
        if (!timestamp) return undefined;
        if (timestamp instanceof Date) return timestamp;
        // @ts-ignore
        if (timestamp.toDate) return timestamp.toDate(); // Firestore Timestamp
        if (typeof timestamp === 'string') return new Date(timestamp); // ISO string for flexibility, though Firestore should give Timestamp
        return undefined;
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
        role: data.role || 'Explorer',
        isAdmin: data.isAdmin || false,
        createdAt: toDate(data.createdAt as Timestamp | Date | undefined),
        lastUpdated: toDate(data.lastUpdated as Timestamp | Date | undefined),
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
    throw new Error(`Could not fetch user profile. Original error: ${specificErrorMessage}`);
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  if (!uid) {
    throw new Error("User UID is required to update profile.");
  }
  console.log(`Attempting to update/create profile for UID: ${uid} with data:`, JSON.stringify(data));
  try {
    const userDocRef = doc(db, 'users', uid);
    
    const updateData: Record<string, any> = { 
      ...data, 
      lastUpdated: serverTimestamp() 
    };
    
    delete updateData.createdAt; 
    if (data.uid && data.uid !== uid) {
        console.warn("Attempting to change UID in updateUserProfile. This is not allowed. Using original UID.");
    }
    updateData.uid = uid; // Ensure UID is part of the data for creation/merge

    await setDoc(userDocRef, updateData, { merge: true });
    console.log(`Successfully updated/created profile for UID: ${uid}`);
  } catch (error) {
    console.error(`Error updating/creating user profile for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not update/create user profile. Original error: ${specificErrorMessage}`);
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
    
    // Ensure this structure matches the UserProfile type and expectations.
    const initialProfileData: Record<string, any> = {
      uid,
      email: email || null,
      displayName: displayName || email?.split('@')[0] || 'Anonymous Explorer',
      avatarUrl: avatarUrl || '',
      favoriteGenre: '',
      storiesCompleted: 0,
      dilemmasAnalyzed: 0,
      communitySubmissions: 0,
      role: 'Explorer', // Default role
      isAdmin: false, // Default admin status
      createdAt: now,
      lastUpdated: now,
    };

    await setDoc(userDocRef, initialProfileData, { merge: true }); // Use merge:true to be safe, though it's a create operation
    console.log(`Successfully created profile for UID: ${uid} with data:`, JSON.stringify(initialProfileData).replace(/"now"/g, "serverTimestamp()"));
  } catch (error) {
    console.error(`Error creating user profile for UID ${uid}:`, error);
    const specificErrorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not create user profile. Original error: ${specificErrorMessage}`);
  }
}
