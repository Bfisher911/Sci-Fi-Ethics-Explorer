'use client';

/**
 * Legacy /leaderboard route — redirects to /people?tab=leaderboard.
 * The implementation lives at src/components/people/leaderboard-view.tsx
 * so it can be embedded inside the consolidated /people surface.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeaderboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/people?tab=leaderboard');
  }, [router]);
  return null;
}
