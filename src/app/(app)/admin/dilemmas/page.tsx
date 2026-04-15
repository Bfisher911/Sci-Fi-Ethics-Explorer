'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { SubmittedDilemma } from '@/types';
import {
  getPendingDilemmas,
  approveDilemma,
  rejectDilemma,
} from '@/app/actions/admin';
import { PendingDilemmaList } from '@/components/admin/pending-dilemma-list';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Inbox, AlertCircle } from 'lucide-react';

/**
 * Admin page for moderating submitted dilemmas.
 */
export default function AdminDilemmasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dilemmas, setDilemmas] = useState<SubmittedDilemma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDilemmas = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPendingDilemmas();
    if (result.success) {
      setDilemmas(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDilemmas();
  }, [fetchDilemmas]);

  const handleApprove = async (id: string) => {
    if (!user) return;
    const result = await approveDilemma(id, user.uid);
    if (result.success) {
      toast({
        title: 'Dilemma Approved',
        description: 'The dilemma has been approved and is now visible to the community.',
      });
      setDilemmas((prev) => prev.filter((d) => d.id !== id));
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    if (!user) return;
    const result = await rejectDilemma(id, user.uid, reason);
    if (result.success) {
      toast({
        title: 'Dilemma Rejected',
        description: reason
          ? 'The dilemma has been rejected with a reason.'
          : 'The dilemma has been rejected.',
      });
      setDilemmas((prev) => prev.filter((d) => d.id !== id));
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold text-primary font-headline">
              Dilemma Moderation
            </h1>
          </div>
          <p className="text-muted-foreground">
            Review and moderate community-submitted dilemmas.
          </p>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && dilemmas.length === 0 && (
        <div className="text-center py-12">
          <Inbox className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground">
            No Pending Dilemmas
          </h2>
          <p className="text-md text-muted-foreground/80 mt-2">
            All caught up! No dilemmas are awaiting moderation.
          </p>
        </div>
      )}

      {!loading && !error && dilemmas.length > 0 && (
        <PendingDilemmaList
          dilemmas={dilemmas}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
