/**
 * Lightweight heuristic that classifies a story choice by the ethical
 * framework it most resembles. Pure keyword matching — no AI call —
 * so it can run on every hover without latency or cost.
 *
 * Used by:
 * - choice-impact-indicator: floating panel showing per-framework counts
 * - story-detail page: hover hints on choice buttons
 */

export type FrameworkId =
  | 'utilitarianism'
  | 'deontology'
  | 'virtue-ethics'
  | 'social-contract'
  | 'care-ethics'
  | 'unaligned';

export interface FrameworkInfo {
  id: FrameworkId;
  label: string;
  shortLabel: string;
  hint: string;
  /** Tailwind text color class. */
  color: string;
  /** Tailwind border/background tint. */
  accent: string;
}

export const FRAMEWORK_INFO: Record<FrameworkId, FrameworkInfo> = {
  utilitarianism: {
    id: 'utilitarianism',
    label: 'Utilitarian',
    shortLabel: 'Util',
    hint: 'Optimizes for the greatest welfare across everyone affected.',
    color: 'text-amber-300',
    accent: 'border-amber-300/40 bg-amber-300/5',
  },
  deontology: {
    id: 'deontology',
    label: 'Deontological',
    shortLabel: 'Duty',
    hint: 'Follows a rule or duty regardless of outcome.',
    color: 'text-blue-300',
    accent: 'border-blue-300/40 bg-blue-300/5',
  },
  'virtue-ethics': {
    id: 'virtue-ethics',
    label: 'Virtue',
    shortLabel: 'Virtue',
    hint: 'Asks what a person of good character would do.',
    color: 'text-emerald-300',
    accent: 'border-emerald-300/40 bg-emerald-300/5',
  },
  'social-contract': {
    id: 'social-contract',
    label: 'Contractarian',
    shortLabel: 'Contract',
    hint: 'Honors what reasonable people could agree to from equal standing.',
    color: 'text-purple-300',
    accent: 'border-purple-300/40 bg-purple-300/5',
  },
  'care-ethics': {
    id: 'care-ethics',
    label: 'Care',
    shortLabel: 'Care',
    hint: 'Attends to the particular needs of those in your care.',
    color: 'text-pink-300',
    accent: 'border-pink-300/40 bg-pink-300/5',
  },
  unaligned: {
    id: 'unaligned',
    label: 'Open',
    shortLabel: '—',
    hint: 'No clear framework alignment.',
    color: 'text-muted-foreground',
    accent: 'border-border bg-muted/20',
  },
};

interface FrameworkMatcher {
  id: FrameworkId;
  /** Phrases / words that suggest this framework. Lowercased. */
  cues: string[];
}

const MATCHERS: FrameworkMatcher[] = [
  {
    id: 'utilitarianism',
    cues: [
      'most lives', 'greatest good', 'save the most', 'maximize',
      'overall', 'aggregate', 'benefit the most', 'welfare', 'most people',
      'sacrifice one', 'sacrifice the few', 'fewest casualties', 'optimal',
      'lesser of two', 'numbers', 'efficient', 'pragmatic', 'calculate',
    ],
  },
  {
    id: 'deontology',
    cues: [
      'never lie', 'cannot lie', 'duty', 'principle', 'rule', 'oath',
      'swear', 'promise', 'inviolable', 'sacred', 'absolute', 'always',
      'must not', 'forbidden', 'rights', 'dignity', 'consent',
      'tell the truth', 'refuse to deceive', 'on principle',
    ],
  },
  {
    id: 'virtue-ethics',
    cues: [
      'integrity', 'character', 'who i want to be', 'kind of person',
      'honor', 'courage', 'be brave', 'be honest', 'wise', 'wisdom',
      'flourish', 'how i want to', 'live with', 'become', 'cultivate',
    ],
  },
  {
    id: 'social-contract',
    cues: [
      'agreement', 'consent', 'fair', 'fairness', 'protocol', 'treaty',
      'vote', 'democratic', 'institution', 'mandate', 'collective',
      'community decides', 'agreed upon', 'mutually', 'compromise',
      'public good', 'social order',
    ],
  },
  {
    id: 'care-ethics',
    cues: [
      'this person', 'their family', 'tend to', 'comfort', 'hold',
      'sit with', 'listen', 'be with', 'specific need', 'particular',
      'who they are', 'relationship', 'attentive', 'present with',
    ],
  },
];

/**
 * Classify a single choice based on its text.
 */
export function classifyChoice(choiceText: string): FrameworkId {
  const lower = choiceText.toLowerCase();
  let best: FrameworkId = 'unaligned';
  let bestScore = 0;
  for (const m of MATCHERS) {
    let score = 0;
    for (const cue of m.cues) {
      if (lower.includes(cue)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = m.id;
    }
  }
  return best;
}

export function getFrameworkInfo(id: FrameworkId): FrameworkInfo {
  return FRAMEWORK_INFO[id];
}
