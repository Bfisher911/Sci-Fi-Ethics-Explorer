
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { UserBlock } from '@/types';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function blockUser(blockerId: string, blockedId: string): Promise<ActionResult<void>> {
  try {
    if (blockerId === blockedId) return { success: false, error: 'Cannot block yourself.' };
    await setDoc(
      doc(db, 'userBlocks', blockerId),
      {
        blockerId,
        blockedIds: arrayUnion(blockedId),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[user-blocks] blockUser error:', error);
    return { success: false, error: String(error) };
  }
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<ActionResult<void>> {
  try {
    await setDoc(
      doc(db, 'userBlocks', blockerId),
      {
        blockerId,
        blockedIds: arrayRemove(blockedId),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[user-blocks] unblockUser error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getUserBlocks(userId: string): Promise<ActionResult<string[]>> {
  try {
    const snap = await getDoc(doc(db, 'userBlocks', userId));
    if (!snap.exists()) return { success: true, data: [] };
    return { success: true, data: snap.data().blockedIds || [] };
  } catch (error) {
    console.error('[user-blocks] getUserBlocks error:', error);
    return { success: false, error: String(error) };
  }
}
