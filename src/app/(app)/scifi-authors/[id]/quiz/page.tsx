'use client';

/**
 * Legacy /scifi-authors/[id]/quiz route — kept as a thin redirect to
 * the unified `/quiz/scifi-author/[id]` route.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SciFiAuthorQuizRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  useEffect(() => {
    router.replace(`/quiz/scifi-author/${id}`);
  }, [router, id]);
  return null;
}
