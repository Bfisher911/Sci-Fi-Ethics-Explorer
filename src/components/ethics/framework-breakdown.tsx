'use client';

/**
 * Horizontal-bar breakdown of a user's cumulative ethical-framework
 * scores across all 18 frameworks. Chosen over a radar chart because
 * 18 axes on a radar are unreadable; a sorted bar list stays legible
 * on both desktop and mobile and needs no charting dependency.
 *
 * Pure presentational — takes the ranked frameworks from
 * buildJourneyProfile(). By default shows frameworks with a non-zero
 * score; pass `showAll` to render all 18 (zeros included).
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  FRAMEWORK_META,
  frameworkBarClass,
  type FrameworkId,
} from '@/lib/ethics/frameworks';
import type { RankedFramework } from '@/lib/ethics/journey';

interface FrameworkBreakdownProps {
  ranked: RankedFramework[];
  /** Render all 18 frameworks including zero-score ones. Default false. */
  showAll?: boolean;
  className?: string;
}

export function FrameworkBreakdown({
  ranked,
  showAll = false,
  className,
}: FrameworkBreakdownProps): JSX.Element {
  const rows = showAll ? ranked : ranked.filter((r) => r.score > 0);
  const max = ranked.length > 0 ? Math.max(...ranked.map((r) => r.score), 1) : 1;

  if (rows.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        No framework data yet. Make some Story decisions to populate this.
      </p>
    );
  }

  return (
    <ul className={cn('space-y-2', className)} aria-label="Ethical framework breakdown">
      {rows.map((r) => {
        const meta = FRAMEWORK_META[r.id as FrameworkId];
        const pct = max > 0 ? Math.round((r.score / max) * 100) : 0;
        const sharePct = Math.round(r.share * 100);
        return (
          <li key={r.id} className="flex items-center gap-3">
            <Link
              href={meta.route}
              className={cn(
                'w-28 shrink-0 truncate text-xs font-medium hover:underline md:w-32 md:text-sm',
                meta.color,
              )}
              title={meta.hint}
            >
              {meta.label}
            </Link>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted/40">
              <div
                className={cn('h-full rounded-full transition-all', frameworkBarClass(r.id as FrameworkId))}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
              {r.score}
              {r.score > 0 && (
                <span className="ml-1 opacity-60">({sharePct}%)</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
