'use client';

/**
 * Standard skeleton list — replaces ad-hoc spinner / blank /
 * "Loading..." patterns scattered across list views. One shape, one
 * tone, used everywhere a list of cards is loading.
 *
 * Three flavors via `shape`:
 *   row    — narrow horizontal rows (messages, leaderboard, comments)
 *   card   — full Card-shaped blocks (stories, dilemmas, posts)
 *   tile   — square aspect tiles (story trio, media grid)
 *
 * Skeletons should ALWAYS roughly match the shape of the eventual
 * content. Don't use a row skeleton for a card list — the layout
 * shifts on load and feels janky.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SkeletonListProps {
  /** How many skeleton items to render. Default: 6. */
  count?: number;
  /** Shape of each item. */
  shape?: 'row' | 'card' | 'tile';
  /** Optional grid override. Defaults match each shape sensibly. */
  className?: string;
}

export function SkeletonList({
  count = 6,
  shape = 'card',
  className,
}: SkeletonListProps): JSX.Element {
  if (shape === 'row') {
    return (
      <div className={cn('space-y-3', className)} role="status" aria-label="Loading">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  if (shape === 'tile') {
    return (
      <div
        className={cn(
          'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4',
          className,
        )}
        role="status"
        aria-label="Loading"
      >
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
        ))}
      </div>
    );
  }
  // shape === 'card' (default)
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="bg-card/50 backdrop-blur-sm">
          <Skeleton className="h-40 w-full rounded-t-lg" />
          <CardContent className="space-y-2 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
