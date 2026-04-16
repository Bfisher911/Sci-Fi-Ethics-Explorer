'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Award,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Chapter } from '@/types/textbook';

interface ChapterCardProps {
  chapter: Chapter;
  state?: 'unread' | 'reading' | 'read' | 'quiz-passed' | 'certified';
  /** Show as the next chapter to resume. */
  isNext?: boolean;
}

const STATE_LABEL: Record<NonNullable<ChapterCardProps['state']>, string> = {
  unread: 'Start',
  reading: 'Continue',
  read: 'Take quiz',
  'quiz-passed': 'Review',
  certified: 'Certified',
};

const STATE_ICON = {
  unread: BookOpen,
  reading: BookOpen,
  read: CheckCircle2,
  'quiz-passed': Award,
  certified: Award,
} as const;

export function ChapterCard({ chapter, state = 'unread', isNext }: ChapterCardProps) {
  const Icon = STATE_ICON[state];
  const certified = state === 'certified';

  return (
    <Card
      className={cn(
        'group relative overflow-hidden bg-card/80 backdrop-blur-sm transition-all',
        certified
          ? 'border-chart-2/40 hover:border-chart-2/70'
          : 'border-border hover:border-primary/50',
        isNext && 'ring-2 ring-primary/40'
      )}
    >
      {isNext && (
        <Badge
          variant="default"
          className="absolute right-3 top-3 bg-primary/90 text-xs uppercase tracking-wider"
        >
          Up next
        </Badge>
      )}

      <Link
        href={`/textbook/chapters/${chapter.slug}`}
        className="block p-5 md:p-6 focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded-lg w-12 h-12 font-headline font-bold text-lg',
              certified
                ? 'bg-chart-2/15 text-chart-2'
                : 'bg-primary/10 text-primary'
            )}
            aria-hidden="true"
          >
            {String(chapter.number).padStart(2, '0')}
          </div>

          <CardContent className="p-0 flex-1 min-w-0">
            <h3 className="font-headline text-lg md:text-xl font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
              {chapter.title}
            </h3>
            {chapter.subtitle && (
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                {chapter.subtitle}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {chapter.estimatedReadingMinutes} min read
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span>Story: {chapter.shortStoryTitle}</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Badge
                variant={certified ? 'default' : 'outline'}
                className={cn(
                  'text-xs',
                  certified
                    ? 'bg-chart-2/20 text-chart-2 border-chart-2/40'
                    : state === 'quiz-passed'
                    ? 'border-primary/40 text-primary'
                    : ''
                )}
              >
                <Icon className="h-3 w-3 mr-1" />
                {certified ? 'Certificate earned' : STATE_LABEL[state]}
              </Badge>
              <ArrowRight className="h-4 w-4 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
