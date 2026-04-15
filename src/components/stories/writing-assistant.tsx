'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LINEAR_TIPS: string[] = [
  'Open with a sensory detail — what does the air smell like? What is the protagonist holding? Concrete beats abstract.',
  'A linear segment carries the reader to the next beat. Make the last sentence point forward — give them a reason to keep going.',
  'Cut adverbs. Trust your verbs.',
  'If you use a name, make sure the reader knows why they should care about it before the next paragraph.',
  'Avoid "and then." Replace with a concrete action that conveys the same beat.',
  'Read the segment aloud. If you trip on a sentence, the reader will too.',
  'Resist the urge to explain. The reader is smarter than you think.',
];

const INTERACTIVE_TIPS: string[] = [
  'Make every choice represent a different ethical framework. Utilitarian vs. deontological vs. virtue-based gives the AI reflection something to chew on.',
  'No "obvious" choices. If readers always pick option A, the branch is doing nothing.',
  'Frame choices as the protagonist would think them, not as the author judges them. Avoid "the right thing" labels.',
  'Each choice should feel costly. If one path is consequence-free, the dilemma collapses.',
  'Write the choices first, then the segment text. Let the dilemma drive the prose.',
  'A great branching segment ends mid-thought — the choice is the resolution.',
];

const ENDING_TIPS: string[] = [
  'Endings should leave one image the reader carries. Resist the urge to summarize the moral.',
  'The reflection AI will read the user\'s path. Give it specific moments to reflect on, not abstractions.',
  'Ambiguous endings beat tidy ones for ethics fiction. Let the reader sit with discomfort.',
];

const EMPTY_STATE_TIPS: string[] = [
  'Start with a cliffhanger to make the branching choices feel higher-stakes.',
  'Use sensory detail — what does the air smell like in this space station?',
  'A great opening grounds the reader in time, place, and stakes within the first three sentences.',
  'Write fast, edit slow. Get the beats down before you polish the prose.',
  'The character\'s want should be on the page by the second paragraph.',
];

interface WritingAssistantProps {
  /** Optional segment type to tailor tips. */
  segmentType?: 'linear' | 'interactive';
  /** True when the segment text is empty — show empty-state tips. */
  isEmpty?: boolean;
  /** True when the segment is marked as an ending. */
  isEnding?: boolean;
  className?: string;
}

/**
 * Sidebar that shows rotating, type-aware writing tips. Tips refresh on
 * a 12s interval and on demand via the refresh button.
 */
export function WritingAssistant({
  segmentType = 'linear',
  isEmpty = false,
  isEnding = false,
  className,
}: WritingAssistantProps): JSX.Element {
  const tips = isEmpty
    ? EMPTY_STATE_TIPS
    : isEnding
    ? ENDING_TIPS
    : segmentType === 'interactive'
    ? INTERACTIVE_TIPS
    : LINEAR_TIPS;

  const [index, setIndex] = useState(() => Math.floor(Math.random() * tips.length));

  // Reset index when the tip pool changes
  useEffect(() => {
    setIndex(Math.floor(Math.random() * tips.length));
  }, [isEmpty, isEnding, segmentType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-rotate every 12s
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % tips.length);
    }, 12000);
    return () => clearInterval(id);
  }, [tips.length]);

  const refresh = (): void => {
    setIndex((i) => (i + 1) % tips.length);
  };

  return (
    <Card className={`bg-card/80 backdrop-blur-sm border-accent/30 ${className || ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-accent">
          <Sparkles className="h-4 w-4" />
          Writing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 mt-0.5 text-accent shrink-0" />
          <p className="text-sm text-foreground/90 leading-relaxed">{tips[index]}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isEmpty
              ? 'Empty-state tip'
              : isEnding
              ? 'Ending tip'
              : segmentType === 'interactive'
              ? 'Branching tip'
              : 'Linear tip'}
            {' · '}
            {index + 1}/{tips.length}
          </span>
          <Button variant="ghost" size="sm" onClick={refresh} className="h-7 px-2">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            New tip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
