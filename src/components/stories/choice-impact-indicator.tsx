'use client';

/**
 * "Your Path" — floating card in the Story section that tracks which
 * of the 18 ethical frameworks the reader's choices are aligning with.
 *
 * Replaces the old 5-framework version. Now driven by the full
 * EthicsJourneyEntry list (weighted, multi-framework) rather than raw
 * choice text, and sourced from the canonical 18-framework registry.
 *
 * Stays uncluttered by showing the user's STRONGEST guiding principles
 * first (top 4 by cumulative weight) with a "Show all" toggle that
 * expands to every framework they've touched. A one-line interpretation
 * of the latest decision keeps the card feeling responsive.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Compass, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import {
  FRAMEWORK_META,
  frameworkBarClass,
  type FrameworkId,
} from '@/lib/ethics/frameworks';
import {
  buildJourneyProfile,
  type EthicsJourneyEntry,
} from '@/lib/ethics/journey';

interface ChoiceImpactIndicatorProps {
  /** The reader's recorded decisions so far, in any order. */
  entries: EthicsJourneyEntry[];
  /** Interpretation of the most recent decision (one sentence). */
  latestInterpretation?: string | null;
  className?: string;
}

const TOP_N = 4;

export function ChoiceImpactIndicator({
  entries,
  latestInterpretation,
  className,
}: ChoiceImpactIndicatorProps): JSX.Element | null {
  const [expanded, setExpanded] = useState(false);

  const profile = useMemo(() => buildJourneyProfile(entries), [entries]);

  if (entries.length === 0) return null;

  const nonZero = profile.ranked.filter((r) => r.score > 0);
  const visible = expanded ? nonZero : nonZero.slice(0, TOP_N);
  const hiddenCount = nonZero.length - visible.length;
  const maxScore = nonZero.length > 0 ? nonZero[0].score : 1;
  const total = entries.length;
  const topTension = profile.tensions[0];

  return (
    <Card
      className={cn(
        'fixed bottom-4 right-4 z-30 w-72 max-w-[calc(100vw-2rem)] bg-card/90 backdrop-blur-md border-primary/20 p-3 shadow-xl',
        'hidden md:block',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-2 flex items-center gap-2">
        <Compass className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Your Path
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/70">
          {total} choice{total === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-1.5">
        {visible.map((r) => {
          const meta = FRAMEWORK_META[r.id as FrameworkId];
          const pct = maxScore > 0 ? Math.round((r.score / maxScore) * 100) : 0;
          return (
            <div key={r.id} className="flex items-center gap-2 text-[11px]">
              <Link
                href={meta.route}
                className={cn(
                  'w-24 shrink-0 truncate font-medium hover:underline',
                  meta.color,
                )}
                title={meta.hint}
              >
                {meta.label}
              </Link>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    frameworkBarClass(r.id as FrameworkId),
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-right tabular-nums text-muted-foreground">
                {r.score}
              </span>
            </div>
          );
        })}
      </div>

      {nonZero.length > TOP_N && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Show top {TOP_N}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> Show all {nonZero.length}{' '}
              {hiddenCount > 0 ? `(+${hiddenCount})` : ''}
            </>
          )}
        </button>
      )}

      {profile.dominant.length > 0 && (
        <p className="mt-2 text-[10px] italic leading-relaxed text-muted-foreground">
          Leaning{' '}
          <span className={FRAMEWORK_META[profile.dominant[0].id].color}>
            {profile.dominant[0].label}
          </span>
          . {FRAMEWORK_META[profile.dominant[0].id].hint}
        </p>
      )}

      {latestInterpretation && (
        <p className="mt-2 border-t border-border/40 pt-2 text-[10px] leading-relaxed text-foreground/80">
          <span className="font-semibold text-primary">Latest:</span>{' '}
          {latestInterpretation}
        </p>
      )}

      {topTension && (
        <p className="mt-2 flex items-start gap-1 text-[10px] leading-relaxed text-muted-foreground">
          <Scale className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
          <span>
            Tension between {topTension.aLabel} and {topTension.bLabel}.
          </span>
        </p>
      )}

      <Link
        href="/me"
        className="mt-2 block text-[10px] text-muted-foreground/70 hover:text-primary hover:underline"
      >
        See your full ethical profile →
      </Link>
    </Card>
  );
}
