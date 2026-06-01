'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileBadge,
  ArrowRight,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  Share2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useUserCommunities } from '@/hooks/use-user-communities';
import { useToast } from '@/hooks/use-toast';
import { DownloadReportButton } from '@/components/activity-reports/download-report-button';
import {
  getUserActivityReports,
  submitActivityReportToCommunity,
  emailActivityReportToInstructor,
} from '@/app/actions/activity-reports';
import { activityTypeLabel } from '@/lib/activity-reports/summary';
import type { ActivityReport, Community } from '@/types';

interface ActivityEvidenceListProps {
  compact?: boolean;
  className?: string;
}

/**
 * "Activity Evidence" — the student's badges/reports for individual activities.
 * Distinct from milestone Certificates. Each report can be downloaded as a PDF,
 * submitted to a community for credit, or emailed to an instructor.
 */
export function ActivityEvidenceList({ compact, className }: ActivityEvidenceListProps) {
  const { user } = useAuth();
  const { communities } = useUserCommunities();
  const [reports, setReports] = useState<ActivityReport[] | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    getUserActivityReports(user.uid).then((res) => {
      if (!cancelled) setReports(res.success ? res.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  if (!user) return null;

  if (reports === null) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileBadge className="h-5 w-5 text-primary" /> Activity Evidence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const visible = compact ? reports.slice(0, 4) : reports;
  const submittedCount = reports.filter((r) => r.submittedAt).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileBadge className="h-5 w-5 text-primary" /> Activity Evidence
        </CardTitle>
        <CardDescription>
          Badges &amp; reports for individual activities — download, submit for
          credit, or email to your instructor.
          {reports.length > 0 && ` · ${submittedCount}/${reports.length} submitted`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Finish any activity — a story, quiz, dilemma, debate, or Studio task —
            and your evidence appears here.
          </p>
        ) : (
          visible.map((r) => (
            <EvidenceRow
              key={r.id}
              report={r}
              communities={communities}
              onUpdated={(updated) =>
                setReports((prev) =>
                  (prev ?? []).map((x) => (x.id === updated.id ? updated : x))
                )
              }
            />
          ))
        )}
        {compact && reports.length > visible.length && (
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Link href="/profile">
              View all evidence <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function EvidenceRow({
  report,
  communities,
  onUpdated,
}: {
  report: ActivityReport;
  communities: Community[];
  onUpdated: (r: ActivityReport) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communityId, setCommunityId] = useState(
    communities.length === 1 ? communities[0].id : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailAddr, setEmailAddr] = useState('');
  const [emailing, setEmailing] = useState(false);

  const submitted = !!report.submittedAt;
  const completed =
    report.completedAt instanceof Date ? report.completedAt : new Date(report.completedAt);

  async function handleSubmit() {
    if (!user || !communityId || submitting) return;
    setSubmitting(true);
    const res = await submitActivityReportToCommunity(report.id, user.uid, communityId);
    setSubmitting(false);
    if (res.success) {
      onUpdated(res.data);
      toast({ title: 'Submitted to community' });
    } else {
      toast({ variant: 'destructive', title: 'Could not submit', description: res.error });
    }
  }

  async function handleEmail() {
    if (!user || emailing) return;
    setEmailing(true);
    const res = await emailActivityReportToInstructor(report.id, user.uid, {
      communityId: report.communityId || (communities.length === 1 ? communities[0].id : communityId) || undefined,
      toEmail: emailAddr.trim() || undefined,
    });
    setEmailing(false);
    if (res.success) {
      toast({ title: 'Emailed', description: `Sent to ${res.data.sentTo}.` });
      setEmailOpen(false);
      setEmailAddr('');
    } else {
      toast({ variant: 'destructive', title: 'Could not email', description: res.error });
    }
  }

  return (
    <div className="rounded-md border border-border p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {activityTypeLabel(String(report.activityType))}
            </Badge>
            {typeof report.attemptNumber === 'number' && report.attemptNumber > 1 && (
              <Badge variant="outline" className="text-[10px]">
                Attempt {report.attemptNumber}
              </Badge>
            )}
            {typeof report.score === 'number' && (
              <Badge
                variant="outline"
                className={report.passed === false ? 'text-destructive' : 'text-primary'}
              >
                {report.score}%
              </Badge>
            )}
            {report.voidedAt && (
              <Badge variant="destructive" className="text-[10px]">
                Voided
              </Badge>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-medium">{report.activityTitle}</p>
          <p className="text-xs text-muted-foreground">
            {format(completed, 'PP')}
            {submitted && report.communityName && ` · submitted to ${report.communityName}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-xs">
            <Link href={`/verify/report/${report.verificationHash}`} title="View the full result — decisions, frameworks, reflection">
              <Eye className="mr-1 h-3.5 w-3.5" /> View
            </Link>
          </Button>
          <DownloadReportButton report={report} size="sm" variant="outline" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {submitted ? (
          <span className="flex items-center gap-1 text-xs text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
          </span>
        ) : communities.length === 0 ? (
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Link href="/communities">Join a community to submit</Link>
          </Button>
        ) : (
          <>
            {communities.length > 1 && (
              <Select value={communityId} onValueChange={setCommunityId}>
                <SelectTrigger className="h-7 w-[170px] text-xs">
                  <SelectValue placeholder="Community…" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleSubmit}
              disabled={submitting || !communityId}
            >
              {submitting ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Share2 className="mr-1 h-3 w-3" />
              )}
              Submit
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => setEmailOpen((v) => !v)}
        >
          <Mail className="mr-1 h-3 w-3" /> Email
        </Button>
      </div>

      {emailOpen && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="email"
            value={emailAddr}
            onChange={(e) => setEmailAddr(e.target.value)}
            placeholder={
              report.communityId || communities.length === 1
                ? 'Blank = community instructor'
                : 'instructor@school.edu'
            }
            className="h-7 w-[220px] text-xs"
          />
          <Button size="sm" className="h-7 text-xs" onClick={handleEmail} disabled={emailing}>
            {emailing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
