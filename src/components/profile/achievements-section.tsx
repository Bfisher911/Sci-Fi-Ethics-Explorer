'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserBadges } from '@/app/actions/badges';
import { EarnedBadges } from '@/components/profile/earned-badges';
import { CertificatesCard } from '@/components/profile/certificates-card';

/**
 * Top-level "Achievements" section for the profile page. Combines the
 * earned-badges grid with a certificates list.
 */
export function AchievementsSection() {
  const { user } = useAuth();
  const [badgeIds, setBadgeIds] = useState<string[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.uid) {
        setLoadingBadges(false);
        return;
      }
      const result = await getUserBadges(user.uid);
      if (result.success) {
        setBadgeIds(result.data);
      }
      setLoadingBadges(false);
    }
    load();
  }, [user?.uid]);

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-primary font-headline flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Achievements
          </CardTitle>
          <CardDescription>
            Badges you've earned for exploring, debating, and learning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingBadges ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          ) : (
            <EarnedBadges earnedBadgeIds={badgeIds} />
          )}
        </CardContent>
      </Card>

      <CertificatesCard />
    </div>
  );
}
