'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { StoryCard } from '@/components/stories/story-card';
import { getCommunityStories } from '@/app/actions/stories';
import type { Story } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Users, PenLine, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const ALL_GENRES_INTERNAL_VALUE = '__all_genres__';
const ALL_THEMES_INTERNAL_VALUE = '__all_themes__';

export default function CommunityStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await getCommunityStories();
      setStories(result.success ? result.data : []);
      setLoading(false);
    }
    load();
  }, []);

  const genres = useMemo(
    () => Array.from(new Set(stories.map((s) => s.genre).filter(Boolean))),
    [stories]
  );
  const themes = useMemo(
    () => Array.from(new Set(stories.map((s) => s.theme).filter(Boolean))),
    [stories]
  );

  const filtered = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGenre === '' || s.genre === selectedGenre) &&
      (selectedTheme === '' || s.theme === selectedTheme)
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary font-headline flex items-center gap-3">
                <Users className="h-8 w-8" />
                Community Stories
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Branching narratives and ethical scenarios authored by fellow
                explorers. Dive in — or{' '}
                <Link href="/create-story" className="text-primary hover:underline">
                  create your own
                </Link>
                .
              </p>
            </div>
            <Button asChild>
              <Link href="/create-story" className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                Create a Story
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search community stories…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select
              value={selectedGenre}
              onValueChange={(v) =>
                setSelectedGenre(v === ALL_GENRES_INTERNAL_VALUE ? '' : v)
              }
            >
              <SelectTrigger className="w-full">
                <Filter className="h-5 w-5 text-muted-foreground mr-2" />
                <SelectValue placeholder="Filter by Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_GENRES_INTERNAL_VALUE}>All Genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedTheme}
              onValueChange={(v) =>
                setSelectedTheme(v === ALL_THEMES_INTERNAL_VALUE ? '' : v)
              }
            >
              <SelectTrigger className="w-full">
                <Filter className="h-5 w-5 text-muted-foreground mr-2" />
                <SelectValue placeholder="Filter by Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_THEMES_INTERNAL_VALUE}>All Themes</SelectItem>
                {themes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/80 backdrop-blur-sm">
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} isCommunity />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground">
            No community stories yet
          </h2>
          <p className="text-md text-muted-foreground/80 mt-2 mb-6">
            Be the first to publish a story to the community.
          </p>
          <Button asChild size="lg">
            <Link href="/create-story" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              Start Writing
            </Link>
          </Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl text-muted-foreground">
            No stories match your current filters.
          </p>
          <p className="text-md text-muted-foreground/80 mt-2">
            Try a different search or clear the filters.
          </p>
        </div>
      )}
    </div>
  );
}
