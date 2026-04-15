'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BookmarkButton } from '@/components/bookmarks/bookmark-button';
import { DilemmaImage } from '@/components/community-dilemmas/dilemma-image';

interface StoryCardProps {
  story: Story;
  /** When true, shows a "Community" badge and uses the fallback image pipeline. */
  isCommunity?: boolean;
}

export function StoryCard({ story, isCommunity }: StoryCardProps) {
  return (
    <Card className="relative flex flex-col h-full overflow-hidden shadow-lg hover:shadow-primary/30 transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
      <div
        className="absolute top-2 right-2 z-10"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div className="rounded-full bg-background/70 backdrop-blur-sm">
          <BookmarkButton
            itemId={story.id}
            itemType="story"
            title={story.title}
          />
        </div>
      </div>
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        {story.imageUrl ? (
          <Image
            src={story.imageUrl}
            alt={story.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={story.imageHint || 'sci-fi concept'}
          />
        ) : (
          <DilemmaImage
            title={story.title}
            theme={story.theme}
            hint={story.imageHint}
            size="card"
          />
        )}
        {isCommunity && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-accent/90 text-accent-foreground flex items-center gap-1 shadow">
              <Users className="h-3 w-3" />
              Community
            </Badge>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary group-hover:text-accent transition-colors pr-10">
          <Link href={`/stories/${story.id}`}>{story.title}</Link>
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="secondary">{story.genre}</Badge>
          <Badge variant="outline">{story.theme}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-foreground/80 line-clamp-3">{story.description}</CardDescription>
        <p className="text-xs text-muted-foreground mt-2">By: {story.author}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" /> {story.estimatedReadingTime}
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary hover:text-accent">
          <Link href={`/stories/${story.id}`}>
            Explore <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
