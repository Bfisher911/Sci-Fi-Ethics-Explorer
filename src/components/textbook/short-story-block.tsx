'use client';

import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ChapterSection, ContentBlock } from '@/types/textbook';
import { ProseSection } from './prose-section';

interface ShortStoryBlockProps {
  section: ChapterSection;
  chapterTitle: string;
}

/**
 * Inside a short story, lines that begin with a quotation mark are
 * dialogue — NOT pull quotes. Re-coerce any 'quote' blocks back to
 * 'paragraph' blocks (preserving the attribution as part of the prose
 * if present), so dialogue tags render inline like normal narration.
 *
 * Pull-quote treatment is reserved for the essay sections of the
 * chapter where quoted lines really are citations.
 */
function flattenQuotesToProse(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((b) => {
    if (b.type !== 'quote') return b;
    // Reassemble the original prose. The extractor split inline dialogue
    // into { text, attribution } when the paragraph happened to start
    // with a quote mark, so stitch them back together with the leading
    // quote intact.
    const opening = b.text.startsWith('"') ? '' : '"';
    const closing = b.text.endsWith('"') ? '' : '"';
    const merged =
      `${opening}${b.text}${closing}` +
      (b.attribution ? ` ${b.attribution}` : '');
    return { type: 'paragraph', text: merged };
  });
}

/**
 * Visually distinct treatment for the chapter's original short story.
 * Subtle background tint, distinct typography, narrower reading column.
 */
export function ShortStoryBlock({ section, chapterTitle }: ShortStoryBlockProps) {
  const proseSection = useMemo<ChapterSection>(
    () => ({ ...section, blocks: flattenQuotesToProse(section.blocks) }),
    [section]
  );

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
        <ProseSection section={proseSection} narrow />
      </article>
      <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-primary/60 to-transparent mt-12" />
    </section>
  );
}
