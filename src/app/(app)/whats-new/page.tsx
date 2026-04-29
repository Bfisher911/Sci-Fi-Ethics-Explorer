'use client';

/**
 * /whats-new — public changelog of platform updates.
 *
 * Static page powered by `src/data/changelog.ts`. Anyone can read it
 * (no auth gate); the dashboard surfaces a "What's New" chip linking
 * here when there's a recent (≤14 days) entry the user hasn't seen.
 *
 * The "have I seen this?" flag is stored in localStorage as
 * `sfe.changelogLastSeen` (an ISO date string). When the user opens
 * this page we stamp it forward to the latest entry's date so the chip
 * goes away.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CHANGELOG, type ChangelogCategory } from '@/data/changelog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CATEGORY_LABEL: Record<ChangelogCategory, string> = {
  feature: 'New',
  content: 'Content',
  fix: 'Fix',
  announcement: 'Note',
};

const CATEGORY_TONE: Record<ChangelogCategory, string> = {
  feature: 'border-primary/40 bg-primary/10 text-primary',
  content: 'border-accent/40 bg-accent/10 text-accent',
  fix: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  announcement: 'border-muted-foreground/40 bg-muted text-foreground',
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00Z');
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return iso;
  }
}

export default function WhatsNewPage() {
  // Mark all current entries as seen on visit so the dashboard chip
  // stops nagging. We stamp the latest date, which is what the chip
  // compares against.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const latest = CHANGELOG[0];
    if (!latest) return;
    try {
      localStorage.setItem('sfe.changelogLastSeen', latest.date);
    } catch {
      // ignore — private browsing, etc.
    }
  }, []);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Changelog
        </div>
        <h1 className="mt-1 font-headline text-3xl font-bold tracking-tight md:text-4xl">
          What's new
        </h1>
        <p className="mt-2 text-muted-foreground">
          A running log of platform updates, new content, and fixes. Newest
          entries first.
        </p>
      </header>

      <ol className="space-y-5">
        {CHANGELOG.map((entry) => (
          <li key={entry.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase tracking-wider ${CATEGORY_TONE[entry.category]}`}
                  >
                    {CATEGORY_LABEL[entry.category]}
                  </Badge>
                  <time
                    dateTime={entry.date}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDate(entry.date)}
                  </time>
                </div>
                <CardTitle className="mt-2 text-lg font-bold">
                  {entry.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {entry.body}
                </p>
                {entry.href && (
                  <div className="mt-3">
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <Link href={entry.href}>
                        Open <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-lg border bg-card/50 p-5 text-center">
        <Sparkles className="mx-auto h-5 w-5 text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">
          Have an idea or want to report a bug? We'd love to hear from you.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/help">Get in touch</Link>
        </Button>
      </div>
    </div>
  );
}
