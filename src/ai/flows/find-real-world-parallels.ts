
'use server';

/**
 * @fileOverview Finds real-world ethical debates and cases that parallel
 * a given sci-fi scenario.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindRealWorldParallelsInputSchema = z.object({
  scenarioText: z.string().describe('The sci-fi scenario to find parallels for.'),
  ethicalThemes: z.array(z.string()).describe('The ethical themes present in the scenario (e.g., AI rights, resource allocation).'),
});

export type FindRealWorldParallelsInput = z.infer<typeof FindRealWorldParallelsInputSchema>;

const FindRealWorldParallelsOutputSchema = z.object({
  parallels: z.array(z.object({
    title: z.string().describe('Title of the real-world case or debate.'),
    description: z.string().describe('Brief description of the real-world situation.'),
    similarity: z.string().describe('How this parallels the sci-fi scenario.'),
    ethicalFramework: z.string().describe('The primary ethical framework relevant to this parallel.'),
  })).describe('Real-world parallels to the sci-fi scenario.'),
});

export type FindRealWorldParallelsOutput = z.infer<typeof FindRealWorldParallelsOutputSchema>;

export async function findRealWorldParallels(
  input: FindRealWorldParallelsInput
): Promise<FindRealWorldParallelsOutput> {
  return findRealWorldParallelsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findRealWorldParallelsPrompt',
  input: { schema: FindRealWorldParallelsInputSchema },
  output: { schema: FindRealWorldParallelsOutputSchema },
  prompt: `You are an ethics scholar who connects science fiction dilemmas to real-world ethical debates.

Given the following sci-fi scenario, identify 3-5 real-world ethical cases, debates, or situations that share similar ethical themes. For each parallel, explain the connection.

Sci-Fi Scenario:
{{{scenarioText}}}

Ethical Themes:
{{#each ethicalThemes}}
- {{{this}}}
{{/each}}

Find real-world parallels from history, current events, legal cases, medical ethics, technology ethics, environmental debates, or social justice movements. Focus on cases that illuminate the same core ethical tensions.`,
});

const findRealWorldParallelsFlow = ai.defineFlow(
  {
    name: 'findRealWorldParallelsFlow',
    inputSchema: FindRealWorldParallelsInputSchema,
    outputSchema: FindRealWorldParallelsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
