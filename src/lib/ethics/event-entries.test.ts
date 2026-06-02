// @vitest-environment node

import { describe, it, expect } from 'vitest';
import { eventToJourneyEntry, activityTypeLabel } from './event-entries';
import { buildJourneyProfile } from './journey';
import type { EthicalJudgmentEvent } from '@/types';

function event(over: Partial<EthicalJudgmentEvent>): EthicalJudgmentEvent {
  return {
    id: 'e1',
    userId: 'u1',
    interactionType: 'debate_stance',
    sourceContentType: 'debate',
    sourceContentId: 'd1',
    sourceTitle: 'AI triage debate',
    promptText: 'Should AI make triage decisions?',
    responseText: 'A human must own the decision.',
    analysis: {
      frameworkScores: [
        { frameworkId: 'deontology', score: 90 },
        { frameworkId: 'ethics-of-care', score: 60 },
        { frameworkId: 'utilitarianism', score: 0 },
      ],
      primaryFrameworks: ['deontology'],
      secondaryFrameworks: ['ethics-of-care'],
      tensions: [],
      confidence: 0.8,
      reasoningSummary: 'Leans on duty and care.',
      evidenceFromResponse: [],
      blindSpots: [],
      challengeQuestion: '',
      profileUpdateWeight: 1,
    },
    affectsProfile: true,
    activityContext: 'debate',
    modelUsed: 'test',
    promptVersion: 'v1',
    createdAt: new Date('2026-06-01T00:00:00Z'),
    ...over,
  } as EthicalJudgmentEvent;
}

describe('eventToJourneyEntry', () => {
  it('maps framework scores to weighted impacts (0–100 → 0–3), dropping zeros', () => {
    const entry = eventToJourneyEntry(event({}));
    expect(entry.impacts.map((i) => i.framework)).toEqual(['deontology', 'ethics-of-care']);
    expect(entry.impacts[0].weight).toBeCloseTo(2.7, 1); // 90/100*3
    expect(entry.impacts.every((i) => i.weight <= 3)).toBe(true);
    expect(entry.choiceText).toContain('human must own');
    expect(entry.storyTitle).toBe('AI triage debate');
  });

  it('carries the interactionType for source labelling', () => {
    const entry = eventToJourneyEntry(event({ interactionType: 'studio_analyze' }));
    expect(entry.segmentId).toBe('studio_analyze');
    expect(activityTypeLabel(entry.segmentId)).toBe('Studio Analyze');
  });

  it('a MIX of activity types builds a multi-source framework breakdown', () => {
    const entries = [
      eventToJourneyEntry(event({ id: 'a', interactionType: 'story_choice' })),
      eventToJourneyEntry(
        event({
          id: 'b',
          interactionType: 'weekly_dilemma_response',
          analysis: {
            frameworkScores: [{ frameworkId: 'utilitarianism', score: 100 }],
            primaryFrameworks: ['utilitarianism'],
            secondaryFrameworks: [],
            tensions: [],
            confidence: 0.7,
            reasoningSummary: 'Maximizes welfare.',
            evidenceFromResponse: [],
            blindSpots: [],
            challengeQuestion: '',
            profileUpdateWeight: 1,
          },
        }),
      ),
    ];
    const profile = buildJourneyProfile(entries);
    const present = profile.ranked.filter((r) => r.score > 0).map((r) => r.id);
    expect(present).toContain('deontology'); // from the story event
    expect(present).toContain('utilitarianism'); // from the dilemma event
    expect(profile.totalDecisions).toBe(2);
  });

  it('is defensive about empty/odd analysis', () => {
    const entry = eventToJourneyEntry(
      event({ analysis: { ...event({}).analysis, frameworkScores: [] } }),
    );
    expect(entry.impacts).toEqual([]);
  });
});
