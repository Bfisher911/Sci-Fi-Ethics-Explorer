'use client';

/**
 * Unified quiz route — `/quiz/[type]/[id]`.
 *
 * Replaces four nearly-identical per-domain subroutes:
 *
 *   /philosophers/[id]/quiz
 *   /glossary/[id]/quiz       (theory)
 *   /scifi-authors/[id]/quiz
 *   /scifi-media/[id]/quiz
 *
 * All of them now redirect here. The textbook chapter quiz at
 * `/textbook/chapters/[slug]/quiz` stays where it is because it
 * carries chapter-pass recording + certificate-awarding logic that
 * doesn't generalize.
 *
 * Recognized types:
 *   philosopher | theory | scifi-author | scifi-media
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Brain } from 'lucide-react';
import { getQuizForSubject } from '@/app/actions/quizzes';
import { QuizEngine } from '@/components/quiz/quiz-engine';
import type { Quiz, QuizSubjectType } from '@/types';

const VALID_TYPES = ['philosopher', 'theory', 'scifi-author', 'scifi-media'] as const;
type ValidType = (typeof VALID_TYPES)[number];

interface BackLink {
  href: string;
  label: string;
}

function backLinkFor(type: ValidType, id: string): BackLink {
  switch (type) {
    case 'philosopher':
      return { href: `/philosophers/${id}`, label: 'Back to philosopher' };
    case 'theory':
      return { href: `/glossary/${id}`, label: 'Back to framework' };
    case 'scifi-author':
      return { href: `/scifi-authors/${id}`, label: 'Back to author' };
    case 'scifi-media':
      return { href: `/scifi-media/${id}`, label: 'Back to media entry' };
  }
}

export default function UnifiedQuizPage() {
  const params = useParams();
  const rawType = params?.type as string | undefined;
  const id = params?.id as string;

  if (!rawType || !(VALID_TYPES as readonly string[]).includes(rawType)) {
    // Unknown subject type — let Next render the 404 page rather than
    // hand the user a confusing empty quiz state.
    notFound();
  }

  const type = rawType as ValidType;
  const back = backLinkFor(type, id);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await getQuizForSubject(type as QuizSubjectType, id);
      if (cancelled) return;
      if (res.success) setQuiz(res.data);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={back.href}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {back.label}
        </Link>
      </Button>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : quiz ? (
        <QuizEngine quiz={quiz} />
      ) : (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="py-12 text-center space-y-3">
            <Brain className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">
              No quiz exists for this entry yet.
            </p>
            <Button asChild variant="outline">
              <Link href={back.href}>{back.label}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
