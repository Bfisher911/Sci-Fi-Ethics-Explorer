'use client';

import { useState, useEffect } from 'react';
import type { PollData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Check } from 'lucide-react';

interface PollComponentProps {
  pollData: PollData;
  storyId: string;
  segmentId: string;
}

export function PollComponent({ pollData, storyId, segmentId }: PollComponentProps) {
  const pollStorageKey = `poll_${storyId}_${segmentId}`;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentVotes, setCurrentVotes] = useState<number[]>(pollData.options.map(o => o.votes));
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Load vote from local storage
    const storedVote = localStorage.getItem(pollStorageKey);
    if (storedVote !== null) {
      setSelectedOption(parseInt(storedVote, 10));
      setHasVoted(true);
      // If already voted, ideally we'd fetch updated totals from a backend.
      // For mock, we'll just use initial votes or slightly increment.
    }
  }, [pollStorageKey]);

  const handleVote = (optionIndex: number) => {
    if (hasVoted) return;

    setSelectedOption(optionIndex);
    setHasVoted(true);
    localStorage.setItem(pollStorageKey, optionIndex.toString());

    // Update votes (client-side mock, in real app this would be a backend call)
    const newVotes = [...currentVotes];
    newVotes[optionIndex]++;
    setCurrentVotes(newVotes);

    // In a real app:
    // await recordVoteOnBackend(storyId, segmentId, optionIndex);
    // await fetchUpdatedPollResults(); 
  };

  const totalVotes = currentVotes.reduce((sum, votes) => sum + votes, 0);

  return (
    <Card className="bg-card/50 backdrop-blur-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center text-accent">
          <BarChart3 className="mr-2 h-5 w-5" /> Community Poll
        </CardTitle>
        <CardDescription>{pollData.question}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pollData.options.map((option, index) => {
            const percentage = totalVotes > 0 ? (currentVotes[index] / totalVotes) * 100 : 0;
            return (
              <div key={index}>
                <Button
                  onClick={() => handleVote(index)}
                  disabled={hasVoted}
                  variant={selectedOption === index ? "default" : "outline"}
                  className="w-full justify-between items-center mb-1 h-auto py-2 px-3 text-left group"
                >
                  <span className="flex-1">{option.text}</span>
                  {hasVoted && <span className="text-xs text-muted-foreground ml-2">{currentVotes[index]} votes ({percentage.toFixed(0)}%)</span>}
                  {selectedOption === index && <Check className="ml-2 h-4 w-4 text-primary-foreground group-hover:text-primary-foreground" />}
                </Button>
                {hasVoted && (
                  <Progress value={percentage} className="h-2 mt-1" aria-label={`${percentage.toFixed(0)}% for ${option.text}`} />
                )}
              </div>
            );
          })}
        </div>
        {hasVoted && (
          <p className="text-sm text-muted-foreground mt-4">Total votes: {totalVotes}</p>
        )}
         {!hasVoted && (
          <p className="text-sm text-muted-foreground mt-4">Choose an option to see results.</p>
        )}
      </CardContent>
    </Card>
  );
}
