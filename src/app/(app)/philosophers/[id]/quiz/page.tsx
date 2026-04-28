'use client';

/**
 * Legacy /philosophers/[id]/quiz route — kept as a thin redirect to
 * the unified `/quiz/philosopher/[id]` route.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PhilosopherQuizRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  useEffect(() => {
    router.replace(`/quiz/philosopher/${id}`);
  }, [router, id]);
  return null;
}
