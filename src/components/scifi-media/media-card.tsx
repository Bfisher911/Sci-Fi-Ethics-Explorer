'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SciFiMedia } from '@/types';
import { Film, BookOpen, Tv, Gamepad2 } from 'lucide-react';

const CATEGORY_ICON: Record<string, React.ElementType> = {
  movie: Film,
  book: BookOpen,
  tv: Tv,
  other: Gamepad2,
};

const CATEGORY_LABEL: Record<string, string> = {
  movie: 'Movie',
  book: 'Book',
  tv: 'TV Show',
  other: 'Game / Other',
};

interface MediaCardProps {
  media: SciFiMedia;
}

export function MediaCard({ media }: MediaCardProps) {
  const Icon = CATEGORY_ICON[media.category] || Gamepad2;
  return (
    <Card className="bg-card/80 backdrop-blur-sm flex flex-col overflow-hidden group hover:border-primary/40 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-primary" />
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {CATEGORY_LABEL[media.category]}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">{media.year}</span>
        </div>
        <CardTitle className="text-lg text-primary group-hover:text-accent transition-colors">
          {media.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">by {media.creator}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{media.plot}</p>
        <div className="flex flex-wrap gap-1">
          {media.ethicsExplored.slice(0, 2).map((e) => (
            <Badge key={e} variant="secondary" className="text-[10px]">
              {e.length > 40 ? e.slice(0, 37) + '…' : e}
            </Badge>
          ))}
          {media.relatedFrameworks.slice(0, 1).map((fw) => (
            <Badge
              key={fw}
              variant="outline"
              className="text-[10px] capitalize border-accent/40 text-accent"
            >
              {fw.replace(/-/g, ' ')}
            </Badge>
          ))}
        </div>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/scifi-media/${media.id}`}>Explore</Link>
        </Button>
      </div>
    </Card>
  );
}
