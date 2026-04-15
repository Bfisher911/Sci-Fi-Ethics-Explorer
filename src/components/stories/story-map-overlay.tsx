'use client';

import { useMemo } from 'react';
import type { Story, StorySegment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ArrowRight, MapPin, Lock, Flag, GitBranch, BookOpen, X } from 'lucide-react';

interface StoryMapOverlayProps {
  story: Story;
  currentSegmentId: string;
  visitedSegments: string[];
  /** Called when the user clicks a visited node to "fast-travel" back. */
  onFastTravel: (segmentId: string) => void;
  /** Called when the user dismisses the overlay. */
  onClose: () => void;
}

interface MapNode {
  segment: StorySegment;
  depth: number;
  parentChoice?: string;
}

/**
 * Story Map v2: a node-based tree of all story segments with fog-of-war
 * (unvisited paths blurred) and fast-travel (click any visited node to
 * rewind the story to that point).
 *
 * Layout: BFS-ordered list grouped by depth, with arrow connectors and
 * choice labels between nodes.
 */
export function StoryMapOverlay({
  story,
  currentSegmentId,
  visitedSegments,
  onFastTravel,
  onClose,
}: StoryMapOverlayProps): JSX.Element {
  const visitedSet = useMemo(() => new Set(visitedSegments), [visitedSegments]);

  const segmentMap = useMemo(() => {
    const m = new Map<string, StorySegment>();
    for (const s of story.segments) m.set(s.id, s);
    return m;
  }, [story.segments]);

  // Group segments by depth (distance from root through any path).
  const layers = useMemo((): MapNode[][] => {
    if (story.segments.length === 0) return [];
    const root = story.segments[0];
    const layersAcc: MapNode[][] = [];
    const seenInBFS = new Set<string>([root.id]);

    let frontier: MapNode[] = [{ segment: root, depth: 0 }];
    while (frontier.length > 0) {
      layersAcc.push(frontier);
      const next: MapNode[] = [];
      for (const node of frontier) {
        const choices = node.segment.choices || [];
        if (choices.length > 0) {
          for (const c of choices) {
            if (!c.nextSegmentId) continue;
            if (seenInBFS.has(c.nextSegmentId)) continue;
            const target = segmentMap.get(c.nextSegmentId);
            if (!target) continue;
            seenInBFS.add(c.nextSegmentId);
            next.push({
              segment: target,
              depth: node.depth + 1,
              parentChoice: c.text,
            });
          }
        } else {
          // Linear: implicit "continue" to next array sibling
          const idx = story.segments.indexOf(node.segment);
          const nextSeg = story.segments[idx + 1];
          if (nextSeg && !seenInBFS.has(nextSeg.id) && !nextSeg.choices) {
            // Don't auto-flow if the next sibling has choices — those belong
            // to a different branch in the data. But for simple linear
            // stories this is the natural read order.
            seenInBFS.add(nextSeg.id);
            next.push({ segment: nextSeg, depth: node.depth + 1 });
          }
        }
      }
      frontier = next;
    }

    return layersAcc;
  }, [story, segmentMap]);

  const isEnding = (s: StorySegment): boolean => {
    if (!s.choices || s.choices.length === 0) {
      // No choices = ending in interactive stories; always end of linear too
      return true;
    }
    return s.choices.every((c) => c.reflectionTrigger);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="relative w-full max-w-5xl max-h-[85vh] bg-card/95 backdrop-blur-md border-primary/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{story.title} — Story Map</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {visitedSegments.length} of {story.segments.length} segments seen
            </span>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close map">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-b border-border bg-card/50">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
            Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
            Visited (click to rewind)
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Undiscovered
          </span>
          <span className="flex items-center gap-1.5">
            <Flag className="h-3 w-3" />
            Ending
          </span>
        </div>

        {/* Map body */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {layers.map((layer, depth) => (
              <div key={depth} className="space-y-3">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
                  Layer {depth + 1}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {layer.map((node) => {
                    const visited = visitedSet.has(node.segment.id);
                    const current = node.segment.id === currentSegmentId;
                    const ending = isEnding(node.segment);
                    const branching =
                      (node.segment.choices?.length || 0) > 0 && !ending;

                    const Icon = ending ? Flag : branching ? GitBranch : BookOpen;
                    const clickable = visited && !current;

                    return (
                      <button
                        key={node.segment.id}
                        type="button"
                        disabled={!clickable}
                        onClick={() => clickable && onFastTravel(node.segment.id)}
                        className={cn(
                          'group relative text-left p-3 rounded-md border transition-all duration-200',
                          'flex flex-col gap-2 min-h-[110px]',
                          current
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                            : visited
                            ? 'border-accent/60 bg-accent/5 hover:bg-accent/10 hover:border-accent cursor-pointer'
                            : 'border-border bg-muted/20 cursor-not-allowed',
                          !visited && 'opacity-50'
                        )}
                        aria-label={
                          current
                            ? `${node.segment.id}: current segment`
                            : visited
                            ? `${node.segment.id}: visited, click to rewind`
                            : `${node.segment.id}: undiscovered`
                        }
                      >
                        {/* Parent choice label */}
                        {node.parentChoice && (
                          <div className="flex items-start gap-1 text-[10px] text-muted-foreground/80 italic">
                            <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">
                              "{node.parentChoice}"
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <Icon
                            className={cn(
                              'h-3.5 w-3.5',
                              current
                                ? 'text-primary'
                                : visited
                                ? 'text-accent'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              'text-xs font-mono',
                              current
                                ? 'text-primary'
                                : visited
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            {node.segment.id}
                          </span>
                          {!visited && (
                            <Lock className="h-3 w-3 text-muted-foreground/70 ml-auto" />
                          )}
                          {current && (
                            <span className="ml-auto text-[10px] uppercase tracking-wider text-primary font-semibold">
                              you are here
                            </span>
                          )}
                        </div>

                        {/* Snippet — blurred for unvisited */}
                        <p
                          className={cn(
                            'text-xs text-foreground/80 line-clamp-3 leading-relaxed',
                            !visited && 'blur-[3px] select-none'
                          )}
                        >
                          {visited
                            ? node.segment.text.replace(/\n+/g, ' ').slice(0, 120) + '…'
                            : node.segment.text.replace(/\n+/g, ' ').slice(0, 80) + '…'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
