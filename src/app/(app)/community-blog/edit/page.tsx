'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { CommunityBlogForm } from '@/components/blog/community-blog-form';
import { getBlogPostById } from '@/app/actions/blog';
import type { BlogPost } from '@/types';

export default function EditCommunityBlogPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(!!editId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getBlogPostById(editId).then((res) => {
      if (cancelled) return;
      if (!res.success || !res.data) {
        setError('Article not found.');
      } else {
        setPost(res.data);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [editId]);

  if (!editId) {
    router.replace('/community-blog/submit');
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/community-blog/my-posts">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Articles
        </Link>
      </Button>

      {authLoading || loading ? (
        <Skeleton className="h-[480px] w-full" />
      ) : !user ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-headline font-semibold">Sign in required</h1>
            <Button asChild>
              <Link
                href={`/login?next=${encodeURIComponent(
                  `/community-blog/edit?id=${editId}`
                )}`}
              >
                Sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : error || !post ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-muted-foreground">{error || 'Article not found.'}</p>
            <Button asChild variant="outline">
              <Link href="/community-blog">Back to Community Blog</Link>
            </Button>
          </CardContent>
        </Card>
      ) : post.authorId !== user.uid ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-headline font-semibold">
              Not your article
            </h1>
            <p className="text-muted-foreground">
              You can only edit articles you wrote yourself.
            </p>
            <Button asChild variant="outline">
              <Link href="/community-blog">Back to Community Blog</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <CommunityBlogForm existing={post} />
      )}
    </div>
  );
}
