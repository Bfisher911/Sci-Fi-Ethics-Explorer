'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import type { BlogPost } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { requireAdmin } from '@/lib/admin';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function blogFromDoc(id: string, d: Record<string, any>): BlogPost {
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
    publishedAt: timestampToDate(d.publishedAt),
    createdAt: timestampToDate(d.createdAt) ?? new Date(),
    updatedAt: timestampToDate(d.updatedAt),
  };
}

export async function getPublishedBlogPosts(): Promise<ActionResult<BlogPost[]>> {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => blogFromDoc(d.id, d.data())) };
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

export async function createBlogPost(
  adminUid: string,
  data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ActionResult<string>> {
  try {
    await requireAdmin(adminUid);
    const ref = await addDoc(collection(db, 'blogPosts'), {
      ...data,
      publishedAt: data.status === 'published' ? serverTimestamp() : null,
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
