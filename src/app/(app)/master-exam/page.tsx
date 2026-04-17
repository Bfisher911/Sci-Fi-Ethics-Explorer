'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  Trophy,
  Award,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { QuizEngine } from '@/components/quiz/quiz-engine';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  getMasterExamUnlockState,
  awardMasterTechnologyEthicistCertificate,
  type MasterExamUnlockState,
} from '@/app/actions/master-exam';
import { masterExamQuiz } from '@/data/master-exam';
import type { QuizAttempt } from '@/types';

export default function MasterExamPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<MasterExamUnlockState | null>(null);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    getMasterExamUnlockState(user.uid).then((res) => {
      if (cancelled) return;
      if (res.success) setState(res.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function handleComplete(attempt: QuizAttempt) {
    if (!user) return;
    if (!attempt.passed) {
      toast({
        title: 'Nearly there',
        description: `You scored ${attempt.scorePercent}%. Passing requires ${masterExamQuiz.passingScorePercent}%. The exam has unlimited retakes.`,
      });
      return;
    }
    setAwarding(true);
    const res = await awardMasterTechnologyEthicistCertificate({
      userId: user.uid,
      userName: user.displayName || user.email || 'Master Technology Ethicist',
    });
    setAwarding(false);
    if (res.success) {
      const next = await getMasterExamUnlockState(user.uid);
      if (next.success) setState(next.data);
      toast({
        title: 'Master Certificate awarded!',
        description:
          'You are now credentialed as a Sci-Fi Ethics Explorer Master Technology Ethicist.',
      });
    } else {
      toast({
        title: 'Could not issue certificate',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-headline font-semibold">
              Sign in to take the Master Exam
            </h1>
            <Button asChild>
              <Link href="/login?next=/master-exam">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!state) return null;

  const alreadyAwarded = state.alreadyAwarded;
  const unlocked = state.unlocked;
  const totalPrereqs = state.earned.length + state.remaining.length;
  const pct = totalPrereqs
    ? Math.round((state.earned.length / totalPrereqs) * 100)
    : 0;

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-3xl space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Home
        </Link>
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center gap-2">
          <Trophy className="h-7 w-7 text-primary" /> Master Technology Ethicist Exam
        </h1>
        <p className="text-muted-foreground mt-1">
          {masterExamQuiz.questions.length} cumulative questions · pass at{' '}
          {masterExamQuiz.passingScorePercent}% · unlimited retakes · earns the{' '}
          Master Certificate.
        </p>
      </div>

      {alreadyAwarded && (
        <Card className="border-2 border-chart-2/40 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="rounded-full bg-chart-2/15 p-3">
              <Award className="h-8 w-8 text-chart-2" />
            </div>
            <div className="flex-1">
              <h2 className="font-headline text-xl font-semibold">
                Master Certificate earned
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                You're credentialed as a Sci-Fi Ethics Explorer Master Technology
                Ethicist.
              </p>
            </div>
            {state.masterCertHash && (
              <Button asChild>
                <Link href={`/textbook/certificate/${state.masterCertHash}`}>
                  View certificate
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!unlocked && !alreadyAwarded ? (
        <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/30">
          <CardHeader>
            <div className="flex justify-center mb-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Lock className="h-9 w-9 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center font-headline text-2xl md:text-3xl">
              Earn the Prerequisites First
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2 max-w-lg mx-auto">
              The Master exam is the capstone of the platform. It unlocks once
              you've earned the Textbook Master Certificate and a certificate
              for every Official Learning Path.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Prerequisites complete</span>
                <span className="font-medium">
                  {state.earned.length} / {totalPrereqs} ({pct}%)
                </span>
              </div>
              <Progress value={pct} />
            </div>

            <ul className="space-y-2">
              {[...state.earned.map((id) => ({ id, earned: true })), ...state.remaining.map((r) => ({ id: r.curriculumId, earned: false }))]
                .map(({ id, earned }) => {
                  const title =
                    state.remaining.find((r) => r.curriculumId === id)?.title ||
                    (id === 'textbook-master'
                      ? 'Textbook Master Certificate'
                      : id);
                  const path =
                    id === 'textbook-master' ? '/textbook' : `/curriculum/${id}`;
                  return (
                    <li key={id}>
                      <Link
                        href={path}
                        className="group flex items-center gap-3 rounded-md border border-border bg-background/30 p-3 hover:border-primary/50 transition-colors"
                      >
                        {earned ? (
                          <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                        <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {title}
                        </span>
                        <Badge
                          variant={earned ? 'default' : 'outline'}
                          className="text-xs shrink-0"
                        >
                          {earned ? 'Earned' : 'Go'}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <>
          {awarding && (
            <Card className="border-primary/30">
              <CardContent className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Issuing your Master Technology Ethicist Certificate…
              </CardContent>
            </Card>
          )}
          <QuizEngine quiz={masterExamQuiz} onComplete={handleComplete} />
        </>
      )}
    </div>
  );
}
