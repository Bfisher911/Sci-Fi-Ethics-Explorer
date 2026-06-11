'use server';

/**
 * Achievement certificate rule engine — server side.
 *
 * `buildCertificateContext` gathers every count/denominator ONCE from the
 * existing authoritative sources (userProgress, perspectives, framework
 * progress, quiz attempts, weekly dilemma responses, static datasets). The
 * pure engine (`src/lib/certificates/engine.ts`) then decides progress and
 * what's earned. `checkAndAwardCertificates` issues newly-earned certificates
 * through the existing idempotent `issueCertificate`, so refreshes / replays
 * never duplicate. No activity page contains certificate logic — they just
 * call `checkAndAwardCertificates` after recording progress.
 */

import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import { getUserProgress } from './progress';
import { getUserPerspectives } from './perspectives';
import { getFrameworkProgress } from './framework-explorer';
import { getUserBestAttempts } from './quizzes';
import { getUserCertificates, issueCertificate } from './certificates';
import { countUserDilemmaResponses } from './weekly-dilemmas';
import { checkAndAwardBadges } from './badges';
import { getTextbookProgress } from './textbook';
import { getUserVoidedReports } from './activity-reports';

import { TOTAL_MODULES } from '@/data/framework-explorer';
import { ethicalTheoryQuizzes } from '@/data/theory-quizzes';
import { scifiAuthorData } from '@/data/scifi-authors';
import { scifiMediaData } from '@/data/scifi-media';
import { allBadges } from '@/data/badges';

import {
  CERTIFICATE_DEFINITIONS,
  type CertificateContext,
  type CertificateCategory,
} from '@/lib/certificates/registry';
import { evaluate, evaluateAll, type CertificateProgress } from '@/lib/certificates/engine';
import type { Certificate, QuizAttempt } from '@/types';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── helpers ─────────────────────────────────────────────────────────

async function resolveUserName(userId: string): Promise<string> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      const d = snap.data();
      return (
        d.displayName ||
        [d.firstName, d.lastName].filter(Boolean).join(' ') ||
        d.name ||
        (typeof d.email === 'string' ? d.email.split('@')[0] : '') ||
        'Learner'
      );
    }
  } catch {
    /* fall through */
  }
  return 'Learner';
}

async function isPlatformAdmin(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() && snap.data().isAdmin === true;
  } catch {
    return false;
  }
}

/** Count distinct quizzes the user passed within a category, bounded by the
 *  category's denominator id-set (so stray attempts never over-count). */
function countPassedInSet(
  bestAttempts: QuizAttempt[],
  subjectType: string,
  allowedIds: Set<string>,
  excludeIds?: Set<string>
): number {
  let n = 0;
  for (const a of bestAttempts) {
    if (
      a.subjectType === subjectType &&
      a.passed &&
      allowedIds.has(a.subjectId) &&
      !excludeIds?.has(a.subjectId)
    ) {
      n++;
    }
  }
  return n;
}

// ─── context ─────────────────────────────────────────────────────────

export async function buildCertificateContext(
  userId: string
): Promise<CertificateContext> {
  const base: CertificateContext = {
    storiesCompleted: 0,
    scenariosAnalyzed: 0,
    comparesCompleted: 0,
    studioReflections: 0,
    dilemmaResponses: 0,
    debatesParticipated: 0,
    frameworkModulesCompleted: 0,
    frameworkTotalModules: TOTAL_MODULES,
    quizMastery: {
      philosopher: { passed: 0, total: 0 },
      framework: { passed: 0, total: ethicalTheoryQuizzes.length },
      scifiAuthor: { passed: 0, total: scifiAuthorData.length },
      scifiMedia: { passed: 0, total: scifiMediaData.length },
    },
    dialogueAssessmentsPassed: {
      philosopher: 0,
      scifiAuthor: 0,
      scifiMedia: 0,
      framework: 0,
    },
  };
  if (!userId) return base;

  // Static, reliable denominators. Philosopher quizzes are admin-seeded, so
  // their denominator is whatever exists in the `quizzes` collection.
  const theoryIds = new Set(ethicalTheoryQuizzes.map((q) => q.subjectId));
  const authorIds = new Set(scifiAuthorData.map((a) => a.id));
  const mediaIds = new Set(scifiMediaData.map((m) => m.id));

  const [
    progressRes,
    perspectivesRes,
    frameworkRes,
    bestAttemptsRes,
    dilemmaResponses,
    philosopherQuizSnap,
    textbookProgressRes,
    voidedReports,
    dialogueReportSnap,
  ] = await Promise.all([
    getUserProgress(userId),
    getUserPerspectives(userId),
    getFrameworkProgress(userId),
    getUserBestAttempts(userId),
    countUserDilemmaResponses(userId),
    getDocs(
      query(collection(db, 'quizzes'), where('subjectType', '==', 'philosopher'))
    ).catch(() => ({ docs: [] as any[] })),
    getTextbookProgress(userId),
    getUserVoidedReports(userId),
    getDocs(
      query(
        collection(db, 'activityReports'),
        where('userId', '==', userId),
        where('activityType', '==', 'dialogue')
      )
    ).catch(() => ({ docs: [] as any[] })),
  ]);

  // Voided activity evidence does not count toward certificates. Subtract
  // voided activities from the relevant counts and exclude voided quizzes.
  const voidedByType = (type: string) =>
    voidedReports.filter((r) => r.activityType === type).length;
  const voidedQuizIds = new Set(
    voidedReports.filter((r) => r.activityType === 'quiz').map((r) => r.activityId)
  );
  const sub = (n: number, type: string) => Math.max(0, n - voidedByType(type));

  const progress = progressRes.success ? progressRes.data : null;
  const comparesCompleted = perspectivesRes.success ? perspectivesRes.data.length : 0;
  const frameworkModulesCompleted = frameworkRes.success
    ? frameworkRes.data.completedModules.length
    : 0;
  const bestAttempts: QuizAttempt[] = bestAttemptsRes.success ? bestAttemptsRes.data : [];

  const philosopherIds = new Set(
    (philosopherQuizSnap.docs as any[])
      .map((d) => String(d.data().subjectId || ''))
      .filter(Boolean)
  );

  // Distinct dialogue assessments passed per persona category. Voided
  // evidence is excluded; retakes of the same persona count once.
  const dialoguePassed = {
    philosopher: new Set<string>(),
    scifiAuthor: new Set<string>(),
    scifiMedia: new Set<string>(),
    framework: new Set<string>(),
  };
  const subtypeKey: Record<string, keyof typeof dialoguePassed> = {
    philosopher: 'philosopher',
    'scifi-author': 'scifiAuthor',
    'scifi-media': 'scifiMedia',
    framework: 'framework',
  };
  for (const d of dialogueReportSnap.docs as any[]) {
    const data = d.data();
    if (data.voided === true || data.passed !== true) continue;
    const key = subtypeKey[String(data.activitySubtype || '')];
    if (key) dialoguePassed[key].add(String(data.activityId || d.id));
  }

  // Per-chapter quiz pass state, keyed by chapter slug (the quiz subjectId).
  // Voided chapter-quiz evidence is excluded (doesn't count toward the
  // textbook milestone).
  const chapterQuizzes: Record<string, { passed: boolean; score: number }> = {};
  for (const a of bestAttempts) {
    if (a.subjectType === 'book-chapter' && !voidedQuizIds.has(a.subjectId)) {
      chapterQuizzes[a.subjectId] = { passed: a.passed, score: a.scorePercent };
    }
  }

  return {
    storiesCompleted: sub(progress?.storiesCompleted.length ?? 0, 'story'),
    scenariosAnalyzed: sub(progress?.scenariosAnalyzed ?? 0, 'studio_analysis'),
    comparesCompleted: sub(comparesCompleted, 'studio_compare'),
    studioReflections: sub(
      progress?.studioReflectionsCompleted ?? 0,
      'studio_reflect'
    ),
    dilemmaResponses: sub(dilemmaResponses, 'dilemma'),
    debatesParticipated: sub(progress?.debatesParticipated.length ?? 0, 'debate'),
    frameworkModulesCompleted: sub(frameworkModulesCompleted, 'framework_explorer'),
    frameworkTotalModules: TOTAL_MODULES,
    quizMastery: {
      philosopher: {
        passed: countPassedInSet(bestAttempts, 'philosopher', philosopherIds, voidedQuizIds),
        total: philosopherIds.size,
      },
      framework: {
        passed: countPassedInSet(bestAttempts, 'theory', theoryIds, voidedQuizIds),
        total: theoryIds.size,
      },
      scifiAuthor: {
        passed: countPassedInSet(bestAttempts, 'scifi-author', authorIds, voidedQuizIds),
        total: authorIds.size,
      },
      scifiMedia: {
        passed: countPassedInSet(bestAttempts, 'scifi-media', mediaIds, voidedQuizIds),
        total: mediaIds.size,
      },
    },
    chapterQuizzes,
    textbookFinalExamPassed: textbookProgressRes.success
      ? textbookProgressRes.data.finalExamPassed === true
      : false,
    dialogueAssessmentsPassed: {
      philosopher: dialoguePassed.philosopher.size,
      scifiAuthor: dialoguePassed.scifiAuthor.size,
      scifiMedia: dialoguePassed.scifiMedia.size,
      framework: dialoguePassed.framework.size,
    },
  };
}

// ─── progress ────────────────────────────────────────────────────────

export interface CertificateProgressRow extends CertificateProgress {
  earnedCertificate?: {
    id: string;
    verificationHash: string;
    issuedAt: string; // ISO
    communityName?: string;
    /** Score earned, for chapter-quiz certificates. */
    score?: number;
  };
}

/** Merge live engine progress with persisted certificates (the persisted cert
 *  is the authoritative "earned" signal even if live metrics later dip). */
function buildRows(
  ctx: CertificateContext,
  certs: Certificate[]
): CertificateProgressRow[] {
  const byCurriculum = new Map<string, Certificate>();
  for (const c of certs) {
    if (!c.revokedAt) byCurriculum.set(c.curriculumId, c);
  }
  return evaluateAll(ctx).map((p) => {
    const cert = byCurriculum.get(p.id);
    return {
      ...p,
      earned: p.earned || !!cert,
      earnedCertificate: cert
        ? {
            id: cert.id,
            verificationHash: cert.verificationHash,
            issuedAt:
              cert.issuedAt instanceof Date
                ? cert.issuedAt.toISOString()
                : new Date().toISOString(),
            communityName: cert.communityName,
            score:
              typeof cert.metadata?.score === 'number'
                ? cert.metadata.score
                : undefined,
          }
        : undefined,
    };
  });
}

export async function getCertificateProgress(
  userId: string
): Promise<ActionResult<CertificateProgressRow[]>> {
  try {
    const [ctx, certsRes] = await Promise.all([
      buildCertificateContext(userId),
      getUserCertificates(userId),
    ]);
    const certs = certsRes.success ? certsRes.data : [];
    return { success: true, data: buildRows(ctx, certs) };
  } catch (error) {
    console.error('[achievement-certificates] getCertificateProgress error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── award ───────────────────────────────────────────────────────────

export async function checkAndAwardCertificates(
  userId: string,
  opts?: { categories?: CertificateCategory[]; communityId?: string }
): Promise<
  ActionResult<{
    newlyEarned: Certificate[];
    newlyEarnedBadges: { id: string; name: string }[];
    progress: CertificateProgressRow[];
  }>
> {
  try {
    if (!userId) return { success: false, error: 'User ID is required.' };

    const [ctx, certsRes] = await Promise.all([
      buildCertificateContext(userId),
      getUserCertificates(userId),
    ]);
    const existing = certsRes.success ? certsRes.data : [];
    const alreadyIssued = new Set(existing.map((c) => c.curriculumId));

    // Resolve optional community context once.
    let communityName: string | undefined;
    let instructorName: string | undefined;
    if (opts?.communityId) {
      try {
        const cSnap = await getDoc(doc(db, 'communities', opts.communityId));
        if (cSnap.exists()) {
          communityName = cSnap.data().name;
          instructorName = cSnap.data().ownerName;
        }
      } catch {
        /* non-fatal */
      }
    }

    const defs = opts?.categories
      ? CERTIFICATE_DEFINITIONS.filter((d) => opts.categories!.includes(d.category))
      : CERTIFICATE_DEFINITIONS;

    let userName: string | null = null;
    const newlyEarned: Certificate[] = [];

    for (const def of defs) {
      // The textbook master certificate is issued by recordFinalExamPass on
      // final-exam pass. The engine only displays its progress; it must not
      // issue a competing copy.
      if (def.category === 'textbook-master') continue;
      const p = evaluate(def, ctx);
      if (!p.earned || alreadyIssued.has(def.id)) continue;
      if (userName === null) userName = await resolveUserName(userId);
      const res = await issueCertificate({
        userId,
        userName,
        curriculumId: def.id,
        curriculumTitle: def.title,
        certificateType: 'achievement',
        description: def.description,
        criteria: def.criteria,
        progressSnapshot: { current: p.current, target: p.target, label: def.criteria },
        communityId: opts?.communityId,
        communityName,
        instructorName,
      });
      if (res.success) {
        newlyEarned.push(res.data);
        alreadyIssued.add(def.id);
      }
    }

    // Badges share the same trigger surface as certificates. Evaluating them
    // here means every activity completion (and the dashboard/profile backstop
    // that calls this action) keeps badge state current — wiring the otherwise
    // un-called `checkAndAwardBadges` evaluator into the app. It is independently
    // idempotent; a badge failure must never affect certificate awarding.
    let newlyEarnedBadges: { id: string; name: string }[] = [];
    try {
      const badgeRes = await checkAndAwardBadges(userId);
      if (badgeRes.success) {
        newlyEarnedBadges = badgeRes.data.newlyEarned.map((id) => ({
          id,
          name: allBadges.find((b) => b.id === id)?.name || id,
        }));
      }
    } catch (badgeErr) {
      console.warn('[achievement-certificates] badge check failed:', badgeErr);
    }

    // Re-read certs (cheap) so the returned progress reflects new awards
    // without rebuilding the whole context.
    const freshCertsRes = newlyEarned.length
      ? await getUserCertificates(userId)
      : certsRes;
    const freshCerts = freshCertsRes.success ? freshCertsRes.data : existing;

    return {
      success: true,
      data: {
        newlyEarned,
        newlyEarnedBadges,
        progress: buildRows(ctx, freshCerts),
      },
    };
  } catch (error) {
    console.error('[achievement-certificates] checkAndAwardCertificates error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── instructor / admin view ─────────────────────────────────────────

export interface MemberCertificateSummary {
  uid: string;
  name: string;
  email?: string;
  role: 'owner' | 'instructor' | 'member';
  earned: { id: string; title: string; verificationHash: string; issuedAt: string }[];
  /** Up to 5 closest in-progress certificates, highest percent first. */
  inProgress: { id: string; title: string; current: number; target: number; percent: number }[];
}

/**
 * Owner/instructor/admin view of every member's certificates + how close they
 * are to the next ones. Gated to people who manage the community.
 */
export async function getCommunityMemberCertificates(
  communityId: string,
  requesterId: string
): Promise<ActionResult<MemberCertificateSummary[]>> {
  try {
    const cSnap = await getDoc(doc(db, 'communities', communityId));
    if (!cSnap.exists()) return { success: false, error: 'Community not found.' };
    const cd = cSnap.data();

    const isOwner = cd.ownerId === requesterId;
    const isInstructor =
      Array.isArray(cd.instructorIds) && cd.instructorIds.includes(requesterId);
    if (!isOwner && !isInstructor && !(await isPlatformAdmin(requesterId))) {
      return {
        success: false,
        error:
          'Only community owners, instructors, or admins can view member certificates.',
      };
    }

    const instructorIds: string[] = cd.instructorIds || [];
    const memberIds: string[] = cd.memberIds || [];
    const allIds = Array.from(
      new Set([...instructorIds, ...memberIds, cd.ownerId].filter(Boolean))
    ) as string[];

    const summaries: MemberCertificateSummary[] = [];
    for (const uid of allIds) {
      const [progressRes, userSnap] = await Promise.all([
        getCertificateProgress(uid),
        getDoc(doc(db, 'users', uid)),
      ]);
      const ud = userSnap.exists() ? userSnap.data() : {};
      const name =
        ud.displayName ||
        [ud.firstName, ud.lastName].filter(Boolean).join(' ') ||
        ud.name ||
        'Member';
      const rows = progressRes.success ? progressRes.data : [];
      const earned = rows
        .filter((r) => r.earnedCertificate)
        .map((r) => ({
          id: r.id,
          title: r.title,
          verificationHash: r.earnedCertificate!.verificationHash,
          issuedAt: r.earnedCertificate!.issuedAt,
        }));
      const inProgress = rows
        .filter((r) => !r.earned && r.current > 0)
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          title: r.title,
          current: r.current,
          target: r.target,
          percent: r.percent,
        }));
      const role: MemberCertificateSummary['role'] =
        uid === cd.ownerId ? 'owner' : instructorIds.includes(uid) ? 'instructor' : 'member';
      summaries.push({ uid, name, email: ud.email, role, earned, inProgress });
    }

    return { success: true, data: summaries };
  } catch (error) {
    console.error(
      '[achievement-certificates] getCommunityMemberCertificates error:',
      error
    );
    return { success: false, error: String(error) };
  }
}
