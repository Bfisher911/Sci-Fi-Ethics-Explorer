'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WeeklyDilemma, WeeklyDilemmaReply, WeeklyDilemmaResponse } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  getCurrentWeeklyDilemma,
  getWeeklyDilemmaBySlug,
  submitWeeklyDilemmaReply,
  submitWeeklyDilemmaResponse,
} from '@/app/actions/weekly-dilemmas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, MessageSquare, Send, Sparkles } from 'lucide-react';

interface WeeklyClauseData {
  dilemma: WeeklyDilemma | null;
  ownResponse: WeeklyDilemmaResponse | null;
  peerResponses: WeeklyDilemmaResponse[];
  replies: WeeklyDilemmaReply[];
  peersLocked: boolean;
}

export function WeeklyClauseClient({ slug }: { slug?: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [data, setData] = useState<WeeklyClauseData | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState('');
  const [responseText, setResponseText] = useState('');
  const [replyTextByResponse, setReplyTextByResponse] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const result = slug
      ? await getWeeklyDilemmaBySlug(slug, user?.uid)
      : await getCurrentWeeklyDilemma(user?.uid);
    if (result.success) {
      setData({
        dilemma: result.data.dilemma,
        ownResponse: result.data.ownResponse,
        peerResponses: [...result.data.peerResponses],
        replies: [...(result.data.replies ?? [])],
        peersLocked: result.data.peersLocked ?? true,
      });
      if (!slug && result.data.dilemma?.slug) {
        router.replace(`/weekly-clause/${result.data.dilemma.slug}`);
      }
    } else {
      toast({ title: 'Could not load Weekly Clause', description: result.error, variant: 'destructive' });
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user?.uid]);

  async function handleSubmitResponse() {
    if (!user?.uid) {
      toast({ title: 'Sign in required', description: 'Sign in before submitting your response.', variant: 'destructive' });
      return;
    }
    if (!data?.dilemma || !responseText.trim()) return;
    setSubmitting(true);
    const result = await submitWeeklyDilemmaResponse({
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous Explorer',
      dilemmaId: data.dilemma.id,
      selectedChoiceId: selectedChoiceId || undefined,
      responseText,
    });
    setSubmitting(false);
    if (!result.success) {
      toast({ title: 'Response not saved', description: result.error, variant: 'destructive' });
      return;
    }
    toast({
      title: 'Response submitted',
      description: 'Peer responses are now unlocked, and your ethical profile was updated.',
    });
    setResponseText('');
    await load();
  }

  async function handleSubmitReply(responseId: string) {
    if (!user?.uid || !data?.dilemma) return;
    const replyText = replyTextByResponse[responseId]?.trim();
    if (!replyText) return;
    const result = await submitWeeklyDilemmaReply({
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous Explorer',
      dilemmaId: data.dilemma.id,
      responseId,
      replyText,
    });
    if (!result.success) {
      toast({ title: 'Reply not saved', description: result.error, variant: 'destructive' });
      return;
    }
    setReplyTextByResponse((prev) => ({ ...prev, [responseId]: '' }));
    await load();
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data?.dilemma) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">No Weekly Clause is available yet.</p>
        </Card>
      </div>
    );
  }

  const { dilemma } = data;
  const selectedChoice = dilemma.choices.find((choice) => choice.id === selectedChoiceId);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {dilemma.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <CardTitle className="text-3xl text-primary font-headline flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            The Weekly Clause: {dilemma.title}
          </CardTitle>
          <CardDescription>{dilemma.shortSetup}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{dilemma.backgroundContext}</p>
          <div className="rounded-md border bg-background/50 p-4">
            <h2 className="font-semibold text-lg mb-1">{dilemma.mainEthicalQuestion}</h2>
            <p className="text-xs text-muted-foreground">
              Submit your own response before reading classmates' answers.
            </p>
          </div>

          {!data.ownResponse ? (
            <div className="space-y-4">
              <RadioGroup value={selectedChoiceId} onValueChange={setSelectedChoiceId}>
                {dilemma.choices.map((choice) => (
                  <Label key={choice.id} htmlFor={choice.id} className="flex gap-3 rounded-md border p-3 cursor-pointer hover:border-primary/60">
                    <RadioGroupItem id={choice.id} value={choice.id} className="mt-1" />
                    <span><strong>{choice.label}.</strong> {choice.text}</span>
                  </Label>
                ))}
              </RadioGroup>
              {selectedChoice && (
                <p className="text-xs text-muted-foreground">
                  This position will be scored as one part of your reasoning. Your written explanation matters too.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="weekly-response">Your response</Label>
                <Textarea
                  id="weekly-response"
                  value={responseText}
                  onChange={(event) => setResponseText(event.target.value)}
                  placeholder={dilemma.reflectionPrompt}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleSubmitResponse} disabled={submitting || !responseText.trim()} className="gap-2">
                <Send className="h-4 w-4" />
                Submit and Unlock Responses
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
              <h3 className="font-semibold text-primary mb-2">Your submitted response</h3>
              <p className="text-sm whitespace-pre-wrap">{data.ownResponse.responseText}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            {data.peersLocked ? <Lock className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            Peer Responses
          </CardTitle>
          <CardDescription>
            {data.peersLocked
              ? 'Responses unlock after you submit your own answer.'
              : 'Compare how other learners framed the tradeoff.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.peersLocked ? (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              Peer responses are hidden server-side until your response is saved.
            </div>
          ) : (
            data.peerResponses.map((response) => {
              const replies = data.replies.filter((reply) => reply.responseId === response.id);
              return (
                <div key={response.id} className="rounded-md border bg-background/50 p-4 space-y-3">
                  <div className="text-xs text-muted-foreground">{response.userName || 'Anonymous Explorer'}</div>
                  <p className="text-sm whitespace-pre-wrap">{response.responseText}</p>
                  {replies.map((reply) => (
                    <div key={reply.id} className="ml-4 border-l pl-3 text-sm">
                      <div className="text-xs text-muted-foreground">{reply.userName || 'Anonymous Explorer'}</div>
                      <p>{reply.replyText}</p>
                    </div>
                  ))}
                  {user && (
                    <div className="space-y-2">
                      <Textarea
                        value={replyTextByResponse[response.id] ?? ''}
                        onChange={(event) =>
                          setReplyTextByResponse((prev) => ({
                            ...prev,
                            [response.id]: event.target.value,
                          }))
                        }
                        placeholder="Reply thoughtfully to this response..."
                        className="min-h-20"
                      />
                      <Button size="sm" variant="outline" onClick={() => handleSubmitReply(response.id)}>
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
