'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface CreateCommunityFormProps {
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
}

/**
 * Form component for creating a new community with name and description.
 */
export function CreateCommunityForm({ onSubmit }: CreateCommunityFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create community.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-primary">Create a Community</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="community-name">Community Name *</Label>
            <Input
              id="community-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ethics in AI - Spring 2026"
              required
            />
          </div>
          <div>
            <Label htmlFor="community-description">Description</Label>
            <Textarea
              id="community-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this community..."
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full"
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Community
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
