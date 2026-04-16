'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Newspaper,
  Calendar,
  User,
  ArrowRight,
  PenTool,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPublishedBlogPosts } from '@/app/actions/blog';
import { useAdmin } from '@/hooks/use-admin';
import { displayAuthorName } from '@/lib/official-author';
import { BlogKindBadge } from '@/components/blog/blog-kind-badge';
import type { BlogPost } from '@/types';

function formatDate(d: any): string {
  if (!d) return '';
  const date = d instanceof Date ? d : d.seconds ? new Date(d.seconds * 1000) : new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    getPublishedBlogPosts().then((res) => {
      if (res.success) setPosts(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <BlogKindBadge kind="official" />
              </div>
              <h1 className="text-4xl font-bold mb-3 text-primary font-headline flex items-center gap-3">
                <Newspaper className="h-9 w-9" />
                Official Blog
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                First-party articles from Professor Paradox on science fiction,
                technology ethics, and the ideas shaping tomorrow's moral
                landscape.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Want to contribute your own piece? Read the{' '}
                <Link
                  href="/community-blog"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  <Users className="h-3 w-3" /> Community Blog
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild variant="outline">
                <Link href="/community-blog">
                  <Users className="h-4 w-4 mr-2" />
                  Community Blog
                </Link>
              </Button>
              {isAdmin && (
                <Button asChild>
                  <Link href="/admin/blog/edit">
                    <PenTool className="h-4 w-4 mr-2" />
                    Write Official Post
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
              <Card className="bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-colors border-l-4 border-l-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <BlogKindBadge kind={post.kind || 'official'} authorId={post.authorId} size="sm" />
                    {post.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {displayAuthorName(post.authorId, post.authorName)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-primary group-hover:text-accent transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-foreground/70 mt-2 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-accent font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read more <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-2xl text-muted-foreground">No posts yet.</p>
          <p className="text-muted-foreground/70 mt-2">Check back soon for articles on tech ethics.</p>
        </div>
      )}
    </div>
  );
}
