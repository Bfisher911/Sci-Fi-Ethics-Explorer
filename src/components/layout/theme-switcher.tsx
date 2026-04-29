'use client';

/**
 * Theme switcher — toggles between three "presentation themes" that
 * sit on top of the existing dark/light theme system:
 *
 *   default        — the standard cyan + magenta sci-fi palette.
 *   low-stim       — desaturated, calm; magenta swapped for muted cyan.
 *                    Disables non-essential animations.
 *   high-contrast  — boosts text/border contrast, removes glass blurs.
 *
 * Implemented as classes on `<html>` (`theme-low-stim` /
 * `theme-high-contrast`) — globals.css has the rules. Persists the
 * choice to `localStorage.sfe.themeVariant` and re-hydrates on mount.
 *
 * Used inside the user menu in app-header.tsx and on /profile.
 */

import { useEffect, useState } from 'react';
import { Eye, Moon, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

type ThemeVariant = 'default' | 'low-stim' | 'high-contrast';

const STORAGE_KEY = 'sfe.themeVariant';

const VARIANTS: {
  id: ThemeVariant;
  label: string;
  blurb: string;
  icon: typeof Eye;
}[] = [
  {
    id: 'default',
    label: 'Default',
    blurb: 'The standard cyan + magenta palette.',
    icon: Palette,
  },
  {
    id: 'low-stim',
    label: 'Low-stim',
    blurb: 'Calmer colors, fewer animations.',
    icon: Moon,
  },
  {
    id: 'high-contrast',
    label: 'High contrast',
    blurb: 'Stronger borders, no glass blurs.',
    icon: Eye,
  },
];

export function applyThemeVariant(variant: ThemeVariant): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.classList.remove('theme-low-stim', 'theme-high-contrast');
  if (variant === 'low-stim') html.classList.add('theme-low-stim');
  if (variant === 'high-contrast') html.classList.add('theme-high-contrast');
  try {
    localStorage.setItem(STORAGE_KEY, variant);
  } catch {
    // ignore — private browsing
  }
}

export function readStoredVariant(): ThemeVariant {
  if (typeof window === 'undefined') return 'default';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'low-stim' || v === 'high-contrast') return v;
  } catch {
    // ignore
  }
  return 'default';
}

/**
 * Mounted once near the root (in the AppLayout's `<body>` tree) to
 * apply the stored variant on every page load. Returns null — purely
 * a side-effect component. Renders before any visible content so the
 * user doesn't see the default theme flash.
 */
export function ThemeVariantHydrator(): null {
  useEffect(() => {
    applyThemeVariant(readStoredVariant());
  }, []);
  return null;
}

export function ThemeSwitcher(): JSX.Element {
  const [variant, setVariant] = useState<ThemeVariant>('default');

  useEffect(() => {
    setVariant(readStoredVariant());
  }, []);

  function pick(v: ThemeVariant) {
    setVariant(v);
    applyThemeVariant(v);
  }

  return (
    <div role="radiogroup" aria-label="Visual theme" className="space-y-1.5">
      {VARIANTS.map((v) => {
        const active = variant === v.id;
        const Icon = v.icon;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => pick(v.id)}
            className={cn(
              'flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors',
              active
                ? 'border-primary bg-primary/10'
                : 'border-border/40 hover:border-primary/40 hover:bg-muted/30',
            )}
          >
            <Icon
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">
                {v.label}
                {active && (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Active
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{v.blurb}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
