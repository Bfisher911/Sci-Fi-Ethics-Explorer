'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { DilemmaImage } from '@/components/community-dilemmas/dilemma-image';
import { format } from 'date-fns';

import { db } from '@/lib/firebase/config';
import type { SubmittedDilemma } from '@/types';
import { displayAuthorName } from '@/lib/official-author';

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
import { ShareToMessageDialog } from '@/components/messages/share-to-message-dialog';

import {
  ArrowLeft,
  Calendar,
  User,
  MessageCircle,
  Tag,
} from 'lucide-react';
import { AdminActions } from '@/components/admin/admin-actions';
import { adminDeleteArtifact } from '@/app/actions/admin';
import { PageWalkthrough } from '@/components/walkthroughs/page-walkthrough';

const DILEMMA_WALKTHROUGH_STEPS = [
  {
    element: '[data-tour="dilemma-header"]',
    title: 'The dilemma',
    description:
      'This is a thought experiment submitted by the community. Each entry presents an ethical problem from a sci-fi or technology context — there is usually no clean right answer.',
    side: 'bottom' as const,
  },
  {
    element: '[data-tour="dilemma-theme"]',
    title: 'Theme tag',
    description:
      'The theme tells you which domain the dilemma sits in — AI rights, surveillance, bioethics, etc. You can find related dilemmas by filtering on theme from the main gallery.',
    side: 'bottom' as const,
  },
  {
    element: '[data-tour="dilemma-body"]',
    title: 'Read the scenario carefully',
    description:
      'Well-constructed dilemmas are precise. The detail in the setup matters — the way the question is posed shapes what counts as a good answer.',
    side: 'top' as const,
  },
  {
    element: '[data-tour="dilemma-actions"]',
    title: 'Share or bookmark',
    description:
      'Use the action bar to bookmark the dilemma for later, share it to a community for discussion, or send it directly to someone via messages.',
    side: 'top' as const,
  },
  {
    element: '[data-tour="dilemma-discussion"]',
    title: 'Discussion',
    description:
      'Public discussion threads are coming. For now, share the dilemma to a community to discuss it with a specific group — or analyze it using the Scenario Analyzer.',
    side: 'top' as const,
  },
];

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
      <div className="mb-6 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => router.push('/community-dilemmas')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community Dilemmas
          </Button>
          <PageWalkthrough
            storageKey="sfe.dilemmaDetail.walkthrough.completed"
            steps={DILEMMA_WALKTHROUGH_STEPS}
          />
        </div>
        <AdminActions
          artifactLabel="Dilemma"
          artifactTitle={dilemma.title}
          onDelete={(uid) => adminDeleteArtifact(uid, 'dilemma', dilemmaId)}
          afterDeleteHref="/community-dilemmas"
        />
      </div>

      <Card
        data-tour="dilemma-header"
        className="relative overflow-hidden shadow-xl bg-card/80 backdrop-blur-sm"
      >
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

        <div className="relative w-full h-64 md:h-80 bg-muted overflow-hidden">
          <DilemmaImage
            imageUrl={dilemma.imageUrl}
            title={dilemma.title}
            theme={dilemma.theme}
            hint={dilemma.imageHint}
            size="detail"
          />
        </div>

        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary font-headline">
            {dilemma.title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2" data-tour="dilemma-theme">
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
              title={`Category: ${dilemma.theme}. Find similar dilemmas in the gallery by filtering on this theme.`}
            >
              <Tag className="h-3.5 w-3.5" />
              {dilemma.theme}
            </Badge>
          </div>
          <CardDescription className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1.5" />
              {displayAuthorName(dilemma.authorId, dilemma.authorName)}
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              {formattedDate}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent
          data-tour="dilemma-body"
          className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
        >
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

        <CardFooter data-tour="dilemma-actions" className="border-t pt-4 flex flex-wrap gap-3">
          {dilemma.id && (
            <>
              <ShareToCommunityDialog
                type="dilemma"
                defaultTitle={dilemma.title}
                defaultSummary={dilemma.description?.substring(0, 200) ?? ''}
                sourceCollection="submittedDilemmas"
                sourceId={dilemma.id}
              />
              <ShareToMessageDialog
                artifact={{
                  type: 'dilemma',
                  id: dilemma.id,
                  title: dilemma.title,
                }}
              />
            </>
          )}
        </CardFooter>
      </Card>

      <Card data-tour="dilemma-discussion" className="mt-6 bg-card/80 backdrop-blur-sm">
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
