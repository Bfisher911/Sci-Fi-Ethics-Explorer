'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConceptInfographic } from '@/components/infographic/concept-infographic';
import { philosopherData } from '@/data/philosophers';
import type { Philosopher } from '@/types';

export default function PhilosopherInfographicPage() {
  const params = useParams();
  const id = params?.id as string;
  const [entity, setEntity] = useState<Philosopher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Philosophers are fully static; no Firestore round-trip needed.
    setEntity(philosopherData.find((p) => p.id === id) ?? null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (!entity) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-2xl text-muted-foreground">
              Philosopher not found.
            </p>
            <Button asChild variant="outline">
              <Link href="/philosophers">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Philosophers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-5xl">
      <ConceptInfographic kind="philosopher" entity={entity} />
    </div>
  );
}
