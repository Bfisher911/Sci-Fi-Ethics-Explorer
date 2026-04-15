'use server';

import { db } from '@/lib/firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { SubmittedDilemma, GlobalVisibility } from '@/types';
import { isUserAdmin } from '@/lib/admin';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Delete a user-submitted dilemma. Only the original author or an admin
 * may delete.
 */
export async function deleteDilemma(
  dilemmaId: string,
  requesterId: string
): Promise<ActionResult<void>> {
  try {
    const ref = doc(db, 'submittedDilemmas', dilemmaId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, error: 'Dilemma not found.' };
    }
    const current = snap.data();
    const admin = await isUserAdmin(requesterId);
    if (current.authorId && current.authorId !== requesterId && !admin) {
      return { success: false, error: 'Not authorized to delete this dilemma.' };
    }
    await deleteDoc(ref);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[dilemmas-user] deleteDilemma error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Toggle global visibility on a submitted dilemma. Only the author or
 * an admin may change it.
 */
export async function setDilemmaVisibility(
  dilemmaId: string,
  requesterId: string,
  visibility: GlobalVisibility
): Promise<ActionResult<void>> {
  try {
    const ref = doc(db, 'submittedDilemmas', dilemmaId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, error: 'Dilemma not found.' };
    }
    const current = snap.data();
    const admin = await isUserAdmin(requesterId);
    if (current.authorId && current.authorId !== requesterId && !admin) {
      return { success: false, error: 'Not authorized.' };
    }
    await updateDoc(ref, {
      globalVisibility: visibility,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[dilemmas-user] setDilemmaVisibility error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update fields on a user-submitted dilemma. Only the author or an admin
 * may update.
 */
export async function updateDilemmaOwned(
  dilemmaId: string,
  requesterId: string,
  data: Partial<SubmittedDilemma>
): Promise<ActionResult<void>> {
  try {
    const ref = doc(db, 'submittedDilemmas', dilemmaId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, error: 'Dilemma not found.' };
    }
    const current = snap.data();
    const admin = await isUserAdmin(requesterId);
    if (current.authorId && current.authorId !== requesterId && !admin) {
      return { success: false, error: 'Not authorized to edit this dilemma.' };
    }
    const { id, ...updateData } = data as any;
    await updateDoc(ref, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[dilemmas-user] updateDilemmaOwned error:', error);
    return { success: false, error: String(error) };
  }
}
