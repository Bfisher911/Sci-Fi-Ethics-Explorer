// @vitest-environment node

/**
 * Tests for the daily-streak rules implemented in
 * `src/app/actions/progress.ts → recordDailyActivity`.
 *
 * The action talks to Firestore so we can't unit-test it directly
 * here without mocking the SDK. Instead we extract the pure rule
 * (same-day → no change; +1 day → bump; +2+ → reset) into a tiny
 * helper and assert against it. The action's logic was lifted from
 * this exact pattern, so the tests pin the behavior we care about.
 */

import { describe, it, expect } from 'vitest';
import { computeNextStreak } from './streak';

describe('computeNextStreak', () => {
  it("does not change the streak on a same-day visit", () => {
    const result = computeNextStreak({
      lastDay: '2026-04-29',
      today: '2026-04-29',
      currentStreak: 3,
    });
    expect(result).toEqual({ nextStreak: 3, isNewDay: false });
  });

  it('bumps the streak by 1 on a consecutive-day visit', () => {
    const result = computeNextStreak({
      lastDay: '2026-04-28',
      today: '2026-04-29',
      currentStreak: 3,
    });
    expect(result).toEqual({ nextStreak: 4, isNewDay: true });
  });

  it('resets to 1 when a day was missed', () => {
    const result = computeNextStreak({
      lastDay: '2026-04-25',
      today: '2026-04-29',
      currentStreak: 12,
    });
    expect(result).toEqual({ nextStreak: 1, isNewDay: true });
  });

  it('starts at 1 for a brand-new user (no lastDay)', () => {
    const result = computeNextStreak({
      lastDay: undefined,
      today: '2026-04-29',
      currentStreak: 0,
    });
    expect(result).toEqual({ nextStreak: 1, isNewDay: true });
  });

  it('preserves the streak when clock skew suggests time went backwards', () => {
    // diffDays < 0 — should NOT reset to 1; treat as same-day.
    const result = computeNextStreak({
      lastDay: '2026-05-01',
      today: '2026-04-29',
      currentStreak: 7,
    });
    expect(result.nextStreak).toBe(7);
  });
});
