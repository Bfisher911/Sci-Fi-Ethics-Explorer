/**
 * Pure helpers shared between the Master Exam server action
 * (src/app/actions/master-exam.ts) and the leaderboard server action
 * (src/app/actions/badges.ts). Lives outside either `'use server'`
 * module because Server Actions can only export async functions —
 * these are small, synchronous, no-I/O utilities so they need to be
 * importable as plain TS.
 */

/**
 * Count of Framework Explorer quiz completions, deduplicated by
 * distinct calendar day (UTC). Framework Explorer writes one entry
 * per retake into `userProgress.quizResults`; counting raw retakes
 * lets a single session farm the "5 runs" Master Exam prereq (or
 * the leaderboard signal) in minutes. Counting distinct days is the
 * honest proxy for "separate study sessions" without adding new
 * schema.
 *
 * Inputs can be `Date`, Firestore `Timestamp` (has `toDate()`), ISO
 * string, or number. Unknown shapes are skipped silently so that a
 * malformed entry can never crash the caller.
 */
export function countFrameworkExplorerRuns(
  quizResults: Array<unknown>,
): number {
  if (!Array.isArray(quizResults)) return 0;
  const days = new Set<string>();
  for (const qr of quizResults) {
    if (!qr || typeof qr !== 'object') continue;
    const raw = (qr as { completedAt?: unknown }).completedAt;
    const d = toDateSafe(raw);
    if (!d) continue;
    // YYYY-MM-DD in UTC — deterministic across time zones.
    days.add(d.toISOString().slice(0, 10));
  }
  return days.size;
}

function toDateSafe(raw: unknown): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
  if (typeof raw === 'object' && raw !== null && 'toDate' in raw) {
    try {
      const d = (raw as { toDate: () => Date }).toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  if (typeof raw === 'string' || typeof raw === 'number') {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
