'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import {
  getModerationQueue,
  setModerationStatus,
  forceSetVisibility,
  setFeatured,
  editContentTags,
  bulkModerate,
} from '@/app/actions/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Star,
  Tag,
  Trash2,
  Lock,
  Globe,
  Loader2,
  Inbox,
  History,
} from 'lucide-react';
import { EditTagsDialog } from '@/components/admin/edit-tags-dialog';
import type {
  Story,
  SubmittedDilemma,
  ModerationStatus,
  GlobalVisibility,
} from '@/types';

type ContentType = 'story' | 'dilemma' | 'analysis' | 'perspective';

interface QueueItem {
  id: string;
  contentType: ContentType;
  title: string;
  contributorName: string;
  createdAt?: any;
  submittedAt?: any;
  moderationStatus?: ModerationStatus;
  globalVisibility?: GlobalVisibility;
  featured?: boolean;
  genre?: string;
  theme?: string;
  tags?: string[];
  raw: any;
}

type QueueState = {
  stories: QueueItem[];
  dilemmas: QueueItem[];
  analyses: QueueItem[];
  perspectives: QueueItem[];
};

const EMPTY_STATE: QueueState = {
  stories: [],
  dilemmas: [],
  analyses: [],
  perspectives: [],
};

function normalizeDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDate(value: any): string {
  const d = normalizeDate(value);
  return d ? d.toLocaleDateString() : '—';
}

function toQueueItem(contentType: ContentType, raw: any): QueueItem {
  const title =
    raw?.title || raw?.name || raw?.prompt || raw?.question || '(untitled)';
  const contributorName =
    raw?.author ||
    raw?.authorName ||
    raw?.contributorName ||
    raw?.displayName ||
    raw?.userName ||
    raw?.submittedByName ||
    'Unknown';
  return {
    id: raw.id,
    contentType,
    title,
    contributorName,
    createdAt: raw.createdAt,
    submittedAt: raw.submittedAt,
    moderationStatus: raw.moderationStatus,
    globalVisibility: raw.globalVisibility,
    featured: raw.featured,
    genre: raw.genre,
    theme: raw.theme,
    tags: raw.tags,
    raw,
  };
}

function statusBadgeVariant(status?: ModerationStatus): {
  className: string;
  label: string;
} {
  switch (status) {
    case 'approved':
      return {
        className: 'bg-green-500/15 text-green-400 border-green-500/30',
        label: 'Approved',
      };
    case 'flagged':
      return {
        className: 'bg-red-500/15 text-red-400 border-red-500/30',
        label: 'Flagged',
      };
    case 'restricted':
      return {
        className: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
        label: 'Restricted',
      };
    case 'pending':
    default:
      return {
        className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        label: 'Pending',
      };
  }
}

const TYPE_LABEL: Record<ContentType, string> = {
  story: 'Story',
  dilemma: 'Dilemma',
  analysis: 'Analysis',
  perspective: 'Perspective',
};

export default function AdminModerationPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const [queue, setQueue] = useState<QueueState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [workingIds, setWorkingIds] = useState<Set<string>>(new Set());

  const [editTarget, setEditTarget] = useState<QueueItem | null>(null);
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentType>('story');

  const fetchQueue = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const result = await getModerationQueue(user.uid);
    if (result.success) {
      setQueue({
        stories: (result.data.stories || []).map((s: Story) => toQueueItem('story', s)),
        dilemmas: (result.data.dilemmas || []).map((d: SubmittedDilemma) =>
          toQueueItem('dilemma', d)
        ),
        analyses: (result.data.analyses || []).map((a: any) => toQueueItem('analysis', a)),
        perspectives: (result.data.perspectives || []).map((p: any) =>
          toQueueItem('perspective', p)
        ),
      });
      setSelected(new Set());
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAdmin && user) fetchQueue();
  }, [isAdmin, user, fetchQueue]);

  const allItems: QueueItem[] = useMemo(
    () => [...queue.stories, ...queue.dilemmas, ...queue.analyses, ...queue.perspectives],
    [queue]
  );

  const itemKey = (item: QueueItem) => `${item.contentType}:${item.id}`;

  const toggleSelect = (item: QueueItem, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const key = itemKey(item);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const markWorking = (id: string, working: boolean) => {
    setWorkingIds((prev) => {
      const next = new Set(prev);
      if (working) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSetStatus = async (item: QueueItem, status: ModerationStatus) => {
    if (!user) return;
    markWorking(item.id, true);
    const res = await setModerationStatus(item.contentType, item.id, status, user.uid);
    markWorking(item.id, false);
    if (res.success) {
      toast({ title: `Status set to ${status}` });
      fetchQueue();
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const handleSetVisibility = async (item: QueueItem, vis: GlobalVisibility) => {
    if (!user) return;
    markWorking(item.id, true);
    const res = await forceSetVisibility(item.contentType, item.id, vis, user.uid);
    markWorking(item.id, false);
    if (res.success) {
      toast({ title: `Visibility set to ${vis}` });
      fetchQueue();
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const handleToggleFeatured = async (item: QueueItem) => {
    if (!user) return;
    if (item.contentType !== 'story' && item.contentType !== 'dilemma') {
      toast({
        title: 'Not featurable',
        description: 'Only stories and dilemmas can be featured.',
        variant: 'destructive',
      });
      return;
    }
    markWorking(item.id, true);
    const res = await setFeatured(
      item.contentType,
      item.id,
      !item.featured,
      user.uid
    );
    markWorking(item.id, false);
    if (res.success) {
      toast({ title: item.featured ? 'Unfeatured' : 'Featured' });
      fetchQueue();
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const handleDelete = async (item: QueueItem) => {
    if (!user) return;
    markWorking(item.id, true);
    const res = await bulkModerate(
      [{ contentType: item.contentType, contentId: item.id }],
      'delete',
      user.uid
    );
    markWorking(item.id, false);
    if (res.success) {
      toast({ title: 'Item deleted' });
      fetchQueue();
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const handleSaveTags = async (values: {
    genre?: string;
    theme?: string;
    tags?: string[];
  }) => {
    if (!user || !editTarget) return;
    if (editTarget.contentType !== 'story' && editTarget.contentType !== 'dilemma') {
      toast({
        title: 'Cannot edit tags',
        description: 'Only stories and dilemmas have editable tags.',
        variant: 'destructive',
      });
      return;
    }
    setIsSavingTags(true);
    const res = await editContentTags(
      editTarget.contentType,
      editTarget.id,
      values,
      user.uid
    );
    setIsSavingTags(false);
    if (res.success) {
      toast({ title: 'Tags updated' });
      setEditTarget(null);
      fetchQueue();
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const handleApplyBulk = async () => {
    if (!user) return;
    if (!bulkAction) {
      toast({ title: 'Select an action', variant: 'destructive' });
      return;
    }
    if (selected.size === 0) {
      toast({ title: 'Select at least one item', variant: 'destructive' });
      return;
    }

    const items: { contentType: ContentType; contentId: string }[] = [];
    for (const key of selected) {
      const [contentType, contentId] = key.split(':') as [ContentType, string];
      items.push({ contentType, contentId });
    }

    const res = await bulkModerate(items, bulkAction as any, user.uid);
    if (res.success) {
      toast({
        title: 'Bulk action complete',
        description: `${res.data.succeeded} succeeded, ${res.data.failed} failed.`,
      });
      setSelected(new Set());
      setBulkAction('');
      fetchQueue();
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  if (adminLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-lg mx-auto mt-10 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" /> Access denied
          </CardTitle>
          <CardDescription>
            You need admin privileges to access the moderation queue.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const renderBucket = (items: QueueItem[]) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Inbox className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Nothing to moderate here.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => {
          const key = itemKey(item);
          const statusInfo = statusBadgeVariant(item.moderationStatus);
          const working = workingIds.has(item.id);
          return (
            <Card
              key={key}
              className="bg-card/80 backdrop-blur-sm border-border"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <Checkbox
                      checked={selected.has(key)}
                      onCheckedChange={(checked) =>
                        toggleSelect(item, checked === true)
                      }
                      aria-label={`Select ${item.title}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline">{TYPE_LABEL[item.contentType]}</Badge>
                      <Badge variant="outline" className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                      {item.featured && (
                        <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {item.globalVisibility && (
                        <Badge variant="outline" className="text-xs">
                          {item.globalVisibility === 'public' ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-base truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      by {item.contributorName} · submitted{' '}
                      {formatDate(item.submittedAt || item.createdAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetStatus(item, 'approved')}
                        disabled={working}
                      >
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetStatus(item, 'flagged')}
                        disabled={working}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Flag
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetStatus(item, 'restricted')}
                        disabled={working}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Restrict
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetVisibility(item, 'private')}
                        disabled={working}
                      >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Make Private
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetVisibility(item, 'public')}
                        disabled={working}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Force Public
                      </Button>
                      {(item.contentType === 'story' ||
                        item.contentType === 'dilemma') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleFeatured(item)}
                            disabled={working}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            {item.featured ? 'Unfeature' : 'Feature'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditTarget(item)}
                            disabled={working}
                          >
                            <Tag className="h-4 w-4 mr-1" />
                            Edit Tags
                          </Button>
                        </>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={working}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes the content. This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const totalPending = allItems.length;

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Shield className="h-6 w-6" />
            Moderation Queue
          </CardTitle>
          <CardDescription>
            {totalPending} item{totalPending === 1 ? '' : 's'} currently pending
            or flagged across all content types.
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Could not load moderation queue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Bulk Actions</CardTitle>
          <CardDescription>
            {selected.size} selected across all tabs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Choose an action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="flag">Flag</SelectItem>
              <SelectItem value="restrict">Restrict</SelectItem>
              <SelectItem value="make_public">Make Public</SelectItem>
              <SelectItem value="make_private">Make Private</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleApplyBulk}
            disabled={selected.size === 0 || !bulkAction}
          >
            Apply to {selected.size} item{selected.size === 1 ? '' : 's'}
          </Button>
          {selected.size > 0 && (
            <Button variant="outline" onClick={() => setSelected(new Set())}>
              Clear selection
            </Button>
          )}
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ContentType)}
      >
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="story">
            Stories ({queue.stories.length})
          </TabsTrigger>
          <TabsTrigger value="dilemma">
            Dilemmas ({queue.dilemmas.length})
          </TabsTrigger>
          <TabsTrigger value="analysis">
            Analyses ({queue.analyses.length})
          </TabsTrigger>
          <TabsTrigger value="perspective">
            Perspectives ({queue.perspectives.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="story" className="mt-4">
          {renderBucket(queue.stories)}
        </TabsContent>
        <TabsContent value="dilemma" className="mt-4">
          {renderBucket(queue.dilemmas)}
        </TabsContent>
        <TabsContent value="analysis" className="mt-4">
          {renderBucket(queue.analyses)}
        </TabsContent>
        <TabsContent value="perspective" className="mt-4">
          {renderBucket(queue.perspectives)}
        </TabsContent>
      </Tabs>

      <EditTagsDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        initial={
          editTarget
            ? {
                genre: editTarget.genre,
                theme: editTarget.theme,
                tags: editTarget.tags,
              }
            : undefined
        }
        onSave={handleSaveTags}
        isSaving={isSavingTags}
      />

      <div className="text-sm text-muted-foreground flex items-center gap-2 pt-4">
        <History className="h-4 w-4" />
        <a href="/admin/audit-log" className="underline">
          View audit log
        </a>
      </div>
    </div>
  );
}
