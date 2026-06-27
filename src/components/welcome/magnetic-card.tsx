'use client';

/**
 * MagneticCard — a card that tilts toward the pointer and shows a
 * radial spotlight that tracks the cursor (via --mx/--my). Only active
 * when `enabled` (fine pointer + motion allowed); otherwise it's a
 * plain static card.
 */

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function MagneticCard({
  children,
  enabled,
  className,
}: {
  children: ReactNode;
  enabled: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
    const rx = (py - 0.5) * -6;
    const ry = (px - 0.5) * 6;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = '';
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn('fx-card surface-card rounded-2xl', className)}
    >
      {children}
    </div>
  );
}
