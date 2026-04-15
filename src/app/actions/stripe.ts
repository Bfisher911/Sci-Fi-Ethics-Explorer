'use server';

import { headers } from 'next/headers';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getStripe, resolvePriceId } from '@/lib/stripe';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function getOrigin(): string {
  const hdrs = headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host');
  const proto = hdrs.get('x-forwarded-proto') ?? 'https';
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

/**
 * Create a Stripe Checkout Session for an individual subscription.
 * The caller receives a hosted-checkout URL; the client redirects there.
 * Discount codes are supported via `allow_promotion_codes: true`.
 */
export async function createCheckoutSession(input: {
  uid: string;
  email?: string | null;
  period: 'monthly' | 'semester' | 'annual';
}): Promise<ActionResult<{ url: string; sessionId: string }>> {
  try {
    const stripe = getStripe();
    const priceId = resolvePriceId(input.period);
    const origin = getOrigin();

    // Re-use an existing Stripe customer if we've stored one on the user doc.
    const userRef = doc(db, 'users', input.uid);
    const userSnap = await getDoc(userRef);
    const existingCustomerId = userSnap.exists()
      ? (userSnap.data().stripeCustomerId as string | undefined)
      : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      client_reference_id: input.uid,
      customer: existingCustomerId,
      customer_email: existingCustomerId ? undefined : input.email ?? undefined,
      subscription_data: {
        metadata: { firebaseUid: input.uid },
      },
      metadata: { firebaseUid: input.uid, period: input.period },
    });

    if (!session.url) {
      return { success: false, error: 'Stripe did not return a checkout URL.' };
    }

    return { success: true, data: { url: session.url, sessionId: session.id } };
  } catch (err) {
    console.error('[stripe] createCheckoutSession error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Best-effort reconciliation when the user lands on /success before the
 * webhook has fired. Looks up the Checkout Session, and if paid, flips
 * the user's profile to subscriptionStatus='active'.
 */
export async function reconcileCheckoutSession(
  sessionId: string,
  uid: string
): Promise<ActionResult> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return { success: false, error: `Payment status is ${session.payment_status}.` };
    }
    if (session.client_reference_id && session.client_reference_id !== uid) {
      return { success: false, error: 'Session does not belong to this user.' };
    }

    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      stripeCustomerId: customerId,
      subscriptionId: subscriptionId,
      subscriptionStatus: 'active',
      onboardingComplete: true,
      lastUpdated: serverTimestamp(),
    });

    return { success: true, data: undefined };
  } catch (err) {
    console.error('[stripe] reconcileCheckoutSession error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Create a Stripe Customer Portal session so users can manage their
 * subscription (update card, cancel, view invoices) on Stripe's hosted UI.
 */
export async function createPortalSession(
  uid: string
): Promise<ActionResult<{ url: string }>> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    const customerId = userSnap.exists()
      ? (userSnap.data().stripeCustomerId as string | undefined)
      : undefined;
    if (!customerId) {
      return { success: false, error: 'No Stripe customer on file for this user.' };
    }
    const stripe = getStripe();
    const origin = getOrigin();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });
    return { success: true, data: { url: portal.url } };
  } catch (err) {
    console.error('[stripe] createPortalSession error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
