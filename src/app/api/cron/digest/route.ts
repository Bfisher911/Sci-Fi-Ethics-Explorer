/**
 * GET /api/cron/digest
 *
 * Triggers the weekly digest send. Two modes:
 *   - ?preview=1            → returns the digest HTML for the calling
 *                             user (must be signed in via cookie). Used
 *                             for development and the "Send a sample"
 *                             button in /profile?tab=preferences.
 *   - default (no params)   → cron-mode. Iterates opted-in users,
 *                             builds + sends each digest. Authorized
 *                             via the CRON_SECRET header to prevent
 *                             abuse.
 *
 * Cron mode requires:
 *   - CRON_SECRET           env — passed as `Authorization: Bearer <secret>`
 *                             by Netlify scheduled functions / GitHub
 *                             Actions cron / external scheduler.
 *   - RESEND_API_KEY        env — actual email send. Without it, the
 *                             email client logs to stderr and reports
 *                             { simulated: true }.
 *
 * Scheduled-function wiring (Netlify):
 *   See netlify.toml [[edge_functions]] block (TODO — requires
 *   converting to a Netlify scheduled function once a paid plan with
 *   scheduled functions is enabled). For now this endpoint can be
 *   triggered by any external scheduler that can hit a URL and pass
 *   the bearer secret.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { buildDigestHtml, type DigestUserSummary, type DigestContext } from '@/lib/email/digest';
import { sendEmail } from '@/lib/email/resend-client';
import { getDilemmaOfTheDay } from '@/app/actions/stories';
import { getDebates } from '@/app/actions/debates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function siteOrigin(req: Request): string {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

async function loadDigestContext(req: Request): Promise<DigestContext> {
  const [dilemmaRes, debatesRes] = await Promise.all([
    getDilemmaOfTheDay(),
    getDebates(),
  ]);
  return {
    origin: siteOrigin(req),
    dilemma: dilemmaRes.success && dilemmaRes.data
      ? {
          id: dilemmaRes.data.id,
          title: dilemmaRes.data.title,
          description: dilemmaRes.data.description ?? '',
        }
      : null,
    openDebatesPreview: debatesRes.success
      ? debatesRes.data.slice(0, 3).map((d) => ({ id: d.id, title: d.title }))
      : [],
  };
}

async function buildSummaryForUser(
  userId: string,
  email: string,
  displayName: string,
): Promise<DigestUserSummary | null> {
  if (!db || !userId || !email) return null;
  const progSnap = await getDoc(doc(db, 'userProgress', userId)).catch(
    () => null,
  );
  const prog = progSnap?.exists() ? progSnap.data() : {};
  const tbSnap = await getDoc(doc(db, 'textbookProgress', userId)).catch(
    () => null,
  );
  const tb = tbSnap?.exists() ? tbSnap.data() : {};

  const passed: string[] = (tb?.chapterQuizzesPassed as string[]) || [];
  // Heuristic: pick the first chapter NOT yet passed as the deep-link
  // target. If everything's passed, point at the final exam.
  const allSlugs = (Array.from({ length: 12 }) as unknown[]).map((_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return passed.find((p) => p.startsWith(`${n}-`)) ?? null;
  });
  const firstUnpassedIdx = allSlugs.findIndex((s) => s === null);
  const nextChapterSlug =
    firstUnpassedIdx === -1
      ? undefined
      : (tb?.lastChapterRead as string | undefined) || undefined;

  return {
    userId,
    email,
    displayName: displayName || email.split('@')[0],
    currentStreakDays: (prog?.currentStreakDays as number) ?? 0,
    chaptersPassedTotal: passed.length,
    nextChapterSlug,
  };
}

/**
 * Preview path — signed-in user requests their own digest as HTML.
 * Caller must pass `userId` (resolved client-side from useAuth) since
 * we don't have firebase-admin here to verify session cookies.
 */
async function handlePreview(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'preview mode requires ?userId=...' },
      { status: 400 },
    );
  }
  if (!db) {
    return NextResponse.json(
      { ok: false, error: 'Firestore not configured.' },
      { status: 500 },
    );
  }
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) {
    return NextResponse.json(
      { ok: false, error: 'User not found.' },
      { status: 404 },
    );
  }
  const u = userSnap.data() as { email?: string; name?: string };
  const summary = await buildSummaryForUser(
    userId,
    u.email || '',
    u.name || '',
  );
  if (!summary) {
    return NextResponse.json(
      { ok: false, error: 'Could not build summary.' },
      { status: 500 },
    );
  }
  const ctx = await loadDigestContext(req);
  const { subject, html } = buildDigestHtml(summary, ctx);
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Digest-Subject': subject,
    },
  });
}

/**
 * Cron path — find opted-in users and send each their digest.
 * Bearer-secret guarded.
 */
async function handleCron(req: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'CRON_SECRET not configured — refusing to run digest cron without auth.',
      },
      { status: 503 },
    );
  }
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  if (!db) {
    return NextResponse.json(
      { ok: false, error: 'Firestore not configured.' },
      { status: 500 },
    );
  }

  // Find all opted-in users. The flag is stored under
  // `users.{uid}.emailDigestOptIn === true`. A composite index
  // isn't required because we filter on a single field.
  const optedIn = await getDocs(
    query(collection(db, 'users'), where('emailDigestOptIn', '==', true)),
  );

  const ctx = await loadDigestContext(req);

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const userDoc of optedIn.docs) {
    const data = userDoc.data() as {
      uid?: string;
      email?: string;
      name?: string;
    };
    const userId = data.uid || userDoc.id;
    const email = data.email || '';
    if (!email) {
      skipped++;
      continue;
    }
    try {
      const summary = await buildSummaryForUser(
        userId,
        email,
        data.name || '',
      );
      if (!summary) {
        skipped++;
        continue;
      }
      const { subject, html, text } = buildDigestHtml(summary, ctx);
      const res = await sendEmail({
        to: email,
        subject,
        html,
        text,
        tags: [{ name: 'type', value: 'weekly_digest' }],
      });
      if (res.ok) sent++;
      else {
        failed++;
        if (res.error) errors.push(`${email}: ${res.error}`);
      }
    } catch (err) {
      failed++;
      errors.push(
        `${email}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    failed,
    errors: errors.slice(0, 10),
  });
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.searchParams.get('preview') === '1') {
    return handlePreview(req);
  }
  return handleCron(req);
}
