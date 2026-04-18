'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface RevealOnScrollProps {
  children: ReactNode;
  /** Direction the element travels from before settling. Default 'up'. */
  from?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Delay in ms before this element starts animating once it intersects. */
  delay?: number;
  /** How far (in pixels) the element should travel. Default 16. */
  distance?: number;
  /** Animation duration in ms. Default 600. */
  duration?: number;
  /** When true, animate every time the element enters the viewport
   *  (instead of just the first time). Default false. */
  repeat?: boolean;
  /** Optional className passed through to the wrapper. */
  className?: string;
  /** Optional inline styles. */
  style?: CSSProperties;
}

/**
 * Wraps any block-level content in a one-shot fade + translate
 * animation that fires the first time the element scrolls into view.
 *
 * Implementation notes:
 *   - Uses the native IntersectionObserver — no animation library, no
 *     extra bytes shipped. Falls back to "always visible" when IO is
 *     unavailable (older browsers, SSR pre-hydration, prefers-reduced-
 *     motion users).
 *   - Respects `prefers-reduced-motion: reduce` and skips the
 *     animation entirely for those users.
 *   - The wrapping div is `transform-gpu` so the transition stays
 *     buttery on long lists; `will-change` is added only while the
 *     animation is in flight to avoid layer-thrashing on huge pages.
 *   - Designed to be compositional: drop it around any card, hero,
 *     or section block. No layout shift — the element occupies its
 *     final size from first paint and only transitions its opacity
 *     and transform.
 */
export function RevealOnScroll({
  children,
  from = 'up',
  delay = 0,
  distance = 16,
  duration = 600,
  repeat = false,
  className,
  style,
}: RevealOnScrollProps): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!repeat) io.unobserve(entry.target);
          } else if (repeat) {
            setVisible(false);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [repeat, reducedMotion]);

  const offsetTransform = (() => {
    if (visible || reducedMotion) return 'translate3d(0, 0, 0)';
    switch (from) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'none':
        return 'none';
    }
  })();

  return (
    <div
      ref={ref}
      className={cn('transform-gpu', className)}
      style={{
        opacity: visible || reducedMotion ? 1 : 0,
        transform: offsetTransform,
        transition: reducedMotion
          ? 'none'
          : `opacity ${duration}ms cubic-bezier(.22, 1, .36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(.22, 1, .36, 1) ${delay}ms`,
        willChange: visible ? 'auto' : 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Convenience wrapper for animating a list of children with a
 * cascading delay. Handy for tile grids and card lists where each
 * subsequent item should pop in slightly after the previous one.
 *
 * Caps the per-item delay at `maxDelay` so a long list doesn't end up
 * waiting 5 seconds for the last card to appear.
 */
interface RevealStaggerProps {
  children: ReactNode[];
  /** Delay step in ms between successive children. Default 80. */
  step?: number;
  /** Maximum cumulative delay for any single child. Default 600. */
  maxDelay?: number;
  from?: RevealOnScrollProps['from'];
  className?: string;
}

export function RevealStagger({
  children,
  step = 80,
  maxDelay = 600,
  from = 'up',
  className,
}: RevealStaggerProps): JSX.Element {
  return (
    <>
      {children.map((child, i) => (
        <RevealOnScroll
          key={i}
          from={from}
          delay={Math.min(i * step, maxDelay)}
          className={className}
        >
          {child}
        </RevealOnScroll>
      ))}
    </>
  );
}
