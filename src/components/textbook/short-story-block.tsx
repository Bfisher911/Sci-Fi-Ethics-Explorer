'use client';

import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ChapterSection } from '@/types/textbook';
import { ProseSection } from './prose-section';

interface ShortStoryBlockProps {
  section: ChapterSection;
  chapterTitle: string;
}

/**
 * Visually distinct treatment for the chapter's original short story.
 * Subtle background tint, distinct typography, narrower reading column.
 */
export function ShortStoryBlock({ section, chapterTitle }: ShortStoryBlockProps) {
  return (
    <section
      className="relative my-16 -mx-4 md:-mx-8 px-4 md:px-12 py-12 md:py-16 bg-gradient-to-b from-card/40 via-card/60 to-card/40 border-y border-primary/20"
      aria-labelledby={`story-${section.id}`}
    >
      <div className="mx-auto max-w-2xl mb-8">
        <Badge
          variant="outline"
          className="mb-3 border-primary/40 text-primary uppercase tracking-wider text-[10px]"
        >
          <BookOpen className="h-3 w-3 mr-1" /> Original Short Story
        </Badge>
        <h2
          id={`story-${section.id}`}
          className="font-headline text-3xl md:text-5xl font-bold text-foreground leading-tight"
        >
          {section.heading}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground italic">
          A story for {chapterTitle}
        </p>
        <div className="mt-6 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </div>
      <article className="story-prose">
        <ProseSection section={section} narrow />
      </article>
      <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-primary/60 to-transparent mt-12" />
    </section>
  );
}
