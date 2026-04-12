'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { submitArgument } from '@/app/actions/debates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Send, Loader2 } from 'lucide-react';

interface SubmitArgumentFormProps {
  debateId: string;
  onArgumentSubmitted?: () => void;
}

export function SubmitArgumentForm({ debateId, onArgumentSubmitted }: SubmitArgumentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [position, setPosition] = useState<'pro' | 'con'>('pro');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to submit an argument.', variant: 'destructive' });
      return;
    }

    if (!content.trim()) {
      toast({ title: 'Error', description: 'Argument content is required.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const result = await submitArgument({
      debateId,
      authorId: user.uid,
      authorName: user.displayName || user.email || 'Anonymous',
      position,
      content: content.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Argument Submitted', description: 'Your argument has been added to the debate.' });
      setContent('');
      onArgumentSubmitted?.();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg text-primary">Submit Your Argument</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <RadioGroup
              value={position}
              onValueChange={(val) => setPosition(val as 'pro' | 'con')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pro" id="position-pro" />
                <Label htmlFor="position-pro" className="font-medium text-green-400 cursor-pointer">
                  Pro (In Favor)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="con" id="position-con" />
                <Label htmlFor="position-con" className="font-medium text-red-400 cursor-pointer">
                  Con (Against)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="argument-content">Your Argument</Label>
            <Textarea
              id="argument-content"
              placeholder="Present your reasoning, evidence, and perspective..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Argument
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
