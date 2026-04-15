/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the authenticated user and returns
 * the redirect URL. The client should post its Firebase ID token in the
 * Authorization header and the desired plan in the body:
 *
 *   POST /api/checkout
 *   Authorization: Bearer <firebase-id-token>
 *   Content-Type: application/json
 *   { "plan": "monthly" | "semester" | "annual" }
 *
 * Response: { url: "https://checkout.stripe.com/..." }  (302-redirect target)
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminApp, getAdminDb } from '@/lib/firebase/admin';
import { priceIdForPlan, stripe } from '@/lib/stripe/config';
import type { SubscriptionPlan } from '@/types';

export const runtime = 'nodejs'; // firebase-admin + stripe need the Node runtime

export async function POST(request: NextRequest) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SITE_URL is not configured on the server.' },
        { status: 500 },
      );
    }

    // --- Verify Firebase ID token ---
    const authHeader = request.headers.get('authorization') ?? '';
    const match = /^Bearer\s+(.+)$/i.exec(authHeader);
    if (!match) {
      return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 });
    }
    let decoded;
    try {
      decoded = await getAuth(getAdminApp()).verifyIdToken(match[1]);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }
    const uid = decoded.uid;
    const email = decoded.email;

    // --- Parse plan from body ---
    const body = (await request.json().catch(() => ({}))) as { plan?: SubscriptionPlan };
    const plan = body.plan;
    if (!plan || !['monthly', 'semester', 'annual'].includes(plan)) {
      return NextResponse.json(
        { error: 'Body must include plan: "monthly" | "semester" | "annual".' },
        { status: 400 },
      );
    }
    const priceId = priceIdForPlan(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price configured for plan "${plan}".` },
        { status: 500 },
      );
    }

    // --- Find-or-create Stripe customer linked to this user ---
    const db = getAdminDb();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    let stripeCustomerId = userSnap.get('stripeCustomerId') as string | undefined;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email ?? undefined,
        metadata: { firebaseUid: uid },
      });
      stripeCustomerId = customer.id;
      await userRef.set(
        { stripeCustomerId, lastUpdated: FieldValue.serverTimestamp() },
        { merge: true },
      );
    }

    // --- Create the Checkout Session ---
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      client_reference_id: uid,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing?checkout=cancel`,
      allow_promotion_codes: true,
      subscription_data: { metadata: { firebaseUid: uid, plan } },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/checkout] error:', err);
    const message = err instanceof Error ? err.message : 'Unknown checkout error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
