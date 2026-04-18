'use server';

/**
 * Server-action wrappers around the scope helpers in
 * src/lib/permissions/scope.ts. Designed to be called from client
 * components that need to ask "is this user allowed to mutate that
 * artifact?" before showing an Edit/Delete control.
 */

import {
  canMutateArtifact,
  getActorContext,
} from '@/lib/permissions/scope';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Returns true when `actorUid` is allowed to edit / delete an artifact
 * authored by `authorUid` under the tiered scope rules. See
 * `canMutateArtifact` for the full rule.
 */
export async function canActorMutate(
  actorUid: string,
  authorUid: string | null | undefined,
): Promise<ActionResult<boolean>> {
  try {
    if (!actorUid) return { success: true, data: false };
    const actor = await getActorContext(actorUid);
    return { success: true, data: canMutateArtifact(actor, authorUid) };
  } catch (error: any) {
    console.error('[permissions] canActorMutate failed:', error);
    return { success: false, error: String(error) };
  }
}
