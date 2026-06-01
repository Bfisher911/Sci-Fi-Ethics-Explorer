/**
 * Single, safe entry point for free-text model generation.
 *
 * WHY THIS EXISTS — the installed `@genkit-ai/googleai` plugin translates
 * `ai.generate({ system, prompt })` into a Gemini request that carries a
 * `role: 'system'` content entry. Current Gemini models (gemini-2.5-flash and
 * the gemini-3.x line) REJECT that with:
 *
 *     "Role 'system' is not supported. Please use a valid role: MODEL, USER."
 *
 * which surfaced to students as "Reflection generation failed: ... the system
 * role not supported." Rather than fix this in five different flows (and have
 * the next new flow reintroduce it), every flow generates through this helper,
 * which folds the system instruction into the user prompt as plain text. No
 * `system` role is ever sent, so it works across all current models and any
 * SDK version. If the plugin later gains proper `systemInstruction` support we
 * change it in exactly one place.
 */

import { ai } from '@/ai/genkit';

export interface GenerateProseInput {
  /** Optional leading instructions (formerly passed as `system`). */
  system?: string;
  /** The user-facing prompt / content. */
  prompt: string;
}

/**
 * Generate free-text from the default model. Returns the trimmed text plus the
 * raw response for callers that need more. Never sends a `system` role.
 */
export async function generateProse(
  input: GenerateProseInput,
): Promise<{ text: string; raw: Awaited<ReturnType<typeof ai.generate>> }> {
  const sys = input.system?.trim();
  const combinedPrompt = sys ? `${sys}\n\n${input.prompt}` : input.prompt;
  const raw = await ai.generate({ prompt: combinedPrompt });
  return { text: (raw.text ?? '').trim(), raw };
}
