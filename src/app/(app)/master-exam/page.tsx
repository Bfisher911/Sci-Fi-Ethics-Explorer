'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
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
  type MasterExamRequirement,
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
      // Show the zero-progress informational view for signed-out visitors.
      getMasterExamUnlockState('').then((res) => {
        if (cancelled) return;
        if (res.success) setState(res.data);
        setLoading(false);
      });
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

  const { alreadyAwarded, unlocked, requirements, completedCount, totalCount, overallPercent } = state;

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Dashboard
        </Link>
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center gap-2">
          <Trophy className="h-7 w-7 text-primary" /> Master Technology Ethicist Exam
        </h1>
        <p className="text-muted-foreground mt-1">
          {masterExamQuiz.questions.length} cumulative questions · pass at{' '}
          {masterExamQuiz.passingScorePercent}% · unlimited retakes · earns the{' '}
          <strong>Ethics of Technology Through Science Fiction Master&apos;s Certificate</strong>.
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
                You&apos;re credentialed as a Sci-Fi Ethics Explorer Master Technology
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
              you&apos;ve cleared the activity checklist below — textbook complete
              plus a breadth of real engagement across stories, frameworks,
              perspectives, dilemmas, and debates.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall progress bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Overall readiness</span>
                <span className="font-medium">
                  {completedCount} of {totalCount} complete · {overallPercent}%
                </span>
              </div>
              <Progress value={overallPercent} />
            </div>

            {/* Per-requirement rows */}
            <ul className="space-y-3">
              {requirements.map((req) => (
                <RequirementRow key={req.id} req={req} />
              ))}
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

/**
 * A single prerequisite row with its own progress bar, count, and
 * deep-link CTA to where the user can continue making progress.
 */
function RequirementRow({ req }: { req: MasterExamRequirement }) {
  const pct = req.target > 0 ? Math.min(Math.round((req.current / req.target) * 100), 100) : req.complete ? 100 : 0;
  return (
    <li
      className="rounded-md border border-border bg-background/30 p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start gap-3">
        {req.complete ? (
          <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">{req.title}</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {req.description}
              </p>
            </div>
            <Badge
              variant={req.complete ? 'default' : 'outline'}
              className="text-[11px] shrink-0"
            >
              {req.complete
                ? 'Complete'
                : `${req.current} / ${req.target}`}
            </Badge>
          </div>
          <div className="mt-2.5 flex items-center gap-3">
            <Progress value={pct} className="h-1.5 flex-1" />
            <span className="text-[11px] font-mono text-muted-foreground shrink-0 w-9 text-right">
              {pct}%
            </span>
          </div>
          {!req.complete && (
            <div className="mt-2">
              <Link
                href={req.href}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent"
              >
                Go there <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
