'use server';

import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { Story, SubmittedDilemma, EthicalTheory } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { philosopherData } from '@/data/philosophers';
import { scifiAuthorData } from '@/data/scifi-authors';
import { scifiMediaData } from '@/data/scifi-media';
import { ethicalTheories } from '@/data/ethical-theories';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface SearchResults {
  stories: { id: string; title: string; description: string }[];
  dilemmas: { id: string; title: string; description: string }[];
  theories: { id: string; name: string; description: string }[];
  philosophers: { id: string; name: string; description: string }[];
  scifiAuthors: { id: string; name: string; description: string }[];
  scifiMedia: { id: string; title: string; description: string }[];
}

const EMPTY_RESULTS: SearchResults = {
  stories: [],
  dilemmas: [],
  theories: [],
  philosophers: [],
  scifiAuthors: [],
  scifiMedia: [],
};

/**
 * Search across stories, submitted dilemmas, ethical theories, and the
 * library (philosophers, sci-fi authors, sci-fi media). Library entries
 * are searched in the static datasets (the canonical source), so no
 * extra Firestore reads are needed for them. Firestore collections are
 * filtered in application code since Firestore has no full-text search.
 */
export async function searchAll(
  queryText: string
): Promise<ActionResult<SearchResults>> {
  try {
    const lowerQuery = queryText.toLowerCase().trim();
    if (!lowerQuery) {
      return {
        success: true,
        data: { ...EMPTY_RESULTS },
      };
    }

    const results: SearchResults = { ...EMPTY_RESULTS };

    // Library entries (static data — instant, no reads).
    results.philosophers = philosopherData
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.keyIdeas.some((k) => k.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.keyIdeas.slice(0, 3).join(' · '),
      }));
    results.scifiAuthors = scifiAuthorData
      .filter(
        (a) =>
          a.name.toLowerCase().includes(lowerQuery) ||
          a.themes.some((t) => t.toLowerCase().includes(lowerQuery)) ||
          a.notableWorks.some((w) => w.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 20)
      .map((a) => ({
        id: a.id,
        name: a.name,
        description: a.techEthicsFocus || a.themes.slice(0, 3).join(' · '),
      }));
    results.scifiMedia = scifiMediaData
      .filter(
        (m) =>
          m.title.toLowerCase().includes(lowerQuery) ||
          m.creator.toLowerCase().includes(lowerQuery) ||
          m.ethicsExplored.some((e) => e.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 20)
      .map((m) => ({
        id: m.id,
        title: m.title,
        description: `${m.year} · ${m.ethicsExplored.slice(0, 3).join(' · ')}`,
      }));

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

    // Search ethical theories from STATIC data (the glossary's source of
    // truth). Previously this queried an `ethicalTheories` Firestore
    // collection that is never seeded, so theory search always returned
    // nothing. Match the philosophers/authors/media static pattern above.
    results.theories = ethicalTheories
      .filter((t) => {
        const name = t.name.toLowerCase();
        const description = (t.description || '').toLowerCase();
        const concepts = (t.keyConcepts || []).join(' ').toLowerCase();
        return (
          name.includes(lowerQuery) ||
          description.includes(lowerQuery) ||
          concepts.includes(lowerQuery)
        );
      })
      .slice(0, 20)
      .map((t) => ({
        id: t.id,
        name: t.name,
        description: (t.keyConcepts || []).slice(0, 3).join(' · ') ||
          t.description.slice(0, 120),
      }));

    return { success: true, data: results };
  } catch (error) {
    console.error('[search] searchAll error:', error);
    return { success: false, error: String(error) };
  }
}
