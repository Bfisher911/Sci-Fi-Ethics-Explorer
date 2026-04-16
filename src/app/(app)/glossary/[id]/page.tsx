'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Users,
  BookOpen,
  MessageSquare,
  ScrollText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  getEthicalTheoryById,
  getPhilosophersForTheory,
} from '@/app/actions/ethical-theories';
import { QuizCta } from '@/components/quiz/quiz-cta';
import { AdminActions } from '@/components/admin/admin-actions';
import { adminDeleteArtifact } from '@/app/actions/admin';
import type { EthicalTheory, Philosopher } from '@/types';

export default function TheoryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [theory, setTheory] = useState<EthicalTheory | null>(null);
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [theoryResult, philsResult] = await Promise.all([
          getEthicalTheoryById(id),
          getPhilosophersForTheory(id),
        ]);
        if (cancelled) return;
        if (theoryResult.success) setTheory(theoryResult.data);
        if (philsResult.success) setPhilosophers(philsResult.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!theory) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">Theory not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/glossary">Back to Glossary</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Split bio/description into paragraphs for readable rendering
  const paragraphs = theory.description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/glossary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Glossary
        </Link>
      </Button>
      <AdminActions
        artifactLabel="Ethical Theory"
        artifactTitle={theory.name}
        onDelete={(uid) => adminDeleteArtifact(uid, 'theory', theory.id)}
        afterDeleteHref="/glossary"
      />

      {/* Header */}
      <Card className="mb-6 overflow-hidden bg-card/80 backdrop-blur-sm">
        {theory.imageUrl && (
          <div className="relative w-full h-56">
            <Image
              src={theory.imageUrl}
              alt={theory.name}
              fill
              className="object-cover"
              data-ai-hint={theory.imageHint || 'abstract concept'}
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          </div>
        )}
        <CardHeader className={theory.imageUrl ? '-mt-16 relative z-10' : ''}>
          <CardTitle className="text-4xl font-headline text-primary">
            {theory.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {theory.proponents && theory.proponents.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1.5" />
                Proponents
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {theory.proponents.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {theory.keyConcepts && theory.keyConcepts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-1.5" />
                Key Concepts
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {theory.keyConcepts.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example scenario */}
      {theory.exampleScenario && (
        <Card className="mb-6 bg-card/80 backdrop-blur-sm border-accent/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center text-accent">
              <Sparkles className="h-4 w-4 mr-2" />
              Applied Example
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 italic">{theory.exampleScenario}</p>
          </CardContent>
        </Card>
      )}

      {/* Description / Deep dive */}
      <Card className="mb-6 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-primary" />
            Deep Dive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i} className="mb-4">
                {p}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Your Knowledge */}
      <div className="mb-6">
        <QuizCta
          subjectType="theory"
          subjectId={theory.id}
          href={`/glossary/${theory.id}/quiz`}
        />
      </div>

      {/* Philosophers Associated With This Tradition */}
      {(philosophers.length > 0 ||
        (theory.proponents && theory.proponents.length > 0)) && (
        <Card className="mb-6 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <ScrollText className="h-4 w-4 mr-2 text-primary" />
              Philosophers Associated With This Tradition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {philosophers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {philosophers.map((p) => (
                  <Link
                    key={p.id}
                    href={`/philosophers/${p.id}`}
                    className="group flex items-center justify-between p-3 rounded-md border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{p.era}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            )}

            {/* Proponents not yet in the philosopher database — show as
                unlinked Badge list with a note. Guarantees this section
                appears for every theory. */}
            {theory.proponents && theory.proponents.length > 0 && (
              (() => {
                const linkedNames = new Set(
                  philosophers.map((p) => p.name.toLowerCase())
                );
                const extras = theory.proponents.filter(
                  (name) => !linkedNames.has(name.toLowerCase())
                );
                if (extras.length === 0) return null;
                return (
                  <div
                    className={
                      philosophers.length > 0
                        ? 'border-t border-border pt-4 space-y-2'
                        : 'space-y-2'
                    }
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-headline">
                      {philosophers.length > 0
                        ? 'Additional key thinkers'
                        : 'Key thinkers'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {extras.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="text-xs border-border/60"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 italic">
                      Individual profile pages for these thinkers are coming
                      soon.
                    </p>
                  </div>
                );
              })()
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer nav */}
      <div className="flex justify-between items-center pt-4">
        <Button asChild variant="ghost">
          <Link href="/glossary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Glossary
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/framework-explorer">
            Take the Framework Quiz
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
