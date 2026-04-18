'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfographicCtaProps {
  /** Where the infographic page lives. */
  href: string;
  /** Display name of the entity (used in the description). */
  subjectName?: string;
  /** Display kind, e.g. "philosopher" / "ethical theory". */
  kindLabel?: string;
  className?: string;
}

/**
 * "Explore the infographic" call-to-action card. Mirrors the styling of
 * `<QuizCta>` so it reads as a peer affordance on every entity page.
 */
export function InfographicCta({
  href,
  subjectName,
  kindLabel = 'idea',
  className,
}: InfographicCtaProps) {
  return (
    <Card
      className={cn(
        'bg-card/80 backdrop-blur-sm border-accent/30 hover:border-accent/60 transition-colors',
        className
      )}
    >
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-accent/10 text-accent">
            <Layers className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Explore the Infographic
              <Sparkles className="h-3.5 w-3.5 text-accent" />
            </h3>
            <p className="text-sm text-muted-foreground">
              An interactive visual breakdown of {subjectName ? <span className="text-foreground font-medium">{subjectName}</span> : `this ${kindLabel}`} — key
              ideas, connections across the platform, and where to read next.
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={href}>
            Open infographic
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
