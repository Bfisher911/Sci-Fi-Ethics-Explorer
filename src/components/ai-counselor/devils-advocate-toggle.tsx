'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Flame } from 'lucide-react';

interface DevilsAdvocateToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * Toggle switch to enable or disable Devil's Advocate mode in the AI counselor chat.
 */
export function DevilsAdvocateToggle({
  enabled,
  onToggle,
}: DevilsAdvocateToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="devils-advocate-mode"
        checked={enabled}
        onCheckedChange={onToggle}
      />
      <Label
        htmlFor="devils-advocate-mode"
        className="flex items-center gap-1.5 text-sm cursor-pointer"
      >
        <Flame className={`h-4 w-4 ${enabled ? 'text-orange-400' : 'text-muted-foreground'}`} />
        <span className={enabled ? 'text-orange-400 font-medium' : 'text-muted-foreground'}>
          Devil&apos;s Advocate
        </span>
      </Label>
    </div>
  );
}
