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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, ArrowRight, CheckCircle2, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import {
  checkAndAwardCertificates,
  type CertificateProgressRow,
} from '@/app/actions/achievement-certificates';

interface CertificateProgressProps {
  /** Compact dashboard variant: summary + a few closest, with a "View all". */
  compact?: boolean;
  className?: string;
}

function EarnedRow({ row }: { row: CertificateProgressRow }) {
  const cert = row.earnedCertificate;
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start gap-2 min-w-0">
        <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{row.title}</p>
          <p className="text-xs text-muted-foreground">
            <CheckCircle2 className="mr-1 inline h-3 w-3 text-primary" />
            Earned
            {typeof cert?.score === 'number' && ` · Score: ${cert.score}%`}
            {cert?.issuedAt && ` · ${format(new Date(cert.issuedAt), 'PP')}`}
          </p>
        </div>
      </div>
      {cert && (
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link href={`/certificates/${cert.verificationHash}`}>View</Link>
        </Button>
      )}
    </div>
  );
}

function ProgressRow({ row }: { row: CertificateProgressRow }) {
  return (
    <div className="space-y-1.5 rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{row.title}</p>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {row.target > 0 ? `${row.current}/${row.target}` : 'Locked'}
        </Badge>
      </div>
      {row.target > 1 && <Progress value={row.percent} />}
      <p className="text-xs text-muted-foreground">
        {row.target === 0
          ? 'Not available yet.'
          : `Not earned · Requirement: ${row.criteria}.`}
      </p>
    </div>
  );
}

/**
 * Certificate progress area. Lists every certificate — the larger activity
 * certificates plus one per textbook chapter quiz — with status (earned /
 * in-progress / locked), progress, remaining requirement, earned date + score,
 * and a View action for earned certificates.
 *
 * It calls `checkAndAwardCertificates` on mount, which doubles as a reliable
 * backstop: viewing this surface issues any pending certificate idempotently.
 */
export function CertificateProgress({ compact, className }: CertificateProgressProps) {
  const { user } = useAuth();
  const [rows, setRows] = useState<CertificateProgressRow[] | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    checkAndAwardCertificates(user.uid)
      .then((res) => {
        if (cancelled) return;
        setRows(res.success ? res.data.progress : []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  if (!user) return null;

  if (rows === null) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" /> Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const earnedCount = rows.filter((r) => r.earned).length;
  const inProgressCount = rows.length - earnedCount;
  const byPercent = (a: CertificateProgressRow, b: CertificateProgressRow) =>
    b.percent - a.percent;

  // ─── Compact (dashboard) ──────────────────────────────────────────
  if (compact) {
    const earned = rows.filter((r) => r.earned).slice(0, 3);
    const inProgress = rows.filter((r) => !r.earned).sort(byPercent).slice(0, 3);
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" /> Certificates
          </CardTitle>
          <CardDescription>
            {earnedCount} of {rows.length} earned
            {inProgressCount > 0 && ` · ${inProgressCount} in progress`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {earned.map((r) => (
            <EarnedRow key={r.id} row={r} />
          ))}
          {inProgress.map((r) => (
            <ProgressRow key={r.id} row={r} />
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Complete activities across the site to start earning certificates.
            </p>
          )}
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Link href="/certificates">
              View all certificates <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Full (profile / certificates hub) ────────────────────────────
  const fullEarned = rows.filter((r) => r.earned);
  const fullInProgress = rows.filter((r) => !r.earned).sort(byPercent);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-primary" /> Certificates
        </CardTitle>
        <CardDescription>
          {earnedCount} of {rows.length} earned
          {inProgressCount > 0 && ` · ${inProgressCount} in progress`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Complete major milestones across the site to earn certificates.
          </p>
        )}
        {fullEarned.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Earned ({fullEarned.length})
            </h3>
            {fullEarned.map((r) => (
              <EarnedRow key={r.id} row={r} />
            ))}
          </div>
        )}
        {fullInProgress.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              In progress ({fullInProgress.length})
            </h3>
            {fullInProgress.map((r) => (
              <ProgressRow key={r.id} row={r} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
