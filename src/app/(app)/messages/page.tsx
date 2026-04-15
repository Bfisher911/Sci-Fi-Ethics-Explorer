'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Plus,
  UserCircle,
  Inbox as InboxIcon,
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { listUserThreads } from '@/app/actions/messages';
import type { MessageThread } from '@/types';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ThreadView } from '@/components/messages/thread-view';
import { NewConversationDialog } from '@/components/messages/new-conversation-dialog';

const THREADS_POLL_MS = 15_000;

function MessagesInner(): React.ReactElement | null {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryThreadId = searchParams?.get('thread') ?? null;

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    queryThreadId
  );
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchThreads = useCallback(
    async (uid: string, opts?: { silent?: boolean }) => {
      if (!opts?.silent) setThreadsLoading(true);
      try {
        const result = await listUserThreads(uid);
        if (result.success) {
          setThreads(result.data);
        } else {
          setThreads([]);
        }
      } catch (err) {
        console.error('[MessagesPage] listUserThreads failed:', err);
      } finally {
        if (!opts?.silent) setThreadsLoading(false);
      }
    },
    []
  );

  // Initial load.
  useEffect(() => {
    if (!user) return;
    void fetchThreads(user.uid);
  }, [user, fetchThreads]);

  // Polling with visibility awareness.
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    function start() {
      if (pollTimerRef.current) return;
      pollTimerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          void fetchThreads(uid, { silent: true });
        }
      }, THREADS_POLL_MS);
    }
    function stop() {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }
    function onVis() {
      if (document.visibilityState === 'visible') {
        void fetchThreads(uid, { silent: true });
        start();
      } else {
        stop();
      }
    }

    start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [user, fetchThreads]);

  // Sync query param -> active.
  useEffect(() => {
    if (queryThreadId && queryThreadId !== activeThreadId) {
      setActiveThreadId(queryThreadId);
    }
  }, [queryThreadId, activeThreadId]);

  // Auto-select first thread on md+ if none selected.
  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      // Don't auto-select; leave empty state for user choice on mobile.
      // But for desktop convenience we could. Skipping to be safe on mobile.
    }
  }, [activeThreadId, threads]);

  const handleSelectThread = useCallback(
    (threadId: string) => {
      setActiveThreadId(threadId);
      router.replace(`/messages?thread=${threadId}`);
    },
    [router]
  );

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }
  if (!user) return null;

  const otherParticipantFor = (t: MessageThread) => {
    const otherId = t.participantIds.find((id) => id !== user.uid);
    if (!otherId) return { uid: '', name: 'Conversation', avatarUrl: undefined };
    const p = t.participants?.[otherId];
    return {
      uid: otherId,
      name: p?.name || 'Explorer',
      avatarUrl: p?.avatarUrl,
    };
  };

  return (
    <div className="container mx-auto max-w-6xl">
      <Card className="overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="flex h-[calc(100vh-10rem)] flex-col md:flex-row">
          {/* Left: thread list */}
          <div
            className={cn(
              'flex flex-col border-b md:border-b-0 md:border-r',
              'w-full md:w-[320px] md:shrink-0',
              activeThreadId ? 'hidden md:flex' : 'flex'
            )}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h1 className="flex items-center gap-2 text-lg font-semibold">
                <MessageCircle className="h-5 w-5 text-primary" />
                Messages
              </h1>
              <Button
                size="sm"
                onClick={() => setNewDialogOpen(true)}
                aria-label="New message"
              >
                <Plus className="mr-1 h-4 w-4" />
                New
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {threadsLoading ? (
                <div className="space-y-3 p-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                  <InboxIcon className="h-10 w-10 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">
                    No conversations yet.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewDialogOpen(true)}
                  >
                    Start one
                  </Button>
                </div>
              ) : (
                <ul>
                  {threads.map((t) => {
                    const other = otherParticipantFor(t);
                    const unread = t.unreadCounts?.[user.uid] || 0;
                    const isActive = t.id === activeThreadId;
                    const initial =
                      other.name?.charAt(0).toUpperCase() || '?';
                    const lastTime = t.lastMessageAt
                      ? formatDistanceToNow(
                          t.lastMessageAt instanceof Date
                            ? t.lastMessageAt
                            : new Date(t.lastMessageAt),
                          { addSuffix: false }
                        )
                      : '';
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectThread(t.id)}
                          className={cn(
                            'flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-accent/40',
                            isActive && 'bg-accent/60'
                          )}
                        >
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage
                              src={other.avatarUrl}
                              alt={other.name}
                            />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {other.avatarUrl ? (
                                initial
                              ) : (
                                <UserCircle className="h-6 w-6" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={cn(
                                  'truncate text-sm font-medium',
                                  unread > 0 && 'font-semibold'
                                )}
                              >
                                {other.name}
                              </p>
                              {lastTime && (
                                <span className="shrink-0 text-[10px] text-muted-foreground">
                                  {lastTime}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={cn(
                                  'line-clamp-1 text-xs text-muted-foreground',
                                  unread > 0 && 'text-foreground'
                                )}
                              >
                                {t.lastMessage || (
                                  <span className="italic">
                                    No messages yet
                                  </span>
                                )}
                              </p>
                              {unread > 0 && (
                                <Badge
                                  variant="default"
                                  className="h-5 min-w-5 shrink-0 px-1.5 text-[10px]"
                                >
                                  {unread > 99 ? '99+' : unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Separator />
            <div className="p-3 text-center text-xs text-muted-foreground">
              Message Requests (0)
            </div>
          </div>

          {/* Right: thread view */}
          <div
            className={cn(
              'flex-1',
              activeThreadId ? 'flex flex-col' : 'hidden md:flex md:flex-col'
            )}
          >
            {activeThreadId ? (
              <>
                <div className="border-b px-3 py-2 md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveThreadId(null);
                      router.replace('/messages');
                    }}
                  >
                    ← Back to inbox
                  </Button>
                </div>
                <div className="flex-1 min-h-0">
                  <ThreadView
                    key={activeThreadId}
                    threadId={activeThreadId}
                    currentUserId={user.uid}
                    currentUserName={
                      user.displayName ||
                      user.email?.split('@')[0] ||
                      'Anonymous'
                    }
                    currentUserAvatarUrl={user.photoURL || undefined}
                    onBlocked={() => {
                      setActiveThreadId(null);
                      router.replace('/messages');
                      void fetchThreads(user.uid);
                    }}
                  />
                </div>
              </>
            ) : (
              <CardContent className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground/40" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Pick a conversation from the list, or start a new one.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setNewDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Conversation
                </Button>
              </CardContent>
            )}
          </div>
        </div>
      </Card>

      <NewConversationDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        onSelectThread={(id) => {
          setNewDialogOpen(false);
          handleSelectThread(id);
          if (user) void fetchThreads(user.uid, { silent: true });
        }}
      />
    </div>
  );
}

export default function MessagesPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-8 w-32" />
        </div>
      }
    >
      <MessagesInner />
    </Suspense>
  );
}
