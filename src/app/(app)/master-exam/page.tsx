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
      userName: user.displayName || user.email || 'Master Ethicist',
    });
    setAwarding(false);
    if (res.success) {
      const next = await getMasterExamUnlockState(user.uid);
      if (next.success) setState(next.data);
      toast({
        title: 'Master Certificate awarded!',
        description:
          'You hold the Master Certificate in the Ethics of Technology Through Science Fiction.',
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
          <Trophy className="h-7 w-7 text-primary" /> Master Exam
        </h1>
        <p className="text-muted-foreground mt-1">
          {masterExamQuiz.questions.length} cumulative questions · pass at{' '}
          {masterExamQuiz.passingScorePercent}% · unlimited retakes · earns the{' '}
          <strong>Master Certificate</strong> in <em>The Ethics of Technology Through Science Fiction</em>.
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
        <PrerequisiteCard
          requirements={requirements}
          completedCount={completedCount}
          totalCount={totalCount}
          overallPercent={overallPercent}
        />
      ) : (
        <>
          {awarding && (
            <Card className="border-primary/30">
              <CardContent className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Issuing your Master Certificate…
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
    <li>
      {/* Whole-row tap target on mobile: incomplete reqs become a
          full-bleed Link, complete reqs stay non-interactive (nothing
          to do). The previous design only made the "Go there" anchor
          tappable, which on touch devices was a small hit zone. */}
      {req.complete ? (
        <div className="block rounded-md border border-border bg-background/30 p-4">
          <RequirementRowBody req={req} pct={pct} />
        </div>
      ) : (
        <Link
          href={req.href}
          className="block rounded-md border border-border bg-background/30 p-4 transition-colors hover:border-primary/40 active:bg-primary/5"
        >
          <RequirementRowBody req={req} pct={pct} showCta />
        </Link>
      )}
    </li>
  );
}

function RequirementRowBody({
  req,
  pct,
  showCta = false,
}: {
  req: MasterExamRequirement;
  pct: number;
  showCta?: boolean;
}): JSX.Element {
  return (
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
            <p className="text-xs text-muted-foreground mt-0.5">{req.description}</p>
          </div>
          <Badge
            variant={req.complete ? 'default' : 'outline'}
            className="text-[11px] shrink-0"
          >
            {req.complete ? 'Complete' : `${req.current} / ${req.target}`}
          </Badge>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-[11px] font-mono text-muted-foreground shrink-0 w-9 text-right">
            {pct}%
          </span>
        </div>
        {showCta && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
            Go there <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   PrerequisiteCard

   Wraps the 7 prerequisites in 3 collapsible THEMES, plus a
   zero-progress banner for brand-new users so they see one CTA
   ("Start the textbook →") instead of seven unmet rows.
   ────────────────────────────────────────────────────────────────── */

interface PrerequisiteCardProps {
  requirements: MasterExamRequirement[];
  completedCount: number;
  totalCount: number;
  overallPercent: number;
}

interface ThemeDef {
  id: 'read-reflect' | 'apply' | 'contribute';
  title: string;
  blurb: string;
  reqIds: MasterExamRequirement['id'][];
}

const THEMES: ThemeDef[] = [
  {
    id: 'read-reflect',
    title: 'Read & Reflect',
    blurb:
      'Cover the platform’s long-form material and process it back as your own thinking.',
    reqIds: ['textbook', 'stories'],
  },
  {
    id: 'apply',
    title: 'Apply',
    blurb:
      'Use the platform tools to test ideas against frameworks and rival positions.',
    reqIds: ['framework-explorer', 'perspectives'],
  },
  {
    id: 'contribute',
    title: 'Contribute',
    blurb:
      'Put something back — your own dilemmas, your own debates, your own arguments.',
    reqIds: ['dilemmas', 'debates-submitted', 'debates-participated'],
  },
];

function themePercent(reqs: MasterExamRequirement[]): number {
  if (reqs.length === 0) return 0;
  const sum = reqs.reduce(
    (s, r) =>
      s + (r.target > 0 ? Math.min(r.current / r.target, 1) : r.complete ? 1 : 0),
    0,
  );
  return Math.round((sum / reqs.length) * 100);
}

function PrerequisiteCard({
  requirements,
  completedCount,
  totalCount,
  overallPercent,
}: PrerequisiteCardProps): JSX.Element {
  const reqsById = new Map(requirements.map((r) => [r.id, r]));

  // Brand-new user: nothing complete and no progress on anything.
  // Show a single banner instead of 7 unmet rows.
  const isBrandNew =
    completedCount === 0 && requirements.every((r) => r.current === 0);

  if (isBrandNew) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/30">
        <CardContent className="p-6 md:p-8 flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Lock className="h-9 w-9 text-primary" />
          </div>
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-semibold">
              Locked &mdash; for now
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg">
              The Master Exam unlocks once you&apos;ve completed the textbook
              and a breadth of real activity across the platform. The shortest
              path is to start with Chapter 1.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/textbook">
                Start the textbook <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <PrerequisiteDisclosure requirements={requirements} reqsById={reqsById} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
          The Master Exam is the capstone of the platform. It unlocks once
          you&apos;ve cleared the activity checklist below.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall progress bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Overall readiness</span>
            <span className="font-medium">
              {completedCount} of {totalCount} complete &middot; {overallPercent}%
            </span>
          </div>
          <Progress value={overallPercent} />
        </div>

        {/* Three themes, each collapsible */}
        <div className="space-y-3">
          {THEMES.map((theme) => {
            const themeReqs = theme.reqIds
              .map((id) => reqsById.get(id))
              .filter((r): r is MasterExamRequirement => Boolean(r));
            const tPct = themePercent(themeReqs);
            const tDone = themeReqs.filter((r) => r.complete).length;
            return (
              <ThemeBlock
                key={theme.id}
                theme={theme}
                requirements={themeReqs}
                themeDone={tDone}
                themeTotal={themeReqs.length}
                themePercent={tPct}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeBlock({
  theme,
  requirements,
  themeDone,
  themeTotal,
  themePercent: tPct,
}: {
  theme: ThemeDef;
  requirements: MasterExamRequirement[];
  themeDone: number;
  themeTotal: number;
  themePercent: number;
}) {
  // Default-open the theme that has the most outstanding work, so the
  // user lands on actionable content.
  const allDone = themeDone === themeTotal;
  const [open, setOpen] = useState<boolean>(!allDone);
  return (
    <div className="rounded-lg border border-border bg-background/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full p-4 text-left flex items-center gap-3 hover:bg-primary/5 transition-colors"
      >
        {allDone ? (
          <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{theme.title}</span>
            <Badge variant={allDone ? 'default' : 'outline'} className="text-[10px]">
              {themeDone} / {themeTotal}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{theme.blurb}</p>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={tPct} className="h-1.5 flex-1" />
            <span className="text-[11px] font-mono text-muted-foreground w-9 text-right">
              {tPct}%
            </span>
          </div>
        </div>
        <ArrowRight
          className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
            open ? 'rotate-90' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <ul className="space-y-3">
            {requirements.map((req) => (
              <RequirementRow key={req.id} req={req} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Disclosure used by the brand-new-user mode — collapsed by default. */
function PrerequisiteDisclosure({
  requirements,
  reqsById,
}: {
  requirements: MasterExamRequirement[];
  reqsById: Map<string, MasterExamRequirement>;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
      >
        Show full checklist
      </Button>
    );
  }
  return (
    <div className="w-full text-left mt-4 space-y-3">
      <div className="text-sm font-semibold text-foreground">
        Full prerequisite checklist
      </div>
      {THEMES.map((theme) => {
        const themeReqs = theme.reqIds
          .map((id) => reqsById.get(id))
          .filter((r): r is MasterExamRequirement => Boolean(r));
        return (
          <div key={theme.id} className="rounded-md border border-border p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              {theme.title}
            </div>
            <ul className="mt-2 space-y-2">
              {themeReqs.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <Circle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{r.title}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
