
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { isSuperAdminEmail } from '@/lib/super-admins';

interface UseAdminResult {
  /**
   * True for both super-admins and any user with `isAdmin === true` on
   * their Firestore profile. Most admin UIs gate on this.
   */
  isAdmin: boolean;
  /**
   * True only for the platform's canonical super-admin (see
   * `src/lib/super-admins.ts`). Surfaces should use this when an
   * action is reserved for the owner — e.g., the impersonation
   * controls in the directory, the global moderation queue, the
   * "Ensure Super-Admin License" button on /billing.
   */
  isSuperAdmin: boolean;
  loading: boolean;
}

/**
 * Client-side hook that classifies the current user's admin tier.
 * Super-admin emails (see src/lib/super-admins.ts) bypass the Firestore
 * flag check so the platform owner never gets locked out by a
 * misconfigured profile doc.
 */
export function useAdmin(): UseAdminResult {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = !authLoading && isSuperAdminEmail(user?.email);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    if (isSuperAdminEmail(user.email)) {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function checkAdmin() {
      try {
        const userDoc = await getDoc(doc(db, 'users', user!.uid));
        if (!cancelled) {
          setIsAdmin(userDoc.exists() && userDoc.data()?.isAdmin === true);
        }
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkAdmin();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  return { isAdmin, isSuperAdmin, loading };
}
