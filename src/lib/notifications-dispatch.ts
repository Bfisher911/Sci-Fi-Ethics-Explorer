
'use server';

import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { createNotificationsForUsers, createNotification } from '@/app/actions/notifications';
import { sendEmail } from '@/lib/email';

/**
 * Find UIDs of all users who should moderate a given dilemma.
 * - Platform admins always receive it.
 * - If the dilemma is scoped to a community, that community's instructors also receive it.
 */
async function getModeratorsForDilemma(communityId?: string): Promise<{
  moderators: { uid: string; email: string | null; name: string }[];
}> {
  const result: { uid: string; email: string | null; name: string }[] = [];
  const seen = new Set<string>();

  // Platform admins
  try {
    const adminQ = query(collection(db, 'users'), where('isAdmin', '==', true));
    const adminSnap = await getDocs(adminQ);
    for (const d of adminSnap.docs) {
      if (seen.has(d.id)) continue;
      const data = d.data();
      result.push({
        uid: d.id,
        email: data.email ?? null,
        name: data.name || data.displayName || 'Admin',
      });
      seen.add(d.id);
    }
  } catch (err) {
    console.error('[notifications-dispatch] failed to fetch admins:', err);
  }

  // Community instructors
  if (communityId) {
    try {
      const commSnap = await getDoc(doc(db, 'communities', communityId));
      if (commSnap.exists()) {
        const instructorIds: string[] = commSnap.data().instructorIds || [];
        for (const uid of instructorIds) {
          if (seen.has(uid)) continue;
          const userSnap = await getDoc(doc(db, 'users', uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            result.push({
              uid,
              email: data.email ?? null,
              name: data.name || data.displayName || 'Instructor',
            });
            seen.add(uid);
          }
        }
      }
    } catch (err) {
      console.error('[notifications-dispatch] failed to fetch instructors:', err);
    }
  }

  return { moderators: result };
}

/**
 * Notify all moderators that a new dilemma has been submitted.
 */
export async function notifyOnDilemmaSubmitted(input: {
  dilemmaId: string;
  dilemmaTitle: string;
  authorName: string;
  communityId?: string;
  communityName?: string;
}): Promise<void> {
  const { moderators } = await getModeratorsForDilemma(input.communityId);
  if (moderators.length === 0) return;

  const title = 'New dilemma awaiting review';
  const scope = input.communityName ? ` in ${input.communityName}` : '';
  const body = `${input.authorName} submitted "${input.dilemmaTitle}"${scope}.`;
  const link = input.communityId
    ? `/communities/${input.communityId}/moderation`
    : '/admin/dilemmas';

  await createNotificationsForUsers(
    moderators.map((m) => m.uid),
    {
      type: 'dilemma_submitted',
      title,
      body,
      link,
      metadata: { dilemmaId: input.dilemmaId, communityId: input.communityId || null },
    }
  );

  // Best-effort email (no-ops if RESEND_API_KEY unset)
  for (const m of moderators) {
    if (!m.email) continue;
    await sendEmail({
      to: m.email,
      subject: `[Sci-Fi Ethics] ${title}`,
      text: `${body}\n\nReview it here: ${process.env.APP_BASE_URL || 'https://scifi-ethics-explorer.netlify.app'}${link}`,
    }).catch(() => {});
  }
}

/**
 * Notify the submitter that their dilemma was approved or rejected.
 */
export async function notifyOnDilemmaReviewed(input: {
  dilemmaId: string;
  dilemmaTitle: string;
  authorId: string;
  authorEmail?: string;
  decision: 'approved' | 'rejected';
  rejectionReason?: string;
}): Promise<void> {
  const approved = input.decision === 'approved';
  const title = approved ? 'Your dilemma was approved' : 'Your dilemma was rejected';
  const body = approved
    ? `Your dilemma "${input.dilemmaTitle}" has been approved and is now visible to the community.`
    : `Your dilemma "${input.dilemmaTitle}" was rejected${
        input.rejectionReason ? `: ${input.rejectionReason}` : '.'
      }`;
  const link = approved ? '/community-dilemmas' : '/my-submissions';

  await createNotification({
    userId: input.authorId,
    type: approved ? 'dilemma_approved' : 'dilemma_rejected',
    title,
    body,
    link,
    metadata: {
      dilemmaId: input.dilemmaId,
      rejectionReason: input.rejectionReason || null,
    },
  });

  if (input.authorEmail) {
    await sendEmail({
      to: input.authorEmail,
      subject: `[Sci-Fi Ethics] ${title}`,
      text: `${body}\n\nOpen the site: ${process.env.APP_BASE_URL || 'https://scifi-ethics-explorer.netlify.app'}${link}`,
    }).catch(() => {});
  }
}

/**
 * Send a seat-assignment invite email to the recipient. Includes the
 * inviter's name, the org name, and a sign-in CTA.
 *
 * Idempotent at the messaging level only — the caller decides whether
 * to re-send. No-ops silently when RESEND_API_KEY is unset, matching
 * the rest of the email pipeline.
 */
export async function notifyOnSeatAssigned(input: {
  recipientEmail: string;
  inviterName: string;
  organizationName: string;
  /** Optional: which community the seat was scoped to. */
  communityName?: string;
}): Promise<void> {
  const baseUrl =
    process.env.APP_BASE_URL || 'https://scifi-ethics-explorer.netlify.app';
  const signInUrl = `${baseUrl}/login?next=${encodeURIComponent('/profile')}`;
  const orgLine = input.organizationName
    ? `under "${input.organizationName}"`
    : 'on the platform';
  const scopeLine = input.communityName
    ? ` You'll join their community: ${input.communityName}.`
    : '';

  const subject = `${input.inviterName} added you to Sci-Fi Ethics Explorer`;
  const text =
    `Hi,\n\n` +
    `${input.inviterName} just assigned you a paid seat ${orgLine} on Sci-Fi Ethics Explorer — ` +
    `an interactive course in the ethics of technology, taught through the science fiction that's been wrestling with these questions for two centuries.\n\n` +
    `Your seat is already active. To start exploring, sign in (or sign up if it's your first time) with this email at:\n\n` +
    `${signInUrl}\n\n` +
    `Once you're in, you'll have full access to the textbook, every learning path, the AI ethics counselor, ` +
    `the scenario analyzer, and your community's gradebook and discussions.${scopeLine}\n\n` +
    `Welcome aboard,\n` +
    `Sci-Fi Ethics Explorer`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0a0e27;">
      <h2 style="color:#0a0e27;margin:0 0 12px;font-size:22px;">
        ${escape(input.inviterName)} added you to Sci-Fi Ethics Explorer
      </h2>
      <p style="color:#334;line-height:1.55;">
        ${escape(input.inviterName)} just assigned you a paid seat ${escape(orgLine)} on
        <strong>Sci-Fi Ethics Explorer</strong> — an interactive course in the ethics of
        technology, taught through the science fiction that's been wrestling with these
        questions for two centuries.
      </p>
      <p style="color:#334;line-height:1.55;">
        Your seat is already active. To start exploring, sign in (or sign up if it's your
        first time) with this email:
      </p>
      <p style="margin:24px 0;">
        <a href="${signInUrl}"
           style="display:inline-block;background:#7DF9FF;color:#0a0e27;font-weight:600;
                  padding:12px 24px;border-radius:6px;text-decoration:none;">
          Sign in to claim your seat
        </a>
      </p>
      <p style="color:#334;line-height:1.55;">
        Once you're in, you'll have full access to the textbook, every learning path,
        the AI ethics counselor, the scenario analyzer, and your community's gradebook
        and discussions.${escape(scopeLine)}
      </p>
      <p style="color:#777;font-size:12px;margin-top:32px;">
        Welcome aboard.<br/>— Sci-Fi Ethics Explorer
      </p>
    </div>
  `;

  await sendEmail({
    to: input.recipientEmail,
    subject,
    text,
    html,
  }).catch((err) => {
    console.error('[notifications-dispatch] notifyOnSeatAssigned failed:', err);
  });
}

function escape(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
