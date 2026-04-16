'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, CheckCircle2, Lock, ArrowRight, Download } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserCertificates } from '@/app/actions/certificates';
import { getCurricula } from '@/app/actions/curriculum';
import type { Certificate, CurriculumPath } from '@/types';

function formatDate(d: any): string {
  if (!d) return '';
  const date = d instanceof Date ? d : d.seconds ? new Date(d.seconds * 1000) : new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [paths, setPaths] = useState<CurriculumPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [certRes, pathsRes] = await Promise.all([
        user ? getUserCertificates(user.uid) : Promise.resolve({ success: true as const, data: [] }),
        getCurricula(),
      ]);
      if (certRes.success) setCerts(certRes.data);
      if (pathsRes.success) setPaths(pathsRes.data);
      setLoading(false);
    }
    load();
  }, [user]);

  const earnedIds = new Set(certs.map((c) => c.curriculumId));

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline flex items-center gap-3">
            <Award className="h-9 w-9" />
            Certificates & Milestones
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete a guided learning path to earn a verifiable certificate.
            Each path covers a different area of technology ethics — finish the
            required items and your certificate is issued automatically.
          </p>
        </CardContent>
      </Card>

      {/* Earned certificates */}
      {certs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            Your Certificates ({certs.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certs.map((cert) => (
              <Card key={cert.id} className="bg-card/80 backdrop-blur-sm border-green-500/30">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{cert.curriculumTitle}</h3>
                      <p className="text-xs text-muted-foreground">
                        Issued {formatDate(cert.issuedAt)}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/40">
                      Earned
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/verify/${cert.verificationHash}`}>
                        Verify
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/curriculum/${cert.curriculumId}`}>
                        View Path
                      </Link>
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 font-mono">
                    ID: {cert.verificationHash}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available paths */}
      <h2 className="text-2xl font-semibold text-primary mb-4">
        Available Learning Paths
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paths.map((path) => {
          const earned = earnedIds.has(path.id);
          const totalRequired = path.modules
            .flatMap((m) => m.items)
            .filter((i) => i.isRequired).length;
          return (
            <Card
              key={path.id}
              className={`bg-card/80 backdrop-blur-sm transition-colors ${
                earned
                  ? 'border-green-500/30'
                  : 'hover:border-primary/40'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {earned ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {path.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{path.modules.length} modules</span>
                  <span>·</span>
                  <span>{totalRequired} required items</span>
                  <span>·</span>
                  <span className="text-accent font-medium">
                    {earned ? 'Certificate earned ✓' : 'Certificate on completion'}
                  </span>
                </div>
                <Button asChild variant={earned ? 'outline' : 'default'} size="sm" className="w-full">
                  <Link href={`/curriculum/${path.id}`}>
                    {earned ? 'Review Path' : 'Start Learning'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
