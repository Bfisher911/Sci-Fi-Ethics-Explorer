// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { scifiMediaData } from './scifi-media';
import { getScenarioReflectionForMedia } from './scifi-media-scenario-reflections';
import { getActiveFrameworkIdSet } from '@/lib/ethical-framework-registry';

describe('Sci-Fi Media ethical scenario reflections', () => {
  it('provides at least three profile-affecting scenario questions for every media entry', () => {
    const activeFrameworkIds = getActiveFrameworkIdSet();

    for (const media of scifiMediaData) {
      const reflection = getScenarioReflectionForMedia(media);

      expect(reflection.mediaId).toBe(media.id);
      expect(reflection.questions.length).toBeGreaterThanOrEqual(3);

      for (const question of reflection.questions) {
        expect(question.affectsEthicalProfile).toBe(true);
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(question.prompt).not.toMatch(/protagonist|hero chose|main character did/i);

        for (const option of question.options) {
          for (const frameworkId of Object.keys(option.frameworkWeights)) {
            expect(activeFrameworkIds.has(frameworkId)).toBe(true);
          }
        }
      }
    }
  });
});
