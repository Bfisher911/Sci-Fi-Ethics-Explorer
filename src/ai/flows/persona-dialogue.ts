'use server';
/**
 * @fileOverview Conversational flow for library dialogue personas
 * (philosophers, sci-fi authors, sci-fi media, ethical frameworks).
 *
 * The client sends only `{ category, personaId, mode, messages }` — the
 * persona's system prompt is rebuilt server-side on every call and never
 * leaves the server. Mode is validated by the input schema.
 *
 * Like the other chat flows, this NEVER throws: it always resolves with
 * `{ response, error?, errorCode? }` so the client can render a real
 * diagnostic instead of Next.js's redacted production error.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { buildPersonaSystemPrompt } from '@/lib/dialogues/prompts';
import {
  getDialoguePersona,
  isDialogueCategory,
} from '@/lib/dialogues/personas';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatWithPersonaInputSchema = z.object({
  category: z.enum(['philosopher', 'scifi-author', 'scifi-media', 'framework']),
  personaId: z.string().min(1),
  mode: z.enum(['open', 'assessment']).default('open'),
  messages: z.array(ChatMessageSchema),
});
export type ChatWithPersonaInput = z.infer<typeof ChatWithPersonaInputSchema>;

const ChatWithPersonaOutputSchema = z.object({
  response: z.string(),
  error: z.string().optional(),
  errorCode: z
    .enum([
      'missing_api_key',
      'rate_limited',
      'upstream_error',
      'unknown_persona',
      'invalid_input',
    ])
    .optional(),
});
export type ChatWithPersonaOutput = z.infer<typeof ChatWithPersonaOutputSchema>;

function hasGeminiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY
  );
}

/** Cap transcript size sent upstream: keep the most recent turns. */
const MAX_HISTORY_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4000;

export async function chatWithPersona(
  input: ChatWithPersonaInput
): Promise<ChatWithPersonaOutput> {
  const parsed = ChatWithPersonaInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      response: '',
      errorCode: 'invalid_input',
      error: 'That request was not valid. Refresh the page and try again.',
    };
  }
  if (!isDialogueCategory(parsed.data.category)) {
    return {
      response: '',
      errorCode: 'unknown_persona',
      error: 'This dialogue does not exist.',
    };
  }
  if (!hasGeminiKey()) {
    return {
      response: '',
      errorCode: 'missing_api_key',
      error:
        'Dialogues are not configured. The deployment is missing the GEMINI_API_KEY environment variable.',
    };
  }
  try {
    return await chatWithPersonaFlow(parsed.data);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    console.error('[chatWithPersona] flow failed:', raw);
    if (raw.toLowerCase().includes('429') || raw.toLowerCase().includes('rate')) {
      return {
        response: '',
        errorCode: 'rate_limited',
        error: 'The AI is rate-limiting requests right now. Try again in a minute.',
      };
    }
    return {
      response: '',
      errorCode: 'upstream_error',
      error: 'The dialogue hit a temporary problem. Try sending that again.',
    };
  }
}

const chatWithPersonaFlow = ai.defineFlow(
  {
    name: 'chatWithPersonaFlow',
    inputSchema: ChatWithPersonaInputSchema,
    outputSchema: ChatWithPersonaOutputSchema,
  },
  async (input) => {
    const persona = getDialoguePersona(input.category, input.personaId);
    if (!persona) {
      return {
        response: '',
        errorCode: 'unknown_persona' as const,
        error: 'This dialogue does not exist.',
      };
    }

    const systemPrompt = buildPersonaSystemPrompt(persona, input.mode);

    // Same Gemini constraints as chat-with-counselor: first turn must be
    // 'user', no consecutive same-role turns, and no system role — fold
    // the system prompt into the first user turn.
    const recent = input.messages
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({ ...m, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
    const normalized: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const m of recent) {
      if (normalized.length === 0 && m.role !== 'user') continue;
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

    const messages = normalized.map((m, i) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      content: [
        {
          text:
            i === 0 && m.role === 'user'
              ? `${systemPrompt}\n\n[Student]: ${m.content}`
              : m.content,
        },
      ],
    }));

    const result = await ai.generate({ messages });
    return { response: result.text ?? '' };
  }
);
