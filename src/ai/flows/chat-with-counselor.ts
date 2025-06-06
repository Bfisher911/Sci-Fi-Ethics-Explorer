'use server';
/**
 * @fileOverview An AI ethics counselor that allows users to chat about ethical dilemmas.
 *
 * - chatWithCounselor - A function that handles the chat with the AI counselor.
 * - ChatWithCounselorInput - The input type for the chatWithCounselor function.
 * - ChatWithCounselorOutput - The return type for the chatWithCounselor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatWithCounselorInputSchema = z.object({
  messages: z.array(ChatMessageSchema).describe('The message history of the chat.'),
});
export type ChatWithCounselorInput = z.infer<typeof ChatWithCounselorInputSchema>;

const ChatWithCounselorOutputSchema = z.object({
  response: z.string().describe('The AI counselor response.'),
});
export type ChatWithCounselorOutput = z.infer<typeof ChatWithCounselorOutputSchema>;

export async function chatWithCounselor(input: ChatWithCounselorInput): Promise<ChatWithCounselorOutput> {
  return chatWithCounselorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithCounselorPrompt',
  input: {schema: ChatWithCounselorInputSchema},
  output: {schema: ChatWithCounselorOutputSchema},
  prompt: `You are an AI ethics counselor specializing in sci-fi scenarios. Respond to the user's messages with thoughtful guidance and different perspectives on ethical dilemmas.

Chat History:
{{#each messages}}
  {{#if (eq role \"user\")}}User:{{else}}Counselor:{{/if}} {{{content}}}
{{/each}}

Counselor:`, // Keep it open-ended to allow the model to respond
});

const chatWithCounselorFlow = ai.defineFlow(
  {
    name: 'chatWithCounselorFlow',
    inputSchema: ChatWithCounselorInputSchema,
    outputSchema: ChatWithCounselorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      response: output!.response,
    };
  }
);
