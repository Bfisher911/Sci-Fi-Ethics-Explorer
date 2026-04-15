
'use server';

import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, getDoc, query, where, limit as fsLimit } from 'firebase/firestore';

export type ArtifactType = 'story' | 'quiz' | 'debate' | 'analysis' | 'discussion';

export interface ArtifactSearchResult {
  type: ArtifactType;
  id: string;
  title: string;
  snippet?: string;
  imageUrl?: string;
  authorId?: string;
  exists: boolean;
}

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Search across multiple collections for artifacts matching the query
 * and types. Filters are intentionally simple (case-insensitive substring).
 */
export async function searchArtifacts(input: {
  query?: string;
  types?: ArtifactType[];
  authorId?: string;
}): Promise<ActionResult<ArtifactSearchResult[]>> {
  try {
    const types = input.types && input.types.length > 0
      ? input.types
      : (['story', 'quiz', 'debate', 'analysis', 'discussion'] as ArtifactType[]);
    const q = (input.query || '').trim().toLowerCase();

    const results: ArtifactSearchResult[] = [];

    // Stories
    if (types.includes('story') || types.includes('discussion')) {
      try {
        const constraints: any[] = [];
        if (input.authorId) constraints.push(where('authorId', '==', input.authorId));
        const storiesRef = collection(db, 'stories');
        const snap = await getDocs(constraints.length > 0 ? query(storiesRef, ...constraints, fsLimit(100)) : query(storiesRef, fsLimit(100)));
        snap.docs.forEach((d) => {
          const data = d.data();
          const title = (data.title || '').toString();
          const desc = (data.description || '').toString();
          if (!q || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
            results.push({
              type: 'story',
              id: d.id,
              title,
              snippet: desc.slice(0, 160),
              imageUrl: data.imageUrl,
              authorId: data.authorId,
              exists: true,
            });
          }
        });
      } catch (err) {
        console.error('[artifacts] stories search error:', err);
      }
    }

    // Quizzes
    if (types.includes('quiz')) {
      try {
        const snap = await getDocs(query(collection(db, 'quizzes'), fsLimit(200)));
        snap.docs.forEach((d) => {
          const data = d.data();
          const title = (data.title || '').toString();
          const desc = (data.description || data.subjectName || '').toString();
          if (!q || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
            results.push({
              type: 'quiz',
              id: d.id,
              title,
              snippet: desc.slice(0, 160),
              exists: true,
            });
          }
        });
      } catch (err) {
        console.error('[artifacts] quizzes search error:', err);
      }
    }

    // Debates
    if (types.includes('debate')) {
      try {
        const snap = await getDocs(query(collection(db, 'debates'), fsLimit(100)));
        snap.docs.forEach((d) => {
          const data = d.data();
          const title = (data.title || '').toString();
          const desc = (data.description || '').toString();
          if (!q || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
            results.push({
              type: 'debate',
              id: d.id,
              title,
              snippet: desc.slice(0, 160),
              authorId: data.creatorId,
              exists: true,
            });
          }
        });
      } catch (err) {
        console.error('[artifacts] debates search error:', err);
      }
    }

    // Analyses (only public, or owned by author)
    if (types.includes('analysis')) {
      try {
        const constraints: any[] = [];
        if (input.authorId) {
          constraints.push(where('authorId', '==', input.authorId));
        } else {
          constraints.push(where('globalVisibility', '==', 'public'));
        }
        const snap = await getDocs(query(collection(db, 'analyses'), ...constraints, fsLimit(100)));
        snap.docs.forEach((d) => {
          const data = d.data();
          const title = (data.scenarioText || '').toString().slice(0, 80);
          if (!q || title.toLowerCase().includes(q)) {
            results.push({
              type: 'analysis',
              id: d.id,
              title: title || 'Untitled analysis',
              snippet: (data.scenarioText || '').toString().slice(0, 160),
              authorId: data.authorId,
              exists: true,
            });
          }
        });
      } catch (err) {
        console.error('[artifacts] analyses search error:', err);
      }
    }

    return { success: true, data: results };
  } catch (error) {
    console.error('[artifacts] searchArtifacts error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check whether a referenced artifact still exists. Used by curriculum
 * editor to flag broken links.
 */
export async function checkArtifactExists(
  type: ArtifactType,
  id: string
): Promise<ActionResult<{ exists: boolean; title?: string }>> {
  try {
    const collectionName =
      type === 'story' ? 'stories' :
      type === 'quiz' ? 'quizzes' :
      type === 'debate' ? 'debates' :
      type === 'analysis' ? 'analyses' :
      'stories';
    const snap = await getDoc(doc(db, collectionName, id));
    if (!snap.exists()) return { success: true, data: { exists: false } };
    const data = snap.data();
    return {
      success: true,
      data: {
        exists: true,
        title: data.title || data.scenarioText?.slice(0, 80) || undefined,
      },
    };
  } catch (error) {
    console.error('[artifacts] checkArtifactExists error:', error);
    return { success: false, error: String(error) };
  }
}
