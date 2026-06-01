'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ShieldOff,
  Trophy,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DownloadReportButton } from '@/components/activity-reports/download-report-button';
import { getActivityReportByHash } from '@/app/actions/activity-reports';
import { activityTypeLabel } from '@/lib/activity-reports/summary';
import { format } from 'date-fns';
import type { ActivityReport } from '@/types';

export default function ReportVerifyPage() {
  const params = useParams();
  const hash = (params?.hash as string) || '';
  const [report, setReport] = useState<ActivityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getActivityReportByHash(hash);
      if (cancelled) return;
      if (!res.success || !res.data) setNotFound(true);
      else setReport(res.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hash]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-2xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h1 className="font-headline text-2xl font-semibold">
              Report not found
            </h1>
            <p className="text-muted-foreground">
              No activity report matched <code>{hash}</code>.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" /> Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const voided = !!report.voidedAt;
  const completed =
    report.completedAt instanceof Date
      ? report.completedAt
      : new Date(report.completedAt);

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl space-y-4">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            {voided ? (
              <ShieldOff className="h-6 w-6 text-destructive" />
            ) : (
              <BadgeCheck className="h-6 w-6 text-primary" />
            )}
            <CardTitle className="text-xl">
              {voided ? 'Voided activity report' : 'Verified activity report'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {activityTypeLabel(String(report.activityType))}
            </Badge>
            <h2 className="text-lg font-semibold">{report.activityTitle}</h2>
            <p className="text-sm text-muted-foreground">
              Completed by {report.userName}
            </p>
          </div>

          {voided && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              This report was voided{report.voidReason ? `: ${report.voidReason}` : '.'}
            </div>
          )}

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {format(completed, 'PPp')}
            </div>
            {typeof report.score === 'number' && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                {report.score}%
                {typeof report.passingThreshold === 'number' &&
                  ` (passing ${report.passingThreshold}%)`}
                {report.passed === true
                  ? ' — passed'
                  : report.passed === false
                  ? ' — not passed'
                  : ''}
              </div>
            )}
            {report.communityName && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {report.communityName}
                {report.instructorName ? ` · ${report.instructorName}` : ''}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Summary
            </div>
            <p className="text-sm leading-relaxed">{report.summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!voided && <DownloadReportButton report={report} />}
            <Badge variant="outline" className="font-mono text-xs">
              {report.verificationHash}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
