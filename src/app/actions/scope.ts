'use server';

/**
 * Thin server-action wrappers around the scope helpers in
 * src/lib/permissions/scope.ts so client components can ask
 * "is this user a license admin?" / "what's their scope?" without
 * pulling Firestore reads into the browser bundle.
 */

import {
  getActorContext,
  getOwnedLicenseIds,
  getLicenseGroupUids,
  type PermissionTier,
} from '@/lib/permissions/scope';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Returns true when the given user has at least one active license they
 * purchased — i.e. they qualify as a license admin even if their
 * profile's `isAdmin` flag is false.
 */
export async function hasOwnedLicenses(
  uid: string,
): Promise<ActionResult<boolean>> {
  try {
    if (!uid) return { success: true, data: false };
    const ids = await getOwnedLicenseIds(uid);
    return { success: true, data: ids.length > 0 };
  } catch (error: any) {
    console.error('[scope action] hasOwnedLicenses failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Returns the actor's permission tier and the size of their managed
 * license group. Used by admin dashboards to render the correct
 * scope-aware copy ("X users in your group" vs "X users platform-wide").
 */
export async function getActorScopeSummary(uid: string): Promise<
  ActionResult<{
    tier: PermissionTier;
    managedUserCount: number;
    ownedLicenseCount: number;
  }>
> {
  try {
    if (!uid) {
      return {
        success: true,
        data: { tier: 'member', managedUserCount: 0, ownedLicenseCount: 0 },
      };
    }
    const actor = await getActorContext(uid);
    return {
      success: true,
      data: {
        tier: actor.tier,
        managedUserCount: actor.licenseGroupUids.size,
        ownedLicenseCount: actor.ownedLicenseIds.length,
      },
    };
  } catch (error: any) {
    console.error('[scope action] getActorScopeSummary failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Returns the set of UIDs the actor can manage. Use sparingly from the
 * client (returns up to thousands of strings); prefer doing scope
 * filtering inside server actions when possible.
 */
export async function getManagedUidsForCaller(
  uid: string,
): Promise<ActionResult<string[]>> {
  try {
    if (!uid) return { success: true, data: [] };
    const set = await getLicenseGroupUids(uid);
    return { success: true, data: Array.from(set) };
  } catch (error: any) {
    console.error('[scope action] getManagedUidsForCaller failed:', error);
    return { success: false, error: String(error) };
  }
}
