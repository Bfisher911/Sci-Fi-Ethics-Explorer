'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink } from 'lucide-react';
import type { Bookmark } from '@/types';
import Link from 'next/link';

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
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">No bookmarks yet.</p>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Bookmark stories, dilemmas, and debates to save them here.
        </p>
      </div>
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
              <Button asChild variant="ghost" size="icon">
                <Link href={getItemLink(bm)}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(bm.id)}
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
