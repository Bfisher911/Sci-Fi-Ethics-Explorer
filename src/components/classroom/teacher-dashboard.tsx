'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Users, BookOpen } from 'lucide-react';
import { StudentProgressTable } from './student-progress-table';
import { AssignContentDialog } from './assign-content-dialog';
import {
  getClassroomStudentProgress,
  assignCurriculum,
} from '@/app/actions/classroom';
import type { Classroom, StudentProgress } from '@/types';

interface TeacherDashboardProps {
  classroom: Classroom;
  teacherId: string;
}

export function TeacherDashboard({
  classroom,
  teacherId,
}: TeacherDashboardProps) {
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProgress(): Promise<void> {
      const result = await getClassroomStudentProgress(classroom.id);
      if (result.success) {
        setStudentProgress(result.data);
      }
      setLoading(false);
    }
    fetchProgress();
  }, [classroom.id]);

  function handleCopyCode(): void {
    navigator.clipboard.writeText(classroom.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAssignCurriculum(
    curriculumPathId: string
  ): Promise<void> {
    await assignCurriculum(classroom.id, curriculumPathId, teacherId);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Join Code</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {classroom.joinCode}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCopyCode} aria-label="Copy join code">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-500 mt-1">Copied!</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Students</p>
              <p className="text-2xl font-bold">
                {classroom.studentIds.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Curriculum</p>
              {classroom.curriculumPathId ? (
                <Badge variant="secondary">Assigned</Badge>
              ) : (
                <AssignContentDialog onAssign={handleAssignCurriculum} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Student Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : studentProgress.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No students have joined yet. Share the join code to get started.
            </p>
          ) : (
            <StudentProgressTable progress={studentProgress} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
