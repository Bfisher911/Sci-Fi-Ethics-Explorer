'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import type { Philosopher } from '@/types';
import { philosopherData } from '@/data/philosophers';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function philosopherFromDoc(
  id: string,
  data: Record<string, any>
): Philosopher {
  return {
    id,
    name: data.name || '',
    era: data.era || '',
    bio: data.bio || '',
    keyIdeas: data.keyIdeas || [],
    relatedFrameworks: data.relatedFrameworks || [],
    famousWorks: data.famousWorks || [],
    imageUrl: data.imageUrl,
    imageHint: data.imageHint,
  };
}

/**
 * Fetch all philosophers. Tries Firestore first, falls back to static data.
 */
export async function getPhilosophers(): Promise<ActionResult<Philosopher[]>> {
  try {
    const q = query(collection(db, 'philosophers'), orderBy('name'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const philosophers = snapshot.docs.map((d) =>
        philosopherFromDoc(d.id, d.data())
      );
      return { success: true, data: philosophers };
    }

    // Fallback to static data
    return { success: true, data: philosopherData };
  } catch (error) {
    console.error(
      '[philosophers] getPhilosophers Firestore error, falling back to static data:',
      error
    );
    return { success: true, data: philosopherData };
  }
}

/**
 * Fetch a single philosopher by ID. Tries Firestore first, falls back to static data.
 */
export async function getPhilosopherById(
  id: string
): Promise<ActionResult<Philosopher | null>> {
  try {
    const snap = await getDoc(doc(db, 'philosophers', id));
    if (snap.exists()) {
      return {
        success: true,
        data: philosopherFromDoc(snap.id, snap.data()),
      };
    }

    // Fallback to static data
    const staticPhilosopher = philosopherData.find((p) => p.id === id) || null;
    return { success: true, data: staticPhilosopher };
  } catch (error) {
    console.error(
      '[philosophers] getPhilosopherById Firestore error, falling back to static:',
      error
    );
    const staticPhilosopher = philosopherData.find((p) => p.id === id) || null;
    return { success: true, data: staticPhilosopher };
  }
}
