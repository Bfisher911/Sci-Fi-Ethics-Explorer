'use client';

import { Quote } from 'lucide-react';

interface PullQuoteProps {
  text: string;
  attribution?: string;
}

/**
 * A large pull-quote block. Used in chapter prose for inline citations
 * the textbook has formatted as italicized quote paragraphs.
 */
export function PullQuote({ text, attribution }: PullQuoteProps) {
  return (
    <figure className="my-8 mx-auto max-w-2xl">
      <div className="relative rounded-lg border border-primary/30 bg-primary/5 px-6 py-5 md:px-8 md:py-6">
        <Quote
          className="absolute -top-3 -left-3 h-7 w-7 text-primary/70 bg-background rounded-full p-1"
          aria-hidden="true"
        />
        <blockquote className="text-lg md:text-xl font-headline italic text-foreground/95 leading-snug">
          “{text}”
        </blockquote>
        {attribution && (
          <figcaption className="mt-3 text-sm text-muted-foreground">
            — <cite className="not-italic">{attribution}</cite>
          </figcaption>
        )}
      </div>
    </figure>
  );
}
