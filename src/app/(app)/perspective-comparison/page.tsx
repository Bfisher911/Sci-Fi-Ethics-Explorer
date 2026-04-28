'use client';

/**
 * Legacy /perspective-comparison route — kept as a thin redirect so
 * existing deep links, emails, and bookmarks keep working. The actual
 * Compare experience lives at /studio?tab=compare.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PerspectiveComparisonPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/studio?tab=compare');
  }, [router]);
  return null;
}
