
'use server';

/**
 * @fileOverview Compares how different ethical frameworks would evaluate
 * a given scenario and user choice.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ComparePerspectivesInputSchema = z.object({
  scenario: z.string().describe('The ethical scenario or dilemma.'),
  userChoice: z.string().describe('The choice the user made.'),
  frameworks: z.array(z.string()).describe('The ethical frameworks to compare (e.g., Utilitarianism, Deontology, Virtue Ethics, Social Contract Theory).'),
});

export type ComparePerspectivesInput = z.infer<typeof ComparePerspectivesInputSchema>;

const ComparePerspectivesOutputSchema = z.object({
  comparisons: z.array(z.object({
    framework: z.string().describe('The name of the ethical framework.'),
    analysis: z.string().describe('How this framework would analyze the scenario and choice.'),
    verdict: z.string().describe('Whether this framework would support, oppose, or have mixed feelings about the choice.'),
    strength: z.enum(['supports', 'opposes', 'neutral']).describe('Whether the framework supports, opposes, or is neutral about the choice.'),
  })).describe('Analysis from each ethical framework.'),
  synthesis: z.string().describe('A brief synthesis comparing the perspectives and highlighting areas of agreement and disagreement.'),
});

export type ComparePerspectivesOutput = z.infer<typeof ComparePerspectivesOutputSchema>;

export async function comparePerspectives(
  input: ComparePerspectivesInput
): Promise<ComparePerspectivesOutput> {
  return comparePerspectivesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comparePerspectivesPrompt',
  input: { schema: ComparePerspectivesInputSchema },
  output: { schema: ComparePerspectivesOutputSchema },
  prompt: `You are an ethics professor specializing in applied ethics through science fiction.

Analyze the following scenario and the user's choice through the lens of each requested ethical framework. For each framework, explain how it would evaluate the choice and whether it would support or oppose it.

Scenario: {{{scenario}}}

User's Choice: {{{userChoice}}}

Frameworks to analyze:
{{#each frameworks}}
- {{{this}}}
{{/each}}

Provide a thoughtful, balanced analysis from each perspective, then synthesize the key agreements and disagreements.`,
});

const comparePerspectivesFlow = ai.defineFlow(
  {
    name: 'comparePerspectivesFlow',
    inputSchema: ComparePerspectivesInputSchema,
    outputSchema: ComparePerspectivesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
