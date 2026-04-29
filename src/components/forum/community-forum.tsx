'use client';

/**
 * Community forum — topic listing + compose form.
 *
 * Renders as a single tab content surface. Pinned topics float to the
 * top. Only community managers see the "Pin this topic" control on
 * the compose form; the server rejects a pinned request from anyone
 * else regardless of what the client sends.
 *
 * The same component is reused for the per-media discussion board by
 * passing a `mediaId` prop. When `mediaId` is set, the create form
 * attaches the mediaId to every topic, and the list filter selects
 * only topics belonging to that media.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  Pin,
  Lock,
  MessageSquare,
  Plus,
  Loader2,
  Shield,
  ArrowRight,
  Trash2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ConfirmAction } from '@/components/ui/confirm-action';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  createForumTopic,
  listForumTopics,
  setTopicPinned,
  setTopicLocked,
} from '@/app/actions/forum';
import type { ForumTopic } from '@/types';

interface CommunityForumProps {
  communityId: string;
  /** When set, renders the per-media discussion variant. Topics are
   *  scoped to the media item and the card title reflects that. */
  mediaId?: string;
  /** Shown above the compose form. Lets us say "Start a discussion"
   *  for the media board vs. "Start a topic" for the general forum. */
  composeLabel?: string;
  /** True when the viewer is a super-admin or community manager;
   *  drives the pin toggle and the remove-reply controls downstream. */
  viewerIsManager: boolean;
  /** Pass-through so we know whether to gate the compose form. */
  viewerIsMember: boolean;
}

export function CommunityForum({
  communityId,
  mediaId,
  composeLabel,
  viewerIsManager,
  viewerIsMember,
}: CommunityForumProps): JSX.Element {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<ForumTopic[] | null>(null);
  const [composing, setComposing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [wantsPinned, setWantsPinned] = useState(false);
  const [pendingTopicId, setPendingTopicId] = useState<string | null>(null);

  async function load(): Promise<void> {
    const res = await listForumTopics({
      communityId,
      mediaId: mediaId || null,
    });
    setTopics(res.success ? res.data : []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, mediaId]);

  const canPost = viewerIsMember || viewerIsManager;

  async function handleSubmit(): Promise<void> {
    if (!user) return;
    if (!title.trim() || !body.trim()) {
      toast({ title: 'Title and body are required.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const res = await createForumTopic({
      communityId,
      requesterId: user.uid,
      title,
      body,
      pinned: wantsPinned && viewerIsManager,
      mediaId,
    });
    setSubmitting(false);
    if (res.success) {
      setTitle('');
      setBody('');
      setWantsPinned(false);
      setComposing(false);
      toast({ title: 'Topic posted.' });
      void load();
    } else {
      toast({
        title: 'Could not post topic',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  async function handleTogglePinned(topic: ForumTopic): Promise<void> {
    if (!user || !viewerIsManager) return;
    setPendingTopicId(topic.id);
    const res = await setTopicPinned({
      communityId,
      topicId: topic.id,
      pinned: !topic.pinned,
      requesterId: user.uid,
    });
    setPendingTopicId(null);
    if (res.success) {
      toast({ title: topic.pinned ? 'Topic unpinned.' : 'Topic pinned.' });
      void load();
    } else {
      toast({
        title: 'Could not update topic',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  async function handleToggleLocked(topic: ForumTopic): Promise<void> {
    if (!user || !viewerIsManager) return;
    setPendingTopicId(topic.id);
    const res = await setTopicLocked({
      communityId,
      topicId: topic.id,
      locked: !topic.locked,
      requesterId: user.uid,
    });
    setPendingTopicId(null);
    if (res.success) {
      toast({ title: topic.locked ? 'Topic unlocked.' : 'Topic locked.' });
      void load();
    } else {
      toast({
        title: 'Could not update topic',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  const pinned = useMemo(
    () => (topics || []).filter((t) => t.pinned),
    [topics]
  );
  const regular = useMemo(
    () => (topics || []).filter((t) => !t.pinned),
    [topics]
  );

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-primary" />
            {mediaId ? 'Discussion board' : 'Community forum'}
          </CardTitle>
          {canPost && !composing && (
            <Button size="sm" onClick={() => setComposing(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {composeLabel || (mediaId ? 'Start a discussion' : 'Start a topic')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!canPost && (
            <p className="text-sm text-muted-foreground">
              Join this community to post and reply.
            </p>
          )}

          {composing && (
            <div className="space-y-3 rounded-md border border-primary/30 bg-primary/5 p-3">
              <div>
                <Label htmlFor="topic-title" className="text-xs">
                  Title
                </Label>
                <Input
                  id="topic-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    mediaId
                      ? 'What do you want to talk about in this work?'
                      : 'Topic title'
                  }
                  maxLength={180}
                />
              </div>
              <div>
                <Label htmlFor="topic-body" className="text-xs">
                  Opening post
                </Label>
                <Textarea
                  id="topic-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share your question or argument. Be specific."
                  rows={5}
                />
              </div>
              {viewerIsManager && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="topic-pinned"
                    checked={wantsPinned}
                    onCheckedChange={setWantsPinned}
                  />
                  <Label htmlFor="topic-pinned" className="text-xs">
                    Pin this topic to the top of the forum
                  </Label>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setComposing(false);
                    setTitle('');
                    setBody('');
                    setWantsPinned(false);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          )}

          {topics === null ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : topics.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              {mediaId
                ? 'No discussions yet. Be the first to start one.'
                : 'The forum is quiet. Start the first topic.'}
            </p>
          ) : (
            <div className="space-y-3">
              {pinned.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    Pinned by the community manager
                  </div>
                  {pinned.map((t) => (
                    <TopicRow
                      key={t.id}
                      communityId={communityId}
                      topic={t}
                      viewerIsManager={viewerIsManager}
                      onTogglePinned={handleTogglePinned}
                      onToggleLocked={handleToggleLocked}
                      pendingTopicId={pendingTopicId}
                    />
                  ))}
                </div>
              )}
              {regular.length > 0 && (
                <div className="space-y-2">
                  {pinned.length > 0 && (
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Recent activity
                    </div>
                  )}
                  {regular.map((t) => (
                    <TopicRow
                      key={t.id}
                      communityId={communityId}
                      topic={t}
                      viewerIsManager={viewerIsManager}
                      onTogglePinned={handleTogglePinned}
                      onToggleLocked={handleToggleLocked}
                      pendingTopicId={pendingTopicId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TopicRowProps {
  communityId: string;
  topic: ForumTopic;
  viewerIsManager: boolean;
  onTogglePinned: (t: ForumTopic) => void;
  onToggleLocked: (t: ForumTopic) => void;
  pendingTopicId: string | null;
}

function TopicRow({
  communityId,
  topic,
  viewerIsManager,
  onTogglePinned,
  onToggleLocked,
  pendingTopicId,
}: TopicRowProps): JSX.Element {
  const last =
    (topic.lastReplyAt instanceof Date && topic.lastReplyAt) ||
    (topic.createdAt instanceof Date ? topic.createdAt : null);
  return (
    <div className="flex items-start gap-3 rounded-md border border-border/50 p-3 hover:border-primary/40 transition-colors">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {topic.pinned && (
            <Badge
              variant="outline"
              className="border-primary/50 text-primary text-[10px]"
            >
              <Pin className="h-2.5 w-2.5 mr-1" />
              Pinned
            </Badge>
          )}
          {topic.locked && (
            <Badge
              variant="outline"
              className="border-muted-foreground/40 text-muted-foreground text-[10px]"
            >
              <Lock className="h-2.5 w-2.5 mr-1" />
              Locked
            </Badge>
          )}
          <Link
            href={`/communities/${communityId}/forum/${topic.id}`}
            className="font-semibold text-foreground hover:text-primary truncate"
          >
            {topic.title}
          </Link>
        </div>
        <div className="text-xs text-muted-foreground">
          by {topic.authorName}
          {last && <> · {formatDistanceToNowStrict(last)} ago</>}
          {' · '}
          {topic.replyCount === 0
            ? 'No replies yet'
            : topic.replyCount === 1
              ? '1 reply'
              : `${topic.replyCount} replies`}
        </div>
      </div>
      {viewerIsManager && (
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[11px]"
            onClick={() => onTogglePinned(topic)}
            disabled={pendingTopicId === topic.id}
            title={topic.pinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[11px]"
            onClick={() => onToggleLocked(topic)}
            disabled={pendingTopicId === topic.id}
            title={topic.locked ? 'Unlock' : 'Lock replies'}
          >
            <Lock className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Topic detail view (reused by the forum/[topicId] and media
   discussion detail routes). Loads replies live.
   ────────────────────────────────────────────────────────────────── */

import { listForumReplies, createForumReply, removeForumReply } from '@/app/actions/forum';
import type { ForumReply } from '@/types';

interface TopicDetailProps {
  topic: ForumTopic;
  viewerIsManager: boolean;
  viewerIsMember: boolean;
}

export function ForumTopicDetail({
  topic,
  viewerIsManager,
  viewerIsMember,
}: TopicDetailProps): JSX.Element {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replies, setReplies] = useState<ForumReply[] | null>(null);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function load(): Promise<void> {
    const res = await listForumReplies({
      communityId: topic.communityId,
      topicId: topic.id,
    });
    setReplies(res.success ? res.data : []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  const canReply = (viewerIsMember || viewerIsManager) && (!topic.locked || viewerIsManager);

  async function handleReply(): Promise<void> {
    if (!user || !body.trim()) return;
    setSubmitting(true);
    const res = await createForumReply({
      communityId: topic.communityId,
      topicId: topic.id,
      body,
      requesterId: user.uid,
    });
    setSubmitting(false);
    if (res.success) {
      setBody('');
      void load();
    } else {
      toast({
        title: 'Could not post reply',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  async function handleRemove(reply: ForumReply): Promise<void> {
    if (!user || !viewerIsManager) return;
    setRemovingId(reply.id);
    const res = await removeForumReply({
      communityId: topic.communityId,
      topicId: topic.id,
      replyId: reply.id,
      requesterId: user.uid,
    });
    setRemovingId(null);
    if (res.success) {
      toast({ title: 'Reply removed.' });
      void load();
    } else {
      toast({
        title: 'Could not remove reply',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-5">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {topic.pinned && <Pin className="h-4 w-4 text-primary" />}
            {topic.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
            {topic.title}
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            Posted by {topic.authorName}
            {topic.createdAt instanceof Date && (
              <> · {formatDistanceToNowStrict(topic.createdAt)} ago</>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {topic.body}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="text-sm font-semibold">
          {replies === null
            ? 'Loading replies…'
            : replies.length === 0
              ? 'No replies yet.'
              : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
        </div>
        {(replies || []).map((r) => (
          <Card
            key={r.id}
            className="bg-card/60 backdrop-blur-sm border-border/60"
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {r.authorName}
                </span>
                {r.createdAt instanceof Date && (
                  <span>· {formatDistanceToNowStrict(r.createdAt)} ago</span>
                )}
                {r.removedByManagerId && (
                  <Badge
                    variant="outline"
                    className="border-destructive/50 text-destructive text-[10px]"
                  >
                    Removed by manager
                  </Badge>
                )}
                {viewerIsManager && !r.removedByManagerId && (
                  <ConfirmAction
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto h-7 px-2 text-[11px] text-destructive"
                        disabled={removingId === r.id}
                      >
                        {removingId === r.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Remove
                      </Button>
                    }
                    title="Remove this reply?"
                    description="The body will be scrubbed and the post will show as removed by a manager. The author will not be notified, and you can't undo this."
                    confirmLabel="Remove reply"
                    onConfirm={() => handleRemove(r)}
                  />
                )}
              </div>
              <div
                className={`whitespace-pre-wrap text-sm leading-relaxed ${
                  r.removedByManagerId
                    ? 'italic text-muted-foreground'
                    : 'text-foreground/90'
                }`}
              >
                {r.body}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {canReply ? (
        <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
          <CardContent className="p-4 space-y-3">
            <Label htmlFor="reply-body" className="text-xs">
              Your reply
            </Label>
            <Textarea
              id="reply-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Respond to the opening post."
            />
            <div className="flex justify-end">
              <Button
                onClick={handleReply}
                disabled={submitting || !body.trim()}
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                )}
                Post reply
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : topic.locked ? (
        <p className="text-sm text-muted-foreground italic">
          This topic is locked. Only community managers can reply.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Join this community to reply.
        </p>
      )}

      {viewerIsManager && (
        <div className="text-[11px] text-muted-foreground">
          <Shield className="inline h-3 w-3 mr-1" />
          You are moderating this thread as a community manager.
        </div>
      )}
    </div>
  );
}
