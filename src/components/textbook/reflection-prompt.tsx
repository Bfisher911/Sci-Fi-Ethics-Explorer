'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Save,
  CheckCircle2,
  Lock,
  Lightbulb,
  Target,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { saveReflection, getChapterReflections } from '@/app/actions/textbook';

interface ReflectionPromptProps {
  index: number;
  promptId: string;
  prompt: string;
  chapterSlug: string;
}

/**
 * Generic sentence starters that work for almost any ethics prompt.
 * Surfaced via the "Stuck? Try a starter" button — one click pastes
 * one of these into the textarea so the user can start typing instead
 * of staring at a blank box.
 *
 * Picked semi-randomly per render but stable for that render so users
 * who toggle the panel see the same options each time. We rotate the
 * pool by promptId hash so different prompts on the same page show
 * different starter sets — keeps the page from looking templated.
 */
const SENTENCE_STARTERS = [
  'The strongest argument here is…',
  'I find myself agreeing with… because…',
  "What I keep coming back to is…",
  'A counterexample that troubles me is…',
  'If I imagine the worst-case version of this…',
  "What's missing from this framing is…",
  'My intuition says X, but the framework says Y, because…',
  "I'd resolve this differently if…",
  "The author seems to assume… and I'm not sure that holds when…",
  "I'm reminded of… which suggests…",
];

function pickStarters(promptId: string): string[] {
  // Tiny hash so the same prompt always picks the same 3 starters.
  let h = 0;
  for (let i = 0; i < promptId.length; i++) {
    h = (h * 31 + promptId.charCodeAt(i)) >>> 0;
  }
  const offset = h % SENTENCE_STARTERS.length;
  return [
    SENTENCE_STARTERS[offset],
    SENTENCE_STARTERS[(offset + 3) % SENTENCE_STARTERS.length],
    SENTENCE_STARTERS[(offset + 7) % SENTENCE_STARTERS.length],
  ];
}

const TARGET_WORD_COUNT = 50;

function wordCount(s: string): number {
  const trimmed = s.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * A single open-text reflection prompt. Auto-saves to Firestore when
 * signed in; offers a sign-in nudge otherwise.
 */
export function ReflectionPrompt({
  index,
  promptId,
  prompt,
  chapterSlug,
}: ReflectionPromptProps) {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showStarters, setShowStarters] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  const starters = useMemo(() => pickStarters(promptId), [promptId]);
  const words = useMemo(() => wordCount(value), [value]);
  const targetMet = words >= TARGET_WORD_COUNT;

  // Hydrate any saved response when the user is loaded.
  useEffect(() => {
    if (initializedRef.current) return;
    if (!user) {
      initializedRef.current = true;
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await getChapterReflections(user.uid, chapterSlug);
      if (!cancelled && res.success && res.data[promptId]) {
        setValue(res.data[promptId]);
      }
      initializedRef.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [user, chapterSlug, promptId]);

  function onChange(next: string) {
    setValue(next);
    if (!user) return;
    setStatus('saving');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const res = await saveReflection({
        userId: user.uid,
        slug: chapterSlug,
        promptId,
        response: next,
      });
      if (res.success) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('idle');
      }
    }, 800);
  }

  /**
   * Insert a starter at the cursor (or append it). After inserting,
   * focus the textarea so the user can keep typing immediately.
   */
  function insertStarter(starter: string) {
    setShowStarters(false);
    const ta = textareaRef.current;
    const trailing = value && !value.endsWith('\n') ? '\n' : '';
    const next = value + trailing + starter + ' ';
    onChange(next);
    // Focus + place cursor at end on the next tick (after React renders).
    setTimeout(() => {
      ta?.focus();
      ta?.setSelectionRange(next.length, next.length);
    }, 0);
  }

  return (
    <div className="rounded-lg border border-chart-4/30 bg-chart-4/5 p-4 md:p-5">
      <div className="flex items-start gap-3 mb-3">
        <Badge
          variant="outline"
          className="border-chart-4/40 text-chart-4 shrink-0"
        >
          Q{index}
        </Badge>
        <p className="text-base text-foreground/90 font-medium">{prompt}</p>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={user ? 'Write your reflection…' : 'Sign in to save your answer.'}
        rows={4}
        className="bg-background/50 resize-y"
      />

      {/* Sentence starters drawer — only shown when the user clicks
          "Stuck? Try a starter". Stays out of the way otherwise so it
          doesn't compete visually with the prompt. */}
      {showStarters && (
        <div className="mt-2 rounded-md border border-chart-4/30 bg-background/40 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-chart-4">
            <Lightbulb className="h-3 w-3" /> Try one of these
          </div>
          <div className="flex flex-wrap gap-2">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-md border border-border/60 bg-card/60 px-2.5 py-1 text-left text-xs text-foreground/85 transition-colors hover:border-chart-4/50 hover:bg-chart-4/5"
                onClick={() => insertStarter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 min-h-5 text-xs text-muted-foreground">
        {!user ? (
          <span className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            <Link
              href={`/login?next=/textbook/chapters/${chapterSlug}`}
              className="text-primary hover:underline"
            >
              Sign in
            </Link>{' '}
            to save your reflections across devices.
          </span>
        ) : status === 'saving' ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </span>
        ) : status === 'saved' ? (
          <span className="flex items-center gap-1.5 text-chart-2">
            <CheckCircle2 className="h-3 w-3" /> Saved
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Save className="h-3 w-3" /> Auto-saves as you type.
          </span>
        )}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-[11px]"
            onClick={() => setShowStarters((v) => !v)}
          >
            <Lightbulb className="h-3 w-3" />
            {showStarters ? 'Hide starters' : 'Stuck? Try a starter'}
          </Button>
          {/* Word-count target: green when met. We pick 50 words as a
              reasonable "you actually thought about it" floor — enough
              for a paragraph, not so high it feels like an essay. */}
          <span
            className={`flex items-center gap-1 ${
              targetMet ? 'text-chart-2' : 'text-muted-foreground/60'
            }`}
            title={`${TARGET_WORD_COUNT}-word target`}
          >
            <Target className="h-3 w-3" />
            {words}/{TARGET_WORD_COUNT} words
          </span>
        </div>
      </div>
    </div>
  );
}
