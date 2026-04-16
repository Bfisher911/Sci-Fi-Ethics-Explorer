'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, Save, CheckCircle2, Lock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { saveReflection, getChapterReflections } from '@/app/actions/textbook';

interface ReflectionPromptProps {
  index: number;
  promptId: string;
  prompt: string;
  chapterSlug: string;
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={user ? 'Write your reflection…' : 'Sign in to save your answer.'}
        rows={4}
        className="bg-background/50 resize-y"
      />
      <div className="flex items-center justify-between mt-2 min-h-5 text-xs text-muted-foreground">
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
        <span className="text-muted-foreground/60">{value.length} chars</span>
      </div>
    </div>
  );
}
