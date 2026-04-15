'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  submitUserStory,
  updateStoryOwned,
  getStoryById,
} from '@/app/actions/stories';
import { createContribution } from '@/app/actions/contributions';
import {
  StoryEditor,
  type StorySubmitOptions,
} from '@/components/stories/story-editor';
import type { Story } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, LogIn } from 'lucide-react';
import { PremiumGate } from '@/components/gating/premium-gate';

/**
 * Page for creating and editing user-generated stories via a multi-step form.
 * Supports `?edit={id}` to pre-populate the editor.
 */
export default function CreateStoryPage(): JSX.Element {
  return (
    <PremiumGate featureName="Create Story">
      <CreateStoryPageInner />
    </PremiumGate>
  );
}

function CreateStoryPageInner(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit') ?? null;
  const { user, loading } = useAuth();

  const [initialStory, setInitialStory] = useState<Story | null>(null);
  const [loadingStory, setLoadingStory] = useState<boolean>(!!editId);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) {
      setInitialStory(null);
      setLoadingStory(false);
      return;
    }
    let cancelled = false;
    setLoadingStory(true);
    getStoryById(editId)
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setInitialStory(res.data);
          if (!res.data) setLoadError('Story not found.');
        } else {
          setLoadError(res.error || 'Failed to load story.');
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingStory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const handleSubmit = async (
    storyData: Omit<Story, 'id' | 'status' | 'publishedAt' | 'viewCount'>,
    options?: StorySubmitOptions
  ): Promise<void> => {
    if (!user) {
      throw new Error('You must be signed in to submit a story.');
    }

    let storyId: string;

    if (editId && initialStory) {
      // Edit mode: update existing story.
      const updateResult = await updateStoryOwned(editId, user.uid, {
        ...storyData,
        globalVisibility: options?.globalVisibility,
      });
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update story.');
      }
      storyId = editId;
    } else {
      const result = await submitUserStory({
        ...storyData,
        authorId: user.uid,
        globalVisibility: options?.globalVisibility,
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit story.');
      }
      storyId = result.data;
    }

    // Optional community share
    if (options?.communityId) {
      try {
        const shareResult = await createContribution({
          communityId: options.communityId,
          type: 'story',
          contributorId: user.uid,
          contributorName: user.displayName || 'A member',
          title: storyData.title,
          summary: storyData.description,
          sourceCollection: 'stories',
          sourceId: storyId,
        });
        if (!shareResult.success) {
          console.error(
            '[create-story] share failed:',
            shareResult.error
          );
        }
      } catch (err) {
        console.error('[create-story] share error:', err);
      }
    }
  };

  if (loading || loadingStory) {
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

  if (editId && loadError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Could not load story</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/my-submissions')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Submissions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button
        onClick={() => router.push(editId ? '/my-submissions' : '/stories')}
        variant="outline"
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {editId ? 'Back to My Submissions' : 'Back to Stories'}
      </Button>

      <h1 className="text-3xl font-bold text-primary font-headline mb-6">
        {editId ? 'Edit Story' : 'Create a Story'}
      </h1>

      <StoryEditor
        onSubmit={handleSubmit}
        authorName={user.displayName || 'Anonymous'}
        authorId={user.uid}
        initialStory={initialStory}
      />
    </div>
  );
}
