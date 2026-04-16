'use server';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { issueCertificate } from '@/app/actions/certificates';
import type { TextbookProgress } from '@/types/textbook';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const PROGRESS_COLLECTION = 'textbookProgress';
const REFLECTIONS_COLLECTION = 'textbookReflections';

const TEXTBOOK_TOTAL_CHAPTERS = 12;

function progressFromDoc(userId: string, data: Record<string, unknown> | undefined): TextbookProgress {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = (data || {}) as Record<string, any>;
  return {
    userId,
    chaptersRead: (d.chaptersRead as string[]) || [],
    chapterQuizzesPassed: (d.chapterQuizzesPassed as string[]) || [],
    chapterCertificateIds: (d.chapterCertificateIds as Record<string, string>) || {},
    finalExamPassed: Boolean(d.finalExamPassed),
    masterCertificateId: (d.masterCertificateId as string | undefined) || undefined,
    lastChapterRead: (d.lastChapterRead as string | undefined) || undefined,
    updatedAt: timestampToDate(d.updatedAt) ?? undefined,
  };
}

/**
 * Fetch a user's full textbook progress document. Returns an empty progress
 * record when none exists yet.
 */
export async function getTextbookProgress(
  userId: string
): Promise<ActionResult<TextbookProgress>> {
  try {
    if (!userId) {
      return {
        success: true,
        data: {
          userId: '',
          chaptersRead: [],
          chapterQuizzesPassed: [],
          chapterCertificateIds: {},
          finalExamPassed: false,
        },
      };
    }
    const snap = await getDoc(doc(db, PROGRESS_COLLECTION, userId));
    return { success: true, data: progressFromDoc(userId, snap.data()) };
  } catch (error) {
    console.error('[textbook] getTextbookProgress error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Mark a chapter as "read" for a user. Records lastChapterRead so the
 * landing page can offer a Resume CTA.
 */
export async function markChapterRead(
  userId: string,
  slug: string
): Promise<ActionResult<void>> {
  try {
    if (!userId) return { success: false, error: 'Not signed in.' };
    if (!slug) return { success: false, error: 'Missing chapter slug.' };
    await setDoc(
      doc(db, PROGRESS_COLLECTION, userId),
      {
        userId,
        chaptersRead: arrayUnion(slug),
        lastChapterRead: slug,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[textbook] markChapterRead error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Record that a user passed a chapter Knowledge Check. Issues a chapter
 * completion certificate (idempotent — issueCertificate dedupes on
 * userId + curriculumId) and stores the certificate id on the progress doc.
 */
export async function recordChapterQuizPass(input: {
  userId: string;
  userName: string;
  slug: string;
  chapterNumber: number;
  chapterTitle: string;
}): Promise<ActionResult<{ certificateId: string }>> {
  try {
    const { userId, userName, slug, chapterNumber, chapterTitle } = input;
    if (!userId) return { success: false, error: 'Not signed in.' };

    const certResult = await issueCertificate({
      userId,
      userName: userName || 'Anonymous Explorer',
      curriculumId: `textbook-chapter-${slug}`,
      curriculumTitle: `Chapter ${chapterNumber}: ${chapterTitle}`,
    });
    if (!certResult.success) {
      return { success: false, error: certResult.error };
    }

    await setDoc(
      doc(db, PROGRESS_COLLECTION, userId),
      {
        userId,
        chapterQuizzesPassed: arrayUnion(slug),
        [`chapterCertificateIds.${slug}`]: certResult.data.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true, data: { certificateId: certResult.data.id } };
  } catch (error) {
    console.error('[textbook] recordChapterQuizPass error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Record that a user passed the cumulative final exam and issue the
 * Master Certificate. Requires that all 12 chapter quizzes are already
 * passed — returns an error otherwise.
 */
export async function recordFinalExamPass(input: {
  userId: string;
  userName: string;
}): Promise<ActionResult<{ certificateId: string }>> {
  try {
    const { userId, userName } = input;
    if (!userId) return { success: false, error: 'Not signed in.' };

    const progressSnap = await getDoc(doc(db, PROGRESS_COLLECTION, userId));
    const progress = progressFromDoc(userId, progressSnap.data());
    if (progress.chapterQuizzesPassed.length < TEXTBOOK_TOTAL_CHAPTERS) {
      return {
        success: false,
        error: `Pass all ${TEXTBOOK_TOTAL_CHAPTERS} chapter quizzes before the final exam.`,
      };
    }

    const certResult = await issueCertificate({
      userId,
      userName: userName || 'Anonymous Explorer',
      curriculumId: 'textbook-master',
      curriculumTitle: 'The Ethics of Technology Through Science Fiction — Master Certificate',
    });
    if (!certResult.success) {
      return { success: false, error: certResult.error };
    }

    await setDoc(
      doc(db, PROGRESS_COLLECTION, userId),
      {
        userId,
        finalExamPassed: true,
        masterCertificateId: certResult.data.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true, data: { certificateId: certResult.data.id } };
  } catch (error) {
    console.error('[textbook] recordFinalExamPass error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Persist a user's free-text reflection for a specific prompt.
 * Stored as one Firestore doc per (user, chapter, prompt).
 */
export async function saveReflection(input: {
  userId: string;
  slug: string;
  promptId: string;
  response: string;
}): Promise<ActionResult<void>> {
  try {
    const { userId, slug, promptId, response } = input;
    if (!userId) return { success: false, error: 'Not signed in.' };
    const docId = `${userId}_${slug}_${promptId}`;
    await setDoc(
      doc(db, REFLECTIONS_COLLECTION, docId),
      {
        userId,
        slug,
        promptId,
        response: response || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[textbook] saveReflection error:', error);
    return { success: false, error: String(error) };
  }
}

/** Fetch all of a user's reflections for a specific chapter. */
export async function getChapterReflections(
  userId: string,
  slug: string
): Promise<ActionResult<Record<string, string>>> {
  try {
    if (!userId) return { success: true, data: {} };
    const q = query(
      collection(db, REFLECTIONS_COLLECTION),
      where('userId', '==', userId),
      where('slug', '==', slug)
    );
    const snap = await getDocs(q);
    const out: Record<string, string> = {};
    snap.forEach((d) => {
      const data = d.data() as { promptId?: string; response?: string };
      if (data.promptId) {
        out[data.promptId] = data.response || '';
      }
    });
    return { success: true, data: out };
  } catch (error) {
    console.error('[textbook] getChapterReflections error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Persist a user's "Promise vs. Reality" 0-5 scoring for a chapter.
 * Stored as a single doc keyed by (user, chapter).
 */
export async function savePromiseRealityScores(input: {
  userId: string;
  slug: string;
  scores: Record<string, number>;
}): Promise<ActionResult<void>> {
  try {
    const { userId, slug, scores } = input;
    if (!userId) return { success: false, error: 'Not signed in.' };
    const docId = `${userId}_${slug}_promise-reality`;
    await setDoc(
      doc(db, REFLECTIONS_COLLECTION, docId),
      {
        userId,
        slug,
        promptId: 'promise-reality',
        scores,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[textbook] savePromiseRealityScores error:', error);
    return { success: false, error: String(error) };
  }
}

/** Fetch the user's Promise vs Reality scores for a chapter. */
export async function getPromiseRealityScores(
  userId: string,
  slug: string
): Promise<ActionResult<Record<string, number>>> {
  try {
    if (!userId) return { success: true, data: {} };
    const docId = `${userId}_${slug}_promise-reality`;
    const snap = await getDoc(doc(db, REFLECTIONS_COLLECTION, docId));
    if (!snap.exists()) return { success: true, data: {} };
    const data = snap.data() as { scores?: Record<string, number> };
    return { success: true, data: data.scores || {} };
  } catch (error) {
    console.error('[textbook] getPromiseRealityScores error:', error);
    return { success: false, error: String(error) };
  }
}
