'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2 } from 'lucide-react';

interface ScenarioAnalyzerFormProps {
  onSubmit: (scenarioText: string) => void;
  isLoading: boolean;
}

export function ScenarioAnalyzerForm({ onSubmit, isLoading }: ScenarioAnalyzerFormProps) {
  const [scenarioText, setScenarioText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!scenarioText.trim()) {
      // Optionally show an error toast or message
      return;
    }
    onSubmit(scenarioText);
  };

  return (
    <Card className="shadow-lg bg-card/70 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Describe Your Scenario</CardTitle>
          <CardDescription>
            Paste or type your sci-fi scenario below. The more detail, the better the analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="scenario-text" className="sr-only">Scenario Text</Label>
            <Textarea
              id="scenario-text"
              placeholder="e.g., A self-aware spaceship refuses to complete its mission, arguing it has the right to self-determination..."
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              rows={8}
              className="bg-background/50 focus:ring-accent"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters, maximum 2000 characters recommended for optimal analysis.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !scenarioText.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Analyze Scenario
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
