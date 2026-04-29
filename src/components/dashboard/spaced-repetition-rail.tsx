'use client';

/**
 * Spaced repetition rail — a small dashboard surface that resurfaces
 * chapter quizzes the user passed more than ~7 days ago, ordered by
 * how long it's been (oldest first). Encourages periodic review,
 * which is the core mechanism behind the spacing effect in
 * memory research.
 *
 * Light implementation:
 *   - Reads the user's best attempts via getUserBestAttempts.
 *   - Filters to passing book-chapter attempts older than 7 days.
 *   - Renders the top 3 as little "Review" cards linking back to the
 *     chapter quiz. The grade-out is intentional — we don't want to
 *     overwhelm with the full backlog.
 *
 * NOT a full SRS (no SM-2 intervals, no per-card scheduling). That'd
 * need a dedicated review collection. The spacing effect is real even
 * with simple "show me old stuff" rails — this is the 80% lift.
 *
 * Returns null when there's nothing eligible (no passes yet, or all
 * passes are recent), so the dashboard doesn't render an awkward
 * empty card.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, History, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getUserBestAttempts } from '@/app/actions/quizzes';
import { chapters as ALL_CHAPTERS } from '@/data/textbook';
import type { QuizAttempt } from '@/types';

const STALE_DAYS = 7;
const MAX_TILES = 3;

interface ReviewCandidate {
  slug: string;
  number: number;
  title: string;
  daysAgo: number;
  bestScore: number;
}

function daysSince(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Heuristic: a quiz attempt is for a textbook chapter when its
 * subjectType is `book-chapter` (which we know because we extended the
 * QuizSubjectType union earlier). The subjectId is the quiz id, which
 * encodes the chapter slug as `book-chapter-{slug}`.
 */
function chapterSlugFromAttempt(a: QuizAttempt): string | null {
  if (a.subjectType !== 'book-chapter') return null;
  const m = a.subjectId.match(/^book-chapter-(.+)$/);
  return m ? m[1] : null;
}

export function SpacedRepetitionRail(): JSX.Element | null {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const res = await getUserBestAttempts(user.uid);
      if (cancelled) return;
      setAttempts(res.success ? res.data : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const candidates = useMemo<ReviewCandidate[]>(() => {
    if (!attempts) return [];
    const out: ReviewCandidate[] = [];
    for (const a of attempts) {
      if (!a.passed) continue;
      const slug = chapterSlugFromAttempt(a);
      if (!slug) continue;
      const completedAt =
        a.completedAt instanceof Date ? a.completedAt : new Date(a.completedAt as unknown as string);
      if (Number.isNaN(completedAt.getTime())) continue;
      const days = daysSince(completedAt);
      if (days < STALE_DAYS) continue;
      const ch = ALL_CHAPTERS.find((c) => c.slug === slug);
      if (!ch) continue;
      out.push({
        slug,
        number: ch.number,
        title: ch.title,
        daysAgo: days,
        bestScore: Math.round(a.scorePercent),
      });
    }
    out.sort((a, b) => b.daysAgo - a.daysAgo);
    return out.slice(0, MAX_TILES);
  }, [attempts]);

  if (!user || attempts === null || candidates.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-accent" />
            Refresh your learning
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Spaced repetition
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          You passed these {STALE_DAYS}+ days ago. Quick re-quiz now and you'll
          remember the material twice as long.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {candidates.map((c) => (
            <Link
              key={c.slug}
              href={`/textbook/chapters/${c.slug}/quiz`}
              className="group flex flex-col rounded-lg border border-border/40 bg-background/40 p-3 transition-colors hover:border-accent/50 hover:bg-accent/5"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Ch. {String(c.number).padStart(2, '0')}
              </div>
              <div className="mt-0.5 line-clamp-2 text-sm font-semibold text-foreground">
                {c.title}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {c.daysAgo}d ago · {c.bestScore}%
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-accent transition-transform group-hover:translate-x-0.5">
                  <RefreshCw className="h-3 w-3" />
                  Re-quiz
                </span>
              </div>
            </Link>
          ))}
        </div>
        {candidates.length === MAX_TILES && (
          <div className="mt-3 text-right">
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
              <Link href="/textbook">
                See all chapter quizzes <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
