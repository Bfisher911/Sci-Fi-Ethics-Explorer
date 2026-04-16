'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  FileText,
  FlaskConical,
  GitCompare,
  Scale,
  BookOpen,
  ExternalLink,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import {
  getMemberContributions,
  type MemberContributionItem,
  type MemberContributionsReport,
} from '@/app/actions/community-gradebook';

interface MemberContributionsDialogProps {
  communityId: string;
  requesterId: string;
  memberId: string;
  memberName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_META: Record<
  string,
  { icon: typeof Brain; label: string; color: string }
> = {
  analysis: {
    icon: FlaskConical,
    label: 'Scenario Analysis',
    color: 'text-chart-3',
  },
  perspective_comparison: {
    icon: GitCompare,
    label: 'Perspective Comparison',
    color: 'text-chart-4',
  },
  dilemma: { icon: FileText, label: 'Dilemma', color: 'text-accent' },
  debate: { icon: Scale, label: 'Debate', color: 'text-chart-2' },
  story: { icon: BookOpen, label: 'Story', color: 'text-primary' },
  quiz_result: { icon: Brain, label: 'Quiz Result', color: 'text-primary' },
  'submitted-dilemma': {
    icon: FileText,
    label: 'Submitted Dilemma',
    color: 'text-accent',
  },
  'quiz-attempt': { icon: Brain, label: 'Quiz Attempt', color: 'text-primary' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Slide-in dialog showing every contribution a single community member
 * has made: scenario analyses, perspective comparisons, dilemmas,
 * debates, stories, and quiz attempts.
 */
export function MemberContributionsDialog({
  communityId,
  requesterId,
  memberId,
  memberName,
  open,
  onOpenChange,
}: MemberContributionsDialogProps) {
  const [report, setReport] = useState<MemberContributionsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMemberContributions(communityId, memberId, requesterId).then((res) => {
      if (cancelled) return;
      if (res.success) setReport(res.data);
      else setError(res.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, communityId, memberId, requesterId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{memberName}</span>
            {report && (
              <Badge variant="outline" className="text-xs">
                {report.totalCount} contribution
                {report.totalCount === 1 ? '' : 's'}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {report
              ? `Everything ${memberName} has contributed inside this community, plus their recent quiz attempts.`
              : 'Loading member activity…'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !report || report.items.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Inbox className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                No contributions yet for this member.
              </p>
            </div>
          ) : (
            <>
              {/* Type summary */}
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(report.byType).map(([type, count]) => {
                  const meta = TYPE_META[type] || {
                    icon: FileText,
                    label: type,
                    color: 'text-muted-foreground',
                  };
                  const Icon = meta.icon;
                  return (
                    <Badge
                      key={type}
                      variant="outline"
                      className="text-xs flex items-center gap-1"
                    >
                      <Icon className={`h-3 w-3 ${meta.color}`} />
                      {meta.label}: {count}
                    </Badge>
                  );
                })}
              </div>

              <ScrollArea className="h-[55vh] pr-4">
                <ul className="space-y-2">
                  {report.items.map((item) => (
                    <ContributionRow key={`${item.type}-${item.id}`} item={item} />
                  ))}
                </ul>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContributionRow({ item }: { item: MemberContributionItem }) {
  const meta = TYPE_META[item.type] || {
    icon: FileText,
    label: item.type,
    color: 'text-muted-foreground',
  };
  const Icon = meta.icon;
  const body = (
    <div className="flex items-start gap-3 p-3 rounded-md border border-border bg-background/30 hover:border-primary/40 hover:bg-primary/5 transition-colors">
      <div className={`shrink-0 mt-0.5 ${meta.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <Badge
            variant="secondary"
            className="text-[10px] uppercase tracking-wider"
          >
            {meta.label}
          </Badge>
          {item.badge && (
            <Badge variant="outline" className="text-[10px]">
              {item.badge}
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatDate(item.createdAt)}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground truncate">
          {item.title}
        </p>
        {item.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {item.summary}
          </p>
        )}
      </div>
      {item.href && (
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-1" />
      )}
    </div>
  );
  if (item.href) {
    return (
      <li>
        <Link href={item.href} className="block">
          {body}
        </Link>
      </li>
    );
  }
  return <li>{body}</li>;
}
