'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { getBlogPostBySlug, deleteBlogPost } from '@/app/actions/blog';
import { AdminActions } from '@/components/admin/admin-actions';
import type { BlogPost } from '@/types';

function formatDate(d: any): string {
  if (!d) return '';
  const date = d instanceof Date ? d : d.seconds ? new Date(d.seconds * 1000) : new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPostBySlug(slug).then((res) => {
      if (res.success) setPost(res.data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">Post not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const paragraphs = post.body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
      </Button>

      <AdminActions
        artifactLabel="Blog Post"
        artifactTitle={post.title}
        onDelete={(uid) => deleteBlogPost(uid, post.id)}
        afterDeleteHref="/blog"
        editHref={`/admin/blog/edit?id=${post.id}`}
      />

      <article className="mt-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-10 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {post.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary font-headline leading-tight">
                {post.title}
              </h1>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i} className="mb-4 whitespace-pre-wrap">{p}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
