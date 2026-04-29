'use client';

/**
 * Weekly reading goal card.
 *
 * A small dashboard widget that lets the user set "I want to finish N
 * chapters this week" and tracks progress against it. Dead simple:
 *   - Goal stored in localStorage as `sfe.weeklyGoal` (number 1-7).
 *   - Week-of-year baseline stamped at the same time so the progress
 *     bar resets every Monday automatically.
 *   - Progress = chaptersPassedThisWeek / goal.
 *
 * Why localStorage and not Firestore? The goal is a soft commitment
 * to oneself, not a piece of cross-device user state worth a server
 * round-trip. If we ever want it to follow the user, we'd swap the
 * accessor for a server action — the UI doesn't change.
 *
 * Props:
 *   chaptersPassedAllTime — total chapters the user has earned. We
 *     compare current to a "baseline" snapshotted when the week
 *     started to compute "this week's" delta.
 */

import { useEffect, useMemo, useState } from 'react';
import { Goal, Pencil, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface Props {
  chaptersPassedAllTime: number;
}

const STORAGE_KEY_GOAL = 'sfe.weeklyGoal';
const STORAGE_KEY_WEEK = 'sfe.weeklyGoalWeekStart';
const STORAGE_KEY_BASELINE = 'sfe.weeklyGoalBaseline';

/** ISO week start (Monday) of `d`, as YYYY-MM-DD UTC. */
function weekStartIso(d = new Date()): string {
  // JS getUTCDay: 0=Sun..6=Sat. Convert to Monday=0..Sunday=6.
  const day = (d.getUTCDay() + 6) % 7;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - day);
  return monday.toISOString().slice(0, 10);
}

export function ReadingGoalCard({ chaptersPassedAllTime }: Props): JSX.Element | null {
  const [goal, setGoal] = useState<number | null>(null);
  const [baseline, setBaseline] = useState<number>(chaptersPassedAllTime);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>('2');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const today = weekStartIso();
      const storedWeek = localStorage.getItem(STORAGE_KEY_WEEK);
      const storedGoal = localStorage.getItem(STORAGE_KEY_GOAL);
      const storedBaseline = localStorage.getItem(STORAGE_KEY_BASELINE);

      if (storedWeek !== today) {
        // New week — re-baseline. Keep the old goal target (so the
        // user's intention persists across weeks) but reset progress.
        localStorage.setItem(STORAGE_KEY_WEEK, today);
        localStorage.setItem(
          STORAGE_KEY_BASELINE,
          String(chaptersPassedAllTime),
        );
        setBaseline(chaptersPassedAllTime);
      } else if (storedBaseline !== null) {
        const parsed = Number.parseInt(storedBaseline, 10);
        setBaseline(Number.isFinite(parsed) ? parsed : chaptersPassedAllTime);
      }

      if (storedGoal) {
        const parsed = Number.parseInt(storedGoal, 10);
        if (Number.isFinite(parsed) && parsed > 0 && parsed <= 7) {
          setGoal(parsed);
          setDraft(String(parsed));
        }
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
    // We deliberately exclude chaptersPassedAllTime so re-baseline only
    // happens at week boundaries, not on every chapter pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Done-this-week (clamped at 0 to handle weird states where the
  // baseline is somehow greater than current — shouldn't happen, but
  // we'd rather render 0 than a negative number).
  const doneThisWeek = useMemo(
    () => Math.max(0, chaptersPassedAllTime - baseline),
    [chaptersPassedAllTime, baseline],
  );

  function saveGoal(next: number) {
    if (typeof window === 'undefined') return;
    const clamped = Math.max(1, Math.min(7, Math.floor(next)));
    setGoal(clamped);
    setEditing(false);
    try {
      localStorage.setItem(STORAGE_KEY_GOAL, String(clamped));
      // Also stamp baseline + week if not already set (first-time setup).
      const today = weekStartIso();
      if (!localStorage.getItem(STORAGE_KEY_WEEK)) {
        localStorage.setItem(STORAGE_KEY_WEEK, today);
      }
      if (!localStorage.getItem(STORAGE_KEY_BASELINE)) {
        localStorage.setItem(
          STORAGE_KEY_BASELINE,
          String(chaptersPassedAllTime),
        );
        setBaseline(chaptersPassedAllTime);
      }
    } catch {
      // ignore
    }
  }

  function clearGoal() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_GOAL);
      localStorage.removeItem(STORAGE_KEY_WEEK);
      localStorage.removeItem(STORAGE_KEY_BASELINE);
    } catch {
      // ignore
    }
    setGoal(null);
    setEditing(false);
  }

  if (!hydrated) {
    // Render nothing pre-hydration to avoid an SSR/CSR mismatch — the
    // card is a low-priority dashboard accent, not blocking content.
    return null;
  }

  if (!goal && !editing) {
    return (
      <Card className="bg-card/60">
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
            <Goal className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Set a weekly reading goal</div>
            <p className="text-xs text-muted-foreground">
              Decide how many chapters you want to finish this week. We'll
              track your pace.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Set goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editing) {
    return (
      <Card className="bg-card/60">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Goal className="h-4 w-4 text-primary" />
            Weekly chapter goal
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <Label htmlFor="weekly-goal-input" className="text-xs text-muted-foreground">
                Chapters this week (1–7)
              </Label>
              <Input
                id="weekly-goal-input"
                type="number"
                min={1}
                max={7}
                step={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const n = Number.parseInt(draft, 10);
                  if (Number.isFinite(n) && n >= 1 && n <= 7) saveGoal(n);
                }}
              >
                Save
              </Button>
              {goal !== null && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setDraft(String(goal));
                  }}
                >
                  Cancel
                </Button>
              )}
              {goal !== null && (
                <Button size="sm" variant="ghost" onClick={clearGoal}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active goal view.
  const pct = goal ? Math.min(100, Math.round((doneThisWeek / goal) * 100)) : 0;
  const met = goal !== null && doneThisWeek >= goal;

  return (
    <Card className="bg-card/60">
      <CardContent className="py-4">
        <div className="flex items-center gap-2">
          <div
            className={`grid h-9 w-9 place-items-center rounded-lg ${
              met ? 'bg-emerald-500/15 text-emerald-300' : 'bg-primary/15 text-primary'
            }`}
          >
            {met ? <Sparkles className="h-4 w-4" /> : <Goal className="h-4 w-4" />}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">
              {met ? "You hit this week's goal" : 'Weekly chapter goal'}
            </div>
            <div className="text-xs text-muted-foreground">
              {doneThisWeek} of {goal} chapter{goal === 1 ? '' : 's'} this week
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            aria-label="Edit goal"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Progress value={pct} className="mt-3 h-1.5" />
      </CardContent>
    </Card>
  );
}
