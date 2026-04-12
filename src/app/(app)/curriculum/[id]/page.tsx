'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Loader2, CheckCircle } from 'lucide-react';
import {
  getCurriculumById,
  getEnrollment,
  enrollInCurriculum,
  updateEnrollmentProgress,
} from '@/app/actions/curriculum';
import { ModuleProgress } from '@/components/curriculum/module-progress';
import { useAuth } from '@/hooks/use-auth';
import type { CurriculumPath, CurriculumEnrollment } from '@/types';

export default function CurriculumDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [curriculum, setCurriculum] = useState<CurriculumPath | null>(null);
  const [enrollment, setEnrollment] = useState<CurriculumEnrollment | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const result = await getCurriculumById(id);
      if (result.success && result.data) {
        setCurriculum(result.data);

        if (user) {
          const enrollResult = await getEnrollment(id, user.uid);
          if (enrollResult.success && enrollResult.data) {
            setEnrollment(enrollResult.data);
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [id, user]);

  async function handleEnroll(): Promise<void> {
    if (!user) return;
    setEnrolling(true);
    const result = await enrollInCurriculum(id, user.uid);
    if (result.success) {
      setEnrollment({
        userId: user.uid,
        curriculumId: id,
        completedItemIds: [],
        enrolledAt: new Date(),
      });
    }
    setEnrolling(false);
  }

  async function handleToggleItem(itemId: string): Promise<void> {
    if (!user || !enrollment) return;
    if (enrollment.completedItemIds.includes(itemId)) return;

    await updateEnrollmentProgress(id, user.uid, itemId);
    setEnrollment({
      ...enrollment,
      completedItemIds: [...enrollment.completedItemIds, itemId],
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <p className="text-2xl text-muted-foreground">
            Curriculum not found.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0 space-y-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary font-headline">
                {curriculum.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {curriculum.description}
              </p>
              {curriculum.creatorName && (
                <p className="text-sm text-muted-foreground mt-2">
                  Created by {curriculum.creatorName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {curriculum.enrollmentCount || 0} enrolled
              </Badge>
              {!enrollment && (
                <Button onClick={handleEnroll} disabled={enrolling || !user}>
                  {enrolling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Enroll
                </Button>
              )}
              {enrollment && (
                <Badge variant="secondary">Enrolled</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {curriculum.modules.map((mod) => (
        <Card key={mod.id} className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">{mod.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{mod.description}</p>
            {enrollment && (
              <ModuleProgress
                module={mod}
                completedItemIds={enrollment.completedItemIds}
              />
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {mod.items.map((item) => {
              const isCompleted = enrollment?.completedItemIds?.includes(
                item.id
              );
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded bg-muted/30"
                >
                  {enrollment ? (
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => handleToggleItem(item.id)}
                      disabled={isCompleted}
                    />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-muted-foreground/30" />
                  )}
                  <div className="flex-1">
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {item.title || item.type}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.type}
                  </Badge>
                  {item.isRequired && (
                    <Badge variant="destructive" className="text-[10px] h-4">
                      Required
                    </Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
