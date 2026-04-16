'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  Brain,
  Loader2,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  getTextbookProgress,
  markChapterRead,
} from '@/app/actions/textbook';
import type { Chapter } from '@/types/textbook';
import { cn } from '@/lib/utils';

interface ChapterProgressBannerProps {
  chapter: Chapter;
}

/**
 * Sticky bottom progress bar shown on chapter reading pages.
 * Tracks scroll % through the chapter and surfaces "Mark as read" + "Take quiz".
 */
export function ChapterProgressBanner({ chapter }: ChapterProgressBannerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scrollPct, setScrollPct] = useState(0);
  const [isRead, setIsRead] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [marking, setMarking] = useState(false);

  // Hydrate progress
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const res = await getTextbookProgress(user.uid);
      if (!cancelled && res.success) {
        setIsRead(res.data.chaptersRead.includes(chapter.slug));
        setIsPassed(res.data.chapterQuizzesPassed.includes(chapter.slug));
        setIsCertified(Boolean(res.data.chapterCertificateIds?.[chapter.slug]));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, chapter.slug]);

  // Track scroll % through document
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const scrolled = total > 0 ? (doc.scrollTop / total) * 100 : 0;
      setScrollPct(Math.min(100, Math.max(0, scrolled)));
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-mark as read when scroll passes 90%
  useEffect(() => {
    if (!user || isRead || marking) return;
    if (scrollPct >= 90) {
      setMarking(true);
      markChapterRead(user.uid, chapter.slug).then((res) => {
        setMarking(false);
        if (res.success) setIsRead(true);
      });
    }
  }, [scrollPct, user, isRead, marking, chapter.slug]);

  async function handleMarkRead() {
    if (!user) return;
    setMarking(true);
    const res = await markChapterRead(user.uid, chapter.slug);
    setMarking(false);
    if (res.success) {
      setIsRead(true);
      toast({ title: 'Marked as read', description: 'Great work — try the quiz next.' });
    } else {
      toast({ title: 'Could not save', description: res.error, variant: 'destructive' });
    }
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-background/85 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
          <span className="font-headline">
            Chapter {chapter.number} · {Math.round(scrollPct)}% read
          </span>
          {isCertified && (
            <Badge variant="default" className="bg-chart-2/20 text-chart-2 border-chart-2/40">
              <Award className="h-3 w-3 mr-1" /> Certificate earned
            </Badge>
          )}
          {!isCertified && isPassed && (
            <Badge variant="default" className="text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Quiz passed
            </Badge>
          )}
        </div>
        <Progress
          value={scrollPct}
          className={cn('h-1.5', scrollPct >= 90 && 'bg-chart-2/30')}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {!user ? (
              <span>
                <Link href={`/login?next=/textbook/chapters/${chapter.slug}`} className="text-primary hover:underline">
                  Sign in
                </Link>{' '}
                to track progress and earn certificates.
              </span>
            ) : isRead ? (
              <span className="flex items-center gap-1.5 text-chart-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Read
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkRead}
                disabled={marking}
                className="h-7 px-2 text-xs"
              >
                {marking ? (
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 mr-1.5" />
                )}
                Mark as read
              </Button>
            )}
          </div>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
            <Link href={`/textbook/chapters/${chapter.slug}/quiz`}>
              <Brain className="h-3.5 w-3.5 mr-1.5" />
              {isPassed ? 'Retake Quiz' : 'Take Knowledge Check'}
              <ArrowRight className="h-3 w-3 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
