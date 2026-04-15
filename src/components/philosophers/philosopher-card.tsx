'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Philosopher } from '@/types';

interface PhilosopherCardProps {
  philosopher: Philosopher;
}

export function PhilosopherCard({ philosopher }: PhilosopherCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm flex flex-col overflow-hidden group hover:border-primary/40 transition-colors">
      {philosopher.imageUrl && (
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <Image
            src={philosopher.imageUrl}
            alt={`Portrait of ${philosopher.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            data-ai-hint={philosopher.imageHint || 'philosopher portrait'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        </div>
      )}
      <CardHeader className={philosopher.imageUrl ? '-mt-16 relative z-10' : ''}>
        <CardTitle className="text-lg text-primary drop-shadow">
          {philosopher.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{philosopher.era}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {philosopher.bio}
        </p>
        <div className="flex flex-wrap gap-1">
          {philosopher.relatedFrameworks.map((fw) => (
            <Badge key={fw} variant="secondary" className="text-xs capitalize">
              {fw.replace(/-/g, ' ')}
            </Badge>
          ))}
        </div>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/philosophers/${philosopher.id}`}>Learn More</Link>
        </Button>
      </div>
    </Card>
  );
}
