
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
 * @deprecated DO NOT call from production UI — this bypasses payment.
 *
 * Originally a stub that simulated a successful subscription so the
 * onboarding flow could be built before Stripe was wired up. The real
 * production path is now `createCheckoutSession` in
 * `src/app/actions/stripe.ts`, which redirects to Stripe-hosted
 * checkout and lets the webhook (`/api/webhooks/stripe`) write the
 * subscription doc on `checkout.session.completed`.
 *
 * Kept here only for tests, manual seeding, and local dev where Stripe
 * keys aren't configured. Production code paths must NOT call this.
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

    if (snap.empty) {
      // No doc in the `subscriptions` collection. The PRODUCTION Stripe
      // path doesn't write here — the webhook writes subscription state
      // onto the user's `users` doc (subscriptionStatus, stripeCustomerId,
      // subscriptionId). Synthesize a Subscription from that so real
      // paying subscribers don't see "No Active Plan" and can open the
      // billing portal.
      return await subscriptionFromUserDoc(userId);
    }

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
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
      } as Subscription,
    };
  } catch (error) {
    console.error('[subscriptions] getUserSubscription error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Build a Subscription view from the user's `users` doc, where the Stripe
 * webhook records live subscription state. Returns null when the user has
 * no active/trialing Stripe subscription.
 */
async function subscriptionFromUserDoc(
  userId: string
): Promise<ActionResult<Subscription | null>> {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (!userSnap.exists()) return { success: true, data: null };
    const u = userSnap.data();
    const status = u.subscriptionStatus as SubscriptionStatus | undefined;
    if (status !== 'active' && status !== 'trial') {
      return { success: true, data: null };
    }
    return {
      success: true,
      data: {
        // Use the Stripe subscription id as the stable id when present.
        id: (u.subscriptionId as string) || `user-${userId}`,
        userId,
        planId: (u.planId as string) || 'member',
        billingPeriod: (u.billingPeriod as BillingPeriodId) || 'monthly',
        status,
        currentPeriodStart: timestampToDate(u.currentPeriodStart),
        currentPeriodEnd: timestampToDate(u.currentPeriodEnd),
        cancelAtPeriodEnd: Boolean(u.cancelAtPeriodEnd),
        createdAt: timestampToDate(u.createdAt),
        updatedAt: timestampToDate(u.lastUpdated),
        stripeCustomerId: u.stripeCustomerId as string | undefined,
        stripeSubscriptionId: u.subscriptionId as string | undefined,
      } as Subscription,
    };
  } catch (error) {
    console.error('[subscriptions] subscriptionFromUserDoc error:', error);
    return { success: true, data: null };
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
