/**
 * Canonical ethical-framework registry — THE single source of truth.
 *
 * The site's Ethical Frameworks section (src/data/ethical-theories.ts)
 * lists 18 frameworks. Everything that reasons about "which ethical
 * framework does this map to" — the Story "Your Path" card, the choice
 * classifier, the profile ethical-journey breakdown, the AI report —
 * must draw its framework list from HERE so the set can never drift
 * out of sync again.
 *
 * Previously the Story tracker hard-coded only five frameworks
 * (utilitarian, deontological, virtue, contractarian, care) with their
 * own ad-hoc IDs (`social-contract`, `care-ethics`). Those legacy IDs
 * are mapped onto the canonical IDs below via LEGACY_FRAMEWORK_ALIASES
 * so any data written under the old scheme still scores correctly.
 *
 * To add a 19th framework: add it to src/data/ethical-theories.ts AND
 * add a row to FRAMEWORK_META here. The `FrameworkId` type and the
 * FRAMEWORK_IDS array derive from FRAMEWORK_META, so the rest of the
 * app (scoring, charts, card) picks it up automatically.
 */

import { ethicalTheories } from '@/data/ethical-theories';

/**
 * The 18 canonical framework IDs. These MUST match the `id` field of
 * the entries in src/data/ethical-theories.ts. A runtime assertion at
 * the bottom of this file fails loudly in development if they drift.
 */
export type FrameworkId =
  | 'utilitarianism'
  | 'deontology'
  | 'virtue-ethics'
  | 'social-contract-theory'
  | 'ethics-of-care'
  | 'contractualism'
  | 'capabilities-approach'
  | 'ubuntu-ethics'
  | 'natural-law'
  | 'stoicism'
  | 'divine-command'
  | 'existentialist-ethics'
  | 'discourse-ethics'
  | 'buddhist-ethics'
  | 'daoist-ethics'
  | 'pragmatist-ethics'
  | 'environmental-ethics'
  | 'cosmopolitanism'
  | 'consequentialism'
  | 'rights-based-ethics'
  | 'justice-ethics'
  | 'autonomy';

export interface FrameworkMeta {
  id: FrameworkId;
  /** Full display name (e.g. "Social Contract Theory"). */
  label: string;
  /** Compact label for tight UI (chips, narrow bars). */
  shortLabel: string;
  /** One-sentence plain-language gloss, shown in the Your Path card. */
  hint: string;
  /** Tailwind text color class, e.g. "text-amber-300". */
  color: string;
  /** Tailwind border + faint-background tint for accent surfaces. */
  accent: string;
  /** Route to the framework's glossary entry. */
  route: string;
}

/**
 * Display + reasoning metadata for each framework. The `label`s are
 * short, clean display names (the glossary uses longer formal names
 * like "Deontology (Kantian Ethics)"); the `hint`s are written fresh
 * here as one-liners suitable for a crowded card.
 *
 * Colors are 18 visually distinct hues. Bar fills are derived by
 * swapping `text-` → `bg-` at render time, so each entry only needs
 * one color class.
 */
export const FRAMEWORK_META: Record<FrameworkId, FrameworkMeta> = {
  utilitarianism: {
    id: 'utilitarianism',
    label: 'Utilitarian',
    shortLabel: 'Util',
    hint: 'Optimizes for the greatest overall well-being across everyone affected.',
    color: 'text-amber-300',
    accent: 'border-amber-300/40 bg-amber-300/5',
    route: '/glossary/utilitarianism',
  },
  deontology: {
    id: 'deontology',
    label: 'Deontological',
    shortLabel: 'Duty',
    hint: 'Follows duties and rules that hold regardless of the outcome.',
    color: 'text-blue-300',
    accent: 'border-blue-300/40 bg-blue-300/5',
    route: '/glossary/deontology',
  },
  'virtue-ethics': {
    id: 'virtue-ethics',
    label: 'Virtue',
    shortLabel: 'Virtue',
    hint: 'Asks what a person of good character would do.',
    color: 'text-emerald-300',
    accent: 'border-emerald-300/40 bg-emerald-300/5',
    route: '/glossary/virtue-ethics',
  },
  'social-contract-theory': {
    id: 'social-contract-theory',
    label: 'Social Contract',
    shortLabel: 'Contract',
    hint: 'Honors terms free and equal people could agree to.',
    color: 'text-purple-300',
    accent: 'border-purple-300/40 bg-purple-300/5',
    route: '/glossary/social-contract-theory',
  },
  'ethics-of-care': {
    id: 'ethics-of-care',
    label: 'Care',
    shortLabel: 'Care',
    hint: 'Attends to the particular needs of those in relationship with you.',
    color: 'text-pink-300',
    accent: 'border-pink-300/40 bg-pink-300/5',
    route: '/glossary/ethics-of-care',
  },
  contractualism: {
    id: 'contractualism',
    label: 'Contractualist',
    shortLabel: 'Justify',
    hint: 'Acts only on principles no one could reasonably reject.',
    color: 'text-sky-300',
    accent: 'border-sky-300/40 bg-sky-300/5',
    route: '/glossary/contractualism',
  },
  'capabilities-approach': {
    id: 'capabilities-approach',
    label: 'Capabilities',
    shortLabel: 'Capab.',
    hint: 'Protects what people are actually able to do and to be.',
    color: 'text-lime-300',
    accent: 'border-lime-300/40 bg-lime-300/5',
    route: '/glossary/capabilities-approach',
  },
  'ubuntu-ethics': {
    id: 'ubuntu-ethics',
    label: 'Ubuntu',
    shortLabel: 'Ubuntu',
    hint: 'Restores relationships and community — "I am because we are."',
    color: 'text-orange-300',
    accent: 'border-orange-300/40 bg-orange-300/5',
    route: '/glossary/ubuntu-ethics',
  },
  'natural-law': {
    id: 'natural-law',
    label: 'Natural Law',
    shortLabel: 'Nat.Law',
    hint: 'Acts in accord with the basic goods of human nature.',
    color: 'text-yellow-300',
    accent: 'border-yellow-300/40 bg-yellow-300/5',
    route: '/glossary/natural-law',
  },
  stoicism: {
    id: 'stoicism',
    label: 'Stoic',
    shortLabel: 'Stoic',
    hint: 'Focuses on virtue and what is within your own control.',
    color: 'text-teal-300',
    accent: 'border-teal-300/40 bg-teal-300/5',
    route: '/glossary/stoicism',
  },
  'divine-command': {
    id: 'divine-command',
    label: 'Divine Command',
    shortLabel: 'Divine',
    hint: 'Grounds right action in obedience to a higher moral authority.',
    color: 'text-indigo-300',
    accent: 'border-indigo-300/40 bg-indigo-300/5',
    route: '/glossary/divine-command',
  },
  'existentialist-ethics': {
    id: 'existentialist-ethics',
    label: 'Existentialist',
    shortLabel: 'Exist.',
    hint: 'Authors its own values in radical, responsible freedom.',
    color: 'text-rose-300',
    accent: 'border-rose-300/40 bg-rose-300/5',
    route: '/glossary/existentialist-ethics',
  },
  'discourse-ethics': {
    id: 'discourse-ethics',
    label: 'Discourse',
    shortLabel: 'Dialog',
    hint: 'Validates norms through inclusive, rational dialogue.',
    color: 'text-fuchsia-300',
    accent: 'border-fuchsia-300/40 bg-fuchsia-300/5',
    route: '/glossary/discourse-ethics',
  },
  'buddhist-ethics': {
    id: 'buddhist-ethics',
    label: 'Buddhist',
    shortLabel: 'Buddh.',
    hint: 'Reduces suffering through compassion and non-attachment.',
    color: 'text-amber-200',
    accent: 'border-amber-200/40 bg-amber-200/5',
    route: '/glossary/buddhist-ethics',
  },
  'daoist-ethics': {
    id: 'daoist-ethics',
    label: 'Daoist',
    shortLabel: 'Dao',
    hint: 'Acts with the grain of how things naturally go (wu wei).',
    color: 'text-cyan-300',
    accent: 'border-cyan-300/40 bg-cyan-300/5',
    route: '/glossary/daoist-ethics',
  },
  'pragmatist-ethics': {
    id: 'pragmatist-ethics',
    label: 'Pragmatist',
    shortLabel: 'Pragm.',
    hint: 'Tests what works in practice and revises by the results.',
    color: 'text-violet-300',
    accent: 'border-violet-300/40 bg-violet-300/5',
    route: '/glossary/pragmatist-ethics',
  },
  'environmental-ethics': {
    id: 'environmental-ethics',
    label: 'Environmental',
    shortLabel: 'Enviro',
    hint: 'Extends moral standing to ecosystems and non-human life.',
    color: 'text-green-400',
    accent: 'border-green-400/40 bg-green-400/5',
    route: '/glossary/environmental-ethics',
  },
  cosmopolitanism: {
    id: 'cosmopolitanism',
    label: 'Cosmopolitan',
    shortLabel: 'Cosmo',
    hint: 'Grants equal moral standing to all beings, across every border.',
    color: 'text-sky-400',
    accent: 'border-sky-400/40 bg-sky-400/5',
    route: '/glossary/cosmopolitanism',
  },
  consequentialism: {
    id: 'consequentialism',
    label: 'Consequentialist',
    shortLabel: 'Conseq.',
    hint: 'Judges actions by the outcomes they actually produce at scale.',
    color: 'text-amber-400',
    accent: 'border-amber-400/40 bg-amber-400/5',
    route: '/glossary/consequentialism',
  },
  'rights-based-ethics': {
    id: 'rights-based-ethics',
    label: 'Rights-Based',
    shortLabel: 'Rights',
    hint: 'Treats individual rights as trumps that outcomes may not override.',
    color: 'text-blue-400',
    accent: 'border-blue-400/40 bg-blue-400/5',
    route: '/glossary/rights-based-ethics',
  },
  'justice-ethics': {
    id: 'justice-ethics',
    label: 'Justice',
    shortLabel: 'Justice',
    hint: 'Asks who bears the burdens and benefits — fairness and equity first.',
    color: 'text-emerald-400',
    accent: 'border-emerald-400/40 bg-emerald-400/5',
    route: '/glossary/justice-ethics',
  },
  autonomy: {
    id: 'autonomy',
    label: 'Autonomy',
    shortLabel: 'Auton.',
    hint: 'Protects people\'s informed, uncoerced power to govern their own choices.',
    color: 'text-rose-400',
    accent: 'border-rose-400/40 bg-rose-400/5',
    route: '/glossary/autonomy',
  },
};

/** All 18 canonical IDs, in display order. */
export const FRAMEWORK_IDS = Object.keys(FRAMEWORK_META) as FrameworkId[];

/**
 * Legacy → canonical ID map. The original 5-framework tracker used
 * its own IDs; map them forward so any persisted journey data written
 * under the old scheme still resolves. Also tolerate a few natural
 * spellings the AI or older code might emit.
 */
export const LEGACY_FRAMEWORK_ALIASES: Record<string, FrameworkId> = {
  'social-contract': 'social-contract-theory',
  'social-contract-theory': 'social-contract-theory',
  'care-ethics': 'ethics-of-care',
  care: 'ethics-of-care',
  'ethics-of-care': 'ethics-of-care',
  utilitarian: 'utilitarianism',
  deontological: 'deontology',
  deontological_ethics: 'deontology',
  virtue: 'virtue-ethics',
  contractarian: 'social-contract-theory',
  contractualist: 'contractualism',
  capabilities: 'capabilities-approach',
  ubuntu: 'ubuntu-ethics',
  'natural-law-theory': 'natural-law',
  stoic: 'stoicism',
  existentialist: 'existentialist-ethics',
  discourse: 'discourse-ethics',
  buddhist: 'buddhist-ethics',
  daoist: 'daoist-ethics',
  taoist: 'daoist-ethics',
  pragmatist: 'pragmatist-ethics',
  environmental: 'environmental-ethics',
  cosmopolitan: 'cosmopolitanism',
  // Newly first-class frameworks + the spec's naming variants.
  consequentialism: 'consequentialism',
  consequentialist: 'consequentialism',
  'rights-based': 'rights-based-ethics',
  'rights-based-ethics': 'rights-based-ethics',
  rights_based_ethics: 'rights-based-ethics',
  rights: 'rights-based-ethics',
  'justice-ethics': 'justice-ethics',
  justice_ethics: 'justice-ethics',
  justice: 'justice-ethics',
  'distributive-justice': 'justice-ethics',
  fairness: 'justice-ethics',
  autonomy: 'autonomy',
  'respect-for-autonomy': 'autonomy',
  'relational-autonomy': 'autonomy',
};

/**
 * Coerce an arbitrary string into a canonical FrameworkId, or null if
 * it can't be resolved. Tolerant of casing, spaces, and the legacy
 * aliases above.
 */
export function normalizeFrameworkId(raw: string): FrameworkId | null {
  if (!raw) return null;
  // Lowercase, then collapse spaces AND underscores to hyphens so the
  // spec's snake_case keys (care_ethics, rights_based_ethics, …) and
  // space-separated names both resolve.
  const slug = raw.trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (slug in FRAMEWORK_META) return slug as FrameworkId;
  if (slug in LEGACY_FRAMEWORK_ALIASES) return LEGACY_FRAMEWORK_ALIASES[slug];
  return null;
}

export function getFrameworkMeta(id: FrameworkId): FrameworkMeta {
  return FRAMEWORK_META[id];
}

/** Tailwind bar-fill class derived from a framework's text color. */
export function frameworkBarClass(id: FrameworkId): string {
  return FRAMEWORK_META[id].color.replace('text-', 'bg-');
}

// ─── Development-time integrity check ──────────────────────────────
// Fail loudly if the registry and the glossary data fall out of sync.
// Runs once at module load; stripped of cost in production (the work
// is trivial either way).
if (process.env.NODE_ENV !== 'production') {
  const glossaryIds = new Set(ethicalTheories.map((t) => t.id));
  const registryIds = new Set<string>(FRAMEWORK_IDS);
  const missingFromRegistry = [...glossaryIds].filter(
    (id) => !registryIds.has(id),
  );
  const missingFromGlossary = [...registryIds].filter(
    (id) => !glossaryIds.has(id),
  );
  if (missingFromRegistry.length || missingFromGlossary.length) {
    // eslint-disable-next-line no-console
    console.warn(
      '[ethics/frameworks] Registry out of sync with ethical-theories.ts.',
      { missingFromRegistry, missingFromGlossary },
    );
  }
}
