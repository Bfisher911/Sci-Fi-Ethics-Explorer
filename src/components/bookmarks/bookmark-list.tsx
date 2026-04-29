'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink, Bookmark as BookmarkIcon } from 'lucide-react';
import type { Bookmark } from '@/types';
import Link from 'next/link';
import { EmptyState } from '@/components/empty/empty-state';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onRemove: (bookmarkId: string) => void;
}

function getItemLink(bookmark: Bookmark): string {
  switch (bookmark.itemType) {
    case 'story':
      return `/stories/${bookmark.itemId}`;
    case 'dilemma':
      return `/community-dilemmas`;
    case 'debate':
      return `/debate-arena/${bookmark.itemId}`;
    default:
      return '#';
  }
}

export function BookmarkList({ bookmarks, onRemove }: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <EmptyState
        icon={BookmarkIcon}
        title="Nothing saved yet"
        blurb="Tap the bookmark icon on any story, dilemma, or debate to keep it here for later."
        action={
          <Button asChild>
            <Link href="/stories">Browse stories</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bm) => (
        <Card key={bm.id} className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Badge variant="secondary" className="capitalize shrink-0">
                {bm.itemType}
              </Badge>
              <Link
                href={getItemLink(bm)}
                className="font-medium text-foreground hover:text-primary transition-colors truncate"
              >
                {bm.title}
              </Link>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button asChild variant="ghost" size="icon" aria-label={`Open ${bm.title}`}>
                <Link href={getItemLink(bm)}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(bm.id)}
                aria-label={`Remove bookmark ${bm.title}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
