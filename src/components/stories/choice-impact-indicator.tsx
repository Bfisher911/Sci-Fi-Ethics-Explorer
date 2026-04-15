'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { classifyChoice, FRAMEWORK_INFO, type FrameworkId } from '@/lib/choice-frameworks';
import { Compass } from 'lucide-react';

interface ChoiceImpactIndicatorProps {
  /** Each entry is the text of a choice the user has picked, in order. */
  pickedChoiceTexts: string[];
  className?: string;
}

/**
 * Floating panel showing per-framework counts for the user's choices so far.
 * Only renders when at least one choice has been made.
 */
export function ChoiceImpactIndicator({
  pickedChoiceTexts,
  className,
}: ChoiceImpactIndicatorProps): JSX.Element | null {
  const counts = useMemo(() => {
    const c: Record<FrameworkId, number> = {
      utilitarianism: 0,
      deontology: 0,
      'virtue-ethics': 0,
      'social-contract': 0,
      'care-ethics': 0,
      unaligned: 0,
    };
    for (const text of pickedChoiceTexts) {
      const id = classifyChoice(text);
      c[id]++;
    }
    return c;
  }, [pickedChoiceTexts]);

  if (pickedChoiceTexts.length === 0) return null;

  // Find dominant (excluding unaligned)
  const aligned = (Object.keys(counts) as FrameworkId[]).filter(
    (k) => k !== 'unaligned'
  );
  const dominant = aligned.reduce((best, k) =>
    counts[k] > counts[best] ? k : best
  , aligned[0]);

  const total = pickedChoiceTexts.length;

  return (
    <Card
      className={cn(
        'fixed bottom-4 right-4 z-30 w-72 max-w-[calc(100vw-2rem)] bg-card/90 backdrop-blur-md border-primary/20 p-3 shadow-xl',
        'hidden md:block',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 mb-2">
        <Compass className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Your Path
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/70">
          {total} choice{total === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-1.5">
        {aligned.map((id) => {
          const info = FRAMEWORK_INFO[id];
          const count = counts[id];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={id} className="flex items-center gap-2 text-[11px]">
              <span className={cn('font-medium w-20 shrink-0', info.color)}>
                {info.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className={cn('h-full transition-all duration-500', info.color.replace('text-', 'bg-'))}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-muted-foreground w-6 text-right tabular-nums">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {dominant && counts[dominant] > 0 && (
        <p className="mt-2 text-[10px] text-muted-foreground italic leading-relaxed">
          Leaning {FRAMEWORK_INFO[dominant].label}.{' '}
          {FRAMEWORK_INFO[dominant].hint}
        </p>
      )}
    </Card>
  );
}
