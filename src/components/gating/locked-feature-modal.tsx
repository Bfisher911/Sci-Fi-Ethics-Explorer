'use client';

import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';

interface LockedFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional override for the modal title. */
  title?: string;
  /** Optional override for the modal body. */
  description?: string;
  /** Feature name to personalize copy (e.g., "Scenario Analyzer"). */
  featureName?: string;
}

/**
 * Shown when a logged-in but unsubscribed user tries to use a premium
 * feature. Replaces the old pattern of hard-redirecting to /login, which
 * created a loop for already-logged-in users.
 */
export function LockedFeatureModal({
  open,
  onOpenChange,
  title,
  description,
  featureName,
}: LockedFeatureModalProps): JSX.Element {
  const body =
    description ||
    (featureName
      ? `${featureName} and other deep-dive tools are reserved for premium members. Join our community of explorers to unlock this module.`
      : 'Deep-dive analysis and AI-driven moral counseling are reserved for our premium members. Join our community of explorers to unlock these tools.');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-card/95 backdrop-blur-md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(125,249,255,0.18), transparent 60%)',
          }}
        />
        <DialogHeader className="relative">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-headline text-primary">
            {title || 'This Area Requires Authorization.'}
          </DialogTitle>
          <DialogDescription className="text-center text-foreground/80 leading-relaxed pt-2">
            {body}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="relative flex-col sm:flex-col gap-2 pt-4">
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)]"
            size="lg"
          >
            <Link href="/pricing" onClick={() => onOpenChange(false)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
