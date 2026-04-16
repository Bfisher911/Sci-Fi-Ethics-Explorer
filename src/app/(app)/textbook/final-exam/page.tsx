'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Award, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { QuizEngine } from '@/components/quiz/quiz-engine';
import { FinalExamGate } from '@/components/textbook/final-exam-gate';
import {
  getTextbookProgress,
  recordFinalExamPass,
} from '@/app/actions/textbook';
import { getCertificate } from '@/app/actions/certificates';
import { chapters } from '@/data/textbook';
import { finalExamQuiz } from '@/data/textbook/quizzes';
import type { TextbookProgress } from '@/types/textbook';
import type { Certificate, QuizAttempt } from '@/types';

export default function FinalExamPage() {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<TextbookProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [masterCert, setMasterCert] = useState<Certificate | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    (async () => {
      if (!user) {
        setProgress(null);
        setLoading(false);
        return;
      }
      const res = await getTextbookProgress(user.uid);
      if (!cancelled && res.success) {
        setProgress(res.data);
        if (res.data.masterCertificateId) {
          const certRes = await getCertificate(res.data.masterCertificateId);
          if (!cancelled && certRes.success && certRes.data) {
            setMasterCert(certRes.data);
          }
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function handleComplete(attempt: QuizAttempt) {
    if (!attempt.passed || !user) return;
    const res = await recordFinalExamPass({
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous Explorer',
    });
    if (res.success) {
      const certRes = await getCertificate(res.data.certificateId);
      if (certRes.success && certRes.data) setMasterCert(certRes.data);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h1 className="font-headline text-2xl font-semibold">
              Sign in to take the Final Exam
            </h1>
            <p className="text-muted-foreground">
              The final exam, your progress, and the Master Certificate are tied
              to your account.
            </p>
            <Button asChild>
              <Link href="/login?next=/textbook/final-exam">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressData =
    progress || {
      userId: user.uid,
      chaptersRead: [],
      chapterQuizzesPassed: [],
      chapterCertificateIds: {},
      finalExamPassed: false,
    };
  const allPassed = progressData.chapterQuizzesPassed.length >= chapters.length;

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-3xl space-y-6">
      <div>
        <Link
          href="/textbook"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Textbook
        </Link>
        <h1 className="font-headline text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" /> Cumulative Final Exam
        </h1>
        <p className="text-muted-foreground mt-1">
          {finalExamQuiz.questions.length} questions across all twelve chapters · pass
          at {finalExamQuiz.passingScorePercent}% to earn the Master Certificate.
        </p>
      </div>

      {masterCert && (
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
                Your capstone credential is now part of your Sci-Fi Ethics
                Explorer profile.
              </p>
            </div>
            <Button asChild>
              <Link href={`/textbook/certificate/${masterCert.verificationHash}`}>
                View Master Certificate
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!allPassed ? (
        <FinalExamGate chapters={chapters} progress={progressData} />
      ) : (
        <QuizEngine quiz={finalExamQuiz} onComplete={handleComplete} />
      )}
    </div>
  );
}
