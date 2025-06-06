
'use client';

import { useState } from 'react';
import { StoryCard } from '@/components/stories/story-card';
import { mockStories } from '@/data/mock-data';
import type { Story } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Get unique genres and themes for filters
const genres = Array.from(new Set(mockStories.map(story => story.genre).filter(g => g))); // Filter out empty strings just in case
const themes = Array.from(new Set(mockStories.map(story => story.theme).filter(t => t))); // Filter out empty strings just in case

const ALL_GENRES_INTERNAL_VALUE = "__all_genres__";
const ALL_THEMES_INTERNAL_VALUE = "__all_themes__";

export default function StoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  const filteredStories = mockStories.filter(story => {
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
                if (value === ALL_GENRES_INTERNAL_VALUE) {
                  setSelectedGenre('');
                } else {
                  setSelectedGenre(value);
                }
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
                if (value === ALL_THEMES_INTERNAL_VALUE) {
                  setSelectedTheme('');
                } else {
                  setSelectedTheme(value);
                }
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

      {filteredStories.length > 0 ? (
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
