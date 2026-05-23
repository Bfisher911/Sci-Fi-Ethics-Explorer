/**
 * Pure helpers for the generic discount-code system.
 *
 * No Firestore, no Stripe — just the rules so they can be unit-tested
 * cheaply (see `src/lib/discount-codes.test.ts`). The Firestore-aware
 * server actions live in `src/app/actions/discount-codes.ts` and call
 * into these helpers.
 *
 * Design summary (see `docs/DISCOUNT_CODES.md`):
 *
 *  - Codes with `discountType === 'free_access'` (or any of the
 *    free-access aliases pilot/beta/institution/promotional/comped)
 *    create an internal grant on the user doc. No Stripe customer or
 *    subscription is created, so there is nothing for Stripe to bill.
 *  - Codes with `discountType === 'percent_off' | 'amount_off'` carry a
 *    Stripe promotion code id and are used at Checkout. Those flow
 *    through normal billing.
 *  - Access expiration is checked lazily: any read consults the snapshot
 *    on the user doc and ignores it if expired.
 */

import type {
  DiscountCode,
  DiscountCodeRedemption,
  DiscountCodeType,
  UserAccessGrant,
} from '@/types';

/**
 * Free-access discount types — codes that grant access without billing.
 * Used both at validation time (to skip Stripe checks) and at redemption
 * time (to know whether to create a Stripe object or an internal grant).
 */
export const FREE_ACCESS_TYPES: ReadonlyArray<DiscountCodeType> = [
  'free_access',
  'comped',
  'pilot',
  'beta',
  'institution',
  'promotional',
] as const;

export function isFreeAccessType(t: DiscountCodeType): boolean {
  return (FREE_ACCESS_TYPES as readonly string[]).includes(t);
}

/**
 * Normalize a code for storage and comparison. We treat codes as case-
 * insensitive — students type "offworld-class-2026" and the system
 * matches "OFFWORLD-CLASS-2026". Stored uppercased.
 */
export function normalizeCode(input: string): string {
  return (input ?? '').trim().toUpperCase();
}

/**
 * Convert any Firestore timestamp shape (Date | Timestamp | ISO string |
 * { seconds }) into a JS Date. Returns null for missing/invalid input.
 */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object') {
    const v = value as { toDate?: () => Date; seconds?: number };
    if (typeof v.toDate === 'function') {
      try {
        const d = v.toDate();
        return isNaN(d.getTime()) ? null : d;
      } catch {
        return null;
      }
    }
    if (typeof v.seconds === 'number') {
      return new Date(v.seconds * 1000);
    }
  }
  return null;
}

/** Add a number of whole months to a date, mirroring native Date semantics. */
export function addMonths(start: Date, months: number): Date {
  const d = new Date(start.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Add a number of days to a date. */
export function addDays(start: Date, days: number): Date {
  const d = new Date(start.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Compute the expiration date for a fresh redemption.
 *
 * Priority:
 *  1. If the code has `accessDurationMonths`, redemptionDate + months.
 *  2. Else if `accessDurationDays`, redemptionDate + days.
 *  3. Else if `expiresAt` is set, use that.
 *  4. Else null — the caller must reject the code (no duration defined).
 */
export function computeAccessExpiration(
  code: Pick<DiscountCode, 'accessDurationMonths' | 'accessDurationDays' | 'expiresAt'>,
  redeemedAt: Date,
): Date | null {
  if (typeof code.accessDurationMonths === 'number' && code.accessDurationMonths > 0) {
    return addMonths(redeemedAt, code.accessDurationMonths);
  }
  if (typeof code.accessDurationDays === 'number' && code.accessDurationDays > 0) {
    return addDays(redeemedAt, code.accessDurationDays);
  }
  const fixed = toDate(code.expiresAt);
  if (fixed && fixed.getTime() > redeemedAt.getTime()) return fixed;
  return null;
}

/**
 * Tag for the validation result. The UI maps each tag to a friendly
 * error message; keeping the error data structured (rather than just a
 * string) lets us localize later without rewriting callers.
 */
export type ValidationFailureReason =
  | 'not_found'         // No code exists with that text
  | 'inactive'          // Admin deactivated the code
  | 'not_started'       // Today is before startsAt
  | 'expired'           // Today is after expiresAt
  | 'max_redemptions'   // Global redemption cap reached
  | 'already_redeemed'  // This user already redeemed an one-use-per-user code
  | 'no_duration'       // Free-access code missing both duration fields
  | 'unknown';

export interface ValidationFailure {
  ok: false;
  reason: ValidationFailureReason;
  /** Short human-readable explanation suitable for direct display. */
  message: string;
}

export interface ValidationSuccess {
  ok: true;
  code: DiscountCode;
  /** Computed access expiration if this code were redeemed `now`. Null
   *  for percent_off / amount_off codes that don't grant durational
   *  access. */
  expiresAt: Date | null;
}

export type ValidationResult = ValidationFailure | ValidationSuccess;

/**
 * Validate that a discount code can be redeemed *right now* by *this
 * user*. Pure function — no Firestore reads. Callers (server actions)
 * fetch the code + the user's prior redemptions, then hand them in.
 *
 * Order of checks is intentional: we report "not found" before "expired"
 * so we never leak that a deactivated code ever existed.
 */
export function validateForRedemption(args: {
  code: DiscountCode | null;
  now: Date;
  /** True if this user has already redeemed this code (and it is
   *  oneUsePerUser). The server action runs the Firestore query once
   *  and hands the answer down here. */
  userAlreadyRedeemed: boolean;
}): ValidationResult {
  const { code, now, userAlreadyRedeemed } = args;

  if (!code) {
    return {
      ok: false,
      reason: 'not_found',
      message: 'This discount code is not valid. Please check the code and try again.',
    };
  }

  if (code.isActive === false) {
    return {
      ok: false,
      reason: 'inactive',
      message: 'This discount code is not valid. Please check the code and try again.',
    };
  }

  const starts = toDate(code.startsAt);
  if (starts && now.getTime() < starts.getTime()) {
    return {
      ok: false,
      reason: 'not_started',
      message: 'This discount code is not active yet. Please try again later.',
    };
  }

  const expires = toDate(code.expiresAt);
  if (expires && now.getTime() >= expires.getTime()) {
    return {
      ok: false,
      reason: 'expired',
      message: 'This discount code has expired.',
    };
  }

  if (
    typeof code.maxRedemptions === 'number' &&
    code.redemptionCount >= code.maxRedemptions
  ) {
    return {
      ok: false,
      reason: 'max_redemptions',
      message: 'This discount code has reached its redemption limit.',
    };
  }

  if (code.oneUsePerUser && userAlreadyRedeemed) {
    return {
      ok: false,
      reason: 'already_redeemed',
      message: 'This discount code has already been used on your account.',
    };
  }

  // For free-access types we must be able to compute an expiration.
  if (isFreeAccessType(code.discountType)) {
    const exp = computeAccessExpiration(code, now);
    if (!exp) {
      return {
        ok: false,
        reason: 'no_duration',
        message: 'This discount code is not valid. Please check the code and try again.',
      };
    }
    return { ok: true, code, expiresAt: exp };
  }

  // Stripe-flow codes (percent_off / amount_off) don't grant durational access
  // here — the discount is applied at Checkout via the Stripe promotion code.
  return { ok: true, code, expiresAt: null };
}

/**
 * Build the user-facing access-grant snapshot to write onto users/{uid}.
 * Pure function so the server action can compose it from the validated
 * code + the freshly-created redemption.
 */
export function buildAccessGrant(args: {
  redemption: Pick<
    DiscountCodeRedemption,
    'id' | 'discountCodeId' | 'code' | 'accessScope' | 'courseName' | 'platformName'
  >;
  accessStartsAt: Date;
  accessExpiresAt: Date;
}): UserAccessGrant {
  const { redemption, accessStartsAt, accessExpiresAt } = args;
  const grant: UserAccessGrant = {
    redemptionId: redemption.id,
    discountCodeId: redemption.discountCodeId,
    code: redemption.code,
    accessScope: redemption.accessScope,
    accessStartsAt,
    accessExpiresAt,
  };
  if (redemption.courseName) grant.courseName = redemption.courseName;
  if (redemption.platformName) grant.platformName = redemption.platformName;
  return grant;
}

/**
 * Whether a snapshot grant is still in effect at the given moment.
 * Used by `hasActiveAccess` so the existing entitlement check can add
 * "discount-code grant" as an access source without any new I/O.
 */
export function isGrantActive(
  grant: UserAccessGrant | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!grant) return false;
  const exp = toDate(grant.accessExpiresAt);
  if (!exp) return false;
  return now.getTime() < exp.getTime();
}

/**
 * Format a Date for display in the success message. Browser locales
 * vary; sticking to `en-US` here keeps the wording consistent.
 */
export function formatExpirationDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Build the success message shown after a successful redemption. The
 * exact wording matters — it's the user's only assurance that they
 * will not be charged after the access period ends.
 */
export function buildRedemptionSuccessMessage(args: {
  platformName: string;
  courseName?: string;
  accessExpiresAt: Date;
}): string {
  const { platformName, courseName, accessExpiresAt } = args;
  const expiry = formatExpirationDate(accessExpiresAt);
  const scope = courseName
    ? `${platformName} for ${courseName}`
    : platformName;
  return (
    `Your discount code has been applied. You now have free access to ${scope} ` +
    `through ${expiry}. You will not be charged automatically when this access period ends.`
  );
}
