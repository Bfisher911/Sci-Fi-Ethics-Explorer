'use server';

/**
 * Server actions for the community gradebook + per-member contributions
 * surface. Modeled loosely on a Canvas LMS gradebook: rows are community
 * members, columns are the quiz items defined by the community's
 * learning path, cells are best-attempt scores.
 *
 * Authorization: only the community owner or one of its instructors
 * may read these reports. Members cannot see each other's grades.
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
} from 'firebase/firestore';
import type {
  Community,
  CurriculumPath,
  CurriculumItem,
  CommunityContribution,
  ContributionType,
  QuizAttempt,
  SubmittedDilemma,
} from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Authorization ───────────────────────────────────────────────────

interface CommunityRoles {
  community: Community;
  isOwnerOrInstructor: boolean;
}

async function loadCommunityForGrader(
  communityId: string,
  requesterId: string
): Promise<CommunityRoles | { error: string }> {
  if (!requesterId) return { error: 'Sign in required.' };
  const snap = await getDoc(doc(db, 'communities', communityId));
  if (!snap.exists()) return { error: 'Community not found.' };
  const data = snap.data();
  const community: Community = {
    id: snap.id,
    name: data.name || '',
    description: data.description,
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    instructorIds: data.instructorIds || [],
    memberIds: data.memberIds || [],
    licenseId: data.licenseId,
    inviteCode: data.inviteCode || '',
    curriculumPathId: data.curriculumPathId,
    settings: data.settings,
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt),
  };
  const isOwner = community.ownerId === requesterId;
  const isInstructor = community.instructorIds.includes(requesterId);
  return { community, isOwnerOrInstructor: isOwner || isInstructor };
}

// ─── Gradebook ───────────────────────────────────────────────────────

export interface GradebookQuizColumn {
  /** CurriculumItem.id (stable per-curriculum) */
  itemId: string;
  /** Quiz subject id (e.g. 'utilitarianism', 'mary-shelley'). */
  subjectId: string;
  /** Display title from the curriculum. */
  title: string;
}

export interface GradebookCell {
  /** undefined when the member has not attempted the quiz. */
  scorePercent?: number;
  passed?: boolean;
  /** ISO date string of best attempt for sorting / display. */
  completedAt?: string;
}

export interface GradebookRow {
  uid: string;
  displayName: string;
  email: string;
  role: 'instructor' | 'member';
  /** Map of CurriculumItem.id -> GradebookCell */
  scores: Record<string, GradebookCell>;
  /** Average across attempted quizzes (0-100), undefined if none attempted. */
  averagePercent?: number;
  /** Count of curriculum quizzes the member has passed. */
  passedCount: number;
  /** Count of submissions the member has contributed inside this community. */
  contributionCount: number;
}

export interface CommunityGradebook {
  community: { id: string; name: string };
  curriculumId: string | null;
  curriculumTitle: string | null;
  columns: GradebookQuizColumn[];
  rows: GradebookRow[];
}

/**
 * Build the gradebook for a community. Joins:
 *   - the community's roster (instructors + members)
 *   - the community's curriculumPath (its quiz items)
 *   - each member's best quizAttempts
 *   - each member's communityContributions in this community
 */
export async function getCommunityGradebook(
  communityId: string,
  requesterId: string
): Promise<ActionResult<CommunityGradebook>> {
  try {
    const auth = await loadCommunityForGrader(communityId, requesterId);
    if ('error' in auth) return { success: false, error: auth.error };
    if (!auth.isOwnerOrInstructor) {
      return { success: false, error: 'Only owners and instructors can view the gradebook.' };
    }
    const { community } = auth;

    // 1. Resolve the community's curriculum (if any)
    let curriculum: CurriculumPath | null = null;
    if (community.curriculumPathId) {
      const cSnap = await getDoc(doc(db, 'curricula', community.curriculumPathId));
      if (cSnap.exists()) {
        const cd = cSnap.data();
        curriculum = {
          id: cSnap.id,
          title: cd.title || '',
          description: cd.description || '',
          creatorId: cd.creatorId || '',
          creatorName: cd.creatorName,
          isPublic: cd.isPublic ?? true,
          modules: cd.modules || [],
          enrollmentCount: cd.enrollmentCount,
          createdAt: timestampToDate(cd.createdAt) ?? new Date(),
          updatedAt: timestampToDate(cd.updatedAt),
        };
      } else {
        // Fall back to preset curricula
        try {
          const { presetCurricula } = await import('@/data/preset-curricula');
          curriculum =
            presetCurricula.find((p) => p.id === community.curriculumPathId) ||
            null;
        } catch {
          // ignore
        }
      }
    }

    // 2. Quiz columns from curriculum (only `quiz` items)
    const columns: GradebookQuizColumn[] = curriculum
      ? curriculum.modules
          .flatMap((m) => m.items)
          .filter((it: CurriculumItem) => it.type === 'quiz')
          .map((it) => ({
            itemId: it.id,
            subjectId: it.referenceId,
            title: it.title,
          }))
      : [];

    // 3. Roster (owner is implicitly an instructor)
    const allUids = Array.from(
      new Set([
        community.ownerId,
        ...community.instructorIds,
        ...community.memberIds,
      ])
    ).filter(Boolean);

    // 4. Pre-load contribution counts per member, scoped to this community
    const contribCountsByUser: Record<string, number> = {};
    try {
      const contribSnap = await getDocs(
        query(
          collection(db, 'communityContributions'),
          where('communityId', '==', communityId)
        )
      );
      contribSnap.forEach((d) => {
        const uid = d.data().contributorId as string | undefined;
        if (uid) contribCountsByUser[uid] = (contribCountsByUser[uid] || 0) + 1;
      });
    } catch (err) {
      console.warn('[gradebook] failed to load contributions:', err);
    }

    // 5. For each member: profile + best quiz attempts + contribution count
    const rows: GradebookRow[] = [];
    for (const uid of allUids) {
      // Profile
      let displayName = 'Unknown';
      let email = '';
      try {
        const uSnap = await getDoc(doc(db, 'users', uid));
        if (uSnap.exists()) {
          const u = uSnap.data();
          displayName = u.name || u.displayName || u.email || uid;
          email = u.email || '';
        }
      } catch {
        // best-effort
      }

      // Best quiz attempts
      const scores: Record<string, GradebookCell> = {};
      let totalScore = 0;
      let attemptedCount = 0;
      let passedCount = 0;
      try {
        const aSnap = await getDocs(
          query(
            collection(db, 'quizAttempts'),
            where('userId', '==', uid),
            orderBy('completedAt', 'desc')
          )
        );
        const bestBySubject: Record<string, QuizAttempt> = {};
        aSnap.forEach((d) => {
          const data = d.data();
          const a: QuizAttempt = {
            id: d.id,
            quizId: data.quizId,
            userId: data.userId,
            subjectType: data.subjectType,
            subjectId: data.subjectId,
            answers: data.answers || [],
            scorePercent: data.scorePercent ?? 0,
            passed: data.passed ?? false,
            xpAwarded: data.xpAwarded,
            completedAt:
              timestampToDate(data.completedAt) ?? new Date(),
          };
          const prior = bestBySubject[a.subjectId];
          if (!prior || a.scorePercent > prior.scorePercent) {
            bestBySubject[a.subjectId] = a;
          }
        });
        for (const col of columns) {
          const best = bestBySubject[col.subjectId];
          if (best) {
            scores[col.itemId] = {
              scorePercent: best.scorePercent,
              passed: best.passed,
              completedAt:
                best.completedAt instanceof Date
                  ? best.completedAt.toISOString()
                  : String(best.completedAt),
            };
            totalScore += best.scorePercent;
            attemptedCount += 1;
            if (best.passed) passedCount += 1;
          } else {
            scores[col.itemId] = {};
          }
        }
      } catch (err) {
        console.warn(`[gradebook] failed quiz attempts for ${uid}:`, err);
      }

      const averagePercent =
        attemptedCount > 0 ? Math.round(totalScore / attemptedCount) : undefined;

      const role: 'instructor' | 'member' =
        community.ownerId === uid || community.instructorIds.includes(uid)
          ? 'instructor'
          : 'member';

      rows.push({
        uid,
        displayName,
        email,
        role,
        scores,
        averagePercent,
        passedCount,
        contributionCount: contribCountsByUser[uid] || 0,
      });
    }

    // Sort: instructors first, then members alphabetically
    rows.sort((a, b) => {
      if (a.role !== b.role) return a.role === 'instructor' ? -1 : 1;
      return a.displayName.localeCompare(b.displayName);
    });

    return {
      success: true,
      data: {
        community: { id: community.id, name: community.name },
        curriculumId: curriculum?.id ?? null,
        curriculumTitle: curriculum?.title ?? null,
        columns,
        rows,
      },
    };
  } catch (error) {
    console.error('[gradebook] getCommunityGradebook error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Per-member contributions ────────────────────────────────────────

export interface MemberContributionItem {
  /** Where the artifact lives. */
  type: ContributionType | 'submitted-dilemma' | 'quiz-attempt';
  /** Stable id within the source collection. */
  id: string;
  title: string;
  summary?: string;
  /** ISO date string for sortable display. */
  createdAt: string;
  /** Optional deep link the UI can render as "Open". */
  href?: string;
  /** Optional metadata badge (e.g. score, status). */
  badge?: string;
}

export interface MemberContributionsReport {
  member: { uid: string; displayName: string; email: string };
  community: { id: string; name: string };
  totalCount: number;
  byType: Record<string, number>;
  items: MemberContributionItem[];
}

/**
 * Return ALL of a member's activity inside the given community:
 *   - communityContributions scoped to this community
 *   - submittedDilemmas scoped to this community
 *   - quizAttempts (whose subject lines up with the community's
 *     curriculum, when one is set)
 */
export async function getMemberContributions(
  communityId: string,
  memberId: string,
  requesterId: string
): Promise<ActionResult<MemberContributionsReport>> {
  try {
    const auth = await loadCommunityForGrader(communityId, requesterId);
    if ('error' in auth) return { success: false, error: auth.error };
    if (!auth.isOwnerOrInstructor) {
      return {
        success: false,
        error: 'Only owners and instructors can view member contributions.',
      };
    }
    const { community } = auth;

    if (
      memberId !== community.ownerId &&
      !community.memberIds.includes(memberId) &&
      !community.instructorIds.includes(memberId)
    ) {
      return { success: false, error: 'User is not a member of this community.' };
    }

    // Profile
    let displayName = 'Unknown';
    let email = '';
    try {
      const uSnap = await getDoc(doc(db, 'users', memberId));
      if (uSnap.exists()) {
        const u = uSnap.data();
        displayName = u.name || u.displayName || u.email || memberId;
        email = u.email || '';
      }
    } catch {
      // best-effort
    }

    const items: MemberContributionItem[] = [];

    // 1. Community contributions
    try {
      const snap = await getDocs(
        query(
          collection(db, 'communityContributions'),
          where('communityId', '==', communityId),
          where('contributorId', '==', memberId)
        )
      );
      snap.forEach((d) => {
        const data = d.data() as CommunityContribution & { type: string };
        items.push({
          type: data.type as ContributionType,
          id: d.id,
          title: data.title || '(untitled)',
          summary: data.summary,
          createdAt:
            (timestampToDate(data.createdAt) ?? new Date()).toISOString(),
          href: `/communities/${communityId}/contributions/${d.id}`,
          badge: data.type,
        });
      });
    } catch (err) {
      console.warn('[gradebook] member contributions error:', err);
    }

    // 2. Dilemmas the member submitted scoped to this community
    try {
      const snap = await getDocs(
        query(
          collection(db, 'submittedDilemmas'),
          where('authorId', '==', memberId),
          where('communityId', '==', communityId)
        )
      );
      snap.forEach((d) => {
        const data = d.data() as SubmittedDilemma & {
          submittedAt: any;
          status: string;
        };
        items.push({
          type: 'submitted-dilemma',
          id: d.id,
          title: data.title || '(untitled dilemma)',
          summary: data.description?.slice(0, 200),
          createdAt:
            (timestampToDate(data.submittedAt) ?? new Date()).toISOString(),
          href: `/community-dilemmas/${d.id}`,
          badge: data.status,
        });
      });
    } catch (err) {
      console.warn('[gradebook] member dilemmas error:', err);
    }

    // 3. Quiz attempts (limited to the most recent 50 to keep payload small)
    try {
      const snap = await getDocs(
        query(
          collection(db, 'quizAttempts'),
          where('userId', '==', memberId),
          orderBy('completedAt', 'desc'),
          fsLimit(50)
        )
      );
      snap.forEach((d) => {
        const data = d.data();
        items.push({
          type: 'quiz-attempt',
          id: d.id,
          title: `Quiz: ${data.subjectId}`,
          summary: `${data.subjectType} · ${data.passed ? 'passed' : 'attempted'}`,
          createdAt:
            (timestampToDate(data.completedAt) ?? new Date()).toISOString(),
          badge: `${data.scorePercent ?? 0}%`,
        });
      });
    } catch (err) {
      console.warn('[gradebook] member quiz attempts error:', err);
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const byType: Record<string, number> = {};
    for (const it of items) byType[it.type] = (byType[it.type] || 0) + 1;

    return {
      success: true,
      data: {
        member: { uid: memberId, displayName, email },
        community: { id: community.id, name: community.name },
        totalCount: items.length,
        byType,
        items,
      },
    };
  } catch (error) {
    console.error('[gradebook] getMemberContributions error:', error);
    return { success: false, error: String(error) };
  }
}
