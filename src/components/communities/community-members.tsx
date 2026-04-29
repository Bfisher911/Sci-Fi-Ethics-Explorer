'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Shield, UserMinus } from 'lucide-react';
import type { CommunityMemberInfo } from '@/types';

interface CommunityMembersProps {
  members: CommunityMemberInfo[];
  isInstructor: boolean;
  currentUserId?: string;
  onRemove?: (memberId: string) => void;
}

/**
 * Table displaying community members with role, status, and actions.
 */
export function CommunityMembers({
  members,
  isInstructor,
  currentUserId,
  onRemove,
}: CommunityMembersProps) {
  function getStatusBadge(member: CommunityMemberInfo): React.ReactNode {
    if (member.activeLicenseId) {
      return <Badge className="bg-green-600 text-white">Licensed</Badge>;
    }
    if (
      member.subscriptionStatus === 'active' ||
      member.subscriptionStatus === 'trial'
    ) {
      return <Badge className="bg-green-600 text-white">Active</Badge>;
    }
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-500">
        Pending Payment
      </Badge>
    );
  }

  if (members.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No members yet.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {isInstructor && <TableHead>Email</TableHead>}
            <TableHead>Role</TableHead>
            {isInstructor && <TableHead>Status</TableHead>}
            {isInstructor && onRemove && <TableHead className="w-20">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.uid}>
              <TableCell className="font-medium">
                {member.displayName}
              </TableCell>
              {isInstructor && (
                <TableCell className="text-muted-foreground">
                  {member.email}
                </TableCell>
              )}
              <TableCell>
                <Badge
                  variant={member.role === 'instructor' ? 'default' : 'secondary'}
                  className="flex items-center gap-1 w-fit"
                >
                  {member.role === 'instructor' ? (
                    <Crown className="h-3 w-3" />
                  ) : (
                    <Shield className="h-3 w-3" />
                  )}
                  {member.role === 'instructor' ? 'Instructor' : 'Member'}
                </Badge>
              </TableCell>
              {isInstructor && (
                <TableCell>{getStatusBadge(member)}</TableCell>
              )}
              {isInstructor && onRemove && (
                <TableCell>
                  {member.uid !== currentUserId && member.role !== 'instructor' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onRemove(member.uid)}
                      aria-label={`Remove ${member.displayName || 'member'}`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
