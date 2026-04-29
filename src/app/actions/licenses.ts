
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
  query, where, limit as fsLimit, increment, serverTimestamp,
} from 'firebase/firestore';
import type { License, SeatAssignment, LicenseTerm, LicenseStatus } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { isSuperAdminEmail } from '@/lib/super-admins';

/**
 * Effectively-infinite seat count used for super-admin licenses (and
 * any other license we want to mark as unmetered). Big enough that a
 * usedSeats counter will never approach it; small enough that we can
 * still arithmetic on it without overflow surprises.
 */
const UNLIMITED_SEATS = 1_000_000;

/**
 * Stable codes the client can switch on for actionable error UI.
 * Mirrors the auth-form `errorCode` pattern so the receiving UI can
 * render context-specific copy + a CTA without parsing strings.
 */
export type LicenseErrorCode =
  | 'missing_email'
  | 'license_not_found'
  | 'license_inactive'
  | 'no_seats_available'
  | 'duplicate_seat'
  | 'permission_denied'
  | 'upstream_error';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; errorCode?: LicenseErrorCode };

/**
 * Returns true when the given license document is unmetered (super-admin
 * owned OR explicitly tagged with `unmetered: true`). Unmetered licenses
 * skip the totalSeats cap during seat assignment.
 *
 * Accepts a Firestore data object (the body of a `licenses/{id}` doc).
 */
async function isUnmeteredLicense(license: Record<string, any>): Promise<boolean> {
  if (license?.unmetered === true) return true;
  const purchaserId = license?.purchaserId as string | undefined;
  if (!purchaserId) return false;
  try {
    const purchaserSnap = await getDoc(doc(db, 'users', purchaserId));
    if (!purchaserSnap.exists()) return false;
    return isSuperAdminEmail(purchaserSnap.data().email);
  } catch {
    return false;
  }
}

/**
 * Idempotently ensure the super-admin always has an unmetered "owner"
 * license they can assign seats from. Safe to call from anywhere — if
 * an unmetered license already exists for this purchaser it returns
 * the existing id; otherwise it creates one.
 *
 * Use this from the super admin's billing page so they don't have to
 * "purchase" anything to unlock seat management.
 */
export async function ensureSuperAdminLicense(
  purchaserId: string,
): Promise<ActionResult<string>> {
  try {
    if (!purchaserId) return { success: false, error: 'purchaserId required' };
    const userSnap = await getDoc(doc(db, 'users', purchaserId));
    if (!userSnap.exists()) {
      return { success: false, error: 'User profile not found.' };
    }
    const userData = userSnap.data();
    if (!isSuperAdminEmail(userData.email)) {
      return {
        success: false,
        error: 'Only the platform super-admin can hold an unmetered license.',
      };
    }

    // Check for an existing active unmetered license owned by this uid.
    const existingQ = query(
      collection(db, 'licenses'),
      where('purchaserId', '==', purchaserId),
      where('status', '==', 'active'),
      where('unmetered', '==', true),
      fsLimit(1),
    );
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      return { success: true, data: existingSnap.docs[0].id };
    }

    // Mint a fresh unmetered license. Far-future endDate so it never
    // appears expired in the UI.
    const now = new Date();
    const farFuture = new Date(now);
    farFuture.setFullYear(now.getFullYear() + 100);

    const purchaserName =
      userData.name || userData.displayName || 'Platform Owner';

    const ref = await addDoc(collection(db, 'licenses'), {
      organizationName: 'Sci-Fi Ethics Explorer (Platform)',
      purchaserId,
      purchaserName,
      planId: 'super-admin-unmetered',
      totalSeats: UNLIMITED_SEATS,
      usedSeats: 0,
      term: 'annual' as LicenseTerm,
      startDate: now,
      endDate: farFuture,
      status: 'active' as LicenseStatus,
      priceTotal: 0,
      unmetered: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Wire the license onto the super-admin's profile so the existing
    // billing UI surfaces seat management for them.
    await setDoc(
      doc(db, 'users', purchaserId),
      {
        activeLicenseId: ref.id,
        subscriptionStatus: 'active',
        onboardingComplete: true,
        lastUpdated: serverTimestamp(),
      },
      { merge: true },
    );

    return { success: true, data: ref.id };
  } catch (error) {
    console.error('[licenses] ensureSuperAdminLicense error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Purchase a new seat-based license.
 * In production, this would be triggered after payment.
 */
export async function createLicense(data: {
  organizationName: string;
  purchaserId: string;
  purchaserName: string;
  totalSeats: number;
  term: LicenseTerm;
  priceTotal: number;
}): Promise<ActionResult<string>> {
  try {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + (data.term === 'semester' ? 4 : 12));

    const licenseRef = await addDoc(collection(db, 'licenses'), {
      organizationName: data.organizationName,
      purchaserId: data.purchaserId,
      purchaserName: data.purchaserName,
      planId: 'organization-license',
      totalSeats: data.totalSeats,
      usedSeats: 0,
      term: data.term,
      startDate: now,
      endDate,
      status: 'active' as LicenseStatus,
      priceTotal: data.priceTotal,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update purchaser's profile with license info
    await updateDoc(doc(db, 'users', data.purchaserId), {
      activeLicenseId: licenseRef.id,
      subscriptionStatus: 'active',
      onboardingComplete: true,
      lastUpdated: serverTimestamp(),
    });

    return { success: true, data: licenseRef.id };
  } catch (error) {
    console.error('[licenses] createLicense error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get a license by ID.
 */
export async function getLicense(
  licenseId: string
): Promise<ActionResult<License | null>> {
  try {
    const snap = await getDoc(doc(db, 'licenses', licenseId));
    if (!snap.exists()) return { success: true, data: null };
    const d = snap.data();
    return {
      success: true,
      data: {
        id: snap.id,
        organizationName: d.organizationName,
        purchaserId: d.purchaserId,
        purchaserName: d.purchaserName,
        planId: d.planId,
        totalSeats: d.totalSeats,
        usedSeats: d.usedSeats,
        term: d.term,
        startDate: timestampToDate(d.startDate),
        endDate: timestampToDate(d.endDate),
        status: d.status,
        unmetered: d.unmetered === true,
        createdAt: timestampToDate(d.createdAt),
        updatedAt: timestampToDate(d.updatedAt),
      } as License,
    };
  } catch (error) {
    console.error('[licenses] getLicense error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get licenses owned by a user.
 */
export async function getUserLicenses(
  purchaserId: string
): Promise<ActionResult<License[]>> {
  try {
    const q = query(
      collection(db, 'licenses'),
      where('purchaserId', '==', purchaserId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    const licenses = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        organizationName: data.organizationName,
        purchaserId: data.purchaserId,
        purchaserName: data.purchaserName,
        planId: data.planId,
        totalSeats: data.totalSeats,
        usedSeats: data.usedSeats,
        term: data.term,
        startDate: timestampToDate(data.startDate),
        endDate: timestampToDate(data.endDate),
        status: data.status,
        unmetered: data.unmetered === true,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as License;
    });
    return { success: true, data: licenses };
  } catch (error) {
    console.error('[licenses] getUserLicenses error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Assign a seat from a license to a user.
 *
 * `userId` is optional — when omitted (or when it doesn't resolve to
 * an existing users/{uid} doc) the action looks the recipient up by
 * `userEmail`. If no account exists yet, the seat is still allocated
 * (the recipient sees it the moment they sign in with that email)
 * but the users/{uid} write is skipped to avoid creating a stub doc
 * with the email as its id.
 */
export async function assignSeat(data: {
  licenseId: string;
  userId?: string;
  userEmail: string;
  communityId?: string;
}): Promise<ActionResult<string>> {
  try {
    if (!data.userEmail || !data.userEmail.trim()) {
      return {
        success: false,
        error: 'Email is required.',
        errorCode: 'missing_email',
      };
    }
    const email = data.userEmail.trim().toLowerCase();

    // Check license has available seats
    const licenseSnap = await getDoc(doc(db, 'licenses', data.licenseId));
    if (!licenseSnap.exists()) {
      return {
        success: false,
        error: 'License not found.',
        errorCode: 'license_not_found',
      };
    }

    const license = licenseSnap.data();
    if (license.status !== 'active') {
      return {
        success: false,
        error: 'License is not active.',
        errorCode: 'license_inactive',
      };
    }
    // Skip the seat-cap check when the license is owned by the super
    // admin OR explicitly flagged as unmetered. Super-admin licenses
    // are unlimited by policy (see CLAUDE.md / lib/super-admins.ts).
    const isUnmetered = await isUnmeteredLicense(license);
    if (!isUnmetered && license.usedSeats >= license.totalSeats) {
      return {
        success: false,
        error: 'No seats available. All seats are in use.',
        errorCode: 'no_seats_available',
      };
    }

    // Resolve recipient uid:
    //   1. trust an explicit userId IF that doc exists
    //   2. else look up by email in the users collection
    //   3. else fall through with no uid (we'll still record the seat)
    let resolvedUid: string | null = null;
    if (data.userId) {
      const passed = await getDoc(doc(db, 'users', data.userId));
      if (passed.exists()) resolvedUid = data.userId;
    }
    if (!resolvedUid) {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email),
        fsLimit(1)
      );
      const found = await getDocs(q);
      if (!found.empty) resolvedUid = found.docs[0].id;
    }

    // Reject if this license already has an active seat for the same
    // recipient (uid OR email) — keeps usedSeats honest. Use a more
    // actionable error message that points the admin at the existing
    // seats list (mirrors the auth-error pattern).
    const dupQ = query(
      collection(db, 'seatAssignments'),
      where('licenseId', '==', data.licenseId),
      where('status', '==', 'active'),
      where('userEmail', '==', email)
    );
    const dupSnap = await getDocs(dupQ);
    if (!dupSnap.empty) {
      return {
        success: false,
        errorCode: 'duplicate_seat',
        error:
          `${email} already has an active seat on this license. ` +
          'Look for them in the seat list below; if they say they ' +
          'can’t access the platform, ask them to sign in once ' +
          'with that email and the seat will activate automatically.',
      };
    }

    // Create seat assignment
    const seatRef = await addDoc(collection(db, 'seatAssignments'), {
      licenseId: data.licenseId,
      userId: resolvedUid, // may be null if the recipient hasn't signed up yet
      userEmail: email,
      communityId: data.communityId || null,
      assignedAt: serverTimestamp(),
      status: 'active',
    });

    // Increment used seats
    await updateDoc(doc(db, 'licenses', data.licenseId), {
      usedSeats: increment(1),
      updatedAt: serverTimestamp(),
    });

    // Notify the recipient if they have an account already. We only
    // notify when there's a real uid; without a uid the seat is just
    // a reservation and they'll see it the moment they sign in.
    if (resolvedUid) {
      try {
        const { createNotification } = await import('@/app/actions/notifications');
        await createNotification({
          userId: resolvedUid,
          type: 'seat_assigned',
          title: 'You were granted a seat',
          body: `${license.organizationName || 'An organization'} added you to their license. You now have full platform access.`,
          link: '/me',
          metadata: { licenseId: data.licenseId },
        });
      } catch (notifyErr) {
        console.warn('[licenses] seat-assigned notification failed:', notifyErr);
      }
    }

    // Only update the recipient's profile if we resolved a real uid.
    // Otherwise leave a clean trail for the recipient to pick up at
    // sign-in (see claimPendingSeats).
    //
    // setDoc(merge:true) instead of updateDoc so this never throws
    // NOT_FOUND when the user has a Firebase Auth account but no
    // users/{uid} doc yet (created lazily on first sign-in). The
    // create rule on users/{userId} accepts server-action writes
    // (no auth context) — see firestore.rules.
    if (resolvedUid) {
      await setDoc(
        doc(db, 'users', resolvedUid),
        {
          uid: resolvedUid,
          email,
          activeLicenseId: data.licenseId,
          subscriptionStatus: 'active',
          onboardingComplete: true,
          lastUpdated: serverTimestamp(),
        },
        { merge: true },
      );
    }

    // Fire-and-forget invite email via Resend. No-ops silently when
    // RESEND_API_KEY isn't set, so seat assignment never blocks on
    // email infra. Look up the inviter's display name for
    // personalization, plus the community name when scoped.
    try {
      const { notifyOnSeatAssigned } = await import(
        '@/lib/notifications-dispatch'
      );
      let inviterName = 'A Sci-Fi Ethics Explorer instructor';
      try {
        const purchaserSnap = await getDoc(
          doc(db, 'users', license.purchaserId)
        );
        if (purchaserSnap.exists()) {
          const u = purchaserSnap.data();
          inviterName =
            u.name || u.displayName || license.purchaserName || inviterName;
        } else if (license.purchaserName) {
          inviterName = license.purchaserName;
        }
      } catch {
        // best-effort
      }
      let communityName: string | undefined;
      if (data.communityId) {
        try {
          const cSnap = await getDoc(doc(db, 'communities', data.communityId));
          if (cSnap.exists()) communityName = cSnap.data().name;
        } catch {
          // best-effort
        }
      }
      void notifyOnSeatAssigned({
        recipientEmail: email,
        inviterName,
        organizationName: license.organizationName || 'their organization',
        communityName,
      });
    } catch (err) {
      console.warn('[licenses] seat-invite email dispatch failed:', err);
    }

    return { success: true, data: seatRef.id };
  } catch (error) {
    console.error('[licenses] assignSeat error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Called from the auth flow after sign-in. If a seat was pre-assigned
 * to the user's email before they had an account, link it now: stamp
 * the uid onto the seat doc and flip the new profile to active.
 */
export async function claimPendingSeats(
  uid: string,
  email: string | null | undefined
): Promise<ActionResult<{ claimed: number }>> {
  try {
    if (!uid || !email) return { success: true, data: { claimed: 0 } };
    const lower = email.trim().toLowerCase();
    const q = query(
      collection(db, 'seatAssignments'),
      where('userEmail', '==', lower),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    // Two counters:
    //   - `claimedNew` = seats that needed their userId stamped now
    //                    (the recipient just signed in for the first time)
    //   - `matched`    = total active seats for this email, regardless
    //                    of whether the userId field already pointed
    //                    at us. The user profile reconcile MUST run
    //                    whenever matched > 0, otherwise we'd silently
    //                    leave a fully-paid seat holder on the unpaid
    //                    gate just because assignSeat had pre-resolved
    //                    their uid. (That was the original bug.)
    let claimedNew = 0;
    let matched = 0;
    let licenseId: string | null = null;
    for (const d of snap.docs) {
      const data = d.data();
      matched++;
      licenseId = licenseId || data.licenseId;
      if (data.userId !== uid) {
        await updateDoc(doc(db, 'seatAssignments', d.id), { userId: uid });
        claimedNew++;
      }
    }
    if (matched > 0 && licenseId) {
      // Always reconcile the user profile when an active seat exists
      // for this email. Idempotent — overwriting with the same values
      // is a no-op except for the lastUpdated timestamp.
      //
      // setDoc(merge:true) so this works even if the users/{uid} doc
      // hasn't been created yet, and so it never trips the
      // updateDoc-NOT_FOUND error path. The create rule on
      // users/{uid} accepts server-action writes (no auth context).
      await setDoc(
        doc(db, 'users', uid),
        {
          uid,
          email: lower,
          activeLicenseId: licenseId,
          subscriptionStatus: 'active',
          onboardingComplete: true,
          lastUpdated: serverTimestamp(),
        },
        { merge: true },
      );
    }
    return { success: true, data: { claimed: claimedNew } };
  } catch (error) {
    console.error('[licenses] claimPendingSeats error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Revoke a seat assignment.
 */
export async function revokeSeat(
  seatId: string,
  requesterId: string
): Promise<ActionResult> {
  try {
    const seatSnap = await getDoc(doc(db, 'seatAssignments', seatId));
    if (!seatSnap.exists()) return { success: false, error: 'Seat not found.' };

    const seat = seatSnap.data();

    // Verify requester owns the license
    const licenseSnap = await getDoc(doc(db, 'licenses', seat.licenseId));
    if (!licenseSnap.exists() || licenseSnap.data().purchaserId !== requesterId) {
      return { success: false, error: 'Unauthorized.' };
    }

    await updateDoc(doc(db, 'seatAssignments', seatId), { status: 'revoked' });
    await updateDoc(doc(db, 'licenses', seat.licenseId), {
      usedSeats: increment(-1),
      updatedAt: serverTimestamp(),
    });

    // Remove the license from the user profile only when we actually
    // have a uid to target. Seats assigned by email before signup have
    // userId=null; revoking those just clears the reservation, nothing
    // to rewrite on the user doc.
    if (seat.userId) {
      try {
        await updateDoc(doc(db, 'users', seat.userId), {
          activeLicenseId: null,
          subscriptionStatus: 'none',
          lastUpdated: serverTimestamp(),
        });
      } catch (err) {
        // User doc may have been deleted between seat-assign and
        // seat-revoke — not fatal, the seat is still revoked.
        console.warn('[licenses] revokeSeat: user profile update failed:', err);
      }
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[licenses] revokeSeat error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get all seat assignments for a license.
 */
export async function getLicenseSeats(
  licenseId: string
): Promise<ActionResult<SeatAssignment[]>> {
  try {
    const q = query(
      collection(db, 'seatAssignments'),
      where('licenseId', '==', licenseId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    const seats = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      assignedAt: timestampToDate(d.data().assignedAt),
    })) as SeatAssignment[];
    return { success: true, data: seats };
  } catch (error) {
    console.error('[licenses] getLicenseSeats error:', error);
    return { success: false, error: String(error) };
  }
}
