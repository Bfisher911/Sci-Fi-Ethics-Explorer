'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Send,
  FileText,
  Users,
  Image as ImageIcon,
  Building,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserCommunities } from '@/app/actions/communities';
import type { Community } from '@/types';

// Mock themes - in a real app, these might come from a config or API
const themes = [
  'AI Sentience',
  'Resource Scarcity',
  'Transhumanism',
  'Genetic Engineering',
  'Surveillance',
  'Virtual Reality',
  'Space Exploration Ethics',
];

const NONE_COMMUNITY_VALUE = '__none__';

export function SubmitDilemmaForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [imageUrl, setImageUrl] = useState('');
  const [imageHint, setImageHint] = useState('');

  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityId, setCommunityId] = useState<string>(NONE_COMMUNITY_VALUE);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    setLoadingCommunities(true);
    getUserCommunities(user.uid)
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          setCommunities(result.data);
        }
      })
      .catch((err) => {
        console.error('[submit-dilemma-form] Failed to load communities:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingCommunities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title || !description || !theme) {
      setError('Title, Description, and Theme are required.');
      setIsLoading(false);
      return;
    }

    const selectedCommunityId =
      communityId && communityId !== NONE_COMMUNITY_VALUE
        ? communityId
        : undefined;

    const dilemmaData = {
      title,
      description,
      theme,
      authorName: authorName || 'Anonymous',
      authorId: user?.uid,
      authorEmail: user?.email ?? undefined,
      imageUrl,
      imageHint,
      communityId: selectedCommunityId,
      submittedAt: new Date().toISOString(), // Firestore will convert to Timestamp
      status: 'pending',
    };

    try {
      const response = await fetch('/api/submit-dilemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dilemmaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit dilemma');
      }

      toast({
        title: 'Dilemma Submitted!',
        description:
          'Your scenario has been sent for review. Thank you for contributing!',
      });
      setTitle('');
      setDescription('');
      setTheme('');
      setImageUrl('');
      setImageHint('');
      setCommunityId(NONE_COMMUNITY_VALUE);
      router.push('/my-submissions');
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Submission Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl bg-card/70 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            New Dilemma Details
          </CardTitle>
          <CardDescription>
            Fill out the form below to submit your ethical scenario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              Title of Dilemma
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Last Ark's Choice"
              required
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              Detailed Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scenario, the ethical conflict, and any key characters or technologies involved..."
              rows={6}
              required
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme" className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              Primary Theme
            </Label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              required
              disabled={isLoading}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                Select a theme
              </option>
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="Other">Other (Specify in description)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="communityId" className="flex items-center">
              <Building className="mr-2 h-4 w-4 text-muted-foreground" />
              Submit to community (optional)
            </Label>
            <select
              id="communityId"
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              disabled={isLoading || loadingCommunities}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={NONE_COMMUNITY_VALUE}>
                — None (Platform-wide) —
              </option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Community-scoped dilemmas are reviewed by that community's
              instructors. Platform-wide dilemmas are reviewed by site admins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="authorName" className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                Your Name (Optional)
              </Label>
              <Input
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="As you'd like it to appear"
                disabled={isLoading}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="flex items-center">
                <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Image URL (Optional)
              </Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://placehold.co/600x400.png"
                disabled={isLoading}
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageHint" className="flex items-center">
              <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              Image Hint (Optional, for AI generation)
            </Label>
            <Input
              id="imageHint"
              value={imageHint}
              onChange={(e) => setImageHint(e.target.value)}
              placeholder="e.g., 'futuristic city AI'"
              disabled={isLoading}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              If you provide an image URL, this hint can describe it for
              accessibility. If not, it can guide placeholder generation.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Dilemma
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
