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
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrandMark } from './brand-mark';

export function MarketingHeader(): JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-300 ease-expo',
        scrolled
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
          <Button
            asChild
            variant="ghost"
            className="hidden text-foreground/80 hover:text-foreground sm:inline-flex"
          >
            <Link href="/textbook">Textbook</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="hidden text-foreground/80 hover:text-foreground sm:inline-flex"
          >
            <Link href="/stories">Dilemmas</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="text-foreground/80 hover:text-foreground"
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="ml-1 shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_0_18px_-2px_hsl(var(--primary)/0.55)] transition-shadow duration-300 ease-expo hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.7),0_0_28px_-2px_hsl(var(--primary)/0.7)]"
          >
            <Link href="/stories" className="flex items-center gap-1.5">
              Start
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
