
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, increment,
} from 'firebase/firestore';
import type {
  CommunityContribution,
  ContributionComment,
  ContributionType,
} from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function contributionFromDoc(id: string, data: Record<string, any>): CommunityContribution {
  return {
    id,
    communityId: data.communityId,
    communityName: data.communityName,
    type: data.type,
    contributorId: data.contributorId,
    contributorName: data.contributorName || 'Anonymous',
    contributorAvatarUrl: data.contributorAvatarUrl,
    title: data.title || '',
    summary: data.summary || '',
    sourceCollection: data.sourceCollection,
    sourceId: data.sourceId,
    content: data.content,
    commentCount: data.commentCount || 0,
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
  };
}

function commentFromDoc(id: string, data: Record<string, any>): ContributionComment {
  return {
    id,
    contributionId: data.contributionId,
    authorId: data.authorId,
    authorName: data.authorName || 'Anonymous',
    authorAvatarUrl: data.authorAvatarUrl,
    content: data.content || '',
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
  };
}

/**
 * Create a contribution — a shared artifact visible only to community members.
 * Also resolves the community name for display convenience.
 */
export async function createContribution(input: {
  communityId: string;
  type: ContributionType;
  contributorId: string;
  contributorName: string;
  contributorAvatarUrl?: string;
  title: string;
  summary: string;
  sourceCollection?: string;
  sourceId?: string;
  content?: Record<string, any>;
}): Promise<ActionResult<string>> {
  try {
    // Resolve community name for display
    let communityName: string | undefined;
    try {
      const commSnap = await getDoc(doc(db, 'communities', input.communityId));
      if (commSnap.exists()) communityName = commSnap.data().name;
    } catch {
      // non-fatal
    }

    const ref = await addDoc(collection(db, 'communityContributions'), {
      communityId: input.communityId,
      communityName: communityName || null,
      type: input.type,
      contributorId: input.contributorId,
      contributorName: input.contributorName,
      contributorAvatarUrl: input.contributorAvatarUrl || null,
      title: input.title,
      summary: input.summary,
      sourceCollection: input.sourceCollection || null,
      sourceId: input.sourceId || null,
      content: input.content || null,
      commentCount: 0,
      createdAt: serverTimestamp(),
    });

    return { success: true, data: ref.id };
  } catch (error) {
    console.error('[contributions] createContribution error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch contributions for a community, newest first. Optional type filter.
 */
export async function getContributions(
  communityId: string,
  options: { type?: ContributionType } = {}
): Promise<ActionResult<CommunityContribution[]>> {
  try {
    const constraints = [where('communityId', '==', communityId)];
    if (options.type) constraints.push(where('type', '==', options.type));

    const q = query(
      collection(db, 'communityContributions'),
      ...constraints,
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((d) => contributionFromDoc(d.id, d.data())),
    };
  } catch (error) {
    console.error('[contributions] getContributions error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch a single contribution by ID.
 */
export async function getContribution(
  contributionId: string
): Promise<ActionResult<CommunityContribution | null>> {
  try {
    const snap = await getDoc(doc(db, 'communityContributions', contributionId));
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: contributionFromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[contributions] getContribution error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a contribution (contributor or community instructor).
 */
export async function deleteContribution(
  contributionId: string,
  requesterId: string
): Promise<ActionResult> {
  try {
    const snap = await getDoc(doc(db, 'communityContributions', contributionId));
    if (!snap.exists()) return { success: false, error: 'Contribution not found.' };
    const data = snap.data();

    let allowed = data.contributorId === requesterId;
    if (!allowed) {
      const commSnap = await getDoc(doc(db, 'communities', data.communityId));
      if (commSnap.exists()) {
        const instructorIds: string[] = commSnap.data().instructorIds || [];
        allowed = instructorIds.includes(requesterId);
      }
    }
    if (!allowed) return { success: false, error: 'Not authorized.' };

    await deleteDoc(doc(db, 'communityContributions', contributionId));
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[contributions] deleteContribution error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Add a comment to a contribution. Bumps the contribution's commentCount.
 */
export async function addContributionComment(input: {
  contributionId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
}): Promise<ActionResult<string>> {
  try {
    if (!input.content.trim()) {
      return { success: false, error: 'Comment cannot be empty.' };
    }

    const ref = await addDoc(
      collection(db, 'communityContributions', input.contributionId, 'comments'),
      {
        contributionId: input.contributionId,
        authorId: input.authorId,
        authorName: input.authorName,
        authorAvatarUrl: input.authorAvatarUrl || null,
        content: input.content.trim(),
        createdAt: serverTimestamp(),
      }
    );

    // Best-effort counter bump
    try {
      await updateDoc(doc(db, 'communityContributions', input.contributionId), {
        commentCount: increment(1),
      });
    } catch {
      // non-fatal
    }

    return { success: true, data: ref.id };
  } catch (error) {
    console.error('[contributions] addContributionComment error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch all comments for a contribution, oldest first.
 */
export async function getContributionComments(
  contributionId: string
): Promise<ActionResult<ContributionComment[]>> {
  try {
    const q = query(
      collection(db, 'communityContributions', contributionId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((d) => commentFromDoc(d.id, d.data())),
    };
  } catch (error) {
    console.error('[contributions] getContributionComments error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a comment (author or community instructor).
 */
export async function deleteContributionComment(
  contributionId: string,
  commentId: string,
  requesterId: string
): Promise<ActionResult> {
  try {
    const commentRef = doc(
      db,
      'communityContributions',
      contributionId,
      'comments',
      commentId
    );
    const commentSnap = await getDoc(commentRef);
    if (!commentSnap.exists()) return { success: false, error: 'Comment not found.' };
    const commentData = commentSnap.data();

    let allowed = commentData.authorId === requesterId;
    if (!allowed) {
      const contribSnap = await getDoc(doc(db, 'communityContributions', contributionId));
      if (contribSnap.exists()) {
        const communityId = contribSnap.data().communityId;
        const commSnap = await getDoc(doc(db, 'communities', communityId));
        if (commSnap.exists()) {
          const instructorIds: string[] = commSnap.data().instructorIds || [];
          allowed = instructorIds.includes(requesterId);
        }
      }
    }
    if (!allowed) return { success: false, error: 'Not authorized.' };

    await deleteDoc(commentRef);
    try {
      await updateDoc(doc(db, 'communityContributions', contributionId), {
        commentCount: increment(-1),
      });
    } catch {
      // non-fatal
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[contributions] deleteContributionComment error:', error);
    return { success: false, error: String(error) };
  }
}
