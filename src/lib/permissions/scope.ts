/**
 * Scope helpers for the tiered permission model.
 *
 * NOT a Server Actions module (no `'use server'`) because some of the
 * exports are synchronous helpers + types. Server actions that need
 * these helpers can import them freely; client components must go
 * through the wrappers in src/app/actions/scope.ts and
 * src/app/actions/permissions.ts. (The Firestore reads inside this
 * module would crash if imported from a browser context anyway.)
 *
 * The platform recognizes three permission tiers:
 *
 *   1. SUPER ADMIN  — exactly one account (`bfisher3@tulane.edu`, see
 *      `src/lib/super-admins.ts`). Can do anything, see anything, edit
 *      or delete anything, has unlimited seats on any license, is never
 *      billed, and can impersonate any user.
 *
 *   2. LICENSE ADMIN — anyone who has purchased one or more seat licenses
 *      (i.e. is the `purchaserId` on at least one active `licenses/*` doc).
 *      They have admin tooling for THEIR LICENSE GROUP ONLY: the set of
 *      users who have claimed seats from any license they own. They can
 *      assign/revoke seats, see analytics for their group, and edit /
 *      delete content authored by themselves or by anyone in that scope.
 *      They CANNOT see users outside their license, and cannot edit /
 *      delete content authored outside that scope.
 *
 *   3. MEMBER — every other authenticated user. Standard member powers:
 *      they can edit / delete their OWN content, and nothing else.
 *
 * This module is the single source of truth for "who is in whose scope"
 * and "is X allowed to mutate Y". It is intentionally a server-only
 * module because every check is grounded in Firestore reads we don't
 * want to expose from the browser.
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { isSuperAdminEmail } from '@/lib/super-admins';

export type PermissionTier = 'super-admin' | 'license-admin' | 'member';

export interface ActorContext {
  uid: string;
  email: string | null;
  tier: PermissionTier;
  /** UIDs that fall under the actor's license-admin scope (empty for super-admin and member tiers). */
  licenseGroupUids: ReadonlySet<string>;
  /** Active license IDs this actor purchased (empty unless tier === 'license-admin' or 'super-admin'). */
  ownedLicenseIds: ReadonlyArray<string>;
}

/**
 * Server-side: is this UID the super admin?
 *
 * Super-admin status is keyed off the canonical email allowlist, NOT a
 * Firestore boolean — that way a corrupted profile doc, a stripped
 * field, or a future bug can't accidentally elevate or demote the
 * platform owner.
 */
export async function isSuperAdminUid(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return false;
    return isSuperAdminEmail(snap.data().email);
  } catch {
    return false;
  }
}

/**
 * Returns the active license IDs this user purchased. Empty array if
 * none. Active = `status === 'active'`. (Cancelled / expired licenses
 * stop conferring admin scope automatically.)
 */
export async function getOwnedLicenseIds(uid: string): Promise<string[]> {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, 'licenses'),
      where('purchaserId', '==', uid),
      where('status', '==', 'active'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.id);
  } catch (err) {
    console.error('[scope] getOwnedLicenseIds failed:', err);
    return [];
  }
}

/**
 * Returns every UID that has ever claimed an active seat from any
 * license owned by `licenseAdminUid` (plus the admin's own UID, since
 * an admin always has scope over themselves).
 *
 * This is the canonical "who counts as one of my users" function —
 * use it to filter directory views, analytics, the user-management
 * page, and any "is this content authored by someone I can manage"
 * check.
 *
 * Returns an empty Set when the user owns no licenses (typical member).
 */
export async function getLicenseGroupUids(
  licenseAdminUid: string,
): Promise<Set<string>> {
  const result = new Set<string>();
  if (!licenseAdminUid) return result;
  result.add(licenseAdminUid); // always include self

  const ownedLicenseIds = await getOwnedLicenseIds(licenseAdminUid);
  if (ownedLicenseIds.length === 0) return result;

  // Firestore `in` is capped at 30 values; chunk if a single admin ever
  // owns more than 30 active licenses. Realistic ceiling is small but
  // we may as well not blow up.
  const CHUNK = 30;
  for (let i = 0; i < ownedLicenseIds.length; i += CHUNK) {
    const chunk = ownedLicenseIds.slice(i, i + CHUNK);
    try {
      const q = query(
        collection(db, 'seatAssignments'),
        where('licenseId', 'in', chunk),
        where('status', '==', 'active'),
      );
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const uid = d.data().userId as string | null;
        if (uid) result.add(uid);
      }
    } catch (err) {
      console.error('[scope] getLicenseGroupUids chunk failed:', err);
    }
  }

  return result;
}

/**
 * Resolve the full actor context for a given UID. Use this at the top
 * of any server action that needs to make a permission decision —
 * one round-trip, fully typed result, no scattered `isAdmin` reads.
 */
export async function getActorContext(uid: string): Promise<ActorContext> {
  const empty: ActorContext = {
    uid,
    email: null,
    tier: 'member',
    licenseGroupUids: new Set<string>(),
    ownedLicenseIds: [],
  };
  if (!uid) return empty;

  let email: string | null = null;
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      email = (userSnap.data().email as string | null) ?? null;
    }
  } catch {
    // fall through with null email
  }

  if (isSuperAdminEmail(email)) {
    return {
      uid,
      email,
      tier: 'super-admin',
      licenseGroupUids: new Set<string>(),
      ownedLicenseIds: await getOwnedLicenseIds(uid),
    };
  }

  const ownedLicenseIds = await getOwnedLicenseIds(uid);
  if (ownedLicenseIds.length > 0) {
    const groupUids = await getLicenseGroupUids(uid);
    return {
      uid,
      email,
      tier: 'license-admin',
      licenseGroupUids: groupUids,
      ownedLicenseIds,
    };
  }

  return { ...empty, email };
}

/**
 * Is `actor` allowed to edit or delete a content artifact authored by
 * `authorUid`?  Centralized rule:
 *
 *   - super-admin              → always yes
 *   - license-admin            → yes iff `authorUid` is in their license group
 *                                  (they always have scope over themselves)
 *   - member                   → yes iff they are the author
 *   - missing or unknown actor → no
 *
 * `authorUid` may be null/undefined for system-authored or
 * Professor-Paradox-authored content; in that case only the super-admin
 * can mutate it (members cannot edit the platform's official content).
 */
export function canMutateArtifact(
  actor: ActorContext,
  authorUid: string | null | undefined,
): boolean {
  if (!actor || !actor.uid) return false;
  if (actor.tier === 'super-admin') return true;
  if (!authorUid) return false; // system-authored: super-admin only
  if (actor.uid === authorUid) return true;
  if (actor.tier === 'license-admin') {
    return actor.licenseGroupUids.has(authorUid);
  }
  return false;
}

/**
 * Convenience: load the actor context AND check mutate permission in
 * one call. Throws on denial — use in server actions where the caller
 * just wants the gate.
 */
export async function requireMutatePermission(
  actorUid: string,
  authorUid: string | null | undefined,
  artifactLabel: string = 'content',
): Promise<ActorContext> {
  const actor = await getActorContext(actorUid);
  if (!canMutateArtifact(actor, authorUid)) {
    throw new Error(
      `Unauthorized: you don\u2019t have permission to modify this ${artifactLabel}.`,
    );
  }
  return actor;
}
