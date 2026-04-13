
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, arrayUnion, arrayRemove, serverTimestamp,
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
    curriculumPathId: data.curriculumPathId,
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
 */
export async function updateCommunity(
  communityId: string,
  requesterId: string,
  updates: Partial<Pick<Community, 'name' | 'description' | 'curriculumPathId' | 'settings'>>
): Promise<ActionResult> {
  try {
    const snap = await getDoc(doc(db, 'communities', communityId));
    if (!snap.exists()) return { success: false, error: 'Community not found.' };

    const data = snap.data();
    if (data.ownerId !== requesterId && !data.instructorIds?.includes(requesterId)) {
      return { success: false, error: 'Only instructors can update community settings.' };
    }

    await updateDoc(doc(db, 'communities', communityId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[communities] updateCommunity error:', error);
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
