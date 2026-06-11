'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import type { SciFiMedia, SciFiMediaCategory } from '@/types';
import { scifiMediaData } from '@/data/scifi-media';
import { getScenarioReflectionForMedia } from '@/data/scifi-media-scenario-reflections';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

const PLACEHOLDER_IMAGE_RE = /placehold|placeholder/i;

function isRealImageUrl(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !PLACEHOLDER_IMAGE_RE.test(value);
}

function mediaFromDoc(id: string, data: Record<string, any>): SciFiMedia {
  const fallback = scifiMediaData.find((item) => item.id === id);
  const media: SciFiMedia = {
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
    ethicalScenarioReflection: data.ethicalScenarioReflection,
  };
  return {
    ...media,
    ethicalScenarioReflection: media.ethicalScenarioReflection ?? getScenarioReflectionForMedia(media),
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
      items = scifiMediaData.map((media) => ({
        ...media,
        ethicalScenarioReflection: getScenarioReflectionForMedia(media),
      }));
    }
    if (category) {
      items = items.filter((m) => m.category === category);
    }
    return { success: true, data: items };
  } catch (error) {
    console.error('[scifi-media] getSciFiMedia error, falling back:', error);
    let items = scifiMediaData.map((media) => ({
      ...media,
      ethicalScenarioReflection: getScenarioReflectionForMedia(media),
    }));
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
    const fallbackMedia = scifiMediaData.find((m) => m.id === id) || null;
    const fallback = fallbackMedia
      ? {
          ...fallbackMedia,
          ethicalScenarioReflection: getScenarioReflectionForMedia(fallbackMedia),
        }
      : null;
    return { success: true, data: fallback };
  } catch (error) {
    console.error('[scifi-media] getSciFiMediaById error, falling back:', error);
    const fallbackMedia = scifiMediaData.find((m) => m.id === id) || null;
    const fallback = fallbackMedia
      ? {
          ...fallbackMedia,
          ethicalScenarioReflection: getScenarioReflectionForMedia(fallbackMedia),
        }
      : null;
    return { success: true, data: fallback };
  }
}

/**
 * Media entries linked to a sci-fi author (via each entry's `authorIds`).
 * Lightweight projection for the author page's "Featured in the library"
 * section — searches the canonical static dataset, so no Firestore reads.
 */
export async function getMediaForAuthor(
  authorId: string
): Promise<ActionResult<Array<{ id: string; title: string; year: string; category: SciFiMediaCategory }>>> {
  if (!authorId) return { success: true, data: [] };
  const items = scifiMediaData
    .filter((m) => (m.authorIds ?? []).includes(authorId))
    .map((m) => ({ id: m.id, title: m.title, year: m.year, category: m.category }));
  return { success: true, data: items };
}
