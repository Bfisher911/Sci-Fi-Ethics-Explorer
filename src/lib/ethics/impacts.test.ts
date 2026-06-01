import { describe, expect, it } from 'vitest';

import {
  impactsToFrameworkWeights,
  impactsToDeterministicAnalysis,
} from './impacts';
import type { ChoiceFrameworkImpact } from '@/types';

const impacts: ChoiceFrameworkImpact[] = [
  { framework: 'deontology', weight: 3, rationale: 'Duty of honesty.' },
  { framework: 'virtue-ethics', weight: 2, rationale: 'Honest character.' },
  { framework: 'ethics-of-care', weight: 1, rationale: 'Answers a real question.' },
];

describe('impactsToFrameworkWeights', () => {
  it('maps the 1–3 authored scale onto a 0–100 band', () => {
    const w = impactsToFrameworkWeights(impacts);
    expect(w.deontology).toBe(100);
    expect(w['virtue-ethics']).toBe(80);
    expect(w['ethics-of-care']).toBe(60);
  });

  it('keeps the strongest signal when a framework repeats', () => {
    const w = impactsToFrameworkWeights([
      { framework: 'utilitarianism', weight: 1, rationale: 'a' },
      { framework: 'utilitarianism', weight: 3, rationale: 'b' },
    ]);
    expect(w.utilitarianism).toBe(100);
  });

  it('returns an empty map for no impacts', () => {
    expect(impactsToFrameworkWeights([])).toEqual({});
    expect(impactsToFrameworkWeights(undefined)).toEqual({});
  });
});

describe('impactsToDeterministicAnalysis', () => {
  it('builds an analysis WITHOUT any AI call when impacts exist', () => {
    const analysis = impactsToDeterministicAnalysis(impacts, {
      promptText: 'A hard question.',
      userText: 'Tell the truth.',
    });
    expect(analysis).toBeDefined();
    // The strongest authored framework should lead.
    expect(analysis?.primaryFrameworks).toContain('deontology');
    expect(Array.isArray(analysis?.frameworkScores)).toBe(true);
  });

  it('returns undefined when there are no usable impacts', () => {
    expect(
      impactsToDeterministicAnalysis([], { promptText: 'x' })
    ).toBeUndefined();
  });
});
