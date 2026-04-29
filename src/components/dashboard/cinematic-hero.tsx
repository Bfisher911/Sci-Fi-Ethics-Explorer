'use client';

/**
 * CinematicHero — full-bleed dashboard centerpiece.
 *
 * Extracted from dashboard.tsx so the dashboard can lazy-load it via
 * next/dynamic. The hero ships ~250 lines of layered gradients +
 * inline styles + a Resume Reading inset panel; pulling it out of
 * the critical bundle drops first-load JS for users who scroll past
 * fast (or for whom auth is still resolving).
 *
 * Public exports:
 *   - <CinematicHero />               the component
 *   - splitForGradient                helper for the cyan→magenta title
 *   - ResumePayload, DilemmaPayload, CinematicHeroProps   types
 */

import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookMarked,
  Loader2,
} from 'lucide-react';

export interface ResumePayload {
  chapter: number;
  totalChapters: number;
  title: string;
  subtitle: string;
  percent: number;
  /** Estimated reading time of the chapter (whole-chapter, including the
   *  short story). The earlier `minutesLeft` label was misleading because
   *  we don't track scroll-position remaining; this is the chapter's
   *  total estimate. */
  estimatedMinutes: number;
  cover: string;
  href: string;
}

export interface DilemmaPayload {
  id: string;
  eyebrow: string;
  title: string;
  splitTitle: readonly [string, string];
  description: string;
  genre?: string;
  theme?: string;
  author?: string;
  cover: string;
  href: string;
}

export interface CinematicHeroProps {
  /** `null` means no real story to render — the hero shows its
   *  explicit empty state rather than fake copy with dead links. */
  dilemma: DilemmaPayload | null;
  resume: ResumePayload;
  onSave: () => void | Promise<void>;
  savedState: 'idle' | 'saving' | 'saved';
  /** Whether the bookmark CTA can act — false when the user is
   *  signed out. Renders a disabled button with a tooltip hint. */
  canSave: boolean;
  /** When true, the hero renders at ~half height with smaller copy.
   *  Activated for repeat visits in the same day so returning users
   *  don't have to scroll past 460px of cinematic real estate every
   *  time. See Dashboard's lastVisit localStorage logic. */
  compact?: boolean;
}

export function CinematicHero({
  dilemma,
  resume,
  onSave,
  savedState,
  canSave,
  compact = false,
}: CinematicHeroProps): JSX.Element {
  const heroMinHeight = compact ? 240 : 460;
  const heroPadding = compact ? 'p-5 md:p-6' : 'p-8 md:p-10';
  const titleClampedFontSize = compact
    ? 'clamp(28px, 3.5vw, 44px)'
    : 'clamp(38px, 5.5vw, 68px)';
  // No real story to headline the hero — render an explicit empty
  // state with actionable CTAs (submit / browse) instead of fake
  // copy linking to the generic index.
  if (!dilemma) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border p-8 md:p-10"
        style={{
          minHeight: 320,
          backgroundImage:
            'radial-gradient(ellipse at 20% 30%, hsl(181 100% 35% / 0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, hsl(300 100% 45% / 0.25) 0%, transparent 55%), linear-gradient(135deg, #1a1050 0%, #060018 60%, #2a0040 100%)',
          borderColor: 'hsl(var(--border) / 0.5)',
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            No dilemma staged
          </div>
          <h1 className="m-0 max-w-xl font-headline text-3xl font-bold leading-tight text-white md:text-4xl">
            Nothing in the library yet.
          </h1>
          <p className="max-w-xl text-sm text-white/80">
            Submit a dilemma of your own, or pick up where you left off in the textbook.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/submit-dilemma"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-[12px] font-bold uppercase tracking-[0.14em] text-primary-foreground"
            >
              Submit a Dilemma <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={resume.href}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/30 bg-white/5 px-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-white"
            >
              Continue Chapter {resume.chapter}
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{
        minHeight: heroMinHeight,
        // Layered backdrop: the cover SVG via CSS background-image
        // (silently fails — never shows a broken-image icon) on top
        // of a vivid cinematic gradient that's tinted toward the
        // primary cyan / accent magenta. If the SVG renders the cover
        // wins; if it doesn't, the gradient is the hero — either way
        // the section looks intentional, never broken.
        backgroundImage: `url("${dilemma.cover}"), radial-gradient(ellipse at 20% 30%, hsl(181 100% 35% / 0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, hsl(300 100% 45% / 0.45) 0%, transparent 55%), linear-gradient(135deg, #1a1050 0%, #060018 60%, #2a0040 100%)`,
        backgroundSize: 'cover, cover, cover, cover',
        backgroundPosition: 'center, center, center, center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#060018',
        borderColor: 'hsl(var(--border) / 0.5)',
      }}
    >
      {/* Protection gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(95deg, rgba(10,6,30,0.95) 0%, rgba(10,6,30,0.75) 40%, rgba(10,6,30,0.2) 70%, rgba(10,6,30,0.9) 100%), linear-gradient(180deg, transparent 40%, rgba(10,6,30,0.9) 100%)',
        }}
      />
      {/* Magenta glow streak */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, hsl(300 100% 50% / 0.35) 0%, transparent 60%)',
        }}
      />
      {/* Electric blue streak */}
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: -200,
          left: -100,
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, hsl(181 100% 74% / 0.25) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div
        className={`relative grid items-end gap-6 ${heroPadding} lg:grid-cols-[1.5fr_1fr]`}
        style={{ minHeight: heroMinHeight }}
      >
        <div className="flex flex-col gap-3.5">
          <div
            className="inline-flex w-fit items-center gap-2.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            style={{
              background: 'hsl(var(--accent))',
              boxShadow: '0 0 20px hsl(var(--accent) / 0.6)',
            }}
          >
            <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-white" />
            {dilemma.eyebrow}
          </div>
          <h1
            className="m-0 font-headline font-bold text-white"
            style={{
              fontSize: titleClampedFontSize,
              lineHeight: 1,
              letterSpacing: '-0.035em',
              textShadow: '0 2px 40px rgba(0,0,0,0.7)',
            }}
          >
            {dilemma.splitTitle[0]}
            {dilemma.splitTitle[1] && (
              <>
                <br />
                <span
                  style={{
                    background:
                      'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {dilemma.splitTitle[1]}
                </span>
              </>
            )}
          </h1>
          <p
            className="m-0 max-w-xl text-base text-white/85"
            style={{
              lineHeight: 1.5,
              textShadow: '0 1px 20px rgba(0,0,0,0.5)',
            }}
          >
            {dilemma.description}
          </p>
          {(dilemma.genre || dilemma.theme || dilemma.author) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              {dilemma.genre && (
                <span>
                  <span className="text-primary">Genre</span>&nbsp;&nbsp;{dilemma.genre}
                </span>
              )}
              {dilemma.theme && (
                <>
                  <span className="opacity-40">·</span>
                  <span>
                    <span className="text-primary">Theme</span>&nbsp;&nbsp;{dilemma.theme}
                  </span>
                </>
              )}
              {dilemma.author && (
                <>
                  <span className="opacity-40">·</span>
                  <span>
                    <span className="text-primary">By</span>&nbsp;&nbsp;{dilemma.author}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={dilemma.href}
              className="inline-flex h-[52px] items-center justify-center px-7 text-[13px] font-bold uppercase tracking-[0.14em] text-primary-foreground"
              style={{
                background: 'hsl(var(--primary))',
                transform: 'skewX(-10deg)',
                boxShadow: '0 0 30px hsl(var(--primary) / 0.5)',
              }}
            >
              <span className="inline-flex items-center gap-2.5" style={{ transform: 'skewX(10deg)' }}>
                Enter Dilemma
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            {/* Save → icon-only button. The previous full-width "Save"
                button competed with "Enter Dilemma" for visual weight
                and added an extra decision; an icon expresses the
                affordance without diluting the primary CTA. */}
            <button
              type="button"
              onClick={() => {
                if (!canSave) return;
                void onSave();
              }}
              disabled={!canSave || savedState !== 'idle'}
              aria-label={
                savedState === 'saved'
                  ? 'Saved to your bookmarks'
                  : canSave
                    ? 'Save this story to your bookmarks'
                    : 'Sign in to save'
              }
              title={
                savedState === 'saved'
                  ? 'Saved'
                  : canSave
                    ? 'Save'
                    : 'Sign in to save'
              }
              className="grid h-[52px] w-[52px] place-items-center rounded-full border text-white backdrop-blur transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: savedState === 'saved'
                  ? 'hsl(var(--accent) / 0.85)'
                  : 'rgba(255,255,255,0.06)',
                borderColor: savedState === 'saved'
                  ? 'hsl(var(--accent))'
                  : 'rgba(255,255,255,0.3)',
              }}
            >
              {savedState === 'saving' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : savedState === 'saved' ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Inset Resume Reading panel */}
        <div
          className="flex w-full max-w-sm flex-col gap-3 justify-self-end rounded-xl border p-5 backdrop-blur"
          style={{
            borderColor: 'rgba(125,249,255,0.3)',
            background: 'rgba(10,6,30,0.65)',
          }}
        >
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            <BookMarked className="h-2.5 w-2.5" />
            Resume Where You Left Off
          </div>
          <div>
            <div className="mb-1 line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">
              {resume.subtitle}
            </div>
            <div className="line-clamp-2 text-[17px] font-bold leading-tight text-white">
              {resume.title}
            </div>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full"
              style={{
                width: `${resume.percent}%`,
                background:
                  'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                boxShadow: '0 0 10px hsl(var(--primary))',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span>
              {resume.percent}% complete · ≈ {resume.estimatedMinutes} min read
            </span>
            <Link
              href={resume.href}
              className="font-semibold text-primary hover:text-accent"
            >
              Continue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Pull a "Title.<gradient piece>" split out of a long string. The
 * design renders the second half of the title with a cyan→magenta
 * gradient — heuristically split on the last word so it reads
 * cleanly.
 */
export function splitForGradient(title: string): readonly [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return [title, ''];
  if (words.length === 2) return [words[0], words[1] + '.'];
  // Last 1–2 words for the gradient half
  const tailCount = words.length >= 5 ? 2 : 1;
  const head = words.slice(0, words.length - tailCount).join(' ');
  const tail = words.slice(-tailCount).join(' ');
  return [head, tail.endsWith('.') ? tail : tail + '.'];
}

