'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Brain } from 'lucide-react';
import { getQuizForSubject } from '@/app/actions/quizzes';
import { QuizEngine } from '@/components/quiz/quiz-engine';
import type { Quiz } from '@/types';

export default function SciFiMediaQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await getQuizForSubject('scifi-media', id);
      if (cancelled) return;
      if (res.success) setQuiz(res.data);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={`/scifi-media/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to media entry
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
              No quiz exists for this media entry yet. An admin can generate one
              from the quiz dashboard.
            </p>
            <Button asChild variant="outline">
              <Link href={`/scifi-media/${id}`}>Back</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
