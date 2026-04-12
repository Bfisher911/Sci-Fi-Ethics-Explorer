
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Checks whether the given user is an admin by reading their Firestore profile.
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return false;
    return userDoc.data()?.isAdmin === true;
  } catch (error) {
    console.error(`[admin] Error checking admin status for UID ${uid}:`, error);
    return false;
  }
}

/**
 * Throws an error if the given user is not an admin.
 * Use in server actions that require admin privileges.
 */
export async function requireAdmin(uid: string): Promise<void> {
  const admin = await isUserAdmin(uid);
  if (!admin) {
    throw new Error('Unauthorized: admin privileges required.');
  }
}
