'use client';

/**
 * /me — single page consolidating everything the signed-in user has
 * done. Replaces the scattered "where is my stuff?" experience where
 * progress lived on /textbook, certs on /certificates, bookmarks on
 * /bookmarks, debate participation on /debate-arena, etc.
 *
 * Sections:
 *   - Hero: greeting + tier badge + Master-Exam readiness %
 *   - Activity strip: chapters earned, stories read, debates joined,
 *     framework runs, perspectives saved, certs
 *   - In-progress: continue-where-you-left-off (textbook chapter +
 *     unfinished story, if any)
 *   - Certificates earned (with quick-link to /certificates for the
 *     full registry)
 *   - Reflections archive (most-recent reflections + link to full feed)
 *   - Saved (top items from /bookmarks)
 *
 * NOT a duplicate of the dashboard — this is the "history" view; the
 * dashboard is the "next move" view. They complement each other.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  Compass,
  GitCompare,
  Loader2,
  Scale,
  Sparkles,
  Trophy,
  User as UserIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { getTextbookProgress } from '@/app/actions/textbook';
import { getUserProgress, getInProgressStory } from '@/app/actions/progress';
import { getUserPerspectives } from '@/app/actions/perspectives';
import { getUserCertificates } from '@/app/actions/certificates';
import { getUserBadges } from '@/app/actions/badges';
import { getBookmarks } from '@/app/actions/bookmarks';
import { getMasterExamUnlockState } from '@/app/actions/master-exam';
import { hasOwnedLicenses } from '@/app/actions/scope';
import { getStoryById } from '@/app/actions/stories';
import { chapters as ALL_CHAPTERS, getChapterBySlug } from '@/data/textbook';
import { RoleBadge, pickHighestTier } from '@/components/identity/role-badge';
import { EmptyState } from '@/components/empty/empty-state';
import { SkeletonList } from '@/components/loading/skeleton-list';
import type {
  Bookmark as BookmarkType,
  Certificate,
  SavedPerspective,
  Story,
} from '@/types';
import type { TextbookProgress } from '@/types/textbook';

interface MyData {
  textbook: TextbookProgress | null;
  storiesCompleted: number;
  debatesParticipated: number;
  frameworkRuns: number;
  perspectivesCount: number;
  certs: Certificate[];
  badgeCount: number;
  bookmarks: BookmarkType[];
  inProgressStory: { storyId: string; choicesMade: number } | null;
  inProgressStoryRow: Story | null;
  hasLicense: boolean;
  masterPercent: number;
}

export default function MePage(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin } = useSubscription();
  const [data, setData] = useState<MyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [
        textbookRes,
        progressRes,
        perspectivesRes,
        certsRes,
        badgesRes,
        bookmarksRes,
        masterRes,
        inFlightRes,
        licenseRes,
      ] = await Promise.all([
        getTextbookProgress(user.uid),
        getUserProgress(user.uid),
        getUserPerspectives(user.uid),
        getUserCertificates(user.uid),
        getUserBadges(user.uid),
        getBookmarks(user.uid),
        getMasterExamUnlockState(user.uid),
        getInProgressStory(user.uid),
        hasOwnedLicenses(user.uid),
      ]);

      let inProgressStoryRow: Story | null = null;
      if (inFlightRes.success && inFlightRes.data?.storyId) {
        const sRes = await getStoryById(inFlightRes.data.storyId);
        if (sRes.success && sRes.data) inProgressStoryRow = sRes.data;
      }

      if (cancelled) return;
      setData({
        textbook: textbookRes.success ? textbookRes.data : null,
        storiesCompleted: progressRes.success
          ? progressRes.data.storiesCompleted.length
          : 0,
        debatesParticipated: progressRes.success
          ? progressRes.data.debatesParticipated.length
          : 0,
        frameworkRuns: progressRes.success
          ? progressRes.data.quizResults.length
          : 0,
        perspectivesCount: perspectivesRes.success ? perspectivesRes.data.length : 0,
        certs: certsRes.success ? certsRes.data : [],
        badgeCount: badgesRes.success ? badgesRes.data.length : 0,
        bookmarks: bookmarksRes.success ? bookmarksRes.data : [],
        inProgressStory: inFlightRes.success ? inFlightRes.data : null,
        inProgressStoryRow,
        hasLicense: licenseRes.success ? licenseRes.data : false,
        masterPercent: masterRes.success ? masterRes.data.overallPercent : 0,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  if (authLoading || (loading && user)) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
        <Skeleton className="h-32 w-full" />
        <SkeletonList count={3} shape="row" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <UserIcon className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-headline font-semibold">
              Sign in to see your progress
            </h1>
            <Button asChild>
              <Link href="/login?next=/me">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return <></>;

  const tier = pickHighestTier({
    isSuperAdmin: !!isSuperAdmin,
    hasOwnedLicense: data.hasLicense,
    isCommunityInstructor: false,
  });
  const chaptersDone = data.textbook?.chapterQuizzesPassed.length ?? 0;
  const totalChapters = ALL_CHAPTERS.length;
  const lastChapterSlug = data.textbook?.lastChapterRead;
  const lastChapter = lastChapterSlug ? getChapterBySlug(lastChapterSlug) : undefined;

  const displayName =
    user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Explorer';

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      {/* ─── Hero strip ───────────────────────────────────────────── */}
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/30">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
          <div
            className="grid h-20 w-20 shrink-0 place-items-center rounded-full text-2xl font-bold"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, hsl(var(--primary)) 0%, hsl(var(--accent) / 0.7) 70%)',
              color: '#0a0a2e',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline text-3xl md:text-4xl font-bold">
                {displayName}&apos;s journey
              </h1>
              <RoleBadge tier={tier} />
            </div>
            <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Master Exam readiness:{' '}
                  <strong className="text-foreground">{data.masterPercent}%</strong>
                </span>
              </div>
              <Progress value={data.masterPercent} className="h-1.5 mt-1" />
            </div>
          </div>
          <Button asChild>
            <Link href="/master-exam">
              See full prerequisites
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* ─── Activity strip ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <ActivityTile
          icon={BookOpen}
          label="Chapters"
          value={`${chaptersDone} / ${totalChapters}`}
          href="/textbook"
        />
        <ActivityTile
          icon={Sparkles}
          label="Stories"
          value={
            data.storiesCompleted === 1
              ? '1 read'
              : `${data.storiesCompleted} read`
          }
          href="/stories"
        />
        <ActivityTile
          icon={Scale}
          label="Debates"
          value={
            data.debatesParticipated === 1
              ? '1 joined'
              : `${data.debatesParticipated} joined`
          }
          href="/debate-arena"
          accent
        />
        <ActivityTile
          icon={Compass}
          label="Framework runs"
          value={`${data.frameworkRuns}`}
          href="/framework-explorer"
        />
        <ActivityTile
          icon={GitCompare}
          label="Perspectives"
          value={`${data.perspectivesCount}`}
          href="/studio?tab=compare"
        />
        <ActivityTile
          icon={Award}
          label="Certificates"
          value={`${data.certs.length}`}
          href="/certificates"
        />
      </div>

      {/* ─── In progress ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          In progress
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {/* Textbook chapter */}
          {lastChapter ? (
            <Link
              href={`/textbook/chapters/${lastChapter.slug}`}
              className="rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:border-primary/40"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Last chapter opened
              </div>
              <div className="mt-1 font-semibold text-foreground">
                Chapter {lastChapter.number} · {lastChapter.title}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                Continue <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-4 text-sm text-muted-foreground">
              You haven&apos;t opened a chapter yet.{' '}
              <Link href="/textbook" className="text-primary hover:underline">
                Start the textbook →
              </Link>
            </div>
          )}
          {/* In-progress story */}
          {data.inProgressStory && data.inProgressStoryRow ? (
            <Link
              href={`/stories/${data.inProgressStory.storyId}`}
              className="rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:border-primary/40"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                Story in flight
              </div>
              <div className="mt-1 font-semibold text-foreground">
                {data.inProgressStoryRow.title}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {data.inProgressStory.choicesMade} choice
                {data.inProgressStory.choicesMade === 1 ? '' : 's'} made so far
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-accent">
                Resume <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-4 text-sm text-muted-foreground">
              No story in flight.{' '}
              <Link href="/stories" className="text-primary hover:underline">
                Browse the library →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Certificates ─────────────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Certificates"
          actionHref="/certificates"
          actionLabel="See all"
        />
        {data.certs.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates yet"
            blurb="Pass a chapter quiz, finish a learning path, or clear the Master Exam to earn one."
            action={
              <Button asChild variant="outline">
                <Link href="/textbook">Open the textbook</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.certs.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={c.verificationHash ? `/textbook/certificate/${c.verificationHash}` : '/certificates'}
                className="rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start gap-2.5">
                  <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground line-clamp-2">
                      {c.curriculumTitle}
                    </div>
                    {c.issuedAt && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Earned{' '}
                        {new Date(
                          typeof c.issuedAt === 'string'
                            ? c.issuedAt
                            : (c.issuedAt as Date),
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Saved (bookmarks) ────────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Saved"
          actionHref="/bookmarks"
          actionLabel="See all saved items"
        />
        {data.bookmarks.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Nothing saved yet"
            blurb="Tap the bookmark icon on any story, dilemma, or debate to save it for later."
            action={
              <Button asChild variant="outline">
                <Link href="/stories">Browse stories</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {data.bookmarks.slice(0, 6).map((b) => (
              <Link
                key={b.id}
                href={
                  b.itemType === 'story'
                    ? `/stories/${b.itemId}`
                    : b.itemType === 'debate'
                      ? `/debate-arena/${b.itemId}`
                      : '/community-dilemmas'
                }
                className="rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm flex items-center gap-2 hover:border-primary/40 transition-colors"
              >
                <Bookmark className="h-4 w-4 text-primary shrink-0" />
                <span className="flex-1 min-w-0 truncate">{b.title}</span>
                <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                  {b.itemType}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Reflections archive (linked) ─────────────────────────── */}
      <section>
        <SectionHeader
          title="Your past thinking"
          actionHref="/me/reflections"
          actionLabel="Open the archive"
        />
        <p className="text-sm text-muted-foreground">
          Every reflection you&apos;ve written across the platform &mdash;
          chapter wrap-ups, story endings, learning-path closing notes &mdash;
          collected in one place.
        </p>
      </section>
    </div>
  );
}

function ActivityTile({
  icon: Icon,
  label,
  value,
  href,
  accent,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  href: string;
  accent?: boolean;
}): JSX.Element {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl border p-3 backdrop-blur transition-colors hover:border-primary/40"
      style={{
        borderColor: accent
          ? 'hsl(var(--accent) / 0.2)'
          : 'hsl(var(--primary) / 0.2)',
        background: 'hsl(var(--card) / 0.25)',
      }}
    >
      <Icon
        className="h-4 w-4 shrink-0"
        style={{ color: accent ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }}
      />
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-[15px] font-bold">{value}</div>
      </div>
    </Link>
  );
}

function SectionHeader({
  title,
  actionHref,
  actionLabel,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}): JSX.Element {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-headline text-xl font-bold">{title}</h2>
      {actionHref && actionLabel && (
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
