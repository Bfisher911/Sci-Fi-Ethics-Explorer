'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Mail, UserPlus, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  inviteToCommunity,
  getCommunityInvites,
} from '@/app/actions/communities';
import type { CommunityInvite, CommunityMemberRole } from '@/types';

interface CommunityInvitesProps {
  communityId: string;
  communityName: string;
  currentUserId: string;
  currentUserName: string;
}

/**
 * Component for managing community invitations: single invite, bulk invite, and invite list.
 */
export function CommunityInvites({
  communityId,
  communityName,
  currentUserId,
  currentUserName,
}: CommunityInvitesProps) {
  const { toast } = useToast();
  const [invites, setInvites] = useState<CommunityInvite[]>([]);
  const [loading, setLoading] = useState(true);

  // Single invite state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CommunityMemberRole>('member');
  const [sending, setSending] = useState(false);

  // Bulk invite state
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkSending, setBulkSending] = useState(false);

  useEffect(() => {
    loadInvites();
  }, [communityId]);

  async function loadInvites(): Promise<void> {
    const result = await getCommunityInvites(communityId);
    if (result.success) {
      setInvites(result.data);
    }
    setLoading(false);
  }

  async function handleSendInvite(): Promise<void> {
    if (!email.trim()) return;
    setSending(true);

    const result = await inviteToCommunity({
      communityId,
      communityName,
      email: email.trim(),
      role,
      invitedBy: currentUserId,
      invitedByName: currentUserName,
    });

    setSending(false);

    if (result.success) {
      toast({ title: 'Invite sent', description: `Invitation sent to ${email}` });
      setEmail('');
      loadInvites();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  }

  async function handleBulkInvite(): Promise<void> {
    const emails = bulkEmails
      .split(/[,\n]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes('@'));

    if (emails.length === 0) return;
    setBulkSending(true);

    let successCount = 0;
    let failCount = 0;

    for (const inviteEmail of emails) {
      const result = await inviteToCommunity({
        communityId,
        communityName,
        email: inviteEmail,
        role: 'member',
        invitedBy: currentUserId,
        invitedByName: currentUserName,
      });
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setBulkSending(false);
    setBulkEmails('');
    loadInvites();

    toast({
      title: 'Bulk invite complete',
      description: `${successCount} sent${failCount > 0 ? `, ${failCount} failed` : ''}`,
    });
  }

  function getStatusBadge(status: string): React.ReactNode {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-600 text-white">Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Pending
          </Badge>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Single invite */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@school.edu"
              />
            </div>
            <div className="w-full sm:w-40">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as CommunityMemberRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSendInvite}
            disabled={sending || !email.trim()}
            size="sm"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send Invite
          </Button>
        </CardContent>
      </Card>

      {/* Bulk invite */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Invite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="bulk-emails">
              Emails (comma or newline separated)
            </Label>
            <Textarea
              id="bulk-emails"
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder={"student1@school.edu, student2@school.edu\nstudent3@school.edu"}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              All bulk invites are sent with the Member role.
            </p>
          </div>
          <Button
            onClick={handleBulkInvite}
            disabled={bulkSending || !bulkEmails.trim()}
            size="sm"
            variant="outline"
          >
            {bulkSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send All Invites
          </Button>
        </CardContent>
      </Card>

      {/* Invite list */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Invite History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading invites...</p>
          ) : invites.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No invites sent yet.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="text-sm">
                        {invite.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {invite.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(invite.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
