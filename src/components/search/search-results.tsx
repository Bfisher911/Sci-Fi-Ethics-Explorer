'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  BookOpen,
  Clapperboard,
  Lightbulb,
  Rocket,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { SearchResults as SearchResultsType } from '@/app/actions/search';

interface SearchResultsProps {
  results: SearchResultsType;
}

interface ResultItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

function ResultSection({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon: LucideIcon;
  items: ResultItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={`${label} results`}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
        <Icon className="h-4 w-4" aria-hidden />
        {label} ({items.length})
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <Link key={item.id} href={item.href} className="block">
            <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
              <CardContent className="p-3">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SearchResults({ results }: SearchResultsProps) {
  const totalCount =
    results.stories.length +
    results.dilemmas.length +
    results.theories.length +
    results.philosophers.length +
    results.scifiAuthors.length +
    results.scifiMedia.length;

  if (totalCount === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No results found. Try a different search term.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ResultSection
        label="Stories"
        icon={BookOpen}
        items={results.stories.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          href: `/stories/${s.id}`,
        }))}
      />
      <ResultSection
        label="Philosophers"
        icon={ScrollText}
        items={results.philosophers.map((p) => ({
          id: p.id,
          title: p.name,
          description: p.description,
          href: `/philosophers/${p.id}`,
        }))}
      />
      <ResultSection
        label="Sci-Fi Authors"
        icon={Rocket}
        items={results.scifiAuthors.map((a) => ({
          id: a.id,
          title: a.name,
          description: a.description,
          href: `/scifi-authors/${a.id}`,
        }))}
      />
      <ResultSection
        label="Sci-Fi Media"
        icon={Clapperboard}
        items={results.scifiMedia.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          href: `/scifi-media/${m.id}`,
        }))}
      />
      <ResultSection
        label="Theories"
        icon={Lightbulb}
        items={results.theories.map((t) => ({
          id: t.id,
          title: t.name,
          description: t.description,
          href: `/glossary/${t.id}`,
        }))}
      />
      <ResultSection
        label="Dilemmas"
        icon={AlertTriangle}
        items={results.dilemmas.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          href: '/community-dilemmas',
        }))}
      />
    </div>
  );
}
