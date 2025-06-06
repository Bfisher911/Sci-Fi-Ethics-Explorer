'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockStories } from '@/data/mock-data';
import type { Story, StorySegment, StoryChoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PollComponent } from '@/components/stories/poll-component';
import { generateEndingReflection } from '@/ai/flows/generate-ending-reflection';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckSquare, Loader2, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [userChoices, setUserChoices] = useState<string[]>([]);
  const [reflection, setReflection] = useState<string | null>(null);
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const foundStory = mockStories.find((s) => s.id === storyId);
    if (foundStory) {
      setStory(foundStory);
      setCurrentSegment(foundStory.segments[0]);
    } else {
      setError("Story not found.");
    }
  }, [storyId]);

  const handleChoice = async (choice: StoryChoice, segmentText: string) => {
    const newChoices = [...userChoices, `${segmentText.substring(0,50)}... -> Choice: ${choice.text}`];
    setUserChoices(newChoices);

    if (choice.nextSegmentId) {
      const nextSegment = story?.segments.find((s) => s.id === choice.nextSegmentId);
      setCurrentSegment(nextSegment || null);
      if (nextSegment?.reflectionTrigger || choice.reflectionTrigger) {
        await triggerReflection(story?.title, newChoices);
      }
    } else if (choice.reflectionTrigger) {
       // End of branch, trigger reflection
       await triggerReflection(story?.title, newChoices);
    } else {
      // No next segment and no explicit reflection trigger, might be an implicit end.
      // Or, handle as an error / incomplete story structure. For now, assume reflection if it's an end.
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
        {story?.imageUrl && <Skeleton className="w-full h-64 md:h-96 mb-6 rounded-lg" />}
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


  return (
    <div className="container mx-auto py-8 px-4">
      <Button onClick={() => router.push('/stories')} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
      </Button>

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
    </div>
  );
}
