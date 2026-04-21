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
  Pencil,
  Trash2,
  ScrollText as ScrollTextIcon,
  BookText as BookTextIcon,
  Rocket,
  Clapperboard,
  Newspaper,
  BookOpenCheck,
  StickyNote,
  MessageSquarePlus,
  Share2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import {
  getCurriculumById,
  getEnrollment,
  enrollInCurriculum,
  updateEnrollmentProgress,
  deleteCurriculum,
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
    case 'perspective':
      return <GitCompare className="h-4 w-4" />;
    case 'philosopher':
      return <ScrollTextIcon className="h-4 w-4" />;
    case 'theory':
      return <BookTextIcon className="h-4 w-4" />;
    case 'scifi-author':
      return <Rocket className="h-4 w-4" />;
    case 'scifi-media':
      return <Clapperboard className="h-4 w-4" />;
    case 'blog':
      return <Newspaper className="h-4 w-4" />;
    case 'textbook-chapter':
      return <BookOpenCheck className="h-4 w-4" />;
    case 'instructions':
      return <StickyNote className="h-4 w-4" />;
    case 'reflection':
      return <MessageSquarePlus className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

function itemHref(item: CurriculumItem): string | null {
  if (item.type === 'instructions' || item.type === 'reflection') return null;
  // Analyzer + perspective don't need a reference — they open the tool
  if (item.type === 'analysis') return '/analyzer';
  if (item.type === 'perspective') return '/perspective-comparison';
  if (!item.referenceId) return null;
  switch (item.type) {
    case 'story':
      return `/stories/${item.referenceId}`;
    case 'quiz':
      return `/quizzes/${item.referenceId}`;
    case 'debate':
      return `/debate-arena/${item.referenceId}`;
    case 'discussion':
      return `/stories/${item.referenceId}`;
    case 'philosopher':
      return `/philosophers/${item.referenceId}`;
    case 'theory':
      return `/glossary/${item.referenceId}`;
    case 'scifi-author':
      return `/scifi-authors/${item.referenceId}`;
    case 'scifi-media':
      return `/scifi-media/${item.referenceId}`;
    case 'blog':
      return `/blog/${item.referenceId}`;
    case 'textbook-chapter':
      return `/textbook/chapters/${item.referenceId}`;
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
  const [attachedCommunityId, setAttachedCommunityId] = useState<string | null>(
    null
  );
  const [attachedCommunityName, setAttachedCommunityName] = useState<string | null>(
    null
  );

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
          // Find a community this learner is in whose curriculumPathId
          // matches this curriculum — lets reflections share back.
          try {
            const { getUserCommunities } = await import(
              '@/app/actions/communities'
            );
            const commsRes = await getUserCommunities(user.uid);
            if (commsRes.success) {
              const match = commsRes.data.find(
                (c: any) => c.curriculumPathId === id
              );
              if (match) {
                setAttachedCommunityId(match.id);
                setAttachedCommunityName(match.name);
              }
            }
          } catch (err) {
            console.warn('[curriculum] community lookup failed:', err);
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

    // Respect the per-curriculum certificate toggle. If a creator
    // marked a path as "no certificate", finishing it shouldn't mint
    // one. When `certificate` is missing (legacy records) we preserve
    // the old behaviour and always award.
    const certEnabled = curriculum.certificate
      ? curriculum.certificate.enabled === true
      : true;

    if (allDone && !issuedCert && certEnabled) {
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

        const certTitle =
          curriculum.certificate?.title?.trim() || curriculum.title;
        const certRes = await issueCertificate({
          userId: user.uid,
          userName,
          curriculumId: id,
          curriculumTitle: certTitle,
          creatorId: curriculum.creatorId,
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
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/curriculum/${id}/dashboard`}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/curriculum/${id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <DeleteCurriculumButton
                      curriculumId={id}
                      curriculumTitle={curriculum.title}
                      requesterId={user.uid}
                    />
                  </>
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

                // Instructions blocks render as inline prose, not clickable rows.
                if (item.type === 'instructions') {
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-4 rounded-md border border-primary/20 bg-primary/5"
                    >
                      <StickyNote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm text-foreground/90 whitespace-pre-wrap">
                        {item.instructions || item.title || 'Instructions'}
                      </div>
                    </div>
                  );
                }

                // Reflection items render with an inline textarea + submit.
                if (item.type === 'reflection') {
                  return (
                    <CurriculumReflection
                      key={item.id}
                      item={item}
                      isCompleted={isCompleted}
                      locked={locked}
                      communityId={attachedCommunityId}
                      communityName={attachedCommunityName}
                      onMarkComplete={() => handleMarkComplete(item.id)}
                    />
                  );
                }

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

                // Optional per-item instructions render ABOVE the row
                // as a subtle prose block.
                const instructionsBlock = item.instructions ? (
                  <div className="flex gap-2 text-xs text-muted-foreground italic pl-1 pr-1 pb-1">
                    <StickyNote className="h-3 w-3 mt-0.5 shrink-0 text-primary/70" />
                    <span className="whitespace-pre-wrap">{item.instructions}</span>
                  </div>
                ) : null;

                const row = locked ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>{body}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Complete the previous required item to unlock
                    </TooltipContent>
                  </Tooltip>
                ) : clickable && href ? (
                  <Link href={href} className="block">
                    {body}
                  </Link>
                ) : (
                  <div>{body}</div>
                );

                return (
                  <div key={item.id} className="space-y-1">
                    {instructionsBlock}
                    {row}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}

/**
 * Confirmation-gated delete button used by both creators and admins.
 * Calls the existing `deleteCurriculum` server action which already
 * enforces creator-or-admin authorization.
 */
function DeleteCurriculumButton({
  curriculumId,
  curriculumTitle,
  requesterId,
}: {
  curriculumId: string;
  curriculumTitle: string;
  requesterId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    const res = await deleteCurriculum(curriculumId, requesterId);
    setBusy(false);
    if (res.success) {
      toast({ title: 'Learning path deleted' });
      router.push('/curriculum');
    } else {
      toast({
        title: 'Could not delete',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this learning path?</AlertDialogTitle>
          <AlertDialogDescription>
            "{curriculumTitle}" will be removed permanently. Enrolled
            users will lose access to it. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Inline reflection row — used for CurriculumItem.type === 'reflection'.
 * Lets the learner write a free-text response, optionally share it to
 * the community whose curriculum this is, and mark the item complete.
 */
function CurriculumReflection({
  item,
  isCompleted,
  locked,
  communityId,
  communityName,
  onMarkComplete,
}: {
  item: CurriculumItem;
  isCompleted: boolean;
  locked: boolean;
  communityId: string | null;
  communityName: string | null;
  onMarkComplete: () => Promise<void> | void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [share, setShare] = useState(false);
  const [busy, setBusy] = useState(false);

  const prompt = (item.prompt || item.instructions || '').trim();

  async function handleSubmit() {
    if (!user) return;
    if (!text.trim()) {
      toast({
        title: 'Write a reflection first',
        description: 'Share a few sentences before marking this item complete.',
        variant: 'destructive',
      });
      return;
    }
    setBusy(true);
    try {
      // Optionally share to the community feed so the instructor sees it.
      if (share && communityId) {
        const { createContribution } = await import(
          '@/app/actions/contributions'
        );
        await createContribution({
          communityId,
          type: 'analysis',
          contributorId: user.uid,
          contributorName: user.displayName || user.email || 'Anonymous Explorer',
          title: item.title || 'Learning-path reflection',
          summary: text.trim().slice(0, 280),
          content: { reflection: text.trim(), prompt, itemId: item.id },
        });
      }
      await onMarkComplete();
      toast({
        title: 'Reflection saved',
        description:
          share && communityId
            ? `Shared to ${communityName || 'your community'}.`
            : 'Marked complete.',
      });
    } catch (err) {
      toast({
        title: 'Could not save reflection',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`rounded-md border p-4 space-y-3 ${
        locked
          ? 'opacity-60 border-muted bg-muted/10'
          : isCompleted
            ? 'border-primary/30 bg-primary/5'
            : 'border-accent/30 bg-accent/5'
      }`}
    >
      <div className="flex items-start gap-3">
        <MessageSquarePlus className="h-4 w-4 text-accent mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">
              {item.title || 'Reflection'}
            </span>
            <Badge variant="outline" className="text-[10px]">
              Reflection
            </Badge>
            {item.isRequired && (
              <Badge variant="destructive" className="text-[10px] h-4">
                Required
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="default" className="text-[10px] h-4">
                <CheckCircle className="h-3 w-3 mr-1" /> Complete
              </Badge>
            )}
          </div>
          {prompt && (
            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
              {prompt}
            </p>
          )}
        </div>
      </div>

      {!isCompleted && !locked && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your reflection…"
            rows={4}
            className="w-full text-sm rounded-md border border-input bg-background/60 p-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {communityId && (
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={share}
                onChange={(e) => setShare(e.target.checked)}
                className="mt-0.5"
              />
              <span className="inline-flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                Share to{' '}
                <span className="text-foreground font-medium">
                  {communityName || 'my community'}
                </span>{' '}
                so instructors can review it
              </span>
            </label>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              ) : null}
              {share && communityId ? 'Submit & share' : 'Submit reflection'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
