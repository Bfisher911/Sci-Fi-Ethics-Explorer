
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
