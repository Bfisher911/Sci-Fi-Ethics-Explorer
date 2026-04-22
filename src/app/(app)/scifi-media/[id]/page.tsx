'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getSciFiMediaById } from '@/app/actions/scifi-media';
import { MediaDetail } from '@/components/scifi-media/media-detail';
import { QuizCta } from '@/components/quiz/quiz-cta';
import { InfographicCta } from '@/components/infographic/infographic-cta';
import { AdminActions } from '@/components/admin/admin-actions';
import { adminDeleteArtifact } from '@/app/actions/admin';
import { MediaCommunityDiscussion } from '@/components/forum/media-community-discussion';
import type { SciFiMedia } from '@/types';

export default function SciFiMediaDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  /** Optional ?community=... hint — when set, the page shows the
   *  discussion board scoped to that community. Without it, the
   *  component still looks up whether this user is a member of any
   *  community that has added this media and offers the board(s)
   *  there too. */
  const communityHint = searchParams?.get('community') || undefined;
  const [media, setMedia] = useState<SciFiMedia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getSciFiMediaById(id);
      if (res.success) setMedia(res.data);
      setLoading(false);
    }
    load();
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

  if (!media) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">Media not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/scifi-media">Back to Sci-Fi Media</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={`/scifi-media?tab=${media.category}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sci-Fi Media
        </Link>
      </Button>
      <AdminActions
        artifactLabel="Media Entry"
        artifactTitle={media.title}
        onDelete={(uid) => adminDeleteArtifact(uid, 'scifi-media', media.id)}
        afterDeleteHref="/scifi-media"
      />
      <MediaDetail media={media} />
      <div className="mt-6 space-y-3">
        <InfographicCta
          href={`/scifi-media/${media.id}/infographic`}
          subjectName={media.title}
          kindLabel="sci-fi work"
        />
        <QuizCta
          subjectType="scifi-media"
          subjectId={media.id}
          href={`/scifi-media/${media.id}/quiz`}
        />
      </div>

      {/* Discussion board surface. Only renders when the viewer is
          signed in AND this media has been added to at least one
          community the viewer belongs to. Anchor for deep-links
          from the Community Media list. */}
      <div id="discussion" className="mt-8">
        <MediaCommunityDiscussion
          mediaId={media.id}
          mediaTitle={media.title}
          preferredCommunityId={communityHint}
        />
      </div>
    </div>
  );
}
