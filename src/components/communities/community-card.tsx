'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Copy, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Community, CommunityMemberRole } from '@/types';

interface CommunityCardProps {
  community: Community;
  userRole: CommunityMemberRole;
}

/**
 * Card component displaying a community summary for the communities list page.
 */
export function CommunityCard({ community, userRole }: CommunityCardProps) {
  const [copied, setCopied] = useState(false);
  const isInstructor = userRole === 'instructor';
  const memberCount =
    (community.instructorIds?.length || 0) +
    (community.memberIds?.length || 0);

  function handleCopyCode(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(community.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Link href={`/communities/${community.id}`}>
      <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1">
              {community.name}
            </CardTitle>
            <Badge
              variant={isInstructor ? 'default' : 'secondary'}
              className="shrink-0 flex items-center gap-1"
            >
              {isInstructor ? (
                <Crown className="h-3 w-3" />
              ) : (
                <Shield className="h-3 w-3" />
              )}
              {isInstructor ? 'Instructor' : 'Member'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {community.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {community.description}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Badge>
            {isInstructor && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {community.inviteCode}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyCode}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {copied && (
                  <span className="text-xs text-green-500">Copied!</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
