'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import {
  getAllCertificates,
  revokeCertificate,
} from '@/app/actions/certificates';
import {
  Award,
  ShieldOff,
  BadgeCheck,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import type { Certificate } from '@/types';

export default function AdminCertificatesPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Certificate | null>(null);
  const [reason, setReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    async function load() {
      if (authLoading || adminLoading) return;
      if (!user || !isAdmin) {
        setLoading(false);
        return;
      }
      const res = await getAllCertificates(user.uid);
      if (res.success) setCertificates(res.data);
      setLoading(false);
    }
    load();
  }, [user, isAdmin, authLoading, adminLoading]);

  async function handleRevoke(): Promise<void> {
    if (!target || !user) return;
    setRevoking(true);
    const res = await revokeCertificate(target.id, user.uid, reason || undefined);
    setRevoking(false);
    if (res.success) {
      toast({ title: 'Certificate revoked' });
      // Update local state
      setCertificates((prev) =>
        prev.map((c) =>
          c.id === target.id
            ? {
                ...c,
                revokedAt: new Date(),
                revokedBy: user.uid,
                revokeReason: reason || undefined,
              }
            : c
        )
      );
      setTarget(null);
      setReason('');
    } else {
      toast({
        title: 'Failed to revoke',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  if (authLoading || adminLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm p-10 text-center">
        <ShieldAlert className="h-10 w-10 text-destructive mx-auto mb-2" />
        <p className="text-xl text-muted-foreground">
          Admin access required.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <Card className="mb-6 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold text-primary font-headline">
              Certificates
            </h1>
          </div>
          <p className="text-muted-foreground">
            All certificates issued by the platform. You can revoke any
            certificate found to be invalid.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-primary">
            All certificates ({certificates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No certificates have been issued yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Curriculum</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((c) => {
                  const issuedAt =
                    c.issuedAt instanceof Date
                      ? c.issuedAt
                      : new Date(c.issuedAt);
                  const revoked = Boolean(c.revokedAt);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.userName || (
                          <span className="font-mono text-xs text-muted-foreground">
                            {c.userId.slice(0, 8)}…
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/curriculum/${c.curriculumId}`}
                          className="hover:text-primary"
                        >
                          {c.curriculumTitle || c.curriculumId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {issuedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/verify/${c.verificationHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs hover:text-primary"
                        >
                          {c.verificationHash}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {revoked ? (
                          <Badge variant="destructive">
                            <ShieldOff className="h-3 w-3 mr-1" />
                            Revoked
                          </Badge>
                        ) : (
                          <Badge variant="default">
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!revoked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTarget(c);
                              setReason('');
                            }}
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) {
            setTarget(null);
            setReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke certificate</DialogTitle>
            <DialogDescription>
              {target ? (
                <>
                  Revoke the certificate issued to{' '}
                  <span className="font-medium">{target.userName}</span> for{' '}
                  <span className="font-medium">{target.curriculumTitle}</span>?
                  This will mark the certificate as invalid in public
                  verification.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="revoke-reason">Reason (optional)</Label>
            <Textarea
              id="revoke-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Issued in error"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setTarget(null);
                setReason('');
              }}
              disabled={revoking}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={revoking}
            >
              {revoking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShieldOff className="h-4 w-4 mr-2" />
              )}
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
