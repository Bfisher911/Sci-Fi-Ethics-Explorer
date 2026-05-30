/**
 * Framework Explorer — types for the 12-module progressive ethics
 * self-assessment (240 scenario questions).
 *
 * Framework keys in `frameworkWeights` are canonical FrameworkIds (see
 * src/lib/ethics/frameworks.ts). They are typed as string here to keep
 * the data files import-light; the coverage validator + scoring layer
 * normalize and validate them against the canonical 22-framework set.
 */

/** Technology-ethics topic tags used for the profile's category breakdown. */
export type TechnologyTopic =
  | 'Privacy and Convenience'
  | 'Data and Consent'
  | 'AI and Automation'
  | 'Design and Attention'
  | 'Platforms and Speech'
  | 'Work and Labor'
  | 'Education and Creativity'
  | 'Security and Safety'
  | 'Identity and Enhancement'
  | 'Environment and Global'
  | 'Leadership and Institutions'
  | 'Integrative';

export interface FrameworkAnswerOption {
  /** Option id, unique within the question (e.g. 'a','b','c','d'). */
  id: string;
  text: string;
  /**
   * Weighted mapping onto one or more canonical frameworks. Keys are
   * FrameworkIds; values are small positive weights (1–3). NEVER shown
   * to the student before they answer.
   */
  frameworkWeights: Record<string, number>;
}

export interface FrameworkQuestion {
  id: string;
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  /** Technology-ethics topic for the category breakdown. */
  technologyTopic: TechnologyTopic;
  /** 1 (everyday) → 5 (hardest integrative). */
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  questionText: string;
  /** Optional extra framing shown above the question. */
  scenarioContext?: string;
  answerOptions: FrameworkAnswerOption[];
  /** Neutral, non-judgmental note shown after answering (optional). */
  reflectionText?: string;
  active?: boolean;
  version?: number;
}

export interface FrameworkModule {
  id: string;
  moduleNumber: number;
  title: string;
  /** One-line description for the module card. */
  description: string;
  /** Short "what this focuses on" preview for the card. */
  focus: string;
  technologyTopic: TechnologyTopic;
  questions: FrameworkQuestion[];
}

/** A single recorded answer to a Framework Explorer question. */
export interface FrameworkResponse {
  questionId: string;
  moduleId: string;
  moduleNumber: number;
  optionId: string;
  /** Canonical framework → weight, copied from the chosen option. */
  frameworkWeights: Record<string, number>;
  technologyTopic: TechnologyTopic;
  recordedAt: string;
}

/** Per-user Framework Explorer progress. */
export interface FrameworkExplorerProgress {
  userId: string;
  /** Module numbers the user has completed (all 20 answered). */
  completedModules: number[];
  /** Map of moduleNumber → ISO completion date. */
  moduleCompletedAt: Record<number, string>;
  /** Map of moduleNumber → number of questions answered so far. */
  moduleProgress: Record<number, number>;
  /** Highest module number currently unlocked (1-based). */
  unlockedThrough: number;
  updatedAt?: string;
}
