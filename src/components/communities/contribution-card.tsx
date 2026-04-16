'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FlaskConical,
  Brain,
  GitCompare,
  FileText,
  Scale,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { cn } from '@/lib/utils';
import type { CommunityContribution, ContributionType } from '@/types';
import {
  displayAuthorAvatar,
  displayAuthorName,
} from '@/lib/official-author';

interface ContributionCardProps {
  contribution: CommunityContribution;
  onClick?: () => void;
}

type TypeMeta = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

export const CONTRIBUTION_TYPE_META: Record<ContributionType, TypeMeta> = {
  analysis: { icon: FlaskConical, label: 'Scenario Analysis' },
  quiz_result: { icon: Brain, label: 'Framework Quiz Result' },
  perspective_comparison: {
    icon: GitCompare,
    label: 'Perspective Comparison',
  },
  dilemma: { icon: FileText, label: 'Dilemma' },
  debate: { icon: Scale, label: 'Debate' },
  story: { icon: BookOpen, label: 'Story' },
};

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

/**
 * Compact card representing a single community contribution.
 */
export function ContributionCard({
  contribution,
  onClick,
}: ContributionCardProps) {
  const meta = CONTRIBUTION_TYPE_META[contribution.type];
  const Icon = meta.icon;
  const href = `/communities/${contribution.communityId}/contributions/${contribution.id}`;
  const created =
    contribution.createdAt instanceof Date
      ? contribution.createdAt
      : new Date(contribution.createdAt as any);

  return (
    <Link href={href} onClick={onClick} className="block h-full">
      <Card
        className={cn(
          'bg-card/80 backdrop-blur-sm h-full flex flex-col',
          'border border-border hover:border-primary/60 transition-colors cursor-pointer'
        )}
      >
        <CardHeader className="pb-3">
          <Badge
            variant="secondary"
            className="w-fit flex items-center gap-1.5"
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 space-y-3">
          <h3 className="text-lg font-bold leading-tight line-clamp-2">
            {contribution.title || 'Untitled contribution'}
          </h3>
          {contribution.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {contribution.summary}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-6 w-6">
                {(displayAuthorAvatar(contribution.contributorId, contribution.contributorName) ||
                  contribution.contributorAvatarUrl) && (
                  <AvatarImage
                    src={
                      displayAuthorAvatar(
                        contribution.contributorId,
                        contribution.contributorName
                      ) || contribution.contributorAvatarUrl
                    }
                  />
                )}
                <AvatarFallback className="text-[10px]">
                  {initials(
                    displayAuthorName(contribution.contributorId, contribution.contributorName)
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {displayAuthorName(contribution.contributorId, contribution.contributorName)}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(created, { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <MessageCircle className="h-3.5 w-3.5" />
              {contribution.commentCount ?? 0}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
