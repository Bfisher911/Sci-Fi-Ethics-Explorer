'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Brain,
  Sparkles,
  Loader2,
  Trash2,
  Eye,
  GraduationCap,
  RefreshCw,
  Wand2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getAllQuizzes, listMissingQuizSubjects } from '@/app/actions/quizzes';
import {
  generateQuizForSubject,
  deleteQuiz,
} from '@/app/actions/quiz-generation';
import type { Quiz, QuizSubjectType } from '@/types';

type MissingSubjects = {
  philosophers: { id: string; name: string }[];
  theories: { id: string; name: string }[];
};

type BulkState = {
  running: boolean;
  total: number;
  done: number;
  current: string | null;
  errors: string[];
};

const INITIAL_BULK: BulkState = {
  running: false,
  total: 0,
  done: 0,
  current: null,
  errors: [],
};

export default function AdminQuizzesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [missing, setMissing] = useState<MissingSubjects>({
    philosophers: [],
    theories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<BulkState>(INITIAL_BULK);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const [quizRes, missRes] = await Promise.all([
      getAllQuizzes(),
      listMissingQuizSubjects(user.uid),
    ]);
    if (quizRes.success) {
      setQuizzes(
        [...quizRes.data].sort((a, b) =>
          a.subjectName.localeCompare(b.subjectName)
        )
      );
    } else {
      setError(quizRes.error);
    }
    if (missRes.success) {
      setMissing(missRes.data);
    } else {
      setError(missRes.error);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markKey = (type: QuizSubjectType, id: string) => `${type}:${id}`;

  const runGenerate = async (
    type: QuizSubjectType,
    id: string,
    name: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Not signed in' };
    const key = markKey(type, id);
    setGeneratingIds((prev) => new Set(prev).add(key));
    try {
      const res = await generateQuizForSubject(type, id, user.uid);
      if (res.success) {
        return { ok: true };
      }
      return { ok: false, error: res.error };
    } catch (e: any) {
      return { ok: false, error: e?.message || String(e) };
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleGenerateOne = async (
    type: QuizSubjectType,
    id: string,
    name: string
  ) => {
    toast({
      title: 'Generating quiz',
      description: `Writing a quiz for ${name}. This takes ~10 seconds.`,
    });
    const res = await runGenerate(type, id, name);
    if (res.ok) {
      toast({
        title: 'Quiz generated',
        description: `${name} is ready.`,
      });
      refresh();
    } else {
      toast({
        title: 'Generation failed',
        description: res.error,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (quiz: Quiz) => {
    if (!user) return;
    if (
      !confirm(
        `Delete the quiz for "${quiz.subjectName}"? This can be re-generated.`
      )
    )
      return;
    setDeletingIds((prev) => new Set(prev).add(quiz.id));
    const res = await deleteQuiz(quiz.id, user.uid);
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(quiz.id);
      return next;
    });
    if (res.success) {
      toast({
        title: 'Quiz deleted',
        description: `${quiz.subjectName} removed.`,
      });
      refresh();
    } else {
      toast({
        title: 'Delete failed',
        description: res.error,
        variant: 'destructive',
      });
    }
  };

  /** Run `targets` sequentially through the AI generator. */
  const runBulk = async (
    targets: { type: QuizSubjectType; id: string; name: string }[],
    label: string
  ) => {
    if (targets.length === 0) {
      toast({
        title: 'Nothing to generate',
        description: 'No missing subjects found.',
      });
      return;
    }
    setBulk({
      running: true,
      total: targets.length,
      done: 0,
      current: null,
      errors: [],
    });
    toast({
      title: `Starting ${label}`,
      description: `Generating ${targets.length} quiz${
        targets.length === 1 ? '' : 'zes'
      } sequentially.`,
    });

    const errors: string[] = [];
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      setBulk((prev) => ({ ...prev, current: t.name, done: i }));
      const res = await runGenerate(t.type, t.id, t.name);
      if (!res.ok) {
        errors.push(`${t.name}: ${res.error ?? 'unknown error'}`);
      }
    }
    setBulk({
      running: false,
      total: targets.length,
      done: targets.length,
      current: null,
      errors,
    });
    toast({
      title: 'Bulk generation complete',
      description:
        errors.length === 0
          ? `All ${targets.length} quizzes generated.`
          : `${targets.length - errors.length} succeeded, ${errors.length} failed.`,
      variant: errors.length === 0 ? 'default' : 'destructive',
    });
    refresh();
  };

  const handleBulkMissing = () => {
    const targets = [
      ...missing.philosophers.map((p) => ({
        type: 'philosopher' as const,
        id: p.id,
        name: p.name,
      })),
      ...missing.theories.map((t) => ({
        type: 'theory' as const,
        id: t.id,
        name: t.name,
      })),
    ];
    runBulk(targets, 'Generate All Missing');
  };

  const handleBulkAll = () => {
    // Includes existing quizzes (overwrite) plus missing. Safe because upsert is deterministic.
    const existingTargets = quizzes.map((q) => ({
      type: q.subjectType,
      id: q.subjectId,
      name: q.subjectName,
    }));
    const missingTargets = [
      ...missing.philosophers.map((p) => ({
        type: 'philosopher' as const,
        id: p.id,
        name: p.name,
      })),
      ...missing.theories.map((t) => ({
        type: 'theory' as const,
        id: t.id,
        name: t.name,
      })),
    ];
    if (
      !confirm(
        `Regenerate ALL ${existingTargets.length + missingTargets.length} philosopher and theory quizzes? Existing quizzes will be overwritten. This will take several minutes.`
      )
    )
      return;
    runBulk(
      [...existingTargets, ...missingTargets],
      'Generate ALL quizzes'
    );
  };

  const totalMissing =
    missing.philosophers.length + missing.theories.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold font-headline text-primary">
                  Quiz Library
                </h1>
                <p className="text-sm text-muted-foreground">
                  {quizzes.length} quiz{quizzes.length === 1 ? '' : 'zes'} published ·{' '}
                  {totalMissing} subject{totalMissing === 1 ? '' : 's'} missing a quiz
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={refresh} disabled={bulk.running}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Bulk generator */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Generate Missing Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleBulkMissing}
              disabled={bulk.running || totalMissing === 0}
              className="flex-1"
            >
              {bulk.running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate All Missing ({totalMissing})
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleBulkAll}
              disabled={bulk.running}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Regenerate ALL ({quizzes.length + totalMissing})
            </Button>
          </div>

          {bulk.running && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {bulk.current
                    ? `Generating: ${bulk.current}`
                    : 'Preparing…'}
                </span>
                <span>
                  {bulk.done} / {bulk.total}
                </span>
              </div>
              <Progress
                value={(bulk.done / Math.max(bulk.total, 1)) * 100}
              />
            </div>
          )}

          {!bulk.running && bulk.total > 0 && bulk.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {bulk.errors.length} error
                {bulk.errors.length === 1 ? '' : 's'} during last run
              </AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 text-xs mt-1 space-y-0.5">
                  {bulk.errors.slice(0, 5).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                  {bulk.errors.length > 5 && (
                    <li>…and {bulk.errors.length - 5} more</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MissingList
              title="Philosophers without quizzes"
              items={missing.philosophers}
              type="philosopher"
              generatingIds={generatingIds}
              onGenerate={(id, name) =>
                handleGenerateOne('philosopher', id, name)
              }
              disabled={bulk.running}
            />
            <MissingList
              title="Theories without quizzes"
              items={missing.theories}
              type="theory"
              generatingIds={generatingIds}
              onGenerate={(id, name) => handleGenerateOne('theory', id, name)}
              disabled={bulk.running}
            />
          </div>
        </CardContent>
      </Card>

      {/* Existing quiz library */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Existing Quizzes ({quizzes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No quizzes yet. Use the generator above to create one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Pass</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((q) => {
                    const viewHref =
                      q.subjectType === 'philosopher'
                        ? `/philosophers/${q.subjectId}/quiz`
                        : `/glossary/${q.subjectId}/quiz`;
                    const key = markKey(q.subjectType, q.subjectId);
                    const regenerating = generatingIds.has(key);
                    const deleting = deletingIds.has(q.id);
                    return (
                      <TableRow key={q.id}>
                        <TableCell>
                          <div className="font-medium">{q.subjectName}</div>
                          <div className="text-xs text-muted-foreground">
                            {q.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="capitalize text-xs"
                          >
                            {q.subjectType}
                          </Badge>
                        </TableCell>
                        <TableCell>{q.questions.length}</TableCell>
                        <TableCell>{q.passingScorePercent}%</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            title="View quiz"
                          >
                            <Link href={viewHref}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Regenerate quiz"
                            disabled={regenerating || bulk.running}
                            onClick={() =>
                              handleGenerateOne(
                                q.subjectType,
                                q.subjectId,
                                q.subjectName
                              )
                            }
                          >
                            {regenerating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete quiz"
                            disabled={deleting || bulk.running}
                            onClick={() => handleDelete(q)}
                            className="text-destructive hover:text-destructive"
                          >
                            {deleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MissingListProps {
  title: string;
  items: { id: string; name: string }[];
  type: QuizSubjectType;
  generatingIds: Set<string>;
  onGenerate: (id: string, name: string) => void;
  disabled: boolean;
}

function MissingList({
  title,
  items,
  type,
  generatingIds,
  onGenerate,
  disabled,
}: MissingListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-4">
          All covered.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => {
            const key = `${type}:${item.id}`;
            const busy = generatingIds.has(key);
            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="font-medium">{item.name}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || disabled}
                  onClick={() => onGenerate(item.id, item.name)}
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
