'use client';

/**
 * Ethical Dilemmas library — a browsable catalog of every published dilemma.
 * Each card opens the existing respond → reflect → downloadable-evidence flow
 * at /weekly-clause/[slug]. Fills the gap that the weekly-clause page only
 * shows the current week's dilemma.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Scale, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty/empty-state';
import { getPublishedDilemmas } from '@/app/actions/weekly-dilemmas';
import { FRAMEWORK_META, normalizeFrameworkId } from '@/lib/ethics/frameworks';
import type { WeeklyDilemma } from '@/types';

export default function DilemmasLibraryPage(): JSX.Element {
  const [dilemmas, setDilemmas] = useState<WeeklyDilemma[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPublishedDilemmas().then((res) => {
      if (!cancelled) setDilemmas(res.success ? res.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-headline text-3xl font-bold">
          <Scale className="h-7 w-7 text-primary" /> Ethical Dilemmas
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Short, open-ended cases in technology ethics. Pick one, choose a
          response, reason it through, and get an AI reflection on the
          frameworks your thinking leans on — then save the evidence to your
          journey. There is no obviously right answer; every option is
          defensible.
        </p>
      </div>

      {dilemmas === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : dilemmas.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No dilemmas yet"
          blurb="Published dilemmas will appear here. Check back soon."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dilemmas.map((d) => (
            <Card
              key={d.id}
              className="flex flex-col bg-card/70 transition-colors hover:border-primary/40"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight">{d.title}</CardTitle>
                <CardDescription>{d.shortSetup}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="flex items-start gap-1.5 text-sm text-foreground/90">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {d.mainEthicalQuestion}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(d.relatedFrameworks ?? []).slice(0, 3).map((raw) => {
                    const id = normalizeFrameworkId(raw);
                    return (
                      <Badge key={raw} variant="outline" className="text-[10px]">
                        {id ? FRAMEWORK_META[id].label : raw}
                      </Badge>
                    );
                  })}
                  {(d.relatedTechnologies ?? []).slice(0, 2).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/weekly-clause/${d.slug}`}>
                    Respond <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
