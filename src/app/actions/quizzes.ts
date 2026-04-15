
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
  query, where, orderBy, limit as fsLimit, serverTimestamp,
} from 'firebase/firestore';
import type {
  Quiz, QuizQuestion, QuizAttempt, QuizSubjectType,
} from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { requireAdmin } from '@/lib/admin';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function quizFromDoc(id: string, data: Record<string, any>): Quiz {
  return {
    id,
    subjectType: data.subjectType,
    subjectId: data.subjectId,
    subjectName: data.subjectName || '',
    title: data.title || '',
    description: data.description,
    questions: data.questions || [],
    estimatedMinutes: data.estimatedMinutes,
    passingScorePercent: data.passingScorePercent ?? 80,
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

function attemptFromDoc(id: string, data: Record<string, any>): QuizAttempt {
  return {
    id,
    quizId: data.quizId,
    userId: data.userId,
    subjectType: data.subjectType,
    subjectId: data.subjectId,
    answers: data.answers || [],
    scorePercent: data.scorePercent ?? 0,
    passed: data.passed ?? false,
    xpAwarded: data.xpAwarded,
    completedAt: timestampToDate(data.completedAt) ?? new Date(),
  };
}

/**
 * Create or replace a quiz. Quiz IDs are deterministic so each subject
 * has at most one canonical quiz: `{subjectType}-{subjectId}`.
 */
export async function upsertQuiz(input: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<string>> {
  try {
    const id = `${input.subjectType}-${input.subjectId}`;
    await setDoc(
      doc(db, 'quizzes', id),
      {
        ...input,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: id };
  } catch (error) {
    console.error('[quizzes] upsertQuiz error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getQuizForSubject(
  subjectType: QuizSubjectType,
  subjectId: string
): Promise<ActionResult<Quiz | null>> {
  try {
    const id = `${subjectType}-${subjectId}`;
    const snap = await getDoc(doc(db, 'quizzes', id));
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: quizFromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[quizzes] getQuizForSubject error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getAllQuizzes(): Promise<ActionResult<Quiz[]>> {
  try {
    const snap = await getDocs(collection(db, 'quizzes'));
    return { success: true, data: snap.docs.map((d) => quizFromDoc(d.id, d.data())) };
  } catch (error) {
    console.error('[quizzes] getAllQuizzes error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Submit a quiz attempt. Awards XP if score >= passing.
 */
export async function submitQuizAttempt(input: {
  quizId: string;
  userId: string;
  subjectType: QuizSubjectType;
  subjectId: string;
  answers: number[];
}): Promise<ActionResult<QuizAttempt>> {
  try {
    const quizSnap = await getDoc(doc(db, 'quizzes', input.quizId));
    if (!quizSnap.exists()) return { success: false, error: 'Quiz not found.' };
    const quiz = quizFromDoc(quizSnap.id, quizSnap.data());

    const total = quiz.questions.length;
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (input.answers[i] === q.correctAnswerIndex) correct++;
    });
    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = scorePercent >= (quiz.passingScorePercent || 80);

    // Check for prior pass to prevent double XP
    const priorPassQ = query(
      collection(db, 'quizAttempts'),
      where('userId', '==', input.userId),
      where('subjectId', '==', input.subjectId),
      where('passed', '==', true),
      fsLimit(1)
    );
    const priorPassSnap = await getDocs(priorPassQ);
    const xpAwarded = passed && priorPassSnap.empty ? 50 : 0;

    const ref = await addDoc(collection(db, 'quizAttempts'), {
      quizId: input.quizId,
      userId: input.userId,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      answers: input.answers,
      scorePercent,
      passed,
      xpAwarded,
      completedAt: serverTimestamp(),
    });

    const attempt = await getDoc(ref);
    return {
      success: true,
      data: attemptFromDoc(attempt.id, attempt.data() || {}),
    };
  } catch (error) {
    console.error('[quizzes] submitQuizAttempt error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get user's best attempt for each subject they've taken a quiz on.
 */
export async function getUserBestAttempts(userId: string): Promise<ActionResult<QuizAttempt[]>> {
  try {
    const q = query(
      collection(db, 'quizAttempts'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => attemptFromDoc(d.id, d.data()));

    // Reduce to best per subject
    const bestBySubject = new Map<string, QuizAttempt>();
    for (const a of all) {
      const prior = bestBySubject.get(a.subjectId);
      if (!prior || a.scorePercent > prior.scorePercent) {
        bestBySubject.set(a.subjectId, a);
      }
    }
    return { success: true, data: Array.from(bestBySubject.values()) };
  } catch (error) {
    console.error('[quizzes] getUserBestAttempts error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Admin: list which subjects don't yet have a quiz.
 */
export async function listMissingQuizSubjects(adminUid: string): Promise<ActionResult<{
  philosophers: { id: string; name: string }[];
  theories: { id: string; name: string }[];
}>> {
  try {
    await requireAdmin(adminUid);

    const [philSnap, theorySnap, quizSnap] = await Promise.all([
      getDocs(collection(db, 'philosophers')),
      getDocs(collection(db, 'ethicalTheories')),
      getDocs(collection(db, 'quizzes')),
    ]);

    const existingQuizIds = new Set(quizSnap.docs.map((d) => d.id));

    const missingPhils: { id: string; name: string }[] = [];
    philSnap.docs.forEach((d) => {
      if (!existingQuizIds.has(`philosopher-${d.id}`)) {
        missingPhils.push({ id: d.id, name: d.data().name || d.id });
      }
    });

    const missingTheories: { id: string; name: string }[] = [];
    theorySnap.docs.forEach((d) => {
      if (!existingQuizIds.has(`theory-${d.id}`)) {
        missingTheories.push({ id: d.id, name: d.data().name || d.id });
      }
    });

    return {
      success: true,
      data: { philosophers: missingPhils, theories: missingTheories },
    };
  } catch (error: any) {
    console.error('[quizzes] listMissingQuizSubjects error:', error);
    return { success: false, error: error.message };
  }
}
