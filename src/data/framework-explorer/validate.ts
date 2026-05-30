/**
 * Framework coverage validator.
 *
 * Pure checks the assessment must satisfy: 12 modules of 20 questions,
 * every question with options, every option mapped to valid canonical
 * frameworks, no unknown framework labels, full framework coverage
 * across the set, and a diverse spread per module. Run by the unit
 * test (validate.test.ts) and available to an admin "validate" action.
 */

import {
  FRAMEWORK_IDS,
  normalizeFrameworkId,
  type FrameworkId,
} from '@/lib/ethics/frameworks';
import {
  FRAMEWORK_MODULES,
  TOTAL_MODULES,
  QUESTIONS_PER_MODULE,
} from './index';

export interface ValidationIssue {
  level: 'error' | 'warning';
  where: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  /** framework id → number of options that reference it across the set. */
  coverage: Record<string, number>;
  /** Frameworks (canonical) that never appear in any option. */
  uncovered: FrameworkId[];
  totalQuestions: number;
}

/** Minimum distinct frameworks a single module should touch. */
const MIN_FRAMEWORKS_PER_MODULE = 8;
/** Minimum distinct frameworks every option set should map onto. */
const MIN_OPTIONS_PER_QUESTION = 2;

export function validateFrameworkExplorer(): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const coverage: Record<string, number> = {};
  for (const id of FRAMEWORK_IDS) coverage[id] = 0;

  if (FRAMEWORK_MODULES.length !== TOTAL_MODULES) {
    errors.push({
      level: 'error',
      where: 'modules',
      message: `Expected ${TOTAL_MODULES} modules, found ${FRAMEWORK_MODULES.length}.`,
    });
  }

  const seenModuleNumbers = new Set<number>();
  let totalQuestions = 0;

  for (const mod of FRAMEWORK_MODULES) {
    if (seenModuleNumbers.has(mod.moduleNumber)) {
      errors.push({
        level: 'error',
        where: mod.id,
        message: `Duplicate module number ${mod.moduleNumber}.`,
      });
    }
    seenModuleNumbers.add(mod.moduleNumber);

    if (mod.questions.length !== QUESTIONS_PER_MODULE) {
      errors.push({
        level: 'error',
        where: mod.id,
        message: `Module ${mod.moduleNumber} has ${mod.questions.length} questions, expected ${QUESTIONS_PER_MODULE}.`,
      });
    }

    const moduleFrameworks = new Set<FrameworkId>();
    const seenQuestionIds = new Set<string>();

    for (const q of mod.questions) {
      totalQuestions++;
      if (seenQuestionIds.has(q.id)) {
        errors.push({
          level: 'error',
          where: q.id,
          message: `Duplicate question id ${q.id}.`,
        });
      }
      seenQuestionIds.add(q.id);

      if (!q.questionText || q.questionText.trim().length < 20) {
        errors.push({
          level: 'error',
          where: q.id,
          message: 'Question text missing or too short.',
        });
      }
      if (!q.answerOptions || q.answerOptions.length < 2) {
        errors.push({
          level: 'error',
          where: q.id,
          message: 'Question must have at least 2 answer options.',
        });
        continue;
      }

      const questionFrameworks = new Set<FrameworkId>();
      const seenOptionIds = new Set<string>();
      for (const opt of q.answerOptions) {
        if (seenOptionIds.has(opt.id)) {
          errors.push({
            level: 'error',
            where: `${q.id}.${opt.id}`,
            message: `Duplicate option id ${opt.id}.`,
          });
        }
        seenOptionIds.add(opt.id);

        const keys = Object.keys(opt.frameworkWeights || {});
        if (keys.length === 0) {
          errors.push({
            level: 'error',
            where: `${q.id}.${opt.id}`,
            message: 'Answer option has no framework mappings.',
          });
        }
        for (const rawKey of keys) {
          const canonical = normalizeFrameworkId(rawKey);
          if (!canonical) {
            errors.push({
              level: 'error',
              where: `${q.id}.${opt.id}`,
              message: `Unknown framework key "${rawKey}".`,
            });
            continue;
          }
          const weight = opt.frameworkWeights[rawKey];
          if (typeof weight !== 'number' || weight <= 0) {
            errors.push({
              level: 'error',
              where: `${q.id}.${opt.id}`,
              message: `Framework "${rawKey}" has invalid weight ${weight}.`,
            });
          }
          coverage[canonical] = (coverage[canonical] ?? 0) + 1;
          questionFrameworks.add(canonical);
          moduleFrameworks.add(canonical);
        }
      }

      if (questionFrameworks.size < MIN_OPTIONS_PER_QUESTION) {
        warnings.push({
          level: 'warning',
          where: q.id,
          message: `Question maps to only ${questionFrameworks.size} distinct framework(s).`,
        });
      }
    }

    if (moduleFrameworks.size < MIN_FRAMEWORKS_PER_MODULE) {
      warnings.push({
        level: 'warning',
        where: mod.id,
        message: `Module ${mod.moduleNumber} touches only ${moduleFrameworks.size} frameworks (want >= ${MIN_FRAMEWORKS_PER_MODULE}).`,
      });
    }
  }

  const uncovered = FRAMEWORK_IDS.filter((id) => coverage[id] === 0);
  for (const id of uncovered) {
    errors.push({
      level: 'error',
      where: 'coverage',
      message: `Framework "${id}" is never referenced by any answer option.`,
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    coverage,
    uncovered,
    totalQuestions,
  };
}
