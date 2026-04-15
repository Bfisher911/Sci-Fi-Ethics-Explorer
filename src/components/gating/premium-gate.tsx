'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Skeleton } from '@/components/ui/skeleton';
import { LockedFeatureModal } from './locked-feature-modal';

interface PremiumGateProps {
  /** Human-readable name of the gated feature (used in modal copy). */
  featureName: string;
  /** Where to send the user when they dismiss the modal. */
  fallbackHref?: string;
  children: ReactNode;
}

/**
 * Page-level premium gate. If the current user has an active subscription
 * or license, renders `children`. Otherwise shows a LockedFeatureModal
 * and routes them away on dismiss — no hard redirect to /login for
 * logged-in-but-unpaid users.
 */
export function PremiumGate({
  featureName,
  fallbackHref = '/stories',
  children,
}: PremiumGateProps): JSX.Element {
  const router = useRouter();
  const { isPaid, loading } = useSubscription();
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    if (!loading && isPaid) {
      setModalOpen(false);
    }
  }, [loading, isPaid]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isPaid) return <>{children}</>;

  return (
    <>
      <div className="container mx-auto py-16 px-4 text-center space-y-4 opacity-60 pointer-events-none select-none">
        <h1 className="text-3xl font-bold text-primary font-headline">
          {featureName}
        </h1>
        <p className="text-muted-foreground">Premium feature — preview hidden.</p>
      </div>
      <LockedFeatureModal
        open={modalOpen}
        onOpenChange={(next) => {
          setModalOpen(next);
          if (!next) router.push(fallbackHref);
        }}
        featureName={featureName}
      />
    </>
  );
}
