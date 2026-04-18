'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useImpersonation } from '@/hooks/use-impersonation';
import { stopImpersonation } from '@/app/actions/impersonation';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, X } from 'lucide-react';

/**
 * Persistent floating banner shown across the entire app whenever the
 * super-admin has an active "view as" session. Renders at the top of
 * every page (mounted in the (app) layout) so it's always within reach.
 *
 * Clicking "Stop" clears the cookie, refreshes the route, and the
 * banner disappears.
 */
export function ImpersonationBanner(): JSX.Element | null {
  const session = useImpersonation();
  const router = useRouter();
  const [stopping, setStopping] = useState(false);

  if (!session) return null;

  const handleStop = async () => {
    setStopping(true);
    try {
      await stopImpersonation();
      router.refresh();
      // Force a full reload so cached components re-evaluate.
      if (typeof window !== 'undefined') window.location.reload();
    } catch {
      setStopping(false);
    }
  };

  return (
    <div
      className="sticky top-0 z-50 w-full border-b border-amber-500/40 bg-amber-500/10 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center gap-3 px-4 py-2 text-sm">
        <Eye className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
        <p className="flex-1 text-amber-100 truncate">
          <span className="font-semibold">Viewing as</span>{' '}
          <span className="font-mono">{session.asName}</span>
          {session.asEmail && (
            <span className="opacity-70"> &mdash; {session.asEmail}</span>
          )}
          <span className="ml-2 hidden md:inline opacity-70">
            (writes still attributed to {session.byName})
          </span>
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleStop}
          disabled={stopping}
          className="border-amber-400/40 text-amber-100 hover:bg-amber-500/20 hover:text-amber-50"
        >
          {stopping ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5 mr-1.5" />
          )}
          Stop impersonating
        </Button>
      </div>
    </div>
  );
}
