
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AccountRole, SubscriptionStatus } from '@/types';
import { hasActiveAccess, canAccess, type Feature } from '@/lib/permissions';

interface SubscriptionState {
  accountRole?: AccountRole;
  subscriptionStatus: SubscriptionStatus;
  activeLicenseId?: string;
  loading: boolean;
  isPaid: boolean;
  canAccess: (feature: Feature) => boolean;
}

/**
 * Client-side hook that reads the current user's subscription and role state.
 */
export function useSubscription(): SubscriptionState {
  const { user, loading: authLoading } = useAuth();
  const [accountRole, setAccountRole] = useState<AccountRole | undefined>();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none');
  const [activeLicenseId, setActiveLicenseId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAccountRole(undefined);
      setSubscriptionStatus('none');
      setActiveLicenseId(undefined);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSubscriptionState() {
      try {
        const userDoc = await getDoc(doc(db, 'users', user!.uid));
        if (!cancelled && userDoc.exists()) {
          const data = userDoc.data();
          setAccountRole(data.accountRole as AccountRole | undefined);
          setSubscriptionStatus((data.subscriptionStatus as SubscriptionStatus) || 'none');
          setActiveLicenseId(data.activeLicenseId);
        }
      } catch {
        // Fail silently — default to unpaid
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSubscriptionState();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const isPaid = hasActiveAccess(subscriptionStatus, activeLicenseId);

  return {
    accountRole,
    subscriptionStatus,
    activeLicenseId,
    loading,
    isPaid,
    canAccess: (feature: Feature) =>
      canAccess(feature, accountRole, subscriptionStatus, activeLicenseId),
  };
}
