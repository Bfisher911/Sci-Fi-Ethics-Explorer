
'use server';

/**
 * @fileOverview Generates "What Happened Next" epilogues showing long-term
 * consequences of ethical choices made in stories.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEpilogueInputSchema = z.object({
  storyTitle: z.string().describe('The title of the story.'),
  storyEnding: z.string().describe('A brief summary of how the story ended.'),
  userChoices: z.array(z.string()).describe('The choices the user made during the story.'),
  timeframe: z.enum(['1 year', '5 years', '50 years']).describe('How far into the future to project.'),
});

export type GenerateEpilogueInput = z.infer<typeof GenerateEpilogueInputSchema>;

const GenerateEpilogueOutputSchema = z.object({
  epilogueText: z.string().describe('A narrative epilogue describing what happened after the story ended.'),
  consequences: z.array(z.object({
    area: z.string().describe('The area of impact (e.g., Society, Technology, Individual).'),
    description: z.string().describe('Description of the consequence.'),
    sentiment: z.enum(['positive', 'negative', 'mixed']).describe('Whether this consequence is positive, negative, or mixed.'),
  })).describe('Specific consequences broken down by area.'),
});

export type GenerateEpilogueOutput = z.infer<typeof GenerateEpilogueOutputSchema>;

export async function generateEpilogue(
  input: GenerateEpilogueInput
): Promise<GenerateEpilogueOutput> {
  return generateEpilogueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEpiloguePrompt',
  input: { schema: GenerateEpilogueInputSchema },
  output: { schema: GenerateEpilogueOutputSchema },
  prompt: `You are a sci-fi ethics storyteller. Given a story and the choices a user made, project what would happen {{timeframe}} later as a result of those choices.

Write a compelling narrative epilogue and break down the specific consequences across different areas (society, technology, individual lives, ethics, politics, etc.).

Story Title: {{{storyTitle}}}
How the story ended: {{{storyEnding}}}
User's choices during the story:
{{#each userChoices}}
- {{{this}}}
{{/each}}

Timeframe: {{timeframe}} later

Generate a vivid, thoughtful epilogue that shows how the ethical choices rippled through time.`,
});

const generateEpilogueFlow = ai.defineFlow(
  {
    name: 'generateEpilogueFlow',
    inputSchema: GenerateEpilogueInputSchema,
    outputSchema: GenerateEpilogueOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
