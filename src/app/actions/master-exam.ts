'use server';

/**
 * Server actions for the Master Technology Ethicist capstone exam.
 *
 * The exam unlocks only after the learner has cleared an
 * ACTIVITY-BASED prerequisite checklist. Seven requirements, all
 * tracked against real user activity:
 *
 *   1. Complete the textbook (all chapter quizzes + final exam)
 *   2. Complete at least 10 stories
 *   3. Complete at least 5 Framework Explorer submissions
 *   4. Complete at least 5 Perspectives submissions
 *   5. Submit at least 1 dilemma
 *   6. Submit at least 1 debate (created by the user)
 *   7. Participate in at least 5 debates (argued in)
 *
 * Passing the exam (score >= 75%) mints a "Master Technology Ethicist"
 * certificate via the existing issueCertificate action.
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  limit as fsLimit,
} from 'firebase/firestore';
import { issueCertificate, getUserCertificates } from '@/app/actions/certificates';
import { getTextbookProgress } from '@/app/actions/textbook';
import { getUserProgress } from '@/app/actions/progress';
import { getUserPerspectives } from '@/app/actions/perspectives';
import { chapters as ALL_CHAPTERS } from '@/data/textbook';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** A single activity-based prerequisite row shown on the page. */
export interface MasterExamRequirement {
  /** Stable key for the row (also used in analytics / tests). */
  id:
    | 'textbook'
    | 'stories'
    | 'framework-explorer'
    | 'perspectives'
    | 'dilemmas'
    | 'debates-submitted'
    | 'debates-participated';
  /** Short, one-line label. */
  title: string;
  /** Longer description of what's required. */
  description: string;
  /** Current count toward the goal. */
  current: number;
  /** Target count to complete the requirement. */
  target: number;
  /** True when `current >= target` (and any extra completion rules pass). */
  complete: boolean;
  /** Deep link to where the user can make progress on this requirement. */
  href: string;
}

export interface MasterExamUnlockState {
  unlocked: boolean;
  requirements: MasterExamRequirement[];
  /** Number of requirements complete. */
  completedCount: number;
  /** Total number of requirements. */
  totalCount: number;
  /** Overall percent complete (weighted by per-requirement progress, capped at 100). */
  overallPercent: number;
  /** True when the Master certificate has already been awarded. */
  alreadyAwarded: boolean;
  masterCertHash?: string;
}

const TARGET = {
  STORIES: 10,
  FRAMEWORK_EXPLORER: 5,
  PERSPECTIVES: 5,
  DILEMMAS: 1,
  DEBATES_SUBMITTED: 1,
  DEBATES_PARTICIPATED: 5,
};

/**
 * Count of dilemmas submitted by a user. Queries the
 * `submittedDilemmas` collection so this number reflects the
 * canonical record (vs the per-user `userProgress.dilemmasSubmitted`
 * array which can drift if a submission predates that tracking).
 */
async function countDilemmasByUser(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'submittedDilemmas'),
      where('authorId', '==', userId),
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.warn('[master-exam] countDilemmasByUser failed:', err);
    return 0;
  }
}

/**
 * Count of debates *created* by a user (i.e. they "submitted" a
 * debate prompt / proposition for the community to argue).
 */
async function countDebatesCreatedByUser(userId: string): Promise<number> {
  try {
    const q = query(collection(db, 'debates'), where('creatorId', '==', userId));
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.warn('[master-exam] countDebatesCreatedByUser failed:', err);
    return 0;
  }
}

/**
 * Count of Framework Explorer quiz completions. Framework Explorer
 * results are stored in `userProgress.quizResults` (one entry per
 * retake).
 */
function countFrameworkExplorer(quizResults: Array<unknown>): number {
  return Array.isArray(quizResults) ? quizResults.length : 0;
}

/**
 * Compute the user's current unlock state for the Master exam.
 * All seven requirements are evaluated in parallel.
 */
export async function getMasterExamUnlockState(
  userId: string,
): Promise<ActionResult<MasterExamUnlockState>> {
  try {
    if (!userId) {
      // Anonymous fallback — show the shape of the requirements with
      // zero progress so the page still renders informatively for
      // signed-out visitors browsing the master exam route.
      const empty = buildRequirements({
        textbookQuizzesPassed: 0,
        textbookFinalPassed: false,
        totalChapters: ALL_CHAPTERS.length,
        storiesCompleted: 0,
        frameworkExplorerRuns: 0,
        perspectivesCount: 0,
        dilemmasCount: 0,
        debatesCreatedCount: 0,
        debatesParticipatedCount: 0,
      });
      return {
        success: true,
        data: toUnlockState(empty, false),
      };
    }

    const [
      textbookRes,
      progressRes,
      perspectivesRes,
      dilemmasCount,
      debatesCreatedCount,
      certsRes,
    ] = await Promise.all([
      getTextbookProgress(userId),
      getUserProgress(userId),
      getUserPerspectives(userId),
      countDilemmasByUser(userId),
      countDebatesCreatedByUser(userId),
      getUserCertificates(userId),
    ]);

    const textbookQuizzesPassed = textbookRes.success
      ? textbookRes.data.chapterQuizzesPassed.length
      : 0;
    const textbookFinalPassed = textbookRes.success
      ? textbookRes.data.finalExamPassed
      : false;

    const storiesCompleted = progressRes.success
      ? progressRes.data.storiesCompleted.length
      : 0;
    const frameworkExplorerRuns = progressRes.success
      ? countFrameworkExplorer(progressRes.data.quizResults)
      : 0;
    const debatesParticipatedCount = progressRes.success
      ? progressRes.data.debatesParticipated.length
      : 0;

    const perspectivesCount = perspectivesRes.success
      ? perspectivesRes.data.length
      : 0;

    const requirements = buildRequirements({
      textbookQuizzesPassed,
      textbookFinalPassed,
      totalChapters: ALL_CHAPTERS.length,
      storiesCompleted,
      frameworkExplorerRuns,
      perspectivesCount,
      dilemmasCount,
      debatesCreatedCount,
      debatesParticipatedCount,
    });

    const masterCert = certsRes.success
      ? certsRes.data.find((c) => c.curriculumId === 'master-technology-ethicist')
      : undefined;

    const state = toUnlockState(requirements, Boolean(masterCert));
    if (masterCert?.verificationHash) {
      state.masterCertHash = masterCert.verificationHash;
    }
    return { success: true, data: state };
  } catch (err) {
    console.error('[master-exam] getMasterExamUnlockState error:', err);
    return { success: false, error: String(err) };
  }
}

interface BuildInput {
  textbookQuizzesPassed: number;
  textbookFinalPassed: boolean;
  totalChapters: number;
  storiesCompleted: number;
  frameworkExplorerRuns: number;
  perspectivesCount: number;
  dilemmasCount: number;
  debatesCreatedCount: number;
  debatesParticipatedCount: number;
}

function buildRequirements(input: BuildInput): MasterExamRequirement[] {
  const textbookTarget = input.totalChapters + 1; // N chapter quizzes + final
  const textbookProgress =
    input.textbookQuizzesPassed + (input.textbookFinalPassed ? 1 : 0);
  const textbookComplete =
    input.textbookQuizzesPassed >= input.totalChapters &&
    input.textbookFinalPassed;

  return [
    {
      id: 'textbook',
      title: 'Complete the textbook',
      description:
        'Pass every chapter quiz in the textbook and the cumulative final exam.',
      current: textbookProgress,
      target: textbookTarget,
      complete: textbookComplete,
      href: '/textbook',
    },
    {
      id: 'stories',
      title: 'Complete 10 stories',
      description:
        'Finish at least ten interactive stories from the Stories library.',
      current: input.storiesCompleted,
      target: TARGET.STORIES,
      complete: input.storiesCompleted >= TARGET.STORIES,
      href: '/stories',
    },
    {
      id: 'framework-explorer',
      title: 'Run the Framework Explorer quiz 5 times',
      description:
        'Complete the Framework Explorer quiz at least five times (each attempt counts separately).',
      current: input.frameworkExplorerRuns,
      target: TARGET.FRAMEWORK_EXPLORER,
      complete: input.frameworkExplorerRuns >= TARGET.FRAMEWORK_EXPLORER,
      href: '/framework-explorer',
    },
    {
      id: 'perspectives',
      title: 'Save 5 Perspective comparisons',
      description:
        'Save at least five Perspective comparisons from the Perspectives page.',
      current: input.perspectivesCount,
      target: TARGET.PERSPECTIVES,
      complete: input.perspectivesCount >= TARGET.PERSPECTIVES,
      href: '/perspective-comparison',
    },
    {
      id: 'dilemmas',
      title: 'Submit at least 1 dilemma',
      description:
        'Publish at least one ethical dilemma of your own for the community to engage with.',
      current: input.dilemmasCount,
      target: TARGET.DILEMMAS,
      complete: input.dilemmasCount >= TARGET.DILEMMAS,
      href: '/submit-dilemma',
    },
    {
      id: 'debates-submitted',
      title: 'Submit at least 1 debate',
      description:
        'Start at least one debate thread in the Debate Arena.',
      current: input.debatesCreatedCount,
      target: TARGET.DEBATES_SUBMITTED,
      complete: input.debatesCreatedCount >= TARGET.DEBATES_SUBMITTED,
      href: '/debate-arena',
    },
    {
      id: 'debates-participated',
      title: 'Participate in 5 debates',
      description:
        'Argue in at least five Debate Arena threads (your own or others).',
      current: input.debatesParticipatedCount,
      target: TARGET.DEBATES_PARTICIPATED,
      complete:
        input.debatesParticipatedCount >= TARGET.DEBATES_PARTICIPATED,
      href: '/debate-arena',
    },
  ];
}

function toUnlockState(
  requirements: MasterExamRequirement[],
  alreadyAwarded: boolean,
): MasterExamUnlockState {
  const completedCount = requirements.filter((r) => r.complete).length;
  const totalCount = requirements.length;
  // Weighted percent — sum of min(current/target, 1) averaged across
  // requirements. Gives a smoother progress feel than a strict
  // completed / total ratio.
  const weighted =
    requirements.reduce((sum, r) => {
      if (r.target <= 0) return sum + (r.complete ? 1 : 0);
      return sum + Math.min(r.current / r.target, 1);
    }, 0) / Math.max(totalCount, 1);
  const overallPercent = Math.round(weighted * 100);
  return {
    unlocked: completedCount === totalCount,
    requirements,
    completedCount,
    totalCount,
    overallPercent,
    alreadyAwarded,
  };
}

/**
 * Called by the client after a passing attempt on the master exam. It
 * re-verifies unlock state server-side (so the cert can't be minted
 * without passing AND clearing the prereqs) and issues the certificate.
 */
export async function awardMasterTechnologyEthicistCertificate(input: {
  userId: string;
  userName: string;
}): Promise<ActionResult<{ certificateId: string }>> {
  try {
    if (!input.userId) return { success: false, error: 'Sign in required.' };

    const gate = await getMasterExamUnlockState(input.userId);
    if (!gate.success) return { success: false, error: gate.error };
    if (!gate.data.unlocked) {
      return {
        success: false,
        error:
          'Prerequisite activity is missing; cannot award Master certificate.',
      };
    }

    const certRes = await issueCertificate({
      userId: input.userId,
      userName: input.userName || 'Master Technology Ethicist',
      curriculumId: 'master-technology-ethicist',
      curriculumTitle:
        'The Ethics of Technology Through Science Fiction — Master Certificate',
    });
    if (!certRes.success) return { success: false, error: certRes.error };
    return { success: true, data: { certificateId: certRes.data.id } };
  } catch (err) {
    console.error('[master-exam] award error:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Legacy export kept so any stale imports keep compiling. The Master
 * Exam no longer uses a certificate-based prereq list; use
 * `getMasterExamUnlockState()` for the real data.
 */
export async function getMasterExamPrerequisites(): Promise<
  Array<{ curriculumId: string; title: string }>
> {
  return [
    {
      curriculumId: 'textbook-master',
      title:
        'The Ethics of Technology Through Science Fiction — Textbook Master Certificate',
    },
  ];
}
