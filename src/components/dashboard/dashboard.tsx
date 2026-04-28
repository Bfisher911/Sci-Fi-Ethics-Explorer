'use client';

/**
 * Logged-in dashboard ("Mission Control").
 *
 * Implementation of the Sci-Fi Ethics Explorer dashboard redesign
 * (Variant C from the Claude Design handoff bundle). Recreates the
 * visual fidelity using Tailwind + the existing design tokens
 * (--primary cyan, --accent magenta, --card / --background /
 * --sidebar-background navy) and pulls real data from the app where
 * available, falling back to the design copy when no data exists yet
 * (e.g. for first-time users).
 *
 * Layout, top to bottom:
 *   1. Greeting strip   — "Mission Brief · {weekday}", "Good {part}, {name}"
 *   2. CinematicHero    — full-bleed Dilemma of the Day with skewed CTAs
 *                          and an inset "Resume Reading" panel
 *   3. PulseStatRow     — 4 micro-stats (streak, XP, debates, certs)
 *   4. Glass card grid  — Textbook constellation, Featured trio,
 *                          Professor Paradox mini, Debate rail
 *
 * Earlier iterations also rendered an "Editorial Deck" below the main
 * grid (ResumeHero + ChapterTrack + FeaturedStoriesEditorial +
 * ActivityFeed borrowed from Variant A "Commander's Bridge"). That
 * section was removed on 2026-04-18 per user request; the Mission
 * Control hero already carries the resume-reading thread in its inset
 * panel, so the duplicate block added noise.
 */

// Note: no `next/image` import. Cover artwork is rendered via CSS
// `background-image` so a missing or slow-loading SVG never paints
// the browser's broken-image icon — the layered gradient backdrop
// stays visible underneath either way.
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bookmark,
  BookmarkCheck,
  BookMarked,
  BookOpen,
  GraduationCap,
  Loader2,
  Lock,
  Scale,
  Sparkles,
  Trophy,
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';
import { getDilemmaOfTheDay, getStories } from '@/app/actions/stories';
import { getTextbookProgress } from '@/app/actions/textbook';
import { getUserBadges } from '@/app/actions/badges';
import { getDebates } from '@/app/actions/debates';
import { addBookmark } from '@/app/actions/bookmarks';
import { getUserProfile } from '@/app/actions/user';
import { chapters as ALL_CHAPTERS } from '@/data/textbook';
import { getQuoteOfTheDay, type TechEthicsQuote } from '@/data/quotes';
// Lazy-load FirstRunCards — only first-ever visitors render it, but
// it'd otherwise ship in every dashboard bundle. `dynamic` defers the
// download until the gating effect actually decides to show the
// welcome overlay.
import dynamic from 'next/dynamic';
const FirstRunCards = dynamic(
  () =>
    import('@/components/dashboard/first-run-cards').then((m) => m.FirstRunCards),
  {
    ssr: false,
    loading: () => null,
  },
);
import { RoleBadge, pickHighestTier } from '@/components/identity/role-badge';
import { hasOwnedLicenses } from '@/app/actions/scope';
import type { Chapter } from '@/types/textbook';
import type { Debate, Story } from '@/types';

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

// No FALLBACK_DILEMMA. The hero only renders with a real Story
// record behind it, so every link target is a specific story page.
// When no stories exist yet we render a dedicated empty-state hero
// instead of fake copy that points nowhere useful.

/**
 * Pick the three most-recently-posted stories for the "Curated
 * tonight" trio. Ordered strictly by `publishedAt` descending
 * (alphabetical tiebreak for rare same-timestamp collisions).
 * Admin-pinned `featured` stories get no special treatment —
 * freshness is the only axis. Never returns fake placeholders;
 * callers handle the empty case with an explicit empty-state CTA.
 */
function pickFeaturedTrio(stories: Story[]): Story[] {
  const timestamp = (s: Story): number => {
    const v = s.publishedAt;
    if (!v) return 0;
    if (v instanceof Date) return v.getTime();
    if (typeof (v as { toDate?: () => Date }).toDate === 'function') {
      return (v as { toDate: () => Date }).toDate().getTime();
    }
    const parsed = new Date(v as string).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  };
  return [...stories]
    .sort((a, b) => {
      const at = timestamp(a);
      const bt = timestamp(b);
      if (at !== bt) return bt - at;
      return a.title.localeCompare(b.title);
    })
    .slice(0, 3);
}

// No hardcoded DEBATE_RAIL. The rail only renders real Debate
// documents, each linking to its own /debate-arena/{id} page. Empty
// state is handled explicitly with a "Start a debate" CTA.

const COUNSELOR_PROMPT_DEFAULT =
  'You left off mid-chapter last time. Want to pick up where you were, or try a fresh scenario?';

/* ──────────────────────────────────────────────────────────────────
   Top-level Dashboard
   ────────────────────────────────────────────────────────────────── */

export function Dashboard(): JSX.Element {
  const { user } = useAuth();
  const { isSuperAdmin } = useSubscription();
  const { toast } = useToast();

  const displayName = useMemo(() => {
    if (!user) return 'Explorer';
    const dn = user.displayName?.trim();
    if (dn) return dn.split(' ')[0];
    const local = user.email?.split('@')[0];
    if (!local) return 'Explorer';
    // Truncate very long email locals so they don't break the h1.
    return local.length > 16 ? local.slice(0, 16) + '…' : local;
  }, [user]);

  /* Real data ---------------------------------------------------- */
  const [chapterQuizzesPassed, setChapterQuizzesPassed] = useState<string[]>([]);
  const [lastChapterRead, setLastChapterRead] = useState<string | undefined>();
  const [finalExamPassed, setFinalExamPassed] = useState(false);
  const [masterCertId, setMasterCertId] = useState<string | undefined>();
  const [badgeCount, setBadgeCount] = useState<number | null>(null);
  const [storiesCompleted, setStoriesCompleted] = useState<number | null>(null);
  const [dilemma, setDilemma] = useState<Story | null>(null);
  const [featured, setFeatured] = useState<Story[] | null>(null);
  const [openDebates, setOpenDebates] = useState<Debate[] | null>(null);
  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  const [bookmarkSaving, setBookmarkSaving] = useState(false);

  // Compact-mode hero + first-run cards: both gated off the same
  // localStorage flag.
  //   - first dashboard visit ever → show 3-card welcome, full hero
  //   - subsequent visits same day → compact hero, no welcome
  //   - subsequent visits later   → full hero, no welcome
  const [compactHero, setCompactHero] = useState(false);
  const [showFirstRun, setShowFirstRun] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const last = localStorage.getItem('sfe.lastDashboardVisit');
      const dismissed = localStorage.getItem('sfe.firstRunDismissed') === 'true';
      if (!last && !dismissed) {
        // Brand-new user — full hero AND first-run cards on top.
        setShowFirstRun(true);
      } else if (last === today) {
        // Same-day return — compact hero, no welcome.
        setCompactHero(true);
      }
      localStorage.setItem('sfe.lastDashboardVisit', today);
    } catch {
      // Storage unavailable — leave hero at full size.
    }
  }, []);

  function dismissFirstRun() {
    setShowFirstRun(false);
    try {
      localStorage.setItem('sfe.firstRunDismissed', 'true');
    } catch {
      // ignore
    }
  }

  // Role tier — resolved from a small bag of signals into a single
  // hierarchy (super-admin > license-admin > instructor > member). One
  // badge, never stacked. We only check license ownership here; the
  // instructor signal would need a per-community lookup which we skip
  // on the dashboard for budget — instructor-only users still see
  // "Member" here, which is benign (the community pages show the
  // instructor role explicitly when they're acting as one).
  const [hasLicense, setHasLicense] = useState(false);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    hasOwnedLicenses(user.uid).then((res) => {
      if (cancelled) return;
      setHasLicense(res.success ? res.data : false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);
  const roleTier = pickHighestTier({
    isSuperAdmin: !!isSuperAdmin,
    hasOwnedLicense: hasLicense,
    isCommunityInstructor: false,
  });

  // Per-user data: textbook progress, badges, profile stats. Skipped
  // when no user is signed in (the page will already have redirected
  // to /login by then but we guard anyway).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [progRes, badgeRes, profRes] = await Promise.all([
        getTextbookProgress(user.uid),
        getUserBadges(user.uid),
        getUserProfile(user.uid),
      ]);
      if (cancelled) return;
      if (progRes.success) {
        setChapterQuizzesPassed(progRes.data.chapterQuizzesPassed);
        setLastChapterRead(progRes.data.lastChapterRead);
        setFinalExamPassed(progRes.data.finalExamPassed);
        setMasterCertId(progRes.data.masterCertificateId);
      }
      if (badgeRes.success) setBadgeCount(badgeRes.data.length);
      if (profRes.success && profRes.data) {
        setStoriesCompleted(profRes.data.storiesCompleted ?? 0);
      } else {
        setStoriesCompleted(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Auth-agnostic data: dilemma of the day, featured stories,
  // open debates. Used for hero, trio, and debate rail respectively.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [dilRes, storyRes, debateRes] = await Promise.all([
        getDilemmaOfTheDay(),
        getStories(),
        getDebates(),
      ]);
      if (cancelled) return;
      if (dilRes.success && dilRes.data) setDilemma(dilRes.data);
      if (storyRes.success) {
        // Always set — even to [] — so the UI can render the empty
        // state instead of waiting for never-arriving data.
        setFeatured(pickFeaturedTrio(storyRes.data));
      } else {
        setFeatured([]);
      }
      if (debateRes.success) setOpenDebates(debateRes.data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const progress = useMemo(
    () => buildChapterProgress(chapterQuizzesPassed, lastChapterRead),
    [chapterQuizzesPassed, lastChapterRead],
  );

  const reading = useMemo(() => pickReadingChapter(progress), [progress]);
  const readingChapter: Chapter | undefined = useMemo(
    () => ALL_CHAPTERS.find((c) => c.slug === reading.slug),
    [reading],
  );

  const doneCount = progress.filter((p) => p.state === 'done').length;

  // Resume reading payload
  const resumePayload: ResumePayload = {
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
    estimatedMinutes: readingChapter?.estimatedReadingMinutes ?? 9,
    cover: readingChapter?.heroImage ?? chapterCover(reading.n),
    href: `/textbook/chapters/${reading.slug}`,
  };

  // Reset the "Saved" toggle whenever the hero story changes so a
  // previous confirmation doesn't bleed onto an unrelated story.
  useEffect(() => {
    setBookmarkSaved(false);
  }, [dilemma?.id, featured?.[0]?.id]);

  // Hero dilemma — always a REAL story. Priority order:
  //   1. Server-picked Dilemma of the Day (rotates daily, specific id).
  //   2. Fallback to the top of the featured trio — still a real
  //      story with a real /stories/{id} link, just labelled "Latest
  //      Story" instead of "Dilemma of the Day" so the eyebrow is
  //      honest.
  //   3. null — the hero renders its empty state (see CinematicHero).
  const heroStory: Story | null =
    dilemma ?? (featured && featured.length > 0 ? featured[0] : null);
  const heroLabel = dilemma ? 'Dilemma of the Day' : 'Latest Story';
  const dilemmaPayload = heroStory
    ? {
        id: heroStory.id,
        eyebrow: heroLabel,
        title: heroStory.title,
        splitTitle: splitForGradient(heroStory.title),
        description: heroStory.description,
        genre: heroStory.genre,
        theme: heroStory.theme,
        author: heroStory.author,
        cover: heroStory.imageUrl || chapterCover(2),
        href: `/stories/${heroStory.id}`,
      }
    : null;

  // Featured stories — real entries only. `null` means "still loading"
  // (render a skeleton); `[]` means "loaded, nothing to show" (render
  // an empty-state CTA). We NEVER substitute fake placeholder entries
  // that link nowhere.
  const featuredPayload: StoryPayload[] | null =
    featured === null
      ? null
      : featured.map((s, i) => ({
          id: s.id,
          title: s.title,
          author: s.author || 'Anonymous',
          meta: `${s.estimatedReadingTime || '—'} · ${s.isInteractive ? 'Branching' : 'Linear'}`,
          cover: s.imageUrl || chapterCover((i % 12) + 1),
          // Slot labels track position in the recency ordering: slot
          // 0 is the newest posted story, slot 2 is the oldest of the
          // three. Keeps each card visually distinct without fibbing
          // about "popularity" we don't actually measure.
          tag: i === 0 ? 'Latest' : i === 1 ? 'Recent' : 'Earlier',
          href: `/stories/${s.id}`,
        }));

  // Debate rail — top 3 currently-open debates, each linked to its
  // own /debate-arena/{id} page. `null` means loading, `[]` means
  // "no debates yet" — never fake placeholders.
  const debatePayload: DebateItem[] | null =
    openDebates === null
      ? null
      : openDebates.slice(0, 3).map((d, i) => ({
          pos: d.title,
          side: d.status === 'voting' ? 'VOTING' : 'OPEN',
          n: d.participantCount ?? 0,
          accent: i % 2 === 1,
          href: `/debate-arena/${d.id}`,
        }));

  // Card title is static; the per-thread count lives on each row's
  // badge. Previously the title and the rendered list could disagree
  // (title said "Three" while data showed 1 or 12), which read as a bug.
  const debateCardTitle = 'Active debates';

  // Bookmark the current hero story (Dilemma of the Day or the
  // latest-story fallback — whichever CinematicHero is rendering).
  // No-op when there's no real story behind the hero or the user
  // is signed out.
  async function handleBookmarkDilemma() {
    if (!user || !dilemmaPayload || bookmarkSaving) return;
    setBookmarkSaving(true);
    try {
      const result = await addBookmark({
        userId: user.uid,
        itemId: dilemmaPayload.id,
        itemType: 'story',
        title: dilemmaPayload.title,
      });
      if (result.success) {
        setBookmarkSaved(true);
        toast({
          title: 'Saved to bookmarks',
          description: `"${dilemmaPayload.title}" is in your bookmarks.`,
        });
      } else {
        toast({
          title: 'Could not save',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Could not save',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setBookmarkSaving(false);
    }
  }

  const quote = getQuoteOfTheDay();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-6 md:px-8 md:py-8 lg:px-10">
      {/* First-run welcome (one-time, dismissible) */}
      {showFirstRun && (
        <FirstRunCards
          startReadingHref={`/textbook/chapters/${reading.slug}`}
          onDismiss={dismissFirstRun}
        />
      )}

      {/* Quote of the Day — prominent, above the greeting strip */}
      <QuoteOfTheDayCard quote={quote} />

      {/* Greeting strip */}
      <div className="mb-4 mt-5 flex flex-wrap items-baseline gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Mission Brief · {weekday()}
          </div>
          <h1 className="mt-1 font-headline text-3xl font-bold tracking-tight md:text-[28px]">
            Good {partOfDay()}, {displayName}.
          </h1>
        </div>
        <span className="flex-1" />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {doneCount > 0
              ? `${doneCount} of ${ALL_CHAPTERS.length} chapters earned`
              : 'Start your study arc'}
          </span>
          {/* Single role badge — never stacked. Members get a "Member"
              label too, so the visual is consistent across users. */}
          <RoleBadge tier={roleTier} />
        </div>
      </div>

      {/* Cinematic Hero — compact on repeat-of-day visits */}
      <CinematicHero
        dilemma={dilemmaPayload}
        resume={resumePayload}
        onSave={handleBookmarkDilemma}
        savedState={
          bookmarkSaving ? 'saving' : bookmarkSaved ? 'saved' : 'idle'
        }
        canSave={!!user && !!dilemmaPayload}
        compact={compactHero}
      />

      {/* Zero-progress users get an oversized "Start here" CTA right
          below the hero. The Resume Reading inset on the hero already
          shows Chapter 1 in this case but the inset's "Continue →"
          link is small; this banner makes the next move unmissable.
          Hidden once they finish at least one chapter quiz. */}
      {doneCount === 0 && !finalExamPassed && (
        <div className="mt-4">
          <Link
            href={`/textbook/chapters/${reading.slug}`}
            className="group flex flex-col items-start gap-2 rounded-2xl border-2 p-5 transition-colors hover:border-primary md:flex-row md:items-center md:gap-5 md:p-6"
            style={{
              borderColor: 'hsl(var(--primary) / 0.5)',
              background:
                'linear-gradient(135deg, hsl(var(--card) / 0.7) 0%, hsl(var(--primary) / 0.08) 100%)',
            }}
          >
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
              style={{
                background: 'hsl(var(--primary) / 0.18)',
                color: 'hsl(var(--primary))',
              }}
            >
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Start here
              </div>
              <div className="mt-0.5 text-lg font-bold text-foreground">
                Open Chapter 1 of the textbook
              </div>
              <div className="text-sm text-muted-foreground">
                The shortest path into the platform — one chapter, ~30 min.
                You can come back here anytime.
              </div>
            </div>
            <div
              className="inline-flex h-11 items-center gap-2 rounded-md px-5 text-sm font-bold text-primary-foreground transition-transform group-hover:translate-x-0.5"
              style={{
                background: 'hsl(var(--primary))',
                boxShadow: '0 0 22px hsl(var(--primary) / 0.4)',
              }}
            >
              Begin <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Stat row — three tiles: Chapters, Debates, Certs.
          Stories used to be a fourth tile but it overlapped with
          Chapters for engaged users; the Practice section in the
          sidebar already has it one click away. */}
      <div className="mt-5">
        <PulseStatRow
          chaptersDone={doneCount}
          totalChapters={ALL_CHAPTERS.length}
          debatesActive={openDebates?.length ?? 0}
          certs={badgeCount ?? 0}
        />
      </div>

      {/* Master-certificate progress */}
      <div className="mt-5">
        <MasterCertificateProgress
          chaptersPassed={doneCount}
          totalChapters={ALL_CHAPTERS.length}
          finalExamPassed={finalExamPassed}
          hasMasterCert={!!masterCertId}
          nextChapterSlug={reading.slug}
          nextChapterNumber={reading.n}
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
          <GlassCard eyebrow="Featured Stories" title="Just published">
            <StoriesTrio stories={featuredPayload} />
          </GlassCard>
        </div>
        <div className="flex flex-col gap-5">
          <GlassCard eyebrow="Companion" title="Professor Paradox">
            <CounselorMini chapterTitle={readingChapter?.title} />
          </GlassCard>
          <GlassCard accent eyebrow="Debate Arena" title={debateCardTitle}>
            <DebateRail items={debatePayload} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   QuoteOfTheDayCard

   Shows a single curated technology-ethics quote at the top of the
   dashboard. The quote is deterministic by UTC date so every visitor
   on a given calendar day sees the same one. The data source is
   src/data/quotes.ts, which carries 365+ entries, and the index
   rotates via quoteIndexForDate so adding quotes does not break the
   rotation.
   ────────────────────────────────────────────────────────────────── */

const QUOTE_KIND_LABEL: Record<TechEthicsQuote['kind'], string> = {
  philosopher: 'Philosopher',
  'scifi-author': 'Sci-Fi Author',
  'scifi-book': 'Sci-Fi Book',
  'scifi-film': 'Sci-Fi Film',
  'scifi-tv': 'Sci-Fi TV',
  'scifi-game': 'Sci-Fi Game',
  scientist: 'Scientist / Engineer',
  other: 'Voice',
};

function QuoteOfTheDayCard({ quote }: { quote: TechEthicsQuote }): JSX.Element {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 backdrop-blur md:p-8"
      style={{
        borderColor: 'hsl(var(--primary) / 0.35)',
        background:
          'linear-gradient(135deg, hsl(var(--card) / 0.55) 0%, hsl(var(--sidebar-background) / 0.5) 60%, hsl(var(--accent) / 0.08) 100%)',
      }}
    >
      {/* Ambient glow — identifies the card even in a thumbnail */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: -80,
          left: -80,
          width: 260,
          height: 260,
          background:
            'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          bottom: -60,
          right: -60,
          width: 200,
          height: 200,
          background:
            'radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)',
        }}
      />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
          <Sparkles className="h-3 w-3" />
          Quote of the Day
          <span className="opacity-50">·</span>
          <span className="text-muted-foreground">
            {QUOTE_KIND_LABEL[quote.kind]}
          </span>
        </div>
        <blockquote
          className="m-0 font-headline text-[22px] font-semibold leading-snug text-foreground md:text-[28px]"
          style={{
            textShadow: '0 1px 24px rgba(0,0,0,0.3)',
          }}
        >
          <span
            className="mr-1 text-3xl align-[-0.15em]"
            style={{ color: 'hsl(var(--primary))' }}
            aria-hidden
          >
            “
          </span>
          {quote.text}
          <span
            className="ml-1 text-3xl align-[-0.15em]"
            style={{ color: 'hsl(var(--primary))' }}
            aria-hidden
          >
            ”
          </span>
        </blockquote>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold text-foreground">
            — {quote.attribution}
          </span>
          {quote.source && (
            <span className="italic text-muted-foreground">{quote.source}</span>
          )}
          {quote.year && (
            <span className="text-muted-foreground">· {quote.year}</span>
          )}
        </div>
        {quote.context && (
          <p
            className="mt-1 border-t pt-3 text-[12.5px] leading-snug text-muted-foreground"
            style={{ borderColor: 'hsl(var(--border) / 0.5)' }}
          >
            <span className="font-semibold text-primary">Why it matters: </span>
            {quote.context}
          </p>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   CinematicHero  (Variant C centerpiece)
   ────────────────────────────────────────────────────────────────── */

interface ResumePayload {
  chapter: number;
  totalChapters: number;
  title: string;
  subtitle: string;
  percent: number;
  /** Estimated reading time of the chapter (whole-chapter, including the
   *  short story). The earlier `minutesLeft` label was misleading because
   *  we don't track scroll-position remaining; this is the chapter's
   *  total estimate. */
  estimatedMinutes: number;
  cover: string;
  href: string;
}

interface DilemmaPayload {
  id: string;
  eyebrow: string;
  title: string;
  splitTitle: readonly [string, string];
  description: string;
  genre?: string;
  theme?: string;
  author?: string;
  cover: string;
  href: string;
}

interface CinematicHeroProps {
  /** `null` means no real story to render — the hero shows its
   *  explicit empty state rather than fake copy with dead links. */
  dilemma: DilemmaPayload | null;
  resume: ResumePayload;
  onSave: () => void | Promise<void>;
  savedState: 'idle' | 'saving' | 'saved';
  /** Whether the bookmark CTA can act — false when the user is
   *  signed out. Renders a disabled button with a tooltip hint. */
  canSave: boolean;
  /** When true, the hero renders at ~half height with smaller copy.
   *  Activated for repeat visits in the same day so returning users
   *  don't have to scroll past 460px of cinematic real estate every
   *  time. See Dashboard's lastVisit localStorage logic. */
  compact?: boolean;
}

function CinematicHero({
  dilemma,
  resume,
  onSave,
  savedState,
  canSave,
  compact = false,
}: CinematicHeroProps): JSX.Element {
  const heroMinHeight = compact ? 240 : 460;
  const heroPadding = compact ? 'p-5 md:p-6' : 'p-8 md:p-10';
  const titleClampedFontSize = compact
    ? 'clamp(28px, 3.5vw, 44px)'
    : 'clamp(38px, 5.5vw, 68px)';
  // No real story to headline the hero — render an explicit empty
  // state with actionable CTAs (submit / browse) instead of fake
  // copy linking to the generic index.
  if (!dilemma) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border p-8 md:p-10"
        style={{
          minHeight: 320,
          backgroundImage:
            'radial-gradient(ellipse at 20% 30%, hsl(181 100% 35% / 0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, hsl(300 100% 45% / 0.25) 0%, transparent 55%), linear-gradient(135deg, #1a1050 0%, #060018 60%, #2a0040 100%)',
          borderColor: 'hsl(var(--border) / 0.5)',
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            No dilemma staged
          </div>
          <h1 className="m-0 max-w-xl font-headline text-3xl font-bold leading-tight text-white md:text-4xl">
            Nothing in the library yet.
          </h1>
          <p className="max-w-xl text-sm text-white/80">
            Submit a dilemma of your own, or pick up where you left off in the textbook.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/submit-dilemma"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-[12px] font-bold uppercase tracking-[0.14em] text-primary-foreground"
            >
              Submit a Dilemma <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={resume.href}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/30 bg-white/5 px-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-white"
            >
              Continue Chapter {resume.chapter}
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{
        minHeight: heroMinHeight,
        // Layered backdrop: the cover SVG via CSS background-image
        // (silently fails — never shows a broken-image icon) on top
        // of a vivid cinematic gradient that's tinted toward the
        // primary cyan / accent magenta. If the SVG renders the cover
        // wins; if it doesn't, the gradient is the hero — either way
        // the section looks intentional, never broken.
        backgroundImage: `url("${dilemma.cover}"), radial-gradient(ellipse at 20% 30%, hsl(181 100% 35% / 0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, hsl(300 100% 45% / 0.45) 0%, transparent 55%), linear-gradient(135deg, #1a1050 0%, #060018 60%, #2a0040 100%)`,
        backgroundSize: 'cover, cover, cover, cover',
        backgroundPosition: 'center, center, center, center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#060018',
        borderColor: 'hsl(var(--border) / 0.5)',
      }}
    >
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
        className={`relative grid items-end gap-6 ${heroPadding} lg:grid-cols-[1.5fr_1fr]`}
        style={{ minHeight: heroMinHeight }}
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
              fontSize: titleClampedFontSize,
              lineHeight: 1,
              letterSpacing: '-0.035em',
              textShadow: '0 2px 40px rgba(0,0,0,0.7)',
            }}
          >
            {dilemma.splitTitle[0]}
            {dilemma.splitTitle[1] && (
              <>
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
              </>
            )}
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
            {/* Save → icon-only button. The previous full-width "Save"
                button competed with "Enter Dilemma" for visual weight
                and added an extra decision; an icon expresses the
                affordance without diluting the primary CTA. */}
            <button
              type="button"
              onClick={() => {
                if (!canSave) return;
                void onSave();
              }}
              disabled={!canSave || savedState !== 'idle'}
              aria-label={
                savedState === 'saved'
                  ? 'Saved to your bookmarks'
                  : canSave
                    ? 'Save this story to your bookmarks'
                    : 'Sign in to save'
              }
              title={
                savedState === 'saved'
                  ? 'Saved'
                  : canSave
                    ? 'Save'
                    : 'Sign in to save'
              }
              className="grid h-[52px] w-[52px] place-items-center rounded-full border text-white backdrop-blur transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: savedState === 'saved'
                  ? 'hsl(var(--accent) / 0.85)'
                  : 'rgba(255,255,255,0.06)',
                borderColor: savedState === 'saved'
                  ? 'hsl(var(--accent))'
                  : 'rgba(255,255,255,0.3)',
              }}
            >
              {savedState === 'saving' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : savedState === 'saved' ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
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
            <div className="mb-1 line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">
              {resume.subtitle}
            </div>
            <div className="line-clamp-2 text-[17px] font-bold leading-tight text-white">
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
              {resume.percent}% complete · ≈ {resume.estimatedMinutes} min read
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
  /** Number of textbook chapters with quiz passed. */
  chaptersDone: number;
  totalChapters: number;
  /** Total open / voting debates platform-wide. */
  debatesActive: number;
  /** Earned badges (per userBadges/{uid}). */
  certs: number;
}

/**
 * Honest stat row. Three tiles only — Stories was previously the fourth
 * but it overlapped too heavily with Chapters for engaged users (you
 * only finish a story by also progressing in the textbook flow most of
 * the time). Stories list is one click away via the sidebar's Practice
 * section. Tiles link to where the underlying number is rendered in
 * detail.
 */
function PulseStatRow({
  chaptersDone,
  totalChapters,
  debatesActive,
  certs,
}: PulseStatRowProps): JSX.Element {
  const stats = [
    {
      Icon: BookOpen,
      label: 'Chapters',
      value: `${chaptersDone} / ${totalChapters}`,
      accent: false,
      href: '/textbook',
    },
    {
      Icon: Scale,
      label: 'Debates',
      value: debatesActive === 1 ? '1 open' : `${debatesActive} open`,
      accent: true,
      href: '/debate-arena',
    },
    {
      Icon: Award,
      label: 'Certs',
      value: certs === 1 ? '1 earned' : `${certs} earned`,
      accent: false,
      href: '/certificates',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className="flex items-center gap-2.5 rounded-xl border p-3 backdrop-blur transition-colors hover:border-primary/40"
          style={{
            borderColor: s.accent
              ? 'hsl(var(--accent) / 0.2)'
              : 'hsl(var(--primary) / 0.2)',
            background: 'hsl(var(--card) / 0.25)',
          }}
        >
          <s.Icon
            className="h-4 w-4 shrink-0"
            style={{
              color: s.accent ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
            }}
          />
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {s.label}
            </div>
            <div className="truncate text-[15px] font-bold">{s.value}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   MasterCertificateProgress

   Measures progress toward the "Master of Technology Ethics"
   capstone credential. The credential is earned by passing each of
   the 12 chapter quizzes (which unlocks the cumulative final exam)
   and then passing the final exam. We model this as 13 discrete
   milestones — 12 chapter quizzes + 1 final exam — so each step is
   equally weighted on the bar. Every link target on this card
   points at a specific page: the user's next chapter, the final
   exam, or the certificates list.
   ────────────────────────────────────────────────────────────────── */

interface MasterCertificateProgressProps {
  chaptersPassed: number;
  totalChapters: number;
  finalExamPassed: boolean;
  hasMasterCert: boolean;
  /** Slug of the chapter the user should open to make progress next. */
  nextChapterSlug: string;
  nextChapterNumber: number;
}

function MasterCertificateProgress({
  chaptersPassed,
  totalChapters,
  finalExamPassed,
  hasMasterCert,
  nextChapterSlug,
  nextChapterNumber,
}: MasterCertificateProgressProps): JSX.Element {
  const totalSteps = totalChapters + 1;
  const stepsDone = chaptersPassed + (finalExamPassed ? 1 : 0);
  const percent = Math.round((stepsDone / totalSteps) * 100);
  const finalExamUnlocked = chaptersPassed >= totalChapters;
  const chaptersRemaining = Math.max(0, totalChapters - chaptersPassed);

  // Milestone 1: chapter quizzes (the aggregate "pass all 12" check)
  // Milestone 2: final-exam unlock (auto — gated on milestone 1)
  // Milestone 3: Master Certificate (gated on passing final exam)
  const milestones: Array<{
    label: string;
    state: 'done' | 'current' | 'locked';
    Icon: typeof BookOpen;
  }> = [
    {
      label: `Chapter quizzes (${chaptersPassed}/${totalChapters})`,
      state: finalExamUnlocked ? 'done' : 'current',
      Icon: BookOpen,
    },
    {
      label: 'Final exam unlocked',
      state: finalExamUnlocked
        ? finalExamPassed
          ? 'done'
          : 'current'
        : 'locked',
      Icon: finalExamUnlocked ? Trophy : Lock,
    },
    {
      label: 'Master Certificate',
      state: hasMasterCert ? 'done' : finalExamPassed ? 'current' : 'locked',
      Icon: hasMasterCert ? Award : GraduationCap,
    },
  ];

  // Pick the next action + its destination. Everything is a specific
  // page tied to the user's real state.
  let ctaLabel: string;
  let ctaHref: string;
  let CtaIcon: typeof ArrowRight = ArrowRight;
  if (hasMasterCert) {
    ctaLabel = 'View Master Certificate';
    ctaHref = '/certificates';
    CtaIcon = Award;
  } else if (finalExamUnlocked) {
    ctaLabel = 'Take the Final Exam';
    ctaHref = '/textbook/final-exam';
    CtaIcon = Trophy;
  } else {
    ctaLabel = `Continue Chapter ${nextChapterNumber}`;
    ctaHref = `/textbook/chapters/${nextChapterSlug}`;
  }

  const headline = hasMasterCert
    ? 'Master of Technology Ethics earned.'
    : finalExamPassed
      ? 'Issuing your Master Certificate…'
      : finalExamUnlocked
        ? 'Final exam unlocked. One exam from the capstone.'
        : chaptersRemaining === 1
          ? 'One chapter quiz until the final exam unlocks.'
          : `${chaptersRemaining} chapter quizzes until the final exam unlocks.`;

  return (
    <div
      className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-5 backdrop-blur md:p-6"
      style={{
        borderColor: hasMasterCert
          ? 'hsl(var(--accent) / 0.45)'
          : 'hsl(var(--primary) / 0.3)',
        background: 'hsl(var(--card) / 0.35)',
      }}
    >
      {/* Accent glow when complete */}
      {hasMasterCert && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            background:
              'radial-gradient(circle, hsl(var(--accent) / 0.35) 0%, transparent 70%)',
          }}
        />
      )}

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          <div
            className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{
              color: hasMasterCert
                ? 'hsl(var(--accent))'
                : 'hsl(var(--primary))',
            }}
          >
            <GraduationCap className="h-3 w-3" />
            Master of Technology Ethics
          </div>
          <h3 className="m-0 font-headline text-[17px] font-bold tracking-tight">
            {headline}
          </h3>
        </div>
        <Link
          href={ctaHref}
          className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-[12px] font-semibold transition-colors hover:border-primary"
          style={{
            borderColor: hasMasterCert
              ? 'hsl(var(--accent) / 0.5)'
              : 'hsl(var(--primary) / 0.45)',
            background: hasMasterCert
              ? 'hsl(var(--accent) / 0.12)'
              : 'hsl(var(--primary) / 0.1)',
            color: hasMasterCert
              ? 'hsl(var(--accent))'
              : 'hsl(var(--primary))',
          }}
        >
          <CtaIcon className="h-3.5 w-3.5" />
          {ctaLabel}
        </Link>
      </div>

      {/* Segmented progress bar — 13 slots (12 chapter quizzes + 1
          final exam). The final slot is visually separated with a
          wider gap so the capstone milestone reads as distinct. */}
      <div className="relative">
        <div className="flex items-center gap-[3px]">
          {Array.from({ length: totalChapters }, (_, i) => {
            const done = i < chaptersPassed;
            return (
              <div
                key={`ch-${i}`}
                className="h-2 flex-1 rounded-full transition-colors"
                style={{
                  background: done
                    ? 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)'
                    : 'hsl(var(--sidebar-background) / 0.6)',
                  boxShadow: done
                    ? '0 0 8px hsl(var(--primary) / 0.5)'
                    : 'none',
                }}
              />
            );
          })}
          {/* Wider gap, then the final-exam / master-cert slot. */}
          <div className="w-2" aria-hidden />
          <div
            className="h-2 flex-1 rounded-full transition-colors"
            style={{
              background: hasMasterCert
                ? 'linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)'
                : finalExamUnlocked
                  ? 'hsl(var(--accent) / 0.25)'
                  : 'hsl(var(--sidebar-background) / 0.6)',
              boxShadow: hasMasterCert
                ? '0 0 12px hsl(var(--accent) / 0.7)'
                : finalExamUnlocked
                  ? '0 0 6px hsl(var(--accent) / 0.4)'
                  : 'none',
              outline: finalExamUnlocked && !hasMasterCert
                ? '1px dashed hsl(var(--accent) / 0.6)'
                : 'none',
              outlineOffset: 1,
            }}
            title="Final exam · Master Certificate"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {stepsDone} / {totalSteps} milestones · {percent}%
          </span>
          <Link
            href="/textbook"
            className="font-semibold text-primary hover:text-accent"
          >
            Open textbook →
          </Link>
        </div>
      </div>

      {/* Milestone chips */}
      <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-3">
        {milestones.map((m) => (
          <div
            key={m.label}
            className="flex items-center gap-2 rounded-lg border p-2.5 text-[12px]"
            style={{
              borderColor:
                m.state === 'done'
                  ? 'hsl(var(--primary) / 0.4)'
                  : m.state === 'current'
                    ? 'hsl(var(--accent) / 0.4)'
                    : 'hsl(var(--border) / 0.5)',
              background:
                m.state === 'done'
                  ? 'hsl(var(--primary) / 0.08)'
                  : m.state === 'current'
                    ? 'hsl(var(--accent) / 0.08)'
                    : 'hsl(var(--card) / 0.25)',
              color:
                m.state === 'locked'
                  ? 'hsl(var(--muted-foreground))'
                  : 'hsl(var(--foreground))',
            }}
          >
            <m.Icon
              className="h-3.5 w-3.5 shrink-0"
              style={{
                color:
                  m.state === 'done'
                    ? 'hsl(var(--primary))'
                    : m.state === 'current'
                      ? 'hsl(var(--accent))'
                      : 'hsl(var(--muted-foreground))',
              }}
            />
            <span className="truncate font-semibold">{m.label}</span>
            {m.state === 'done' && (
              <Check
                className="ml-auto h-3.5 w-3.5 shrink-0"
                style={{ color: 'hsl(var(--primary))' }}
              />
            )}
          </div>
        ))}
      </div>
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

function CounselorMini({
  chapterTitle,
}: {
  chapterTitle?: string;
}): JSX.Element {
  // Personalize the opener with the actual chapter the user was last
  // reading, when we know it. Falls back to the generic prompt for
  // brand-new users who haven't opened a chapter yet.
  const prompt = chapterTitle
    ? `Want to pick "${chapterTitle}" apart, or try a fresh scenario?`
    : COUNSELOR_PROMPT_DEFAULT;

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
        {prompt}
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

/**
 * Per-card gradient palette used when the cover SVG isn't available
 * (or while it's loading, or if any future cover URL 404s). Indexed
 * by card position so the trio always renders three distinct
 * cinematic backdrops even with no images.
 */
const TRIO_FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, hsl(181 100% 35%) 0%, hsl(240 70% 18%) 60%, hsl(300 60% 25%) 100%)',
  'linear-gradient(135deg, hsl(280 70% 35%) 0%, hsl(240 70% 18%) 60%, hsl(200 80% 28%) 100%)',
  'linear-gradient(135deg, hsl(320 80% 35%) 0%, hsl(240 70% 18%) 60%, hsl(38 90% 35%) 100%)',
];

function StoriesTrio({
  stories,
}: {
  stories: StoryPayload[] | null;
}): JSX.Element {
  // Still loading — render three pulsing skeleton cards so the grid
  // shape doesn't pop in once data arrives.
  if (stories === null) {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-lg border"
            style={{
              borderColor: 'hsl(var(--border) / 0.5)',
              background: TRIO_FALLBACK_GRADIENTS[i],
              opacity: 0.4,
            }}
          />
        ))}
      </div>
    );
  }
  // Loaded but empty — encourage the user to contribute instead of
  // padding the grid with fake entries.
  if (stories.length === 0) {
    return (
      <div
        className="flex flex-col items-start gap-2 rounded-lg border p-4"
        style={{
          borderColor: 'hsl(var(--border) / 0.5)',
          background: 'hsl(var(--card) / 0.25)',
        }}
      >
        <div className="text-[13px] font-semibold">No stories yet.</div>
        <div className="text-[12px] text-muted-foreground">
          Publishing one takes about five minutes.
        </div>
        <Link
          href="/create-story"
          className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-accent"
        >
          Submit a story <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stories.map((s, i) => {
        // Cover via CSS background-image instead of an <img> / <Image>
        // tag. CSS handles missing background images SILENTLY — no
        // browser broken-image icon, ever. The gradient fallback sits
        // underneath so the card looks intentional whether or not the
        // SVG renders. Cover URL is wrapped in CSS.escape-like
        // quoting; %22 = double-quote.
        const coverUrl = s.cover ? `url("${s.cover}")` : null;
        const layeredBg = coverUrl
          ? `${coverUrl}, ${TRIO_FALLBACK_GRADIENTS[i % TRIO_FALLBACK_GRADIENTS.length]}`
          : TRIO_FALLBACK_GRADIENTS[i % TRIO_FALLBACK_GRADIENTS.length];
        return (
          <Link
            key={s.id}
            href={s.href}
            className="group relative block aspect-[3/4] overflow-hidden rounded-lg border transition-transform hover:-translate-y-0.5"
            style={{
              backgroundImage: layeredBg,
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center, center',
              backgroundRepeat: 'no-repeat',
              borderColor: 'hsl(var(--border) / 0.5)',
            }}
          >
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
        );
      })}
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
  href: string;
}

function DebateRail({
  items,
}: {
  items: DebateItem[] | null;
}): JSX.Element {
  if (items === null) {
    return (
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-lg border"
            style={{
              borderColor: 'hsl(var(--border) / 0.5)',
              background: 'hsl(var(--card) / 0.15)',
            }}
          />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-start gap-2 rounded-lg border p-4"
        style={{
          borderColor: 'hsl(var(--border) / 0.5)',
          background: 'hsl(var(--card) / 0.25)',
        }}
      >
        <div className="text-[13px] font-semibold">No open debates.</div>
        <div className="text-[12px] text-muted-foreground">
          Nobody is arguing right now. Stake a position and see who shows up.
        </div>
        <Link
          href="/debate-arena"
          className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-accent hover:text-primary"
        >
          Start a debate <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((d, i) => (
        <Link
          key={i}
          href={d.href}
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
          <span className="flex-1 line-clamp-2 text-[12.5px] font-medium leading-tight">
            {d.pos}
          </span>
          <span className="text-[11px] text-muted-foreground">{d.n}</span>
        </Link>
      ))}
    </div>
  );
}
