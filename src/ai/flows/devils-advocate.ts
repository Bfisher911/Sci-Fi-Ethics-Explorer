
'use server';

/**
 * @fileOverview Devil's Advocate mode — AI argues the opposite position
 * of whatever the user chooses, forcing deeper ethical thinking.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DevilsAdvocateInputSchema = z.object({
  userPosition: z.string().describe('The ethical position or choice the user has taken.'),
  scenarioContext: z.string().describe('The scenario or dilemma being discussed.'),
});

export type DevilsAdvocateInput = z.infer<typeof DevilsAdvocateInputSchema>;

const DevilsAdvocateOutputSchema = z.object({
  counterArguments: z.array(z.object({
    point: z.string().describe('A concise counter-argument title.'),
    explanation: z.string().describe('Detailed explanation of why this counter-argument has merit.'),
  })).describe('A list of strong counter-arguments against the user\'s position.'),
  overallChallenge: z.string().describe('A synthesized challenge to the user\'s position that ties the counter-arguments together.'),
});

export type DevilsAdvocateOutput = z.infer<typeof DevilsAdvocateOutputSchema>;

export async function devilsAdvocate(
  input: DevilsAdvocateInput
): Promise<DevilsAdvocateOutput> {
  return devilsAdvocateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'devilsAdvocatePrompt',
  input: { schema: DevilsAdvocateInputSchema },
  output: { schema: DevilsAdvocateOutputSchema },
  prompt: `You are a philosophical devil's advocate. Your job is to argue AGAINST the user's stated position — not because it's wrong, but to help them think more deeply about the ethics involved.

Present the strongest possible counter-arguments to their position. Be intellectually rigorous, citing ethical frameworks and thought experiments where relevant. Don't be dismissive — be genuinely challenging.

Scenario Context: {{{scenarioContext}}}

User's Position: {{{userPosition}}}

Generate 3-5 strong counter-arguments and an overall challenge that ties them together.`,
});

const devilsAdvocateFlow = ai.defineFlow(
  {
    name: 'devilsAdvocateFlow',
    inputSchema: DevilsAdvocateInputSchema,
    outputSchema: DevilsAdvocateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
