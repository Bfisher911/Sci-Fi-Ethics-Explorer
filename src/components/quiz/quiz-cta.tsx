'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Trophy, ArrowRight } from 'lucide-react';
import { getQuizForSubject, getUserBestAttempts } from '@/app/actions/quizzes';
import { useAuth } from '@/hooks/use-auth';
import type { Quiz, QuizAttempt, QuizSubjectType } from '@/types';
import { cn } from '@/lib/utils';

interface QuizCtaProps {
  subjectType: QuizSubjectType;
  subjectId: string;
  href: string;
}

/**
 * "Test Your Knowledge" call-to-action card shown on a philosopher or
 * theory detail page. Links to a dedicated quiz sub-route.
 *
 * - Shows a "Quiz coming soon" muted notice if no quiz exists yet.
 * - Surfaces the user's best score if they've taken it before.
 */
export function QuizCta({ subjectType, subjectId, href }: QuizCtaProps) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [best, setBest] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const quizRes = await getQuizForSubject(subjectType, subjectId);
      if (cancelled) return;
      const loadedQuiz = quizRes.success ? quizRes.data : null;
      setQuiz(loadedQuiz);

      if (loadedQuiz && user) {
        const attemptsRes = await getUserBestAttempts(user.uid);
        if (!cancelled && attemptsRes.success) {
          const match = attemptsRes.data.find(
            (a) => a.subjectId === subjectId && a.subjectType === subjectType
          );
          setBest(match || null);
        }
      } else {
        setBest(null);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [subjectType, subjectId, user]);

  if (loading) {
    return <Skeleton className="h-28 w-full" />;
  }

  if (!quiz) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 rounded-md border border-dashed border-border">
        <Brain className="h-4 w-4" />
        <span>Quiz coming soon.</span>
      </div>
    );
  }

  const bestScore = best?.scorePercent;
  const bestPassed = best?.passed;

  return (
    <Card
      className={cn(
        'bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-colors'
      )}
    >
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Brain className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground">
                Test Your Knowledge
              </h3>
              {typeof bestScore === 'number' && (
                <Badge
                  variant={bestPassed ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  Best: {bestScore}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {quiz.description ||
                `${quiz.questions.length} questions covering the key ideas of ${quiz.subjectName}.`}
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0">
          <Link href={href}>
            {best ? 'Retake the Quiz' : 'Take the Quiz'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
