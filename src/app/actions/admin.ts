'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { requireAdmin } from '@/lib/admin';
import { notifyOnDilemmaReviewed } from '@/lib/notifications-dispatch';
import { logAdminAction } from '@/lib/audit-log';
import type {
  SubmittedDilemma, Story, UserProfile, GlobalVisibility, ModerationStatus,
} from '@/types';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function dilemmaFromDoc(id: string, data: Record<string, any>): SubmittedDilemma {
  return {
    id,
    title: data.title || '',
    description: data.description || '',
    theme: data.theme || '',
    authorName: data.authorName || '',
    authorId: data.authorId,
    authorEmail: data.authorEmail,
    imageUrl: data.imageUrl,
    imageHint: data.imageHint,
    submittedAt: data.submittedAt?.toDate
      ? data.submittedAt.toDate().toISOString()
      : data.submittedAt,
    status: data.status || 'pending',
    communityId: data.communityId,
    communityName: data.communityName,
    rejectionReason: data.rejectionReason,
    reviewedBy: data.reviewedBy,
    reviewedByName: data.reviewedByName,
    reviewedAt: data.reviewedAt?.toDate
      ? data.reviewedAt.toDate().toISOString()
      : data.reviewedAt,
  };
}

/**
 * Fetch pending dilemmas. Platform admins see all; community moderators see only
 * the dilemmas scoped to communities they instruct.
 */
export async function getPendingDilemmas(
  options: { communityId?: string } = {}
): Promise<ActionResult<SubmittedDilemma[]>> {
  try {
    const dilemmasRef = collection(db, 'submittedDilemmas');
    const constraints = [where('status', '==', 'pending')];
    if (options.communityId) {
      constraints.push(where('communityId', '==', options.communityId));
    }
    const q = query(dilemmasRef, ...constraints, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    return {
      success: true,
      data: snapshot.docs.map((d) => dilemmaFromDoc(d.id, d.data())),
    };
  } catch (error: any) {
    console.error('[admin] Error fetching pending dilemmas:', error);
    return { success: false, error: error.message || 'Failed to fetch pending dilemmas' };
  }
}

/**
 * Fetch all pending dilemmas a given user is allowed to moderate.
 * - Platform admins see all pending dilemmas.
 * - Community instructors see pending dilemmas for communities they teach.
 */
export async function getPendingDilemmasForModerator(
  userId: string
): Promise<ActionResult<SubmittedDilemma[]>> {
  try {
    // Check admin
    const userSnap = await getDoc(doc(db, 'users', userId));
    const isAdmin = userSnap.exists() && userSnap.data().isAdmin === true;

    if (isAdmin) {
      return getPendingDilemmas();
    }

    // Otherwise: find communities they instruct, return dilemmas scoped there.
    const commQ = query(
      collection(db, 'communities'),
      where('instructorIds', 'array-contains', userId)
    );
    const commSnap = await getDocs(commQ);
    if (commSnap.empty) return { success: true, data: [] };

    const communityIds = commSnap.docs.map((d) => d.id);

    const results: SubmittedDilemma[] = [];
    for (const cid of communityIds) {
      const r = await getPendingDilemmas({ communityId: cid });
      if (r.success) results.push(...r.data);
    }
    return { success: true, data: results };
  } catch (error: any) {
    console.error('[admin] getPendingDilemmasForModerator error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check whether a user is allowed to moderate a specific dilemma.
 */
async function canModerate(userId: string, dilemmaId: string): Promise<{
  allowed: boolean;
  reviewerName: string;
  dilemma?: SubmittedDilemma;
}> {
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return { allowed: false, reviewerName: '' };
  const userData = userSnap.data();
  const reviewerName = userData.name || userData.displayName || 'Reviewer';

  if (userData.isAdmin === true) {
    const dilemmaSnap = await getDoc(doc(db, 'submittedDilemmas', dilemmaId));
    if (!dilemmaSnap.exists()) return { allowed: false, reviewerName };
    return {
      allowed: true,
      reviewerName,
      dilemma: dilemmaFromDoc(dilemmaSnap.id, dilemmaSnap.data()),
    };
  }

  // Community instructor path
  const dilemmaSnap = await getDoc(doc(db, 'submittedDilemmas', dilemmaId));
  if (!dilemmaSnap.exists()) return { allowed: false, reviewerName };
  const dilemma = dilemmaFromDoc(dilemmaSnap.id, dilemmaSnap.data());
  if (!dilemma.communityId) {
    // Un-scoped dilemmas are admin-only
    return { allowed: false, reviewerName, dilemma };
  }
  const commSnap = await getDoc(doc(db, 'communities', dilemma.communityId));
  if (!commSnap.exists()) return { allowed: false, reviewerName, dilemma };
  const instructorIds: string[] = commSnap.data().instructorIds || [];
  return {
    allowed: instructorIds.includes(userId),
    reviewerName,
    dilemma,
  };
}

/**
 * Approve a submitted dilemma. Admins can approve any; instructors can
 * approve dilemmas scoped to their communities.
 */
export async function approveDilemma(
  dilemmaId: string,
  reviewerUid: string
): Promise<ActionResult> {
  try {
    const { allowed, reviewerName, dilemma } = await canModerate(reviewerUid, dilemmaId);
    if (!allowed || !dilemma) {
      return { success: false, error: 'Not authorized to moderate this dilemma.' };
    }

    await updateDoc(doc(db, 'submittedDilemmas', dilemmaId), {
      status: 'approved',
      reviewedBy: reviewerUid,
      reviewedByName: reviewerName,
      reviewedAt: serverTimestamp(),
      rejectionReason: null,
    });

    if (dilemma.authorId) {
      notifyOnDilemmaReviewed({
        dilemmaId,
        dilemmaTitle: dilemma.title,
        authorId: dilemma.authorId,
        authorEmail: dilemma.authorEmail,
        decision: 'approved',
      }).catch((err) => console.error('[admin] notify approved failed:', err));
    }

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] Error approving dilemma:', error);
    return { success: false, error: error.message || 'Failed to approve dilemma' };
  }
}

/**
 * Reject a submitted dilemma with an optional reason.
 */
export async function rejectDilemma(
  dilemmaId: string,
  reviewerUid: string,
  rejectionReason?: string
): Promise<ActionResult> {
  try {
    const { allowed, reviewerName, dilemma } = await canModerate(reviewerUid, dilemmaId);
    if (!allowed || !dilemma) {
      return { success: false, error: 'Not authorized to moderate this dilemma.' };
    }

    await updateDoc(doc(db, 'submittedDilemmas', dilemmaId), {
      status: 'rejected',
      rejectionReason: rejectionReason || null,
      reviewedBy: reviewerUid,
      reviewedByName: reviewerName,
      reviewedAt: serverTimestamp(),
    });

    if (dilemma.authorId) {
      notifyOnDilemmaReviewed({
        dilemmaId,
        dilemmaTitle: dilemma.title,
        authorId: dilemma.authorId,
        authorEmail: dilemma.authorEmail,
        decision: 'rejected',
        rejectionReason,
      }).catch((err) => console.error('[admin] notify rejected failed:', err));
    }

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] Error rejecting dilemma:', error);
    return { success: false, error: error.message || 'Failed to reject dilemma' };
  }
}

/**
 * Fetch submissions by a specific author (for My Submissions page).
 */
export async function getSubmissionsByAuthor(
  authorId: string
): Promise<ActionResult<SubmittedDilemma[]>> {
  try {
    const q = query(
      collection(db, 'submittedDilemmas'),
      where('authorId', '==', authorId),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return {
      success: true,
      data: snapshot.docs.map((d) => dilemmaFromDoc(d.id, d.data())),
    };
  } catch (error: any) {
    console.error('[admin] getSubmissionsByAuthor error:', error);
    return { success: false, error: error.message };
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
        displayName: data.name || data.displayName || null,
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

// ─── Moderation Queue ─────────────────────────────────────────────

/**
 * Returns all globally-visible content across content types that is
 * still pending or flagged. Admin-only.
 */
export async function getModerationQueue(adminUid: string): Promise<ActionResult<{
  stories: Story[];
  dilemmas: SubmittedDilemma[];
  analyses: any[];
  perspectives: any[];
}>> {
  try {
    await requireAdmin(adminUid);

    async function fetchQueue(coll: string): Promise<any[]> {
      try {
        // Fetch globally-visible items (pending or flagged moderation status)
        const snap = await getDocs(
          query(
            collection(db, coll),
            where('globalVisibility', '==', 'public'),
            orderBy('createdAt', 'desc'),
            limit(200)
          )
        );
        return snap.docs
          .map((d) => {
            const data = d.data();
            return { id: d.id, ...data };
          })
          .filter((item: any) => {
            const status = item.moderationStatus || 'pending';
            return status === 'pending' || status === 'flagged';
          });
      } catch {
        return [];
      }
    }

    const [storiesRaw, dilemmasRaw, analysesRaw, perspectivesRaw] = await Promise.all([
      fetchQueue('stories'),
      fetchQueue('submittedDilemmas'),
      fetchQueue('analyses'),
      fetchQueue('perspectives'),
    ]);

    return {
      success: true,
      data: {
        stories: storiesRaw as Story[],
        dilemmas: dilemmasRaw as SubmittedDilemma[],
        analyses: analysesRaw,
        perspectives: perspectivesRaw,
      },
    };
  } catch (error: any) {
    console.error('[admin] getModerationQueue error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set moderation status for any content type. Admin-only. Audit-logged.
 */
export async function setModerationStatus(
  contentType: 'story' | 'dilemma' | 'analysis' | 'perspective',
  contentId: string,
  newStatus: ModerationStatus,
  adminUid: string,
  note?: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin(adminUid);
    const coll =
      contentType === 'story' ? 'stories' :
      contentType === 'dilemma' ? 'submittedDilemmas' :
      contentType === 'analysis' ? 'analyses' :
      'perspectives';

    const ref = doc(db, coll, contentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Item not found.' };
    const before = snap.data();

    await updateDoc(ref, {
      moderationStatus: newStatus,
      updatedAt: serverTimestamp(),
    });

    await logAdminAction({
      action: 'moderation_change',
      actorId: adminUid,
      targetType: contentType,
      targetId: contentId,
      before: { moderationStatus: before.moderationStatus || 'pending' },
      after: { moderationStatus: newStatus },
      note,
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] setModerationStatus error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Force-set visibility on any content. Admin-only. Audit-logged.
 */
export async function forceSetVisibility(
  contentType: 'story' | 'dilemma' | 'analysis' | 'perspective',
  contentId: string,
  visibility: GlobalVisibility,
  adminUid: string,
  note?: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin(adminUid);
    const coll =
      contentType === 'story' ? 'stories' :
      contentType === 'dilemma' ? 'submittedDilemmas' :
      contentType === 'analysis' ? 'analyses' :
      'perspectives';

    const ref = doc(db, coll, contentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Item not found.' };
    const before = snap.data();

    await updateDoc(ref, {
      globalVisibility: visibility,
      updatedAt: serverTimestamp(),
    });

    await logAdminAction({
      action: 'visibility_change',
      actorId: adminUid,
      targetType: contentType,
      targetId: contentId,
      before: { globalVisibility: before.globalVisibility || 'public' },
      after: { globalVisibility: visibility },
      note,
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] forceSetVisibility error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pin or unpin content as featured. Admin-only.
 */
export async function setFeatured(
  contentType: 'story' | 'dilemma',
  contentId: string,
  featured: boolean,
  adminUid: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin(adminUid);
    const coll = contentType === 'story' ? 'stories' : 'submittedDilemmas';
    const ref = doc(db, coll, contentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Item not found.' };
    const before = snap.data();

    await updateDoc(ref, { featured, updatedAt: serverTimestamp() });

    await logAdminAction({
      action: 'feature_toggle',
      actorId: adminUid,
      targetType: contentType,
      targetId: contentId,
      before: { featured: before.featured ?? false },
      after: { featured },
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] setFeatured error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Edit category/tag fields on submitted content. Admin-only.
 */
export async function editContentTags(
  contentType: 'story' | 'dilemma',
  contentId: string,
  updates: { genre?: string; theme?: string; tags?: string[] },
  adminUid: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin(adminUid);
    const coll = contentType === 'story' ? 'stories' : 'submittedDilemmas';
    const ref = doc(db, coll, contentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Item not found.' };
    const before = snap.data();

    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });

    await logAdminAction({
      action: 'tag_edit',
      actorId: adminUid,
      targetType: contentType,
      targetId: contentId,
      before: { genre: before.genre, theme: before.theme, tags: before.tags },
      after: updates,
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] editContentTags error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk moderation actions on multiple items.
 */
export async function bulkModerate(
  items: { contentType: 'story' | 'dilemma' | 'analysis' | 'perspective'; contentId: string }[],
  action: 'approve' | 'flag' | 'restrict' | 'delete' | 'make_public' | 'make_private',
  adminUid: string
): Promise<ActionResult<{ succeeded: number; failed: number }>> {
  try {
    await requireAdmin(adminUid);
    let succeeded = 0;
    let failed = 0;

    for (const item of items) {
      const coll =
        item.contentType === 'story' ? 'stories' :
        item.contentType === 'dilemma' ? 'submittedDilemmas' :
        item.contentType === 'analysis' ? 'analyses' :
        'perspectives';
      const ref = doc(db, coll, item.contentId);
      try {
        if (action === 'delete') {
          await deleteDoc(ref);
          await logAdminAction({
            action: 'delete',
            actorId: adminUid,
            targetType: item.contentType,
            targetId: item.contentId,
          });
        } else {
          let updates: any = { updatedAt: serverTimestamp() };
          if (action === 'approve') updates.moderationStatus = 'approved';
          if (action === 'flag') updates.moderationStatus = 'flagged';
          if (action === 'restrict') updates.moderationStatus = 'restricted';
          if (action === 'make_public') updates.globalVisibility = 'public';
          if (action === 'make_private') updates.globalVisibility = 'private';
          await updateDoc(ref, updates);
          await logAdminAction({
            action: action.includes('public') || action.includes('private') ? 'visibility_change' : 'moderation_change',
            actorId: adminUid,
            targetType: item.contentType,
            targetId: item.contentId,
            after: updates,
          });
        }
        succeeded++;
      } catch (err) {
        console.error(`[admin] bulkModerate item failed: ${item.contentType}/${item.contentId}`, err);
        failed++;
      }
    }

    return { success: true, data: { succeeded, failed } };
  } catch (error: any) {
    console.error('[admin] bulkModerate error:', error);
    return { success: false, error: error.message };
  }
}

// ─── Generic admin delete ──────────────────────────────────────────

const COLLECTION_MAP: Record<string, string> = {
  story: 'stories',
  dilemma: 'submittedDilemmas',
  debate: 'debates',
  philosopher: 'philosophers',
  theory: 'ethicalTheories',
  'scifi-author': 'scifiAuthors',
  'scifi-media': 'scifiMedia',
  'blog-post': 'blogPosts',
  analysis: 'analyses',
  perspective: 'perspectives',
  workshop: 'workshops',
  curriculum: 'curriculumPaths',
};

/**
 * Admin: delete any document from any supported collection.
 * Requires super-admin. Used by the AdminActions component on detail pages
 * so the admin can remove any artifact regardless of ownership.
 */
export async function adminDeleteArtifact(
  adminUid: string,
  artifactType: string,
  artifactId: string
): Promise<ActionResult> {
  try {
    await requireAdmin(adminUid);
    const collectionName = COLLECTION_MAP[artifactType];
    if (!collectionName) {
      return { success: false, error: `Unknown artifact type: ${artifactType}` };
    }
    const ref = doc(db, collectionName, artifactId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, error: `${artifactType} not found in Firestore. It may only exist in static data.` };
    }
    await deleteDoc(ref);
    await logAdminAction({
      action: 'delete',
      actorId: adminUid,
      targetType: artifactType,
      targetId: artifactId,
      note: `Admin deleted ${artifactType} ${artifactId}`,
    });
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[admin] adminDeleteArtifact error:', error);
    return { success: false, error: error.message || String(error) };
  }
}
