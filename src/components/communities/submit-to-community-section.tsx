'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Share2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUserCommunities } from '@/hooks/use-user-communities';
import { createContribution } from '@/app/actions/contributions';
import { CONTRIBUTION_TYPE_META } from '@/components/communities/contribution-card';
import { cn } from '@/lib/utils';
import type { ContributionType } from '@/types';

export interface SubmitToCommunitySectionProps {
  /** The kind of artifact being submitted. Drives the feed card + filters. */
  type: ContributionType;
  /** Suggested title; users don't edit it here but can add a note. */
  defaultTitle?: string;
  /** Pre-filled note/summary the user can edit. */
  defaultSummary?: string;
  /** Optional source artifact reference (collection + id). */
  sourceCollection?: string;
  sourceId?: string;
  /**
   * Inline metadata payload stored with the submission — score, answers,
   * reflection, framework alignment, decision path, generated report, badges,
   * completedAt, etc. Anything the activity produced.
   */
  content?: Record<string, any>;
  /** Section heading. Defaults to "Submit to your community". */
  heading?: string;
  /** Called after a successful submission. */
  onSubmitted?: (contributionId: string, communityId: string) => void;
  className?: string;
}

/**
 * Reusable end-of-activity panel that lets a learner submit whatever they just
 * completed (quiz result, reflection, story path, framework alignment,
 * generated report, …) into one of their communities.
 *
 * Behaviour, per the community-submission spec:
 *  - belongs to exactly one community → that community is shown as the target;
 *  - belongs to several → a dropdown lets them pick which one;
 *  - belongs to none → the control is disabled/greyed with an explanation and
 *    a link to join or be added to a community first;
 *  - shows an inline success message and disables the button afterwards to
 *    prevent duplicate submissions.
 *
 * It is intentionally generic: every activity completion screen can drop this
 * in and pass its result data via `content` without duplicating submit logic.
 */
export function SubmitToCommunitySection({
  type,
  defaultTitle = '',
  defaultSummary = '',
  sourceCollection,
  sourceId,
  content,
  heading = 'Submit to your community',
  onSubmitted,
  className,
}: SubmitToCommunitySectionProps) {
  const { user } = useAuth();
  const { communities, loading, error: loadError } = useUserCommunities();

  const [communityId, setCommunityId] = useState('');
  const [note, setNote] = useState(defaultSummary);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string; communityId: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Keep the note in sync if the activity recomputes its default summary.
  useEffect(() => {
    setNote(defaultSummary);
  }, [defaultSummary]);

  // Auto-target the only community a single-community user belongs to.
  useEffect(() => {
    if (communities.length === 1) {
      setCommunityId(communities[0].id);
    }
  }, [communities]);

  if (!user) return null;

  const typeLabel = CONTRIBUTION_TYPE_META[type]?.label ?? 'Result';
  const selectedCommunity = communities.find((c) => c.id === communityId);

  async function handleSubmit() {
    if (!user || !communityId || submitting || submitted) return;
    setSubmitting(true);
    setError(null);

    const title = defaultTitle.trim() || `${typeLabel}`;

    try {
      const result = await createContribution({
        communityId,
        type,
        contributorId: user.uid,
        contributorName:
          user.displayName || user.email?.split('@')[0] || 'A community member',
        title,
        summary: note.trim(),
        sourceCollection,
        sourceId,
        // Always stamp when this activity was completed/submitted so the
        // community record carries the "date and time completed" field even
        // when the caller forgot to include it in `content`.
        content: { completedAt: new Date().toISOString(), ...(content ?? {}) },
      });

      if (result.success) {
        setSubmitted({ id: result.data, communityId });
        onSubmitted?.(result.data, communityId);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success state ───────────────────────────────────────────────
  if (submitted) {
    const name = selectedCommunity?.name ?? 'your community';
    return (
      <Card
        className={cn(
          'bg-card/80 backdrop-blur-sm border-2 border-primary/40',
          className
        )}
      >
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <div className="space-y-1">
            <p className="font-semibold">Submitted to {name}</p>
            <p className="text-sm text-muted-foreground">
              Your {typeLabel.toLowerCase()} is now part of your community
              learning record. Community members can see and discuss it.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/communities/${submitted.communityId}/contributions/${submitted.id}`}>
              View submission
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasNoCommunity = !loading && communities.length === 0;

  return (
    <Card className={cn('bg-card/80 backdrop-blur-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          {heading}
        </CardTitle>
        <CardDescription>
          {hasNoCommunity
            ? 'Save this result to a community learning record.'
            : 'Only members of the community you choose will see this and the discussion around it.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your communities…
          </div>
        ) : hasNoCommunity ? (
          // ─── No-community disabled state ──────────────────────────
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                You must join or be added to a community before you can submit
                results. Ask your instructor for an invite code, or browse
                available communities.
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/communities">Browse communities</Link>
              </Button>
              <Button disabled className="opacity-60">
                <Share2 className="mr-2 h-4 w-4" />
                Submit to community
              </Button>
            </div>
          </div>
        ) : (
          // ─── Single / multi community submit ─────────────────────
          <div className="space-y-4">
            <div>
              <Label htmlFor="submit-community">Community</Label>
              {communities.length === 1 ? (
                <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{communities[0].name}</span>
                </div>
              ) : (
                <Select value={communityId} onValueChange={setCommunityId}>
                  <SelectTrigger id="submit-community" className="mt-1">
                    <SelectValue placeholder="Choose which community…" />
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
              <Label htmlFor="submit-note">Add a note (optional)</Label>
              <Textarea
                id="submit-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share context or a question for your community…"
                rows={3}
                className="mt-1"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={submitting || !communityId}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Submit to community
                </>
              )}
            </Button>
          </div>
        )}

        {loadError && !loading && (
          <p className="text-xs text-muted-foreground">
            Couldn&apos;t load your communities. {loadError}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
