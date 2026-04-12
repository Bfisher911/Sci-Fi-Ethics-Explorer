import type { UserProgress, BadgeId } from '@/types';

/**
 * Evaluates a user's progress against badge criteria and returns the list
 * of badge IDs the user has earned.
 */
export function evaluateBadges(progress: UserProgress): BadgeId[] {
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
