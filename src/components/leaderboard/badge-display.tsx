'use client';

import { allBadges } from '@/data/badges';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Library,
  Award,
  Scale,
  Trophy,
  Brain,
  PenTool,
  Microscope,
  Star,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Library,
  Award,
  Scale,
  Trophy,
  Brain,
  PenTool,
  Microscope,
  Star,
  Flame,
};

interface BadgeDisplayProps {
  earnedBadgeIds: string[];
}

/**
 * Grid displaying all available badges. Earned badges are highlighted;
 * unearned badges are grayed out.
 */
export function BadgeDisplay({ earnedBadgeIds }: BadgeDisplayProps) {
  const earnedSet = new Set(earnedBadgeIds);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allBadges.map((badge) => {
          const Icon = iconMap[badge.icon] ?? Award;
          const isEarned = earnedSet.has(badge.id);

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Card
                  className={cn(
                    'flex flex-col items-center justify-center p-4 text-center transition-all cursor-default',
                    isEarned
                      ? 'bg-card/80 backdrop-blur-sm border-accent/50 shadow-md'
                      : 'bg-muted/30 border-muted opacity-50 grayscale'
                  )}
                >
                  <CardContent className="p-0 flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'rounded-full p-3',
                        isEarned
                          ? 'bg-accent/20 text-accent'
                          : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold leading-tight">
                      {badge.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {badge.criteria}
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{badge.name}</p>
                <p className="text-sm">{badge.description}</p>
                {!isEarned && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Not yet earned
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
