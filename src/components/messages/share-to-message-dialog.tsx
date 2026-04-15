'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Send,
  Loader2,
  Search,
  UserCircle,
  MessageCircle,
  Plus,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  listUserThreads,
  sendMessage,
  getOrCreateThread,
} from '@/app/actions/messages';
import { getDirectoryUsers, type DirectoryUser } from '@/app/actions/directory';
import type { DirectMessage, MessageThread } from '@/types';
import { cn } from '@/lib/utils';

export interface ShareToMessageDialogProps {
  artifact: NonNullable<DirectMessage['attachedArtifact']>;
  trigger?: React.ReactNode;
}

export function ShareToMessageDialog({
  artifact,
  trigger,
}: ShareToMessageDialogProps): React.ReactElement | null {
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sendingToId, setSendingToId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;

    setThreadsLoading(true);
    (async () => {
      try {
        const result = await listUserThreads(user.uid);
        if (!cancelled && result.success) {
          setThreads(result.data);
        }
      } catch (err) {
        console.error('[ShareToMessageDialog] listUserThreads failed:', err);
      } finally {
        if (!cancelled) setThreadsLoading(false);
      }
    })();

    setUsersLoading(true);
    (async () => {
      try {
        const result = await getDirectoryUsers({ max: 200 });
        if (!cancelled && result.success) {
          setUsers(result.data);
        }
      } catch (err) {
        console.error('[ShareToMessageDialog] getDirectoryUsers failed:', err);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, user]);

  async function handleShareToThread(thread: MessageThread) {
    if (!user) return;
    setSendingToId(thread.id);
    try {
      const result = await sendMessage({
        threadId: thread.id,
        senderId: user.uid,
        senderName:
          user.displayName || user.email?.split('@')[0] || 'Anonymous',
        content: '',
        attachedArtifact: artifact,
      });
      if (result.success) {
        toast({
          title: 'Shared to conversation',
          description: `Sent "${artifact.title}".`,
        });
        setOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to share',
          description: result.error,
        });
      }
    } finally {
      setSendingToId(null);
    }
  }

  async function handleShareToUser(target: DirectoryUser) {
    if (!user) return;
    setSendingToId(target.uid);
    try {
      const threadRes = await getOrCreateThread(
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Anonymous',
        user.photoURL || undefined,
        target.uid,
        target.displayName,
        target.avatarUrl
      );
      if (!threadRes.success) {
        toast({
          variant: 'destructive',
          title: 'Could not start conversation',
          description: threadRes.error,
        });
        return;
      }
      const sendRes = await sendMessage({
        threadId: threadRes.data.id,
        senderId: user.uid,
        senderName:
          user.displayName || user.email?.split('@')[0] || 'Anonymous',
        content: '',
        attachedArtifact: artifact,
      });
      if (sendRes.success) {
        toast({
          title: 'Shared to conversation',
          description: `Sent "${artifact.title}" to ${target.displayName}.`,
        });
        setOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to share',
          description: sendRes.error,
        });
      }
    } finally {
      setSendingToId(null);
    }
  }

  if (!user) return null;

  const lowerSearch = search.trim().toLowerCase();

  const filteredThreads = threads.filter((t) => {
    if (!lowerSearch) return true;
    const otherId = t.participantIds.find((id) => id !== user.uid);
    const name = otherId ? t.participants?.[otherId]?.name || '' : '';
    return name.toLowerCase().includes(lowerSearch);
  });

  const filteredUsers = users.filter((u) => {
    if (u.uid === user.uid) return false;
    if (!lowerSearch) return true;
    return u.displayName.toLowerCase().includes(lowerSearch);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Share via message
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-sm max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Share via direct message
          </DialogTitle>
          <DialogDescription>
            Attach &quot;{artifact.title}&quot; to a conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search people or conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="threads">
              <MessageCircle className="mr-2 h-4 w-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="new">
              <Plus className="mr-2 h-4 w-4" />
              New Conversation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="threads" className="mt-3">
            <div className="max-h-[320px] overflow-y-auto">
              {threadsLoading ? (
                <div className="space-y-3 p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No conversations {lowerSearch ? 'match that search' : 'yet'}.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filteredThreads.map((t) => {
                    const otherId = t.participantIds.find(
                      (id) => id !== user.uid
                    );
                    const other = otherId
                      ? t.participants?.[otherId]
                      : undefined;
                    const name = other?.name || 'Conversation';
                    const initial = name.charAt(0).toUpperCase() || '?';
                    const busy = sendingToId === t.id;
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          disabled={busy || !!sendingToId}
                          onClick={() => handleShareToThread(t)}
                          className={cn(
                            'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/50 disabled:opacity-50'
                          )}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={other?.avatarUrl}
                              alt={name}
                            />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {name}
                            </p>
                            {t.lastMessageAt && (
                              <p className="text-[11px] text-muted-foreground">
                                {formatDistanceToNow(
                                  t.lastMessageAt instanceof Date
                                    ? t.lastMessageAt
                                    : new Date(t.lastMessageAt),
                                  { addSuffix: true }
                                )}
                              </p>
                            )}
                          </div>
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Send className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-3">
            <div className="max-h-[320px] overflow-y-auto">
              {usersLoading ? (
                <div className="space-y-3 p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
                  <UserCircle className="h-8 w-8 text-muted-foreground/60" />
                  No people available.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filteredUsers.map((u) => {
                    const initial =
                      u.displayName?.charAt(0).toUpperCase() || '?';
                    const busy = sendingToId === u.uid;
                    return (
                      <li key={u.uid}>
                        <button
                          type="button"
                          disabled={busy || !!sendingToId}
                          onClick={() => handleShareToUser(u)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/50 disabled:opacity-50"
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={u.avatarUrl}
                              alt={u.displayName}
                            />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {u.displayName}
                            </p>
                            {u.dominantFramework && (
                              <Badge
                                variant="secondary"
                                className="mt-0.5 text-[10px]"
                              >
                                <span className="truncate">
                                  {u.dominantFramework}
                                </span>
                              </Badge>
                            )}
                          </div>
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Send className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
