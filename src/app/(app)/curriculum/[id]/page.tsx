'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Users,
  Loader2,
  CheckCircle,
  Lock,
  BookOpen,
  Brain,
  Scale,
  FlaskConical,
  GitCompare,
  BarChart3,
  Award,
} from 'lucide-react';
import {
  getCurriculumById,
  getEnrollment,
  enrollInCurriculum,
  updateEnrollmentProgress,
} from '@/app/actions/curriculum';
import { issueCertificate, getUserCertificates } from '@/app/actions/certificates';
import { ModuleProgress } from '@/components/curriculum/module-progress';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile } from '@/app/actions/user';
import { displayAuthorName } from '@/lib/official-author';
import type {
  Certificate,
  CurriculumPath,
  CurriculumEnrollment,
  CurriculumItem,
} from '@/types';

function itemIcon(type: CurriculumItem['type']): React.ReactNode {
  switch (type) {
    case 'story':
      return <BookOpen className="h-4 w-4" />;
    case 'quiz':
      return <Brain className="h-4 w-4" />;
    case 'debate':
      return <Scale className="h-4 w-4" />;
    case 'analysis':
      return <FlaskConical className="h-4 w-4" />;
    case 'discussion':
      return <GitCompare className="h-4 w-4" />;
  }
}

function itemHref(item: CurriculumItem): string | null {
  if (!item.referenceId) return null;
  switch (item.type) {
    case 'story':
      return `/stories/${item.referenceId}`;
    case 'quiz':
      return `/quizzes/${item.referenceId}`;
    case 'debate':
      return `/debate-arena/${item.referenceId}`;
    case 'analysis':
      return `/dilemma-analyzer/${item.referenceId}`;
    case 'discussion':
      return `/stories/${item.referenceId}`;
    default:
      return null;
  }
}

export default function CurriculumDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const [curriculum, setCurriculum] = useState<CurriculumPath | null>(null);
  const [enrollment, setEnrollment] = useState<CurriculumEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);
  const [issuedCert, setIssuedCert] = useState<Certificate | null>(null);

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
          // Check if a certificate already exists for this user/curriculum
          const certRes = await getUserCertificates(user.uid);
          if (certRes.success) {
            const existing = certRes.data.find((c) => c.curriculumId === id);
            if (existing) setIssuedCert(existing);
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

  async function handleMarkComplete(itemId: string): Promise<void> {
    if (!user || !enrollment || !curriculum) return;
    if (enrollment.completedItemIds.includes(itemId)) return;
    setMarking(itemId);
    const res = await updateEnrollmentProgress(id, user.uid, itemId);
    setMarking(null);
    if (!res.success) return;

    const nextCompleted = [...enrollment.completedItemIds, itemId];
    setEnrollment({ ...enrollment, completedItemIds: nextCompleted });

    // If every required item is now complete, auto-issue a certificate.
    const allItems = curriculum.modules.flatMap((m) => m.items);
    const requiredItems = allItems.filter((it) => it.isRequired);
    const target = requiredItems.length > 0 ? requiredItems : allItems;
    const allDone =
      target.length > 0 &&
      target.every((it) => nextCompleted.includes(it.id));

    if (allDone && !issuedCert) {
      try {
        // Resolve a display name — fall back to email / 'Explorer'
        let userName = user.displayName || '';
        if (!userName) {
          const profile = await getUserProfile(user.uid);
          if (profile.success && profile.data) {
            userName =
              profile.data.displayName ||
              [profile.data.firstName, profile.data.lastName]
                .filter(Boolean)
                .join(' ') ||
              profile.data.email ||
              '';
          }
        }
        if (!userName) userName = 'Explorer';

        const certRes = await issueCertificate({
          userId: user.uid,
          userName,
          curriculumId: id,
          curriculumTitle: curriculum.title,
        });
        if (certRes.success) {
          setIssuedCert(certRes.data);
          toast({
            title: 'Curriculum completed!',
            description: (
              <span>
                Congratulations — your certificate has been issued.{' '}
                <Link
                  href="/profile"
                  className="underline font-medium"
                >
                  View certificate
                </Link>
              </span>
            ),
          });
        }
      } catch (err) {
        console.error('[curriculum] auto-issue certificate failed:', err);
      }
    }
  }

  // Sort modules and items by their `order` field, stable
  const sortedModules = useMemo(() => {
    if (!curriculum) return [];
    return [...curriculum.modules]
      .map((m, mi) => ({
        ...m,
        _idx: mi,
        items: [...m.items]
          .map((it, ii) => ({ ...it, _idx: ii }))
          .sort((a, b) => {
            const ao = a.order ?? a._idx;
            const bo = b.order ?? b._idx;
            return ao - bo;
          }),
      }))
      .sort((a, b) => {
        const ao = a.order ?? a._idx;
        const bo = b.order ?? b._idx;
        return ao - bo;
      });
  }, [curriculum]);

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
          <p className="text-2xl text-muted-foreground">Curriculum not found.</p>
        </Card>
      </div>
    );
  }

  const completed = enrollment?.completedItemIds ?? [];

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Card className="p-6 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-0 space-y-4">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-primary font-headline">
                  {curriculum.title}
                </h1>
                <p className="text-muted-foreground mt-1">{curriculum.description}</p>
                {(curriculum.creatorName || curriculum.creatorId) && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Created by {displayAuthorName(curriculum.creatorId, curriculum.creatorName)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {curriculum.enrollmentCount || 0} enrolled
                </Badge>
                {user && (curriculum.creatorId === user.uid || isAdmin) && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/curriculum/${id}/dashboard`}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                )}
                {!enrollment && (
                  <Button onClick={handleEnroll} disabled={enrolling || !user}>
                    {enrolling ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Enroll
                  </Button>
                )}
                {enrollment && !issuedCert && <Badge variant="secondary">Enrolled</Badge>}
                {issuedCert && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Certified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {sortedModules.map((mod) => (
          <Card key={mod.id} className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">{mod.title}</CardTitle>
              {mod.description && (
                <p className="text-sm text-muted-foreground">{mod.description}</p>
              )}
              {enrollment && (
                <ModuleProgress module={mod} completedItemIds={completed} />
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {mod.items.map((item, idx) => {
                const isCompleted = completed.includes(item.id);

                // Gate: locked if it's required AND any prior required item in the
                // same module is not yet completed. Non-required items are never locked.
                const priorRequiredIncomplete = mod.items
                  .slice(0, idx)
                  .some((p) => p.isRequired && !completed.includes(p.id));
                const locked = item.isRequired && priorRequiredIncomplete;

                const href = itemHref(item);
                const clickable = !locked && Boolean(href);

                const body = (
                  <div
                    className={`flex items-center gap-3 p-3 rounded transition-colors ${
                      locked
                        ? 'bg-muted/20 opacity-60'
                        : clickable
                          ? 'bg-muted/30 hover:bg-muted/50'
                          : 'bg-muted/30'
                    }`}
                  >
                    {locked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <span className="text-primary">{itemIcon(item.type)}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm font-medium truncate block ${
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
                    {enrollment && !locked && !isCompleted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMarkComplete(item.id);
                        }}
                        disabled={marking === item.id}
                      >
                        {marking === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Mark Complete'
                        )}
                      </Button>
                    )}
                  </div>
                );

                if (locked) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <div>{body}</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Complete the previous required item to unlock
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                if (clickable && href) {
                  return (
                    <Link key={item.id} href={href} className="block">
                      {body}
                    </Link>
                  );
                }

                return <div key={item.id}>{body}</div>;
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
