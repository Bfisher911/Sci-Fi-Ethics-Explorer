
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
import { getStaticScifiAuthorQuiz } from '@/data/scifi-author-quizzes';
import { getStaticScifiMediaQuiz } from '@/data/scifi-media-quizzes';
import { getStaticTextbookQuiz } from '@/data/textbook/quizzes';
import { getStaticEthicalTheoryQuiz } from '@/data/theory-quizzes';
import { masterExamQuiz } from '@/data/master-exam';

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
    if (snap.exists()) {
      return { success: true, data: quizFromDoc(snap.id, snap.data()) };
    }

    // Static fallbacks for hand-authored quizzes that may not have been
    // seeded into Firestore yet.
    if (subjectType === 'scifi-author') {
      const fallback = getStaticScifiAuthorQuiz(subjectId);
      if (fallback) return { success: true, data: fallback };
    }
    if (subjectType === 'scifi-media') {
      const fallback = getStaticScifiMediaQuiz(subjectId);
      if (fallback) return { success: true, data: fallback };
    }
    if (subjectType === 'theory') {
      const fallback = getStaticEthicalTheoryQuiz(subjectId);
      if (fallback) return { success: true, data: fallback };
    }
    if (subjectType === 'book-chapter' || subjectType === 'book-final') {
      const fallback = getStaticTextbookQuiz(subjectId);
      if (fallback) return { success: true, data: fallback };
      // The Master Technology Ethicist exam shares the 'book-final'
      // subjectType so it threads through the same UI. It lives in
      // src/data/master-exam.ts.
      if (subjectId === 'master-technology-ethicist') {
        return { success: true, data: masterExamQuiz };
      }
    }

    return { success: true, data: null };
  } catch (error) {
    console.error('[quizzes] getQuizForSubject error:', error);
    if (subjectType === 'scifi-author') {
      const fallback = getStaticScifiAuthorQuiz(subjectId);
      if (fallback) return { success: true, data: fallback };
    }
    if (subjectType === 'scifi-media') {
      const fallback = getStaticScifiMediaQuiz(subjectId);
      if (fallback) return { success: true, data: fallback };
    }
    if (subjectType === 'theory') {
      const fallback = getStaticEthicalTheoryQuiz(subjectId);
      if (fallback) return { success: true, data: fallback };
    }
    if (subjectType === 'book-chapter' || subjectType === 'book-final') {
      const fallback = getStaticTextbookQuiz(subjectId);
      if (fallback) return { success: true, data: fallback };
    }
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
    let quiz: Quiz | null = quizSnap.exists()
      ? quizFromDoc(quizSnap.id, quizSnap.data())
      : null;
    if (!quiz && input.subjectType === 'scifi-author') {
      quiz = getStaticScifiAuthorQuiz(input.subjectId);
    }
    if (!quiz && input.subjectType === 'scifi-media') {
      quiz = getStaticScifiMediaQuiz(input.subjectId);
    }
    if (!quiz && input.subjectType === 'theory') {
      quiz = getStaticEthicalTheoryQuiz(input.subjectId);
    }
    if (!quiz && (input.subjectType === 'book-chapter' || input.subjectType === 'book-final')) {
      quiz = getStaticTextbookQuiz(input.subjectId);
      if (!quiz && input.subjectId === 'master-technology-ethicist') {
        quiz = masterExamQuiz;
      }
    }
    if (!quiz) return { success: false, error: 'Quiz not found.' };

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
  scifiAuthors: { id: string; name: string }[];
  scifiMedia: { id: string; name: string }[];
}>> {
  try {
    await requireAdmin(adminUid);

    const [philSnap, theorySnap, authorSnap, quizSnap] = await Promise.all([
      getDocs(collection(db, 'philosophers')),
      getDocs(collection(db, 'ethicalTheories')),
      getDocs(collection(db, 'scifiAuthors')).catch(() => ({ docs: [] as any[] })),
      getDocs(collection(db, 'quizzes')),
    ]);

    const existingQuizIds = new Set(quizSnap.docs.map((d: any) => d.id));

    const missingPhils: { id: string; name: string }[] = [];
    philSnap.docs.forEach((d: any) => {
      if (!existingQuizIds.has(`philosopher-${d.id}`)) {
        missingPhils.push({ id: d.id, name: d.data().name || d.id });
      }
    });

    const missingTheories: { id: string; name: string }[] = [];
    theorySnap.docs.forEach((d: any) => {
      if (!existingQuizIds.has(`theory-${d.id}`)) {
        missingTheories.push({ id: d.id, name: d.data().name || d.id });
      }
    });

    // Sci-fi authors: check Firestore first; if no docs there, use static
    // data so the admin page always shows all authors even when they haven't
    // been seeded into Firestore.
    const missingAuthors: { id: string; name: string }[] = [];
    if (authorSnap.docs.length > 0) {
      authorSnap.docs.forEach((d: any) => {
        if (!existingQuizIds.has(`scifi-author-${d.id}`)) {
          missingAuthors.push({ id: d.id, name: d.data().name || d.id });
        }
      });
    } else {
      const { scifiAuthorData } = await import('@/data/scifi-authors');
      for (const a of scifiAuthorData) {
        if (!existingQuizIds.has(`scifi-author-${a.id}`)) {
          missingAuthors.push({ id: a.id, name: a.name });
        }
      }
    }

    // Sci-fi media
    const missingMedia: { id: string; name: string }[] = [];
    try {
      const mediaSnap = await getDocs(collection(db, 'scifiMedia'));
      if (mediaSnap.docs.length > 0) {
        mediaSnap.docs.forEach((d: any) => {
          if (!existingQuizIds.has(`scifi-media-${d.id}`)) {
            missingMedia.push({ id: d.id, name: d.data().title || d.id });
          }
        });
      } else {
        const { scifiMediaData } = await import('@/data/scifi-media');
        for (const m of scifiMediaData) {
          if (!existingQuizIds.has(`scifi-media-${m.id}`)) {
            missingMedia.push({ id: m.id, name: m.title });
          }
        }
      }
    } catch {
      const { scifiMediaData } = await import('@/data/scifi-media');
      for (const m of scifiMediaData) {
        if (!existingQuizIds.has(`scifi-media-${m.id}`)) {
          missingMedia.push({ id: m.id, name: m.title });
        }
      }
    }

    return {
      success: true,
      data: {
        philosophers: missingPhils,
        theories: missingTheories,
        scifiAuthors: missingAuthors,
        scifiMedia: missingMedia,
      },
    };
  } catch (error: any) {
    console.error('[quizzes] listMissingQuizSubjects error:', error);
    return { success: false, error: error.message };
  }
}
