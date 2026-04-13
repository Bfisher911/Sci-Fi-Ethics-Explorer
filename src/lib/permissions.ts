
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
 * Whether a user can access a specific feature based on their role,
 * subscription status, and license status.
 */
export function canAccess(
  feature: Feature,
  accountRole?: AccountRole,
  subscriptionStatus?: SubscriptionStatus,
  activeLicenseId?: string
): boolean {
  const paid = hasActiveAccess(subscriptionStatus, activeLicenseId);

  // Free-tier features available to everyone
  const freeFeatures: Feature[] = [
    'browse_stories',
    'use_ai_limited',
    'view_own_progress',
  ];

  if (freeFeatures.includes(feature)) return true;

  // Everything else requires payment
  if (!paid) return false;

  // Instructor-only features
  const instructorOnly: Feature[] = [
    'create_community',
    'manage_community',
    'community_analytics',
    'assign_work',
  ];

  if (instructorOnly.includes(feature)) {
    return accountRole === 'instructor';
  }

  // Paid features available to both roles
  return true;
}

/**
 * Returns a human-readable reason why access is denied.
 */
export function getAccessDeniedReason(
  feature: Feature,
  accountRole?: AccountRole,
  subscriptionStatus?: SubscriptionStatus
): string {
  const paid = subscriptionStatus === 'active' || subscriptionStatus === 'trial';

  if (!paid) {
    return 'Choose a plan to unlock this feature.';
  }

  const instructorOnly: Feature[] = [
    'create_community',
    'manage_community',
    'community_analytics',
    'assign_work',
  ];

  if (instructorOnly.includes(feature) && accountRole !== 'instructor') {
    return 'This feature is available to Instructors.';
  }

  return 'You do not have access to this feature.';
}
