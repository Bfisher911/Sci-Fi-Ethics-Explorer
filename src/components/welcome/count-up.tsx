'use client';

/**
 * CountUp — animates a number from 0 to `value` the first time it
 * scrolls into view. Reduced-motion users get the final value
 * immediately. Tabular figures keep the layout from reflowing.
 */

import { useEffect, useRef, useState } from 'react';

export function CountUp({
  value,
  reducedMotion,
  suffix = '',
}: {
  value: number;
  reducedMotion: boolean;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(reducedMotion ? value : 0);
  const done = useRef(reducedMotion);

  useEffect(() => {
    if (done.current) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();
        const start = performance.now();
        const dur = 1100;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(eased * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}
