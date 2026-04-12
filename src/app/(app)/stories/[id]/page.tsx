
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getStoryById } from '@/app/actions/stories';
import { mockStories } from '@/data/mock-data';
import type { Story, StorySegment, StoryChoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PollComponent } from '@/components/stories/poll-component';
import { BranchingNavigator } from '@/components/stories/branching-navigator';
import { BranchVisualization } from '@/components/stories/branch-visualization';
import { EpilogueViewer } from '@/components/stories/epilogue-viewer';
import { generateEndingReflection } from '@/ai/flows/generate-ending-reflection';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckSquare, Loader2, MessageSquare, Map, Clock, Sparkles, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { recordStoryCompletion, recordStoryChoice } from '@/app/actions/progress';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [userChoices, setUserChoices] = useState<string[]>([]);
  const [visitedSegments, setVisitedSegments] = useState<string[]>([]);
  const [reflection, setReflection] = useState<string | null>(null);
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStoryMap, setShowStoryMap] = useState(false);
  const [showEpilogue, setShowEpilogue] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function loadStory() {
      // Try Firestore first, then fallback to mock data
      const result = await getStoryById(storyId);
      if (result.success && result.data) {
        setStory(result.data);
        setCurrentSegment(result.data.segments[0]);
        setVisitedSegments([result.data.segments[0].id]);
      } else {
        const foundStory = mockStories.find((s) => s.id === storyId);
        if (foundStory) {
          setStory(foundStory);
          setCurrentSegment(foundStory.segments[0]);
          setVisitedSegments([foundStory.segments[0].id]);
        } else {
          setError("Story not found.");
        }
      }
    }
    loadStory();
  }, [storyId]);

  const navigateToSegment = (segmentId: string): void => {
    if (!story) return;
    const segment = story.segments.find((s) => s.id === segmentId);
    if (segment) {
      setCurrentSegment(segment);
      const existingIndex = visitedSegments.indexOf(segmentId);
      if (existingIndex >= 0) {
        setVisitedSegments(visitedSegments.slice(0, existingIndex + 1));
      } else {
        setVisitedSegments([...visitedSegments, segmentId]);
      }
    }
  };

  const handleChoice = async (choice: StoryChoice, segmentText: string) => {
    const newChoices = [...userChoices, `${segmentText.substring(0, 50)}... -> Choice: ${choice.text}`];
    setUserChoices(newChoices);

    // Track choice in user progress
    if (user?.uid && storyId) {
      try {
        await recordStoryChoice(user.uid, storyId, choice.text);
      } catch (err) {
        console.error('Failed to record story choice:', err);
      }
    }

    if (choice.nextSegmentId) {
      const nextSegment = story?.segments.find((s) => s.id === choice.nextSegmentId);
      if (nextSegment) {
        setCurrentSegment(nextSegment);
        setVisitedSegments((prev) => [...prev, nextSegment.id]);
      } else {
        setCurrentSegment(null);
      }
      if (nextSegment?.reflectionTrigger || choice.reflectionTrigger) {
        await triggerReflection(story?.title, newChoices);
      }
    } else if (choice.reflectionTrigger) {
      await triggerReflection(story?.title, newChoices);
    } else {
      if (story?.isInteractive) {
        await triggerReflection(story?.title, newChoices);
      }
    }
  };

  const triggerReflection = async (storyTitle?: string, choices?: string[]) => {
    if (!storyTitle || !choices || choices.length === 0) return;

    setIsLoadingReflection(true);
    setReflection(null);
    try {
      const result = await generateEndingReflection({
        storyTitle: storyTitle,
        userChoices: choices,
      });
      setReflection(result.reflection);

      // Record story completion when reflection is generated
      if (user?.uid && storyId) {
        try {
          await recordStoryCompletion(user.uid, storyId);
        } catch (err) {
          console.error('Failed to record story completion:', err);
        }
      }
    } catch (err) {
      console.error("Error generating reflection:", err);
      setReflection("Failed to generate reflection. Please try again later.");
    } finally {
      setIsLoadingReflection(false);
    }
  };

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

  if (!story || !currentSegment) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  const isStoryEnd = !currentSegment.choices && !story.isInteractive || (story.isInteractive && !currentSegment.choices && !isLoadingReflection && reflection);

  const storyEndingText = currentSegment.text.substring(0, 200);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button onClick={() => router.push('/stories')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
        </Button>
        <Link href={`/stories/${storyId}/timeline`}>
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" /> View Timeline
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStoryMap((v) => !v)}
        >
          <Map className="mr-2 h-4 w-4" />
          {showStoryMap ? 'Hide' : 'View'} Story Map
        </Button>
      </div>

      {/* Branching Navigator */}
      {story.isInteractive && (
        <BranchingNavigator
          story={story}
          currentSegmentId={currentSegment.id}
          visitedSegments={visitedSegments}
          onNavigateToSegment={navigateToSegment}
        />
      )}

      {/* Story Map Overlay */}
      {showStoryMap && (
        <div className="mb-6 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={() => setShowStoryMap(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <BranchVisualization
            story={story}
            currentSegmentId={currentSegment.id}
            visitedSegments={visitedSegments}
          />
        </div>
      )}

      <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary font-headline">{story.title}</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            By {story.author} | Genre: {story.genre} | Theme: {story.theme}
          </CardDescription>
        </CardHeader>

        {currentSegment.image && (
          <div className="relative w-full h-64 md:h-96 my-6">
            <Image
              src={currentSegment.image}
              alt={`Scene from ${story.title}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-md"
              data-ai-hint={currentSegment.imageHint || 'story scene'}
            />
          </div>
        )}

        <CardContent className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
          <p>{currentSegment.text}</p>
        </CardContent>

        {story.isInteractive && currentSegment.choices && currentSegment.choices.length > 0 && (
          <CardFooter className="flex flex-col items-start gap-3 pt-6 border-t">
            <h3 className="text-lg font-semibold text-accent">Your Decision:</h3>
            {currentSegment.choices.map((choice, index) => (
              <Button
                key={index}
                onClick={() => handleChoice(choice, currentSegment.text)}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 hover:bg-primary/10 hover:border-primary"
              >
                <CheckSquare className="mr-3 h-5 w-5 text-primary" />
                {choice.text}
              </Button>
            ))}
          </CardFooter>
        )}

        {currentSegment.poll && (
          <div className="p-6 border-t">
            <PollComponent pollData={currentSegment.poll} storyId={story.id} segmentId={currentSegment.id} />
          </div>
        )}

        {(isLoadingReflection || reflection) && (
          <CardFooter className="flex flex-col items-start gap-3 pt-6 border-t">
            <h3 className="text-xl font-semibold text-accent flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Story Reflection
            </h3>
            {isLoadingReflection && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating your personalized reflection...</span>
              </div>
            )}
            {reflection && <p className="text-foreground/90 whitespace-pre-wrap">{reflection}</p>}
          </CardFooter>
        )}

        {isStoryEnd && !story.isInteractive && story.segments.length > 1 && (
          <CardFooter className="pt-6 border-t">
            <p className="text-lg text-muted-foreground italic">You have reached the end of this narrative.</p>
          </CardFooter>
        )}
        {isStoryEnd && story.isInteractive && !reflection && !isLoadingReflection && (
          <CardFooter className="pt-6 border-t">
            <p className="text-lg text-muted-foreground italic">This path concludes here. Your choices have shaped this outcome.</p>
          </CardFooter>
        )}
      </Card>

      {/* "What Happened Next?" Epilogue Section */}
      {isStoryEnd && userChoices.length > 0 && (
        <div className="mt-6">
          {!showEpilogue ? (
            <Button
              onClick={() => setShowEpilogue(true)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              What Happened Next?
            </Button>
          ) : (
            <Card className="bg-card/80 backdrop-blur-sm p-6">
              <EpilogueViewer
                storyTitle={story.title}
                storyEnding={storyEndingText}
                userChoices={userChoices}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
