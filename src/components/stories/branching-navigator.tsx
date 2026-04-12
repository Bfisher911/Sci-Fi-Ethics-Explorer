'use client';

import { useMemo } from 'react';
import type { Story } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronRight, Undo2, GitFork } from 'lucide-react';

interface BranchingNavigatorProps {
  story: Story;
  currentSegmentId: string;
  visitedSegments: string[];
  onNavigateToSegment: (segmentId: string) => void;
}

/**
 * Shows the user's current position in a narrative tree and allows backtracking.
 * Displays a horizontal breadcrumb trail, a "go back" button, and branch count.
 */
export function BranchingNavigator({
  story,
  currentSegmentId,
  visitedSegments,
  onNavigateToSegment,
}: BranchingNavigatorProps): JSX.Element {
  const currentSegment = story.segments.find((s) => s.id === currentSegmentId);

  const branchCount = useMemo(() => {
    if (!currentSegment || currentSegment.type !== 'interactive') return 0;
    return currentSegment.choices?.length ?? 0;
  }, [currentSegment]);

  const canGoBack = visitedSegments.length > 1;

  const handleGoBack = (): void => {
    if (visitedSegments.length < 2) return;
    const previousSegmentId = visitedSegments[visitedSegments.length - 2];
    onNavigateToSegment(previousSegmentId);
  };

  const getSegmentLabel = (segmentId: string): string => {
    const segment = story.segments.find((s) => s.id === segmentId);
    if (!segment) return segmentId;
    return segment.text.substring(0, 25) + (segment.text.length > 25 ? '...' : '');
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Breadcrumb trail */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
        {visitedSegments.map((segId, index) => (
          <div key={`${segId}-${index}`} className="flex items-center shrink-0">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground mx-1 shrink-0" />
            )}
            <button
              onClick={() => onNavigateToSegment(segId)}
              disabled={segId === currentSegmentId}
              className={`text-xs px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                segId === currentSegmentId
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {getSegmentLabel(segId)}
            </button>
          </div>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">
        {canGoBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="text-xs"
          >
            <Undo2 className="mr-1 h-3 w-3" />
            Go back to last decision
          </Button>
        )}

        {branchCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <GitFork className="h-3 w-3" />
            <span>{branchCount} path{branchCount !== 1 ? 's' : ''} from here</span>
          </div>
        )}
      </div>
    </div>
  );
}
