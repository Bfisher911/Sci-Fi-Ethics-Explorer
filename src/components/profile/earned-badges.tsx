'use client';

import { allBadges } from '@/data/badges';
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
  Compass,
  GraduationCap,
  Crown,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
  Compass,
  GraduationCap,
  Crown,
  BadgeCheck,
};

interface EarnedBadgesProps {
  earnedBadgeIds: string[];
}

/**
 * Compact badge display for profile pages. Only shows earned badges as small icons.
 */
export function EarnedBadges({ earnedBadgeIds }: EarnedBadgesProps) {
  const earnedSet = new Set(earnedBadgeIds);
  const earned = allBadges.filter((b) => earnedSet.has(b.id));

  if (earned.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No badges earned yet. Keep exploring!
      </p>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {earned.map((badge) => {
          const Icon = iconMap[badge.icon] ?? Award;
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'rounded-full p-2 bg-accent/20 text-accent',
                    'hover:bg-accent/30 transition-colors cursor-default'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{badge.name}</p>
                <p className="text-xs">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
