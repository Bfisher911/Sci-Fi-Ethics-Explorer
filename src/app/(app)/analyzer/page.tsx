'use client';

/**
 * Legacy /analyzer route — kept as a thin redirect so existing deep
 * links, emails, and bookmarks keep working. The actual scenario
 * analyzer lives at /studio?tab=analyze.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyzerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/studio?tab=analyze');
  }, [router]);
  return null;
}
