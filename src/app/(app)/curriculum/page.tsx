'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Sparkles } from 'lucide-react';
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
        <CurriculaList curricula={curricula} />
      )}
    </div>
  );
}

/**
 * Two-tier listing: Official Learning Paths (platform-curated, big,
 * certificate-awarding) rendered first, then everything else — including
 * community-authored paths and legacy presets.
 */
function CurriculaList({ curricula }: { curricula: CurriculumPath[] }) {
  const { official, rest } = useMemo(() => {
    const official: CurriculumPath[] = [];
    const rest: CurriculumPath[] = [];
    for (const c of curricula) {
      if (c.isOfficial) official.push(c);
      else rest.push(c);
    }
    return { official, rest };
  }, [curricula]);

  return (
    <div className="space-y-10">
      {official.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-headline font-semibold text-primary">
              Official Learning Paths
            </h2>
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
              Platform-curated
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
            Structured paths built by the platform. Each one walks you through
            textbook chapters, philosopher pages, stories, analyzer exercises,
            and reflection prompts — and awards a certificate on completion.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {official.map((c) => (
              <CurriculumCard key={c.id} curriculum={c} />
            ))}
          </div>
        </section>
      )}
      {rest.length > 0 && (
        <section>
          {official.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-headline font-semibold">
                Community Learning Paths
              </h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((c) => (
              <CurriculumCard key={c.id} curriculum={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
