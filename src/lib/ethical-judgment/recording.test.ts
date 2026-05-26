// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  buildDeterministicEthicalAnalysis,
  normalizeAffectsProfile,
  recordEthicalJudgmentEvent,
} from './recording';

describe('ethical judgment recording', () => {
  function collectUndefinedPaths(value: unknown, path = 'event'): string[] {
    if (!value || typeof value !== 'object') return [];
    if (Array.isArray(value)) {
      return value.flatMap((item, index) => collectUndefinedPaths(item, `${path}[${index}]`));
    }
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      child === undefined
        ? [`${path}.${key}`]
        : collectUndefinedPaths(child, `${path}.${key}`),
    );
  }

  it('expands deterministic framework mappings across every active framework', () => {
    const analysis = buildDeterministicEthicalAnalysis({
      frameworkWeights: {
        utilitarianism: 1,
        deontology: 0.25,
        'social-contract': 0.5,
      },
      userText: 'I would accept the tradeoff because it saves the most lives.',
      promptText: 'Which pod should the rescue system save?',
      confidence: 0.72,
    });

    expect(analysis.frameworkScores).toHaveLength(18);
    expect(analysis.primaryFrameworks).toEqual(['utilitarianism']);
    expect(
      analysis.frameworkScores.find((score) => score.frameworkId === 'social-contract-theory')?.score,
    ).toBe(50);
    expect(analysis.reasoningSummary).toContain('response tends to emphasize');
    expect(analysis.reasoningSummary).not.toContain('You are');
  });

  it('keeps factual knowledge checks out of the ethical profile by default', () => {
    expect(normalizeAffectsProfile('knowledge_quiz', true)).toBe(false);
    expect(normalizeAffectsProfile('media_scenario_reflection', true)).toBe(true);
  });

  it('stores the raw event and updates the aggregate profile through dependencies', async () => {
    const writtenEvents: unknown[] = [];
    let writtenProfile: unknown = null;

    const result = await recordEthicalJudgmentEvent(
      {
        userId: 'user-1',
        interactionType: 'story_choice',
        sourceContentType: 'story',
        sourceContentId: 'story-1',
        sourceTitle: 'The Test Ship',
        promptText: 'Save one pod or five pods?',
        userChoice: 'Save the five pods.',
        frameworkWeights: { utilitarianism: 1, deontology: 0.2 },
        affectsProfile: true,
        activityContext: 'story',
      },
      {
        writeEvent: async (event) => {
          writtenEvents.push(event);
        },
        loadUserEvents: async () => writtenEvents as any,
        writeProfile: async (profile) => {
          writtenProfile = profile;
        },
      },
    );

    expect(result.event.id).toMatch(/^ethical-event-/);
    expect(writtenEvents).toHaveLength(1);
    expect(writtenProfile).toMatchObject({
      userId: 'user-1',
      eventCount: 1,
    });
  });

  it('omits undefined optional fields before passing events to storage', async () => {
    let writtenEvent: unknown = null;

    await recordEthicalJudgmentEvent(
      {
        userId: 'user-1',
        interactionType: 'media_scenario_reflection',
        sourceContentType: 'scifi_media',
        sourceContentId: 'blade-runner',
        sourceTitle: 'Blade Runner',
        promptText: 'What should the team do first?',
        selectedOptionId: 'release-with-monitoring',
        userChoice: 'Release it in a limited pilot.',
        frameworkWeights: { utilitarianism: 80 },
        affectsProfile: true,
        activityContext: 'media',
        rawResponse: {
          selectedOptionId: 'release-with-monitoring',
          optionalComment: undefined,
        },
      },
      {
        writeEvent: async (event) => {
          writtenEvent = event;
        },
        loadUserEvents: async () => (writtenEvent ? [writtenEvent as any] : []),
        writeProfile: async () => {},
      },
    );

    expect(collectUndefinedPaths(writtenEvent)).toEqual([]);
  });
});
