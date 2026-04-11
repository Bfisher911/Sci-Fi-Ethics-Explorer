'use server';

/**
 * @fileOverview Provides AI-driven analysis of ethical implications in sci-fi scenarios.
 *
 * - analyzeScenario - Analyzes the ethical implications of a given sci-fi scenario.
 * - AnalyzeScenarioInput - The input type for the analyzeScenario function.
 * - AnalyzeScenarioOutput - The return type for the analyzeScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeScenarioInputSchema = z.object({
  scenarioText: z.string().describe('The sci-fi scenario to analyze.'),
});
export type AnalyzeScenarioInput = z.infer<typeof AnalyzeScenarioInputSchema>;

const AnalyzeScenarioOutputSchema = z.object({
  ethicalDilemmas: z.array(z.string()).describe('List of identified ethical dilemmas.'),
  potentialConsequences: z.array(z.string()).describe('List of potential consequences of the scenario.'),
  applicableEthicalTheories: z.array(z.string()).describe('List of applicable ethical theories.'),
  quotaInformation: z.string().optional().describe('Quota information or disclaimers.'),
});
export type AnalyzeScenarioOutput = z.infer<typeof AnalyzeScenarioOutputSchema>;

export async function analyzeScenario(input: AnalyzeScenarioInput): Promise<AnalyzeScenarioOutput> {
  return analyzeScenarioFlow(input);
}

const analyzeScenarioPrompt = ai.definePrompt({
  name: 'analyzeScenarioPrompt',
  input: {schema: AnalyzeScenarioInputSchema},
  output: {schema: AnalyzeScenarioOutputSchema},
  prompt: `You are an AI assistant specializing in ethical analysis of sci-fi scenarios.

  Analyze the following scenario and identify its ethical dilemmas, potential consequences, and applicable ethical theories.

  Scenario: {{{scenarioText}}}

  Output the results in a structured format.
  `,
});

const analyzeScenarioFlow = ai.defineFlow(
  {
    name: 'analyzeScenarioFlow',
    inputSchema: AnalyzeScenarioInputSchema,
    outputSchema: AnalyzeScenarioOutputSchema,
  },
  async input => {
    const {output} = await analyzeScenarioPrompt(input);
    return output!;
  }
);
