'use client';

import Link from 'next/link';
import { ArrowRight, Crown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useUserCommunities } from '@/hooks/use-user-communities';

/**
 * Compact dashboard surface listing the communities the user belongs to, with
 * their role and a link to open each one. Mirrors the full /communities page
 * but condensed for the mission-control grid. Reuses the shared
 * `useUserCommunities` hook so membership is read consistently everywhere.
 */
export function MyCommunitiesMini(): JSX.Element {
  const { user } = useAuth();
  const { communities, loading } = useUserCommunities();

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading your communities…
      </p>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          You&apos;re not part of any community yet. Join one with an invite
          code to submit your results and build a shared learning record.
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href="/communities">Browse communities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {communities.slice(0, 4).map((c) => {
          const isOwner = !!user && c.ownerId === user.uid;
          const isManager =
            isOwner || (!!user && !!c.instructorIds?.includes(user.uid));
          const roleLabel = isOwner
            ? 'Owner'
            : isManager
            ? 'Instructor'
            : 'Member';
          return (
            <li key={c.id}>
              <Link
                href={`/communities/${c.id}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-card/70"
              >
                <span className="flex items-center gap-2 min-w-0">
                  {isManager ? (
                    <Crown className="h-3.5 w-3.5 shrink-0 text-primary" />
                  ) : (
                    <Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{c.name}</span>
                </span>
                <Badge
                  variant={isManager ? 'default' : 'secondary'}
                  className="shrink-0 text-[10px]"
                >
                  {roleLabel}
                </Badge>
              </Link>
            </li>
          );
        })}
      </ul>
      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
        <Link href="/communities">
          View all communities <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}
