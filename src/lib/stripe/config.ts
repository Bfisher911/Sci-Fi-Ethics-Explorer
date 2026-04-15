/**
 * Server-side Stripe SDK initialization.
 *
 * Only imported by server code (API routes, server actions). Never import this
 * from a client component — it would leak STRIPE_SECRET_KEY into the bundle.
 */
import Stripe from 'stripe';
import type { SubscriptionPlan } from '@/types';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  // Don't throw at import time — let the route throw a clear error when hit.
  // This keeps the build working in environments where the key isn't present.
  // eslint-disable-next-line no-console
  console.warn('[stripe] STRIPE_SECRET_KEY is not set — Stripe API calls will fail.');
}

export const stripe = new Stripe(secretKey ?? 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
  appInfo: {
    name: 'Sci-Fi Ethics Explorer',
    url: process.env.NEXT_PUBLIC_SITE_URL,
  },
});

/**
 * Mapping from Stripe Price ID → internal plan name.
 * Populated from env vars so the same code works across environments.
 */
export function planForPriceId(priceId: string | null | undefined): SubscriptionPlan {
  if (!priceId) return 'free';
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'monthly';
  if (priceId === process.env.STRIPE_PRICE_SEMESTER) return 'semester';
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'annual';
  return 'free';
}

/**
 * Reverse lookup: plan name → Stripe Price ID (for creating checkout sessions).
 * Returns null if the env var for the requested plan isn't configured.
 */
export function priceIdForPlan(plan: SubscriptionPlan): string | null {
  switch (plan) {
    case 'monthly':
      return process.env.STRIPE_PRICE_MONTHLY ?? null;
    case 'semester':
      return process.env.STRIPE_PRICE_SEMESTER ?? null;
    case 'annual':
      return process.env.STRIPE_PRICE_ANNUAL ?? null;
    default:
      return null;
  }
}
