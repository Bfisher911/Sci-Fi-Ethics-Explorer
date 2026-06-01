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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileBadge,
  Users,
  Share2,
  Mail,
  Link2,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUserCommunities } from '@/hooks/use-user-communities';
import { useToast } from '@/hooks/use-toast';
import { DownloadReportButton } from '@/components/activity-reports/download-report-button';
import {
  generateActivityReport,
  submitActivityReportToCommunity,
  emailActivityReportToInstructor,
} from '@/app/actions/activity-reports';
import { absoluteUrl } from '@/lib/site';
import { badgeLabel, downloadLabel } from '@/lib/activity-reports/summary';
import type { ActivityReport, ActivityReportType } from '@/types';

export interface ActivityEvidenceProps {
  activityType: ActivityReportType;
  activitySubtype?: string;
  activityId: string;
  activityTitle: string;
  score?: number;
  passingThreshold?: number;
  passed?: boolean;
  content?: Record<string, any>;
  heading?: string;
  className?: string;
  /**
   * Per-playthrough token. When set (stories), this evidence record is scoped
   * to one attempt so each replay is its own downloadable record. Omit for
   * idempotent activities (one report per user+activity).
   */
  attemptKey?: string;
}

/**
 * Reusable end-of-activity evidence panel. On mount it generates (idempotently)
 * the activity's badge/report, then lets the student Download a PDF, Submit it
 * to a community, Email it to an instructor, and Copy a verification link.
 * Every completion screen passes standardized data — no per-page report logic.
 */
export function ActivityEvidence({
  activityType,
  activitySubtype,
  activityId,
  activityTitle,
  score,
  passingThreshold,
  passed,
  content,
  heading,
  className,
  attemptKey,
}: ActivityEvidenceProps) {
  const { user } = useAuth();
  const { communities, loading: loadingComms } = useUserCommunities();
  const { toast } = useToast();
  const resolvedHeading = heading ?? badgeLabel(activityType);

  const [report, setReport] = useState<ActivityReport | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [communityId, setCommunityId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailAddr, setEmailAddr] = useState('');
  const [emailing, setEmailing] = useState(false);
  const [copied, setCopied] = useState(false);

  const contentKey = useMemo(() => JSON.stringify(content ?? null), [content]);

  // Generate / update the report when the activity outcome is known. Resolves
  // to a clear error+retry state on failure so it can never hang on
  // "Saving your evidence…".
  useEffect(() => {
    if (!user?.uid || !activityId) return;
    let cancelled = false;
    setSaveError(null);
    generateActivityReport({
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'A student',
      activityType,
      activitySubtype,
      activityId,
      activityTitle,
      score,
      passingThreshold,
      passed,
      content,
      attemptKey,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setReport(res.data);
        } else {
          console.error('[ActivityEvidence] save failed:', res.error);
          setSaveError(res.error || 'Could not save your evidence.');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[ActivityEvidence] save threw:', err);
        setSaveError(String(err));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, activityType, activityId, activityTitle, score, passed, contentKey, retryNonce, attemptKey]);

  useEffect(() => {
    if (communities.length === 1) setCommunityId(communities[0].id);
  }, [communities]);

  if (!user) return null;

  const submitted = !!report?.submittedAt;
  const hasNoCommunity = !loadingComms && communities.length === 0;

  async function handleSubmit() {
    if (!report || !communityId || submitting) return;
    setSubmitting(true);
    const res = await submitActivityReportToCommunity(report.id, user!.uid, communityId);
    setSubmitting(false);
    if (res.success) {
      setReport(res.data);
      toast({ title: 'Submitted to community', description: 'Your instructor can now see this evidence.' });
    } else {
      toast({ variant: 'destructive', title: 'Could not submit', description: res.error });
    }
  }

  async function handleEmail() {
    if (!report || emailing) return;
    setEmailing(true);
    const res = await emailActivityReportToInstructor(report.id, user!.uid, {
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

  function handleCopy() {
    if (!report) return;
    navigator.clipboard?.writeText(absoluteUrl(`/verify/report/${report.verificationHash}`));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileBadge className="h-5 w-5 text-primary" />
          {resolvedHeading}
        </CardTitle>
        <CardDescription>
          Proof of completion you can download, submit for course credit, or send
          to your instructor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!report && saveError ? (
          <div className="space-y-2">
            <p className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              We couldn&apos;t save your evidence. Your progress is still
              recorded — try saving the badge again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetryNonce((n) => n + 1)}
            >
              Retry
            </Button>
          </div>
        ) : !report ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Saving your evidence…
          </div>
        ) : (
          <>
            {/* Report actions */}
            <div className="flex flex-wrap items-center gap-2">
              <DownloadReportButton
                report={report}
                glow
                label={downloadLabel(activityType)}
              />
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <Link2 className="mr-2 h-4 w-4" />
                )}
                {copied ? 'Copied' : 'Copy verification link'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEmailOpen((v) => !v)}>
                <Mail className="mr-2 h-4 w-4" /> Email to instructor
              </Button>
            </div>

            {emailOpen && (
              <div className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-muted/30 p-3">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="evidence-email" className="text-xs">
                    Instructor email
                  </Label>
                  <Input
                    id="evidence-email"
                    type="email"
                    value={emailAddr}
                    onChange={(e) => setEmailAddr(e.target.value)}
                    placeholder={
                      report.communityId || communities.length === 1
                        ? 'Leave blank to use your community instructor'
                        : 'instructor@school.edu'
                    }
                    className="mt-1 h-9"
                  />
                </div>
                <Button size="sm" onClick={handleEmail} disabled={emailing}>
                  {emailing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send
                </Button>
              </div>
            )}

            {/* Submit to community */}
            <div className="rounded-md border border-border p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-primary" /> Submit to a community
              </div>

              {submitted ? (
                <p className="flex items-center gap-1.5 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Submitted{report.communityName ? ` to ${report.communityName}` : ''}.
                </p>
              ) : loadingComms ? (
                <p className="text-sm text-muted-foreground">Loading your communities…</p>
              ) : hasNoCommunity ? (
                <div className="space-y-2">
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    Join or be added to a community before you can submit this for
                    credit.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/communities">Browse communities</Link>
                    </Button>
                    <Button disabled size="sm" className="opacity-60">
                      <Share2 className="mr-2 h-4 w-4" /> Submit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-end gap-2">
                  {communities.length === 1 ? (
                    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      {communities[0].name}
                    </div>
                  ) : (
                    <Select value={communityId} onValueChange={setCommunityId}>
                      <SelectTrigger className="h-9 w-[220px]">
                        <SelectValue placeholder="Choose a community…" />
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
                    onClick={handleSubmit}
                    disabled={submitting || !communityId}
                    className="cta-glow"
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Share2 className="mr-2 h-4 w-4" />
                    )}
                    Submit
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
