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
 * Fetch every free-text reflection a user has saved across all
 * chapters. Used by the /me/reflections archive page. Filters out the
 * Promise vs. Reality scoring docs (which use a special suffix on the
 * doc ID) since those aren't free-text and have their own UI.
 *
 * Returns newest-first by `updatedAt`. Capped at 200 docs to keep the
 * payload bounded — beyond that, the user really wants pagination,
 * not a wall of text.
 */
export interface ReflectionEntry {
  slug: string;
  promptId: string;
  response: string;
  updatedAt?: Date;
}
export async function getAllUserReflections(
  userId: string,
  opts?: { limit?: number },
): Promise<ActionResult<ReflectionEntry[]>> {
  try {
    if (!userId) return { success: true, data: [] };
    const cap = Math.max(1, Math.min(opts?.limit ?? 200, 500));
    const q = query(
      collection(db, REFLECTIONS_COLLECTION),
      where('userId', '==', userId),
    );
    const snap = await getDocs(q);
    const out: ReflectionEntry[] = [];
    snap.forEach((d) => {
      const data = d.data() as {
        slug?: string;
        promptId?: string;
        response?: string;
        updatedAt?: unknown;
      };
      // Skip the promise-reality scoring doc — not a free-text
      // reflection. Its doc ID always ends in `_promise-reality` and
      // it doesn't carry a `promptId`.
      if (!data.promptId) return;
      if (data.promptId === 'promise-reality') return;
      // Skip empty saves (autosave occasionally writes a blank during
      // the user's first keystroke).
      const response = (data.response || '').trim();
      if (!response) return;
      out.push({
        slug: String(data.slug || ''),
        promptId: data.promptId,
        response,
        // timestampToDate is typed for known timestamp shapes; cast through
        // the helper's accepted union to placate the compiler — an unknown
        // value here is by definition something the helper will hand back
        // as undefined anyway.
        updatedAt:
          timestampToDate(
            data.updatedAt as Parameters<typeof timestampToDate>[0],
          ) ?? undefined,
      });
    });
    out.sort((a, b) => {
      const at = a.updatedAt?.getTime() ?? 0;
      const bt = b.updatedAt?.getTime() ?? 0;
      return bt - at;
    });
    return { success: true, data: out.slice(0, cap) };
  } catch (error) {
    console.error('[textbook] getAllUserReflections error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Highlights — the user's selected-text "marginalia" with optional notes.
 * Stored at `textbookHighlights/{auto-id}` with userId + slug for queries.
 *
 * Highlights are intentionally lightweight: we persist the text the user
 * selected (so we can show it back to them) plus an optional note, but
 * we DON'T try to anchor the highlight back into the rendered chapter
 * DOM on subsequent visits — that's a hard problem (text re-flows,
 * normalization, etc.) and the value is ~80% from the standalone
 * archive view. If a future iteration wants in-text persistence we can
 * add it without re-shaping the data model.
 */
const HIGHLIGHTS_COLLECTION = 'textbookHighlights';

export interface ChapterHighlight {
  id: string;
  userId: string;
  slug: string;
  text: string;
  note?: string;
  createdAt?: Date;
}

export async function saveHighlight(input: {
  userId: string;
  slug: string;
  text: string;
  note?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { userId, slug, text, note } = input;
    if (!userId) return { success: false, error: 'Not signed in.' };
    if (!text || !text.trim()) {
      return { success: false, error: 'Empty highlight.' };
    }
    // Cap the stored text. Long selections (entire paragraphs) are
    // valid but a 4kb cap keeps the doc small for the index/list view.
    const trimmed = text.trim().slice(0, 4000);
    const trimmedNote = (note || '').trim().slice(0, 1000) || undefined;
    const ref = await import('firebase/firestore').then((m) =>
      m.addDoc(collection(db, HIGHLIGHTS_COLLECTION), {
        userId,
        slug,
        text: trimmed,
        note: trimmedNote ?? null,
        createdAt: serverTimestamp(),
      }),
    );
    return { success: true, data: { id: ref.id } };
  } catch (error) {
    console.error('[textbook] saveHighlight error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getUserHighlights(
  userId: string,
  opts?: { slug?: string; limit?: number },
): Promise<ActionResult<ChapterHighlight[]>> {
  try {
    if (!userId) return { success: true, data: [] };
    const cap = Math.max(1, Math.min(opts?.limit ?? 200, 500));
    const filters = [where('userId', '==', userId)];
    if (opts?.slug) filters.push(where('slug', '==', opts.slug));
    const q = query(collection(db, HIGHLIGHTS_COLLECTION), ...filters);
    const snap = await getDocs(q);
    const out: ChapterHighlight[] = [];
    snap.forEach((d) => {
      const data = d.data() as {
        userId?: string;
        slug?: string;
        text?: string;
        note?: string;
        createdAt?: unknown;
      };
      out.push({
        id: d.id,
        userId: String(data.userId || userId),
        slug: String(data.slug || ''),
        text: String(data.text || ''),
        note: data.note || undefined,
        createdAt:
          timestampToDate(
            data.createdAt as Parameters<typeof timestampToDate>[0],
          ) ?? undefined,
      });
    });
    out.sort(
      (a, b) =>
        (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
    return { success: true, data: out.slice(0, cap) };
  } catch (error) {
    console.error('[textbook] getUserHighlights error:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteHighlight(
  userId: string,
  highlightId: string,
): Promise<ActionResult<void>> {
  try {
    if (!userId || !highlightId) {
      return { success: false, error: 'Missing identifiers.' };
    }
    const ref = doc(db, HIGHLIGHTS_COLLECTION, highlightId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, error: 'Highlight not found.' };
    }
    if ((snap.data() as { userId?: string }).userId !== userId) {
      return { success: false, error: 'Not your highlight.' };
    }
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(ref);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[textbook] deleteHighlight error:', error);
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
