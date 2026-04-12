
'use client';

import { useState, useEffect } from 'react';
import { StoryCard } from '@/components/stories/story-card';
import { getStories } from '@/app/actions/stories';
import { mockStories } from '@/data/mock-data';
import type { Story } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ALL_GENRES_INTERNAL_VALUE = "__all_genres__";
const ALL_THEMES_INTERNAL_VALUE = "__all_themes__";

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  useEffect(() => {
    async function loadStories() {
      setLoading(true);
      const result = await getStories();
      if (result.success && result.data.length > 0) {
        setStories(result.data);
      } else {
        // Fallback to mock data if Firestore is empty or errors
        setStories(mockStories);
      }
      setLoading(false);
    }
    loadStories();
  }, []);

  const genres = Array.from(new Set(stories.map(s => s.genre).filter(Boolean)));
  const themes = Array.from(new Set(stories.map(s => s.theme).filter(Boolean)));

  const filteredStories = stories.filter(story => {
    return (
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGenre === '' || story.genre === selectedGenre) &&
      (selectedTheme === '' || story.theme === selectedTheme)
    );
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-6 text-primary font-headline">Explore Ethical Dilemmas</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stories by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select
              value={selectedGenre}
              onValueChange={(value) => {
                setSelectedGenre(value === ALL_GENRES_INTERNAL_VALUE ? '' : value);
              }}
            >
              <SelectTrigger className="w-full">
                <Filter className="h-5 w-5 text-muted-foreground mr-2" />
                <SelectValue placeholder="Filter by Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_GENRES_INTERNAL_VALUE}>All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedTheme}
              onValueChange={(value) => {
                setSelectedTheme(value === ALL_THEMES_INTERNAL_VALUE ? '' : value);
              }}
            >
              <SelectTrigger className="w-full">
                <Filter className="h-5 w-5 text-muted-foreground mr-2" />
                <SelectValue placeholder="Filter by Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_THEMES_INTERNAL_VALUE}>All Themes</SelectItem>
                {themes.map(theme => (
                  <SelectItem key={theme} value={theme}>{theme}</SelectItem>
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
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl text-muted-foreground">No stories match your current filters.</p>
          <p className="text-md text-muted-foreground/80 mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
