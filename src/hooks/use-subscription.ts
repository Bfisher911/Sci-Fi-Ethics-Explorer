
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AccountRole, SubscriptionStatus } from '@/types';
import { hasActiveAccess, canAccess, type Feature } from '@/lib/permissions';
import { isSuperAdminEmail } from '@/lib/super-admins';

interface SubscriptionState {
  accountRole?: AccountRole;
  subscriptionStatus: SubscriptionStatus;
  activeLicenseId?: string;
  loading: boolean;
  isPaid: boolean;
  /**
   * True when the signed-in user is the platform's canonical super
   * admin (see src/lib/super-admins.ts). Super-admins are implicitly
   * "paid" regardless of any subscription / license state and are
   * never billed.
   */
  isSuperAdmin: boolean;
  canAccess: (feature: Feature) => boolean;
}

/**
 * Client-side hook that reads the current user's subscription and role state.
 *
 * Behavior changes from the previous implementation:
 *
 *  1. **Live updates.** Switched from a one-shot `getDoc` to an
 *     `onSnapshot` listener so that side-effects which mutate the user
 *     doc (notably `claimPendingSeats`, which links pre-assigned seats
 *     during sign-in) are picked up the moment they land. Previously
 *     the gate read `subscriptionStatus: 'none'` once on mount and
 *     never refreshed, which is what made fresh seat recipients see
 *     the upgrade prompt even though the seat had been claimed.
 *
 *  2. **Super-admin override.** When the signed-in user matches the
 *     SUPER_ADMIN_EMAILS allowlist they are implicitly treated as
 *     paid — `isPaid: true`, `canAccess: () => true` — regardless of
 *     what the Firestore doc says. This is policy: the platform owner
 *     is never billed and never gated.
 */
export function useSubscription(): SubscriptionState {
  const { user, loading: authLoading } = useAuth();
  const [accountRole, setAccountRole] = useState<AccountRole | undefined>();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none');
  const [activeLicenseId, setActiveLicenseId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = isSuperAdminEmail(user?.email);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAccountRole(undefined);
      setSubscriptionStatus('none');
      setActiveLicenseId(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Live subscription to the user doc. Picks up writes from
    // claimPendingSeats, ensureSuperAdminLicense, profile edits, etc.
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setAccountRole(data.accountRole as AccountRole | undefined);
          setSubscriptionStatus((data.subscriptionStatus as SubscriptionStatus) || 'none');
          setActiveLicenseId(data.activeLicenseId);
        } else {
          // Doc may not be created yet (race during sign-up). Default
          // to "none" without crashing — the listener will fire again
          // once createUserProfile / claimPendingSeats writes the doc.
          setSubscriptionStatus('none');
          setActiveLicenseId(undefined);
          setAccountRole(undefined);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('[useSubscription] snapshot error:', err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user, authLoading]);

  const isPaid =
    isSuperAdmin || hasActiveAccess(subscriptionStatus, activeLicenseId);

  return {
    accountRole,
    subscriptionStatus,
    activeLicenseId,
    loading,
    isPaid,
    isSuperAdmin,
    canAccess: (feature: Feature) =>
      isSuperAdmin
        ? true
        : canAccess(feature, accountRole, subscriptionStatus, activeLicenseId),
  };
}
