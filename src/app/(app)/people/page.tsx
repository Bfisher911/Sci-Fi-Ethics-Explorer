'use client';

/**
 * /people — unified discovery surface that merges the previous
 * /directory and /leaderboard routes into one page with two views:
 *
 *   "Browse"      filter-driven directory (the social view)
 *   "Leaderboard" ranked by activity score (the competitive view)
 *
 * Both views run against the same pool of users (everyone with a
 * public profile). Switching between them via tabs is instant — no
 * route change. Old /directory and /leaderboard URLs redirect here.
 *
 * Implementation note: rather than rebuild both features inline,
 * each tab renders the existing route's inner page content. That
 * keeps logic in one place and makes the merge a no-risk IA change.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, Trophy } from 'lucide-react';
import { DirectoryView } from '@/components/people/directory-view';
import { LeaderboardView } from '@/components/people/leaderboard-view';

const VALID_TABS = ['browse', 'leaderboard'] as const;
type PeopleTab = (typeof VALID_TABS)[number];

export default function PeoplePage() {
  return (
    <Suspense fallback={null}>
      <PeoplePageInner />
    </Suspense>
  );
}

function PeoplePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams?.get('tab');
  const initial: PeopleTab = (VALID_TABS as readonly string[]).includes(queryTab ?? '')
    ? (queryTab as PeopleTab)
    : 'browse';
  const [tab, setTab] = useState<PeopleTab>(initial);

  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
    if (params.get('tab') !== tab) {
      params.set('tab', tab);
      router.replace(`/people?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold mb-2 text-primary font-headline flex items-center gap-3">
            <Users className="h-9 w-9" />
            People
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse other ethics explorers, or see how you rank.
          </p>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as PeopleTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 md:max-w-md">
          <TabsTrigger value="browse" className="gap-2">
            <Users className="h-4 w-4" />
            <span>Browse</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="h-4 w-4" />
            <span>Leaderboard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" forceMount={true} hidden={tab !== 'browse'}>
          <DirectoryView />
        </TabsContent>
        <TabsContent
          value="leaderboard"
          forceMount={true}
          hidden={tab !== 'leaderboard'}
        >
          <LeaderboardView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
