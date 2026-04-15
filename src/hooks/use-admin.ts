
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { isSuperAdminEmail } from '@/lib/super-admins';

/**
 * Client-side hook that checks whether the current user is an admin.
 * Super-admin emails (see src/lib/super-admins.ts) bypass the Firestore
 * flag check so the platform owner never gets locked out by a
 * misconfigured profile doc.
 */
export function useAdmin(): { isAdmin: boolean; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return { isAdmin, loading };
}
