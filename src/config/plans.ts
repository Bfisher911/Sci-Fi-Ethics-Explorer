
import type { PlanConfig, SeatTier } from '@/types';

// ─── Individual Plans ───────────────────────────────────────────────

export const INSTRUCTOR_PLAN: PlanConfig = {
  id: 'instructor-individual',
  name: 'Instructor',
  type: 'individual',
  role: 'instructor',
  description: 'Full platform access with community creation and management tools.',
  billingPeriods: [
    { id: 'monthly', label: 'Monthly', months: 1, priceTotal: 14.99, pricePerMonth: 14.99 },
    { id: 'annual', label: 'Annual', months: 12, priceTotal: 143.88, pricePerMonth: 11.99, savings: 'Save 20%' },
  ],
  features: [
    'Unlimited access to all content',
    'Create and manage Communities',
    'Invite and manage students',
    'Assign learning pathways and activities',
    'Community analytics and progress tracking',
    'Full AI tools (Counselor, Analyzer, Perspectives)',
    'Participate as a learner in any Community',
    'Unlimited scenario analyses',
    'Priority support',
  ],
  highlighted: true,
};

export const STUDENT_PLAN: PlanConfig = {
  id: 'student-individual',
  name: 'Student',
  type: 'individual',
  role: 'student',
  description: 'Full access to the learning experience within your Communities.',
  billingPeriods: [
    { id: 'monthly', label: 'Monthly', months: 1, priceTotal: 14.99, pricePerMonth: 14.99 },
    { id: 'annual', label: 'Annual', months: 12, priceTotal: 143.88, pricePerMonth: 11.99, savings: 'Save 20%' },
    { id: 'semester', label: 'Semester (4 months)', months: 4, priceTotal: 49.99, pricePerMonth: 12.50, savings: 'Save 17%' },
  ],
  features: [
    'Unlimited access to all content',
    'Join invited Communities',
    'Complete assigned activities',
    'Personal progress tracking',
    'Full AI tools (Counselor, Analyzer, Perspectives)',
    'Participate in debates and workshops',
    'Ethical impact profile',
    'Exportable reports',
  ],
};

export const ALL_INDIVIDUAL_PLANS: PlanConfig[] = [INSTRUCTOR_PLAN, STUDENT_PLAN];

// ─── License Plans ──────────────────────────────────────────────────

export const LICENSE_PLAN: PlanConfig = {
  id: 'organization-license',
  name: 'Organization License',
  type: 'license',
  role: 'any',
  description: 'Purchase seats for your team, department, or institution. Invited members join at no individual cost.',
  billingPeriods: [
    { id: 'semester', label: 'Semester (4 months)', months: 4, priceTotal: 0, pricePerMonth: 0 },
    { id: 'annual', label: 'Annual', months: 12, priceTotal: 0, pricePerMonth: 0 },
  ],
  features: [
    'Everything in the Individual plan',
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

// ─── Seat Pricing Tiers ─────────────────────────────────────────────

export const SEAT_TIERS_SEMESTER: SeatTier[] = [
  { seats: 5, pricePerSeat: 12.00, totalPrice: 60 },
  { seats: 10, pricePerSeat: 11.00, totalPrice: 110 },
  { seats: 15, pricePerSeat: 10.50, totalPrice: 157.50 },
  { seats: 20, pricePerSeat: 10.00, totalPrice: 200 },
  { seats: 50, pricePerSeat: 9.00, totalPrice: 450 },
  { seats: 100, pricePerSeat: 8.00, totalPrice: 800 },
  { seats: 200, pricePerSeat: 7.00, totalPrice: 1400 },
];

export const SEAT_TIERS_ANNUAL: SeatTier[] = [
  { seats: 5, pricePerSeat: 30.00, totalPrice: 150 },
  { seats: 10, pricePerSeat: 27.00, totalPrice: 270 },
  { seats: 15, pricePerSeat: 25.50, totalPrice: 382.50 },
  { seats: 20, pricePerSeat: 24.00, totalPrice: 480 },
  { seats: 50, pricePerSeat: 21.00, totalPrice: 1050 },
  { seats: 100, pricePerSeat: 18.00, totalPrice: 1800 },
  { seats: 200, pricePerSeat: 15.00, totalPrice: 3000 },
];

export function getSeatTiers(term: 'semester' | 'annual'): SeatTier[] {
  return term === 'semester' ? SEAT_TIERS_SEMESTER : SEAT_TIERS_ANNUAL;
}

export function getPlanForRole(role: 'student' | 'instructor'): PlanConfig {
  return role === 'instructor' ? INSTRUCTOR_PLAN : STUDENT_PLAN;
}
