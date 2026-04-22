'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import type { SciFiMedia, SciFiMediaCategory } from '@/types';
import { scifiMediaData } from '@/data/scifi-media';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

const PLACEHOLDER_IMAGE_RE = /placehold|placeholder/i;

function isRealImageUrl(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !PLACEHOLDER_IMAGE_RE.test(value);
}

function mediaFromDoc(id: string, data: Record<string, any>): SciFiMedia {
  const fallback = scifiMediaData.find((item) => item.id === id);
  return {
    id,
    title: data.title || '',
    category: data.category || 'other',
    year: data.year || '',
    creator: data.creator || '',
    plot: data.plot || '',
    ethicsExplored: data.ethicsExplored || [],
    authorIds: data.authorIds || [],
    relatedFrameworks: data.relatedFrameworks || [],
    meta: data.meta,
    imageUrl: isRealImageUrl(data.imageUrl) ? data.imageUrl : fallback?.imageUrl,
    imageHint: data.imageHint || fallback?.imageHint,
  };
}

export async function getSciFiMedia(
  category?: SciFiMediaCategory
): Promise<ActionResult<SciFiMedia[]>> {
  try {
    const q = query(collection(db, 'scifiMedia'), orderBy('title'));
    const snap = await getDocs(q);
    let items: SciFiMedia[];
    if (!snap.empty) {
      items = snap.docs.map((d) => mediaFromDoc(d.id, d.data()));
    } else {
      items = scifiMediaData;
    }
    if (category) {
      items = items.filter((m) => m.category === category);
    }
    return { success: true, data: items };
  } catch (error) {
    console.error('[scifi-media] getSciFiMedia error, falling back:', error);
    let items = scifiMediaData;
    if (category) items = items.filter((m) => m.category === category);
    return { success: true, data: items };
  }
}

export async function getSciFiMediaById(
  id: string
): Promise<ActionResult<SciFiMedia | null>> {
  try {
    const snap = await getDoc(doc(db, 'scifiMedia', id));
    if (snap.exists()) {
      return { success: true, data: mediaFromDoc(snap.id, snap.data()) };
    }
    const fallback = scifiMediaData.find((m) => m.id === id) || null;
    return { success: true, data: fallback };
  } catch (error) {
    console.error('[scifi-media] getSciFiMediaById error, falling back:', error);
    const fallback = scifiMediaData.find((m) => m.id === id) || null;
    return { success: true, data: fallback };
  }
}
