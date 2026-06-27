'use client';

/**
 * MarketingHeader — sticky, scroll-aware top bar for the marketing home.
 *
 * Transparent over the hero; on scroll it settles into a frosted-glass
 * bar with a hairline border so it reads cleanly over content. The
 * primary CTA carries a subtle brand glow.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrandMark } from './brand-mark';

/** Primary marketing nav (public pages). Kept in one place so the home,
 *  about, and pricing pages all share an identical top nav. */
const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Textbook', href: '/textbook' },
];

export function MarketingHeader(): JSX.Element {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on Escape for keyboard users.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-300 ease-expo',
        scrolled || mobileOpen
          ? 'border-b border-border/60 bg-background/70 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandMark className="h-7 w-7 transition-transform duration-500 ease-expo group-hover:rotate-[20deg]" />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Sci-Fi Ethics Explorer
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className="hidden text-foreground/80 hover:text-foreground sm:inline-flex"
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <Button
            asChild
            variant="ghost"
            className="hidden text-foreground/80 hover:text-foreground sm:inline-flex"
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="ml-1 hidden shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_0_18px_-2px_hsl(var(--primary)/0.55)] transition-shadow duration-300 ease-expo hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.7),0_0_28px_-2px_hsl(var(--primary)/0.7)] sm:inline-flex"
          >
            <Link href="/stories" className="flex items-center gap-1.5">
              Start
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          {/* Mobile: keep the CTA, collapse the rest behind a menu. */}
          <Button
            asChild
            size="sm"
            className="shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_0_18px_-2px_hsl(var(--primary)/0.55)] sm:hidden"
          >
            <Link href="/stories">Start</Link>
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="marketing-mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile dropdown menu. */}
      {mobileOpen && (
        <div
          id="marketing-mobile-menu"
          className="border-t border-border/60 bg-background/95 backdrop-blur-xl sm:hidden"
        >
          <nav className="container mx-auto flex flex-col px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-1 rounded-md border-t border-border/40 px-2 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              Log in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
