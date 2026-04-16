'use server';

import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { requireAdmin } from '@/lib/admin';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { upsertQuiz } from '@/app/actions/quizzes';
import { philosopherData } from '@/data/philosophers';
import { ethicalTheories } from '@/data/ethical-theories';
import { scifiAuthorData } from '@/data/scifi-authors';
import type { QuizSubjectType } from '@/types';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Resolve subject name + rich context (bio/description) from Firestore,
 * falling back to the static data bundle when the document is missing.
 */
async function loadSubject(
  subjectType: QuizSubjectType,
  subjectId: string
): Promise<{ name: string; context: string } | null> {
  if (subjectType === 'philosopher') {
    try {
      const snap = await getDoc(doc(db, 'philosophers', subjectId));
      if (snap.exists()) {
        const d = snap.data();
        return {
          name: d.name || subjectId,
          context: d.bio || '',
        };
      }
    } catch (error) {
      console.warn(
        '[quiz-generation] philosopher Firestore lookup failed, falling back:',
        error
      );
    }
    const fallback = philosopherData.find((p) => p.id === subjectId);
    if (!fallback) return null;
    return { name: fallback.name, context: fallback.bio };
  }

  if (subjectType === 'scifi-author') {
    try {
      const snap = await getDoc(doc(db, 'scifiAuthors', subjectId));
      if (snap.exists()) {
        const d = snap.data();
        return {
          name: d.name || subjectId,
          context: [d.bio, d.techEthicsFocus].filter(Boolean).join('\n\n'),
        };
      }
    } catch (error) {
      console.warn(
        '[quiz-generation] scifi-author Firestore lookup failed, falling back:',
        error
      );
    }
    const fallback = scifiAuthorData.find((a) => a.id === subjectId);
    if (!fallback) return null;
    return {
      name: fallback.name,
      context: [fallback.bio, fallback.techEthicsFocus].filter(Boolean).join('\n\n'),
    };
  }

  // theory
  try {
    const snap = await getDoc(doc(db, 'ethicalTheories', subjectId));
    if (snap.exists()) {
      const d = snap.data();
      return {
        name: d.name || subjectId,
        context: d.description || '',
      };
    }
  } catch (error) {
    console.warn(
      '[quiz-generation] theory Firestore lookup failed, falling back:',
      error
    );
  }
  const fallback = ethicalTheories.find((t) => t.id === subjectId);
  if (!fallback) return null;
  return { name: fallback.name, context: fallback.description };
}

/**
 * Admin: generate (via Gemini) and save a quiz for a single subject.
 *
 * Deterministic upsert — re-running this regenerates the quiz. Each question
 * gets a stable client-side id so the UI can key on it.
 */
export async function generateQuizForSubject(
  subjectType: QuizSubjectType,
  subjectId: string,
  adminUid: string,
  questionCount = 15
): Promise<ActionResult<string>> {
  try {
    await requireAdmin(adminUid);

    const subject = await loadSubject(subjectType, subjectId);
    if (!subject) {
      return {
        success: false,
        error: `Subject ${subjectType}:${subjectId} not found.`,
      };
    }

    const generated = await generateQuiz({
      subjectType,
      subjectName: subject.name,
      context: subject.context || undefined,
      questionCount,
    });

    const questions = generated.questions.map((q, i) => ({
      id: `${subjectType}-${subjectId}-q${i + 1}`,
      prompt: q.prompt,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    const result = await upsertQuiz({
      subjectType,
      subjectId,
      subjectName: subject.name,
      title: generated.title,
      description: generated.description,
      questions,
      passingScorePercent: 80,
      estimatedMinutes: Math.max(5, Math.round(questions.length * 0.75)),
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('[quiz-generation] generateQuizForSubject error:', error);
    return {
      success: false,
      error: error?.message || String(error),
    };
  }
}

/**
 * Admin: delete a quiz by its deterministic id.
 */
export async function deleteQuiz(
  quizId: string,
  adminUid: string
): Promise<ActionResult> {
  try {
    await requireAdmin(adminUid);
    await deleteDoc(doc(db, 'quizzes', quizId));
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[quiz-generation] deleteQuiz error:', error);
    return { success: false, error: error?.message || String(error) };
  }
}
