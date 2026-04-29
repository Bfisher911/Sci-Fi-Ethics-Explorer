'use client';

/**
 * /me/highlights — archive of every passage the user has saved while
 * reading the textbook, plus any notes attached.
 *
 * Grouped by chapter, newest-first. Each highlight shows the quoted
 * text in a styled blockquote with an optional note below; a "Continue
 * chapter" link sends the user back into the reader, and a small
 * delete button lets them prune anything they no longer want.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Highlighter, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  getUserHighlights,
  deleteHighlight,
  type ChapterHighlight,
} from '@/app/actions/textbook';
import { chapters as ALL_CHAPTERS } from '@/data/textbook';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty/empty-state';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { useToast } from '@/hooks/use-toast';

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
  highlights: ChapterHighlight[];
}

function groupByChapter(items: ChapterHighlight[]): ChapterGroup[] {
  const map = new Map<string, ChapterGroup>();
  for (const h of items) {
    if (!map.has(h.slug)) {
      const ch = ALL_CHAPTERS.find((c) => c.slug === h.slug);
      map.set(h.slug, {
        slug: h.slug,
        chapterNumber: ch?.number,
        chapterTitle: ch?.title ?? h.slug.replace(/^\d+-/, '').replace(/-/g, ' '),
        highlights: [],
      });
    }
    map.get(h.slug)!.highlights.push(h);
  }
  const groups = Array.from(map.values());
  groups.sort((a, b) => (a.chapterNumber ?? 999) - (b.chapterNumber ?? 999));
  for (const g of groups) {
    g.highlights.sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
  }
  return groups;
}

export default function HighlightsArchivePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ChapterHighlight[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      if (!loading) setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await getUserHighlights(user.uid, { limit: 200 });
      if (cancelled) return;
      setItems(res.success ? res.data : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const groups = useMemo(() => (items ? groupByChapter(items) : []), [items]);

  async function handleDelete(id: string) {
    if (!user) return;
    setDeletingId(id);
    const res = await deleteHighlight(user.uid, id);
    setDeletingId(null);
    if (res.success) {
      setItems((prev) => (prev || []).filter((h) => h.id !== id));
      toast({ title: 'Highlight removed.' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Could not delete',
        description: res.error,
      });
    }
  }

  if (loading || items === null) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <EmptyState
          icon={Highlighter}
          title="Sign in to see your highlights"
          blurb="Your highlights are private to your account. Sign in to read everything you've saved across the textbook."
          action={
            <Button asChild>
              <Link href="/login?next=/me/highlights">Sign in</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <header className="mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
            Your highlights
          </h1>
          <p className="mt-2 text-muted-foreground">
            Passages you save while reading land here.
          </p>
        </header>
        <EmptyState
          icon={Highlighter}
          title="No highlights yet"
          blurb="Open any chapter, select a sentence or paragraph, and a 'Save quote' toolbar appears. Add an optional note to remember why it mattered."
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

  const totalCount = items.length;
  const chapterCount = groups.length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Archive
        </div>
        <h1 className="mt-1 font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Your highlights
        </h1>
        <p className="mt-2 text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'passage' : 'passages'} saved across{' '}
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
                {g.highlights.length}{' '}
                {g.highlights.length === 1 ? 'quote' : 'quotes'}
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
              {g.highlights.map((h) => (
                <Card key={h.id}>
                  <CardContent className="pt-5">
                    <blockquote className="border-l-4 border-primary/60 pl-4 italic text-foreground/90">
                      "{h.text}"
                    </blockquote>
                    {h.note && (
                      <div className="mt-3 rounded-md bg-muted/40 p-3 text-sm leading-relaxed text-foreground/85">
                        <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-accent">
                          Note
                        </span>
                        {h.note}
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(h.createdAt)}</span>
                      <ConfirmAction
                        trigger={
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                            disabled={deletingId === h.id}
                          >
                            {deletingId === h.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="mr-1 h-3 w-3" />
                            )}
                            Remove
                          </Button>
                        }
                        title="Remove this highlight?"
                        description="The saved passage and any note will be deleted. You can always re-highlight it later."
                        confirmLabel="Remove"
                        onConfirm={() => handleDelete(h.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
