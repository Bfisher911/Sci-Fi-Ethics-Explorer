/**
 * Weekly digest email builder.
 *
 * Composes a personalized HTML payload for a single user's digest:
 *   - Streak status ("You're on a 5-day streak!")
 *   - Chapters earned this week
 *   - Recent debates the user could chime in on
 *   - One spotlight Dilemma of the Day
 *   - Latest changelog entry
 *
 * Sample output is rendered server-side and can be previewed via
 * /api/cron/digest?preview=1 — no email sent in preview mode.
 */

import { CHANGELOG } from '@/data/changelog';
import { chapters as ALL_CHAPTERS } from '@/data/textbook';
import type { Story } from '@/types';

export interface DigestUserSummary {
  userId: string;
  email: string;
  displayName: string;
  currentStreakDays?: number;
  chaptersPassedTotal: number;
  /** Number of new chapter quizzes passed since the last digest. */
  chaptersPassedThisWeek?: number;
  /** Where to deep-link if they want to keep reading. */
  nextChapterSlug?: string;
}

export interface DigestContext {
  /** Top open debates to surface (cap 3 in body). */
  openDebatesPreview: Array<{ id: string; title: string }>;
  /** Optional Dilemma of the Day card. */
  dilemma?: Pick<Story, 'id' | 'title' | 'description'> | null;
  /** Site origin used to build absolute URLs. */
  origin: string;
}

const TOTAL_CHAPTERS = ALL_CHAPTERS.length;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildDigestHtml(
  user: DigestUserSummary,
  ctx: DigestContext,
): { subject: string; html: string; text: string } {
  const greeting = user.displayName
    ? `Hi ${escapeHtml(user.displayName.split(/\s+/)[0])},`
    : 'Hi there,';

  const streakLine =
    user.currentStreakDays && user.currentStreakDays > 0
      ? `<p style="margin:0 0 8px 0;color:#ff6b35;font-weight:bold;">🔥 ${user.currentStreakDays}-day streak — keep it going!</p>`
      : '';

  const progressLine = `${user.chaptersPassedTotal} of ${TOTAL_CHAPTERS} chapters earned`;
  const subjectStreak = user.currentStreakDays
    ? ` (${user.currentStreakDays}-day streak)`
    : '';
  const subject = `Your weekly Sci-Fi Ethics digest${subjectStreak}`;

  const continueUrl = user.nextChapterSlug
    ? `${ctx.origin}/textbook/chapters/${user.nextChapterSlug}`
    : `${ctx.origin}/textbook`;

  const changelogEntry = CHANGELOG[0];
  const changelogBlock = changelogEntry
    ? `
<div style="margin:20px 0;padding:16px;border:1px solid #2d3548;border-radius:10px;background:#101828;">
  <div style="font-size:11px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:#66f9ff;margin-bottom:6px;">What's new</div>
  <div style="font-size:16px;font-weight:bold;color:#ffffff;margin-bottom:6px;">${escapeHtml(changelogEntry.title)}</div>
  <div style="font-size:14px;color:#a8b2c8;line-height:1.5;">${escapeHtml(changelogEntry.body)}</div>
  <a href="${ctx.origin}/whats-new" style="display:inline-block;margin-top:10px;color:#66f9ff;text-decoration:none;font-weight:bold;font-size:13px;">See all updates →</a>
</div>`
    : '';

  const debatesBlock =
    ctx.openDebatesPreview.length > 0
      ? `
<div style="margin:20px 0;">
  <div style="font-size:11px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:#ff00ff;margin-bottom:8px;">Open debates</div>
  <ul style="list-style:none;margin:0;padding:0;">
    ${ctx.openDebatesPreview
      .slice(0, 3)
      .map(
        (d) => `
    <li style="margin:0 0 8px 0;padding:12px;border:1px solid #2d3548;border-radius:8px;background:#0f1525;">
      <a href="${ctx.origin}/debate-arena/${d.id}" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;">${escapeHtml(d.title)}</a>
    </li>`,
      )
      .join('')}
  </ul>
  <a href="${ctx.origin}/debate-arena" style="color:#ff00ff;text-decoration:none;font-weight:bold;font-size:13px;">Browse all debates →</a>
</div>`
      : '';

  const dilemmaBlock = ctx.dilemma
    ? `
<div style="margin:20px 0;padding:16px;border:1px solid #ff00ff;border-radius:10px;background:#1a0a1f;">
  <div style="font-size:11px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:#ff00ff;margin-bottom:6px;">Dilemma of the day</div>
  <div style="font-size:18px;font-weight:bold;color:#ffffff;margin-bottom:6px;font-family:Georgia,serif;">${escapeHtml(ctx.dilemma.title)}</div>
  <div style="font-size:14px;color:#a8b2c8;line-height:1.5;margin-bottom:10px;">${escapeHtml((ctx.dilemma.description || '').slice(0, 220))}${(ctx.dilemma.description || '').length > 220 ? '…' : ''}</div>
  <a href="${ctx.origin}/stories/${ctx.dilemma.id}" style="color:#66f9ff;text-decoration:none;font-weight:bold;font-size:13px;">Explore the dilemma →</a>
</div>`
    : '';

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e8ecf5;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:6px 14px;border:1px solid #66f9ff;border-radius:999px;font-size:11px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:#66f9ff;">
        Sci-Fi Ethics Explorer
      </div>
    </div>

    <h1 style="font-size:24px;font-weight:bold;margin:0 0 16px 0;color:#ffffff;font-family:Georgia,serif;">${greeting}</h1>

    ${streakLine}
    <p style="margin:0 0 18px 0;color:#a8b2c8;font-size:15px;line-height:1.6;">
      You're at <strong style="color:#66f9ff;">${progressLine}</strong>${user.chaptersPassedThisWeek ? ` (+${user.chaptersPassedThisWeek} this week)` : ''}.
    </p>

    <div style="text-align:center;margin:24px 0;">
      <a href="${continueUrl}" style="display:inline-block;padding:14px 28px;background:#66f9ff;color:#0a0e1a;text-decoration:none;font-weight:bold;border-radius:8px;font-size:15px;">
        Continue reading →
      </a>
    </div>

    ${dilemmaBlock}
    ${debatesBlock}
    ${changelogBlock}

    <div style="margin-top:36px;padding-top:20px;border-top:1px solid #2d3548;text-align:center;color:#5e6a85;font-size:12px;line-height:1.6;">
      You're getting this because you opted in to weekly digests.
      <br>
      <a href="${ctx.origin}/profile?tab=preferences" style="color:#66f9ff;text-decoration:none;">Manage email preferences</a>
      ·
      <a href="${ctx.origin}" style="color:#66f9ff;text-decoration:none;">Open the app</a>
    </div>
  </div>
</body>
</html>`;

  // Plain-text fallback for clients that strip HTML.
  const text = [
    `${greeting}`,
    '',
    user.currentStreakDays && user.currentStreakDays > 0
      ? `🔥 ${user.currentStreakDays}-day streak — keep it going!`
      : '',
    `You're at ${progressLine}.`,
    '',
    `Continue reading: ${continueUrl}`,
    '',
    ctx.dilemma ? `Dilemma of the Day: ${ctx.dilemma.title}` : '',
    ctx.dilemma ? `${ctx.origin}/stories/${ctx.dilemma.id}` : '',
    '',
    ctx.openDebatesPreview.length > 0 ? 'Open debates:' : '',
    ...ctx.openDebatesPreview
      .slice(0, 3)
      .map((d) => `- ${d.title}: ${ctx.origin}/debate-arena/${d.id}`),
    '',
    changelogEntry ? `What's new: ${changelogEntry.title}` : '',
    changelogEntry ? changelogEntry.body : '',
    '',
    '---',
    `Manage preferences: ${ctx.origin}/profile?tab=preferences`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}
