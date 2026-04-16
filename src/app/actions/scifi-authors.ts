'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import type { SciFiAuthor } from '@/types';
import { scifiAuthorData } from '@/data/scifi-authors';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function authorFromDoc(id: string, data: Record<string, any>): SciFiAuthor {
  return {
    id,
    name: data.name || '',
    era: data.era || '',
    bio: data.bio || '',
    themes: data.themes || [],
    subgenres: data.subgenres || [],
    relatedFrameworks: data.relatedFrameworks || [],
    notableWorks: data.notableWorks || [],
    techEthicsFocus: data.techEthicsFocus,
    imageUrl: data.imageUrl,
    imageHint: data.imageHint,
  };
}

/**
 * Fetch all sci-fi authors. Tries Firestore first; falls back to static data.
 */
export async function getSciFiAuthors(): Promise<ActionResult<SciFiAuthor[]>> {
  try {
    const q = query(collection(db, 'scifiAuthors'), orderBy('name'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const authors = snapshot.docs.map((d) => authorFromDoc(d.id, d.data()));
      return { success: true, data: authors };
    }
    return { success: true, data: scifiAuthorData };
  } catch (error) {
    console.error(
      '[scifi-authors] getSciFiAuthors Firestore error, falling back to static data:',
      error
    );
    return { success: true, data: scifiAuthorData };
  }
}

/**
 * Fetch a single sci-fi author by ID.
 */
export async function getSciFiAuthorById(
  id: string
): Promise<ActionResult<SciFiAuthor | null>> {
  try {
    const snap = await getDoc(doc(db, 'scifiAuthors', id));
    if (snap.exists()) {
      return { success: true, data: authorFromDoc(snap.id, snap.data()) };
    }
    const fallback = scifiAuthorData.find((a) => a.id === id) || null;
    return { success: true, data: fallback };
  } catch (error) {
    console.error(
      '[scifi-authors] getSciFiAuthorById Firestore error, falling back to static:',
      error
    );
    const fallback = scifiAuthorData.find((a) => a.id === id) || null;
    return { success: true, data: fallback };
  }
}
