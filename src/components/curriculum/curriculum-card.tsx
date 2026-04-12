'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users } from 'lucide-react';
import type { CurriculumPath } from '@/types';
import Link from 'next/link';

interface CurriculumCardProps {
  curriculum: CurriculumPath;
}

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const totalItems = curriculum.modules.reduce(
    (acc, mod) => acc + mod.items.length,
    0
  );

  return (
    <Card className="bg-card/80 backdrop-blur-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg text-primary">{curriculum.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {curriculum.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {curriculum.modules.length} module{curriculum.modules.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {curriculum.enrollmentCount || 0} enrolled
          </Badge>
          {totalItems > 0 && (
            <Badge variant="outline">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/curriculum/${curriculum.id}`}>View Curriculum</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
