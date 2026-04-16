'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookText, ArrowRight, Award, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getTextbookProgress } from '@/app/actions/textbook';
import { chapters } from '@/data/textbook';
import type { TextbookProgress } from '@/types/textbook';

/**
 * Compact textbook-progress card for the profile dashboard. Shows
 * chapters read, quizzes passed, certificates earned, and a Resume CTA.
 */
export function TextbookProgressCard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<TextbookProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await getTextbookProgress(user.uid);
      if (!cancelled && res.success) setProgress(res.data);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!user) return null;

  const total = chapters.length;
  const passed = progress?.chapterQuizzesPassed.length || 0;
  const certs = Object.keys(progress?.chapterCertificateIds || {}).length;
  const hasMaster = Boolean(progress?.masterCertificateId);
  const pct = Math.round((passed / total) * 100);
  const resumeSlug = progress?.lastChapterRead || chapters[0].slug;

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookText className="h-5 w-5 text-primary" />
          Textbook Progress
          {hasMaster && (
            <Badge variant="default" className="bg-chart-2/20 text-chart-2 border-chart-2/40 ml-auto">
              <Trophy className="h-3 w-3 mr-1" /> Master
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>The Ethics of Technology Through Science Fiction</span>
            <span>
              {passed} / {total} ({pct}%)
            </span>
          </div>
          <Progress value={pct} />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-headline text-xl font-bold text-foreground">
              {progress?.chaptersRead.length || 0}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Chapters read
            </p>
          </div>
          <div>
            <p className="font-headline text-xl font-bold text-foreground">{passed}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Quizzes passed
            </p>
          </div>
          <div>
            <p className="font-headline text-xl font-bold text-foreground">
              {certs + (hasMaster ? 1 : 0)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Certificates
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/textbook/chapters/${resumeSlug}`}>
              {progress?.lastChapterRead ? 'Resume' : 'Start'} reading
              <ArrowRight className="h-3 w-3 ml-1.5" />
            </Link>
          </Button>
          {passed >= total && !hasMaster && (
            <Button asChild size="sm" variant="outline">
              <Link href="/textbook/final-exam">
                <Trophy className="h-3 w-3 mr-1.5" /> Final exam
              </Link>
            </Button>
          )}
          {hasMaster && (
            <Button asChild size="sm" variant="outline">
              <Link href="/certificates">
                <Award className="h-3 w-3 mr-1.5" /> Certificates
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
