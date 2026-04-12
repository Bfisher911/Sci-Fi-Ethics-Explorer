'use client';

import { useState } from 'react';
import {
  devilsAdvocate,
  type DevilsAdvocateOutput,
} from '@/ai/flows/devils-advocate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Flame, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DevilsAdvocateProps {
  userPosition: string;
  scenarioContext: string;
}

/**
 * Devil's Advocate component that challenges the user's ethical position
 * by calling the devilsAdvocate AI flow.
 */
export function DevilsAdvocate({
  userPosition,
  scenarioContext,
}: DevilsAdvocateProps) {
  const { toast } = useToast();
  const [result, setResult] = useState<DevilsAdvocateOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChallenge = async () => {
    if (!userPosition.trim() || !scenarioContext.trim()) {
      toast({
        title: 'Missing input',
        description: 'Both a position and scenario context are needed.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const output = await devilsAdvocate({
        userPosition: userPosition.trim(),
        scenarioContext: scenarioContext.trim(),
      });
      setResult(output);
    } catch (error) {
      console.error('Failed to generate counter-arguments:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate counter-arguments. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleChallenge}
        disabled={loading || !userPosition.trim() || !scenarioContext.trim()}
        variant="outline"
        className="gap-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Flame className="h-4 w-4" />
        )}
        Challenge My Position
      </Button>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Counter-arguments */}
          {result.counterArguments.map((arg, index) => (
            <Card
              key={index}
              className="bg-card/80 backdrop-blur-sm border-orange-500/30"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-orange-500/20 text-orange-400 text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-orange-300">{arg.point}</p>
                    <p className="text-sm mt-1 leading-relaxed">
                      {arg.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Overall challenge */}
          <Card className="bg-orange-500/10 border-orange-500/40">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-300 mb-1">
                    Overall Challenge
                  </p>
                  <p className="text-sm leading-relaxed">
                    {result.overallChallenge}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
