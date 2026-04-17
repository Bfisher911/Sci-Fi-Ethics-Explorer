import type { Quiz } from '@/types';
import { finalExamQuiz } from '@/data/textbook/quizzes';
import { ethicalTheoryQuizzes } from '@/data/theory-quizzes';
import { scifiAuthorQuizzes } from '@/data/scifi-author-quizzes';

/**
 * The Master Technology Ethicist exam.
 *
 * Unlocks only after a user has earned the Textbook Master certificate
 * AND completed every Official Learning Path. Its questions are a
 * weighted, deterministic mix drawn from:
 *   - the cumulative textbook final (12 chapter questions)
 *   - every ethical-theory quiz (18 theories × 1 question each)
 *   - every sci-fi author quiz (10 authors × 1 question each)
 *
 * Pulled from the same static fallback infrastructure used by the
 * rest of the quiz engine so no Firestore seeding is required.
 */
export const masterExamQuiz: Quiz = (() => {
  const questions = [
    // 24 cumulative textbook questions (2 per chapter, same as the
    // existing Textbook final exam).
    ...finalExamQuiz.questions,
    // One question per theory — picks the first (usually recall-level)
    // to keep the test manageable.
    ...ethicalTheoryQuizzes
      .filter((q) => q.questions.length > 0)
      .map((q, i) => {
        const first = q.questions[0];
        return {
          ...first,
          id: `master-theory-${i + 1}`,
          prompt: `[${q.subjectName}] ${first.prompt}`,
        };
      }),
    // One question per sci-fi author.
    ...scifiAuthorQuizzes
      .filter((q) => q.questions.length > 0)
      .map((q, i) => {
        const first = q.questions[0];
        return {
          ...first,
          id: `master-author-${i + 1}`,
          prompt: `[${q.subjectName}] ${first.prompt}`,
        };
      }),
  ];

  return {
    id: 'master-technology-ethicist',
    subjectType: 'book-final',
    subjectId: 'master-technology-ethicist',
    subjectName:
      'Sci-Fi Ethics Explorer — Master Technology Ethicist Exam',
    title: 'Master Technology Ethicist Exam',
    description:
      'Cumulative assessment drawing from the full textbook, every ethical tradition, and every sci-fi author on the platform. Pass with 75% or higher to earn the Master Technology Ethicist certificate.',
    estimatedMinutes: 45,
    passingScorePercent: 75,
    questions: questions.map((q, i) => ({ ...q, id: `master-q${i + 1}` })),
    createdAt: new Date(0),
  };
})();

/** Convenience: how many questions are on the exam. */
export const MASTER_EXAM_QUESTION_COUNT = masterExamQuiz.questions.length;
