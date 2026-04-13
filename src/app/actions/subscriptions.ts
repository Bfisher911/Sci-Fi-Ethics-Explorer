
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, serverTimestamp,
} from 'firebase/firestore';
import type { Subscription, BillingPeriodId, SubscriptionStatus } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create a new subscription for a user.
 * In production this would be triggered by a payment webhook.
 * For now, it simulates successful payment.
 */
export async function createSubscription(
  userId: string,
  planId: string,
  billingPeriod: BillingPeriodId,
  periodMonths: number
): Promise<ActionResult<string>> {
  try {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + periodMonths);

    const subRef = await addDoc(collection(db, 'subscriptions'), {
      userId,
      planId,
      billingPeriod,
      status: 'active' as SubscriptionStatus,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update user profile with subscription info
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      subscriptionId: subRef.id,
      subscriptionStatus: 'active',
      onboardingComplete: true,
      lastUpdated: serverTimestamp(),
    });

    return { success: true, data: subRef.id };
  } catch (error) {
    console.error('[subscriptions] createSubscription error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get active subscription for a user.
 */
export async function getUserSubscription(
  userId: string
): Promise<ActionResult<Subscription | null>> {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'trial'])
    );
    const snap = await getDocs(q);

    if (snap.empty) return { success: true, data: null };

    const d = snap.docs[0];
    const data = d.data();
    return {
      success: true,
      data: {
        id: d.id,
        userId: data.userId,
        planId: data.planId,
        billingPeriod: data.billingPeriod,
        status: data.status,
        currentPeriodStart: timestampToDate(data.currentPeriodStart),
        currentPeriodEnd: timestampToDate(data.currentPeriodEnd),
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Subscription,
    };
  } catch (error) {
    console.error('[subscriptions] getUserSubscription error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Cancel a subscription at the end of the current period.
 */
export async function cancelSubscription(
  subscriptionId: string,
  userId: string
): Promise<ActionResult> {
  try {
    const subRef = doc(db, 'subscriptions', subscriptionId);
    const snap = await getDoc(subRef);

    if (!snap.exists() || snap.data().userId !== userId) {
      return { success: false, error: 'Subscription not found.' };
    }

    await updateDoc(subRef, {
      cancelAtPeriodEnd: true,
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[subscriptions] cancelSubscription error:', error);
    return { success: false, error: String(error) };
  }
}
