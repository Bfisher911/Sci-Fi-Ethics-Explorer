'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface AddCommentFormProps {
  storyId: string;
  parentCommentId?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Form for adding a new comment or reply to a discussion thread.
 */
export function AddCommentForm({
  storyId,
  parentCommentId,
  onSubmit,
  onCancel,
}: AddCommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder={
          parentCommentId ? 'Write a reply...' : 'Share your thoughts on this story...'
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
        className="min-h-[80px] resize-none"
        aria-label={parentCommentId ? 'Reply' : 'Comment'}
      />
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !content.trim()}
          className="gap-1"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {parentCommentId ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </form>
  );
}
