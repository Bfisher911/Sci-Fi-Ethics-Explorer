/**
 * Client-side hook for reading the current user's subscription from Firestore.
 *
 * Subscribes to subscriptions/{uid} via onSnapshot so premium status updates
 * in real time when the webhook writes (e.g., right after checkout completes).
 */
'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, type Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from '@/types';

interface UseSubscriptionResult {
  subscription: Subscription | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isPremium: boolean;
  loading: boolean;
  error: Error | null;
}

export function useSubscription(): UseSubscriptionResult {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    if (!db) {
      setError(new Error('Firestore is not initialized.'));
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(
      doc(db as Firestore, 'subscriptions', user.uid),
      (snap) => {
        if (!snap.exists()) {
          setSubscription(null);
        } else {
          setSubscription({ uid: user.uid, ...(snap.data() as Omit<Subscription, 'uid'>) });
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user, authLoading]);

  const plan: SubscriptionPlan = subscription?.plan ?? 'free';
  const status: SubscriptionStatus = subscription?.status ?? 'none';
  const isPremium = plan !== 'free' && (status === 'active' || status === 'trialing');

  return { subscription, plan, status, isPremium, loading, error };
}
