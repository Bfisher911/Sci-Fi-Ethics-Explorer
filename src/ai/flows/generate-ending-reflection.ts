'use server';

/**
 * @fileOverview Generates a personalized reflection based on the choices made in an interactive story.
 *
 * - generateEndingReflection - A function that generates the reflection.
 * - GenerateEndingReflectionInput - The input type for the generateEndingReflection function.
 * - GenerateEndingReflectionOutput - The return type for the generateEndingReflection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEndingReflectionInputSchema = z.object({
  storyTitle: z.string().describe('The title of the interactive story.'),
  userChoices: z
    .array(z.string())
    .describe('An array of the user choices made during the story.'),
});
export type GenerateEndingReflectionInput = z.infer<
  typeof GenerateEndingReflectionInputSchema
>;

const GenerateEndingReflectionOutputSchema = z.object({
  reflection: z
    .string()
    .describe(
      'A personalized reflection based on the user choices and the story.'
    ),
});
export type GenerateEndingReflectionOutput = z.infer<
  typeof GenerateEndingReflectionOutputSchema
>;

export async function generateEndingReflection(
  input: GenerateEndingReflectionInput
): Promise<GenerateEndingReflectionOutput> {
  return generateEndingReflectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEndingReflectionPrompt',
  input: {schema: GenerateEndingReflectionInputSchema},
  output: {schema: GenerateEndingReflectionOutputSchema},
  prompt: `You are an AI that provides personalized reflections on interactive stories.

  Based on the story title and the user's choices, generate a reflection that provides insights into the ethical consequences of their decisions.

  Story Title: {{{storyTitle}}}
  User Choices:
  {{#each userChoices}}
  - {{{this}}}
  {{/each}}

  Reflection:
  `,
});

const generateEndingReflectionFlow = ai.defineFlow(
  {
    name: 'generateEndingReflectionFlow',
    inputSchema: GenerateEndingReflectionInputSchema,
    outputSchema: GenerateEndingReflectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
