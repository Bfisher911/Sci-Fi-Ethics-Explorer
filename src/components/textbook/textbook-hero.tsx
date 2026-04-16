'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookText, Clock, Target, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BookMeta, TextbookProgress } from '@/types/textbook';

interface TextbookHeroProps {
  meta: BookMeta;
  progress?: TextbookProgress | null;
  resumeSlug?: string;
}

export function TextbookHero({ meta, progress, resumeSlug }: TextbookHeroProps) {
  const passed = progress?.chapterQuizzesPassed.length || 0;
  const total = meta.totalChapters;
  const hasMaster = Boolean(progress?.masterCertificateId);
  const isStarted = (progress?.chaptersRead.length || 0) > 0;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card/80 to-background"
      aria-label="Textbook hero"
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true">
        <Image
          src={meta.heroImage}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/0" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 p-6 md:p-10 lg:p-14">
        <div className="lg:col-span-3 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary uppercase tracking-wider text-[10px]">
              <BookText className="h-3 w-3 mr-1" /> Course Textbook
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {total} chapters
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              ~{meta.estimatedReadingHours} hrs
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Award className="h-3 w-3 mr-1" />
              Certificates
            </Badge>
          </div>

          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
            {meta.title}
          </h1>
          {meta.subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {meta.subtitle}
            </p>
          )}
          <p className="text-sm text-muted-foreground/90">By {meta.author}</p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {resumeSlug ? (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href={`/textbook/chapters/${resumeSlug}`}>
                  {isStarted ? 'Resume reading' : 'Start reading'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : null}
            {hasMaster ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/certificates">
                  <Award className="h-4 w-4 mr-2" /> View Master Certificate
                </Link>
              </Button>
            ) : passed >= total ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/textbook/final-exam">
                  <Target className="h-4 w-4 mr-2" /> Take the Final Exam
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-background/40 backdrop-blur border-primary/30">
            <CardContent className="p-5">
              <h2 className="font-headline text-lg font-semibold mb-3 text-primary">
                What you'll gain
              </h2>
              <ul className="space-y-2 text-sm text-foreground/90">
                {meta.learnerOutcomes.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {progress && (progress.chaptersRead.length > 0 || passed > 0) && (
            <Card className="bg-background/40 backdrop-blur border-primary/30">
              <CardContent className="p-5">
                <h2 className="font-headline text-sm font-semibold mb-3 text-primary uppercase tracking-wider">
                  Your progress
                </h2>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-headline text-2xl font-bold text-foreground">
                      {progress.chaptersRead.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Read
                    </p>
                  </div>
                  <div>
                    <p className="font-headline text-2xl font-bold text-foreground">
                      {passed}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Quizzes
                    </p>
                  </div>
                  <div>
                    <p className="font-headline text-2xl font-bold text-foreground">
                      {Object.keys(progress.chapterCertificateIds || {}).length}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Certs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
