'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getContributions } from '@/app/actions/contributions';
import { ContributionCard } from './contribution-card';
import type { CommunityContribution, ContributionType } from '@/types';

interface ContributionsFeedProps {
  communityId: string;
}

type FilterValue = 'all' | ContributionType;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'analysis', label: 'Analyses' },
  { value: 'quiz_result', label: 'Quizzes' },
  { value: 'perspective_comparison', label: 'Comparisons' },
  { value: 'dilemma', label: 'Dilemmas' },
  { value: 'debate', label: 'Debates' },
  { value: 'story', label: 'Stories' },
];

/**
 * Feed of contributions shared within a community.
 * Supports filtering by contribution type.
 */
export function ContributionsFeed({ communityId }: ContributionsFeedProps) {
  const [contributions, setContributions] = useState<CommunityContribution[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      setLoading(true);
      const result = await getContributions(communityId);
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
  }, [communityId]);

  const visible =
    filter === 'all'
      ? contributions
      : contributions.filter((c) => c.type === filter);

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
              No contributions yet. Share an analysis, quiz result, dilemma,
              debate, or story with this community to get the conversation
              started.
            </p>
            <Button asChild>
              <Link href="/analyzer">Analyze a Scenario</Link>
            </Button>
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
