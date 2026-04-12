'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import type { CurriculumPath, CurriculumEnrollment } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function curriculumFromDoc(
  id: string,
  data: Record<string, any>
): CurriculumPath {
  return {
    id,
    title: data.title || '',
    description: data.description || '',
    creatorId: data.creatorId || '',
    creatorName: data.creatorName || '',
    isPublic: data.isPublic ?? true,
    modules: data.modules || [],
    enrollmentCount: data.enrollmentCount || 0,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

/**
 * Fetch all public curricula ordered by creation date.
 */
export async function getCurricula(): Promise<ActionResult<CurriculumPath[]>> {
  try {
    const q = query(
      collection(db, 'curricula'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const curricula = snapshot.docs.map((d) =>
      curriculumFromDoc(d.id, d.data())
    );
    return { success: true, data: curricula };
  } catch (error) {
    console.error('[curriculum] getCurricula error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch a single curriculum by ID.
 */
export async function getCurriculumById(
  id: string
): Promise<ActionResult<CurriculumPath | null>> {
  try {
    const snap = await getDoc(doc(db, 'curricula', id));
    if (!snap.exists()) {
      return { success: true, data: null };
    }
    return { success: true, data: curriculumFromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[curriculum] getCurriculumById error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Create a new curriculum path.
 */
export async function createCurriculum(
  data: Omit<CurriculumPath, 'id'>
): Promise<ActionResult<string>> {
  try {
    const docRef = await addDoc(collection(db, 'curricula'), {
      ...data,
      enrollmentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: docRef.id };
  } catch (error) {
    console.error('[curriculum] createCurriculum error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update an existing curriculum.
 */
export async function updateCurriculum(
  id: string,
  data: Partial<CurriculumPath>
): Promise<ActionResult<undefined>> {
  try {
    const { id: _id, ...updateData } = data as any;
    await updateDoc(doc(db, 'curricula', id), {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[curriculum] updateCurriculum error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Enroll a user in a curriculum.
 */
export async function enrollInCurriculum(
  curriculumId: string,
  userId: string
): Promise<ActionResult<undefined>> {
  try {
    const enrollRef = doc(
      db,
      'curricula',
      curriculumId,
      'enrollments',
      userId
    );
    const enrollment: CurriculumEnrollment = {
      userId,
      curriculumId,
      completedItemIds: [],
      enrolledAt: serverTimestamp() as any,
      lastActivity: serverTimestamp() as any,
    };
    await setDoc(enrollRef, enrollment);

    // Increment enrollment count on the curriculum doc
    await updateDoc(doc(db, 'curricula', curriculumId), {
      enrollmentCount: increment(1),
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[curriculum] enrollInCurriculum error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch enrollment for a specific user and curriculum.
 */
export async function getEnrollment(
  curriculumId: string,
  userId: string
): Promise<ActionResult<CurriculumEnrollment | null>> {
  try {
    const snap = await getDoc(
      doc(db, 'curricula', curriculumId, 'enrollments', userId)
    );
    if (!snap.exists()) {
      return { success: true, data: null };
    }
    const data = snap.data();
    return {
      success: true,
      data: {
        userId: data.userId,
        curriculumId: data.curriculumId,
        completedItemIds: data.completedItemIds || [],
        enrolledAt: timestampToDate(data.enrolledAt),
        lastActivity: timestampToDate(data.lastActivity),
      },
    };
  } catch (error) {
    console.error('[curriculum] getEnrollment error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Mark an item as completed in a user's enrollment.
 */
export async function updateEnrollmentProgress(
  curriculumId: string,
  userId: string,
  completedItemId: string
): Promise<ActionResult<undefined>> {
  try {
    const enrollRef = doc(
      db,
      'curricula',
      curriculumId,
      'enrollments',
      userId
    );
    await updateDoc(enrollRef, {
      completedItemIds: arrayUnion(completedItemId),
      lastActivity: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[curriculum] updateEnrollmentProgress error:', error);
    return { success: false, error: String(error) };
  }
}
