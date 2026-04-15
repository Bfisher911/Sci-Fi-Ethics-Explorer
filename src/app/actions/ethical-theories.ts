
'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import type { EthicalTheory, Philosopher } from '@/types';
import { ethicalTheories } from '@/data/ethical-theories';
import { philosopherData } from '@/data/philosophers';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function theoryFromDoc(id: string, data: Record<string, any>): EthicalTheory {
  return {
    id,
    name: data.name || '',
    description: data.description || '',
    proponents: data.proponents,
    keyConcepts: data.keyConcepts,
    exampleScenario: data.exampleScenario,
    imageUrl: data.imageUrl,
    imageHint: data.imageHint,
  };
}

/**
 * Fetch all ethical theories. Tries Firestore first, falls back to static.
 */
export async function getEthicalTheories(): Promise<ActionResult<EthicalTheory[]>> {
  try {
    const q = query(collection(db, 'ethicalTheories'), orderBy('name'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return {
        success: true,
        data: snapshot.docs.map((d) => theoryFromDoc(d.id, d.data())),
      };
    }
    return { success: true, data: ethicalTheories };
  } catch (error) {
    console.error('[ethical-theories] getEthicalTheories error, falling back:', error);
    return { success: true, data: ethicalTheories };
  }
}

/**
 * Fetch a single theory by ID.
 */
export async function getEthicalTheoryById(
  id: string
): Promise<ActionResult<EthicalTheory | null>> {
  try {
    const snap = await getDoc(doc(db, 'ethicalTheories', id));
    if (snap.exists()) {
      return { success: true, data: theoryFromDoc(snap.id, snap.data()) };
    }
    return { success: true, data: ethicalTheories.find((t) => t.id === id) || null };
  } catch (error) {
    console.error('[ethical-theories] getEthicalTheoryById error, falling back:', error);
    return { success: true, data: ethicalTheories.find((t) => t.id === id) || null };
  }
}

/**
 * Fetch philosophers whose `relatedFrameworks` contains the given theory id.
 * Tries Firestore first, falls back to static data.
 */
export async function getPhilosophersForTheory(
  theoryId: string
): Promise<ActionResult<Philosopher[]>> {
  try {
    const snap = await getDocs(collection(db, 'philosophers'));
    const all: Philosopher[] = snap.empty
      ? philosopherData
      : snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || '',
            era: data.era || '',
            bio: data.bio || '',
            keyIdeas: data.keyIdeas || [],
            relatedFrameworks: data.relatedFrameworks || [],
            famousWorks: data.famousWorks || [],
            imageUrl: data.imageUrl,
            imageHint: data.imageHint,
          };
        });
    return {
      success: true,
      data: all.filter((p) => p.relatedFrameworks?.includes(theoryId)),
    };
  } catch (error) {
    console.error('[ethical-theories] getPhilosophersForTheory error, falling back:', error);
    return {
      success: true,
      data: philosopherData.filter((p) => p.relatedFrameworks?.includes(theoryId)),
    };
  }
}
