'use server';

/**
 * Community-manager role management.
 *
 * The super-admin (bfisher3@tulane.edu, per SUPER_ADMIN_EMAILS) is the
 * only account allowed to grant or revoke the `communityManager` flag
 * on a user profile. A community manager has moderation powers inside
 * any community they are a member of — pinning topics, removing posts,
 * etc. (The moderation surfaces themselves are added in a later pass;
 * this action establishes the role and the gating rule.)
 *
 * All mutation is routed through server actions so the gate cannot be
 * bypassed from the client.
 */

import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { isSuperAdminEmail } from '@/lib/super-admins';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireSuperAdmin(requesterId: string): Promise<void> {
  if (!requesterId) throw new Error('Not signed in.');
  const snap = await getDoc(doc(db, 'users', requesterId));
  if (!snap.exists()) throw new Error('Requester profile not found.');
  const email = (snap.data()?.email as string) || null;
  if (!isSuperAdminEmail(email)) {
    throw new Error('Only the super-admin can manage community-manager roles.');
  }
}

/**
 * Grant the `communityManager` flag to a user. Super-admin only.
 */
export async function grantCommunityManager(
  targetUid: string,
  requesterId: string
): Promise<ActionResult<void>> {
  try {
    await requireSuperAdmin(requesterId);
    if (!targetUid) return { success: false, error: 'Missing target uid.' };
    await updateDoc(doc(db, 'users', targetUid), {
      communityManager: true,
      lastUpdated: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (err: any) {
    console.error('[community-manager] grant error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Revoke the `communityManager` flag. Super-admin only.
 */
export async function revokeCommunityManager(
  targetUid: string,
  requesterId: string
): Promise<ActionResult<void>> {
  try {
    await requireSuperAdmin(requesterId);
    if (!targetUid) return { success: false, error: 'Missing target uid.' };
    await updateDoc(doc(db, 'users', targetUid), {
      communityManager: false,
      lastUpdated: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (err: any) {
    console.error('[community-manager] revoke error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Helper the client can call to check whether a specific uid currently
 * has the role. Read-only; anyone may call this.
 */
export async function isCommunityManager(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return false;
    return snap.data()?.communityManager === true;
  } catch {
    return false;
  }
}
