import Stripe from 'stripe';

/**
 * Singleton Stripe client for server-side use. Reads STRIPE_SECRET_KEY
 * from the environment. Throws if the key is missing to avoid silent
 * failures on misconfigured deploys.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to .env (local) or Netlify environment variables.'
    );
  }
  // Pin to a known good API version so upgrades don't break silently.
  // The SDK's `apiVersion` type is a hard-coded string union that
  // drifts every release; we cast via `any` to keep this resilient
  // across SDK upgrades. What matters at runtime is the version
  // string itself, which Stripe's API server validates.
  cached = new Stripe(key, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2024-06-20' as any,
    typescript: true,
  });
  return cached;
}

/**
 * Map our internal plan/period to a Stripe Price ID. We keep these as
 * env vars rather than hardcoding so test and live can point at
 * different Stripe products without code changes.
 *
 * Environment variables expected:
 *   STRIPE_PRICE_MONTHLY   — individual monthly
 *   STRIPE_PRICE_SEMESTER  — individual 4-month
 *   STRIPE_PRICE_ANNUAL    — individual annual
 */
export function resolvePriceId(period: 'monthly' | 'semester' | 'annual'): string {
  const key =
    period === 'monthly'
      ? 'STRIPE_PRICE_MONTHLY'
      : period === 'semester'
      ? 'STRIPE_PRICE_SEMESTER'
      : 'STRIPE_PRICE_ANNUAL';
  const id = process.env[key];
  if (!id) {
    throw new Error(
      `Stripe price env var ${key} is not set. Create the Price in the Stripe dashboard and add the ID to your environment.`
    );
  }
  return id;
}
