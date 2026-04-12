'use client';

import type { DiscussionComment } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Reply, Flag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentCardProps {
  comment: DiscussionComment;
  onReply: (commentId: string) => void;
  onUpvote: (commentId: string) => void;
}

/**
 * Renders a single discussion comment with upvote, reply, and flag controls.
 */
export function CommentCard({ comment, onReply, onUpvote }: CommentCardProps) {
  const timeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const displayDate =
    comment.createdAt instanceof Date
      ? comment.createdAt
      : new Date(comment.createdAt);

  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg',
        comment.status === 'flagged' && 'opacity-50'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(displayDate)}
          </span>
        </div>

        <p className="text-sm whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onUpvote(comment.id)}
          >
            <ThumbsUp className="h-3 w-3" />
            {comment.upvotes > 0 && <span>{comment.upvotes}</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onReply(comment.id)}
          >
            <Reply className="h-3 w-3" />
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
