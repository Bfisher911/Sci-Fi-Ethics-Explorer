/**
 * Lightweight error reporter.
 *
 * Sends client + server errors to Sentry using its public envelope
 * endpoint over plain HTTP — no SDK dependency. When `SENTRY_DSN` /
 * `NEXT_PUBLIC_SENTRY_DSN` are not set, every call is a no-op.
 *
 * Why no `@sentry/nextjs` SDK:
 *   - The Sentry Next.js SDK pulls in ~200kb of client JS, a build
 *     wrapper, source-map upload tooling, and a tunneling middleware.
 *     For our use case (catch errors, send a simple event) we only
 *     need the public envelope endpoint, which is documented and
 *     stable. We can swap to the full SDK later if we need traces /
 *     profiling.
 *
 * Usage:
 *   import { reportError } from '@/lib/observability/report';
 *   reportError(err, { where: 'submitDilemma', userId: uid });
 *
 * The reporter is fire-and-forget — never throws, never blocks. Safe
 * to call from any layer (server actions, API routes, error
 * boundaries, client components).
 */

interface ReportContext {
  /** Free-form tag describing where the error came from. */
  where?: string;
  /** UID of the user who hit the error, when known. */
  userId?: string;
  /** Anything else worth attaching. Keys are case-sensitive. */
  [k: string]: unknown;
}

interface ParsedDsn {
  publicKey: string;
  host: string;
  projectId: string;
  protocol: string;
}

function parseDsn(dsn: string): ParsedDsn | null {
  // Sentry DSN format: https://<publicKey>@<host>/<projectId>
  try {
    const u = new URL(dsn);
    const publicKey = u.username;
    const projectId = u.pathname.replace(/^\//, '');
    if (!publicKey || !projectId) return null;
    return {
      publicKey,
      host: u.host,
      projectId,
      protocol: u.protocol.replace(':', ''),
    };
  } catch {
    return null;
  }
}

function getDsn(): string | undefined {
  // Server-side prefers SENTRY_DSN; client falls back to the public one.
  return (
    process.env.SENTRY_DSN ||
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    undefined
  );
}

const ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT ||
  process.env.NODE_ENV ||
  'development';

function buildEnvelope(
  parsed: ParsedDsn,
  err: unknown,
  context: ReportContext,
): { url: string; body: string } | null {
  const eventId =
    crypto.randomUUID?.().replace(/-/g, '') ||
    `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 14)}`;
  const now = new Date().toISOString();

  const errorMsg =
    err instanceof Error ? err.message : String(err ?? 'Unknown error');
  const stack =
    err instanceof Error && err.stack
      ? err.stack.split('\n').slice(0, 50).join('\n')
      : undefined;

  const event = {
    event_id: eventId,
    timestamp: now,
    level: 'error' as const,
    platform:
      typeof window === 'undefined' ? 'node' : 'javascript',
    environment: ENVIRONMENT,
    server_name: typeof window === 'undefined' ? 'sfe-server' : undefined,
    tags: {
      where: context.where || 'unknown',
    },
    user: context.userId ? { id: context.userId } : undefined,
    extra: { ...context },
    exception: {
      values: [
        {
          type: err instanceof Error ? err.name : 'Error',
          value: errorMsg,
          stacktrace: stack
            ? {
                frames: stack
                  .split('\n')
                  .filter((l) => l.includes('at '))
                  .map((l) => ({ filename: l.trim() })),
              }
            : undefined,
        },
      ],
    },
  };

  const headerPart = JSON.stringify({
    event_id: eventId,
    sent_at: now,
    sdk: { name: 'sfe.minimal', version: '1.0.0' },
    dsn: `${parsed.protocol}://${parsed.publicKey}@${parsed.host}/${parsed.projectId}`,
  });
  const itemHeader = JSON.stringify({ type: 'event' });
  const itemPayload = JSON.stringify(event);
  const body = `${headerPart}\n${itemHeader}\n${itemPayload}`;
  const url = `${parsed.protocol}://${parsed.host}/api/${parsed.projectId}/envelope/?sentry_key=${parsed.publicKey}&sentry_version=7&sentry_client=sfe.minimal/1.0.0`;
  return { url, body };
}

/**
 * Report an error to Sentry. Fire-and-forget; never throws.
 */
export function reportError(err: unknown, context: ReportContext = {}): void {
  const dsn = getDsn();
  if (!dsn) return; // No DSN → no-op.
  const parsed = parseDsn(dsn);
  if (!parsed) return;
  const env = buildEnvelope(parsed, err, context);
  if (!env) return;
  try {
    void fetch(env.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
      body: env.body,
      // `keepalive` lets the request finish if the page navigates away
      // — important for client-side error boundaries.
      keepalive: typeof window !== 'undefined',
    }).catch(() => {
      // swallow — no point reporting failures from our reporter
    });
  } catch {
    // swallow
  }
}

/**
 * Returns true when error tracking is configured. Useful for
 * conditional UI ("we've been notified" vs "please report this").
 */
export function isReportingEnabled(): boolean {
  return Boolean(getDsn());
}
