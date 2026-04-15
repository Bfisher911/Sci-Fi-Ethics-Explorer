
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { isSuperAdminEmail } from '@/lib/super-admins';

/**
 * Checks whether the given user is an admin. A user is considered admin if:
 *  - their Firestore profile has `isAdmin === true`, OR
 *  - their email appears in the SUPER_ADMIN_EMAILS allowlist (server-side
 *    safety net so the platform owner can never get locked out).
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return false;
    const data = userDoc.data();
    if (data?.isAdmin === true) return true;
    if (isSuperAdminEmail(data?.email)) return true;
    return false;
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
