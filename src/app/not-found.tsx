/**
 * Custom 404 page. Shown for any route Next.js can't match against
 * the file system — covers logged-in and logged-out users alike since
 * this lives at the root, above both the `(app)` and `(auth)` route
 * groups.
 *
 * No `'use client'` — pure server component. Keeps the 404 fast and
 * reduces the surface for chained errors during route resolution.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page not found',
  description:
    "We couldn't find the page you were looking for. It may have moved or never existed.",
};

export default function NotFound() {
  return (
    <main
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center"
      role="main"
    >
      <div
        aria-hidden
        className="mb-6 select-none font-headline text-7xl font-bold tracking-tight text-primary md:text-9xl"
      >
        404
      </div>
      <h1 className="mb-3 font-headline text-2xl font-bold tracking-tight md:text-3xl">
        We've drifted off the star chart
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or has moved. Try one of
        these instead:
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/textbook">Open the textbook</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/stories">Browse stories</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/help">Get help</Link>
        </Button>
      </div>
    </main>
  );
}
