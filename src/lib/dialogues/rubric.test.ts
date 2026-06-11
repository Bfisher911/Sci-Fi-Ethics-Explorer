import { describe, expect, it } from 'vitest';

import {
  RUBRIC_CRITERIA,
  computeAssessmentResult,
  normalizeRubricScores,
  type RubricScores,
} from './rubric';

function scores(value: number): RubricScores {
  return {
    understanding: value,
    application: value,
    tradeoffs: value,
    reflection: value,
    evidence: value,
    transfer: value,
  };
}

describe('normalizeRubricScores', () => {
  it('fills missing criteria with 0', () => {
    const out = normalizeRubricScores({ understanding: 3 });
    expect(out.understanding).toBe(3);
    expect(out.application).toBe(0);
    expect(out.transfer).toBe(0);
  });

  it('clamps out-of-range and non-numeric values', () => {
    const out = normalizeRubricScores({
      understanding: 99,
      application: -2,
      tradeoffs: 'strong',
      reflection: 2.6,
    });
    expect(out.understanding).toBe(3);
    expect(out.application).toBe(0);
    expect(out.tradeoffs).toBe(0);
    expect(out.reflection).toBe(3);
  });

  it('handles null input', () => {
    const out = normalizeRubricScores(null);
    for (const c of RUBRIC_CRITERIA) expect(out[c.id]).toBe(0);
  });
});

describe('computeAssessmentResult', () => {
  it('passes with all-adequate scores and no critical misunderstanding', () => {
    const r = computeAssessmentResult(scores(2), false);
    expect(r.passed).toBe(true);
    expect(r.scorePercent).toBe(67);
    expect(r.adequateCriteria).toBe(6);
  });

  it('gives 100% for all-strong scores', () => {
    const r = computeAssessmentResult(scores(3), false);
    expect(r.scorePercent).toBe(100);
    expect(r.passed).toBe(true);
  });

  it('fails on critical misunderstanding even with strong scores', () => {
    const r = computeAssessmentResult(scores(3), true);
    expect(r.passed).toBe(false);
  });

  it('fails when any criterion is missing (0)', () => {
    const s = { ...scores(3), transfer: 0 };
    const r = computeAssessmentResult(s, false);
    expect(r.passed).toBe(false);
    expect(r.missingCriteria).toEqual(['transfer']);
  });

  it('fails when fewer than 4 criteria reach adequate', () => {
    // 3 adequate, 3 emerging — below the default minimum of 4.
    const s: RubricScores = {
      understanding: 2,
      application: 2,
      tradeoffs: 2,
      reflection: 1,
      evidence: 1,
      transfer: 1,
    };
    const r = computeAssessmentResult(s, false);
    expect(r.adequateCriteria).toBe(3);
    expect(r.passed).toBe(false);
  });

  it('passes with 4 adequate + 2 emerging (most-categories rule)', () => {
    const s: RubricScores = {
      understanding: 2,
      application: 2,
      tradeoffs: 2,
      reflection: 2,
      evidence: 1,
      transfer: 1,
    };
    const r = computeAssessmentResult(s, false);
    expect(r.passed).toBe(true);
  });

  it('respects a custom minAdequateCriteria option', () => {
    const s: RubricScores = {
      understanding: 2,
      application: 2,
      tradeoffs: 2,
      reflection: 1,
      evidence: 1,
      transfer: 1,
    };
    expect(
      computeAssessmentResult(s, false, { minAdequateCriteria: 3 }).passed
    ).toBe(true);
  });

  it('fails all-zero scores', () => {
    const r = computeAssessmentResult(scores(0), false);
    expect(r.passed).toBe(false);
    expect(r.scorePercent).toBe(0);
    expect(r.missingCriteria).toHaveLength(6);
  });
});
