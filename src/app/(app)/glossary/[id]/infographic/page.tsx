'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConceptInfographic } from '@/components/infographic/concept-infographic';
import { ethicalTheories } from '@/data/ethical-theories';
import { getEthicalTheoryById } from '@/app/actions/ethical-theories';
import type { EthicalTheory } from '@/types';

export default function TheoryInfographicPage() {
  const params = useParams();
  const id = params?.id as string;
  const [entity, setEntity] = useState<EthicalTheory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Try Firestore first (admins may have edited a theory), then fall
    // back to the static data shipped with the build.
    getEthicalTheoryById(id).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setEntity(res.data);
      } else {
        setEntity(ethicalTheories.find((t) => t.id === id) ?? null);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
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
            <p className="text-2xl text-muted-foreground">Theory not found.</p>
            <Button asChild variant="outline">
              <Link href="/glossary">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Glossary
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-5xl">
      <ConceptInfographic kind="theory" entity={entity} />
    </div>
  );
}
