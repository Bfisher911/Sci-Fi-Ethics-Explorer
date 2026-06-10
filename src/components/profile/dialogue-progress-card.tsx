'use client';

/**
 * Profile card summarizing dialogue progress: passed assessments per
 * category, with a link into the Dialogues hub and a suggested next
 * challenge (the first category below its certificate threshold).
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  getDialogueLibrary,
  type DialogueProgressEntry,
} from '@/app/actions/dialogues';
import {
  DIALOGUE_CATEGORIES,
  DIALOGUE_CATEGORY_LABELS,
  DIALOGUE_CATEGORY_CERT_THRESHOLD,
  type DialogueCategory,
} from '@/lib/dialogues/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, MessagesSquare } from 'lucide-react';

export function DialogueProgressCard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, DialogueProgressEntry> | null>(
    null
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getDialogueLibrary(user.uid).then((res) => {
      if (!cancelled && res.success) setProgress(res.data.progress);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const byCategory = useMemo(() => {
    const counts: Record<DialogueCategory, number> = {
      philosopher: 0,
      'scifi-author': 0,
      'scifi-media': 0,
      framework: 0,
    };
    for (const entry of Object.values(progress ?? {})) {
      if (entry.passed) counts[entry.category] += 1;
    }
    return counts;
  }, [progress]);

  const nextChallenge = useMemo(
    () =>
      DIALOGUE_CATEGORIES.find(
        (c) => byCategory[c] < DIALOGUE_CATEGORY_CERT_THRESHOLD
      ),
    [byCategory]
  );

  if (!user) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MessagesSquare className="h-5 w-5 text-accent" aria-hidden />
          Dialogue Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {progress === null ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {DIALOGUE_CATEGORIES.map((c) => {
                const passed = byCategory[c];
                return (
                  <div key={c} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">
                        {DIALOGUE_CATEGORY_LABELS[c]}
                      </span>
                      <span className="text-muted-foreground">
                        {passed}/{DIALOGUE_CATEGORY_CERT_THRESHOLD} passed
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        (passed / DIALOGUE_CATEGORY_CERT_THRESHOLD) * 100
                      )}
                      className="h-1.5"
                      aria-label={`${DIALOGUE_CATEGORY_LABELS[c]}: ${passed} of ${DIALOGUE_CATEGORY_CERT_THRESHOLD} assessments passed`}
                    />
                  </div>
                );
              })}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dialogues">
                {nextChallenge
                  ? `Next challenge: a ${DIALOGUE_CATEGORY_LABELS[nextChallenge].replace(/s$/, '').toLowerCase()} dialogue`
                  : 'Explore dialogues'}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
