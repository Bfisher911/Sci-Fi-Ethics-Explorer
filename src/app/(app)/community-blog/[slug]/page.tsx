'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User, Pencil, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { getBlogPostBySlug, deleteBlogPost } from '@/app/actions/blog';
import { AdminActions } from '@/components/admin/admin-actions';
import { BlogKindBadge } from '@/components/blog/blog-kind-badge';
import {
  displayAuthorId,
  displayAuthorName,
  isOfficialAuthor,
} from '@/lib/official-author';
import type { BlogPost } from '@/types';

function formatDate(d: any): string {
  if (!d) return '';
  const date = d instanceof Date ? d : d.seconds ? new Date(d.seconds * 1000) : new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CommunityBlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
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
          <p className="text-2xl text-muted-foreground">Article not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/community-blog">Back to Community Blog</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // If someone navigates to /community-blog/<official-post-slug>, redirect
  // them to the official article URL so the byline / styling is correct.
  if (post.kind === 'official' || isOfficialAuthor(post.authorId)) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Card className="p-8 text-center bg-card/80 backdrop-blur-sm space-y-3">
          <p className="text-lg text-muted-foreground">
            This is an Official article.
          </p>
          <Button asChild>
            <Link href={`/blog/${post.slug}`}>
              <Sparkles className="h-4 w-4 mr-2" />
              View on the Official Blog
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const paragraphs = post.body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const isAuthor = !!user && user.uid === post.authorId;

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/community-blog">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community Blog
        </Link>
      </Button>

      <AdminActions
        artifactLabel="Community Article"
        artifactTitle={post.title}
        onDelete={(uid) => deleteBlogPost(uid, post.id)}
        afterDeleteHref="/community-blog"
        editHref={`/admin/blog/edit?id=${post.id}`}
      />

      {/* Author-only edit hint (non-admin) */}
      {isAuthor && !isAdmin && (
        <div className="mt-3 mb-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/community-blog/edit?id=${post.id}`}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit my article
            </Link>
          </Button>
        </div>
      )}

      <article className="mt-4">
        <Card className="bg-card/80 backdrop-blur-sm border-l-4 border-l-accent/60">
          <CardContent className="p-6 md:p-10 space-y-6">
            <div className="space-y-3">
              <BlogKindBadge kind="community" authorId={post.authorId} />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {displayAuthorId(post.authorId, post.authorName) ? (
                    <Link
                      href={`/users/${displayAuthorId(post.authorId, post.authorName)}`}
                      className="hover:text-primary hover:underline"
                    >
                      {displayAuthorName(post.authorId, post.authorName)}
                    </Link>
                  ) : (
                    displayAuthorName(post.authorId, post.authorName)
                  )}
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
