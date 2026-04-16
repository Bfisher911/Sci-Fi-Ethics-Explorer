'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Brain,
  Film,
  Gamepad2,
  Link as LinkIcon,
  Sparkles,
  Tv,
  User,
} from 'lucide-react';
import type { SciFiMedia } from '@/types';

interface MediaDetailProps {
  media: SciFiMedia;
}

const CATEGORY_ICON: Record<string, React.ElementType> = {
  movie: Film,
  book: BookOpen,
  tv: Tv,
  other: Gamepad2,
};

const CATEGORY_LABEL: Record<string, string> = {
  movie: 'Movie',
  book: 'Book',
  tv: 'TV Show',
  other: 'Game / Other',
};

export function MediaDetail({ media }: MediaDetailProps) {
  const Icon = CATEGORY_ICON[media.category] || Gamepad2;
  const plotParagraphs = media.plot
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              {CATEGORY_LABEL[media.category]}
            </Badge>
            <span className="text-sm text-muted-foreground">{media.year}</span>
            {media.meta && (
              <span className="text-xs text-muted-foreground/70 ml-auto">
                {media.meta}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline">
              {media.title}
            </h1>
            <p className="text-lg text-muted-foreground flex items-center gap-1.5 mt-1">
              <User className="h-4 w-4" />
              {media.creator}
            </p>
          </div>
          <Separator />
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
            {plotParagraphs.map((p, i) => (
              <p key={i} className="mb-4">{p}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ethics explored */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Brain className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Technology Ethics Explored</h2>
          </div>
          <ul className="space-y-2">
            {media.ethicsExplored.map((theme) => (
              <li key={theme} className="flex items-start gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <span>{theme}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Related frameworks */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <LinkIcon className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Related Frameworks</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {media.relatedFrameworks.map((fw) => (
                <Link key={fw} href={`/glossary/${fw}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-sm capitalize"
                  >
                    {fw.replace(/-/g, ' ')}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connected authors */}
        {media.authorIds && media.authorIds.length > 0 && (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Connected Authors</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {media.authorIds.map((aid) => (
                  <Link key={aid} href={`/scifi-authors/${aid}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent/20 hover:text-accent transition-colors text-sm capitalize"
                    >
                      {aid.replace(/-/g, ' ')}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
