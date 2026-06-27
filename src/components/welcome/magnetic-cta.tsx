'use client';

/**
 * MagneticCTA — the primary call-to-action. When motion is enabled and
 * the pointer is fine, the button drifts toward the cursor within a
 * radius and emits a small spark burst on click before navigating.
 * Otherwise it's a normal link button. Navigation is never blocked by
 * the effect.
 */

import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MagneticCTA({
  href,
  children,
  enabled,
  className,
}: {
  href: string;
  children: ReactNode;
  enabled: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    el.style.transform = `translate(${(e.clientX - cx) * 0.25}px, ${(e.clientY - cy) * 0.35}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = '';
  };

  const burst = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span');
      const a = (Math.PI * 2 * i) / 10;
      s.style.cssText = `position:absolute;left:${e.nativeEvent.offsetX}px;top:${e.nativeEvent.offsetY}px;width:5px;height:5px;border-radius:9999px;background:hsl(var(--primary));pointer-events:none;--dx:${Math.cos(a) * 44}px;--dy:${Math.sin(a) * 44}px;animation:fx-spark .55s var(--ease-expo) forwards;`;
      el.appendChild(s);
      window.setTimeout(() => s.remove(), 600);
    }
  };

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onClick={burst}
      className={cn(
        'cta-glow relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-transform duration-200 ease-out',
        className,
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
