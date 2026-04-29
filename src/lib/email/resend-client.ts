/**
 * Tiny Resend client — direct HTTP, no SDK dependency.
 *
 * The Resend SDK is ~80kb and pulls in a bunch of node-only deps
 * (file system, streams) that complicate edge / serverless bundles.
 * For our use case (transactional + digest send-only) the public
 * /emails endpoint is a single POST, so we just call it with fetch.
 *
 * Activation:
 *   - Set RESEND_API_KEY in your environment (Netlify env var or .env.local).
 *   - When the key is missing, sendEmail() logs the payload to stderr and
 *     returns { ok: true, simulated: true } so dev/preview deploys don't
 *     blow up. This matches the rest of the codebase's "graceful degrade
 *     when secrets aren't wired" pattern.
 *
 * Usage:
 *   import { sendEmail } from '@/lib/email/resend-client';
 *   await sendEmail({
 *     to: 'student@example.com',
 *     subject: 'Your weekly Sci-Fi Ethics digest',
 *     html: '<p>…</p>',
 *   });
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  /** HTML body. Either `html` or `text` is required. */
  html?: string;
  /** Plain-text fallback. */
  text?: string;
  /**
   * From address. Defaults to `EMAIL_FROM` env var, or a fallback
   * `noreply@scifiethicsexplorer.com`. Resend requires the domain to
   * be verified before this address can actually deliver.
   */
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  ok: boolean;
  /** True when no API key is configured — payload was logged, not sent. */
  simulated?: boolean;
  /** Resend message ID when a real send succeeded. */
  id?: string;
  /** Error string when ok=false. */
  error?: string;
}

const DEFAULT_FROM = 'Sci-Fi Ethics Explorer <noreply@scifiethicsexplorer.com>';

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = input.from || process.env.EMAIL_FROM || DEFAULT_FROM;

  if (!input.html && !input.text) {
    return { ok: false, error: 'sendEmail: requires html or text body.' };
  }

  if (!apiKey) {
    // Simulate-and-log mode — useful in preview deploys without secrets
    // and for local development. Prevents tests/cron from crashing
    // and gives the developer enough context to verify the payload.
    // eslint-disable-next-line no-console
    console.log(
      '[email] RESEND_API_KEY missing — simulating send:',
      JSON.stringify({
        to: input.to,
        subject: input.subject,
        from,
        bodyLen: (input.html || input.text || '').length,
      }),
    );
    return { ok: true, simulated: true };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
        tags: input.tags,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return {
        ok: false,
        error: `Resend ${res.status}: ${body.slice(0, 240)}`,
      };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
