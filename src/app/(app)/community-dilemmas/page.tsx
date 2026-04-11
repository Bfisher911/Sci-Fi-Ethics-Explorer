'use client';

import { useEffect, useState } from 'react';
import type { SubmittedDilemma } from '@/types';
import { CommunityDilemmaCard } from '@/components/community-dilemmas/community-dilemma-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function CommunityDilemmasPage() {
  const [dilemmas, setDilemmas] = useState<SubmittedDilemma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDilemmas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dilemmas');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dilemmas');
        }
        const data = await response.json();
        setDilemmas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDilemmas();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
         <h1 className="text-4xl font-bold mb-4 text-primary font-headline">Community Dilemmas</h1>
          <p className="text-lg text-muted-foreground">
            Explore ethical scenarios submitted by fellow explorers. Engage with diverse perspectives from the community.
          </p>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="bg-card/70 backdrop-blur-sm">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Dilemmas</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && dilemmas.length === 0 && (
        <div className="text-center py-12">
          <Inbox className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground">No Community Dilemmas Yet</h2>
          <p className="text-md text-muted-foreground/80 mt-2">
            Be the first to <a href="/submit-dilemma" className="text-primary hover:underline">submit a dilemma</a> or check back soon!
          </p>
        </div>
      )}

      {!isLoading && !error && dilemmas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dilemmas.map((dilemma) => (
            <CommunityDilemmaCard key={dilemma.id} dilemma={dilemma} />
          ))}
        </div>
      )}
    </div>
  );
}
