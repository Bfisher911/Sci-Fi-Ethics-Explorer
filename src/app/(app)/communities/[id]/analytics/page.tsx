'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import {
  getCommunity,
  getCommunityMembers,
  getCommunityInvites,
} from '@/app/actions/communities';
import { InstructorAnalytics } from '@/components/communities/instructor-analytics';
import { CommunityGradebookView } from '@/components/communities/community-gradebook';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, GraduationCap } from 'lucide-react';
import type { Community, CommunityMemberInfo, CommunityInvite } from '@/types';
import Link from 'next/link';

/**
 * Instructor analytics page showing community participation, member status,
 * and invite tracking.
 */
export default function CommunityAnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { canAccess, loading: subLoading } = useSubscription();

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMemberInfo[]>([]);
  const [invites, setInvites] = useState<CommunityInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics(): Promise<void> {
      const [communityResult, membersResult, invitesResult] = await Promise.all([
        getCommunity(id),
        getCommunityMembers(id),
        getCommunityInvites(id),
      ]);

      if (communityResult.success && communityResult.data) {
        setCommunity(communityResult.data);
      }
      if (membersResult.success) {
        setMembers(membersResult.data);
      }
      if (invitesResult.success) {
        setInvites(invitesResult.data);
      }
      setLoading(false);
    }

    loadAnalytics();
  }, [id]);

  if (loading || subLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!canAccess('community_analytics')) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-lg text-muted-foreground">
            Analytics are available to instructors with an active plan.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`/communities/${id}`}>Back to Community</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">
            Community not found.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/communities">Back to Communities</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isInstructor =
    !!user && community.instructorIds?.includes(user.uid);

  if (!isInstructor) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-lg text-muted-foreground">
            Only instructors can view analytics.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`/communities/${id}`}>Back to Community</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={`/communities/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {community.name}
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-primary font-headline mb-2">
        Community Analytics
      </h1>
      <p className="text-muted-foreground mb-6">{community.name}</p>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="gradebook">
            <GraduationCap className="h-4 w-4 mr-1.5" /> Gradebook
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <InstructorAnalytics
            communityId={community.id}
            members={members}
            invites={invites}
          />
        </TabsContent>
        <TabsContent value="gradebook" className="mt-4">
          {user ? (
            <CommunityGradebookView
              communityId={community.id}
              requesterId={user.uid}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
