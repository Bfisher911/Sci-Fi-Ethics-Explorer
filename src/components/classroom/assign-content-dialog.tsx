'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Loader2 } from 'lucide-react';
import { getCurricula } from '@/app/actions/curriculum';
import type { CurriculumPath } from '@/types';

interface AssignContentDialogProps {
  onAssign: (curriculumPathId: string) => Promise<void>;
}

export function AssignContentDialog({ onAssign }: AssignContentDialogProps) {
  const [open, setOpen] = useState(false);
  const [curricula, setCurricula] = useState<CurriculumPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    async function fetch(): Promise<void> {
      setLoading(true);
      const result = await getCurricula();
      if (result.success) {
        setCurricula(result.data);
      }
      setLoading(false);
    }
    fetch();
  }, [open]);

  async function handleAssign(id: string): Promise<void> {
    setAssigning(id);
    await onAssign(id);
    setAssigning(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpen className="h-4 w-4 mr-1" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Curriculum</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {loading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : curricula.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No curricula available. Create one first.
            </p>
          ) : (
            curricula.map((curr) => (
              <div
                key={curr.id}
                className="flex items-center justify-between p-3 rounded border border-border"
              >
                <div>
                  <p className="font-medium text-sm">{curr.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {curr.modules.length} modules
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAssign(curr.id)}
                  disabled={assigning === curr.id}
                >
                  {assigning === curr.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Assign'
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
