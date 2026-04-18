/**
 * The single canonical super-admin identity for the platform.
 *
 * `bfisher3@tulane.edu` is the real account behind the public pen name
 * "Professor Paradox" (the official author identity for system-created
 * content — see `src/lib/official-author.ts`). This account has:
 *   - unconditional admin powers across every collection
 *   - an implicit "paid" status (never billed, never gated)
 *   - unlimited seats on any seat-license they own
 *   - the ability to impersonate any user (see use-effective-user)
 *
 * Both the server-side admin check (`isUserAdmin` in src/lib/admin.ts) and
 * the client-side `useAdmin` / `useSubscription` hooks consult this list
 * BEFORE any Firestore read so the platform owner can never be locked out
 * by a corrupted profile doc, a missing rule, or a clobbered field.
 *
 * Match is case-insensitive; whitespace is trimmed.
 *
 * KEEP THIS LIST INTENTIONALLY SHORT. Adding more emails here grants
 * sitewide root access. Use the per-license-admin model (see
 * `src/lib/permissions/scope.ts`) for org/department/institutional admins
 * — those have bounded scope and shouldn't be in this allowlist.
 */
export const SUPER_ADMIN_EMAILS: ReadonlyArray<string> = [
  'bfisher3@tulane.edu',
] as const;

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
}
