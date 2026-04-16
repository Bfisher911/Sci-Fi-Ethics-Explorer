'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Newspaper,
  Calendar,
  User,
  ArrowRight,
  PenTool,
  Search,
  Inbox,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getPublishedCommunityBlogPosts } from '@/app/actions/blog';
import { displayAuthorName } from '@/lib/official-author';
import { BlogKindBadge } from '@/components/blog/blog-kind-badge';
import type { BlogPost } from '@/types';

function formatDate(d: any): string {
  if (!d) return '';
  const date = d instanceof Date ? d : d.seconds ? new Date(d.seconds * 1000) : new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CommunityBlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getPublishedCommunityBlogPosts().then((res) => {
      if (res.success) setPosts(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(term)) ||
        p.authorName.toLowerCase().includes(term)
    );
  }, [posts, searchTerm]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary font-headline flex items-center gap-3">
                <Newspaper className="h-9 w-9" />
                Community Blog
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Articles, essays, and analyses written by fellow Explorers.
                Reviewed by site admins before publication.
              </p>
              <p className="text-sm text-muted-foreground">
                Looking for first-party articles? See the{' '}
                <Link href="/blog" className="text-primary hover:underline inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Official Blog
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {user && (
                <>
                  <Button asChild variant="outline">
                    <Link href="/community-blog/my-posts">
                      <FileCheck className="h-4 w-4 mr-2" />
                      My Articles
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/community-blog/submit">
                      <PenTool className="h-4 w-4 mr-2" />
                      Write an Article
                    </Link>
                  </Button>
                </>
              )}
              {!user && (
                <Button asChild>
                  <Link href="/login?next=/community-blog/submit">
                    <PenTool className="h-4 w-4 mr-2" />
                    Sign in to write
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search community articles…"
              className="pl-9 bg-background/60"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-6">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/community-blog/${post.slug}`}
              className="block group"
            >
              <Card className="bg-card/80 backdrop-blur-sm hover:border-accent/50 transition-colors border-l-4 border-l-accent/50">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <BlogKindBadge kind={post.kind} authorId={post.authorId} size="sm" />
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
                <CardContent className="flex items-center justify-end pt-0">
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
          <Inbox className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-2xl text-muted-foreground">
            {searchTerm ? 'No articles match your search.' : 'No community articles yet.'}
          </p>
          {!searchTerm && (
            <p className="text-muted-foreground/70 mt-2">
              Be the first —{' '}
              {user ? (
                <Link href="/community-blog/submit" className="text-primary hover:underline">
                  write an article
                </Link>
              ) : (
                <Link
                  href="/login?next=/community-blog/submit"
                  className="text-primary hover:underline"
                >
                  sign in to write one
                </Link>
              )}
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
