'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { createCommunity } from '@/app/actions/communities';
import { CreateCommunityForm } from '@/components/communities/create-community-form';
import type { Community } from '@/types';
import Link from 'next/link';

/**
 * Page for creating a new community. Single-tier platform: any signed-in
 * member with an active subscription or license can create one. Whoever
 * creates the community becomes the instructor of *that* community
 * (community.instructorIds), but that's a per-community role, not an
 * account-level distinction.
 */
export default function CreateCommunityPage() {
  const { user } = useAuth();
  const { isPaid, loading: subLoading } = useSubscription();
  const [created, setCreated] = useState<Community | null>(null);
  const [copied, setCopied] = useState(false);

  if (subLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <Card className="bg-card/80 backdrop-blur-sm p-8 text-center">
          <p className="text-lg text-muted-foreground">
            Choose a plan to create your own community.
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Button asChild variant="outline">
              <Link href="/communities">Back to Communities</Link>
            </Button>
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  async function handleCreate(data: {
    name: string;
    description: string;
  }): Promise<void> {
    if (!user) return;

    const result = await createCommunity({
      name: data.name,
      description: data.description,
      ownerId: user.uid,
      ownerName: user.displayName || user.email || 'Unknown',
    });

    if (result.success) {
      setCreated(result.data);
    } else {
      throw new Error(result.error);
    }
  }

  function handleCopy(): void {
    if (created) {
      navigator.clipboard.writeText(created.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/communities">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Communities
        </Link>
      </Button>

      {created ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Community Created
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold text-lg">{created.name}</p>
            {created.description && (
              <p className="text-muted-foreground text-sm">
                {created.description}
              </p>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Share this invite code with your members:
              </p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold font-mono text-primary tracking-widest">
                  {created.inviteCode}
                </span>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-500 mt-1">
                  Copied to clipboard!
                </p>
              )}
            </div>
            <Button asChild className="w-full">
              <Link href={`/communities/${created.id}`}>
                Go to Community
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <CreateCommunityForm onSubmit={handleCreate} />
      )}
    </div>
  );
}
