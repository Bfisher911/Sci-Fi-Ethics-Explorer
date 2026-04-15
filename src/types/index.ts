
import type { User as FirebaseUser } from 'firebase/auth';

// ─── User ───────────────────────────────────────────────────────────

export type AccountRole = 'student' | 'instructor';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'past_due' | 'canceled';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  favoriteGenre?: string;
  storiesCompleted?: number;
  dilemmasAnalyzed?: number;
  communitySubmissions?: number;
  role?: string;
  accountRole?: AccountRole;
  subscriptionId?: string;
  subscriptionStatus?: SubscriptionStatus;
  activeLicenseId?: string;
  onboardingComplete?: boolean;
  isAdmin?: boolean;
  createdAt?: Date | any;
  lastUpdated?: Date | any;
}

// ─── Stories ────────────────────────────────────────────────────────

export interface StoryChoice {
  text: string;
  nextSegmentId?: string;
  reflectionTrigger?: boolean;
}

export interface PollData {
  question: string;
  options: { text: string; votes: number }[];
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
  // New fields for Firestore-backed stories
  authorId?: string;
  status?: 'draft' | 'published' | 'archived';
  publishedAt?: Date | any;
  viewCount?: number;
  tags?: string[];
}

// ─── Branching Narratives ───────────────────────────────────────────

export interface BranchNode {
  id: string;
  segmentId: string;
  parentNodeId?: string;
  choiceText?: string;
  children: string[];
  isEnding: boolean;
  endingType?: 'positive' | 'negative' | 'neutral' | 'ambiguous';
}

export interface StoryBranchMap {
  storyId: string;
  rootNodeId: string;
  nodes: Record<string, BranchNode>;
}

// ─── Ethical Theory ─────────────────────────────────────────────────

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

// ─── Submitted Dilemmas ─────────────────────────────────────────────

export interface SubmittedDilemma {
  id?: string;
  title: string;
  description: string;
  theme: string;
  authorName: string;
  authorId?: string;
  authorEmail?: string;
  imageUrl?: string;
  imageHint?: string;
  submittedAt: Date | any;
  status: 'pending' | 'approved' | 'rejected';
  communityId?: string;
  communityName?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date | any;
}

// ─── Notifications ──────────────────────────────────────────────────

export type NotificationType =
  | 'dilemma_submitted'
  | 'dilemma_approved'
  | 'dilemma_rejected'
  | 'community_invite'
  | 'generic';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: Date | any;
  metadata?: Record<string, any>;
}

// ─── Chat ───────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date | any;
  lastMessageAt: Date | any;
}

// ─── Debates ────────────────────────────────────────────────────────

export interface Debate {
  id: string;
  title: string;
  description: string;
  dilemmaId?: string;
  storyId?: string;
  creatorId: string;
  creatorName: string;
  status: 'open' | 'voting' | 'closed';
  createdAt: Date | any;
  closesAt?: Date | any;
  participantCount: number;
  tags?: string[];
}

export interface DebateArgument {
  id: string;
  debateId: string;
  authorId: string;
  authorName: string;
  position: 'pro' | 'con';
  content: string;
  parentArgumentId?: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date | any;
  status: 'active' | 'flagged' | 'removed';
}

export interface DebateVote {
  id: string;
  debateId: string;
  argumentId: string;
  userId: string;
  voteType: 'up' | 'down';
  createdAt: Date | any;
}

// ─── User Progress & Gamification ───────────────────────────────────

export interface QuizResult {
  id: string;
  completedAt: Date | any;
  scores: Record<string, number>;
  dominantFramework: string;
}

export interface UserProgress {
  userId: string;
  storiesCompleted: string[];
  storyChoices: Record<string, string[]>;
  quizResults: QuizResult[];
  scenariosAnalyzed: number;
  debatesParticipated: string[];
  dilemmasSubmitted: string[];
  lastActivity: Date | any;
}

export type BadgeId =
  | 'first_story'
  | 'five_stories'
  | 'ten_stories'
  | 'first_debate'
  | 'debate_champion'
  | 'quiz_master'
  | 'first_submission'
  | 'ten_analyses'
  | 'community_star'
  | 'devil_advocate'
  | 'workshop_host'
  | 'curriculum_complete'
  | string;

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  category: 'stories' | 'debates' | 'analysis' | 'community' | 'learning';
}

export interface UserBadge {
  badgeId: BadgeId;
  earnedAt: Date | any;
}

export interface EthicalImpactScore {
  id: string;
  userId: string;
  dimensions: { name: string; score: number }[];
  calculatedAt: Date | any;
}

// ─── Discussion Threads ─────────────────────────────────────────────

export interface DiscussionComment {
  id: string;
  storyId: string;
  authorId: string;
  authorName: string;
  avatarUrl?: string;
  content: string;
  parentCommentId?: string;
  upvotes: number;
  createdAt: Date | any;
  status: 'active' | 'flagged' | 'removed';
}

// ─── Bookmarks ──────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'story' | 'dilemma' | 'debate';
  title: string;
  createdAt: Date | any;
}

// ─── Curriculum & Learning Paths ────────────────────────────────────

export interface CurriculumItem {
  id: string;
  type: 'story' | 'quiz' | 'debate' | 'analysis' | 'discussion';
  referenceId: string;
  title: string;
  order: number;
  isRequired: boolean;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  order: number;
  items: CurriculumItem[];
}

export interface CurriculumPath {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName?: string;
  isPublic: boolean;
  modules: CurriculumModule[];
  enrollmentCount?: number;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export interface CurriculumEnrollment {
  userId: string;
  curriculumId: string;
  completedItemIds: string[];
  enrolledAt: Date | any;
  lastActivity?: Date | any;
}

// ─── Philosopher Spotlights ─────────────────────────────────────────

export interface Philosopher {
  id: string;
  name: string;
  era: string;
  imageUrl?: string;
  imageHint?: string;
  bio: string;
  keyIdeas: string[];
  relatedFrameworks: string[];
  famousWorks: string[];
}

// ─── Classroom ──────────────────────────────────────────────────────

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  teacherName?: string;
  organizationId?: string;
  studentIds: string[];
  curriculumPathId?: string;
  joinCode: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export interface StudentProgress {
  classroomId: string;
  studentId: string;
  studentName?: string;
  completedItems: string[];
  quizScores: Record<string, QuizResult>;
  lastActivity: Date | any;
}

// ─── Workshops ──────────────────────────────────────────────────────

export interface Workshop {
  id: string;
  title: string;
  description: string;
  dilemmaId?: string;
  storyId?: string;
  hostId: string;
  hostName: string;
  status: 'scheduled' | 'active' | 'completed';
  participantIds: string[];
  maxParticipants: number;
  scheduledAt?: Date | any;
  startedAt?: Date | any;
  endedAt?: Date | any;
  createdAt: Date | any;
  sharedNotes?: string;
}

export interface WorkshopMessage {
  id: string;
  workshopId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date | any;
}

// ─── Organizations ──────────────────────────────────────────────────

export type OrganizationMemberRole = 'owner' | 'leader' | 'member';

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  members?: string[];
  memberRoles?: { [uid: string]: OrganizationMemberRole };
  plan?: 'free' | 'premium' | string;
  features?: {
    dashboard?: boolean;
    analytics?: boolean;
    customModules?: boolean;
  };
  createdAt: Date | any;
  updatedAt?: Date | any;
  settings?: Record<string, any>;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationMemberRole;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy: string;
  createdAt: Date | any;
}

// ─── Communities ────────────────────────────────────────────────────

export type CommunityMemberRole = 'instructor' | 'member';

export interface Community {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  instructorIds: string[];
  memberIds: string[];
  licenseId?: string;
  inviteCode: string;
  curriculumPathId?: string;
  settings?: {
    maxMembers?: number;
    allowSelfJoin?: boolean;
  };
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export interface CommunityInvite {
  id: string;
  communityId: string;
  communityName?: string;
  email: string;
  role: CommunityMemberRole;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy: string;
  invitedByName?: string;
  createdAt: Date | any;
}

export interface CommunityMemberInfo {
  uid: string;
  displayName: string;
  email: string;
  role: CommunityMemberRole;
  subscriptionStatus?: SubscriptionStatus;
  activeLicenseId?: string;
  joinedAt?: Date | any;
}

// ─── Subscriptions & Billing ────────────────────────────────────────

export type BillingPeriodId = 'monthly' | 'annual' | 'semester';

export interface BillingPeriod {
  id: BillingPeriodId;
  label: string;
  months: number;
  priceTotal: number;
  pricePerMonth: number;
  savings?: string;
}

export interface PlanConfig {
  id: string;
  name: string;
  type: 'individual' | 'license';
  role: 'student' | 'instructor' | 'any';
  description: string;
  billingPeriods: BillingPeriod[];
  features: string[];
  highlighted?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  billingPeriod: BillingPeriodId;
  status: SubscriptionStatus;
  currentPeriodStart: Date | any;
  currentPeriodEnd: Date | any;
  cancelAtPeriodEnd?: boolean;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

// ─── Seat Licensing ─────────────────────────────────────────────────

export type LicenseTerm = 'semester' | 'annual';
export type LicenseStatus = 'active' | 'expired' | 'canceled';

export interface SeatTier {
  seats: number;
  pricePerSeat: number;
  totalPrice: number;
}

export interface License {
  id: string;
  organizationName: string;
  purchaserId: string;
  purchaserName?: string;
  planId: string;
  totalSeats: number;
  usedSeats: number;
  term: LicenseTerm;
  startDate: Date | any;
  endDate: Date | any;
  status: LicenseStatus;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export interface SeatAssignment {
  id: string;
  licenseId: string;
  userId: string;
  userEmail?: string;
  communityId?: string;
  assignedAt: Date | any;
  status: 'active' | 'revoked';
}
