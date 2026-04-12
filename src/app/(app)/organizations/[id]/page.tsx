
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Organization, OrganizationMemberRole } from '@/types';
import {
  getOrganizationDetails,
  getOrganizationMembers,
  removeMember,
  updateMemberRole,
} from '@/app/actions/organizations';
import { MemberList, type MemberInfo } from '@/components/organizations/member-list';
import { InviteMemberDialog } from '@/components/organizations/invite-member-dialog';
import { OrgSettingsForm } from '@/components/organizations/org-settings-form';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building,
  Users,
  Settings,
  AlertTriangle,
  Crown,
  Loader2,
} from 'lucide-react';

/**
 * Organization Dashboard page. Displays org overview, member management,
 * and settings tabs for authorized members.
 */
export default function OrganizationDashboardPage() {
  const params = useParams();
  const orgId = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserRole: OrganizationMemberRole | null =
    organization && user
      ? organization.memberRoles?.[user.uid] || null
      : null;

  const isMember =
    organization && user
      ? (organization.members || []).includes(user.uid)
      : false;

  const fetchOrganization = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);

    try {
      const orgResult = await getOrganizationDetails(orgId);
      if (orgResult.success && orgResult.data) {
        setOrganization(orgResult.data);
      } else {
        setError(orgResult.error || 'Failed to load organization.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const fetchMembers = useCallback(async () => {
    if (!orgId) return;

    try {
      const membersResult = await getOrganizationMembers(orgId);
      if (membersResult.success && membersResult.data) {
        setMembers(membersResult.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch members:', err);
    }
  }, [orgId]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrganization();
      fetchMembers();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError('You must be logged in to view this page.');
    }
  }, [authLoading, user, fetchOrganization, fetchMembers]);

  const handleRemoveMember = async (memberId: string) => {
    if (!user) return;
    const result = await removeMember(orgId, memberId, user.uid);
    if (result.success) {
      toast({ title: 'Member Removed', description: 'The member has been removed.' });
      await fetchOrganization();
      await fetchMembers();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to remove member.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: OrganizationMemberRole) => {
    if (!user) return;
    const result = await updateMemberRole(orgId, memberId, newRole, user.uid);
    if (result.success) {
      toast({ title: 'Role Updated', description: `Member role changed to ${newRole}.` });
      await fetchOrganization();
      await fetchMembers();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update role.',
        variant: 'destructive',
      });
    }
  };

  const handleInviteSent = () => {
    // Optionally refresh invites list here
  };

  const handleSettingsSaved = () => {
    fetchOrganization();
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Error or not logged in
  if (error || !user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-card/80 backdrop-blur-sm max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold text-primary">Access Denied</h2>
            <p className="text-muted-foreground text-center">
              {error || 'You must be logged in to view this page.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not a member
  if (!isMember) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-card/80 backdrop-blur-sm max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold text-primary">Access Denied</h2>
            <p className="text-muted-foreground text-center">
              You are not a member of this organization.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-primary font-headline">
                  {organization?.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {(organization?.plan || 'free').charAt(0).toUpperCase() +
                      (organization?.plan || 'free').slice(1)}{' '}
                    Plan
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {(organization?.members || []).length} member
                    {(organization?.members || []).length !== 1 ? 's' : ''}
                  </Badge>
                  {currentUserRole && (
                    <Badge
                      variant="outline"
                      className={
                        currentUserRole === 'owner'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1'
                          : 'gap-1'
                      }
                    >
                      {currentUserRole === 'owner' && <Crown className="h-3 w-3" />}
                      Your role: {currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <Building className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          {currentUserRole === 'owner' && (
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="text-2xl font-bold">
                      {(organization?.members || []).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="text-2xl font-bold capitalize">
                      {organization?.plan || 'free'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Settings className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Features</p>
                    <p className="text-2xl font-bold">
                      {Object.values(organization?.features || {}).filter(Boolean).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick member list preview */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </h3>
              <MemberList
                members={members}
                currentUserRole={currentUserRole || 'member'}
                onRemove={handleRemoveMember}
                onUpdateRole={handleUpdateRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4 mt-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Organization Members
                </h3>
                {(currentUserRole === 'owner' || currentUserRole === 'leader') && (
                  <InviteMemberDialog
                    orgId={orgId}
                    invitedBy={user.uid}
                    onInviteSent={handleInviteSent}
                  />
                )}
              </div>
              <MemberList
                members={members}
                currentUserRole={currentUserRole || 'member'}
                onRemove={handleRemoveMember}
                onUpdateRole={handleUpdateRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab (owner only) */}
        {currentUserRole === 'owner' && organization && (
          <TabsContent value="settings" className="mt-4">
            <OrgSettingsForm
              organization={organization}
              requesterId={user.uid}
              onSaved={handleSettingsSaved}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
