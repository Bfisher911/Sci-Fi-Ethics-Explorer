'use client';

import { useMemo, useState } from 'react';
import type { StorySegment, StoryChoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  X,
  HelpCircle,
  GitBranch,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SegmentEditorProps {
  segment: StorySegment;
  allSegmentIds: string[];
  /** All segments (for richer target labeling in selects). */
  allSegments?: StorySegment[];
  onChange: (updated: StorySegment) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  /**
   * Create a new segment positioned right after this one, returning its id.
   * When provided, enables the "Create New Branch" flow.
   */
  onCreateBranch?: () => string;
  /** Called with a segment id to scroll/focus that segment in the editor. */
  onFocusSegment?: (segmentId: string) => void;
}

const NONE_TARGET = '__none__';

/**
 * Editor for a single story segment. Supports linear and interactive types,
 * with a richer branching UI for interactive segments.
 */
export function SegmentEditor({
  segment,
  allSegmentIds,
  allSegments,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onCreateBranch,
  onFocusSegment,
}: SegmentEditorProps): JSX.Element {
  const [textFocused, setTextFocused] = useState(false);

  const updateField = <K extends keyof StorySegment>(
    key: K,
    value: StorySegment[K]
  ): void => {
    onChange({ ...segment, [key]: value });
  };

  const handleTypeChange = (type: 'linear' | 'interactive'): void => {
    const updated: StorySegment = { ...segment, type };
    if (type === 'interactive' && !updated.choices) {
      updated.choices = [{ text: '', nextSegmentId: undefined }];
    }
    if (type === 'linear') {
      delete updated.choices;
    }
    onChange(updated);
  };

  const updateChoice = (index: number, updates: Partial<StoryChoice>): void => {
    const choices = [...(segment.choices || [])];
    choices[index] = { ...choices[index], ...updates };
    onChange({ ...segment, choices });
  };

  const addChoice = (): void => {
    const choices = [
      ...(segment.choices || []),
      { text: '', nextSegmentId: undefined },
    ];
    onChange({ ...segment, choices });
  };

  const removeChoice = (index: number): void => {
    const choices = (segment.choices || []).filter((_, i) => i !== index);
    onChange({ ...segment, choices });
  };

  // Available targets: other segments (not self)
  const targetOptions = allSegmentIds.filter((id) => id !== segment.id);

  // Map segment id -> preview label (first 40 chars of text)
  const labelForId = (id: string): string => {
    const target = allSegments?.find((s) => s.id === id);
    if (!target) return id;
    const text = target.text.trim();
    if (!text) return `${id} (empty)`;
    const short = text.length > 40 ? `${text.slice(0, 40)}…` : text;
    return `${id} — ${short}`;
  };

  // Word count + reading time
  const { wordCount, readingMinutes } = useMemo(() => {
    const words = segment.text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return { wordCount: words, readingMinutes: minutes };
  }, [segment.text]);

  const handleCreateBranch = (): void => {
    if (!onCreateBranch) return;
    const newId = onCreateBranch();
    // Point the first empty choice at the new segment, or append a new choice.
    const existing = segment.choices || [];
    const emptyIdx = existing.findIndex((c) => !c.nextSegmentId);
    let nextChoices: StoryChoice[];
    if (emptyIdx >= 0) {
      nextChoices = existing.map((c, i) =>
        i === emptyIdx ? { ...c, nextSegmentId: newId } : c
      );
    } else {
      nextChoices = [...existing, { text: '', nextSegmentId: newId }];
    }
    onChange({ ...segment, choices: nextChoices });
    // Give the editor a tick to render the new segment, then focus it.
    setTimeout(() => onFocusSegment?.(newId), 50);
  };

  const textareaId = `seg-text-${segment.id}`;

  return (
    <TooltipProvider delayDuration={150}>
      <Card
        id={`segment-${segment.id}`}
        className={cn(
          'bg-card/80 backdrop-blur-sm scroll-mt-24',
          segment.type === 'interactive' && 'border-primary/40'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Segment: {segment.id}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] py-0 h-5 gap-1',
                  segment.type === 'interactive'
                    ? 'border-primary/60 text-primary'
                    : 'border-border text-muted-foreground'
                )}
              >
                {segment.type === 'interactive' ? (
                  <>
                    <GitBranch className="h-3 w-3" /> Branching
                  </>
                ) : (
                  <>
                    <BookOpen className="h-3 w-3" /> Linear
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="h-7 w-7"
                aria-label="Move up"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="h-7 w-7"
                aria-label="Move down"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-7 w-7 text-destructive hover:text-destructive"
                aria-label="Delete segment"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Segment ID */}
          <div className="space-y-1">
            <Label htmlFor={`seg-id-${segment.id}`} className="text-xs flex items-center gap-1.5">
              Segment ID
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="About segment IDs"
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs leading-relaxed">
                  Think of this as a bookmark name. Choices in other segments
                  use this ID to link back to this scene. Keep it short and
                  recognizable (e.g., <code>opening</code>, <code>verdict</code>).
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              id={`seg-id-${segment.id}`}
              value={segment.id}
              onChange={(e) => updateField('id', e.target.value)}
              placeholder="unique-segment-id"
              className="h-8 text-sm"
            />
          </div>

          {/* Type */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs">Type</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="About segment types"
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <p>
                    <strong>Linear:</strong> Story continues automatically to
                    the next segment.
                  </p>
                  <p className="mt-1">
                    <strong>Branching:</strong> Reader chooses between
                    multiple paths.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={segment.type}
              onValueChange={(v) =>
                handleTypeChange(v as 'linear' | 'interactive')
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="interactive">
                  Interactive (with choices)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text — distraction-free writing area */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor={textareaId} className="text-xs">
                Segment Text
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {wordCount} word{wordCount === 1 ? '' : 's'} · ~
                {readingMinutes} min read
              </span>
            </div>
            <Textarea
              id={textareaId}
              value={segment.text}
              onChange={(e) => updateField('text', e.target.value)}
              onFocus={() => setTextFocused(true)}
              onBlur={() => setTextFocused(false)}
              placeholder="Write the segment narrative..."
              className={cn(
                'text-lg leading-relaxed transition-[min-height] duration-300 ease-out',
                textFocused ? 'min-h-[400px]' : 'min-h-[250px]'
              )}
            />
            {!segment.text.trim() && (
              <div className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/5 px-3 py-2 mt-1">
                <span className="text-xs text-accent font-semibold mt-0.5">Tip:</span>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Open with a sensory detail or a moment of action.
                  &ldquo;The smell of ozone&rdquo; beats &ldquo;She was scared.&rdquo;
                  Use the Writing Assistant on the right for more ideas.
                </p>
              </div>
            )}
          </div>

          {/* Linear: continues-to */}
          {segment.type === 'linear' && (
            <div className="space-y-1 rounded-md border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs">Continues to</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="About linear continuation"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <HelpCircle className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Linear segments automatically continue to the next
                    segment in order. The reader does not make a choice.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-[11px] text-muted-foreground">
                The next segment in the list plays automatically after this
                one. Use the reorder arrows to change order.
              </p>
            </div>
          )}

          {/* Choices (interactive only) */}
          {segment.type === 'interactive' && (
            <div className="space-y-3 rounded-md border border-primary/40 bg-primary/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-primary" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Branching Paths
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="About choices"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <HelpCircle className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      Each choice should lead to a different segment,
                      creating a branching narrative tree.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {(segment.choices || []).map((choice, idx) => {
                const leadsNowhere =
                  !choice.nextSegmentId && !choice.reflectionTrigger;
                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 p-3 border rounded-md bg-background/60"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={choice.text}
                        onChange={(e) =>
                          updateChoice(idx, { text: e.target.value })
                        }
                        placeholder="Choice text..."
                        className="h-8 text-sm flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeChoice(idx)}
                        className="h-7 w-7 text-destructive shrink-0"
                        aria-label="Remove choice"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                        leads to <ArrowRight className="h-3 w-3" />
                      </span>
                      <Select
                        value={choice.nextSegmentId || NONE_TARGET}
                        onValueChange={(v) =>
                          updateChoice(idx, {
                            nextSegmentId:
                              v === NONE_TARGET ? undefined : v,
                          })
                        }
                      >
                        <SelectTrigger className="h-7 text-xs flex-1 min-w-[180px]">
                          <SelectValue placeholder="Select target segment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_TARGET}>
                            — None (ending) —
                          </SelectItem>
                          {targetOptions.map((id) => (
                            <SelectItem key={id} value={id}>
                              {labelForId(id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`choice-ending-${segment.id}-${idx}`}
                          checked={Boolean(choice.reflectionTrigger)}
                          onCheckedChange={(checked) =>
                            updateChoice(idx, {
                              reflectionTrigger: checked,
                            })
                          }
                        />
                        <Label
                          htmlFor={`choice-ending-${segment.id}-${idx}`}
                          className="text-[11px] text-muted-foreground flex items-center gap-1 cursor-pointer"
                        >
                          <Flag className="h-3 w-3 text-amber-400" />
                          Ending
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label="About endings"
                              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                            >
                              <HelpCircle className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            Mark this as an ending. AI-generated reflection
                            will fire after the reader reaches it.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {leadsNowhere && (
                        <div className="flex items-start gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/5 px-2 py-1.5 text-[11px] text-amber-400">
                          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>
                            This path currently ends here. Link it to another
                            segment to keep the story going, or mark this choice
                            as an ending above.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addChoice}
                  className="flex-1"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Choice
                </Button>
                {onCreateBranch && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCreateBranch}
                    className="flex-1"
                  >
                    <GitBranch className="mr-1 h-3 w-3" />
                    Create New Branch
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
