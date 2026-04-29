'use client';

/**
 * /communities/[id]/feed — chronological activity feed for a community.
 *
 * Aggregates two event sources:
 *   - Forum topics  (new discussion posts)
 *   - Contributions (member-submitted dilemmas, frameworks, case studies)
 *
 * Merged into a single timeline ordered by createdAt desc. NOT real-time
 * (would need a listener) — page loads with a fresh snapshot, refresh
 * button manually re-fetches.
 *
 * The community page already has separate Forum and Contributions tabs;
 * this is the "show me everything happening here" surface that turns
 * community membership into a rhythm rather than a tab-by-tab grind.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  ArrowRight,
  ChevronLeft,
  Loader2,
  MessageSquare,
  Pin,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { listForumTopics } from '@/app/actions/forum';
import { getContributions } from '@/app/actions/contributions';
import { getCommunity } from '@/app/actions/communities';
import type {
  ForumTopic,
  CommunityContribution,
  Community,
} from '@/types';

type FeedEvent =
  | { kind: 'topic'; at: Date; data: ForumTopic }
  | { kind: 'contribution'; at: Date; data: CommunityContribution };

function eventTime(e: FeedEvent): number {
  return e.at.getTime();
}

function CommunityFeedPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const communityId = params?.id;
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [events, setEvents] = useState<FeedEvent[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!communityId) return;
    setRefreshing(true);
    const [communityRes, topicsRes, contribsRes] = await Promise.all([
      getCommunity(communityId),
      listForumTopics({ communityId, max: 50 }),
      getContributions(communityId),
    ]);
    if (communityRes.success) setCommunity(communityRes.data);
    const merged: FeedEvent[] = [];
    if (topicsRes.success) {
      for (const t of topicsRes.data) {
        const at =
          (t.lastReplyAt instanceof Date ? t.lastReplyAt : null) ||
          (t.createdAt instanceof Date ? t.createdAt : null);
        if (at) merged.push({ kind: 'topic', at, data: t });
      }
    }
    if (contribsRes.success) {
      for (const c of contribsRes.data) {
        const at = c.createdAt instanceof Date ? c.createdAt : null;
        if (at) merged.push({ kind: 'contribution', at, data: c });
      }
    }
    merged.sort((a, b) => eventTime(b) - eventTime(a));
    setEvents(merged.slice(0, 80));
    setRefreshing(false);
  }

  useEffect(() => {
    if (!communityId) return;
    let cancelled = false;
    (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  const eventsByDay = useMemo(() => {
    if (!events) return [];
    const groups: { day: string; label: string; events: FeedEvent[] }[] = [];
    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`;
    let current: { day: string; label: string; events: FeedEvent[] } | null =
      null;
    const today = dayKey(new Date());
    const yesterday = dayKey(new Date(Date.now() - 86400 * 1000));
    for (const e of events) {
      const k = dayKey(e.at);
      if (!current || current.day !== k) {
        let label: string;
        if (k === today) label = 'Today';
        else if (k === yesterday) label = 'Yesterday';
        else
          label = new Intl.DateTimeFormat(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          }).format(e.at);
        current = { day: k, label, events: [] };
        groups.push(current);
      }
      current.events.push(e);
    }
    return groups;
  }, [events]);

  if (!communityId) {
    return null;
  }

  if (events === null) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-10">
      <header className="mb-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-3 h-7 gap-1 px-2 text-xs text-muted-foreground"
        >
          <Link href={`/communities/${communityId}`}>
            <ChevronLeft className="h-3 w-3" />
            Back to{' '}
            {community?.name ? `"${community.name}"` : 'community'}
          </Link>
        </Button>
        <div className="flex flex-wrap items-baseline gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Activity feed
            </div>
            <h1 className="mt-1 font-headline text-3xl font-bold tracking-tight md:text-4xl">
              {community?.name || 'Community'} happenings
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Discussions and contributions from the past few weeks, newest
              first.
            </p>
          </div>
          <span className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>
      </header>

      {events.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No activity yet"
          blurb="Once members post discussions or contribute dilemmas, you'll see them here as a single chronological stream."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/communities/${communityId}?tab=forum`}>
                  Start a discussion
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/communities/${communityId}/contributions`}>
                  Contribute
                </Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-8">
          {eventsByDay.map((group) => (
            <section key={group.day}>
              <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {group.label}
              </h2>
              <ol className="space-y-2">
                {group.events.map((e) => (
                  <li key={`${e.kind}-${e.kind === 'topic' ? e.data.id : e.data.id}`}>
                    <FeedRow event={e} communityId={communityId} />
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedRow({
  event,
  communityId,
}: {
  event: FeedEvent;
  communityId: string;
}): JSX.Element {
  if (event.kind === 'topic') {
    const t = event.data;
    return (
      <Card className="bg-card/60 transition-colors hover:bg-card/80">
        <CardContent className="flex items-start gap-3 py-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
            {t.pinned ? (
              <Pin className="h-4 w-4" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <Link
                href={`/communities/${communityId}?tab=forum&topic=${t.id}`}
                className="font-semibold text-foreground hover:text-primary"
              >
                {t.title}
              </Link>
              {t.pinned && (
                <Badge variant="outline" className="text-[10px]">
                  Pinned
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                · {t.authorName}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDistanceToNowStrict(event.at)} ago
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {t.body}
            </p>
            {(t.replyCount ?? 0) > 0 && (
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                <Users className="mr-1 inline h-3 w-3" />
                {t.replyCount}{' '}
                {(t.replyCount ?? 0) === 1 ? 'reply' : 'replies'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // contribution
  const c = event.data;
  return (
    <Card className="bg-card/60 transition-colors hover:bg-card/80">
      <CardContent className="flex items-start gap-3 py-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <Link
              href={`/communities/${communityId}/contributions/${c.id}`}
              className="font-semibold text-foreground hover:text-accent"
            >
              {c.title}
            </Link>
            <Badge variant="outline" className="text-[10px] uppercase">
              {c.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              · {c.contributorName}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {formatDistanceToNowStrict(event.at)} ago
            </span>
          </div>
          {c.summary && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {c.summary}
            </p>
          )}
          <Link
            href={`/communities/${communityId}/contributions/${c.id}`}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
          >
            Open contribution <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default CommunityFeedPage;
