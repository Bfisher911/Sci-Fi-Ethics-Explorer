/**
 * Canonical "official site author" identity.
 *
 * Any first-party content artifact published by the platform itself
 * (seeded data, admin-published articles, AI-generated official content,
 * or anything authored by the platform rather than a real community user)
 * is attributed to **Professor Paradox**.
 *
 * Real community submissions (user-submitted dilemmas, user-created
 * stories, user posts) keep their own author identity — see
 * `isOfficialAuthor()` and `displayAuthorName()` for the runtime guard.
 *
 * Single source of truth: do not hardcode the literal name or UID
 * elsewhere in the codebase. Import the constants/helpers from here
 * so a future rename is a one-line change.
 */

import type { UserProfile } from '@/types';

/** Canonical UID for the platform's official author identity. */
export const OFFICIAL_AUTHOR_UID = 'system-professor-paradox';

/** Canonical display name. */
export const OFFICIAL_AUTHOR_NAME = 'Professor Paradox';

/** Short bio surfaced on the public author profile page. */
export const OFFICIAL_AUTHOR_BIO =
  'Professor Paradox explores the ethics of technology through science fiction, speculative dilemmas, and future-facing debates. The official narrator of platform-published content for Sci-Fi Ethics Explorer.';

/** Avatar served from /public — see public/avatars/professor-paradox.svg. */
export const OFFICIAL_AUTHOR_AVATAR_URL = '/avatars/professor-paradox.svg';

/** Email address used for the synthetic profile (display only). */
export const OFFICIAL_AUTHOR_EMAIL = 'paradox@scifi-ethics-explorer.app';

/** Dominant ethical framework label, for the directory filter. */
export const OFFICIAL_AUTHOR_DOMINANT_FRAMEWORK = 'Pluralist';

/**
 * Synthetic UserProfile object for Professor Paradox. Used by the
 * `/users/[id]` and `/profile` routes when the requested UID matches
 * the canonical official UID, so that visiting Professor Paradox's
 * profile page renders cleanly without requiring a real Firestore
 * `users/{OFFICIAL_AUTHOR_UID}` document.
 */
export const OFFICIAL_AUTHOR_PROFILE: UserProfile = {
  uid: OFFICIAL_AUTHOR_UID,
  email: OFFICIAL_AUTHOR_EMAIL,
  displayName: OFFICIAL_AUTHOR_NAME,
  firstName: 'Professor',
  lastName: 'Paradox',
  bio: OFFICIAL_AUTHOR_BIO,
  avatarUrl: OFFICIAL_AUTHOR_AVATAR_URL,
  favoriteGenre: 'Speculative Ethics',
  storiesCompleted: 0,
  dilemmasAnalyzed: 0,
  communitySubmissions: 0,
  role: 'official',
  accountRole: 'member',
  isAdmin: false,
  isPublicProfile: true,
  anonymousOnLeaderboard: false,
  dominantFramework: OFFICIAL_AUTHOR_DOMINANT_FRAMEWORK,
  onboardingComplete: true,
};

// ─── Identity guards ──────────────────────────────────────────────────

/**
 * Returns true if the provided UID, name, or any combination thereof
 * identifies the official Professor Paradox author. Tolerates legacy
 * variants such as the bare `'system'` UID used by older preset data.
 */
export function isOfficialAuthor(idOrName?: string | null): boolean {
  if (!idOrName) return false;
  const v = idOrName.trim().toLowerCase();
  if (!v) return false;
  return (
    v === OFFICIAL_AUTHOR_UID.toLowerCase() ||
    v === OFFICIAL_AUTHOR_NAME.toLowerCase() ||
    v === 'system' ||
    v === 'professor paradox' ||
    v === 'professor-paradox'
  );
}

/**
 * Resolve the display author name for a content item.
 *
 * - If the item's authorId or stored name matches the official identity,
 *   always render `Professor Paradox` (so legacy data with stale display
 *   names still normalizes correctly).
 * - Otherwise return the stored author name unchanged. Community content
 *   never gets overridden.
 *
 * Pass *both* the id and the name to maximize match coverage; either
 * argument may be undefined.
 */
export function displayAuthorName(
  authorId?: string | null,
  authorName?: string | null
): string {
  if (isOfficialAuthor(authorId) || isOfficialAuthor(authorName)) {
    return OFFICIAL_AUTHOR_NAME;
  }
  return (authorName || '').trim();
}

/**
 * Resolve the public-profile UID the byline should link to. For official
 * content this is always the canonical UID; for community content it is
 * whatever was stored. May return undefined (e.g. legacy seeded items
 * with no UID at all) — callers should handle that.
 */
export function displayAuthorId(
  authorId?: string | null,
  authorName?: string | null
): string | undefined {
  if (isOfficialAuthor(authorId) || isOfficialAuthor(authorName)) {
    return OFFICIAL_AUTHOR_UID;
  }
  return (authorId || undefined) as string | undefined;
}

/**
 * Resolve the avatar URL for a given content author. Returns the official
 * avatar for Professor Paradox, undefined otherwise (callers fall back to
 * initials).
 */
export function displayAuthorAvatar(
  authorId?: string | null,
  authorName?: string | null
): string | undefined {
  if (isOfficialAuthor(authorId) || isOfficialAuthor(authorName)) {
    return OFFICIAL_AUTHOR_AVATAR_URL;
  }
  return undefined;
}

// ─── Authorship assignment helpers ────────────────────────────────────

/**
 * Returns the set of fields needed to attribute a piece of content to
 * Professor Paradox. The shape varies by content type — Stories use
 * `author`/`authorId`, BlogPosts use `authorName`/`authorId`, Debates
 * use `creatorName`/`creatorId`, Workshops use `hostName`/`hostId`,
 * Contributions use `contributorName`/`contributorId`, etc.
 *
 * Use these helpers in seed data and in any creation path where the
 * platform itself is publishing content. Do not interfere with real
 * user authorship: only call these when the content is platform-owned.
 */
export const officialAuthorship = {
  /** Story.author + Story.authorId */
  story: () => ({
    author: OFFICIAL_AUTHOR_NAME,
    authorId: OFFICIAL_AUTHOR_UID,
  }),
  /** BlogPost.authorName + BlogPost.authorId */
  blogPost: () => ({
    authorName: OFFICIAL_AUTHOR_NAME,
    authorId: OFFICIAL_AUTHOR_UID,
  }),
  /** SubmittedDilemma.authorName + SubmittedDilemma.authorId */
  dilemma: () => ({
    authorName: OFFICIAL_AUTHOR_NAME,
    authorId: OFFICIAL_AUTHOR_UID,
  }),
  /** Debate.creatorName + Debate.creatorId */
  debate: () => ({
    creatorName: OFFICIAL_AUTHOR_NAME,
    creatorId: OFFICIAL_AUTHOR_UID,
  }),
  /** CurriculumPath.creatorName + CurriculumPath.creatorId */
  curriculum: () => ({
    creatorName: OFFICIAL_AUTHOR_NAME,
    creatorId: OFFICIAL_AUTHOR_UID,
  }),
  /** Workshop.hostName + Workshop.hostId */
  workshop: () => ({
    hostName: OFFICIAL_AUTHOR_NAME,
    hostId: OFFICIAL_AUTHOR_UID,
  }),
  /** CommunityContribution.contributorName + .contributorId */
  contribution: () => ({
    contributorName: OFFICIAL_AUTHOR_NAME,
    contributorId: OFFICIAL_AUTHOR_UID,
  }),
};

/**
 * Convenience: re-attribute a partial content payload to Professor Paradox.
 * Mutates a copy and returns it; safe to chain.
 *
 * Example:
 *   const data = withOfficialAuthor('blogPost', { title, body });
 *   await createBlogPost(adminUid, data);
 */
export function withOfficialAuthor<T extends object>(
  kind: keyof typeof officialAuthorship,
  data: T
): T {
  return { ...data, ...officialAuthorship[kind]() };
}
