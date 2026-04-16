'use client';

import Link from 'next/link';
import { Library, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Callout } from './callout';
import { entityRoute } from '@/data/textbook/interlinks';
import type { ChapterSection, EntityRef } from '@/types/textbook';

interface PrimerCacheProps {
  section: ChapterSection;
}

const KIND_LABEL: Record<EntityRef['kind'], string> = {
  philosopher: 'Philosopher',
  theory: 'Theory',
  'scifi-author': 'Author',
  'scifi-media': 'Work',
};

/**
 * The Primer Cache section: a styled list of every sci-fi work, author,
 * theory, or thinker introduced in the chapter, each linked to its page
 * elsewhere in the platform.
 */
export function PrimerCacheSection({ section }: PrimerCacheProps) {
  const entries = section.primerEntries || [];

  return (
    <Callout
      variant="primer"
      icon={Library}
      title={section.heading || 'Primer Cache'}
      lede="Works, thinkers, and theories introduced in this chapter — click through for the full entry on each."
    >
      <div className="space-y-3 mb-6">
        {section.blocks.map((b, i) =>
          b.type === 'paragraph' ? (
            <p key={i} className="text-sm md:text-base text-foreground/85">
              {b.text}
            </p>
          ) : null
        )}
      </div>
      {entries.length > 0 && (
        <div className="border-t border-primary/20 pt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-headline">
            Connected pages on Sci-Fi Ethics Explorer
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {entries.map((e) => (
              <Link
                key={`${e.kind}-${e.slug}`}
                href={entityRoute(e.kind, e.slug)}
                className="group flex items-center justify-between rounded-md border border-primary/20 bg-background/30 px-3 py-2 hover:border-primary/60 hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge
                    variant="outline"
                    className="text-[10px] shrink-0 border-primary/30 text-primary"
                  >
                    {KIND_LABEL[e.kind]}
                  </Badge>
                  <span className="truncate text-sm text-foreground">
                    {e.name}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </Callout>
  );
}
