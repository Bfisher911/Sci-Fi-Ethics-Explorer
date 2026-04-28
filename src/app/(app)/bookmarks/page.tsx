'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BookmarkIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getBookmarks, removeBookmark } from '@/app/actions/bookmarks';
import { BookmarkList } from '@/components/bookmarks/bookmark-list';
import type { Bookmark } from '@/types';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    async function fetchBookmarks(): Promise<void> {
      const result = await getBookmarks(user!.uid);
      if (result.success) {
        setBookmarks(result.data);
      }
      setLoading(false);
    }
    fetchBookmarks();
  }, [user]);

  async function handleRemove(bookmarkId: string): Promise<void> {
    if (!user) return;
    const result = await removeBookmark(bookmarkId, user.uid);
    if (result.success) {
      setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
    }
  }

  const storyBookmarks = bookmarks.filter((b) => b.itemType === 'story');
  const dilemmaBookmarks = bookmarks.filter((b) => b.itemType === 'dilemma');
  const debateBookmarks = bookmarks.filter((b) => b.itemType === 'debate');

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-2 text-primary font-headline">
            Saved
          </h1>
          <p className="text-lg text-muted-foreground">
            Your saved stories and debates, in one place.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({bookmarks.length})</TabsTrigger>
            <TabsTrigger value="stories">
              Stories ({storyBookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="dilemmas">
              Dilemmas ({dilemmaBookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="debates">
              Debates ({debateBookmarks.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <BookmarkList bookmarks={bookmarks} onRemove={handleRemove} />
          </TabsContent>
          <TabsContent value="stories">
            <BookmarkList bookmarks={storyBookmarks} onRemove={handleRemove} />
          </TabsContent>
          <TabsContent value="dilemmas">
            <BookmarkList
              bookmarks={dilemmaBookmarks}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="debates">
            <BookmarkList
              bookmarks={debateBookmarks}
              onRemove={handleRemove}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
