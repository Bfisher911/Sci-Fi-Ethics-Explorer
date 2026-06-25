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
import { PageSkeleton } from '@/components/loading/page-skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=%2Fdashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <PageSkeleton />;
  }

  return <Dashboard />;
}
