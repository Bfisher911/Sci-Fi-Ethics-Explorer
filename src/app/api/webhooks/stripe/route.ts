/**
 * POST /api/webhooks/stripe
 *
 * Receives webhook events from Stripe. Verifies the signature, then mirrors
 * subscription state into Firestore at subscriptions/{uid}. Subscribed to:
 *
 *   - checkout.session.completed       first purchase → link customer→uid, snapshot sub
 *   - customer.subscription.updated    plan change, renewal, cancel scheduled
 *   - customer.subscription.deleted    subscription ended → mark user as free
 *   - invoice.paid                     successful renewal → log + refresh period end
 *
 * Stripe requires the raw request body to verify the signature, so we read
 * request.text() and pass that to constructEvent (not request.json()).
 */
import type Stripe from 'stripe';
import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import { planForPriceId, stripe } from '@/lib/stripe/config';
import type { SubscriptionStatus } from '@/types';

export const runtime = 'nodejs';
// Tell Next.js not to parse the body — we need the raw text for sig verification.
export const dynamic = 'force-dynamic';

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
]);

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not configured on the server.' },
      { status: 500 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown verification error';
    // eslint-disable-next-line no-console
    console.error('[stripe-webhook] signature verification failed:', message);
    return NextResponse.json({ error: `Signature verification failed: ${message}` }, { status: 400 });
  }

  // Ignore events outside our subscribed set (defensive).
  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
    }
    return NextResponse.json({ received: true, type: event.type });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[stripe-webhook] handler for ${event.type} failed:`, err);
    const message = err instanceof Error ? err.message : 'Unknown handler error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const uid = session.client_reference_id ?? session.metadata?.firebaseUid;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

  if (!uid || !customerId) {
    // eslint-disable-next-line no-console
    console.warn('[stripe-webhook] checkout.session.completed missing uid or customerId', {
      id: session.id,
    });
    return;
  }

  // Ensure the user doc has the stripeCustomerId (the checkout route sets it
  // too, but webhooks can fire even when checkout was created outside our app).
  const db = getAdminDb();
  await db
    .collection('users')
    .doc(uid)
    .set(
      { stripeCustomerId: customerId, lastUpdated: FieldValue.serverTimestamp() },
      { merge: true },
    );

  if (subscriptionId) {
    // Expand so we have price + period info in one call.
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    await writeSubscription(uid, sub);
  }
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const uid = await resolveUidFromSubscription(sub);
  if (!uid) {
    // eslint-disable-next-line no-console
    console.warn('[stripe-webhook] could not resolve uid for subscription', { id: sub.id });
    return;
  }
  await writeSubscription(uid, sub);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subId) return; // Non-subscription invoice — ignore.
  const sub = await stripe.subscriptions.retrieve(subId);
  const uid = await resolveUidFromSubscription(sub);
  if (!uid) return;
  await writeSubscription(uid, sub);
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Find the uid linked to a Stripe subscription. Tries (in order):
 *   1. subscription.metadata.firebaseUid (set by /api/checkout)
 *   2. customer.metadata.firebaseUid      (set when customer was created)
 *   3. Firestore lookup by stripeCustomerId
 */
async function resolveUidFromSubscription(sub: Stripe.Subscription): Promise<string | null> {
  if (sub.metadata?.firebaseUid) return sub.metadata.firebaseUid;

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const customer = await stripe.customers.retrieve(customerId);
  if (!('deleted' in customer) || !customer.deleted) {
    const uidFromCustomer = (customer as Stripe.Customer).metadata?.firebaseUid;
    if (uidFromCustomer) return uidFromCustomer;
  }

  // Fallback: look up by stripeCustomerId on user docs.
  const db = getAdminDb();
  const snap = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  if (!snap.empty) return snap.docs[0].id;
  return null;
}

/**
 * Mirror the subscription into subscriptions/{uid}. This doc is the source of
 * truth for the client — read it via use-subscription.
 */
async function writeSubscription(uid: string, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price?.id;
  const plan = planForPriceId(priceId);
  const status = sub.status as SubscriptionStatus;
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const db = getAdminDb();
  await db
    .collection('subscriptions')
    .doc(uid)
    .set(
      {
        uid,
        plan: status === 'canceled' || status === 'incomplete_expired' ? 'free' : plan,
        status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId ?? null,
        currentPeriodEnd: sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
