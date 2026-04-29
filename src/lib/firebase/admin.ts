/**
 * Firebase Admin SDK singleton — server-only.
 *
 * Used by API route handlers that need to verify Firebase ID tokens
 * (e.g. `/api/submit-dilemma`) so we can trust the user identity in a
 * request rather than trusting body fields the client could forge.
 *
 * Environment:
 *   FIREBASE_ADMIN_CREDENTIALS — the JSON service account key,
 *     pasted as a single line (newlines escaped as \n). When missing,
 *     the helper exposes `null` so callers can return 503.
 *   FIREBASE_PROJECT_ID — fallback used when the credentials JSON
 *     doesn't include a project_id (rare).
 *
 * NEVER import this from client components — it lives in server
 * handlers, server actions, and route handlers only.
 */

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

const APP_NAME = 'sfe-admin';

let cached: { app: App | null; auth: Auth | null } | null = null;

function buildAdminApp(): App | null {
  // Already initialized? Reuse it. The default app might be in use
  // elsewhere too; we use a named app so we don't collide.
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return existing;

  const raw = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (!raw) {
    return null;
  }

  let parsed: ServiceAccount;
  try {
    parsed = JSON.parse(raw) as ServiceAccount;
  } catch {
    // eslint-disable-next-line no-console
    console.error(
      '[firebase-admin] FIREBASE_ADMIN_CREDENTIALS is not valid JSON. Refusing to initialize.',
    );
    return null;
  }

  const projectId =
    (parsed as { project_id?: string }).project_id ??
    (parsed as { projectId?: string }).projectId ??
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    // eslint-disable-next-line no-console
    console.error(
      '[firebase-admin] No project_id found in FIREBASE_ADMIN_CREDENTIALS or FIREBASE_PROJECT_ID env. Refusing to initialize.',
    );
    return null;
  }

  return initializeApp(
    {
      credential: cert(parsed),
      projectId,
    },
    APP_NAME,
  );
}

function ensureCached(): { app: App | null; auth: Auth | null } {
  if (cached) return cached;
  const app = buildAdminApp();
  cached = {
    app,
    auth: app ? getAuth(app) : null,
  };
  return cached;
}

/**
 * Returns the Admin Auth instance, or null if the service-account
 * credentials aren't configured.
 */
export function getAdminAuth(): Auth | null {
  return ensureCached().auth;
}

export interface VerifiedUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
}

/**
 * Verifies a Firebase ID token from an Authorization: Bearer header
 * (or a raw token string). Returns the verified user, or null if the
 * token is missing / invalid / Admin SDK isn't configured.
 *
 * Usage in a route handler:
 *
 *   const verified = await verifyIdTokenFromRequest(request);
 *   if (!verified) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   // Trust verified.uid — never trust body.userId.
 */
export async function verifyIdTokenFromRequest(
  req: Request,
): Promise<VerifiedUser | null> {
  const auth = getAdminAuth();
  if (!auth) return null;

  const header = req.headers.get('authorization') || '';
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token) return null;

  try {
    const decoded = await auth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified,
      name: (decoded as { name?: string }).name,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[firebase-admin] verifyIdToken failed:', err);
    return null;
  }
}
