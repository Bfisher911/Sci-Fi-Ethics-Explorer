'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Tag as TagIcon,
  Image as ImageIcon,
  Globe,
  Loader2,
  Send,
  Save,
  Newspaper,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  submitCommunityBlogPost,
  updateMyCommunityBlogPost,
} from '@/app/actions/blog';
import type { BlogPost } from '@/types';

interface CommunityBlogFormProps {
  /** Pre-fill values for edit mode. Leave undefined for a fresh submission. */
  existing?: Pick<
    BlogPost,
    | 'id'
    | 'title'
    | 'slug'
    | 'excerpt'
    | 'body'
    | 'tags'
    | 'imageUrl'
    | 'imageHint'
    | 'globalVisibility'
    | 'submissionStatus'
    | 'rejectionReason'
  >;
}

/**
 * Submission + edit form for community blog posts. Mirrors the spirit of
 * the SubmitDilemmaForm — same Cards, Inputs, Switch, Alert primitives —
 * so the experience reads as native to the existing community flows.
 */
export function CommunityBlogForm({ existing }: CommunityBlogFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState(existing?.title || '');
  const [excerpt, setExcerpt] = useState(existing?.excerpt || '');
  const [body, setBody] = useState(existing?.body || '');
  const [tags, setTags] = useState((existing?.tags || []).join(', '));
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || '');
  const [imageHint, setImageHint] = useState(existing?.imageHint || '');
  const [publiclyVisible, setPubliclyVisible] = useState(
    existing?.globalVisibility !== 'private'
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!existing?.id;
  const wasRejected = existing?.submissionStatus === 'rejected';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in to submit an article.');
      return;
    }
    if (!title.trim() || !body.trim()) {
      setError('Title and body are both required.');
      return;
    }

    setBusy(true);
    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (isEdit && existing?.id) {
        const res = await updateMyCommunityBlogPost(user.uid, existing.id, {
          title: title.trim(),
          excerpt: excerpt.trim(),
          body: body.trim(),
          tags: tagList,
          imageUrl: imageUrl.trim() || undefined,
          imageHint: imageHint.trim() || undefined,
          globalVisibility: publiclyVisible ? 'public' : 'private',
        });
        if (!res.success) throw new Error(res.error);
        toast({
          title: 'Article updated',
          description: wasRejected
            ? 'Your edited article is back in the review queue.'
            : 'Changes saved and resubmitted for review.',
        });
        router.push('/community-blog/my-posts');
      } else {
        const res = await submitCommunityBlogPost(
          {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
          },
          {
            title: title.trim(),
            excerpt: excerpt.trim() || undefined,
            body: body.trim(),
            tags: tagList,
            imageUrl: imageUrl.trim() || undefined,
            imageHint: imageHint.trim() || undefined,
            globalVisibility: publiclyVisible ? 'public' : 'private',
          }
        );
        if (!res.success) throw new Error(res.error);
        toast({
          title: 'Article submitted!',
          description: 'A site admin will review it before it appears publicly.',
        });
        router.push('/community-blog/my-posts');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast({
        title: 'Submission failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="shadow-xl bg-card/70 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            {isEdit ? 'Edit Your Article' : 'Submit a Community Article'}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? 'Make changes below — saving will resubmit your article for review.'
              : 'Write a science-fiction-flavored essay, opinion piece, or analysis. A platform admin will review your submission before it appears in the Community Blog.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {wasRejected && existing?.rejectionReason && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Reviewer feedback:</strong> {existing.rejectionReason}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Quiet Politics of an Always-On Camera"
              required
              disabled={busy}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              Excerpt (optional)
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short teaser shown on the article list. Auto-generated from your body if left blank."
              rows={2}
              disabled={busy}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body" className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              Article Body
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your article here. Double-newlines create paragraph breaks."
              rows={16}
              required
              disabled={busy}
              className="bg-background/50 min-h-[300px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Plain text with paragraph breaks. Submissions go through admin
              review before publication.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center">
              <TagIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              Tags (comma-separated, up to 8)
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI Ethics, Surveillance, Speculative Fiction"
              disabled={busy}
              className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="flex items-center">
                <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Header Image URL (optional)
              </Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://placehold.co/1200x600.png"
                disabled={busy}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageHint" className="flex items-center">
                <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Image Alt / Hint (optional)
              </Label>
              <Input
                id="imageHint"
                value={imageHint}
                onChange={(e) => setImageHint(e.target.value)}
                placeholder="e.g. 'neon city street at night'"
                disabled={busy}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="rounded-lg border border-input bg-background/50 p-4 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="publiclyVisible"
                className="flex items-center text-base"
              >
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                Make publicly visible (after approval)
              </Label>
              <Switch
                id="publiclyVisible"
                checked={publiclyVisible}
                onCheckedChange={setPubliclyVisible}
                disabled={busy}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              When on, approved articles appear in the Community Blog feed.
              When off, only you and reviewers can see it.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Saving…' : 'Submitting…'}
              </>
            ) : isEdit ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save & Resubmit
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/community-blog')}
            disabled={busy}
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
