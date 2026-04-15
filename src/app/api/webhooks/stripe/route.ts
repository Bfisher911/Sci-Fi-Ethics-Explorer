import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function subscriptionStatusFromStripe(
  s: Stripe.Subscription['status']
): 'active' | 'trial' | 'past_due' | 'canceled' | 'none' {
  switch (s) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trial';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'none';
  }
}

/**
 * Resolve a Firebase UID from a Stripe object. Checks (in order):
 *  1. client_reference_id on the Checkout Session
 *  2. metadata.firebaseUid on the Subscription or Session
 *  3. Users collection lookup by stripeCustomerId
 */
async function resolveUid(opts: {
  clientReferenceId?: string | null;
  metadataUid?: string | null;
  customerId?: string | null;
}): Promise<string | null> {
  if (opts.clientReferenceId) return opts.clientReferenceId;
  if (opts.metadataUid) return opts.metadataUid;
  if (opts.customerId) {
    const q = query(
      collection(db, 'users'),
      where('stripeCustomerId', '==', opts.customerId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].id;
  }
  return null;
}

async function updateUserSubscription(
  uid: string,
  fields: Record<string, unknown>
): Promise<void> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...fields, lastUpdated: serverTimestamp() });
  } else {
    // Rare but possible: subscription arrives before we see the user doc.
    await setDoc(
      ref,
      { uid, ...fields, createdAt: serverTimestamp(), lastUpdated: serverTimestamp() },
      { merge: true }
    );
  }
}

/**
 * Create a Firestore License document for an org-license payment and link it
 * to the purchaser's user profile. Driven entirely by Stripe metadata that
 * was set on the Checkout Session.
 */
async function provisionLicense(
  uid: string,
  metadata: Stripe.Metadata,
  stripeCustomerId: string | undefined
): Promise<void> {
  try {
    const seats = parseInt(metadata.seats || '0', 10);
    const totalPrice = parseFloat(metadata.totalPrice || '0');
    const term = metadata.term === 'annual' ? 'annual' : 'semester';
    const organizationName = metadata.organizationName || 'Organization';
    const purchaserName = metadata.purchaserName || 'Purchaser';

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + (term === 'semester' ? 4 : 12));

    const licenseRef = await addDoc(collection(db, 'licenses'), {
      organizationName,
      purchaserId: uid,
      purchaserName,
      planId: 'organization-license',
      totalSeats: seats,
      usedSeats: 0,
      term,
      startDate: now,
      endDate,
      status: 'active',
      priceTotal: totalPrice,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateUserSubscription(uid, {
      stripeCustomerId,
      activeLicenseId: licenseRef.id,
      subscriptionStatus: 'active',
      onboardingComplete: true,
    });
  } catch (err) {
    console.error('[stripe webhook] provisionLicense error:', err);
    throw err;
  }
}

async function createNotification(uid: string, title: string, body: string): Promise<void> {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId: uid,
      type: 'generic',
      title,
      body,
      link: '/billing',
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('[stripe webhook] failed to create notification:', err);
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');

  if (!secret) {
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const stripe = getStripe();
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = await resolveUid({
          clientReferenceId: session.client_reference_id,
          metadataUid: (session.metadata?.firebaseUid as string | undefined) ?? null,
          customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
        });
        if (!uid) {
          console.warn('[stripe webhook] checkout.session.completed without resolvable uid.');
          break;
        }
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        // Branch: license (one-time payment) vs individual subscription.
        if (session.metadata?.type === 'license') {
          await provisionLicense(uid, session.metadata, customerId);
        } else {
          await updateUserSubscription(uid, {
            stripeCustomerId: customerId,
            subscriptionId,
            subscriptionStatus: 'active',
            onboardingComplete: true,
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = await resolveUid({
          metadataUid: (sub.metadata?.firebaseUid as string | undefined) ?? null,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
        });
        if (!uid) break;
        await updateUserSubscription(uid, {
          subscriptionId: sub.id,
          subscriptionStatus: subscriptionStatusFromStripe(sub.status),
          stripeCustomerId:
            typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = await resolveUid({
          metadataUid: (sub.metadata?.firebaseUid as string | undefined) ?? null,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
        });
        if (!uid) break;
        await updateUserSubscription(uid, {
          subscriptionStatus: 'canceled',
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        const uid = await resolveUid({ customerId });
        if (!uid) break;
        await updateUserSubscription(uid, { subscriptionStatus: 'past_due' });
        await createNotification(
          uid,
          'Payment failed',
          'We could not process your latest subscription payment. Please update your payment method to keep your access active.'
        );
        break;
      }

      default:
        // Unhandled event type — no-op, acknowledge so Stripe does not retry.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[stripe webhook] handler error for ${event.type}:`, err);
    // Returning 500 signals Stripe to retry. For transient Firestore
    // errors that's the right move.
    return NextResponse.json({ error: 'Handler error.' }, { status: 500 });
  }
}
