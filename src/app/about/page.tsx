import { BookOpen, Cpu, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CosmicBackdrop } from '@/components/home/cosmic-backdrop';
import { MarketingHeader } from '@/components/home/marketing-header';
import { Reveal } from '@/components/home/reveal';

export const metadata = {
  title: 'About',
  description:
    'A teaching site for the ethics of technology, read through the science fiction that has been rehearsing these problems since Frankenstein.',
};

const PARTS = [
  {
    icon: BookOpen,
    title: 'Stories',
    body: 'Branching dilemmas where the choices are yours and the consequences play out. Short fiction companions to every textbook chapter.',
  },
  {
    icon: Cpu,
    title: 'Analysis tools',
    body: 'An AI counselor for talking through an argument, a framework explorer that maps your answers onto ethical traditions, and perspective comparisons that surface the ones you missed.',
  },
  {
    icon: Users,
    title: 'Community',
    body: 'Submit your own dilemmas. Argue open positions in the debate arena. Other readers are working through the same questions, and their answers are part of the material.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <MarketingHeader />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative isolate -mt-16 overflow-hidden">
          <CosmicBackdrop />
          <div className="container relative z-10 mx-auto px-4 pb-12 pt-36 text-center md:px-6 md:pt-44">
            <Reveal>
              <h1 className="mx-auto max-w-4xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight md:text-6xl">
                A teaching site for the ethics of technology
              </h1>
            </Reveal>
            <Reveal>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Read through the science fiction that has been rehearsing these
                problems since{' '}
                <em className="font-display not-italic text-foreground/90">
                  Frankenstein
                </em>
                .
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── What it is ───────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 md:py-24">
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <Reveal>
              <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                Fiction has been stress-testing technology for two centuries
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-foreground/90">
                The premise is simple: science fiction has been stress-testing
                the ethics of technology for two centuries. Reading it carefully
                is one of the better ways to learn how to think about the
                technology you actually use.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-foreground/90">
                The point is not to tell you what to think. It is to give you
                enough practice with the arguments that you know what you think,
                and why.
              </p>
            </Reveal>

            <Reveal>
              <ul className="flex flex-col gap-4">
                {PARTS.map((part) => {
                  const Icon = part.icon;
                  return (
                    <li
                      key={part.title}
                      className="surface-card rounded-2xl p-6 transition-colors duration-300 ease-expo hover:border-primary/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-background text-primary">
                          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                        </span>
                        <h3 className="font-display text-xl font-medium">
                          {part.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {part.body}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ── Who it's for + CTA ───────────────────────────────────── */}
        <section className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-medium tracking-tight md:text-4xl">
              Built for classrooms, but not limited to them
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Undergrads, curious readers, anyone trying to think more clearly
              about the technology they use every day.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-14 rounded-xl px-8 text-base">
                <Link href="/stories" className="flex items-center gap-2.5">
                  Read a dilemma
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-xl border-border/70 bg-background/30 px-8 text-base backdrop-blur-sm transition-colors hover:bg-background/50"
              >
                <Link href="/framework-explorer">Build your ethics profile</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>
      {/* Footer is rendered globally by the root layout (SiteFooter). */}
    </div>
  );
}
