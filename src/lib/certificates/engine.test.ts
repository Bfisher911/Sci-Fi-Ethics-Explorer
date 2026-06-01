import { describe, expect, it } from 'vitest';

import { evaluate, evaluateAll, earnedDefinitions } from './engine';
import {
  CERTIFICATE_DEFINITIONS,
  getCertificateDefinition,
  type CertificateContext,
} from './registry';

function ctx(overrides: Partial<CertificateContext> = {}): CertificateContext {
  return {
    storiesCompleted: 0,
    scenariosAnalyzed: 0,
    comparesCompleted: 0,
    studioReflections: 0,
    dilemmaResponses: 0,
    debatesParticipated: 0,
    frameworkModulesCompleted: 0,
    frameworkTotalModules: 12,
    quizMastery: {
      philosopher: { passed: 0, total: 0 },
      framework: { passed: 0, total: 18 },
      scifiAuthor: { passed: 0, total: 35 },
      scifiMedia: { passed: 0, total: 66 },
    },
    chapterQuizzes: {},
    textbookFinalExamPassed: false,
    ...overrides,
  };
}

/** A chapterQuizzes map with `n` passed chapter quizzes (slugs don't matter —
 *  the textbook milestone metric just counts passed entries). */
function passedChapters(n: number): Record<string, { passed: boolean; score: number }> {
  const m: Record<string, { passed: boolean; score: number }> = {};
  for (let i = 1; i <= n; i++) m[`ch-${i}`] = { passed: true, score: 90 };
  return m;
}

const stories = getCertificateDefinition('achievement-stories')!;
const framework = getCertificateDefinition('achievement-framework-explorer')!;
const philosopher = getCertificateDefinition('achievement-quiz-philosopher')!;
const author = getCertificateDefinition('achievement-quiz-scifi-author')!;

describe('count-based certificates', () => {
  it('is in-progress below the threshold', () => {
    const p = evaluate(stories, ctx({ storiesCompleted: 8 }));
    expect(p.earned).toBe(false);
    expect(p.current).toBe(8);
    expect(p.target).toBe(12);
    expect(p.percent).toBe(67);
  });

  it('is earned at the threshold', () => {
    const p = evaluate(stories, ctx({ storiesCompleted: 12 }));
    expect(p.earned).toBe(true);
    expect(p.percent).toBe(100);
  });

  it('clamps current to the target when exceeded', () => {
    const p = evaluate(stories, ctx({ storiesCompleted: 30 }));
    expect(p.current).toBe(12);
    expect(p.earned).toBe(true);
    expect(p.percent).toBe(100);
  });
});

describe('completion-based certificate', () => {
  it('earns only when all modules are complete', () => {
    expect(
      evaluate(framework, ctx({ frameworkModulesCompleted: 11 })).earned
    ).toBe(false);
    expect(
      evaluate(framework, ctx({ frameworkModulesCompleted: 12 })).earned
    ).toBe(true);
  });
});

describe('quiz-mastery certificates', () => {
  it('earns when every quiz in the category is passed', () => {
    const p = evaluate(
      author,
      ctx({
        quizMastery: {
          philosopher: { passed: 0, total: 0 },
          framework: { passed: 0, total: 18 },
          scifiAuthor: { passed: 35, total: 35 },
          scifiMedia: { passed: 0, total: 66 },
        },
      })
    );
    expect(p.earned).toBe(true);
  });

  it('is not earned with some quizzes unpassed', () => {
    const p = evaluate(
      author,
      ctx({
        quizMastery: {
          philosopher: { passed: 0, total: 0 },
          framework: { passed: 0, total: 18 },
          scifiAuthor: { passed: 34, total: 35 },
          scifiMedia: { passed: 0, total: 66 },
        },
      })
    );
    expect(p.earned).toBe(false);
  });

  it('NEVER treats an empty category (denominator 0) as mastered', () => {
    // No philosopher quizzes seeded → total 0 → must not be earned.
    const p = evaluate(philosopher, ctx());
    expect(p.target).toBe(0);
    expect(p.earned).toBe(false);
    expect(p.percent).toBe(0);
  });
});

describe('evaluateAll / earnedDefinitions', () => {
  it('has exactly the milestone certificates: 11 activity + 1 textbook', () => {
    expect(evaluateAll(ctx())).toHaveLength(CERTIFICATE_DEFINITIONS.length);
    expect(CERTIFICATE_DEFINITIONS).toHaveLength(12);
    const textbook = CERTIFICATE_DEFINITIONS.filter(
      (d) => d.category === 'textbook-master'
    );
    expect(textbook).toHaveLength(1);
    expect(textbook[0].id).toBe('textbook-master');
  });

  it('reports exactly the earned definitions', () => {
    const earned = earnedDefinitions(
      ctx({ storiesCompleted: 12, debatesParticipated: 20 })
    );
    const ids = earned.map((d) => d.id).sort();
    expect(ids).toEqual(['achievement-debates', 'achievement-stories']);
  });

  it('every certificate id uses an official-tier prefix or is the textbook master', () => {
    // 'achievement-' and 'textbook-master' both resolve to official tier.
    for (const def of CERTIFICATE_DEFINITIONS) {
      const ok = def.id.startsWith('achievement-') || def.id === 'textbook-master';
      expect(ok).toBe(true);
    }
  });
});

describe('textbook master milestone certificate', () => {
  const def = CERTIFICATE_DEFINITIONS.find((d) => d.id === 'textbook-master')!;

  it('is NOT earned with only the final exam (chapters not all passed)', () => {
    expect(
      evaluate(def, ctx({ textbookFinalExamPassed: true })).earned
    ).toBe(false);
  });

  it('is NOT earned with all chapters but no final exam', () => {
    expect(
      evaluate(def, ctx({ chapterQuizzes: passedChapters(20) })).earned
    ).toBe(false);
  });

  it('IS earned only with all chapter quizzes passed AND the final exam passed', () => {
    const p = evaluate(
      def,
      ctx({ chapterQuizzes: passedChapters(20), textbookFinalExamPassed: true })
    );
    expect(p.earned).toBe(true);
  });
});
