'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InfoIconProps {
  /** Tooltip text shown on hover/focus. */
  content: string | React.ReactNode;
  /** Optional accessible label; defaults to "More info". */
  label?: string;
  className?: string;
  /** Tailwind size class for the icon. Defaults to h-3.5 w-3.5. */
  size?: string;
}

/**
 * Small (i) icon that reveals contextual help on hover/focus. Designed for
 * inline placement next to form labels and headings.
 */
export function InfoIcon({
  content,
  label = 'More info',
  className,
  size = 'h-3.5 w-3.5',
}: InfoIconProps): JSX.Element {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={cn(
              'inline-flex items-center justify-center rounded-full text-muted-foreground/70 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors',
              className
            )}
          >
            <Info className={size} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm leading-relaxed">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
