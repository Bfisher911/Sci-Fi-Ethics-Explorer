'use client';

import { useMemo } from 'react';
import type { Story, StorySegment } from '@/types';
import { TimelineNode } from '@/components/stories/timeline-node';
import { Card } from '@/components/ui/card';

interface StoryTimelineProps {
  story: Story;
  visitedSegments?: string[];
}

interface TimelineEntry {
  segment: StorySegment;
  branches?: { choiceText: string; targetId: string }[];
  annotation?: string;
}

/**
 * Horizontal scrollable timeline showing all story segments as connected nodes.
 * Linear segments show a single line; interactive segments show branching lines.
 */
export function StoryTimeline({
  story,
  visitedSegments = [],
}: StoryTimelineProps): JSX.Element {
  const entries = useMemo((): TimelineEntry[] => {
    return story.segments.map((segment, idx) => {
      const entry: TimelineEntry = { segment };

      if (segment.type === 'interactive' && segment.choices) {
        entry.branches = segment.choices
          .filter((c) => c.nextSegmentId)
          .map((c) => ({ choiceText: c.text, targetId: c.nextSegmentId! }));
      }

      // Cause-and-effect annotation
      if (idx > 0) {
        const prev = story.segments[idx - 1];
        if (prev.type === 'interactive') {
          entry.annotation = 'Consequence of choice';
        }
      }

      return entry;
    });
  }, [story.segments]);

  if (entries.length === 0) {
    return (
      <Card className="p-6 bg-card/80 backdrop-blur-sm text-center text-muted-foreground">
        No segments to display.
      </Card>
    );
  }

  // Determine the current segment (last visited, or first)
  const currentSegmentId =
    visitedSegments.length > 0
      ? visitedSegments[visitedSegments.length - 1]
      : story.segments[0]?.id;

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-6 text-primary font-headline">
        Story Timeline
      </h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-0 min-w-fit">
          {entries.map((entry, idx) => {
            const isVisited = visitedSegments.includes(entry.segment.id);
            const isCurrent = entry.segment.id === currentSegmentId;

            return (
              <div key={entry.segment.id} className="flex items-start">
                {/* Node column */}
                <div className="flex flex-col items-center">
                  {/* Annotation */}
                  {entry.annotation && (
                    <span className="text-[9px] text-accent italic mb-1 whitespace-nowrap">
                      {entry.annotation}
                    </span>
                  )}

                  <TimelineNode
                    segment={entry.segment}
                    isVisited={isVisited}
                    isCurrent={isCurrent}
                  />

                  {/* Branch indicators */}
                  {entry.branches && entry.branches.length > 0 && (
                    <div className="mt-2 flex flex-col items-center gap-1">
                      {entry.branches.map((branch, bIdx) => (
                        <span
                          key={bIdx}
                          className="text-[9px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded max-w-[90px] truncate"
                          title={branch.choiceText}
                        >
                          {branch.choiceText.substring(0, 20)}
                          {branch.choiceText.length > 20 ? '...' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Connecting line */}
                {idx < entries.length - 1 && (
                  <div className="flex items-center self-center mt-1">
                    <div
                      className={`h-px w-8 ${
                        isVisited && visitedSegments.includes(entries[idx + 1].segment.id)
                          ? 'bg-primary/60'
                          : 'bg-border'
                      }`}
                    />
                    {entry.branches && entry.branches.length > 1 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent -ml-1" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border-2 border-primary bg-primary/20" />
          Current
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border-2 border-primary/60 bg-primary/10" />
          Visited
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border-2 border-muted bg-muted/40" />
          Unvisited
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Branch point
        </div>
      </div>
    </Card>
  );
}
