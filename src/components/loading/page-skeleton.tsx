'use client';

/**
 * Page- and shell-level skeletons — the companions to {@link SkeletonList}
 * for full-page loaders. These replace centered "Loading…" spinners on
 * page/layout-level loading states so the *shape* of the page is visible
 * while data resolves, per the design system's rule: skeletons (not
 * spinners) for content loads over ~1s. Inline button/action spinners are
 * intentionally NOT replaced — a spinner is the right affordance there.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { cn } from '@/lib/utils';

/** The app's recurring "header card" pattern: title + supporting lines. */
export function HeaderCardSkeleton({
  className,
}: {
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-border/60 bg-card/50 p-6',
        className,
      )}
    >
      <Skeleton className="h-9 w-2/3 max-w-md" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-1/2 max-w-sm" />
    </div>
  );
}

/**
 * Generic full-page skeleton: a header card followed by N content blocks.
 * Sensible default for most page-level loaders.
 */
export function PageSkeleton({
  className,
  blocks = 2,
}: {
  className?: string;
  blocks?: number;
}): JSX.Element {
  return (
    <div
      className={cn('space-y-6', className)}
      role="status"
      aria-label="Loading"
    >
      <HeaderCardSkeleton />
      {Array.from({ length: blocks }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-lg border border-border/60 bg-card/50 p-6"
        >
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/**
 * Header card + a responsive grid of card skeletons — for index pages and
 * the Framework Explorer module list, where a header sits above a card grid.
 */
export function HeaderAndGridSkeleton({
  count = 6,
}: {
  count?: number;
}): JSX.Element {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <HeaderCardSkeleton />
      <SkeletonList shape="card" count={count} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/**
 * App-shell skeleton — sidebar + header chrome + page content. Used by the
 * (app) layout while auth/session resolves, so the user sees the app
 * structure forming instead of a blank centered spinner.
 */
export function AppShellSkeleton(): JSX.Element {
  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-background"
      role="status"
      aria-label="Loading Sci-Fi Ethics Explorer"
    >
      {/* Sidebar rail (desktop only, mirrors the real sidebar width) */}
      <div className="hidden w-64 shrink-0 flex-col gap-2 border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="flex items-center gap-2 pb-4">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-5 w-28" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
      {/* Main column */}
      <div className="flex flex-1 flex-col">
        {/* Header bar (mirrors the real h-16 header) */}
        <div className="flex h-16 items-center gap-4 border-b border-border px-4 sm:px-6">
          <Skeleton className="h-8 w-8" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <PageSkeleton />
        </div>
      </div>
      <span className="sr-only">Loading Sci-Fi Ethics Explorer…</span>
    </div>
  );
}
