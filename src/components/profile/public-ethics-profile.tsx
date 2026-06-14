'use client';

/**
 * Public, read-only ethical-framework profile shown on another user's
 * profile page (/users/[id]) when that user has a public profile.
 *
 * Surfaces the SAME unified profile the owner sees on /me — dominant
 * guiding principles, a framework-strength radar, and the full
 * breakdown — but with no report buttons, no community-submission, and
 * no private detail. Only the aggregate framework distribution is
 * shown; individual answers are never exposed.
 */

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Compass, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FrameworkBreakdown } from '@/components/ethics/framework-breakdown';
import { getUnifiedEthicsProfile } from '@/app/actions/ethics-journey';
import { buildJourneyProfile, type JourneyProfile } from '@/lib/ethics/journey';
import { FRAMEWORK_META, type FrameworkId } from '@/lib/ethics/frameworks';

const FrameworkRadar = dynamic(
  () =>
    import('@/components/charts/framework-radar').then((m) => m.FrameworkRadar),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted/20" />
    ),
  },
);

interface PublicEthicsProfileProps {
  userId: string;
  /** Display name, for the framing copy. */
  displayName?: string;
}

export function PublicEthicsProfile({
  userId,
  displayName,
}: PublicEthicsProfileProps): JSX.Element {
  const [profile, setProfile] = useState<JourneyProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUnifiedEthicsProfile(userId).then((res) => {
      if (cancelled) return;
      setProfile(res.success ? res.data.profile : buildJourneyProfile([]));
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const radarData = useMemo(() => {
    if (!profile) return [];
    return profile.ranked
      .filter((r) => r.score > 0)
      .slice(0, 6)
      .map((r) => ({
        name: FRAMEWORK_META[r.id as FrameworkId].shortLabel,
        score: r.score,
      }));
  }, [profile]);

  if (profile === null) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const who = displayName ? `${displayName}'s` : 'Their';

  if (profile.totalDecisions === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {who} ethical profile is still developing — no activities completed
        yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Guiding principles */}
      {profile.dominant.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-primary" /> Guiding principles
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.dominant.map((d, i) => (
              <Badge
                key={d.id}
                variant="outline"
                className={`${FRAMEWORK_META[d.id].color} border-current/30`}
              >
                {i === 0 && '★ '}
                {d.label}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {who} responses across {profile.totalDecisions} activit
            {profile.totalDecisions === 1 ? 'y' : 'ies'} currently lean toward
            these frameworks. This profile may change as they complete more.
          </p>
        </div>
      )}

      {radarData.length >= 3 && (
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Compass className="h-3.5 w-3.5 text-primary" /> Framework strength
          </div>
          <FrameworkRadar data={radarData} height={300} />
        </div>
      )}

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Framework breakdown
        </div>
        <FrameworkBreakdown ranked={profile.ranked} />
      </div>
    </div>
  );
}
