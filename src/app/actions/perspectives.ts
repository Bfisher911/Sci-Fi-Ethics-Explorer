
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import type { SavedPerspective, GlobalVisibility } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { isUserAdmin } from '@/lib/admin';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function fromDoc(id: string, data: Record<string, any>): SavedPerspective {
  return {
    id,
    authorId: data.authorId,
    authorName: data.authorName || 'Anonymous',
    scenario: data.scenario || '',
    userChoice: data.userChoice || '',
    comparisons: data.comparisons || [],
    synthesis: data.synthesis || '',
    globalVisibility: data.globalVisibility || 'private',
    status: data.status || 'published',
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export async function createPerspective(input: Omit<SavedPerspective, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<string>> {
  try {
    const ref = await addDoc(collection(db, 'perspectives'), {
      ...input,
      globalVisibility: input.globalVisibility || 'private',
      status: input.status || 'published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: ref.id };
  } catch (error) {
    console.error('[perspectives] createPerspective error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getUserPerspectives(authorId: string): Promise<ActionResult<SavedPerspective[]>> {
  try {
    const q = query(
      collection(db, 'perspectives'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => fromDoc(d.id, d.data())) };
  } catch (error) {
    console.error('[perspectives] getUserPerspectives error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getPublicPerspectives(): Promise<ActionResult<SavedPerspective[]>> {
  try {
    const q = query(
      collection(db, 'perspectives'),
      where('globalVisibility', '==', 'public'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => fromDoc(d.id, d.data())) };
  } catch (error) {
    console.error('[perspectives] getPublicPerspectives error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getPerspective(id: string): Promise<ActionResult<SavedPerspective | null>> {
  try {
    const snap = await getDoc(doc(db, 'perspectives', id));
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: fromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[perspectives] getPerspective error:', error);
    return { success: false, error: String(error) };
  }
}

export async function updatePerspectiveOwned(
  id: string,
  requesterId: string,
  data: Partial<SavedPerspective>
): Promise<ActionResult<void>> {
  try {
    const ref = doc(db, 'perspectives', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Perspective not found.' };
    const current = snap.data();
    const admin = await isUserAdmin(requesterId);
    if (current.authorId !== requesterId && !admin) {
      return { success: false, error: 'Not authorized.' };
    }
    const { id: _, ...update } = data as any;
    await updateDoc(ref, { ...update, updatedAt: serverTimestamp() });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[perspectives] updatePerspectiveOwned error:', error);
    return { success: false, error: String(error) };
  }
}

export async function deletePerspective(id: string, requesterId: string): Promise<ActionResult<void>> {
  try {
    const ref = doc(db, 'perspectives', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Perspective not found.' };
    const current = snap.data();
    const admin = await isUserAdmin(requesterId);
    if (current.authorId !== requesterId && !admin) {
      return { success: false, error: 'Not authorized.' };
    }
    await deleteDoc(ref);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[perspectives] deletePerspective error:', error);
    return { success: false, error: String(error) };
  }
}

export async function setPerspectiveVisibility(
  id: string,
  requesterId: string,
  visibility: GlobalVisibility
): Promise<ActionResult<void>> {
  return updatePerspectiveOwned(id, requesterId, { globalVisibility: visibility });
}
