'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { getContributions } from '@/app/actions/contributions';
import { ContributionCard } from './contribution-card';
import type { CommunityContribution, ContributionType } from '@/types';

interface ContributionsFeedProps {
  communityId: string;
}

type FilterValue = 'all' | ContributionType;
type DateFilter = 'all' | '24h' | '7d' | '30d';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'analysis', label: 'Analyses' },
  { value: 'quiz_result', label: 'Quizzes' },
  { value: 'perspective_comparison', label: 'Comparisons' },
  { value: 'dilemma', label: 'Dilemmas' },
  { value: 'debate', label: 'Debates' },
  { value: 'story', label: 'Stories' },
  { value: 'story_completion', label: 'Story completions' },
  { value: 'reflection', label: 'Reflections' },
  { value: 'highlight', label: 'Highlights' },
  { value: 'certificate', label: 'Certificates' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'framework_result', label: 'Framework results' },
  { value: 'media_reflection', label: 'Media reflections' },
  { value: 'weekly_dilemma', label: 'Weekly dilemmas' },
  { value: 'ethics_report', label: 'Ethics reports' },
];

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

function dateCutoff(f: DateFilter): number | null {
  const DAY = 86_400_000;
  switch (f) {
    case '24h':
      return Date.now() - DAY;
    case '7d':
      return Date.now() - 7 * DAY;
    case '30d':
      return Date.now() - 30 * DAY;
    default:
      return null;
  }
}

/**
 * Feed of contributions (member submissions) shared within a community.
 * Supports filtering by contribution type, by student/member, and by date —
 * the surface a community owner/instructor uses to review what members have
 * submitted. Each card links to the full per-submission detail page.
 */
export function ContributionsFeed({ communityId }: ContributionsFeedProps) {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<CommunityContribution[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      setLoading(true);
      // requesterId gates the read server-side to community members.
      const result = await getContributions(communityId, {
        requesterId: user?.uid,
      });
      if (cancelled) return;
      if (result.success) {
        setContributions(result.data);
      } else {
        setContributions([]);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [communityId, user?.uid]);

  // Unique contributors for the student filter, sorted by display name.
  const contributors = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of contributions) {
      if (!map.has(c.contributorId)) {
        map.set(c.contributorId, c.contributorName || 'Anonymous');
      }
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contributions]);

  const visible = useMemo(() => {
    const cutoff = dateCutoff(dateFilter);
    return contributions.filter((c) => {
      if (filter !== 'all' && c.type !== filter) return false;
      if (studentFilter !== 'all' && c.contributorId !== studentFilter) {
        return false;
      }
      if (cutoff !== null) {
        const t = c.createdAt instanceof Date ? c.createdAt.getTime() : 0;
        if (t < cutoff) return false;
      }
      return true;
    });
  }, [contributions, filter, studentFilter, dateFilter]);

  return (
    <div className="space-y-4">
      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card/60 text-muted-foreground border-border hover:bg-card hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Student + date filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={studentFilter} onValueChange={setStudentFilter}>
          <SelectTrigger className="h-8 w-[200px] text-xs">
            <SelectValue placeholder="All members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {contributors.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={dateFilter}
          onValueChange={(v) => setDateFilter(v as DateFilter)}
        >
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="All dates" />
          </SelectTrigger>
          <SelectContent>
            {DATE_FILTERS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filter !== 'all' || studentFilter !== 'all' || dateFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setFilter('all');
              setStudentFilter('all');
              setDateFilter('all');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-card/80 backdrop-blur-sm p-4 space-y-3"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="py-12 text-center space-y-4">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground max-w-md mx-auto">
              {contributions.length === 0
                ? 'No submissions yet. Finish an activity — a quiz, story, reflection, or analysis — and submit it to this community to get the conversation started.'
                : 'No submissions match these filters.'}
            </p>
            {contributions.length === 0 && (
              <Button asChild>
                <Link href="/analyzer">Analyze a Scenario</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((c) => (
            <ContributionCard key={c.id} contribution={c} />
          ))}
        </div>
      )}
    </div>
  );
}
