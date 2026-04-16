'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Newspaper,
  Inbox,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
  User,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import {
  getPendingCommunityBlogPosts,
  approveCommunityBlogPost,
  rejectCommunityBlogPost,
} from '@/app/actions/blog';
import type { BlogPost } from '@/types';

function formatDate(d: any): string {
  if (!d) return '';
  const date = d instanceof Date ? d : d.seconds ? new Date(d.seconds * 1000) : new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminCommunityBlogQueuePage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectReasonByPost, setRejectReasonByPost] = useState<
    Record<string, string>
  >({});

  const fetchQueue = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const res = await getPendingCommunityBlogPosts(user.uid);
    if (res.success) {
      setPosts(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (adminLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchQueue();
  }, [adminLoading, isAdmin, fetchQueue]);

  async function handleApprove(post: BlogPost) {
    if (!user) return;
    setBusyId(post.id);
    const res = await approveCommunityBlogPost(user.uid, post.id);
    setBusyId(null);
    if (res.success) {
      toast({
        title: 'Article approved',
        description: `"${post.title}" is now live in the Community Blog.`,
      });
      setPosts((cur) => cur.filter((p) => p.id !== post.id));
    } else {
      toast({
        title: 'Approval failed',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  async function handleReject(post: BlogPost) {
    if (!user) return;
    const reason = rejectReasonByPost[post.id]?.trim() || undefined;
    setBusyId(post.id);
    const res = await rejectCommunityBlogPost(user.uid, post.id, reason);
    setBusyId(null);
    if (res.success) {
      toast({
        title: 'Article rejected',
        description: `"${post.title}" has been sent back to the author.`,
      });
      setPosts((cur) => cur.filter((p) => p.id !== post.id));
    } else {
      toast({
        title: 'Rejection failed',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  if (adminLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Skeleton className="h-12 w-72" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-headline font-semibold">
              Admin access required
            </h1>
            <Button asChild variant="outline">
              <Link href="/community-blog">Back to Community Blog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="mb-6 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-3xl font-bold mb-2 text-primary font-headline flex items-center gap-3">
            <Newspaper className="h-8 w-8" />
            Community Blog Queue
          </h1>
          <p className="text-muted-foreground">
            Review pending community articles. Approving publishes the post
            to <Link href="/community-blog" className="text-primary hover:underline">/community-blog</Link>.
            Rejecting sends it back to the author with optional feedback.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load queue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : posts.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center space-y-3">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">
              The queue is empty — nothing to review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <Card key={post.id} className="bg-card/80 backdrop-blur-sm border-l-4 border-l-accent/60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-2">
                      <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {post.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Submitted {formatDate(post.createdAt)}
                      </span>
                      {post.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl text-primary">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-foreground/70 mt-1.5 line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <details className="rounded-md border border-border bg-background/40 p-3">
                  <summary className="cursor-pointer text-sm font-medium text-primary">
                    Read full body
                  </summary>
                  <div className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap text-sm text-foreground/90">
                    {post.body}
                  </div>
                </details>

                <Textarea
                  placeholder="Optional reviewer feedback (shown to the author if rejected)…"
                  value={rejectReasonByPost[post.id] || ''}
                  onChange={(e) =>
                    setRejectReasonByPost((cur) => ({
                      ...cur,
                      [post.id]: e.target.value,
                    }))
                  }
                  rows={2}
                  className="bg-background/40"
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(post)}
                    disabled={busyId === post.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {busyId === post.id ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Approve & Publish
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busyId === post.id}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject this article?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The author will see your feedback (if any) and can
                          resubmit after edits.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleReject(post)}>
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/blog/edit?id=${post.id}`}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Open in editor
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
