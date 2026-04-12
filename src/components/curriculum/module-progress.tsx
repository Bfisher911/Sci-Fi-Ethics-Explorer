'use client';

import { Progress } from '@/components/ui/progress';
import type { CurriculumModule } from '@/types';

interface ModuleProgressProps {
  module: CurriculumModule;
  completedItemIds: string[];
}

export function ModuleProgress({ module, completedItemIds }: ModuleProgressProps) {
  const totalItems = module.items.length;
  const completedCount = module.items.filter((item) =>
    completedItemIds.includes(item.id)
  ).length;
  const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completedCount} / {totalItems} items completed
        </span>
        <span className="font-medium text-primary">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
