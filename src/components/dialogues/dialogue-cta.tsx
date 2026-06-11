'use client';

/**
 * "Talk to this thinker/work/framework" call-to-action shown on library
 * detail pages, linking into the dialogue experience.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Target } from 'lucide-react';
import type { DialogueCategory } from '@/lib/dialogues/types';

interface DialogueCtaProps {
  category: DialogueCategory;
  entryId: string;
  displayName: string;
}

export function DialogueCta({ category, entryId, displayName }: DialogueCtaProps) {
  const href = `/dialogues/${category}/${entryId}`;
  return (
    <Card className="border-accent/40 bg-accent/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-accent" aria-hidden />
          <h2 className="font-semibold">Converse with {displayName}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Have an open conversation, or take the assessment challenge to earn
          a dialogue certificate.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={href}>
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
              Start a dialogue
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={href}>
              <Target className="mr-2 h-4 w-4" aria-hidden />
              Assessment challenge
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
