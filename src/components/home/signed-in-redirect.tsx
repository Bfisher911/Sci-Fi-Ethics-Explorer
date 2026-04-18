'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

/**
 * Tiny client-only guard mounted at the top of the marketing splash
 * (`src/app/page.tsx`). Once auth state has settled, signed-in
 * visitors get punted to /dashboard instead of being shown the public
 * landing — saves them a click and prevents the "I'm logged in but
 * the home page acts like I'm not" surprise.
 *
 * Renders nothing. Pure side effect.
 */
export function SignedInRedirect({ to = '/dashboard' }: { to?: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace(to);
    }
  }, [user, loading, router, to]);

  return null;
}
