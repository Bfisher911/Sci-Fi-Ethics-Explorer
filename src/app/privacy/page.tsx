import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy · Sci-Fi Ethics Explorer',
  description:
    'How the Sci-Fi Ethics Explorer collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold text-primary font-headline mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: 2026-04-15
        </p>

        <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-primary">Overview</h2>
            <p>
              Sci-Fi Ethics Explorer is an interactive learning platform.
              This page explains what information we collect, how we use it,
              and the choices you have. We keep this short on purpose: we
              only collect what we need to run the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">What we collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Account info: email, display name, and (optionally) a profile bio and avatar.</li>
              <li>Learning activity: stories completed, choices made, quiz results, and dilemmas submitted — used to power your progress dashboard and public leaderboards (anonymizable).</li>
              <li>Payment metadata: subscription status and Stripe customer ID. Card details are handled entirely by Stripe and never touch our servers.</li>
              <li>Diagnostic logs: minimal server logs for reliability and abuse prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">How we use it</h2>
            <p>
              To operate the platform, personalize your learning experience,
              process subscriptions through Stripe, and improve the service.
              We do not sell personal data. We do not run third-party
              advertising trackers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">AI features</h2>
            <p>
              Prompts you submit to AI-powered features (Scenario Analyzer,
              AI Counselor, Perspective Comparison, reflection generation)
              are sent to our AI provider (Google Gemini) to produce a
              response. We do not use your prompts to train third-party
              models.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">Your controls</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>You can make your profile private or appear anonymous on leaderboards from your profile page.</li>
              <li>You can request account deletion by emailing the address below.</li>
              <li>You can cancel subscriptions at any time from the billing page or the Stripe customer portal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">Contact</h2>
            <p>
              Questions or requests:{' '}
              <a
                href="mailto:privacy@scifi-ethics-explorer.app"
                className="text-primary hover:underline"
              >
                privacy@scifi-ethics-explorer.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
