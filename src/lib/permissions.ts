
import type { AccountRole, SubscriptionStatus, UserAccessGrant } from '@/types';
import { isGrantActive } from '@/lib/discount-codes';

export type Feature =
  | 'browse_stories'
  | 'use_ai_full'
  | 'use_ai_limited'
  | 'join_community'
  | 'create_community'
  | 'manage_community'
  | 'community_analytics'
  | 'assign_work'
  | 'submit_dilemma'
  | 'participate_debates'
  | 'participate_workshops'
  | 'export_reports'
  | 'view_own_progress'
  | 'create_story';

/**
 * Whether a user has an active subscription, license, or discount-code
 * access grant. Treats every access source as equivalent — the platform
 * is single-tier and discount-code grants are intentionally indistinguishable
 * from paid access for feature gating, just not for billing.
 *
 * Discount-code grants are read from the lightweight snapshot stored on
 * the user doc (`UserProfile.activeAccessGrant`) so this remains a pure
 * function with no I/O. The authoritative record lives in
 * `discountCodeRedemptions/{id}` — see `src/lib/discount-codes.ts`.
 */
export function hasActiveAccess(
  subscriptionStatus?: SubscriptionStatus,
  activeLicenseId?: string,
  accessGrant?: UserAccessGrant | null,
): boolean {
  if (activeLicenseId) return true;
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trial') return true;
  if (isGrantActive(accessGrant)) return true;
  return false;
}

/**
 * Whether a user can access a specific feature.
 *
 * The platform is single-tier: every paid member has the same capabilities,
 * including community creation. (Whether a user can manage a *specific*
 * community is determined by membership in that community's instructorIds —
 * a separate, per-community check enforced in app code.)
 *
 * `accountRole` is accepted for backward compatibility but is no longer
 * consulted for gating — anyone with an active subscription or license
 * can use any non-free feature.
 */
export function canAccess(
  feature: Feature,
  _accountRole?: AccountRole,
  subscriptionStatus?: SubscriptionStatus,
  activeLicenseId?: string,
  accessGrant?: UserAccessGrant | null,
): boolean {
  // Free-tier features available to everyone, signed in or not.
  const freeFeatures: Feature[] = [
    'browse_stories',
    'use_ai_limited',
    'view_own_progress',
  ];
  if (freeFeatures.includes(feature)) return true;

  // Everything else requires an active subscription, license, or grant.
  return hasActiveAccess(subscriptionStatus, activeLicenseId, accessGrant);
}

/**
 * Returns a human-readable reason why access is denied.
 */
export function getAccessDeniedReason(
  _feature: Feature,
  _accountRole?: AccountRole,
  subscriptionStatus?: SubscriptionStatus,
  activeLicenseId?: string,
  accessGrant?: UserAccessGrant | null,
): string {
  if (!hasActiveAccess(subscriptionStatus, activeLicenseId, accessGrant)) {
    return 'Choose a plan or redeem a discount code to unlock this feature.';
  }
  return 'You do not have access to this feature.';
}
