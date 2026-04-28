'use client';

/**
 * Leaderboard view — the body content of the legacy /leaderboard page,
 * extracted so it can be embedded inside /people's tab system. Outer
 * "Leaderboard" hero card removed (the /people page wears that hat).
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  getLeaderboard,
  getUserBadges,
  type LeaderboardEntry,
} from '@/app/actions/badges';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { BadgeDisplay } from '@/components/leaderboard/badge-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Award } from 'lucide-react';

export function LeaderboardView() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [leaderboardResult, badgesResult] = await Promise.all([
          getLeaderboard(20),
          user
            ? getUserBadges(user.uid)
            : Promise.resolve({ success: true as const, data: [] as string[] }),
        ]);
        if (leaderboardResult.success) setEntries(leaderboardResult.data);
        if (badgesResult.success) setEarnedBadgeIds(badgesResult.data);
      } catch (error) {
        console.error('Failed to load leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="space-y-6 mt-4">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Explorers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <LeaderboardTable entries={entries} currentUserId={user?.uid} />
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            Badge Showcase
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <BadgeDisplay earnedBadgeIds={earnedBadgeIds} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
