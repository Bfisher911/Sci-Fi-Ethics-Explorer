'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, LogIn, Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { getUserCommunities, joinCommunityByCode } from '@/app/actions/communities';
import { CommunityCard } from '@/components/communities/community-card';
import { useToast } from '@/hooks/use-toast';
import type { Community, CommunityMemberRole } from '@/types';
import Link from 'next/link';

/**
 * Communities list page showing all communities the current user belongs to.
 */
export default function CommunitiesPage() {
  const { user } = useAuth();
  const { accountRole } = useSubscription();
  const { toast } = useToast();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadCommunities();
  }, [user]);

  async function loadCommunities(): Promise<void> {
    if (!user) return;
    const result = await getUserCommunities(user.uid);
    if (result.success) {
      setCommunities(result.data);
    }
    setLoading(false);
  }

  async function handleJoinByCode(): Promise<void> {
    if (!user || !joinCode.trim()) return;
    setJoining(true);

    const result = await joinCommunityByCode(joinCode.trim(), user.uid);
    setJoining(false);

    if (result.success) {
      toast({ title: 'Joined!', description: 'You have joined the community.' });
      setJoinCode('');
      loadCommunities();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  }

  function getUserRole(community: Community): CommunityMemberRole {
    if (!user) return 'member';
    if (community.instructorIds?.includes(user.uid)) return 'instructor';
    return 'member';
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  const isInstructor = accountRole === 'instructor';

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-2 text-primary font-headline">
            My Communities
          </h1>
          <p className="text-lg text-muted-foreground">
            Collaborate, learn, and explore ethics together.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {isInstructor && (
              <Button asChild>
                <Link href="/communities/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Community
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                className="w-44 font-mono"
                maxLength={6}
              />
              <Button
                variant="outline"
                onClick={handleJoinByCode}
                disabled={joining || !joinCode.trim()}
              >
                {joining ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Join
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Grid */}
      {communities.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-2xl text-muted-foreground">
            No communities yet.
          </p>
          <p className="text-muted-foreground/80 mt-2">
            {isInstructor
              ? 'Create a community to get started, or join one with an invite code.'
              : 'Join a community with an invite code from your instructor.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              userRole={getUserRole(community)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
