/**
 * Stale-chunk recovery for error boundaries.
 *
 * After a deploy, browsers holding a previous build's HTML reference
 * JS chunks by their old content hash (e.g. `6602-06b82741d7da43d3.js`).
 * Netlify removes prior-deploy assets, so the first client-side
 * navigation into a not-yet-loaded route throws a ChunkLoadError and
 * lands users on the error boundary. The correct recovery is a full
 * page reload, which fetches the current build's HTML and chunk map.
 */

const CHUNK_ERROR_PATTERN =
  /Loading chunk [\w-]+ failed|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i;

const RELOAD_FLAG = 'chunk-error-reloaded-at';

/** How long a reload "counts" before we allow another attempt. */
const RELOAD_WINDOW_MS = 60_000;

export function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    CHUNK_ERROR_PATTERN.test(error.message ?? '')
  );
}

/**
 * If the error is a stale-chunk error, reload the page once to pick up
 * the current deploy. Returns true when a reload was triggered (the
 * boundary should render nothing / minimal UI), false when the error
 * should be shown normally.
 *
 * A sessionStorage timestamp guards against reload loops: if we already
 * reloaded within the last minute and still hit a chunk error, something
 * else is wrong (offline, CDN outage) and the boundary should render.
 */
export function recoverFromChunkError(error: Error): boolean {
  if (typeof window === 'undefined' || !isChunkLoadError(error)) {
    return false;
  }

  let lastReload = 0;
  try {
    lastReload = Number(sessionStorage.getItem(RELOAD_FLAG)) || 0;
  } catch {
    // sessionStorage unavailable (private mode quirks) — reload anyway,
    // worst case the user sees the error page after a second failure.
  }

  if (Date.now() - lastReload < RELOAD_WINDOW_MS) {
    return false;
  }

  try {
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  } catch {
    return false; // can't guard against a loop, so don't auto-reload
  }

  window.location.reload();
  return true;
}
