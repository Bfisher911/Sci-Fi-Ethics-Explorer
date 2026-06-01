/**
 * Pure helpers that turn a story choice's authored `frameworks` metadata
 * (`ChoiceFrameworkImpact[]`) into the shapes the ethical-judgment pipeline
 * expects — WITHOUT any AI call.
 *
 * Why this exists: story decisions carry explicit framework metadata in
 * src/data/stories.ts. The old story-page path threw that away and re-derived
 * a mapping from the choice TEXT (`buildChoiceFrameworkWeights`) and/or paid for
 * a live `scoreEthicalJudgment` AI call on every click. Both are wrong:
 *   - the text heuristic produced "did not clearly align" misses, and
 *   - the AI call froze the UI on every decision.
 * Feeding a deterministic analysis built from the AUTHORED impacts makes the
 * profile scoring authoritative, instant, and free.
 */

import type { ChoiceFrameworkImpact, EthicalJudgmentAnalysis } from '@/types';
import { buildDeterministicEthicalAnalysis } from '@/lib/ethical-judgment/recording';

/**
 * Convert authored impacts (weight on the 1–3 "leans / clearly / strongly"
 * scale) into the 0–100 `frameworkWeights` map the judgment pipeline reads.
 * `buildDeterministicEthicalAnalysis` keeps values > 1 as-is, so we map the
 * small authored weights onto a meaningful 0–100 band.
 */
export function impactsToFrameworkWeights(
  impacts: ChoiceFrameworkImpact[] | undefined,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const impact of impacts ?? []) {
    if (!impact?.framework) continue;
    const w = Number(impact.weight) || 1;
    const score = w >= 3 ? 100 : w === 2 ? 80 : 60;
    out[impact.framework] = Math.max(out[impact.framework] ?? 0, score);
  }
  return out;
}

/**
 * Build a deterministic `EthicalJudgmentAnalysis` from authored impacts so the
 * profile-scoring path can skip the live AI call entirely (the server action
 * only calls `scoreEthicalJudgment` when `!input.analysis`). Returns undefined
 * when there are no usable impacts, so callers can decide whether to record at
 * all.
 */
export function impactsToDeterministicAnalysis(
  impacts: ChoiceFrameworkImpact[] | undefined,
  opts: { promptText: string; userText?: string },
): EthicalJudgmentAnalysis | undefined {
  const frameworkWeights = impactsToFrameworkWeights(impacts);
  if (Object.keys(frameworkWeights).length === 0) return undefined;
  return buildDeterministicEthicalAnalysis({
    frameworkWeights,
    promptText: opts.promptText,
    userText: opts.userText,
    confidence: 0.8,
  });
}
