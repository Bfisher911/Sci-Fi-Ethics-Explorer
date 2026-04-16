'use client';

import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { CommunityBlogForm } from '@/components/blog/community-blog-form';

export default function SubmitCommunityBlogPostPage() {
  const { user, loading } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/community-blog">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community Blog
        </Link>
      </Button>

      {loading ? (
        <div className="h-[480px] animate-pulse rounded-lg bg-card/50" />
      ) : !user ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-headline font-semibold">
              Sign in to write an article
            </h1>
            <p className="text-muted-foreground">
              The Community Blog is open to any signed-in Explorer. Articles
              go through a quick admin review before they appear publicly.
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href="/login?next=/community-blog/submit">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup?next=/community-blog/submit">Sign up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CommunityBlogForm />
      )}
    </div>
  );
}
