'use client';

/**
 * StoryThinking — a small, accessible "the system is working" widget for the
 * story reader. Shown while the app generates the end-of-story AI review or
 * epilogue (the only genuinely slow steps now that decision clicks are
 * instant).
 *
 * Accessibility:
 *   - `role="status"` + `aria-live="polite"` so screen readers announce it.
 *   - Respects `prefers-reduced-motion`: the message stops cycling and the
 *     animated dots/spinner are neutralized by the global reduced-motion rule
 *     in globals.css. A static, clearly-labeled indicator remains.
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryThinkingProps {
  /** Rotating status lines. The first is shown immediately. */
  messages?: string[];
  className?: string;
}

const DEFAULT_MESSAGES = [
  'Analyzing your decisions…',
  'Weighing the ethical frameworks…',
  'Preparing your reflection…',
];

export function StoryThinking({
  messages = DEFAULT_MESSAGES,
  className,
}: StoryThinkingProps): JSX.Element {
  const lines = messages.length > 0 ? messages : DEFAULT_MESSAGES;
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || lines.length <= 1) return;
    const t = setInterval(
      () => setIndex((p) => (p + 1) % lines.length),
      2200,
    );
    return () => clearInterval(t);
  }, [lines.length, reducedMotion]);

  const message = lines[Math.min(index, lines.length - 1)] ?? lines[0];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3',
        className,
      )}
    >
      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
      <span className="text-sm text-foreground/90">{message}</span>
      <span className="ml-auto inline-flex gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse [animation-delay:400ms]" />
      </span>
    </div>
  );
}
