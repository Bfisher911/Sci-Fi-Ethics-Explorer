'use server';

/**
 * User report pipeline. When a user clicks "Report User" on a public
 * profile, this persists a report document admins can review on the
 * moderation surface. Replaces the previous client-side stub that only
 * logged to the console.
 *
 * Reports are write-mostly: any signed-in user can file one; reads are
 * gated to admins in application code (the moderation page filters by
 * the admin's identity). One doc per report (auto id) so a user can
 * file multiple distinct reports over time.
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const COLLECTION = 'userReports';

export type UserReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface UserReport {
  id: string;
  reportedUserId: string;
  reporterId: string;
  reason: string;
  status: UserReportStatus;
  createdAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export async function submitUserReport(input: {
  reportedUserId: string;
  reporterId: string;
  reason: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { reportedUserId, reporterId, reason } = input;
    if (!reportedUserId || !reporterId) {
      return { success: false, error: 'Missing user identifiers.' };
    }
    if (reportedUserId === reporterId) {
      return { success: false, error: 'You cannot report yourself.' };
    }
    const trimmed = (reason || '').trim();
    if (trimmed.length < 3) {
      return { success: false, error: 'Please describe the issue briefly.' };
    }
    const ref = await addDoc(collection(db, COLLECTION), {
      reportedUserId,
      reporterId,
      reason: trimmed.slice(0, 2000),
      status: 'open' as UserReportStatus,
      createdAt: serverTimestamp(),
    });
    return { success: true, data: { id: ref.id } };
  } catch (error) {
    console.error('[user-reports] submitUserReport error:', error);
    return { success: false, error: String(error) };
  }
}

/** Admin: list reports, newest first, optionally filtered by status. */
export async function getUserReports(
  opts?: { status?: UserReportStatus },
): Promise<ActionResult<UserReport[]>> {
  try {
    const base = collection(db, COLLECTION);
    const q = opts?.status
      ? query(base, where('status', '==', opts.status), orderBy('createdAt', 'desc'))
      : query(base, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const out: UserReport[] = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        reportedUserId: String(data.reportedUserId || ''),
        reporterId: String(data.reporterId || ''),
        reason: String(data.reason || ''),
        status: (data.status as UserReportStatus) || 'open',
        createdAt: timestampToDate(data.createdAt as any) ?? undefined,
        reviewedBy: (data.reviewedBy as string | undefined) || undefined,
        reviewedAt: timestampToDate(data.reviewedAt as any) ?? undefined,
      };
    });
    return { success: true, data: out };
  } catch (error) {
    console.error('[user-reports] getUserReports error:', error);
    return { success: false, error: String(error) };
  }
}

/** Admin: update a report's status. */
export async function setUserReportStatus(input: {
  reportId: string;
  adminId: string;
  status: UserReportStatus;
}): Promise<ActionResult<void>> {
  try {
    if (!input.reportId || !input.adminId) {
      return { success: false, error: 'Missing identifiers.' };
    }
    await updateDoc(doc(db, COLLECTION, input.reportId), {
      status: input.status,
      reviewedBy: input.adminId,
      reviewedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[user-reports] setUserReportStatus error:', error);
    return { success: false, error: String(error) };
  }
}
