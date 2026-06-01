'use client';

import { useState, useCallback } from 'react';
import { generateEpilogue } from '@/ai/flows/generate-epilogue';
import type { GenerateEpilogueOutput } from '@/ai/flows/generate-epilogue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock, Sparkles } from 'lucide-react';

interface EpilogueViewerProps {
  storyTitle: string;
  storyEnding: string;
  userChoices: string[];
  /** Optional — the reader's ending reflection, threaded through for richer
   *  epilogue continuity. */
  reflection?: string;
  /** Optional — the reader's dominant ethical framework / leaning. */
  ethicalProfile?: string;
  /** Fires when an epilogue ("What Happens Next") is generated, so the parent
   *  can include it in the downloadable Story Completion Badge. */
  onEpilogue?: (epilogueText: string, timeframe: string) => void;
}

type Timeframe = '1 year' | '5 years' | '50 years';

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1 year', label: '1 Year Later' },
  { value: '5 years', label: '5 Years Later' },
  { value: '50 years', label: '50 Years Later' },
];

/**
 * Generates and displays "What Happened Next" epilogues showing long-term
 * consequences of ethical choices. Caches results per timeframe.
 */
export function EpilogueViewer({
  storyTitle,
  storyEnding,
  userChoices,
  reflection,
  ethicalProfile,
  onEpilogue,
}: EpilogueViewerProps): JSX.Element {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1 year');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, GenerateEpilogueOutput>>({});

  const currentResult = cache[selectedTimeframe] ?? null;

  const handleGenerate = useCallback(
    async (timeframe: Timeframe) => {
      setSelectedTimeframe(timeframe);

      // Return cached result if available
      if (cache[timeframe]) return;

      setIsLoading(true);
      setError(null);
      try {
        const result = await generateEpilogue({
          storyTitle,
          storyEnding,
          userChoices,
          timeframe,
          reflection,
          ethicalProfile,
        });

        // The flow never throws — it returns a structured error instead.
        // Surface a friendly message but log the real diagnostic.
        if (result.error || !result.epilogueText) {
          console.error(
            '[EpilogueViewer] epilogue generation failed:',
            result.errorCode,
            result.error
          );
          setError(
            result.errorCode === 'rate_limited'
              ? 'The AI is busy right now — give it a moment and try again.'
              : result.errorCode === 'missing_api_key'
                ? "The epilogue engine isn't configured yet. Please try again later."
                : 'We couldn’t project this future just yet. Please try again.'
          );
          return;
        }

        setCache((prev) => ({ ...prev, [timeframe]: result }));
        onEpilogue?.(result.epilogueText, timeframe);
      } catch (err) {
        console.error('[EpilogueViewer] unexpected error generating epilogue:', err);
        setError('We couldn’t project this future just yet. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [cache, storyTitle, storyEnding, userChoices, reflection, ethicalProfile, onEpilogue]
  );

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'mixed'): string => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-500/50 bg-green-500/10 text-green-300';
      case 'negative':
        return 'border-red-500/50 bg-red-500/10 text-red-300';
      case 'mixed':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="text-xl font-semibold text-accent">What Happened Next?</h3>
      </div>

      {/* Timeframe selector */}
      <div className="flex gap-2 flex-wrap">
        {TIMEFRAMES.map(({ value, label }) => (
          <Button
            key={value}
            variant={selectedTimeframe === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleGenerate(value)}
            disabled={isLoading}
          >
            <Clock className="mr-1 h-3 w-3" />
            {label}
          </Button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Projecting consequences {selectedTimeframe} into the future...</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      {/* Result */}
      {currentResult && !isLoading && (
        <div className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {currentResult.epilogueText}
              </p>
            </CardContent>
          </Card>

          {currentResult.consequences.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Consequences
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {currentResult.consequences.map((consequence, idx) => (
                  <Card
                    key={idx}
                    className={`border ${getSentimentColor(consequence.sentiment)}`}
                  >
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-medium">
                        {consequence.area}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-xs leading-relaxed opacity-90">
                        {consequence.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
