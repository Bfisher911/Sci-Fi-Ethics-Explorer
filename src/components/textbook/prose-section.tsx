'use client';

import type { ChapterSection, ContentBlock, EntityRef } from '@/types/textbook';
import { ProseWithLinks } from './interlink';
import { PullQuote } from './pull-quote';
import { cn } from '@/lib/utils';

interface ProseSectionProps {
  section: ChapterSection;
  /** Compact prose width — for the short-story block. */
  narrow?: boolean;
}

/**
 * Renders the body content of a section. Each ContentBlock becomes its
 * own semantic element; entity references in paragraph text get
 * autolinked via <ProseWithLinks>.
 */
export function ProseSection({ section, narrow }: ProseSectionProps) {
  const refs = section.entityRefs;
  return (
    <div className={cn(
      'mx-auto w-full',
      narrow ? 'max-w-2xl' : 'max-w-3xl'
    )}>
      {section.blocks.map((block, idx) => (
        <Block
          key={`${section.id}-b-${idx}`}
          block={block}
          entities={refs}
        />
      ))}
    </div>
  );
}

function Block({
  block,
  entities,
}: {
  block: ContentBlock;
  entities?: EntityRef[];
}) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-base md:text-lg text-foreground/90 leading-relaxed mb-5">
          <ProseWithLinks text={block.text} entities={entities} />
        </p>
      );
    case 'quote':
      return <PullQuote text={block.text} attribution={block.attribution} />;
    case 'heading': {
      const Tag = block.level === 4 ? 'h4' : 'h3';
      return (
        <Tag className="font-headline text-xl md:text-2xl font-semibold text-primary mt-10 mb-4">
          {block.text}
        </Tag>
      );
    }
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className={cn(
          'mb-6 space-y-2 pl-6 text-base md:text-lg text-foreground/90 leading-relaxed',
          block.ordered ? 'list-decimal' : 'list-disc'
        )}>
          {block.items.map((item, i) => (
            <li key={i}>
              <ProseWithLinks text={item} entities={entities} />
            </li>
          ))}
        </Tag>
      );
    }
  }
}
