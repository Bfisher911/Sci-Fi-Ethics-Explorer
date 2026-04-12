'use client';

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
import { Check, X } from 'lucide-react';

interface PendingDilemmaListProps {
  dilemmas: SubmittedDilemma[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

/**
 * Table component for displaying pending dilemmas with approve/reject actions.
 */
export function PendingDilemmaList({
  dilemmas,
  onApprove,
  onReject,
}: PendingDilemmaListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Theme</TableHead>
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
              <TableCell className="text-muted-foreground text-sm">
                {dilemma.submittedAt
                  ? new Date(dilemma.submittedAt).toLocaleDateString()
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
                    onClick={() => dilemma.id && onReject(dilemma.id)}
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
  );
}
