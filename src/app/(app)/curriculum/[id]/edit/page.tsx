'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { CurriculumBuilder } from '@/components/curriculum/curriculum-builder';
import { getCurriculumById } from '@/app/actions/curriculum';
import type { CurriculumPath } from '@/types';

export default function EditCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [curriculum, setCurriculum] = useState<CurriculumPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurriculumById(id).then((res) => {
      if (cancelled) return;
      if (!res.success) {
        setError(res.error);
      } else {
        setCurriculum(res.data);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (authLoading || adminLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Skeleton className="h-12 w-72 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-headline font-semibold">Sign in required</h1>
            <Button asChild>
              <Link
                href={`/login?next=${encodeURIComponent(`/curriculum/${id}/edit`)}`}
              >
                Sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!curriculum || error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-muted-foreground">
              {error || 'Curriculum not found.'}
            </p>
            <Button asChild variant="outline">
              <Link href="/curriculum">Back to Learning Paths</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = curriculum.creatorId === user.uid;
  if (!isOwner && !isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-headline font-semibold">
              Not your curriculum
            </h1>
            <p className="text-muted-foreground">
              You can only edit a learning path you created. Site admins can
              edit any path.
            </p>
            <Button asChild variant="outline">
              <Link href={`/curriculum/${id}`}>Back to path</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={`/curriculum/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to path
        </Link>
      </Button>
      <CurriculumBuilder
        curriculum={curriculum}
        onSaved={() => router.push(`/curriculum/${id}`)}
      />
    </div>
  );
}
