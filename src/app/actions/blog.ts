'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import type {
  BlogPost,
  BlogKind,
  BlogSubmissionStatus,
} from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { requireAdmin } from '@/lib/admin';
import {
  OFFICIAL_AUTHOR_NAME,
  OFFICIAL_AUTHOR_UID,
  isOfficialAuthor,
} from '@/lib/official-author';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Hydrate a Firestore blog doc. Resolves the `kind` field for legacy
 * posts written before the official/community split existed: anything
 * authored by the canonical Professor Paradox UID is 'official';
 * everything else falls back to 'community'.
 */
function blogFromDoc(id: string, d: Record<string, any>): BlogPost {
  const inferredKind: BlogKind = isOfficialAuthor(d.authorId)
    ? 'official'
    : 'community';
  return {
    id,
    title: d.title || '',
    slug: d.slug || id,
    excerpt: d.excerpt || '',
    body: d.body || '',
    authorId: d.authorId || '',
    authorName: d.authorName || '',
    tags: d.tags || [],
    imageUrl: d.imageUrl,
    imageHint: d.imageHint,
    status: d.status || 'draft',
    kind: (d.kind as BlogKind | undefined) || inferredKind,
    submissionStatus: d.submissionStatus,
    globalVisibility: d.globalVisibility,
    moderationStatus: d.moderationStatus,
    rejectionReason: d.rejectionReason,
    reviewedBy: d.reviewedBy,
    reviewedByName: d.reviewedByName,
    reviewedAt: timestampToDate(d.reviewedAt),
    publishedAt: timestampToDate(d.publishedAt),
    createdAt: timestampToDate(d.createdAt) ?? new Date(),
    updatedAt: timestampToDate(d.updatedAt),
  };
}

// ─── Official blog reads ──────────────────────────────────────────────

/**
 * Returns published OFFICIAL blog posts only — i.e. authored by Professor
 * Paradox. Community articles surface in /community-blog.
 */
export async function getPublishedBlogPosts(): Promise<ActionResult<BlogPost[]>> {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => blogFromDoc(d.id, d.data()));
    // Filter to official posts only (handles legacy docs without `kind`).
    return {
      success: true,
      data: all.filter((p) => p.kind === 'official'),
    };
  } catch (error) {
    console.error('[blog] getPublishedBlogPosts error:', error);
    return { success: true, data: [] };
  }
}

export async function getAllBlogPosts(adminUid: string): Promise<ActionResult<BlogPost[]>> {
  try {
    await requireAdmin(adminUid);
    const q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => blogFromDoc(d.id, d.data())) };
  } catch (error) {
    console.error('[blog] getAllBlogPosts error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getBlogPostBySlug(slug: string): Promise<ActionResult<BlogPost | null>> {
  try {
    const q = query(collection(db, 'blogPosts'), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return { success: true, data: null };
    const d = snap.docs[0];
    return { success: true, data: blogFromDoc(d.id, d.data()) };
  } catch (error) {
    console.error('[blog] getBlogPostBySlug error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getBlogPostById(id: string): Promise<ActionResult<BlogPost | null>> {
  try {
    const snap = await getDoc(doc(db, 'blogPosts', id));
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: blogFromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[blog] getBlogPostById error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Official blog writes (admin-only) ────────────────────────────────

export async function createBlogPost(
  adminUid: string,
  data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ActionResult<string>> {
  try {
    await requireAdmin(adminUid);
    // First-party blog posts are platform content. Default attribution to
    // Professor Paradox unless an explicit non-official authorId was set.
    // (`isOfficialAuthor` is tolerant — accepts the canonical UID, the
    //  display name, or legacy 'system' values.)
    const useOfficial =
      !data.authorId ||
      data.authorId === adminUid ||
      isOfficialAuthor(data.authorId);
    const normalized = useOfficial
      ? {
          ...data,
          authorId: OFFICIAL_AUTHOR_UID,
          authorName: OFFICIAL_AUTHOR_NAME,
          kind: 'official' as BlogKind,
        }
      : { ...data, kind: data.kind || ('community' as BlogKind) };
    const ref = await addDoc(collection(db, 'blogPosts'), {
      ...normalized,
      publishedAt: normalized.status === 'published' ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: ref.id };
  } catch (error) {
    console.error('[blog] createBlogPost error:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateBlogPost(
  adminUid: string,
  postId: string,
  data: Partial<Omit<BlogPost, 'id' | 'createdAt'>>
): Promise<ActionResult> {
  try {
    await requireAdmin(adminUid);
    const ref = doc(db, 'blogPosts', postId);
    const updates: Record<string, any> = { ...data, updatedAt: serverTimestamp() };
    if (data.status === 'published') {
      const existing = await getDoc(ref);
      if (existing.exists() && !existing.data().publishedAt) {
        updates.publishedAt = serverTimestamp();
      }
    }
    await updateDoc(ref, updates);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[blog] updateBlogPost error:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteBlogPost(adminUid: string, postId: string): Promise<ActionResult> {
  try {
    await requireAdmin(adminUid);
    await deleteDoc(doc(db, 'blogPosts', postId));
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[blog] deleteBlogPost error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Community blog reads ─────────────────────────────────────────────

/**
 * Public feed of approved + published community articles. Mirrors the
 * /community-stories and /community-dilemmas conventions.
 */
export async function getPublishedCommunityBlogPosts(): Promise<
  ActionResult<BlogPost[]>
> {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => blogFromDoc(d.id, d.data()));
    return {
      success: true,
      data: all.filter(
        (p) =>
          p.kind === 'community' &&
          (p.submissionStatus ?? 'approved') === 'approved' &&
          (p.globalVisibility ?? 'public') === 'public' &&
          (p.moderationStatus ?? 'approved') !== 'restricted' &&
          (p.moderationStatus ?? 'approved') !== 'flagged'
      ),
    };
  } catch (error) {
    console.error('[blog] getPublishedCommunityBlogPosts error:', error);
    return { success: true, data: [] };
  }
}

/** Every blog post a single user has authored (drafts, pending, published, rejected). */
export async function getMyBlogPosts(
  userId: string
): Promise<ActionResult<BlogPost[]>> {
  try {
    if (!userId) return { success: true, data: [] };
    const q = query(
      collection(db, 'blogPosts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((d) => blogFromDoc(d.id, d.data())),
    };
  } catch (error) {
    console.error('[blog] getMyBlogPosts error:', error);
    return { success: false, error: String(error) };
  }
}

/** Pending community submissions awaiting review. Admin-only. */
export async function getPendingCommunityBlogPosts(
  adminUid: string
): Promise<ActionResult<BlogPost[]>> {
  try {
    await requireAdmin(adminUid);
    const q = query(
      collection(db, 'blogPosts'),
      where('submissionStatus', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((d) => blogFromDoc(d.id, d.data())),
    };
  } catch (error) {
    console.error('[blog] getPendingCommunityBlogPosts error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Community blog writes ────────────────────────────────────────────

interface CommunityBlogSubmission {
  title: string;
  slug?: string;
  excerpt?: string;
  body: string;
  tags?: string[];
  imageUrl?: string;
  imageHint?: string;
  globalVisibility?: 'public' | 'private';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Submit a new community blog post for review. The post enters the
 * 'pending' queue and will not appear on /community-blog until an admin
 * approves it. Authors can keep editing until approval.
 */
export async function submitCommunityBlogPost(
  user: { uid: string; displayName?: string | null; email?: string | null },
  input: CommunityBlogSubmission
): Promise<ActionResult<string>> {
  try {
    if (!user || !user.uid) {
      return { success: false, error: 'Sign in to submit an article.' };
    }
    if (!input.title?.trim() || !input.body?.trim()) {
      return { success: false, error: 'Title and body are required.' };
    }
    // Reject any attempt to spoof Professor Paradox.
    if (isOfficialAuthor(user.uid)) {
      return { success: false, error: 'Invalid author for community submission.' };
    }

    const authorName =
      user.displayName?.trim() ||
      user.email?.split('@')[0] ||
      'Anonymous Explorer';

    const baseSlug = slugify(input.slug?.trim() || input.title);
    const finalSlug = await ensureUniqueSlug(baseSlug);

    const ref = await addDoc(collection(db, 'blogPosts'), {
      title: input.title.trim(),
      slug: finalSlug,
      excerpt:
        input.excerpt?.trim() ||
        input.body.trim().slice(0, 240).replace(/\s+\S*$/, '…'),
      body: input.body.trim(),
      authorId: user.uid,
      authorName,
      tags: (input.tags || [])
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8),
      imageUrl: input.imageUrl || null,
      imageHint: input.imageHint || null,
      kind: 'community' as BlogKind,
      status: 'draft', // not visible until approved
      submissionStatus: 'pending' as BlogSubmissionStatus,
      globalVisibility: input.globalVisibility ?? 'public',
      moderationStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: ref.id };
  } catch (error) {
    console.error('[blog] submitCommunityBlogPost error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update a user's own community blog post. Editing an approved post
 * sends it back to the pending queue so admins can re-review the change
 * — same convention as community dilemmas.
 */
export async function updateMyCommunityBlogPost(
  userId: string,
  postId: string,
  input: Partial<CommunityBlogSubmission>
): Promise<ActionResult<void>> {
  try {
    if (!userId) return { success: false, error: 'Sign in required.' };
    const ref = doc(db, 'blogPosts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Post not found.' };
    const current = snap.data();
    if (current.authorId !== userId) {
      return { success: false, error: 'You can only edit your own posts.' };
    }
    if ((current.kind || 'community') !== 'community') {
      return { success: false, error: 'Official posts must be edited from the admin panel.' };
    }

    const updates: Record<string, any> = { updatedAt: serverTimestamp() };
    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.body !== undefined) updates.body = input.body.trim();
    if (input.excerpt !== undefined) updates.excerpt = input.excerpt.trim();
    if (input.tags !== undefined) {
      updates.tags = input.tags
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8);
    }
    if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl;
    if (input.imageHint !== undefined) updates.imageHint = input.imageHint;
    if (input.globalVisibility !== undefined)
      updates.globalVisibility = input.globalVisibility;
    if (input.slug && input.slug !== current.slug) {
      const finalSlug = await ensureUniqueSlug(slugify(input.slug), postId);
      updates.slug = finalSlug;
    }

    // Material content edits send the post back to pending for re-review,
    // matching the dilemma flow.
    if (
      updates.title !== undefined ||
      updates.body !== undefined ||
      updates.excerpt !== undefined
    ) {
      updates.submissionStatus = 'pending';
      updates.status = 'draft';
      updates.moderationStatus = 'pending';
      updates.rejectionReason = null;
    }

    await updateDoc(ref, updates);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[blog] updateMyCommunityBlogPost error:', error);
    return { success: false, error: String(error) };
  }
}

/** Withdraw / delete a user's own community blog post. */
export async function deleteMyCommunityBlogPost(
  userId: string,
  postId: string
): Promise<ActionResult<void>> {
  try {
    if (!userId) return { success: false, error: 'Sign in required.' };
    const ref = doc(db, 'blogPosts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Post not found.' };
    const current = snap.data();
    if (current.authorId !== userId) {
      return { success: false, error: 'You can only delete your own posts.' };
    }
    if ((current.kind || 'community') !== 'community') {
      return { success: false, error: 'Official posts must be deleted from the admin panel.' };
    }
    await deleteDoc(ref);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[blog] deleteMyCommunityBlogPost error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Community blog moderation (admin) ────────────────────────────────

/**
 * Approve a pending community blog post. Sets it to `published` so it
 * shows up on /community-blog.
 */
export async function approveCommunityBlogPost(
  adminUid: string,
  postId: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin(adminUid);
    const reviewerSnap = await getDoc(doc(db, 'users', adminUid));
    const reviewerName =
      reviewerSnap.exists()
        ? reviewerSnap.data().name || reviewerSnap.data().displayName || 'Reviewer'
        : 'Reviewer';
    const ref = doc(db, 'blogPosts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Post not found.' };
    const current = snap.data();
    if ((current.kind || 'community') !== 'community') {
      return { success: false, error: 'Only community posts go through review.' };
    }
    await updateDoc(ref, {
      submissionStatus: 'approved',
      moderationStatus: 'approved',
      status: 'published',
      publishedAt: current.publishedAt ?? serverTimestamp(),
      reviewedBy: adminUid,
      reviewedByName: reviewerName,
      reviewedAt: serverTimestamp(),
      rejectionReason: null,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[blog] approveCommunityBlogPost error:', error);
    return { success: false, error: String(error) };
  }
}

/** Reject a pending community blog post with an optional reason. */
export async function rejectCommunityBlogPost(
  adminUid: string,
  postId: string,
  rejectionReason?: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin(adminUid);
    const reviewerSnap = await getDoc(doc(db, 'users', adminUid));
    const reviewerName =
      reviewerSnap.exists()
        ? reviewerSnap.data().name || reviewerSnap.data().displayName || 'Reviewer'
        : 'Reviewer';
    const ref = doc(db, 'blogPosts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Post not found.' };
    const current = snap.data();
    if ((current.kind || 'community') !== 'community') {
      return { success: false, error: 'Only community posts go through review.' };
    }
    await updateDoc(ref, {
      submissionStatus: 'rejected',
      moderationStatus: 'restricted',
      status: 'draft',
      rejectionReason: rejectionReason || null,
      reviewedBy: adminUid,
      reviewedByName: reviewerName,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[blog] rejectCommunityBlogPost error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────

/**
 * Ensure no two posts share the same slug. If a collision exists, append
 * `-2`, `-3`, … until free. Pass `excludeId` when re-slugging an existing
 * post so it doesn't collide with itself.
 */
async function ensureUniqueSlug(
  candidate: string,
  excludeId?: string
): Promise<string> {
  let slug = candidate || 'post';
  let suffix = 1;
  while (true) {
    const snap = await getDocs(
      query(collection(db, 'blogPosts'), where('slug', '==', slug))
    );
    const collision = snap.docs.find((d) => d.id !== excludeId);
    if (!collision) return slug;
    suffix += 1;
    slug = `${candidate}-${suffix}`;
  }
}
