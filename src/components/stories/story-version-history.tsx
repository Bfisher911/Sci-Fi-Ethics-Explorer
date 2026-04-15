'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { ContentVersion, Story, StorySegment } from '@/types';
import { getVersions } from '@/lib/versions';
import { restoreStoryVersion } from '@/app/actions/stories';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
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
  History,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StoryVersionHistoryProps {
  storyId: string;
  userId: string;
  /**
   * Whether this viewer may restore versions. Set to false when an admin is
   * previewing another user's story (read-only).
   */
  canRestore?: boolean;
  /** Called after a successful restore (so the parent can reload the story). */
  onRestore?: () => void;
}

interface DiffSummary {
  titleChanged?: { from: string; to: string };
  descriptionChanged?: boolean;
  genreChanged?: { from: string; to: string };
  themeChanged?: { from: string; to: string };
  segmentDelta: { added: number; removed: number; changed: number };
  statusChanged?: { from: string; to: string };
}

/**
 * Build a light-weight diff summary comparing a version snapshot against
 * the next-newer snapshot (or the current live story for the newest
 * version). Full text diffing is intentionally avoided — this just tells
 * the user what shape of change happened.
 */
function computeDiff(
  snapshot: Record<string, any>,
  compareAgainst: Record<string, any> | null
): DiffSummary {
  const diff: DiffSummary = { segmentDelta: { added: 0, removed: 0, changed: 0 } };
  if (!compareAgainst) return diff;

  if ((snapshot.title || '') !== (compareAgainst.title || '')) {
    diff.titleChanged = {
      from: snapshot.title || '',
      to: compareAgainst.title || '',
    };
  }
  if ((snapshot.description || '') !== (compareAgainst.description || '')) {
    diff.descriptionChanged = true;
  }
  if ((snapshot.genre || '') !== (compareAgainst.genre || '')) {
    diff.genreChanged = {
      from: snapshot.genre || '',
      to: compareAgainst.genre || '',
    };
  }
  if ((snapshot.theme || '') !== (compareAgainst.theme || '')) {
    diff.themeChanged = {
      from: snapshot.theme || '',
      to: compareAgainst.theme || '',
    };
  }
  if ((snapshot.status || '') !== (compareAgainst.status || '')) {
    diff.statusChanged = {
      from: snapshot.status || 'unknown',
      to: compareAgainst.status || 'unknown',
    };
  }

  const beforeSegs: StorySegment[] = Array.isArray(snapshot.segments)
    ? snapshot.segments
    : [];
  const afterSegs: StorySegment[] = Array.isArray(compareAgainst.segments)
    ? compareAgainst.segments
    : [];
  const beforeIds = new Set(beforeSegs.map((s) => s.id));
  const afterIds = new Set(afterSegs.map((s) => s.id));

  let added = 0;
  let removed = 0;
  afterIds.forEach((id) => {
    if (!beforeIds.has(id)) added += 1;
  });
  beforeIds.forEach((id) => {
    if (!afterIds.has(id)) removed += 1;
  });

  let changed = 0;
  const beforeById = new Map(beforeSegs.map((s) => [s.id, s]));
  afterSegs.forEach((seg) => {
    const prior = beforeById.get(seg.id);
    if (prior && prior.text !== seg.text) changed += 1;
  });

  diff.segmentDelta = { added, removed, changed };
  return diff;
}

function formatDiff(diff: DiffSummary): React.ReactNode {
  const parts: React.ReactNode[] = [];

  if (diff.titleChanged) {
    parts.push(
      <div key="title" className="text-xs">
        <span className="text-muted-foreground">Title: </span>
        <span className="line-through opacity-70">
          {diff.titleChanged.from || '(empty)'}
        </span>
        <span className="mx-1">→</span>
        <span className="font-medium">
          {diff.titleChanged.to || '(empty)'}
        </span>
      </div>
    );
  }
  if (diff.descriptionChanged) {
    parts.push(
      <div key="desc" className="text-xs text-muted-foreground">
        Description changed
      </div>
    );
  }
  if (diff.genreChanged) {
    parts.push(
      <div key="genre" className="text-xs">
        <span className="text-muted-foreground">Genre: </span>
        {diff.genreChanged.from || '(none)'} → {diff.genreChanged.to || '(none)'}
      </div>
    );
  }
  if (diff.themeChanged) {
    parts.push(
      <div key="theme" className="text-xs">
        <span className="text-muted-foreground">Theme: </span>
        {diff.themeChanged.from || '(none)'} → {diff.themeChanged.to || '(none)'}
      </div>
    );
  }
  if (diff.statusChanged) {
    parts.push(
      <div key="status" className="text-xs">
        <span className="text-muted-foreground">Status: </span>
        {diff.statusChanged.from} → {diff.statusChanged.to}
      </div>
    );
  }
  const { added, removed, changed } = diff.segmentDelta;
  if (added || removed || changed) {
    const segParts: string[] = [];
    if (added) segParts.push(`+${added} segment${added === 1 ? '' : 's'}`);
    if (removed) segParts.push(`-${removed} segment${removed === 1 ? '' : 's'}`);
    if (changed) segParts.push(`~${changed} edited`);
    parts.push(
      <div key="segs" className="text-xs font-mono">
        {segParts.join(', ')}
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No structural changes detected.
      </div>
    );
  }
  return <div className="space-y-1">{parts}</div>;
}

/**
 * Version history list for a story. Designed to live inside a Sheet.
 *
 * When `canRestore` is true, each row shows a Restore button that opens
 * a confirmation dialog before calling `restoreStoryVersion`.
 */
export function StoryVersionHistory({
  storyId,
  userId,
  canRestore = true,
  onRestore,
}: StoryVersionHistoryProps): JSX.Element {
  const { toast } = useToast();
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pendingRestore, setPendingRestore] = useState<ContentVersion | null>(
    null
  );
  const [restoring, setRestoring] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const list = await getVersions('story', storyId);
      setVersions(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRestoreConfirm = async (): Promise<void> => {
    if (!pendingRestore) return;
    setRestoring(true);
    try {
      const result = await restoreStoryVersion(
        storyId,
        pendingRestore.snapshot,
        userId
      );
      if (!result.success) {
        toast({
          title: 'Restore failed',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Version restored',
        description: `Restored to version ${pendingRestore.versionNumber}.`,
      });
      setPendingRestore(null);
      await load();
      onRestore?.();
    } catch (err) {
      toast({
        title: 'Restore failed',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Failed to load history</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground space-y-2">
        <History className="h-8 w-8 mx-auto opacity-50" />
        <p>No versions yet.</p>
        <p className="text-xs">
          Versions are captured whenever you edit a published story.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((version, idx) => {
        const isExpanded = expanded[version.id] ?? false;
        // For diffing: compare this version's snapshot to the next-newer
        // version (which appears earlier in the array, since newest-first).
        const nextNewer = idx > 0 ? versions[idx - 1].snapshot : null;
        const diff = isExpanded ? computeDiff(version.snapshot, nextNewer) : null;

        return (
          <Card key={version.id} className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [version.id]: !isExpanded,
                    }))
                  }
                  className="flex items-center gap-2 text-left flex-1 min-w-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        v{version.versionNumber}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(version.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {version.note && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {version.note}
                      </p>
                    )}
                    {(version.snapshot?.title as string) && (
                      <p className="text-sm font-medium truncate mt-0.5">
                        {version.snapshot.title as string}
                      </p>
                    )}
                  </div>
                </button>
                {canRestore ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPendingRestore(version)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Restore
                  </Button>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Eye className="h-3 w-3" />
                    Read-only
                  </Badge>
                )}
              </div>

              {isExpanded && diff && (
                <div className="pl-6 pt-2 border-t border-border/50">
                  {formatDiff(diff)}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <AlertDialog
        open={pendingRestore !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRestore(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Restore version {pendingRestore?.versionNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current editor content with version{' '}
              {pendingRestore?.versionNumber}. The current version will be
              saved as a snapshot first, so nothing is lost — you can restore
              back to it if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleRestoreConfirm();
              }}
              disabled={restoring}
            >
              {restoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restoring…
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper export to use the Story type indirectly (keeps tree-shakers happy
// and makes the snapshot typing explicit for callers).
export type StoryVersionSnapshot = Partial<Story>;
