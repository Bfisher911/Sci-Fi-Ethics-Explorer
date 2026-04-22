'use server';

/**
 * Community media additions.
 *
 * A community manager (or super-admin) can add a sci-fi media item to
 * the community's reading/viewing list. Once added, a discussion
 * board (using the forum subsystem with mediaId scoping) is available
 * to community members on that media's detail page.
 *
 * Data model: communities/{cid}/media/{mediaId}
 *   { mediaId, title, category, addedBy, addedByName, addedAt }
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { isSuperAdminEmail } from '@/lib/super-admins';
import { scifiMediaData } from '@/data/scifi-media';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import type { SciFiMedia, SciFiMediaCategory } from '@/types';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CommunityMediaEntry {
  communityId: string;
  mediaId: string;
  title: string;
  category: SciFiMediaCategory;
  addedBy: string;
  addedByName: string;
  addedAt: Date | any;
}

async function resolveAuthority(
  requesterId: string
): Promise<{ isManager: boolean; displayName: string }> {
  if (!requesterId) return { isManager: false, displayName: 'Member' };
  const snap = await getDoc(doc(db, 'users', requesterId));
  if (!snap.exists()) return { isManager: false, displayName: 'Member' };
  const data = snap.data();
  const email = (data?.email as string) || null;
  const isManager =
    isSuperAdminEmail(email) || data?.communityManager === true;
  const displayName: string =
    data?.displayName ||
    [data?.firstName, data?.lastName].filter(Boolean).join(' ') ||
    email ||
    'Member';
  return { isManager, displayName };
}

/** Is the requester permitted to curate this community's media list?
 *  Instructors of the community, users with communityManager = true,
 *  and the super-admin all qualify. */
async function canCurate(
  communityId: string,
  requesterId: string
): Promise<boolean> {
  if (!requesterId) return false;
  const authority = await resolveAuthority(requesterId);
  if (authority.isManager) return true;
  try {
    const communitySnap = await getDoc(doc(db, 'communities', communityId));
    if (!communitySnap.exists()) return false;
    const instructorIds: string[] = communitySnap.data()?.instructorIds || [];
    return instructorIds.includes(requesterId);
  } catch {
    return false;
  }
}

function entryFromDoc(
  communityId: string,
  id: string,
  data: Record<string, any>
): CommunityMediaEntry {
  return {
    communityId,
    mediaId: id,
    title: data.title || '',
    category: (data.category as SciFiMediaCategory) || 'other',
    addedBy: data.addedBy || '',
    addedByName: data.addedByName || 'Member',
    addedAt: timestampToDate(data.addedAt) ?? new Date(),
  };
}

/**
 * Add a sci-fi media item to the community's list. Requires curator
 * authority (see `canCurate`). The media must exist in scifiMediaData.
 */
export async function addMediaToCommunity(input: {
  communityId: string;
  mediaId: string;
  requesterId: string;
}): Promise<ActionResult<CommunityMediaEntry>> {
  try {
    if (!input.communityId || !input.mediaId) {
      return { success: false, error: 'Missing communityId or mediaId.' };
    }
    if (!(await canCurate(input.communityId, input.requesterId))) {
      return {
        success: false,
        error: 'Only community managers or instructors can add media.',
      };
    }
    const media: SciFiMedia | undefined = scifiMediaData.find(
      (m) => m.id === input.mediaId
    );
    if (!media) {
      return { success: false, error: 'Unknown media id.' };
    }
    const authority = await resolveAuthority(input.requesterId);
    const ref = doc(
      db,
      'communities',
      input.communityId,
      'media',
      input.mediaId
    );
    await setDoc(ref, {
      mediaId: input.mediaId,
      title: media.title,
      category: media.category,
      addedBy: input.requesterId,
      addedByName: authority.displayName,
      addedAt: serverTimestamp(),
    });
    const fresh = await getDoc(ref);
    return {
      success: true,
      data: entryFromDoc(input.communityId, input.mediaId, fresh.data() || {}),
    };
  } catch (err: any) {
    console.error('[community-media] addMediaToCommunity error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function removeMediaFromCommunity(input: {
  communityId: string;
  mediaId: string;
  requesterId: string;
}): Promise<ActionResult<void>> {
  try {
    if (!(await canCurate(input.communityId, input.requesterId))) {
      return {
        success: false,
        error: 'Only community managers or instructors can remove media.',
      };
    }
    await deleteDoc(
      doc(db, 'communities', input.communityId, 'media', input.mediaId)
    );
    return { success: true, data: undefined };
  } catch (err: any) {
    console.error('[community-media] removeMediaFromCommunity error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function listCommunityMedia(
  communityId: string
): Promise<ActionResult<CommunityMediaEntry[]>> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'communities', communityId, 'media'),
        orderBy('addedAt', 'desc')
      )
    );
    return {
      success: true,
      data: snap.docs.map((d) => entryFromDoc(communityId, d.id, d.data())),
    };
  } catch (err: any) {
    console.error('[community-media] listCommunityMedia error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Return every community that has added the given mediaId AND in
 * which the requester is a member. The media detail page uses this
 * to decide whether to render a discussion-board surface.
 */
export async function getCommunitiesWithMediaForUser(input: {
  mediaId: string;
  userId: string;
}): Promise<ActionResult<Array<{ communityId: string; communityName: string }>>> {
  try {
    if (!input.mediaId || !input.userId) {
      return { success: true, data: [] };
    }
    // Membership is stored as arrays on the community doc; we can't
    // combine two array-contains in a single query, so we do two and
    // union. Both queries produce small result sets.
    const [byMember, byInstructor] = await Promise.all([
      getDocs(
        query(
          collection(db, 'communities'),
          where('memberIds', 'array-contains', input.userId)
        )
      ),
      getDocs(
        query(
          collection(db, 'communities'),
          where('instructorIds', 'array-contains', input.userId)
        )
      ),
    ]);
    const seen = new Set<string>();
    const communityDocs = [...byMember.docs, ...byInstructor.docs].filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });

    const out: Array<{ communityId: string; communityName: string }> = [];
    for (const cdoc of communityDocs) {
      const mref = doc(db, 'communities', cdoc.id, 'media', input.mediaId);
      const hit = await getDoc(mref);
      if (hit.exists()) {
        out.push({
          communityId: cdoc.id,
          communityName: cdoc.data()?.name || 'Community',
        });
      }
    }
    return { success: true, data: out };
  } catch (err: any) {
    console.error('[community-media] getCommunitiesWithMediaForUser error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}
