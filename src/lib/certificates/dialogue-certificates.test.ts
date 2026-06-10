import { describe, expect, it } from 'vitest';

import {
  CERTIFICATE_DEFINITIONS,
  DIALOGUE_CATEGORY_CERT_THRESHOLD,
  type CertificateContext,
} from './registry';
import { evaluate } from './engine';

const D = DIALOGUE_CATEGORY_CERT_THRESHOLD;

function ctx(
  dialogues: Partial<NonNullable<CertificateContext['dialogueAssessmentsPassed']>>
): CertificateContext {
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
      framework: { passed: 0, total: 0 },
      scifiAuthor: { passed: 0, total: 0 },
      scifiMedia: { passed: 0, total: 0 },
    },
    dialogueAssessmentsPassed: {
      philosopher: 0,
      scifiAuthor: 0,
      scifiMedia: 0,
      framework: 0,
      ...dialogues,
    },
  };
}

function def(id: string) {
  const d = CERTIFICATE_DEFINITIONS.find((x) => x.id === id);
  if (!d) throw new Error(`Missing certificate definition: ${id}`);
  return d;
}

describe('dialogue Explorer certificates', () => {
  it('registers the four category certificates and the master', () => {
    expect(def('achievement-dialogues-philosopher').category).toBe('dialogue');
    expect(def('achievement-dialogues-scifi-author').category).toBe('dialogue');
    expect(def('achievement-dialogues-scifi-media').category).toBe('dialogue');
    expect(def('achievement-dialogues-framework').category).toBe('dialogue');
    expect(def('achievement-dialogues-master').category).toBe('dialogue');
  });

  it('earns a category certificate at the threshold', () => {
    const d = def('achievement-dialogues-philosopher');
    expect(evaluate(d, ctx({ philosopher: D - 1 })).earned).toBe(false);
    expect(evaluate(d, ctx({ philosopher: D })).earned).toBe(true);
  });

  it('handles a missing dialogue context gracefully', () => {
    const base = ctx({});
    delete (base as unknown as Record<string, unknown>).dialogueAssessmentsPassed;
    const p = evaluate(def('achievement-dialogues-philosopher'), base);
    expect(p.earned).toBe(false);
    expect(p.current).toBe(0);
  });

  it('master requires the threshold in EVERY category', () => {
    const master = def('achievement-dialogues-master');
    // Piling all passes into one category must not earn the master.
    expect(
      evaluate(master, ctx({ philosopher: D * 4 })).earned
    ).toBe(false);
    expect(
      evaluate(
        master,
        ctx({ philosopher: D, scifiAuthor: D, scifiMedia: D, framework: D })
      ).earned
    ).toBe(true);
    expect(
      evaluate(
        master,
        ctx({ philosopher: D, scifiAuthor: D, scifiMedia: D, framework: D - 1 })
      ).earned
    ).toBe(false);
  });

  it('uses achievement-prefixed ids so the tier resolver marks them official', () => {
    for (const d of CERTIFICATE_DEFINITIONS.filter((x) => x.category === 'dialogue')) {
      expect(d.id.startsWith('achievement-')).toBe(true);
    }
  });
});
