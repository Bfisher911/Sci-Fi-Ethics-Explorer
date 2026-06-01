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
  Trash2,
  CopyPlus,
  Plus,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';
import {
  getCommunity,
  getCommunityMembers,
  removeCommunityMember,
  updateCommunity,
  deleteCommunity,
  duplicateCommunity,
} from '@/app/actions/communities';
import { getCurricula } from '@/app/actions/curriculum';
import dynamic from 'next/dynamic';
import { CommunityMembers } from '@/components/communities/community-members';
import { ContributionsFeed } from '@/components/communities/contributions-feed';
import type { Community, CommunityMemberInfo, CurriculumPath } from '@/types';
import Link from 'next/link';

// The instructor view ships a row of seven other tabs. Only the
// default ("contributions") renders on first paint, so we lazy-load
// the heaviest siblings — the Forum (~640 LOC of date-fns + dialogs),
// the Media list, and the Invites pane only download once the user
// switches tabs. The skeleton matches the typical tab body height
// so layout shift on click is negligible.
const tabSkeleton = (
  <div className="h-64 w-full rounded-lg bg-muted/20 animate-pulse" />
);

const CommunityInvites = dynamic(
  () =>
    import('@/components/communities/community-invites').then(
      (m) => m.CommunityInvites,
    ),
  { ssr: false, loading: () => tabSkeleton },
);
const CommunityForum = dynamic(
  () =>
    import('@/components/forum/community-forum').then(
      (m) => m.CommunityForum,
    ),
  { ssr: false, loading: () => tabSkeleton },
);
const CommunityMediaList = dynamic(
  () =>
    import('@/components/forum/community-media-list').then(
      (m) => m.CommunityMediaList,
    ),
  { ssr: false, loading: () => tabSkeleton },
);

/**
 * Community detail page with role-based tabs for instructors and members.
 */
export default function CommunityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { isPaid, isSuperAdmin } = useSubscription();
  const { toast } = useToast();

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMemberInfo[]>([]);
  const [curricula, setCurricula] = useState<CurriculumPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Settings state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  /**
   * Multi-curriculum: communities may now have more than one learning
   * path. The settings UI lets the owner add/remove paths from this
   * array; the server stores both `curriculumPathIds` and the legacy
   * `curriculumPathId` (mirrored to the first id) for back-compat.
   */
  const [editCurriculumIds, setEditCurriculumIds] = useState<string[]>([]);
  const [pendingCurriculumId, setPendingCurriculumId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Lifecycle state — delete and duplicate are owner-only actions.
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const router = useRouter();

  // The owner manages the community even when not separately listed in
  // instructorIds — treat owner OR instructor as the instructor view.
  const isInstructor =
    !!user &&
    (community?.ownerId === user.uid ||
      !!community?.instructorIds?.includes(user.uid));
  const isMember =
    !!user && members.some((m) => m.uid === user.uid);
  // The super-admin and any user with the communityManager flag get
  // forum moderation powers in this community. The server enforces
  // this independently; we mirror it here to show/hide controls.
  const [viewerIsManager, setViewerIsManager] = useState(false);
  useEffect(() => {
    if (!user) {
      setViewerIsManager(false);
      return;
    }
    if (isSuperAdmin) {
      setViewerIsManager(true);
      return;
    }
    (async () => {
      const { isCommunityManager } = await import(
        '@/app/actions/community-manager'
      );
      setViewerIsManager(await isCommunityManager(user.uid));
    })();
  }, [user, isSuperAdmin]);

  const loadData = useCallback(async () => {
    const [communityResult, membersResult] = await Promise.all([
      getCommunity(id),
      getCommunityMembers(id),
    ]);

    if (communityResult.success && communityResult.data) {
      setCommunity(communityResult.data);
      setEditName(communityResult.data.name);
      setEditDescription(communityResult.data.description || '');
      setEditCurriculumIds(communityResult.data.curriculumPathIds ?? []);
    }

    if (membersResult.success) {
      setMembers(membersResult.data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load curricula. Instructors use this list to pick paths to assign;
  // members use it to render learning-path titles instead of bare ids in
  // the "Assigned Learning Paths" card. Either way the call is cheap and
  // the data is shared across views.
  useEffect(() => {
    getCurricula().then((result) => {
      if (result.success) setCurricula(result.data);
    });
  }, []);

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
      curriculumPathIds: editCurriculumIds,
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
              curriculumPathIds: editCurriculumIds,
              curriculumPathId: editCurriculumIds[0],
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

  /** Owner-only: delete this community and cascade everything inside it. */
  async function handleDeleteCommunity(): Promise<void> {
    if (!user || !community) return;
    setDeleting(true);
    const result = await deleteCommunity(community.id, user.uid);
    setDeleting(false);
    if (result.success) {
      toast({
        title: 'Community deleted',
        description: `Removed ${result.data.deletedDocs} record(s).`,
      });
      router.push('/communities');
    } else {
      toast({
        title: 'Could not delete community',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  /** Owner-only: duplicate into a fresh shell for a new cohort. */
  async function handleDuplicateCommunity(): Promise<void> {
    if (!user || !community) return;
    setDuplicating(true);
    const result = await duplicateCommunity({
      sourceCommunityId: community.id,
      requesterId: user.uid,
    });
    setDuplicating(false);
    if (result.success) {
      toast({
        title: 'Community duplicated',
        description: `Created "${result.data.name}". You can rename it any time.`,
      });
      router.push(`/communities/${result.data.id}`);
    } else {
      toast({
        title: 'Could not duplicate community',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  /** Add the pending picker value to the curriculum list (if not already present). */
  function addCurriculumId(): void {
    const id = pendingCurriculumId.trim();
    if (!id || editCurriculumIds.includes(id)) return;
    setEditCurriculumIds((prev) => [...prev, id]);
    setPendingCurriculumId('');
  }

  /** Remove one curriculum from the picked list. */
  function removeCurriculumId(idToRemove: string): void {
    setEditCurriculumIds((prev) => prev.filter((id) => id !== idToRemove));
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

        {(community.curriculumPathIds?.length ?? 0) > 0 && (
          <Card className="mb-6 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Assigned Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {community.curriculumPathIds!.map((cid) => {
                // Look up the title from `curricula` if we have it loaded;
                // otherwise fall back to the id so the link still works.
                const title =
                  curricula.find((c) => c.id === cid)?.title || cid;
                return (
                  <div key={cid} className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium truncate">{title}</span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/curriculum/${cid}`}>View</Link>
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary font-headline mb-3">
            Contributions
          </h2>
          <ContributionsFeed communityId={community.id} />
        </div>

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

      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-bold text-primary font-headline">
          {community.name}
        </h1>
        {/* Quick-link to the chronological activity feed. The tabs
            below are organized by content kind (forum, contributions,
            members, etc.) — the feed is the cross-cut "what's
            happening here" view. */}
        <Button asChild variant="outline" size="sm">
          <Link href={`/communities/${community.id}/feed`}>
            Activity feed
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="contributions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Contributions Tab */}
        <TabsContent value="contributions">
          <ContributionsFeed communityId={community.id} />
        </TabsContent>

        {/* Forum Tab — per-community topic board. Manager-pinned topics
            float to the top; any member can author a regular topic. */}
        <TabsContent value="forum">
          <CommunityForum
            communityId={community.id}
            viewerIsManager={viewerIsManager || isInstructor}
            viewerIsMember={isMember || isInstructor}
          />
        </TabsContent>

        {/* Media Tab — community reading/viewing list. Each added
            item gets its own discussion board on its media page. */}
        <TabsContent value="media">
          <CommunityMediaList
            communityId={community.id}
            canCurate={viewerIsManager || isInstructor}
          />
        </TabsContent>

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
                  <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy invite code">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-green-500">Copied!</p>
                )}
              </CardContent>
            </Card>

            {(community.curriculumPathIds?.length ?? 0) > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Assigned Learning Paths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {community.curriculumPathIds!.map((cid) => {
                    const title =
                      curricula.find((c) => c.id === cid)?.title || cid;
                    return (
                      <div
                        key={cid}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-sm font-medium truncate">
                          {title}
                        </span>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/curriculum/${cid}`}>View</Link>
                        </Button>
                      </div>
                    );
                  })}
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
                <Label>Assigned Learning Paths</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  A community can have more than one learning path. Members
                  see all of them and can switch between paths.
                </p>
                {editCurriculumIds.length > 0 ? (
                  <ul className="mb-3 space-y-1.5">
                    {editCurriculumIds.map((cid) => {
                      const title =
                        curricula.find((c) => c.id === cid)?.title || cid;
                      return (
                        <li
                          key={cid}
                          className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2"
                        >
                          <span className="text-sm truncate">{title}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCurriculumId(cid)}
                            aria-label={`Remove ${title}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mb-3 text-xs italic text-muted-foreground">
                    No learning paths assigned yet.
                  </p>
                )}
                <div className="flex gap-2">
                  <Select
                    value={pendingCurriculumId || '__none__'}
                    onValueChange={(v) =>
                      setPendingCurriculumId(v === '__none__' ? '' : v)
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Pick a learning path..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      {curricula
                        .filter((c) => !editCurriculumIds.includes(c.id))
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={addCurriculumId}
                    disabled={!pendingCurriculumId}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
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

          {/* Owner-only danger zone: duplicate (safe) + delete (irreversible).
              These are hidden from co-instructors because they're irreversible
              actions on the original community owner's property. */}
          {!!user && community.ownerId === user.uid && (
            <Card className="mt-6 bg-card/80 backdrop-blur-sm border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-destructive" />
                  Owner actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-w-lg">
                <div className="rounded-md border border-border/60 p-4">
                  <p className="text-sm font-medium mb-1">Duplicate community</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Create a fresh copy with the same learning paths, forum
                    topics, and curated media. Members are not copied — the new
                    community is a clean shell for a new cohort.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDuplicateCommunity}
                    disabled={duplicating}
                  >
                    {duplicating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CopyPlus className="h-4 w-4 mr-2" />
                    )}
                    Duplicate community
                  </Button>
                </div>

                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm font-medium mb-1">Delete community</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Permanently removes this community along with all
                    contributions, forum topics, media items, and pending
                    invites. This cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={deleting}>
                        {deleting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete community
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete "{community.name}" permanently?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the community along with all
                          contributions, forum topics, replies, curated media,
                          and pending invites. Members lose access immediately.
                          Submitted dilemmas authored by members survive — they
                          will just no longer be tied to this community. This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteCommunity}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete community
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
