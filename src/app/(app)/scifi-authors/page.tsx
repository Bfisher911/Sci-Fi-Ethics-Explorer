'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Rocket } from 'lucide-react';
import { getSciFiAuthors } from '@/app/actions/scifi-authors';
import { SciFiAuthorCard } from '@/components/scifi-authors/scifi-author-card';
import type { SciFiAuthor } from '@/types';

export default function SciFiAuthorsPage() {
  const [authors, setAuthors] = useState<SciFiAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const result = await getSciFiAuthors();
      if (result.success) {
        setAuthors(result.data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const lower = searchTerm.toLowerCase();
  const filtered = authors.filter((a) => {
    if (!lower) return true;
    return (
      a.name.toLowerCase().includes(lower) ||
      a.themes.some((t) => t.toLowerCase().includes(lower)) ||
      (a.subgenres?.some((s) => s.toLowerCase().includes(lower)) ?? false) ||
      a.notableWorks.some((w) => w.toLowerCase().includes(lower))
    );
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline flex items-center gap-3">
            <Rocket className="h-9 w-9" />
            Sci-Fi Author Spotlights
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Science-fiction writers have been stress-testing technology ethics
            for two centuries — asking, before our engineers have had to, what
            it means to create life, surveil a city, engineer a species, or
            cross paths with a mind that is not our own. Explore the authors
            whose work maps directly onto the debates we are now having in
            labs, courtrooms, and policy briefings.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by author, theme, sub-genre, or work..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-2/3"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((author) => (
            <SciFiAuthorCard key={author.id} author={author} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Rocket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-2xl text-muted-foreground">
            No authors match your search.
          </p>
        </div>
      )}
    </div>
  );
}
