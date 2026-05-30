// @vitest-environment node

/**
 * Tests for the ethical-journey scoring engine. These pin the core
 * acceptance criteria: decisions accumulate weighted scores across the
 * 18 frameworks, dominant/secondary frameworks rank correctly, legacy
 * framework IDs still resolve, and tensions surface only when both
 * sides have comparable weight.
 */

import { describe, it, expect } from 'vitest';
import {
  buildJourneyProfile,
  computeFrameworkScores,
  rankFrameworks,
  detectTensions,
  emptyScores,
  type EthicsJourneyEntry,
} from './journey';
import { FRAMEWORK_IDS } from './frameworks';

function entry(
  id: string,
  impacts: { framework: string; weight: number; rationale?: string }[],
  sequence = 1,
): EthicsJourneyEntry {
  return {
    id,
    storyId: 'story-1',
    storyTitle: 'Test Story',
    segmentId: id,
    prompt: 'A hard choice.',
    choiceText: 'The chosen option.',
    impacts: impacts.map((i) => ({ rationale: 'because', ...i })),
    interpretation: 'leans somewhere',
    sequence,
    recordedAt: new Date(2026, 0, sequence).toISOString(),
  };
}

describe('emptyScores', () => {
  it('has a zero entry for every one of the 18 frameworks', () => {
    const s = emptyScores();
    expect(Object.keys(s).length).toBe(18);
    expect(FRAMEWORK_IDS.every((id) => s[id] === 0)).toBe(true);
  });
});

describe('computeFrameworkScores', () => {
  it('sums weighted impacts across entries', () => {
    const entries = [
      entry('a', [{ framework: 'utilitarianism', weight: 2 }]),
      entry('b', [
        { framework: 'utilitarianism', weight: 1 },
        { framework: 'deontology', weight: 3 },
      ]),
    ];
    const scores = computeFrameworkScores(entries);
    expect(scores.utilitarianism).toBe(3);
    expect(scores.deontology).toBe(3);
    expect(scores['virtue-ethics']).toBe(0);
  });

  it('resolves legacy framework IDs to canonical ones', () => {
    const entries = [
      entry('a', [{ framework: 'care-ethics', weight: 2 }]),
      entry('b', [{ framework: 'social-contract', weight: 1 }]),
      entry('c', [{ framework: 'contractarian', weight: 1 }]),
    ];
    const scores = computeFrameworkScores(entries);
    expect(scores['ethics-of-care']).toBe(2);
    // both 'social-contract' and 'contractarian' map to social-contract-theory
    expect(scores['social-contract-theory']).toBe(2);
  });

  it('ignores unrecognized framework strings without throwing', () => {
    const entries = [entry('a', [{ framework: 'not-a-framework', weight: 5 }])];
    const scores = computeFrameworkScores(entries);
    expect(Object.values(scores).reduce((x, y) => x + y, 0)).toBe(0);
  });
});

describe('rankFrameworks', () => {
  it('returns all 18 frameworks sorted by score descending', () => {
    const scores = emptyScores();
    scores.utilitarianism = 5;
    scores.deontology = 3;
    const ranked = rankFrameworks(scores);
    expect(ranked.length).toBe(18);
    expect(ranked[0].id).toBe('utilitarianism');
    expect(ranked[1].id).toBe('deontology');
    expect(ranked[0].share).toBeCloseTo(5 / 8);
  });
});

describe('detectTensions', () => {
  it('flags a tension when both opposing frameworks have comparable weight', () => {
    const scores = emptyScores();
    scores.utilitarianism = 3;
    scores.deontology = 2;
    const tensions = detectTensions(scores);
    const pair = tensions.find(
      (t) =>
        (t.a === 'utilitarianism' && t.b === 'deontology') ||
        (t.a === 'deontology' && t.b === 'utilitarianism'),
    );
    expect(pair).toBeTruthy();
  });

  it('does NOT flag a tension when one side dwarfs the other (>4x)', () => {
    const scores = emptyScores();
    scores.utilitarianism = 10;
    scores.deontology = 1;
    const tensions = detectTensions(scores);
    expect(tensions.length).toBe(0);
  });

  it('does NOT flag a tension when one side is zero', () => {
    const scores = emptyScores();
    scores.utilitarianism = 5;
    const tensions = detectTensions(scores);
    expect(tensions.length).toBe(0);
  });
});

describe('buildJourneyProfile', () => {
  it('produces dominant and secondary tiers from a journey', () => {
    const entries = [
      entry('a', [{ framework: 'utilitarianism', weight: 3 }], 1),
      entry('b', [{ framework: 'deontology', weight: 2 }], 2),
      entry('c', [{ framework: 'virtue-ethics', weight: 2 }], 3),
      entry('d', [{ framework: 'ethics-of-care', weight: 1 }], 4),
    ];
    const profile = buildJourneyProfile(entries);
    expect(profile.totalDecisions).toBe(4);
    expect(profile.totalWeight).toBe(8);
    expect(profile.dominant[0].id).toBe('utilitarianism');
    expect(profile.dominant.length).toBeGreaterThanOrEqual(1);
    expect(profile.dominant.length).toBeLessThanOrEqual(3);
  });

  it('handles an empty journey without throwing', () => {
    const profile = buildJourneyProfile([]);
    expect(profile.totalDecisions).toBe(0);
    expect(profile.dominant).toEqual([]);
    expect(profile.tensions).toEqual([]);
  });
});
