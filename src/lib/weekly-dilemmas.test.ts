// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  buildWeeklyDilemmaSlug,
  canViewWeeklyDilemmaPeerResponses,
  createEmptyWeeklyDilemmaLoadData,
  isMissingWeeklyDilemmaAdminCredentialsError,
  shouldCreateWeeklyDilemmaForWeek,
} from './weekly-dilemmas';

describe('weekly dilemma visibility and duplicate prevention', () => {
  it('hides peer responses until the learner submits their own response', () => {
    expect(canViewWeeklyDilemmaPeerResponses({ hasSubmitted: false })).toBe(false);
    expect(canViewWeeklyDilemmaPeerResponses({ hasSubmitted: true })).toBe(true);
    expect(
      canViewWeeklyDilemmaPeerResponses({
        hasSubmitted: false,
        responseRequiredToViewPeers: false,
      }),
    ).toBe(true);
  });

  it('builds stable weekly slugs from publish date and title', () => {
    expect(
      buildWeeklyDilemmaSlug('Neural Data in Public Schools?', new Date('2026-05-26T13:00:00Z')),
    ).toBe('2026-05-26-neural-data-in-public-schools');
  });

  it('prevents duplicate weekly generation for an existing ISO week', () => {
    expect(
      shouldCreateWeeklyDilemmaForWeek({
        targetIsoWeek: '2026-W22',
        existingIsoWeeks: ['2026-W21', '2026-W22'],
      }),
    ).toBe(false);
    expect(
      shouldCreateWeeklyDilemmaForWeek({
        targetIsoWeek: '2026-W23',
        existingIsoWeeks: ['2026-W21', '2026-W22'],
      }),
    ).toBe(true);
  });

  it('treats missing Admin credentials as an empty read state for local previews', () => {
    expect(
      isMissingWeeklyDilemmaAdminCredentialsError(
        new Error('Firebase Admin credentials are required for Weekly Clause data.'),
      ),
    ).toBe(true);
    expect(createEmptyWeeklyDilemmaLoadData()).toEqual({
      dilemma: null,
      ownResponse: null,
      peerResponses: [],
      replies: [],
      peersLocked: true,
    });
  });
});
