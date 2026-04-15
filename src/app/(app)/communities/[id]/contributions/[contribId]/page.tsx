'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Lock,
  Trash2,
  Send,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getCommunity } from '@/app/actions/communities';
import {
  getContribution,
  getContributionComments,
  addContributionComment,
  deleteContribution,
  deleteContributionComment,
} from '@/app/actions/contributions';
import { CONTRIBUTION_TYPE_META } from '@/components/communities/contribution-card';
import type {
  Community,
  CommunityContribution,
  ContributionComment,
} from '@/types';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

function toDate(value: Date | any): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Renders the inner content area for a contribution based on its type.
 */
function ContributionContent({
  contribution,
}: {
  contribution: CommunityContribution;
}) {
  const { type, content, sourceId, summary } = contribution;

  if (type === 'analysis') {
    const scenarioText: string | undefined = content?.scenarioText;
    const dilemmas: string[] = content?.ethicalDilemmas ?? [];
    const consequences: string[] = content?.potentialConsequences ?? [];
    const frameworks: string[] = content?.applicableEthicalTheories ?? [];

    return (
      <div className="space-y-6">
        {scenarioText && (
          <div className="bg-muted/40 border border-border rounded-md p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {scenarioText}
            </p>
          </div>
        )}
        {dilemmas.length > 0 && (
          <div>
            <h3 className="text-base font-semibold mb-2">Ethical Dilemmas</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {dilemmas.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}
        {consequences.length > 0 && (
          <div>
            <h3 className="text-base font-semibold mb-2">
              Potential Consequences
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {consequences.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {frameworks.length > 0 && (
          <div>
            <h3 className="text-base font-semibold mb-2">
              Applicable Frameworks
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {frameworks.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (type === 'quiz_result') {
    const dominant: string | undefined = content?.dominantFramework;
    const scores: Record<string, number> = content?.scores ?? {};
    const maxScore = Math.max(1, ...Object.values(scores).map((v) => Number(v) || 0));

    return (
      <div className="space-y-4">
        {dominant && (
          <div>
            <p className="text-sm text-muted-foreground">Dominant Framework</p>
            <h3 className="text-2xl font-bold text-primary">{dominant}</h3>
          </div>
        )}
        {Object.keys(scores).length > 0 && (
          <div className="space-y-2">
            {Object.entries(scores).map(([framework, score]) => {
              const pct = Math.round(((Number(score) || 0) / maxScore) * 100);
              return (
                <div key={framework}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{framework}</span>
                    <span className="text-muted-foreground">{score}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (type === 'perspective_comparison') {
    const scenario: string | undefined = content?.scenario;
    const userChoice: string | undefined = content?.userChoice;
    const comparisons: Array<{
      framework: string;
      analysis: string;
      verdict: string;
      strength?: 'supports' | 'opposes' | 'neutral';
    }> = content?.comparisons ?? [];
    const synthesis: string | undefined = content?.synthesis;

    return (
      <div className="space-y-6">
        {scenario && (
          <div>
            <h3 className="text-base font-semibold mb-2">Scenario</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {scenario}
            </p>
          </div>
        )}
        {userChoice && (
          <div>
            <h3 className="text-base font-semibold mb-2">Your Choice</h3>
            <p className="text-sm">{userChoice}</p>
          </div>
        )}
        {comparisons.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Framework Perspectives</h3>
            {comparisons.map((c, i) => (
              <Card key={i} className="bg-card/60">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold">{c.framework}</h4>
                    {c.strength && (
                      <Badge
                        className={cn(
                          'capitalize',
                          c.strength === 'supports' &&
                            'bg-green-500/15 text-green-500 border-green-500/40',
                          c.strength === 'opposes' &&
                            'bg-red-500/15 text-red-500 border-red-500/40',
                          c.strength === 'neutral' &&
                            'bg-yellow-500/15 text-yellow-500 border-yellow-500/40'
                        )}
                        variant="outline"
                      >
                        {c.strength}
                      </Badge>
                    )}
                  </div>
                  {c.analysis && (
                    <p className="text-sm text-muted-foreground">
                      {c.analysis}
                    </p>
                  )}
                  {c.verdict && (
                    <p className="text-sm">
                      <span className="font-medium">Verdict: </span>
                      {c.verdict}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {synthesis && (
          <div>
            <h3 className="text-base font-semibold mb-2">Synthesis</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {synthesis}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (type === 'dilemma') {
    return (
      <div className="space-y-4">
        {summary && <p className="text-sm">{summary}</p>}
        {sourceId && (
          <Button asChild variant="outline">
            <Link href={`/community-dilemmas`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Dilemma
            </Link>
          </Button>
        )}
      </div>
    );
  }

  if (type === 'debate') {
    return (
      <div className="space-y-4">
        {summary && <p className="text-sm">{summary}</p>}
        {sourceId && (
          <Button asChild variant="outline">
            <Link href={`/debate-arena/${sourceId}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Debate
            </Link>
          </Button>
        )}
      </div>
    );
  }

  if (type === 'story') {
    return (
      <div className="space-y-4">
        {summary && <p className="text-sm">{summary}</p>}
        {sourceId && (
          <Button asChild variant="outline">
            <Link href={`/stories/${sourceId}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Read Story
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return null;
}

export default function ContributionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const communityId = params.id as string;
  const contribId = params.contribId as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [contribution, setContribution] =
    useState<CommunityContribution | null>(null);
  const [comments, setComments] = useState<ContributionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const isMember = Boolean(
    user &&
      community &&
      ((community.instructorIds?.includes(user.uid) ?? false) ||
        (community.memberIds?.includes(user.uid) ?? false))
  );
  const isInstructor = Boolean(
    user && community && community.instructorIds?.includes(user.uid)
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [commRes, contribRes] = await Promise.all([
      getCommunity(communityId),
      getContribution(contribId),
    ]);

    if (commRes.success && commRes.data) {
      setCommunity(commRes.data);
    }

    if (contribRes.success) {
      if (contribRes.data) {
        setContribution(contribRes.data);
      } else {
        setNotFound(true);
      }
    }
    setLoading(false);
  }, [communityId, contribId]);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    const res = await getContributionComments(contribId);
    if (res.success) setComments(res.data);
    setCommentsLoading(false);
  }, [contribId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handlePostComment(): Promise<void> {
    if (!user || !contribution) return;
    const content = newComment.trim();
    if (!content) return;

    setPosting(true);

    // Optimistic append
    const tempId = `temp-${Date.now()}`;
    const optimistic: ContributionComment = {
      id: tempId,
      contributionId: contribution.id,
      authorId: user.uid,
      authorName: user.displayName || user.email || 'You',
      authorAvatarUrl: user.photoURL || undefined,
      content,
      createdAt: new Date(),
    };
    setComments((prev) => [...prev, optimistic]);
    setNewComment('');

    const result = await addContributionComment({
      contributionId: contribution.id,
      authorId: user.uid,
      authorName: user.displayName || user.email || 'Anonymous',
      authorAvatarUrl: user.photoURL || undefined,
      content,
    });

    setPosting(false);

    if (!result.success) {
      // Roll back
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setNewComment(content);
      toast({
        title: 'Could not post comment',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    // Reload authoritative list
    loadComments();
  }

  async function handleDeleteContribution(): Promise<void> {
    if (!user || !contribution) return;
    setDeleting(true);
    const result = await deleteContribution(contribution.id, user.uid);
    setDeleting(false);
    if (result.success) {
      toast({ title: 'Contribution deleted' });
      router.push(`/communities/${communityId}`);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  async function handleDeleteComment(commentId: string): Promise<void> {
    if (!user || !contribution) return;
    const prev = comments;
    setComments((list) => list.filter((c) => c.id !== commentId));
    const res = await deleteContributionComment(
      contribution.id,
      commentId,
      user.uid
    );
    if (!res.success) {
      setComments(prev);
      toast({
        title: 'Could not delete comment',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  const backHref = `/communities/${communityId}`;

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (notFound || !contribution) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Link>
        </Button>
        <Card className="bg-card/80 backdrop-blur-sm p-12 text-center">
          <p className="text-muted-foreground">Contribution not found.</p>
        </Card>
      </div>
    );
  }

  // Community gate
  if (community && !isMember) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="py-12 text-center space-y-4">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              This conversation is private to community members.
            </p>
            <Button asChild variant="outline">
              <Link href="/communities">Back to Communities</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const meta = CONTRIBUTION_TYPE_META[contribution.type];
  const TypeIcon = meta.icon;
  const canDelete =
    !!user && (user.uid === contribution.contributorId || isInstructor);
  const created = toDate(contribution.createdAt);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contributions
        </Link>
      </Button>

      <Card className="bg-card/80 backdrop-blur-sm mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 min-w-0">
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 w-fit"
              >
                <TypeIcon className="h-3.5 w-3.5" />
                {meta.label}
              </Badge>
              <CardTitle className="text-2xl md:text-3xl font-bold leading-tight">
                {contribution.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-7 w-7">
                  {contribution.contributorAvatarUrl && (
                    <AvatarImage src={contribution.contributorAvatarUrl} />
                  )}
                  <AvatarFallback className="text-[10px]">
                    {initials(contribution.contributorName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">
                  {contribution.contributorName}
                </span>
                <span>·</span>
                <span>{formatDistanceToNow(created, { addSuffix: true })}</span>
              </div>
            </div>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteContribution}
                disabled={deleting}
                aria-label="Delete contribution"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {contribution.summary && (
            <p className="text-base text-muted-foreground whitespace-pre-wrap">
              {contribution.summary}
            </p>
          )}
          <Separator />
          <ContributionContent contribution={contribution} />
        </CardContent>
      </Card>

      {/* Discussion */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            Discussion ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New comment */}
          {user && (
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts…"
                rows={3}
                disabled={posting}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handlePostComment}
                  disabled={posting || !newComment.trim()}
                >
                  {posting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Comments list */}
          {commentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              Be the first to reply.
            </p>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => {
                const commentDate = toDate(comment.createdAt);
                const canDeleteComment =
                  !!user &&
                  (user.uid === comment.authorId || isInstructor);
                return (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      {comment.authorAvatarUrl && (
                        <AvatarImage src={comment.authorAvatarUrl} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {initials(comment.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">
                            {comment.authorName}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatDistanceToNow(commentDate, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        {canDeleteComment && !comment.id.startsWith('temp-') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteComment(comment.id)}
                            aria-label="Delete comment"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
