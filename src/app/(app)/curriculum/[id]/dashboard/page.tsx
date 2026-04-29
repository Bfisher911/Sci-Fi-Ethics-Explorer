'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Users,
  Trophy,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import {
  getCurriculumById,
  getCurriculumProgressAggregate,
} from '@/app/actions/curriculum';
import type { CurriculumPath, CurriculumItem } from '@/types';

// recharts is ~80 KB and only the curriculum's creator (or an admin)
// ever loads this page. Defer the chart bundles so the dashboard
// shell — header, drop-off callout, and per-user table — paints
// immediately while the visualisations stream in.
const ItemCompletionChart = dynamic(
  () =>
    import('./dashboard-charts').then((m) => m.ItemCompletionChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
  },
);
const CompletionRateChart = dynamic(
  () =>
    import('./dashboard-charts').then((m) => m.CompletionRateChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full" />,
  },
);

interface Aggregate {
  enrolled: number;
  completed: number;
  averageItemsCompleted: number;
  itemCompletionCounts: Record<string, number>;
  perUser: { userId: string; itemsCompleted: number }[];
}

function shortenTitle(t: string, max = 22): string {
  if (!t) return '—';
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function shortenUid(uid: string): string {
  if (!uid) return 'anon';
  return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
}

export default function CurriculumDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [curriculum, setCurriculum] = useState<CurriculumPath | null>(null);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (authLoading || adminLoading) return;
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      const cResult = await getCurriculumById(id);
      if (!cResult.success || !cResult.data) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      const c = cResult.data;
      setCurriculum(c);
      const isCreator = c.creatorId === user.uid;
      if (!isCreator && !isAdmin) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);

      const aResult = await getCurriculumProgressAggregate(id);
      if (aResult.success) setAggregate(aResult.data);
      setLoading(false);
    }
    fetchData();
  }, [id, user, authLoading, isAdmin, adminLoading]);

  const flatItems: CurriculumItem[] = useMemo(() => {
    if (!curriculum) return [];
    return curriculum.modules
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((m) =>
        m.items.slice().sort((a, b) => a.order - b.order)
      );
  }, [curriculum]);

  const totalItems = flatItems.length;

  const itemBarData = useMemo(() => {
    if (!aggregate) return [];
    const max = Math.max(
      1,
      ...flatItems.map((it) => aggregate.itemCompletionCounts[it.id] || 0)
    );
    return flatItems.map((it) => {
      const count = aggregate.itemCompletionCounts[it.id] || 0;
      return {
        id: it.id,
        name: shortenTitle(it.title || it.type),
        fullName: it.title || it.type,
        count,
        dim: count / max < 0.25,
      };
    });
  }, [aggregate, flatItems]);

  const completionRateData = useMemo(() => {
    if (!aggregate || aggregate.enrolled === 0) return [];
    return flatItems.map((it) => {
      const count = aggregate.itemCompletionCounts[it.id] || 0;
      return {
        id: it.id,
        name: shortenTitle(it.title || it.type, 26),
        fullName: it.title || it.type,
        rate: Math.round((count / aggregate.enrolled) * 100),
      };
    });
  }, [aggregate, flatItems]);

  const dropoffPoints = useMemo(() => {
    if (!aggregate || flatItems.length < 2) return [];
    const deltas: {
      fromTitle: string;
      toTitle: string;
      drop: number;
      fromCount: number;
      toCount: number;
    }[] = [];
    for (let i = 1; i < flatItems.length; i++) {
      const prev = flatItems[i - 1];
      const cur = flatItems[i];
      const prevCount = aggregate.itemCompletionCounts[prev.id] || 0;
      const curCount = aggregate.itemCompletionCounts[cur.id] || 0;
      const drop = prevCount - curCount;
      if (drop > 0) {
        deltas.push({
          fromTitle: prev.title || prev.type,
          toTitle: cur.title || cur.type,
          fromCount: prevCount,
          toCount: curCount,
          drop,
        });
      }
    }
    deltas.sort((a, b) => b.drop - a.drop);
    return deltas.slice(0, 3);
  }, [aggregate, flatItems]);

  const rankedUsers = useMemo(() => {
    if (!aggregate) return [];
    return aggregate.perUser
      .slice()
      .sort((a, b) => b.itemsCompleted - a.itemsCompleted)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  }, [aggregate]);

  if (loading || authLoading || adminLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-10 text-center bg-card/80 backdrop-blur-sm">
          <ShieldAlert className="h-10 w-10 text-destructive mx-auto mb-2" />
          <p className="text-xl text-muted-foreground">
            You don't have permission to view this dashboard.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => router.push(`/curriculum/${id}`)}
          >
            Back to curriculum
          </Button>
        </Card>
      </div>
    );
  }

  if (!curriculum || !aggregate) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-10 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-xl text-muted-foreground">No data available.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href={`/curriculum/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to curriculum
          </Link>
        </Button>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-primary font-headline">
              {curriculum.title}
            </CardTitle>
            <CardDescription>Creator progress dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {aggregate.enrolled} enrolled
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {aggregate.completed} completed
              </Badge>
              <Badge variant="outline">
                avg {aggregate.averageItemsCompleted.toFixed(1)} items
              </Badge>
              <Badge variant="secondary">{totalItems} total items</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {aggregate.enrolled === 0 ? (
        <Card className="bg-card/80 backdrop-blur-sm p-10 text-center">
          <p className="text-lg text-muted-foreground">
            No one has enrolled yet. Share your curriculum to start collecting
            progress data.
          </p>
        </Card>
      ) : (
        <>
          {/* Item completion bar chart (lazy-loaded) */}
          <ItemCompletionChart data={itemBarData} />

          {/* Drop-off callout */}
          {dropoffPoints.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-destructive/30">
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  Drop-off Points
                </CardTitle>
                <CardDescription>
                  Biggest completion gaps between consecutive items — good
                  candidates to review for clarity, difficulty, or pacing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dropoffPoints.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded bg-background/50 border flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        After{' '}
                        <span className="text-foreground font-medium">
                          {d.fromTitle}
                        </span>{' '}
                        →{' '}
                        <span className="text-foreground font-medium">
                          {d.toTitle}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {d.fromCount} → {d.toCount} users
                      </p>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      −{d.drop} users
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Completion rate horizontal chart (lazy-loaded) */}
          <CompletionRateChart data={completionRateData} />

          {/* Per-user table */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                Per-user progress
              </CardTitle>
              <CardDescription>
                Ranked by items completed. UIDs are shortened for privacy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="w-40">Items</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankedUsers.map((u) => {
                    const pct =
                      totalItems > 0
                        ? Math.round((u.itemsCompleted / totalItems) * 100)
                        : 0;
                    return (
                      <TableRow key={u.userId}>
                        <TableCell className="font-medium">#{u.rank}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {shortenUid(u.userId)}
                        </TableCell>
                        <TableCell>
                          {u.itemsCompleted} / {totalItems}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="flex-1" />
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {pct}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
