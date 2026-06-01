'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Hash,
  Target,
  Users,
  ShieldOff,
  BookOpen,
  Brain,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CertificateTemplate } from '@/components/certificates/certificate-template';
import { DownloadCertificateButton } from '@/components/certificates/download-certificate-button';
import { getCertificateByHash } from '@/app/actions/certificates';
import { format } from 'date-fns';
import type { Certificate } from '@/types';

/**
 * General certificate detail page — works for any certificate (achievement or
 * curriculum). Shows the rendered certificate, the criteria used to earn it,
 * the contributing activity summary, the date earned, and the unique ID.
 */
export default function CertificateDetailPage() {
  const params = useParams();
  const hash = (params?.hash as string) || '';
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getCertificateByHash(hash);
      if (cancelled) return;
      if (!res.success || !res.data) setNotFound(true);
      else setCert(res.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hash]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="aspect-[11/8.5] w-full" />
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h1 className="font-headline text-2xl font-semibold">
              Certificate not found
            </h1>
            <p className="text-muted-foreground">
              No certificate matched <code>{hash}</code>.
            </p>
            <Button asChild>
              <Link href="/certificates">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Certificates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const issued =
    cert.issuedAt instanceof Date ? cert.issuedAt : new Date(cert.issuedAt);
  const revoked = !!cert.revokedAt;
  const snapshot = cert.progressSnapshot;

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href="/certificates"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Certificates
        </Link>
        {!revoked && <DownloadCertificateButton certificate={cert} glow />}
      </div>

      {revoked && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-destructive">
            <ShieldOff className="h-4 w-4" />
            This certificate has been revoked
            {cert.revokeReason ? `: ${cert.revokeReason}` : '.'}
          </CardContent>
        </Card>
      )}

      <CertificateTemplate certificate={cert} />

      {/* Criteria + contributing activities + identifiers */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BadgeCheck className="h-5 w-5 text-primary" />
            About this certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {cert.description && (
            <p className="text-foreground/90">{cert.description}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {cert.criteria && (
              <div className="flex items-start gap-2">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Criteria
                  </div>
                  <div>{cert.criteria}</div>
                </div>
              </div>
            )}

            {snapshot && !cert.metadata?.quizTitle && (
              <div className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Activities counted
                  </div>
                  <div>
                    {snapshot.current} of {snapshot.target} completed
                  </div>
                </div>
              </div>
            )}

            {/* Chapter-quiz certificate specifics (from metadata). */}
            {cert.metadata?.chapterTitle && (
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Textbook chapter
                  </div>
                  <div>{cert.metadata.chapterTitle}</div>
                </div>
              </div>
            )}

            {cert.metadata?.quizTitle && (
              <div className="flex items-start gap-2">
                <Brain className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Quiz
                  </div>
                  <div>{cert.metadata.quizTitle}</div>
                </div>
              </div>
            )}

            {typeof cert.metadata?.score === 'number' && (
              <div className="flex items-start gap-2">
                <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Score earned
                  </div>
                  <div>{cert.metadata.score}%</div>
                </div>
              </div>
            )}

            {typeof cert.metadata?.passingThreshold === 'number' && (
              <div className="flex items-start gap-2">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Passing threshold
                  </div>
                  <div>{cert.metadata.passingThreshold}%</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Date earned
                </div>
                <div>{format(issued, 'PPP')}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Hash className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Certificate ID
                </div>
                <div className="font-mono text-xs break-all">{cert.id}</div>
              </div>
            </div>

            {cert.communityName && (
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Community
                  </div>
                  <div>
                    {cert.communityName}
                    {cert.instructorName ? ` · ${cert.instructorName}` : ''}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="outline" className="font-mono text-xs">
              {cert.verificationHash}
            </Badge>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href={`/verify/${cert.verificationHash}`}>
                Public verification page
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
