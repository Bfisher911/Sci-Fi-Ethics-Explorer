
import type { AccountRole, SubscriptionStatus } from '@/types';

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
 * Whether a user has an active subscription or license covering access.
 */
export function hasActiveAccess(
  subscriptionStatus?: SubscriptionStatus,
  activeLicenseId?: string
): boolean {
  if (activeLicenseId) return true;
  return subscriptionStatus === 'active' || subscriptionStatus === 'trial';
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
  activeLicenseId?: string
): boolean {
  // Free-tier features available to everyone, signed in or not.
  const freeFeatures: Feature[] = [
    'browse_stories',
    'use_ai_limited',
    'view_own_progress',
  ];
  if (freeFeatures.includes(feature)) return true;

  // Everything else requires an active subscription or license.
  return hasActiveAccess(subscriptionStatus, activeLicenseId);
}

/**
 * Returns a human-readable reason why access is denied.
 */
export function getAccessDeniedReason(
  _feature: Feature,
  _accountRole?: AccountRole,
  subscriptionStatus?: SubscriptionStatus,
  activeLicenseId?: string
): string {
  if (!hasActiveAccess(subscriptionStatus, activeLicenseId)) {
    return 'Choose a plan to unlock this feature.';
  }
  return 'You do not have access to this feature.';
}
