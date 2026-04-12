'use client';

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
import { ArrowUp, ArrowDown, Plus, Trash2, X } from 'lucide-react';

interface SegmentEditorProps {
  segment: StorySegment;
  allSegmentIds: string[];
  onChange: (updated: StorySegment) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

/**
 * Editor for a single story segment. Supports linear and interactive types,
 * with choice editing for interactive segments.
 */
export function SegmentEditor({
  segment,
  allSegmentIds,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SegmentEditorProps): JSX.Element {
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
    const choices = [...(segment.choices || []), { text: '', nextSegmentId: undefined }];
    onChange({ ...segment, choices });
  };

  const removeChoice = (index: number): void => {
    const choices = (segment.choices || []).filter((_, i) => i !== index);
    onChange({ ...segment, choices });
  };

  // Available targets: other segments (not self)
  const targetOptions = allSegmentIds.filter((id) => id !== segment.id);

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Segment: {segment.id}
          </CardTitle>
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
          <Label htmlFor={`seg-id-${segment.id}`} className="text-xs">
            Segment ID
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
          <Label className="text-xs">Type</Label>
          <Select
            value={segment.type}
            onValueChange={(v) => handleTypeChange(v as 'linear' | 'interactive')}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="interactive">Interactive (with choices)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text */}
        <div className="space-y-1">
          <Label htmlFor={`seg-text-${segment.id}`} className="text-xs">
            Segment Text
          </Label>
          <Textarea
            id={`seg-text-${segment.id}`}
            value={segment.text}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Write the segment narrative..."
            rows={4}
            className="text-sm"
          />
        </div>

        {/* Choices (interactive only) */}
        {segment.type === 'interactive' && (
          <div className="space-y-3">
            <Label className="text-xs">Choices</Label>
            {(segment.choices || []).map((choice, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 p-3 border rounded-md bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={choice.text}
                    onChange={(e) => updateChoice(idx, { text: e.target.value })}
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
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] text-muted-foreground shrink-0">
                    Goes to:
                  </Label>
                  <Select
                    value={choice.nextSegmentId || '__none__'}
                    onValueChange={(v) =>
                      updateChoice(idx, {
                        nextSegmentId: v === '__none__' ? undefined : v,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None (ending)</SelectItem>
                      {targetOptions.map((id) => (
                        <SelectItem key={id} value={id}>
                          {id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addChoice} className="w-full">
              <Plus className="mr-1 h-3 w-3" />
              Add Choice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
