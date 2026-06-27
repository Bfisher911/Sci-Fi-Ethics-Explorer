'use client';

/**
 * DilemmaTeaser — the signature interactive moment. A one-line ethical
 * dilemma with two choices; picking a side calls `onLean` (which
 * recolors the hero shader cyan↔magenta) and reveals a one-sentence
 * consequence. A 5-second taste of the actual product, on the page.
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';

type Side = 'order' | 'liberty';

const CHOICES: Record<
  Side,
  { label: string; lean: number; consequence: string }
> = {
  order: {
    label: 'Flag the user',
    lean: 1,
    consequence:
      'You traded a stranger’s privacy for a prediction that might be wrong. Who audits the model that made the call?',
  },
  liberty: {
    label: 'Stay out of it',
    lean: -1,
    consequence:
      'You protected autonomy — and accepted a harm you could have flagged. When does restraint become negligence?',
  },
};

export function DilemmaTeaser({ onLean }: { onLean: (lean: number) => void }) {
  const [picked, setPicked] = useState<Side | null>(null);

  const choose = (side: Side) => {
    setPicked(side);
    onLean(CHOICES[side].lean);
  };

  const reset = () => {
    setPicked(null);
    onLean(0);
  };

  return (
    <div className="surface-glass mx-auto max-w-2xl rounded-2xl p-7 text-left md:p-9">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
        Run a dilemma
      </p>
      <p className="mt-3 font-display text-xl leading-snug text-foreground md:text-2xl">
        An AI flags a quiet user as a likely threat — on a pattern it
        can&apos;t explain. You can act on it, or let it go.
      </p>

      {!picked ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {(Object.keys(CHOICES) as Side[]).map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => choose(side)}
              data-cursor-grow
              className="flex-1 rounded-xl border border-border/70 bg-background/40 px-5 py-4 text-base font-medium text-foreground/90 transition-colors hover:border-primary/60 hover:bg-primary/10"
            >
              {CHOICES[side].label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-base leading-relaxed text-muted-foreground">
            {CHOICES[picked].consequence}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-base font-medium text-primary hover:underline"
            >
              There’s no easy answer — build your way through it
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try the other choice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
