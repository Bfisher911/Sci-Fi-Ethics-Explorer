'use client';

import type { Debate } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarDays, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { BookmarkButton } from '@/components/bookmarks/bookmark-button';

interface DebateTopicCardProps {
  debate: Debate;
}

const statusVariants: Record<Debate['status'], { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  voting: { label: 'Voting', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-muted' },
};

export function DebateTopicCard({ debate }: DebateTopicCardProps) {
  const statusInfo = statusVariants[debate.status];

  const formatDate = (date: Date | any): string => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link href={`/debate-arena/${debate.id}`}>
      <Card className="relative shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-card/80 backdrop-blur-sm hover:border-primary/30 cursor-pointer">
        <div
          className="absolute top-2 right-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div className="rounded-full bg-background/70 backdrop-blur-sm">
            <BookmarkButton
              itemId={debate.id}
              itemType="debate"
              title={debate.title}
            />
          </div>
        </div>
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className={statusInfo.className}>
              {statusInfo.label}
            </Badge>
            <div className="text-xs text-muted-foreground flex items-center">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              {formatDate(debate.createdAt)}
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-primary">{debate.title}</CardTitle>
          <CardDescription className="text-foreground/80 pt-1 line-clamp-2">
            {debate.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {debate.tags && debate.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {debate.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <Users className="h-4 w-4 mr-1.5" />
            {debate.participantCount} participant{debate.participantCount !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Created by {debate.creatorName}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
