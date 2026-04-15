import type { PlanConfig, SeatTier, AccountRole } from '@/types';

// ─── Individual Plan ────────────────────────────────────────────────
//
// The platform is single-tier: every member has the same capabilities,
// including creating and managing communities. Anyone who creates a
// community becomes its instructor (a per-community role on that
// community's instructorIds, separate from this account-level plan).

export const MEMBER_PLAN: PlanConfig = {
  id: 'member-individual',
  name: 'Member',
  type: 'individual',
  role: 'any',
  description:
    'Full platform access. Create your own communities, join others by invitation, and use every learning and AI tool.',
  billingPeriods: [
    { id: 'monthly', label: 'Monthly', months: 1, priceTotal: 14.99, pricePerMonth: 14.99 },
    { id: 'semester', label: 'Semester (4 months)', months: 4, priceTotal: 49.99, pricePerMonth: 12.50, savings: 'Save 17%' },
    { id: 'annual', label: 'Annual', months: 12, priceTotal: 143.88, pricePerMonth: 11.99, savings: 'Save 20%' },
  ],
  features: [
    'Unlimited access to all stories, dilemmas, and theory deep-dives',
    'Create and manage your own Communities',
    'Join Communities by invitation',
    'Invite others, assign learning pathways, and track progress',
    'Community analytics for the Communities you teach',
    'Full AI tools (Counselor, Analyzer, Perspective Comparison, Devil\'s Advocate)',
    'Earn certificates and ethics-tier badges',
    'Personal progress tracking and ethical impact profile',
    'Submit dilemmas, debates, and stories to the community',
    'Direct messaging with other members',
  ],
  highlighted: true,
};

/**
 * Backward-compatible aliases. Older code references these constants;
 * keep them pointing at the same canonical plan so we don't break imports.
 *
 * @deprecated Use MEMBER_PLAN. Removed after the next sweep.
 */
export const INSTRUCTOR_PLAN = MEMBER_PLAN;
/** @deprecated Use MEMBER_PLAN. */
export const STUDENT_PLAN = MEMBER_PLAN;

export const ALL_INDIVIDUAL_PLANS: PlanConfig[] = [MEMBER_PLAN];

// ─── License Plan (Org / Institution) ───────────────────────────────

export const LICENSE_PLAN: PlanConfig = {
  id: 'organization-license',
  name: 'Organization License',
  type: 'license',
  role: 'any',
  description:
    'Purchase seats for your team, department, or institution. Invited members join at no individual cost.',
  billingPeriods: [
    { id: 'semester', label: 'Semester (4 months)', months: 4, priceTotal: 0, pricePerMonth: 0 },
    { id: 'annual', label: 'Annual', months: 12, priceTotal: 0, pricePerMonth: 0 },
  ],
  features: [
    'Everything in the Member plan',
    'Centralized seat management',
    'Members join at no individual cost',
    'Organization-wide analytics',
    'Multiple Communities under one license',
    'Bulk invite tools',
    'Admin dashboard',
    'Dedicated support',
  ],
  highlighted: true,
};

// ─── Seat Pricing Tiers (license plan) ──────────────────────────────

export const SEAT_TIERS_SEMESTER: SeatTier[] = [
  { seats: 5, pricePerSeat: 12.0, totalPrice: 60 },
  { seats: 10, pricePerSeat: 11.0, totalPrice: 110 },
  { seats: 15, pricePerSeat: 10.5, totalPrice: 157.5 },
  { seats: 20, pricePerSeat: 10.0, totalPrice: 200 },
  { seats: 50, pricePerSeat: 9.0, totalPrice: 450 },
  { seats: 100, pricePerSeat: 8.0, totalPrice: 800 },
  { seats: 200, pricePerSeat: 7.0, totalPrice: 1400 },
];

export const SEAT_TIERS_ANNUAL: SeatTier[] = [
  { seats: 5, pricePerSeat: 30.0, totalPrice: 150 },
  { seats: 10, pricePerSeat: 27.0, totalPrice: 270 },
  { seats: 15, pricePerSeat: 25.5, totalPrice: 382.5 },
  { seats: 20, pricePerSeat: 24.0, totalPrice: 480 },
  { seats: 50, pricePerSeat: 21.0, totalPrice: 1050 },
  { seats: 100, pricePerSeat: 18.0, totalPrice: 1800 },
  { seats: 200, pricePerSeat: 15.0, totalPrice: 3000 },
];

export function getSeatTiers(term: 'semester' | 'annual'): SeatTier[] {
  return term === 'semester' ? SEAT_TIERS_SEMESTER : SEAT_TIERS_ANNUAL;
}

/**
 * Returns the canonical Member plan regardless of role. Kept for
 * backward compatibility with legacy callers that pass a role.
 */
export function getPlanForRole(_role?: AccountRole | string): PlanConfig {
  return MEMBER_PLAN;
}
