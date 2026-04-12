'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { StudentProgress } from '@/types';

interface StudentProgressTableProps {
  progress: StudentProgress[];
}

export function StudentProgressTable({ progress }: StudentProgressTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Items Completed</TableHead>
          <TableHead>Quizzes Taken</TableHead>
          <TableHead>Last Activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {progress.map((sp) => (
          <TableRow key={sp.studentId}>
            <TableCell className="font-medium">
              {sp.studentName || sp.studentId}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {sp.completedItems?.length || 0}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {Object.keys(sp.quizScores || {}).length}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {sp.lastActivity
                ? new Date(sp.lastActivity).toLocaleDateString()
                : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
