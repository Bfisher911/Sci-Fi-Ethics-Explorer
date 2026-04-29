'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { fetchAuditLog } from '@/app/actions/audit';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  History,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import type { AuditAction, AuditLogEntry } from '@/types';

const ACTION_STYLES: Record<AuditAction | 'default', string> = {
  visibility_change: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  moderation_change: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  feature_toggle: 'bg-primary/15 text-primary border-primary/30',
  tag_edit: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  delete: 'bg-red-500/15 text-red-300 border-red-500/30',
  restore_version: 'bg-green-500/15 text-green-300 border-green-500/30',
  admin_grant: 'bg-accent/15 text-accent-foreground border-accent/30',
  admin_revoke: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  impersonation_start: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  impersonation_stop: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  default: 'bg-muted text-muted-foreground border-border',
};

const ALL_ACTIONS: AuditAction[] = [
  'visibility_change',
  'moderation_change',
  'feature_toggle',
  'tag_edit',
  'delete',
  'restore_version',
  'admin_grant',
  'admin_revoke',
];

function actionClass(action: string): string {
  return (
    (ACTION_STYLES as Record<string, string>)[action] || ACTION_STYLES.default
  );
}

function formatDateTime(value: any): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function summarize(obj?: Record<string, any> | null): string {
  if (!obj || Object.keys(obj).length === 0) return '—';
  return Object.entries(obj)
    .map(([k, v]) => {
      if (v == null) return `${k}: ∅`;
      if (Array.isArray(v)) return `${k}: [${v.join(', ')}]`;
      if (typeof v === 'object') return `${k}: {…}`;
      return `${k}: ${String(v)}`;
    })
    .join(' · ');
}

export default function AdminAuditLogPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionFilter, setActionFilter] = useState<string>('all');
  const [actorFilter, setActorFilter] = useState<string>('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const res = await fetchAuditLog(user.uid, { limit: 200 });
    if (res.success) {
      setEntries(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAdmin && user) load();
  }, [isAdmin, user, load]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (actionFilter !== 'all' && e.action !== actionFilter) return false;
      if (
        actorFilter.trim() &&
        !(
          (e.actorName || '')
            .toLowerCase()
            .includes(actorFilter.toLowerCase()) ||
          e.actorId.toLowerCase().includes(actorFilter.toLowerCase())
        )
      ) {
        return false;
      }
      return true;
    });
  }, [entries, actionFilter, actorFilter]);

  if (adminLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-lg mx-auto mt-10 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" /> Access denied
          </CardTitle>
          <CardDescription>
            You need admin privileges to view the audit log.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <History className="h-6 w-6" />
            Audit Log
          </CardTitle>
          <CardDescription>
            Every privileged admin action is recorded here.
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Could not load audit log</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6 flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="filter-action">Action</Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger id="filter-action" className="w-56">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {ALL_ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-48">
            <Label htmlFor="filter-actor">Actor</Label>
            <Input
              id="filter-actor"
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              placeholder="Filter by actor name or UID"
            />
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No audit entries match these filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(e.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {e.actorName || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {e.actorId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={actionClass(e.action)}
                      >
                        {e.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{e.targetType}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {e.targetId}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>
                        <span className="text-muted-foreground">before: </span>
                        {summarize(e.before)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">after: </span>
                        {summarize(e.after)}
                      </div>
                      {e.note && (
                        <div className="text-muted-foreground italic mt-1">
                          note: {e.note}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
