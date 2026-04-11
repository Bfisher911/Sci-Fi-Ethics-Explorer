'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockDilemmaOfTheDay } from '@/data/mock-data'; // Assuming this exists
import type { Story } from '@/types';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export function DilemmaOfTheDay() {
  const dilemma: Story | undefined = mockDilemmaOfTheDay; // In a real app, fetch this dynamically

  if (!dilemma) {
    return (
      <Card className="w-full max-w-2xl bg-card/70 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-accent flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Dilemma of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No dilemma available today. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl bg-card/40 backdrop-blur-md shadow-2xl border-primary/20 overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
      <CardHeader className="p-0 relative">
        {dilemma.imageUrl && (
          <div className="relative h-72 w-full overflow-hidden">
            <Image
              src={dilemma.imageUrl}
              alt={dilemma.title}
              fill
              className="object-cover transition-transform duration-700 hover:scale-110"
              priority
              sizes="(max-width: 768px) 100vw, 672px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        )}
         <div className={dilemma.imageUrl ? "p-8 absolute bottom-0 left-0 w-full" : "p-8"}>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">Featured Dilemma</span>
          </div>
          <CardTitle className="text-4xl font-bold text-white drop-shadow-xl font-headline">
            {dilemma.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardDescription className="text-lg text-foreground/90 mb-4 leading-relaxed">
          {dilemma.description}
        </CardDescription>
        <div className="text-sm text-muted-foreground">
          <p><strong>Genre:</strong> {dilemma.genre}</p>
          <p><strong>Theme:</strong> {dilemma.theme}</p>
          <p><strong>Author:</strong> {dilemma.author}</p>
        </div>
      </CardContent>
      <CardFooter className="p-6 bg-background/30">
        <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/stories/${dilemma.id}`}>
            Explore This Dilemma <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
