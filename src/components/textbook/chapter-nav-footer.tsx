'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Chapter } from '@/types/textbook';

interface ChapterNavFooterProps {
  prev?: Chapter;
  next?: Chapter;
}

export function ChapterNavFooter({ prev, next }: ChapterNavFooterProps) {
  return (
    <nav
      aria-label="Chapter navigation"
      className="my-12 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto"
    >
      {prev ? (
        <Card className="bg-card/60 hover:border-primary/50 transition-colors">
          <Link
            href={`/textbook/chapters/${prev.slug}`}
            className="block p-4 group"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" /> Previous
            </p>
            <p className="mt-1 font-headline font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              Ch. {prev.number}: {prev.title}
            </p>
          </Link>
        </Card>
      ) : (
        <span />
      )}

      <div className="md:flex md:justify-center">
        <Button asChild variant="outline" className="w-full md:w-auto">
          <Link href="/textbook">
            <BookOpen className="h-4 w-4 mr-2" /> Back to Table of Contents
          </Link>
        </Button>
      </div>

      {next ? (
        <Card className="bg-card/60 hover:border-primary/50 transition-colors">
          <Link
            href={`/textbook/chapters/${next.slug}`}
            className="block p-4 group text-right"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-end gap-1">
              Next <ChevronRight className="h-3 w-3" />
            </p>
            <p className="mt-1 font-headline font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              Ch. {next.number}: {next.title}
            </p>
          </Link>
        </Card>
      ) : (
        <span />
      )}
    </nav>
  );
}
