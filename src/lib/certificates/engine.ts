/**
 * Pure certificate rule engine.
 *
 * Given a pre-computed `CertificateContext`, decide each certificate's progress
 * and whether it is earned. No Firestore, no React — fully unit-testable. The
 * server action (`achievement-certificates.ts`) builds the context and calls
 * these; the dashboard renders the result; nothing else needs certificate logic.
 */

import {
  CERTIFICATE_DEFINITIONS,
  type CertificateContext,
  type CertificateDefinition,
  type CertificateCategory,
  type CertificateKind,
} from './registry';

export interface CertificateProgress {
  id: string;
  title: string;
  description: string;
  criteria: string;
  category: CertificateCategory;
  kind: CertificateKind;
  /** Progress numerator (e.g. stories completed, quizzes passed). */
  current: number;
  /** Progress denominator / threshold to earn. */
  target: number;
  /** True when the certificate is earned. */
  earned: boolean;
  /** 0–100, clamped, for progress bars. 0 when target is 0. */
  percent: number;
}

/**
 * Evaluate a single certificate definition against the context.
 *
 * Earned ⇔ `target > 0` AND `current >= target`. The `target > 0` guard is
 * essential for quiz-mastery certificates whose denominator can legitimately be
 * 0 (e.g. no philosopher quizzes seeded yet) — an empty category must NEVER be
 * treated as "mastered".
 */
export function evaluate(
  def: CertificateDefinition,
  ctx: CertificateContext
): CertificateProgress {
  const { current: rawCurrent, target: rawTarget } = def.metric(ctx);
  const target = Math.max(0, Math.floor(rawTarget));
  // Never show progress beyond the target.
  const current = Math.max(0, Math.min(Math.floor(rawCurrent), target || Infinity));
  const earned = target > 0 && current >= target;
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    criteria: def.criteria,
    category: def.category,
    kind: def.kind,
    current,
    target,
    earned,
    percent,
  };
}

/** Evaluate every registered certificate against the context. */
export function evaluateAll(ctx: CertificateContext): CertificateProgress[] {
  return CERTIFICATE_DEFINITIONS.map((def) => evaluate(def, ctx));
}

/** Just the earned certificate definitions, for award/issuance. */
export function earnedDefinitions(
  ctx: CertificateContext
): CertificateDefinition[] {
  return CERTIFICATE_DEFINITIONS.filter((def) => evaluate(def, ctx).earned);
}
