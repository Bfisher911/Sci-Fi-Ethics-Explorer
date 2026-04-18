'use client';

/**
 * Logged-in dashboard at /dashboard.
 *
 * Used to live at `(app)/page.tsx` (URL `/`), but that path conflicts
 * with `src/app/page.tsx` — the marketing splash. Next.js silently
 * picks the splash for `/`, leaving the dashboard unreachable, so the
 * dashboard now lives at its own /dashboard URL. The marketing splash
 * at `/` redirects signed-in users here (see src/app/page.tsx).
 *
 * Anonymous visitors get bounced to /login; the (app) layout upstream
 * already enforces this for non-public paths but we mirror the check
 * locally so the dashboard skeleton never flashes for a logged-out
 * user mid-redirect.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=%2Fdashboard');
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
