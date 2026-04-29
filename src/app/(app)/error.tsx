'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { reportError } from '@/lib/observability/report';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[app-error]', error);
    reportError(error, { where: 'app/(app)/error', digest: error.digest });
  }, [error]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-8">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-4xl font-bold text-destructive mb-4">Oops! Something went wrong.</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We've encountered an unexpected issue. Please try again, or if the problem persists, contact support.
      </p>
      {error.message && (
         <pre className="mb-6 p-4 bg-muted rounded-md text-sm text-destructive-foreground overflow-x-auto max-w-full">
          Error details: {error.message}
        </pre>
      )}
      <div className="flex gap-4">
        <Button
            onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
            }
            variant="destructive"
            size="lg"
        >
            Try Again
        </Button>
        <Button
            onClick={
            () => window.location.href = '/stories' // Or router.push('/stories') if router is available
            }
            variant="outline"
            size="lg"
        >
            Go to Stories
        </Button>
      </div>
    </div>
  );
}
