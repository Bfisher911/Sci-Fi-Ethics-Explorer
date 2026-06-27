'use client';

/**
 * CustomCursor — a small reticle that follows the pointer and grows
 * over interactive elements (anything matching a/button/[data-cursor]).
 * Only mounted by the parent when the pointer is fine and motion is
 * allowed, so touch and reduced-motion users never see it.
 */

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = ref.current;
    if (!dot) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = e.target as HTMLElement;
      const interactive = !!target.closest('a, button, [data-cursor-grow]');
      dot.dataset.active = interactive ? 'true' : 'false';
    };
    const render = () => {
      dot.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(render);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="fx-cursor" aria-hidden="true" />;
}
