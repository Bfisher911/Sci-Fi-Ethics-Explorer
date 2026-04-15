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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BadgeCheck, Calendar, ShieldOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserCertificates } from '@/app/actions/certificates';
import type { Certificate } from '@/types';
import {
  DownloadCertificateButton,
  HiddenCertificate,
} from '@/components/certificates/download-certificate-button';

export function CertificatesCard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      const result = await getUserCertificates(user.uid);
      if (result.success) {
        setCertificates(result.data);
      }
      setLoading(false);
    }
    load();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-primary font-headline flex items-center gap-2">
          <BadgeCheck className="h-6 w-6" />
          Certificates
        </CardTitle>
        <CardDescription>
          Official certificates you've earned for completing curricula.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {certificates.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No certificates yet. Complete a curriculum to earn your first.
          </p>
        )}
        {certificates.map((cert) => {
          const issuedAt =
            cert.issuedAt instanceof Date
              ? cert.issuedAt
              : new Date(cert.issuedAt);
          const revoked = Boolean(cert.revokedAt);
          return (
            <div
              key={cert.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-background/50 border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/curriculum/${cert.curriculumId}`}
                    className="font-semibold text-foreground hover:text-primary truncate"
                  >
                    {cert.curriculumTitle || 'Curriculum'}
                  </Link>
                  {revoked && (
                    <Badge variant="destructive" className="text-xs">
                      <ShieldOff className="h-3 w-3 mr-1" />
                      Revoked
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {issuedAt.toLocaleDateString()}
                  </span>
                  <Link
                    href={`/verify/${cert.verificationHash}`}
                    className="font-mono hover:text-primary underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {cert.verificationHash}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!revoked && (
                  <>
                    <HiddenCertificate certificate={cert} />
                    <DownloadCertificateButton
                      certificate={cert}
                      variant="outline"
                      size="sm"
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
