'use client';

import Link from 'next/link';
import { Award, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Chapter } from '@/types/textbook';

interface ChapterCompletionBannerProps {
  chapter: Chapter;
  certificateId?: string;
  certificateHash?: string;
  next?: Chapter;
}

/**
 * Surfaces the post-quiz success state with links to the certificate
 * and the next chapter.
 */
export function ChapterCompletionBanner({
  chapter,
  certificateHash,
  next,
}: ChapterCompletionBannerProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-chart-2/40 max-w-3xl mx-auto">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="shrink-0 rounded-full bg-chart-2/15 p-4 mx-auto md:mx-0">
            <Award className="h-10 w-10 text-chart-2" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <Badge variant="default" className="bg-chart-2/20 text-chart-2 border-chart-2/40 mb-2">
              <Sparkles className="h-3 w-3 mr-1" /> Chapter complete
            </Badge>
            <h3 className="font-headline text-xl md:text-2xl font-semibold text-foreground">
              You earned the Chapter {chapter.number} certificate
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {chapter.title}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            {certificateHash && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/textbook/certificate/${certificateHash}`}>
                  <Award className="h-4 w-4 mr-2" /> View certificate
                </Link>
              </Button>
            )}
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
