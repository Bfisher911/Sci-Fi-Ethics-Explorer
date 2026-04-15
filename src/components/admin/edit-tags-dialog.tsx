'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

const GENRES = [
  'Cyberpunk',
  'Space Opera',
  'Post-Apocalyptic',
  'Biopunk',
  'Time Travel',
  'Utopian/Dystopian',
  'Military Sci-Fi',
  'Philosophical Sci-Fi',
];

export interface EditTagsValues {
  genre?: string;
  theme?: string;
  tags?: string[];
}

interface EditTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: { genre?: string; theme?: string; tags?: string[] };
  onSave: (values: EditTagsValues) => Promise<void> | void;
  isSaving?: boolean;
}

/**
 * Modal for admins to edit genre / theme / tags on a piece of content.
 */
export function EditTagsDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  isSaving,
}: EditTagsDialogProps) {
  const [genre, setGenre] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>('');

  useEffect(() => {
    if (open) {
      setGenre(initial?.genre ?? '');
      setTheme(initial?.theme ?? '');
      setTagsText((initial?.tags ?? []).join(', '));
    }
  }, [open, initial]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const values: EditTagsValues = {
      genre: genre || undefined,
      theme: theme || undefined,
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    await onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
          <DialogDescription>
            Update the genre, theme, and tags for this item. Changes are audit-logged.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-tags-genre">Genre</Label>
            <Select value={genre || undefined} onValueChange={(v) => setGenre(v)}>
              <SelectTrigger id="edit-tags-genre">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-tags-theme">Theme</Label>
            <Input
              id="edit-tags-theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Identity, AI Rights, Surveillance"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-tags-tags">Tags</Label>
            <Input
              id="edit-tags-tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="comma, separated, tags"
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
