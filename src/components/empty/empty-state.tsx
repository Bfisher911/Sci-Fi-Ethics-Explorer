'use client';

/**
 * Standard empty-state component used across the app.
 *
 * Replaces the ad-hoc "No items yet…" gray text strings that
 * accumulated across list views (bookmarks, dilemmas, my-submissions,
 * gradebook, etc.). One visual, one tone, always actionable.
 *
 * Three slots:
 *   icon    — usually a lucide icon, sized via the wrapper
 *   title   — short headline ("No saved items yet")
 *   blurb   — one sentence on why the list is empty + a hint
 *   action  — optional primary CTA (Link or Button) — encourages the
 *             user to do the thing that would populate the list
 *
 * Empty states should be the LAST resort: if you can show a
 * partially-filled state with examples or sample content, do that
 * instead. EmptyState is for when there's truly nothing.
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  blurb?: string;
  action?: ReactNode;
  /** Tone of the icon background. Default `primary`. */
  tone?: 'primary' | 'accent' | 'muted';
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<EmptyStateProps['tone']>, string> = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  muted: 'bg-muted text-muted-foreground',
};

export function EmptyState({
  icon: Icon,
  title,
  blurb,
  action,
  tone = 'primary',
  className,
}: EmptyStateProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'rounded-2xl border border-dashed border-border/60 bg-card/40 backdrop-blur-sm',
        'px-6 py-12 md:py-16',
        className,
      )}
      role="status"
    >
      <div
        className={cn(
          'mb-4 grid h-14 w-14 place-items-center rounded-full',
          TONE_CLASSES[tone],
        )}
        aria-hidden
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-headline text-xl font-semibold text-foreground">
        {title}
      </h3>
      {blurb && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {blurb}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
