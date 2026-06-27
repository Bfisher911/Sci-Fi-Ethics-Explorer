'use client';

/**
 * KineticHeadline — the hero headline with a clip-path wipe-in, a
 * per-letter "glitch" flicker on the emphasized word, and a cycling
 * verb. Under prefers-reduced-motion the CSS animations don't apply
 * (they're gated by @media), and the verb stops cycling.
 */

import { useEffect, useState } from 'react';

const VERBS = ['question', 'interrogate', 'reason about', 'stress-test'];

export function KineticHeadline({ reducedMotion }: { reducedMotion: boolean }) {
  const [vi, setVi] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setVi((v) => (v + 1) % VERBS.length), 2600);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
      <span className={reducedMotion ? '' : 'fx-wipe'} style={{ display: 'inline-block' }}>
        The future is{' '}
        <em className="not-italic text-primary fx-emphasis">questionable.</em>
      </span>
      <br className="hidden sm:block" />
      <span className="text-foreground/95">
        Learn to{' '}
        <span
          key={vi}
          className="fx-headline-word text-primary"
          style={
            reducedMotion ? undefined : { animation: 'fx-verb 2.6s var(--ease-expo) both' }
          }
        >
          {VERBS[vi]}
        </span>{' '}
        it well.
      </span>
    </h1>
  );
}
