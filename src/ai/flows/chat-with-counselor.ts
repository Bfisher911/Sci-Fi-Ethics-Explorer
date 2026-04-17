'use server';
/**
 * @fileOverview An AI ethics counselor that allows users to chat about ethical dilemmas.
 *
 * - chatWithCounselor - A function that handles the chat with the AI counselor.
 * - ChatWithCounselorInput - The input type for the chatWithCounselor function.
 * - ChatWithCounselorOutput - The return type for the chatWithCounselor function.
 *
 * IMPORTANT: This server action *never* throws. Next.js production mode
 * scrubs thrown server-action errors to a generic "Server Components
 * render" string, which the client used to surface as the unhelpful
 * "AI counselor is temporarily unavailable" toast. Instead we always
 * return `{ response, error?, errorCode? }` so the client can render
 * the real diagnostic (missing API key, upstream rate limit, etc.).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatWithCounselorInputSchema = z.object({
  messages: z.array(ChatMessageSchema).describe('The message history of the chat.'),
  mode: z
    .enum(['counselor', 'devils-advocate'])
    .optional()
    .default('counselor')
    .describe('The mode of the AI counselor.'),
});
export type ChatWithCounselorInput = z.infer<typeof ChatWithCounselorInputSchema>;

const ChatWithCounselorOutputSchema = z.object({
  response: z.string().describe('The AI counselor response.'),
  /** Plain-language failure description when the upstream call failed. */
  error: z.string().optional(),
  /**
   * Stable code for the client to switch on. Currently:
   *   - 'missing_api_key'   server is missing GEMINI_API_KEY / GOOGLE_API_KEY
   *   - 'rate_limited'      upstream returned 429
   *   - 'upstream_error'    any other Gemini failure
   */
  errorCode: z
    .enum(['missing_api_key', 'rate_limited', 'upstream_error'])
    .optional(),
});
export type ChatWithCounselorOutput = z.infer<typeof ChatWithCounselorOutputSchema>;

const COUNSELOR_SYSTEM_PROMPT = `You are an AI ethics counselor specializing in sci-fi scenarios. Respond to the user's messages with thoughtful guidance, nuanced analysis, and different perspectives on ethical dilemmas. Draw from established ethical frameworks (utilitarianism, deontology, virtue ethics, social contract theory) when relevant. Be warm and conversational while staying intellectually rigorous.`;

const DEVILS_ADVOCATE_SYSTEM_PROMPT = `You are a philosophical devil's advocate. Your purpose is to argue AGAINST whatever position the user takes on ethical issues. Challenge their reasoning, present counter-examples, and push them to think more deeply. Be intellectually rigorous but respectful. Do not agree with the user — always find the strongest opposing argument. Draw from ethical frameworks, thought experiments, and historical examples.`;

/** Detect whether the runtime has a usable Google AI API key configured. */
function hasGeminiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY
  );
}

/**
 * Public entry point. Always resolves — never throws — so client code
 * can react to a structured `{ error, errorCode }` payload instead of
 * Next.js's redacted production stub.
 */
export async function chatWithCounselor(
  input: ChatWithCounselorInput
): Promise<ChatWithCounselorOutput> {
  // Defensive: production deploys without the key set should fail loud
  // with a useful message, not a generic stack trace.
  if (!hasGeminiKey()) {
    return {
      response: '',
      errorCode: 'missing_api_key',
      error:
        'The AI counselor is not configured. The deployment is missing the GEMINI_API_KEY environment variable. Set it in Netlify (Site settings → Environment variables) and redeploy.',
    };
  }

  try {
    const out = await chatWithCounselorFlow(input);
    return out;
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[chatWithCounselor] flow failed:', raw);
    const lower = raw.toLowerCase();
    if (lower.includes('429') || lower.includes('rate')) {
      return {
        response: '',
        errorCode: 'rate_limited',
        error:
          'The Gemini API is rate-limiting requests right now. Try again in a minute.',
      };
    }
    return {
      response: '',
      errorCode: 'upstream_error',
      error: `Gemini call failed: ${raw}`,
    };
  }
}

const chatWithCounselorFlow = ai.defineFlow(
  {
    name: 'chatWithCounselorFlow',
    inputSchema: ChatWithCounselorInputSchema,
    outputSchema: ChatWithCounselorOutputSchema,
  },
  async (input) => {
    const systemPrompt =
      input.mode === 'devils-advocate'
        ? DEVILS_ADVOCATE_SYSTEM_PROMPT
        : COUNSELOR_SYSTEM_PROMPT;

    // Gemini requires the first history message to be a 'user' turn
    // and disallows two messages in a row from the same role. The
    // chat UI seeds the conversation with an assistant welcome bubble,
    // which violates the first rule, so drop any leading assistant
    // turns and collapse consecutive same-role turns before sending.
    const normalized: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const m of input.messages) {
      // Skip leading assistant messages until we see the first user turn.
      if (normalized.length === 0 && m.role !== 'user') continue;
      // Merge consecutive same-role messages so alternation holds.
      const last = normalized[normalized.length - 1];
      if (last && last.role === m.role) {
        last.content = `${last.content}\n\n${m.content}`;
      } else {
        normalized.push({ role: m.role, content: m.content });
      }
    }
    if (normalized.length === 0) {
      return { response: '' };
    }

    // Use Genkit's native messages format (role + content pairs).
    const messages = normalized.map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      content: [{ text: m.content }],
    }));

    const result = await ai.generate({
      system: systemPrompt,
      messages,
    });

    return {
      response: result.text ?? '',
    };
  }
);
