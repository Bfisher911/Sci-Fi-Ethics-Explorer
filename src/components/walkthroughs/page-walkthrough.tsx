'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export interface WalkthroughStep {
  /** CSS selector for the element to highlight. */
  element: string;
  title: string;
  description: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

interface PageWalkthroughProps {
  /** Unique key for localStorage to track whether the tour has been seen. */
  storageKey: string;
  steps: WalkthroughStep[];
  /** Whether to auto-start on first visit. Default true. */
  autoStart?: boolean;
  /** Button label. */
  label?: string;
}

/**
 * Reusable driver.js walkthrough component. Auto-starts on first visit
 * (per localStorage key), renders a "Take the tour" button for re-launch.
 */
export function PageWalkthrough({
  storageKey,
  steps,
  autoStart = true,
  label = 'Take the tour',
}: PageWalkthroughProps): JSX.Element {
  const driverRef = useRef<any>(null);

  const startTour = useCallback(async () => {
    try {
      const mod = await import('driver.js');
      const driver = (mod as any).driver ?? (mod as any).default;

      if (typeof document !== 'undefined' && !document.getElementById('driverjs-css')) {
        const link = document.createElement('link');
        link.id = 'driverjs-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css';
        document.head.appendChild(link);
      }

      const d = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Got it',
        steps: steps.map((s) => ({
          element: s.element,
          popover: {
            title: s.title,
            description: s.description,
            side: s.side || 'bottom',
          },
        })),
      });
      driverRef.current = d;
      d.drive();
      try {
        localStorage.setItem(storageKey, 'true');
      } catch {
        // non-fatal
      }
    } catch (err) {
      console.error('[PageWalkthrough] failed:', err);
    }
  }, [storageKey, steps]);

  useEffect(() => {
    if (!autoStart || typeof window === 'undefined') return;
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === 'true';
    } catch {
      // ignore
    }
    if (seen) return;
    const t = setTimeout(() => void startTour(), 1200);
    return () => clearTimeout(t);
  }, [autoStart, storageKey, startTour]);

  return (
    <Button variant="outline" size="sm" onClick={startTour} type="button">
      <Compass className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
