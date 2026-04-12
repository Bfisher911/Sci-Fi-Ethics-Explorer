'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { requireAdmin } from '@/lib/admin';
import type { SubmittedDilemma, Story, UserProfile } from '@/types';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Fetches all submitted dilemmas with status 'pending', ordered by submittedAt descending.
 */
export async function getPendingDilemmas(): Promise<ActionResult<SubmittedDilemma[]>> {
  try {
    const dilemmasRef = collection(db, 'submittedDilemmas');
    const q = query(
      dilemmasRef,
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const dilemmas: SubmittedDilemma[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      dilemmas.push({
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        theme: data.theme || '',
        authorName: data.authorName || '',
        authorId: data.authorId,
        imageUrl: data.imageUrl,
        imageHint: data.imageHint,
        submittedAt: data.submittedAt?.toDate
          ? data.submittedAt.toDate().toISOString()
          : data.submittedAt,
        status: data.status || 'pending',
      });
    });

    return { success: true, data: dilemmas };
  } catch (error: any) {
    console.error('[admin] Error fetching pending dilemmas:', error);
    return { success: false, error: error.message || 'Failed to fetch pending dilemmas' };
  }
}

/**
 * Approves a submitted dilemma. Requires admin privileges.
 */
export async function approveDilemma(
  dilemmaId: string,
  adminUid: string
): Promise<ActionResult> {
  try {
    await requireAdmin(adminUid);
    const dilemmaRef = doc(db, 'submittedDilemmas', dilemmaId);
    await updateDoc(dilemmaRef, { status: 'approved' });
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] Error approving dilemma:', error);
    return { success: false, error: error.message || 'Failed to approve dilemma' };
  }
}

/**
 * Rejects a submitted dilemma. Requires admin privileges.
 */
export async function rejectDilemma(
  dilemmaId: string,
  adminUid: string
): Promise<ActionResult> {
  try {
    await requireAdmin(adminUid);
    const dilemmaRef = doc(db, 'submittedDilemmas', dilemmaId);
    await updateDoc(dilemmaRef, { status: 'rejected' });
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] Error rejecting dilemma:', error);
    return { success: false, error: error.message || 'Failed to reject dilemma' };
  }
}

/**
 * Fetches all users from the users collection. Admin only.
 */
export async function getAllUsers(
  limitCount: number = 100
): Promise<ActionResult<UserProfile[]>> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(limitCount));
    const snapshot = await getDocs(q);

    const users: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        uid: docSnap.id,
        email: data.email || null,
        displayName: data.displayName || null,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        role: data.role,
        isAdmin: data.isAdmin ?? false,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
        lastUpdated: data.lastUpdated?.toDate
          ? data.lastUpdated.toDate().toISOString()
          : data.lastUpdated,
      });
    });

    return { success: true, data: users };
  } catch (error: any) {
    console.error('[admin] Error fetching users:', error);
    return { success: false, error: error.message || 'Failed to fetch users' };
  }
}

/**
 * Sets or removes admin status for a target user. Requires admin privileges.
 */
export async function setUserAdmin(
  targetUid: string,
  isAdmin: boolean,
  adminUid: string
): Promise<ActionResult> {
  try {
    await requireAdmin(adminUid);
    const userRef = doc(db, 'users', targetUid);
    await updateDoc(userRef, { isAdmin });
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] Error setting user admin status:', error);
    return { success: false, error: error.message || 'Failed to update admin status' };
  }
}

/**
 * Fetches all stories regardless of status. Admin only.
 */
export async function getAllStories(): Promise<ActionResult<Story[]>> {
  try {
    const storiesRef = collection(db, 'stories');
    const snapshot = await getDocs(storiesRef);

    const stories: Story[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      stories.push({
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        genre: data.genre || '',
        theme: data.theme || '',
        author: data.author || '',
        imageUrl: data.imageUrl,
        imageHint: data.imageHint,
        segments: data.segments || [],
        isInteractive: data.isInteractive ?? false,
        estimatedReadingTime: data.estimatedReadingTime || '',
        authorId: data.authorId,
        status: data.status || 'published',
        publishedAt: data.publishedAt?.toDate
          ? data.publishedAt.toDate().toISOString()
          : data.publishedAt,
        viewCount: data.viewCount,
        tags: data.tags,
      });
    });

    return { success: true, data: stories };
  } catch (error: any) {
    console.error('[admin] Error fetching stories:', error);
    return { success: false, error: error.message || 'Failed to fetch stories' };
  }
}
