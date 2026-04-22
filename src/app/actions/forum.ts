'use server';

/**
 * Community forum — topic + reply server actions.
 *
 * Data model:
 *   communities/{cid}/forumTopics/{tid}
 *   communities/{cid}/forumTopics/{tid}/replies/{rid}
 *
 * For media discussion boards (same shape, scoped to a media item),
 * topics carry `mediaId` and are queried with that filter. The reply
 * subcollection is identical — a reply does not care whether its
 * parent topic was a community forum topic or a media discussion.
 *
 * Authority:
 *   - Anyone who is a member of the community may create a non-pinned
 *     topic and may reply to an unlocked topic.
 *   - Only a super-admin or a user with `communityManager: true` may
 *     create a pinned topic, edit the `pinned`/`locked` flags on an
 *     existing topic, or soft-remove a reply.
 *   - All mutations route through server actions; the client cannot
 *     set pinned/locked directly.
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { isSuperAdminEmail } from '@/lib/super-admins';
import type { ForumTopic, ForumReply } from '@/types';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Look up the requester's email + communityManager flag in one read so
 * both the super-admin override and the per-user role can decide gating.
 */
async function resolveRequesterAuthority(
  requesterId: string
): Promise<{ email: string | null; isManager: boolean; displayName: string; avatarUrl?: string }> {
  if (!requesterId) {
    return { email: null, isManager: false, displayName: 'Anonymous' };
  }
  const snap = await getDoc(doc(db, 'users', requesterId));
  if (!snap.exists()) {
    return { email: null, isManager: false, displayName: 'Anonymous' };
  }
  const data = snap.data();
  const email: string | null = data?.email || null;
  const isManager =
    isSuperAdminEmail(email) || data?.communityManager === true;
  const displayName: string =
    data?.displayName ||
    [data?.firstName, data?.lastName].filter(Boolean).join(' ') ||
    email ||
    'Member';
  return { email, isManager, displayName, avatarUrl: data?.avatarUrl };
}

/**
 * Is the requester a member of the given community? Membership is
 * stored as `memberIds` / `instructorIds` arrays on the community
 * doc itself.
 */
async function isCommunityMember(
  communityId: string,
  requesterId: string
): Promise<boolean> {
  if (!communityId || !requesterId) return false;
  try {
    const snap = await getDoc(doc(db, 'communities', communityId));
    if (!snap.exists()) return false;
    const data = snap.data();
    return (
      (data?.memberIds || []).includes(requesterId) ||
      (data?.instructorIds || []).includes(requesterId)
    );
  } catch {
    return false;
  }
}

function topicFromDoc(id: string, data: Record<string, any>): ForumTopic {
  return {
    id,
    communityId: data.communityId,
    mediaId: data.mediaId || undefined,
    title: data.title || '',
    body: data.body || '',
    authorId: data.authorId,
    authorName: data.authorName || 'Member',
    authorAvatarUrl: data.authorAvatarUrl,
    pinned: data.pinned === true,
    locked: data.locked === true,
    replyCount: data.replyCount || 0,
    lastReplyAt: timestampToDate(data.lastReplyAt),
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

function replyFromDoc(id: string, data: Record<string, any>): ForumReply {
  return {
    id,
    topicId: data.topicId,
    communityId: data.communityId,
    body: data.body || '',
    authorId: data.authorId,
    authorName: data.authorName || 'Member',
    authorAvatarUrl: data.authorAvatarUrl,
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
    removedByManagerId: data.removedByManagerId || undefined,
    removedAt: timestampToDate(data.removedAt),
    removalReason: data.removalReason || undefined,
  };
}

// ─── Topic creation ─────────────────────────────────────────────────

export async function createForumTopic(input: {
  communityId: string;
  requesterId: string;
  title: string;
  body: string;
  /** When true, the requester is asking for a pinned topic. Only
   *  super-admins and community managers may pin. Non-managers with
   *  this flag set receive an authorization error rather than a
   *  silent downgrade. */
  pinned?: boolean;
  /** When set, this creates a topic inside a media discussion board
   *  rather than the general community forum. */
  mediaId?: string;
}): Promise<ActionResult<ForumTopic>> {
  try {
    if (!input.communityId) return { success: false, error: 'Missing communityId.' };
    if (!input.requesterId) return { success: false, error: 'Not signed in.' };
    if (!input.title.trim()) return { success: false, error: 'A title is required.' };
    if (!input.body.trim()) return { success: false, error: 'A body is required.' };

    const authority = await resolveRequesterAuthority(input.requesterId);
    const member = await isCommunityMember(input.communityId, input.requesterId);
    if (!member && !authority.isManager) {
      return {
        success: false,
        error: 'Only community members can post in this forum.',
      };
    }
    if (input.pinned === true && !authority.isManager) {
      return {
        success: false,
        error: 'Only community managers can create pinned topics.',
      };
    }

    const ref = await addDoc(
      collection(db, 'communities', input.communityId, 'forumTopics'),
      {
        communityId: input.communityId,
        mediaId: input.mediaId || null,
        title: input.title.trim(),
        body: input.body.trim(),
        authorId: input.requesterId,
        authorName: authority.displayName,
        authorAvatarUrl: authority.avatarUrl || null,
        pinned: input.pinned === true && authority.isManager,
        locked: false,
        replyCount: 0,
        createdAt: serverTimestamp(),
      }
    );
    const created = await getDoc(ref);
    return { success: true, data: topicFromDoc(created.id, created.data() || {}) };
  } catch (err: any) {
    console.error('[forum] createForumTopic error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

// ─── Topic listing ──────────────────────────────────────────────────

/**
 * List topics in a community forum (or in a media discussion board).
 *
 * Pinned topics are returned first, then ordered by lastReplyAt desc
 * (falling back to createdAt for untouched topics).
 */
export async function listForumTopics(input: {
  communityId: string;
  /** When set, returns only topics attached to that media item
   *  (i.e. the per-media discussion board). When unset, returns only
   *  topics with no mediaId (the general community forum). */
  mediaId?: string | null;
  max?: number;
}): Promise<ActionResult<ForumTopic[]>> {
  try {
    if (!input.communityId) return { success: false, error: 'Missing communityId.' };
    const max = input.max ?? 50;
    const col = collection(db, 'communities', input.communityId, 'forumTopics');

    // Firestore requires strict equality on mediaId for the filtered
    // variant; the general-forum case filters by absence, which we do
    // client-side to avoid requiring a composite index for a
    // single-collection null check.
    const snap = await getDocs(query(col, orderBy('createdAt', 'desc'), limit(max * 2)));
    const all = snap.docs.map((d) => topicFromDoc(d.id, d.data()));
    const filtered = all.filter((t) =>
      input.mediaId
        ? t.mediaId === input.mediaId
        : !t.mediaId
    );

    // Sort: pinned first, then most-recent activity.
    filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const at =
        (a.lastReplyAt instanceof Date ? a.lastReplyAt.getTime() : 0) ||
        (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
      const bt =
        (b.lastReplyAt instanceof Date ? b.lastReplyAt.getTime() : 0) ||
        (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
      return bt - at;
    });

    return { success: true, data: filtered.slice(0, max) };
  } catch (err: any) {
    console.error('[forum] listForumTopics error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function getForumTopic(
  communityId: string,
  topicId: string
): Promise<ActionResult<ForumTopic | null>> {
  try {
    const snap = await getDoc(
      doc(db, 'communities', communityId, 'forumTopics', topicId)
    );
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: topicFromDoc(snap.id, snap.data()) };
  } catch (err: any) {
    console.error('[forum] getForumTopic error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

// ─── Topic moderation (manager-only) ────────────────────────────────

export async function setTopicPinned(input: {
  communityId: string;
  topicId: string;
  pinned: boolean;
  requesterId: string;
}): Promise<ActionResult<void>> {
  try {
    const authority = await resolveRequesterAuthority(input.requesterId);
    if (!authority.isManager) {
      return { success: false, error: 'Only community managers can pin topics.' };
    }
    await updateDoc(
      doc(db, 'communities', input.communityId, 'forumTopics', input.topicId),
      { pinned: input.pinned, updatedAt: serverTimestamp() }
    );
    return { success: true, data: undefined };
  } catch (err: any) {
    console.error('[forum] setTopicPinned error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function setTopicLocked(input: {
  communityId: string;
  topicId: string;
  locked: boolean;
  requesterId: string;
}): Promise<ActionResult<void>> {
  try {
    const authority = await resolveRequesterAuthority(input.requesterId);
    if (!authority.isManager) {
      return { success: false, error: 'Only community managers can lock topics.' };
    }
    await updateDoc(
      doc(db, 'communities', input.communityId, 'forumTopics', input.topicId),
      { locked: input.locked, updatedAt: serverTimestamp() }
    );
    return { success: true, data: undefined };
  } catch (err: any) {
    console.error('[forum] setTopicLocked error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

// ─── Replies ────────────────────────────────────────────────────────

export async function createForumReply(input: {
  communityId: string;
  topicId: string;
  body: string;
  requesterId: string;
}): Promise<ActionResult<ForumReply>> {
  try {
    if (!input.body.trim()) return { success: false, error: 'Reply body is required.' };

    const authority = await resolveRequesterAuthority(input.requesterId);
    const member = await isCommunityMember(input.communityId, input.requesterId);
    if (!member && !authority.isManager) {
      return {
        success: false,
        error: 'Only community members can reply in this forum.',
      };
    }

    // Load topic to check lock state.
    const topicRef = doc(
      db,
      'communities',
      input.communityId,
      'forumTopics',
      input.topicId
    );
    const topicSnap = await getDoc(topicRef);
    if (!topicSnap.exists()) return { success: false, error: 'Topic not found.' };
    if (topicSnap.data()?.locked === true && !authority.isManager) {
      return {
        success: false,
        error: 'This topic is locked. Only managers can reply.',
      };
    }

    const replyRef = await addDoc(collection(topicRef, 'replies'), {
      topicId: input.topicId,
      communityId: input.communityId,
      body: input.body.trim(),
      authorId: input.requesterId,
      authorName: authority.displayName,
      authorAvatarUrl: authority.avatarUrl || null,
      createdAt: serverTimestamp(),
    });

    // Bump the topic's replyCount + lastReplyAt so listings sort by
    // activity without a subcollection aggregation query.
    await updateDoc(topicRef, {
      replyCount: increment(1),
      lastReplyAt: serverTimestamp(),
    });

    const created = await getDoc(replyRef);
    return { success: true, data: replyFromDoc(created.id, created.data() || {}) };
  } catch (err: any) {
    console.error('[forum] createForumReply error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function listForumReplies(input: {
  communityId: string;
  topicId: string;
  max?: number;
}): Promise<ActionResult<ForumReply[]>> {
  try {
    const max = input.max ?? 200;
    const col = collection(
      db,
      'communities',
      input.communityId,
      'forumTopics',
      input.topicId,
      'replies'
    );
    const snap = await getDocs(query(col, orderBy('createdAt', 'asc'), limit(max)));
    return {
      success: true,
      data: snap.docs.map((d) => replyFromDoc(d.id, d.data())),
    };
  } catch (err: any) {
    console.error('[forum] listForumReplies error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Soft-remove a reply. Manager-only. Preserves the document so
 * threading stays coherent but scrubs the body.
 */
export async function removeForumReply(input: {
  communityId: string;
  topicId: string;
  replyId: string;
  requesterId: string;
  reason?: string;
}): Promise<ActionResult<void>> {
  try {
    const authority = await resolveRequesterAuthority(input.requesterId);
    if (!authority.isManager) {
      return { success: false, error: 'Only community managers can remove replies.' };
    }
    await updateDoc(
      doc(
        db,
        'communities',
        input.communityId,
        'forumTopics',
        input.topicId,
        'replies',
        input.replyId
      ),
      {
        body: '[removed by a community manager]',
        removedByManagerId: input.requesterId,
        removedAt: serverTimestamp(),
        removalReason: input.reason || null,
      }
    );
    return { success: true, data: undefined };
  } catch (err: any) {
    console.error('[forum] removeForumReply error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}
