'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Send,
  Shield,
  Loader2,
  BookOpen,
  Users,
  Scale,
  FlaskConical,
  GitCompare,
  ScrollText,
  Compass,
  ExternalLink,
  UserCircle,
} from 'lucide-react';

import {
  getThread,
  listMessages,
  markThreadRead,
  sendMessage,
} from '@/app/actions/messages';
import { blockUser } from '@/app/actions/user-blocks';
import type { DirectMessage, MessageThread } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const MESSAGES_POLL_MS = 10_000;

interface ThreadViewProps {
  threadId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatarUrl?: string;
  /** Called when the current user blocks the other participant so the parent can refresh. */
  onBlocked?: () => void;
}

type AttachmentType = NonNullable<DirectMessage['attachedArtifact']>['type'];

function artifactRoute(type: AttachmentType, id: string): string {
  switch (type) {
    case 'story':
      return `/stories/${id}`;
    case 'dilemma':
      return `/community-dilemmas/${id}`;
    case 'debate':
      return `/debate-arena/${id}`;
    case 'analysis':
      return `/analyzer?analysis=${id}`;
    case 'perspective':
      return `/perspective-comparison?id=${id}`;
    case 'philosopher':
      return `/philosophers/${id}`;
    case 'theory':
      return `/framework-explorer?theory=${id}`;
    default:
      return '/';
  }
}

function ArtifactIcon({
  type,
  className,
}: {
  type: AttachmentType;
  className?: string;
}): React.ReactElement {
  const c = cn('h-4 w-4', className);
  switch (type) {
    case 'story':
      return <BookOpen className={c} />;
    case 'dilemma':
      return <Users className={c} />;
    case 'debate':
      return <Scale className={c} />;
    case 'analysis':
      return <FlaskConical className={c} />;
    case 'perspective':
      return <GitCompare className={c} />;
    case 'philosopher':
      return <ScrollText className={c} />;
    case 'theory':
      return <Compass className={c} />;
    default:
      return <ExternalLink className={c} />;
  }
}

export function ThreadView({
  threadId,
  currentUserId,
  currentUserName,
  currentUserAvatarUrl,
  onBlocked,
}: ThreadViewProps): React.ReactElement {
  const { toast } = useToast();
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCountRef = useRef(0);

  const otherUserId = useMemo(() => {
    if (!thread) return null;
    return (
      thread.participantIds.find((id) => id !== currentUserId) ?? null
    );
  }, [thread, currentUserId]);

  const otherParticipant = useMemo(() => {
    if (!thread || !otherUserId) return null;
    return thread.participants?.[otherUserId];
  }, [thread, otherUserId]);

  const loadThread = useCallback(async () => {
    const result = await getThread(threadId);
    if (result.success && result.data) {
      setThread(result.data);
    }
  }, [threadId]);

  const loadMessages = useCallback(async () => {
    const result = await listMessages(threadId);
    if (result.success) {
      setMessages(result.data);
    }
  }, [threadId]);

  // Auto-scroll to bottom when new messages arrive.
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && scrollRef.current) {
      // Slight delay to let DOM update.
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
    lastMessageCountRef.current = messages.length;
  }, [messages]);

  // Initial load + mark read.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessages([]);
    lastMessageCountRef.current = 0;

    (async () => {
      await Promise.all([loadThread(), loadMessages()]);
      if (!cancelled) setLoading(false);
      // Mark thread read on open
      try {
        await markThreadRead(threadId, currentUserId);
      } catch (err) {
        console.error('[ThreadView] markThreadRead failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [threadId, currentUserId, loadThread, loadMessages]);

  // Poll messages every 10s while visible.
  useEffect(() => {
    function startPolling() {
      if (pollTimerRef.current) return;
      pollTimerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          void loadMessages();
        }
      }, MESSAGES_POLL_MS);
    }
    function stopPolling() {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        void loadMessages();
        void markThreadRead(threadId, currentUserId).catch(() => {});
        startPolling();
      } else {
        stopPolling();
      }
    }

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [threadId, currentUserId, loadMessages]);

  // On focus, clear unread.
  useEffect(() => {
    function onFocus() {
      void markThreadRead(threadId, currentUserId).catch(() => {});
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [threadId, currentUserId]);

  async function handleSend() {
    if (!content.trim() || sending) return;
    const text = content.trim();

    // Optimistic append
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: DirectMessage = {
      id: optimisticId,
      threadId,
      senderId: currentUserId,
      senderName: currentUserName,
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setContent('');
    setSending(true);

    const result = await sendMessage({
      threadId,
      senderId: currentUserId,
      senderName: currentUserName,
      content: text,
    });

    setSending(false);

    if (!result.success) {
      // Rollback
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setContent(text);
      toast({
        variant: 'destructive',
        title: 'Failed to send',
        description: result.error,
      });
    } else {
      // Refetch to replace optimistic with real one.
      void loadMessages();
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  async function handleBlock() {
    if (!otherUserId) return;
    setBlocking(true);
    try {
      const result = await blockUser(currentUserId, otherUserId);
      if (result.success) {
        toast({
          title: 'User blocked',
          description: 'You will no longer receive messages from them.',
        });
        onBlocked?.();
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to block user',
          description: result.error,
        });
      }
    } finally {
      setBlocking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="ml-auto h-12 w-1/2" />
          <Skeleton className="h-16 w-3/4" />
        </div>
      </div>
    );
  }

  const otherName = otherParticipant?.name || 'Conversation';
  const otherAvatar = otherParticipant?.avatarUrl;
  const otherInitial = otherName.charAt(0).toUpperCase() || '?';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card/60 px-4 py-3 backdrop-blur-sm">
        <Link
          href={otherUserId ? `/users/${otherUserId}` : '#'}
          className="flex min-w-0 items-center gap-3 hover:opacity-80"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherAvatar} alt={otherName} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {otherAvatar ? otherInitial : <UserCircle className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">{otherName}</p>
            <p className="text-xs text-muted-foreground">View profile</p>
          </div>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={blocking}>
              <Shield className="mr-2 h-4 w-4" />
              Block
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Block {otherName}?</AlertDialogTitle>
              <AlertDialogDescription>
                Once blocked, they won&apos;t be able to send you messages and
                you won&apos;t be able to message them. You can unblock from
                your settings later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBlock}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Block user
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-4">
          {messages.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((msg) => {
              const isSelf = msg.senderId === currentUserId;
              const senderAvatar = isSelf
                ? currentUserAvatarUrl
                : otherAvatar;
              const senderInitial =
                (msg.senderName || otherName).charAt(0).toUpperCase() || '?';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2',
                    isSelf ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isSelf && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={senderAvatar} alt={msg.senderName} />
                      <AvatarFallback className="bg-muted text-xs">
                        {senderInitial}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
                      isSelf
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    )}
                  >
                    {msg.content && (
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {msg.content}
                      </p>
                    )}
                    {msg.attachedArtifact && (
                      <div
                        className={cn(
                          'mt-2 flex items-center gap-2 rounded-lg border p-2',
                          isSelf
                            ? 'border-primary-foreground/30 bg-primary-foreground/10'
                            : 'border-border bg-background/50'
                        )}
                      >
                        <ArtifactIcon
                          type={msg.attachedArtifact.type}
                          className={cn(
                            'shrink-0',
                            isSelf ? 'text-primary-foreground' : 'text-primary'
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold capitalize">
                            {msg.attachedArtifact.type}
                          </p>
                          <p className="truncate text-sm">
                            {msg.attachedArtifact.title}
                          </p>
                        </div>
                        <Button
                          asChild
                          variant={isSelf ? 'secondary' : 'outline'}
                          size="sm"
                          className="h-7 shrink-0 text-xs"
                        >
                          <Link
                            href={artifactRoute(
                              msg.attachedArtifact.type,
                              msg.attachedArtifact.id
                            )}
                          >
                            Open
                          </Link>
                        </Button>
                      </div>
                    )}
                    <p
                      className={cn(
                        'mt-1 text-[10px] opacity-70',
                        isSelf ? 'text-right' : 'text-left'
                      )}
                    >
                      {formatDistanceToNow(
                        msg.createdAt instanceof Date
                          ? msg.createdAt
                          : new Date(msg.createdAt),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t bg-card/60 p-3 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="min-h-[44px] resize-none"
            disabled={sending}
          />
          <Button
            onClick={() => void handleSend()}
            disabled={!content.trim() || sending}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
