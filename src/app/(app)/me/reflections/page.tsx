'use client';

/**
 * /me/reflections — full archive of every free-text reflection the
 * signed-in user has written across the textbook. The /me hub teases
 * the most recent few; this page is the long view.
 *
 * Grouped by chapter, newest-first within each chapter, with a
 * "Continue this chapter" link back into the reader. Empty state nudges
 * the user toward the first chapter.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, NotebookText } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  getAllUserReflections,
  type ReflectionEntry,
} from '@/app/actions/textbook';
import { chapters as ALL_CHAPTERS } from '@/data/textbook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty/empty-state';

function formatDate(d?: Date) {
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

interface ChapterGroup {
  slug: string;
  chapterNumber?: number;
  chapterTitle: string;
  entries: ReflectionEntry[];
}

function groupByChapter(entries: ReflectionEntry[]): ChapterGroup[] {
  const map = new Map<string, ChapterGroup>();
  for (const e of entries) {
    if (!map.has(e.slug)) {
      const ch = ALL_CHAPTERS.find((c) => c.slug === e.slug);
      map.set(e.slug, {
        slug: e.slug,
        chapterNumber: ch?.number,
        chapterTitle: ch?.title ?? e.slug.replace(/^\d+-/, '').replace(/-/g, ' '),
        entries: [],
      });
    }
    map.get(e.slug)!.entries.push(e);
  }
  // Sort groups by chapter number ascending (so reading the page top-down
  // mirrors the textbook order). Within each chapter, newest reflection first.
  const groups = Array.from(map.values());
  groups.sort((a, b) => (a.chapterNumber ?? 999) - (b.chapterNumber ?? 999));
  for (const g of groups) {
    g.entries.sort(
      (a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0),
    );
  }
  return groups;
}

export default function ReflectionsArchivePage() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<ReflectionEntry[] | null>(null);

  useEffect(() => {
    if (!user) {
      if (!loading) setEntries([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await getAllUserReflections(user.uid, { limit: 200 });
      if (cancelled) return;
      setEntries(res.success ? res.data : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const groups = useMemo(
    () => (entries ? groupByChapter(entries) : []),
    [entries],
  );

  if (loading || entries === null) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <EmptyState
          icon={NotebookText}
          title="Sign in to see your reflections"
          blurb="Reflections are private to your account. Sign in to read everything you've written across the textbook."
          action={
            <Button asChild>
              <Link href="/login?next=/me/reflections">Sign in</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <header className="mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
            Your reflections
          </h1>
          <p className="mt-2 text-muted-foreground">
            Every free-response you've written across the textbook lives here.
          </p>
        </header>
        <EmptyState
          icon={NotebookText}
          title="You haven't written any reflections yet"
          blurb="Each chapter has discussion prompts you can answer in your own words. Your responses autosave and show up here for easy review."
          action={
            <Button asChild>
              <Link
                href={`/textbook/chapters/${
                  ALL_CHAPTERS[0]?.slug ?? '01-architecture-of-moral-reasoning'
                }`}
              >
                Open Chapter 1
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const totalCount = entries.length;
  const chapterCount = groups.length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Archive
        </div>
        <h1 className="mt-1 font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Your reflections
        </h1>
        <p className="mt-2 text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'reflection' : 'reflections'} across{' '}
          {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}.
        </p>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/me">
              <ArrowRight className="mr-1.5 h-3.5 w-3.5 rotate-180" />
              Back to my hub
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-8">
        {groups.map((g) => (
          <section
            key={g.slug}
            aria-labelledby={`chapter-${g.slug}-heading`}
          >
            <div className="mb-3 flex flex-wrap items-baseline gap-3">
              <h2
                id={`chapter-${g.slug}-heading`}
                className="font-headline text-xl font-semibold tracking-tight"
              >
                {g.chapterNumber !== undefined && (
                  <span className="text-muted-foreground">
                    Ch. {String(g.chapterNumber).padStart(2, '0')} ·{' '}
                  </span>
                )}
                {g.chapterTitle}
              </h2>
              <Badge variant="outline" className="text-[10px]">
                {g.entries.length}{' '}
                {g.entries.length === 1 ? 'reflection' : 'reflections'}
              </Badge>
              <span className="flex-1" />
              <Link
                href={`/textbook/chapters/${g.slug}`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Continue chapter <ArrowRight className="ml-0.5 inline h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {g.entries.map((entry) => (
                <Card key={`${entry.slug}_${entry.promptId}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      Prompt: {entry.promptId.replace(/-/g, ' ')}
                      {entry.updatedAt && (
                        <span className="ml-2 text-[11px] font-normal opacity-70">
                          · {formatDate(entry.updatedAt)}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {entry.response}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-lg border bg-card/50 p-6 text-center">
        <BookOpen className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Want to add another reflection? Open any chapter and answer one of
          its discussion prompts.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/textbook">Browse all chapters</Link>
        </Button>
      </div>
    </div>
  );
}
