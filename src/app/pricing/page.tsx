/**
 * Public pricing page. Lives at the ROOT (outside the `(app)` shell) so
 * prospects can see plans before signing up — the marketing header +
 * cosmic backdrop wrap it for visual continuity with `/` and `/about`.
 *
 * Checkout itself still requires auth: picking a plan sends signed-out
 * visitors to `/login?next=/pricing` first (handled in <PricingPlans/>).
 */

import type { Metadata } from 'next';
import { MarketingHeader } from '@/components/home/marketing-header';
import { CosmicBackdrop } from '@/components/home/cosmic-backdrop';
import { PricingPlans } from '@/components/billing/pricing-plans';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Full access to the Sci-Fi Ethics Explorer for individuals and organizations. Simple member pricing and seat-based institution licenses.',
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <MarketingHeader />

      <main className="flex-1">
        <section className="relative isolate -mt-16 overflow-hidden">
          <CosmicBackdrop />

          <div className="container relative z-10 mx-auto px-4 pb-20 pt-36 md:px-6 md:pt-40">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Choose your path
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Full access to the Sci-Fi Ethics Explorer for individuals and
                organizations. No tiers, no gotchas — every paid member gets
                every tool.
              </p>
            </div>

            <PricingPlans />
          </div>
        </section>
      </main>
    </div>
  );
}
