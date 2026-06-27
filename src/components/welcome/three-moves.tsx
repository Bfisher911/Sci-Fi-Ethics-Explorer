'use client';

/**
 * ThreeMoves — a tall, pinned "Read → Decide → Reflect" sequence. The
 * heading stays sticky while each step scrolls past and animates in via
 * CSS scroll-driven timelines (.fx-step). Reduced-motion / unsupported
 * browsers simply see all three steps, fully visible.
 */

const STEPS = [
  { n: '01', label: 'Read', body: 'A chapter, a story, a dilemma worth arguing about.' },
  { n: '02', label: 'Decide', body: 'Make the call. Watch where each path actually leads.' },
  { n: '03', label: 'Reflect', body: 'Your reasoning compounds into a living ethics profile.' },
];

export function ThreeMoves() {
  return (
    <section className="relative border-y border-border/40 bg-background/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1fr_1.4fr] md:py-28">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            Three moves, one habit of mind
          </h2>
          <p className="mt-4 max-w-sm text-muted-foreground">
            The loop you&apos;ll run on every hard question — until reasoning
            well becomes reflex.
          </p>
        </div>

        <ol className="flex flex-col gap-6">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="fx-step surface-card flex items-start gap-5 rounded-2xl p-6 md:p-8"
            >
              <span className="font-display text-3xl font-medium text-primary/80 md:text-4xl">
                {s.n}
              </span>
              <div>
                <h3 className="text-xl font-semibold">{s.label}</h3>
                <p className="mt-1.5 leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
