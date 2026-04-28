'use client';

/**
 * Legacy /glossary/[id]/quiz route — kept as a thin redirect to
 * the unified `/quiz/theory/[id]` route. Theory pages live at
 * /glossary, hence the indirection.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TheoryQuizRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  useEffect(() => {
    router.replace(`/quiz/theory/${id}`);
  }, [router, id]);
  return null;
}
