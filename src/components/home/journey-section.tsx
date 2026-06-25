/**
 * JourneySection — the product narrative, end to end.
 *
 * Read → Decide → Argue → Profile. Each step maps to a real surface of
 * the app (textbook, dilemmas, dialogues, framework explorer) so the
 * marketing page doubles as a map of the actual workflow. The fourth
 * step is the climax: the per-user ethics profile built from the
 * 12-module assessment.
 */

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Fingerprint,
  MessagesSquare,
  Split,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface Step {
  num: string;
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  cta: string;
  climax?: boolean;
}

const STEPS: Step[] = [
  {
    num: '1',
    icon: BookOpen,
    title: 'Read',
    body: 'Twelve chapters on the ethics of technology — grounded in the fiction that has rehearsed these problems since Frankenstein.',
    href: '/textbook',
    cta: 'Open the textbook',
  },
  {
    num: '2',
    icon: Split,
    title: 'Decide',
    body: "Branching dilemmas where you can't dodge the choice. Every path carries consequences the story holds you to.",
    href: '/stories',
    cta: 'Face a dilemma',
  },
  {
    num: '3',
    icon: MessagesSquare,
    title: 'Argue',
    body: 'Take a position and defend it against other readers. Watch your instincts collide with the genuinely hard cases.',
    href: '/dialogues',
    cta: 'Enter the dialogues',
  },
  {
    num: '4',
    icon: Fingerprint,
    title: 'Profile',
    body: 'Your choices across 12 modules resolve into one ethics profile — mapped onto 22 philosophical frameworks.',
    href: '/framework-explorer',
    cta: 'Build your profile',
    climax: true,
  },
];

export function JourneySection(): JSX.Element {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-24 md:py-32">
      <Reveal className="mb-14 max-w-2xl">
        <h2 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          Four moves, one habit of mind
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          You read a problem, you make a call you can&apos;t take back, you
          argue it with people who disagree — and the system quietly learns how
          you think.
        </p>
      </Reveal>

      <div className="relative">
        {/* Connector thread behind the step nodes (desktop only) — the
            page's one genuine sequence, so the numbered thread earns it. */}
        <div
          className="hairline-gradient absolute left-0 right-0 top-12 hidden h-px md:block"
          aria-hidden="true"
        />

        <ol className="grid gap-5 md:grid-cols-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.num} as="li" className="h-full">
                <article
                  className={cn(
                    'group relative flex h-full flex-col rounded-2xl p-6 transition-all duration-500 ease-expo',
                    'surface-card hover:-translate-y-1',
                    step.climax
                      ? 'border-accent/40 hover:border-accent/70'
                      : 'hover:border-primary/50',
                  )}
                >
                  {/* Node: icon tile sits on the connector thread. */}
                  <div
                    className={cn(
                      'relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border bg-background',
                      step.climax
                        ? 'border-accent/40 text-accent'
                        : 'border-primary/30 text-primary',
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </div>

                  <div className="mt-5 flex items-baseline gap-2.5">
                    <span className="text-sm font-semibold tabular-nums text-muted-foreground/60">
                      {step.num}
                    </span>
                    <h3 className="font-display text-2xl font-medium text-foreground">
                      {step.title}
                    </h3>
                  </div>

                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>

                  <Link
                    href={step.href}
                    className={cn(
                      'mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
                      step.climax
                        ? 'text-accent hover:text-accent/80'
                        : 'text-primary hover:text-primary/80',
                    )}
                  >
                    {step.cta}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 ease-expo group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
