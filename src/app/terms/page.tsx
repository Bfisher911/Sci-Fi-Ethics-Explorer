import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service · Sci-Fi Ethics Explorer',
  description:
    'The terms governing your use of the Sci-Fi Ethics Explorer platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>

        <h1 className="mb-2 font-headline text-4xl font-bold text-primary">
          Terms of Service
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: 2026-04-29
        </p>

        <div className="prose prose-invert max-w-none space-y-6 leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-2xl font-semibold text-primary">
              1. Agreement
            </h2>
            <p>
              By creating an account or using Sci-Fi Ethics Explorer
              ("the Service"), you agree to these Terms of Service and our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . If you don't agree, don't use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              2. Who can use the Service
            </h2>
            <p>
              You must be 13 years or older to create an account. If you're
              under 18, you confirm a parent or guardian has reviewed these
              terms with you. Educational accounts (instructor-managed
              cohorts) are governed by the agreement your instructor or
              institution has with us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              3. Your account
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Keep your login credentials private; you're responsible for activity under your account.</li>
              <li>Don't impersonate someone else or pretend to be staff.</li>
              <li>One account per person, unless we've explicitly authorized multiple (e.g. teacher + student accounts).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              4. Acceptable use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Post content that's harassing, hateful, infringing, illegal, or sexually explicit.</li>
              <li>Use the Service to spam, scrape at scale, or abuse other users.</li>
              <li>Attempt to break, exploit, reverse-engineer, or interfere with the Service.</li>
              <li>Use automated tools to bypass rate limits or auth.</li>
              <li>Use the AI tools to generate content that violates the policies of the underlying model providers (e.g. Google Gemini).</li>
            </ul>
            <p>
              We may remove content, suspend accounts, or revoke access for
              violations, with or without notice depending on severity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              5. Your content
            </h2>
            <p>
              You retain ownership of dilemmas, debates, reflections, and
              other content you submit. By posting, you grant us a
              worldwide, non-exclusive, royalty-free license to host,
              display, and (where you've made content public) feature it
              within the Service. You can delete content at any time.
            </p>
            <p>
              Reflections, highlights, and quiz responses are private to
              your account by default and are not shared without your
              explicit action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              6. Subscriptions and payments
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Paid plans are billed through Stripe. Card details are handled by Stripe and never stored on our servers.</li>
              <li>Subscriptions auto-renew at the end of each billing period unless cancelled. Cancel anytime from your billing settings.</li>
              <li>Refunds for unused time are at our discretion; reach out if you have a reasonable case.</li>
              <li>License/seat-based access for educational cohorts follows the agreement with the purchasing institution.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              7. AI-generated content
            </h2>
            <p>
              The Service uses large language models (Google Gemini) to
              generate analyses, perspectives, and counselor responses. AI
              output can be wrong, biased, or surprising. Don't rely on it
              for legal, medical, financial, or safety decisions. Treat AI
              responses as a thinking partner, not an authority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              8. Intellectual property
            </h2>
            <p>
              The textbook, philosopher / theory / author / media reference
              entries, original site stories, and the platform's design are
              owned by us or our licensors. You can read, study, and
              reference them within the Service. You can't redistribute,
              republish, or use them to train AI models without written
              permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              9. Termination
            </h2>
            <p>
              You can delete your account at any time from your profile
              settings. We can suspend or terminate accounts that violate
              these terms, harm other users, or fail to pay. On termination,
              your private data is deleted within 30 days; public
              contributions you've made may remain attributed to a generic
              "former member" identifier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              10. Disclaimers
            </h2>
            <p>
              The Service is provided "as is" without warranty of any kind.
              We don't guarantee uptime, accuracy of AI output, or that the
              Service will meet your specific educational needs. To the
              maximum extent allowed by law, our liability is limited to
              the amount you paid us in the prior 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              11. Changes to these terms
            </h2>
            <p>
              We may update these terms occasionally. Material changes will
              be announced via the in-app{' '}
              <Link
                href="/whats-new"
                className="text-primary hover:underline"
              >
                What's new
              </Link>{' '}
              feed and (for paying users) by email. Continued use of the
              Service after changes means you accept the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary">
              12. Contact
            </h2>
            <p>
              Questions about these terms? Reach out via the{' '}
              <Link href="/help" className="text-primary hover:underline">
                Help page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
