'use server';

import { db } from '@/lib/firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  increment,
  type Timestamp,
} from 'firebase/firestore';
import type { UserProgress, QuizResult } from '@/types';

type ProgressActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function toDate(field: Timestamp | Date | undefined | null): Date | undefined {
  if (!field) return undefined;
  if (field instanceof Date) return field;
  if (typeof (field as Timestamp).toDate === 'function') return (field as Timestamp).toDate();
  if (typeof field === 'string') return new Date(field);
  return undefined;
}

const DEFAULT_PROGRESS: Omit<UserProgress, 'userId'> = {
  storiesCompleted: [],
  storyChoices: {},
  quizResults: [],
  scenariosAnalyzed: 0,
  debatesParticipated: [],
  dilemmasSubmitted: [],
  lastActivity: new Date(),
};

export async function getUserProgress(
  userId: string
): Promise<ProgressActionResult<UserProgress>> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const docRef = doc(db, 'userProgress', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const defaultProgress: UserProgress = {
        userId,
        ...DEFAULT_PROGRESS,
      };
      await setDoc(docRef, { ...defaultProgress, lastActivity: serverTimestamp() });
      return { success: true, data: defaultProgress };
    }

    const data = docSnap.data();

    const quizResults: QuizResult[] = (data.quizResults || []).map((qr: any) => ({
      id: qr.id,
      completedAt: qr.completedAt instanceof Date
        ? qr.completedAt
        : typeof qr.completedAt?.toDate === 'function'
          ? qr.completedAt.toDate()
          : new Date(qr.completedAt),
      scores: qr.scores || {},
      dominantFramework: qr.dominantFramework || '',
    }));

    const progress: UserProgress = {
      userId,
      storiesCompleted: data.storiesCompleted || [],
      storyChoices: data.storyChoices || {},
      quizResults,
      scenariosAnalyzed: data.scenariosAnalyzed || 0,
      debatesParticipated: data.debatesParticipated || [],
      dilemmasSubmitted: data.dilemmasSubmitted || [],
      lastActivity: toDate(data.lastActivity) ?? new Date(),
    };

    return { success: true, data: progress };
  } catch (error) {
    console.error('[SERVER ACTION] getUserProgress error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to fetch user progress: ${msg}` };
  }
}

export async function recordStoryCompletion(
  userId: string,
  storyId: string
): Promise<ProgressActionResult<undefined>> {
  if (!userId || !storyId) {
    return { success: false, error: 'User ID and Story ID are required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const docRef = doc(db, 'userProgress', userId);
    await setDoc(
      docRef,
      {
        userId,
        storiesCompleted: arrayUnion(storyId),
        lastActivity: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[SERVER ACTION] recordStoryCompletion error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to record story completion: ${msg}` };
  }
}

export async function recordStoryChoice(
  userId: string,
  storyId: string,
  choiceText: string
): Promise<ProgressActionResult<undefined>> {
  if (!userId || !storyId || !choiceText) {
    return { success: false, error: 'User ID, Story ID, and choice text are required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const docRef = doc(db, 'userProgress', userId);
    await setDoc(
      docRef,
      {
        userId,
        [`storyChoices.${storyId}`]: arrayUnion(choiceText),
        lastActivity: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[SERVER ACTION] recordStoryChoice error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to record story choice: ${msg}` };
  }
}

export async function recordQuizResult(
  userId: string,
  result: QuizResult
): Promise<ProgressActionResult<undefined>> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const serializedResult = {
      ...result,
      completedAt:
        result.completedAt instanceof Date
          ? result.completedAt.toISOString()
          : String(result.completedAt),
    };

    const docRef = doc(db, 'userProgress', userId);
    await setDoc(
      docRef,
      {
        userId,
        quizResults: arrayUnion(serializedResult),
        lastActivity: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[SERVER ACTION] recordQuizResult error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to record quiz result: ${msg}` };
  }
}

export async function recordAnalysis(
  userId: string
): Promise<ProgressActionResult<undefined>> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const docRef = doc(db, 'userProgress', userId);
    await setDoc(
      docRef,
      {
        userId,
        scenariosAnalyzed: increment(1),
        lastActivity: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[SERVER ACTION] recordAnalysis error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to record analysis: ${msg}` };
  }
}

export async function recordDebateParticipation(
  userId: string,
  debateId: string
): Promise<ProgressActionResult<undefined>> {
  if (!userId || !debateId) {
    return { success: false, error: 'User ID and Debate ID are required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const docRef = doc(db, 'userProgress', userId);
    await setDoc(
      docRef,
      {
        userId,
        debatesParticipated: arrayUnion(debateId),
        lastActivity: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[SERVER ACTION] recordDebateParticipation error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to record debate participation: ${msg}` };
  }
}
