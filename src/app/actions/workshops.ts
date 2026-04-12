'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import type { Workshop, WorkshopMessage } from '@/types';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Creates a new collaborative workshop.
 */
export async function createWorkshop(data: {
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  maxParticipants?: number;
  dilemmaId?: string;
  storyId?: string;
}): Promise<ActionResult<string>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }
  if (!data.title.trim() || !data.hostId) {
    return { success: false, error: 'Title and host ID are required.' };
  }

  try {
    const workshopData = {
      title: data.title.trim(),
      description: data.description.trim(),
      hostId: data.hostId,
      hostName: data.hostName,
      status: 'active' as const,
      participantIds: [data.hostId],
      maxParticipants: data.maxParticipants ?? 20,
      dilemmaId: data.dilemmaId || null,
      storyId: data.storyId || null,
      sharedNotes: '',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'workshops'), workshopData);
    return { success: true, data: docRef.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] createWorkshop error:', message);
    return { success: false, error: `Could not create workshop. ${message}` };
  }
}

/**
 * Joins an existing workshop.
 */
export async function joinWorkshop(
  workshopId: string,
  userId: string
): Promise<ActionResult<undefined>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const workshopRef = doc(db, 'workshops', workshopId);
    const workshopSnap = await getDoc(workshopRef);

    if (!workshopSnap.exists()) {
      return { success: false, error: 'Workshop not found.' };
    }

    const workshopData = workshopSnap.data() as Workshop;
    if (workshopData.participantIds.length >= workshopData.maxParticipants) {
      return { success: false, error: 'Workshop is full.' };
    }

    await updateDoc(workshopRef, {
      participantIds: arrayUnion(userId),
    });
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] joinWorkshop error:', message);
    return { success: false, error: `Could not join workshop. ${message}` };
  }
}

/**
 * Fetches all active workshops.
 */
export async function getWorkshops(): Promise<ActionResult<Workshop[]>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const q = query(
      collection(db, 'workshops'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const workshops: Workshop[] = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        title: d.title,
        description: d.description,
        hostId: d.hostId,
        hostName: d.hostName,
        status: d.status,
        participantIds: d.participantIds ?? [],
        maxParticipants: d.maxParticipants ?? 20,
        dilemmaId: d.dilemmaId,
        storyId: d.storyId,
        sharedNotes: d.sharedNotes ?? '',
        createdAt: d.createdAt?.toDate?.() ?? new Date(),
        startedAt: d.startedAt?.toDate?.() ?? undefined,
        endedAt: d.endedAt?.toDate?.() ?? undefined,
      } as Workshop;
    });
    return { success: true, data: workshops };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] getWorkshops error:', message);
    return { success: false, error: `Could not fetch workshops. ${message}` };
  }
}

/**
 * Fetches a single workshop by ID.
 */
export async function getWorkshopById(
  id: string
): Promise<ActionResult<Workshop | null>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const docRef = doc(db, 'workshops', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: true, data: null };
    }

    const d = docSnap.data();
    const workshop: Workshop = {
      id: docSnap.id,
      title: d.title,
      description: d.description,
      hostId: d.hostId,
      hostName: d.hostName,
      status: d.status,
      participantIds: d.participantIds ?? [],
      maxParticipants: d.maxParticipants ?? 20,
      dilemmaId: d.dilemmaId,
      storyId: d.storyId,
      sharedNotes: d.sharedNotes ?? '',
      createdAt: d.createdAt?.toDate?.() ?? new Date(),
      startedAt: d.startedAt?.toDate?.() ?? undefined,
      endedAt: d.endedAt?.toDate?.() ?? undefined,
    };
    return { success: true, data: workshop };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] getWorkshopById error:', message);
    return { success: false, error: `Could not fetch workshop. ${message}` };
  }
}

/**
 * Updates the shared notes of a workshop.
 */
export async function updateSharedNotes(
  workshopId: string,
  notes: string
): Promise<ActionResult<undefined>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const workshopRef = doc(db, 'workshops', workshopId);
    await updateDoc(workshopRef, { sharedNotes: notes });
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] updateSharedNotes error:', message);
    return { success: false, error: `Could not update notes. ${message}` };
  }
}

/**
 * Sends a message to a workshop's chat.
 */
export async function sendWorkshopMessage(data: {
  workshopId: string;
  authorId: string;
  authorName: string;
  content: string;
}): Promise<ActionResult<string>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const messageData = {
      workshopId: data.workshopId,
      authorId: data.authorId,
      authorName: data.authorName,
      content: data.content.trim(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, 'workshops', data.workshopId, 'messages'),
      messageData
    );
    return { success: true, data: docRef.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] sendWorkshopMessage error:', message);
    return { success: false, error: `Could not send message. ${message}` };
  }
}
