'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Search,
  ScrollText,
  BookText,
  Rocket,
  Clapperboard,
  Newspaper,
  BookOpen,
} from 'lucide-react';
import { philosopherData } from '@/data/philosophers';
import { ethicalTheories } from '@/data/ethical-theories';
import { scifiAuthorData } from '@/data/scifi-authors';
import { scifiMediaData } from '@/data/scifi-media';
import { chapters as textbookChapters } from '@/data/textbook';
import type { CurriculumItemType } from '@/types';

export type StaticPickedArtifact = {
  type: CurriculumItemType;
  id: string;
  title: string;
};

interface StaticContentPickerProps {
  onPick: (picked: StaticPickedArtifact) => void;
  trigger: ReactNode;
  /** Which tabs to show. Defaults to all supported static types. */
  types?: CurriculumItemType[];
}

type TabKey =
  | 'philosopher'
  | 'theory'
  | 'scifi-author'
  | 'scifi-media'
  | 'textbook-chapter';

const TAB_META: Record<
  TabKey,
  { label: string; icon: typeof ScrollText; typeLabel: CurriculumItemType }
> = {
  philosopher: { label: 'Philosophers', icon: ScrollText, typeLabel: 'philosopher' },
  theory: { label: 'Theories', icon: BookText, typeLabel: 'theory' },
  'scifi-author': { label: 'Sci-Fi Authors', icon: Rocket, typeLabel: 'scifi-author' },
  'scifi-media': { label: 'Sci-Fi Media', icon: Clapperboard, typeLabel: 'scifi-media' },
  'textbook-chapter': { label: 'Textbook Chapters', icon: BookOpen, typeLabel: 'textbook-chapter' },
};

/**
 * Lightweight picker for content types served from static data
 * (philosophers, theories, sci-fi authors, sci-fi media, textbook
 * chapters). Complements the existing ArtifactPicker which handles
 * Firestore-backed artifacts like stories and quizzes.
 *
 * Official blog posts live in Firestore so they have their own
 * thin fetch at the bottom. Community blog posts are intentionally
 * excluded from learning-path authoring.
 */
export function StaticContentPicker({
  onPick,
  trigger,
  types,
}: StaticContentPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const visibleTabs: TabKey[] = useMemo(() => {
    const all: TabKey[] = [
      'philosopher',
      'theory',
      'scifi-author',
      'scifi-media',
      'textbook-chapter',
    ];
    if (!types) return all;
    return all.filter((t) => types.includes(TAB_META[t].typeLabel));
  }, [types]);

  const [tab, setTab] = useState<TabKey>(visibleTabs[0] ?? 'philosopher');

  const q = query.trim().toLowerCase();
  function filterRows<T>(rows: T[], textOf: (r: T) => string): T[] {
    return q ? rows.filter((r) => textOf(r).toLowerCase().includes(q)) : rows;
  }

  const philosophers = useMemo(
    () => filterRows(philosopherData, (p) => `${p.name} ${p.era}`),
    [q]
  );
  const theories = useMemo(
    () => filterRows(ethicalTheories, (t) => `${t.name} ${t.description}`),
    [q]
  );
  const authors = useMemo(
    () => filterRows(scifiAuthorData, (a) => `${a.name} ${(a.notableWorks || []).join(' ')}`),
    [q]
  );
  const media = useMemo(
    () =>
      filterRows(scifiMediaData, (m) => `${m.title} ${m.category} ${m.year}`),
    [q]
  );
  const chapters = useMemo(
    () => filterRows(textbookChapters, (c) => `${c.title} ${c.summary}`),
    [q]
  );

  function pick(type: CurriculumItemType, id: string, title: string) {
    onPick({ type, id, title });
    setOpen(false);
    setQuery('');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Attach a page</DialogTitle>
          <DialogDescription>
            Philosopher pages, ethical theories, sci-fi authors, sci-fi
            media, and textbook chapters can all be assigned as reading
            inside a module.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="pl-9"
          />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="w-full flex-wrap h-auto justify-start">
            {visibleTabs.map((t) => {
              const Meta = TAB_META[t];
              const Icon = Meta.icon;
              return (
                <TabsTrigger key={t} value={t} className="text-xs gap-1">
                  <Icon className="h-3.5 w-3.5" />
                  {Meta.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <ScrollArea className="pr-3 -mr-3 mt-3" style={{ maxHeight: '48vh' }}>
            <TabsContent value="philosopher" className="space-y-2 mt-0">
              {philosophers.map((p) => (
                <PickerRow
                  key={p.id}
                  icon={<ScrollText className="h-4 w-4 text-primary" />}
                  title={p.name}
                  subtitle={p.era}
                  onClick={() => pick('philosopher', p.id, p.name)}
                />
              ))}
              {philosophers.length === 0 && <EmptyHint q={q} label="philosophers" />}
            </TabsContent>
            <TabsContent value="theory" className="space-y-2 mt-0">
              {theories.map((t) => (
                <PickerRow
                  key={t.id}
                  icon={<BookText className="h-4 w-4 text-primary" />}
                  title={t.name}
                  subtitle={t.proponents?.slice(0, 3).join(', ')}
                  onClick={() => pick('theory', t.id, t.name)}
                />
              ))}
              {theories.length === 0 && <EmptyHint q={q} label="theories" />}
            </TabsContent>
            <TabsContent value="scifi-author" className="space-y-2 mt-0">
              {authors.map((a) => (
                <PickerRow
                  key={a.id}
                  icon={<Rocket className="h-4 w-4 text-primary" />}
                  title={a.name}
                  subtitle={a.era}
                  onClick={() => pick('scifi-author', a.id, a.name)}
                />
              ))}
              {authors.length === 0 && <EmptyHint q={q} label="sci-fi authors" />}
            </TabsContent>
            <TabsContent value="scifi-media" className="space-y-2 mt-0">
              {media.map((m) => (
                <PickerRow
                  key={m.id}
                  icon={<Clapperboard className="h-4 w-4 text-primary" />}
                  title={m.title}
                  subtitle={`${m.category} · ${m.year}`}
                  onClick={() => pick('scifi-media', m.id, m.title)}
                />
              ))}
              {media.length === 0 && <EmptyHint q={q} label="sci-fi media" />}
            </TabsContent>
            <TabsContent value="textbook-chapter" className="space-y-2 mt-0">
              {chapters.map((c) => (
                <PickerRow
                  key={c.slug}
                  icon={<BookOpen className="h-4 w-4 text-primary" />}
                  title={`Ch. ${c.number}: ${c.title}`}
                  subtitle={c.summary?.slice(0, 120)}
                  onClick={() =>
                    pick(
                      'textbook-chapter',
                      c.slug,
                      `Ch. ${c.number}: ${c.title}`
                    )
                  }
                />
              ))}
              {chapters.length === 0 && <EmptyHint q={q} label="chapters" />}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function PickerRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 p-3 rounded-md border border-border bg-card/60 hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-2">{subtitle}</p>
        )}
      </div>
    </button>
  );
}

function EmptyHint({ q, label }: { q: string; label: string }) {
  return (
    <div className="text-center text-sm text-muted-foreground py-10">
      {q ? (
        <>
          No {label} match <span className="text-foreground">{`"${q}"`}</span>.
        </>
      ) : (
        <>No {label} available.</>
      )}
    </div>
  );
}
