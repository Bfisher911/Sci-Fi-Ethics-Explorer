// @vitest-environment node

/**
 * Integrity tests for the newly-authored content (6 stories, 9 dilemmas,
 * 9 structured debates). These pin the acceptance criteria: real branching
 * with no dead links, every choice/response/position mapped to a VALID
 * ethical framework (catches typos), and complete debate briefs.
 */

import { describe, it, expect } from 'vitest';
import { EXTRA_STORIES } from './stories-extra';
import { NEW_DILEMMAS } from './dilemmas';
import { NEW_DEBATES } from './debates';
import { normalizeFrameworkId } from '@/lib/ethics/frameworks';

const valid = (fw: string) => Boolean(normalizeFrameworkId(fw));

describe('new stories (stories-extra)', () => {
  it('has exactly 6 interactive stories with unique ids', () => {
    expect(EXTRA_STORIES.length).toBe(6);
    const ids = EXTRA_STORIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(6);
    expect(EXTRA_STORIES.every((s) => s.isInteractive)).toBe(true);
  });

  for (const story of EXTRA_STORIES) {
    describe(story.title, () => {
      const segIds = new Set(story.segments.map((s) => s.id));

      it('every choice routes to an existing segment', () => {
        for (const seg of story.segments) {
          for (const choice of seg.choices ?? []) {
            if (choice.nextSegmentId) {
              expect(segIds.has(choice.nextSegmentId)).toBe(true);
            }
          }
        }
      });

      it('every choice maps to at least one VALID framework', () => {
        for (const seg of story.segments) {
          for (const choice of seg.choices ?? []) {
            expect((choice.frameworks ?? []).length).toBeGreaterThan(0);
            for (const impact of choice.frameworks ?? []) {
              expect(valid(impact.framework)).toBe(true);
              expect(impact.rationale.length).toBeGreaterThan(10);
              expect(impact.weight).toBeGreaterThanOrEqual(1);
            }
          }
        }
      });

      it('has multiple decision points and multiple endings', () => {
        const decisions = story.segments.filter((s) => (s.choices?.length ?? 0) > 0);
        const endings = story.segments.filter((s) => s.reflectionTrigger);
        expect(decisions.length).toBeGreaterThanOrEqual(3);
        expect(endings.length).toBeGreaterThanOrEqual(2);
        // Each decision offers at least 3 options.
        for (const d of decisions) expect(d.choices!.length).toBeGreaterThanOrEqual(3);
      });
    });
  }
});

describe('new dilemmas', () => {
  it('has at least 12 published dilemmas with unique slugs', () => {
    expect(NEW_DILEMMAS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(NEW_DILEMMAS.map((d) => d.slug)).size).toBe(
      NEW_DILEMMAS.length,
    );
    expect(NEW_DILEMMAS.every((d) => d.visibilityStatus === 'published')).toBe(true);
  });

  for (const d of NEW_DILEMMAS) {
    it(`${d.title}: every choice has valid, non-empty frameworkWeights`, () => {
      expect(d.choices.length).toBeGreaterThanOrEqual(3);
      expect(d.backgroundContext.length).toBeGreaterThan(80);
      expect(d.aiScoringPrompt.length).toBeGreaterThan(40);
      expect(d.reflectionPrompt.length).toBeGreaterThan(20);
      for (const c of d.choices) {
        const entries = Object.entries(c.frameworkWeights);
        expect(entries.length).toBeGreaterThan(0);
        for (const [fw, w] of entries) {
          expect(valid(fw)).toBe(true);
          expect(w).toBeGreaterThan(0);
        }
      }
    });
  }
});

describe('new debates', () => {
  it('has exactly 9 debates, each with a complete brief', () => {
    expect(NEW_DEBATES.length).toBe(9);
    expect(new Set(NEW_DEBATES.map((d) => d.id)).size).toBe(9);
  });

  for (const debate of NEW_DEBATES) {
    it(`${debate.title}: brief is complete and framework-mapped`, () => {
      const b = debate.brief!;
      expect(b).toBeTruthy();
      expect(b.background.length).toBeGreaterThan(80);
      expect(b.centralQuestion.length).toBeGreaterThan(20);
      expect(b.positions.length).toBeGreaterThanOrEqual(2);
      expect(b.openingPrompts.length).toBeGreaterThanOrEqual(2);
      expect(b.rebuttalPrompts.length).toBeGreaterThanOrEqual(2);
      expect(b.closingPrompt.length).toBeGreaterThan(20);
      expect(b.roleCards.length).toBeGreaterThanOrEqual(2);
      expect(b.deliverable.length).toBeGreaterThan(20);
      for (const fw of b.frameworks) expect(valid(fw)).toBe(true);
      for (const pos of b.positions) {
        expect(pos.argumentsFor.length).toBeGreaterThanOrEqual(2);
        expect(pos.counterarguments.length).toBeGreaterThanOrEqual(1);
        expect(pos.frameworks.length).toBeGreaterThanOrEqual(1);
        for (const fw of pos.frameworks) expect(valid(fw)).toBe(true);
      }
    });
  }
});
