'use client';

import { useMemo } from 'react';
import type { Story, StorySegment } from '@/types';
import { Card } from '@/components/ui/card';

interface BranchVisualizationProps {
  story: Story;
  currentSegmentId: string;
  visitedSegments: string[];
}

interface TreeNode {
  segment: StorySegment;
  children: TreeNode[];
}

/**
 * Renders a visual tree of all story paths using CSS flexbox and connecting lines.
 * Each node shows a snippet, visited status, and current position.
 */
export function BranchVisualization({
  story,
  currentSegmentId,
  visitedSegments,
}: BranchVisualizationProps): JSX.Element {
  const segmentMap = useMemo(() => {
    const map = new Map<string, StorySegment>();
    for (const seg of story.segments) {
      map.set(seg.id, seg);
    }
    return map;
  }, [story.segments]);

  const tree = useMemo((): TreeNode | null => {
    if (story.segments.length === 0) return null;

    const buildNode = (segmentId: string, visited: Set<string>): TreeNode | null => {
      const segment = segmentMap.get(segmentId);
      if (!segment || visited.has(segmentId)) return null;

      visited.add(segmentId);

      const children: TreeNode[] = [];

      if (segment.type === 'interactive' && segment.choices) {
        for (const choice of segment.choices) {
          if (choice.nextSegmentId) {
            const child = buildNode(choice.nextSegmentId, new Set(visited));
            if (child) children.push(child);
          }
        }
      } else {
        // Linear: find the next segment in order
        const idx = story.segments.findIndex((s) => s.id === segmentId);
        if (idx >= 0 && idx < story.segments.length - 1) {
          const nextSeg = story.segments[idx + 1];
          // Only auto-link if this next segment is not already a branch target
          const isBranchTarget = story.segments.some(
            (s) =>
              s.choices?.some((c) => c.nextSegmentId === nextSeg.id)
          );
          if (!isBranchTarget) {
            const child = buildNode(nextSeg.id, new Set(visited));
            if (child) children.push(child);
          }
        }
      }

      return { segment, children };
    };

    return buildNode(story.segments[0].id, new Set());
  }, [story.segments, segmentMap]);

  const renderNode = (node: TreeNode): JSX.Element => {
    const isVisited = visitedSegments.includes(node.segment.id);
    const isCurrent = node.segment.id === currentSegmentId;
    const isBranch = node.segment.type === 'interactive' && (node.segment.choices?.length ?? 0) > 1;
    const snippet = node.segment.text.substring(0, 30) + (node.segment.text.length > 30 ? '...' : '');

    return (
      <div key={node.segment.id} className="flex flex-col items-center">
        {/* Node */}
        <div
          className={`relative px-3 py-2 rounded-lg text-xs max-w-[160px] text-center border-2 transition-colors ${
            isCurrent
              ? 'border-primary bg-primary/20 text-primary font-semibold ring-2 ring-primary/40'
              : isVisited
              ? 'border-primary/50 bg-primary/10 text-foreground'
              : 'border-muted bg-muted/40 text-muted-foreground'
          }`}
        >
          {isBranch && (
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] px-1 rounded-full">
              ⑂
            </span>
          )}
          {isCurrent && (
            <span className="absolute -top-2 -left-2 w-3 h-3 rounded-full bg-primary animate-pulse" />
          )}
          {snippet}
        </div>

        {/* Children with connecting lines */}
        {node.children.length > 0 && (
          <>
            {/* Vertical line down */}
            <div className="w-px h-6 bg-border" />

            {node.children.length === 1 ? (
              renderNode(node.children[0])
            ) : (
              <div className="flex gap-4 relative">
                {/* Horizontal connector line */}
                <div
                  className="absolute top-0 bg-border"
                  style={{
                    height: '1px',
                    left: '50%',
                    right: '50%',
                    transform: `scaleX(${node.children.length})`,
                  }}
                />
                {node.children.map((child, idx) => (
                  <div key={child.segment.id} className="flex flex-col items-center">
                    {/* Vertical line from horizontal connector */}
                    <div className="w-px h-6 bg-border" />
                    {renderNode(child)}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (!tree) {
    return (
      <Card className="p-6 bg-card/80 backdrop-blur-sm text-center text-muted-foreground">
        No story structure to display.
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm overflow-auto max-h-[70vh]">
      <h3 className="text-lg font-semibold mb-4 text-center">Story Map</h3>
      <div className="flex justify-center min-w-fit">
        {renderNode(tree)}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border-2 border-primary bg-primary/20" />
          Current
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border-2 border-primary/50 bg-primary/10" />
          Visited
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border-2 border-muted bg-muted/40" />
          Unvisited
        </div>
      </div>
    </Card>
  );
}
