'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  GitBranch,
  Sparkles,
  Search,
  Brain,
  Box,
  Layers,
  Wand2,
} from 'lucide-react';
import { STORY_TEMPLATES, type StoryTemplate } from '@/data/story-templates';
import { cn } from '@/lib/utils';

interface TemplatePickerProps {
  /** Called when the user picks a template. */
  onPick: (template: StoryTemplate) => void;
  /** Optional custom trigger button. */
  trigger?: React.ReactNode;
}

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  'heros-choice': GitBranch,
  investigation: Search,
  'ethical-trap': Brain,
  'linear-tale': BookOpen,
  'mystery-box': Box,
};

export function TemplatePicker({ onPick, trigger }: TemplatePickerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = (): void => {
    if (!selectedId) return;
    const t = STORY_TEMPLATES.find((x) => x.id === selectedId);
    if (t) {
      onPick(t);
      setOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Wand2 className="h-4 w-4 mr-2" />
            Start from a Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-sm max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Story Templates
          </DialogTitle>
          <DialogDescription>
            Pick a structure to start from. The placeholder text guides what to write —
            you'll replace it with your own story.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STORY_TEMPLATES.map((t) => {
              const Icon = TEMPLATE_ICONS[t.id] || Sparkles;
              const isSelected = selectedId === t.id;
              const segCount = t.segments.length;
              const branchCount = t.segments.filter((s) => s.type === 'interactive').length;
              return (
                <Card
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    'cursor-pointer transition-all bg-card/80 backdrop-blur-sm hover:border-primary/40',
                    isSelected && 'border-primary shadow-md shadow-primary/20'
                  )}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(t.id);
                    }
                  }}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{t.name}</h3>
                      {t.isInteractive ? (
                        <Badge variant="secondary" className="text-xs">Interactive</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Linear</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {segCount} segments
                      </Badge>
                      {branchCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {branchCount} branch points
                        </Badge>
                      )}
                      {t.suggestedGenre && (
                        <Badge variant="outline" className="text-xs">
                          {t.suggestedGenre}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Templates replace your current segments. Save first if you want to keep them.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedId}>
              Use Template
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
