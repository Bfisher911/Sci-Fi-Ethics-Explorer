
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, increment, serverTimestamp,
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
 */
export async function assignSeat(data: {
  licenseId: string;
  userId: string;
  userEmail: string;
  communityId?: string;
}): Promise<ActionResult<string>> {
  try {
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

    // Create seat assignment
    const seatRef = await addDoc(collection(db, 'seatAssignments'), {
      licenseId: data.licenseId,
      userId: data.userId,
      userEmail: data.userEmail,
      communityId: data.communityId || null,
      assignedAt: serverTimestamp(),
      status: 'active',
    });

    // Increment used seats
    await updateDoc(doc(db, 'licenses', data.licenseId), {
      usedSeats: increment(1),
      updatedAt: serverTimestamp(),
    });

    // Update user's profile to reflect license coverage
    await updateDoc(doc(db, 'users', data.userId), {
      activeLicenseId: data.licenseId,
      subscriptionStatus: 'active',
      onboardingComplete: true,
      lastUpdated: serverTimestamp(),
    });

    return { success: true, data: seatRef.id };
  } catch (error) {
    console.error('[licenses] assignSeat error:', error);
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
