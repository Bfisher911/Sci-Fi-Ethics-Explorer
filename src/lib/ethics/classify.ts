/**
 * Heuristic fallback classifier — keyword matching, no AI call.
 *
 * When a story choice has explicit `frameworks` metadata (authored in
 * src/data/stories.ts), that metadata is authoritative and this file is
 * NOT consulted. This classifier exists only to give *some* signal for
 * choices that haven't been annotated yet (e.g. user-submitted or
 * AI-generated branching stories), so the ethical-journey tracker
 * degrades gracefully rather than recording nothing.
 *
 * It returns WEIGHTED impacts across the 18 canonical frameworks — a
 * choice can match several — rather than the old single-label result.
 * Runs synchronously on every choice with no latency or cost.
 */

import type { ChoiceFrameworkImpact, StoryChoice } from '@/types';
import type { FrameworkId } from './frameworks';

interface Matcher {
  id: FrameworkId;
  /** Lowercased phrases that suggest this framework. */
  cues: string[];
}

/**
 * Cue lists per framework. Deliberately conservative — better to leave
 * a choice unclassified than to mislabel it. Authored metadata should
 * carry the real weight; this is a safety net.
 */
const MATCHERS: Matcher[] = [
  {
    id: 'utilitarianism',
    cues: [
      'most lives', 'greatest good', 'save the most', 'maximize', 'overall',
      'aggregate', 'benefit the most', 'welfare', 'most people', 'sacrifice one',
      'sacrifice the few', 'fewest casualties', 'optimal', 'lesser of two',
      'the numbers', 'efficient', 'greater good', 'net benefit',
    ],
  },
  {
    id: 'deontology',
    cues: [
      'never lie', 'cannot lie', 'duty', 'principle', 'the rule', 'oath',
      'swear', 'promise', 'inviolable', 'absolute', 'must not', 'forbidden',
      'rights', 'dignity', 'tell the truth', 'refuse to deceive', 'on principle',
      'no matter the cost', 'wrong in itself',
    ],
  },
  {
    id: 'virtue-ethics',
    cues: [
      'integrity', 'character', 'who i want to be', 'kind of person', 'honor',
      'courage', 'be brave', 'be honest', 'wisdom', 'flourish', 'cultivate',
      'live with myself', 'become', 'good person',
    ],
  },
  {
    id: 'social-contract-theory',
    cues: [
      'agreement', 'protocol', 'treaty', 'vote', 'democratic', 'institution',
      'mandate', 'agreed upon', 'social order', 'rule of law', 'constitution',
      'terms everyone', 'governance', 'legitimate authority',
    ],
  },
  {
    id: 'ethics-of-care',
    cues: [
      'this person', 'their family', 'tend to', 'comfort', 'hold their',
      'sit with', 'listen', 'be with', 'who they are', 'relationship',
      'attentive', 'present with', 'care for', 'the one in front of',
    ],
  },
  {
    id: 'contractualism',
    cues: [
      'could not reasonably reject', 'justify to', 'defend to each', 'owe them an answer',
      'look them in the eye', 'reasonable rejection', 'answerable to', 'every affected',
    ],
  },
  {
    id: 'capabilities-approach',
    cues: [
      'able to', 'real freedom', 'opportunity to', 'capability', 'flourish fully',
      'develop their', 'access to', 'what they can become', 'enable them',
    ],
  },
  {
    id: 'ubuntu-ethics',
    cues: [
      'community', 'restore', 'reconcile', 'we are', 'belong', 'collective healing',
      'the whole village', 'repair the relationship', 'together we',
    ],
  },
  {
    id: 'natural-law',
    cues: [
      'natural', 'against nature', 'human nature', 'proper function', 'intrinsic purpose',
      'the natural order', 'basic goods',
    ],
  },
  {
    id: 'stoicism',
    cues: [
      'within my control', 'not up to me', 'accept what', 'endure', 'composure',
      'master my', 'what i can control', 'equanimity', 'discipline',
    ],
  },
  {
    id: 'divine-command',
    cues: [
      'sacred', 'god', 'faith', 'commandment', 'higher authority', 'holy',
      'divine', 'my creed', 'forbidden by',
    ],
  },
  {
    id: 'existentialist-ethics',
    cues: [
      'choose for myself', 'create my own', 'no one can tell me', 'authentic',
      'radical freedom', 'invent', 'my own meaning', 'refuse the role', 'bad faith',
    ],
  },
  {
    id: 'discourse-ethics',
    cues: [
      'discuss it', 'put it to the group', 'deliberate', 'everyone has a say',
      'hear all sides', 'consensus', 'open debate', 'include every voice',
    ],
  },
  {
    id: 'buddhist-ethics',
    cues: [
      'suffering', 'compassion', 'let go', 'attachment', 'mindful', 'do no harm',
      'ease their pain', 'loving-kindness',
    ],
  },
  {
    id: 'daoist-ethics',
    cues: [
      'go with the flow', 'do nothing', 'let it unfold', 'not force', 'natural way',
      'effortless', 'yield', 'wu wei', 'with the grain',
    ],
  },
  {
    id: 'pragmatist-ethics',
    cues: [
      'try it and see', 'experiment', 'whatever works', 'test it', 'see what happens',
      'practical', 'adjust later', 'iterate', 'in practice',
    ],
  },
  {
    id: 'environmental-ethics',
    cues: [
      'the planet', 'ecosystem', 'the land', 'native life', 'biosphere',
      'wilderness', 'the species', 'the environment', 'preserve the world',
    ],
  },
  {
    id: 'cosmopolitanism',
    cues: [
      'all of humanity', 'every being', 'across borders', 'no matter where',
      'strangers far away', 'global', 'all people equally', 'world citizen',
    ],
  },
];

/**
 * Produce weighted framework impacts for a choice text. Returns up to
 * `maxFrameworks` matches, weighted by how many distinct cues matched
 * (capped at 3). Empty array when nothing matches — the caller then
 * records a journey entry with no framework movement, which is fine.
 */
export function classifyChoiceWeighted(
  choiceText: string,
  maxFrameworks = 2,
): ChoiceFrameworkImpact[] {
  const lower = choiceText.toLowerCase();
  const scored: { id: FrameworkId; score: number }[] = [];
  for (const m of MATCHERS) {
    let score = 0;
    for (const cue of m.cues) {
      if (lower.includes(cue)) score++;
    }
    if (score > 0) scored.push({ id: m.id, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxFrameworks).map((s) => ({
    framework: s.id,
    weight: Math.min(3, s.score),
    rationale: 'Inferred from the wording of this choice (heuristic).',
  }));
}

/**
 * Back-compat single-label classifier. Returns the dominant framework
 * ID or null when nothing matches. Some older call sites want just a
 * label; prefer classifyChoiceWeighted for new code.
 */
export function classifyChoicePrimary(choiceText: string): FrameworkId | null {
  const weighted = classifyChoiceWeighted(choiceText, 1);
  return weighted.length > 0 ? (weighted[0].framework as FrameworkId) : null;
}

/**
 * Resolve the framework impacts for a story choice. Authored metadata
 * (`choice.frameworks`) is authoritative; the heuristic classifier is
 * used only as a fallback for choices that haven't been annotated.
 * This is the single entry point the Story page uses so the rule
 * "authored wins, heuristic fills gaps" lives in exactly one place.
 */
export function resolveChoiceImpacts(
  choice: StoryChoice,
): ChoiceFrameworkImpact[] {
  if (choice.frameworks && choice.frameworks.length > 0) {
    return choice.frameworks;
  }
  return classifyChoiceWeighted(choice.text);
}
