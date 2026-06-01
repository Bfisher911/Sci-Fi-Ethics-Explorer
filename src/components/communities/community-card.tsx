'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Copy, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Community, CommunityMemberRole } from '@/types';

interface CommunityCardProps {
  community: Community;
  userRole: CommunityMemberRole;
  /** True when the viewer is the community owner (shows an "Owner" badge). */
  isOwner?: boolean;
}

/**
 * Card component displaying a community summary for the communities list page.
 * Shows the viewer's role, who runs the community, and a clear way to open it.
 */
export function CommunityCard({
  community,
  userRole,
  isOwner = false,
}: CommunityCardProps) {
  const [copied, setCopied] = useState(false);
  const isInstructor = userRole === 'instructor';
  const roleLabel = isOwner ? 'Owner' : isInstructor ? 'Instructor' : 'Member';
  const RoleIcon = isOwner || isInstructor ? Crown : Shield;
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
      <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-colors cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1">
              {community.name}
            </CardTitle>
            <Badge
              variant={isOwner || isInstructor ? 'default' : 'secondary'}
              className="shrink-0 flex items-center gap-1"
            >
              <RoleIcon className="h-3 w-3" />
              {roleLabel}
            </Badge>
          </div>
          {community.ownerName && (
            <p className="text-xs text-muted-foreground">
              Led by {community.ownerName}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3 flex flex-col flex-1">
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
                  aria-label="Copy invite code"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {copied && (
                  <span className="text-xs text-green-500">Copied!</span>
                )}
              </div>
            )}
          </div>
          {/* Clear "open this community" affordance. The whole card is a link;
              this gives an explicit View target as the spec asks. */}
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              View community
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
