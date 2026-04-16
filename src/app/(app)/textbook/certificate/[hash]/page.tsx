'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CertificateTemplate } from '@/components/certificates/certificate-template';
import { MasterCertificateTemplate } from '@/components/textbook/master-certificate-template';
import { DownloadCertificateButton } from '@/components/certificates/download-certificate-button';
import { getCertificateByHash } from '@/app/actions/certificates';
import { chapters } from '@/data/textbook';
import type { Certificate } from '@/types';

export default function TextbookCertificateViewer() {
  const params = useParams();
  const hash = params?.hash as string;
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getCertificateByHash(hash);
      if (cancelled) return;
      if (!res.success || !res.data) {
        setNotFound(true);
      } else {
        setCert(res.data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hash]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl space-y-4">
        <Skeleton className="h-12 w-64" />
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
              <Link href="/textbook">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Textbook
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMaster = cert.curriculumId === 'textbook-master';

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href="/textbook"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Textbook
        </Link>
        <DownloadCertificateButton certificate={cert} />
      </div>

      {isMaster ? (
        <MasterCertificateTemplate
          certificate={cert}
          chapters={chapters.map((c) => ({ number: c.number, title: c.title }))}
        />
      ) : (
        <CertificateTemplate certificate={cert} />
      )}

      <div className="text-center text-xs text-muted-foreground pt-2">
        Verification hash:{' '}
        <code className="font-mono text-foreground/80">{cert.verificationHash}</code>
        {' · '}
        <Link href={`/verify/${cert.verificationHash}`} className="hover:underline text-primary">
          public verification page
        </Link>
      </div>
    </div>
  );
}
