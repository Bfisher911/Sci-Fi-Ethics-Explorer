// @vitest-environment node

/**
 * Integrity tests for the hand-authored philosopher comprehension quizzes.
 * Pins the acceptance criteria: every philosopher has a quiz, each quiz is
 * well-formed (5 questions, 4 options, a valid correct index, an explanation,
 * a known difficulty), ids are canonical and unique, and the answer key isn't
 * degenerate (not every question keyed to the same option).
 */

import { describe, it, expect } from 'vitest';
import { philosopherData } from './philosophers';
import { philosopherQuizzes, getStaticPhilosopherQuiz } from './philosopher-quizzes';

const DIFFICULTIES = new Set(['recall', 'conceptual', 'applied']);

describe('philosopher quizzes', () => {
  it('provides a quiz for every philosopher', () => {
    for (const p of philosopherData) {
      expect(getStaticPhilosopherQuiz(p.id), `missing quiz for ${p.id}`).not.toBeNull();
    }
    expect(philosopherQuizzes.length).toBe(philosopherData.length);
  });

  it('uses canonical, unique quiz + question ids', () => {
    const quizIds = new Set<string>();
    for (const q of philosopherQuizzes) {
      expect(q.id).toBe(`philosopher-${q.subjectId}`);
      expect(q.subjectType).toBe('philosopher');
      expect(quizIds.has(q.id)).toBe(false);
      quizIds.add(q.id);

      const qIds = new Set(q.questions.map((x) => x.id));
      expect(qIds.size).toBe(q.questions.length);
    }
  });

  it('has well-formed questions', () => {
    for (const q of philosopherQuizzes) {
      expect(q.questions.length, `${q.subjectId} question count`).toBe(5);
      for (const question of q.questions) {
        expect(question.options.length, `${q.subjectId} options`).toBe(4);
        expect(question.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswerIndex).toBeLessThanOrEqual(3);
        expect(question.prompt.trim().length).toBeGreaterThan(0);
        expect(question.explanation.trim().length).toBeGreaterThan(0);
        expect(DIFFICULTIES.has(question.difficulty as string)).toBe(true);
        // options must be distinct, non-empty strings
        const opts = new Set(question.options.map((o) => o.trim()));
        expect(opts.size, `${q.subjectId} distinct options`).toBe(4);
      }
      // answer key isn't all the same option
      const distinctKeys = new Set(q.questions.map((x) => x.correctAnswerIndex));
      expect(distinctKeys.size, `${q.subjectId} degenerate answer key`).toBeGreaterThan(1);
    }
  });
});
