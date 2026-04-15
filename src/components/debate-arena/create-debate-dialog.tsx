'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createDebate } from '@/app/actions/debates';
import { createContribution } from '@/app/actions/contributions';
import { getUserCommunities } from '@/app/actions/communities';
import type { Community } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';

const NONE_COMMUNITY_VALUE = '__none__';

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
  const [communityId, setCommunityId] = useState<string>(NONE_COMMUNITY_VALUE);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  useEffect(() => {
    if (!open || !user?.uid) return;
    let cancelled = false;
    setLoadingCommunities(true);
    getUserCommunities(user.uid)
      .then((res) => {
        if (!cancelled && res.success) {
          setCommunities(res.data);
        }
      })
      .catch((err) => console.error('[CreateDebateDialog] communities:', err))
      .finally(() => {
        if (!cancelled) setLoadingCommunities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, user?.uid]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTagsInput('');
    setCommunityId(NONE_COMMUNITY_VALUE);
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

    if (result.success) {
      // If a community was selected, also share the debate as a contribution.
      if (
        communityId &&
        communityId !== NONE_COMMUNITY_VALUE &&
        user
      ) {
        try {
          const shareResult = await createContribution({
            communityId,
            type: 'debate',
            contributorId: user.uid,
            contributorName: user.displayName || 'A member',
            title: title.trim(),
            summary: description.trim(),
            sourceCollection: 'debates',
            sourceId: result.data,
          });
          if (!shareResult.success) {
            console.error(
              '[CreateDebateDialog] share failed:',
              shareResult.error
            );
            toast({
              title: 'Debate created, share failed',
              description: shareResult.error,
              variant: 'destructive',
            });
          }
        } catch (err) {
          console.error('[CreateDebateDialog] share error:', err);
        }
      }

      toast({ title: 'Debate Created', description: 'Your debate is now open for arguments.' });
      resetForm();
      setOpen(false);
      onDebateCreated?.();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }

    setIsSubmitting(false);
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
            {user && (
              <div className="grid gap-2">
                <Label htmlFor="debate-community">
                  Share to community (optional)
                </Label>
                <Select
                  value={communityId}
                  onValueChange={setCommunityId}
                  disabled={loadingCommunities}
                >
                  <SelectTrigger id="debate-community">
                    <SelectValue
                      placeholder={
                        loadingCommunities
                          ? 'Loading…'
                          : '— None (Public) —'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_COMMUNITY_VALUE}>
                      — None (Public) —
                    </SelectItem>
                    {communities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  When shared, community members can discuss this debate
                  privately.
                </p>
              </div>
            )}
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
