'use client';

/**
 * Logged-in home — the dashboard.
 *
 * Until 2026-04 this page just redirected to /stories ("the app's home
 * had no real dashboard," noted in the Dashboard Redesign brief). It
 * now renders the Mission Control + Editorial Deck dashboard
 * (src/components/dashboard/dashboard.tsx).
 *
 * Anonymous users still get bounced toward auth — the (app) layout
 * upstream is what enforces that for non-public paths; this page
 * mirrors the layout's behavior locally so an unauthenticated visitor
 * who somehow reaches `/` doesn't render the dashboard skeleton.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function AuthenticatedRootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
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
          <p className="text-muted-foreground">Loading your bridge…</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
