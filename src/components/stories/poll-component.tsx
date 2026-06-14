'use client';

import { useState, useEffect } from 'react';
import type { PollData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Check } from 'lucide-react';

interface PollComponentProps {
  pollData: PollData;
  storyId: string;
  segmentId: string;
}

/**
 * Reflective "Where do you stand?" prompt embedded in a story segment.
 *
 * NOTE: this is intentionally a PERSONAL reflection, not a live
 * cross-user poll. There is no vote-aggregation backend, so the
 * component records the reader's own choice (persisted to localStorage
 * so it survives a reload) and highlights it — it does NOT display
 * fabricated community vote totals or percentages, which would have
 * been misleading. If real cross-user polling is added later, swap the
 * localStorage read/write for a votes server action + aggregate fetch.
 */
export function PollComponent({ pollData, storyId, segmentId }: PollComponentProps) {
  const pollStorageKey = `poll_${storyId}_${segmentId}`;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const storedVote = localStorage.getItem(pollStorageKey);
    if (storedVote !== null) {
      setSelectedOption(parseInt(storedVote, 10));
      setHasVoted(true);
    }
  }, [pollStorageKey]);

  const handleVote = (optionIndex: number) => {
    if (hasVoted) return;
    setSelectedOption(optionIndex);
    setHasVoted(true);
    localStorage.setItem(pollStorageKey, optionIndex.toString());
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center text-accent">
          <BarChart3 className="mr-2 h-5 w-5" /> Where do you stand?
        </CardTitle>
        <CardDescription>{pollData.question}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pollData.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleVote(index)}
              disabled={hasVoted}
              variant={selectedOption === index ? 'default' : 'outline'}
              className="w-full justify-between items-center h-auto py-2 px-3 text-left group"
            >
              <span className="flex-1">{option.text}</span>
              {selectedOption === index && (
                <Check className="ml-2 h-4 w-4 text-primary-foreground group-hover:text-primary-foreground" />
              )}
            </Button>
          ))}
        </div>
        {hasVoted ? (
          <p className="text-sm text-muted-foreground mt-4">
            Your position is saved. There&apos;s no single right answer —
            sit with why you chose it.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">
            Pick the option closest to your own view.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
