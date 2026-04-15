'use server';
/**
 * @fileOverview An AI ethics counselor that allows users to chat about ethical dilemmas.
 *
 * - chatWithCounselor - A function that handles the chat with the AI counselor.
 * - ChatWithCounselorInput - The input type for the chatWithCounselor function.
 * - ChatWithCounselorOutput - The return type for the chatWithCounselor function.
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
});
export type ChatWithCounselorOutput = z.infer<typeof ChatWithCounselorOutputSchema>;

export async function chatWithCounselor(
  input: ChatWithCounselorInput
): Promise<ChatWithCounselorOutput> {
  return chatWithCounselorFlow(input);
}

const COUNSELOR_SYSTEM_PROMPT = `You are an AI ethics counselor specializing in sci-fi scenarios. Respond to the user's messages with thoughtful guidance, nuanced analysis, and different perspectives on ethical dilemmas. Draw from established ethical frameworks (utilitarianism, deontology, virtue ethics, social contract theory) when relevant. Be warm and conversational while staying intellectually rigorous.`;

const DEVILS_ADVOCATE_SYSTEM_PROMPT = `You are a philosophical devil's advocate. Your purpose is to argue AGAINST whatever position the user takes on ethical issues. Challenge their reasoning, present counter-examples, and push them to think more deeply. Be intellectually rigorous but respectful. Do not agree with the user — always find the strongest opposing argument. Draw from ethical frameworks, thought experiments, and historical examples.`;

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

    // Use Genkit's native messages format (role + content pairs).
    const messages = input.messages.map((m) => ({
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
