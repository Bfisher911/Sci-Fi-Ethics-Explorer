
import type { User as FirebaseUser } from 'firebase/auth';

// ─── User ───────────────────────────────────────────────────────────

/**
 * Account-level role. The platform is now single-tier: every account is a
 * "member" with the same capabilities. Anyone can create a community (which
 * makes them an instructor of *that* community — see Community.instructorIds —
 * but that is a per-community role, not an account-level role).
 *
 * Legacy values 'student' and 'instructor' may exist on older user docs and
 * are accepted at read time; they should be treated equivalent to 'member'.
 */
export type AccountRole = 'member' | 'student' | 'instructor';
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
  stripeCustomerId?: string;
  activeLicenseId?: string;
  onboardingComplete?: boolean;
  isAdmin?: boolean;
  /** When true, this user has moderation powers inside any community
   *  they are a member of. Only the super-admin can grant or revoke
   *  this flag — see src/app/actions/community-manager.ts. */
  communityManager?: boolean;
  /** When true, user appears as "Anonymous Explorer" on public leaderboards. */
  anonymousOnLeaderboard?: boolean;
  /**
   * When explicitly false, the user is hidden from the People Directory and
   * their public profile link returns "Profile Private". If undefined, treat
   * as public (default true).
   */
  isPublicProfile?: boolean;
  /**
   * Cached dominant ethical framework name from the user's most recent
   * framework-explorer quiz, used for directory filtering. Populated when the
   * user completes the quiz.
   */
  dominantFramework?: string;
  /**
   * Snapshot of the user's most recently redeemed discount-code access grant.
   * Lives on the user doc (rather than requiring a join against the
   * `discountCodeRedemptions` collection on every access check) so the
   * existing `hasActiveAccess` helper stays a single Firestore read.
   *
   * `accessExpiresAt` is authoritative: when it has passed, the grant is
   * inert. We do NOT charge or auto-renew; the field is simply ignored
   * once expired. See `src/lib/discount-codes.ts` for the grant logic.
   */
  activeAccessGrant?: UserAccessGrant;
  createdAt?: Date | any;
  lastUpdated?: Date | any;
}

/**
 * Snapshot of an active discount-code grant on a user profile. Mirrors the
 * authoritative record in `discountCodeRedemptions/{id}` for fast read
 * access during entitlement checks.
 */
export interface UserAccessGrant {
  /** Reference back to the source redemption record. */
  redemptionId: string;
  /** Reference to the originating discount code (for audit/UX). */
  discountCodeId: string;
  /** Human-readable code, uppercased. Shown in the UI. */
  code: string;
  /** What scope of access this grant provides. */
  accessScope: DiscountCodeAccessScope;
  /** Optional course name when accessScope === 'course'. */
  courseName?: string;
  /** Optional platform name when accessScope === 'platform' or 'platform_course'. */
  platformName?: string;
  /** ISO timestamp when access began. */
  accessStartsAt: Date | any;
  /** ISO timestamp when access expires. After this the grant is inert. */
  accessExpiresAt: Date | any;
}

// ─── Discount Codes ─────────────────────────────────────────────────

/**
 * Generic discount-code system. Backs free class access, pilot programs,
 * beta testers, promotional discounts, institutional trials, comped
 * accounts, and any future free-access use case.
 *
 * IMPORTANT: a discount code with discountType === 'free_access' grants
 * access *inside the app*. It does NOT create a Stripe customer or
 * subscription, so there is no Stripe billing object that could later
 * charge the user. See `docs/DISCOUNT_CODES.md`.
 */
export type DiscountCodeType =
  | 'free_access'           // 100% free internal grant for accessDurationMonths
  | 'percent_off'           // % off a Stripe checkout (uses stripePromotionCodeId)
  | 'amount_off'            // fixed-amount off a Stripe checkout
  | 'comped'                // open-ended free access until manually revoked
  | 'pilot'                 // free access during a pilot window
  | 'beta'                  // free access for beta testers
  | 'institution'           // free access tied to an institution
  | 'promotional';          // generic promotional free access (alias of free_access with metadata)

/**
 * Scope of what the discount code unlocks. `platform` grants full app
 * access; `course` and `platform_course` carry a courseName for display.
 */
export type DiscountCodeAccessScope =
  | 'platform'         // full platform access
  | 'course'           // course-specific access (carries courseName)
  | 'platform_course'; // both — used for class codes like the Ethics of Tech class

export interface DiscountCode {
  id: string;
  /** Unique, case-insensitive. Stored uppercased. */
  code: string;
  /** Short admin-facing name. */
  name: string;
  /** Optional admin-facing description. */
  description?: string;
  discountType: DiscountCodeType;
  accessScope: DiscountCodeAccessScope;
  /** Course display name (e.g., "The Ethics of Technology through Science Fiction"). */
  courseName?: string;
  /** Platform display name (e.g., "Off World Clause"). */
  platformName?: string;
  /** Length of free access in months. Either this OR accessDurationDays must be set
   *  for free_access / pilot / beta / institution / promotional / comped (if bounded). */
  accessDurationMonths?: number;
  /** Length of free access in days. Used for short-window pilots and beta tests. */
  accessDurationDays?: number;
  /** For percent_off Stripe codes. 0–100. */
  percentOff?: number;
  /** For amount_off Stripe codes, in currency minor units (cents). */
  amountOff?: number;
  /** ISO 4217 currency code for amount_off (default 'usd'). */
  currency?: string;
  /** Max times this code can be redeemed across all users. null = unlimited. */
  maxRedemptions?: number | null;
  /** How many times the code has been redeemed. Maintained server-side. */
  redemptionCount: number;
  /** When true, a single user may redeem only once. Default true. */
  oneUsePerUser: boolean;
  /** When true, the discount must flow through Stripe (uses stripePromotionCodeId).
   *  For free_access codes this is false — Stripe is not touched. */
  requiresStripe: boolean;
  /** Stripe coupon ID, when requiresStripe is true. */
  stripeCouponId?: string;
  /** Stripe promotion code ID, when requiresStripe is true. */
  stripePromotionCodeId?: string;
  /** Optional start date — code is invalid before this. */
  startsAt?: Date | any;
  /** Optional expiration date — code is invalid after this. Independent of
   *  the per-redemption access window. */
  expiresAt?: Date | any;
  /** When false, the code cannot be redeemed regardless of dates. */
  isActive: boolean;
  /** UID of the admin who created the code. */
  createdBy?: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export interface DiscountCodeRedemption {
  id: string;
  discountCodeId: string;
  /** Snapshot of the redeemed code text for audit (codes can be renamed/deactivated). */
  code: string;
  userId: string;
  /** Snapshot of user email at redemption for audit. */
  userEmail?: string;
  redeemedAt: Date | any;
  accessStartsAt: Date | any;
  accessExpiresAt: Date | any;
  /** What this redemption granted. */
  accessScope: DiscountCodeAccessScope;
  accessType: DiscountCodeType;
  courseName?: string;
  platformName?: string;
  /** Optional Stripe linkage for percent_off / amount_off codes that
   *  flowed through Checkout. Absent for free internal grants. */
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  /** Free-form metadata for downstream analytics. */
  metadata?: Record<string, unknown>;
  createdAt: Date | any;
}

// ─── Stories ────────────────────────────────────────────────────────

export interface StoryChoice {
  text: string;
  nextSegmentId?: string;
  reflectionTrigger?: boolean;
  /** Optional full-framework scoring hint for new story content. */
  frameworkWeights?: Record<string, number>;
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
  /** When true, reaching this segment triggers the ending reflection flow. */
  reflectionTrigger?: boolean;
}

export type GlobalVisibility = 'private' | 'public';
export type ModerationStatus = 'pending' | 'approved' | 'flagged' | 'restricted';

export type StorySubGenre =
  | 'Cyberpunk'
  | 'Solarpunk'
  | 'Space Opera'
  | 'Hard Sci-Fi'
  | 'Dystopian'
  | 'Biopunk'
  | 'Post-Apocalyptic'
  | 'First Contact'
  | 'Time Travel';

export type StoryTechLevel = 'Near-Future' | 'Mid-Future' | 'Galactic' | 'Post-Human';

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
  authorId?: string;
  /** Optional sub-genre tag (e.g., Cyberpunk, Solarpunk). Used for image keywords. */
  subGenre?: StorySubGenre;
  /** Ethical topics this story engages with (free-form tag cloud). */
  ethicalFocus?: string[];
  /** Moral Grey-Scale rating: 1 (Binary) through 5 (Infinite Complexity). */
  complexity?: number;
  /** Tech setting bucket. */
  techLevel?: StoryTechLevel;
  /** Lifecycle status. Drafts are never visible publicly. */
  status?: 'draft' | 'published' | 'archived';
  /** Whether a published item appears in public/global feeds. */
  globalVisibility?: GlobalVisibility;
  /** Admin-driven moderation state, independent of user visibility choice. */
  moderationStatus?: ModerationStatus;
  /** Pinned/featured by an admin. */
  featured?: boolean;
  publishedAt?: Date | any;
  viewCount?: number;
  tags?: string[];
  createdAt?: Date | any;
  updatedAt?: Date | any;
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
  shortDescription?: string;
  keyQuestion?: string;
  strengths?: string[];
  blindSpots?: string[];
  exampleApplication?: string;
  tags?: string[];
  activeInScoring?: boolean;
  color?: string;
  icon?: string;
  proponents?: string[];
  keyConcepts?: string[];
  exampleScenario?: string;
  imageUrl?: string;
  imageHint?: string;
}

export type EthicalJudgmentInteractionType =
  | 'story_choice'
  | 'framework_explorer'
  | 'framework_quiz'
  | 'debate_stance'
  | 'debate_reply'
  | 'media_scenario_reflection'
  | 'weekly_dilemma_response'
  | 'weekly_dilemma_reply'
  | 'perspective_comparison'
  | 'textbook_reflection'
  | 'promise_reality_score'
  | 'knowledge_quiz'
  | 'other';

export type EthicalJudgmentSourceType =
  | 'story'
  | 'framework_explorer'
  | 'quiz'
  | 'debate'
  | 'scifi_media'
  | 'weekly_dilemma'
  | 'textbook'
  | 'analysis'
  | 'profile'
  | 'other';

export type EthicalJudgmentActivityContext =
  | 'graded_course'
  | 'practice'
  | 'media'
  | 'debate'
  | 'story'
  | 'weekly_dilemma'
  | 'framework_explorer'
  | 'textbook'
  | 'profile'
  | 'other';

export interface EthicalFrameworkScore {
  frameworkId: string;
  score: number;
  confidence?: number;
  rationale?: string;
}

export interface EthicalFrameworkTension {
  frameworks: string[];
  description: string;
}

export interface EthicalJudgmentAnalysis {
  frameworkScores: EthicalFrameworkScore[];
  primaryFrameworks: string[];
  secondaryFrameworks: string[];
  tensions: EthicalFrameworkTension[];
  confidence: number;
  reasoningSummary: string;
  evidenceFromResponse: string[];
  blindSpots: string[];
  challengeQuestion: string;
  suggestedNextFrameworkToExplore?: string;
  profileUpdateWeight: number;
  aiExplanation?: string;
}

export interface EthicalJudgmentEvent {
  id: string;
  userId: string;
  interactionType: EthicalJudgmentInteractionType | string;
  sourceContentType: EthicalJudgmentSourceType | string;
  sourceContentId: string;
  sourceTitle: string;
  promptText: string;
  userChoice?: string;
  responseText?: string;
  selectedOptionId?: string;
  explanation?: string;
  analysis: EthicalJudgmentAnalysis;
  affectsProfile: boolean;
  activityContext: EthicalJudgmentActivityContext | string;
  courseId?: string;
  moduleId?: string;
  modelUsed: string;
  promptVersion: string;
  rawResponse?: Record<string, unknown>;
  createdAt: Date | any;
}

export interface EthicalProfileFrameworkSummary {
  frameworkId: string;
  score: number;
  eventCount: number;
}

export interface EthicalProfileContentSummary {
  eventCount: number;
  frameworkScores: Record<string, number>;
}

export interface EthicalProfileTimePoint {
  date: string;
  frameworkScores: Record<string, number>;
  eventCount: number;
}

export interface EthicalProfileAggregate {
  userId: string;
  eventCount: number;
  overallFrameworkScores: Record<string, number>;
  strongestFrameworks: EthicalProfileFrameworkSummary[];
  leastUsedFrameworks: EthicalProfileFrameworkSummary[];
  frameworkTensions: EthicalFrameworkTension[];
  byContentType: Record<string, EthicalProfileContentSummary>;
  overTime: EthicalProfileTimePoint[];
  contentAreasIncluded: string[];
  confidenceLevel: number;
  recentEvents: EthicalJudgmentEvent[];
  updatedAt: Date | any;
}

export interface EthicsLearningReport {
  id: string;
  userId: string;
  title: string;
  generatedAt: Date | any;
  eventCount: number;
  contentAreasIncluded: string[];
  markdown: string;
  profileSnapshot: EthicalProfileAggregate;
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
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  /** Whether the dilemma appears in the global Community Dilemmas feed. */
  globalVisibility?: GlobalVisibility;
  /** Admin moderation state, independent of user visibility choice. */
  moderationStatus?: ModerationStatus;
  featured?: boolean;
  communityId?: string;
  communityName?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date | any;
  updatedAt?: Date | any;
}

// ─── Saved Scenario Analyses ────────────────────────────────────────

export interface SavedAnalysis {
  id: string;
  authorId: string;
  authorName: string;
  scenarioText: string;
  ethicalDilemmas: string[];
  potentialConsequences: string[];
  applicableEthicalTheories: string[];
  /** When true, appears in the public scenario archive. */
  globalVisibility?: GlobalVisibility;
  status?: 'draft' | 'published';
  createdAt: Date | any;
  updatedAt?: Date | any;
}

// ─── Saved Perspective Comparisons ──────────────────────────────────

export interface SavedPerspective {
  id: string;
  authorId: string;
  authorName: string;
  scenario: string;
  userChoice: string;
  comparisons: { framework: string; analysis: string; verdict: string; strength: 'supports' | 'opposes' | 'neutral' }[];
  synthesis: string;
  globalVisibility?: GlobalVisibility;
  status?: 'draft' | 'published';
  createdAt: Date | any;
  updatedAt?: Date | any;
}

// ─── Content Versions (snapshot for restore) ───────────────────────

export type VersionedContentType = 'story' | 'dilemma' | 'analysis' | 'perspective';

export interface ContentVersion {
  id: string;
  contentType: VersionedContentType;
  contentId: string;
  versionNumber: number;
  authorId: string;
  authorName?: string;
  /** Full snapshot of the content at this version. */
  snapshot: Record<string, any>;
  createdAt: Date | any;
  note?: string;
}

// ─── Quizzes (per-philosopher / per-theory comprehension quizzes) ──

export type QuizSubjectType =
  | 'philosopher'
  | 'theory'
  | 'scifi-author'
  | 'scifi-media'
  | 'book-chapter'
  | 'book-final';
export type QuizDifficulty = 'recall' | 'conceptual' | 'applied';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: QuizDifficulty;
}

export interface Quiz {
  id: string;
  subjectType: QuizSubjectType;
  /** ID of the philosopher or theory this quiz tests. */
  subjectId: string;
  subjectName: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  /** Average minutes to complete. */
  estimatedMinutes?: number;
  passingScorePercent: number;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  subjectType: QuizSubjectType;
  subjectId: string;
  /** Index chosen for each question, in order. -1 = skipped. */
  answers: number[];
  scorePercent: number;
  passed: boolean;
  xpAwarded?: number;
  completedAt: Date | any;
}

// ─── Curriculum extensions ──────────────────────────────────────────

export interface CurriculumProgress {
  userId: string;
  curriculumId: string;
  completedItemIds: string[];
  /** Map of itemId -> completion timestamp. */
  itemCompletedAt?: Record<string, Date | any>;
  /** Map of itemId -> seconds spent (best-effort). */
  itemTimeSpent?: Record<string, number>;
  startedAt: Date | any;
  completedAt?: Date | any;
  certificateId?: string;
}

// ─── Certificates ───────────────────────────────────────────────────

/**
 * Two tiers of credential:
 *   - 'official'  — issued by a super-admin-owned learning path. These
 *                   are platform-endorsed and visually present as such.
 *   - 'community' — issued by any other member's path. Same completion
 *                   mechanics, but visually distinct and labelled as a
 *                   peer-issued Community Certificate.
 * Tier is decided server-side from the curriculum creator's email
 * against SUPER_ADMIN_EMAILS; the client cannot spoof it.
 */
export type CertificateTier = 'official' | 'community';

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  curriculumId: string;
  curriculumTitle: string;
  /** Short hash for verification. */
  verificationHash: string;
  /** Official (platform-endorsed) vs community (peer-issued). Missing
   *  values are grandfathered to 'official' for textbook/master paths
   *  and 'community' otherwise — see src/lib/certificate-tier.ts. */
  tier?: CertificateTier;
  /** Display name of the curriculum creator, for audit/trust display on
   *  the certificate itself. Absent on legacy records. */
  issuerName?: string;
  issuedAt: Date | any;
  revokedAt?: Date | any;
  revokedBy?: string;
  revokeReason?: string;
}

// ─── Direct Messages ────────────────────────────────────────────────

export interface MessageThread {
  id: string;
  /** Sorted UIDs of participants (always 2 for 1:1). */
  participantIds: string[];
  /** Map of uid -> display info for each participant. */
  participants: Record<string, { name: string; avatarUrl?: string }>;
  /** Last message preview, for inbox display. */
  lastMessage?: string;
  lastMessageAt?: Date | any;
  lastMessageFrom?: string;
  /** Map of uid -> count of unread messages. */
  unreadCounts?: Record<string, number>;
  createdAt: Date | any;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  /** Optional attachment to a site artifact. */
  attachedArtifact?: {
    type: 'story' | 'dilemma' | 'debate' | 'analysis' | 'perspective' | 'philosopher' | 'theory';
    id: string;
    title: string;
  };
  createdAt: Date | any;
}

// ─── User blocking & message requests ───────────────────────────────

export interface UserBlock {
  /** Blocker UID is the document ID. */
  blockerId: string;
  blockedIds: string[];
  updatedAt?: Date | any;
}

// ─── Audit Log (admin actions) ──────────────────────────────────────

export type AuditAction =
  | 'visibility_change'
  | 'moderation_change'
  | 'feature_toggle'
  | 'tag_edit'
  | 'delete'
  | 'restore_version'
  | 'admin_grant'
  | 'admin_revoke'
  | 'impersonation_start'
  | 'impersonation_stop';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  actorName?: string;
  targetType: string;
  targetId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  note?: string;
  createdAt: Date | any;
}

// ─── Community Contributions (unified feed) ─────────────────────────

/**
 * Types of artifacts a user can share into a community feed. Adding a new
 * type here is the *only* place a new completable artifact needs to be
 * declared at the data level — the `ShareToCommunityDialog` accepts any
 * `ContributionType` and the feed renderer falls back to a generic card
 * if no per-type renderer exists yet.
 *
 * Naming convention: lowercase, snake_case, singular noun.
 */
export type ContributionType =
  | 'analysis'              // analyzer scenario or curriculum-style analytical write-up
  | 'quiz_result'           // any quiz: framework, philosopher, theory, scifi-author, scifi-media, textbook-chapter, book-final, master-exam
  | 'perspective_comparison'
  | 'dilemma'
  | 'debate'                // both at creation and when participating
  | 'story'                 // both at authorship and at completion (with reader's reflection)
  | 'story_completion'      // reader finished an interactive story; surfaces choices made
  | 'reflection'            // freeform learner reflection (curriculum/textbook prompts)
  | 'highlight'             // textbook quote with optional note
  | 'certificate'           // earned a curriculum/textbook certificate
  | 'workshop';             // participated in / hosted a workshop

export interface CommunityContribution {
  id: string;
  communityId: string;
  communityName?: string;
  type: ContributionType;
  contributorId: string;
  contributorName: string;
  contributorAvatarUrl?: string;
  title: string;
  summary: string;
  /**
   * Reference to the source artifact if it lives in its own collection.
   * e.g., sourceCollection='submittedDilemmas', sourceId='abc123'
   */
  sourceCollection?: string;
  sourceId?: string;
  /**
   * Inline content for types that don't have their own collection
   * (analyses, quiz results, perspective comparisons).
   */
  content?: Record<string, any>;
  commentCount?: number;
  createdAt: Date | any;
}

export interface ContributionComment {
  id: string;
  contributionId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: Date | any;
}

// ─── Notifications ──────────────────────────────────────────────────

export type NotificationType =
  | 'dilemma_submitted'
  | 'dilemma_approved'
  | 'dilemma_rejected'
  | 'community_invite'
  | 'debate_reply'
  | 'certificate_earned'
  | 'seat_assigned'
  | 'classmate_milestone'
  | 'platform_update'
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
  /** Most recent calendar day (YYYY-MM-DD UTC) the user did anything
   *  meaningful. Used to compute the streak — if today is one day
   *  past `lastStreakDay` we increment, if more than one we reset to 1. */
  lastStreakDay?: string;
  /** Consecutive-day streak. Bumped by recordDailyActivity. */
  currentStreakDays?: number;
  /** All-time best streak. */
  longestStreakDays?: number;
  /** ID of the most-recently in-flight (unfinished) story. Cleared when
   *  the user completes that story. Drives the dashboard's "resume
   *  story" surface. */
  lastStoryInProgress?: string;
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

/**
 * Types of artifacts a learning-path module can reference.
 *
 *   - 'instructions'      inline text header / notes (no referenceId used)
 *   - 'story'             → /stories/{id}
 *   - 'quiz'              → /philosophers/{id}/quiz etc (resolved by subject)
 *   - 'debate'            → /debate-arena/{id}
 *   - 'analysis'          → /analyzer with optional starter scenario
 *   - 'discussion'        → open discussion prompt
 *   - 'perspective'       → /perspective-comparison with starter scenario
 *   - 'philosopher'       → /philosophers/{id}
 *   - 'theory'            → /glossary/{id}
 *   - 'scifi-author'      → /scifi-authors/{id}
 *   - 'scifi-media'       → /scifi-media/{id}
 *   - 'blog'              → /blog/{slug} (official blog posts only)
 *   - 'textbook-chapter'  → /textbook/chapters/{slug}
 *   - 'reflection'        learner writes a free-text response, optionally
 *                         shareable to the containing community
 */
export type CurriculumItemType =
  | 'instructions'
  | 'story'
  | 'quiz'
  | 'debate'
  | 'analysis'
  | 'analyzer-prompt'
  | 'discussion'
  | 'perspective'
  | 'philosopher'
  | 'theory'
  | 'scifi-author'
  | 'scifi-media'
  | 'blog'
  | 'textbook-chapter'
  | 'reflection';

export interface CurriculumItem {
  id: string;
  type: CurriculumItemType;
  /**
   * Slug/id of the referenced artifact. Empty string for items that
   * don't reference an external page (e.g. 'instructions',
   * 'reflection', 'analysis' with a freeform prompt).
   */
  referenceId: string;
  title: string;
  order: number;
  isRequired: boolean;
  /**
   * Optional free-text instructions shown above the item on the
   * curriculum detail page. Useful for "before you read this story,
   * think about…" framing or explicit prompts for reflections and
   * perspective exercises.
   */
  instructions?: string;
  /**
   * For 'analysis' / 'perspective' / 'reflection' items: an optional
   * starter prompt passed to the target tool. Lets an instructor say
   * "use this scenario in the Analyzer".
   */
  prompt?: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  order: number;
  items: CurriculumItem[];
}

/**
 * Configuration for the certificate (if any) awarded on completion of
 * this learning path. When `enabled` is false the path behaves as a
 * self-paced guide without any cert.
 */
export interface CurriculumCertificateConfig {
  enabled: boolean;
  /** Defaults to the curriculum title when unset. */
  title?: string;
  /** Shown as the curriculum title on the issued certificate. */
  description?: string;
  /** Author's declared tier. The server will OVERRIDE this to 'community'
   *  if the creator is not on SUPER_ADMIN_EMAILS. Only included on the
   *  type so the UI can preview what will be issued. */
  tier?: CertificateTier;
}

export interface CurriculumPath {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName?: string;
  isPublic: boolean;
  /** True if this path can be cloned as a template. */
  isTemplate?: boolean;
  /** Stable reference back to the source curriculum if this was cloned. */
  clonedFrom?: string;
  /** Set to true on system-curated "Official Learning Paths". */
  isOfficial?: boolean;
  /**
   * Certificate configuration. When absent, treated as `{ enabled: false }`
   * for backwards compatibility with legacy records. Callers that issue a
   * cert should check `certificate?.enabled === true`.
   */
  certificate?: CurriculumCertificateConfig;
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

// ─── Sci-Fi Authors ─────────────────────────────────────────────────

export interface SciFiAuthor {
  id: string;
  name: string;
  /** Years active (e.g., "1797-1851"). */
  era: string;
  imageUrl?: string;
  imageHint?: string;
  bio: string;
  /** Recurring ethical/technological themes in the author's work. */
  themes: string[];
  /** Sub-genres or movements (Cyberpunk, Hard SF, Afrofuturism, etc.). */
  subgenres?: string[];
  /** Ethical frameworks their work engages with. Uses EthicalTheory IDs. */
  relatedFrameworks: string[];
  /** Landmark novels, stories, or collections. */
  notableWorks: string[];
  /** One-sentence summary of how their work bears on technology ethics. */
  techEthicsFocus?: string;
}

// ─── Sci-Fi Media ───────────────────────────────────────────────────

export type SciFiMediaCategory = 'movie' | 'book' | 'tv' | 'other';

export interface SciFiMedia {
  id: string;
  title: string;
  /** 'movie' | 'book' | 'tv' | 'other' */
  category: SciFiMediaCategory;
  /** Release year or range (e.g., "1982", "2016-2022"). */
  year: string;
  /** Creator(s): director for films, author for books, showrunner for TV. */
  creator: string;
  imageUrl?: string;
  imageHint?: string;
  /** Plot summary focused on the ethical stakes. */
  plot: string;
  /** Technology-ethics themes explored. */
  ethicsExplored: string[];
  /** IDs of SciFiAuthor entries who wrote or inspired this work. */
  authorIds?: string[];
  /** Ethical framework IDs this work engages with. */
  relatedFrameworks: string[];
  /** Scenario-style ethical reflection questions that update the learner profile. */
  ethicalScenarioReflection?: EthicalScenarioReflection;
  /** Additional metadata (runtime, page count, network, etc.). */
  meta?: string;
}

export interface EthicalScenarioOption {
  id: string;
  label: string;
  text: string;
  frameworkWeights: Record<string, number>;
  likelyFrameworkAlignments: string[];
  possibleStrengths: string[];
  possibleRisks: string[];
  feedbackText: string;
}

export interface EthicalScenarioQuestion {
  id: string;
  title: string;
  prompt: string;
  options: EthicalScenarioOption[];
  allowFreeResponse: boolean;
  scoringPrompt: string;
  feedbackPrompt: string;
  reflectionFollowUp: string;
  affectsEthicalProfile: boolean;
  relatedFrameworkIds: string[];
}

export interface EthicalScenarioReflection {
  mediaId: string;
  title: string;
  description: string;
  questions: EthicalScenarioQuestion[];
}

export interface SciFiMediaScenarioResponse {
  id: string;
  userId: string;
  mediaId: string;
  questionId: string;
  selectedOptionId?: string;
  responseText?: string;
  ethicalJudgmentEventId?: string;
  createdAt: Date | any;
}

export interface WeeklyDilemmaChoice {
  id: string;
  label: string;
  text: string;
  frameworkWeights: Record<string, number>;
}

export interface WeeklyDilemma {
  id: string;
  title: string;
  slug: string;
  shortSetup: string;
  backgroundContext: string;
  mainEthicalQuestion: string;
  choices: WeeklyDilemmaChoice[];
  tags: string[];
  relatedFrameworks: string[];
  relatedTechnologies: string[];
  aiScoringPrompt: string;
  reflectionPrompt: string;
  publishDate: Date | any;
  closeDate?: Date | any;
  visibilityStatus: 'draft' | 'published' | 'archived';
  isoWeek: string;
  imageUrl?: string;
  imageHint?: string;
  generatedAt?: Date | any;
}

export interface WeeklyDilemmaResponse {
  id: string;
  dilemmaId: string;
  userId: string;
  userName?: string;
  selectedChoiceId?: string;
  responseText: string;
  ethicalJudgmentEventId?: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export interface WeeklyDilemmaReply {
  id: string;
  dilemmaId: string;
  responseId: string;
  parentReplyId?: string;
  userId: string;
  userName?: string;
  replyText: string;
  ethicalJudgmentEventId?: string;
  moderationFlag?: string;
  createdAt: Date | any;
}

// ─── Blog ───────────────────────────────────────────────────────────

/**
 * The platform supports two parallel blog ecosystems:
 *  - 'official'  — first-party articles published by the platform itself,
 *                  always attributed to Professor Paradox. Created via the
 *                  admin editor; visible at /blog.
 *  - 'community' — articles submitted by logged-in users. Go through a
 *                  pending → approved/rejected moderation flow that mirrors
 *                  the existing dilemma queue. Approved posts show up at
 *                  /community-blog.
 *
 * Legacy posts without an explicit `kind` are treated as 'official' if the
 * authorId resolves to the canonical Professor Paradox UID, otherwise
 * 'community'. See lib/official-author#isOfficialAuthor.
 */
export type BlogKind = 'official' | 'community';
export type BlogSubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  authorId: string;
  authorName: string;
  tags?: string[];
  imageUrl?: string;
  imageHint?: string;
  status: 'draft' | 'published';
  /** Publication ecosystem this post belongs to. Defaults to 'official'. */
  kind?: BlogKind;
  /** Community-blog only: tracks the moderation pipeline. */
  submissionStatus?: BlogSubmissionStatus;
  /** Community-blog only: feed visibility once approved. */
  globalVisibility?: GlobalVisibility;
  /** Community-blog only: admin moderation flag, independent of submission. */
  moderationStatus?: ModerationStatus;
  /** Community-blog only: optional reviewer notes on a rejection. */
  rejectionReason?: string;
  /** Community-blog only: UID of the admin who reviewed the submission. */
  reviewedBy?: string;
  /** Community-blog only: cached display name of the reviewer. */
  reviewedByName?: string;
  reviewedAt?: Date | any;
  publishedAt?: Date | any;
  createdAt: Date | any;
  updatedAt?: Date | any;
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
  locationType?: 'online' | 'in_person' | 'hybrid';
  meetingUrl?: string;
  locationAddress?: string;
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
  /**
   * Legacy single-curriculum field. Kept for back-compat with code paths
   * that haven't migrated to the array. Always mirrors `curriculumPathIds[0]`
   * on read; writes are kept in sync inside `updateCommunity`.
   * @deprecated Prefer `curriculumPathIds`.
   */
  curriculumPathId?: string;
  /**
   * Multi-curriculum support. A community can assign more than one
   * learning path; members see all of them and can switch between paths.
   * Server actions (`updateCommunity`, `duplicateCommunity`) write both
   * this field and `curriculumPathId` so older readers continue to work.
   */
  curriculumPathIds?: string[];
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

// ─── Community Forum ────────────────────────────────────────────────

/**
 * A topic (thread) inside a community's general-purpose forum.
 *
 * Authorship:
 *  - Any member of the community may create a regular topic.
 *  - Only a super-admin or a user with `UserProfile.communityManager`
 *    true may create or mark a `pinned` topic. Pinned topics render
 *    above the member-authored list in the forum view.
 *
 * Scope:
 *  - The generic community forum lives under
 *    `communities/{cid}/forumTopics/{tid}`.
 *  - A per-media discussion board lives under
 *    `communities/{cid}/mediaDiscussions/{mediaId}/threads/{tid}`
 *    and reuses the ForumReply shape for posts.
 */
export interface ForumTopic {
  id: string;
  communityId: string;
  /** When set, this topic is a discussion thread attached to a sci-fi
   *  media artifact that the community has added. When absent, this
   *  is a general community forum topic. */
  mediaId?: string;
  title: string;
  /** The opening post. Markdown is allowed but not required. */
  body: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  /** True only when created by a community manager or super-admin.
   *  Authority to set this is enforced server-side. */
  pinned: boolean;
  /** True when a community manager has locked further replies. */
  locked: boolean;
  replyCount: number;
  /** Cached last-reply timestamp for sorting by activity. */
  lastReplyAt?: Date | any;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export interface ForumReply {
  id: string;
  topicId: string;
  communityId: string;
  body: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: Date | any;
  /** Soft-deleted replies keep the id but replace body with a
   *  redaction notice. Populated when a manager removes a post. */
  removedByManagerId?: string;
  removedAt?: Date | any;
  removalReason?: string;
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
  /** Stripe customer ID. Set by the webhook on
   *  `checkout.session.completed`. Used by the billing page to gate
   *  the "Manage payment & invoices" portal link. */
  stripeCustomerId?: string;
  /** Stripe subscription ID. Set by the webhook. */
  stripeSubscriptionId?: string;
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
  /**
   * When true, the totalSeats cap is ignored — assigning seats never
   * fails with "no seats available". Reserved for the platform owner's
   * super-admin license (see ensureSuperAdminLicense). Regular org /
   * department / institutional licenses must always have a finite cap.
   */
  unmetered?: boolean;
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
