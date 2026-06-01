'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Chapter } from '@/types/textbook';

interface ChapterCompletionBannerProps {
  chapter: Chapter;
  next?: Chapter;
}

/**
 * Post-quiz success banner. Chapter quizzes no longer issue a certificate —
 * they earn a badge / activity report (shown by the quiz engine's evidence
 * panel) and advance the single textbook MILESTONE certificate. This banner
 * confirms the pass and points to the next chapter / final exam.
 */
export function ChapterCompletionBanner({
  chapter,
  next,
}: ChapterCompletionBannerProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-chart-2/40 max-w-3xl mx-auto">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="shrink-0 rounded-full bg-chart-2/15 p-4 mx-auto md:mx-0">
            <CheckCircle2 className="h-10 w-10 text-chart-2" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <Badge
              variant="default"
              className="bg-chart-2/20 text-chart-2 border-chart-2/40 mb-2"
            >
              <Sparkles className="h-3 w-3 mr-1" /> Chapter quiz passed
            </Badge>
            <h3 className="font-headline text-xl md:text-2xl font-semibold text-foreground">
              Chapter {chapter.number} complete
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {chapter.title} — your activity evidence is saved to your dashboard.
              Pass every chapter and the final exam to earn the Textbook Master
              Certificate.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            {next ? (
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link href={`/textbook/chapters/${next.slug}`}>
                  Continue to Ch. {next.number}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link href="/textbook/final-exam">
                  Take the Final Exam
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
