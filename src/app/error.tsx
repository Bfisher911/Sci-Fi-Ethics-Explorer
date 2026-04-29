'use client';

/**
 * Root-level error boundary.
 *
 * The original error.tsx lived under `(app)/error.tsx`, which only
 * catches errors thrown inside the authenticated shell. Public pages
 * (`/stories`, `/textbook`, `/philosophers`, etc.) inherit the root
 * layout — without a root error boundary they'd render a stack trace
 * to logged-out visitors.
 *
 * This file catches everything below the root layout. The
 * `(app)/error.tsx` still wins inside the authenticated shell because
 * Next.js bubbles errors up to the nearest boundary.
 *
 * Keep this lightweight: no providers, minimal styling. The
 * authenticated error page can be richer.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/observability/report';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[root-error]', error);
    reportError(error, { where: 'app/error', digest: error.digest });
  }, [error]);

  return (
    <main
      role="main"
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <AlertTriangle
        className="mb-6 h-12 w-12 text-destructive"
        aria-hidden
      />
      <h1 className="mb-3 font-headline text-2xl font-bold tracking-tight md:text-3xl">
        Something went wrong
      </h1>
      <p className="mb-2 max-w-md text-muted-foreground">
        The page hit an unexpected error. Try reloading — if the problem
        persists, let us know.
      </p>
      {error.digest && (
        <p className="mb-6 font-mono text-xs text-muted-foreground/60">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/help">Get help</Link>
        </Button>
      </div>
    </main>
  );
}
