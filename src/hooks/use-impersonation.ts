'use client';

import { useEffect, useState } from 'react';

/**
 * Client-side hook that exposes the active super-admin "view as"
 * session if one is set. The cookie is non-httpOnly by design (see
 * src/app/actions/impersonation.ts) so client code can read it without
 * a network round-trip.
 *
 * Returns `null` when no impersonation session is active.
 */

export interface ImpersonationSession {
  asUid: string;
  asName: string;
  asEmail: string | null;
  byUid: string;
  byName: string;
  startedAt: string;
}

const COOKIE_NAME = 'sfee-view-as';

function readCookie(): ImpersonationSession | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!raw) return null;
  try {
    const value = decodeURIComponent(raw.split('=').slice(1).join('='));
    return JSON.parse(value) as ImpersonationSession;
  } catch {
    return null;
  }
}

export function useImpersonation(): ImpersonationSession | null {
  const [session, setSession] = useState<ImpersonationSession | null>(null);

  useEffect(() => {
    setSession(readCookie());
    // Listen for cookie changes via storage event isn't quite right —
    // poll every 2s instead so we catch start/stop from other tabs.
    const id = setInterval(() => {
      const next = readCookie();
      setSession((prev) => {
        const a = prev ? JSON.stringify(prev) : '';
        const b = next ? JSON.stringify(next) : '';
        return a === b ? prev : next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return session;
}
