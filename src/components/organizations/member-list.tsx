
'use client';

import { useState } from 'react';
import type { OrganizationMemberRole } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Crown, Shield, User, Trash2, Loader2 } from 'lucide-react';

export interface MemberInfo {
  uid: string;
  name: string;
  email: string;
  role: OrganizationMemberRole;
}

interface MemberListProps {
  members: MemberInfo[];
  currentUserRole: OrganizationMemberRole;
  onRemove: (memberId: string) => Promise<void>;
  onUpdateRole: (memberId: string, newRole: OrganizationMemberRole) => Promise<void>;
}

const roleIcons: Record<OrganizationMemberRole, React.ReactNode> = {
  owner: <Crown className="h-3.5 w-3.5" />,
  leader: <Shield className="h-3.5 w-3.5" />,
  member: <User className="h-3.5 w-3.5" />,
};

const roleBadgeVariants: Record<OrganizationMemberRole, string> = {
  owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  leader: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  member: 'bg-muted text-muted-foreground border-border',
};

/**
 * Displays a table of organization members with role badges and action controls.
 */
export function MemberList({
  members,
  currentUserRole,
  onRemove,
  onUpdateRole,
}: MemberListProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleRemove = async (memberId: string) => {
    setLoadingAction(`remove-${memberId}`);
    try {
      await onRemove(memberId);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: OrganizationMemberRole) => {
    setLoadingAction(`role-${memberId}`);
    try {
      await onUpdateRole(memberId, newRole);
    } finally {
      setLoadingAction(null);
    }
  };

  const canRemoveMember = (targetRole: OrganizationMemberRole): boolean => {
    if (currentUserRole === 'owner' && targetRole !== 'owner') return true;
    if (currentUserRole === 'leader' && targetRole === 'member') return true;
    return false;
  };

  const canChangeRole = currentUserRole === 'owner';

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            {(currentUserRole === 'owner' || currentUserRole === 'leader') && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.uid}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell className="text-muted-foreground">{member.email}</TableCell>
              <TableCell>
                {canChangeRole && member.role !== 'owner' ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      handleRoleChange(member.uid, value as OrganizationMemberRole)
                    }
                    disabled={loadingAction === `role-${member.uid}`}
                  >
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leader">Leader</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant="outline"
                    className={`gap-1 ${roleBadgeVariants[member.role]}`}
                  >
                    {roleIcons[member.role]}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                )}
              </TableCell>
              {(currentUserRole === 'owner' || currentUserRole === 'leader') && (
                <TableCell className="text-right">
                  {canRemoveMember(member.role) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.uid)}
                      disabled={loadingAction === `remove-${member.uid}`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {loadingAction === `remove-${member.uid}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null}
                </TableCell>
              )}
            </TableRow>
          ))}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
