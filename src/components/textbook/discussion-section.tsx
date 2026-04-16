'use client';

import { MessageCircle, FlaskConical, ListChecks } from 'lucide-react';
import { Callout } from './callout';
import type { ChapterSection } from '@/types/textbook';
import { ProseWithLinks } from './interlink';

interface DiscussionSectionProps {
  section: ChapterSection;
}

const HEADING_TO_VARIANT = {
  'After-Story Discussion': {
    variant: 'discussion' as const,
    icon: MessageCircle,
    lede: 'Let\'s unpack what the story put on the table.',
  },
  'Counterfactual Lab': {
    variant: 'counterfactual' as const,
    icon: FlaskConical,
    lede: 'Hypothetical pivots — change one variable, follow the consequences.',
  },
  'Practical Takeaways for Builders and Policymakers': {
    variant: 'takeaways' as const,
    icon: ListChecks,
    lede: 'Move these from the page into your design reviews and policy memos.',
  },
};

/**
 * Renders the After-Story Discussion, Counterfactual Lab, and Practical
 * Takeaways sections as themed callouts with appropriately structured
 * content (paragraphs grouped, lists, etc.).
 */
export function DiscussionSection({ section }: DiscussionSectionProps) {
  const headingKey = (section.heading || '') as keyof typeof HEADING_TO_VARIANT;
  const variant = HEADING_TO_VARIANT[headingKey] || {
    variant: 'discussion' as const,
    icon: MessageCircle,
    lede: undefined,
  };

  return (
    <Callout
      variant={variant.variant}
      icon={variant.icon}
      title={section.heading || 'Discussion'}
      lede={variant.lede}
    >
      <ul className="space-y-3 list-none pl-0">
        {section.blocks.map((b, i) =>
          b.type === 'paragraph' ? (
            <li
              key={i}
              className="relative pl-6 before:content-['▸'] before:absolute before:left-0 before:top-0 before:text-primary"
            >
              <ProseWithLinks text={b.text} entities={section.entityRefs} />
            </li>
          ) : null
        )}
      </ul>
    </Callout>
  );
}
