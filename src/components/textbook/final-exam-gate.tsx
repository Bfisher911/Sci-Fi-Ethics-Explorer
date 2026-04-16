'use client';

import Link from 'next/link';
import { Lock, CheckCircle2, Circle, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { Chapter, TextbookProgress } from '@/types/textbook';

interface FinalExamGateProps {
  chapters: Chapter[];
  progress: TextbookProgress;
}

/**
 * Lock screen for the cumulative final exam — shows which chapter quizzes
 * remain before the final unlocks.
 */
export function FinalExamGate({ chapters, progress }: FinalExamGateProps) {
  const passedSet = new Set(progress.chapterQuizzesPassed);
  const passed = passedSet.size;
  const total = chapters.length;
  const pct = Math.round((passed / total) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-primary/10 p-4">
              <Lock className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="font-headline text-3xl md:text-4xl">
            Final Exam Locked
          </CardTitle>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Pass all twelve chapter Knowledge Checks first. The final is
            cumulative, draws from every chapter, and unlocks the Master
            Certificate.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Chapter quizzes passed</span>
              <span className="font-medium">
                {passed} / {total} ({pct}%)
              </span>
            </div>
            <Progress value={pct} />
          </div>

          <ul className="space-y-2">
            {chapters.map((c) => {
              const done = passedSet.has(c.slug);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/textbook/chapters/${c.slug}/quiz`}
                    className="group flex items-center gap-3 rounded-md border border-border bg-background/30 p-3 hover:border-primary/50 transition-colors"
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      Ch.{String(c.number).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {c.title}
                    </span>
                    <Badge
                      variant={done ? 'default' : 'outline'}
                      className="text-xs shrink-0"
                    >
                      {done ? 'Passed' : 'Take quiz'}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-center pt-2">
            <Button asChild variant="outline">
              <Link href="/textbook">
                <Trophy className="h-4 w-4 mr-2" /> Back to Table of Contents
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
