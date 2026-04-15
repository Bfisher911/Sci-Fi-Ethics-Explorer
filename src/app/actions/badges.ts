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
 */
export async function getLeaderboard(
  limitCount: number = 20
): Promise<ActionResult<LeaderboardEntry[]>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    // Fetch all user progress docs (for a production app this should be pre-computed)
    const progressQuery = query(collection(db, 'userProgress'));
    const progressSnap = await getDocs(progressQuery);

    const entries: Omit<LeaderboardEntry, 'rank'>[] = [];

    for (const docSnap of progressSnap.docs) {
      const progress = docSnap.data() as UserProgress;
      const score = calculateScore(progress);

      // Fetch user profile for display name
      const profileRef = doc(db, 'users', progress.userId);
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.data();

      // Fetch badge count
      const badgesRef = doc(db, 'userBadges', progress.userId);
      const badgesSnap = await getDoc(badgesRef);
      const badgeCount = badgesSnap.exists()
        ? ((badgesSnap.data().badges as UserBadge[]) ?? []).length
        : 0;

      entries.push({
        userId: progress.userId,
        displayName:
          profileData?.name ??
          profileData?.displayName ??
          profileData?.email ??
          'Anonymous',
        avatarUrl: profileData?.avatarUrl,
        score,
        badgeCount,
        anonymousOnLeaderboard: profileData?.anonymousOnLeaderboard === true,
      });
    }

    // Sort by score descending and apply limit
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
