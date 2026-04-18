'use client';

/**
 * Logged-in dashboard ("Mission Control" + "Editorial Deck").
 *
 * Implementation of the Sci-Fi Ethics Explorer dashboard redesign
 * (Variant C with Variant A's editorial pieces appended). The design
 * brief and HTML/JSX prototype lived in the `Dashboard Redesign`
 * handoff bundle from Claude Design — see commit history for the
 * reference files. This file recreates the visual fidelity using
 * Tailwind + the existing design tokens (--primary cyan, --accent
 * magenta, --card / --background / --sidebar-background navy) and
 * pulls real data from the app where available, falling back to the
 * design copy when no data exists yet (e.g. for first-time users).
 *
 * Layout, top to bottom:
 *   1. Greeting strip   — "Mission Brief · {weekday}", "Good {part}, {name}"
 *   2. CinematicHero    — full-bleed Dilemma of the Day with skewed CTAs
 *                          and an inset "Resume Reading" panel
 *   3. PulseStatRow     — 4 micro-stats (streak, XP, debates, certs)
 *   4. Glass card grid  — Textbook constellation, Featured trio,
 *                          Professor Paradox mini, Debate rail
 *   5. Mission Control divider
 *   6. ResumeHero       — full editorial Resume Reading card (A's hero)
 *   7. ChapterTrack     — 12-segment bar + next-4-chapters detail (A)
 *   8. FeaturedStories  — wider editorial story cards (A)
 *   9. ActivityFeed     — recent activity rail (A)
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  Bookmark,
  BookMarked,
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  FlaskConical,
  GraduationCap,
  List,
  MessageCircle,
  Presentation,
  Scale,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { getDilemmaOfTheDay, getStories } from '@/app/actions/stories';
import { getTextbookProgress } from '@/app/actions/textbook';
import { getUserBadges } from '@/app/actions/badges';
import { chapters as ALL_CHAPTERS } from '@/data/textbook';
import type { Chapter } from '@/types/textbook';
import type { Story } from '@/types';

/* ──────────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────────── */

function partOfDay(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function weekday(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

function chapterCover(n: number): string {
  return `/textbook/chapter-${String(n).padStart(2, '0')}.svg`;
}

interface ChapterProgressEntry {
  n: number;
  slug: string;
  title: string;
  state: 'done' | 'reading' | 'locked';
}

function buildChapterProgress(
  chaptersRead: string[],
  chapterQuizzesPassed: string[],
  lastChapterRead: string | undefined,
): ChapterProgressEntry[] {
  // "Done" = quiz passed. "Reading" = the most-recent chapter the user
  // opened (lastChapterRead) IF it isn't already done. Everything else
  // is "locked" (visual treatment only — chapters are actually open).
  const passed = new Set(chapterQuizzesPassed);
  return ALL_CHAPTERS.map<ChapterProgressEntry>((c) => {
    if (passed.has(c.slug)) {
      return { n: c.number, slug: c.slug, title: c.title, state: 'done' };
    }
    if (lastChapterRead === c.slug) {
      return { n: c.number, slug: c.slug, title: c.title, state: 'reading' };
    }
    return { n: c.number, slug: c.slug, title: c.title, state: 'locked' };
  });
}

function pickReadingChapter(progress: ChapterProgressEntry[]): ChapterProgressEntry {
  // Prefer the explicit "reading" marker; else the first locked-after-done;
  // else fall back to chapter 1.
  const reading = progress.find((p) => p.state === 'reading');
  if (reading) return reading;
  const lastDone = [...progress].reverse().find((p) => p.state === 'done');
  if (lastDone) {
    const idx = progress.findIndex((p) => p.n === lastDone.n);
    return progress[idx + 1] ?? lastDone;
  }
  return progress[0];
}

/* ──────────────────────────────────────────────────────────────────
   Design tokens (inline so the file reads top to bottom)
   ────────────────────────────────────────────────────────────────── */

const FALLBACK_DILEMMA = {
  eyebrow: 'Dilemma of the Day',
  title: 'The Ship of Theseus Protocol',
  splitTitle: ['The Ship of Theseus', 'Protocol.'] as const,
  description:
    'A colony ship gradually replaces every crew member with digital uploads to survive a 400-year voyage. When the first body arrives, is it the same crew that left?',
  genre: 'Hard Sci-Fi',
  theme: 'Personal Identity',
  author: 'Iris Vega-Okafor',
  cover: chapterCover(2),
  href: '/stories',
};

const FALLBACK_FEATURED = [
  {
    id: 'fallback-1',
    title: 'The Last Ansible',
    author: 'K. Ogundimu',
    meta: '18 min · Branching',
    cover: chapterCover(4),
    tag: 'Featured',
    href: '/stories',
  },
  {
    id: 'fallback-2',
    title: 'Rain Over Cobalt Harbor',
    author: 'J. Salas',
    meta: '9 min · Linear',
    cover: chapterCover(9),
    tag: 'New',
    href: '/stories',
  },
  {
    id: 'fallback-3',
    title: 'Inheritance, Revisited',
    author: 'N. Park',
    meta: '24 min · Branching',
    cover: chapterCover(11),
    tag: 'Popular',
    href: '/stories',
  },
];

const RECENT_ACTIVITY = [
  {
    icon: Scale,
    title: 'Uploaded minds deserve bodily autonomy',
    meta: 'Debate Arena · 24 min ago',
    accent: true,
    href: '/debate-arena',
  },
  {
    icon: FlaskConical,
    title: 'Your scenario: Generation Ship Mutiny',
    meta: 'Scenario Analyzer · 2h ago',
    accent: false,
    href: '/scenario-analyzer',
  },
  {
    icon: Bookmark,
    title: 'Bookmarked: "On the Right to Forget"',
    meta: 'Community Blog · yesterday',
    accent: false,
    href: '/community-blog',
  },
  {
    icon: Presentation,
    title: 'Workshop reply from Prof. Lin',
    meta: 'Workshops · yesterday',
    accent: true,
    href: '/workshops',
  },
];

const DEBATE_RAIL = [
  {
    pos: 'Uploaded minds deserve full citizenship',
    side: 'FOR',
    n: 48,
    accent: false,
  },
  {
    pos: 'Memory editing violates self-continuity',
    side: 'AGAINST',
    n: 31,
    accent: true,
  },
  {
    pos: 'AI should be granted conscientious refusal',
    side: 'FOR',
    n: 22,
    accent: false,
  },
];

const COUNSELOR_PROMPT_DEFAULT =
  'Hey — you left off mid-thought in your last chapter. Want to unpack the dilemma, or try a new scenario?';

/* ──────────────────────────────────────────────────────────────────
   Top-level Dashboard
   ────────────────────────────────────────────────────────────────── */

export function Dashboard(): JSX.Element {
  const { user } = useAuth();
  const { isSuperAdmin } = useSubscription();

  const displayName = useMemo(() => {
    if (!user) return 'Explorer';
    const dn = user.displayName?.trim();
    if (dn) return dn.split(' ')[0];
    return user.email?.split('@')[0] ?? 'Explorer';
  }, [user]);

  /* Real data ---------------------------------------------------- */
  const [chaptersRead, setChaptersRead] = useState<string[]>([]);
  const [chapterQuizzesPassed, setChapterQuizzesPassed] = useState<string[]>([]);
  const [lastChapterRead, setLastChapterRead] = useState<string | undefined>();
  const [badgeCount, setBadgeCount] = useState<number | null>(null);
  const [dilemma, setDilemma] = useState<Story | null>(null);
  const [featured, setFeatured] = useState<Story[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [progRes, badgeRes] = await Promise.all([
        getTextbookProgress(user.uid),
        getUserBadges(user.uid),
      ]);
      if (cancelled) return;
      if (progRes.success) {
        setChaptersRead(progRes.data.chaptersRead);
        setChapterQuizzesPassed(progRes.data.chapterQuizzesPassed);
        setLastChapterRead(progRes.data.lastChapterRead);
      }
      if (badgeRes.success) setBadgeCount(badgeRes.data.length);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [dilRes, storyRes] = await Promise.all([
        getDilemmaOfTheDay(),
        getStories(),
      ]);
      if (cancelled) return;
      if (dilRes.success && dilRes.data) setDilemma(dilRes.data);
      if (storyRes.success && storyRes.data.length > 0) {
        setFeatured(storyRes.data.slice(0, 3));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const progress = useMemo(
    () => buildChapterProgress(chaptersRead, chapterQuizzesPassed, lastChapterRead),
    [chaptersRead, chapterQuizzesPassed, lastChapterRead],
  );

  const reading = useMemo(() => pickReadingChapter(progress), [progress]);
  const readingChapter: Chapter | undefined = useMemo(
    () => ALL_CHAPTERS.find((c) => c.slug === reading.slug),
    [reading],
  );

  const doneCount = progress.filter((p) => p.state === 'done').length;

  // Resume reading payload
  const resumePayload = {
    chapter: reading.n,
    totalChapters: ALL_CHAPTERS.length,
    title: reading.title,
    subtitle: `Chapter ${reading.n}${
      readingChapter?.subtitle ? ' · ' + readingChapter.subtitle : ''
    }`,
    percent:
      doneCount === 0 && reading.n === 1
        ? 0
        : Math.round((doneCount / ALL_CHAPTERS.length) * 100),
    minutesLeft: readingChapter?.estimatedReadingMinutes ?? 9,
    cover: chapterCover(reading.n),
    href: `/textbook/chapters/${reading.slug}`,
  };

  // Dilemma — real data first, fall back to design copy
  const dilemmaPayload = dilemma
    ? {
        eyebrow: 'Dilemma of the Day',
        title: dilemma.title,
        splitTitle: splitForGradient(dilemma.title),
        description: dilemma.description,
        genre: dilemma.genre,
        theme: dilemma.theme,
        author: dilemma.author,
        cover: dilemma.imageUrl || chapterCover(2),
        href: `/stories/${dilemma.id}`,
      }
    : FALLBACK_DILEMMA;

  // Featured stories — real if loaded, otherwise design defaults
  const featuredPayload =
    featured && featured.length > 0
      ? featured.map((s, i) => ({
          id: s.id,
          title: s.title,
          author: s.author || 'Anonymous',
          meta: `${s.estimatedReadingTime || '—'} · ${s.isInteractive ? 'Branching' : 'Linear'}`,
          cover: s.imageUrl || chapterCover((i % 12) + 1),
          tag: i === 0 ? 'Featured' : i === 1 ? 'New' : 'Popular',
          href: `/stories/${s.id}`,
        }))
      : FALLBACK_FEATURED;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-6 md:px-8 md:py-8 lg:px-10">
      {/* Greeting strip */}
      <div className="mb-4 flex flex-wrap items-baseline gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Mission Brief · {weekday()}
          </div>
          <h1 className="mt-1 font-headline text-3xl font-bold tracking-tight md:text-[28px]">
            Good {partOfDay()}, {displayName}.
          </h1>
        </div>
        <span className="flex-1" />
        <div className="text-xs text-muted-foreground">
          {doneCount > 0
            ? `${doneCount} of ${ALL_CHAPTERS.length} chapters earned`
            : 'Start your study arc'}
          {isSuperAdmin && (
            <span className="ml-3 rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
              Owner
            </span>
          )}
        </div>
      </div>

      {/* Cinematic Hero */}
      <CinematicHero dilemma={dilemmaPayload} resume={resumePayload} />

      {/* Stat row */}
      <div className="mt-5">
        <PulseStatRow
          streak={Math.max(1, doneCount)}
          xp={2840 + doneCount * 240}
          debatesActive={3}
          certs={badgeCount ?? doneCount}
        />
      </div>

      {/* Mission control glass grid */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <GlassCard eyebrow="Your Study Arc" title="Textbook · Chapter in flight">
            <ChapterConstellation
              progress={progress}
              doneCount={doneCount}
              readingNumber={reading.n}
            />
          </GlassCard>
          <GlassCard eyebrow="Featured Stories" title="Curated tonight">
            <StoriesTrio stories={featuredPayload} />
          </GlassCard>
        </div>
        <div className="flex flex-col gap-5">
          <GlassCard eyebrow="Companion" title="Professor Paradox">
            <CounselorMini />
          </GlassCard>
          <GlassCard accent eyebrow="Debate Arena" title="Three threads need you">
            <DebateRail items={DEBATE_RAIL} />
          </GlassCard>
        </div>
      </div>

      {/* Editorial Deck divider */}
      <MissionControlDivider label="Editorial Deck · Pick up where you left off" />

      {/* Resume Reading hero (Variant A) */}
      <div className="mt-7">
        <ResumeHero resume={resumePayload} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-7">
          <div>
            <SectionHead
              title="Textbook"
              eyebrow="Your Study Arc"
              actionLabel="All 12 chapters"
              actionHref="/textbook"
            />
            <ChapterTrack progress={progress} reading={reading} doneCount={doneCount} />
          </div>
          <div>
            <SectionHead
              title="Featured Stories"
              eyebrow="Curated for You"
              actionLabel="Browse library"
              actionHref="/stories"
            />
            <FeaturedStoriesEditorial stories={featuredPayload} />
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <div>
            <SectionHead
              title="Recent Activity"
              eyebrow="Your Signal"
              actionLabel="View all"
              actionHref="/notifications"
            />
            <ActivityFeed items={RECENT_ACTIVITY} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   CinematicHero  (Variant C centerpiece)
   ────────────────────────────────────────────────────────────────── */

interface CinematicHeroProps {
  dilemma: {
    eyebrow: string;
    title: string;
    splitTitle: readonly [string, string];
    description: string;
    genre?: string;
    theme?: string;
    author?: string;
    cover: string;
    href: string;
  };
  resume: ResumePayload;
}

function CinematicHero({ dilemma, resume }: CinematicHeroProps): JSX.Element {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{
        minHeight: 460,
        background: '#060018',
        borderColor: 'hsl(var(--border) / 0.5)',
      }}
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dilemma.cover}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.75, filter: 'saturate(1.2) contrast(1.05)' }}
      />
      {/* Protection gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(95deg, rgba(10,6,30,0.95) 0%, rgba(10,6,30,0.75) 40%, rgba(10,6,30,0.2) 70%, rgba(10,6,30,0.9) 100%), linear-gradient(180deg, transparent 40%, rgba(10,6,30,0.9) 100%)',
        }}
      />
      {/* Magenta glow streak */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, hsl(300 100% 50% / 0.35) 0%, transparent 60%)',
        }}
      />
      {/* Electric blue streak */}
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: -200,
          left: -100,
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, hsl(181 100% 74% / 0.25) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div
        className="relative grid items-end gap-6 p-8 md:p-10 lg:grid-cols-[1.5fr_1fr]"
        style={{ minHeight: 460 }}
      >
        <div className="flex flex-col gap-3.5">
          <div
            className="inline-flex w-fit items-center gap-2.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            style={{
              background: 'hsl(var(--accent))',
              boxShadow: '0 0 20px hsl(var(--accent) / 0.6)',
            }}
          >
            <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-white" />
            {dilemma.eyebrow}
          </div>
          <h1
            className="m-0 font-headline font-bold text-white"
            style={{
              fontSize: 'clamp(38px, 5.5vw, 68px)',
              lineHeight: 1,
              letterSpacing: '-0.035em',
              textShadow: '0 2px 40px rgba(0,0,0,0.7)',
            }}
          >
            {dilemma.splitTitle[0]}
            <br />
            <span
              style={{
                background:
                  'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {dilemma.splitTitle[1]}
            </span>
          </h1>
          <p
            className="m-0 max-w-xl text-base text-white/85"
            style={{
              lineHeight: 1.5,
              textShadow: '0 1px 20px rgba(0,0,0,0.5)',
            }}
          >
            {dilemma.description}
          </p>
          {(dilemma.genre || dilemma.theme || dilemma.author) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              {dilemma.genre && (
                <span>
                  <span className="text-primary">Genre</span>&nbsp;&nbsp;{dilemma.genre}
                </span>
              )}
              {dilemma.theme && (
                <>
                  <span className="opacity-40">·</span>
                  <span>
                    <span className="text-primary">Theme</span>&nbsp;&nbsp;{dilemma.theme}
                  </span>
                </>
              )}
              {dilemma.author && (
                <>
                  <span className="opacity-40">·</span>
                  <span>
                    <span className="text-primary">By</span>&nbsp;&nbsp;{dilemma.author}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={dilemma.href}
              className="inline-flex h-[52px] items-center justify-center px-7 text-[13px] font-bold uppercase tracking-[0.14em] text-primary-foreground"
              style={{
                background: 'hsl(var(--primary))',
                transform: 'skewX(-10deg)',
                boxShadow: '0 0 30px hsl(var(--primary) / 0.5)',
              }}
            >
              <span className="inline-flex items-center gap-2.5" style={{ transform: 'skewX(10deg)' }}>
                Enter Dilemma
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <button
              type="button"
              className="inline-flex h-[52px] items-center justify-center border px-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur"
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.3)',
                transform: 'skewX(-10deg)',
              }}
            >
              <span className="inline-flex items-center gap-2.5" style={{ transform: 'skewX(10deg)' }}>
                <Bookmark className="h-3.5 w-3.5" />
                Save
              </span>
            </button>
          </div>
        </div>

        {/* Inset Resume Reading panel */}
        <div
          className="flex w-full max-w-sm flex-col gap-3 justify-self-end rounded-xl border p-5 backdrop-blur"
          style={{
            borderColor: 'rgba(125,249,255,0.3)',
            background: 'rgba(10,6,30,0.65)',
          }}
        >
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            <BookMarked className="h-2.5 w-2.5" />
            Resume Where You Left Off
          </div>
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">
              {resume.subtitle}
            </div>
            <div className="text-[17px] font-bold leading-tight text-white">
              {resume.title}
            </div>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full"
              style={{
                width: `${resume.percent}%`,
                background:
                  'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                boxShadow: '0 0 10px hsl(var(--primary))',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span>
              {resume.percent}% · {resume.minutesLeft} min left
            </span>
            <Link
              href={resume.href}
              className="font-semibold text-primary hover:text-accent"
            >
              Continue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Pull a "Title.<gradient piece>" split out of a long string. The
 * design renders the second half of the title with a cyan→magenta
 * gradient — heuristically split on the last word so it reads
 * cleanly.
 */
function splitForGradient(title: string): readonly [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return [title, ''];
  if (words.length === 2) return [words[0], words[1] + '.'];
  // Last 1–2 words for the gradient half
  const tailCount = words.length >= 5 ? 2 : 1;
  const head = words.slice(0, words.length - tailCount).join(' ');
  const tail = words.slice(-tailCount).join(' ');
  return [head, tail.endsWith('.') ? tail : tail + '.'];
}

/* ──────────────────────────────────────────────────────────────────
   PulseStatRow
   ────────────────────────────────────────────────────────────────── */

interface PulseStatRowProps {
  streak: number;
  xp: number;
  debatesActive: number;
  certs: number;
}

function PulseStatRow({ streak, xp, debatesActive, certs }: PulseStatRowProps): JSX.Element {
  const stats = [
    { Icon: Flame, label: 'Streak', value: `${streak} day${streak === 1 ? '' : 's'}`, accent: false },
    { Icon: Zap, label: 'XP', value: xp.toLocaleString(), accent: false },
    { Icon: Scale, label: 'Debates', value: `${debatesActive} active`, accent: true },
    { Icon: Award, label: 'Certs', value: `${certs} earned`, accent: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-2.5 rounded-xl border p-3 backdrop-blur"
          style={{
            borderColor: s.accent ? 'hsl(var(--accent) / 0.2)' : 'hsl(var(--primary) / 0.2)',
            background: 'hsl(var(--card) / 0.25)',
          }}
        >
          <s.Icon
            className="h-4 w-4 shrink-0"
            style={{ color: s.accent ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }}
          />
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {s.label}
            </div>
            <div className="truncate text-[15px] font-bold">{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   GlassCard
   ────────────────────────────────────────────────────────────────── */

interface GlassCardProps {
  eyebrow?: string;
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}

function GlassCard({ eyebrow, title, accent, children }: GlassCardProps): JSX.Element {
  return (
    <div
      className="relative flex flex-col gap-3.5 overflow-hidden rounded-2xl border p-5 backdrop-blur"
      style={{
        borderColor: accent ? 'hsl(var(--accent) / 0.35)' : 'hsl(var(--primary) / 0.2)',
        background: 'hsl(var(--card) / 0.35)',
      }}
    >
      {accent && (
        <div
          className="pointer-events-none absolute"
          style={{
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            background:
              'radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)',
          }}
        />
      )}
      <div className="relative">
        {eyebrow && (
          <div
            className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: accent ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }}
          >
            {eyebrow}
          </div>
        )}
        <h3 className="m-0 font-headline text-[17px] font-bold tracking-tight">{title}</h3>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   ChapterConstellation  (compact 12-segment chapter map)
   ────────────────────────────────────────────────────────────────── */

interface ChapterConstellationProps {
  progress: ChapterProgressEntry[];
  doneCount: number;
  readingNumber: number;
}

function ChapterConstellation({
  progress,
  doneCount,
  readingNumber,
}: ChapterConstellationProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-12 gap-[3px]">
        {progress.map((c) => {
          const isDone = c.state === 'done';
          const isReading = c.state === 'reading';
          return (
            <Link
              key={c.n}
              href={`/textbook/chapters/${c.slug}`}
              title={`Ch. ${c.n}: ${c.title}`}
              className="flex items-end justify-center pb-1 font-mono text-[9px] font-bold transition-transform hover:-translate-y-0.5"
              style={{
                height: 44,
                borderRadius: 4,
                background: isDone
                  ? 'linear-gradient(180deg, hsl(var(--primary) / 0.5) 0%, hsl(var(--primary) / 0.15) 100%)'
                  : isReading
                    ? 'linear-gradient(180deg, hsl(var(--accent)) 0%, hsl(var(--accent) / 0.3) 100%)'
                    : 'hsl(var(--sidebar-background) / 0.6)',
                border: isReading
                  ? '1px solid hsl(var(--accent))'
                  : isDone
                    ? '1px solid hsl(var(--primary) / 0.3)'
                    : '1px solid hsl(var(--border) / 0.3)',
                boxShadow: isReading ? '0 0 14px hsl(var(--accent) / 0.5)' : 'none',
                color: isDone || isReading ? '#fff' : 'hsl(var(--muted-foreground))',
              }}
            >
              {String(c.n).padStart(2, '0')}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          <span className="font-semibold text-primary">{doneCount}</span> earned ·{' '}
          <span className="font-semibold text-accent">Ch {readingNumber}</span> in flight
        </span>
        <Link
          href="/textbook"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:text-accent"
        >
          Open textbook <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   CounselorMini  (Professor Paradox)
   ────────────────────────────────────────────────────────────────── */

function CounselorMini(): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, hsl(var(--primary)) 0%, hsl(var(--accent) / 0.8) 70%)',
            boxShadow: '0 0 16px hsl(var(--primary) / 0.5)',
          }}
        >
          <Sparkles className="h-4 w-4" style={{ color: '#0a0a2e' }} />
        </div>
        <div>
          <div className="text-[13px] font-bold">Prof. Paradox</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            Online
          </div>
        </div>
      </div>
      <div className="text-[13.5px] leading-snug text-foreground/90">
        {COUNSELOR_PROMPT_DEFAULT}
      </div>
      <Link
        href="/ai-counselor"
        className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition-colors"
        style={{
          borderColor: 'hsl(var(--primary) / 0.4)',
          background: 'hsl(var(--primary) / 0.1)',
          color: 'hsl(var(--primary))',
        }}
      >
        Open chat <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   StoriesTrio  (compact poster cards inside the glass grid)
   ────────────────────────────────────────────────────────────────── */

interface StoryPayload {
  id: string;
  title: string;
  author: string;
  meta: string;
  cover: string;
  tag: string;
  href: string;
}

function StoriesTrio({ stories }: { stories: StoryPayload[] }): JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stories.map((s) => (
        <Link
          key={s.id}
          href={s.href}
          className="relative aspect-[3/4] overflow-hidden rounded-lg border transition-transform hover:-translate-y-0.5"
          style={{
            background: '#0a0a2e',
            borderColor: 'hsl(var(--border) / 0.5)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, transparent 40%, rgba(10,6,30,0.95) 100%)',
            }}
          />
          <div className="absolute inset-x-2.5 bottom-2.5">
            <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
              {s.tag}
            </div>
            <div className="text-[12px] font-bold leading-tight text-white">{s.title}</div>
            <div className="mt-0.5 text-[10px] text-white/60">{s.meta}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   DebateRail
   ────────────────────────────────────────────────────────────────── */

interface DebateItem {
  pos: string;
  side: string;
  n: number;
  accent: boolean;
}

function DebateRail({ items }: { items: DebateItem[] }): JSX.Element {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((d, i) => (
        <Link
          key={i}
          href="/debate-arena"
          className="flex items-center gap-2.5 rounded-lg border p-2.5 transition-colors hover:border-primary/40"
          style={{
            borderColor: 'hsl(var(--border) / 0.5)',
            background: 'hsl(var(--card) / 0.25)',
          }}
        >
          <span
            className="flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em]"
            style={{
              background: `hsl(var(--${d.accent ? 'accent' : 'primary'}) / 0.15)`,
              color: `hsl(var(--${d.accent ? 'accent' : 'primary'}))`,
            }}
          >
            {d.side}
          </span>
          <span className="flex-1 text-[12.5px] font-medium leading-tight">{d.pos}</span>
          <span className="text-[11px] text-muted-foreground">{d.n}</span>
        </Link>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   MissionControlDivider
   ────────────────────────────────────────────────────────────────── */

function MissionControlDivider({ label }: { label: string }): JSX.Element {
  return (
    <div className="mb-2 mt-12 flex items-center gap-3.5">
      <span
        className="h-px w-11"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.6) 100%)',
        }}
      />
      <span className="whitespace-nowrap font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-primary">
        {label}
      </span>
      <span
        className="h-px flex-1"
        style={{
          background:
            'linear-gradient(90deg, hsl(var(--primary) / 0.6) 0%, hsl(var(--border) / 0.4) 40%, transparent 100%)',
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   ResumeHero  (Variant A — full editorial)
   ────────────────────────────────────────────────────────────────── */

interface ResumePayload {
  chapter: number;
  totalChapters: number;
  title: string;
  subtitle: string;
  percent: number;
  minutesLeft: number;
  cover: string;
  href: string;
}

function ResumeHero({ resume }: { resume: ResumePayload }): JSX.Element {
  return (
    <div
      className="grid overflow-hidden rounded-2xl border lg:grid-cols-[1.3fr_1fr]"
      style={{
        borderColor: 'hsl(var(--primary) / 0.25)',
        background:
          'linear-gradient(135deg, hsl(var(--card) / 0.8) 0%, hsl(var(--sidebar-background) / 0.8) 100%)',
        boxShadow:
          '0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px hsl(var(--primary) / 0.05)',
      }}
    >
      <div className="flex flex-col gap-4 p-9 md:p-10">
        <div className="inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary"
          style={{ background: 'hsl(var(--primary) / 0.15)' }}
        >
          <BookMarked className="h-2.5 w-2.5" />
          Resume Reading
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {resume.subtitle}
          </div>
          <h2
            className="m-0 font-headline font-bold text-foreground"
            style={{
              fontSize: 38,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {resume.title}
          </h2>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {resume.minutesLeft} min left
          </span>
          <span>·</span>
          <span>{resume.percent}% complete</span>
        </div>

        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full"
          style={{ background: 'hsl(var(--sidebar-background))' }}
        >
          <div
            className="h-full"
            style={{
              width: `${resume.percent}%`,
              background:
                'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
              boxShadow: '0 0 12px rgba(125,249,255,.5)',
            }}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href={resume.href}
            className="inline-flex h-[46px] items-center gap-2.5 rounded-md px-5 text-[13.5px] font-bold text-primary-foreground"
            style={{
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 22px rgba(125,249,255,.35)',
            }}
          >
            Continue Reading
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/textbook"
            className="inline-flex h-[46px] items-center gap-2 rounded-md border px-4 text-[13.5px] font-medium text-foreground"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <List className="h-3.5 w-3.5" />
            Table of Contents
          </Link>
        </div>
      </div>

      <div className="relative min-h-[220px]" style={{ background: '#0a0a2e' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resume.cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              'linear-gradient(90deg, hsl(var(--card)) 0%, transparent 35%, transparent 100%)',
          }}
        />
        <div
          className="absolute right-5 top-5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary backdrop-blur"
          style={{
            background: 'rgba(10,10,46,0.7)',
            borderColor: 'hsl(var(--primary) / 0.3)',
          }}
        >
          Ch. {resume.chapter} / {resume.totalChapters}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   SectionHead
   ────────────────────────────────────────────────────────────────── */

interface SectionHeadProps {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  actionHref?: string;
}

function SectionHead({ title, eyebrow, actionLabel, actionHref }: SectionHeadProps): JSX.Element {
  return (
    <div className="mb-3.5 flex items-end justify-between">
      <div className="flex items-center gap-3">
        <span
          className="inline-block rounded-full"
          style={{
            width: 3,
            height: 26,
            background: 'hsl(var(--primary))',
            boxShadow: '0 0 10px rgba(125,249,255,.5)',
          }}
        />
        <div>
          {eyebrow && (
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </div>
          )}
          <h2 className="m-0 font-headline text-xl font-bold tracking-tight">{title}</h2>
        </div>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent"
        >
          {actionLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   ChapterTrack  (Variant A — 12-segment + next-4 cards)
   ────────────────────────────────────────────────────────────────── */

interface ChapterTrackProps {
  progress: ChapterProgressEntry[];
  reading: ChapterProgressEntry;
  doneCount: number;
}

function ChapterTrack({ progress, reading, doneCount }: ChapterTrackProps): JSX.Element {
  const readingIdx = progress.findIndex((p) => p.n === reading.n);
  const upcoming = progress.slice(Math.max(0, readingIdx), readingIdx + 4);

  return (
    <div
      className="rounded-2xl border p-5 md:p-6"
      style={{
        borderColor: 'hsl(var(--border) / 0.6)',
        background: 'hsl(var(--card) / 0.3)',
      }}
    >
      <div className="mb-1 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Textbook Progress
          </div>
          <div className="mt-0.5 text-lg font-bold">
            Chapter {reading.n} of {progress.length}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {doneCount} earned · {progress.length - doneCount} ahead
        </div>
      </div>
      <div className="mb-4 mt-4 grid grid-cols-12 gap-1">
        {progress.map((c) => {
          const isDone = c.state === 'done';
          const isReading = c.state === 'reading';
          return (
            <div
              key={c.n}
              title={`Ch. ${c.n}: ${c.title}`}
              className="h-2 rounded-sm"
              style={{
                background: isDone
                  ? 'hsl(var(--primary))'
                  : isReading
                    ? 'hsl(var(--accent))'
                    : 'hsl(var(--sidebar-background))',
                boxShadow: isReading
                  ? '0 0 10px hsl(var(--accent))'
                  : isDone
                    ? '0 0 6px hsl(var(--primary) / 0.5)'
                    : 'none',
              }}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {upcoming.map((c) => (
          <Link
            key={c.n}
            href={`/textbook/chapters/${c.slug}`}
            className="rounded-lg border p-3 transition-colors hover:border-primary/40"
            style={{
              borderColor: 'hsl(var(--border) / 0.5)',
              background:
                c.state === 'reading' ? 'hsl(var(--accent) / 0.08)' : 'transparent',
            }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Ch. {String(c.n).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[13px] font-semibold leading-tight">{c.title}</div>
            <div
              className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
              style={{
                color:
                  c.state === 'reading'
                    ? 'hsl(var(--accent))'
                    : c.state === 'locked'
                      ? 'hsl(var(--muted-foreground))'
                      : 'hsl(var(--primary))',
              }}
            >
              {c.state === 'reading'
                ? 'Reading'
                : c.state === 'locked'
                  ? 'Up next'
                  : 'Complete'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   FeaturedStoriesEditorial  (Variant A — wider story cards)
   ────────────────────────────────────────────────────────────────── */

function FeaturedStoriesEditorial({ stories }: { stories: StoryPayload[] }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
      {stories.map((s) => (
        <Link
          key={s.id}
          href={s.href}
          className="overflow-hidden rounded-xl border transition-transform hover:-translate-y-0.5"
          style={{
            borderColor: 'hsl(var(--border) / 0.6)',
            background: 'hsl(var(--card) / 0.35)',
          }}
        >
          <div className="relative h-[120px]" style={{ background: '#0a0a2e' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, transparent 40%, hsl(var(--card)) 100%)',
              }}
            />
            <span
              className="absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.15em]"
              style={{
                background: 'hsl(var(--primary) / 0.2)',
                color: 'hsl(var(--primary))',
              }}
            >
              {s.tag}
            </span>
          </div>
          <div className="px-3.5 pb-3.5 pt-3">
            <div className="text-sm font-semibold leading-tight">{s.title}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {s.author} · {s.meta}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   ActivityFeed
   ────────────────────────────────────────────────────────────────── */

interface ActivityItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  meta: string;
  accent: boolean;
  href: string;
}

function ActivityFeed({ items }: { items: ActivityItem[] }): JSX.Element {
  return (
    <div
      className="rounded-2xl border p-2"
      style={{
        borderColor: 'hsl(var(--border) / 0.6)',
        background: 'hsl(var(--card) / 0.3)',
      }}
    >
      {items.map((a, i) => {
        const ItemIcon = a.icon;
        return (
          <Link
            key={i}
            href={a.href}
            className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-primary/5"
          >
            <div
              className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg"
              style={{
                background: a.accent
                  ? 'hsl(var(--accent) / 0.15)'
                  : 'hsl(var(--primary) / 0.12)',
                color: a.accent ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
              }}
            >
              <ItemIcon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium leading-tight">{a.title}</div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {a.meta}
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}
