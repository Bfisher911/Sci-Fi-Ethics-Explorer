'use client';

import { useState, useCallback } from 'react';
import type { Story, StorySegment } from '@/types';
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
import { Progress } from '@/components/ui/progress';
import { SegmentEditor } from '@/components/stories/segment-editor';
import { StoryPreview } from '@/components/stories/story-preview';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  BookOpen,
  FileText,
  Eye,
  Send,
} from 'lucide-react';

interface StoryEditorProps {
  onSubmit: (storyData: Omit<Story, 'id' | 'status' | 'publishedAt' | 'viewCount'>) => Promise<void>;
  authorName?: string;
  authorId?: string;
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
}: StoryEditorProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState<Step>('metadata');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [theme, setTheme] = useState('');
  const [author, setAuthor] = useState(authorName);

  // Segments
  const [segments, setSegments] = useState<StorySegment[]>([
    { id: 'seg1', type: 'linear', text: '' },
  ]);

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
    };
  }, [title, description, genre, theme, author, segments, authorId]);

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(buildStoryData());
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Error submitting story:', err);
      setSubmitError('Failed to submit story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Segment management
  const addSegment = (): void => {
    const newId = `seg${segments.length + 1}_${Date.now().toString(36)}`;
    setSegments([...segments, { id: newId, type: 'linear', text: '' }]);
  };

  const updateSegment = (index: number, updated: StorySegment): void => {
    const next = [...segments];
    next[index] = updated;
    setSegments(next);
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
    setSegments(next);
  };

  const allSegmentIds = segments.map((s) => s.id);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="space-y-3">
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
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="story-title">Title *</Label>
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
          </CardContent>
        </Card>
      )}

      {/* Step 2: Segments */}
      {currentStep === 'segments' && (
        <div className="space-y-4">
          {segments.map((seg, idx) => (
            <SegmentEditor
              key={seg.id}
              segment={seg}
              allSegmentIds={allSegmentIds}
              onChange={(updated) => updateSegment(idx, updated)}
              onDelete={() => deleteSegment(idx)}
              onMoveUp={() => moveSegment(idx, 'up')}
              onMoveDown={() => moveSegment(idx, 'down')}
              canMoveUp={idx > 0}
              canMoveDown={idx < segments.length - 1}
            />
          ))}
          <Button variant="outline" onClick={addSegment} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Segment
          </Button>
        </div>
      )}

      {/* Step 3: Preview */}
      {currentStep === 'preview' && <StoryPreview story={buildStoryData()} />}

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
                {submitError && (
                  <p className="text-destructive text-sm">{submitError}</p>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
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
