'use client';

/**
 * Framework Explorer module list — 12 cards showing each module's
 * status, lock state, progress, and a start/continue action. Locked
 * modules explain what unlocks them.
 */

import { Lock, CheckCircle2, ArrowRight, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FRAMEWORK_MODULES, QUESTIONS_PER_MODULE, isModuleUnlocked } from '@/data/framework-explorer';
import type { FrameworkExplorerProgress } from '@/types/framework-explorer';

interface ModuleListProps {
  progress: FrameworkExplorerProgress;
  onStart: (moduleNumber: number) => void;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function ModuleList({ progress, onStart }: ModuleListProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {FRAMEWORK_MODULES.map((mod) => {
        const unlocked = isModuleUnlocked(
          mod.moduleNumber,
          progress.completedModules,
        );
        const completed = progress.completedModules.includes(mod.moduleNumber);
        const answered = progress.moduleProgress[mod.moduleNumber] ?? 0;
        const pct = Math.round((answered / QUESTIONS_PER_MODULE) * 100);
        const inProgress = answered > 0 && !completed;

        return (
          <Card
            key={mod.id}
            className={cn(
              'flex flex-col bg-card/70 transition-colors',
              !unlocked && 'opacity-70',
              completed && 'border-emerald-500/40',
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  Module {mod.moduleNumber}
                </Badge>
                {completed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                  </span>
                ) : !unlocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" /> Locked
                  </span>
                ) : inProgress ? (
                  <span className="text-[10px] font-semibold text-primary">
                    In progress
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    {QUESTIONS_PER_MODULE} questions
                  </span>
                )}
              </div>
              <CardTitle className="mt-1 text-base leading-tight">
                {mod.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {mod.description}
              </p>
              <p className="mt-2 text-[11px] italic text-muted-foreground/80">
                Focus: {mod.focus}
              </p>

              {unlocked && (answered > 0 || completed) && (
                <div className="mt-3">
                  <Progress value={completed ? 100 : pct} className="h-1.5" />
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {completed
                        ? `${QUESTIONS_PER_MODULE}/${QUESTIONS_PER_MODULE}`
                        : `${answered}/${QUESTIONS_PER_MODULE}`}
                    </span>
                    {completed && (
                      <span>
                        {formatDate(
                          progress.moduleCompletedAt[mod.moduleNumber],
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4">
                {!unlocked ? (
                  <p className="text-[11px] text-muted-foreground">
                    Complete Module {mod.moduleNumber - 1} to unlock.
                  </p>
                ) : (
                  <Button
                    size="sm"
                    variant={completed ? 'outline' : 'default'}
                    className="w-full"
                    onClick={() => onStart(mod.moduleNumber)}
                  >
                    {completed ? (
                      <>
                        <Compass className="mr-1.5 h-3.5 w-3.5" /> Review
                      </>
                    ) : inProgress ? (
                      <>
                        Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Start <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
