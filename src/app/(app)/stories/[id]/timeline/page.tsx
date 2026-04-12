'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoryById } from '@/app/actions/stories';
import { mockStories } from '@/data/mock-data';
import type { Story } from '@/types';
import { StoryTimeline } from '@/components/stories/story-timeline';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

/**
 * Timeline page for a story. Displays a horizontal timeline of all segments.
 */
export default function StoryTimelinePage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStory(): Promise<void> {
      try {
        const result = await getStoryById(storyId);
        if (result.success && result.data) {
          setStory(result.data);
        } else {
          // Fallback to mock data
          const found = mockStories.find((s) => s.id === storyId);
          if (found) {
            setStory(found);
          } else {
            setError('Story not found.');
          }
        }
      } catch (err) {
        console.error('Error loading story for timeline:', err);
        // Fallback to mock data on error
        const found = mockStories.find((s) => s.id === storyId);
        if (found) {
          setStory(found);
        } else {
          setError('Failed to load story.');
        }
      }
    }
    loadStory();
  }, [storyId]);

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => router.push(`/stories/${storyId}`)}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Story
        </Button>
        <h1 className="text-2xl font-bold text-primary font-headline">
          {story.title} — Timeline
        </h1>
      </div>

      <StoryTimeline story={story} />
    </div>
  );
}
