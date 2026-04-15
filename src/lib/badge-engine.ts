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
 * Calculates a leaderboard score from user progress.
 * Score = stories*10 + debates*15 + analyses*5 + submissions*20
 */
export function calculateScore(progress: UserProgress): number {
  return (
    progress.storiesCompleted.length * 10 +
    progress.debatesParticipated.length * 15 +
    progress.scenariosAnalyzed * 5 +
    progress.dilemmasSubmitted.length * 20
  );
}
