
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
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import type { Story } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

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
    publishedAt: timestampToDate(data.publishedAt),
    viewCount: data.viewCount || 0,
    tags: data.tags || [],
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
  story: Omit<Story, 'id' | 'status' | 'publishedAt' | 'viewCount'> & { authorId: string }
): Promise<ActionResult<string>> {
  try {
    const docRef = await addDoc(collection(db, 'stories'), {
      ...story,
      status: 'draft',
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
    // Pick a pseudo-random story based on the day
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
