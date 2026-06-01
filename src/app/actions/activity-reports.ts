'use server';

/**
 * Activity Evidence service — badges / activity reports for individual
 * completed activities. One report per (user, activity), idempotent across
 * refreshes/replays; retakes update the latest attempt and preserve history.
 *
 * A report can be downloaded as a PDF, submitted to a community (reusing the
 * contributions system), emailed to an instructor, and verified by code.
 * Admins/managing instructors can void/restore a report; voided evidence does
 * not count toward certificates until restored.
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import type {
  ActivityReport,
  ActivityReportType,
  ContributionType,
} from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { buildReportSummary, type ActivityReportInput } from '@/lib/activity-reports/summary';
import { createContribution } from './contributions';
import { absoluteUrl } from '@/lib/site';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const COLLECTION = 'activityReports';

function makeHash(): string {
  return Array.from({ length: 12 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32))
  ).join('');
}

function sanitizeId(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '-');
}

/** Deterministic doc id → idempotency: refresh/replay hit the same document. */
function reportDocId(userId: string, activityType: string, activityId: string): string {
  return sanitizeId(`${userId}__${activityType}__${activityId}`);
}

function reportFromDoc(id: string, d: Record<string, any>): ActivityReport {
  return {
    id,
    userId: d.userId,
    userName: d.userName || 'A student',
    activityType: d.activityType,
    activitySubtype: d.activitySubtype || undefined,
    activityId: d.activityId,
    activityTitle: d.activityTitle || '',
    completedAt: timestampToDate(d.completedAt) ?? new Date(),
    score: typeof d.score === 'number' ? d.score : undefined,
    passingThreshold: typeof d.passingThreshold === 'number' ? d.passingThreshold : undefined,
    passed: typeof d.passed === 'boolean' ? d.passed : undefined,
    summary: d.summary || '',
    content: d.content || undefined,
    verificationHash: d.verificationHash || '',
    attempt: typeof d.attempt === 'number' ? d.attempt : 1,
    attemptsHistory: Array.isArray(d.attemptsHistory)
      ? d.attemptsHistory.map((a: any) => ({
          score: typeof a.score === 'number' ? a.score : undefined,
          passed: typeof a.passed === 'boolean' ? a.passed : undefined,
          completedAt: timestampToDate(a.completedAt) ?? null,
        }))
      : undefined,
    communityId: d.communityId || undefined,
    communityName: d.communityName || undefined,
    instructorName: d.instructorName || undefined,
    submittedAt: timestampToDate(d.submittedAt),
    contributionId: d.contributionId || undefined,
    voidedAt: timestampToDate(d.voidedAt),
    voidedBy: d.voidedBy || undefined,
    voidReason: d.voidReason || undefined,
    createdAt: timestampToDate(d.createdAt) ?? new Date(),
    updatedAt: timestampToDate(d.updatedAt),
  };
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

function isCommunityManager(community: Record<string, any>, uid: string): boolean {
  return (
    community.ownerId === uid ||
    (Array.isArray(community.instructorIds) && community.instructorIds.includes(uid))
  );
}

// ─── Generate (idempotent) ───────────────────────────────────────────

/**
 * Create or update the evidence report for a completed activity. Idempotent on
 * (userId, activityType, activityId): a refresh/replay with the same outcome
 * updates in place; a genuine retake (different score/pass) becomes a new
 * attempt and the prior attempt is preserved in history.
 */
export async function generateActivityReport(
  input: ActivityReportInput
): Promise<ActionResult<ActivityReport>> {
  try {
    if (!input.userId || !input.activityId) {
      return { success: false, error: 'Missing user or activity id.' };
    }
    const id = reportDocId(input.userId, input.activityType, input.activityId);
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    const summary = buildReportSummary(input);
    const completedAt = input.completedAt ? new Date(input.completedAt) : serverTimestamp();

    const common = {
      userId: input.userId,
      userName: input.userName || 'A student',
      activityType: input.activityType,
      activitySubtype: input.activitySubtype || null,
      activityId: input.activityId,
      activityTitle: input.activityTitle || '',
      score: typeof input.score === 'number' ? input.score : null,
      passed: typeof input.passed === 'boolean' ? input.passed : null,
      passingThreshold:
        typeof input.passingThreshold === 'number' ? input.passingThreshold : null,
      summary,
      content: input.content ?? null,
      completedAt,
      updatedAt: serverTimestamp(),
    };

    if (snap.exists()) {
      const prev = snap.data();
      const sameAttempt =
        (prev.score ?? null) === (input.score ?? null) &&
        (prev.passed ?? null) === (input.passed ?? null);
      const update: Record<string, any> = { ...common };
      if (!sameAttempt) {
        const history = Array.isArray(prev.attemptsHistory) ? prev.attemptsHistory : [];
        history.push({
          score: prev.score ?? null,
          passed: prev.passed ?? null,
          completedAt: prev.completedAt ?? null,
        });
        update.attemptsHistory = history.slice(-20);
        update.attempt = (prev.attempt ?? 1) + 1;
      }
      await setDoc(ref, update, { merge: true });
    } else {
      await setDoc(ref, {
        ...common,
        verificationHash: makeHash(),
        attempt: 1,
        attemptsHistory: [],
        voided: false,
        createdAt: serverTimestamp(),
      });
    }

    const fresh = await getDoc(ref);
    return { success: true, data: reportFromDoc(fresh.id, fresh.data() || {}) };
  } catch (error) {
    console.error('[activity-reports] generateActivityReport error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Reads ───────────────────────────────────────────────────────────

export async function getUserActivityReports(
  userId: string
): Promise<ActionResult<ActivityReport[]>> {
  try {
    if (!userId) return { success: true, data: [] };
    const snap = await getDocs(query(collection(db, COLLECTION), where('userId', '==', userId)));
    const items = snap.docs
      .map((d) => reportFromDoc(d.id, d.data()))
      .sort((a, b) => {
        const at = a.completedAt instanceof Date ? a.completedAt.getTime() : 0;
        const bt = b.completedAt instanceof Date ? b.completedAt.getTime() : 0;
        return bt - at;
      });
    return { success: true, data: items };
  } catch (error) {
    console.error('[activity-reports] getUserActivityReports error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getActivityReportByHash(
  hash: string
): Promise<ActionResult<ActivityReport | null>> {
  try {
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('verificationHash', '==', hash))
    );
    if (snap.empty) return { success: true, data: null };
    const d = snap.docs[0];
    return { success: true, data: reportFromDoc(d.id, d.data()) };
  } catch (error) {
    console.error('[activity-reports] getActivityReportByHash error:', error);
    return { success: false, error: String(error) };
  }
}

/** Voided reports for a user — used by the certificate engine to exclude
 *  voided evidence from certificate counting. Degrades to [] on error. */
export async function getUserVoidedReports(
  userId: string
): Promise<ActivityReport[]> {
  if (!userId) return [];
  try {
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('userId', '==', userId), where('voided', '==', true))
    );
    return snap.docs.map((d) => reportFromDoc(d.id, d.data()));
  } catch (error) {
    console.warn('[activity-reports] getUserVoidedReports failed:', error);
    return [];
  }
}

// ─── Submit to community ─────────────────────────────────────────────

const ACTIVITY_TO_CONTRIBUTION: Record<string, ContributionType> = {
  story: 'story_completion',
  quiz: 'quiz_result',
  dilemma: 'weekly_dilemma',
  debate: 'debate',
  studio_analysis: 'analysis',
  studio_compare: 'perspective_comparison',
  studio_reflect: 'reflection',
  framework_explorer: 'framework_result',
  media_reflection: 'media_reflection',
  other: 'reflection',
};

export async function submitActivityReportToCommunity(
  reportId: string,
  userId: string,
  communityId: string
): Promise<ActionResult<ActivityReport>> {
  try {
    const ref = doc(db, COLLECTION, reportId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Report not found.' };
    const report = reportFromDoc(snap.id, snap.data());
    if (report.userId !== userId) {
      return { success: false, error: 'You can only submit your own reports.' };
    }

    const contribType: ContributionType =
      ACTIVITY_TO_CONTRIBUTION[String(report.activityType)] || 'reflection';

    // createContribution enforces community membership server-side.
    const contribRes = await createContribution({
      communityId,
      type: contribType,
      contributorId: userId,
      contributorName: report.userName,
      title: report.activityTitle || 'Activity evidence',
      summary: report.summary,
      sourceCollection: COLLECTION,
      sourceId: report.id,
      content: {
        reportId: report.id,
        verificationHash: report.verificationHash,
        activityType: report.activityType,
        score: report.score,
        passed: report.passed,
        passingThreshold: report.passingThreshold,
        ...(report.content ?? {}),
      },
    });
    if (!contribRes.success) return { success: false, error: contribRes.error };

    // Resolve community display info.
    let communityName: string | undefined;
    let instructorName: string | undefined;
    try {
      const cSnap = await getDoc(doc(db, 'communities', communityId));
      if (cSnap.exists()) {
        communityName = cSnap.data().name;
        instructorName = cSnap.data().ownerName;
      }
    } catch {
      /* non-fatal */
    }

    await updateDoc(ref, {
      submittedAt: serverTimestamp(),
      communityId,
      communityName: communityName || null,
      instructorName: instructorName || null,
      contributionId: contribRes.data,
      updatedAt: serverTimestamp(),
    });

    const fresh = await getDoc(ref);
    return { success: true, data: reportFromDoc(fresh.id, fresh.data() || {}) };
  } catch (error) {
    console.error('[activity-reports] submitActivityReportToCommunity error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Email to instructor ─────────────────────────────────────────────

export async function emailActivityReportToInstructor(
  reportId: string,
  userId: string,
  opts: { communityId?: string; toEmail?: string }
): Promise<ActionResult<{ sentTo: string }>> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, reportId));
    if (!snap.exists()) return { success: false, error: 'Report not found.' };
    const report = reportFromDoc(snap.id, snap.data());
    if (report.userId !== userId) {
      return { success: false, error: 'You can only send your own reports.' };
    }

    // Resolve recipient: explicit address wins, else the community instructor.
    let to = (opts.toEmail || '').trim();
    if (!to && opts.communityId) {
      const cSnap = await getDoc(doc(db, 'communities', opts.communityId));
      if (cSnap.exists()) {
        const cd = cSnap.data();
        const candidates: string[] = [
          cd.ownerId,
          ...((cd.instructorIds as string[]) || []),
        ].filter(Boolean);
        for (const uid of candidates) {
          const uSnap = await getDoc(doc(db, 'users', uid));
          const email = uSnap.exists() ? (uSnap.data().email as string) : '';
          if (email) {
            to = email;
            break;
          }
        }
      }
    }
    if (!to) {
      return {
        success: false,
        error: 'No instructor email available — enter an address to send to.',
      };
    }

    const verifyUrl = absoluteUrl(`/verify/report/${report.verificationHash}`);
    const scoreLine =
      typeof report.score === 'number'
        ? `Score: ${report.score}%${
            typeof report.passingThreshold === 'number'
              ? ` (passing ${report.passingThreshold}%)`
              : ''
          }${report.passed === true ? ' — passed' : report.passed === false ? ' — not passed' : ''}\n`
        : '';
    const subject = `Activity evidence: ${report.activityTitle} — ${report.userName}`;
    const text =
      `${report.userName} is submitting completed activity evidence.\n\n` +
      `Activity: ${report.activityTitle}\n` +
      scoreLine +
      `\nSummary: ${report.summary}\n\n` +
      `Verify this report: ${verifyUrl}\n` +
      `Verification code: ${report.verificationHash}\n`;

    const { sendEmail } = await import('@/lib/email');
    const res = await sendEmail({ to, subject, text });
    if (!res.ok) return { success: false, error: res.error || 'Email failed to send.' };
    return { success: true, data: { sentTo: to } };
  } catch (error) {
    console.error('[activity-reports] emailActivityReportToInstructor error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Void / restore (admin or managing instructor) ───────────────────

async function canManageReport(
  report: ActivityReport,
  requesterId: string
): Promise<boolean> {
  if (await isPlatformAdmin(requesterId)) return true;
  if (report.communityId) {
    try {
      const cSnap = await getDoc(doc(db, 'communities', report.communityId));
      if (cSnap.exists() && isCommunityManager(cSnap.data(), requesterId)) return true;
    } catch {
      /* fall through */
    }
  }
  return false;
}

export async function voidActivityReport(
  reportId: string,
  requesterId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    const ref = doc(db, COLLECTION, reportId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Report not found.' };
    const report = reportFromDoc(snap.id, snap.data());
    if (!(await canManageReport(report, requesterId))) {
      return { success: false, error: 'Not authorized to void this report.' };
    }
    await updateDoc(ref, {
      voided: true,
      voidedAt: serverTimestamp(),
      voidedBy: requesterId,
      voidReason: reason || null,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[activity-reports] voidActivityReport error:', error);
    return { success: false, error: String(error) };
  }
}

export async function restoreActivityReport(
  reportId: string,
  requesterId: string
): Promise<ActionResult> {
  try {
    const ref = doc(db, COLLECTION, reportId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Report not found.' };
    const report = reportFromDoc(snap.id, snap.data());
    if (!(await canManageReport(report, requesterId))) {
      return { success: false, error: 'Not authorized to restore this report.' };
    }
    await updateDoc(ref, {
      voided: false,
      voidedAt: null,
      voidedBy: null,
      voidReason: null,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[activity-reports] restoreActivityReport error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Instructor view of submitted reports ────────────────────────────

export async function getCommunitySubmittedReports(
  communityId: string,
  requesterId: string
): Promise<ActionResult<ActivityReport[]>> {
  try {
    const cSnap = await getDoc(doc(db, 'communities', communityId));
    if (!cSnap.exists()) return { success: false, error: 'Community not found.' };
    const cd = cSnap.data();
    if (!isCommunityManager(cd, requesterId) && !(await isPlatformAdmin(requesterId))) {
      return {
        success: false,
        error: 'Only owners, instructors, or admins can view submitted reports.',
      };
    }
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('communityId', '==', communityId))
    );
    const items = snap.docs
      .map((d) => reportFromDoc(d.id, d.data()))
      .filter((r) => !!r.submittedAt)
      .sort((a, b) => {
        const at = a.submittedAt instanceof Date ? a.submittedAt.getTime() : 0;
        const bt = b.submittedAt instanceof Date ? b.submittedAt.getTime() : 0;
        return bt - at;
      });
    return { success: true, data: items };
  } catch (error) {
    console.error('[activity-reports] getCommunitySubmittedReports error:', error);
    return { success: false, error: String(error) };
  }
}
