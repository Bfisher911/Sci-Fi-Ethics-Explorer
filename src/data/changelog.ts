/**
 * Static "What's New" feed for the platform.
 *
 * Hand-curated, NOT pulled from git history — git commits are too
 * noisy and developer-flavored. The audience is end users, who care
 * about new features and content, not "refactor: extract CinematicHero
 * into its own module."
 *
 * To add an entry: add a new object at the TOP of the array (newest
 * first), with the date in YYYY-MM-DD format. Tag with a relevant
 * category so the badge color stays consistent. Body is plain text /
 * inline markdown — keep it short (1–3 sentences).
 *
 * The dashboard surfaces the most recent entry (within the last 14
 * days) as a "What's New" chip; the /whats-new page shows the full
 * archive.
 */

export type ChangelogCategory =
  | 'feature'
  | 'content'
  | 'fix'
  | 'announcement';

export interface ChangelogEntry {
  /** ISO date YYYY-MM-DD when the entry was published. */
  date: string;
  /** Short headline shown in the feed and the dashboard chip. */
  title: string;
  /** 1–3 sentence body. Keep it user-flavored, not engineer-flavored. */
  body: string;
  /** Tag for the badge color. */
  category: ChangelogCategory;
  /** Optional CTA — where the entry deep-links to. */
  href?: string;
  /** Stable ID used for "have I seen this?" tracking in localStorage. */
  id: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: '2026-04-28-spring-polish',
    date: '2026-04-28',
    title: 'Spring polish: streaks, reflections archive, and a faster dashboard',
    body:
      'A 7-category sweep landed: daily streak counter on the dashboard, a new reflections archive at /me/reflections, lazy-loaded charts, and an a11y pass adding skip-to-content + reduced-motion respect.',
    category: 'feature',
    href: '/me',
  },
  {
    id: '2026-04-26-me-hub',
    date: '2026-04-26',
    title: 'Your new hub at /me',
    body:
      'Single page consolidating progress, certificates, reflections, and saved items. Get there from the user menu in the top right.',
    category: 'feature',
    href: '/me',
  },
  {
    id: '2026-04-22-notification-feed',
    date: '2026-04-22',
    title: 'Real notification feed',
    body:
      'The bell icon now surfaces actual events — debate replies, certificates earned, and seat assignments — instead of static placeholders.',
    category: 'feature',
  },
  {
    id: '2026-04-18-cinematic-hero',
    date: '2026-04-18',
    title: 'Mission Control hero, redesigned',
    body:
      'The dashboard hero now centers around the Dilemma of the Day with an inset Resume Reading panel. The old editorial deck below is retired — its content is now folded into the hero.',
    category: 'feature',
    href: '/dashboard',
  },
  {
    id: '2026-04-12-textbook',
    date: '2026-04-12',
    title: 'Textbook is live',
    body:
      'All 12 chapters of "The Ethics of Technology Through Science Fiction" are now readable in-app, with chapter quizzes, certificates, and a master final exam.',
    category: 'content',
    href: '/textbook',
  },
];

/**
 * Returns entries newer than `daysAgo` days. Used by the dashboard
 * "What's New" chip.
 */
export function getRecentChangelog(daysAgo = 14): ChangelogEntry[] {
  const cutoff = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  return CHANGELOG.filter((entry) => {
    const t = new Date(entry.date + 'T00:00:00Z').getTime();
    return Number.isFinite(t) && t >= cutoff;
  });
}

/** Most recent entry (or undefined if the changelog is empty). */
export function getLatestChangelog(): ChangelogEntry | undefined {
  return CHANGELOG[0];
}
