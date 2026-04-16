'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ScrollArea,
  ScrollBar,
} from '@/components/ui/scroll-area';
import {
  ClipboardList,
  Search,
  Eye,
  GraduationCap,
  AlertCircle,
  Inbox,
  Trophy,
  Download,
} from 'lucide-react';
import {
  getCommunityGradebook,
  type CommunityGradebook,
  type GradebookRow,
} from '@/app/actions/community-gradebook';
import { MemberContributionsDialog } from './member-contributions-dialog';
import { cn } from '@/lib/utils';

interface CommunityGradebookViewProps {
  communityId: string;
  requesterId: string;
}

function gradeColor(score?: number): string {
  if (score === undefined) return 'text-muted-foreground/60';
  if (score >= 90) return 'text-green-400';
  if (score >= 75) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-destructive';
}

/**
 * Convert the gradebook rows into a CSV string for download. Columns
 * are: name, email, role, average, passed/N, contributions, then one
 * column per quiz item.
 */
function rowsToCsv(g: CommunityGradebook): string {
  const headers = [
    'Name',
    'Email',
    'Role',
    'Average %',
    `Passed (of ${g.columns.length})`,
    'Contributions',
    ...g.columns.map((c) => c.title),
  ];
  const lines = [headers.map(csvEscape).join(',')];
  for (const r of g.rows) {
    const cells = [
      r.displayName,
      r.email,
      r.role,
      r.averagePercent === undefined ? '' : String(r.averagePercent),
      String(r.passedCount),
      String(r.contributionCount),
      ...g.columns.map((c) => {
        const v = r.scores[c.itemId]?.scorePercent;
        return v === undefined ? '' : String(v);
      }),
    ];
    lines.push(cells.map(csvEscape).join(','));
  }
  return lines.join('\n');
}

function csvEscape(value: string | number): string {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function downloadCsv(name: string, body: string): void {
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Canvas-style gradebook for a community. Owner / instructor only.
 * Rows = members, columns = quiz items defined by the linked learning
 * path. Click a row to open that member's full contribution log.
 */
export function CommunityGradebookView({
  communityId,
  requesterId,
}: CommunityGradebookViewProps) {
  const [data, setData] = useState<CommunityGradebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMember, setOpenMember] = useState<GradebookRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCommunityGradebook(communityId, requesterId).then((res) => {
      if (cancelled) return;
      if (res.success) setData(res.data);
      else setError(res.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [communityId, requesterId]);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return data.rows;
    return data.rows.filter(
      (r) =>
        r.displayName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  if (loading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const noCurriculum = data.columns.length === 0;

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Gradebook
            </CardTitle>
            <CardDescription className="mt-1">
              {data.curriculumTitle ? (
                <>
                  Aligned to{' '}
                  <Link
                    href={`/curriculum/${data.curriculumId}`}
                    className="text-primary hover:underline"
                  >
                    {data.curriculumTitle}
                  </Link>{' '}
                  · {data.rows.length} member{data.rows.length === 1 ? '' : 's'} ·{' '}
                  {data.columns.length} quiz item{data.columns.length === 1 ? '' : 's'}
                </>
              ) : (
                'No learning path is linked to this community yet.'
              )}
            </CardDescription>
          </div>
          {!noCurriculum && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCsv(`gradebook-${data.community.id}`, rowsToCsv(data))}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export CSV
            </Button>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by name or email…"
            className="pl-9 bg-background/60"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {noCurriculum ? (
          <div className="text-center py-12 px-6 space-y-3">
            <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Link a learning path to this community to start grading. The
              quizzes inside that path become the gradebook columns.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/communities/${communityId}`}>
                Manage community settings
              </Link>
            </Button>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Inbox className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              No members match your filter.
            </p>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card/95 backdrop-blur z-10 min-w-[180px]">
                    Member
                  </TableHead>
                  <TableHead className="text-center w-[80px]">Avg.</TableHead>
                  <TableHead className="text-center w-[80px]">Passed</TableHead>
                  <TableHead className="text-center w-[110px]">Submissions</TableHead>
                  {data.columns.map((c) => (
                    <TableHead
                      key={c.itemId}
                      className="text-center text-[11px] uppercase tracking-wider whitespace-nowrap"
                      title={c.title}
                    >
                      {c.title.replace(/^Quiz:\s*/i, '')}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((r) => (
                  <TableRow key={r.uid} className="group hover:bg-primary/5">
                    <TableCell className="sticky left-0 bg-card/95 backdrop-blur z-10">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {r.displayName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {r.email || '—'}
                        </span>
                      </div>
                      {r.role === 'instructor' && (
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          Instructor
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn('font-mono text-sm', gradeColor(r.averagePercent))}>
                        {r.averagePercent === undefined ? '—' : `${r.averagePercent}%`}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={r.passedCount > 0 ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        <Trophy className="h-3 w-3 mr-1" />
                        {r.passedCount}/{data.columns.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {r.contributionCount}
                    </TableCell>
                    {data.columns.map((c) => {
                      const cell = r.scores[c.itemId];
                      return (
                        <TableCell key={c.itemId} className="text-center">
                          {cell?.scorePercent === undefined ? (
                            <span className="text-muted-foreground/40">—</span>
                          ) : (
                            <span
                              className={cn(
                                'font-mono text-sm font-medium',
                                gradeColor(cell.scorePercent)
                              )}
                              title={
                                cell.completedAt
                                  ? `Best attempt ${new Date(cell.completedAt).toLocaleDateString()}`
                                  : undefined
                              }
                            >
                              {cell.scorePercent}%
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setOpenMember(r)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>

      {openMember && (
        <MemberContributionsDialog
          communityId={communityId}
          requesterId={requesterId}
          memberId={openMember.uid}
          memberName={openMember.displayName}
          open={!!openMember}
          onOpenChange={(open) => {
            if (!open) setOpenMember(null);
          }}
        />
      )}
    </Card>
  );
}
