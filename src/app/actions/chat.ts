'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import type { ChatSession, ChatMessage } from '@/types';

type ChatActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function toDate(field: Timestamp | Date | undefined | null): Date | undefined {
  if (!field) return undefined;
  if (field instanceof Date) return field;
  if (typeof (field as Timestamp).toDate === 'function') return (field as Timestamp).toDate();
  if (typeof field === 'string') return new Date(field);
  return undefined;
}

function serializeSession(id: string, data: Record<string, any>): ChatSession {
  const messages: ChatMessage[] = (data.messages || []).map((m: any) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp instanceof Date
      ? m.timestamp
      : typeof m.timestamp?.toDate === 'function'
        ? m.timestamp.toDate()
        : new Date(m.timestamp),
  }));

  return {
    id,
    userId: data.userId,
    title: data.title,
    messages,
    createdAt: toDate(data.createdAt) ?? new Date(),
    lastMessageAt: toDate(data.lastMessageAt) ?? new Date(),
  };
}

export async function saveChatSession(session: {
  id?: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
}): Promise<ChatActionResult<{ id: string }>> {
  if (!session.userId) {
    return { success: false, error: 'User ID is required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const colRef = collection(db, 'chatSessions');
    const docRef = session.id ? doc(colRef, session.id) : doc(colRef);

    const serializedMessages = session.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
    }));

    const data: Record<string, any> = {
      userId: session.userId,
      title: session.title,
      messages: serializedMessages,
      lastMessageAt: serverTimestamp(),
    };

    if (!session.id) {
      data.createdAt = serverTimestamp();
    }

    await setDoc(docRef, data, { merge: true });
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('[SERVER ACTION] saveChatSession error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to save chat session: ${msg}` };
  }
}

export async function getChatSessions(
  userId: string
): Promise<ChatActionResult<ChatSession[]>> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const colRef = collection(db, 'chatSessions');
    const q = query(colRef, where('userId', '==', userId), orderBy('lastMessageAt', 'desc'));
    const snapshot = await getDocs(q);

    const sessions: ChatSession[] = snapshot.docs.map((docSnap) =>
      serializeSession(docSnap.id, docSnap.data())
    );

    return { success: true, data: sessions };
  } catch (error) {
    console.error('[SERVER ACTION] getChatSessions error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to fetch chat sessions: ${msg}` };
  }
}

export async function getChatSessionById(
  sessionId: string
): Promise<ChatActionResult<ChatSession | null>> {
  if (!sessionId) {
    return { success: false, error: 'Session ID is required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const docRef = doc(db, 'chatSessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: true, data: null };
    }

    return { success: true, data: serializeSession(docSnap.id, docSnap.data()) };
  } catch (error) {
    console.error('[SERVER ACTION] getChatSessionById error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to fetch chat session: ${msg}` };
  }
}

export async function deleteChatSession(
  sessionId: string,
  userId: string
): Promise<ChatActionResult<undefined>> {
  if (!sessionId || !userId) {
    return { success: false, error: 'Session ID and User ID are required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const docRef = doc(db, 'chatSessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Session not found.' };
    }

    if (docSnap.data().userId !== userId) {
      return { success: false, error: 'Not authorized to delete this session.' };
    }

    await deleteDoc(docRef);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[SERVER ACTION] deleteChatSession error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to delete chat session: ${msg}` };
  }
}
