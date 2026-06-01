/**
 * Declarative registry of achievement certificates.
 *
 * This is the SINGLE place new activity/achievement certificates are defined.
 * Adding a future certificate means appending one `CertificateDefinition` here
 * — the rule engine (`engine.ts`), the award action
 * (`src/app/actions/achievement-certificates.ts`), the dashboard progress UI,
 * and the detail page all read from this list. No activity page needs to
 * change.
 *
 * Each definition is pure data plus a `metric(ctx)` function that reads a
 * pre-computed `CertificateContext` (see `buildCertificateContext`) and returns
 * `{ current, target }`. The engine derives `earned` from those, so all
 * Firestore access stays out of this module (keeping it unit-testable).
 */

import { chapters } from '@/data/textbook';

/** Count threshold shared by the "do N activities" certificates. Configurable. */
export const ACTIVITY_CERT_THRESHOLD = 12;

/**
 * Passing threshold for textbook chapter quizzes. The chapter quizzes already
 * carry `passingScorePercent: 70`; this mirrors it as the single configurable
 * default used for chapter-quiz certificate display/criteria. The authoritative
 * per-quiz threshold is still read at issuance time.
 */
export const CHAPTER_QUIZ_PASSING_THRESHOLD = 70;

export type CertificateCategory =
  | 'stories'
  | 'framework'
  | 'studio-analysis'
  | 'studio-compare'
  | 'studio-reflect'
  | 'dilemma'
  | 'debate'
  | 'quiz-philosopher'
  | 'quiz-framework'
  | 'quiz-scifi-author'
  | 'quiz-scifi-media'
  | 'textbook-master';

export type CertificateKind = 'count' | 'completion' | 'quiz-mastery';

/** Per-category quiz mastery tally: how many distinct quizzes the user has
 *  passed vs how many exist in that category (the denominator). */
export interface QuizMasteryTally {
  passed: number;
  total: number;
}

/**
 * Snapshot of everything the engine needs, computed ONCE per evaluation by the
 * server action so each certificate's `metric` is a cheap pure read.
 */
export interface CertificateContext {
  storiesCompleted: number;
  scenariosAnalyzed: number;
  comparesCompleted: number;
  studioReflections: number;
  dilemmaResponses: number;
  debatesParticipated: number;
  frameworkModulesCompleted: number;
  frameworkTotalModules: number;
  quizMastery: {
    philosopher: QuizMasteryTally;
    framework: QuizMasteryTally;
    scifiAuthor: QuizMasteryTally;
    scifiMedia: QuizMasteryTally;
  };
  /** Per-chapter-quiz pass state, keyed by the quiz subjectId (= chapter slug).
   *  Used to compute "all chapter quizzes passed" for the textbook milestone. */
  chapterQuizzes?: Record<string, { passed: boolean; score: number }>;
  /** Whether the user has passed the final master textbook exam. */
  textbookFinalExamPassed?: boolean;
}

export interface CertificateDefinition {
  /** Stable key — used as the certificate's `curriculumId` for idempotent
   *  issuance. Must start with `achievement-` (so the tier resolver marks it
   *  official) and never change once shipped. */
  id: string;
  title: string;
  description: string;
  /** Human-readable earning rule, shown on cards + the certificate. */
  criteria: string;
  category: CertificateCategory;
  kind: CertificateKind;
  /** Reads the context and returns current progress + the target to hit. */
  metric: (ctx: CertificateContext) => { current: number; target: number };
}

const T = ACTIVITY_CERT_THRESHOLD;

/** The fixed "complete a group of activities" certificates. */
const BASE_CERTIFICATE_DEFINITIONS: CertificateDefinition[] = [
  {
    id: 'achievement-stories',
    title: 'Story Completion Certificate',
    description: 'Awarded for completing twelve interactive ethics stories.',
    criteria: `Complete ${T} stories`,
    category: 'stories',
    kind: 'count',
    metric: (c) => ({ current: c.storiesCompleted, target: T }),
  },
  {
    id: 'achievement-framework-explorer',
    title: 'Framework Explorer Master Certificate',
    description:
      'Awarded for completing all 12 Framework Explorer modules.',
    criteria: 'Complete all 12 Framework Explorer modules',
    category: 'framework',
    kind: 'completion',
    metric: (c) => ({
      current: c.frameworkModulesCompleted,
      target: c.frameworkTotalModules,
    }),
  },
  {
    id: 'achievement-studio-analysis',
    title: 'Studio Analysis Certificate',
    description: 'Awarded for completing twelve scenario analyses in the Studio.',
    criteria: `Complete ${T} Studio analyses`,
    category: 'studio-analysis',
    kind: 'count',
    metric: (c) => ({ current: c.scenariosAnalyzed, target: T }),
  },
  {
    id: 'achievement-studio-compare',
    title: 'Studio Compare Certificate',
    description:
      'Awarded for completing twelve perspective comparisons in the Studio.',
    criteria: `Complete ${T} Studio comparisons`,
    category: 'studio-compare',
    kind: 'count',
    metric: (c) => ({ current: c.comparesCompleted, target: T }),
  },
  {
    id: 'achievement-studio-reflect',
    title: 'Studio Reflect Certificate',
    description: 'Awarded for completing twelve reflections in the Studio.',
    criteria: `Complete ${T} Studio reflections`,
    category: 'studio-reflect',
    kind: 'count',
    metric: (c) => ({ current: c.studioReflections, target: T }),
  },
  {
    id: 'achievement-dilemmas',
    title: 'Ethical Dilemma Certificate',
    description: 'Awarded for responding to twelve ethical dilemmas.',
    criteria: `Respond to ${T} dilemmas`,
    category: 'dilemma',
    kind: 'count',
    metric: (c) => ({ current: c.dilemmaResponses, target: T }),
  },
  {
    id: 'achievement-debates',
    title: 'Debate Certificate',
    description: 'Awarded for participating in twelve debates.',
    criteria: `Participate in ${T} debates`,
    category: 'debate',
    kind: 'count',
    metric: (c) => ({ current: c.debatesParticipated, target: T }),
  },
  {
    id: 'achievement-quiz-philosopher',
    title: 'Philosopher Quiz Mastery Certificate',
    description: 'Awarded for completing and passing every philosopher quiz.',
    criteria: 'Pass all philosopher quizzes',
    category: 'quiz-philosopher',
    kind: 'quiz-mastery',
    metric: (c) => ({
      current: c.quizMastery.philosopher.passed,
      target: c.quizMastery.philosopher.total,
    }),
  },
  {
    id: 'achievement-quiz-framework',
    title: 'Ethical Framework Quiz Mastery Certificate',
    description:
      'Awarded for completing and passing every ethical-framework quiz.',
    criteria: 'Pass all ethical-framework quizzes',
    category: 'quiz-framework',
    kind: 'quiz-mastery',
    metric: (c) => ({
      current: c.quizMastery.framework.passed,
      target: c.quizMastery.framework.total,
    }),
  },
  {
    id: 'achievement-quiz-scifi-author',
    title: 'Science Fiction Author Quiz Mastery Certificate',
    description:
      'Awarded for completing and passing every science-fiction author quiz.',
    criteria: 'Pass all science-fiction author quizzes',
    category: 'quiz-scifi-author',
    kind: 'quiz-mastery',
    metric: (c) => ({
      current: c.quizMastery.scifiAuthor.passed,
      target: c.quizMastery.scifiAuthor.total,
    }),
  },
  {
    id: 'achievement-quiz-scifi-media',
    title: 'Science Fiction Media Quiz Mastery Certificate',
    description:
      'Awarded for completing and passing every science-fiction media quiz.',
    criteria: 'Pass all science-fiction media quizzes',
    category: 'quiz-scifi-media',
    kind: 'quiz-mastery',
    metric: (c) => ({
      current: c.quizMastery.scifiMedia.passed,
      target: c.quizMastery.scifiMedia.total,
    }),
  },
];

// ─── Textbook milestone certificate ──────────────────────────────────

/** Total textbook chapters (auto-detected) — drives the milestone target. */
const TEXTBOOK_TOTAL_CHAPTERS = chapters.length;

function passedChapterCount(ctx: CertificateContext): number {
  return Object.values(ctx.chapterQuizzes ?? {}).filter((q) => q.passed).length;
}

/**
 * The single major textbook certificate: earned only after passing every
 * chapter quiz AND the final master textbook exam (which itself unlocks only
 * once all chapters are passed). Issued by `recordFinalExamPass` as
 * `textbook-master`; the engine displays its progress and skips re-issuing it.
 * Individual chapter quizzes now earn badges/reports, not certificates.
 */
const TEXTBOOK_MASTER_CERTIFICATE: CertificateDefinition = {
  id: 'textbook-master',
  title: 'Textbook Master Certificate',
  description:
    'Awarded for passing every textbook chapter quiz and the final master textbook exam.',
  criteria: `Pass all ${TEXTBOOK_TOTAL_CHAPTERS} chapter quizzes and the final master exam`,
  category: 'textbook-master',
  kind: 'completion',
  metric: (ctx) => ({
    current:
      Math.min(passedChapterCount(ctx), TEXTBOOK_TOTAL_CHAPTERS) +
      (ctx.textbookFinalExamPassed ? 1 : 0),
    target: TEXTBOOK_TOTAL_CHAPTERS + 1,
  }),
};

/**
 * All milestone certificates: the fixed activity-milestone certificates plus
 * the one textbook master certificate. Individual activities earn
 * badges/reports instead — see src/app/actions/activity-reports.ts.
 */
export const CERTIFICATE_DEFINITIONS: CertificateDefinition[] = [
  ...BASE_CERTIFICATE_DEFINITIONS,
  TEXTBOOK_MASTER_CERTIFICATE,
];

/** Look up a definition by its stable id. */
export function getCertificateDefinition(
  id: string
): CertificateDefinition | undefined {
  return CERTIFICATE_DEFINITIONS.find((d) => d.id === id);
}
