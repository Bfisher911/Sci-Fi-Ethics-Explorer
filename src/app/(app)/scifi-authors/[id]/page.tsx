'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getSciFiAuthorById } from '@/app/actions/scifi-authors';
import { getMediaForAuthor } from '@/app/actions/scifi-media';
import { SciFiAuthorDetail } from '@/components/scifi-authors/scifi-author-detail';
import { QuizCta } from '@/components/quiz/quiz-cta';
import { InfographicCta } from '@/components/infographic/infographic-cta';
import { DialogueCta } from '@/components/dialogues/dialogue-cta';
import { AdminActions } from '@/components/admin/admin-actions';
import { adminDeleteArtifact } from '@/app/actions/admin';
import type { SciFiAuthor } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Clapperboard } from 'lucide-react';

export default function SciFiAuthorDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [author, setAuthor] = useState<SciFiAuthor | null>(null);
  const [featuredIn, setFeaturedIn] = useState<
    Array<{ id: string; title: string; year: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const [result, mediaResult] = await Promise.all([
        getSciFiAuthorById(id),
        getMediaForAuthor(id),
      ]);
      if (result.success) {
        setAuthor(result.data);
      }
      if (mediaResult.success) {
        setFeaturedIn(mediaResult.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">Author not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/scifi-authors">Back to Sci-Fi Authors</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/scifi-authors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sci-Fi Authors
        </Link>
      </Button>
      <AdminActions
        artifactLabel="Sci-Fi Author"
        artifactTitle={author.name}
        onDelete={(uid) => adminDeleteArtifact(uid, 'scifi-author', author.id)}
        afterDeleteHref="/scifi-authors"
      />
      <SciFiAuthorDetail author={author} />
      <div className="mt-6 space-y-3">
        <DialogueCta
          category="scifi-author"
          entryId={author.id}
          displayName={author.name}
        />
        <InfographicCta
          href={`/scifi-authors/${author.id}/infographic`}
          subjectName={author.name}
          kindLabel="sci-fi author"
        />
        <QuizCta
          subjectType="scifi-author"
          subjectId={author.id}
          href={`/scifi-authors/${author.id}/quiz`}
        />
      </div>

      {featuredIn.length > 0 && (
        <Card className="mt-6 p-4 bg-card/80 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <Clapperboard className="h-4 w-4" aria-hidden />
            Featured in the library
          </h2>
          <div className="flex flex-wrap gap-2">
            {featuredIn.map((m) => (
              <Link key={m.id} href={`/scifi-media/${m.id}`}>
                <Badge
                  variant="secondary"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {m.title} ({m.year})
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
