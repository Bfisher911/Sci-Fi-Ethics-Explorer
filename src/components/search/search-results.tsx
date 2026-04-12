'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, AlertTriangle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import type { SearchResults as SearchResultsType } from '@/app/actions/search';

interface SearchResultsProps {
  results: SearchResultsType;
}

export function SearchResults({ results }: SearchResultsProps) {
  const totalCount =
    results.stories.length +
    results.dilemmas.length +
    results.theories.length;

  if (totalCount === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No results found. Try a different search term.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {results.stories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Stories ({results.stories.length})
          </h3>
          <div className="space-y-2">
            {results.stories.map((s) => (
              <Link key={s.id} href={`/stories/${s.id}`}>
                <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {s.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.dilemmas.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Dilemmas ({results.dilemmas.length})
          </h3>
          <div className="space-y-2">
            {results.dilemmas.map((d) => (
              <Link key={d.id} href={`/community-dilemmas`}>
                <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{d.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {d.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.theories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            Theories ({results.theories.length})
          </h3>
          <div className="space-y-2">
            {results.theories.map((t) => (
              <Link key={t.id} href={`/glossary`}>
                <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {t.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
