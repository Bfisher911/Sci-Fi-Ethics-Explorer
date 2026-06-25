import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DilemmaOfTheDay } from '@/components/home/dilemma-of-the-day';
import { SignedInRedirect } from '@/components/home/signed-in-redirect';
import { CosmicBackdrop } from '@/components/home/cosmic-backdrop';
import { MarketingHeader } from '@/components/home/marketing-header';
import { JourneySection } from '@/components/home/journey-section';
import { Reveal } from '@/components/home/reveal';

// A representative slice of the 22 frameworks the assessment maps onto.
const FRAMEWORKS = [
  'Utilitarianism',
  'Deontology',
  'Virtue Ethics',
  'Ethics of Care',
  'Social Contract',
  'Capabilities Approach',
  'Ubuntu Ethics',
  'Existentialist Ethics',
  'Rights-Based Ethics',
  'Natural Law',
  'Contractualism',
  'Justice Ethics',
];

// The writers the textbook reads technology through.
const CANON = [
  'Mary Shelley',
  'Ursula K. Le Guin',
  'William Gibson',
  'Philip K. Dick',
  'Octavia E. Butler',
  'Isaac Asimov',
  'Ted Chiang',
];

const SCOPE = ['12 modules', '22 frameworks', '12 chapters'];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      {/* Auth-aware bounce: signed-in visitors land on /dashboard
          instead of the marketing splash. Renders nothing visually. */}
      <SignedInRedirect to="/dashboard" />

      <MarketingHeader />

      <main className="flex-1">
        {/* ── Hero atmosphere region ───────────────────────────────
            Pulled up under the transparent sticky header (-mt-16) so
            the cosmic backdrop reads as full-bleed. */}
        <section className="relative isolate -mt-16 overflow-hidden">
          <CosmicBackdrop />

          <div className="container relative z-10 mx-auto px-4 pb-16 pt-36 md:px-6 md:pt-44">
            <div className="mx-auto max-w-4xl text-center">
              <Reveal>
                <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                  The future is{' '}
                  <span className="italic text-primary">questionable.</span>
                </h1>
              </Reveal>

              <Reveal>
                <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  A serious look at the moral problems of technology — read
                  through the science fiction that has been rehearsing them since{' '}
                  <em className="font-display not-italic text-foreground/90">
                    Frankenstein
                  </em>
                  . Read, decide, argue, and watch your own ethics take shape.
                </p>
              </Reveal>

              <Reveal>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 rounded-xl px-8 text-base shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_0_28px_-4px_hsl(var(--primary)/0.6)] transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.75),0_0_38px_-2px_hsl(var(--primary)/0.75)]"
                  >
                    <Link href="/stories" className="flex items-center gap-2.5">
                      Start exploring
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 rounded-xl border-border/70 bg-background/30 px-8 text-base backdrop-blur-sm transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:bg-background/50"
                  >
                    <Link href="#how">See how it works</Link>
                  </Button>
                </div>
              </Reveal>

              {/* Quiet scope line — informative, not a metric showcase. */}
              <Reveal>
                <p className="mt-8 text-sm text-muted-foreground">
                  {SCOPE.join(' · ')} · free to begin
                </p>
              </Reveal>
            </div>

            {/* Featured dilemma — the lowest-friction first taste. It sits
                over the backdrop, so its glass treatment is purposeful. */}
            <Reveal className="mt-24 flex w-full justify-center">
              <DilemmaOfTheDay />
            </Reveal>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <div id="how" className="scroll-mt-20">
          <JourneySection />
        </div>

        {/* ── The instrument: frameworks ───────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-24 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <Reveal>
              <h2 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
                Every choice is a data point
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                There are no right answers here — only a clearer picture of the
                ethics you already practice. Each decision is read against
                twenty-two philosophical traditions, then resolved into a
                profile that&apos;s unmistakably yours.
              </p>
              <Button
                asChild
                variant="link"
                className="mt-4 h-auto p-0 text-base text-primary"
              >
                <Link
                  href="/framework-explorer"
                  className="flex items-center gap-1.5"
                >
                  Build your ethics profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Reveal>

            <Reveal>
              <ul className="flex flex-wrap gap-2.5">
                {FRAMEWORKS.map((name) => (
                  <li
                    key={name}
                    className="surface-card rounded-full px-4 py-2 text-sm font-medium text-foreground/85 transition-colors duration-300 ease-expo hover:border-primary/50 hover:text-foreground"
                  >
                    {name}
                  </li>
                ))}
                <li className="rounded-full border border-dashed border-border/60 px-4 py-2 text-sm text-muted-foreground">
                  + 10 more
                </li>
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ── The canon ────────────────────────────────────────────── */}
        <section className="relative mx-auto w-full max-w-5xl px-4 py-16">
          <div className="hairline-gradient mb-12 h-px w-full" aria-hidden="true" />
          <Reveal className="text-center">
            <p className="mx-auto max-w-2xl text-balance font-display text-2xl font-medium leading-snug text-foreground/90 md:text-3xl">
              Standing on the shoulders of the writers who saw it coming
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-display text-lg italic text-muted-foreground">
              {CANON.map((name, i) => (
                <span key={name} className="flex items-center gap-x-3">
                  {i > 0 && (
                    <span className="not-italic text-primary/50" aria-hidden="true">
                      ·
                    </span>
                  )}
                  <span className="transition-colors duration-300 hover:text-foreground">
                    {name}
                  </span>
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-4 py-24 md:py-32">
          <Reveal>
            <div className="surface-card relative overflow-hidden rounded-3xl px-6 py-16 text-center md:px-16 md:py-20">
              {/* Localized glow inside the panel. */}
              <div
                className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]"
                aria-hidden="true"
              />
              <div className="relative z-10">
                <h2 className="mx-auto max-w-2xl text-balance font-display text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl">
                  The future is already here. Decide what you&apos;ll do about
                  it.
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Start with a single dilemma, or take the full assessment and
                  build your ethics profile. Free to begin — no account needed
                  to read.
                </p>
                <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 rounded-xl px-8 text-base shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_0_28px_-4px_hsl(var(--primary)/0.6)] transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.75),0_0_38px_-2px_hsl(var(--primary)/0.75)]"
                  >
                    <Link
                      href="/framework-explorer"
                      className="flex items-center gap-2.5"
                    >
                      Build your ethics profile
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 rounded-xl border-border/70 bg-background/30 px-8 text-base backdrop-blur-sm transition-colors hover:bg-background/50"
                  >
                    <Link href="/stories">Browse the dilemmas</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      {/* Footer is rendered globally by the root layout (SiteFooter) —
          no page-level footer here (it would double up). */}
    </div>
  );
}
