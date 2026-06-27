'use client';

/**
 * HeroScene — lazy boundary for the WebGL hero. The shader canvas is
 * dynamically imported (ssr:false) so none of its code ships in the
 * initial bundle and it never runs on the server. Until it loads — and
 * permanently for reduced-motion / incapable devices — a pure-CSS
 * gradient + the existing CosmicBackdrop show through, so the hero is
 * never blank.
 */

import dynamic from 'next/dynamic';
import { CosmicBackdrop } from '@/components/home/cosmic-backdrop';

const HeroCanvas = dynamic(() => import('./hero-canvas'), {
  ssr: false,
  loading: () => null,
});

function StaticFallback() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(ellipse_at_80%_30%,hsl(var(--accent)/0.16),transparent_55%)]" />
      <CosmicBackdrop />
    </div>
  );
}

export function HeroScene({
  lean,
  reducedMotion,
  webglEnabled,
}: {
  lean: number;
  reducedMotion: boolean;
  webglEnabled: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Always-present calm base; the canvas paints over it when ready. */}
      <StaticFallback />
      {webglEnabled && <HeroCanvas lean={lean} reducedMotion={reducedMotion} />}
      {/* Bottom fade into the page background for a clean seam. */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
