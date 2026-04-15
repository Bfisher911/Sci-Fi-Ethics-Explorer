'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  FileCheck,
  Inbox,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import type { Community, SubmittedDilemma } from '@/types';
import {
  getPendingDilemmas,
  approveDilemma,
  rejectDilemma,
} from '@/app/actions/admin';
import { getCommunity } from '@/app/actions/communities';
import { PendingDilemmaList } from '@/components/admin/pending-dilemma-list';

export default function CommunityModerationPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [community, setCommunity] = useState<Community | null>(null);
  const [dilemmas, setDilemmas] = useState<SubmittedDilemma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInstructor =
    !!user && !!community?.instructorIds?.includes(user.uid);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const communityResult = await getCommunity(id);
      if (!communityResult.success) {
        setError(communityResult.error || 'Failed to load community');
        setLoading(false);
        return;
      }
      setCommunity(communityResult.data);

      const dilemmasResult = await getPendingDilemmas({ communityId: id });
      if (dilemmasResult.success) {
        setDilemmas(dilemmasResult.data);
      } else {
        setError(dilemmasResult.error || 'Failed to load submissions');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (dilemmaId: string) => {
    if (!user) return;
    const result = await approveDilemma(dilemmaId, user.uid);
    if (result.success) {
      toast({
        title: 'Dilemma Approved',
        description: 'The dilemma has been approved.',
      });
      setDilemmas((prev) => prev.filter((d) => d.id !== dilemmaId));
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (dilemmaId: string, reason?: string) => {
    if (!user) return;
    const result = await rejectDilemma(dilemmaId, user.uid, reason);
    if (result.success) {
      toast({
        title: 'Dilemma Rejected',
        description: reason
          ? 'The dilemma has been rejected with a reason.'
          : 'The dilemma has been rejected.',
      });
      setDilemmas((prev) => prev.filter((d) => d.id !== dilemmaId));
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">
            Community not found.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/communities">Back to Communities</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!isInstructor) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={`/communities/${community.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Link>
        </Button>
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <CardContent className="p-0 space-y-3">
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">
              Only instructors of this community can moderate submissions.
            </p>
            <Button asChild>
              <Link href={`/communities/${community.id}`}>
                Go to Community
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={`/communities/${community.id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Link>
      </Button>

      <Card className="mb-8 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl text-primary font-headline">
            <FileCheck className="h-7 w-7" />
            Moderate Submissions — {community.name}
          </CardTitle>
          <CardDescription>
            Review dilemmas submitted to this community.
          </CardDescription>
        </CardHeader>
      </Card>

      {dilemmas.length === 0 ? (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <CardContent className="p-0 space-y-3">
            <Inbox className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No submissions awaiting review.
            </h2>
            <p className="text-muted-foreground/80">
              When community members submit dilemmas, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <PendingDilemmaList
          dilemmas={dilemmas}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
