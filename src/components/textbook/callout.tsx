'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primer' | 'takeaways' | 'discussion' | 'counterfactual' | 'reflection';

const VARIANT_STYLES: Record<Variant, { border: string; bg: string; text: string }> = {
  primer: {
    border: 'border-primary/40',
    bg: 'bg-primary/5',
    text: 'text-primary',
  },
  takeaways: {
    border: 'border-accent/40',
    bg: 'bg-accent/5',
    text: 'text-accent',
  },
  discussion: {
    border: 'border-chart-2/40',
    bg: 'bg-chart-2/5',
    text: 'text-chart-2',
  },
  counterfactual: {
    border: 'border-chart-3/40',
    bg: 'bg-chart-3/5',
    text: 'text-chart-3',
  },
  reflection: {
    border: 'border-chart-4/40',
    bg: 'bg-chart-4/5',
    text: 'text-chart-4',
  },
};

interface CalloutProps {
  variant?: Variant;
  icon?: LucideIcon;
  title: string;
  /** Optional one-line lede shown beneath the title. */
  lede?: string;
  children: ReactNode;
  className?: string;
}

/**
 * A boxed sidebar used for Primer Cache, Practical Takeaways,
 * After-Story Discussion, Counterfactual Lab, and Reflection Prompts.
 */
export function Callout({
  variant = 'primer',
  icon: Icon,
  title,
  lede,
  children,
  className,
}: CalloutProps) {
  const styles = VARIANT_STYLES[variant];
  return (
    <section
      className={cn(
        'my-10 mx-auto max-w-3xl rounded-xl border-2 backdrop-blur-sm p-6 md:p-8',
        styles.border,
        styles.bg,
        className
      )}
      aria-labelledby={`callout-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <header className="mb-4 flex items-start gap-3">
        {Icon && (
          <div className={cn('shrink-0 rounded-md p-2 bg-background/40', styles.text)}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
        <div>
          <h3
            id={`callout-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className={cn(
              'font-headline text-2xl font-semibold tracking-tight',
              styles.text
            )}
          >
            {title}
          </h3>
          {lede && <p className="text-sm text-muted-foreground mt-1">{lede}</p>}
        </div>
      </header>
      <div className="text-base text-foreground/90 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}
