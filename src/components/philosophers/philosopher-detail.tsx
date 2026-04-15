'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Brain, Lightbulb, Link as LinkIcon } from 'lucide-react';
import type { Philosopher } from '@/types';
import Link from 'next/link';

interface PhilosopherDetailProps {
  philosopher: Philosopher;
}

export function PhilosopherDetail({ philosopher }: PhilosopherDetailProps) {
  const bioParagraphs = philosopher.bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline">
              {philosopher.name}
            </h1>
            <p className="text-lg text-muted-foreground">{philosopher.era}</p>
          </div>
          <Separator />
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
            {bioParagraphs.map((p, i) => (
              <p key={i} className="mb-4">{p}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Key Ideas</h2>
            </div>
            <ul className="space-y-2">
              {philosopher.keyIdeas.map((idea) => (
                <li
                  key={idea}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <Brain className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Famous Works</h2>
            </div>
            <ul className="space-y-2">
              {philosopher.famousWorks.map((work) => (
                <li
                  key={work}
                  className="text-muted-foreground pl-2 border-l-2 border-accent"
                >
                  {work}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <LinkIcon className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Related Frameworks</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {philosopher.relatedFrameworks.map((fw) => (
              <Link key={fw} href={`/glossary/${fw}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-sm capitalize"
                >
                  {fw.replace(/-/g, ' ')}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
