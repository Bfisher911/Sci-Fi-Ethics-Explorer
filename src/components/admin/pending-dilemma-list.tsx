'use client';

import { useState } from 'react';
import type { SubmittedDilemma } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, Loader2, Users } from 'lucide-react';

interface PendingDilemmaListProps {
  dilemmas: SubmittedDilemma[];
  onApprove: (id: string) => Promise<void> | void;
  onReject: (id: string, reason?: string) => Promise<void> | void;
}

/**
 * Table component for displaying pending dilemmas with approve/reject actions.
 * The reject action opens a dialog that prompts for an optional rejection reason.
 */
export function PendingDilemmaList({
  dilemmas,
  onApprove,
  onReject,
}: PendingDilemmaListProps) {
  const [rejectTarget, setRejectTarget] = useState<SubmittedDilemma | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const openRejectDialog = (dilemma: SubmittedDilemma) => {
    setRejectTarget(dilemma);
    setRejectReason('');
  };

  const closeRejectDialog = () => {
    if (submittingReject) return;
    setRejectTarget(null);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget?.id) return;
    setSubmittingReject(true);
    try {
      await onReject(rejectTarget.id, rejectReason.trim() || undefined);
      setRejectTarget(null);
      setRejectReason('');
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dilemmas.map((dilemma) => (
              <TableRow key={dilemma.id}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {dilemma.title}
                </TableCell>
                <TableCell>{dilemma.authorName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{dilemma.theme}</Badge>
                </TableCell>
                <TableCell>
                  {dilemma.communityName ? (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-fit"
                    >
                      <Users className="h-3 w-3" />
                      {dilemma.communityName}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Platform-wide
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {dilemma.submittedAt
                    ? new Date(
                        typeof dilemma.submittedAt === 'object' &&
                        dilemma.submittedAt?.toDate
                          ? dilemma.submittedAt.toDate()
                          : dilemma.submittedAt
                      ).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{dilemma.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-500 border-green-500/50 hover:bg-green-500/10"
                      onClick={() => dilemma.id && onApprove(dilemma.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                      onClick={() => dilemma.id && openRejectDialog(dilemma)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) closeRejectDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Dilemma</DialogTitle>
            <DialogDescription>
              {rejectTarget
                ? `You are about to reject "${rejectTarget.title}". You can optionally provide a reason that will be shared with the author.`
                : 'Provide an optional rejection reason.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rejection-reason">
              Rejection reason (optional)
            </Label>
            <Textarea
              id="rejection-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why is this dilemma being rejected?"
              rows={4}
              disabled={submittingReject}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeRejectDialog}
              disabled={submittingReject}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={submittingReject}
            >
              {submittingReject ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Confirm Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
