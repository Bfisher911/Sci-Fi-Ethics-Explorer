'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Story } from '@/types';
import { getAllStories } from '@/app/actions/admin';
import { displayAuthorName } from '@/lib/official-author';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  BookOpen,
  Inbox,
  AlertCircle,
  Archive,
  Globe,
  History,
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { StoryVersionHistory } from '@/components/stories/story-version-history';

/**
 * Returns the appropriate badge variant and label for a story status.
 */
function statusBadge(status?: string) {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>;
    case 'draft':
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>;
    case 'archived':
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Archived</Badge>;
    default:
      return <Badge variant="outline">{status || 'Unknown'}</Badge>;
  }
}

/**
 * Admin page for managing all stories.
 */
export default function AdminStoriesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      setLoading(true);
      const result = await getAllStories();
      if (result.success) {
        setStories(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    fetchStories();
  }, []);

  const toggleStatus = async (story: Story) => {
    const newStatus = story.status === 'archived' ? 'published' : 'archived';
    try {
      const storyRef = doc(db, 'stories', story.id);
      await updateDoc(storyRef, { status: newStatus });
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, status: newStatus } : s))
      );
      toast({
        title: `Story ${newStatus === 'archived' ? 'Archived' : 'Published'}`,
        description: `"${story.title}" has been ${newStatus}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update story status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold text-primary font-headline">
              Story Management
            </h1>
          </div>
          <p className="text-muted-foreground">
            View and manage all stories across the platform.
          </p>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && stories.length === 0 && (
        <div className="text-center py-12">
          <Inbox className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground">
            No Stories Found
          </h2>
          <p className="text-md text-muted-foreground/80 mt-2">
            There are no stories in the system yet.
          </p>
        </div>
      )}

      {!loading && !error && stories.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {story.title}
                  </TableCell>
                  <TableCell>{displayAuthorName(story.authorId, story.author)}</TableCell>
                  <TableCell>{statusBadge(story.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{story.genre}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {story.theme}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <History className="h-4 w-4 mr-1" />
                              View History
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                            <SheetHeader className="mb-4">
                              <SheetTitle>Version History</SheetTitle>
                              <SheetDescription>
                                Read-only view of snapshots for &ldquo;
                                {story.title}&rdquo;.
                              </SheetDescription>
                            </SheetHeader>
                            <StoryVersionHistory
                              storyId={story.id}
                              userId={user.uid}
                              canRestore={false}
                            />
                          </SheetContent>
                        </Sheet>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(story)}
                      >
                        {story.status === 'archived' ? (
                          <>
                            <Globe className="h-4 w-4 mr-1" />
                            Publish
                          </>
                        ) : (
                          <>
                            <Archive className="h-4 w-4 mr-1" />
                            Archive
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
