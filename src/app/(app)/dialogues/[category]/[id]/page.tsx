'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicDialoguePersona } from '@/app/actions/dialogues';
import type { PublicDialoguePersona } from '@/lib/dialogues/types';
import { PersonaChat } from '@/components/dialogues/persona-chat';
import { getFrameworkDisplayName } from '@/lib/ethical-framework-registry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function DialoguePage() {
  const params = useParams<{ category: string; id: string }>();
  const [persona, setPersona] = useState<PublicDialoguePersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getPublicDialoguePersona(
        String(params.category),
        String(params.id)
      );
      if (cancelled) return;
      if (res.success) {
        setPersona(res.data);
      } else {
        setError(res.error);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [params.category, params.id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-lg font-medium">This dialogue does not exist.</p>
            <p className="text-sm text-muted-foreground">
              It may have been moved, or the link is incorrect.
            </p>
            <Button asChild variant="outline">
              <Link href="/dialogues">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                Back to all dialogues
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8 space-y-6">
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/dialogues">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            All dialogues
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline text-primary">
          {persona.displayName}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {persona.shortDescription}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {persona.relatedFrameworks.slice(0, 4).map((f) => (
            <Badge key={f} variant="secondary" className="text-xs">
              {getFrameworkDisplayName(f)}
            </Badge>
          ))}
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
            <Link href={persona.libraryHref}>
              <BookOpen className="mr-1 h-3 w-3" aria-hidden />
              Read the full profile
            </Link>
          </Button>
        </div>
      </div>

      <PersonaChat persona={persona} />

      <p className="text-xs text-muted-foreground max-w-2xl">
        This is an educational simulation, not the real person or work. It may
        make mistakes — treat it as a thinking partner, not an authority.
      </p>
    </div>
  );
}
