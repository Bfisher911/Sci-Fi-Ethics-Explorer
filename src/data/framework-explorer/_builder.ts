/**
 * Module builder — expands lightweight question "seeds" into fully
 * normalized FrameworkQuestion objects so the 12 module data files stay
 * focused on content rather than repeating moduleId / moduleNumber /
 * ids on every question.
 */

import type {
  FrameworkModule,
  FrameworkQuestion,
  TechnologyTopic,
} from '@/types/framework-explorer';

export interface OptionSeed {
  id: string;
  text: string;
  frameworkWeights: Record<string, number>;
}

export interface QuestionSeed {
  questionText: string;
  /** Defaults to the module's topic if omitted. */
  technologyTopic?: TechnologyTopic;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  scenarioContext?: string;
  reflectionText?: string;
  options: OptionSeed[];
}

export interface ModuleMeta {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  focus: string;
  technologyTopic: TechnologyTopic;
}

export function buildModule(
  meta: ModuleMeta,
  seeds: QuestionSeed[],
): FrameworkModule {
  const pad = (n: number) => String(n).padStart(2, '0');
  const questions: FrameworkQuestion[] = seeds.map((seed, i) => ({
    id: `m${pad(meta.moduleNumber)}_q${pad(i + 1)}`,
    moduleId: meta.id,
    moduleNumber: meta.moduleNumber,
    moduleTitle: meta.title,
    technologyTopic: seed.technologyTopic ?? meta.technologyTopic,
    difficultyLevel: seed.difficultyLevel,
    questionText: seed.questionText,
    scenarioContext: seed.scenarioContext,
    answerOptions: seed.options.map((o) => ({
      id: o.id,
      text: o.text,
      frameworkWeights: o.frameworkWeights,
    })),
    reflectionText: seed.reflectionText,
    active: true,
    version: 1,
  }));
  return {
    id: meta.id,
    moduleNumber: meta.moduleNumber,
    title: meta.title,
    description: meta.description,
    focus: meta.focus,
    technologyTopic: meta.technologyTopic,
    questions,
  };
}
