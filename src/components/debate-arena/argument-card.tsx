'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { voteOnArgument } from '@/app/actions/debates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, User, Clock } from 'lucide-react';
import type { DebateArgument } from '@/types';

interface ArgumentCardProps {
  argument: DebateArgument;
  debateStatus: 'open' | 'voting' | 'closed';
}

export function ArgumentCard({ argument, debateStatus }: ArgumentCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upvotes, setUpvotes] = useState(argument.upvotes);
  const [downvotes, setDownvotes] = useState(argument.downvotes);
  const [isVoting, setIsVoting] = useState(false);

  const formatDate = (date: Date | any): string => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to vote.', variant: 'destructive' });
      return;
    }

    if (debateStatus === 'closed') {
      toast({ title: 'Error', description: 'This debate is closed.', variant: 'destructive' });
      return;
    }

    setIsVoting(true);

    const result = await voteOnArgument({
      debateId: argument.debateId,
      argumentId: argument.id,
      userId: user.uid,
      voteType,
    });

    if (result.success) {
      // Optimistic-ish: refetch would be better but for simplicity adjust counts locally
      if (voteType === 'up') {
        setUpvotes((prev) => prev + 1);
      } else {
        setDownvotes((prev) => prev + 1);
      }
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }

    setIsVoting(false);
  };

  const borderColor = argument.position === 'pro' ? 'border-l-green-500' : 'border-l-red-500';

  return (
    <Card className={`bg-card/80 backdrop-blur-sm border-l-4 ${borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <User className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{argument.authorName}</span>
          <span className="mx-1">·</span>
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDate(argument.createdAt)}</span>
        </div>

        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{argument.content}</p>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-green-400"
            onClick={() => handleVote('up')}
            disabled={isVoting || debateStatus === 'closed'}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{upvotes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-red-400"
            onClick={() => handleVote('down')}
            disabled={isVoting || debateStatus === 'closed'}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            <span>{downvotes}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
