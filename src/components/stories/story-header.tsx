'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface StoryHeaderProps {
  /** Optional cover image URL. */
  imageUrl?: string;
  /** AI hint for the image (used as alt-text augmentation + data attribute). */
  imageHint?: string;
  /** Story title — used in alt text and as the displayed gradient fallback label. */
  title: string;
  /** Optional subtitle (genre · theme). */
  subtitle?: string;
  /**
   * Keywords used to pull a thematic cover from Unsplash when `imageUrl` is
   * not provided. For community stories this is the sub-genre + ethical-focus
   * tags so the cover matches the author's metadata.
   */
  fallbackKeywords?: (string | undefined)[];
  /** Aspect ratio class. Defaults to a wide cinematic 16:9-ish shape. */
  aspect?: 'video' | 'cinematic' | 'square';
  className?: string;
}

const ASPECT_CLASS: Record<NonNullable<StoryHeaderProps['aspect']>, string> = {
  video: 'aspect-video',          // 16:9
  cinematic: 'aspect-[16/9]',     // explicit 16:9 (matches placeholder size)
  square: 'aspect-square',
};

/**
 * Cinematic story header that renders the story's cover image with a graceful
 * fallback (branded gradient + scanline overlay) when the image is missing or
 * fails to load. Uses object-fit: cover so any aspect ratio fills the slot
 * cleanly without distortion.
 */
export function StoryHeader({
  imageUrl,
  imageHint,
  title,
  subtitle,
  fallbackKeywords,
  aspect = 'cinematic',
  className,
}: StoryHeaderProps): JSX.Element {
  const [errored, setErrored] = useState(false);

  // If the author didn't upload a cover but provided sub-genre / ethical-focus
  // keywords, pull a thematic cover from Unsplash Source rather than showing
  // the generic branded fallback.
  const resolvedKeywords = (fallbackKeywords || [])
    .filter((k): k is string => !!k && k.trim().length > 0)
    .slice(0, 4)
    .map((k) => k.toLowerCase().replace(/\s+/g, '-'))
    .join(',');

  const derivedSrc =
    imageUrl ||
    (resolvedKeywords
      ? `https://source.unsplash.com/1600x900/?${encodeURIComponent(
          resolvedKeywords
        )}&sig=${encodeURIComponent(title.slice(0, 60).toLowerCase())}`
      : undefined);

  const showImage = Boolean(derivedSrc) && !errored;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg border border-primary/20 bg-card',
        ASPECT_CLASS[aspect],
        className
      )}
    >
      {showImage ? (
        <Image
          src={derivedSrc as string}
          alt={`Cover art for ${title}${imageHint ? ` — ${imageHint}` : ''}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 800px, 1024px"
          className="object-cover"
          priority
          unoptimized={!imageUrl}
          onError={() => setErrored(true)}
          data-ai-hint={imageHint}
        />
      ) : (
        <BrandedFallback title={title} subtitle={subtitle} />
      )}

      {/* Scanline overlay — subtle horizontal lines reminiscent of a CRT terminal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)',
        }}
      />

      {/* Bottom gradient so any text overlay stays legible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent"
      />
    </div>
  );
}

function BrandedFallback({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
      style={{
        background:
          'radial-gradient(circle at 30% 20%, rgba(125,249,255,0.18), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,0,255,0.10), transparent 50%), linear-gradient(135deg, #0a0e27 0%, #14143a 50%, #1a1a4a 100%)',
      }}
    >
      {/* Faint geometric grid */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="story-fallback-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0v32" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#story-fallback-grid)" />
      </svg>

      <div className="relative z-10 space-y-2">
        <Sparkles className="h-8 w-8 mx-auto text-primary/70" />
        <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
          Sci-Fi Ethics
        </p>
        <h2 className="text-2xl md:text-4xl font-headline font-bold text-white drop-shadow-lg max-w-2xl mx-auto">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-foreground/70">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
