'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { Bookmark } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function bookmarkFromDoc(id: string, data: Record<string, any>): Bookmark {
  return {
    id,
    userId: data.userId || '',
    itemId: data.itemId || '',
    itemType: data.itemType || 'story',
    title: data.title || '',
    createdAt: timestampToDate(data.createdAt),
  };
}

/**
 * Add a bookmark for a user.
 */
export async function addBookmark(data: {
  userId: string;
  itemId: string;
  itemType: 'story' | 'dilemma' | 'debate';
  title: string;
}): Promise<ActionResult<string>> {
  try {
    const docRef = await addDoc(collection(db, 'bookmarks'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { success: true, data: docRef.id };
  } catch (error) {
    console.error('[bookmarks] addBookmark error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Remove a bookmark by ID (verifies ownership via userId).
 */
export async function removeBookmark(
  bookmarkId: string,
  userId: string
): Promise<ActionResult<undefined>> {
  try {
    const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
    const snap = await getDoc(bookmarkRef);
    if (!snap.exists() || snap.data().userId !== userId) {
      return { success: false, error: 'Bookmark not found or unauthorized' };
    }
    await deleteDoc(bookmarkRef);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[bookmarks] removeBookmark error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch all bookmarks for a user.
 */
export async function getBookmarks(
  userId: string
): Promise<ActionResult<Bookmark[]>> {
  try {
    const q = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const bookmarks = snapshot.docs.map((d) =>
      bookmarkFromDoc(d.id, d.data())
    );
    return { success: true, data: bookmarks };
  } catch (error) {
    console.error('[bookmarks] getBookmarks error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check if an item is bookmarked by a user. Returns the bookmark ID if found.
 */
export async function isBookmarked(
  userId: string,
  itemId: string
): Promise<ActionResult<string | null>> {
  try {
    const q = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId),
      where('itemId', '==', itemId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, data: null };
    }
    return { success: true, data: snapshot.docs[0].id };
  } catch (error) {
    console.error('[bookmarks] isBookmarked error:', error);
    return { success: false, error: String(error) };
  }
}
