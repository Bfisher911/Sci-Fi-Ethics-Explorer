'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizEngine } from '@/components/quiz/quiz-engine';
import { ChapterCompletionBanner } from '@/components/textbook/chapter-completion-banner';
import { getChapterBySlug, nextChapter } from '@/data/textbook';
import { getStaticTextbookQuiz } from '@/data/textbook/quizzes';
import { useAuth } from '@/hooks/use-auth';
import { recordChapterQuizPass } from '@/app/actions/textbook';
import { getCertificate } from '@/app/actions/certificates';
import type { QuizAttempt, Certificate } from '@/types';

export default function ChapterQuizPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const chapter = getChapterBySlug(slug);
  const quiz = chapter ? getStaticTextbookQuiz(chapter.slug) : null;

  const { user } = useAuth();
  const [completionCert, setCompletionCert] = useState<Certificate | null>(null);
  const [recording, setRecording] = useState(false);

  async function handleComplete(attempt: QuizAttempt) {
    if (!attempt.passed || !user || !chapter) return;
    setRecording(true);
    const res = await recordChapterQuizPass({
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous Explorer',
      slug: chapter.slug,
      chapterNumber: chapter.number,
      chapterTitle: chapter.title,
    });
    if (res.success) {
      const certRes = await getCertificate(res.data.certificateId);
      if (certRes.success && certRes.data) setCompletionCert(certRes.data);
    }
    setRecording(false);
  }

  if (!chapter) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <h1 className="font-headline text-2xl font-semibold">Chapter not found</h1>
            <Button asChild>
              <Link href="/textbook">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Textbook
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <h1 className="font-headline text-2xl font-semibold">
              Quiz not yet available
            </h1>
            <Button asChild>
              <Link href={`/textbook/chapters/${chapter.slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Chapter
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 max-w-3xl space-y-6">
      <div>
        <Link
          href={`/textbook/chapters/${chapter.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Chapter {chapter.number}
        </Link>
        <h1 className="font-headline text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" /> Knowledge Check
        </h1>
        <p className="text-muted-foreground mt-1">
          {quiz.questions.length} questions · pass at {quiz.passingScorePercent}% to
          earn the chapter certificate.
        </p>
      </div>

      {completionCert && (
        <ChapterCompletionBanner
          chapter={chapter}
          certificateId={completionCert.id}
          certificateHash={completionCert.verificationHash}
          next={nextChapter(chapter.slug)}
        />
      )}

      {recording ? (
        <Skeleton className="h-32 w-full" />
      ) : null}

      <QuizEngine quiz={quiz} onComplete={handleComplete} />
    </div>
  );
}
