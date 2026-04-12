'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { DiscussionComment } from '@/types';
import {
  addComment,
  getComments,
  upvoteComment,
} from '@/app/actions/comments';
import { CommentCard } from '@/components/stories/comment-card';
import { AddCommentForm } from '@/components/stories/add-comment-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiscussionThreadProps {
  storyId: string;
}

/**
 * Threaded discussion component for story pages.
 * Fetches comments on mount and supports replies and upvotes.
 */
export function DiscussionThread({ storyId }: DiscussionThreadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    const result = await getComments(storyId);
    if (result.success) {
      setComments(result.data);
    }
    setLoading(false);
  }, [storyId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (content: string, parentCommentId?: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join the discussion.',
        variant: 'destructive',
      });
      return;
    }

    const result = await addComment({
      storyId,
      authorId: user.uid,
      authorName: user.displayName ?? 'Anonymous',
      content,
      parentCommentId,
    });

    if (result.success) {
      setReplyingTo(null);
      await fetchComments();
      toast({ title: 'Comment added', description: 'Your comment has been posted.' });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleUpvote = async (commentId: string) => {
    const result = await upvoteComment(storyId, commentId);
    if (result.success) {
      // Optimistic update
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
        )
      );
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  // Build threaded structure
  const topLevel = comments.filter((c) => !c.parentCommentId);
  const replies = comments.filter((c) => !!c.parentCommentId);
  const replyMap = new Map<string, DiscussionComment[]>();
  for (const reply of replies) {
    const parentId = reply.parentCommentId!;
    if (!replyMap.has(parentId)) {
      replyMap.set(parentId, []);
    }
    replyMap.get(parentId)!.push(reply);
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddCommentForm
          storyId={storyId}
          onSubmit={(content) => handleAddComment(content)}
        />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : topLevel.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          <div className="space-y-2">
            {topLevel.map((comment) => (
              <div key={comment.id}>
                <CommentCard
                  comment={comment}
                  onReply={handleReply}
                  onUpvote={handleUpvote}
                />
                {/* Replies */}
                {replyMap.has(comment.id) && (
                  <div className="ml-8 border-l-2 border-muted pl-2 space-y-1">
                    {replyMap.get(comment.id)!.map((reply) => (
                      <CommentCard
                        key={reply.id}
                        comment={reply}
                        onReply={handleReply}
                        onUpvote={handleUpvote}
                      />
                    ))}
                  </div>
                )}
                {/* Reply form */}
                {replyingTo === comment.id && (
                  <div className="ml-8 mt-2">
                    <AddCommentForm
                      storyId={storyId}
                      parentCommentId={comment.id}
                      onSubmit={(content) =>
                        handleAddComment(content, comment.id)
                      }
                      onCancel={() => setReplyingTo(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
