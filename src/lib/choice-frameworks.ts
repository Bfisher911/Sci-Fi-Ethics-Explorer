/**
 * COMPATIBILITY SHIM.
 *
 * The ethical-framework system was consolidated into a single registry
 * at src/lib/ethics/frameworks.ts (18 frameworks) plus a weighted
 * classifier at src/lib/ethics/classify.ts. This file used to hold a
 * stand-alone 5-framework system with its own IDs; it now re-exports
 * the canonical pieces so any lingering imports keep compiling.
 *
 * New code should import from '@/lib/ethics/frameworks' and
 * '@/lib/ethics/classify' directly. This shim can be deleted once no
 * imports remain.
 */

import {
  FRAMEWORK_META,
  type FrameworkId as CanonicalFrameworkId,
  type FrameworkMeta,
} from '@/lib/ethics/frameworks';
import { classifyChoicePrimary } from '@/lib/ethics/classify';

/** @deprecated Use FrameworkId from '@/lib/ethics/frameworks'. */
export type FrameworkId = CanonicalFrameworkId | 'unaligned';

/** @deprecated Use FrameworkMeta from '@/lib/ethics/frameworks'. */
export type FrameworkInfo = FrameworkMeta;

/** @deprecated Use FRAMEWORK_META from '@/lib/ethics/frameworks'. */
export const FRAMEWORK_INFO: Record<FrameworkId, FrameworkMeta> = {
  ...FRAMEWORK_META,
  unaligned: {
    id: 'utilitarianism', // placeholder; never read for the unaligned case
    label: 'Open',
    shortLabel: '—',
    hint: 'No clear framework alignment.',
    color: 'text-muted-foreground',
    accent: 'border-border bg-muted/20',
    route: '/glossary',
  },
};

/**
 * @deprecated Use classifyChoicePrimary / classifyChoiceWeighted from
 * '@/lib/ethics/classify'. Returns the canonical primary framework ID,
 * or 'unaligned' when nothing matches.
 */
export function classifyChoice(choiceText: string): FrameworkId {
  return classifyChoicePrimary(choiceText) ?? 'unaligned';
}

export function buildChoiceFrameworkWeights(choiceText: string): Record<string, number> {
  const frameworkId = classifyChoice(choiceText);
  if (frameworkId === 'unaligned') return {};
  return { [frameworkId]: 100 };
}

export function getFrameworkInfo(id: FrameworkId): FrameworkInfo {
  return FRAMEWORK_INFO[id];
}
