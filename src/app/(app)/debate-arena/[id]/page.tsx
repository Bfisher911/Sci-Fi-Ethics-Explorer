'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getDebateById, getArguments, closeDebate } from '@/app/actions/debates';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ArgumentCard } from '@/components/debate-arena/argument-card';
import { SubmitArgumentForm } from '@/components/debate-arena/submit-argument-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  Swords,
  User,
  CalendarDays,
  Users,
  Lock,
  Trophy,
  Loader2,
} from 'lucide-react';
import type { Debate, DebateArgument } from '@/types';
import { BookmarkButton } from '@/components/bookmarks/bookmark-button';
import { ShareToMessageDialog } from '@/components/messages/share-to-message-dialog';
import { AdminActions } from '@/components/admin/admin-actions';
import { adminDeleteArtifact } from '@/app/actions/admin';
import { PageWalkthrough } from '@/components/walkthroughs/page-walkthrough';

const DEBATE_WALKTHROUGH_STEPS = [
  {
    element: '[data-tour="debate-header"]',
    title: 'The debate topic',
    description:
      'Debates center on a single contested question. Read the description carefully — the exact framing is what arguments will be judged on.',
    side: 'bottom' as const,
  },
  {
    element: '[data-tour="debate-status"]',
    title: 'Debate status',
    description:
      'Open debates accept new arguments. Voting debates let you rate existing ones. Closed debates are archived with a final tally.',
    side: 'bottom' as const,
  },
  {
    element: '[data-tour="debate-scores"]',
    title: 'Live scoreboard',
    description:
      'Pro and Con scores are the sum of upvotes minus downvotes on each side\'s arguments. The stronger-supported side leads.',
    side: 'bottom' as const,
  },
  {
    element: '[data-tour="debate-pro"]',
    title: 'Pro side',
    description:
      'Arguments in favor of the proposition. Strong pros give reasons, cite sources, address obvious objections, and avoid insulting the other side.',
    side: 'right' as const,
  },
  {
    element: '[data-tour="debate-con"]',
    title: 'Con side',
    description:
      'Arguments against the proposition. Both sides are voted on independently — good counter-arguments can win a debate even for the minority view.',
    side: 'left' as const,
  },
  {
    element: '[data-tour="debate-submit"]',
    title: 'Add your voice',
    description:
      'Pick a side, write your argument, and submit. You can upvote or downvote arguments on either side. Stay on-topic and civil.',
    side: 'top' as const,
  },
];

const statusVariants: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  voting: { label: 'Voting', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-muted' },
};

export default function DebateDetailPage() {
  const params = useParams();
  const debateId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [debate, setDebate] = useState<Debate | null>(null);
  const [args, setArgs] = useState<DebateArgument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [debateResult, argsResult] = await Promise.all([
      getDebateById(debateId),
      getArguments(debateId),
    ]);

    if (debateResult.success) {
      setDebate(debateResult.data);
    } else {
      setError(debateResult.error);
    }

    if (argsResult.success) {
      setArgs(argsResult.data);
    }

    setIsLoading(false);
  }, [debateId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseDebate = async () => {
    if (!user || !debate) return;

    setIsClosing(true);
    const result = await closeDebate(debateId, user.uid);
    setIsClosing(false);

    if (result.success) {
      toast({ title: 'Debate Closed', description: 'The debate has been closed.' });
      setDebate((prev) => (prev ? { ...prev, status: 'closed' } : prev));
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const formatDate = (date: Date | any): string => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const proArgs = args.filter((a) => a.position === 'pro');
  const conArgs = args.filter((a) => a.position === 'con');

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Link href="/debate-arena">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Debates
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Debate not found.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusInfo = statusVariants[debate.status] || statusVariants.open;
  const isCreator = user?.uid === debate.creatorId;

  // Results summary for closed debates
  const proScore = proArgs.reduce((sum, a) => sum + a.upvotes - a.downvotes, 0);
  const conScore = conArgs.reduce((sum, a) => sum + a.upvotes - a.downvotes, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-2 mb-4 flex-wrap">
        <Link href="/debate-arena">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Debates
          </Button>
        </Link>
        <PageWalkthrough
          storageKey="sfe.debateDetail.walkthrough.completed"
          steps={DEBATE_WALKTHROUGH_STEPS}
        />
      </div>

      <AdminActions
        artifactLabel="Debate"
        artifactTitle={debate.title}
        onDelete={(uid) => adminDeleteArtifact(uid, 'debate', debateId)}
        afterDeleteHref="/debate-arena"
      />

      {/* Debate Header */}
      <Card data-tour="debate-header" className="mb-8 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3" data-tour="debate-status">
                <Swords className="h-6 w-6 text-primary" />
                <Badge
                  variant="outline"
                  className={statusInfo.className}
                  title={`Debate is ${statusInfo.label.toLowerCase()}. Open debates accept new arguments; closed debates are archived.`}
                >
                  {statusInfo.label}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-primary mb-3">{debate.title}</h1>
              <p className="text-foreground/80 leading-relaxed">{debate.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <BookmarkButton
                itemId={debate.id}
                itemType="debate"
                title={debate.title}
              />
              <ShareToMessageDialog
                artifact={{
                  type: 'debate',
                  id: debate.id,
                  title: debate.title,
                }}
              />
              {isCreator && debate.status !== 'closed' && (
                <Button
                  variant="outline"
                  onClick={handleCloseDebate}
                  disabled={isClosing}
                >
                  {isClosing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Close Debate
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1.5" />
              Created by {debate.creatorName}
            </span>
            <span className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              {formatDate(debate.createdAt)}
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1.5" />
              {debate.participantCount} participant{debate.participantCount !== 1 ? 's' : ''}
            </span>
          </div>

          {debate.tags && debate.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {debate.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Closed Debate Results */}
      {debate.status === 'closed' && (
        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Trophy className="mr-2 h-5 w-5" />
              Debate Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="grid grid-cols-2 gap-6 text-center"
              data-tour="debate-scores"
              title="Scores are the sum of upvotes minus downvotes on each side's arguments"
            >
              <div>
                <p className="text-2xl font-bold text-green-400">{proScore}</p>
                <p className="text-sm text-muted-foreground">Pro Score ({proArgs.length} arguments)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{conScore}</p>
                <p className="text-sm text-muted-foreground">Con Score ({conArgs.length} arguments)</p>
              </div>
            </div>
            <p className="text-center mt-4 text-foreground/80">
              {proScore > conScore
                ? 'The Pro side carried the debate with higher-rated arguments.'
                : conScore > proScore
                  ? 'The Con side carried the debate with higher-rated arguments.'
                  : 'The debate ended in a tie.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Arguments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pro Column */}
        <div data-tour="debate-pro">
          <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            Pro Arguments ({proArgs.length})
          </h2>
          {proArgs.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center text-muted-foreground">
                No pro arguments yet. Be the first to argue in favor!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {proArgs.map((arg) => (
                <ArgumentCard key={arg.id} argument={arg} debateStatus={debate.status} />
              ))}
            </div>
          )}
        </div>

        {/* Con Column */}
        <div data-tour="debate-con">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            Con Arguments ({conArgs.length})
          </h2>
          {conArgs.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center text-muted-foreground">
                No con arguments yet. Be the first to argue against!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conArgs.map((arg) => (
                <ArgumentCard key={arg.id} argument={arg} debateStatus={debate.status} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Argument Form */}
      {debate.status !== 'closed' && (
        <div data-tour="debate-submit">
          <SubmitArgumentForm debateId={debateId} onArgumentSubmitted={fetchData} />
        </div>
      )}
    </div>
  );
}
