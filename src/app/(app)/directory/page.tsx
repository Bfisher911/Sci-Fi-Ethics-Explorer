'use client';

/**
 * Legacy /directory route — redirects to /people?tab=browse. The actual
 * directory implementation lives at src/components/people/directory-view.tsx
 * so it can be embedded inside the consolidated /people surface.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DirectoryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/people?tab=browse');
  }, [router]);
  return null;
}
