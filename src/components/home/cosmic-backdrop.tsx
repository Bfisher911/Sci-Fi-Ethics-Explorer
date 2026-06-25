/**
 * CosmicBackdrop — the atmospheric layer behind the hero.
 *
 * Built entirely from CSS + inline SVG (no raster image, no network
 * cost, no layout shift). Three layers, back to front:
 *   1. Faint technical grid (the "blueprint of the future")
 *   2. Slow-drifting aurora glow blobs (cyan + magenta brand light)
 *   3. A deterministic starfield (seeded so SSR and client match)
 *
 * All animation is covered by the global prefers-reduced-motion guard,
 * so reduced-motion users get a calm, static scene.
 */

// Deterministic pseudo-random star layout. A seeded LCG keeps the
// output identical on server and client (no hydration mismatch) while
// avoiding a hand-written 60-element array.
function makeStars(count: number) {
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    cx: +(rand() * 100).toFixed(2),
    cy: +(rand() * 72).toFixed(2), // bias toward the upper sky
    r: +(0.4 + rand() * 1.1).toFixed(2),
    delay: +(rand() * 4).toFixed(2),
    dur: +(3 + rand() * 3.5).toFixed(2),
  }));
}

const STARS = makeStars(64);

export function CosmicBackdrop(): JSX.Element {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Technical grid, faded out toward the edges. */}
      <div className="absolute inset-0 bg-grid-faint [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]" />

      {/* Aurora glow blobs — slow organic drift. */}
      <div className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 animate-aurora rounded-full bg-primary/20 blur-[130px]" />
      <div className="absolute -right-40 top-24 h-[34rem] w-[34rem] animate-aurora rounded-full bg-accent/20 blur-[130px] [animation-delay:-6s]" />
      <div className="absolute -left-32 top-1/2 h-[30rem] w-[30rem] animate-aurora rounded-full bg-primary/10 blur-[120px] [animation-delay:-12s]" />

      {/* Starfield — percentage coords so it scales with the container. */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.cx}%`}
            cy={`${s.cy}%`}
            r={s.r}
            className="animate-twinkle fill-foreground"
            style={{
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      </svg>

      {/* Clean fade into the page background at the bottom. */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
