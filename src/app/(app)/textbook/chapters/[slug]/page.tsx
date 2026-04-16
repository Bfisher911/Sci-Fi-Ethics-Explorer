'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getChapterBySlug,
  prevChapter,
  nextChapter,
} from '@/data/textbook';
import { ChapterReader } from '@/components/textbook/chapter-reader';

export default function ChapterPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <h1 className="font-headline text-2xl font-semibold">
              Chapter not found
            </h1>
            <p className="text-muted-foreground">
              We couldn't find a chapter at <code>/textbook/chapters/{slug}</code>.
            </p>
            <Button asChild>
              <Link href="/textbook">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Textbook
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-5xl pt-2 pb-2">
      <ChapterReader
        chapter={chapter}
        prev={prevChapter(chapter.slug)}
        next={nextChapter(chapter.slug)}
      />
    </div>
  );
}
