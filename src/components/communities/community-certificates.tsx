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
import { Award, Crown, Search, Shield, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import {
  getCommunityMemberCertificates,
  type MemberCertificateSummary,
} from '@/app/actions/achievement-certificates';

interface CommunityCertificatesViewProps {
  communityId: string;
  requesterId: string;
}

type StatusFilter = 'all' | 'earned' | 'in-progress';

/**
 * Owner/instructor/admin certificate reporting for a community: which members
 * earned which certificates (including each textbook chapter quiz certificate)
 * and who's close to earning more. Filterable by member, certificate
 * (chapter/quiz), status, and earned date. Access is enforced server-side in
 * getCommunityMemberCertificates; the community itself is the page context.
 */
export function CommunityCertificatesView({
  communityId,
  requesterId,
}: CommunityCertificatesViewProps) {
  const [rows, setRows] = useState<MemberCertificateSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [certFilter, setCertFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError(null);
    getCommunityMemberCertificates(communityId, requesterId)
      .then((res) => {
        if (cancelled) return;
        if (res.success) setRows(res.data);
        else {
          setRows([]);
          setError(res.error);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setRows([]);
        setError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [communityId, requesterId]);

  // Certificate options come from the loaded data (avoids importing the
  // server-side registry into the client bundle).
  const certOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of rows ?? []) {
      for (const e of m.earned) map.set(e.id, e.title);
      for (const p of m.inProgress) map.set(p.id, p.title);
    }
    return [...map.entries()]
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [rows]);

  const dateFromMs = dateFrom ? new Date(dateFrom).getTime() : null;
  const anyFilter =
    certFilter !== 'all' || statusFilter !== 'all' || dateFromMs !== null;

  const displayMembers = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    return rows
      .map((m) => {
        let earned = m.earned;
        let inProgress = m.inProgress;
        if (certFilter !== 'all') {
          earned = earned.filter((e) => e.id === certFilter);
          inProgress = inProgress.filter((p) => p.id === certFilter);
        }
        if (dateFromMs !== null) {
          earned = earned.filter(
            (e) => new Date(e.issuedAt).getTime() >= dateFromMs
          );
        }
        if (statusFilter === 'earned') inProgress = [];
        if (statusFilter === 'in-progress') earned = [];
        return { ...m, earned, inProgress };
      })
      .filter((m) => {
        const matchesName =
          !q ||
          m.name.toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q);
        if (!matchesName) return false;
        if (anyFilter) return m.earned.length > 0 || m.inProgress.length > 0;
        return true;
      });
  }, [rows, search, certFilter, statusFilter, dateFromMs, anyFilter]);

  if (rows === null) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
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
            placeholder="Member…"
            className="h-9 w-44 pl-8"
          />
        </div>

        <Select value={certFilter} onValueChange={setCertFilter}>
          <SelectTrigger className="h-9 w-[220px] text-xs">
            <SelectValue placeholder="All certificates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All certificates</SelectItem>
            {certOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="h-9 w-[140px] text-xs">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="earned">Earned</SelectItem>
            <SelectItem value="in-progress">In progress</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-9 w-[150px] text-xs"
          title="Earned on or after"
          aria-label="Earned on or after"
        />

        {(anyFilter || search) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs"
            onClick={() => {
              setSearch('');
              setCertFilter('all');
              setStatusFilter('all');
              setDateFrom('');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {displayMembers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No members match these filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayMembers.map((m) => (
            <Card key={m.uid} className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {m.role === 'member' ? (
                      <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Crown className="h-4 w-4 shrink-0 text-primary" />
                    )}
                    <span className="truncate font-medium">{m.name}</span>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {m.role}
                    </Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-primary/40 text-primary"
                  >
                    <Award className="mr-1 h-3 w-3" />
                    {m.earned.length} earned
                  </Badge>
                </div>

                {m.earned.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.earned.map((c) => (
                      <Link
                        key={c.id}
                        href={`/certificates/${c.verificationHash}`}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] hover:bg-primary/10"
                        title={`Earned ${format(new Date(c.issuedAt), 'PP')}`}
                      >
                        <Trophy className="h-3 w-3 text-primary" />
                        {c.title.replace(/^Certificate of Completion: /, '').replace(/ Certificate$/, '')}
                      </Link>
                    ))}
                  </div>
                )}

                {m.inProgress.length > 0 && (
                  <div>
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Close to earning
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.inProgress.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {c.title.replace(/^Certificate of Completion: /, '').replace(/ Certificate$/, '')}
                          <span className="font-mono text-foreground/70">
                            {c.current}/{c.target}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
