'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Gauge, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Callout } from './callout';
import { useAuth } from '@/hooks/use-auth';
import {
  getPromiseRealityScores,
  savePromiseRealityScores,
} from '@/app/actions/textbook';
import type { ChapterSection } from '@/types/textbook';

interface PromiseVsRealityProps {
  section: ChapterSection;
  chapterSlug: string;
}

/**
 * Renders the chapter's "Promise vs. Reality" self-assessment as a
 * stack of 0-5 sliders. Signed-in users get persisted scores.
 */
export function PromiseVsReality({
  section,
  chapterSlug,
}: PromiseVsRealityProps) {
  const { user } = useAuth();
  const items = section.scoringItems || [];
  const [scores, setScores] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  // Hydrate from Firestore (signed-in only)
  useEffect(() => {
    if (initializedRef.current) return;
    if (!user) {
      initializedRef.current = true;
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await getPromiseRealityScores(user.uid, chapterSlug);
      if (!cancelled && res.success) setScores(res.data);
      initializedRef.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [user, chapterSlug]);

  function setScore(itemId: string, value: number) {
    const next = { ...scores, [itemId]: value };
    setScores(next);
    if (!user) return;
    setStatus('saving');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const res = await savePromiseRealityScores({
        userId: user.uid,
        slug: chapterSlug,
        scores: next,
      });
      if (res.success) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 1500);
      } else {
        setStatus('idle');
      }
    }, 500);
  }

  if (items.length === 0) return null;

  return (
    <Callout
      variant="counterfactual"
      icon={Gauge}
      title={section.heading || 'Promise vs. Reality'}
      lede="Score each technology from 0 (does not deliver) to 5 (fully delivers) on its stated promise."
    >
      <div className="space-y-6 mt-2">
        {items.map((item) => {
          const value = scores[item.id] ?? 0;
          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {value} / 5
                </Badge>
              </div>
              <Slider
                value={[value]}
                onValueChange={(v) => setScore(item.id, v[0] ?? 0)}
                min={0}
                max={5}
                step={1}
                className="my-2"
                aria-label={`Score for ${item.label}`}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/70 px-1">
                <span>0 — not at all</span>
                <span>5 — fully</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 min-h-5 text-xs text-muted-foreground">
        {!user ? (
          <span className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            <Link
              href={`/login?next=/textbook/chapters/${chapterSlug}`}
              className="text-primary hover:underline"
            >
              Sign in
            </Link>{' '}
            to save your scores.
          </span>
        ) : status === 'saving' ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </span>
        ) : status === 'saved' ? (
          <span className="flex items-center gap-1.5 text-chart-2">
            <CheckCircle2 className="h-3 w-3" /> Saved
          </span>
        ) : null}
      </div>
    </Callout>
  );
}
