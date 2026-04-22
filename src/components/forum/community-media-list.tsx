'use client';

/**
 * Community media list — shown as a tab inside the community detail
 * page. Community managers and instructors can add or remove sci-fi
 * media items; every member sees the list and can click through to
 * the media page, where the discussion board for this community will
 * be active.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Film,
  Gamepad2,
  Tv2,
  Plus,
  Loader2,
  Trash2,
  MessageSquare,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  addMediaToCommunity,
  removeMediaFromCommunity,
  listCommunityMedia,
  type CommunityMediaEntry,
} from '@/app/actions/community-media';
import { scifiMediaData } from '@/data/scifi-media';

const CATEGORY_ICON = {
  movie: Film,
  book: BookOpen,
  tv: Tv2,
  other: Gamepad2,
} as const;

interface Props {
  communityId: string;
  /** When true, the viewer can add/remove media (super-admin,
   *  community manager, or instructor of this community). */
  canCurate: boolean;
}

export function CommunityMediaList({ communityId, canCurate }: Props): JSX.Element {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CommunityMediaEntry[] | null>(null);
  const [selecting, setSelecting] = useState<string | ''>('');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  async function load(): Promise<void> {
    const res = await listCommunityMedia(communityId);
    setItems(res.success ? res.data : []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  async function handleAdd(): Promise<void> {
    if (!user || !selecting) return;
    setAdding(true);
    const res = await addMediaToCommunity({
      communityId,
      mediaId: selecting,
      requesterId: user.uid,
    });
    setAdding(false);
    if (res.success) {
      toast({ title: 'Added to community.' });
      setSelecting('');
      void load();
    } else {
      toast({
        title: 'Could not add',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  async function handleRemove(mediaId: string): Promise<void> {
    if (!user || !canCurate) return;
    const confirmed = window.confirm(
      'Remove this media item from the community? Existing discussions will be preserved but no longer surfaced here.'
    );
    if (!confirmed) return;
    setRemovingId(mediaId);
    const res = await removeMediaFromCommunity({
      communityId,
      mediaId,
      requesterId: user.uid,
    });
    setRemovingId(null);
    if (res.success) {
      toast({ title: 'Removed from community.' });
      void load();
    } else {
      toast({
        title: 'Could not remove',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  // Candidates for the add picker: everything in the global media list
  // that is not already in this community.
  const addedIds = new Set((items || []).map((i) => i.mediaId));
  const searchLower = search.trim().toLowerCase();
  const candidates = scifiMediaData.filter(
    (m) =>
      !addedIds.has(m.id) &&
      (!searchLower || m.title.toLowerCase().includes(searchLower))
  );

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" />
          Community media
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {canCurate
            ? 'Add sci-fi books, films, shows, or games. Each item gets its own community discussion board — a book club, a watch-along, a play-through.'
            : 'Media items curated by the community managers. Click through to join the discussion on each.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {canCurate && (
          <div className="space-y-2 rounded-md border border-primary/30 bg-primary/5 p-3">
            <div className="text-xs font-semibold">Add a media item</div>
            <Input
              placeholder="Search the media library…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
            <div className="flex gap-2">
              <Select value={selecting} onValueChange={setSelecting}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a media item" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.slice(0, 50).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title} <span className="text-muted-foreground">({m.year})</span>
                    </SelectItem>
                  ))}
                  {candidates.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      No matches.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} disabled={!selecting || adding}>
                {adding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                )}
                Add
              </Button>
            </div>
          </div>
        )}

        {items === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            {canCurate
              ? 'Nothing added yet. Pick a book or film to kick things off.'
              : 'The community managers have not added any media yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((entry) => {
              const Icon =
                CATEGORY_ICON[entry.category as keyof typeof CATEGORY_ICON] ||
                Gamepad2;
              return (
                <div
                  key={entry.mediaId}
                  className="flex items-start gap-3 rounded-md border border-border/50 p-3 hover:border-primary/40 transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/scifi-media/${entry.mediaId}?community=${communityId}`}
                      className="font-semibold text-foreground hover:text-primary truncate"
                    >
                      {entry.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      Added by {entry.addedByName}
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                  >
                    <Link
                      href={`/scifi-media/${entry.mediaId}?community=${communityId}#discussion`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Discuss
                    </Link>
                  </Button>
                  {canCurate && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleRemove(entry.mediaId)}
                      disabled={removingId === entry.mediaId}
                      title="Remove from community"
                    >
                      {removingId === entry.mediaId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
