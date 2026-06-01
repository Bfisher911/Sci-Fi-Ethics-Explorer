'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Search, ShieldOff, Undo2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  getCommunitySubmittedReports,
  voidActivityReport,
  restoreActivityReport,
} from '@/app/actions/activity-reports';
import { activityTypeLabel } from '@/lib/activity-reports/summary';
import type { ActivityReport } from '@/types';

interface CommunityReportsViewProps {
  communityId: string;
  requesterId: string;
}

type PassFilter = 'all' | 'passed' | 'failed';
type StatusFilter = 'all' | 'active' | 'voided';

/**
 * Owner/instructor/admin view of activity reports (badges) students have
 * submitted to this community. Filter by student / activity type / title /
 * date / pass-fail / voided status, open each in detail, and void/restore
 * reports created in error. Access is enforced server-side.
 */
export function CommunityReportsView({ communityId, requesterId }: CommunityReportsViewProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<ActivityReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [passFilter, setPassFilter] = useState<PassFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setRows(null);
    setError(null);
    getCommunitySubmittedReports(communityId, requesterId)
      .then((res) => {
        if (res.success) setRows(res.data);
        else {
          setRows([]);
          setError(res.error);
        }
      })
      .catch((e) => {
        setRows([]);
        setError(String(e));
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, requesterId]);

  const typeOptions = useMemo(() => {
    const set = new Set((rows ?? []).map((r) => String(r.activityType)));
    return [...set].sort();
  }, [rows]);

  const dateFromMs = dateFrom ? new Date(dateFrom).getTime() : null;

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.userName.toLowerCase().includes(q) && !r.activityTitle.toLowerCase().includes(q))
        return false;
      if (typeFilter !== 'all' && String(r.activityType) !== typeFilter) return false;
      if (passFilter === 'passed' && r.passed !== true) return false;
      if (passFilter === 'failed' && r.passed !== false) return false;
      if (statusFilter === 'voided' && !r.voidedAt) return false;
      if (statusFilter === 'active' && r.voidedAt) return false;
      if (dateFromMs !== null) {
        const t = r.submittedAt instanceof Date ? r.submittedAt.getTime() : 0;
        if (t < dateFromMs) return false;
      }
      return true;
    });
  }, [rows, search, typeFilter, passFilter, statusFilter, dateFromMs]);

  async function handleVoid(r: ActivityReport) {
    setBusyId(r.id);
    const res = await voidActivityReport(r.id, requesterId, 'Voided by instructor');
    setBusyId(null);
    if (res.success) {
      toast({ title: 'Report voided' });
      load();
    } else {
      toast({ variant: 'destructive', title: 'Could not void', description: res.error });
    }
  }

  async function handleRestore(r: ActivityReport) {
    setBusyId(r.id);
    const res = await restoreActivityReport(r.id, requesterId);
    setBusyId(null);
    if (res.success) {
      toast({ title: 'Report restored' });
      load();
    } else {
      toast({ variant: 'destructive', title: 'Could not restore', description: res.error });
    }
  }

  if (rows === null) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Student or activity…"
            className="h-9 w-52 pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[160px] text-xs">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {typeOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {activityTypeLabel(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={passFilter} onValueChange={(v) => setPassFilter(v as PassFilter)}>
          <SelectTrigger className="h-9 w-[130px] text-xs">
            <SelectValue placeholder="Pass/fail" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Pass &amp; fail</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="h-9 w-[120px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-9 w-[150px] text-xs"
          aria-label="Submitted on or after"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No submitted reports match these filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const submitted =
              r.submittedAt instanceof Date ? r.submittedAt : new Date(r.submittedAt);
            const voided = !!r.voidedAt;
            return (
              <Card key={r.id} className={voided ? 'opacity-70' : undefined}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{r.userName}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {activityTypeLabel(String(r.activityType))}
                      </Badge>
                      {typeof r.score === 'number' && (
                        <Badge
                          variant="outline"
                          className={r.passed === false ? 'text-destructive' : 'text-primary'}
                        >
                          {r.score}%{r.passed === true ? ' · pass' : r.passed === false ? ' · fail' : ''}
                        </Badge>
                      )}
                      {voided && (
                        <Badge variant="destructive" className="text-[10px]">
                          Voided
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {r.activityTitle} · submitted {format(submitted, 'PP')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                      <Link href={`/verify/report/${r.verificationHash}`} target="_blank">
                        <ExternalLink className="mr-1 h-3 w-3" /> View
                      </Link>
                    </Button>
                    {voided ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={busyId === r.id}
                        onClick={() => handleRestore(r)}
                      >
                        <Undo2 className="mr-1 h-3 w-3" /> Restore
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        disabled={busyId === r.id}
                        onClick={() => handleVoid(r)}
                      >
                        <ShieldOff className="mr-1 h-3 w-3" /> Void
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
