/**
 * Canonical site URL.
 *
 * Source of truth for absolute URLs across the app — used by:
 *   - root metadata (`metadataBase`, OpenGraph `url`)
 *   - `src/app/sitemap.ts` (every entry needs an absolute URL)
 *   - `src/app/robots.ts` (sitemap reference)
 *   - the email digest (so deep links in emails resolve correctly)
 *   - any future server-side absolute-URL needs (canonical tags, etc.)
 *
 * Reads from `NEXT_PUBLIC_SITE_URL` so per-environment values flow
 * through. Falls back to the Netlify production domain so a
 * misconfigured deploy still gets sane previews instead of broken
 * links.
 *
 * Set in Netlify env vars:
 *   NEXT_PUBLIC_SITE_URL=https://www.scifiethicsexplorer.com
 */
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://scifi-ethics-explorer.netlify.app';

/** Convenience: build an absolute URL from a relative path. */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
