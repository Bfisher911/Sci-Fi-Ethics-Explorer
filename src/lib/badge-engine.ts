import type { UserProgress, BadgeId } from '@/types';

/**
 * Extra metrics that aren't on the base UserProgress document but that may
 * have been fetched from other server sources (quizzes, certificates). These
 * are optional — callers can pass a subset and those badges will simply not
 * be awarded if data is missing.
 */
export interface BadgeEvaluationExtras {
  /** Number of curricula the user has fully completed. */
  curriculaCompleted?: number;
  /** Number of distinct subject quizzes the user has passed. */
  quizzesPassed?: number;
  /** Number of active (non-revoked) certificates the user holds. */
  certificatesEarned?: number;
}

/**
 * Evaluates a user's progress against badge criteria and returns the list
 * of badge IDs the user has earned.
 */
export function evaluateBadges(
  progress: UserProgress,
  extras: BadgeEvaluationExtras = {}
): BadgeId[] {
  const earned: BadgeId[] = [];

  // Stories badges
  const storiesCount = progress.storiesCompleted.length;
  if (storiesCount >= 1) earned.push('first_story');
  if (storiesCount >= 5) earned.push('five_stories');
  if (storiesCount >= 10) earned.push('ten_stories');

  // Debate badges
  const debatesCount = progress.debatesParticipated.length;
  if (debatesCount >= 1) earned.push('first_debate');
  if (debatesCount >= 10) earned.push('debate_champion');

  // Learning badges
  const quizCount = progress.quizResults.length;
  if (quizCount >= 3) earned.push('quiz_master');

  // Community badges
  const submissionsCount = progress.dilemmasSubmitted.length;
  if (submissionsCount >= 1) earned.push('first_submission');
  if (submissionsCount >= 5) earned.push('community_star');

  // Analysis badges
  const analysesCount = progress.scenariosAnalyzed;
  if (analysesCount >= 10) earned.push('ten_analyses');

  // Devil's advocate badge — tracked via scenariosAnalyzed as a proxy;
  // a dedicated counter could be added later. For now we use analyses >= 5 combined
  // with debate participation as an approximation. To be precise, we'd need a
  // dedicated 'devilsAdvocateUsages' field on UserProgress.
  // For now, skip devil_advocate unless a dedicated field exists.
  // We'll check for the field if it exists on the progress object.
  const extendedProgress = progress as UserProgress & { devilsAdvocateUsages?: number };
  if ((extendedProgress.devilsAdvocateUsages ?? 0) >= 5) {
    earned.push('devil_advocate');
  }

  // Curriculum tier badges
  const curriculaCompleted = extras.curriculaCompleted ?? 0;
  if (curriculaCompleted >= 1) earned.push('novice_navigator');
  if (curriculaCompleted >= 3) earned.push('path_finder');
  if (curriculaCompleted >= 5) earned.push('moral_architect');
  if (curriculaCompleted >= 10) earned.push('grand_philosopher');

  // Quiz tier badges (distinct subjects passed)
  const quizzesPassed = extras.quizzesPassed ?? 0;
  if (quizzesPassed >= 3) earned.push('quiz_apprentice');
  if (quizzesPassed >= 10) earned.push('quiz_master_v2');

  // Certificate badge
  const certificatesEarned = extras.certificatesEarned ?? 0;
  if (certificatesEarned >= 1) earned.push('certified');

  return earned;
}

/**
 * Extra counters the leaderboard can weight in addition to the
 * baseline UserProgress fields. All optional — any missing counter
 * contributes zero, so older callers keep working.
 */
export interface ScoreExtras {
  /** Distinct subject-quizzes passed (philosopher, theory, media, author, textbook chapters, final). */
  quizzesPassed?: number;
  /** Framework Explorer quiz retakes (counts each completed run). */
  frameworkExplorerRuns?: number;
  /** Perspectives comparisons saved. */
  perspectivesCount?: number;
  /** Certificates currently held (master, path, textbook, etc.). */
  certificatesEarned?: number;
  /** Curricula (official learning paths or community curricula) fully completed. */
  curriculaCompleted?: number;
  /** Debates the user started (vs just argued in). */
  debatesCreated?: number;
}

/**
 * Per-activity point values used to compute the leaderboard score.
 *
 * Single source of truth. If any UI ever renders a "points breakdown
 * by activity" surface (profile page, explainer tooltip, badge
 * tour), import this object directly instead of repeating numbers
 * inline — drift is how scoreboards lose user trust.
 *
 * Weighting philosophy (in ascending order of commitment required):
 *   consumption (stories)   — light weight
 *   engagement (debates,    — medium weight
 *     analyses, quizzes)
 *   contribution (dilemmas, — high weight (takes real work)
 *     debates started)
 *   credentials (curricula, — highest weight (durable, audited)
 *     certificates)
 */
export const LEADERBOARD_SCORE_WEIGHTS = {
  storyCompletion: 10,
  debateParticipation: 15,
  scenarioAnalysis: 5,
  dilemmaSubmission: 20,
  frameworkExplorerRun: 5,
  perspectiveComparison: 8,
  subjectQuizPassed: 12,
  debateCreated: 25,
  curriculumCompleted: 40,
  certificateEarned: 50,
} as const;

export type LeaderboardScoreWeightKey = keyof typeof LEADERBOARD_SCORE_WEIGHTS;

/**
 * Calculates a leaderboard score from user progress.
 *
 * See `LEADERBOARD_SCORE_WEIGHTS` for the per-activity weights. Keep
 * this function thin — it should just multiply and sum; any policy
 * change (e.g. different weights per tier, decay over time) belongs
 * on the weights constant, not in this reducer.
 */
export function calculateScore(
  progress: UserProgress,
  extras: ScoreExtras = {},
): number {
  const W = LEADERBOARD_SCORE_WEIGHTS;
  return (
    progress.storiesCompleted.length * W.storyCompletion +
    progress.debatesParticipated.length * W.debateParticipation +
    progress.scenariosAnalyzed * W.scenarioAnalysis +
    progress.dilemmasSubmitted.length * W.dilemmaSubmission +
    (extras.frameworkExplorerRuns ?? 0) * W.frameworkExplorerRun +
    (extras.perspectivesCount ?? 0) * W.perspectiveComparison +
    (extras.quizzesPassed ?? 0) * W.subjectQuizPassed +
    (extras.debatesCreated ?? 0) * W.debateCreated +
    (extras.curriculaCompleted ?? 0) * W.curriculumCompleted +
    (extras.certificatesEarned ?? 0) * W.certificateEarned
  );
}
