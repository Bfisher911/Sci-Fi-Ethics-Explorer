'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Community, Story, StorySegment, GlobalVisibility } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { SegmentEditor } from '@/components/stories/segment-editor';
import { StoryFlowMap } from '@/components/stories/story-flow-map';
import { StoryPreview } from '@/components/stories/story-preview';
import { StoryVersionHistory } from '@/components/stories/story-version-history';
import { StoryWalkthrough } from '@/components/stories/story-walkthrough';
import { TemplatePicker } from '@/components/stories/template-picker';
import { WritingAssistant } from '@/components/stories/writing-assistant';
import {
  SubGenreSelect,
  EthicalFocusTagCloud,
  ComplexitySlider,
  TechLevelSelect,
} from '@/components/stories/metadata-inputs';
import { InfoIcon } from '@/components/ui/info-icon';
import type { StoryTemplate } from '@/data/story-templates';
import { getUserCommunities } from '@/app/actions/communities';
import {
  getStoryById,
  saveStoryDraft,
  submitUserStory,
} from '@/app/actions/stories';
import { useAutoSave } from '@/hooks/use-autosave';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  BookOpen,
  FileText,
  Eye,
  Send,
  Globe,
  Save,
  History,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

const NONE_COMMUNITY_VALUE = '__none__';

export interface StorySubmitOptions {
  /** If set (and not "__none__"), caller should also share to this community. */
  communityId?: string;
  /** Whether to publish globally (public) or keep private to the author. */
  globalVisibility?: GlobalVisibility;
}

interface StoryEditorProps {
  onSubmit: (
    storyData: Omit<Story, 'id' | 'status' | 'publishedAt' | 'viewCount'>,
    options?: StorySubmitOptions
  ) => Promise<void>;
  authorName?: string;
  authorId?: string;
  /** Optional pre-populated story for edit mode. */
  initialStory?: Story | null;
  /**
   * If set, the editor operates in edit mode for an existing story:
   * - Auto-save to draft is enabled.
   * - "Save as Draft" uses `saveStoryDraft` on the existing story.
   * - The History panel is available.
   * If `initialStory` is not also provided, the editor will fetch the
   * story by id.
   */
  editingStoryId?: string;
}

type Step = 'metadata' | 'segments' | 'preview' | 'submit';
const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'metadata', label: 'Metadata', icon: FileText },
  { key: 'segments', label: 'Segments', icon: BookOpen },
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'submit', label: 'Submit', icon: Send },
];

const GENRES = [
  'Cyberpunk',
  'Space Opera',
  'Dystopia',
  'Post-Apocalyptic',
  'Hard Sci-Fi',
  'Biopunk',
  'Time Travel',
  'First Contact',
  'Other',
];

const THEMES = [
  'AI Sentience',
  'Privacy & Surveillance',
  'Genetic Engineering',
  'Resource Allocation',
  'Digital Rights',
  'Environmental Ethics',
  'Transhumanism',
  'Corporate Ethics',
  'Other',
];

/**
 * Multi-step form for creating user-generated stories.
 * Steps: Metadata -> Segments -> Preview -> Submit
 */
export function StoryEditor({
  onSubmit,
  authorName = 'Anonymous',
  authorId,
  initialStory,
  editingStoryId,
}: StoryEditorProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState<Step>('metadata');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { toast } = useToast();

  // Server-backed story id. Set when editing an existing story or after a
  // brand-new story is first saved as a draft.
  const [storyId, setStoryId] = useState<string | undefined>(
    editingStoryId ?? initialStory?.id
  );

  // Metadata (pre-populated from initialStory when editing)
  const [title, setTitle] = useState(initialStory?.title ?? '');
  const [description, setDescription] = useState(
    initialStory?.description ?? ''
  );
  const [genre, setGenre] = useState(initialStory?.genre ?? '');
  const [theme, setTheme] = useState(initialStory?.theme ?? '');
  const [author, setAuthor] = useState(initialStory?.author ?? authorName);
  const [subGenre, setSubGenre] = useState<Story['subGenre']>(initialStory?.subGenre);
  const [ethicalFocus, setEthicalFocus] = useState<string[]>(
    initialStory?.ethicalFocus ?? []
  );
  const [complexity, setComplexity] = useState<number>(initialStory?.complexity ?? 3);
  const [techLevel, setTechLevel] = useState<Story['techLevel']>(initialStory?.techLevel);

  // Segments
  const [segments, setSegments] = useState<StorySegment[]>(
    initialStory?.segments && initialStory.segments.length > 0
      ? initialStory.segments
      : [{ id: 'seg1', type: 'linear', text: '' }]
  );

  // Community sharing
  const [communityId, setCommunityId] = useState<string>(NONE_COMMUNITY_VALUE);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  // Global visibility (default to private for new stories; keep existing
  // setting when editing).
  const [publiclyVisible, setPubliclyVisible] = useState<boolean>(
    initialStory
      ? (initialStory.globalVisibility ?? 'private') === 'public'
      : false
  );

  // When `editingStoryId` is supplied without `initialStory`, fetch the
  // story from Firestore and hydrate the form.
  const [loadingStory, setLoadingStory] = useState<boolean>(
    Boolean(editingStoryId && !initialStory)
  );
  const [justHydrated, setJustHydrated] = useState(false);
  useEffect(() => {
    if (!editingStoryId || initialStory) return;
    let cancelled = false;
    setLoadingStory(true);
    getStoryById(editingStoryId)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          const s = res.data;
          setTitle(s.title);
          setDescription(s.description);
          setGenre(s.genre);
          setTheme(s.theme);
          setAuthor(s.author || authorName);
          if (s.segments && s.segments.length > 0) {
            setSegments(s.segments);
          }
          setSubGenre(s.subGenre);
          setEthicalFocus(s.ethicalFocus ?? []);
          setComplexity(s.complexity ?? 3);
          setTechLevel(s.techLevel);
          setPubliclyVisible((s.globalVisibility ?? 'private') === 'public');
          setStoryId(s.id);
          setJustHydrated(true);
        }
      })
      .catch((err) => console.error('[StoryEditor] load story:', err))
      .finally(() => {
        if (!cancelled) setLoadingStory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editingStoryId, initialStory, authorName]);

  useEffect(() => {
    if (!authorId) return;
    let cancelled = false;
    setLoadingCommunities(true);
    getUserCommunities(authorId)
      .then((res) => {
        if (!cancelled && res.success) {
          setCommunities(res.data);
        }
      })
      .catch((err) => console.error('[StoryEditor] communities:', err))
      .finally(() => {
        if (!cancelled) setLoadingCommunities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authorId]);

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canProceedFromMetadata = title.trim() && description.trim() && genre && theme;
  const canProceedFromSegments =
    segments.length > 0 && segments.every((s) => s.text.trim().length > 0);

  const goToStep = (step: Step): void => setCurrentStep(step);
  const goNext = (): void => {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].key);
  };
  const goBack = (): void => {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1].key);
  };

  const buildStoryData = useCallback((): Omit<Story, 'id' | 'status' | 'publishedAt' | 'viewCount'> => {
    const hasInteractive = segments.some((s) => s.type === 'interactive');
    return {
      title: title.trim(),
      description: description.trim(),
      genre,
      theme,
      author: author.trim() || 'Anonymous',
      segments,
      isInteractive: hasInteractive,
      estimatedReadingTime: `${Math.max(1, Math.ceil(segments.length * 2))} min read`,
      authorId,
      subGenre,
      ethicalFocus: ethicalFocus.length > 0 ? ethicalFocus : undefined,
      complexity,
      techLevel,
    };
  }, [title, description, genre, theme, author, segments, authorId, subGenre, ethicalFocus, complexity, techLevel]);

  // Debounced auto-save: only active once a storyId is known (i.e. editing
  // an existing story, or after the first manual "Save as Draft" of a new
  // story). We pass a memoized payload so the hook can serialize-compare.
  const autoSavePayload = useMemo<Partial<Story> | null>(() => {
    if (!storyId) return null;
    return buildStoryData();
  }, [storyId, buildStoryData]);

  const autoSave = useAutoSave(storyId, autoSavePayload, authorId, {
    enabled: Boolean(storyId && authorId),
    debounceMs: 30_000,
  });

  // After loading an existing story, reset the auto-save baseline so the
  // hydration itself doesn't look like a user edit.
  useEffect(() => {
    if (justHydrated) {
      autoSave.reset();
      setJustHydrated(false);
    }
  }, [justHydrated, autoSave]);

  // Tick to refresh "Saved Xs ago" display.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (autoSave.status !== 'saved') return;
    const interval = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(interval);
  }, [autoSave.status]);

  const savedAgoLabel = useMemo(() => {
    if (!autoSave.lastSavedAt) return null;
    void now; // bind to the tick
    return formatDistanceToNowStrict(autoSave.lastSavedAt, {
      addSuffix: true,
    });
  }, [autoSave.lastSavedAt, now]);

  const handleSaveDraft = async (): Promise<void> => {
    if (!authorId) {
      toast({
        title: 'Sign in required',
        description: 'You need to be signed in to save a draft.',
        variant: 'destructive',
      });
      return;
    }
    setIsSavingDraft(true);
    try {
      const data = buildStoryData();
      if (storyId) {
        const result = await saveStoryDraft(storyId, authorId, data);
        if (!result.success) {
          throw new Error(result.error || 'Failed to save draft.');
        }
      } else {
        // Create the story (status defaults to 'draft' in submitUserStory).
        const created = await submitUserStory({ ...data, authorId });
        if (!created.success) {
          throw new Error(created.error || 'Failed to create draft.');
        }
        setStoryId(created.data);
      }
      toast({
        title: 'Saved as draft',
        description: 'Continue editing anytime from your profile.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Failed to save draft',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // After a version restore, reload the story into the editor.
  const handleVersionRestored = useCallback(async () => {
    if (!storyId) return;
    const res = await getStoryById(storyId);
    if (res.success && res.data) {
      const s = res.data;
      setTitle(s.title);
      setDescription(s.description);
      setGenre(s.genre);
      setTheme(s.theme);
      setAuthor(s.author || authorName);
      if (s.segments && s.segments.length > 0) {
        setSegments(s.segments);
      }
      autoSave.reset();
      setHistoryOpen(false);
    }
  }, [storyId, authorName, autoSave]);

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(buildStoryData(), {
        communityId:
          communityId && communityId !== NONE_COMMUNITY_VALUE
            ? communityId
            : undefined,
        globalVisibility: publiclyVisible ? 'public' : 'private',
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Error submitting story:', err);
      setSubmitError('Failed to submit story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Segment management
  const generateSegmentId = (): string =>
    `seg${segments.length + 1}_${Date.now().toString(36)}`;

  const addSegment = (): string => {
    const newId = generateSegmentId();
    setSegments([...segments, { id: newId, type: 'linear', text: '' }]);
    return newId;
  };

  /** Insert a new linear segment immediately after the given index; returns new id. */
  const createBranchAfter = (index: number): string => {
    const newId = generateSegmentId();
    const next = [...segments];
    next.splice(index + 1, 0, { id: newId, type: 'linear', text: '' });
    setSegments(next);
    return newId;
  };

  const updateSegment = (index: number, updated: StorySegment): void => {
    const next = [...segments];
    next[index] = updated;
    setSegments(next);
  };

  const applyTemplate = (template: StoryTemplate): void => {
    if (template.suggestedGenre && !genre) setGenre(template.suggestedGenre);
    if (template.suggestedTheme && !theme) setTheme(template.suggestedTheme);
    setSegments(template.segments);
    setActiveSegmentId(template.segments[0]?.id ?? null);
    toast({
      title: `Template loaded: ${template.name}`,
      description: 'Replace the placeholder text with your own story.',
    });
  };

  const deleteSegment = (index: number): void => {
    if (segments.length <= 1) return;
    setSegments(segments.filter((_, i) => i !== index));
  };

  const moveSegment = (index: number, direction: 'up' | 'down'): void => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= segments.length) return;
    const next = [...segments];
    [next[index], next[target]] = [next[target], next[index]];

    // Reference integrity check: since nextSegmentId references IDs (not positions),
    // existing links should still resolve. Warn if any choice targets a missing id.
    const allIds = new Set(next.map((s) => s.id));
    const hasBroken = next.some((s) =>
      (s.choices || []).some(
        (c) => c.nextSegmentId && !allIds.has(c.nextSegmentId)
      )
    );

    setSegments(next);

    if (hasBroken) {
      toast({
        title: 'Story flow may have changed',
        description:
          'Reordering this segment may have changed the story flow. Review choices.',
        variant: 'destructive',
      });
    }
  };

  const focusSegment = (segmentId: string): void => {
    setActiveSegmentId(segmentId);
    if (typeof window === 'undefined') return;
    // Defer so newly added segments are in the DOM.
    setTimeout(() => {
      const el = document.getElementById(`segment-${segmentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Try to focus the text area for quick typing.
        const textarea = el.querySelector<HTMLTextAreaElement>('textarea');
        textarea?.focus();
      }
    }, 60);
  };

  const allSegmentIds = segments.map((s) => s.id);

  // Auto-save status indicator.
  const renderAutoSaveIndicator = (): React.ReactNode => {
    if (!storyId) return null;
    switch (autoSave.status) {
      case 'saving':
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving…</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3 w-3 text-green-500" />
            <span>Saved{savedAgoLabel ? ` ${savedAgoLabel}` : ''}</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            <span>Save failed —</span>
            <button
              type="button"
              onClick={() => void autoSave.saveNow()}
              className="underline hover:no-underline"
            >
              retry
            </button>
          </div>
        );
      case 'pending':
        return (
          <div className="text-xs text-muted-foreground">Unsaved changes…</div>
        );
      case 'idle':
      default:
        return null;
    }
  };

  if (loadingStory) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editor toolbar: auto-save status + history + walkthrough */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-h-[1.5rem]">
          {renderAutoSaveIndicator()}
        </div>
        <div className="flex items-center gap-2">
          <span data-tour="template-picker">
            <TemplatePicker onPick={applyTemplate} />
          </span>
          <StoryWalkthrough disableAutoStart={Boolean(initialStory || editingStoryId)} />
          {storyId && authorId && (
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-1.5" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Version History</SheetTitle>
                  <SheetDescription>
                    Snapshots are captured automatically when you edit.
                    Restore to any previous version.
                  </SheetDescription>
                </SheetHeader>
                <StoryVersionHistory
                  storyId={storyId}
                  userId={authorId}
                  canRestore
                  onRestore={handleVersionRestored}
                />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <div className="space-y-3" data-tour="step-tabs">
        <div className="flex items-center justify-between text-sm">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.key === currentStep;
            const isPast = idx < stepIndex;
            return (
              <button
                key={step.key}
                onClick={() => {
                  if (isPast || isActive) goToStep(step.key);
                }}
                disabled={!isPast && !isActive}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : isPast
                    ? 'text-foreground/70 hover:text-foreground cursor-pointer'
                    : 'text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            );
          })}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Step 1: Metadata */}
      {currentStep === 'metadata' && (
        <Card className="bg-card/80 backdrop-blur-sm" data-tour="metadata-form">
          <CardHeader>
            <CardTitle>Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="story-title" className="flex items-center gap-1.5">
                Title *
                <InfoIcon content="The title appears on the story card and in your byline. Aim for evocative over descriptive — readers will judge the click on the first six words." />
              </Label>
              <Input
                id="story-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter story title"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="story-desc">Description *</Label>
              <Textarea
                id="story-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your story"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Genre *</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Theme *</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="story-author">Author Name</Label>
              <Input
                id="story-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* Research Terminal: extended metadata. All optional, but powers
                filtering in the Community Stories hub and cover-image search. */}
            <div className="pt-4 mt-4 border-t border-border/60 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Research Terminal
                </h3>
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-[10px] text-muted-foreground/70">optional</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SubGenreSelect
                  id="story-sub-genre"
                  value={subGenre}
                  onChange={setSubGenre}
                />
                <TechLevelSelect
                  id="story-tech-level"
                  value={techLevel}
                  onChange={setTechLevel}
                />
              </div>

              <EthicalFocusTagCloud
                values={ethicalFocus}
                onChange={setEthicalFocus}
              />

              <ComplexitySlider value={complexity} onChange={setComplexity} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Segments */}
      {currentStep === 'segments' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4" data-tour="segment-editor">
          <div className="space-y-4 min-w-0">
            <div data-tour="story-flow-map">
              <StoryFlowMap
                segments={segments}
                currentSegmentId={activeSegmentId || undefined}
                onSelect={focusSegment}
              />
            </div>
            {segments.map((seg, idx) => (
              <SegmentEditor
                key={seg.id}
                segment={seg}
                allSegmentIds={allSegmentIds}
                allSegments={segments}
                onChange={(updated) => updateSegment(idx, updated)}
                onDelete={() => deleteSegment(idx)}
                onMoveUp={() => moveSegment(idx, 'up')}
                onMoveDown={() => moveSegment(idx, 'down')}
                canMoveUp={idx > 0}
                canMoveDown={idx < segments.length - 1}
                onCreateBranch={() => createBranchAfter(idx)}
                onFocusSegment={focusSegment}
              />
            ))}
            <Button
              variant="outline"
              onClick={() => addSegment()}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Segment
            </Button>
          </div>
          <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <WritingAssistant
              segmentType={
                (segments.find((s) => s.id === activeSegmentId)?.type) ?? 'linear'
              }
              isEmpty={
                !(segments.find((s) => s.id === activeSegmentId)?.text || '').trim()
              }
            />
          </aside>
        </div>
      )}

      {/* Step 3: Preview */}
      {currentStep === 'preview' && (
        <div data-tour="preview">
          <StoryPreview story={buildStoryData()} />
        </div>
      )}

      {/* Step 4: Submit */}
      {currentStep === 'submit' && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Submit Your Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitSuccess ? (
              <div className="text-center py-8 space-y-3">
                <Check className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-lg font-semibold text-foreground">
                  Story submitted successfully!
                </p>
                <p className="text-sm text-muted-foreground">
                  Your story has been submitted for review. It will appear in the
                  library once approved.
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Your story is ready to submit. Here is a summary:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>Title:</strong> {title}
                    </li>
                    <li>
                      <strong>Genre:</strong> {genre}
                    </li>
                    <li>
                      <strong>Theme:</strong> {theme}
                    </li>
                    <li>
                      <strong>Segments:</strong> {segments.length}
                    </li>
                    <li>
                      <strong>Interactive:</strong>{' '}
                      {segments.some((s) => s.type === 'interactive') ? 'Yes' : 'No'}
                    </li>
                  </ul>
                  <p>
                    After submission, your story will be reviewed before
                    publication.
                  </p>
                </div>
                <div className="rounded-lg border border-input bg-background/50 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <Label
                      htmlFor="story-public"
                      className="flex items-center text-base"
                    >
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      Make Publicly Visible
                    </Label>
                    <Switch
                      id="story-public"
                      checked={publiclyVisible}
                      onCheckedChange={setPubliclyVisible}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When on, this story appears in the public Stories library
                    once approved. When off, only you can see it. You can
                    still share privately with a community below.
                  </p>
                </div>
                {authorId && (
                  <div className="space-y-1">
                    <Label htmlFor="story-community">
                      Share to community (optional)
                    </Label>
                    <Select
                      value={communityId}
                      onValueChange={setCommunityId}
                      disabled={loadingCommunities || isSubmitting}
                    >
                      <SelectTrigger id="story-community">
                        <SelectValue
                          placeholder={
                            loadingCommunities
                              ? 'Loading…'
                              : '— None (Public) —'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_COMMUNITY_VALUE}>
                          — None (Public) —
                        </SelectItem>
                        {communities.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      When shared, community members can discuss this story
                      privately.
                    </p>
                  </div>
                )}
                {submitError && (
                  <p className="text-destructive text-sm">{submitError}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2" data-tour="save-draft">
                  {authorId && (
                    <Button
                      onClick={handleSaveDraft}
                      disabled={isSubmitting || isSavingDraft}
                      variant="outline"
                      className="flex-1"
                    >
                      {isSavingDraft ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save as Draft
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isSavingDraft}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Story
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      {!submitSuccess && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep !== 'submit' && (
            <Button
              onClick={goNext}
              disabled={
                (currentStep === 'metadata' && !canProceedFromMetadata) ||
                (currentStep === 'segments' && !canProceedFromSegments)
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
