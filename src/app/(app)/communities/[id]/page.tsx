'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Copy,
  Users,
  Settings,
  BarChart3,
  Mail,
  Crown,
  Loader2,
  Save,
  GraduationCap,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';
import {
  getCommunity,
  getCommunityMembers,
  removeCommunityMember,
  updateCommunity,
} from '@/app/actions/communities';
import { getCurricula } from '@/app/actions/curriculum';
import { CommunityMembers } from '@/components/communities/community-members';
import { CommunityInvites } from '@/components/communities/community-invites';
import type { Community, CommunityMemberInfo, CurriculumPath } from '@/types';
import Link from 'next/link';

/**
 * Community detail page with role-based tabs for instructors and members.
 */
export default function CommunityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { isPaid } = useSubscription();
  const { toast } = useToast();

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMemberInfo[]>([]);
  const [curricula, setCurricula] = useState<CurriculumPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Settings state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCurriculumId, setEditCurriculumId] = useState('');
  const [saving, setSaving] = useState(false);

  const isInstructor =
    !!user && !!community?.instructorIds?.includes(user.uid);

  const loadData = useCallback(async () => {
    const [communityResult, membersResult] = await Promise.all([
      getCommunity(id),
      getCommunityMembers(id),
    ]);

    if (communityResult.success && communityResult.data) {
      setCommunity(communityResult.data);
      setEditName(communityResult.data.name);
      setEditDescription(communityResult.data.description || '');
      setEditCurriculumId(communityResult.data.curriculumPathId || '');
    }

    if (membersResult.success) {
      setMembers(membersResult.data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load curricula for settings (instructor only)
  useEffect(() => {
    if (isInstructor) {
      getCurricula().then((result) => {
        if (result.success) setCurricula(result.data);
      });
    }
  }, [isInstructor]);

  function handleCopy(): void {
    if (community) {
      navigator.clipboard.writeText(community.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleRemoveMember(memberId: string): Promise<void> {
    if (!user || !community) return;

    const result = await removeCommunityMember(community.id, memberId, user.uid);
    if (result.success) {
      toast({ title: 'Member removed' });
      setMembers((prev) => prev.filter((m) => m.uid !== memberId));
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  async function handleSaveSettings(): Promise<void> {
    if (!user || !community) return;
    setSaving(true);

    const result = await updateCommunity(community.id, user.uid, {
      name: editName.trim(),
      description: editDescription.trim(),
      curriculumPathId: editCurriculumId || undefined,
    });

    setSaving(false);

    if (result.success) {
      toast({ title: 'Settings saved' });
      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              name: editName.trim(),
              description: editDescription.trim(),
              curriculumPathId: editCurriculumId || undefined,
            }
          : prev
      );
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">
            Community not found.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/communities">Back to Communities</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const memberCount =
    (community.instructorIds?.length || 0) +
    (community.memberIds?.length || 0);

  // Member view (non-instructor)
  if (!isInstructor) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/communities">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Link>
        </Button>

        <Card className="mb-6 p-6 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <h1 className="text-3xl font-bold text-primary font-headline mb-2">
              {community.name}
            </h1>
            {community.description && (
              <p className="text-muted-foreground mb-3">
                {community.description}
              </p>
            )}
            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
              <Users className="h-3 w-3" />
              {memberCount} members
            </Badge>
          </CardContent>
        </Card>

        {!isPaid && (
          <Card className="mb-6 p-6 bg-card/80 backdrop-blur-sm border-yellow-500/50">
            <CardContent className="p-0 text-center">
              <p className="text-muted-foreground mb-3">
                Upgrade your plan to access full community features.
              </p>
              <Button asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {community.curriculumPathId && (
          <Card className="mb-6 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Assigned Curriculum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href={`/curriculum/${community.curriculumPathId}`}>
                  View Learning Path
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <CommunityMembers
              members={members}
              isInstructor={false}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Instructor view with tabs
  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/communities">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Communities
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-primary font-headline mb-6">
        {community.name}
      </h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Community Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{community.name}</p>
                </div>
                {community.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{community.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 w-fit"
                  >
                    <Users className="h-3 w-3" />
                    {memberCount}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Invite Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Share this code so members can join:
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold font-mono text-primary tracking-widest">
                    {community.inviteCode}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-green-500">Copied!</p>
                )}
              </CardContent>
            </Card>

            {community.curriculumPathId && (
              <Card className="bg-card/80 backdrop-blur-sm md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Assigned Curriculum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <Link href={`/curriculum/${community.curriculumPathId}`}>
                      View Learning Path
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card/80 backdrop-blur-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Moderate Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Review dilemmas that members have submitted to this
                  community.
                </p>
                <Button asChild>
                  <Link href={`/communities/${community.id}/moderation`}>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Open Moderation Queue
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommunityMembers
                members={members}
                isInstructor={true}
                currentUserId={user?.uid}
                onRemove={handleRemoveMember}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites">
          <CommunityInvites
            communityId={community.id}
            communityName={community.name}
            currentUserId={user?.uid || ''}
            currentUserName={user?.displayName || user?.email || 'Unknown'}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6 text-center space-y-3">
              <BarChart3 className="h-12 w-12 text-primary mx-auto" />
              <p className="text-muted-foreground">
                View detailed analytics for this community.
              </p>
              <Button asChild>
                <Link href={`/communities/${community.id}/analytics`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Open Analytics Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Community Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div>
                <Label htmlFor="edit-name">Community Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label>Assigned Curriculum</Label>
                <Select
                  value={editCurriculumId || '__none__'}
                  onValueChange={(v) => setEditCurriculumId(v === '__none__' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a curriculum..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {curricula.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSaveSettings}
                disabled={saving || !editName.trim()}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
