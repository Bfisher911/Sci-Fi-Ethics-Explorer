'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BookText,
  Compass,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface FirstRunCardsProps {
  /** Where the "Try one minute" CTA points. Usually chapter 1. */
  startReadingHref: string;
  /** Called when the user dismisses the overlay (clicks Got it / X / starts reading). */
  onDismiss: () => void;
}

/**
 * Three-card first-run overlay shown to brand-new users on their first
 * dashboard visit. Sets the "what is this site / what should I do
 * first / try one minute" expectation in a calm, swipeable shape and
 * gets out of the way.
 *
 * Designed to render INSIDE the dashboard layout (not a full-screen
 * modal) so the dashboard's hero is visible behind it for context.
 * Dismisses to localStorage so it never re-shows for the same user.
 */
export function FirstRunCards({
  startReadingHref,
  onDismiss,
}: FirstRunCardsProps): JSX.Element {
  const [step, setStep] = useState(0);
  const cards = [
    {
      icon: Sparkles,
      eyebrow: 'Welcome',
      title: 'Why this site?',
      body: "Sci-Fi Ethics Explorer is a course in the ethics of technology, taught through the science fiction that's been wrestling with these questions for two centuries. You'll read, choose, debate, and reflect — then test your ideas against the frameworks that built modern moral philosophy.",
    },
    {
      icon: Compass,
      eyebrow: 'Your shape',
      title: 'What should I do first?',
      body: "Three good first moves: take the Framework Explorer to find your dominant ethical lens, read a story to feel how the platform thinks, or open Chapter 1 of the textbook for the long arc. They all count toward your Master Exam progress later.",
    },
    {
      icon: BookText,
      eyebrow: 'Try it now',
      title: 'One minute of the textbook',
      body: "The fastest way to feel the shape of the platform: open Chapter 1 and read the opening 60 seconds. You can come back to this dashboard anytime — it's your home base.",
    },
  ];

  const isLast = step === cards.length - 1;
  const card = cards[step];
  const CardIcon = card.icon;

  return (
    <div
      className="relative mb-6 overflow-hidden rounded-2xl border-2 p-6 backdrop-blur"
      style={{
        borderColor: 'hsl(var(--primary) / 0.4)',
        background:
          'linear-gradient(135deg, hsl(var(--card) / 0.85) 0%, hsl(var(--sidebar-background) / 0.85) 100%)',
        boxShadow:
          '0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px hsl(var(--primary) / 0.1)',
      }}
    >
      {/* Magenta corner glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-60 w-60"
        style={{
          background:
            'radial-gradient(circle, hsl(300 100% 50% / 0.25) 0%, transparent 70%)',
        }}
      />

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss welcome cards"
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative grid gap-5 md:grid-cols-[auto_1fr]">
        <div
          className="grid h-12 w-12 place-items-center rounded-xl"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, hsl(var(--primary)) 0%, hsl(var(--accent) / 0.7) 70%)',
            boxShadow: '0 0 20px hsl(var(--primary) / 0.4)',
          }}
        >
          <CardIcon className="h-6 w-6" style={{ color: '#0a0a2e' }} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            {card.eyebrow} · {step + 1} of {cards.length}
          </div>
          <h2 className="mt-1 font-headline text-2xl font-bold leading-tight">
            {card.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">
            {card.body}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!isLast && (
              <Button onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
            {isLast && (
              <Button asChild onClick={onDismiss}>
                <Link href={startReadingHref}>
                  Try Chapter 1 <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              {isLast ? 'Skip — explore on my own' : 'Skip the intro'}
            </Button>
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5" />
              <Link
                href="/help"
                className="hover:text-primary"
              >
                Read the full mental model
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Step pips */}
      <div className="relative mt-5 flex justify-center gap-2">
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            aria-label={`Go to card ${i + 1}`}
            className="h-1.5 w-8 rounded-full transition-colors"
            style={{
              background:
                i === step
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--border) / 0.6)',
              boxShadow: i === step ? '0 0 8px hsl(var(--primary) / 0.6)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
