'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getClassroom } from '@/app/actions/classroom';
import { TeacherDashboard } from '@/components/classroom/teacher-dashboard';
import { StudentView } from '@/components/classroom/student-view';
import type { Classroom } from '@/types';

export default function ClassroomDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClassroom(): Promise<void> {
      const result = await getClassroom(id);
      if (result.success) {
        setClassroom(result.data);
      }
      setLoading(false);
    }
    fetchClassroom();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">
            Classroom not found.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/classroom">Back to Classrooms</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isTeacher = user?.uid === classroom.teacherId;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/classroom">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classrooms
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-primary font-headline mb-6">
        {classroom.name}
      </h1>

      {isTeacher ? (
        <TeacherDashboard classroom={classroom} teacherId={user!.uid} />
      ) : (
        <StudentView classroom={classroom} userId={user?.uid || ''} />
      )}
    </div>
  );
}
