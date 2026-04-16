/**
 * Type definitions for the in-app textbook experience built from
 * Dr. Blaine Fisher's "The Ethics of Technology Through Science Fiction".
 *
 * Content is normalized at build time from a Word .docx into a tree of
 * `Chapter` objects living under `src/data/textbook/chapters/`. Each
 * chapter is rendered by the components under `src/components/textbook/`.
 */

import type { QuizQuestion } from '@/types';

/** Kinds of pedagogical sections that recur in every chapter of the book. */
export type SectionKind =
  | 'intro'
  | 'prose'
  | 'pull-quote'
  | 'callout'
  | 'primer-cache'
  | 'short-story'
  | 'discussion'
  | 'counterfactual'
  | 'takeaways'
  | 'discussion-questions'
  | 'promise-vs-reality';

/** A single addressable site entity that can be linked from chapter prose. */
export type EntityKind =
  | 'philosopher'
  | 'theory'
  | 'scifi-author'
  | 'scifi-media';

export interface EntityRef {
  /** The literal phrase as it appears in prose (case-insensitive matching). */
  name: string;
  kind: EntityKind;
  /** Slug of the existing entity page (e.g. `mary-shelley`, `utilitarianism`). */
  slug: string;
}

/** A pull quote with optional attribution. */
export interface QuoteBlock {
  type: 'quote';
  text: string;
  attribution?: string;
}

/** A plain-text paragraph block (most common). */
export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

/** An ordered or unordered list block. */
export interface ListBlock {
  type: 'list';
  ordered: boolean;
  items: string[];
}

/** A heading inside a section (sub-section). */
export interface HeadingBlock {
  type: 'heading';
  level: 3 | 4;
  text: string;
}

export type ContentBlock = ParagraphBlock | ListBlock | HeadingBlock | QuoteBlock;

/** A "Promise vs. Reality" item — a tech with a 0–5 self-assessment slider. */
export interface PromiseRealityItem {
  id: string;
  label: string;
  description?: string;
}

/** A reflection prompt the user can answer (and optionally save if signed in). */
export interface ReflectionItem {
  id: string;
  prompt: string;
}

/** A single addressable section of a chapter (intro, prose, story, etc.). */
export interface ChapterSection {
  id: string;
  kind: SectionKind;
  heading?: string;
  /** Optional one-line lede shown under the section heading. */
  lede?: string;
  /** The body content blocks that make up this section. */
  blocks: ContentBlock[];
  /** Pre-resolved entity references for autolinking. First-occurrence-per-section. */
  entityRefs?: EntityRef[];
  /** Used by `discussion-questions` and `discussion`: the prompts to surface. */
  prompts?: ReflectionItem[];
  /** Used by `promise-vs-reality`: the items to score. */
  scoringItems?: PromiseRealityItem[];
  /** Used by `primer-cache`: linked sci-fi works featured in this chapter. */
  primerEntries?: EntityRef[];
}

/** A complete chapter of the book. */
export interface Chapter {
  slug: string;
  number: number;
  title: string;
  /** A single-sentence framing line. */
  subtitle?: string;
  /** Marketing-style summary used on the TOC card. */
  summary: string;
  /** What the learner will take away. */
  learningGoals: string[];
  /** Estimated reading time in minutes (whole-chapter, including the short story). */
  estimatedReadingMinutes: number;
  /** Approximate body word count, used for analytics + metadata. */
  wordCount: number;
  /** Path under /public to the hero image. */
  heroImage: string;
  heroImageAlt: string;
  /** Sections in render order. The Knowledge Check is excluded — see `quizzes.ts`. */
  sections: ChapterSection[];
  /** Title of the chapter's original short story, surfaced in the TOC. */
  shortStoryTitle: string;
  /** IDs of related ethical theories — link to `/glossary/{id}`. */
  relatedFrameworkIds: string[];
  /** IDs of related philosophers — link to `/philosophers/{id}`. */
  relatedPhilosopherIds: string[];
  /** IDs of related sci-fi authors — link to `/scifi-authors/{id}`. */
  relatedAuthorIds: string[];
  /** IDs of related sci-fi works — link to `/scifi-media/{id}`. */
  relatedMediaIds: string[];
}

export interface BookMeta {
  title: string;
  subtitle?: string;
  author: string;
  copyright: string;
  totalChapters: number;
  totalWordCount: number;
  estimatedReadingHours: number;
  /** Path under /public to the hero image used on the landing page. */
  heroImage: string;
  /** A 2–3 sentence overview surfaced on the landing page. */
  overview: string;
  /** Bullet list of what learners will gain across the whole book. */
  learnerOutcomes: string[];
}

/** Per-user progress across the textbook. Stored in Firestore. */
export interface TextbookProgress {
  userId: string;
  chaptersRead: string[];
  chapterQuizzesPassed: string[];
  /** Map of chapter slug -> certificate doc id. */
  chapterCertificateIds: Record<string, string>;
  finalExamPassed: boolean;
  masterCertificateId?: string;
  /** The slug of the most recently opened chapter, used for "Resume". */
  lastChapterRead?: string;
  updatedAt?: Date | unknown;
}

/** Used by the import script — chapter quiz info kept beside the chapter. */
export interface ChapterQuizSpec {
  /** Used to build the canonical `book-chapter-{slug}` Quiz id. */
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  questions: Omit<QuizQuestion, 'id'>[];
  passingScorePercent: number;
}
