
'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface UpgradePromptProps {
  /** Custom message shown below the heading. */
  message?: string;
  /** Name of the locked feature, displayed for context. */
  feature?: string;
}

/**
 * Visually appealing card shown when a feature is locked behind a subscription.
 */
export function UpgradePrompt({
  message = 'This feature requires an active plan.',
  feature,
}: UpgradePromptProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            Upgrade to unlock
          </h3>
          {feature && (
            <p className="text-sm font-medium text-primary">{feature}</p>
          )}
          <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
        </div>
        <Button asChild>
          <Link href="/onboarding">Choose a Plan</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
