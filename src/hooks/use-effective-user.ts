'use client';

import { useAuth } from './use-auth';
import { useImpersonation } from './use-impersonation';

/**
 * Returns the UID that read-side queries should use for the current
 * session. When the super-admin has an active "view as" session, this
 * returns the impersonated user's uid + name; otherwise it returns the
 * real signed-in user's identity.
 *
 * Pages that render personal data (a profile dashboard, your progress,
 * your certificates, your notifications) should pull `uid` from here
 * instead of `useAuth().user.uid` so view-as actually shows you what
 * the target user sees.
 *
 * Write operations should keep using `useAuth()` directly — every
 * mutation must remain attributed to the real super-admin so audit
 * trails stay honest.
 */
export interface EffectiveUser {
  /** UID to use for read queries (impersonated uid in view-as, real uid otherwise). */
  uid: string | null;
  /** Display name for the effective user. */
  displayName: string | null;
  /** True when the session is currently impersonating someone. */
  isImpersonating: boolean;
  /** When impersonating, the real super-admin's uid; null otherwise. */
  realUid: string | null;
}

export function useEffectiveUser(): EffectiveUser {
  const { user } = useAuth();
  const session = useImpersonation();

  if (session && user) {
    return {
      uid: session.asUid,
      displayName: session.asName,
      isImpersonating: true,
      realUid: user.uid,
    };
  }

  return {
    uid: user?.uid ?? null,
    displayName: user?.displayName ?? user?.email ?? null,
    isImpersonating: false,
    realUid: null,
  };
}
