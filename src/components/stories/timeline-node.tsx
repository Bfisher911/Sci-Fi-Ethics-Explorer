'use client';

import type { StorySegment } from '@/types';
import { BookOpen, GitBranch } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TimelineNodeProps {
  segment: StorySegment;
  isVisited: boolean;
  isCurrent: boolean;
}

/**
 * A single node in the story timeline, rendered as a circle with an icon.
 * Shows full segment text on hover via tooltip.
 */
export function TimelineNode({
  segment,
  isVisited,
  isCurrent,
}: TimelineNodeProps): JSX.Element {
  const isInteractive = segment.type === 'interactive';
  const Icon = isInteractive ? GitBranch : BookOpen;
  const snippet = segment.text.substring(0, 40) + (segment.text.length > 40 ? '...' : '');

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-2 shrink-0">
            {/* Circle node */}
            <div
              className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors cursor-default ${
                isCurrent
                  ? 'border-primary bg-primary/20 ring-2 ring-primary/40'
                  : isVisited
                  ? 'border-primary/60 bg-primary/10'
                  : 'border-muted bg-muted/40'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isCurrent
                    ? 'text-primary'
                    : isVisited
                    ? 'text-primary/70'
                    : 'text-muted-foreground'
                }`}
              />
              {isCurrent && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
              )}
            </div>

            {/* Snippet label */}
            <span
              className={`text-[10px] max-w-[100px] text-center leading-tight ${
                isCurrent
                  ? 'text-primary font-medium'
                  : isVisited
                  ? 'text-foreground/80'
                  : 'text-muted-foreground'
              }`}
            >
              {snippet}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{segment.text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
