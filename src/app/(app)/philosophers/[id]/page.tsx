'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getPhilosopherById } from '@/app/actions/philosophers';
import { PhilosopherDetail } from '@/components/philosophers/philosopher-detail';
import { QuizCta } from '@/components/quiz/quiz-cta';
import { InfographicCta } from '@/components/infographic/infographic-cta';
import { AdminActions } from '@/components/admin/admin-actions';
import { adminDeleteArtifact } from '@/app/actions/admin';
import type { Philosopher } from '@/types';

export default function PhilosopherDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [philosopher, setPhilosopher] = useState<Philosopher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const result = await getPhilosopherById(id);
      if (result.success) {
        setPhilosopher(result.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!philosopher) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">
            Philosopher not found.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/philosophers">Back to Philosophers</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/philosophers">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Philosophers
        </Link>
      </Button>
      <AdminActions
        artifactLabel="Philosopher"
        artifactTitle={philosopher.name}
        onDelete={(uid) => adminDeleteArtifact(uid, 'philosopher', philosopher.id)}
        afterDeleteHref="/philosophers"
      />
      <PhilosopherDetail philosopher={philosopher} />
      <div className="mt-6 space-y-3">
        <InfographicCta
          href={`/philosophers/${philosopher.id}/infographic`}
          subjectName={philosopher.name}
          kindLabel="philosopher"
        />
        <QuizCta
          subjectType="philosopher"
          subjectId={philosopher.id}
          href={`/philosophers/${philosopher.id}/quiz`}
        />
      </div>
    </div>
  );
}
