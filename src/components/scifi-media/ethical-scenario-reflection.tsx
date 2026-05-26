'use client';

import { useMemo, useState } from 'react';
import type { EthicalScenarioQuestion, EthicalScenarioReflection } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { submitMediaScenarioReflection } from '@/app/actions/scifi-media-reflections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle2, Loader2 } from 'lucide-react';

interface EthicalScenarioReflectionProps {
  mediaId: string;
  mediaTitle: string;
  reflection?: EthicalScenarioReflection;
}

interface ResponseState {
  selectedOptionId?: string;
  responseText: string;
  feedbackText?: string;
  challengeQuestion?: string;
  submitted?: boolean;
  persisted?: boolean;
}

function QuestionCard({
  mediaId,
  question,
}: {
  mediaId: string;
  question: EthicalScenarioQuestion;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<ResponseState>({ responseText: '' });
  const [submitting, setSubmitting] = useState(false);
  const selectedOption = question.options.find((option) => option.id === state.selectedOptionId);

  async function handleSubmit() {
    if (!user?.uid) {
      toast({
        title: 'Sign in required',
        description: 'Sign in to save this ethical reflection to your profile.',
        variant: 'destructive',
      });
      return;
    }
    if (!state.selectedOptionId && !state.responseText.trim()) {
      toast({
        title: 'Add your judgment',
        description: 'Select an option or explain your reasoning before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitMediaScenarioReflection({
        userId: user.uid,
        mediaId,
        questionId: question.id,
        selectedOptionId: state.selectedOptionId,
        responseText: state.responseText,
      });

      if (!result.success) {
        toast({
          title: 'Reflection not saved',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        submitted: true,
        feedbackText: result.data.feedbackText,
        challengeQuestion: result.data.challengeQuestion,
        persisted: result.data.persisted,
      }));
      toast({
        title: result.data.persisted ? 'Reflection saved' : 'Reflection captured',
        description: result.data.persisted
          ? 'This ethical judgment now contributes to your learning profile.'
          : 'Preview feedback is available here. Persistent profile updates need Firebase write access.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="bg-background/50 border-border">
      <CardHeader>
        <CardTitle className="text-lg text-primary">{question.title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{question.prompt}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={state.selectedOptionId}
          onValueChange={(selectedOptionId) =>
            setState((prev) => ({ ...prev, selectedOptionId }))
          }
          disabled={submitting || state.submitted}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <Label
              key={option.id}
              htmlFor={`${question.id}-${option.id}`}
              className="block rounded-md border bg-card/70 p-3 cursor-pointer hover:border-primary/60 transition-colors"
            >
              <div className="flex gap-3">
                <RadioGroupItem
                  id={`${question.id}-${option.id}`}
                  value={option.id}
                  className="mt-1"
                />
                <div className="space-y-2">
                  <div className="font-medium">
                    {option.label}. {option.text}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {option.likelyFrameworkAlignments.slice(0, 3).map((frameworkId) => (
                      <Badge key={frameworkId} variant="secondary" className="text-[10px]">
                        {frameworkId.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>

        {question.allowFreeResponse && (
          <div className="space-y-2">
            <Label htmlFor={`${question.id}-reasoning`}>Your reasoning</Label>
            <Textarea
              id={`${question.id}-reasoning`}
              value={state.responseText}
              onChange={(event) =>
                setState((prev) => ({ ...prev, responseText: event.target.value }))
              }
              disabled={submitting || state.submitted}
              placeholder="Explain the tradeoff you are willing to accept, and whose perspective matters most."
              className="min-h-24"
            />
          </div>
        )}

        {selectedOption && !state.submitted && (
          <p className="text-xs text-muted-foreground">
            This option is defensible because {selectedOption.possibleStrengths[0].toLowerCase()}.
            Watch for the risk that {selectedOption.possibleRisks[0].toLowerCase()}.
          </p>
        )}

        {state.submitted ? (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {state.persisted ? 'Profile updated' : 'Reflection captured'}
            </div>
            <p>{state.feedbackText}</p>
            {state.persisted === false && (
              <p className="text-muted-foreground">
                This preview could not write to the profile database, so the reflection was not
                permanently added to your learning profile.
              </p>
            )}
            {state.challengeQuestion && (
              <p className="text-muted-foreground italic">{state.challengeQuestion}</p>
            )}
          </div>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            Submit Ethical Reflection
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EthicalScenarioReflection({
  mediaId,
  mediaTitle,
  reflection,
}: EthicalScenarioReflectionProps) {
  const questions = useMemo(() => reflection?.questions ?? [], [reflection?.questions]);
  if (!reflection || questions.length === 0) return null;

  return (
    <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-primary font-headline flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Ethical Scenario Reflection
        </CardTitle>
        <CardDescription>
          Ambiguous choices inspired by {mediaTitle}. These are separate from factual quizzes
          and update your ethical learning profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question) => (
          <QuestionCard key={question.id} mediaId={mediaId} question={question} />
        ))}
      </CardContent>
    </Card>
  );
}
