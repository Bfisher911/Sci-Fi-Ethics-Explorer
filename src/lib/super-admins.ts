/**
 * Email allowlist of accounts that are always treated as admins regardless
 * of the `isAdmin` flag on their Firestore profile. Useful for the platform
 * owner so they never get locked out of moderation tools by a misconfigured
 * profile doc.
 *
 * Both server-side admin checks (`isUserAdmin` in src/lib/admin.ts) and the
 * client-side `useAdmin` hook consult this list.
 *
 * Match is case-insensitive; whitespace is trimmed.
 */
export const SUPER_ADMIN_EMAILS: string[] = [
  'bfisher3@tulane.edu',
  'zoomedic911@gmail.com',
];

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
}
