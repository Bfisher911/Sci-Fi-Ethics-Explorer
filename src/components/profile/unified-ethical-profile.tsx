'use client';

import { useEffect, useState } from 'react';
import { getUserEthicalProfile } from '@/app/actions/ethical-judgments';
import { getFrameworkDisplayName } from '@/lib/ethical-framework-registry';
import { useAuth } from '@/hooks/use-auth';
import type { EthicalProfileAggregate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp } from 'lucide-react';
import { GenerateEthicsReportButton } from '@/components/reports/generate-ethics-report-button';

function ScoreBar({ frameworkId, score }: { frameworkId: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-medium">{getFrameworkDisplayName(frameworkId)}</span>
        <span className="text-muted-foreground tabular-nums">{Math.round(score)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${Math.max(2, Math.min(100, score))}%` }} />
      </div>
    </div>
  );
}

export function UnifiedEthicalProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EthicalProfileAggregate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      const result = await getUserEthicalProfile(user.uid);
      if (result.success) setProfile(result.data);
      setLoading(false);
    }
    load();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!profile || profile.eventCount === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-primary font-headline flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Unified Ethical Profile
          </CardTitle>
          <CardDescription>
            Your profile will combine ethical choices from stories, debates, media reflections,
            the Framework Explorer, and the Weekly Clause.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete a profile-affecting activity to begin. Knowledge-check quizzes remain separate.
          </p>
        </CardContent>
      </Card>
    );
  }

  const strongest = profile.strongestFrameworks.filter((item) => item.score > 0).slice(0, 6);
  const leastUsed = profile.leastUsedFrameworks.slice(0, 5);

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-primary font-headline flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Unified Ethical Profile
        </CardTitle>
        <CardDescription>
          These are interpretive learning signals from your responses, not fixed labels about you.
          Factual quiz scores are tracked separately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-md border bg-background/50 p-4">
            <div className="text-2xl font-bold">{profile.eventCount}</div>
            <div className="text-xs text-muted-foreground">ethical judgment events</div>
          </div>
          <div className="rounded-md border bg-background/50 p-4">
            <div className="text-2xl font-bold">{Math.round(profile.confidenceLevel * 100)}%</div>
            <div className="text-xs text-muted-foreground">profile confidence</div>
          </div>
          <div className="rounded-md border bg-background/50 p-4">
            <div className="flex flex-wrap gap-1">
              {profile.contentAreasIncluded.slice(0, 4).map((area) => (
                <Badge key={area} variant="secondary">{area.replace(/-/g, ' ')}</Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2">content areas included</div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Strongest Current Alignments
          </h3>
          <div className="space-y-3">
            {strongest.map((item) => (
              <ScoreBar key={item.frameworkId} frameworkId={item.frameworkId} score={item.score} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md border bg-background/50 p-4">
            <h3 className="font-semibold text-primary mb-2">Frameworks To Explore More</h3>
            <div className="flex flex-wrap gap-2">
              {leastUsed.map((item) => (
                <Badge key={item.frameworkId} variant="outline">
                  {getFrameworkDisplayName(item.frameworkId)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-md border bg-background/50 p-4">
            <h3 className="font-semibold text-primary mb-2">Recent Ethical Decisions</h3>
            <div className="space-y-2">
              {profile.recentEvents.slice(0, 3).map((event) => (
                <p key={event.id} className="text-sm text-muted-foreground">
                  <span className="text-foreground">{event.sourceTitle}</span>: {(event.userChoice || event.responseText || '').slice(0, 110)}
                </p>
              ))}
            </div>
          </div>
        </div>

        {profile.frameworkTensions.length > 0 && (
          <div className="rounded-md border bg-background/50 p-4">
            <h3 className="font-semibold text-primary mb-2">Ethical Tensions Detected</h3>
            <div className="space-y-2">
              {profile.frameworkTensions.slice(0, 3).map((tension, index) => (
                <p key={`${tension.frameworks.join('-')}-${index}`} className="text-sm text-muted-foreground">
                  {tension.frameworks.map(getFrameworkDisplayName).join(' vs. ')}: {tension.description}
                </p>
              ))}
            </div>
          </div>
        )}

        <GenerateEthicsReportButton />
      </CardContent>
    </Card>
  );
}
