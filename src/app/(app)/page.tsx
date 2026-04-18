'use client';

/**
 * (app)/page.tsx — defensive redirect.
 *
 * IMPORTANT: this file collides with `src/app/page.tsx` (the marketing
 * splash) — both resolve to `/`. Next.js silently picks the splash, so
 * in normal operation this component never renders. We keep it as a
 * redirect-shaped fallback in case the resolution flips on some future
 * Next.js version or build target. Either way, signed-in users get
 * sent to the real dashboard at /dashboard, signed-out users to login.
 *
 * The actual dashboard now lives at /dashboard
 * (src/app/(app)/dashboard/page.tsx).
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AppRootRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace('/dashboard');
    else router.replace('/login');
  }, [user, loading, router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <svg
          className="h-12 w-12 animate-spin text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
}
