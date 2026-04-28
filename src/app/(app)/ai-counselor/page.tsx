'use client';

/**
 * Legacy /ai-counselor route — kept as a thin redirect so existing
 * deep links, emails, and bookmarks keep working. The actual chat
 * experience lives at /studio?tab=chat.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AICounselorPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/studio?tab=chat');
  }, [router]);
  return null;
}
