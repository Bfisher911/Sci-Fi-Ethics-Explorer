'use server';

/**
 * Server actions for the super-admin "View as" feature.
 *
 * Why a cookie + view-as instead of true impersonation: the platform
 * does not run a Firebase Admin SDK service account, so we can't mint
 * custom auth tokens for arbitrary uids. View-as gives the super-admin
 * the same read view a target user would have (their dashboard, their
 * progress, their certificates, their notifications) while keeping
 * every WRITE attributed to the real super-admin uid — that way audit
 * trails stay honest and there's no risk of accidentally posting
 * under the impersonated user's name.
 *
 * Only the canonical super-admin (see src/lib/super-admins.ts) can
 * set the cookie. Setting it is logged. Clearing it is allowed for
 * anyone (you should be able to opt out).
 */

import { cookies } from 'next/headers';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { isSuperAdminEmail } from '@/lib/super-admins';
import { logAdminAction } from '@/lib/audit-log';

// Cookie name lives in src/hooks/use-impersonation.ts as well — keep
// them in sync. (Can't export the constant from a 'use server' file.)
const IMPERSONATION_COOKIE = 'sfee-view-as';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 4; // 4-hour window, then auto-clear

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

interface ImpersonationPayload {
  /** UID of the user the super-admin is viewing as. */
  asUid: string;
  /** Cached display name so the floating banner doesn't need a round-trip. */
  asName: string;
  /** Cached email, for the banner. */
  asEmail: string | null;
  /** UID of the real super-admin who initiated the view-as session. */
  byUid: string;
  /** Cached display name of the super-admin. */
  byName: string;
  /** ISO timestamp when the session was started. */
  startedAt: string;
}

export async function startImpersonation(
  superAdminUid: string,
  targetUid: string,
): Promise<ActionResult<ImpersonationPayload>> {
  try {
    if (!superAdminUid || !targetUid) {
      return { success: false, error: 'Missing uid.' };
    }
    if (superAdminUid === targetUid) {
      return {
        success: false,
        error: 'You\u2019re already signed in as that user.',
      };
    }

    const adminSnap = await getDoc(doc(db, 'users', superAdminUid));
    if (!adminSnap.exists()) {
      return { success: false, error: 'Super-admin profile not found.' };
    }
    const adminData = adminSnap.data();
    if (!isSuperAdminEmail(adminData.email)) {
      return {
        success: false,
        error:
          'Unauthorized: only the platform super-admin can impersonate users.',
      };
    }

    const targetSnap = await getDoc(doc(db, 'users', targetUid));
    if (!targetSnap.exists()) {
      return { success: false, error: 'Target user not found.' };
    }
    const targetData = targetSnap.data();

    const payload: ImpersonationPayload = {
      asUid: targetUid,
      asName:
        targetData.name ||
        targetData.displayName ||
        targetData.email ||
        'Anonymous user',
      asEmail: targetData.email ?? null,
      byUid: superAdminUid,
      byName: adminData.name || adminData.displayName || adminData.email || 'Super-admin',
      startedAt: new Date().toISOString(),
    };

    const jar = await cookies();
    jar.set(IMPERSONATION_COOKIE, JSON.stringify(payload), {
      httpOnly: false, // we want client JS to read it via the hook
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
      secure: process.env.NODE_ENV === 'production',
    });

    await logAdminAction({
      action: 'impersonation_start',
      actorId: superAdminUid,
      targetType: 'user',
      targetId: targetUid,
      note: `Super-admin started view-as session for ${payload.asEmail ?? targetUid}`,
    });

    return { success: true, data: payload };
  } catch (error: any) {
    console.error('[impersonation] startImpersonation error:', error);
    return { success: false, error: String(error) };
  }
}

export async function stopImpersonation(): Promise<ActionResult<void>> {
  try {
    const jar = await cookies();
    const existing = jar.get(IMPERSONATION_COOKIE);
    jar.delete(IMPERSONATION_COOKIE);
    if (existing?.value) {
      try {
        const payload = JSON.parse(existing.value) as ImpersonationPayload;
        await logAdminAction({
          action: 'impersonation_stop',
          actorId: payload.byUid,
          targetType: 'user',
          targetId: payload.asUid,
          note: 'Super-admin ended view-as session',
        });
      } catch {
        // cookie was malformed — ignore
      }
    }
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[impersonation] stopImpersonation error:', error);
    return { success: false, error: String(error) };
  }
}
