'use client';

/**
 * "Your Ethical Journey" — profile card summarizing the cumulative
 * ethical-framework profile a user has built across all site activities
 * (Story decisions + Framework Explorer modules), plus an on-demand AI
 * report grounded in their actual choices.
 *
 * Shows:
 *   - dominant guiding principles + secondary frameworks
 *   - the full framework breakdown (toggle all / non-zero)
 *   - detected ethical tensions
 *   - a "Generate report" button (gated on >= MIN_DECISIONS_FOR_REPORT)
 *
 * Reads the unified profile so every source feeds one score. When
 * there's no activity yet it shows an encouraging empty state.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Loader2,
  Scale,
  Sparkles,
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FrameworkBreakdown } from '@/components/ethics/framework-breakdown';
import { SubmitToCommunitySection } from '@/components/communities/submit-to-community-section';
import {
  getUnifiedEthicsProfile,
  generateEthicsReportForUser,
} from '@/app/actions/ethics-journey';
import {
  buildJourneyProfile,
  type JourneyProfile,
} from '@/lib/ethics/journey';
import { FRAMEWORK_META } from '@/lib/ethics/frameworks';
import {
  MIN_DECISIONS_FOR_REPORT,
  type EthicsReport,
} from '@/lib/ethics/report-types';

export function EthicsJourneyCard(): JSX.Element {
  const { user } = useAuth();
  const [profile, setProfile] = useState<JourneyProfile | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [report, setReport] = useState<EthicsReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(buildJourneyProfile([]));
      return;
    }
    let cancelled = false;
    getUnifiedEthicsProfile(user.uid).then((res) => {
      if (cancelled) return;
      setProfile(res.success ? res.data.profile : buildJourneyProfile([]));
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleGenerate() {
    if (!user) return;
    setReportLoading(true);
    setReport(null);
    const res = await generateEthicsReportForUser(user.uid);
    setReportLoading(false);
    if (res.success) setReport(res.data);
    else
      setReport({
        reflectiveSummary: '',
        dominantFrameworks: [],
        patterns: [],
        examples: [],
        tensions: [],
        errorCode: 'upstream_error',
        error: res.error,
      });
  }

  if (profile === null) {
    return (
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" /> Your Ethical Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = profile.totalDecisions > 0;
  const canReport = profile.totalDecisions >= MIN_DECISIONS_FOR_REPORT;

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" /> Your Ethical Journey
        </CardTitle>
        <CardDescription>
          How your decisions — across Stories and the Framework Explorer —
          distribute across the ethical frameworks, and what they reveal
          about your reasoning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-background/40 p-6 text-center">
            <Compass className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              No decisions recorded yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Make choices in an interactive story or work through a
              Framework Explorer module — each one shapes your ethical
              profile across the frameworks.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild size="sm">
                <Link href="/stories">Explore interactive stories</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/framework-explorer">Open Framework Explorer</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Guiding principles */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-primary" /> Your guiding
                principles
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.dominant.map((d, i) => (
                  <Badge
                    key={d.id}
                    variant="outline"
                    className={`${FRAMEWORK_META[d.id].color} border-current/30`}
                  >
                    {i === 0 && '★ '}
                    {d.label}
                    <span className="ml-1 opacity-60">{d.score}</span>
                  </Badge>
                ))}
              </div>
              {profile.secondary.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    Also present:
                  </span>
                  {profile.secondary.map((d) => (
                    <span
                      key={d.id}
                      className={`text-[11px] ${FRAMEWORK_META[d.id].color}`}
                    >
                      {d.label}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Based on {profile.totalDecisions} decision
                {profile.totalDecisions === 1 ? '' : 's'} across your stories
                and Framework Explorer modules.
              </p>
            </div>

            {/* Tensions */}
            {profile.tensions.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Scale className="h-3.5 w-3.5 text-accent" /> Ethical tensions
                </div>
                <ul className="space-y-1.5">
                  {profile.tensions.slice(0, 3).map((t) => (
                    <li
                      key={`${t.a}-${t.b}`}
                      className="text-xs leading-relaxed text-foreground/80"
                    >
                      <span className="font-medium text-foreground">
                        {t.aLabel} ↔ {t.bLabel}:
                      </span>{' '}
                      {t.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full breakdown */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Framework breakdown
                </span>
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-3 w-3" /> Active only
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" /> Show all
                    </>
                  )}
                </button>
              </div>
              <FrameworkBreakdown ranked={profile.ranked} showAll={showAll} />
            </div>

            {/* AI report */}
            <div className="border-t border-border/40 pt-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> AI ethical
                journey report
              </div>
              {!canReport ? (
                <p className="text-xs text-muted-foreground">
                  Make at least {MIN_DECISIONS_FOR_REPORT} decisions to
                  unlock a personalized report. You have{' '}
                  {profile.totalDecisions} so far.
                </p>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={handleGenerate}
                    disabled={reportLoading}
                  >
                    {reportLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing your choices…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {report ? 'Regenerate report' : 'Generate report'}
                      </>
                    )}
                  </Button>

                  {report?.error && (
                    <p className="mt-3 text-xs text-destructive">
                      {report.error}
                    </p>
                  )}

                  {report && !report.error && (
                    <>
                    <div className="mt-4 space-y-4 rounded-lg border bg-background/40 p-4">
                      {report.reflectiveSummary && (
                        <p className="text-sm italic leading-relaxed text-foreground/90">
                          {report.reflectiveSummary}
                        </p>
                      )}

                      {report.dominantFrameworks.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Dominant frameworks
                          </h4>
                          <ul className="mt-1.5 space-y-1.5">
                            {report.dominantFrameworks.map((d, i) => (
                              <li key={i} className="text-xs leading-relaxed">
                                <span className="font-semibold text-foreground">
                                  {d.framework}:
                                </span>{' '}
                                <span className="text-muted-foreground">
                                  {d.summary}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.patterns.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Patterns
                          </h4>
                          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                            {report.patterns.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.examples.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                            From your choices
                          </h4>
                          <ul className="mt-1.5 space-y-2">
                            {report.examples.map((e, i) => (
                              <li key={i} className="text-xs leading-relaxed">
                                <span className="italic text-foreground/80">
                                  &ldquo;{e.choice}&rdquo;
                                </span>
                                <br />
                                <span className="text-muted-foreground">
                                  {e.insight}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.tensions.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">
                            Tensions &amp; tradeoffs
                          </h4>
                          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                            {report.tensions.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {/* Submit this generated ethics report into a community
                        learning record. */}
                    <SubmitToCommunitySection
                      type="ethics_report"
                      defaultTitle="My ethical profile report"
                      defaultSummary={
                        report.reflectiveSummary?.slice(0, 280) ||
                        'My ethical-framework learning record.'
                      }
                      className="mt-4"
                      content={{
                        report,
                        reflectiveSummary: report.reflectiveSummary,
                        dominantFrameworks: report.dominantFrameworks,
                        patterns: report.patterns,
                        tensions: report.tensions,
                      }}
                    />
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
