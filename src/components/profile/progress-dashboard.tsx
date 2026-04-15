'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserProgress } from '@/app/actions/progress';
import type { UserProgress } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
} from '@/components/ui/chart';
import {
  BookOpen,
  Brain,
  MessageSquare,
  FileText,
  Trophy,
  Loader2,
} from 'lucide-react';

export function ProgressDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }
      try {
        const result = await getUserProgress(user.uid);
        if (result.success) {
          setProgress(result.data);
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProgress();
  }, [user?.uid]);

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  const latestQuiz = progress.quizResults.length > 0
    ? progress.quizResults[progress.quizResults.length - 1]
    : null;

  // Shorten long names for the chart axis; keep full name for tooltip
  const shortenName = (fullName: string): string => {
    if (fullName.length <= 22) return fullName;
    const firstWord = fullName.split(' ')[0];
    return `${firstWord}...`;
  };

  const quizChartData = latestQuiz
    ? Object.entries(latestQuiz.scores).map(([framework, score]) => {
        const fullName = framework
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return {
          name: shortenName(fullName),
          fullName,
          score,
        };
      }).sort((a, b) => b.score - a.score)
    : [];

  const chartConfig = quizChartData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const stats = [
    {
      label: 'Stories Completed',
      value: progress.storiesCompleted.length,
      icon: BookOpen,
    },
    {
      label: 'Scenarios Analyzed',
      value: progress.scenariosAnalyzed,
      icon: Brain,
    },
    {
      label: 'Debates Joined',
      value: progress.debatesParticipated.length,
      icon: MessageSquare,
    },
    {
      label: 'Dilemmas Submitted',
      value: progress.dilemmasSubmitted.length,
      icon: FileText,
    },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-primary font-headline flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Your Progress
        </CardTitle>
        <CardDescription>
          Track your ethical exploration journey across stories, analyses, debates, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center p-4 rounded-lg bg-background/50 border"
            >
              <stat.icon className="h-6 w-6 text-accent mb-2" />
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground text-center">{stat.label}</span>
            </div>
          ))}
        </div>

        {latestQuiz && quizChartData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-primary mb-1">Latest Quiz Result</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dominant framework:{' '}
              <span className="font-medium text-accent">
                {latestQuiz.dominantFramework.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              {' | '}
              {latestQuiz.completedAt instanceof Date
                ? latestQuiz.completedAt.toLocaleDateString()
                : new Date(latestQuiz.completedAt).toLocaleDateString()}
            </p>
            <div className="w-full">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    accessibilityLayer
                    data={quizChartData}
                    layout="vertical"
                    barSize={24}
                    barCategoryGap={8}
                    margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      type="number"
                      domain={[0, 'dataMax']}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={140}
                      interval={0}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                      stroke="hsl(var(--foreground))"
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                      labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                      formatter={(value: number, _name, props: any) => [
                        value,
                        props?.payload?.fullName ?? props?.payload?.name ?? 'Score',
                      ]}
                      labelFormatter={(_label, payload) =>
                        payload && payload[0] ? payload[0].payload.fullName : ''
                      }
                    />
                    <Bar
                      dataKey="score"
                      radius={[0, 4, 4, 0]}
                      fill="hsl(var(--primary))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}

        {!latestQuiz && (
          <p className="text-sm text-muted-foreground italic">
            No quiz results yet. Take the Ethical Framework Quiz to see your alignment!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
