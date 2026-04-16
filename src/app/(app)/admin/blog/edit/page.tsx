'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import {
  createBlogPost,
  updateBlogPost,
  getBlogPostById,
} from '@/app/actions/blog';
import {
  OFFICIAL_AUTHOR_NAME,
  OFFICIAL_AUTHOR_UID,
} from '@/lib/official-author';
import type { BlogPost } from '@/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function BlogEditorPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(!!editId);
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (!editId) return;
    getBlogPostById(editId).then((res) => {
      if (res.success && res.data) {
        const p = res.data;
        setTitle(p.title);
        setSlug(p.slug);
        setExcerpt(p.excerpt);
        setBody(p.body);
        setTags((p.tags || []).join(', '));
        setPublished(p.status === 'published');
        setAutoSlug(false);
      }
      setLoadingPost(false);
    });
  }, [editId]);

  useEffect(() => {
    if (autoSlug && !editId) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug, editId]);

  if (adminLoading || loadingPost) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  if (!isAdmin || !user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl text-center">
        <p className="text-2xl text-muted-foreground">Admin access required.</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Title and body are required.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      // Admin-published blog posts are first-party platform content and
      // are attributed to the canonical site author (Professor Paradox).
      // The acting admin's UID is preserved on the audit trail server-side.
      const postData = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        excerpt: excerpt.trim() || body.trim().slice(0, 200),
        body: body.trim(),
        authorId: OFFICIAL_AUTHOR_UID,
        authorName: OFFICIAL_AUTHOR_NAME,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status: published ? ('published' as const) : ('draft' as const),
      };

      if (editId) {
        const res = await updateBlogPost(user.uid, editId, postData);
        if (!res.success) throw new Error(res.error);
        toast({ title: 'Post updated' });
      } else {
        const res = await createBlogPost(user.uid, postData);
        if (!res.success) throw new Error(res.error);
        toast({ title: 'Post created' });
      }
      router.push('/blog');
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
      </Button>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Newspaper className="h-5 w-5" />
            {editId ? 'Edit Post' : 'New Blog Post'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="blog-title">Title</Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your article title"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blog-slug">URL Slug</Label>
            <Input
              id="blog-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="url-friendly-slug"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blog-excerpt">Excerpt</Label>
            <Textarea
              id="blog-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary shown on the blog listing (auto-generated from body if left blank)"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blog-body">Body</Label>
            <Textarea
              id="blog-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your article here. Double-newlines create paragraph breaks."
              rows={18}
              className="min-h-[320px] font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blog-tags">Tags (comma-separated)</Label>
            <Input
              id="blog-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI Ethics, Sci-Fi, Surveillance"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="blog-published"
              checked={published}
              onCheckedChange={setPublished}
            />
            <Label htmlFor="blog-published" className="cursor-pointer">
              {published ? 'Published (visible to all)' : 'Draft (admin only)'}
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editId ? 'Update Post' : 'Save Post'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/blog')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
