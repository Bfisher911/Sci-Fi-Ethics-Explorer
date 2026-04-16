'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SciFiAuthor } from '@/types';

interface SciFiAuthorCardProps {
  author: SciFiAuthor;
}

export function SciFiAuthorCard({ author }: SciFiAuthorCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm flex flex-col overflow-hidden group hover:border-primary/40 transition-colors">
      {author.imageUrl && (
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <Image
            src={author.imageUrl}
            alt={`Portrait of ${author.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            data-ai-hint={author.imageHint || 'sci-fi author portrait'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        </div>
      )}
      <CardHeader className={author.imageUrl ? '-mt-16 relative z-10' : ''}>
        <CardTitle className="text-lg text-primary drop-shadow">
          {author.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{author.era}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {author.bio}
        </p>
        <div className="flex flex-wrap gap-1">
          {author.subgenres?.slice(0, 2).map((sg) => (
            <Badge key={sg} variant="secondary" className="text-xs">
              {sg}
            </Badge>
          ))}
          {author.relatedFrameworks.slice(0, 2).map((fw) => (
            <Badge
              key={fw}
              variant="outline"
              className="text-xs capitalize border-accent/40 text-accent"
            >
              {fw.replace(/-/g, ' ')}
            </Badge>
          ))}
        </div>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/scifi-authors/${author.id}`}>Explore</Link>
        </Button>
      </div>
    </Card>
  );
}
