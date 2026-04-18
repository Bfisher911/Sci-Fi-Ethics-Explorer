
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, limit as fsLimit, increment, serverTimestamp,
} from 'firebase/firestore';
import type { License, SeatAssignment, LicenseTerm, LicenseStatus } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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
      return { success: false, error: 'Email is required.' };
    }
    const email = data.userEmail.trim().toLowerCase();

    // Check license has available seats
    const licenseSnap = await getDoc(doc(db, 'licenses', data.licenseId));
    if (!licenseSnap.exists()) return { success: false, error: 'License not found.' };

    const license = licenseSnap.data();
    if (license.usedSeats >= license.totalSeats) {
      return { success: false, error: 'No seats available. All seats are in use.' };
    }
    if (license.status !== 'active') {
      return { success: false, error: 'License is not active.' };
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
    // recipient (uid OR email) — keeps usedSeats honest.
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
        error: `That email is already assigned a seat on this license.`,
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

    // Only update the recipient's profile if we resolved a real uid.
    // Otherwise leave a clean trail for the recipient to pick up at
    // sign-in (see claimPendingSeats).
    if (resolvedUid) {
      await updateDoc(doc(db, 'users', resolvedUid), {
        activeLicenseId: data.licenseId,
        subscriptionStatus: 'active',
        onboardingComplete: true,
        lastUpdated: serverTimestamp(),
      });
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
    let claimed = 0;
    let licenseId: string | null = null;
    for (const d of snap.docs) {
      const data = d.data();
      if (data.userId === uid) continue; // already linked
      await updateDoc(doc(db, 'seatAssignments', d.id), { userId: uid });
      claimed++;
      licenseId = licenseId || data.licenseId;
    }
    if (claimed > 0 && licenseId) {
      await updateDoc(doc(db, 'users', uid), {
        activeLicenseId: licenseId,
        subscriptionStatus: 'active',
        onboardingComplete: true,
        lastUpdated: serverTimestamp(),
      });
    }
    return { success: true, data: { claimed } };
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

    // Remove license from user profile
    await updateDoc(doc(db, 'users', seat.userId), {
      activeLicenseId: null,
      subscriptionStatus: 'none',
      lastUpdated: serverTimestamp(),
    });

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
