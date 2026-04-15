'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Brain,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  Award,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { submitQuizAttempt } from '@/app/actions/quizzes';
import type { Quiz, QuizAttempt } from '@/types';
import { cn } from '@/lib/utils';

interface QuizEngineProps {
  quiz: Quiz;
  onComplete?: (attempt: QuizAttempt) => void;
}

type Phase = 'taking' | 'submitting' | 'results';

/**
 * Interactive quiz runner. Presents one question at a time, then submits
 * and shows a review screen with explanations for each question.
 */
export function QuizEngine({ quiz, onComplete }: QuizEngineProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const totalQuestions = quiz.questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() =>
    new Array(totalQuestions).fill(-1)
  );
  const [phase, setPhase] = useState<Phase>('taking');
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  const currentQuestion = quiz.questions[currentIndex];
  const selectedForCurrent = answers[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progress = useMemo(() => {
    const answered = answers.filter((a) => a !== -1).length;
    return Math.round((answered / Math.max(totalQuestions, 1)) * 100);
  }, [answers, totalQuestions]);

  const handleSelect = (value: string) => {
    const idx = Number(value);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = idx;
      return next;
    });
  };

  const handleNext = () => {
    if (selectedForCurrent === -1) return;
    setCurrentIndex((i) => Math.min(i + 1, totalQuestions - 1));
  };

  const handleBack = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to submit your quiz.',
        variant: 'destructive',
      });
      return;
    }
    if (answers.some((a) => a === -1)) {
      toast({
        title: 'Unanswered questions',
        description: 'Please answer every question before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setPhase('submitting');
    const result = await submitQuizAttempt({
      quizId: quiz.id,
      userId: user.uid,
      subjectType: quiz.subjectType,
      subjectId: quiz.subjectId,
      answers,
    });

    if (!result.success) {
      setPhase('taking');
      toast({
        title: 'Submission failed',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    setAttempt(result.data);
    setPhase('results');
    onComplete?.(result.data);

    toast({
      title: result.data.passed ? 'Quiz passed!' : 'Quiz complete',
      description: `You scored ${result.data.scorePercent}%.`,
    });
  };

  const handleRetake = () => {
    setAnswers(new Array(totalQuestions).fill(-1));
    setCurrentIndex(0);
    setAttempt(null);
    setPhase('taking');
  };

  if (totalQuestions === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            This quiz doesn't have any questions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ─── Results screen ──────────────────────────────────────────────
  if (phase === 'results' && attempt) {
    const { scorePercent, passed, xpAwarded } = attempt;
    return (
      <div className="space-y-6">
        <Card
          className={cn(
            'bg-card/80 backdrop-blur-sm border-2',
            passed ? 'border-primary/40' : 'border-destructive/40'
          )}
        >
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              {passed ? (
                <Trophy className="h-16 w-16 text-primary" />
              ) : (
                <GraduationCap className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <div className="text-6xl font-bold font-headline">
                {scorePercent}%
              </div>
              <Badge
                variant={passed ? 'default' : 'secondary'}
                className="text-sm"
              >
                {passed ? 'Passed' : 'Keep studying'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {passed
                ? `You hit the passing bar of ${quiz.passingScorePercent}%. Well done.`
                : `Passing is ${quiz.passingScorePercent}%. Review the answers below and try again.`}
            </p>
            {xpAwarded && xpAwarded > 0 ? (
              <Alert className="text-left">
                <Award className="h-4 w-4" />
                <AlertTitle>+{xpAwarded} XP earned</AlertTitle>
                <AlertDescription>
                  First-time pass bonus awarded to your profile.
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="pt-2 flex justify-center gap-3">
              <Button onClick={handleRetake} variant="outline">
                Take again
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Review answers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {quiz.questions.map((q, qIdx) => {
              const userAnswer = attempt.answers[qIdx];
              const isCorrect = userAnswer === q.correctAnswerIndex;
              return (
                <div
                  key={q.id || qIdx}
                  className="rounded-md border border-border p-4 space-y-3"
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          Question {qIdx + 1}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {q.difficulty}
                        </Badge>
                      </div>
                      <p className="font-medium text-foreground">{q.prompt}</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 pl-7">
                    {q.options.map((opt, oIdx) => {
                      const isRight = oIdx === q.correctAnswerIndex;
                      const isChosen = oIdx === userAnswer;
                      return (
                        <li
                          key={oIdx}
                          className={cn(
                            'text-sm rounded px-2 py-1 border',
                            isRight &&
                              'border-primary/50 bg-primary/10 text-foreground',
                            !isRight &&
                              isChosen &&
                              'border-destructive/50 bg-destructive/10 text-foreground',
                            !isRight &&
                              !isChosen &&
                              'border-transparent text-muted-foreground'
                          )}
                        >
                          <span className="mr-2 font-mono text-xs">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          {opt}
                          {isRight && (
                            <span className="ml-2 text-xs text-primary">
                              (correct)
                            </span>
                          )}
                          {!isRight && isChosen && (
                            <span className="ml-2 text-xs text-destructive">
                              (your answer)
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {q.explanation && (
                    <p className="text-sm text-muted-foreground pl-7 italic">
                      {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Taking screen ───────────────────────────────────────────────
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Brain className="h-5 w-5" />
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {quiz.passingScorePercent}% to pass
          </Badge>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>{progress}% answered</span>
          </div>
          <Progress value={((currentIndex + 1) / totalQuestions) * 100} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase">
              {currentQuestion.difficulty}
            </Badge>
          </div>
          <p className="text-lg font-medium text-foreground leading-relaxed">
            {currentQuestion.prompt}
          </p>
        </div>

        <RadioGroup
          key={currentIndex}
          value={selectedForCurrent === -1 ? '' : String(selectedForCurrent)}
          onValueChange={handleSelect}
          className="space-y-2"
        >
          {currentQuestion.options.map((opt, idx) => {
            const id = `q${currentIndex}-opt${idx}`;
            const checked = selectedForCurrent === idx;
            return (
              <Label
                key={idx}
                htmlFor={id}
                className={cn(
                  'flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer transition-colors hover:bg-primary/5',
                  checked && 'border-primary bg-primary/10'
                )}
              >
                <RadioGroupItem
                  id={id}
                  value={String(idx)}
                  className="mt-0.5"
                />
                <span className="flex-1 text-sm font-normal">
                  <span className="mr-2 font-mono text-xs text-muted-foreground">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </span>
              </Label>
            );
          })}
        </RadioGroup>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentIndex === 0 || phase === 'submitting'}
          >
            Back
          </Button>
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedForCurrent === -1 || phase === 'submitting'}
            >
              {phase === 'submitting' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit quiz
                  <Trophy className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={selectedForCurrent === -1}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
