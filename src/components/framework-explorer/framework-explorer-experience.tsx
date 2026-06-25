'use client';

/**
 * Framework Explorer experience — the route's top-level client view.
 * Shows the 12-module list and swaps in the per-module quiz runner when
 * a module is started, refreshing progress when the user returns.
 *
 * Responses persist per user, so signed-out visitors can preview Module
 * 1 but are nudged to sign in to save progress and unlock later modules.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ModuleList } from '@/components/framework-explorer/module-list';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ModuleQuizRunner } from '@/components/framework-explorer/module-quiz-runner';
import { getFrameworkProgress } from '@/app/actions/framework-explorer';
import type { FrameworkExplorerProgress } from '@/types/framework-explorer';

const EMPTY_PROGRESS: FrameworkExplorerProgress = {
  userId: '',
  completedModules: [],
  moduleCompletedAt: {},
  moduleProgress: {},
  unlockedThrough: 1,
};

export function FrameworkExplorerExperience(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<FrameworkExplorerProgress>(EMPTY_PROGRESS);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [activeModule, setActiveModule] = useState<number | null>(null);

  const loadProgress = useCallback(async () => {
    if (!user?.uid) {
      setProgress(EMPTY_PROGRESS);
      setLoadingProgress(false);
      return;
    }
    setLoadingProgress(true);
    const res = await getFrameworkProgress(user.uid);
    if (res.success) setProgress(res.data);
    setLoadingProgress(false);
  }, [user?.uid]);

  useEffect(() => {
    if (authLoading) return;
    void loadProgress();
  }, [authLoading, loadProgress]);

  if (authLoading || loadingProgress) {
    return <SkeletonList shape="card" count={6} />;
  }

  if (activeModule !== null) {
    return (
      <ModuleQuizRunner
        moduleNumber={activeModule}
        onExit={() => {
          setActiveModule(null);
          void loadProgress();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {!user && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Sign in to save your answers, track progress, and unlock all 12
              modules. You can preview Module 1 without an account.
            </p>
            <Button asChild size="sm">
              <Link href="/login?next=/framework-explorer">
                <LogIn className="mr-2 h-4 w-4" /> Sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      <ModuleList progress={progress} onStart={setActiveModule} />
    </div>
  );
}
