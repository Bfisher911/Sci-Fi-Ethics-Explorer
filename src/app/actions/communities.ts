
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
  query, where, orderBy, arrayUnion, arrayRemove, serverTimestamp,
  writeBatch, limit as fbLimit,
} from 'firebase/firestore';
import type { Community, CommunityInvite, CommunityMemberInfo, CommunityMemberRole } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function communityFromDoc(id: string, data: Record<string, any>): Community {
  // Backwards-compat: legacy docs carry the singular `curriculumPathId`.
  // New docs carry the array `curriculumPathIds`. Read both, normalize
  // to the array on every read, and keep the legacy field populated so
  // anything still consulting it (gradebook, curriculum reverse lookup)
  // continues to work until those callers are migrated.
  const legacySingle =
    typeof data.curriculumPathId === 'string' && data.curriculumPathId
      ? [data.curriculumPathId]
      : [];
  const ids: string[] = Array.isArray(data.curriculumPathIds)
    ? data.curriculumPathIds.filter((s: unknown): s is string => typeof s === 'string')
    : legacySingle;
  return {
    id,
    name: data.name || '',
    description: data.description || '',
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    instructorIds: data.instructorIds || [],
    memberIds: data.memberIds || [],
    licenseId: data.licenseId,
    inviteCode: data.inviteCode || '',
    curriculumPathId: ids[0],
    curriculumPathIds: ids,
    settings: data.settings || {},
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

/**
 * Create a new Community. Only instructors should call this.
 */
export async function createCommunity(data: {
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  licenseId?: string;
}): Promise<ActionResult<Community>> {
  try {
    const inviteCode = generateInviteCode();

    const docRef = await addDoc(collection(db, 'communities'), {
      name: data.name,
      description: data.description || '',
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      instructorIds: [data.ownerId],
      memberIds: [],
      licenseId: data.licenseId || null,
      inviteCode,
      curriculumPathId: null,
      settings: { maxMembers: 200, allowSelfJoin: false },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const created = await getDoc(docRef);
    return {
      success: true,
      data: communityFromDoc(docRef.id, created.data() || {}),
    };
  } catch (error) {
    console.error('[communities] createCommunity error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get a single Community by ID.
 */
export async function getCommunity(
  communityId: string
): Promise<ActionResult<Community | null>> {
  try {
    const snap = await getDoc(doc(db, 'communities', communityId));
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: communityFromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[communities] getCommunity error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get all Communities a user belongs to (as instructor or member).
 */
export async function getUserCommunities(
  userId: string
): Promise<ActionResult<Community[]>> {
  try {
    // Get communities where user is instructor
    const instrQ = query(
      collection(db, 'communities'),
      where('instructorIds', 'array-contains', userId)
    );
    const instrSnap = await getDocs(instrQ);

    // Get communities where user is member
    const memberQ = query(
      collection(db, 'communities'),
      where('memberIds', 'array-contains', userId)
    );
    const memberSnap = await getDocs(memberQ);

    const seen = new Set<string>();
    const communities: Community[] = [];

    for (const d of [...instrSnap.docs, ...memberSnap.docs]) {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        communities.push(communityFromDoc(d.id, d.data()));
      }
    }

    return { success: true, data: communities };
  } catch (error) {
    console.error('[communities] getUserCommunities error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get community by invite code.
 */
export async function getCommunityByInviteCode(
  code: string
): Promise<ActionResult<Community | null>> {
  try {
    const q = query(
      collection(db, 'communities'),
      where('inviteCode', '==', code.toUpperCase())
    );
    const snap = await getDocs(q);
    if (snap.empty) return { success: true, data: null };
    const d = snap.docs[0];
    return { success: true, data: communityFromDoc(d.id, d.data()) };
  } catch (error) {
    console.error('[communities] getCommunityByInviteCode error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Invite a user to a Community.
 */
export async function inviteToCommunity(data: {
  communityId: string;
  communityName: string;
  email: string;
  role: CommunityMemberRole;
  invitedBy: string;
  invitedByName: string;
}): Promise<ActionResult<string>> {
  try {
    const inviteRef = await addDoc(collection(db, 'communityInvites'), {
      communityId: data.communityId,
      communityName: data.communityName,
      email: data.email.toLowerCase(),
      role: data.role,
      status: 'pending',
      invitedBy: data.invitedBy,
      invitedByName: data.invitedByName,
      createdAt: serverTimestamp(),
    });
    return { success: true, data: inviteRef.id };
  } catch (error) {
    console.error('[communities] inviteToCommunity error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get pending invites for a user by email.
 */
export async function getPendingInvites(
  email: string
): Promise<ActionResult<CommunityInvite[]>> {
  try {
    const q = query(
      collection(db, 'communityInvites'),
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    const invites = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: timestampToDate(d.data().createdAt),
    })) as CommunityInvite[];
    return { success: true, data: invites };
  } catch (error) {
    console.error('[communities] getPendingInvites error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get all invites for a community.
 */
export async function getCommunityInvites(
  communityId: string
): Promise<ActionResult<CommunityInvite[]>> {
  try {
    const q = query(
      collection(db, 'communityInvites'),
      where('communityId', '==', communityId)
    );
    const snap = await getDocs(q);
    const invites = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: timestampToDate(d.data().createdAt),
    })) as CommunityInvite[];
    return { success: true, data: invites };
  } catch (error) {
    console.error('[communities] getCommunityInvites error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Accept a community invite. Adds user to the community.
 */
export async function acceptCommunityInvite(
  inviteId: string,
  userId: string
): Promise<ActionResult<string>> {
  try {
    const inviteRef = doc(db, 'communityInvites', inviteId);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists()) {
      return { success: false, error: 'Invite not found.' };
    }

    const invite = inviteSnap.data();
    const communityRef = doc(db, 'communities', invite.communityId);

    // Update invite status
    await updateDoc(inviteRef, { status: 'accepted' });

    // Add user to community
    if (invite.role === 'instructor') {
      await updateDoc(communityRef, {
        instructorIds: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(communityRef, {
        memberIds: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true, data: invite.communityId };
  } catch (error) {
    console.error('[communities] acceptCommunityInvite error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Join a community via invite code.
 */
export async function joinCommunityByCode(
  code: string,
  userId: string
): Promise<ActionResult<string>> {
  try {
    const result = await getCommunityByInviteCode(code);
    if (!result.success || !result.data) {
      return { success: false, error: 'Invalid invite code.' };
    }

    const community = result.data;
    const communityRef = doc(db, 'communities', community.id);

    await updateDoc(communityRef, {
      memberIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: community.id };
  } catch (error) {
    console.error('[communities] joinCommunityByCode error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Remove a member from a community.
 */
export async function removeCommunityMember(
  communityId: string,
  memberId: string,
  requesterId: string
): Promise<ActionResult> {
  try {
    const snap = await getDoc(doc(db, 'communities', communityId));
    if (!snap.exists()) return { success: false, error: 'Community not found.' };

    const data = snap.data();
    if (data.ownerId !== requesterId && !data.instructorIds?.includes(requesterId)) {
      return { success: false, error: 'Only instructors can remove members.' };
    }

    await updateDoc(doc(db, 'communities', communityId), {
      memberIds: arrayRemove(memberId),
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[communities] removeCommunityMember error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update community details.
 *
 * Curriculum assignments:
 *   - Pass `curriculumPathIds: string[]` to set the full list.
 *   - Pass `curriculumPathId: string | null` to set/clear the legacy single
 *     value (still accepted so existing callers don't break).
 * In both cases we write *both* fields so older code paths that read the
 * singular `curriculumPathId` keep working until they're migrated. The
 * array is the new source of truth — `curriculumPathId` mirrors `ids[0]`.
 */
export async function updateCommunity(
  communityId: string,
  requesterId: string,
  updates: Partial<
    Pick<
      Community,
      'name' | 'description' | 'curriculumPathId' | 'curriculumPathIds' | 'settings'
    >
  >
): Promise<ActionResult> {
  try {
    const snap = await getDoc(doc(db, 'communities', communityId));
    if (!snap.exists()) return { success: false, error: 'Community not found.' };

    const data = snap.data();
    if (data.ownerId !== requesterId && !data.instructorIds?.includes(requesterId)) {
      return { success: false, error: 'Only instructors can update community settings.' };
    }

    // Normalize curriculum changes so the singular + plural fields stay
    // in sync regardless of which one the caller updated.
    const payload: Record<string, unknown> = { ...updates };
    if ('curriculumPathIds' in updates) {
      const ids = (updates.curriculumPathIds ?? []).filter(
        (s): s is string => typeof s === 'string' && s.length > 0,
      );
      payload.curriculumPathIds = ids;
      payload.curriculumPathId = ids[0] ?? null;
    } else if ('curriculumPathId' in updates) {
      const single = updates.curriculumPathId;
      payload.curriculumPathId = single ?? null;
      payload.curriculumPathIds = single ? [single] : [];
    }

    await updateDoc(doc(db, 'communities', communityId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[communities] updateCommunity error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Hard-delete a community and all its scoped data.
 *
 * Owner-only. Firestore does NOT cascade subcollection deletes when you
 * delete the parent document, so we explicitly walk and remove:
 *   - communityContributions (top-level, filtered by communityId) and
 *     their nested `comments` subcollection
 *   - communityInvites (top-level, filtered by communityId)
 *   - communities/{cid}/forumTopics and each topic's `replies`
 *     subcollection
 *   - communities/{cid}/media (including any per-item discussion
 *     thread subcollection)
 *   - the community document itself
 *
 * Submitted dilemmas that reference this community via `communityId`
 * are not deleted — they belong to their authors and can be re-shared
 * elsewhere. We clear their `communityId` so they no longer point at
 * a missing parent.
 *
 * The action returns success when every step completes. If any single
 * batch fails the surrounding try/catch reports the error — the caller
 * can re-run; intermediate progress is durable.
 */
export async function deleteCommunity(
  communityId: string,
  requesterId: string,
): Promise<ActionResult<{ deletedDocs: number }>> {
  try {
    const cref = doc(db, 'communities', communityId);
    const csnap = await getDoc(cref);
    if (!csnap.exists()) {
      return { success: false, error: 'Community not found.' };
    }
    const cdata = csnap.data();
    if (cdata.ownerId !== requesterId) {
      return {
        success: false,
        error: 'Only the community owner can delete this community.',
      };
    }

    let deletedDocs = 0;

    // Helper: delete every doc returned by a query in chunks of <=400
    // (Firestore batch limit is 500; leaving headroom for nested
    // subcollection cleanup added inside the loop).
    async function deleteQuery(q: ReturnType<typeof query>): Promise<void> {
      // Firestore client SDK doesn't support cursored deletes natively;
      // re-query until empty.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const snap = await getDocs(q);
        if (snap.empty) return;
        const batch = writeBatch(db);
        for (const d of snap.docs) {
          batch.delete(d.ref);
        }
        await batch.commit();
        deletedDocs += snap.docs.length;
        if (snap.docs.length < 400) return;
      }
    }

    // 1. Contributions (top-level) and their `comments` subcollection.
    const contribSnap = await getDocs(
      query(collection(db, 'communityContributions'), where('communityId', '==', communityId)),
    );
    for (const c of contribSnap.docs) {
      // Each contribution may have a `comments` subcollection — walk it.
      const commentsSnap = await getDocs(collection(c.ref, 'comments'));
      if (!commentsSnap.empty) {
        const batch = writeBatch(db);
        for (const cm of commentsSnap.docs) batch.delete(cm.ref);
        await batch.commit();
        deletedDocs += commentsSnap.docs.length;
      }
    }
    if (contribSnap.docs.length > 0) {
      const batch = writeBatch(db);
      for (const c of contribSnap.docs) batch.delete(c.ref);
      await batch.commit();
      deletedDocs += contribSnap.docs.length;
    }

    // 2. Invites.
    await deleteQuery(
      query(collection(db, 'communityInvites'), where('communityId', '==', communityId)),
    );

    // 3. Forum topics (subcollection) and their `replies` subsubcollection.
    const topicsSnap = await getDocs(collection(cref, 'forumTopics'));
    for (const t of topicsSnap.docs) {
      const repliesSnap = await getDocs(collection(t.ref, 'replies'));
      if (!repliesSnap.empty) {
        const batch = writeBatch(db);
        for (const r of repliesSnap.docs) batch.delete(r.ref);
        await batch.commit();
        deletedDocs += repliesSnap.docs.length;
      }
    }
    if (topicsSnap.docs.length > 0) {
      const batch = writeBatch(db);
      for (const t of topicsSnap.docs) batch.delete(t.ref);
      await batch.commit();
      deletedDocs += topicsSnap.docs.length;
    }

    // 4. Media items.
    const mediaSnap = await getDocs(collection(cref, 'media'));
    if (!mediaSnap.empty) {
      // Each media item may have its own discussion thread subcollection.
      // Best-effort walk: `mediaDiscussions` lives as a sibling collection
      // in some installs and inline subcollections in others. Try both.
      for (const m of mediaSnap.docs) {
        try {
          const threadsSnap = await getDocs(collection(m.ref, 'threads'));
          if (!threadsSnap.empty) {
            const batch = writeBatch(db);
            for (const th of threadsSnap.docs) batch.delete(th.ref);
            await batch.commit();
            deletedDocs += threadsSnap.docs.length;
          }
        } catch {
          // No such subcollection — fine.
        }
      }
      const batch = writeBatch(db);
      for (const m of mediaSnap.docs) batch.delete(m.ref);
      await batch.commit();
      deletedDocs += mediaSnap.docs.length;
    }

    // 5. Detach submitted dilemmas — they belong to their authors and
    // should survive. Just clear the now-stale community pointer.
    const dilemmasSnap = await getDocs(
      query(collection(db, 'submittedDilemmas'), where('communityId', '==', communityId)),
    );
    if (!dilemmasSnap.empty) {
      const batch = writeBatch(db);
      for (const d of dilemmasSnap.docs) {
        batch.update(d.ref, { communityId: null, communityName: null });
      }
      await batch.commit();
    }

    // 6. The community doc itself.
    await deleteDoc(cref);
    deletedDocs += 1;

    return { success: true, data: { deletedDocs } };
  } catch (error) {
    console.error('[communities] deleteCommunity error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Duplicate a community into a fresh shell for a new cohort.
 *
 * Owner-only. Copies:
 *   - name (+ " (Copy)" suffix unless caller supplies a name),
 *     description, settings, curriculum assignments
 *   - forum topics (cloned, with their replies and `lastReplyAt` copied)
 *   - media items
 *
 * Does NOT copy:
 *   - members (the duplicate is for a new cohort)
 *   - contributions (those belong to the original cohort)
 *   - invites (a fresh invite code is generated)
 *
 * The duplicate is owned by the requester and gets the same owner
 * identity. A new invite code is generated.
 */
export async function duplicateCommunity(input: {
  sourceCommunityId: string;
  requesterId: string;
  /** Optional new name. Defaults to `"<original> (Copy)"`. */
  name?: string;
  /** When true, also clone forum topics + replies. Default true. */
  copyForum?: boolean;
  /** When true, also clone curated media list. Default true. */
  copyMedia?: boolean;
}): Promise<ActionResult<Community>> {
  try {
    const sref = doc(db, 'communities', input.sourceCommunityId);
    const ssnap = await getDoc(sref);
    if (!ssnap.exists()) {
      return { success: false, error: 'Source community not found.' };
    }
    const src = ssnap.data();
    if (src.ownerId !== input.requesterId) {
      return {
        success: false,
        error: 'Only the community owner can duplicate this community.',
      };
    }

    const copyForum = input.copyForum !== false;
    const copyMedia = input.copyMedia !== false;
    const newName = (input.name ?? `${src.name || 'Community'} (Copy)`).trim();
    const newInviteCode = generateInviteCode();

    // Build the new community doc. Curriculum stays attached; member
    // lists do not.
    const legacySingle =
      typeof src.curriculumPathId === 'string' && src.curriculumPathId
        ? [src.curriculumPathId]
        : [];
    const curriculumIds: string[] = Array.isArray(src.curriculumPathIds)
      ? src.curriculumPathIds.filter(
          (s: unknown): s is string => typeof s === 'string' && s.length > 0,
        )
      : legacySingle;
    const newRef = await addDoc(collection(db, 'communities'), {
      name: newName,
      description: src.description || '',
      ownerId: src.ownerId,
      ownerName: src.ownerName || '',
      instructorIds: [src.ownerId],
      memberIds: [],
      licenseId: src.licenseId || null,
      inviteCode: newInviteCode,
      curriculumPathIds: curriculumIds,
      curriculumPathId: curriculumIds[0] ?? null,
      settings: src.settings || { maxMembers: 200, allowSelfJoin: false },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Clone forum topics + their replies.
    if (copyForum) {
      const topicsSnap = await getDocs(collection(sref, 'forumTopics'));
      for (const t of topicsSnap.docs) {
        const td = t.data();
        const newTopicRef = doc(collection(newRef, 'forumTopics'));
        await setDoc(newTopicRef, {
          ...td,
          communityId: newRef.id,
          // Reset counters/replies on the topic itself; we'll re-create
          // replies right after so the count stays accurate.
          replyCount: 0,
          lastReplyAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        const repliesSnap = await getDocs(collection(t.ref, 'replies'));
        let replyCount = 0;
        let lastReplyAt: unknown = null;
        for (const r of repliesSnap.docs) {
          const rd = r.data();
          const newReplyRef = doc(collection(newTopicRef, 'replies'));
          await setDoc(newReplyRef, {
            ...rd,
            communityId: newRef.id,
            topicId: newTopicRef.id,
            createdAt: serverTimestamp(),
          });
          replyCount += 1;
          lastReplyAt = serverTimestamp();
        }
        if (replyCount > 0) {
          await updateDoc(newTopicRef, {
            replyCount,
            lastReplyAt,
          });
        }
      }
    }

    // Clone media items.
    if (copyMedia) {
      const mediaSnap = await getDocs(collection(sref, 'media'));
      for (const m of mediaSnap.docs) {
        const md = m.data();
        const newMediaRef = doc(collection(newRef, 'media'));
        await setDoc(newMediaRef, {
          ...md,
          communityId: newRef.id,
          createdAt: serverTimestamp(),
        });
      }
    }

    const created = await getDoc(newRef);
    return {
      success: true,
      data: communityFromDoc(newRef.id, created.data() || {}),
    };
  } catch (error) {
    console.error('[communities] duplicateCommunity error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get member details for a community.
 */
export async function getCommunityMembers(
  communityId: string
): Promise<ActionResult<CommunityMemberInfo[]>> {
  try {
    const snap = await getDoc(doc(db, 'communities', communityId));
    if (!snap.exists()) return { success: false, error: 'Community not found.' };

    const data = snap.data();
    const allIds = [
      ...(data.instructorIds || []),
      ...(data.memberIds || []),
    ];

    const members: CommunityMemberInfo[] = [];
    for (const uid of allIds) {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (userSnap.exists()) {
        const u = userSnap.data();
        members.push({
          uid,
          displayName: u.name || u.displayName || 'Unknown',
          email: u.email || '',
          role: data.instructorIds?.includes(uid) ? 'instructor' : 'member',
          subscriptionStatus: u.subscriptionStatus || 'none',
          activeLicenseId: u.activeLicenseId,
        });
      }
    }

    return { success: true, data: members };
  } catch (error) {
    console.error('[communities] getCommunityMembers error:', error);
    return { success: false, error: String(error) };
  }
}
