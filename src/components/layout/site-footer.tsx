/**
 * Site footer.
 *
 * Mounted in the root layout below all other content. Visible to both
 * signed-in and signed-out users — its main job is exposing legal
 * links (Privacy, Terms), the changelog, and contact paths so users
 * (and search engines / regulators) can find them.
 *
 * Pure server component — no client interactivity, no hooks.
 */

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: 'Textbook', href: '/textbook' },
  { label: 'Stories', href: '/stories' },
  { label: 'Pricing', href: '/pricing' },
  { label: "What's new", href: '/whats-new' },
  { label: 'Help', href: '/help' },
];

const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export function SiteFooter(): JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-auto border-t border-border/40 bg-background/60 py-8"
      role="contentinfo"
      // The reader-focus mode CSS hides the sidebar + header. We let
      // the footer stay visible since it's structurally important
      // (legal links + identity), but a future iteration could hide
      // it inside .reader-focus too if it proves distracting.
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-headline text-sm font-bold tracking-tight"
            >
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              Sci-Fi Ethics Explorer
            </Link>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Navigate the moral maze of the future through science fiction,
              philosophy, and your own ethical reasoning.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-2 md:gap-x-12"
          >
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Explore
              </div>
              <ul className="space-y-1.5 text-sm">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground/85 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Legal
              </div>
              <ul className="space-y-1.5 text-sm">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground/85 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border/30 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {year} Sci-Fi Ethics Explorer. All rights reserved.</p>
          <p className="opacity-70">
            Built for thinking through the futures we&apos;re actually building.
          </p>
        </div>
      </div>
    </footer>
  );
}
