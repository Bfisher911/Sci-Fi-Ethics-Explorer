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
    <Card className="w-full max-w-2xl bg-card/70 backdrop-blur-sm shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <CardHeader className="p-0">
        {dilemma.imageUrl && (
          <div className="relative h-60 w-full">
            <Image
              src={dilemma.imageUrl}
              alt={dilemma.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint={dilemma.imageHint || 'sci-fi concept'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        )}
         <div className={dilemma.imageUrl ? "p-6 absolute bottom-0 left-0 text-white" : "p-6"}>
          <CardTitle className="text-3xl font-bold text-primary drop-shadow-md">
            Dilemma of the Day
          </CardTitle>
          <h3 className="text-2xl font-semibold mt-1 drop-shadow-sm">{dilemma.title}</h3>
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
