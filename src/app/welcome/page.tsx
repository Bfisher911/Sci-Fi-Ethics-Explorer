/**
 * /welcome — standalone campaign landing page (sales funnel).
 *
 * Deliberately chrome-free: no app sidebar, no marketing nav, no global
 * footer (opted out in <SiteFooterGate/>). One job — convert a cold
 * visitor from an ad/email into a signup. Every primary CTA points at
 * `/signup`; the only secondary links are a quiet "Log in" for returning
 * users and a pricing teaser.
 *
 * Built entirely from the existing design system (CosmicBackdrop,
 * surface-card, Literata display type, glow CTA) so it feels native to
 * the product. Pure server component.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  BookOpen,
  Scale,
  Sparkles,
  Brain,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CosmicBackdrop } from '@/components/home/cosmic-backdrop';
import { BrandMark } from '@/components/home/brand-mark';
import { Reveal } from '@/components/home/reveal';

export const metadata: Metadata = {
  title: 'Start exploring the ethics of the future',
  description:
    'Read science fiction, decide real dilemmas, defend your reasoning, and build a personal ethics profile. Free to begin — no credit card required.',
};

const VALUE_PROPS = [
  {
    icon: BookOpen,
    title: 'Read the future, closely',
    body: 'A 12-chapter textbook reads technology through the writers who saw it coming — from Frankenstein to Ted Chiang.',
  },
  {
    icon: Scale,
    title: 'Decide real dilemmas',
    body: 'Work branching scenarios with genuine stakes. No right answer handed to you — just consequences to reason through.',
  },
  {
    icon: Brain,
    title: 'Build your ethics profile',
    body: 'Every choice maps onto 22 moral frameworks. Watch a portrait of how you actually reason take shape.',
  },
];

const STEPS = [
  { n: '01', label: 'Read', body: 'A chapter, a story, a dilemma worth arguing about.' },
  { n: '02', label: 'Decide', body: 'Make the call. See where each path leads.' },
  { n: '03', label: 'Reflect', body: 'Your reasoning becomes a living ethics profile.' },
];

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      {/* Minimal top bar — logo + a quiet account link only. No nav. */}
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <BrandMark className="h-7 w-7" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Sci-Fi Ethics Explorer
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden">
          <CosmicBackdrop />

          <div className="container relative z-10 mx-auto px-4 pb-20 pt-36 text-center md:px-6 md:pt-48">
            <Reveal>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/80 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                The ethics of technology, through science fiction
              </p>
              <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                The future is{' '}
                <em className="not-italic text-primary">questionable.</em>
                <br className="hidden sm:block" /> Learn to question it well.
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Read the stories that stress-tested every technology before it
                arrived. Decide the dilemmas they raise. Build a profile of how
                you actually reason about right and wrong.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="cta-glow h-12 px-8 text-base"
                >
                  <Link href="/signup" className="flex items-center gap-2">
                    Start free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base backdrop-blur-sm"
                >
                  <Link href="/textbook">Peek at the textbook</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free to begin · No credit card · 12 modules · 22 frameworks
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Value props ──────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-center font-display text-3xl font-medium tracking-tight md:text-4xl">
              Not a quiz. A way of thinking.
            </h2>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {VALUE_PROPS.map((p) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title}>
                  <div className="surface-card h-full rounded-xl p-6">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="font-display text-xl font-medium tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="border-y border-border/40 bg-background/40">
          <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
            <Reveal>
              <h2 className="text-center font-display text-3xl font-medium tracking-tight md:text-4xl">
                Three moves, one habit of mind
              </h2>
            </Reveal>
            <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
              {STEPS.map((s) => (
                <Reveal key={s.n}>
                  <div className="text-center">
                    <div className="font-display text-4xl font-medium text-primary/80">
                      {s.n}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{s.label}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing teaser ───────────────────────────────────── */}
        <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <Reveal>
            <div className="surface-card mx-auto max-w-3xl rounded-2xl p-8 text-center md:p-12">
              <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                Free to begin. Upgrade when you&apos;re ready.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Start the textbook and your first dilemmas for free. One simple
                member plan unlocks every tool — or bring your whole class with
                an institution license.
              </p>
              <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left">
                {[
                  'Every chapter, story, and analysis tool',
                  'Your evolving ethics profile and reports',
                  'Communities, debates, and workshops',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="cta-glow h-12 px-8 text-base">
                  <Link href="/signup" className="flex items-center gap-2">
                    Create your free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-12 px-6 text-base">
                  <Link href="/pricing">See full pricing</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden border-t border-border/40">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" aria-hidden />
          <div className="container relative z-10 mx-auto px-4 py-20 text-center md:px-6 md:py-28">
            <Reveal>
              <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight md:text-5xl">
                The future is already here. Decide what you think about it.
              </h2>
              <div className="mt-8">
                <Button asChild size="lg" className="cta-glow h-12 px-8 text-base">
                  <Link href="/signup" className="flex items-center gap-2">
                    Build your ethics profile
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Already exploring?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
