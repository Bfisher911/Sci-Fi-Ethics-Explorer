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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
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
          {/* Item completion bar chart */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                Items completed
              </CardTitle>
              <CardDescription>
                Number of users who have completed each item (low-completion
                items are dimmed).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={itemBarData}
                    margin={{ top: 10, right: 10, bottom: 40, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={60}
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                      labelFormatter={(_label, payload) =>
                        payload && payload[0]
                          ? (payload[0].payload as { fullName: string })
                              .fullName
                          : ''
                      }
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {itemBarData.map((entry) => (
                        <Cell
                          key={entry.id}
                          fill={
                            entry.dim
                              ? 'hsl(var(--primary) / 0.25)'
                              : 'hsl(var(--primary))'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

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

          {/* Completion rate horizontal chart */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                Completion rate
              </CardTitle>
              <CardDescription>
                % of enrolled users who completed each item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="w-full"
                style={{
                  height: `${Math.max(240, completionRateData.length * 32)}px`,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={completionRateData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={160}
                      interval={0}
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--foreground))',
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                      formatter={(v: number) => [`${v}%`, 'Completion rate']}
                      labelFormatter={(_l, payload) =>
                        payload && payload[0]
                          ? (payload[0].payload as { fullName: string })
                              .fullName
                          : ''
                      }
                    />
                    <Bar
                      dataKey="rate"
                      radius={[0, 4, 4, 0]}
                      fill="hsl(var(--accent))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

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
