'use server';

import { ai } from '@/ai/genkit';
import {
  getActiveEthicalFrameworks,
} from '@/lib/ethical-framework-registry';
import {
  buildDeterministicEthicalAnalysis,
  type DeterministicAnalysisInput,
} from '@/lib/ethical-judgment/recording';
import { validateEthicalJudgmentAnalysis } from '@/lib/ethical-judgment/validation';
import type { EthicalJudgmentAnalysis } from '@/types';

export interface ScoreEthicalJudgmentInput {
  promptText: string;
  userChoice?: string;
  responseText?: string;
  explanation?: string;
  sourceTitle?: string;
  interactionType?: string;
  frameworkWeights?: Record<string, number>;
}

export type ScoreEthicalJudgmentOutput =
  | { success: true; analysis: EthicalJudgmentAnalysis; modelUsed: string; promptVersion: string }
  | { success: false; error: string; errorCode: 'empty_input' | 'missing_api_key' | 'parse_error' | 'upstream_error' };

const PROMPT_VERSION = 'ethical-judgment-v1';
const MODEL_USED = 'googleai/gemini-2.0-flash';

function hasGeminiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY,
  );
}

function extractJsonObject(text: string): unknown | null {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue to fenced / balanced extraction.
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // Continue to balanced extraction.
    }
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
}

function deterministicFallback(input: ScoreEthicalJudgmentInput): ScoreEthicalJudgmentOutput {
  const fallbackInput: DeterministicAnalysisInput = {
    frameworkWeights: input.frameworkWeights ?? {},
    promptText: input.promptText,
    userText: input.explanation ?? input.responseText ?? input.userChoice,
    confidence: input.frameworkWeights ? 0.7 : 0.3,
  };
  return {
    success: true,
    analysis: buildDeterministicEthicalAnalysis(fallbackInput),
    modelUsed: 'deterministic-mapping',
    promptVersion: PROMPT_VERSION,
  };
}

export async function scoreEthicalJudgment(
  input: ScoreEthicalJudgmentInput,
): Promise<ScoreEthicalJudgmentOutput> {
  const responseText = [input.userChoice, input.explanation, input.responseText]
    .filter(Boolean)
    .join('\n\n')
    .trim();
  if (!input.promptText?.trim() || !responseText) {
    return { success: false, errorCode: 'empty_input', error: 'Prompt and user response are required.' };
  }

  if (!hasGeminiKey()) {
    return deterministicFallback(input);
  }

  try {
    const frameworks = getActiveEthicalFrameworks();
    const frameworkList = frameworks
      .map((framework) => {
        return `- ${framework.id}: ${framework.name}. Key question: ${framework.keyQuestion}. Strengths: ${framework.strengths.join('; ')}. Blind spots: ${framework.blindSpots.join('; ')}.`;
      })
      .join('\n');

    const prompt = `Analyze this learner's ethical judgment. Score the reasoning across every active ethical framework listed below.

Important safety rules:
- Analyze only the reasoning shown in this response.
- Do not diagnose the learner's character, morality, personality, politics, religion, or identity.
- Use language like "the response tends to emphasize" instead of "you are".
- Avoid moralizing. Offer constructive learning feedback.
- Return strict JSON only. Do not wrap in markdown.

Source title: ${input.sourceTitle ?? 'Untitled activity'}
Interaction type: ${input.interactionType ?? 'ethical_judgment'}

Prompt or scenario:
${input.promptText}

Learner response:
${responseText}

Active frameworks:
${frameworkList}

Return exactly this JSON shape:
{
  "frameworkScores": [
    {
      "frameworkId": "<one active framework id>",
      "score": 0,
      "confidence": 0.0,
      "rationale": "<short reason>"
    }
  ],
  "primaryFrameworks": ["<framework id>"],
  "secondaryFrameworks": ["<framework id>"],
  "tensions": [
    {
      "frameworks": ["<framework id>", "<framework id>"],
      "description": "<one sentence>"
    }
  ],
  "confidence": 0.0,
  "reasoningSummary": "<2-3 direct, student-friendly sentences>",
  "evidenceFromResponse": ["<short quote or paraphrase from the learner response>"],
  "blindSpots": ["<possible missing consideration>"],
  "challengeQuestion": "<one challenging reflection question>",
  "suggestedNextFrameworkToExplore": "<framework id>",
  "profileUpdateWeight": 1,
  "aiExplanation": "<why these scores were assigned>"
}

Scoring rules:
- Include exactly one frameworkScores entry for every active framework id.
- Score each framework from 0 to 100.
- confidence and top-level confidence must be from 0 to 1.
- profileUpdateWeight must be from 0 to 2.
- primaryFrameworks should include the strongest 1-2 alignments.
- secondaryFrameworks should include meaningful secondary alignments.
- If the response is too short or unclear, lower confidence and profileUpdateWeight.
- Use framework ids exactly as listed.`;

    const result = await ai.generate({ prompt });
    const parsed = extractJsonObject(result.text ?? '');
    if (!parsed) {
      return deterministicFallback(input);
    }

    const analysis = validateEthicalJudgmentAnalysis(parsed);
    return { success: true, analysis, modelUsed: MODEL_USED, promptVersion: PROMPT_VERSION };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[scoreEthicalJudgment] failed:', message);
    return {
      success: false,
      errorCode: 'upstream_error',
      error: `Ethical judgment scoring failed: ${message}`,
    };
  }
}
