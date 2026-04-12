
'use server';

/**
 * @fileOverview Calculates an ethical impact score across multiple dimensions
 * based on a user's choices and activity history.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CalculateEthicalImpactInputSchema = z.object({
  storiesCompleted: z.number().describe('Number of stories completed.'),
  choicesSummary: z.array(z.string()).describe('Summary of key ethical choices the user has made across stories.'),
  dominantFrameworks: z.array(z.string()).describe('Ethical frameworks the user tends to align with based on quiz results.'),
  debatesParticipated: z.number().describe('Number of debates participated in.'),
  scenariosAnalyzed: z.number().describe('Number of scenarios analyzed.'),
});

export type CalculateEthicalImpactInput = z.infer<typeof CalculateEthicalImpactInputSchema>;

const CalculateEthicalImpactOutputSchema = z.object({
  dimensions: z.array(z.object({
    name: z.string().describe('The ethical dimension name (e.g., Empathy, Justice, Autonomy, Utility, Virtue, Courage).'),
    score: z.number().min(0).max(100).describe('Score from 0-100 for this dimension.'),
  })).describe('Scores across different ethical dimensions.'),
  summary: z.string().describe('A brief narrative summary of the user\'s ethical profile.'),
});

export type CalculateEthicalImpactOutput = z.infer<typeof CalculateEthicalImpactOutputSchema>;

export async function calculateEthicalImpact(
  input: CalculateEthicalImpactInput
): Promise<CalculateEthicalImpactOutput> {
  return calculateEthicalImpactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateEthicalImpactPrompt',
  input: { schema: CalculateEthicalImpactInputSchema },
  output: { schema: CalculateEthicalImpactOutputSchema },
  prompt: `You are an ethical assessment AI. Based on a user's activity and choices in the Sci-Fi Ethics Explorer, calculate their ethical impact scores across these dimensions:

1. **Empathy** — How much do their choices consider others' feelings and perspectives?
2. **Justice** — How much do they prioritize fairness and equality?
3. **Autonomy** — How much do they value individual freedom and self-determination?
4. **Utility** — How much do they optimize for the greatest good?
5. **Virtue** — How much do they prioritize moral character and integrity?
6. **Courage** — How willing are they to make difficult or unpopular ethical choices?

User Activity:
- Stories completed: {{storiesCompleted}}
- Debates participated in: {{debatesParticipated}}
- Scenarios analyzed: {{scenariosAnalyzed}}
- Dominant ethical frameworks: {{#each dominantFrameworks}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Key choices made:
{{#each choicesSummary}}
- {{{this}}}
{{/each}}

Score each dimension 0-100 based on the evidence. If there's limited data, use moderate scores (40-60) and note the uncertainty in the summary. Also write a brief narrative summary of their ethical profile.`,
});

const calculateEthicalImpactFlow = ai.defineFlow(
  {
    name: 'calculateEthicalImpactFlow',
    inputSchema: CalculateEthicalImpactInputSchema,
    outputSchema: CalculateEthicalImpactOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
