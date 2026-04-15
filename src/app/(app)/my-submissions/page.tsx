'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileCheck,
  FilePlus2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Inbox,
  Users,
} from 'lucide-react';
import type { SubmittedDilemma } from '@/types';
import { getSubmissionsByAuthor } from '@/app/actions/admin';

function toDateSafe(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      try {
        return value.toDate();
      } catch {
        return null;
      }
    }
    if (typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }
  }
  return null;
}

function StatusBadge({ status }: { status: SubmittedDilemma['status'] }) {
  if (status === 'pending') {
    return (
      <Badge
        variant="outline"
        className="border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
      >
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  }
  if (status === 'approved') {
    return (
      <Badge
        variant="outline"
        className="border-green-500/50 bg-green-500/10 text-green-400"
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Approved
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      <XCircle className="h-3 w-3 mr-1" />
      Rejected
    </Badge>
  );
}

export default function MySubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<SubmittedDilemma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    const result = await getSubmissionsByAuthor(user.uid);
    if (result.success) {
      setSubmissions(result.data);
    } else {
      setError(result.error || 'Failed to load submissions');
    }
    setLoading(false);
  }, [user?.uid]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    loadSubmissions();
  }, [authLoading, user?.uid, loadSubmissions]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl text-primary font-headline">
            <FileCheck className="h-7 w-7" />
            My Submissions
          </CardTitle>
          <CardDescription>
            Track the dilemmas you have submitted and see their moderation
            status.
          </CardDescription>
        </CardHeader>
      </Card>

      {!authLoading && !user && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not signed in</AlertTitle>
          <AlertDescription>
            Please sign in to view your submissions.
          </AlertDescription>
        </Alert>
      )}

      {(authLoading || loading) && user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && user && submissions.length === 0 && (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <CardContent className="p-0 space-y-4">
            <Inbox className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold text-muted-foreground">
              You haven't submitted any dilemmas yet
            </h2>
            <p className="text-muted-foreground/80">
              Share a compelling sci-fi scenario with the community!
            </p>
            <Button asChild>
              <Link href="/submit-dilemma">
                <FilePlus2 className="h-4 w-4 mr-2" />
                Submit a Dilemma
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((s) => {
            const submittedAt = toDateSafe(s.submittedAt);
            const reviewedAt = toDateSafe(s.reviewedAt);
            return (
              <Card
                key={s.id}
                className="bg-card/80 backdrop-blur-sm flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-xl text-primary line-clamp-2">
                      {s.title}
                    </CardTitle>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline">{s.theme}</Badge>
                    {s.communityName && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Users className="h-3 w-3" />
                        In: {s.communityName}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {s.description}
                  </p>

                  <div className="text-xs text-muted-foreground space-y-1">
                    {submittedAt && (
                      <p>
                        <span className="font-medium">Submitted:</span>{' '}
                        {format(submittedAt, 'PPP')} (
                        {formatDistanceToNow(submittedAt, { addSuffix: true })})
                      </p>
                    )}
                    {s.status === 'approved' && reviewedAt && (
                      <p>
                        <span className="font-medium">Approved:</span>{' '}
                        {format(reviewedAt, 'PPP')}
                      </p>
                    )}
                    {s.status === 'rejected' && reviewedAt && (
                      <p>
                        <span className="font-medium">Reviewed:</span>{' '}
                        {format(reviewedAt, 'PPP')}
                      </p>
                    )}
                  </div>

                  {s.status === 'rejected' && s.rejectionReason && (
                    <Alert className="bg-muted/50 border-red-500/30">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <AlertTitle className="text-red-400">
                        Rejection reason:
                      </AlertTitle>
                      <AlertDescription className="text-muted-foreground">
                        {s.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
