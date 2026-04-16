'use client';

import { Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BlogKind } from '@/types';
import { isOfficialAuthor } from '@/lib/official-author';

interface BlogKindBadgeProps {
  kind?: BlogKind;
  authorId?: string | null;
  /** Override sizing for compact contexts (e.g. card corners). */
  size?: 'sm' | 'default';
  className?: string;
}

/**
 * Shared badge that visually distinguishes official platform articles
 * (Professor Paradox) from community-submitted articles. Falls back to
 * inferring `kind` from the authorId when an explicit kind is missing,
 * so legacy data renders correctly too.
 */
export function BlogKindBadge({
  kind,
  authorId,
  size = 'default',
  className,
}: BlogKindBadgeProps) {
  const resolvedKind: BlogKind =
    kind || (isOfficialAuthor(authorId) ? 'official' : 'community');

  if (resolvedKind === 'official') {
    return (
      <Badge
        variant="default"
        className={cn(
          'border-primary/40 bg-primary/15 text-primary uppercase tracking-wider',
          size === 'sm' ? 'text-[10px] py-0.5 px-2' : 'text-xs',
          className
        )}
      >
        <Sparkles
          className={cn(size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3', 'mr-1')}
        />
        Official
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-accent/50 text-accent uppercase tracking-wider',
        size === 'sm' ? 'text-[10px] py-0.5 px-2' : 'text-xs',
        className
      )}
    >
      <Users className={cn(size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3', 'mr-1')} />
      Community
    </Badge>
  );
}
