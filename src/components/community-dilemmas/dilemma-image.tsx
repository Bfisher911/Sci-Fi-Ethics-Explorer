'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DilemmaImageProps {
  /** Explicit image URL if the dilemma author uploaded one. */
  imageUrl?: string;
  /** Dilemma title — used to seed a stable Unsplash query. */
  title: string;
  /** Dilemma theme (e.g., "AI", "Robotics", "Space"). */
  theme?: string;
  /** Free-text hint; combined with theme to build the Unsplash query. */
  hint?: string;
  /** Image aspect sizing. */
  className?: string;
  /** 400x300 for card, 1200x675 for detail page. */
  size?: 'card' | 'detail';
}

const THEME_KEYWORDS: Record<string, string> = {
  ai: 'cyberpunk,artificial-intelligence,neon',
  'artificial intelligence': 'cyberpunk,artificial-intelligence,neon',
  robotics: 'robotics,android,futuristic',
  robot: 'robotics,android,futuristic',
  space: 'space,nebula,cosmos',
  'space exploration': 'space,nebula,cosmos',
  biotech: 'biotech,dna,laboratory',
  genetics: 'biotech,dna,laboratory',
  surveillance: 'surveillance,neon,cyberpunk',
  dystopia: 'dystopia,neon-city,cyberpunk',
  dystopian: 'dystopia,neon-city,cyberpunk',
  climate: 'climate,futuristic-city,green',
  identity: 'portrait,futuristic,neon',
  consciousness: 'abstract,nebula,neon',
  memory: 'abstract,glitch,neon',
  war: 'cyberpunk,neon,conflict',
  ethics: 'futuristic,neon,abstract',
};

function buildUnsplashUrl(
  title: string,
  theme: string | undefined,
  hint: string | undefined,
  width: number,
  height: number
): string {
  const themeKey = (theme || '').toLowerCase().trim();
  const keywords =
    THEME_KEYWORDS[themeKey] ||
    (hint && hint.trim()) ||
    'cyberpunk,futuristic,neon,ethics';

  const seed = encodeURIComponent(title.slice(0, 60).toLowerCase());
  const query = encodeURIComponent(keywords);
  // source.unsplash.com is the keyless endpoint; the `sig=` seed pins the
  // image so two cards with the same title render the same picture.
  return `https://source.unsplash.com/${width}x${height}/?${query}&sig=${seed}`;
}

const PLACEHOLDER_HOSTS = ['placehold.co', 'placehold.it', 'placeholder.com'];

function isPlaceholder(url: string | undefined): boolean {
  if (!url) return true;
  return PLACEHOLDER_HOSTS.some((h) => url.includes(h));
}

/**
 * Image component for Community Dilemma cards and detail pages.
 * - Uses the author's uploaded image if present and non-placeholder.
 * - Otherwise pulls a keyless Unsplash Source image keyed to the dilemma's
 *   theme/hint/title, so every dilemma gets a thematically consistent cover.
 * - Falls back to a branded gradient if the Unsplash request fails.
 */
export function DilemmaImage({
  imageUrl,
  title,
  theme,
  hint,
  className,
  size = 'card',
}: DilemmaImageProps): JSX.Element {
  const [errored, setErrored] = useState(false);
  const [width, height] = size === 'detail' ? [1200, 675] : [600, 400];

  const src = useMemo(() => {
    if (!isPlaceholder(imageUrl)) return imageUrl as string;
    return buildUnsplashUrl(title, theme, hint, width, height);
  }, [imageUrl, title, theme, hint, width, height]);

  if (errored) {
    return (
      <div
        className={cn(
          'relative w-full h-full flex items-center justify-center',
          className
        )}
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(125,249,255,0.18), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,0,255,0.10), transparent 50%), linear-gradient(135deg, #0a0e27 0%, #14143a 50%, #1a1a4a 100%)',
        }}
        aria-label={`Cover for ${title}`}
      >
        <span className="text-xs uppercase tracking-[0.3em] text-primary/70">
          {theme || 'Dilemma'}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`Cover for ${title}`}
      fill
      className={cn('object-cover', className)}
      sizes={size === 'detail' ? '(max-width: 1024px) 100vw, 1024px' : '(max-width: 768px) 100vw, 400px'}
      unoptimized
      onError={() => setErrored(true)}
      data-ai-hint={hint || theme?.toLowerCase() || 'sci-fi dilemma'}
    />
  );
}
