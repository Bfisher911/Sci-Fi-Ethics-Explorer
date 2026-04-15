
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import type { Story, GlobalVisibility } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { isUserAdmin } from '@/lib/admin';
import { saveVersion } from '@/lib/versions';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function storyFromDoc(id: string, data: Record<string, any>): Story {
  return {
    id,
    title: data.title || '',
    description: data.description || '',
    genre: data.genre || '',
    theme: data.theme || '',
    author: data.author || '',
    imageUrl: data.imageUrl || '',
    imageHint: data.imageHint || '',
    segments: data.segments || [],
    isInteractive: data.isInteractive ?? false,
    estimatedReadingTime: data.estimatedReadingTime || '',
    authorId: data.authorId,
    status: data.status || 'published',
    globalVisibility: data.globalVisibility || 'public',
    moderationStatus: data.moderationStatus || 'approved',
    featured: data.featured ?? false,
    publishedAt: timestampToDate(data.publishedAt),
    viewCount: data.viewCount || 0,
    tags: data.tags || [],
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

/**
 * Fetch all published stories (or all for admin).
 */
export async function getStories(
  options: { includeAll?: boolean } = {}
): Promise<ActionResult<Story[]>> {
  try {
    const storiesRef = collection(db, 'stories');
    const constraints = options.includeAll
      ? [orderBy('title')]
      : [where('status', '==', 'published'), orderBy('title')];

    const q = query(storiesRef, ...constraints);
    const snapshot = await getDocs(q);

    const stories = snapshot.docs.map((d) => storyFromDoc(d.id, d.data()));
    return { success: true, data: stories };
  } catch (error) {
    console.error('[stories] getStories error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch a single story by ID.
 */
export async function getStoryById(
  storyId: string
): Promise<ActionResult<Story | null>> {
  try {
    const docRef = doc(db, 'stories', storyId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return { success: true, data: null };
    }

    return { success: true, data: storyFromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[stories] getStoryById error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Create a new story (used by both seed script and user-generated stories).
 */
export async function createStory(
  story: Omit<Story, 'id'> & { id?: string }
): Promise<ActionResult<string>> {
  try {
    if (story.id) {
      // Use specified ID (for seeding mock data)
      const docRef = doc(db, 'stories', story.id);
      const { id, ...data } = story;
      await setDoc(docRef, {
        ...data,
        status: data.status || 'published',
        publishedAt: serverTimestamp(),
        viewCount: data.viewCount || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, data: story.id };
    } else {
      const { id, ...data } = story as any;
      const docRef = await addDoc(collection(db, 'stories'), {
        ...data,
        status: data.status || 'draft',
        publishedAt: null,
        viewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, data: docRef.id };
    }
  } catch (error) {
    console.error('[stories] createStory error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update an existing story.
 */
export async function updateStory(
  storyId: string,
  data: Partial<Story>
): Promise<ActionResult<void>> {
  try {
    const docRef = doc(db, 'stories', storyId);
    const { id, ...updateData } = data as any;
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[stories] updateStory error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Submit a user-generated story for moderation.
 */
export async function submitUserStory(
  story: Omit<Story, 'id' | 'status' | 'publishedAt' | 'viewCount'> & {
    authorId: string;
    globalVisibility?: GlobalVisibility;
  }
): Promise<ActionResult<string>> {
  try {
    const docRef = await addDoc(collection(db, 'stories'), {
      ...story,
      status: 'draft',
      globalVisibility: story.globalVisibility || 'private',
      moderationStatus: 'pending',
      publishedAt: null,
      viewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: docRef.id };
  } catch (error) {
    console.error('[stories] submitUserStory error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch stories created by a specific user.
 */
export async function getUserStories(
  authorId: string
): Promise<ActionResult<Story[]>> {
  try {
    const q = query(
      collection(db, 'stories'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const stories = snapshot.docs.map((d) => storyFromDoc(d.id, d.data()));
    return { success: true, data: stories };
  } catch (error) {
    console.error('[stories] getUserStories error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get a random published story for "Dilemma of the Day".
 */
export async function getDilemmaOfTheDay(): Promise<ActionResult<Story | null>> {
  try {
    const q = query(
      collection(db, 'stories'),
      where('status', '==', 'published'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, data: null };
    }
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = dayOfYear % snapshot.docs.length;
    const d = snapshot.docs[index];
    return { success: true, data: storyFromDoc(d.id, d.data()) };
  } catch (error) {
    console.error('[stories] getDilemmaOfTheDay error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update a story with ownership check. Saves a version snapshot before
 * the update so changes can be restored.
 */
export async function updateStoryOwned(
  storyId: string,
  requesterId: string,
  data: Partial<Story>,
  options: { snapshot?: boolean } = { snapshot: true }
): Promise<ActionResult<void>> {
  try {
    const docRef = doc(db, 'stories', storyId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { success: false, error: 'Story not found.' };

    const current = snap.data();
    const isAdmin = await isUserAdmin(requesterId);
    if (current.authorId && current.authorId !== requesterId && !isAdmin) {
      return { success: false, error: 'Not authorized to edit this story.' };
    }

    if (options.snapshot) {
      await saveVersion({
        contentType: 'story',
        contentId: storyId,
        authorId: requesterId,
        snapshot: current,
        note: 'Snapshot before update',
      });
    }

    const { id, ...updateData } = data as any;
    await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[stories] updateStoryOwned error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a story (author or admin).
 */
export async function deleteStory(
  storyId: string,
  requesterId: string
): Promise<ActionResult<void>> {
  try {
    const docRef = doc(db, 'stories', storyId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { success: false, error: 'Story not found.' };
    const current = snap.data();
    const isAdmin = await isUserAdmin(requesterId);
    if (current.authorId && current.authorId !== requesterId && !isAdmin) {
      return { success: false, error: 'Not authorized to delete this story.' };
    }
    await deleteDoc(docRef);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[stories] deleteStory error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Toggle a story between public and private (author or admin).
 */
export async function setStoryVisibility(
  storyId: string,
  requesterId: string,
  visibility: GlobalVisibility
): Promise<ActionResult<void>> {
  try {
    const docRef = doc(db, 'stories', storyId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { success: false, error: 'Story not found.' };
    const current = snap.data();
    const isAdmin = await isUserAdmin(requesterId);
    if (current.authorId && current.authorId !== requesterId && !isAdmin) {
      return { success: false, error: 'Not authorized.' };
    }
    await updateDoc(docRef, {
      globalVisibility: visibility,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[stories] setStoryVisibility error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Save a story as a draft (no version snapshot to avoid noise).
 */
export async function saveStoryDraft(
  storyId: string,
  requesterId: string,
  data: Partial<Story>
): Promise<ActionResult<void>> {
  try {
    const docRef = doc(db, 'stories', storyId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { success: false, error: 'Story not found.' };
    const current = snap.data();
    if (current.authorId && current.authorId !== requesterId) {
      return { success: false, error: 'Not authorized.' };
    }
    const { id, ...updateData } = data as any;
    await updateDoc(docRef, {
      ...updateData,
      status: 'draft',
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[stories] saveStoryDraft error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Restore a story to a previous version (snapshot becomes the new state).
 */
export async function restoreStoryVersion(
  storyId: string,
  versionSnapshot: Record<string, any>,
  requesterId: string
): Promise<ActionResult<void>> {
  try {
    const docRef = doc(db, 'stories', storyId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { success: false, error: 'Story not found.' };
    const current = snap.data();
    const isAdmin = await isUserAdmin(requesterId);
    if (current.authorId && current.authorId !== requesterId && !isAdmin) {
      return { success: false, error: 'Not authorized.' };
    }
    // Snapshot the current state before restoring
    await saveVersion({
      contentType: 'story',
      contentId: storyId,
      authorId: requesterId,
      snapshot: current,
      note: 'Snapshot before restore',
    });
    // Apply the snapshot
    await updateDoc(docRef, {
      ...versionSnapshot,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[stories] restoreStoryVersion error:', error);
    return { success: false, error: String(error) };
  }
}
