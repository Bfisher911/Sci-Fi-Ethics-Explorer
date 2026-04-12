'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createDebate } from '@/app/actions/debates';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';

interface CreateDebateDialogProps {
  onDebateCreated?: () => void;
}

export function CreateDebateDialog({ onDebateCreated }: CreateDebateDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTagsInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to create a debate.', variant: 'destructive' });
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast({ title: 'Error', description: 'Title and description are required.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const result = await createDebate({
      title: title.trim(),
      description: description.trim(),
      creatorId: user.uid,
      creatorName: user.displayName || user.email || 'Anonymous',
      tags: tags.length > 0 ? tags : undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Debate Created', description: 'Your debate is now open for arguments.' });
      resetForm();
      setOpen(false);
      onDebateCreated?.();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Create New Debate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-primary">Create a New Debate</DialogTitle>
            <DialogDescription>
              Start a structured debate on an ethical dilemma. Others can join and submit arguments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="debate-title">Title</Label>
              <Input
                id="debate-title"
                placeholder="e.g., Should AI have rights?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="debate-description">Description</Label>
              <Textarea
                id="debate-description"
                placeholder="Describe the ethical dilemma and the core question to debate..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="debate-tags">Tags (optional, comma-separated)</Label>
              <Input
                id="debate-tags"
                placeholder="e.g., AI, consciousness, rights"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Debate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
