'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, UserCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getDirectoryUsers, type DirectoryUser } from '@/app/actions/directory';
import { getOrCreateThread } from '@/app/actions/messages';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, the caller handles navigation; otherwise dialog pushes to /messages?thread=... */
  onSelectThread?: (threadId: string) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onSelectThread,
}: NewConversationDialogProps): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [startingForUid, setStartingForUid] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const result = await getDirectoryUsers({ max: 200 });
        if (cancelled) return;
        if (result.success) {
          setUsers(result.data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error('[NewConversationDialog] getDirectoryUsers failed:', err);
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const filtered = users.filter((u) => {
    if (user && u.uid === user.uid) return false;
    if (!search.trim()) return true;
    return u.displayName.toLowerCase().includes(search.trim().toLowerCase());
  });

  async function handleSelect(target: DirectoryUser) {
    if (!user) return;
    setStartingForUid(target.uid);
    try {
      const result = await getOrCreateThread(
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Anonymous',
        user.photoURL || undefined,
        target.uid,
        target.displayName,
        target.avatarUrl
      );
      if (result.success) {
        onOpenChange(false);
        setSearch('');
        if (onSelectThread) {
          onSelectThread(result.data.id);
        } else {
          router.push(`/messages?thread=${result.data.id}`);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Could not start conversation',
          description: result.error,
        });
      }
    } finally {
      setStartingForUid(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-sm max-w-lg">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Search for another explorer to start a private conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <ScrollArea className="h-[360px] pr-2">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading people...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <UserCircle className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                {users.length === 0
                  ? 'No people available yet. Invite someone to start a conversation.'
                  : 'No one matches that search.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((u) => {
                const initial = u.displayName?.charAt(0).toUpperCase() || '?';
                const busy = startingForUid === u.uid;
                return (
                  <li key={u.uid}>
                    <button
                      type="button"
                      onClick={() => handleSelect(u)}
                      disabled={busy || !!startingForUid}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/50 disabled:opacity-50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.avatarUrl} alt={u.displayName} />
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
                            className="mt-0.5 max-w-full text-[10px]"
                          >
                            <span className="truncate">
                              {u.dominantFramework}
                            </span>
                          </Badge>
                        )}
                      </div>
                      {busy && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
