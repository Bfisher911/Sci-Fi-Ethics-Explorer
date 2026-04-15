
'use server';

/**
 * Email sending via Resend HTTP API.
 *
 * No-ops silently when RESEND_API_KEY is not set, so the app works
 * fine without email configured. Set the env var to enable real
 * delivery — no redeploy beyond env var propagation needed.
 *
 * Free tier: https://resend.com/pricing (3,000/mo at time of writing)
 */

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: true, skipped: true };
  }

  const from = process.env.RESEND_FROM || 'notifications@updates.scifi-ethics-explorer.app';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        ...(input.html ? { html: input.html } : {}),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[email] Resend API error:', res.status, errBody);
      return { ok: false, error: `Resend ${res.status}: ${errBody}` };
    }
    return { ok: true };
  } catch (error) {
    console.error('[email] sendEmail failed:', error);
    return { ok: false, error: String(error) };
  }
}
