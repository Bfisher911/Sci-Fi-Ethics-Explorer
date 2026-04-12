'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import type { DiscussionComment } from '@/types';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Adds a comment to a story's discussion thread.
 */
export async function addComment(data: {
  storyId: string;
  authorId: string;
  authorName: string;
  content: string;
  parentCommentId?: string;
}): Promise<ActionResult<string>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }
  if (!data.storyId || !data.authorId || !data.content.trim()) {
    return { success: false, error: 'Story ID, author ID, and content are required.' };
  }

  try {
    const commentData = {
      storyId: data.storyId,
      authorId: data.authorId,
      authorName: data.authorName,
      content: data.content.trim(),
      parentCommentId: data.parentCommentId || null,
      upvotes: 0,
      status: 'active' as const,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, 'stories', data.storyId, 'comments'),
      commentData
    );
    return { success: true, data: docRef.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] addComment error:', message);
    return { success: false, error: `Could not add comment. ${message}` };
  }
}

/**
 * Fetches all comments for a story, ordered by creation time.
 */
export async function getComments(
  storyId: string
): Promise<ActionResult<DiscussionComment[]>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }
  if (!storyId) {
    return { success: false, error: 'Story ID is required.' };
  }

  try {
    const q = query(
      collection(db, 'stories', storyId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    const comments: DiscussionComment[] = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        storyId: d.storyId,
        authorId: d.authorId,
        authorName: d.authorName,
        avatarUrl: d.avatarUrl,
        content: d.content,
        parentCommentId: d.parentCommentId || undefined,
        upvotes: d.upvotes ?? 0,
        createdAt: d.createdAt?.toDate?.() ?? new Date(),
        status: d.status ?? 'active',
      } as DiscussionComment;
    });
    return { success: true, data: comments };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] getComments error:', message);
    return { success: false, error: `Could not fetch comments. ${message}` };
  }
}

/**
 * Increments the upvote count on a comment.
 */
export async function upvoteComment(
  storyId: string,
  commentId: string
): Promise<ActionResult<undefined>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const commentRef = doc(db, 'stories', storyId, 'comments', commentId);
    await updateDoc(commentRef, { upvotes: increment(1) });
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] upvoteComment error:', message);
    return { success: false, error: `Could not upvote comment. ${message}` };
  }
}

/**
 * Flags a comment for moderation.
 */
export async function flagComment(
  storyId: string,
  commentId: string
): Promise<ActionResult<undefined>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const commentRef = doc(db, 'stories', storyId, 'comments', commentId);
    await updateDoc(commentRef, { status: 'flagged' });
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] flagComment error:', message);
    return { success: false, error: `Could not flag comment. ${message}` };
  }
}
