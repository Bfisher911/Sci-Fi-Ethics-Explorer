'use client';

import { useState } from 'react';
import {
  comparePerspectives,
  type ComparePerspectivesOutput,
} from '@/ai/flows/compare-perspectives';
import { FrameworkVerdictCard } from '@/components/analysis/framework-verdict-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Scale, Globe, Save, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { ShareToCommunityDialog } from '@/components/communities/share-to-community-dialog';
import { createPerspective } from '@/app/actions/perspectives';

const FRAMEWORKS = [
  'Utilitarianism',
  'Deontology',
  'Virtue Ethics',
  'Social Contract Theory',
] as const;

interface PerspectiveComparisonProps {
  scenario?: string;
  userChoice?: string;
}

/**
 * Component for comparing how different ethical frameworks evaluate a scenario.
 * Calls the comparePerspectives AI flow and displays results as verdict cards.
 */
export function PerspectiveComparison({
  scenario: initialScenario,
  userChoice: initialChoice,
}: PerspectiveComparisonProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [scenario, setScenario] = useState(initialScenario ?? '');
  const [userChoice, setUserChoice] = useState(initialChoice ?? '');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([
    ...FRAMEWORKS,
  ]);
  const [result, setResult] = useState<ComparePerspectivesOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [makePublic, setMakePublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const toggleFramework = (framework: string) => {
    setSelectedFrameworks((prev) =>
      prev.includes(framework)
        ? prev.filter((f) => f !== framework)
        : [...prev, framework]
    );
  };

  const handleCompare = async () => {
    if (!scenario.trim() || !userChoice.trim()) {
      toast({
        title: 'Missing input',
        description: 'Please provide both a scenario and your choice.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFrameworks.length === 0) {
      toast({
        title: 'No frameworks selected',
        description: 'Please select at least one ethical framework.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setSavedId(null);
    try {
      const output = await comparePerspectives({
        scenario: scenario.trim(),
        userChoice: userChoice.trim(),
        frameworks: selectedFrameworks,
      });
      setResult(output);
    } catch (error) {
      console.error('Failed to compare perspectives:', error);
      toast({
        title: 'Analysis failed',
        description: 'An error occurred while analyzing perspectives. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid || !result) return;
    setSaving(true);
    try {
      const res = await createPerspective({
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        scenario: scenario.trim(),
        userChoice: userChoice.trim(),
        comparisons: result.comparisons.map((c) => ({
          framework: c.framework,
          analysis: c.analysis,
          verdict: c.verdict,
          strength: c.strength,
        })),
        synthesis: result.synthesis || '',
        globalVisibility: makePublic ? 'public' : 'private',
        status: 'published',
      });
      if (res.success) {
        setSavedId(res.data);
        toast({
          title: 'Comparison saved',
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
      {/* Input form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scenario-input">Scenario</Label>
          <Textarea
            id="scenario-input"
            placeholder="Describe the ethical scenario or dilemma..."
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="choice-input">Your Choice</Label>
          <Input
            id="choice-input"
            placeholder="What decision would you make?"
            value={userChoice}
            onChange={(e) => setUserChoice(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Ethical Frameworks</Label>
          <div className="flex flex-wrap gap-4">
            {FRAMEWORKS.map((framework) => (
              <div key={framework} className="flex items-center gap-2">
                <Checkbox
                  id={`fw-${framework}`}
                  checked={selectedFrameworks.includes(framework)}
                  onCheckedChange={() => toggleFramework(framework)}
                  disabled={loading}
                />
                <Label
                  htmlFor={`fw-${framework}`}
                  className="text-sm cursor-pointer"
                >
                  {framework}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleCompare}
          disabled={loading || !scenario.trim() || !userChoice.trim()}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Scale className="h-4 w-4" />
          )}
          Compare Perspectives
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedFrameworks.map((fw) => (
            <Skeleton key={fw} className="h-48 rounded-lg" />
          ))}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.comparisons.map((comparison) => (
              <FrameworkVerdictCard
                key={comparison.framework}
                framework={comparison.framework}
                analysis={comparison.analysis}
                verdict={comparison.verdict}
                strength={comparison.strength}
              />
            ))}
          </div>

          {result.synthesis && (
            <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-primary">
                  Synthesis
                </h3>
                <p className="text-sm leading-relaxed">{result.synthesis}</p>
              </CardContent>
            </Card>
          )}

          {user && (
            <div className="rounded-lg border border-input bg-background/50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label
                  htmlFor="perspective-public"
                  className="flex items-center text-base"
                >
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  Make Publicly Visible
                </Label>
                <Switch
                  id="perspective-public"
                  checked={makePublic}
                  onCheckedChange={setMakePublic}
                  disabled={saving || !!savedId}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When on, this comparison appears in the public perspective
                archive. When off, only you can see it from My Submissions.
              </p>
              <Button
                onClick={handleSave}
                disabled={saving || !!savedId}
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

          {user && (
            <div className="flex justify-end">
              <ShareToCommunityDialog
                type="perspective_comparison"
                defaultTitle={
                  scenario.slice(0, 60) + (scenario.length > 60 ? '…' : '')
                }
                defaultSummary={`My choice: ${userChoice}`}
                content={{
                  scenario,
                  userChoice,
                  comparisons: result.comparisons,
                  synthesis: result.synthesis,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
