'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy-load the radar chart — recharts is ~80 KB. Most visitors to a
// user profile don't have the chart open above the fold, and many
// users they're viewing haven't taken the framework quiz yet (in
// which case we render a tiny "no quiz" message and never need the
// chart at all). The skeleton placeholder uses the page's existing
// Skeleton import (further down) and a fixed height so the layout
// doesn't shift on load.
const FrameworkRadar = dynamic(
  () => import('@/components/charts/framework-radar').then((m) => m.FrameworkRadar),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full rounded-lg bg-muted/30 animate-pulse" />
    ),
  },
);
import {
  Flag,
  Lock,
  MessageCircle,
  Shield,
  ShieldOff,
  UserCircle,
  Loader2,
} from 'lucide-react';

import { getUserProfile } from '@/app/actions/user';
import { getUserProgress } from '@/app/actions/progress';
import { getUserBadges } from '@/app/actions/badges';
import {
  blockUser,
  getUserBlocks,
  unblockUser,
} from '@/app/actions/user-blocks';
import { getOrCreateThread } from '@/app/actions/messages';
import { ethicalTheories } from '@/data/ethical-theories';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EarnedBadges } from '@/components/profile/earned-badges';

import type { QuizResult, UserProfile } from '@/types';

interface ChartPoint {
  name: string;
  score: number;
}

function buildChartData(result: QuizResult | undefined): ChartPoint[] {
  if (!result) return [];
  return ethicalTheories.map((theory) => ({
    name: theory.name,
    score: result.scores[theory.id] ?? 0,
  }));
}

function quizResultDate(result: QuizResult | undefined): Date | null {
  if (!result) return null;
  const completedAt = result.completedAt as unknown;
  if (completedAt instanceof Date) return completedAt;
  if (
    completedAt &&
    typeof completedAt === 'object' &&
    'toDate' in completedAt &&
    typeof (completedAt as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (completedAt as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  if (typeof completedAt === 'string' || typeof completedAt === 'number') {
    const d = new Date(completedAt as string | number);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function ProfilePrivateCard(): React.ReactElement {
  return (
    <Card className="max-w-xl mx-auto mt-10 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Lock className="h-5 w-5" /> Profile Private
        </CardTitle>
        <CardDescription>
          This explorer has chosen to keep their profile private, or the
          profile does not exist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href="/directory">Back to People</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PublicUserProfilePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const targetId = useMemo(() => {
    const raw = params?.id;
    if (!raw) return '';
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [badgeIds, setBadgeIds] = useState<string[]>([]);

  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const isSelf = !!currentUser && currentUser.uid === targetId;

  const loadAll = useCallback(async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profileResult = await getUserProfile(targetId);
      if (!profileResult.success || !profileResult.data) {
        setProfile(null);
        setIsPrivate(true);
        setLoading(false);
        return;
      }
      const fetchedProfile = profileResult.data;

      if (fetchedProfile.isPublicProfile === false) {
        setProfile(null);
        setIsPrivate(true);
        setLoading(false);
        return;
      }

      // If the target user has blocked the current viewer, treat as private.
      if (currentUser && currentUser.uid !== targetId) {
        try {
          const theirBlocks = await getUserBlocks(targetId);
          if (
            theirBlocks.success &&
            theirBlocks.data.includes(currentUser.uid)
          ) {
            setProfile(null);
            setIsPrivate(true);
            setLoading(false);
            return;
          }
        } catch {
          // non-fatal
        }
      }

      setProfile(fetchedProfile);
      setIsPrivate(false);

      // Kick off ancillary loads in parallel. Failures are non-fatal.
      const [progressResult, badgesResult, myBlocksResult] = await Promise.all([
        getUserProgress(targetId),
        getUserBadges(targetId),
        currentUser && currentUser.uid !== targetId
          ? getUserBlocks(currentUser.uid)
          : Promise.resolve({ success: true as const, data: [] as string[] }),
      ]);

      if (progressResult.success) {
        // Sort quiz results by completion date desc.
        const sorted = [...progressResult.data.quizResults].sort((a, b) => {
          const ad = quizResultDate(a)?.getTime() ?? 0;
          const bd = quizResultDate(b)?.getTime() ?? 0;
          return bd - ad;
        });
        setQuizResults(sorted);
      } else {
        setQuizResults([]);
      }

      if (badgesResult.success) {
        setBadgeIds(badgesResult.data);
      } else {
        setBadgeIds([]);
      }

      if (myBlocksResult.success) {
        setIsBlocked(myBlocksResult.data.includes(targetId));
      }
    } catch (err) {
      console.error('[users/[id]] load error:', err);
      setProfile(null);
      setIsPrivate(true);
    } finally {
      setLoading(false);
    }
  }, [targetId, currentUser]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const [startingMessage, setStartingMessage] = useState(false);
  const handleSendMessage = useCallback(async () => {
    if (!currentUser) {
      toast({
        title: 'Sign in required',
        description: 'You need to be signed in to send a message.',
        variant: 'destructive',
      });
      return;
    }
    if (!targetId || isSelf || !profile) return;
    setStartingMessage(true);
    try {
      const result = await getOrCreateThread(
        currentUser.uid,
        currentUser.displayName ||
          currentUser.email?.split('@')[0] ||
          'Anonymous',
        currentUser.photoURL || undefined,
        targetId,
        profile.displayName || 'Explorer',
        profile.avatarUrl || undefined
      );
      if (result.success) {
        router.push(`/messages?thread=${result.data.id}`);
      } else {
        toast({
          title: 'Could not start conversation',
          description: result.error,
          variant: 'destructive',
        });
      }
    } finally {
      setStartingMessage(false);
    }
  }, [currentUser, router, targetId, isSelf, profile, toast]);

  const handleConfirmBlock = useCallback(async () => {
    if (!currentUser || !targetId) return;
    setIsBlocking(true);
    // Optimistic update.
    const previous = isBlocked;
    setIsBlocked(true);
    setBlockDialogOpen(false);
    try {
      const result = await blockUser(currentUser.uid, targetId);
      if (!result.success) {
        setIsBlocked(previous);
        toast({
          title: 'Could not block user',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'User blocked',
        description: 'You will no longer see messages from this user.',
      });
    } catch (err) {
      setIsBlocked(previous);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Could not block user',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsBlocking(false);
    }
  }, [currentUser, targetId, isBlocked, toast]);

  const handleConfirmUnblock = useCallback(async () => {
    if (!currentUser || !targetId) return;
    setIsBlocking(true);
    const previous = isBlocked;
    setIsBlocked(false);
    setUnblockDialogOpen(false);
    try {
      const result = await unblockUser(currentUser.uid, targetId);
      if (!result.success) {
        setIsBlocked(previous);
        toast({
          title: 'Could not unblock user',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'User unblocked',
      });
    } catch (err) {
      setIsBlocked(previous);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Could not unblock user',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsBlocking(false);
    }
  }, [currentUser, targetId, isBlocked, toast]);

  const handleSubmitReport = useCallback(async () => {
    setIsSubmittingReport(true);
    // Placeholder — full reporting pipeline is not yet implemented. We show a
    // success toast so the user knows their intent was recorded locally.
    try {
      // eslint-disable-next-line no-console
      console.log('[user-profile] report submitted (stub):', {
        reportedId: targetId,
        reporterId: currentUser?.uid,
        note: reportText,
      });
      setReportDialogOpen(false);
      setReportText('');
      toast({
        title: 'Report submitted',
        description:
          'Report submitted to admin team — full reporting coming soon.',
      });
    } finally {
      setIsSubmittingReport(false);
    }
  }, [reportText, targetId, currentUser, toast]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPrivate || !profile) {
    return <ProfilePrivateCard />;
  }

  const displayName = profile.displayName || 'Anonymous Explorer';
  const initial = displayName.charAt(0).toUpperCase();
  const latestQuiz = quizResults[0];
  const chartData = buildChartData(latestQuiz);
  const hasQuiz = !!latestQuiz && chartData.some((d) => d.score > 0);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Hero card */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="h-24 w-24 border border-border">
            <AvatarImage
              src={profile.avatarUrl || undefined}
              alt={displayName}
            />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl">
              {profile.avatarUrl ? (
                initial
              ) : (
                <UserCircle className="h-12 w-12" aria-hidden />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-primary font-headline truncate">
                {displayName}
              </h1>
              {profile.role && (
                <Badge variant="secondary">{profile.role}</Badge>
              )}
              {profile.dominantFramework && (
                <Badge variant="outline">{profile.dominantFramework}</Badge>
              )}
            </div>
            {profile.bio ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                This explorer hasn&apos;t written a bio yet.
              </p>
            )}

            {!isSelf && currentUser && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={startingMessage}
                >
                  {startingMessage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="mr-2 h-4 w-4" />
                  )}
                  Send Message
                </Button>
                {isBlocked ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUnblockDialogOpen(true)}
                    disabled={isBlocking}
                  >
                    {isBlocking ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldOff className="mr-2 h-4 w-4" />
                    )}
                    Unblock
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBlockDialogOpen(true)}
                    disabled={isBlocking}
                  >
                    <Shield className="mr-2 h-4 w-4" /> Block User
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReportDialogOpen(true)}
                >
                  <Flag className="mr-2 h-4 w-4" /> Report User
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Framework chart */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Ethical Framework Profile</CardTitle>
          <CardDescription>
            {hasQuiz
              ? 'Based on their most recent Framework Explorer quiz.'
              : 'No framework quiz completed yet.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasQuiz ? (
            <FrameworkRadar data={chartData} />
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">
              This explorer hasn&apos;t taken the Framework Explorer quiz yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats + Badges */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Activity Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {profile.storiesCompleted ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Stories completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {profile.dilemmasAnalyzed ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Dilemmas analyzed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {profile.communitySubmissions ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Community submissions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Earned Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <EarnedBadges earnedBadgeIds={badgeIds} />
          </CardContent>
        </Card>
      </div>

      {/* Block confirmation */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              You won&apos;t receive messages from this user, and they
              won&apos;t be able to start new conversations with you. You can
              unblock them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlock}
              disabled={isBlocking}
            >
              {isBlocking && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unblock confirmation */}
      <AlertDialog open={unblockDialogOpen} onOpenChange={setUnblockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will be able to message you again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnblock}
              disabled={isBlocking}
            >
              {isBlocking && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {displayName}</DialogTitle>
            <DialogDescription>
              Tell us what&apos;s going on. Admin review for user reports is
              still being built — your note helps us understand the issue.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe the issue..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={5}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setReportDialogOpen(false)}
              disabled={isSubmittingReport}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={isSubmittingReport || reportText.trim().length === 0}
            >
              {isSubmittingReport && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
