'use client';

import type { StorySegment } from '@/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BookOpen,
  GitBranch,
  Flag,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface StoryFlowMapProps {
  segments: StorySegment[];
  currentSegmentId?: string;
  onSelect?: (segId: string) => void;
}

/**
 * Visual representation of a story's segment flow.
 * Linear segments connect to the next in order; interactive segments
 * branch to multiple targets via their choices.
 */
export function StoryFlowMap({
  segments,
  currentSegmentId,
  onSelect,
}: StoryFlowMapProps): JSX.Element {
  if (segments.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border/60 bg-card/50 backdrop-blur-sm p-4 text-center text-xs text-muted-foreground">
        No segments yet. Add a segment to see your story map.
      </div>
    );
  }

  const preview = (text: string, max = 30): string => {
    const trimmed = text.trim();
    if (!trimmed) return '(empty)';
    return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
  };

  const isEnding = (seg: StorySegment): boolean => {
    // Treat as an ending if any choice has reflectionTrigger OR poll present
    if (seg.choices?.some((c) => c.reflectionTrigger)) return true;
    return false;
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-lg border border-border/60 bg-card/80 backdrop-blur-sm p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
            <GitBranch className="h-3.5 w-3.5 text-primary" />
            Story Flow
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Flow map legend"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3" /> Linear segment (auto
                  continues)
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-3 w-3" /> Interactive segment
                  (reader chooses)
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3" /> Ending (reflection trigger)
                </div>
                <div className="pt-1 text-muted-foreground">
                  Click a node to jump to it.
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="overflow-x-auto">
          <div className="flex items-stretch gap-3 pb-2 min-w-max">
            {segments.map((seg, idx) => {
              const isInteractive = seg.type === 'interactive';
              const isCurrent = seg.id === currentSegmentId;
              const ending = isEnding(seg);
              const Icon = ending
                ? Flag
                : isInteractive
                ? GitBranch
                : BookOpen;

              // For linear segments: connect to the next segment in order.
              const nextLinear =
                !isInteractive && idx < segments.length - 1
                  ? segments[idx + 1]
                  : undefined;

              // For interactive segments: gather choice labels / targets.
              const choiceTargets = isInteractive
                ? (seg.choices || []).map((c) => ({
                    text: c.text || '(unlabeled)',
                    target: c.nextSegmentId,
                    reflectionTrigger: Boolean(c.reflectionTrigger),
                  }))
                : [];

              return (
                <div
                  key={seg.id}
                  className="flex items-start gap-2 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => onSelect?.(seg.id)}
                    className={cn(
                      'group relative w-40 text-left rounded-md border bg-background/60 px-3 py-2 transition-all hover:bg-background/90 hover:shadow-sm',
                      isInteractive
                        ? 'border-primary/60'
                        : 'border-border/60',
                      isCurrent &&
                        'ring-2 ring-primary border-primary shadow-md'
                    )}
                    aria-label={`Jump to segment ${seg.id}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                      <Icon
                        className={cn(
                          'h-3 w-3',
                          ending
                            ? 'text-amber-400'
                            : isInteractive
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                      <span className="truncate">{seg.id}</span>
                    </div>
                    <div className="text-xs text-foreground/90 leading-snug line-clamp-2">
                      {preview(seg.text)}
                    </div>
                  </button>

                  {/* Connectors */}
                  {nextLinear && (
                    <div
                      className="flex items-center self-center text-muted-foreground/70"
                      aria-hidden="true"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}

                  {isInteractive && choiceTargets.length > 0 && (
                    <div className="flex flex-col justify-center gap-1 self-center">
                      {choiceTargets.map((c, ci) => (
                        <div
                          key={ci}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground"
                        >
                          <ArrowRight className="h-3 w-3 text-primary/70" />
                          <span className="max-w-[90px] truncate">
                            {c.text.length > 18
                              ? `${c.text.slice(0, 18)}…`
                              : c.text}
                          </span>
                          {c.target ? (
                            <button
                              type="button"
                              onClick={() => onSelect?.(c.target!)}
                              className="rounded bg-primary/15 px-1.5 py-0.5 text-primary hover:bg-primary/25 transition-colors"
                            >
                              {c.target}
                            </button>
                          ) : c.reflectionTrigger ? (
                            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-400">
                              ending
                            </span>
                          ) : (
                            <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-destructive">
                              unset
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
