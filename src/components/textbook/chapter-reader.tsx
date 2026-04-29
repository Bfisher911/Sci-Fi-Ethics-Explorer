'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ChevronLeft, Clock, Target, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Chapter } from '@/types/textbook';
import { ProseSection } from './prose-section';
import { PrimerCacheSection } from './primer-cache';
import { ShortStoryBlock } from './short-story-block';
import { DiscussionSection } from './discussion-section';
import { DiscussionQuestions } from './discussion-questions';
import { ChapterNavFooter } from './chapter-nav-footer';
import { ChapterProgressBanner } from './chapter-progress-banner';
import { HighlightToolbar } from './highlight-toolbar';
import { ReaderFocusToggle } from './reader-focus-toggle';

// Lazy-load PromiseVsReality. It only renders for chapters whose
// section list includes a `promise-vs-reality` entry, sits well below
// the fold, and pulls in the Slider primitive plus the textbook
// server-action client bundle. Defer until the section scrolls in.
const PromiseVsReality = dynamic(
  () =>
    import('./promise-vs-reality').then((m) => m.PromiseVsReality),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 w-full rounded-lg bg-muted/20 animate-pulse" />
    ),
  },
);

interface ChapterReaderProps {
  chapter: Chapter;
  prev?: Chapter;
  next?: Chapter;
}

/**
 * Top-level chapter reader. Renders the chapter hero, all sections in
 * narrative order, the prev/next nav, and the sticky progress banner.
 */
export function ChapterReader({ chapter, prev, next }: ChapterReaderProps) {
  return (
    <article
      className="relative pb-24"
      // Marks this subtree as the only place text selection should
      // surface the highlight toolbar. Components outside this article
      // (sidebar, nav) won't trigger it.
      data-highlightable="true"
    >
      {/* Hero */}
      <header className="relative overflow-hidden rounded-2xl border border-primary/20 mb-10">
        <div className="relative aspect-[3/1] md:aspect-[5/2] w-full">
          <Image
            src={chapter.heroImage}
            alt={chapter.heroImageAlt}
            fill
            priority
            sizes="(min-width: 768px) 100vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-card/20" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="mb-3 flex w-full items-center justify-between gap-2">
            <Link
              href="/textbook"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <ChevronLeft className="h-3 w-3" /> Back to Textbook
            </Link>
            <ReaderFocusToggle />
          </div>
          <Badge
            variant="outline"
            className="self-start mb-3 border-primary/40 text-primary uppercase tracking-wider text-[10px]"
          >
            Chapter {chapter.number}
          </Badge>
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-3xl">
            {chapter.title}
          </h1>
          {chapter.subtitle && (
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-3xl">
              {chapter.subtitle}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {chapter.estimatedReadingMinutes} min
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> Story: {chapter.shortStoryTitle}
            </span>
          </div>
        </div>
      </header>

      {/* Learning goals */}
      <Card className="bg-card/60 backdrop-blur-sm border-primary/20 mb-12 max-w-3xl mx-auto">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-md bg-primary/10 text-primary p-2">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-headline">
                In this chapter you will
              </p>
              <ul className="mt-2 space-y-1 text-sm md:text-base text-foreground/90">
                {chapter.learningGoals.map((g, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary mt-1">▸</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-2">
        {chapter.sections.map((section) => {
          switch (section.kind) {
            case 'intro':
              return (
                <section key={section.id} aria-label="Chapter essay">
                  <ProseSection section={section} />
                </section>
              );
            case 'prose':
              return (
                <section key={section.id}>
                  {section.heading && (
                    <h2 className="font-headline text-2xl md:text-3xl font-semibold text-primary text-center mt-12 mb-6 max-w-3xl mx-auto">
                      {section.heading}
                    </h2>
                  )}
                  <ProseSection section={section} />
                </section>
              );
            case 'primer-cache':
              return <PrimerCacheSection key={section.id} section={section} />;
            case 'short-story':
              return (
                <ShortStoryBlock
                  key={section.id}
                  section={section}
                  chapterTitle={chapter.title}
                />
              );
            case 'discussion':
            case 'counterfactual':
            case 'takeaways':
              return <DiscussionSection key={section.id} section={section} />;
            case 'discussion-questions':
              return (
                <DiscussionQuestions
                  key={section.id}
                  section={section}
                  chapterSlug={chapter.slug}
                />
              );
            case 'promise-vs-reality':
              return (
                <PromiseVsReality
                  key={section.id}
                  section={section}
                  chapterSlug={chapter.slug}
                />
              );
            default:
              return null;
          }
        })}
      </div>

      <ChapterNavFooter prev={prev} next={next} />
      <ChapterProgressBanner chapter={chapter} />
      {/* Floating toolbar that appears on text selection. Mounted as a
          sibling of the article so its fixed position is computed from
          the viewport, not the article. */}
      <HighlightToolbar chapterSlug={chapter.slug} />
    </article>
  );
}
