'use client';

/**
 * Studio · Reflect tab — free-form reflection generator.
 *
 * The reflection AI flow normally fires automatically at the end of a
 * story (see src/ai/flows/generate-ending-reflection.ts and the
 * trigger in `(app)/stories/[id]/page.tsx`). This tab exposes the
 * SAME flow but lets the user paste a story title plus their own
 * choices, so they can generate a reflection on a story they read
 * elsewhere, on a real-world decision they've made, or on a thought
 * experiment.
 *
 * Uses the same structured-error contract as the auto-trigger path:
 *   { reflection, error?, errorCode? }
 * so the user always sees a specific diagnostic instead of the
 * unhelpful "Failed to generate reflection" toast the old flow
 * produced.
 */

import { useState } from 'react';
import { generateEndingReflection } from '@/ai/flows/generate-ending-reflection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Sparkles, Plus, X } from 'lucide-react';

const MAX_CHOICES = 8;
const MIN_CHOICES = 2;

export function ReflectTab() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [theme, setTheme] = useState('');
  const [choices, setChoices] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateChoice = (i: number, v: string) => {
    setChoices((prev) => prev.map((c, idx) => (idx === i ? v : c)));
  };
  const addChoice = () => {
    if (choices.length >= MAX_CHOICES) return;
    setChoices((prev) => [...prev, '']);
  };
  const removeChoice = (i: number) => {
    if (choices.length <= MIN_CHOICES) return;
    setChoices((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleGenerate = async () => {
    const cleanedTitle = title.trim();
    const cleanedChoices = choices.map((c) => c.trim()).filter(Boolean);
    if (!cleanedTitle) {
      setError('A story title is required.');
      return;
    }
    if (cleanedChoices.length < MIN_CHOICES) {
      setError(`At least ${MIN_CHOICES} choices are required.`);
      return;
    }
    setLoading(true);
    setError(null);
    setReflection(null);
    try {
      const result = await generateEndingReflection({
        storyTitle: cleanedTitle,
        userChoices: cleanedChoices,
        storyGenre: genre.trim() || undefined,
        storyTheme: theme.trim() || undefined,
      });
      if (result.reflection && result.reflection.trim()) {
        setReflection(result.reflection);
      } else {
        setError(
          result.error ??
            'The reflection engine returned an empty response. Try again in a moment.',
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Could not reach the reflection service (${msg}). Try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Paste a story title and the choices you (or a character) made along the
        way. The same engine that closes out interactive stories will write you
        a personalized reflection. Use this for stories you read elsewhere,
        real decisions you&apos;ve made, or thought experiments.
      </p>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="reflect-title">Story / scenario title</Label>
            <Input
              id="reflect-title"
              placeholder='e.g. "The Ship of Theseus Protocol" or "My layoff decision"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="reflect-genre">Genre (optional)</Label>
              <Input
                id="reflect-genre"
                placeholder="e.g. Hard Sci-Fi, Cyberpunk, Real life"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reflect-theme">Theme (optional)</Label>
              <Input
                id="reflect-theme"
                placeholder="e.g. Personal Identity, Justice, Care"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Choices made, in order</Label>
            <p className="text-xs text-muted-foreground mb-2">
              At least {MIN_CHOICES}, up to {MAX_CHOICES}. Be specific &mdash; the
              more concrete each step is, the sharper the reflection.
            </p>
            <div className="space-y-2">
              {choices.map((choice, i) => (
                <div key={i} className="flex gap-2">
                  <span className="flex h-10 w-7 items-center justify-center text-sm font-semibold text-muted-foreground">
                    {i + 1}.
                  </span>
                  <Textarea
                    value={choice}
                    onChange={(e) => updateChoice(i, e.target.value)}
                    placeholder={`Choice ${i + 1}`}
                    rows={2}
                    className="flex-1"
                  />
                  {choices.length > MIN_CHOICES && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChoice(i)}
                      aria-label={`Remove choice ${i + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {choices.length < MAX_CHOICES && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChoice}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add another choice
              </Button>
            )}
          </div>

          <div className="pt-2">
            <Button onClick={handleGenerate} disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate reflection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Couldn&apos;t generate reflection</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {reflection && (
        <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/30">
          <CardContent className="p-6 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary inline-flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> Your reflection
            </div>
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {reflection}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
