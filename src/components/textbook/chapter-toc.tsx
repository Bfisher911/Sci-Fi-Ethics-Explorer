'use client';

import { ChapterCard } from './chapter-card';
import type { Chapter, TextbookProgress } from '@/types/textbook';

interface ChapterTocProps {
  chapters: Chapter[];
  progress?: TextbookProgress | null;
}

function chapterState(
  chapter: Chapter,
  progress: TextbookProgress | null | undefined
): 'unread' | 'reading' | 'read' | 'quiz-passed' | 'certified' {
  if (!progress) return 'unread';
  const certified = Boolean(progress.chapterCertificateIds?.[chapter.slug]);
  if (certified) return 'certified';
  const passed = progress.chapterQuizzesPassed.includes(chapter.slug);
  if (passed) return 'quiz-passed';
  const read = progress.chaptersRead.includes(chapter.slug);
  if (read) return 'read';
  if (progress.lastChapterRead === chapter.slug) return 'reading';
  return 'unread';
}

/**
 * Determine which chapter is the user's "next" — the first unread chapter,
 * or the chapter whose quiz they haven't passed yet, or chapter 1 by default.
 */
function nextChapterSlug(
  chapters: Chapter[],
  progress: TextbookProgress | null | undefined
): string {
  if (!progress) return chapters[0]?.slug || '';
  if (progress.lastChapterRead) {
    const last = chapters.findIndex((c) => c.slug === progress.lastChapterRead);
    // If the user has passed the last chapter's quiz, advance to next
    if (last >= 0 && progress.chapterQuizzesPassed.includes(progress.lastChapterRead)) {
      return chapters[Math.min(last + 1, chapters.length - 1)]?.slug || '';
    }
    if (last >= 0) return chapters[last].slug;
  }
  const firstUnread = chapters.find(
    (c) => !progress.chapterQuizzesPassed.includes(c.slug)
  );
  return firstUnread?.slug || chapters[0]?.slug || '';
}

export function ChapterToc({ chapters, progress }: ChapterTocProps) {
  const upNext = nextChapterSlug(chapters, progress);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      {chapters.map((c) => (
        <ChapterCard
          key={c.slug}
          chapter={c}
          state={chapterState(c, progress)}
          isNext={progress != null && c.slug === upNext}
        />
      ))}
    </div>
  );
}
