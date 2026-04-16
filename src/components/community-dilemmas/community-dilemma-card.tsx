'use client';

import Link from 'next/link';
import type { SubmittedDilemma } from '@/types';
import { DilemmaImage } from './dilemma-image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, ArrowRight } from 'lucide-react';
import { BookmarkButton } from '@/components/bookmarks/bookmark-button';
import { displayAuthorName } from '@/lib/official-author';

interface CommunityDilemmaCardProps {
  dilemma: SubmittedDilemma;
}

export function CommunityDilemmaCard({ dilemma }: CommunityDilemmaCardProps) {
  const formattedDate = dilemma.submittedAt instanceof Date
    ? dilemma.submittedAt.toLocaleDateString()
    // @ts-ignore
    : (dilemma.submittedAt?.seconds ? new Date(dilemma.submittedAt.seconds * 1000).toLocaleDateString() : 'N/A');

  return (
    <Link
      href={`/community-dilemmas/${dilemma.id}`}
      aria-label={`Read dilemma: ${dilemma.title}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transform transition-all duration-300 hover:-translate-y-1 h-full"
    >
      <Card className="relative flex flex-col h-full overflow-hidden shadow-lg border-border group-hover:border-primary/40 group-hover:shadow-primary/30 transition-all duration-300 bg-card/80 backdrop-blur-sm">
        {dilemma.id && (
          <div
            className="absolute top-2 right-2 z-10"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="rounded-full bg-background/70 backdrop-blur-sm">
              <BookmarkButton
                itemId={dilemma.id}
                itemType="dilemma"
                title={dilemma.title}
              />
            </div>
          </div>
        )}
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <DilemmaImage
            imageUrl={dilemma.imageUrl}
            title={dilemma.title}
            theme={dilemma.theme}
            hint={dilemma.imageHint}
            size="card"
          />
        </div>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary transition-colors duration-300 group-hover:text-accent">
            {dilemma.title}
          </CardTitle>
          <Badge variant="secondary" className="w-fit mt-1">{dilemma.theme}</Badge>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="text-sm text-foreground/80 line-clamp-4">
            {dilemma.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1.5" /> {displayAuthorName(dilemma.authorId, dilemma.authorName)}
            </span>
            <span className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" /> {formattedDate}
            </span>
          </div>
          <span className="inline-flex items-center text-accent font-medium transition-transform duration-300 group-hover:translate-x-1">
            Explore Scenario
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
