'use client';

/**
 * Single role badge — the canonical visual for "who is this user?"
 *
 * Shows ONE badge per user, picking the highest tier they hold:
 *
 *   Super-Admin > License-Admin > Instructor > Member
 *
 * Replaces a previous pattern of stacking multiple badges (admin +
 * license owner + community manager + …) which became visual noise as
 * the role model grew. The hierarchy is the source of truth — if
 * someone is a super-admin AND a license owner AND a community
 * instructor, only the super-admin badge renders. (They are already
 * implicitly all three downstream.)
 *
 * Use with the `tier` prop directly when you've already resolved it
 * (e.g. on the server), or in client components via the `useTier`
 * hook — see hooks/use-tier.ts.
 */

import { cn } from '@/lib/utils';
import { Crown, GraduationCap, ShieldCheck, User } from 'lucide-react';

export type RoleTier = 'super-admin' | 'license-admin' | 'instructor' | 'member';

interface RoleBadgeProps {
  tier: RoleTier;
  /** When `compact`, render an icon-only pill (for tight surfaces like
   *  the dashboard greeting strip). Default: full label. */
  compact?: boolean;
  className?: string;
}

const ROLE_DETAILS: Record<
  RoleTier,
  {
    label: string;
    icon: typeof Crown;
    /** Tailwind classes for the badge background + text colors. */
    classes: string;
    /** Tooltip text. */
    title: string;
  }
> = {
  'super-admin': {
    label: 'Owner',
    icon: Crown,
    classes:
      'border-accent/40 bg-accent/15 text-accent',
    title:
      'Platform super-admin (Professor Paradox identity). Full access to every collection.',
  },
  'license-admin': {
    label: 'License Admin',
    icon: ShieldCheck,
    classes:
      'border-primary/40 bg-primary/15 text-primary',
    title:
      'You purchased a seat license. Admin tools are scoped to users who claimed seats from your license.',
  },
  instructor: {
    label: 'Instructor',
    icon: GraduationCap,
    classes:
      'border-chart-2/40 bg-chart-2/15 text-chart-2',
    title:
      'You instruct one or more communities. Moderation tools are scoped to those communities.',
  },
  member: {
    label: 'Member',
    icon: User,
    classes:
      'border-border/60 bg-muted/30 text-muted-foreground',
    title: 'Standard platform access.',
  },
};

export function RoleBadge({ tier, compact = false, className }: RoleBadgeProps) {
  const d = ROLE_DETAILS[tier];
  const Icon = d.icon;
  return (
    <span
      title={d.title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
        d.classes,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {!compact && <span>{d.label}</span>}
    </span>
  );
}

/**
 * Pure helper: collapses a bag of role-related signals into the single
 * highest tier. Useful in places where you already know each input
 * separately and just need the result.
 */
export function pickHighestTier(input: {
  isSuperAdmin: boolean;
  hasOwnedLicense: boolean;
  isCommunityInstructor: boolean;
}): RoleTier {
  if (input.isSuperAdmin) return 'super-admin';
  if (input.hasOwnedLicense) return 'license-admin';
  if (input.isCommunityInstructor) return 'instructor';
  return 'member';
}
