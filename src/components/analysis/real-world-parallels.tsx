'use client';

import { useState } from 'react';
import {
  findRealWorldParallels,
  type FindRealWorldParallelsOutput,
} from '@/ai/flows/find-real-world-parallels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Globe, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RealWorldParallelsProps {
  scenarioText: string;
  ethicalThemes: string[];
}

/**
 * Component that finds and displays real-world parallels to a sci-fi scenario
 * by calling the findRealWorldParallels AI flow.
 */
export function RealWorldParallels({
  scenarioText,
  ethicalThemes,
}: RealWorldParallelsProps) {
  const { toast } = useToast();
  const [result, setResult] = useState<FindRealWorldParallelsOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFind = async () => {
    if (!scenarioText.trim()) {
      toast({
        title: 'Missing input',
        description: 'A scenario description is required.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const output = await findRealWorldParallels({
        scenarioText: scenarioText.trim(),
        ethicalThemes: ethicalThemes.length > 0 ? ethicalThemes : ['ethics'],
      });
      setResult(output);
    } catch (error) {
      console.error('Failed to find parallels:', error);
      toast({
        title: 'Error',
        description: 'Failed to find real-world parallels. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleFind}
        disabled={loading || !scenarioText.trim()}
        variant="outline"
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        Find Real-World Parallels
      </Button>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      )}

      {result && result.parallels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.parallels.map((parallel, index) => (
            <Card
              key={index}
              className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  {parallel.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {parallel.description}
                </p>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-medium text-primary mb-1">
                    Connection to Scenario
                  </p>
                  <p className="text-sm">{parallel.similarity}</p>
                </div>
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  {parallel.ethicalFramework}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {result && result.parallels.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No parallels found. Try adjusting the scenario description.
        </p>
      )}
    </div>
  );
}
