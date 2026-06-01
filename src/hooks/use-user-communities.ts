'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserCommunities } from '@/app/actions/communities';
import type { Community } from '@/types';

export interface UseUserCommunitiesResult {
  /** Communities the signed-in user belongs to (as owner, instructor, or member). */
  communities: Community[];
  /** True while the first (or a forced) load is in flight. */
  loading: boolean;
  /** Non-null when the most recent load failed. */
  error: string | null;
  /** Re-fetch the user's communities (e.g. after joining one). */
  reload: () => void;
}

/**
 * Shared source of truth for "which communities does the current user belong
 * to". Wraps the existing `getUserCommunities` server action so the submit
 * section, the share dialog, and the dashboard all read membership the same
 * way instead of each re-implementing the fetch.
 *
 * Returns an empty list (not an error) when the user is signed out.
 */
export function useUserCommunities(): UseUserCommunitiesResult {
  const { user } = useAuth();
  const uid = user?.uid;

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!uid) {
      setCommunities([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getUserCommunities(uid)
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          setCommunities(result.data);
        } else {
          setCommunities([]);
          setError(result.error);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setCommunities([]);
        setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid, nonce]);

  return { communities, loading, error, reload };
}
