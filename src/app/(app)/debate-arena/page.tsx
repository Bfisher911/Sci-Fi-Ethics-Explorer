'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDebates } from '@/app/actions/debates';
import { DebateTopicCard } from '@/components/debate-arena/debate-topic-card';
import { CreateDebateDialog } from '@/components/debate-arena/create-debate-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Swords, MessageCircle } from 'lucide-react';
import type { Debate } from '@/types';

export default function DebateArenaPage() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getDebates();
    if (result.success) {
      setDebates(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDebates();
  }, [fetchDebates]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-primary font-headline flex items-center">
                <Swords className="mr-3 h-10 w-10" /> Debate Arena
              </h1>
              <p className="text-lg text-muted-foreground">
                Engage in structured debates on pressing ethical dilemmas from the world of science fiction.
                Present arguments, challenge perspectives, and vote on the most compelling reasoning.
              </p>
            </div>
            <CreateDebateDialog onDebateCreated={fetchDebates} />
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between pt-4 border-t">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="bg-card/80 backdrop-blur-sm border-destructive/50">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && debates.length === 0 && (
        <Card className="bg-card/70 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Debates Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be the first to start a debate! Click the &quot;Create New Debate&quot; button above to pose an
              ethical question for the community.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && debates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debates.map((debate) => (
            <DebateTopicCard key={debate.id} debate={debate} />
          ))}
        </div>
      )}
    </div>
  );
}
