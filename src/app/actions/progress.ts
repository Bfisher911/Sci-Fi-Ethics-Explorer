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
import { computeNextStreak } from '@/lib/streak';

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
    // Read first so we can conditionally clear lastStoryInProgress
    // without overwriting unrelated fields. The merge:true on setDoc
    // doesn't support null deletion the way we'd want here, so we
    // just stamp the completion + leave lastStoryInProgress for the
    // dashboard logic to detect-and-skip via storiesCompleted overlap.
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
        // Stamp the story as the most-recent one in flight. The
        // dashboard's "Continue where you left off" surface reads this
        // to nudge the user back into a story they didn't finish.
        // Cleared by recordStoryCompletion when they hit the end.
        lastStoryInProgress: storyId,
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

/**
 * Bumps the user's daily streak. Idempotent — calling twice in the
 * same UTC day is a no-op. Call from the dashboard mount, the
 * textbook chapter view, the studio, etc. — anywhere a returning
 * user lands. Bumping the streak from many places is fine; the
 * dedup-by-day below makes it cheap.
 *
 * Streak rules:
 *   - same day  → no change
 *   - +1 day    → currentStreakDays += 1
 *   - +2+ days  → currentStreakDays = 1 (broken)
 * Always tracks the all-time longest in `longestStreakDays`.
 */
export async function recordDailyActivity(
  userId: string,
): Promise<
  ProgressActionResult<{ currentStreakDays: number; isNewDay: boolean }>
> {
  if (!userId || !db) {
    return { success: false, error: 'User ID and Firestore are required.' };
  }
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
    const docRef = doc(db, 'userProgress', userId);
    const snap = await getDoc(docRef);
    const data = snap.exists() ? snap.data() : {};
    const lastDay: string | undefined = data.lastStreakDay;
    const currentStreak: number = data.currentStreakDays ?? 0;
    const longestStreak: number = data.longestStreakDays ?? 0;

    // Pure rule lives in src/lib/streak.ts so it can be unit-tested
    // without Firestore. Same-day visits are a no-op write.
    const { nextStreak, isNewDay } = computeNextStreak({
      lastDay,
      today,
      currentStreak,
    });
    if (!isNewDay) {
      return {
        success: true,
        data: { currentStreakDays: nextStreak, isNewDay: false },
      };
    }
    const nextLongest = Math.max(longestStreak, nextStreak);

    await setDoc(
      docRef,
      {
        userId,
        lastStreakDay: today,
        currentStreakDays: nextStreak,
        longestStreakDays: nextLongest,
        lastActivity: serverTimestamp(),
      },
      { merge: true },
    );
    return {
      success: true,
      data: { currentStreakDays: nextStreak, isNewDay: true },
    };
  } catch (error) {
    console.error('[SERVER ACTION] recordDailyActivity error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to record activity: ${msg}` };
  }
}

/**
 * Returns the story the user was last reading but hasn't completed.
 * Cheap single-read: just the `lastStoryInProgress` field on userProgress
 * cross-referenced against `storiesCompleted`.
 */
export async function getInProgressStory(
  userId: string,
): Promise<
  ProgressActionResult<{ storyId: string; choicesMade: number } | null>
> {
  if (!userId || !db) return { success: true, data: null };
  try {
    const snap = await getDoc(doc(db, 'userProgress', userId));
    if (!snap.exists()) return { success: true, data: null };
    const d = snap.data();
    const storyId: string | undefined = d.lastStoryInProgress;
    if (!storyId) return { success: true, data: null };
    const completed: string[] = d.storiesCompleted || [];
    if (completed.includes(storyId)) return { success: true, data: null };
    const choices: string[] = d.storyChoices?.[storyId] || [];
    return { success: true, data: { storyId, choicesMade: choices.length } };
  } catch (error) {
    console.error('[SERVER ACTION] getInProgressStory error:', error);
    return { success: true, data: null };
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
