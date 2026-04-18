'use client';

/**
 * ConceptInfographic — a single, polished, interactive infographic that
 * works for every entity type on the platform (philosophers, ethical
 * theories, sci-fi authors, sci-fi media).
 *
 * Rather than hand-authoring 76+ bespoke graphics, this component
 * derives a rich layout from each entity's existing data:
 *
 *   - hero band with name, type badge, era/year, animated geometric BG
 *   - stats strip (counts + era)
 *   - "Key Concepts" / "Themes" — interactive flip-cards that expand
 *     to reveal a one-sentence explanation
 *   - "Connections" — clickable cards linking to related entities
 *   - "Famous Works" / "Plot" / "Bio" prose panel
 *   - "Apply this lens" pull-quote
 *   - bottom action bar with quiz + back links + print
 *
 * Reused on /philosophers/[id]/infographic, /glossary/[id]/infographic,
 * /scifi-authors/[id]/infographic, /scifi-media/[id]/infographic.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Brain,
  ScrollText,
  Rocket,
  Clapperboard,
  BookText,
  Users,
  Lightbulb,
  Quote,
  Calendar,
  Printer,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { philosopherData } from '@/data/philosophers';
import { ethicalTheories } from '@/data/ethical-theories';
import { scifiAuthorData } from '@/data/scifi-authors';
import { scifiMediaData } from '@/data/scifi-media';
import type {
  Philosopher,
  EthicalTheory,
  SciFiAuthor,
  SciFiMedia,
} from '@/types';

export type InfographicKind =
  | 'philosopher'
  | 'theory'
  | 'scifi-author'
  | 'scifi-media';

type AnyEntity = Philosopher | EthicalTheory | SciFiAuthor | SciFiMedia;

interface ConceptInfographicProps {
  kind: InfographicKind;
  entity: AnyEntity;
}

const KIND_META: Record<
  InfographicKind,
  { label: string; icon: typeof Brain; quizPath?: string; backPath: string }
> = {
  philosopher: {
    label: 'Philosopher',
    icon: ScrollText,
    quizPath: 'philosophers',
    backPath: '/philosophers',
  },
  theory: {
    label: 'Ethical Theory',
    icon: BookText,
    quizPath: 'glossary',
    backPath: '/glossary',
  },
  'scifi-author': {
    label: 'Sci-Fi Author',
    icon: Rocket,
    quizPath: 'scifi-authors',
    backPath: '/scifi-authors',
  },
  'scifi-media': {
    label: 'Sci-Fi Work',
    icon: Clapperboard,
    quizPath: 'scifi-media',
    backPath: '/scifi-media',
  },
};

// ─── Adapters ────────────────────────────────────────────────────────

interface NormalizedEntity {
  id: string;
  title: string;
  subtitle?: string; // era / year / category
  bio: string;
  /** Primary list of "ideas / themes / ethics-explored". */
  concepts: string[];
  /** Related theory IDs. */
  relatedFrameworks: string[];
  /** Optional related author IDs (sci-fi media only). */
  authorIds?: string[];
  /** Optional list of works (philosopher.famousWorks, author.notableWorks). */
  works?: string[];
  /** Optional sci-fi media list of proponents (theory.proponents). */
  proponents?: string[];
  /** Optional applied example (theory.exampleScenario). */
  example?: string;
  /** Optional sub-genre tags (sci-fi author). */
  subgenres?: string[];
  /** Optional category (sci-fi media). */
  category?: string;
  /** Optional creator (sci-fi media). */
  creator?: string;
  /** Optional meta (sci-fi media meta). */
  meta?: string;
  /** Optional tech-ethics one-liner (sci-fi author). */
  techEthicsFocus?: string;
}

function normalize(kind: InfographicKind, e: AnyEntity): NormalizedEntity {
  switch (kind) {
    case 'philosopher': {
      const p = e as Philosopher;
      return {
        id: p.id,
        title: p.name,
        subtitle: p.era,
        bio: p.bio,
        concepts: p.keyIdeas || [],
        relatedFrameworks: p.relatedFrameworks || [],
        works: p.famousWorks || [],
      };
    }
    case 'theory': {
      const t = e as EthicalTheory;
      return {
        id: t.id,
        title: t.name,
        bio: t.description,
        concepts: t.keyConcepts || [],
        relatedFrameworks: [],
        proponents: t.proponents || [],
        example: t.exampleScenario,
      };
    }
    case 'scifi-author': {
      const a = e as SciFiAuthor;
      return {
        id: a.id,
        title: a.name,
        subtitle: a.era,
        bio: a.bio,
        concepts: a.themes || [],
        relatedFrameworks: a.relatedFrameworks || [],
        works: a.notableWorks || [],
        subgenres: a.subgenres,
        techEthicsFocus: a.techEthicsFocus,
      };
    }
    case 'scifi-media': {
      const m = e as SciFiMedia;
      return {
        id: m.id,
        title: m.title,
        subtitle: `${m.category} · ${m.year}`,
        bio: m.plot,
        concepts: m.ethicsExplored || [],
        relatedFrameworks: m.relatedFrameworks || [],
        authorIds: m.authorIds,
        category: m.category,
        creator: m.creator,
        meta: m.meta,
      };
    }
  }
}

// ─── Lookup helpers (resolve related entities to their display data) ─

function getTheoryName(id: string): { name: string; href: string } | null {
  const t = ethicalTheories.find((x) => x.id === id);
  if (!t) return null;
  return { name: t.name, href: `/glossary/${t.id}` };
}
function getPhilosopherName(id: string): { name: string; href: string } | null {
  const p = philosopherData.find((x) => x.id === id);
  if (!p) return null;
  return { name: p.name, href: `/philosophers/${p.id}` };
}
function getAuthorName(id: string): { name: string; href: string } | null {
  const a = scifiAuthorData.find((x) => x.id === id);
  if (!a) return null;
  return { name: a.name, href: `/scifi-authors/${a.id}` };
}
function getMediaCard(id: string): { title: string; href: string } | null {
  const m = scifiMediaData.find((x) => x.id === id);
  if (!m) return null;
  return { title: m.title, href: `/scifi-media/${m.id}` };
}

// Find sci-fi media that reference this entity.
function findMediaReferencingFramework(theoryId: string): SciFiMedia[] {
  return scifiMediaData.filter((m) => m.relatedFrameworks?.includes(theoryId));
}
function findMediaByAuthor(authorId: string): SciFiMedia[] {
  return scifiMediaData.filter((m) => m.authorIds?.includes(authorId));
}
function findAuthorsForFramework(theoryId: string): SciFiAuthor[] {
  return scifiAuthorData.filter((a) => a.relatedFrameworks?.includes(theoryId));
}
function findPhilosophersForFramework(theoryId: string): Philosopher[] {
  return philosopherData.filter((p) => p.relatedFrameworks?.includes(theoryId));
}

// ─── Component ───────────────────────────────────────────────────────

export function ConceptInfographic({ kind, entity }: ConceptInfographicProps) {
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  const data = useMemo(() => normalize(kind, entity), [kind, entity]);

  // Resolve related entities into displayable cards.
  const relatedTheories = useMemo(
    () =>
      data.relatedFrameworks
        .map(getTheoryName)
        .filter((x): x is { name: string; href: string } => !!x),
    [data]
  );
  const relatedMedia = useMemo(() => {
    if (kind === 'theory') return findMediaReferencingFramework(data.id);
    if (kind === 'scifi-author') return findMediaByAuthor(data.id);
    return [];
  }, [kind, data]);
  const relatedAuthors = useMemo(() => {
    if (kind === 'theory') return findAuthorsForFramework(data.id);
    if (kind === 'scifi-media') {
      return (data.authorIds || [])
        .map(getAuthorName)
        .filter((x): x is { name: string; href: string } => !!x)
        .map((c) => ({ name: c.name, href: c.href, era: '' })); // shape fudge
    }
    return [];
  }, [kind, data]);
  const relatedPhilosophers = useMemo(() => {
    if (kind === 'theory') return findPhilosophersForFramework(data.id);
    return [];
  }, [kind, data]);

  // Stats — three at-a-glance metrics.
  const stats = useMemo(() => {
    const out: Array<{ label: string; value: string }> = [];
    if (data.subtitle) out.push({ label: 'When', value: data.subtitle });
    if (data.concepts.length > 0)
      out.push({
        label: kind === 'scifi-media' ? 'Ethics explored' : 'Key concepts',
        value: String(data.concepts.length),
      });
    if (data.works && data.works.length > 0)
      out.push({ label: 'Notable works', value: String(data.works.length) });
    if (data.relatedFrameworks.length > 0)
      out.push({
        label: 'Frameworks',
        value: String(data.relatedFrameworks.length),
      });
    if (kind === 'theory' && data.proponents) {
      out.push({ label: 'Proponents', value: String(data.proponents.length) });
    }
    if (kind === 'scifi-media' && relatedMedia) {
      // skip — same entity
    }
    return out.slice(0, 4);
  }, [data, kind, relatedMedia]);

  // Pick a single-sentence "elevator" pitch for the pull quote.
  const elevatorPitch = useMemo(() => {
    if (kind === 'theory') return data.example || data.bio.split('. ')[0] + '.';
    if (kind === 'scifi-author') return data.techEthicsFocus || data.bio.split('. ')[0] + '.';
    if (kind === 'scifi-media') return data.bio.split('. ')[0] + '.';
    return data.bio.split('. ')[0] + '.';
  }, [data, kind]);

  function handlePrint() {
    if (typeof window !== 'undefined') window.print();
  }

  return (
    <article className="space-y-8 print:space-y-4">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card/80 to-background p-8 md:p-10">
        <DecorativeBackground />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="border-primary/40 text-primary uppercase tracking-wider text-[10px]"
            >
              <Icon className="h-3 w-3 mr-1" />
              {meta.label} infographic
            </Badge>
            {data.subtitle && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {data.subtitle}
              </Badge>
            )}
            {data.subgenres?.slice(0, 3).map((g) => (
              <Badge key={g} variant="outline" className="text-[10px]">
                {g}
              </Badge>
            ))}
          </div>

          <h1 className="font-headline text-4xl md:text-6xl font-bold leading-tight text-foreground">
            {data.title}
          </h1>

          {elevatorPitch && (
            <p className="text-base md:text-lg text-muted-foreground italic max-w-3xl">
              {elevatorPitch}
            </p>
          )}
        </div>
      </header>

      {/* STATS BAR */}
      {stats.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4">
          {stats.map((s) => (
            <Card
              key={s.label}
              className="bg-card/80 backdrop-blur-sm border-primary/20"
            >
              <CardContent className="p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-headline">
                  {s.label}
                </p>
                <p className="font-headline text-xl md:text-2xl font-bold text-primary mt-1 truncate">
                  {s.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* KEY CONCEPTS — interactive flip cards */}
      {data.concepts.length > 0 && (
        <Section
          title={
            kind === 'scifi-media'
              ? 'Ethics this work explores'
              : kind === 'scifi-author'
                ? 'Recurring themes'
                : kind === 'theory'
                  ? 'Key concepts'
                  : 'Key ideas'
          }
          icon={Lightbulb}
          subtitle="Tap a card to see how this idea shows up across the platform."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.concepts.map((c, i) => (
              <ConceptCard key={i} index={i} concept={c} kind={kind} />
            ))}
          </div>
        </Section>
      )}

      {/* CONNECTIONS — related theories / authors / philosophers / media */}
      {(relatedTheories.length > 0 ||
        relatedMedia.length > 0 ||
        relatedAuthors.length > 0 ||
        relatedPhilosophers.length > 0) && (
        <Section
          title="Connected across the site"
          icon={Sparkles}
          subtitle="Every link below opens the related entity's full page."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedTheories.length > 0 && (
              <ConnectionGroup
                heading="Related ethical frameworks"
                accent="primary"
                items={relatedTheories.map((t) => ({
                  label: t.name,
                  href: t.href,
                }))}
              />
            )}
            {relatedPhilosophers.length > 0 && (
              <ConnectionGroup
                heading="Philosophers in this tradition"
                accent="primary"
                items={relatedPhilosophers.map((p) => ({
                  label: p.name,
                  href: `/philosophers/${p.id}`,
                  meta: p.era,
                }))}
              />
            )}
            {relatedAuthors.length > 0 && (
              <ConnectionGroup
                heading={
                  kind === 'scifi-media'
                    ? 'Authors behind this work'
                    : 'Sci-fi authors who engage this lens'
                }
                accent="accent"
                items={relatedAuthors.map((a: any) => ({
                  label: a.name,
                  href: a.href || `/scifi-authors/${a.id}`,
                  meta: 'era' in a ? a.era : undefined,
                }))}
              />
            )}
            {relatedMedia.length > 0 && (
              <ConnectionGroup
                heading="Sci-fi works that wrestle with this"
                accent="accent"
                items={relatedMedia.slice(0, 8).map((m) => ({
                  label: m.title,
                  href: `/scifi-media/${m.id}`,
                  meta: `${m.category} · ${m.year}`,
                }))}
              />
            )}
          </div>
        </Section>
      )}

      {/* APPLIED EXAMPLE / TECH FOCUS */}
      {(data.example || data.techEthicsFocus || data.creator) && (
        <Section title="Apply this lens" icon={Quote}>
          <Card className="bg-card/80 backdrop-blur-sm border-l-4 border-l-accent/60">
            <CardContent className="p-6 space-y-3">
              {data.creator && (
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Created by{' '}
                  <span className="text-foreground font-medium">
                    {data.creator}
                  </span>
                  {data.meta && (
                    <span className="text-muted-foreground"> · {data.meta}</span>
                  )}
                </p>
              )}
              {(data.example || data.techEthicsFocus) && (
                <blockquote className="font-headline text-lg md:text-xl italic text-foreground/90 leading-snug">
                  “{data.example || data.techEthicsFocus}”
                </blockquote>
              )}
            </CardContent>
          </Card>
        </Section>
      )}

      {/* BIO / PLOT — full prose */}
      {data.bio && (
        <Section
          title={
            kind === 'scifi-media'
              ? 'Plot, focused on the ethical stakes'
              : kind === 'theory'
                ? 'Deep dive'
                : kind === 'scifi-author'
                  ? 'The author'
                  : 'In one breath'
          }
          icon={Users}
        >
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="prose prose-base dark:prose-invert max-w-none text-foreground/90">
                {data.bio
                  .split(/\n\s*\n/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((p, i) => (
                    <p key={i} className="mb-3">
                      {p}
                    </p>
                  ))}
              </div>
            </CardContent>
          </Card>
        </Section>
      )}

      {/* PROPONENTS (theories) */}
      {kind === 'theory' && data.proponents && data.proponents.length > 0 && (
        <Section title="Key thinkers in this tradition" icon={ScrollText}>
          <div className="flex flex-wrap gap-2">
            {data.proponents.map((p) => (
              <Badge
                key={p}
                variant="outline"
                className="text-sm py-1.5 px-3 border-primary/30"
              >
                {p}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {/* WORKS TIMELINE (philosopher / author) */}
      {data.works && data.works.length > 0 && (
        <Section
          title={
            kind === 'scifi-author' ? 'Notable works' : 'Famous works'
          }
          icon={BookText}
        >
          <ol className="space-y-2 border-l-2 border-primary/30 pl-5">
            {data.works.map((w, i) => (
              <li
                key={i}
                className="relative text-sm md:text-base text-foreground/90"
              >
                <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-primary/30 border-2 border-primary" />
                {w}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* ACTION BAR */}
      <footer className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link href={`${meta.backPath}/${data.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {data.title}
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
          {meta.quizPath && (
            <Button asChild>
              <Link href={`/${meta.quizPath}/${data.id}/quiz`}>
                <Brain className="h-4 w-4 mr-2" />
                Take the quiz
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </footer>
    </article>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  subtitle,
  children,
}: {
  title: string;
  icon: typeof Brain;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-headline text-2xl font-semibold text-primary flex items-center gap-2">
          <Icon className="h-5 w-5" /> {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function ConceptCard({
  index,
  concept,
  kind,
}: {
  index: number;
  concept: string;
  kind: InfographicKind;
}) {
  const [open, setOpen] = useState(false);
  // Generate a short, generic explanation hint based on concept text.
  // (Not a hallucinated definition — just frames the concept consistently.)
  const hint = useMemo(() => {
    switch (kind) {
      case 'philosopher':
        return 'A core idea this thinker is associated with. Look for it in their writings and in stories they inspired.';
      case 'theory':
        return 'A recurring concept inside this ethical tradition. The Glossary entry digs into how it gets used.';
      case 'scifi-author':
        return "A recurring theme across this author's work. Stories on the platform that engage this theme often link back to their page.";
      case 'scifi-media':
        return 'An ethical stake this work puts on the table. Browse the related frameworks below to see how each tradition reads it.';
    }
  }, [kind]);

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className={cn(
        'group text-left rounded-xl border bg-card/80 p-4 transition-all',
        'border-primary/20 hover:border-primary/50 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary/40',
        open && 'border-primary/60 bg-primary/5'
      )}
      aria-expanded={open}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary font-headline text-xs font-bold">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{concept}</p>
          {open && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {hint}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function ConnectionGroup({
  heading,
  accent,
  items,
}: {
  heading: string;
  accent: 'primary' | 'accent';
  items: Array<{ label: string; href: string; meta?: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <Card
      className={cn(
        'bg-card/80 backdrop-blur-sm border',
        accent === 'primary' ? 'border-primary/30' : 'border-accent/30'
      )}
    >
      <CardContent className="p-4 space-y-2">
        <p
          className={cn(
            'text-xs uppercase tracking-wider font-headline',
            accent === 'primary' ? 'text-primary' : 'text-accent'
          )}
        >
          {heading}
        </p>
        <ul className="space-y-1.5">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="group flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <span className="min-w-0 truncate">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {it.label}
                  </span>
                  {it.meta && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {it.meta}
                    </span>
                  )}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * Decorative geometric background that gives every infographic a
 * shared visual identity without relying on per-entity imagery.
 */
function DecorativeBackground() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="infographic-grid"
          width="36"
          height="36"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M36 0H0v36"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
            strokeOpacity="0.4"
          />
        </pattern>
        <radialGradient id="infographic-glow" cx="80%" cy="20%" r="60%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#infographic-grid)" />
      <rect width="100%" height="100%" fill="url(#infographic-glow)" />
    </svg>
  );
}
