'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

import { db } from '@/lib/firebase/config';
import type { SubmittedDilemma } from '@/types';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookmarkButton } from '@/components/bookmarks/bookmark-button';
import { ShareToCommunityDialog } from '@/components/communities/share-to-community-dialog';

import {
  ArrowLeft,
  Calendar,
  User,
  MessageCircle,
  Tag,
} from 'lucide-react';

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  // Firestore Timestamp { seconds, nanoseconds }
  // @ts-ignore
  if (value?.seconds != null) {
    // @ts-ignore
    return new Date(value.seconds * 1000);
  }
  // @ts-ignore
  if (typeof value?.toDate === 'function') {
    // @ts-ignore
    return value.toDate();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export default function CommunityDilemmaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dilemmaId = params?.id as string;

  const [dilemma, setDilemma] = useState<SubmittedDilemma | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setNotFound(false);
      try {
        const snap = await getDoc(doc(db, 'submittedDilemmas', dilemmaId));
        if (cancelled) return;
        if (!snap.exists()) {
          setNotFound(true);
          setDilemma(null);
        } else {
          const data = snap.data() as SubmittedDilemma;
          setDilemma({ ...data, id: snap.id });
        }
      } catch (err) {
        console.error('Failed to load dilemma:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (dilemmaId) load();
    return () => {
      cancelled = true;
    };
  }, [dilemmaId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-10 w-40 mb-6" />
        <Card className="bg-card/80 backdrop-blur-sm">
          <Skeleton className="w-full h-64 md:h-80" />
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notFound || !dilemma) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-card/80 backdrop-blur-sm max-w-lg mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Dilemma not found</CardTitle>
            <CardDescription>
              The dilemma you're looking for doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push('/community-dilemmas')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community Dilemmas
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const submittedDate = toDate(dilemma.submittedAt);
  const formattedDate = submittedDate ? format(submittedDate, 'PPP') : 'Unknown date';

  const paragraphs = (dilemma.description || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/community-dilemmas')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community Dilemmas
        </Button>
      </div>

      <Card className="relative overflow-hidden shadow-xl bg-card/80 backdrop-blur-sm">
        {dilemma.id && (
          <div className="absolute top-3 right-3 z-10">
            <div className="rounded-full bg-background/70 backdrop-blur-sm">
              <BookmarkButton
                itemId={dilemma.id}
                itemType="dilemma"
                title={dilemma.title}
              />
            </div>
          </div>
        )}

        {dilemma.imageUrl ? (
          <div className="relative w-full h-64 md:h-80">
            <Image
              src={dilemma.imageUrl}
              alt={dilemma.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint={dilemma.imageHint || 'community sci-fi concept'}
            />
          </div>
        ) : (
          <div className="relative w-full h-64 md:h-80 bg-muted">
            <Image
              src={`https://placehold.co/1200x600.png?text=${encodeURIComponent(dilemma.title.substring(0, 30))}`}
              alt={dilemma.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint={dilemma.imageHint || dilemma.theme?.toLowerCase() || 'abstract concept'}
            />
          </div>
        )}

        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary font-headline">
            {dilemma.title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {dilemma.theme}
            </Badge>
          </div>
          <CardDescription className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1.5" />
              {dilemma.authorName}
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              {formattedDate}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => (
              <p key={idx} className="mb-4 whitespace-pre-wrap">
                {para}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground italic">No description provided.</p>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4 flex flex-wrap gap-3">
          {dilemma.id && (
            <ShareToCommunityDialog
              type="dilemma"
              defaultTitle={dilemma.title}
              defaultSummary={dilemma.description?.substring(0, 200) ?? ''}
              sourceCollection="submittedDilemmas"
              sourceId={dilemma.id}
            />
          )}
        </CardFooter>
      </Card>

      <Card className="mt-6 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Public discussion coming soon. Share this dilemma with your community
            to discuss it privately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
