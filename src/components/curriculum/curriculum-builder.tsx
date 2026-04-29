'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  GripVertical,
  Eye,
  Copy,
  AlertTriangle,
  Lock,
  Link2,
} from 'lucide-react';
import {
  createCurriculum,
  updateCurriculum,
  cloneCurriculum,
} from '@/app/actions/curriculum';
import { validateCurriculum } from '@/lib/curriculum-validation';
import { checkArtifactExists, type ArtifactType } from '@/app/actions/artifacts';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { CurriculumModule, CurriculumItem, CurriculumPath } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArtifactPicker, artifactTypeIcon, type PickedArtifact } from './artifact-picker';
import {
  StaticContentPicker,
  type StaticPickedArtifact,
} from './static-content-picker';
import {
  BookText as BookTextIcon,
  ScrollText,
  Rocket,
  Clapperboard,
  Newspaper,
  BookOpen,
  MessageSquarePlus,
  StickyNote,
  Sparkles as SparklesIcon,
  BookOpenCheck,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CurriculumItemType } from '@/types';

interface CurriculumBuilderProps {
  /** If provided, builder loads existing curriculum and updates on save. */
  curriculum?: CurriculumPath;
  /** Optional callback invoked after successful save. */
  onSaved?: (id: string) => void;
}

type ExistsMap = Record<string, { exists: boolean; checked: boolean }>;

function itemKey(item: CurriculumItem): string {
  return `${item.type}:${item.referenceId}`;
}

/** The subset of types served by the existing ArtifactPicker (Firestore). */
const ARTIFACT_PICKER_TYPES: CurriculumItemType[] = [
  'story',
  'quiz',
  'debate',
  'analysis',
  'discussion',
];
/** The subset served by the new StaticContentPicker. */
const STATIC_PICKER_TYPES: CurriculumItemType[] = [
  'philosopher',
  'theory',
  'scifi-author',
  'scifi-media',
  'textbook-chapter',
];
/** Types authored inline with no external reference. */
const INLINE_TYPES: CurriculumItemType[] = [
  'instructions',
  'reflection',
  'perspective',
];

const ITEM_TYPE_META: Record<
  CurriculumItemType,
  { label: string; icon: typeof ScrollText }
> = {
  story: { label: 'Story', icon: BookOpen },
  quiz: { label: 'Quiz', icon: SparklesIcon },
  debate: { label: 'Debate', icon: SparklesIcon },
  analysis: { label: 'Analyzer exercise', icon: SparklesIcon },
  'analyzer-prompt': { label: 'Analyzer prompt', icon: SparklesIcon },
  discussion: { label: 'Discussion', icon: SparklesIcon },
  perspective: { label: 'Perspective comparison', icon: SparklesIcon },
  philosopher: { label: 'Philosopher page', icon: ScrollText },
  theory: { label: 'Ethical theory', icon: BookTextIcon },
  'scifi-author': { label: 'Sci-fi author', icon: Rocket },
  'scifi-media': { label: 'Sci-fi media', icon: Clapperboard },
  blog: { label: 'Official blog post', icon: Newspaper },
  'textbook-chapter': { label: 'Textbook chapter', icon: BookOpenCheck },
  instructions: { label: 'Instructions / header', icon: StickyNote },
  reflection: { label: 'Reflection prompt', icon: MessageSquarePlus },
};

function itemTypeIcon(type: CurriculumItemType, className = 'h-4 w-4') {
  const Icon = ITEM_TYPE_META[type]?.icon || BookOpen;
  return <Icon className={className} />;
}

export function CurriculumBuilder({ curriculum, onSaved }: CurriculumBuilderProps) {
  const { user } = useAuth();
  const { isSuperAdmin } = useSubscription();
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = Boolean(curriculum?.id);

  const [title, setTitle] = useState(curriculum?.title ?? '');
  const [description, setDescription] = useState(curriculum?.description ?? '');
  const [isPublic, setIsPublic] = useState(curriculum?.isPublic ?? true);
  const [certificateEnabled, setCertificateEnabled] = useState(
    curriculum?.certificate?.enabled ?? false
  );
  const [certificateTitle, setCertificateTitle] = useState(
    curriculum?.certificate?.title ?? ''
  );
  const [certificateDescription, setCertificateDescription] = useState(
    curriculum?.certificate?.description ?? ''
  );
  const [modules, setModules] = useState<CurriculumModule[]>(curriculum?.modules ?? []);
  const [saving, setSaving] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [existsMap, setExistsMap] = useState<ExistsMap>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Mark dirty on any change after initial mount
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setIsDirty(true);
  }, [title, description, isPublic, modules]);

  // Warn when navigating away with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent): void {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Broken-link detection: check each item's reference on mount and whenever items change
  useEffect(() => {
    let cancelled = false;
    async function checkAll(): Promise<void> {
      const toCheck: { key: string; type: ArtifactType; id: string }[] = [];
      for (const mod of modules) {
        for (const it of mod.items) {
          if (!it.referenceId) continue;
          const key = itemKey(it);
          if (existsMap[key]?.checked) continue;
          toCheck.push({ key, type: it.type as ArtifactType, id: it.referenceId });
        }
      }
      if (toCheck.length === 0) return;

      const updates: ExistsMap = {};
      await Promise.all(
        toCheck.map(async ({ key, type, id }) => {
          const res = await checkArtifactExists(type, id);
          if (res.success) {
            updates[key] = { exists: res.data.exists, checked: true };
          } else {
            updates[key] = { exists: true, checked: true };
          }
        }),
      );
      if (!cancelled && Object.keys(updates).length > 0) {
        setExistsMap((prev) => ({ ...prev, ...updates }));
      }
    }
    checkAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules]);

  // ─── Module operations ────────────────────────────────────────────────
  function addModule(): void {
    const newModule: CurriculumModule = {
      id: `mod-${Date.now()}`,
      title: '',
      description: '',
      order: modules.length,
      items: [],
    };
    setModules((prev) => [...prev, newModule]);
  }

  function removeModule(moduleId: string): void {
    setModules((prev) =>
      prev.filter((m) => m.id !== moduleId).map((m, i) => ({ ...m, order: i })),
    );
  }

  function updateModule(
    moduleId: string,
    field: keyof CurriculumModule,
    value: string,
  ): void {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, [field]: value } : m)),
    );
  }

  function onModuleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setModules((prev) => {
      const oldIndex = prev.findIndex((m) => m.id === active.id);
      const newIndex = prev.findIndex((m) => m.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((m, i) => ({ ...m, order: i }));
    });
  }

  // ─── Item operations ─────────────────────────────────────────────────
  function addItem(moduleId: string): void {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const newItem: CurriculumItem = {
          id: `item-${Date.now()}`,
          type: 'story',
          referenceId: '',
          title: '',
          order: m.items.length,
          isRequired: true,
        };
        return { ...m, items: [...m.items, newItem] };
      }),
    );
  }

  function removeItem(moduleId: string, itemId: string): void {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          items: m.items.filter((i) => i.id !== itemId).map((it, i) => ({ ...it, order: i })),
        };
      }),
    );
  }

  function updateItem(
    moduleId: string,
    itemId: string,
    field: string,
    value: string | boolean,
  ): void {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          items: m.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
        };
      }),
    );
  }

  function onItemDragEnd(moduleId: string, event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const oldIndex = m.items.findIndex((i) => i.id === active.id);
        const newIndex = m.items.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return m;
        const items = arrayMove(m.items, oldIndex, newIndex).map((it, i) => ({
          ...it,
          order: i,
        }));
        return { ...m, items };
      }),
    );
  }

  function handlePickArtifact(
    moduleId: string,
    itemId: string,
    artifact: PickedArtifact,
  ): void {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          items: m.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  type: artifact.type,
                  referenceId: artifact.id,
                  title: artifact.title,
                }
              : i,
          ),
        };
      }),
    );
    // Mark the new reference as checked-and-exists (we just picked it).
    const key = `${artifact.type}:${artifact.id}`;
    setExistsMap((prev) => ({ ...prev, [key]: { exists: true, checked: true } }));
  }

  // ─── Save / Clone ────────────────────────────────────────────────────
  async function handleSave(): Promise<void> {
    if (!user) return;
    const validation = validateCurriculum({ title, modules });
    if (!validation.ok) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);
    setSaving(true);

    const certificate = {
      enabled: certificateEnabled,
      ...(certificateTitle.trim() ? { title: certificateTitle.trim() } : {}),
      ...(certificateDescription.trim()
        ? { description: certificateDescription.trim() }
        : {}),
    };

    if (isEditing && curriculum) {
      const result = await updateCurriculum(
        curriculum.id,
        {
          title: title.trim(),
          description: description.trim(),
          isPublic,
          certificate,
          modules,
        },
        user?.uid
      );
      setSaving(false);
      if (result.success) {
        setIsDirty(false);
        toast({ title: 'Curriculum updated' });
        onSaved?.(curriculum.id);
      } else {
        toast({ title: 'Save failed', description: result.error, variant: 'destructive' });
      }
      return;
    }

    const result = await createCurriculum({
      title: title.trim(),
      description: description.trim(),
      creatorId: user.uid,
      creatorName: user.displayName || user.email || 'Unknown',
      isPublic,
      certificate,
      modules,
      createdAt: new Date(),
    });
    setSaving(false);
    if (result.success) {
      setIsDirty(false);
      toast({ title: 'Curriculum created' });
      onSaved?.(result.data);
      router.push(`/curriculum/${result.data}`);
    } else {
      toast({ title: 'Save failed', description: result.error, variant: 'destructive' });
    }
  }

  async function handleDuplicate(): Promise<void> {
    if (!user || !curriculum) return;
    if (isDirty) {
      const ok = window.confirm(
        'You have unsaved changes. Duplicate will clone the saved version. Continue?',
      );
      if (!ok) return;
    }
    setCloning(true);
    const result = await cloneCurriculum(
      curriculum.id,
      user.uid,
      user.displayName || user.email || 'Unknown',
    );
    setCloning(false);
    if (result.success) {
      toast({ title: 'Duplicated', description: 'Opening your copy...' });
      router.push(`/curriculum/${result.data}`);
    } else {
      toast({ title: 'Duplicate failed', description: result.error, variant: 'destructive' });
    }
  }

  const totalItems = useMemo(
    () => modules.reduce((sum, m) => sum + m.items.length, 0),
    [modules],
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header / Toolbar */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-primary">
                {isEditing ? 'Edit Curriculum' : 'Curriculum Details'}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen(true)}
                  disabled={modules.length === 0}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                {isEditing && curriculum && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    disabled={cloning}
                  >
                    {cloning ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Duplicate
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="curr-title">Title</Label>
              <Input
                id="curr-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Ethics in AI"
              />
            </div>
            <div>
              <Label htmlFor="curr-desc">Description</Label>
              <Textarea
                id="curr-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn..."
                rows={3}
              />
            </div>
            <div className="flex items-start gap-3 p-3 rounded-md border border-border bg-muted/20">
              <Switch
                id="is-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <div className="flex-1">
                <Label htmlFor="is-public" className="cursor-pointer">
                  Make Curriculum Public
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  When on, this curriculum appears in the public Learning Paths gallery.
                </p>
              </div>
            </div>

            {/* Certificate configuration. The tier is decided server-side
                from the author's super-admin status; this UI only tells
                the author which tier their curriculum will issue and why.
                Super-admins get the official-styled card; everyone else
                gets the community-styled card with an explicit note. */}
            <div
              className={`space-y-3 p-3 rounded-md border ${
                isSuperAdmin
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-accent/40 bg-accent/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <Switch
                  id="cert-enabled"
                  checked={certificateEnabled}
                  onCheckedChange={setCertificateEnabled}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="cert-enabled"
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                        isSuperAdmin
                          ? 'bg-primary/20 text-primary'
                          : 'bg-accent/20 text-accent'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-3 w-3"
                      >
                        <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 14.77l-4.77 2.51.91-5.32L4.27 8.62l5.34-.78L12 2z" />
                      </svg>
                    </span>
                    {isSuperAdmin
                      ? 'Awards an Official Certificate on completion'
                      : 'Awards a Community Certificate on completion'}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isSuperAdmin
                      ? 'When on, learners who finish every required item earn a shareable official certificate — platform-endorsed, visually distinct, and verifiable via hash.'
                      : 'When on, learners who finish every required item earn a shareable Community Certificate. Community certs use a visually distinct peer-issued design and are clearly labelled as not platform-endorsed. Only the site administrator can issue official certificates.'}
                  </p>
                </div>
              </div>
              {certificateEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                  <div>
                    <Label htmlFor="cert-title" className="text-xs">
                      Certificate title (optional)
                    </Label>
                    <Input
                      id="cert-title"
                      value={certificateTitle}
                      onChange={(e) => setCertificateTitle(e.target.value)}
                      placeholder={title || 'Defaults to the curriculum title'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-desc" className="text-xs">
                      Certificate description (optional)
                    </Label>
                    <Input
                      id="cert-desc"
                      value={certificateDescription}
                      onChange={(e) => setCertificateDescription(e.target.value)}
                      placeholder="e.g. Completed the AI Ethics learning path"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Please fix the following before saving</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Modules list with dnd */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onModuleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {modules.map((mod, modIndex) => (
                <SortableModule
                  key={mod.id}
                  module={mod}
                  index={modIndex}
                  existsMap={existsMap}
                  sensors={sensors}
                  onItemDragEnd={(e) => onItemDragEnd(mod.id, e)}
                  onUpdateModule={(field, value) => updateModule(mod.id, field, value)}
                  onRemoveModule={() => removeModule(mod.id)}
                  onAddItem={() => addItem(mod.id)}
                  onRemoveItem={(itemId) => removeItem(mod.id, itemId)}
                  onUpdateItem={(itemId, field, value) =>
                    updateItem(mod.id, itemId, field, value)
                  }
                  onPickArtifact={(itemId, artifact) =>
                    handlePickArtifact(mod.id, itemId, artifact)
                  }
                  currentUserId={user?.uid}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={addModule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Save Changes' : 'Save Curriculum'}
          </Button>
          {isDirty && (
            <span className="text-xs text-muted-foreground self-center">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Preview Sheet */}
        <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-primary">{title || 'Curriculum Preview'}</SheetTitle>
              <SheetDescription>
                {description || 'Student-facing preview. Locks and prerequisites shown.'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{modules.length} module{modules.length !== 1 ? 's' : ''}</Badge>
                <Badge variant="outline">{totalItems} item{totalItems !== 1 ? 's' : ''}</Badge>
                {isPublic ? (
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Public</Badge>
                ) : (
                  <Badge variant="outline">Private</Badge>
                )}
              </div>
              {modules.map((mod, i) => (
                <Card key={mod.id} className="bg-card/60">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Module {i + 1}: {mod.title || 'Untitled'}
                    </CardTitle>
                    {mod.description && (
                      <p className="text-xs text-muted-foreground">{mod.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mod.items.map((it, idx) => {
                      const priorRequired = mod.items
                        .slice(0, idx)
                        .some((p) => p.isRequired);
                      const locked = it.isRequired && priorRequired;
                      return (
                        <div
                          key={it.id}
                          className={`flex items-center gap-3 p-2 rounded border ${
                            locked ? 'opacity-60 border-dashed' : 'border-border'
                          }`}
                        >
                          {locked ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            artifactTypeIcon(it.type as ArtifactType, 'h-4 w-4 text-primary')
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {it.title || 'Untitled'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {it.type}
                          </Badge>
                          {it.isRequired && (
                            <Badge variant="destructive" className="text-[10px]">
                              Required
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

// ─── Sortable Module ────────────────────────────────────────────────────

interface SortableModuleProps {
  module: CurriculumModule;
  index: number;
  existsMap: ExistsMap;
  sensors: ReturnType<typeof useSensors>;
  onItemDragEnd: (event: DragEndEvent) => void;
  onUpdateModule: (field: keyof CurriculumModule, value: string) => void;
  onRemoveModule: () => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, field: string, value: string | boolean) => void;
  onPickArtifact: (itemId: string, artifact: PickedArtifact) => void;
  currentUserId?: string;
}

function SortableModule({
  module: mod,
  index,
  existsMap,
  sensors,
  onItemDragEnd,
  onUpdateModule,
  onRemoveModule,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onPickArtifact,
  currentUserId,
}: SortableModuleProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: mod.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-card/80 backdrop-blur-sm ${isDragging ? 'ring-2 ring-primary/40' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground"
            aria-label="Drag module"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <CardTitle className="text-base">Module {index + 1}</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemoveModule} aria-label="Remove module">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={mod.title}
          onChange={(e) => onUpdateModule('title', e.target.value)}
          placeholder="Module title"
        />
        <Textarea
          value={mod.description}
          onChange={(e) => onUpdateModule('description', e.target.value)}
          placeholder="Module description"
          rows={2}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onItemDragEnd}
        >
          <SortableContext
            items={mod.items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 pl-4 border-l-2 border-border">
              {mod.items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  existsMap={existsMap}
                  onRemove={() => onRemoveItem(item.id)}
                  onUpdate={(field, value) => onUpdateItem(item.id, field, value)}
                  onPick={(a) => onPickArtifact(item.id, a)}
                  currentUserId={currentUserId}
                />
              ))}
              <Button variant="outline" size="sm" onClick={onAddItem}>
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}

// ─── Sortable Item ──────────────────────────────────────────────────────

interface SortableItemProps {
  item: CurriculumItem;
  existsMap: ExistsMap;
  onRemove: () => void;
  onUpdate: (field: string, value: string | boolean) => void;
  onPick: (artifact: PickedArtifact) => void;
  currentUserId?: string;
}

function SortableItem({
  item,
  existsMap,
  onRemove,
  onUpdate,
  onPick,
  currentUserId,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const key = itemKey(item);
  const checked = existsMap[key]?.checked ?? false;
  const exists = existsMap[key]?.exists ?? true;
  const isBroken = Boolean(item.referenceId) && checked && !exists;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-2 p-2 rounded bg-muted/30 border ${
        isBroken ? 'border-destructive/60 bg-destructive/5' : 'border-transparent'
      } ${isDragging ? 'ring-2 ring-primary/40' : ''}`}
    >
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <button
          type="button"
          className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground self-center"
          aria-label="Drag item"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Type selector */}
        <Select
          value={item.type}
          onValueChange={(v) => {
            const next = v as CurriculumItemType;
            onUpdate('type', next);
            // Reset reference when switching between incompatible pickers
            if (item.referenceId) onUpdate('referenceId', '');
            // Seed a sensible title for inline types
            if (INLINE_TYPES.includes(next) && !item.title) {
              onUpdate(
                'title',
                next === 'instructions'
                  ? 'Module instructions'
                  : next === 'reflection'
                  ? 'Reflection prompt'
                  : 'Perspective comparison'
              );
            }
          }}
        >
          <SelectTrigger className="h-8 w-[180px] shrink-0 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Artifacts
            </div>
            {ARTIFACT_PICKER_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                <span className="inline-flex items-center gap-2">
                  {itemTypeIcon(t)}
                  {ITEM_TYPE_META[t].label}
                </span>
              </SelectItem>
            ))}
            <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Pages
            </div>
            {STATIC_PICKER_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                <span className="inline-flex items-center gap-2">
                  {itemTypeIcon(t)}
                  {ITEM_TYPE_META[t].label}
                </span>
              </SelectItem>
            ))}
            <SelectItem value="blog">
              <span className="inline-flex items-center gap-2">
                {itemTypeIcon('blog')}
                {ITEM_TYPE_META.blog.label}
              </span>
            </SelectItem>
            <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Inline
            </div>
            {INLINE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                <span className="inline-flex items-center gap-2">
                  {itemTypeIcon(t)}
                  {ITEM_TYPE_META[t].label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reference chooser — depends on selected type */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {INLINE_TYPES.includes(item.type) ? (
            <Input
              value={item.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              placeholder={
                item.type === 'instructions'
                  ? 'e.g. Before you start, read these instructions…'
                  : item.type === 'reflection'
                  ? 'Short label for this reflection (e.g. Week 1 reflection)'
                  : 'Short label (e.g. Compare utilitarian and deontological lenses)'
              }
              className="h-8 text-sm"
            />
          ) : item.referenceId ? (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-border bg-background/60 flex-1 min-w-0">
              {itemTypeIcon(item.type, 'h-4 w-4 text-primary flex-shrink-0')}
              <span className="text-sm truncate flex-1">
                {item.title || 'Untitled artifact'}
              </span>
              <Badge variant="outline" className="text-[10px] capitalize">
                {ITEM_TYPE_META[item.type]?.label || item.type}
              </Badge>
              {ARTIFACT_PICKER_TYPES.includes(item.type) ? (
                <ArtifactPicker
                  currentUserId={currentUserId}
                  onPick={onPick}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      Change
                    </Button>
                  }
                />
              ) : STATIC_PICKER_TYPES.includes(item.type) ? (
                <StaticContentPicker
                  types={[item.type]}
                  onPick={(a: StaticPickedArtifact) =>
                    onPick({
                      type: a.type as ArtifactType,
                      id: a.id,
                      title: a.title,
                    })
                  }
                  trigger={
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      Change
                    </Button>
                  }
                />
              ) : null}
            </div>
          ) : ARTIFACT_PICKER_TYPES.includes(item.type) ? (
            <ArtifactPicker
              currentUserId={currentUserId}
              onPick={onPick}
              trigger={
                <Button variant="outline" size="sm" className="flex-1 justify-start">
                  <Link2 className="h-3 w-3 mr-2" />
                  Select {ITEM_TYPE_META[item.type].label.toLowerCase()}
                </Button>
              }
            />
          ) : STATIC_PICKER_TYPES.includes(item.type) ? (
            <StaticContentPicker
              types={[item.type]}
              onPick={(a: StaticPickedArtifact) =>
                onPick({
                  type: a.type as ArtifactType,
                  id: a.id,
                  title: a.title,
                })
              }
              trigger={
                <Button variant="outline" size="sm" className="flex-1 justify-start">
                  <Link2 className="h-3 w-3 mr-2" />
                  Select {ITEM_TYPE_META[item.type].label.toLowerCase()}
                </Button>
              }
            />
          ) : item.type === 'blog' ? (
            <Input
              value={item.referenceId}
              onChange={(e) => onUpdate('referenceId', e.target.value)}
              placeholder="Official blog post slug (e.g. why-ai-ethics-matters)"
              className="h-8 text-sm font-mono"
            />
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <Checkbox
            id={`req-${item.id}`}
            checked={item.isRequired}
            onCheckedChange={(v) => onUpdate('isRequired', !!v)}
          />
          <Label htmlFor={`req-${item.id}`} className="text-xs text-muted-foreground cursor-pointer">
            Required
          </Label>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRemove}
              aria-label="Remove item"
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove item</TooltipContent>
        </Tooltip>
      </div>

      {/* Instructions + optional prompt */}
      <div className="pl-8 space-y-2">
        <Textarea
          value={item.instructions || ''}
          onChange={(e) => onUpdate('instructions', e.target.value)}
          placeholder={
            item.type === 'instructions'
              ? 'Write the instructional text learners will read here…'
              : 'Optional instructions for this item (shown above it in the learner view)'
          }
          rows={item.type === 'instructions' ? 4 : 2}
          className="text-xs bg-background/60"
        />
        {(item.type === 'reflection' ||
          item.type === 'perspective' ||
          item.type === 'analysis') && (
          <Textarea
            value={item.prompt || ''}
            onChange={(e) => onUpdate('prompt', e.target.value)}
            placeholder={
              item.type === 'reflection'
                ? 'Prompt: what should the learner reflect on?'
                : item.type === 'analysis'
                ? 'Starter scenario: e.g. "A city installs AI-run triage in its ERs…"'
                : 'Prompt: what scenario should they compare across ethical lenses?'
            }
            rows={2}
            className="text-xs bg-background/60"
          />
        )}
      </div>

      {isBroken && (
        <div className="flex items-center gap-2 text-xs text-destructive pl-8">
          <AlertTriangle className="h-3 w-3" />
          <span>Content Missing — replace this item.</span>
        </div>
      )}
    </div>
  );
}
