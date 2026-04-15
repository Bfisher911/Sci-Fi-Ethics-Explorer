'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Plus } from 'lucide-react';
import { getCurricula } from '@/app/actions/curriculum';
import { CurriculumCard } from '@/components/curriculum/curriculum-card';
import { CurriculumBuilder } from '@/components/curriculum/curriculum-builder';
import type { CurriculumPath } from '@/types';
import { PremiumGate } from '@/components/gating/premium-gate';

export default function CurriculumPage() {
  return (
    <PremiumGate featureName="Learning Paths">
      <CurriculumPageInner />
    </PremiumGate>
  );
}

function CurriculumPageInner() {
  const [curricula, setCurricula] = useState<CurriculumPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    async function fetchCurricula(): Promise<void> {
      const result = await getCurricula();
      if (result.success) {
        setCurricula(result.data);
      }
      setLoading(false);
    }
    fetchCurricula();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-primary font-headline">
                Guided Curricula
              </h1>
              <p className="text-lg text-muted-foreground">
                Structured learning paths to deepen your understanding of ethics
                through stories, quizzes, and debates.
              </p>
            </div>
            <Button onClick={() => setShowBuilder(!showBuilder)}>
              <Plus className="h-4 w-4 mr-2" />
              {showBuilder ? 'Browse Curricula' : 'Create Curriculum'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showBuilder ? (
        <CurriculumBuilder />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : curricula.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-2xl text-muted-foreground">
            No curricula available yet.
          </p>
          <p className="text-muted-foreground/80 mt-2">
            Be the first to create a learning path!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curricula.map((c) => (
            <CurriculumCard key={c.id} curriculum={c} />
          ))}
        </div>
      )}
    </div>
  );
}
