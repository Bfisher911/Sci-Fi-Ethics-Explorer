'use client';

/**
 * Dialogues hub — browse every persona across the four library
 * categories, with search, filtering, and per-persona progress
 * (passed assessments show a certificate badge).
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  getDialogueLibrary,
  type DialogueProgressEntry,
} from '@/app/actions/dialogues';
import {
  DIALOGUE_CATEGORIES,
  DIALOGUE_CATEGORY_LABELS,
  personaActivityId,
  type DialogueCategory,
  type PublicDialoguePersona,
} from '@/lib/dialogues/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, MessageCircle, Search } from 'lucide-react';

const CATEGORY_TABS: Array<{ value: 'all' | DialogueCategory; label: string }> = [
  { value: 'all', label: 'All' },
  ...DIALOGUE_CATEGORIES.map((c) => ({
    value: c,
    label: DIALOGUE_CATEGORY_LABELS[c],
  })),
];

export default function DialoguesPage() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<PublicDialoguePersona[]>([]);
  const [progress, setProgress] = useState<Record<string, DialogueProgressEntry>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | DialogueCategory>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getDialogueLibrary(user?.uid);
      if (cancelled) return;
      if (res.success) {
        setPersonas(res.data.personas);
        setProgress(res.data.progress);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return personas.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.displayName.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.relatedFrameworks.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [personas, search, category]);

  const passedCount = useMemo(
    () => Object.values(progress).filter((p) => p.passed).length,
    [progress]
  );

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
          <MessageCircle className="h-7 w-7" aria-hidden />
          Dialogues
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Talk with philosophers, sci-fi authors, fictional worlds, and ethical
          frameworks. Explore freely, or take the assessment challenge to earn
          dialogue certificates.
        </p>
        {user && passedCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            <Award className="mr-1 h-3 w-3" aria-hidden />
            {passedCount} assessment{passedCount === 1 ? '' : 's'} passed
          </Badge>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-grow max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search dialogues…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search dialogues"
          />
        </div>
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as 'all' | DialogueCategory)}
        >
          <TabsList className="flex-wrap h-auto">
            {CATEGORY_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs md:text-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <Search className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">No dialogues match your search.</p>
            <p className="text-sm text-muted-foreground">
              Try a different name, theme, or framework.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const entry = progress[personaActivityId(p.category, p.id)];
            return (
              <Link
                key={`${p.category}:${p.id}`}
                href={`/dialogues/${p.category}/${p.id}`}
                className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
              >
                <Card className="h-full transition-colors group-hover:border-accent/60">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold leading-snug group-hover:text-accent transition-colors">
                        {p.displayName}
                      </h2>
                      {entry?.passed ? (
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-[10px] bg-green-500/15 text-green-600 dark:text-green-400"
                        >
                          <Award className="mr-1 h-3 w-3" aria-hidden />
                          Passed
                        </Badge>
                      ) : entry ? (
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          In progress
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {p.shortDescription}
                    </p>
                    <Badge variant="outline" className="text-[10px]">
                      {DIALOGUE_CATEGORY_LABELS[p.category]}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
