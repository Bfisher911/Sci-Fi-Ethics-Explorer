'use client';

/**
 * Reusable dialogue experience for every library persona.
 *
 * Two modes, persisted separately per (user, persona, mode):
 *  - open: free conversation with the persona.
 *  - assessment: goal-based scenario dialogue; after enough substantive
 *    turns the student submits the conversation for rubric evaluation.
 *    Pass → certificate (awarded server-side); otherwise coaching + retry.
 */

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { chatWithPersona } from '@/ai/flows/persona-dialogue';
import {
  getDialogueSession,
  saveDialogueSession,
  submitPersonaAssessment,
  type DialogueMessage,
  type SubmitAssessmentResult,
} from '@/app/actions/dialogues';
import type { PublicDialoguePersona } from '@/lib/dialogues/types';
import {
  MIN_ASSESSMENT_STUDENT_TURNS,
  RUBRIC_CRITERIA,
  RUBRIC_SCORE_LABELS,
  MAX_CRITERION_SCORE,
} from '@/lib/dialogues/rubric';
import { getFrameworkDisplayName } from '@/lib/ethical-framework-registry';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  Award,
  Bot,
  GraduationCap,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Target,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'open' | 'assessment';

interface PersonaChatProps {
  persona: PublicDialoguePersona;
}

const OPEN_GREETING = (name: string) =>
  `Welcome. I'm an educational simulation exploring the ideas of ${name}. Ask me anything — and expect me to ask you questions back. What technology question is on your mind?`;

const ASSESSMENT_KICKOFF = "I'm ready to begin the assessment.";

export function PersonaChat({ persona }: PersonaChatProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode | null>(null);
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentOutcome, setAssessmentOutcome] =
    useState<SubmitAssessmentResult | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const studentTurns = messages.filter((m) => m.role === 'user').length;
  // The synthetic kickoff message doesn't count as engagement.
  const substantiveTurns =
    mode === 'assessment' ? Math.max(0, studentTurns - 1) : studentTurns;
  const canSubmit =
    mode === 'assessment' &&
    substantiveTurns >= MIN_ASSESSMENT_STUDENT_TURNS &&
    !isLoading &&
    !isSubmitting &&
    !assessmentOutcome?.result.passed;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, assessmentOutcome]);

  const persist = useCallback(
    (msgs: DialogueMessage[], m: Mode) => {
      if (!user) return;
      // Fire-and-forget: persistence must never block the conversation.
      saveDialogueSession({
        userId: user.uid,
        category: persona.category,
        personaId: persona.id,
        mode: m,
        messages: msgs,
      }).catch(() => {});
    },
    [user, persona.category, persona.id]
  );

  const sendToPersona = useCallback(
    async (history: DialogueMessage[], m: Mode) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await chatWithPersona({
          category: persona.category,
          personaId: persona.id,
          mode: m,
          messages: history,
        });
        if (result.error || !result.response) {
          setError(
            result.error || 'No response received. Try sending that again.'
          );
          // Roll the unanswered user turn back so a retry re-sends it.
          setMessages(history.slice(0, -1));
          return;
        }
        const updated: DialogueMessage[] = [
          ...history,
          { role: 'assistant', content: result.response },
        ];
        setMessages(updated);
        persist(updated, m);
      } catch {
        setError('The dialogue is temporarily unavailable. Try again in a moment.');
        setMessages(history.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [persona.category, persona.id, persist]
  );

  const startMode = useCallback(
    async (m: Mode, opts?: { fresh?: boolean }) => {
      setMode(m);
      setError(null);
      setAssessmentOutcome(null);
      setIsRestoring(true);
      try {
        // Resume a saved session when one exists (unless a fresh attempt
        // was requested, e.g. retrying a failed assessment).
        if (user && !opts?.fresh) {
          const saved = await getDialogueSession(
            user.uid,
            persona.category,
            persona.id,
            m
          );
          if (saved.success && saved.data && saved.data.messages.length > 0) {
            setMessages(saved.data.messages);
            return;
          }
        }
        if (m === 'open') {
          setMessages([
            { role: 'assistant', content: OPEN_GREETING(persona.displayName) },
          ]);
        } else {
          // Assessment opens with the persona explaining the goal +
          // scenario; the flow needs a user turn first, so seed one.
          const kickoff: DialogueMessage[] = [
            { role: 'user', content: ASSESSMENT_KICKOFF },
          ];
          setMessages(kickoff);
          await sendToPersona(kickoff, m);
        }
      } finally {
        setIsRestoring(false);
        inputRef.current?.focus();
      }
    },
    [user, persona.category, persona.id, persona.displayName, sendToPersona]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !mode) return;
    const next: DialogueMessage[] = [
      ...messages,
      { role: 'user', content: input.trim() },
    ];
    setMessages(next);
    setInput('');
    await sendToPersona(next, mode);
  };

  const handleSubmitAssessment = async () => {
    if (!user || !mode || mode !== 'assessment') return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await submitPersonaAssessment({
        userId: user.uid,
        userName: user.displayName || 'A student',
        category: persona.category,
        personaId: persona.id,
        messages,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setAssessmentOutcome(res.data);
    } catch {
      setError(
        'Submitting the assessment failed. Your conversation is saved — try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryAssessment = () => {
    setAssessmentOutcome(null);
    setMessages([]);
    void startMode('assessment', { fresh: true });
  };

  // ─── Mode selection screen ─────────────────────────────────────────

  if (!mode) {
    return (
      <div className="grid gap-4 md:grid-cols-2" role="group" aria-label="Choose a conversation mode">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-accent" aria-hidden />
              Open Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow gap-4">
            <p className="text-sm text-muted-foreground flex-grow">
              Talk freely. Ask questions, test ideas, and explore how this
              perspective applies to today's technology. No grade — just
              thinking.
            </p>
            <Button onClick={() => startMode('open')} className="w-full">
              Start talking
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col border-accent/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-accent" aria-hidden />
              Assessment Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow gap-4">
            <p className="text-sm text-muted-foreground flex-grow">
              Work through a custom scenario and demonstrate your reasoning.
              Pass the rubric evaluation to earn the{' '}
              <strong>{persona.displayName}</strong> dialogue certificate.
            </p>
            {!user ? (
              <p className="text-xs text-muted-foreground">
                Sign in to take the assessment and earn certificates.
              </p>
            ) : null}
            <Button
              onClick={() => startMode('assessment')}
              variant="secondary"
              className="w-full"
              disabled={!user}
            >
              Begin assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Chat screen ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col rounded-lg shadow-xl overflow-hidden bg-card/70 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 bg-background/50">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {mode === 'assessment' ? (
            <>
              <Target className="h-4 w-4 text-accent" aria-hidden />
              Assessment with {persona.displayName}
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 text-accent" aria-hidden />
              Conversation with {persona.displayName}
            </>
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMode(null);
            setMessages([]);
            setAssessmentOutcome(null);
            setError(null);
          }}
        >
          Switch mode
        </Button>
      </div>

      <ScrollArea
        className="p-4 md:p-6 h-[28rem] md:h-[32rem]"
        ref={scrollRef}
      >
        <div className="space-y-6" role="log" aria-live="polite" aria-label="Dialogue messages">
          {isRestoring && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading conversation" />
            </div>
          )}
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 border-2 border-accent">
                  {persona.imageUrl ? (
                    <AvatarImage src={persona.imageUrl} alt="" />
                  ) : null}
                  <AvatarFallback>
                    <Bot className="text-accent" aria-hidden />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[80%] md:max-w-[70%] rounded-xl px-4 py-3 shadow-md text-sm md:text-base',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarFallback>
                    <User className="text-primary" aria-hidden />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-start gap-3 justify-start">
              <Avatar className="h-8 w-8 border-2 border-accent">
                <AvatarFallback>
                  <Bot className="text-accent" aria-hidden />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-xl px-4 py-3 shadow-md bg-secondary">
                <Loader2 className="h-5 w-5 animate-spin" aria-label="Waiting for response" />
              </div>
            </div>
          )}

          {assessmentOutcome && (
            <AssessmentResultCard
              outcome={assessmentOutcome}
              personaName={persona.displayName}
              onRetry={handleRetryAssessment}
            />
          )}
        </div>
      </ScrollArea>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertTitle>Dialogue error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mode === 'assessment' && !assessmentOutcome?.result.passed && (
        <div className="border-t px-4 py-3 bg-background/40 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {substantiveTurns < MIN_ASSESSMENT_STUDENT_TURNS
              ? `Respond at least ${MIN_ASSESSMENT_STUDENT_TURNS} times before submitting (${substantiveTurns}/${MIN_ASSESSMENT_STUDENT_TURNS}).`
              : 'Submit whenever you feel you have shown your reasoning.'}
          </p>
          <Button
            onClick={handleSubmitAssessment}
            disabled={!canSubmit}
            size="sm"
            variant="secondary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Evaluating…
              </>
            ) : (
              <>
                <GraduationCap className="mr-2 h-4 w-4" aria-hidden />
                Submit for evaluation
              </>
            )}
          </Button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t p-4 bg-background/50"
      >
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              mode === 'assessment'
                ? 'Reason through the scenario…'
                : `Ask ${persona.displayName} anything…`
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow focus:ring-accent"
            disabled={isLoading || isSubmitting || isRestoring}
            aria-label="Your message"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isLoading || isSubmitting || isRestoring || !input.trim()}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Send className="h-5 w-5" aria-hidden />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Result card ─────────────────────────────────────────────────────

function AssessmentResultCard({
  outcome,
  personaName,
  onRetry,
}: {
  outcome: SubmitAssessmentResult;
  personaName: string;
  onRetry: () => void;
}) {
  const { result, evaluation, certificateAwarded, certificateHash } = outcome;
  return (
    <Card
      className={cn(
        'border-2',
        result.passed ? 'border-green-500/50' : 'border-amber-500/50'
      )}
      aria-label={`Assessment result: ${result.passed ? 'passed' : 'not passed yet'}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {result.passed ? (
            <>
              <Award className="h-5 w-5 text-green-500" aria-hidden />
              Passed — {result.scorePercent}%
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 text-amber-500" aria-hidden />
              Not passed yet — {result.scorePercent}%
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{evaluation.summary}</p>

        <div className="space-y-2">
          {RUBRIC_CRITERIA.map((c) => {
            const score = evaluation.scores[c.id] ?? 0;
            return (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{c.label}</span>
                  <span className="text-muted-foreground">
                    {RUBRIC_SCORE_LABELS[score]} ({score}/{MAX_CRITERION_SCORE})
                  </span>
                </div>
                <Progress
                  value={(score / MAX_CRITERION_SCORE) * 100}
                  className="h-1.5"
                  aria-label={`${c.label}: ${score} of ${MAX_CRITERION_SCORE}`}
                />
              </div>
            );
          })}
        </div>

        {evaluation.frameworksUsed.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1.5">Frameworks you used</p>
            <div className="flex flex-wrap gap-1.5">
              {evaluation.frameworksUsed.map((f) => (
                <Badge key={f} variant="secondary" className="text-xs">
                  {getFrameworkDisplayName(f)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {evaluation.strengths.length > 0 && (
          <div className="text-sm">
            <p className="text-xs font-medium mb-1">Strengths</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
              {evaluation.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {!result.passed && (
          <Alert>
            <GraduationCap className="h-4 w-4" aria-hidden />
            <AlertTitle>Coaching for your next attempt</AlertTitle>
            <AlertDescription>{evaluation.coaching}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {result.passed && certificateAwarded && certificateHash && (
            <Button asChild size="sm">
              <Link href={`/certificates/${certificateHash}`}>
                <Award className="mr-2 h-4 w-4" aria-hidden />
                View your certificate
              </Link>
            </Button>
          )}
          {result.passed ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/dialogues">Explore more dialogues</Link>
            </Button>
          ) : (
            <Button onClick={onRetry} variant="secondary" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
              Try a fresh attempt with {personaName}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
