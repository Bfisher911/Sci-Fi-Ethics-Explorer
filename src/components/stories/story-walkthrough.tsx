'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

const STORAGE_KEY = 'sfe.storyCreatorWalkthrough.completed';

interface StoryWalkthroughProps {
  /** When true, suppresses auto-trigger logic. Used to avoid
   *  showing the tour during initial loads or in edit mode. */
  disableAutoStart?: boolean;
}

/**
 * Driver.js-based guided tour for the story creator. Auto-starts the
 * first time a user visits /create-story. Can be re-launched anytime
 * via the "Take the tour" button this component renders.
 */
export function StoryWalkthrough({ disableAutoStart = false }: StoryWalkthroughProps): JSX.Element {
  const driverRef = useRef<any>(null);

  const startTour = async (): Promise<void> => {
    try {
      const mod = await import('driver.js');
      // driver.js v1 exposes `driver` named export
      const driver = (mod as any).driver ?? (mod as any).default;

      // Inject the CSS once (driver.js stylesheet)
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
        steps: [
          {
            element: '[data-tour="step-tabs"]',
            popover: {
              title: 'Step-by-step creation',
              description:
                'Stories are built in four steps: <strong>Metadata</strong> → <strong>Segments</strong> → <strong>Preview</strong> → <strong>Submit</strong>. The progress bar above shows where you are.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="metadata-form"], [data-tour="step-tabs"]',
            popover: {
              title: 'Metadata: world rules',
              description:
                'Genre and theme set the <strong>world rules</strong> for your story. They guide the AI reflection at the end and help readers find your story by topic.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="template-picker"]',
            popover: {
              title: 'Start from a template',
              description:
                'New to branching narratives? Pick a template — Hero\'s Choice, Investigation, Ethical Trap, or others — and the editor pre-populates a working structure you can rewrite.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="segment-editor"], [data-tour="step-tabs"]',
            popover: {
              title: 'Segments: the building blocks',
              description:
                '<strong>Linear</strong> segments flow automatically to the next one. <strong>Branching</strong> segments end with choices the reader makes, leading to different paths.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="story-flow-map"], [data-tour="step-tabs"]',
            popover: {
              title: 'See your story flow',
              description:
                'The flow map at the top of the segments step visualizes the structure. Linear segments are connected by arrows; branching segments fan out by choice. Click any node to jump to it.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="preview"], [data-tour="step-tabs"]',
            popover: {
              title: 'Playtest before you submit',
              description:
                'The Preview step shows the story exactly as a reader would see it — including branching paths. Walk through it once. You\'ll catch issues you\'ll never spot in the editor.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="save-draft"], [data-tour="step-tabs"]',
            popover: {
              title: 'Save anytime',
              description:
                'Use <strong>Save as Draft</strong> at any point. Drafts only show on your profile and don\'t appear publicly. Auto-save kicks in once you\'ve saved for the first time.',
              side: 'bottom',
            },
          },
        ],
      });

      driverRef.current = d;
      d.drive();

      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // localStorage might be unavailable; non-fatal
      }
    } catch (err) {
      console.error('[StoryWalkthrough] failed to start tour:', err);
    }
  };

  useEffect(() => {
    if (disableAutoStart) return;
    if (typeof window === 'undefined') return;
    let completed: string | null = null;
    try {
      completed = localStorage.getItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    if (completed === 'true') return;

    // Wait a beat for the editor to mount and refs to be in the DOM
    const t = setTimeout(() => {
      void startTour();
    }, 800);
    return () => clearTimeout(t);
  }, [disableAutoStart]);

  return (
    <Button variant="outline" size="sm" onClick={startTour} type="button">
      <Compass className="h-4 w-4 mr-2" />
      Take the tour
    </Button>
  );
}
