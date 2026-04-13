
'use client';

import type { ReactNode } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import type { Feature } from '@/lib/permissions';
import { UpgradePrompt } from './upgrade-prompt';

interface FeatureGateProps {
  /** The feature key to check access for. */
  feature: Feature;
  /** Content rendered when the user has access. */
  children: ReactNode;
  /** Optional custom fallback rendered when access is denied. */
  fallback?: ReactNode;
}

/**
 * Wrapper component that gates children behind a feature access check.
 * Renders children if the user can access the feature, otherwise shows
 * a fallback or a default upgrade prompt.
 */
export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canAccess, loading } = useSubscription();

  if (loading) return null;

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UpgradePrompt feature={feature} />;
}
