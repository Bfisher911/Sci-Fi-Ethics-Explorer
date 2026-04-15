'use client';

import { useState } from 'react';
import { ScenarioAnalyzerForm } from '@/components/analyzer/scenario-analyzer-form';
import { analyzeScenario, type AnalyzeScenarioOutput } from '@/ai/flows/analyze-scenario';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Lightbulb, ListChecks, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { recordAnalysis } from '@/app/actions/progress';
import { ShareToCommunityDialog } from '@/components/communities/share-to-community-dialog';

export default function AnalyzerPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeScenarioOutput | null>(null);
  const [scenarioText, setScenarioText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleAnalyze = async (scenarioText: string) => {
    setScenarioText(scenarioText);
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeScenario({ scenarioText });
      setAnalysisResult(result);

      // Record analysis in user progress
      if (user?.uid) {
        try {
          await recordAnalysis(user.uid);
        } catch (err) {
          console.error('Failed to record analysis:', err);
        }
      }
    } catch (err: any) {
      console.error("Error analyzing scenario:", err);
      setError(err.message || "Failed to analyze scenario. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline">Ethical Scenario Analyzer</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Submit a sci-fi scenario and let our AI analyze its ethical implications, potential consequences, and relevant philosophical frameworks.
          </p>
        </CardContent>
      </Card>

      <ScenarioAnalyzerForm onSubmit={handleAnalyze} isLoading={isLoading} />

      {isLoading && (
        <div className="mt-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">Analyzing scenario, please wait...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <Card className="mt-8 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-accent font-semibold">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary flex items-center">
                <ListChecks className="mr-2 h-5 w-5" /> Ethical Dilemmas Identified:
              </h3>
              {analysisResult.ethicalDilemmas.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2 text-foreground/90">
                  {analysisResult.ethicalDilemmas.map((dilemma, index) => (
                    <li key={index}>{dilemma}</li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground italic">No specific dilemmas highlighted by the AI.</p>}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5" /> Potential Consequences:
              </h3>
              {analysisResult.potentialConsequences.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2 text-foreground/90">
                  {analysisResult.potentialConsequences.map((consequence, index) => (
                    <li key={index}>{consequence}</li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground italic">No specific consequences highlighted by the AI.</p>}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary flex items-center">
                <Lightbulb className="mr-2 h-5 w-5" /> Applicable Ethical Theories:
              </h3>
              {analysisResult.applicableEthicalTheories.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 pl-2 text-foreground/90">
                {analysisResult.applicableEthicalTheories.map((theory, index) => (
                  <li key={index}>{theory}</li>
                ))}
              </ul>
              ) : <p className="text-muted-foreground italic">No specific theories highlighted by the AI.</p>}
            </div>

            {analysisResult.quotaInformation && (
              <Alert variant="default" className="bg-secondary/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Quota Information</AlertTitle>
                <AlertDescription>{analysisResult.quotaInformation}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          {user && (
            <CardFooter className="flex justify-end">
              <ShareToCommunityDialog
                type="analysis"
                defaultTitle={
                  scenarioText.slice(0, 60) +
                  (scenarioText.length > 60 ? '…' : '')
                }
                defaultSummary=""
                content={{
                  scenarioText,
                  ethicalDilemmas: analysisResult.ethicalDilemmas,
                  potentialConsequences: analysisResult.potentialConsequences,
                  applicableEthicalTheories:
                    analysisResult.applicableEthicalTheories,
                }}
              />
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
