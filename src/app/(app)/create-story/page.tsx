'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { submitUserStory } from '@/app/actions/stories';
import { StoryEditor } from '@/components/stories/story-editor';
import type { Story } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, LogIn } from 'lucide-react';

/**
 * Page for creating user-generated stories via a multi-step form.
 */
export default function CreateStoryPage(): JSX.Element {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleSubmit = async (
    storyData: Omit<Story, 'id' | 'status' | 'publishedAt' | 'viewCount'>
  ): Promise<void> => {
    if (!user) {
      throw new Error('You must be signed in to submit a story.');
    }

    const result = await submitUserStory({
      ...storyData,
      authorId: user.uid,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to submit story.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center space-y-4">
        <Alert>
          <AlertTitle>Sign In Required</AlertTitle>
          <AlertDescription>
            You need to be signed in to create a story.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/auth')} variant="default">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button
        onClick={() => router.push('/stories')}
        variant="outline"
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
      </Button>

      <h1 className="text-3xl font-bold text-primary font-headline mb-6">
        Create a Story
      </h1>

      <StoryEditor
        onSubmit={handleSubmit}
        authorName={user.displayName || 'Anonymous'}
        authorId={user.uid}
      />
    </div>
  );
}
