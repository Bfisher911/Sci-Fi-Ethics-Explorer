'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  FlaskConical,
  Flame,
  GraduationCap,
  Layers,
  Lightbulb,
  MessagesSquare,
  ScrollText,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EarnedBadges } from '@/components/profile/earned-badges';
import { getUserProgress } from '@/app/actions/progress';
import { getUserBadges } from '@/app/actions/badges';
import { getFrameworkProgress } from '@/app/actions/framework-explorer';
import { getUserCertificates } from '@/app/actions/certificates';
import { getMasterExamUnlockState } from '@/app/actions/master-exam';
import { getUserBestAttempts } from '@/app/actions/quizzes';
import { TOTAL_MODULES } from '@/data/framework-explorer';
import type { Certificate, QuizAttempt } from '@/types';

interface ProfileActivityOverviewProps {
  userId: string;
  displayName: string;
}

interface OverviewData {
  storiesCompleted: number;
  scenariosAnalyzed: number;
  debatesParticipated: number;
  dilemmasSubmitted: number;
  reflections: number;
  currentStreak: number;
  longestStreak: number;
  modulesCompleted: number;
  badgeIds: string[];
  certs: Certificate[];
  masterPercent: number;
  masterAwarded: boolean;
  masterCertHash?: string;
  bestAttempts: QuizAttempt[];
}

/** Turn a subjectId like "mary-shelley" into "Mary Shelley". */
function humanizeSubject(id: string): string {
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const SUBJECT_LABEL: Record<string, string> = {
  philosopher: 'Philosopher',
  theory: 'Framework',
  'scifi-author': 'Author',
  'scifi-media': 'Media',
  'book-chapter': 'Textbook',
  'book-final': 'Exam',
};

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BookOpen;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-background/40 p-3 text-center">
      <Icon className="mb-1 h-5 w-5 text-primary" aria-hidden />
      <span className="text-xl font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * Comprehensive public activity + achievements overview for a user profile.
 * Self-fetches every real per-user signal (progress, framework-explorer
 * modules, quiz mastery, certificates, badges, master-exam progress) and
 * renders them as stat tiles, learning-progress bars, a quiz-mastery list,
 * earned certificates, and badges. Aggregate / achievement data only — no
 * private answers or bookmarks.
 */
export function ProfileActivityOverview({ userId, displayName }: ProfileActivityOverviewProps) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [progressRes, badgesRes, frameworkRes, certsRes, masterRes, attemptsRes] =
        await Promise.all([
          getUserProgress(userId),
          getUserBadges(userId),
          getFrameworkProgress(userId),
          getUserCertificates(userId),
          getMasterExamUnlockState(userId),
          getUserBestAttempts(userId),
        ]);
      if (cancelled) return;

      const prog = progressRes.success ? progressRes.data : null;
      const attempts = attemptsRes.success ? attemptsRes.data : [];

      setData({
        storiesCompleted: prog?.storiesCompleted?.length ?? 0,
        scenariosAnalyzed: prog?.scenariosAnalyzed ?? 0,
        debatesParticipated: prog?.debatesParticipated?.length ?? 0,
        dilemmasSubmitted: prog?.dilemmasSubmitted?.length ?? 0,
        reflections: prog?.studioReflectionsCompleted ?? 0,
        currentStreak: prog?.currentStreakDays ?? 0,
        longestStreak: prog?.longestStreakDays ?? 0,
        modulesCompleted: frameworkRes.success ? frameworkRes.data.completedModules.length : 0,
        badgeIds: badgesRes.success ? badgesRes.data : [],
        certs: certsRes.success ? certsRes.data : [],
        masterPercent: masterRes.success ? masterRes.data.overallPercent : 0,
        masterAwarded: masterRes.success ? masterRes.data.alreadyAwarded : false,
        masterCertHash: masterRes.success ? masterRes.data.masterCertHash : undefined,
        bestAttempts: [...attempts].sort((a, b) => b.scorePercent - a.scorePercent),
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const quizzesPassed = data.bestAttempts.filter((a) => a.passed).length;
  const avgBest =
    data.bestAttempts.length > 0
      ? Math.round(
          data.bestAttempts.reduce((s, a) => s + a.scorePercent, 0) / data.bestAttempts.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* ─── Stat tiles ─────────────────────────────────────────── */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Activity</CardTitle>
          <CardDescription>
            What {displayName} has explored across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={BookOpen} value={data.storiesCompleted} label="Stories completed" />
            <StatTile icon={FlaskConical} value={data.scenariosAnalyzed} label="Scenarios analyzed" />
            <StatTile icon={MessagesSquare} value={data.debatesParticipated} label="Debates joined" />
            <StatTile icon={Lightbulb} value={data.dilemmasSubmitted} label="Dilemmas submitted" />
            <StatTile icon={Layers} value={`${data.modulesCompleted}/${TOTAL_MODULES}`} label="Explorer modules" />
            <StatTile icon={Brain} value={quizzesPassed} label="Quizzes passed" />
            <StatTile icon={Sparkles} value={data.reflections} label="Reflections" />
            <StatTile icon={Award} value={data.badgeIds.length} label="Badges earned" />
          </div>

          {data.currentStreak > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/5 px-3 py-2 text-sm">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="font-medium text-foreground">
                {data.currentStreak}-day streak
              </span>
              {data.longestStreak > data.currentStreak && (
                <span className="text-muted-foreground">
                  · best {data.longestStreak} days
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Learning progress ──────────────────────────────────── */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Learning Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <GraduationCap className="h-4 w-4 text-primary" />
                Master Technology Ethicist
              </span>
              {data.masterAwarded ? (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Awarded
                </Badge>
              ) : (
                <span className="text-muted-foreground">{data.masterPercent}%</span>
              )}
            </div>
            <Progress value={data.masterPercent} className="h-2" />
            {data.masterAwarded && data.masterCertHash && (
              <Link
                href={`/verify/${data.masterCertHash}`}
                className="mt-1 inline-block text-xs text-primary hover:underline"
              >
                View certificate →
              </Link>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="h-4 w-4 text-primary" />
                Framework Explorer
              </span>
              <span className="text-muted-foreground">
                {data.modulesCompleted}/{TOTAL_MODULES} modules
              </span>
            </div>
            <Progress
              value={(data.modulesCompleted / TOTAL_MODULES) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Quiz mastery ───────────────────────────────────────── */}
      {data.bestAttempts.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Trophy className="h-5 w-5" /> Quiz Mastery
            </CardTitle>
            <CardDescription>
              {quizzesPassed} passed · {avgBest}% average best score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.bestAttempts.slice(0, 8).map((a) => (
                <li
                  key={`${a.subjectType}-${a.subjectId}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium text-foreground">
                      {humanizeSubject(a.subjectId)}
                    </span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {SUBJECT_LABEL[a.subjectType] ?? a.subjectType}
                    </Badge>
                  </span>
                  <span
                    className={
                      a.passed
                        ? 'shrink-0 font-semibold text-green-500'
                        : 'shrink-0 font-semibold text-muted-foreground'
                    }
                  >
                    {a.scorePercent}%
                  </span>
                </li>
              ))}
            </ul>
            {data.bestAttempts.length > 8 && (
              <p className="mt-2 text-xs text-muted-foreground">
                +{data.bestAttempts.length - 8} more
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Certificates ───────────────────────────────────────── */}
      {data.certs.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <ScrollText className="h-5 w-5" /> Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.certs.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <ScrollText className="h-4 w-4 shrink-0 text-accent" />
                    <span className="truncate text-sm font-medium text-foreground">
                      {c.curriculumTitle}
                    </span>
                    {c.tier && (
                      <Badge variant="secondary" className="shrink-0 text-[10px] capitalize">
                        {c.tier}
                      </Badge>
                    )}
                  </span>
                  {c.verificationHash && (
                    <Link
                      href={`/verify/${c.verificationHash}`}
                      className="shrink-0 text-xs text-primary hover:underline"
                    >
                      Verify →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ─── Badges ─────────────────────────────────────────────── */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Earned Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <EarnedBadges earnedBadgeIds={data.badgeIds} />
        </CardContent>
      </Card>
    </div>
  );
}
