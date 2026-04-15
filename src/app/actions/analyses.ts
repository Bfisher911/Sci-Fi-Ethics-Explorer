
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import type { SavedAnalysis, GlobalVisibility } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { isUserAdmin } from '@/lib/admin';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function fromDoc(id: string, data: Record<string, any>): SavedAnalysis {
  return {
    id,
    authorId: data.authorId,
    authorName: data.authorName || 'Anonymous',
    scenarioText: data.scenarioText || '',
    ethicalDilemmas: data.ethicalDilemmas || [],
    potentialConsequences: data.potentialConsequences || [],
    applicableEthicalTheories: data.applicableEthicalTheories || [],
    globalVisibility: data.globalVisibility || 'private',
    status: data.status || 'published',
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export async function createAnalysis(input: Omit<SavedAnalysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<string>> {
  try {
    const ref = await addDoc(collection(db, 'analyses'), {
      ...input,
      globalVisibility: input.globalVisibility || 'private',
      status: input.status || 'published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: ref.id };
  } catch (error) {
    console.error('[analyses] createAnalysis error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getUserAnalyses(authorId: string): Promise<ActionResult<SavedAnalysis[]>> {
  try {
    const q = query(
      collection(db, 'analyses'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => fromDoc(d.id, d.data())) };
  } catch (error) {
    console.error('[analyses] getUserAnalyses error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getPublicAnalyses(): Promise<ActionResult<SavedAnalysis[]>> {
  try {
    const q = query(
      collection(db, 'analyses'),
      where('globalVisibility', '==', 'public'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => fromDoc(d.id, d.data())) };
  } catch (error) {
    console.error('[analyses] getPublicAnalyses error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getAnalysis(id: string): Promise<ActionResult<SavedAnalysis | null>> {
  try {
    const snap = await getDoc(doc(db, 'analyses', id));
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: fromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[analyses] getAnalysis error:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateAnalysisOwned(
  id: string,
  requesterId: string,
  data: Partial<SavedAnalysis>
): Promise<ActionResult<void>> {
  try {
    const ref = doc(db, 'analyses', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Analysis not found.' };
    const current = snap.data();
    const admin = await isUserAdmin(requesterId);
    if (current.authorId !== requesterId && !admin) {
      return { success: false, error: 'Not authorized.' };
    }
    const { id: _, ...update } = data as any;
    await updateDoc(ref, { ...update, updatedAt: serverTimestamp() });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[analyses] updateAnalysisOwned error:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteAnalysis(id: string, requesterId: string): Promise<ActionResult<void>> {
  try {
    const ref = doc(db, 'analyses', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Analysis not found.' };
    const current = snap.data();
    const admin = await isUserAdmin(requesterId);
    if (current.authorId !== requesterId && !admin) {
      return { success: false, error: 'Not authorized.' };
    }
    await deleteDoc(ref);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[analyses] deleteAnalysis error:', error);
    return { success: false, error: String(error) };
  }
}

export async function setAnalysisVisibility(
  id: string,
  requesterId: string,
  visibility: GlobalVisibility
): Promise<ActionResult<void>> {
  return updateAnalysisOwned(id, requesterId, { globalVisibility: visibility });
}
