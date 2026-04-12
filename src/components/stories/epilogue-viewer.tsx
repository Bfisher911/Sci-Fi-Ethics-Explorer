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
        });
        setCache((prev) => ({ ...prev, [timeframe]: result }));
      } catch (err) {
        console.error('Error generating epilogue:', err);
        setError('Failed to generate epilogue. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [cache, storyTitle, storyEnding, userChoices]
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
