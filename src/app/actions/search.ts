'use server';

import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { Story, SubmittedDilemma, EthicalTheory } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface SearchResults {
  stories: { id: string; title: string; description: string }[];
  dilemmas: { id: string; title: string; description: string }[];
  theories: { id: string; name: string; description: string }[];
}

/**
 * Search across stories, submitted dilemmas, and ethical theories.
 * Performs client-side filtering since Firestore doesn't support full-text search.
 */
export async function searchAll(
  queryText: string
): Promise<ActionResult<SearchResults>> {
  try {
    const lowerQuery = queryText.toLowerCase().trim();
    if (!lowerQuery) {
      return {
        success: true,
        data: { stories: [], dilemmas: [], theories: [] },
      };
    }

    const results: SearchResults = {
      stories: [],
      dilemmas: [],
      theories: [],
    };

    // Search stories
    try {
      const storiesSnap = await getDocs(
        query(collection(db, 'stories'), limit(100))
      );
      storiesSnap.docs.forEach((d) => {
        const data = d.data();
        const title = (data.title || '').toLowerCase();
        const description = (data.description || '').toLowerCase();
        if (title.includes(lowerQuery) || description.includes(lowerQuery)) {
          results.stories.push({
            id: d.id,
            title: data.title || '',
            description: data.description || '',
          });
        }
      });
    } catch (e) {
      console.error('[search] stories search error:', e);
    }

    // Search submitted dilemmas
    try {
      const dilemmasSnap = await getDocs(
        query(collection(db, 'submittedDilemmas'), limit(100))
      );
      dilemmasSnap.docs.forEach((d) => {
        const data = d.data();
        const title = (data.title || '').toLowerCase();
        const description = (data.description || '').toLowerCase();
        if (title.includes(lowerQuery) || description.includes(lowerQuery)) {
          results.dilemmas.push({
            id: d.id,
            title: data.title || '',
            description: data.description || '',
          });
        }
      });
    } catch (e) {
      console.error('[search] dilemmas search error:', e);
    }

    // Search ethical theories
    try {
      const theoriesSnap = await getDocs(
        query(collection(db, 'ethicalTheories'), limit(100))
      );
      theoriesSnap.docs.forEach((d) => {
        const data = d.data();
        const name = (data.name || '').toLowerCase();
        const description = (data.description || '').toLowerCase();
        if (name.includes(lowerQuery) || description.includes(lowerQuery)) {
          results.theories.push({
            id: d.id,
            name: data.name || '',
            description: data.description || '',
          });
        }
      });
    } catch (e) {
      console.error('[search] theories search error:', e);
    }

    return { success: true, data: results };
  } catch (error) {
    console.error('[search] searchAll error:', error);
    return { success: false, error: String(error) };
  }
}
