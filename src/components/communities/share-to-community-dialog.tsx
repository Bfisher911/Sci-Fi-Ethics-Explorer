
'use client';

import { useEffect, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getUserCommunities } from '@/app/actions/communities';
import { createContribution } from '@/app/actions/contributions';
import type { Community, ContributionType } from '@/types';
import { Share2, Users, Loader2 } from 'lucide-react';

export interface ShareToCommunityDialogProps {
  type: ContributionType;
  /** Default title suggestion; user can override in the dialog */
  defaultTitle?: string;
  /** Default summary suggestion; user can override */
  defaultSummary?: string;
  /** Optional source artifact reference */
  sourceCollection?: string;
  sourceId?: string;
  /** Inline payload stored with the contribution */
  content?: Record<string, any>;
  /** Optional trigger override; defaults to a styled Share button */
  trigger?: React.ReactNode;
  /** Called after successful share */
  onShared?: (contributionId: string, communityId: string) => void;
}

/**
 * Reusable dialog that lets a user share any artifact into one of their
 * communities. Fetches the user's communities on open, lets them pick one,
 * edit title/summary, and submits to the communityContributions collection.
 */
export function ShareToCommunityDialog({
  type,
  defaultTitle = '',
  defaultSummary = '',
  sourceCollection,
  sourceId,
  content,
  trigger,
  onShared,
}: ShareToCommunityDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [communityId, setCommunityId] = useState<string>('');
  const [title, setTitle] = useState(defaultTitle);
  const [summary, setSummary] = useState(defaultSummary);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);
  useEffect(() => {
    setSummary(defaultSummary);
  }, [defaultSummary]);

  useEffect(() => {
    if (!open || !user?.uid) return;
    let cancelled = false;

    async function load() {
      setLoadingCommunities(true);
      try {
        const result = await getUserCommunities(user!.uid);
        if (!cancelled && result.success) {
          setCommunities(result.data);
          if (result.data.length === 1) setCommunityId(result.data[0].id);
        }
      } catch (err) {
        console.error('[ShareToCommunityDialog] load failed:', err);
      } finally {
        if (!cancelled) setLoadingCommunities(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, user?.uid]);

  async function handleShare() {
    if (!user?.uid) return;
    if (!communityId) {
      toast({ title: 'Pick a community', description: 'Select a community to share with.' });
      return;
    }
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Give this a short title.' });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createContribution({
        communityId,
        type,
        contributorId: user.uid,
        contributorName:
          user.displayName || user.email?.split('@')[0] || 'A community member',
        title: title.trim(),
        summary: summary.trim(),
        sourceCollection,
        sourceId,
        content,
      });

      if (result.success) {
        toast({
          title: 'Shared to community',
          description: 'Community members can now see and discuss this.',
        });
        setOpen(false);
        onShared?.(result.data, communityId);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to share',
          description: result.error,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share to community
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Share to a community
          </DialogTitle>
          <DialogDescription>
            Only members of the community you select will see this contribution and
            the discussion around it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="share-community">Community</Label>
            {loadingCommunities ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your communities…
              </div>
            ) : communities.length === 0 ? (
              <p className="text-sm text-muted-foreground pt-2">
                You are not a member of any community yet. Join or create one first.
              </p>
            ) : (
              <Select value={communityId} onValueChange={setCommunityId}>
                <SelectTrigger id="share-community" className="mt-1">
                  <SelectValue placeholder="Choose a community…" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="share-title">Title</Label>
            <Input
              id="share-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A short, descriptive title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="share-summary">What would you like to say?</Label>
            <Textarea
              id="share-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Add context or a question for the community (optional)"
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={submitting || !communityId}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing…
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
