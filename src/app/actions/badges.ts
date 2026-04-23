'use server';

import { db } from '@/lib/firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import type { UserProgress, BadgeId, UserBadge } from '@/types';
import { evaluateBadges, calculateScore } from '@/lib/badge-engine';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Checks user progress and awards any newly earned badges.
 * Returns the full list of earned badge IDs.
 */
export async function checkAndAwardBadges(
  userId: string
): Promise<ActionResult<BadgeId[]>> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    // Fetch user progress
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);

    if (!progressSnap.exists()) {
      return { success: true, data: [] };
    }

    const progressData = progressSnap.data() as UserProgress;

    // Gather extra metrics needed for curriculum/quiz/certificate badges.
    let curriculaCompleted = 0;
    let quizzesPassed = 0;
    let certificatesEarned = 0;

    try {
      // Count fully-completed curricula from top-level curriculumProgress.
      const progressSnap2 = await getDocs(
        query(
          collection(db, 'curriculumProgress'),
          where('userId', '==', userId)
        )
      );
      for (const p of progressSnap2.docs) {
        const pd = p.data();
        const cid = pd.curriculumId;
        if (!cid) continue;
        const cSnap = await getDoc(doc(db, 'curricula', cid));
        if (!cSnap.exists()) continue;
        const modules = (cSnap.data().modules || []) as Array<{
          items?: unknown[];
        }>;
        const total = modules.reduce(
          (s, m) => s + (m.items?.length || 0),
          0
        );
        const completed: string[] = pd.completedItemIds || [];
        if (total > 0 && completed.length >= total) curriculaCompleted++;
      }

      // Count distinct subject quizzes passed
      const attemptsSnap = await getDocs(
        query(collection(db, 'quizAttempts'), where('userId', '==', userId))
      );
      const passedSubjects = new Set<string>();
      attemptsSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.passed === true && data.subjectId) {
          passedSubjects.add(data.subjectId);
        }
      });
      quizzesPassed = passedSubjects.size;

      // Count active (non-revoked) certificates
      const certsSnap = await getDocs(
        query(collection(db, 'certificates'), where('userId', '==', userId))
      );
      certsSnap.docs.forEach((d) => {
        if (!d.data().revokedAt) certificatesEarned++;
      });
    } catch (err) {
      // Non-fatal: tier badges just won't be awarded this pass
      console.warn('[badges] extras fetch failed:', err);
    }

    const earnedIds = evaluateBadges(progressData, {
      curriculaCompleted,
      quizzesPassed,
      certificatesEarned,
    });

    // Fetch existing badges
    const badgesRef = doc(db, 'userBadges', userId);
    const badgesSnap = await getDoc(badgesRef);
    const existingBadges: UserBadge[] = badgesSnap.exists()
      ? (badgesSnap.data().badges as UserBadge[]) ?? []
      : [];

    const existingIds = new Set(existingBadges.map((b) => b.badgeId));
    const newBadges: UserBadge[] = earnedIds
      .filter((id) => !existingIds.has(id))
      .map((id) => ({ badgeId: id, earnedAt: new Date() }));

    if (newBadges.length > 0) {
      const allBadges = [...existingBadges, ...newBadges];
      await setDoc(
        badgesRef,
        { userId, badges: allBadges, updatedAt: serverTimestamp() },
        { merge: true }
      );
    }

    return { success: true, data: earnedIds };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] checkAndAwardBadges error:', message);
    return { success: false, error: `Failed to check badges: ${message}` };
  }
}

/**
 * Gets the list of badge IDs a user has earned.
 */
export async function getUserBadges(
  userId: string
): Promise<ActionResult<BadgeId[]>> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const badgesRef = doc(db, 'userBadges', userId);
    const badgesSnap = await getDoc(badgesRef);

    if (!badgesSnap.exists()) {
      return { success: true, data: [] };
    }

    const badges = (badgesSnap.data().badges as UserBadge[]) ?? [];
    return { success: true, data: badges.map((b) => b.badgeId) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] getUserBadges error:', message);
    return { success: false, error: `Failed to fetch badges: ${message}` };
  }
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  badgeCount: number;
  rank: number;
  /** When true, this user has opted out of public leaderboard visibility. */
  anonymousOnLeaderboard?: boolean;
}

/**
 * Gets the leaderboard — top users by score.
 *
 * Score now reflects the full platform activity model (see
 * `calculateScore` in lib/badge-engine.ts): stories, debates,
 * analyses, dilemmas, Framework Explorer runs, Perspectives
 * comparisons, subject-quizzes passed, curricula completed, and
 * certificates earned. The extra counters are fetched in parallel
 * with a single query per collection and indexed by userId, avoiding
 * the per-user fan-out of the previous implementation.
 */
export async function getLeaderboard(
  limitCount: number = 20
): Promise<ActionResult<LeaderboardEntry[]>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    // Top-level collections we aggregate across for the extended score.
    // Each read is a single round-trip; per-user counters are derived
    // from the indexed maps below.
    const [
      progressSnap,
      quizAttemptsSnap,
      perspectivesSnap,
      debatesSnap,
      certsSnap,
      curriculumProgressSnap,
    ] = await Promise.all([
      getDocs(collection(db, 'userProgress')),
      getDocs(collection(db, 'quizAttempts')),
      getDocs(collection(db, 'perspectives')),
      getDocs(collection(db, 'debates')),
      getDocs(collection(db, 'certificates')),
      getDocs(collection(db, 'curriculumProgress')),
    ]);

    // Index: userId -> set of subjectIds they've PASSED a quiz on.
    const quizPassedBySubject = new Map<string, Set<string>>();
    // Index: userId -> Framework Explorer runs (quizAttempts where subjectType is 'framework' etc.)
    // Framework Explorer results are stored in UserProgress.quizResults, so
    // we read that from the progress doc below — not this index.
    for (const d of quizAttemptsSnap.docs) {
      const data = d.data();
      if (!data.passed) continue;
      const uid = String(data.userId ?? '');
      if (!uid) continue;
      const subjectKey = `${data.subjectType ?? ''}:${data.subjectId ?? ''}`;
      let set = quizPassedBySubject.get(uid);
      if (!set) {
        set = new Set<string>();
        quizPassedBySubject.set(uid, set);
      }
      set.add(subjectKey);
    }

    // Index: userId -> count of saved perspectives.
    const perspectivesByUser = new Map<string, number>();
    for (const d of perspectivesSnap.docs) {
      const uid = String(d.data().authorId ?? '');
      if (!uid) continue;
      perspectivesByUser.set(uid, (perspectivesByUser.get(uid) ?? 0) + 1);
    }

    // Index: userId -> count of debates they created.
    const debatesCreatedByUser = new Map<string, number>();
    for (const d of debatesSnap.docs) {
      const uid = String(d.data().creatorId ?? '');
      if (!uid) continue;
      debatesCreatedByUser.set(uid, (debatesCreatedByUser.get(uid) ?? 0) + 1);
    }

    // Index: userId -> count of active (non-revoked) certificates.
    const certsByUser = new Map<string, number>();
    for (const d of certsSnap.docs) {
      const data = d.data();
      const uid = String(data.userId ?? '');
      if (!uid) continue;
      if (data.revokedAt) continue; // skip revoked
      certsByUser.set(uid, (certsByUser.get(uid) ?? 0) + 1);
    }

    // Index: userId -> count of fully-completed curricula. We approximate
    // "fully completed" by the presence of a completedAt timestamp on
    // the progress doc (set when the user crosses 100%). Callers that
    // need the stricter "completed items === total items" check should
    // use the per-user version in checkAndAwardBadges.
    const curriculaCompletedByUser = new Map<string, number>();
    for (const d of curriculumProgressSnap.docs) {
      const data = d.data();
      const uid = String(data.userId ?? '');
      if (!uid) continue;
      if (data.completedAt || data.isComplete === true) {
        curriculaCompletedByUser.set(
          uid,
          (curriculaCompletedByUser.get(uid) ?? 0) + 1,
        );
      }
    }

    // Per-user profile + badge-count lookup. Still per-user but in
    // parallel via Promise.all to stay responsive on medium-sized
    // leaderboards.
    const rawEntries = await Promise.all(
      progressSnap.docs.map(async (docSnap) => {
        const progress = docSnap.data() as UserProgress;
        const uid = progress.userId;

        const extras = {
          quizzesPassed: quizPassedBySubject.get(uid)?.size ?? 0,
          frameworkExplorerRuns: Array.isArray(progress.quizResults)
            ? progress.quizResults.length
            : 0,
          perspectivesCount: perspectivesByUser.get(uid) ?? 0,
          debatesCreated: debatesCreatedByUser.get(uid) ?? 0,
          certificatesEarned: certsByUser.get(uid) ?? 0,
          curriculaCompleted: curriculaCompletedByUser.get(uid) ?? 0,
        };
        const score = calculateScore(progress, extras);

        const [profileSnap, badgesSnap] = await Promise.all([
          getDoc(doc(db, 'users', uid)),
          getDoc(doc(db, 'userBadges', uid)),
        ]);
        const profileData = profileSnap.data();
        const badgeCount = badgesSnap.exists()
          ? ((badgesSnap.data().badges as UserBadge[]) ?? []).length
          : 0;

        return {
          userId: uid,
          displayName:
            profileData?.name ??
            profileData?.displayName ??
            profileData?.email ??
            'Anonymous',
          avatarUrl: profileData?.avatarUrl,
          score,
          badgeCount,
          anonymousOnLeaderboard: profileData?.anonymousOnLeaderboard === true,
        } satisfies Omit<LeaderboardEntry, 'rank'>;
      }),
    );

    // Zero-score users clutter the board without adding signal. Filter
    // them out before ranking. Someone who's truly done nothing still
    // has a score of zero and wouldn't appear.
    const entries = rawEntries.filter((e) => e.score > 0);

    entries.sort((a, b) => b.score - a.score);
    const ranked: LeaderboardEntry[] = entries
      .slice(0, limitCount)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return { success: true, data: ranked };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] getLeaderboard error:', message);
    return { success: false, error: `Failed to fetch leaderboard: ${message}` };
  }
}
