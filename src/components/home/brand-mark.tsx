import { cn } from '@/lib/utils';

/**
 * BrandMark — the Sci-Fi Ethics Explorer glyph.
 *
 * An orbital ring around a still core: the science-fiction orbit
 * (motion, technology, the future) circling a fixed ethical center
 * (the question that doesn't move). Drawn from theme tokens so it
 * tracks light / dark / low-stim automatically.
 */
export function BrandMark({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('h-7 w-7', className)}
      fill="none"
      aria-hidden="true"
    >
      {/* Orbit — the technological / sci-fi sweep. */}
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6.2"
        transform="rotate(-28 16 16)"
        stroke="hsl(var(--accent))"
        strokeOpacity="0.6"
        strokeWidth="1.4"
      />
      {/* The fixed ethical core. */}
      <circle cx="16" cy="16" r="5.4" stroke="hsl(var(--primary))" strokeWidth="1.7" />
      <circle cx="16" cy="16" r="1.9" fill="hsl(var(--primary))" />
      {/* Orbiting node, riding the ring. */}
      <circle cx="27.4" cy="10.2" r="1.7" fill="hsl(var(--accent))" />
    </svg>
  );
}
