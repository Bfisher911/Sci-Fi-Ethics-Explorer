'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Brain,
  Scale,
  FlaskConical,
  GitCompare,
  Search,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { searchArtifacts, type ArtifactSearchResult, type ArtifactType } from '@/app/actions/artifacts';

export type PickedArtifact = {
  type: ArtifactType;
  id: string;
  title: string;
};

interface ArtifactPickerProps {
  currentUserId?: string;
  onPick: (artifact: PickedArtifact) => void;
  trigger?: ReactNode;
  /** Optional controlled open state (rare - most callers should use trigger). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type FilterKey = 'all' | 'my-stories' | 'stories' | 'quizzes' | 'debates' | 'analyses';

const FILTER_TO_TYPES: Record<FilterKey, ArtifactType[] | undefined> = {
  all: undefined,
  'my-stories': ['story'],
  stories: ['story'],
  quizzes: ['quiz'],
  debates: ['debate'],
  analyses: ['analysis'],
};

export function artifactTypeIcon(type: ArtifactType, className = 'h-4 w-4'): ReactNode {
  switch (type) {
    case 'story':
      return <BookOpen className={className} />;
    case 'quiz':
      return <Brain className={className} />;
    case 'debate':
      return <Scale className={className} />;
    case 'analysis':
      return <FlaskConical className={className} />;
    case 'discussion':
      return <GitCompare className={className} />;
  }
}

export function ArtifactPicker({
  currentUserId,
  onPick,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: ArtifactPickerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const [queryText, setQueryText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ArtifactSearchResult[]>([]);
  const [recent, setRecent] = useState<ArtifactSearchResult[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce query 250ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(queryText);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [queryText]);

  // Main search effect
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function run(): Promise<void> {
      setLoading(true);
      const types = FILTER_TO_TYPES[filter];
      const authorId = filter === 'my-stories' ? currentUserId : undefined;
      const result = await searchArtifacts({
        query: debouncedQuery || undefined,
        types,
        authorId,
      });
      if (cancelled) return;
      if (result.success) {
        setResults(result.data);
      } else {
        setResults([]);
      }
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [open, debouncedQuery, filter, currentUserId]);

  // Fetch "My Recent Creations" once per open, if we know the user
  useEffect(() => {
    if (!open || !currentUserId) {
      setRecent([]);
      return;
    }
    let cancelled = false;
    async function run(): Promise<void> {
      const result = await searchArtifacts({ authorId: currentUserId });
      if (cancelled) return;
      if (result.success) {
        setRecent(result.data.slice(0, 5));
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [open, currentUserId]);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setQueryText('');
      setDebouncedQuery('');
      setFilter('all');
    }
  }, [open]);

  const handlePick = useCallback(
    (artifact: ArtifactSearchResult) => {
      onPick({ type: artifact.type, id: artifact.id, title: artifact.title });
      setOpen(false);
    },
    [onPick, setOpen],
  );

  const hasRecent = useMemo(
    () => currentUserId && recent.length > 0 && filter === 'all' && !debouncedQuery,
    [currentUserId, recent, filter, debouncedQuery],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Select an artifact</DialogTitle>
          <DialogDescription>
            Search across stories, quizzes, debates, and analyses to attach to this curriculum item.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            autoFocus
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search by title or description..."
            className="pl-9"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <TabsList className="w-full flex-wrap h-auto justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            {currentUserId && (
              <TabsTrigger value="my-stories">My Stories</TabsTrigger>
            )}
            <TabsTrigger value="stories">All Stories</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="debates">Debates</TabsTrigger>
            <TabsTrigger value="analyses">Analyses</TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="flex-1 pr-3 -mr-3" style={{ maxHeight: '50vh' }}>
          <div className="space-y-4">
            {hasRecent && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-primary">My Recent Creations</h3>
                </div>
                <div className="space-y-2">
                  {recent.map((r) => (
                    <ArtifactRow
                      key={`recent-${r.type}-${r.id}`}
                      artifact={r}
                      onClick={() => handlePick(r)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              {hasRecent && (
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Results</h3>
              )}
              {loading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No artifacts match your filters.</p>
                  <p className="text-xs opacity-70 mt-1">Try a different search or filter.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((r) => (
                    <ArtifactRow
                      key={`${r.type}-${r.id}`}
                      artifact={r}
                      onClick={() => handlePick(r)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {loading ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Searching...
              </span>
            ) : (
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ArtifactRowProps {
  artifact: ArtifactSearchResult;
  onClick: () => void;
}

function ArtifactRow({ artifact, onClick }: ArtifactRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 p-3 rounded-md border border-border bg-card/60 hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {artifact.imageUrl ? (
        <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
          <Image
            src={artifact.imageUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-16 h-16 flex-shrink-0 rounded bg-muted flex items-center justify-center text-muted-foreground">
          {artifactTypeIcon(artifact.type, 'h-6 w-6')}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px] h-4 capitalize flex items-center gap-1">
            {artifactTypeIcon(artifact.type, 'h-3 w-3')}
            {artifact.type}
          </Badge>
          <span className="font-medium text-sm truncate">
            {artifact.title || 'Untitled'}
          </span>
        </div>
        {artifact.snippet && (
          <p className="text-xs text-muted-foreground line-clamp-2">{artifact.snippet}</p>
        )}
      </div>
    </button>
  );
}
