'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// The public ethical-framework profile now renders via
// <PublicEthicsProfile>, which pulls the unified profile across all of
// the user's activities (Stories, Framework Explorer, dilemmas,
// debates) rather than a single quiz result.
import {
  CalendarDays,
  Flag,
  Lock,
  MessageCircle,
  Shield,
  ShieldOff,
  UserCircle,
  Loader2,
} from 'lucide-react';

import { getUserProfile } from '@/app/actions/user';
import {
  blockUser,
  getUserBlocks,
  unblockUser,
} from '@/app/actions/user-blocks';
import { getOrCreateThread } from '@/app/actions/messages';
import { submitUserReport } from '@/app/actions/user-reports';
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
import { PublicEthicsProfile } from '@/components/profile/public-ethics-profile';
import { ProfileActivityOverview } from '@/components/profile/profile-activity-overview';

import type { UserProfile } from '@/types';

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

      // The viewer's own block list (to show Block vs. Unblock). The rich
      // activity/achievement data is self-fetched by ProfileActivityOverview.
      if (currentUser && currentUser.uid !== targetId) {
        const myBlocksResult = await getUserBlocks(currentUser.uid);
        if (myBlocksResult.success) {
          setIsBlocked(myBlocksResult.data.includes(targetId));
        }
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
    if (!currentUser?.uid) {
      toast({
        title: 'Sign in required',
        description: 'You must be signed in to report a user.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmittingReport(true);
    try {
      const res = await submitUserReport({
        reportedUserId: targetId,
        reporterId: currentUser.uid,
        reason: reportText,
      });
      if (res.success) {
        setReportDialogOpen(false);
        setReportText('');
        toast({
          title: 'Report submitted',
          description:
            'Thank you. Our moderation team will review this report.',
        });
      } else {
        toast({
          title: 'Could not submit report',
          description: res.error,
          variant: 'destructive',
        });
      }
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

  // `createdAt` is written on the user doc and returned by getUserProfile, but
  // isn't on the UserProfile type — read it defensively for "member since".
  const createdAtRaw = (profile as { createdAt?: Date | { toDate: () => Date } })
    .createdAt;
  let memberSince = '';
  if (createdAtRaw) {
    const d =
      createdAtRaw instanceof Date
        ? createdAtRaw
        : typeof (createdAtRaw as { toDate?: () => Date }).toDate === 'function'
        ? (createdAtRaw as { toDate: () => Date }).toDate()
        : null;
    if (d && !Number.isNaN(d.getTime())) {
      memberSince = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

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
              {profile.favoriteGenre && (
                <Badge variant="outline" className="text-muted-foreground">
                  {profile.favoriteGenre}
                </Badge>
              )}
            </div>
            {memberSince && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Exploring since {memberSince}
              </p>
            )}
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

      {/* Ethical framework profile — unified across all of this user's
          activities (Stories, Framework Explorer modules, dilemmas,
          debates). Aggregate distribution only; no private answers. */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Ethical Framework Profile</CardTitle>
          <CardDescription>
            How {displayName}&apos;s choices across the platform distribute
            across the ethical frameworks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PublicEthicsProfile userId={targetId} displayName={displayName} />
        </CardContent>
      </Card>

      {/* Comprehensive activity + achievements: stat tiles, learning
          progress, quiz mastery, certificates, and badges. Aggregate /
          achievement data only — self-fetched from the user's real signals. */}
      <ProfileActivityOverview userId={targetId} displayName={displayName} />

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
