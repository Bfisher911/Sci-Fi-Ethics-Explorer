'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BadgeCheck, ShieldOff, AlertCircle } from 'lucide-react';
import { getCertificateByHash } from '@/app/actions/certificates';
import type { Certificate } from '@/types';

export default function VerifyCertificatePage() {
  const params = useParams();
  const hash = (params?.hash as string) || '';
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!hash) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const res = await getCertificateByHash(hash);
      if (res.success && res.data) {
        setCertificate(res.data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [hash]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {loading ? (
              <Skeleton className="h-12 w-12 rounded-full" />
            ) : notFound ? (
              <AlertCircle className="h-12 w-12 text-destructive" />
            ) : certificate?.revokedAt ? (
              <ShieldOff className="h-12 w-12 text-destructive" />
            ) : (
              <BadgeCheck className="h-12 w-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-headline text-primary">
            Certificate Verification
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            {hash || '—'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {!loading && notFound && (
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                No certificate found
              </p>
              <p className="text-sm text-muted-foreground">
                No certificate found for this verification code. Double-check
                the code and try again.
              </p>
            </div>
          )}

          {!loading && certificate && certificate.revokedAt && (
            <div className="text-center space-y-3">
              <Badge variant="destructive" className="text-sm">
                <ShieldOff className="h-3 w-3 mr-1" />
                Revoked
              </Badge>
              <p className="text-lg font-semibold">
                This certificate has been revoked.
              </p>
              <p className="text-sm text-muted-foreground">
                Originally issued to{' '}
                <span className="font-medium">{certificate.userName}</span> on{' '}
                {formatDate(certificate.issuedAt)} for completing{' '}
                <span className="font-medium">{certificate.curriculumTitle}</span>.
              </p>
              {certificate.revokeReason && (
                <p className="text-xs text-muted-foreground italic">
                  Reason: {certificate.revokeReason}
                </p>
              )}
            </div>
          )}

          {!loading && certificate && !certificate.revokedAt && (
            <div className="text-center space-y-3">
              <Badge
                variant="default"
                className="text-sm bg-primary text-primary-foreground"
              >
                <BadgeCheck className="h-3 w-3 mr-1" />
                Valid
              </Badge>
              <p className="text-lg font-semibold">
                This certificate is valid.
              </p>
              <p className="text-sm text-muted-foreground">
                Issued to{' '}
                <span className="font-medium text-foreground">
                  {certificate.userName}
                </span>{' '}
                on{' '}
                <span className="font-medium text-foreground">
                  {formatDate(certificate.issuedAt)}
                </span>{' '}
                for completing{' '}
                <span className="font-medium text-foreground">
                  {certificate.curriculumTitle}
                </span>
                .
              </p>
            </div>
          )}

          <div className="pt-4 text-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(d: Date | unknown): string {
  const date = d instanceof Date ? d : new Date(d as string);
  if (isNaN(date.getTime())) return 'unknown date';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
