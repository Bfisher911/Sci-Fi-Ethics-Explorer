'use client';

import type { Story, StorySegment } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, BookOpen } from 'lucide-react';

interface StoryPreviewProps {
  story: Partial<Story>;
}

/**
 * Read-only preview of a story as it would appear to readers.
 * Shows metadata, segments, and choices in a polished layout.
 */
export function StoryPreview({ story }: StoryPreviewProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Metadata header */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary font-headline">
            {story.title || 'Untitled Story'}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {story.author && `By ${story.author}`}
            {story.genre && ` | Genre: ${story.genre}`}
            {story.theme && ` | Theme: ${story.theme}`}
          </CardDescription>
          {story.description && (
            <p className="text-foreground/80 mt-2 text-sm">{story.description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Segments */}
      {story.segments && story.segments.length > 0 ? (
        story.segments.map((segment, idx) => (
          <SegmentPreview key={segment.id || idx} segment={segment} index={idx} />
        ))
      ) : (
        <Card className="bg-card/80 backdrop-blur-sm p-6 text-center text-muted-foreground">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No segments added yet.</p>
        </Card>
      )}
    </div>
  );
}

function SegmentPreview({
  segment,
  index,
}: {
  segment: StorySegment;
  index: number;
}): JSX.Element {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">
          Segment {index + 1}
          {segment.type === 'interactive' && ' — Interactive'}
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
        <p>{segment.text || 'No text provided.'}</p>
      </CardContent>
      {segment.type === 'interactive' && segment.choices && segment.choices.length > 0 && (
        <CardFooter className="flex flex-col items-start gap-2 pt-0">
          <span className="text-xs font-semibold text-accent">Choices:</span>
          {segment.choices.map((choice, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-muted-foreground w-full border rounded-md px-3 py-2 bg-muted/20"
            >
              <CheckSquare className="h-4 w-4 text-primary shrink-0" />
              <span>{choice.text || 'Empty choice'}</span>
              {choice.nextSegmentId && (
                <span className="ml-auto text-[10px] text-muted-foreground/60">
                  → {choice.nextSegmentId}
                </span>
              )}
            </div>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
