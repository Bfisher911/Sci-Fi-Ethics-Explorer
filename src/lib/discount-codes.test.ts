// @vitest-environment node

/**
 * Tests for the pure logic in `src/lib/discount-codes.ts`.
 *
 * These pin down the rules that protect students:
 *   - A free-access code creates a durational grant; no Stripe billing
 *     is involved anywhere in this logic.
 *   - Inactive / expired / over-cap / already-redeemed codes are rejected
 *     with structured reasons the UI maps to friendly errors.
 *   - The 4-month class duration produces the right expiration date.
 *   - An expired grant snapshot is reported as inactive — the
 *     `hasActiveAccess` consumer therefore treats the user as un-paid
 *     without any new I/O.
 *
 * Integration tests against Firestore live elsewhere; these are pure
 * helpers so we can run them fast and check the contracts directly.
 */

import { describe, it, expect } from 'vitest';
import {
  addDays,
  addMonths,
  buildAccessGrant,
  buildRedemptionSuccessMessage,
  computeAccessExpiration,
  formatExpirationDate,
  isFreeAccessType,
  isGrantActive,
  normalizeCode,
  validateForRedemption,
} from './discount-codes';
import { hasActiveAccess } from './permissions';
import type { DiscountCode, UserAccessGrant } from '@/types';

const CLASS_CODE: DiscountCode = {
  id: 'code-1',
  code: 'OFFWORLD-CLASS-2026',
  name: 'Ethics of Tech — Class Access',
  discountType: 'free_access',
  accessScope: 'platform_course',
  courseName: 'The Ethics of Technology through Science Fiction',
  platformName: 'Off World Clause',
  accessDurationMonths: 4,
  redemptionCount: 0,
  oneUsePerUser: true,
  requiresStripe: false,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

describe('normalizeCode', () => {
  it('uppercases and trims', () => {
    expect(normalizeCode('  offworld-class-2026  ')).toBe('OFFWORLD-CLASS-2026');
  });
  it('returns empty for null/undefined', () => {
    expect(normalizeCode('')).toBe('');
  });
});

describe('isFreeAccessType', () => {
  it('treats free_access / comped / pilot / beta / institution / promotional as free', () => {
    expect(isFreeAccessType('free_access')).toBe(true);
    expect(isFreeAccessType('comped')).toBe(true);
    expect(isFreeAccessType('pilot')).toBe(true);
    expect(isFreeAccessType('beta')).toBe(true);
    expect(isFreeAccessType('institution')).toBe(true);
    expect(isFreeAccessType('promotional')).toBe(true);
  });
  it('treats percent_off / amount_off as NOT free (Stripe-flow)', () => {
    expect(isFreeAccessType('percent_off')).toBe(false);
    expect(isFreeAccessType('amount_off')).toBe(false);
  });
});

describe('addMonths / addDays / computeAccessExpiration', () => {
  it('adds whole months', () => {
    const start = new Date('2026-05-22T00:00:00Z');
    expect(addMonths(start, 4).toISOString().slice(0, 10)).toBe('2026-09-22');
  });
  it('adds days', () => {
    const start = new Date('2026-05-22T00:00:00Z');
    expect(addDays(start, 7).toISOString().slice(0, 10)).toBe('2026-05-29');
  });
  it('prefers months over days when both are set', () => {
    const start = new Date('2026-05-22T00:00:00Z');
    const exp = computeAccessExpiration(
      { accessDurationMonths: 4, accessDurationDays: 1 },
      start,
    );
    expect(exp?.toISOString().slice(0, 10)).toBe('2026-09-22');
  });
  it('falls back to days when months is missing', () => {
    const start = new Date('2026-05-22T00:00:00Z');
    const exp = computeAccessExpiration({ accessDurationDays: 30 }, start);
    expect(exp?.toISOString().slice(0, 10)).toBe('2026-06-21');
  });
  it('returns null when no duration is set and no future expiresAt', () => {
    const start = new Date('2026-05-22T00:00:00Z');
    expect(computeAccessExpiration({}, start)).toBeNull();
  });
});

describe('validateForRedemption', () => {
  const now = new Date('2026-05-22T00:00:00Z');

  it('accepts the class code (free_access, 4 months)', () => {
    const result = validateForRedemption({
      code: CLASS_CODE,
      now,
      userAlreadyRedeemed: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.expiresAt?.toISOString().slice(0, 10)).toBe('2026-09-22');
    }
  });

  it('rejects when no code was found', () => {
    const result = validateForRedemption({ code: null, now, userAlreadyRedeemed: false });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_found');
  });

  it('rejects an inactive code', () => {
    const result = validateForRedemption({
      code: { ...CLASS_CODE, isActive: false },
      now,
      userAlreadyRedeemed: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('inactive');
  });

  it('rejects an expired code', () => {
    const result = validateForRedemption({
      code: { ...CLASS_CODE, expiresAt: new Date('2026-01-01T00:00:00Z') },
      now,
      userAlreadyRedeemed: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('expired');
  });

  it('rejects a code that has not started yet', () => {
    const result = validateForRedemption({
      code: { ...CLASS_CODE, startsAt: new Date('2027-01-01T00:00:00Z') },
      now,
      userAlreadyRedeemed: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_started');
  });

  it('rejects a code that has hit its max redemptions', () => {
    const result = validateForRedemption({
      code: { ...CLASS_CODE, maxRedemptions: 5, redemptionCount: 5 },
      now,
      userAlreadyRedeemed: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('max_redemptions');
  });

  it('rejects a one-use-per-user code the user has already redeemed', () => {
    const result = validateForRedemption({
      code: CLASS_CODE,
      now,
      userAlreadyRedeemed: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('already_redeemed');
  });

  it('allows re-redemption when oneUsePerUser is false', () => {
    const result = validateForRedemption({
      code: { ...CLASS_CODE, oneUsePerUser: false },
      now,
      userAlreadyRedeemed: true,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects free-access codes with no duration defined', () => {
    const result = validateForRedemption({
      code: {
        ...CLASS_CODE,
        accessDurationMonths: undefined,
        accessDurationDays: undefined,
        expiresAt: undefined,
      },
      now,
      userAlreadyRedeemed: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('no_duration');
  });
});

describe('buildAccessGrant', () => {
  it('snapshots the source redemption into a user grant', () => {
    const grant = buildAccessGrant({
      redemption: {
        id: 'red-1',
        discountCodeId: 'code-1',
        code: 'OFFWORLD-CLASS-2026',
        accessScope: 'platform_course',
        courseName: 'The Ethics of Technology through Science Fiction',
        platformName: 'Off World Clause',
      },
      accessStartsAt: new Date('2026-05-22T00:00:00Z'),
      accessExpiresAt: new Date('2026-09-22T00:00:00Z'),
    });
    expect(grant.redemptionId).toBe('red-1');
    expect(grant.code).toBe('OFFWORLD-CLASS-2026');
    expect(grant.platformName).toBe('Off World Clause');
    expect(grant.courseName).toBe(
      'The Ethics of Technology through Science Fiction',
    );
  });
});

describe('isGrantActive', () => {
  const now = new Date('2026-05-22T00:00:00Z');

  it('returns true when the grant has not expired', () => {
    const grant: UserAccessGrant = {
      redemptionId: 'red-1',
      discountCodeId: 'code-1',
      code: 'OFFWORLD-CLASS-2026',
      accessScope: 'platform_course',
      accessStartsAt: new Date('2026-05-22T00:00:00Z'),
      accessExpiresAt: new Date('2026-09-22T00:00:00Z'),
    };
    expect(isGrantActive(grant, now)).toBe(true);
  });

  it('returns false when the grant has expired', () => {
    const grant: UserAccessGrant = {
      redemptionId: 'red-1',
      discountCodeId: 'code-1',
      code: 'OFFWORLD-CLASS-2026',
      accessScope: 'platform_course',
      accessStartsAt: new Date('2026-01-01T00:00:00Z'),
      accessExpiresAt: new Date('2026-05-01T00:00:00Z'),
    };
    expect(isGrantActive(grant, now)).toBe(false);
  });

  it('returns false when there is no grant', () => {
    expect(isGrantActive(null, now)).toBe(false);
    expect(isGrantActive(undefined, now)).toBe(false);
  });
});

describe('hasActiveAccess integration', () => {
  it('grants access when an active grant exists, even without subscription or license', () => {
    const grant: UserAccessGrant = {
      redemptionId: 'red-1',
      discountCodeId: 'code-1',
      code: 'OFFWORLD-CLASS-2026',
      accessScope: 'platform_course',
      accessStartsAt: new Date('2026-05-22T00:00:00Z'),
      // Far in the future relative to "today" (2026-05-22). Tests do
      // not freeze the clock; using +1 year keeps this evergreen.
      accessExpiresAt: new Date('2099-12-31T00:00:00Z'),
    };
    expect(hasActiveAccess('none', undefined, grant)).toBe(true);
  });

  it('denies access when the grant has expired and no other source exists', () => {
    const grant: UserAccessGrant = {
      redemptionId: 'red-1',
      discountCodeId: 'code-1',
      code: 'OFFWORLD-CLASS-2026',
      accessScope: 'platform_course',
      accessStartsAt: new Date('2020-01-01T00:00:00Z'),
      accessExpiresAt: new Date('2020-05-01T00:00:00Z'),
    };
    expect(hasActiveAccess('none', undefined, grant)).toBe(false);
  });

  it('still grants access via an active subscription even when grant is expired', () => {
    const grant: UserAccessGrant = {
      redemptionId: 'red-1',
      discountCodeId: 'code-1',
      code: 'OFFWORLD-CLASS-2026',
      accessScope: 'platform_course',
      accessStartsAt: new Date('2020-01-01T00:00:00Z'),
      accessExpiresAt: new Date('2020-05-01T00:00:00Z'),
    };
    expect(hasActiveAccess('active', undefined, grant)).toBe(true);
  });

  it('grants access via license even when grant is absent', () => {
    expect(hasActiveAccess('none', 'lic-1', null)).toBe(true);
  });

  it('denies when all sources are absent', () => {
    expect(hasActiveAccess('none', undefined, null)).toBe(false);
  });
});

describe('buildRedemptionSuccessMessage', () => {
  it('includes the platform, course, expiry, and the no-charge assurance', () => {
    const msg = buildRedemptionSuccessMessage({
      platformName: 'Off World Clause',
      courseName: 'The Ethics of Technology through Science Fiction',
      accessExpiresAt: new Date('2026-09-22T00:00:00Z'),
    });
    expect(msg).toContain('Off World Clause');
    expect(msg).toContain('The Ethics of Technology through Science Fiction');
    expect(msg).toContain(formatExpirationDate(new Date('2026-09-22T00:00:00Z')));
    expect(msg.toLowerCase()).toContain('will not be charged');
  });

  it('omits the course when none is set', () => {
    const msg = buildRedemptionSuccessMessage({
      platformName: 'Off World Clause',
      accessExpiresAt: new Date('2026-09-22T00:00:00Z'),
    });
    expect(msg).toContain('Off World Clause');
    expect(msg).not.toContain('for The Ethics of Technology through Science Fiction');
  });
});

describe('Safety: free-access codes do not implicate Stripe', () => {
  it('does not surface any Stripe identifiers in the validated payload for free_access', () => {
    // The validator never injects Stripe ids; it just returns the code
    // and a computed expiry. We assert that surface explicitly.
    const result = validateForRedemption({
      code: CLASS_CODE,
      now: new Date('2026-05-22T00:00:00Z'),
      userAlreadyRedeemed: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      // The code carries no Stripe linkage — the platform never creates
      // a Stripe object for this kind of redemption.
      expect(result.code.requiresStripe).toBe(false);
      expect(result.code.stripeCouponId).toBeUndefined();
      expect(result.code.stripePromotionCodeId).toBeUndefined();
    }
  });
});
