
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, addDoc, getDocs, doc, getDoc, query, where, orderBy,
  serverTimestamp, deleteDoc, updateDoc,
} from 'firebase/firestore';
import type { ContentVersion, VersionedContentType } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

/**
 * Save a snapshot of content. Versions are stored in `contentVersions`
 * with composite key on contentType + contentId + versionNumber.
 */
export async function saveVersion(input: {
  contentType: VersionedContentType;
  contentId: string;
  authorId: string;
  authorName?: string;
  snapshot: Record<string, any>;
  note?: string;
}): Promise<{ success: true; data: { id: string; versionNumber: number } } | { success: false; error: string }> {
  try {
    // Determine next version number
    const q = query(
      collection(db, 'contentVersions'),
      where('contentType', '==', input.contentType),
      where('contentId', '==', input.contentId),
      orderBy('versionNumber', 'desc')
    );
    const existing = await getDocs(q);
    const nextVersion = existing.empty ? 1 : (existing.docs[0].data().versionNumber || 0) + 1;

    const ref = await addDoc(collection(db, 'contentVersions'), {
      contentType: input.contentType,
      contentId: input.contentId,
      versionNumber: nextVersion,
      authorId: input.authorId,
      authorName: input.authorName || null,
      snapshot: input.snapshot,
      note: input.note || null,
      createdAt: serverTimestamp(),
    });

    return { success: true, data: { id: ref.id, versionNumber: nextVersion } };
  } catch (error) {
    console.error('[versions] saveVersion error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getVersions(
  contentType: VersionedContentType,
  contentId: string
): Promise<ContentVersion[]> {
  try {
    const q = query(
      collection(db, 'contentVersions'),
      where('contentType', '==', contentType),
      where('contentId', '==', contentId),
      orderBy('versionNumber', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        contentType: data.contentType,
        contentId: data.contentId,
        versionNumber: data.versionNumber,
        authorId: data.authorId,
        authorName: data.authorName,
        snapshot: data.snapshot || {},
        note: data.note,
        createdAt: timestampToDate(data.createdAt) ?? new Date(),
      } as ContentVersion;
    });
  } catch (err) {
    console.error('[versions] getVersions error:', err);
    return [];
  }
}

export async function getVersion(versionId: string): Promise<ContentVersion | null> {
  try {
    const snap = await getDoc(doc(db, 'contentVersions', versionId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      contentType: data.contentType,
      contentId: data.contentId,
      versionNumber: data.versionNumber,
      authorId: data.authorId,
      authorName: data.authorName,
      snapshot: data.snapshot || {},
      note: data.note,
      createdAt: timestampToDate(data.createdAt) ?? new Date(),
    };
  } catch (err) {
    console.error('[versions] getVersion error:', err);
    return null;
  }
}
