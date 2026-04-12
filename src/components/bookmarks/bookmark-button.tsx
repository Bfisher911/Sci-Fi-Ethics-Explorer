'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
} from '@/app/actions/bookmarks';

interface BookmarkButtonProps {
  itemId: string;
  itemType: 'story' | 'dilemma' | 'debate';
  title: string;
}

export function BookmarkButton({ itemId, itemType, title }: BookmarkButtonProps) {
  const { user } = useAuth();
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    async function check(): Promise<void> {
      const result = await isBookmarked(user!.uid, itemId);
      if (result.success) {
        setBookmarkId(result.data);
      }
      setChecking(false);
    }
    check();
  }, [user, itemId]);

  async function handleToggle(): Promise<void> {
    if (!user) return;
    setLoading(true);

    if (bookmarkId) {
      const result = await removeBookmark(bookmarkId, user.uid);
      if (result.success) {
        setBookmarkId(null);
      }
    } else {
      const result = await addBookmark({
        userId: user.uid,
        itemId,
        itemType,
        title,
      });
      if (result.success) {
        setBookmarkId(result.data);
      }
    }

    setLoading(false);
  }

  if (!user || checking) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      aria-label={bookmarkId ? 'Remove bookmark' : 'Add bookmark'}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : bookmarkId ? (
        <BookmarkCheck className="h-5 w-5 text-primary" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </Button>
  );
}
