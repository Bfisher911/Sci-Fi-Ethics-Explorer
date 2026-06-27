'use client';

/**
 * WelcomeExperience — the client orchestrator for the immersive /welcome
 * campaign page. Holds the shared `lean` state (set by the dilemma,
 * read by the WebGL hero), detects capability/motion/pointer once after
 * mount, and composes every effect behind the right guardrails:
 *
 *   • WebGL hero only on capable, ≥768px viewports; CSS fallback else.
 *   • Pointer effects (cursor, magnetic, tilt) only on fine pointers
 *     with motion allowed.
 *   • prefers-reduced-motion → static hero frame, no kinetic loops.
 *
 * The page stays fully legible with no JS: all copy is real markup and
 * renders server-side; the effects strictly enhance.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Scale,
  Brain,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/home/brand-mark';
import { Reveal } from '@/components/home/reveal';
import { HeroScene } from './hero-scene';
import { KineticHeadline } from './kinetic-headline';
import { DilemmaTeaser } from './dilemma-teaser';
import { MagneticCard } from './magnetic-card';
import { MagneticCTA } from './magnetic-cta';
import { CustomCursor } from './custom-cursor';
import { AmbientAudio } from './ambient-audio';
import { ThreeMoves } from './three-moves';
import { CountUp } from './count-up';

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

function supportsWebGL2(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export function WelcomeExperience() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [webglEnabled, setWebglEnabled] = useState(false);
  const [lean, setLean] = useState(0);

  useEffect(() => {
    setMounted(true);
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    setReducedMotion(rm);
    setFinePointer(fine);
    setWebglEnabled(supportsWebGL2() && window.innerWidth >= 768);
  }, []);

  // Pointer-driven flourishes require a fine pointer + motion allowed.
  const pointerFx = mounted && finePointer && !reducedMotion;

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      {/* Fixed cinematic overlays + opt-in sound. */}
      {mounted && !reducedMotion && (
        <>
          <div className="fx-grain" aria-hidden="true" />
          <div className="fx-scanlines" aria-hidden="true" />
        </>
      )}
      {pointerFx && <CustomCursor />}

      {/* Minimal top bar — logo + sound toggle + quiet account link. */}
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
          <div className="flex items-center gap-4">
            {mounted && !reducedMotion && <AmbientAudio />}
            <Link
              href="/login"
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative isolate min-h-[100svh] overflow-hidden bg-background">
          <HeroScene lean={lean} reducedMotion={reducedMotion} webglEnabled={webglEnabled} />

          {/* Contrast vignette — darkens the edges (so the live shader
              never blows out to a bright field) and keeps a calm pool
              behind the headline. Two stacked layers: an edge vignette
              plus a soft center scrim. */}
          <div
            className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_80%_70%_at_50%_45%,hsl(var(--background)/0.45),hsl(var(--background)/0.92)_100%)]"
            aria-hidden="true"
          />

          <div className="container relative z-10 mx-auto flex min-h-[100svh] flex-col items-center justify-center px-4 py-32 text-center md:px-6">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              The ethics of technology, through science fiction
            </p>

            <KineticHeadline reducedMotion={reducedMotion} />

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Read the stories that stress-tested every technology before it
              arrived. Decide the dilemmas they raise. Build a profile of how
              you actually reason about right and wrong.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticCTA href="/signup" enabled={pointerFx}>
                Start free
              </MagneticCTA>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base backdrop-blur-sm"
              >
                <Link href="/textbook">Peek at the textbook</Link>
              </Button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Free to begin · No credit card ·{' '}
              <CountUp value={12} reducedMotion={reducedMotion} /> modules ·{' '}
              <CountUp value={22} reducedMotion={reducedMotion} /> frameworks
            </p>
          </div>
        </section>

        {/* ── Signature: run a dilemma ─────────────────────────── */}
        <section className="container mx-auto px-4 py-20 text-center md:px-6 md:py-28">
          <Reveal>
            <h2 className="mx-auto mb-3 max-w-2xl font-display text-3xl font-medium tracking-tight md:text-4xl">
              You don&apos;t learn ethics by being told the answer.
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-muted-foreground">
              So here&apos;s one. Make a call and watch it cut both ways.
            </p>
          </Reveal>
          <DilemmaTeaser onLean={setLean} />
        </section>

        {/* ── Value props (magnetic spotlight cards) ───────────── */}
        <section className="container mx-auto px-4 pb-8 md:px-6">
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
                  <MagneticCard enabled={pointerFx} className="h-full p-6">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="font-display text-xl font-medium tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  </MagneticCard>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── Pinned three-moves sequence ──────────────────────── */}
        <ThreeMoves />

        {/* ── Pricing teaser ───────────────────────────────────── */}
        <section className="container mx-auto px-4 py-20 md:px-6 md:py-28">
          <Reveal>
            <MagneticCard
              enabled={pointerFx}
              className="mx-auto max-w-3xl p-8 text-center md:p-12"
            >
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
                <MagneticCTA href="/signup" enabled={pointerFx}>
                  Create your free account
                </MagneticCTA>
                <Button asChild variant="ghost" size="lg" className="h-12 px-6 text-base">
                  <Link href="/pricing">See full pricing</Link>
                </Button>
              </div>
            </MagneticCard>
          </Reveal>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden border-t border-border/40">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
            aria-hidden
          />
          <div className="container relative z-10 mx-auto px-4 py-20 text-center md:px-6 md:py-28">
            <Reveal>
              <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight md:text-5xl">
                The future is already here. Decide what you think about it.
              </h2>
              <div className="mt-8 flex justify-center">
                <MagneticCTA href="/signup" enabled={pointerFx}>
                  Build your ethics profile
                </MagneticCTA>
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
