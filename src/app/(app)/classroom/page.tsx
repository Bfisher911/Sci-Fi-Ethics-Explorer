'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, LogIn, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  getTeacherClassrooms,
  getStudentClassrooms,
} from '@/app/actions/classroom';
import type { Classroom } from '@/types';
import Link from 'next/link';

export default function ClassroomPage() {
  const { user } = useAuth();
  const [teacherClassrooms, setTeacherClassrooms] = useState<Classroom[]>([]);
  const [studentClassrooms, setStudentClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    async function fetchClassrooms(): Promise<void> {
      const [teacherResult, studentResult] = await Promise.all([
        getTeacherClassrooms(user!.uid),
        getStudentClassrooms(user!.uid),
      ]);
      if (teacherResult.success) setTeacherClassrooms(teacherResult.data);
      if (studentResult.success) setStudentClassrooms(studentResult.data);
      setLoading(false);
    }
    fetchClassrooms();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const hasClassrooms =
    teacherClassrooms.length > 0 || studentClassrooms.length > 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-2 text-primary font-headline">
            Classrooms
          </h1>
          <p className="text-lg text-muted-foreground">
            Create or join classrooms to learn ethics collaboratively.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button asChild>
              <Link href="/classroom/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Classroom
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/classroom/join">
                <LogIn className="h-4 w-4 mr-2" />
                Join Classroom
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {!hasClassrooms ? (
        <div className="text-center py-16">
          <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-2xl text-muted-foreground">
            You have no classrooms yet.
          </p>
          <p className="text-muted-foreground/80 mt-2">
            Create a classroom as a teacher or join one with a code.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {teacherClassrooms.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Your Classrooms (Teacher)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacherClassrooms.map((c) => (
                  <Link key={c.id} href={`/classroom/${c.id}`}>
                    <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">{c.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {c.studentIds.length} students
                        </Badge>
                        <Badge variant="outline" className="font-mono">
                          {c.joinCode}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {studentClassrooms.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Enrolled Classrooms (Student)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentClassrooms.map((c) => (
                  <Link key={c.id} href={`/classroom/${c.id}`}>
                    <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">{c.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Teacher: {c.teacherName}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
