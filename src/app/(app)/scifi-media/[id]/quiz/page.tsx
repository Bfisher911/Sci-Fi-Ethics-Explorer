'use client';

/**
 * Legacy /scifi-media/[id]/quiz route — kept as a thin redirect to
 * the unified `/quiz/scifi-media/[id]` route.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SciFiMediaQuizRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  useEffect(() => {
    router.replace(`/quiz/scifi-media/${id}`);
  }, [router, id]);
  return null;
}
