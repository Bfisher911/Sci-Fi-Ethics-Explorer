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
  /**
   * Additional keywords that take priority over theme/hint when present.
   * Used to pass sub-genre + ethical-focus for community stories so the
   * generated cover matches the author's tagged metadata.
   */
  keywords?: (string | undefined)[];
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
  height: number,
  extraKeywords?: (string | undefined)[]
): string {
  // Priority: explicit extra keywords (sub-genre, ethical focus) > theme
  // mapping > free-text hint > default sci-fi bucket.
  const cleanExtras = (extraKeywords || [])
    .filter((k): k is string => !!k && k.trim().length > 0)
    .map((k) => k.toLowerCase().trim().replace(/\s+/g, '-'));

  const themeKey = (theme || '').toLowerCase().trim();
  const themeKeywords = THEME_KEYWORDS[themeKey];

  const keywords =
    cleanExtras.length > 0
      ? cleanExtras.join(',')
      : themeKeywords ||
        (hint && hint.trim()) ||
        'cyberpunk,futuristic,neon,ethics';

  const seed = encodeURIComponent(title.slice(0, 60).toLowerCase());
  const query = encodeURIComponent(keywords);
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
  keywords,
  className,
  size = 'card',
}: DilemmaImageProps): JSX.Element {
  const [errored, setErrored] = useState(false);
  const [width, height] = size === 'detail' ? [1200, 675] : [600, 400];

  const keywordsKey = (keywords || []).filter(Boolean).join('|');
  const src = useMemo(() => {
    if (!isPlaceholder(imageUrl)) return imageUrl as string;
    return buildUnsplashUrl(title, theme, hint, width, height, keywords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, title, theme, hint, width, height, keywordsKey]);

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
