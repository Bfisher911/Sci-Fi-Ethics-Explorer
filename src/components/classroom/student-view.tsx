'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, CheckCircle } from 'lucide-react';
import { getCurriculumById } from '@/app/actions/curriculum';
import { getEnrollment } from '@/app/actions/curriculum';
import type { Classroom, CurriculumPath, CurriculumEnrollment } from '@/types';

interface StudentViewProps {
  classroom: Classroom;
  userId: string;
}

export function StudentView({ classroom, userId }: StudentViewProps) {
  const [curriculum, setCurriculum] = useState<CurriculumPath | null>(null);
  const [enrollment, setEnrollment] = useState<CurriculumEnrollment | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      if (classroom.curriculumPathId) {
        const currResult = await getCurriculumById(
          classroom.curriculumPathId
        );
        if (currResult.success && currResult.data) {
          setCurriculum(currResult.data);

          const enrollResult = await getEnrollment(
            classroom.curriculumPathId,
            userId
          );
          if (enrollResult.success && enrollResult.data) {
            setEnrollment(enrollResult.data);
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [classroom.curriculumPathId, userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const totalItems = curriculum
    ? curriculum.modules.reduce((acc, m) => acc + m.items.length, 0)
    : 0;
  const completedCount = enrollment?.completedItemIds?.length || 0;
  const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">{classroom.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Teacher: {classroom.teacherName}
          </p>
        </CardHeader>
        <CardContent>
          {curriculum ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Overall Progress
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {completedCount}/{totalItems} items ({percentage}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>

              {curriculum.modules.map((mod) => {
                const moduleCompleted = mod.items.filter((item) =>
                  enrollment?.completedItemIds?.includes(item.id)
                ).length;
                return (
                  <Card key={mod.id} className="bg-muted/30">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{mod.title}</h3>
                        <Badge variant="outline">
                          {moduleCompleted}/{mod.items.length}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {mod.description}
                      </p>
                      <ul className="space-y-1">
                        {mod.items.map((item) => {
                          const done =
                            enrollment?.completedItemIds?.includes(item.id);
                          return (
                            <li
                              key={item.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle
                                className={`h-4 w-4 ${
                                  done
                                    ? 'text-green-500'
                                    : 'text-muted-foreground/30'
                                }`}
                              />
                              <span
                                className={
                                  done ? 'line-through text-muted-foreground' : ''
                                }
                              >
                                {item.title || item.type}
                              </span>
                              {item.isRequired && (
                                <Badge variant="destructive" className="text-[10px] h-4">
                                  Required
                                </Badge>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No curriculum has been assigned yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
