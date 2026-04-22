'use client';

/**
 * Community forum — single topic detail. Shows the opening post,
 * threaded replies, a reply composer for members, and manager
 * moderation controls (remove-reply, lock/unlock).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import {
  getCommunity,
  getCommunityMembers,
} from '@/app/actions/communities';
import { getForumTopic } from '@/app/actions/forum';
import { ForumTopicDetail } from '@/components/forum/community-forum';
import type { Community, CommunityMemberInfo, ForumTopic } from '@/types';

export default function ForumTopicPage() {
  const params = useParams();
  const communityId = params?.id as string;
  const topicId = params?.topicId as string;

  const { user } = useAuth();
  const { isSuperAdmin } = useSubscription();

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMemberInfo[]>([]);
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    (async () => {
      const [cRes, mRes, tRes] = await Promise.all([
        getCommunity(communityId),
        getCommunityMembers(communityId),
        getForumTopic(communityId, topicId),
      ]);
      if (cRes.success && cRes.data) setCommunity(cRes.data);
      if (mRes.success) setMembers(mRes.data);
      if (tRes.success && tRes.data) setTopic(tRes.data);
      setLoading(false);
    })();
  }, [communityId, topicId]);

  useEffect(() => {
    if (!user) {
      setIsManager(false);
      return;
    }
    if (isSuperAdmin) {
      setIsManager(true);
      return;
    }
    (async () => {
      const { isCommunityManager } = await import(
        '@/app/actions/community-manager'
      );
      setIsManager(await isCommunityManager(user.uid));
    })();
  }, [user, isSuperAdmin]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!community || !topic) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-muted-foreground">Topic not found.</p>
            <Button asChild variant="outline">
              <Link href={`/communities/${communityId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to community
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMember =
    !!user && members.some((m) => m.uid === user.uid);
  const isInstructor =
    !!user && !!community.instructorIds?.includes(user.uid);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-5">
      <Link
        href={`/communities/${communityId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {community.name}
      </Link>
      <ForumTopicDetail
        topic={topic}
        viewerIsManager={isManager || isInstructor}
        viewerIsMember={isMember || isInstructor}
      />
    </div>
  );
}
