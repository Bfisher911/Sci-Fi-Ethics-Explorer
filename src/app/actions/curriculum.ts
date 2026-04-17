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
    isTemplate: data.isTemplate ?? false,
    isOfficial: data.isOfficial ?? false,
    clonedFrom: data.clonedFrom,
    certificate: data.certificate,
    modules: data.modules || [],
    enrollmentCount: data.enrollmentCount || 0,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

// validateCurriculum moved to src/lib/curriculum-validation.ts so it can be
// imported by client components without requiring a server-action context.

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
    const firestoreCurricula = snapshot.docs.map((d) =>
      curriculumFromDoc(d.id, d.data())
    );

    // Merge preset + official learning paths that haven't been seeded
    // into Firestore. Official paths are prepended so they float to the
    // top of the listing where curated content belongs.
    const { presetCurricula } = await import('@/data/preset-curricula');
    const { officialLearningPaths } = await import(
      '@/data/official-learning-paths'
    );
    const existingIds = new Set(firestoreCurricula.map((c) => c.id));
    const merged = [
      ...officialLearningPaths.filter((p) => !existingIds.has(p.id)),
      ...firestoreCurricula,
      ...presetCurricula.filter((p) => !existingIds.has(p.id)),
    ];

    return { success: true, data: merged };
  } catch (error) {
    console.error('[curriculum] getCurricula error, falling back to presets:', error);
    const { presetCurricula } = await import('@/data/preset-curricula');
    const { officialLearningPaths } = await import(
      '@/data/official-learning-paths'
    );
    return {
      success: true,
      data: [...officialLearningPaths, ...presetCurricula],
    };
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
    if (snap.exists()) {
      return { success: true, data: curriculumFromDoc(snap.id, snap.data()) };
    }
    // Fallback to preset + official curricula
    const { presetCurricula } = await import('@/data/preset-curricula');
    const { officialLearningPaths } = await import(
      '@/data/official-learning-paths'
    );
    const preset =
      officialLearningPaths.find((c) => c.id === id) ||
      presetCurricula.find((c) => c.id === id) ||
      null;
    return { success: true, data: preset };
  } catch (error) {
    console.error('[curriculum] getCurriculumById error:', error);
    const { presetCurricula } = await import('@/data/preset-curricula');
    const { officialLearningPaths } = await import(
      '@/data/official-learning-paths'
    );
    const preset =
      officialLearningPaths.find((c) => c.id === id) ||
      presetCurricula.find((c) => c.id === id) ||
      null;
    return { success: true, data: preset };
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
 *
 * Authorization: only the original creator OR a platform admin may
 * edit. Pass `requesterId` so the server can enforce this regardless
 * of what the client sends. Backwards-compatible: omitting requesterId
 * still works for legacy callers (system seed scripts).
 */
export async function updateCurriculum(
  id: string,
  data: Partial<CurriculumPath>,
  requesterId?: string
): Promise<ActionResult<undefined>> {
  try {
    if (requesterId) {
      const ref = doc(db, 'curricula', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return { success: false, error: 'Curriculum not found.' };
      }
      const current = snap.data();
      const { isUserAdmin } = await import('@/lib/admin');
      const admin = await isUserAdmin(requesterId);
      if (current.creatorId !== requesterId && !admin) {
        return { success: false, error: 'Not authorized to edit this curriculum.' };
      }
    }
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
 * Mark an item as completed in a user's enrollment. Also writes to the
 * top-level `curriculumProgress` collection (composite ID) for analytics.
 */
export async function updateEnrollmentProgress(
  curriculumId: string,
  userId: string,
  completedItemId: string,
  options: { secondsSpent?: number } = {}
): Promise<ActionResult<undefined>> {
  try {
    const enrollRef = doc(db, 'curricula', curriculumId, 'enrollments', userId);
    await setDoc(enrollRef, {
      userId, curriculumId,
      completedItemIds: arrayUnion(completedItemId),
      lastActivity: serverTimestamp(),
    }, { merge: true });

    // Also append to top-level curriculumProgress for the dashboard
    const progressId = `${userId}_${curriculumId}`;
    const progressRef = doc(db, 'curriculumProgress', progressId);
    const updates: Record<string, any> = {
      userId, curriculumId,
      completedItemIds: arrayUnion(completedItemId),
      [`itemCompletedAt.${completedItemId}`]: serverTimestamp(),
    };
    if (options.secondsSpent !== undefined) {
      updates[`itemTimeSpent.${completedItemId}`] = options.secondsSpent;
    }
    await setDoc(progressRef, {
      startedAt: serverTimestamp(),
      ...updates,
    }, { merge: true });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[curriculum] updateEnrollmentProgress error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Clone an existing curriculum into a new one owned by the cloner.
 * Useful for "Save as Template" / "Duplicate" workflows.
 */
export async function cloneCurriculum(
  sourceId: string,
  newOwnerId: string,
  newOwnerName: string
): Promise<ActionResult<string>> {
  try {
    const snap = await getDoc(doc(db, 'curricula', sourceId));
    if (!snap.exists()) return { success: false, error: 'Source curriculum not found.' };

    const source = snap.data();
    const cloned = await addDoc(collection(db, 'curricula'), {
      title: `${source.title} (Copy)`,
      description: source.description || '',
      creatorId: newOwnerId,
      creatorName: newOwnerName,
      isPublic: false,
      isTemplate: false,
      clonedFrom: sourceId,
      modules: source.modules || [],
      enrollmentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: cloned.id };
  } catch (error) {
    console.error('[curriculum] cloneCurriculum error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get aggregate progress across all enrolled users for a curriculum.
 * Used by the creator's progress dashboard.
 */
export async function getCurriculumProgressAggregate(
  curriculumId: string
): Promise<ActionResult<{
  enrolled: number;
  completed: number;
  averageItemsCompleted: number;
  itemCompletionCounts: Record<string, number>;
  perUser: { userId: string; itemsCompleted: number }[];
}>> {
  try {
    const enrollSnap = await getDocs(collection(db, 'curricula', curriculumId, 'enrollments'));
    const curriculumSnap = await getDoc(doc(db, 'curricula', curriculumId));
    const curriculum = curriculumSnap.exists() ? curriculumFromDoc(curriculumSnap.id, curriculumSnap.data()) : null;
    const totalItems = curriculum?.modules.reduce((s, m) => s + (m.items?.length || 0), 0) || 0;

    const itemCompletionCounts: Record<string, number> = {};
    const perUser: { userId: string; itemsCompleted: number }[] = [];
    let completed = 0;
    let totalCompletedItems = 0;

    enrollSnap.docs.forEach((d) => {
      const data = d.data();
      const items: string[] = data.completedItemIds || [];
      perUser.push({ userId: data.userId, itemsCompleted: items.length });
      totalCompletedItems += items.length;
      items.forEach((id) => {
        itemCompletionCounts[id] = (itemCompletionCounts[id] || 0) + 1;
      });
      if (totalItems > 0 && items.length >= totalItems) completed++;
    });

    return {
      success: true,
      data: {
        enrolled: enrollSnap.size,
        completed,
        averageItemsCompleted: enrollSnap.size > 0 ? totalCompletedItems / enrollSnap.size : 0,
        itemCompletionCounts,
        perUser,
      },
    };
  } catch (error) {
    console.error('[curriculum] getCurriculumProgressAggregate error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a curriculum (creator or admin).
 */
export async function deleteCurriculum(
  curriculumId: string,
  requesterId: string
): Promise<ActionResult<void>> {
  try {
    const ref = doc(db, 'curricula', curriculumId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Curriculum not found.' };
    const current = snap.data();
    const { isUserAdmin } = await import('@/lib/admin');
    const admin = await isUserAdmin(requesterId);
    if (current.creatorId !== requesterId && !admin) {
      return { success: false, error: 'Not authorized.' };
    }
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(ref);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[curriculum] deleteCurriculum error:', error);
    return { success: false, error: String(error) };
  }
}
