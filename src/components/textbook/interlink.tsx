'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { EntityKind } from '@/types/textbook';
import { entityRoute } from '@/data/textbook/interlinks';
import { cn } from '@/lib/utils';

interface EntityLinkProps {
  name: string;
  kind: EntityKind;
  slug: string;
  children?: ReactNode;
  className?: string;
}

/**
 * A small inline link from chapter prose to a related entity page.
 * Used for the first occurrence of each recognized name per section.
 */
export function EntityLink({ name, kind, slug, children, className }: EntityLinkProps) {
  return (
    <Link
      href={entityRoute(kind, slug)}
      className={cn(
        'underline decoration-primary/40 decoration-dotted underline-offset-4 hover:decoration-primary hover:text-primary transition-colors',
        className
      )}
      title={`View the ${kind.replace('-', ' ')} page for ${name}`}
    >
      {children ?? name}
    </Link>
  );
}

/**
 * Renders text with the FIRST occurrence of each provided entity name
 * wrapped in an <EntityLink>. Conservative: no nested matches, no
 * reformatting of surrounding punctuation.
 */
export function ProseWithLinks({
  text,
  entities,
}: {
  text: string;
  entities?: Array<{ name: string; kind: EntityKind; slug: string }>;
}) {
  if (!entities || entities.length === 0) return <>{text}</>;
  // Sort longer phrases first so "Mary Shelley" wins over "Shelley".
  const sorted = [...entities].sort((a, b) => b.name.length - a.name.length);
  // Find the FIRST positions of each match. If the same slug appears multiple
  // times, only the earliest is linked.
  type Hit = { start: number; end: number; entity: typeof sorted[number] };
  const hits: Hit[] = [];
  const seenSlug = new Set<string>();
  for (const e of sorted) {
    if (seenSlug.has(e.slug)) continue;
    const safe = e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![A-Za-z0-9])(${safe})(?![A-Za-z0-9])`, 'i');
    const m = text.match(re);
    if (!m || m.index === undefined) continue;
    // Avoid overlap with another already-claimed hit
    const start = m.index;
    const end = start + m[0].length;
    if (hits.some((h) => start < h.end && end > h.start)) continue;
    hits.push({ start, end, entity: e });
    seenSlug.add(e.slug);
  }
  if (hits.length === 0) return <>{text}</>;
  hits.sort((a, b) => a.start - b.start);

  const out: ReactNode[] = [];
  let cursor = 0;
  hits.forEach((h, i) => {
    if (cursor < h.start) {
      out.push(<span key={`t-${i}`}>{text.slice(cursor, h.start)}</span>);
    }
    out.push(
      <EntityLink
        key={`l-${i}`}
        name={h.entity.name}
        kind={h.entity.kind}
        slug={h.entity.slug}
      >
        {text.slice(h.start, h.end)}
      </EntityLink>
    );
    cursor = h.end;
  });
  if (cursor < text.length) {
    out.push(<span key="t-end">{text.slice(cursor)}</span>);
  }
  return <>{out}</>;
}
