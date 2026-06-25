'use client';

/**
 * Module quiz runner — walks a user through one Framework Explorer
 * module's questions, one at a time. Answers persist immediately via
 * recordFrameworkResponse (doc id is per question, so revisiting a
 * module resumes where the user left off and re-answers overwrite).
 *
 * On finishing a module it refreshes the user's cached dominantFramework
 * from ALL their Framework Explorer responses, so the People Directory
 * field the old quiz used to set keeps working.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, CheckCircle2, Lightbulb, Loader2, Trophy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PageSkeleton } from '@/components/loading/page-skeleton';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { getModuleByNumber, TOTAL_MODULES } from '@/data/framework-explorer';
import {
  recordFrameworkResponse,
  getModuleResponses,
  getAllFrameworkResponses,
} from '@/app/actions/framework-explorer';
import { updateUserProfile } from '@/app/actions/user';
import {
  normalizeFrameworkId,
  getFrameworkMeta,
  type FrameworkId,
} from '@/lib/ethics/frameworks';
import { ActivityEvidence } from '@/components/activity-reports/activity-evidence';
import { useCertificateCheck } from '@/components/certificates/use-certificate-check';
import type { FrameworkResponse } from '@/types/framework-explorer';

interface ModuleQuizRunnerProps {
  moduleNumber: number;
  /** Called when the user leaves the module (back to the list). */
  onExit: () => void;
}

/** Sum framework weights across responses and return the top label, if any. */
function dominantFrameworkLabel(responses: FrameworkResponse[]): string | null {
  const totals: Partial<Record<FrameworkId, number>> = {};
  for (const r of responses) {
    for (const [rawKey, weight] of Object.entries(r.frameworkWeights || {})) {
      const id = normalizeFrameworkId(rawKey);
      if (!id || typeof weight !== 'number') continue;
      totals[id] = (totals[id] ?? 0) + weight;
    }
  }
  let bestId: FrameworkId | null = null;
  let bestScore = -Infinity;
  for (const [id, score] of Object.entries(totals) as [FrameworkId, number][]) {
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }
  return bestId ? getFrameworkMeta(bestId).label : null;
}

export function ModuleQuizRunner({
  moduleNumber,
  onExit,
}: ModuleQuizRunnerProps): JSX.Element {
  const { user } = useAuth();
  const checkCertificates = useCertificateCheck();
  const mod = useMemo(() => getModuleByNumber(moduleNumber), [moduleNumber]);

  const [index, setIndex] = useState(0);
  /** questionId -> chosen optionId */
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingPrior, setLoadingPrior] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Leading framework after this module, surfaced in the submit summary. */
  const [dominantFramework, setDominantFramework] = useState<string | null>(null);

  // Preload any answers the user already gave for this module so a
  // resumed or reviewed module starts in the right place.
  useEffect(() => {
    let cancelled = false;
    if (!user?.uid) {
      setLoadingPrior(false);
      return;
    }
    setLoadingPrior(true);
    getModuleResponses(user.uid, moduleNumber)
      .then((res) => {
        if (cancelled || !res.success) return;
        setAnswers(res.data);
        if (mod) {
          const firstUnanswered = mod.questions.findIndex(
            (q) => !res.data[q.id],
          );
          setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPrior(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid, moduleNumber, mod]);

  if (!mod) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Module not found</CardTitle>
          <CardDescription>
            We couldn&apos;t load module {moduleNumber}.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={onExit}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to modules
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const total = mod.questions.length;
  const question = mod.questions[index];
  const selectedOptionId = answers[question.id];
  const answeredCount = mod.questions.filter((q) => answers[q.id]).length;
  const isLast = index === total - 1;
  const nextModuleUnlocks = moduleNumber < TOTAL_MODULES;

  const handleSelect = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    if (error) setError(null);
  };

  /** Returns true if the answer was saved (or there's no user to save for). */
  const persistCurrent = async (): Promise<boolean> => {
    if (!user?.uid) return true; // preview mode: nothing to persist
    const optionId = answers[question.id];
    const option = question.answerOptions.find((o) => o.id === optionId);
    if (!option) return false;
    const res = await recordFrameworkResponse({
      userId: user.uid,
      questionId: question.id,
      moduleId: mod.id,
      moduleNumber: mod.moduleNumber,
      optionId: option.id,
      frameworkWeights: option.frameworkWeights,
      technologyTopic: question.technologyTopic,
    });
    if (!res.success) {
      console.error('[framework-explorer] failed to record answer:', res.error);
    }
    return res.success;
  };

  const refreshDominantFramework = async (): Promise<void> => {
    if (!user?.uid) return;
    const all = await getAllFrameworkResponses(user.uid);
    if (!all.success) return;
    const label = dominantFrameworkLabel(all.data);
    if (label) {
      setDominantFramework(label);
      await updateUserProfile(user.uid, { dominantFramework: label });
    }
  };

  const handleNext = async () => {
    if (!selectedOptionId) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await persistCurrent();
      if (!saved) {
        setError(
          'We couldn’t save your answer. Check your connection and try again.',
        );
        return;
      }
      if (isLast) {
        await refreshDominantFramework();
        setCompleted(true);
        // Completing this module may complete the whole Explorer — check the
        // Framework Explorer certificate.
        if (user?.uid) {
          void checkCertificates(user.uid, { categories: ['framework'] });
        }
      } else {
        setIndex((i) => i + 1);
      }
    } catch (err) {
      console.error('[framework-explorer] failed to record answer:', err);
      setError('Something went wrong saving your answer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  if (loadingPrior) {
    return <PageSkeleton blocks={1} />;
  }

  if (completed) {
    return (
      <div className="space-y-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-emerald-400">
              <CheckCircle2 className="h-6 w-6" /> Module {moduleNumber} complete
            </CardTitle>
            <CardDescription className="pt-1">
              {mod.title} — all {total} questions answered. Your responses now
              feed your unified ethics profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {nextModuleUnlocks ? (
              <p className="inline-flex items-center gap-1.5">
                <ArrowRight className="h-4 w-4 text-primary" /> Module{' '}
                {moduleNumber + 1} is now unlocked.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-foreground">
                  You&apos;ve completed all {TOTAL_MODULES} Framework Explorer
                  modules — you&apos;ve earned the Master Certificate.
                </p>
                <Button asChild size="sm" className="cta-glow">
                  <Link href="/certificates">
                    <Trophy className="mr-2 h-4 w-4" /> Framework Explorer Master
                    Certificate
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-2">
            <Button variant="outline" onClick={onExit}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to modules
            </Button>
            <Button asChild>
              <Link href="/me">View your ethics profile</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Activity evidence for completing this module — leading framework
            + selected answers. */}
        <ActivityEvidence
          activityType="framework_explorer"
          activityId={`module-${moduleNumber}`}
          activityTitle={`Framework Explorer — ${mod.title}`}
          content={{
            moduleNumber,
            moduleTitle: mod.title,
            completionPercent: '100%',
            totalQuestions: total,
            frameworkAlignment: dominantFramework ?? undefined,
            selectedAnswers: Object.entries(answers).map(
              ([questionId, optionId]) => `${questionId}: ${optionId}`,
            ),
          }}
        />
      </div>
    );
  }

  const progressValue = Math.round(((index + 1) / total) * 100);

  return (
    <Card className="bg-card/70 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <div className="mb-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={onExit}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to modules
          </Button>
        </div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider text-primary">
            Module {moduleNumber}: {mod.title}
          </span>
          <span>{answeredCount}/{total} answered</span>
        </div>
        <Progress value={progressValue} className="mb-2 h-2 w-full" />
        <CardTitle className="flex items-center text-xl text-primary md:text-2xl">
          <Lightbulb className="mr-2 h-6 w-6" /> Question {index + 1} of {total}
        </CardTitle>
        <CardDescription className="pt-2 text-lg text-foreground/90">
          {question.questionText}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOptionId ?? ''}
          onValueChange={handleSelect}
          className="space-y-3"
        >
          {question.answerOptions.map((option) => (
            <Label
              key={option.id}
              htmlFor={`${question.id}-${option.id}`}
              className={`flex items-center rounded-md border border-border p-4 transition-colors hover:bg-primary/10 ${
                selectedOptionId === option.id
                  ? 'border-primary bg-primary/20 ring-2 ring-primary'
                  : 'bg-background/30'
              }`}
            >
              <RadioGroupItem
                value={option.id}
                id={`${question.id}-${option.id}`}
                className="mr-3"
              />
              <span className="text-base text-foreground">{option.text}</span>
            </Label>
          ))}
        </RadioGroup>
        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        {index > 0 ? (
          <Button variant="ghost" onClick={handleBack} disabled={saving}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={handleNext} disabled={!selectedOptionId || saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {saving ? 'Saving…' : isLast ? 'Finish module' : 'Next question'}
          {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
