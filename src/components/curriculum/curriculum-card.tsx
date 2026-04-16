'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Copy, Loader2, Sparkles, User, Pencil } from 'lucide-react';
import { cloneCurriculum } from '@/app/actions/curriculum';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import type { CurriculumPath } from '@/types';

interface CurriculumCardProps {
  curriculum: CurriculumPath;
}

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const { toast } = useToast();
  const [duplicating, setDuplicating] = useState(false);

  const totalItems = curriculum.modules.reduce(
    (acc, mod) => acc + mod.items.length,
    0,
  );

  const isOwner = user?.uid && curriculum.creatorId === user.uid;
  const isTemplate = curriculum.isTemplate === true;

  async function handleDuplicate(): Promise<void> {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to duplicate curricula.',
        variant: 'destructive',
      });
      return;
    }
    setDuplicating(true);
    const result = await cloneCurriculum(
      curriculum.id,
      user.uid,
      user.displayName || user.email || 'Unknown',
    );
    setDuplicating(false);
    if (result.success) {
      toast({ title: 'Duplicated', description: 'Opening your copy...' });
      router.push(`/curriculum/${result.data}`);
    } else {
      toast({
        title: 'Duplicate failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg text-primary">{curriculum.title}</CardTitle>
          <div className="flex flex-col gap-1 items-end flex-shrink-0">
            {isTemplate && (
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-[10px] h-5 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Template
              </Badge>
            )}
            {isOwner && (
              <Badge variant="secondary" className="text-[10px] h-5 flex items-center gap-1">
                <User className="h-3 w-3" />
                Owned by you
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {curriculum.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {curriculum.modules.length} module{curriculum.modules.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {curriculum.enrollmentCount || 0} enrolled
          </Badge>
          {totalItems > 0 && (
            <Badge variant="outline">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/curriculum/${curriculum.id}`}>View</Link>
        </Button>
        {(isOwner || isAdmin) && (
          <Button
            asChild
            variant="outline"
            title={isOwner ? 'Edit your learning path' : 'Edit (admin)'}
          >
            <Link href={`/curriculum/${curriculum.id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Edit</span>
            </Link>
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleDuplicate}
          disabled={duplicating || !user}
          title="Duplicate as my own editable copy"
        >
          {duplicating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="ml-1 hidden sm:inline">Duplicate</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
