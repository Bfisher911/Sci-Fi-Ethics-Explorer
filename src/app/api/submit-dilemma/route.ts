/**
 * POST /api/submit-dilemma
 *
 * Authoring a dilemma is auth-required and identity is established by
 * a verified Firebase ID token in the Authorization: Bearer header —
 * NOT by anything in the request body. The previous implementation
 * accepted `authorId` and `authorEmail` from the body, which let a
 * caller spoof submissions as any user (including admins). Now those
 * body fields are ignored and the values from the verified token win.
 *
 * Anonymous submissions are still allowed for the case where the
 * Admin SDK isn't configured locally (dev / preview without service
 * account) — in that mode the dilemma is stored without an
 * authorId/authorEmail and `authorName` defaults to 'Anonymous'.
 *
 * Required env (production):
 *   FIREBASE_ADMIN_CREDENTIALS — service-account JSON for token verify.
 *
 * Client usage:
 *   const idToken = await user.getIdToken();
 *   await fetch('/api/submit-dilemma', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       Authorization: `Bearer ${idToken}`,
 *     },
 *     body: JSON.stringify({ title, description, theme, ... }),
 *   });
 */

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { verifyIdTokenFromRequest, getAdminAuth } from '@/lib/firebase/admin';
import { notifyOnDilemmaSubmitted } from '@/lib/notifications-dispatch';
import { reportError } from '@/lib/observability/report';

export const runtime = 'nodejs';

interface SubmitDilemmaBody {
  title?: string;
  description?: string;
  theme?: string;
  authorName?: string;
  imageUrl?: string;
  imageHint?: string;
  communityId?: string;
  globalVisibility?: 'public' | 'private';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitDilemmaBody;
    const { title, description, theme } = body;

    if (!title || !description || !theme) {
      return NextResponse.json(
        { message: 'Title, description, and theme are required.' },
        { status: 400 },
      );
    }

    // Cap field lengths to prevent oversized writes from abusive callers.
    const MAX_TITLE = 200;
    const MAX_DESC = 5000;
    const MAX_THEME = 100;
    if (
      title.length > MAX_TITLE ||
      description.length > MAX_DESC ||
      theme.length > MAX_THEME
    ) {
      return NextResponse.json(
        { message: 'Field length exceeds limits.' },
        { status: 400 },
      );
    }

    // Verify identity. When the Admin SDK isn't configured (dev /
    // preview without a service account), allow anonymous submission
    // but never let body fields populate authorId/authorEmail.
    const adminConfigured = Boolean(getAdminAuth());
    const verified = adminConfigured
      ? await verifyIdTokenFromRequest(request)
      : null;

    // In production we require auth — refuse anonymous submissions
    // when the Admin SDK is configured but the caller didn't send a
    // valid token. This is the path that closes the spoofing hole.
    if (adminConfigured && !verified) {
      return NextResponse.json(
        {
          message:
            'Authentication required. Pass a valid Firebase ID token in the Authorization: Bearer header.',
        },
        { status: 401 },
      );
    }

    // Resolve community name if scoped.
    let communityName: string | undefined;
    if (body.communityId) {
      try {
        const commSnap = await getDoc(
          doc(db, 'communities', body.communityId),
        );
        if (commSnap.exists()) communityName = commSnap.data().name;
      } catch {
        // non-fatal
      }
    }

    const visibility: 'public' | 'private' =
      body.globalVisibility === 'private' ? 'private' : 'public';

    const newDilemma: Record<string, unknown> = {
      title,
      description,
      theme,
      // authorName is allowed from the body (display name override),
      // but if the caller is verified we prefer the verified name.
      authorName: verified?.name || body.authorName || 'Anonymous',
      status: 'pending',
      globalVisibility: visibility,
      submittedAt: serverTimestamp(),
    };

    // Only persist identity fields from the verified token. Body
    // fields are explicitly ignored.
    if (verified?.uid) newDilemma.authorId = verified.uid;
    if (verified?.email) newDilemma.authorEmail = verified.email;
    if (body.imageUrl) newDilemma.imageUrl = body.imageUrl;
    if (body.imageHint) newDilemma.imageHint = body.imageHint;
    if (body.communityId) newDilemma.communityId = body.communityId;
    if (communityName) newDilemma.communityName = communityName;

    const docRef = await addDoc(
      collection(db, 'submittedDilemmas'),
      newDilemma,
    );

    // Fire-and-forget notifications.
    notifyOnDilemmaSubmitted({
      dilemmaId: docRef.id,
      dilemmaTitle: title,
      authorName: newDilemma.authorName as string,
      communityId: body.communityId,
      communityName,
    }).catch((err) =>
      // eslint-disable-next-line no-console
      console.error('[submit-dilemma] notify failed:', err),
    );

    return NextResponse.json(
      { message: 'Dilemma submitted successfully', id: docRef.id },
      { status: 201 },
    );
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error submitting dilemma:', error);
    reportError(error, { where: 'api/submit-dilemma' });
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Error submitting dilemma', error: msg },
      { status: 500 },
    );
  }
}
