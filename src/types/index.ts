
import type { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null; // This will store the 'name'
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  favoriteGenre?: string;
  storiesCompleted?: number;
  dilemmasAnalyzed?: number;
  communitySubmissions?: number;
  role?: string; // User's role within the platform (e.g., 'Explorer', 'Contributor')
  isAdmin?: boolean;
  // Stripe mapping — one-way link so the webhook can find this user by customer
  stripeCustomerId?: string;
  createdAt?: Date | any; // Allow 'any' for Firebase ServerTimestamp
  lastUpdated?: Date | any; // Allow 'any' for Firebase ServerTimestamp
}

// Stored at subscriptions/{uid}. Mirrored from Stripe by the webhook.
export type SubscriptionPlan = 'monthly' | 'semester' | 'annual' | 'free';
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'none';

export interface Subscription {
  uid: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodEnd?: Date | any; // ISO date or Firestore timestamp
  cancelAtPeriodEnd?: boolean;
  updatedAt?: Date | any;
}

export interface StoryChoice {
  text: string;
  nextSegmentId?: string;
  reflectionTrigger?: boolean;
}

export interface StorySegment {
  id: string;
  type: 'linear' | 'interactive';
  image?: string;
  imageHint?: string;
  text: string;
  choices?: StoryChoice[];
  poll?: PollData;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  theme: string;
  author: string;
  imageUrl?: string;
  imageHint?: string;
  segments: StorySegment[];
  isInteractive: boolean;
  estimatedReadingTime: string;
}

export interface EthicalTheory {
  id: string;
  name: string;
  description: string;
  proponents?: string[];
  keyConcepts?: string[];
  exampleScenario?: string;
  imageUrl?: string;
  imageHint?: string;
}

export interface PollData {
  question: string;
  options: { text: string; votes: number }[];
}

export interface SubmittedDilemma {
  id?: string;
  title: string;
  description: string;
  theme: string;
  authorName: string;
  authorId?: string;
  imageUrl?: string;
  imageHint?: string;
  submittedAt: Date | any;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// 🔁 PATCH: Add Organization types (BF 2025-06-06)
export type OrganizationMemberRole = 'owner' | 'leader' | 'member';

export interface Organization {
  id: string; // Firestore document ID
  name: string;
  ownerId: string; // UID of the user who created/owns the org
  members?: string[]; // Array of UIDs of members
  memberRoles?: { [uid: string]: OrganizationMemberRole }; // Map UIDs to roles for quick lookup
  plan?: 'free' | 'premium' | string; // Subscription plan status
  features?: { // Dynamically enabled features based on plan
    dashboard?: boolean;
    analytics?: boolean;
    customModules?: boolean;
    // ... other feature flags
  };
  createdAt: Date | any; // Firebase ServerTimestamp
  updatedAt?: Date | any; // Firebase ServerTimestamp
  settings?: Record<string, any>; // Org-specific settings like branding, etc.
}
// 🔁 END PATCH
