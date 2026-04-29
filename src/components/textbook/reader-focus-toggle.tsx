'use client';

/**
 * Reader focus mode — strips the chrome (sidebar, header, banners) so
 * only the chapter prose remains. Toggled by the user.
 *
 * Implementation:
 *   - Adds/removes `reader-focus` class on `<html>`. globals.css has
 *     the `display: none` rules for the hidden chrome.
 *   - Adds a fixed "Exit focus" pill near the top-right so the user
 *     can leave the mode without keyboard shortcuts (though Esc also
 *     works).
 *   - State is component-local and intentionally NOT persisted —
 *     focus mode should be a deliberate per-session choice, not a
 *     preference that surprises returning users.
 */

import { useCallback, useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ReaderFocusToggle(): JSX.Element {
  const [active, setActive] = useState(false);

  const setMode = useCallback((on: boolean) => {
    if (typeof document === 'undefined') return;
    if (on) {
      document.documentElement.classList.add('reader-focus');
    } else {
      document.documentElement.classList.remove('reader-focus');
    }
    setActive(on);
  }, []);

  // Esc to exit focus mode.
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMode(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, setMode]);

  // Cleanup on unmount — never leave the body class behind.
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('reader-focus');
      }
    };
  }, []);

  if (active) {
    // While focus is on, render an exit pill that floats top-right via
    // a `data-focus-bar` attribute the CSS targets to ensure it stays
    // visible. Using `display: flex` rule in globals.css keeps it
    // above hidden header elements.
    return (
      <div
        data-focus-bar
        className="fixed right-4 top-4 z-[60] hidden items-center gap-2"
      >
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 bg-background/80 backdrop-blur"
          onClick={() => setMode(false)}
          aria-label="Exit focus mode (Esc)"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          Exit focus
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      onClick={() => setMode(true)}
      title="Hide sidebar + header for distraction-free reading (Esc to exit)"
    >
      <Maximize2 className="h-3.5 w-3.5" />
      Focus mode
    </Button>
  );
}
