'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        favoriteGenre: data.favoriteGenre,
        storiesCompleted: data.storiesCompleted || 0,
        dilemmasAnalyzed: data.dilemmasAnalyzed || 0,
        communitySubmissions: data.communitySubmissions || 0,
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Optionally, rethrow or return a specific error object
    throw new Error("Could not fetch user profile.");
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    // Ensure only allowed fields are updated and add a lastUpdated timestamp
    const updateData: Record<string, any> = { ...data, lastUpdated: serverTimestamp() };
    
    // Remove uid and email from data if present, as they shouldn't be updated this way
    delete updateData.uid;
    delete updateData.email;

    await updateDoc(userDocRef, updateData);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Could not update user profile.");
  }
}

// This action could be used during sign-up if not handled client-side
export async function createUserProfile(uid: string, email: string | null, displayName?: string, avatarUrl?: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const initialProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || email?.split('@')[0] || 'Anonymous User',
      avatarUrl: avatarUrl || '',
      favoriteGenre: '',
      storiesCompleted: 0,
      dilemmasAnalyzed: 0,
      communitySubmissions: 0,
    };
    await setDoc(userDocRef, { ...initialProfile, createdAt: serverTimestamp() });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw new Error("Could not create user profile.");
  }
}
