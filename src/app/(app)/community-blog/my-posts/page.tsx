'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Lock,
  PenTool,
  Pencil,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Inbox,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  getMyBlogPosts,
  deleteMyCommunityBlogPost,
} from '@/app/actions/blog';
import type { BlogPost, BlogSubmissionStatus } from '@/types';

function formatDate(d: any): string {
  if (!d) return '';
  const date = d instanceof Date ? d : d.seconds ? new Date(d.seconds * 1000) : new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusBadge(status?: BlogSubmissionStatus) {
  switch (status) {
    case 'approved':
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Published
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" /> Rejected
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" /> Pending review
        </Badge>
      );
  }
}

export default function MyCommunityBlogPostsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getMyBlogPosts(user.uid).then((res) => {
      if (cancelled) return;
      if (res.success) {
        setPosts(res.data.filter((p) => (p.kind ?? 'community') === 'community'));
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function handleDelete(postId: string) {
    if (!user) return;
    setDeletingId(postId);
    const res = await deleteMyCommunityBlogPost(user.uid, postId);
    setDeletingId(null);
    if (res.success) {
      setPosts((cur) => cur.filter((p) => p.id !== postId));
      toast({ title: 'Article deleted' });
    } else {
      toast({
        title: 'Could not delete',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-headline font-semibold">
              Sign in to manage your articles
            </h1>
            <Button asChild>
              <Link href="/login?next=/community-blog/my-posts">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/community-blog">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community Blog
        </Link>
      </Button>

      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-primary font-headline flex items-center gap-3">
                <FileText className="h-7 w-7" />
                My Articles
              </h1>
              <p className="text-muted-foreground">
                Drafts, pending submissions, published articles, and any
                rejections — all in one place.
              </p>
            </div>
            <Button asChild>
              <Link href="/community-blog/submit">
                <PenTool className="h-4 w-4 mr-2" />
                New Article
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center space-y-4">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">
              You haven't submitted any articles yet.
            </p>
            <Button asChild>
              <Link href="/community-blog/submit">
                <PenTool className="h-4 w-4 mr-2" />
                Write your first article
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const status = (post.submissionStatus ?? 'pending') as BlogSubmissionStatus;
            return (
              <Card
                key={post.id}
                className="bg-card/80 backdrop-blur-sm border-l-4 border-l-accent/50"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {statusBadge(status)}
                        <span className="text-xs text-muted-foreground">
                          Updated {formatDate(post.updatedAt || post.createdAt)}
                        </span>
                      </div>
                      <CardTitle className="text-lg text-primary truncate">
                        {post.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {status === 'rejected' && post.rejectionReason && (
                    <Alert variant="destructive" className="mb-3">
                      <AlertDescription className="text-sm">
                        <strong>Reviewer feedback:</strong> {post.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {status === 'approved' && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/community-blog/${post.slug}`}>
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          View live
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/community-blog/edit?id=${post.id}`}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId === post.id}
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes "{post.title}". You can't
                            undo this.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(post.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
