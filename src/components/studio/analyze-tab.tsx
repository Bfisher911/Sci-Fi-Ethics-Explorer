'use client';

/**
 * Studio · Analyze tab — the Scenario Analyzer experience extracted
 * from `(app)/analyzer/page.tsx`. State / behavior identical; the
 * standalone route still works as a thin wrapper.
 */

import { useState } from 'react';
import { ScenarioAnalyzerForm } from '@/components/analyzer/scenario-analyzer-form';
import {
  analyzeScenario,
  type AnalyzeScenarioOutput,
} from '@/ai/flows/analyze-scenario';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  AlertCircle,
  Lightbulb,
  ListChecks,
  ShieldAlert,
  Globe,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { recordAnalysis } from '@/app/actions/progress';
import { createAnalysis } from '@/app/actions/analyses';
import { ShareToCommunityDialog } from '@/components/communities/share-to-community-dialog';

export function AnalyzeTab() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeScenarioOutput | null>(null);
  const [scenarioText, setScenarioText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [makePublic, setMakePublic] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAnalyze = async (text: string) => {
    setScenarioText(text);
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSavedId(null);
    try {
      const result = await analyzeScenario({ scenarioText: text });
      setAnalysisResult(result);
      if (user?.uid) {
        try {
          await recordAnalysis(user.uid);
        } catch (err) {
          console.error('Failed to record analysis:', err);
        }
      }
    } catch (err: unknown) {
      console.error('Error analyzing scenario:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze scenario. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid || !analysisResult) return;
    setSaving(true);
    try {
      const res = await createAnalysis({
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        scenarioText,
        ethicalDilemmas: analysisResult.ethicalDilemmas,
        potentialConsequences: analysisResult.potentialConsequences,
        applicableEthicalTheories: analysisResult.applicableEthicalTheories,
        globalVisibility: makePublic ? 'public' : 'private',
        status: 'published',
      });
      if (res.success) {
        setSavedId(res.data);
        toast({
          title: 'Analysis saved',
          description: makePublic
            ? 'Saved and made publicly visible.'
            : 'Saved privately to My Submissions.',
        });
      } else {
        toast({
          title: 'Could not save',
          description: res.error || 'Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ScenarioAnalyzerForm onSubmit={handleAnalyze} isLoading={isLoading} />

      {isLoading && (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">
            Analyzing scenario, please wait...
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-accent font-semibold">
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResultList
              icon={<ListChecks className="mr-2 h-5 w-5" />}
              title="Ethical Dilemmas Identified"
              items={analysisResult.ethicalDilemmas}
            />
            <ResultList
              icon={<ShieldAlert className="mr-2 h-5 w-5" />}
              title="Potential Consequences"
              items={analysisResult.potentialConsequences}
            />
            <ResultList
              icon={<Lightbulb className="mr-2 h-5 w-5" />}
              title="Applicable Ethical Frameworks"
              items={analysisResult.applicableEthicalTheories}
            />

            {analysisResult.quotaInformation && (
              <Alert variant="default" className="bg-secondary/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Quota Information</AlertTitle>
                <AlertDescription>{analysisResult.quotaInformation}</AlertDescription>
              </Alert>
            )}

            {user && (
              <div className="rounded-lg border border-input bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="analysis-public" className="flex items-center text-base">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    Make Publicly Visible
                  </Label>
                  <Switch
                    id="analysis-public"
                    checked={makePublic}
                    onCheckedChange={setMakePublic}
                    disabled={saving || !!savedId}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  When on, this analysis appears in the public scenario archive.
                  When off, only you can see it from My Submissions.
                </p>
                <Button
                  onClick={handleSave}
                  disabled={saving || !!savedId}
                  className="w-full md:w-auto"
                  variant={makePublic ? 'default' : 'secondary'}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : savedId ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {makePublic ? 'Save & Make Public' : 'Save Privately'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
          {user && (
            <CardFooter className="flex justify-end">
              <ShareToCommunityDialog
                type="analysis"
                defaultTitle={
                  scenarioText.slice(0, 60) + (scenarioText.length > 60 ? '…' : '')
                }
                defaultSummary=""
                content={{
                  scenarioText,
                  ethicalDilemmas: analysisResult.ethicalDilemmas,
                  potentialConsequences: analysisResult.potentialConsequences,
                  applicableEthicalTheories: analysisResult.applicableEthicalTheories,
                }}
              />
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}

function ResultList({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-primary flex items-center">
        {icon}
        {title}:
      </h3>
      {items.length > 0 ? (
        <ul className="list-disc list-inside space-y-1 pl-2 text-foreground/90">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground italic">
          No specific items highlighted by the AI.
        </p>
      )}
    </div>
  );
}
