// @vitest-environment node

/**
 * Validates the full 240-question Framework Explorer bank: structure,
 * framework-key validity, coverage, and the progressive-unlock rule.
 */

import { describe, it, expect } from 'vitest';
import { validateFrameworkExplorer } from './validate';
import {
  FRAMEWORK_MODULES,
  TOTAL_MODULES,
  getAllQuestions,
  unlockedModuleNumbers,
  isModuleUnlocked,
} from './index';
import { FRAMEWORK_IDS } from '@/lib/ethics/frameworks';

describe('Framework Explorer structure', () => {
  it('has exactly 12 modules', () => {
    expect(TOTAL_MODULES).toBe(12);
    expect(FRAMEWORK_MODULES.length).toBe(12);
  });

  it('has 20 questions per module (240 total)', () => {
    for (const m of FRAMEWORK_MODULES) {
      expect(m.questions.length).toBe(20);
    }
    expect(getAllQuestions().length).toBe(240);
  });

  it('module numbers are 1..12 in order', () => {
    expect(FRAMEWORK_MODULES.map((m) => m.moduleNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });

  it('every question has a unique id', () => {
    const ids = getAllQuestions().map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every question has 2+ options each with framework mappings', () => {
    for (const q of getAllQuestions()) {
      expect(q.answerOptions.length).toBeGreaterThanOrEqual(2);
      for (const o of q.answerOptions) {
        expect(Object.keys(o.frameworkWeights).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('validateFrameworkExplorer', () => {
  const result = validateFrameworkExplorer();

  it('passes with no errors', () => {
    if (!result.ok) {
      // Surface the first few errors for a readable failure.
      // eslint-disable-next-line no-console
      console.error(result.errors.slice(0, 10));
    }
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('covers all 22 canonical frameworks', () => {
    expect(result.uncovered).toEqual([]);
    for (const id of FRAMEWORK_IDS) {
      expect(result.coverage[id]).toBeGreaterThan(0);
    }
  });

  it('counts 240 questions', () => {
    expect(result.totalQuestions).toBe(240);
  });
});

describe('progressive unlock', () => {
  it('module 1 is always unlocked', () => {
    expect(isModuleUnlocked(1, [])).toBe(true);
    expect(unlockedModuleNumbers([])).toEqual([1]);
  });

  it('module N unlocks only after N-1 is completed', () => {
    expect(isModuleUnlocked(2, [])).toBe(false);
    expect(isModuleUnlocked(2, [1])).toBe(true);
    expect(isModuleUnlocked(3, [1])).toBe(false);
    expect(isModuleUnlocked(3, [1, 2])).toBe(true);
  });

  it('unlocks contiguously and stops at the first gap', () => {
    // Completed 1,2,3 → unlocked through 4.
    expect(unlockedModuleNumbers([1, 2, 3])).toEqual([1, 2, 3, 4]);
    // A gap (missing 2) stops the chain at 2.
    expect(unlockedModuleNumbers([1, 3, 4])).toEqual([1, 2]);
  });

  it('completing all 11 prerequisites unlocks module 12', () => {
    expect(isModuleUnlocked(12, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(
      true,
    );
  });
});
