'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Philosopher } from '@/types';
import Link from 'next/link';

interface PhilosopherCardProps {
  philosopher: Philosopher;
}

export function PhilosopherCard({ philosopher }: PhilosopherCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg text-primary">{philosopher.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{philosopher.era}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {philosopher.bio}
        </p>
        <div className="flex flex-wrap gap-1">
          {philosopher.relatedFrameworks.map((fw) => (
            <Badge key={fw} variant="secondary" className="text-xs">
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
