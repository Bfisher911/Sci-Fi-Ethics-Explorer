'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FileCheck,
  FilePlus2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Inbox,
  Users,
  Pencil,
  Trash2,
  Globe,
  Lock,
  FileText,
  FlaskConical,
  GitCompare,
  BookOpen,
} from 'lucide-react';
import type {
  SubmittedDilemma,
  Story,
  SavedAnalysis,
  SavedPerspective,
  GlobalVisibility,
} from '@/types';
import { getSubmissionsByAuthor } from '@/app/actions/admin';
import {
  getUserStories,
  setStoryVisibility,
  deleteStory,
} from '@/app/actions/stories';
import {
  getUserAnalyses,
  setAnalysisVisibility,
  deleteAnalysis,
} from '@/app/actions/analyses';
import {
  getUserPerspectives,
  setPerspectiveVisibility,
  deletePerspective,
} from '@/app/actions/perspectives';
import {
  setDilemmaVisibility,
  deleteDilemma,
} from '@/app/actions/dilemmas-user';

type ItemType = 'story' | 'dilemma' | 'analysis' | 'perspective';

interface NormalizedItem {
  id: string;
  type: ItemType;
  title: string;
  snippet: string;
  status?: string;
  globalVisibility: GlobalVisibility;
  updatedAt: Date | null;
  createdAt: Date | null;
  // Dilemma-specific
  rejectionReason?: string;
  communityName?: string;
  theme?: string;
}

function toDateSafe(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      try {
        return value.toDate();
      } catch {
        return null;
      }
    }
    if (typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }
  }
  return null;
}

function normalizeStory(s: Story): NormalizedItem {
  return {
    id: s.id,
    type: 'story',
    title: s.title || 'Untitled Story',
    snippet: s.description || '',
    status: s.status,
    globalVisibility: (s.globalVisibility as GlobalVisibility) || 'private',
    updatedAt: toDateSafe(s.updatedAt) ?? toDateSafe(s.createdAt),
    createdAt: toDateSafe(s.createdAt),
    theme: s.theme,
  };
}

function normalizeDilemma(d: SubmittedDilemma): NormalizedItem {
  return {
    id: d.id || '',
    type: 'dilemma',
    title: d.title || 'Untitled Dilemma',
    snippet: d.description || '',
    status: d.status,
    globalVisibility: (d.globalVisibility as GlobalVisibility) || 'public',
    updatedAt: toDateSafe(d.updatedAt) ?? toDateSafe(d.submittedAt),
    createdAt: toDateSafe(d.submittedAt),
    rejectionReason: d.rejectionReason,
    communityName: d.communityName,
    theme: d.theme,
  };
}

function normalizeAnalysis(a: SavedAnalysis): NormalizedItem {
  return {
    id: a.id,
    type: 'analysis',
    title:
      a.scenarioText.slice(0, 60) + (a.scenarioText.length > 60 ? '…' : ''),
    snippet: a.scenarioText,
    status: a.status,
    globalVisibility: (a.globalVisibility as GlobalVisibility) || 'private',
    updatedAt: toDateSafe(a.updatedAt) ?? toDateSafe(a.createdAt),
    createdAt: toDateSafe(a.createdAt),
  };
}

function normalizePerspective(p: SavedPerspective): NormalizedItem {
  return {
    id: p.id,
    type: 'perspective',
    title: p.scenario.slice(0, 60) + (p.scenario.length > 60 ? '…' : ''),
    snippet: p.scenario,
    status: p.status,
    globalVisibility: (p.globalVisibility as GlobalVisibility) || 'private',
    updatedAt: toDateSafe(p.updatedAt) ?? toDateSafe(p.createdAt),
    createdAt: toDateSafe(p.createdAt),
  };
}

const TYPE_META: Record<
  ItemType,
  { label: string; icon: React.ElementType; editPath: (id: string) => string }
> = {
  story: {
    label: 'Story',
    icon: BookOpen,
    editPath: (id) => `/create-story?edit=${id}`,
  },
  dilemma: {
    label: 'Dilemma',
    icon: FileText,
    editPath: (id) => `/submit-dilemma?edit=${id}`,
  },
  analysis: {
    label: 'Analysis',
    icon: FlaskConical,
    editPath: (id) => `/analyzer?edit=${id}`,
  },
  perspective: {
    label: 'Perspective',
    icon: GitCompare,
    editPath: (id) => `/perspective-comparison?edit=${id}`,
  },
};

function TypeBadge({ type }: { type: ItemType }) {
  const { label, icon: Icon } = TYPE_META[type];
  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    pending: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
    approved: 'border-green-500/50 bg-green-500/10 text-green-400',
    rejected: 'border-red-500/50 bg-red-500/10 text-red-400',
    draft: 'border-slate-500/50 bg-slate-500/10 text-slate-300',
    published: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
    archived: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
  };
  const Icon =
    status === 'pending'
      ? Clock
      : status === 'approved' || status === 'published'
      ? CheckCircle2
      : status === 'rejected'
      ? XCircle
      : null;
  const cls = styles[status] ?? 'border-slate-500/40 bg-slate-500/10';
  return (
    <Badge variant="outline" className={cls}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function VisibilityBadge({ visibility }: { visibility: GlobalVisibility }) {
  if (visibility === 'public') {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
      >
        <Globe className="h-3 w-3 mr-1" />
        Public
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-slate-500/50 bg-slate-500/10 text-slate-300"
    >
      <Lock className="h-3 w-3 mr-1" />
      Private
    </Badge>
  );
}

export default function MySubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [items, setItems] = useState<NormalizedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NormalizedItem | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>('all');

  const loadAll = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);

    const [dilemmasRes, storiesRes, analysesRes, perspectivesRes] =
      await Promise.all([
        getSubmissionsByAuthor(user.uid),
        getUserStories(user.uid),
        getUserAnalyses(user.uid),
        getUserPerspectives(user.uid),
      ]);

    const merged: NormalizedItem[] = [];
    if (dilemmasRes.success) {
      dilemmasRes.data.forEach((d) => merged.push(normalizeDilemma(d)));
    }
    if (storiesRes.success) {
      storiesRes.data.forEach((s) => merged.push(normalizeStory(s)));
    }
    if (analysesRes.success) {
      analysesRes.data.forEach((a) => merged.push(normalizeAnalysis(a)));
    }
    if (perspectivesRes.success) {
      perspectivesRes.data.forEach((p) => merged.push(normalizePerspective(p)));
    }

    const failed = [
      dilemmasRes,
      storiesRes,
      analysesRes,
      perspectivesRes,
    ].find((r) => !r.success);
    if (failed && !failed.success) {
      setError(failed.error || 'Failed to load some submissions.');
    }

    merged.sort((a, b) => {
      const at = a.updatedAt?.getTime() ?? 0;
      const bt = b.updatedAt?.getTime() ?? 0;
      return bt - at;
    });

    setItems(merged);
    setLoading(false);
  }, [user?.uid]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    loadAll();
  }, [authLoading, user?.uid, loadAll]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return items;
    const map: Record<string, ItemType> = {
      stories: 'story',
      dilemmas: 'dilemma',
      analyses: 'analysis',
      perspectives: 'perspective',
    };
    const type = map[activeTab];
    return type ? items.filter((i) => i.type === type) : items;
  }, [items, activeTab]);

  const handleToggleVisibility = async (item: NormalizedItem) => {
    if (!user?.uid) return;
    const next: GlobalVisibility =
      item.globalVisibility === 'public' ? 'private' : 'public';

    // Optimistic update
    const prev = items;
    setItems((cur) =>
      cur.map((i) =>
        i.id === item.id && i.type === item.type
          ? { ...i, globalVisibility: next }
          : i
      )
    );

    let result;
    switch (item.type) {
      case 'story':
        result = await setStoryVisibility(item.id, user.uid, next);
        break;
      case 'dilemma':
        result = await setDilemmaVisibility(item.id, user.uid, next);
        break;
      case 'analysis':
        result = await setAnalysisVisibility(item.id, user.uid, next);
        break;
      case 'perspective':
        result = await setPerspectiveVisibility(item.id, user.uid, next);
        break;
    }

    if (!result?.success) {
      setItems(prev);
      toast({
        title: 'Could not update visibility',
        description: result?.error || 'Please try again.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: next === 'public' ? 'Made Public' : 'Made Private',
      description:
        next === 'public'
          ? 'This item is now visible in public feeds.'
          : 'This item is no longer visible in public feeds.',
    });
  };

  const handleEdit = (item: NormalizedItem) => {
    router.push(TYPE_META[item.type].editPath(item.id));
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !user?.uid) return;
    const item = pendingDelete;

    // Optimistic remove
    const prev = items;
    setItems((cur) =>
      cur.filter((i) => !(i.id === item.id && i.type === item.type))
    );
    setPendingDelete(null);

    let result;
    switch (item.type) {
      case 'story':
        result = await deleteStory(item.id, user.uid);
        break;
      case 'dilemma':
        result = await deleteDilemma(item.id, user.uid);
        break;
      case 'analysis':
        result = await deleteAnalysis(item.id, user.uid);
        break;
      case 'perspective':
        result = await deletePerspective(item.id, user.uid);
        break;
    }

    if (!result?.success) {
      setItems(prev);
      toast({
        title: 'Could not delete',
        description: result?.error || 'Please try again.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Deleted',
      description: `The ${TYPE_META[item.type].label.toLowerCase()} has been removed.`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="flex items-center gap-3 text-3xl text-primary font-headline">
              <FileCheck className="h-7 w-7" />
              My Submissions
            </h1>
          </CardTitle>
          <CardDescription>
            Manage everything you have created: stories, dilemmas, analyses,
            and perspective comparisons.
          </CardDescription>
        </CardHeader>
      </Card>

      {!authLoading && !user && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not signed in</AlertTitle>
          <AlertDescription>
            Please sign in to view your submissions.
          </AlertDescription>
        </Alert>
      )}

      {(authLoading || loading) && user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && user && items.length === 0 && !error && (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <CardContent className="p-0 space-y-4">
            <Inbox className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold text-muted-foreground">
              You haven't created any content yet
            </h2>
            <p className="text-muted-foreground/80">
              Submit a dilemma, write a story, or run an analysis to get
              started.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/submit-dilemma">
                  <FilePlus2 className="h-4 w-4 mr-2" />
                  Submit a Dilemma
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/create-story">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create a Story
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && user && items.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto">
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="stories">
              Stories ({items.filter((i) => i.type === 'story').length})
            </TabsTrigger>
            <TabsTrigger value="dilemmas">
              Dilemmas ({items.filter((i) => i.type === 'dilemma').length})
            </TabsTrigger>
            <TabsTrigger value="analyses">
              Analyses ({items.filter((i) => i.type === 'analysis').length})
            </TabsTrigger>
            <TabsTrigger value="perspectives">
              Perspectives (
              {items.filter((i) => i.type === 'perspective').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filtered.length === 0 ? (
              <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
                <CardContent className="p-0 space-y-2">
                  <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nothing in this category yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((item) => (
                  <Card
                    key={`${item.type}-${item.id}`}
                    className="bg-card/80 backdrop-blur-sm flex flex-col"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg text-primary line-clamp-2 flex-1">
                          {item.title}
                        </CardTitle>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEdit(item)}
                            aria-label={`Edit ${item.title}`}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleToggleVisibility(item)}
                            aria-label={
                              item.globalVisibility === 'public'
                                ? 'Make private'
                                : 'Make public'
                            }
                            title={
                              item.globalVisibility === 'public'
                                ? 'Make private'
                                : 'Make public'
                            }
                          >
                            {item.globalVisibility === 'public' ? (
                              <Globe className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Lock className="h-4 w-4 text-slate-400" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setPendingDelete(item)}
                            aria-label={`Delete ${item.title}`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <TypeBadge type={item.type} />
                        <StatusBadge status={item.status} />
                        <VisibilityBadge visibility={item.globalVisibility} />
                        {item.theme && (
                          <Badge variant="outline">{item.theme}</Badge>
                        )}
                        {item.communityName && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            {item.communityName}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                      {item.snippet && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.snippet}
                        </p>
                      )}
                      {item.updatedAt && (
                        <p className="text-xs text-muted-foreground">
                          Updated {format(item.updatedAt, 'PPP')} (
                          {formatDistanceToNow(item.updatedAt, {
                            addSuffix: true,
                          })}
                          )
                        </p>
                      )}
                      {item.type === 'dilemma' &&
                        item.status === 'rejected' &&
                        item.rejectionReason && (
                          <Alert className="bg-muted/50 border-red-500/30">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertTitle className="text-red-400">
                              Rejection reason:
                            </AlertTitle>
                            <AlertDescription className="text-muted-foreground">
                              {item.rejectionReason}
                            </AlertDescription>
                          </Alert>
                        )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this{' '}
              {pendingDelete
                ? TYPE_META[pendingDelete.type].label.toLowerCase()
                : 'item'}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
