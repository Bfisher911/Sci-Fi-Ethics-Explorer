'use server';
/**
 * @fileOverview Generates a multi-question comprehension quiz for a
 * philosopher or ethical theory.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuizInputSchema = z.object({
  subjectType: z.enum(['philosopher', 'theory']),
  subjectName: z.string(),
  /** Optional rich context (bio for philosopher, description for theory). */
  context: z.string().optional(),
  questionCount: z.number().min(10).max(20).default(15),
});

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuestionSchema = z.object({
  prompt: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('Exactly 4 multiple-choice options.'),
  correctAnswerIndex: z.number().int().min(0).max(3).describe('0-based index of the correct option.'),
  explanation: z.string().describe('A brief explanation of why the correct answer is correct.'),
  difficulty: z.enum(['recall', 'conceptual', 'applied']).describe('Difficulty level.'),
});

const GenerateQuizOutputSchema = z.object({
  title: z.string().describe('A short engaging title for the quiz.'),
  description: z.string().describe('A 1-sentence description of what the quiz covers.'),
  questions: z.array(QuestionSchema).describe('The generated questions, mixed across recall/conceptual/applied levels.'),
});

export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are a philosophy professor designing a comprehension quiz for the Sci-Fi Ethics Explorer platform.

Subject: {{subjectName}} ({{subjectType}})

{{#if context}}
Reference material:
{{context}}
{{/if}}

Generate exactly {{questionCount}} multiple-choice questions covering this subject. Mix three difficulty levels:
- recall: definitions, dates, key terms, major works
- conceptual: core arguments, how ideas connect, why the philosopher/theory holds the positions they do
- applied: short sci-fi or contemporary scenarios where the reader must reason "how would this philosopher / theory respond?"

Distribute roughly: 30% recall, 40% conceptual, 30% applied.

For each question:
- Use 4 plausible options (not 3 obviously-wrong distractors plus 1 correct one)
- Make distractors come from related but distinct positions, not nonsense
- Provide a 1-2 sentence explanation that teaches, not just confirms
- Keep applied questions short and concrete (50-100 words for the scenario)

Avoid:
- Trick questions or questions that depend on memorizing trivial dates
- Options that are too long or repeat one another
- Questions whose answer is "all of the above" or "none of the above"

Make the quiz feel like a thoughtful self-test, not a quiz-show gauntlet.`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
