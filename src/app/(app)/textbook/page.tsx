'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getTextbookProgress } from '@/app/actions/textbook';
import { bookMeta, chapters } from '@/data/textbook';
import { TextbookHero } from '@/components/textbook/textbook-hero';
import { ChapterToc } from '@/components/textbook/chapter-toc';
import type { TextbookProgress } from '@/types/textbook';

export default function TextbookLandingPage() {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<TextbookProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }
    (async () => {
      const res = await getTextbookProgress(user.uid);
      if (!cancelled && res.success) setProgress(res.data);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  // Resume slug: prefer last read; fallback to first chapter
  const resumeSlug = progress?.lastChapterRead || chapters[0]?.slug;

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-6xl space-y-10">
      {loading ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : (
        <TextbookHero meta={bookMeta} progress={progress} resumeSlug={resumeSlug} />
      )}

      <section aria-labelledby="toc-heading">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-headline">
              Twelve chapters · {bookMeta.totalWordCount.toLocaleString()} words
            </p>
            <h2
              id="toc-heading"
              className="font-headline text-2xl md:text-3xl font-semibold mt-1"
            >
              Table of Contents
            </h2>
          </div>
          {progress && (
            <Badge variant="outline" className="hidden sm:inline-flex">
              <Sparkles className="h-3 w-3 mr-1.5" />
              {progress.chapterQuizzesPassed.length} / {chapters.length} certified
            </Badge>
          )}
        </div>
        <ChapterToc chapters={chapters} progress={progress} />
      </section>

      {/* Final exam invite */}
      <section className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-card via-primary/5 to-card border-primary/30">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="shrink-0 rounded-full bg-primary/15 p-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline text-xl md:text-2xl font-semibold text-foreground">
                Cumulative Final Exam
              </h3>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Once every chapter quiz is passed, the final exam unlocks — pass it
                to earn the Master Certificate.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/textbook/final-exam">
                See requirements <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="text-center text-xs text-muted-foreground pb-6">
        <p>{bookMeta.copyright}. All rights reserved.</p>
      </footer>
    </div>
  );
}
