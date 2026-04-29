/**
 * Pure streak-rule helper.
 *
 * Mirrors the calculation inside `recordDailyActivity` (in
 * `src/app/actions/progress.ts`) but with no Firestore I/O so it can
 * be unit-tested. If you change one, change the other.
 *
 * Rules:
 *   - Same day  → no change, isNewDay=false
 *   - +1 day    → currentStreak + 1
 *   - +2+ days  → reset to 1
 *   - clock-skew (negative diff) → preserve the current streak
 *   - first-ever visit (no lastDay) → 1
 *
 * Day strings are ISO YYYY-MM-DD UTC.
 */

interface Input {
  /** Last visit's day string, or undefined if first ever. */
  lastDay: string | undefined;
  /** Current visit's day string. */
  today: string;
  /** Streak before this visit. */
  currentStreak: number;
}

interface Result {
  nextStreak: number;
  isNewDay: boolean;
}

export function computeNextStreak(input: Input): Result {
  const { lastDay, today, currentStreak } = input;
  if (lastDay === today) {
    return { nextStreak: currentStreak, isNewDay: false };
  }
  if (!lastDay) {
    return { nextStreak: 1, isNewDay: true };
  }
  const last = new Date(`${lastDay}T00:00:00Z`).getTime();
  const now = new Date(`${today}T00:00:00Z`).getTime();
  const diffDays = Math.round((now - last) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) {
    // Clock-skew safety: don't punish or reward, hold steady.
    return { nextStreak: currentStreak, isNewDay: true };
  }
  if (diffDays === 1) {
    return { nextStreak: currentStreak + 1, isNewDay: true };
  }
  // 0 (already handled above) or 2+ → reset to 1.
  return { nextStreak: 1, isNewDay: true };
}
