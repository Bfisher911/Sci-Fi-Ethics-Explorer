
'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoryById } from '@/app/actions/stories';
import { mockStories } from '@/data/mock-data';
import type { Story, StorySegment, StoryChoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PollComponent } from '@/components/stories/poll-component';
import { BranchingNavigator } from '@/components/stories/branching-navigator';
import { StoryHeader } from '@/components/stories/story-header';
import { StoryMapOverlay } from '@/components/stories/story-map-overlay';
import { ChoiceImpactIndicator } from '@/components/stories/choice-impact-indicator';
import { EpilogueViewer } from '@/components/stories/epilogue-viewer';
import { generateEndingReflection } from '@/ai/flows/generate-ending-reflection';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckSquare, Loader2, MessageSquare, Map, Clock, Sparkles, Volume2, VolumeX, ArrowDown, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { LockedFeatureModal } from '@/components/gating/locked-feature-modal';
import { recordStoryCompletion, recordStoryChoice } from '@/app/actions/progress';
import { BookmarkButton } from '@/components/bookmarks/bookmark-button';
import { ShareToMessageDialog } from '@/components/messages/share-to-message-dialog';
import { classifyChoice, FRAMEWORK_INFO } from '@/lib/choice-frameworks';
import { getMoodTheme } from '@/lib/story-atmosphere';
import { useAmbientTone } from '@/hooks/use-ambient-tone';
import { cn } from '@/lib/utils';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [userChoices, setUserChoices] = useState<string[]>([]);
  const [pickedChoiceTexts, setPickedChoiceTexts] = useState<string[]>([]);
  const [visitedSegments, setVisitedSegments] = useState<string[]>([]);
  const [reflection, setReflection] = useState<string | null>(null);
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStoryMap, setShowStoryMap] = useState(false);
  const [showEpilogue, setShowEpilogue] = useState(false);
  const [lastAlignedFramework, setLastAlignedFramework] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [atmosphereOn, setAtmosphereOn] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const segmentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isPaid } = useSubscription();

  // Free preview length for non-subscribers: they can read segments 0 and 1.
  // Segment 2+ requires an active subscription.
  const FREE_PREVIEW_SEGMENTS = 2;

  const mood = getMoodTheme(
    story?.theme,
    story?.genre,
    story?.title,
    currentSegment?.text?.slice(0, 400)
  );

  useAmbientTone(atmosphereOn, mood.ambientFreq);

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
    setPickedChoiceTexts((prev) => [...prev, choice.text]);

    const frameworkId = classifyChoice(choice.text);
    if (frameworkId !== 'unaligned') {
      const label = FRAMEWORK_INFO[frameworkId].label;
      setLastAlignedFramework(label);
      setTimeout(() => setLastAlignedFramework(null), 2400);
    }

    if (user?.uid && storyId) {
      try {
        await recordStoryChoice(user.uid, storyId, choice.text);
      } catch (err) {
        console.error('Failed to record story choice:', err);
      }
    }

    setIsTransitioning(true);
    await new Promise((r) => setTimeout(r, 180));

    if (choice.nextSegmentId) {
      const nextSegment = story?.segments.find((s) => s.id === choice.nextSegmentId);
      if (nextSegment) {
        setCurrentSegment(nextSegment);
        setVisitedSegments((prev) => [...prev, nextSegment.id]);
        segmentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        setCurrentSegment(null);
      }
      setIsTransitioning(false);
      if (nextSegment?.reflectionTrigger || choice.reflectionTrigger) {
        await triggerReflection(story?.title, newChoices);
      }
    } else if (choice.reflectionTrigger) {
      setIsTransitioning(false);
      await triggerReflection(story?.title, newChoices);
    } else {
      setIsTransitioning(false);
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

  // Index of current segment within the array. For linear stories we use
  // simple sequential order (segments[0], segments[1], ...); for interactive
  // stories this falls back to the visited-length estimate.
  const currentIndex = Math.max(
    0,
    story.segments.findIndex((s) => s.id === currentSegment.id)
  );
  const totalSegments = story.segments.length;
  const progressPercent = totalSegments > 0
    ? Math.round(((story.isInteractive ? visitedSegments.length : currentIndex + 1) / totalSegments) * 100)
    : 0;

  const nextLinearSegment =
    !story.isInteractive && currentIndex + 1 < totalSegments
      ? story.segments[currentIndex + 1]
      : null;

  const isStoryEnd = !currentSegment.choices && !story.isInteractive && !nextLinearSegment || (story.isInteractive && !currentSegment.choices && !isLoadingReflection && reflection);

  const storyEndingText = currentSegment.text.substring(0, 200);

  const handleContinueReading = (): void => {
    if (!nextLinearSegment) return;
    const nextIndex = currentIndex + 1;
    // Gate segments beyond the free preview for unpaid users.
    if (!isPaid && nextIndex >= FREE_PREVIEW_SEGMENTS) {
      setShowLockedModal(true);
      return;
    }
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSegment(nextLinearSegment);
      setVisitedSegments((prev) => [...prev, nextLinearSegment.id]);
      setIsTransitioning(false);
      segmentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
  };

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
        <Button
          variant={atmosphereOn ? 'default' : 'outline'}
          size="sm"
          onClick={() => setAtmosphereOn((v) => !v)}
          title={atmosphereOn ? `Atmosphere on — ${mood.label}` : 'Enable atmospheric background + ambient audio'}
          aria-pressed={atmosphereOn}
        >
          {atmosphereOn ? (
            <Volume2 className="mr-2 h-4 w-4" />
          ) : (
            <VolumeX className="mr-2 h-4 w-4" />
          )}
          Atmosphere{atmosphereOn ? `: ${mood.label}` : ''}
        </Button>
        <BookmarkButton
          itemId={story.id}
          itemType="story"
          title={story.title}
        />
        <ShareToMessageDialog
          artifact={{ type: 'story', id: story.id, title: story.title }}
        />
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

      {/* Story Map Overlay (modal with fog-of-war + fast-travel) */}
      {showStoryMap && (
        <StoryMapOverlay
          story={story}
          currentSegmentId={currentSegment.id}
          visitedSegments={visitedSegments}
          onFastTravel={(id) => {
            navigateToSegment(id);
            setShowStoryMap(false);
          }}
          onClose={() => setShowStoryMap(false)}
        />
      )}

      <Card className="shadow-xl bg-card/80 backdrop-blur-sm relative overflow-hidden">
        {/* Backlit-terminal glow behind content. When Atmosphere is on, the
            glow shifts to a mood-derived palette keyed to the story's theme. */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-700',
            atmosphereOn ? 'opacity-100' : 'opacity-40'
          )}
          style={{
            background: atmosphereOn
              ? mood.gradient
              : 'radial-gradient(ellipse at 50% 0%, rgba(125,249,255,0.08), transparent 60%)',
          }}
        />

        <CardHeader className="relative">
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary font-headline">{story.title}</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            By {story.author} | Genre: {story.genre} | Theme: {story.theme}
          </CardDescription>

          {totalSegments > 1 && (
            <div className="pt-3 space-y-1.5" aria-label="Reading progress">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground/80">
                <span>
                  {story.isInteractive ? 'Your Path' : 'Part'}{' '}
                  {story.isInteractive ? visitedSegments.length : currentIndex + 1}
                  {' / '}
                  {totalSegments}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
        </CardHeader>

        <div className="px-6 pb-4 relative">
          <StoryHeader
            imageUrl={currentSegment.image || story.imageUrl}
            imageHint={currentSegment.imageHint || story.imageHint}
            title={story.title}
            subtitle={`${story.genre} · ${story.theme}`}
          />
        </div>

        <div
          ref={segmentRef}
          key={currentSegment.id}
          className={cn(
            'transition-opacity duration-300 ease-out relative',
            isTransitioning ? 'opacity-0' : 'animate-in fade-in opacity-100'
          )}
        >
          <CardContent className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
            <p className="whitespace-pre-wrap">{currentSegment.text}</p>
          </CardContent>

          {nextLinearSegment && (
            <CardFooter className="flex flex-col items-stretch gap-2 pt-6 border-t">
              {!isPaid && currentIndex + 1 >= FREE_PREVIEW_SEGMENTS ? (
                <>
                  <Button
                    onClick={() => setShowLockedModal(true)}
                    size="lg"
                    variant="outline"
                    className="w-full min-h-14 border-primary/40 hover:border-primary hover:bg-primary/5 text-primary"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Unlock Part {currentIndex + 2} of {totalSegments}
                  </Button>
                  <p className="text-xs text-muted-foreground/70 text-center italic">
                    Preview ends here — subscribe to continue this story.
                  </p>
                </>
              ) : (
                <Button
                  onClick={handleContinueReading}
                  size="lg"
                  className="w-full min-h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_24px_-6px_hsl(var(--primary)/0.5)]"
                >
                  Continue Reading — Part {currentIndex + 2} of {totalSegments}
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          )}

          {story.isInteractive && currentSegment.choices && currentSegment.choices.length > 0 && (
            <CardFooter className="flex flex-col items-start gap-3 pt-6 border-t">
              <h3 className="text-lg font-semibold text-accent">Your Decision:</h3>
              {currentSegment.choices.map((choice, index) => {
                const frameworkId = classifyChoice(choice.text);
                const info = FRAMEWORK_INFO[frameworkId];
                const aligned = frameworkId !== 'unaligned';
                return (
                  <Button
                    key={index}
                    onClick={() => handleChoice(choice, currentSegment.text)}
                    variant="outline"
                    title={aligned ? `${info.label}: ${info.hint}` : undefined}
                    className={cn(
                      'group relative w-full justify-start text-left h-auto min-h-14 py-3 md:py-4 px-4 whitespace-normal',
                      'transition-all duration-200 hover:bg-primary/10 hover:border-primary',
                      'hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.5)]',
                      aligned && info.accent
                    )}
                  >
                    <CheckSquare className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="flex-1">{choice.text}</span>
                    {aligned && (
                      <span
                        className={cn(
                          'ml-3 hidden md:inline-block text-[10px] uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity',
                          info.color
                        )}
                      >
                        {info.shortLabel}
                      </span>
                    )}
                  </Button>
                );
              })}
              {currentSegment.choices.some((c) => classifyChoice(c.text) !== 'unaligned') && (
                <p className="text-[11px] text-muted-foreground/70 italic pt-1">
                  Hover a choice to see its ethical leaning.
                </p>
              )}
            </CardFooter>
          )}
        </div>

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

      {/* Floating framework counts */}
      <ChoiceImpactIndicator pickedChoiceTexts={pickedChoiceTexts} />

      <LockedFeatureModal
        open={showLockedModal}
        onOpenChange={setShowLockedModal}
        featureName={`The rest of "${story.title}"`}
        title="This story continues behind the gate."
        description={`You've reached the end of the free preview. Subscribe to unlock parts ${FREE_PREVIEW_SEGMENTS + 1}–${totalSegments} and continue the journey.`}
      />

      {/* Ephemeral alignment pulse after each choice */}
      {lastAlignedFramework && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          aria-live="polite"
        >
          <div className="px-4 py-2 rounded-full bg-card/90 backdrop-blur-md border border-primary/40 shadow-lg shadow-primary/20 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-primary font-semibold">{lastAlignedFramework}</span>
            <span className="text-muted-foreground"> +1</span>
          </div>
        </div>
      )}
    </div>
  );
}
