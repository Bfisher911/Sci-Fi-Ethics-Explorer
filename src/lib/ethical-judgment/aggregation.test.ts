// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  aggregateEthicalProfile,
  shouldScoreDebateReply,
} from './aggregation';
import {
  validateEthicalJudgmentAnalysis,
  validateEthicalJudgmentEventInput,
} from './validation';

const baseAnalysis = {
  frameworkScores: [
    { frameworkId: 'utilitarianism', score: 90, confidence: 0.9 },
    { frameworkId: 'deontology', score: 20, confidence: 0.7 },
    { frameworkId: 'virtue-ethics', score: 40, confidence: 0.6 },
  ],
  primaryFrameworks: ['utilitarianism'],
  secondaryFrameworks: ['virtue-ethics'],
  tensions: [
    {
      frameworks: ['utilitarianism', 'deontology'],
      description: 'Outcome-maximizing reasoning conflicts with rule protection.',
    },
  ],
  confidence: 0.84,
  reasoningSummary: 'The response emphasizes preventing the largest concrete harm.',
  evidenceFromResponse: ['I would save the most people.'],
  blindSpots: ['May underweight consent.'],
  challengeQuestion: 'Who bears the cost of this tradeoff?',
  suggestedNextFrameworkToExplore: 'ethics-of-care',
  profileUpdateWeight: 1,
};

function event(overrides = {}) {
  return {
    id: 'event-1',
    userId: 'user-1',
    interactionType: 'story_choice',
    sourceContentType: 'story',
    sourceContentId: 'story-1',
    sourceTitle: 'The Test Ship',
    promptText: 'The ship can save one pod or five.',
    userChoice: 'Save the five pods.',
    explanation: 'I would save the most people.',
    analysis: baseAnalysis,
    affectsProfile: true,
    activityContext: 'story',
    modelUsed: 'deterministic-mapping',
    promptVersion: 'test-v1',
    createdAt: new Date('2026-05-26T12:00:00.000Z'),
    ...overrides,
  };
}

describe('ethical judgment validation', () => {
  it('accepts complete structured judgment event input', () => {
    const parsed = validateEthicalJudgmentEventInput(event());

    expect(parsed.userId).toBe('user-1');
    expect(parsed.analysis.primaryFrameworks).toEqual(['utilitarianism']);
  });

  it('rejects malformed AI scores outside the normalized 0-100 range', () => {
    expect(() =>
      validateEthicalJudgmentAnalysis({
        ...baseAnalysis,
        frameworkScores: [{ frameworkId: 'utilitarianism', score: 101 }],
      }),
    ).toThrow(/score/i);
  });

  it('rejects AI output containing framework IDs outside the registry', () => {
    expect(() =>
      validateEthicalJudgmentAnalysis({
        ...baseAnalysis,
        frameworkScores: [{ frameworkId: 'not-a-framework', score: 50 }],
      }),
    ).toThrow(/framework/i);
  });
});

describe('ethical profile aggregation', () => {
  it('aggregates only profile-affecting ethical judgment events', () => {
    const profile = aggregateEthicalProfile('user-1', [
      event({ id: 'included' }),
      event({
        id: 'knowledge-check',
        interactionType: 'knowledge_quiz',
        sourceContentType: 'quiz',
        affectsProfile: false,
        analysis: {
          ...baseAnalysis,
          frameworkScores: [{ frameworkId: 'deontology', score: 100, confidence: 1 }],
        },
      }),
    ]);

    expect(profile.eventCount).toBe(1);
    expect(profile.overallFrameworkScores.utilitarianism).toBeGreaterThan(80);
    expect(profile.overallFrameworkScores.deontology).toBeLessThan(30);
    expect(profile.strongestFrameworks[0].frameworkId).toBe('utilitarianism');
    expect(profile.byContentType.story.eventCount).toBe(1);
  });

  it('computes confidence from event count and content diversity', () => {
    const profile = aggregateEthicalProfile('user-1', [
      event({ id: 'story', sourceContentType: 'story', activityContext: 'story' }),
      event({ id: 'debate', sourceContentType: 'debate', activityContext: 'debate' }),
      event({ id: 'media', sourceContentType: 'scifi_media', activityContext: 'media' }),
    ]);

    expect(profile.confidenceLevel).toBeGreaterThan(0.3);
    expect(profile.contentAreasIncluded).toEqual(
      expect.arrayContaining(['story', 'debate', 'scifi_media']),
    );
  });

  it('skips short or non-reasoned debate replies', () => {
    expect(shouldScoreDebateReply('lol no')).toBe(false);
    expect(shouldScoreDebateReply('I disagree because consent matters even when the outcome looks efficient.')).toBe(true);
  });
});
