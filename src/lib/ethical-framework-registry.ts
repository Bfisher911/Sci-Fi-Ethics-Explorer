import { ethicalTheories } from '@/data/ethical-theories';
import type { EthicalTheory } from '@/types';

type FrameworkMetadata = Required<
  Pick<
    EthicalTheory,
    | 'shortDescription'
    | 'keyQuestion'
    | 'strengths'
    | 'blindSpots'
    | 'exampleApplication'
    | 'tags'
    | 'activeInScoring'
    | 'color'
    | 'icon'
  >
>;

const DEFAULT_COLOR = '#7df9ff';

const METADATA: Record<string, FrameworkMetadata> = {
  utilitarianism: {
    shortDescription: 'Evaluates choices by their outcomes for overall well-being.',
    keyQuestion: 'Which option produces the greatest balance of well-being over harm for everyone affected?',
    strengths: ['Takes consequences seriously', 'Centers preventable suffering', 'Supports policy comparison'],
    blindSpots: ['Can underweight rights', 'Can make unfair tradeoffs invisible', 'Depends on uncertain forecasts'],
    exampleApplication: 'Compare the total harms and benefits of deploying a risky medical AI.',
    tags: ['consequences', 'welfare', 'tradeoffs'],
    activeInScoring: true,
    color: '#f59e0b',
    icon: 'scale',
  },
  deontology: {
    shortDescription: 'Focuses on duties, rights, rules, and respect for persons.',
    keyQuestion: 'What duties or rights must be honored regardless of the outcome?',
    strengths: ['Protects dignity', 'Resists sacrificing individuals', 'Clarifies consent and obligation'],
    blindSpots: ['Can become rigid', 'Can struggle when duties conflict', 'May underweight catastrophic outcomes'],
    exampleApplication: 'Ask whether a surveillance system violates consent even if it improves safety.',
    tags: ['duty', 'rights', 'consent'],
    activeInScoring: true,
    color: '#60a5fa',
    icon: 'shield-check',
  },
  'virtue-ethics': {
    shortDescription: 'Asks what wise, courageous, and humane character would do.',
    keyQuestion: 'What choice expresses good character and practical wisdom in this situation?',
    strengths: ['Attends to character', 'Fits messy human contexts', 'Encourages moral growth'],
    blindSpots: ['Can be vague', 'May depend on contested ideals', 'Can under-specify institutions'],
    exampleApplication: 'Evaluate whether a developer shows humility before releasing powerful automation.',
    tags: ['character', 'wisdom', 'flourishing'],
    activeInScoring: true,
    color: '#34d399',
    icon: 'sprout',
  },
  'social-contract-theory': {
    shortDescription: 'Grounds ethics in fair rules people could reasonably accept together.',
    keyQuestion: 'What rules would free and equal people agree to under fair conditions?',
    strengths: ['Emphasizes legitimacy', 'Supports civic trust', 'Makes governance visible'],
    blindSpots: ['May exclude those outside the contract', 'Can preserve unfair baselines', 'May move slowly'],
    exampleApplication: 'Ask whether citizens have genuinely authorized a data-sharing regime.',
    tags: ['agreement', 'legitimacy', 'governance'],
    activeInScoring: true,
    color: '#a78bfa',
    icon: 'handshake',
  },
  'ethics-of-care': {
    shortDescription: 'Centers relationships, dependency, attention, and concrete needs.',
    keyQuestion: 'Who depends on whom here, and what attentive response preserves care?',
    strengths: ['Sees vulnerability', 'Values relationships', 'Corrects overly abstract reasoning'],
    blindSpots: ['Can be hard to scale', 'May privilege nearby relationships', 'Can blur boundaries'],
    exampleApplication: 'Consider how elder-care robots affect trust, loneliness, and family obligation.',
    tags: ['care', 'relationship', 'dependency'],
    activeInScoring: true,
    color: '#f472b6',
    icon: 'heart-handshake',
  },
  contractualism: {
    shortDescription: 'Tests principles by whether they can be justified to each person.',
    keyQuestion: 'Could anyone reasonably reject the principle behind this choice?',
    strengths: ['Respects persons individually', 'Avoids simple aggregation', 'Clarifies justification'],
    blindSpots: ['Can be indeterminate', 'May struggle with non-person entities', 'Needs shared reason-giving norms'],
    exampleApplication: 'Ask whether a biometric policy is justifiable to the people most burdened by it.',
    tags: ['justification', 'reasonable-rejection', 'persons'],
    activeInScoring: true,
    color: '#818cf8',
    icon: 'messages-square',
  },
  'capabilities-approach': {
    shortDescription: "Measures justice by people's real opportunities to live and flourish.",
    keyQuestion: 'Which option expands or protects real capabilities for a dignified life?',
    strengths: ['Connects rights to lived reality', 'Highlights inequality', 'Supports human development'],
    blindSpots: ['Requires contested capability lists', 'Can be resource-intensive', 'May be hard to compare'],
    exampleApplication: 'Assess whether an education AI expands meaningful learning access.',
    tags: ['flourishing', 'justice', 'opportunity'],
    activeInScoring: true,
    color: '#22c55e',
    icon: 'activity',
  },
  'ubuntu-ethics': {
    shortDescription: 'Understands personhood through community, reciprocity, and shared humanity.',
    keyQuestion: 'How does this choice affect mutual recognition and communal flourishing?',
    strengths: ['Centers interdependence', 'Supports restorative thinking', 'Resists atomized individualism'],
    blindSpots: ['Can understate dissent', 'May be hard to translate across contexts', 'Can romanticize community'],
    exampleApplication: 'Ask whether a platform design builds mutual recognition or social fragmentation.',
    tags: ['community', 'interdependence', 'restoration'],
    activeInScoring: true,
    color: '#fb7185',
    icon: 'users',
  },
  'natural-law': {
    shortDescription: 'Looks to human purposes, basic goods, and moral order.',
    keyQuestion: 'Does this choice respect basic goods and the purposes built into human life?',
    strengths: ['Names basic goods', 'Connects ethics to human flourishing', 'Challenges pure preference satisfaction'],
    blindSpots: ['Can be contested in pluralistic settings', 'May resist change too quickly', 'Needs care with biology claims'],
    exampleApplication: 'Evaluate whether reproductive technology respects or distorts human goods.',
    tags: ['basic-goods', 'human-nature', 'purpose'],
    activeInScoring: true,
    color: '#84cc16',
    icon: 'leaf',
  },
  stoicism: {
    shortDescription: 'Emphasizes virtue, self-command, and acting rightly under what cannot be controlled.',
    keyQuestion: 'What is within our control, and what response preserves wisdom and integrity?',
    strengths: ['Builds resilience', 'Clarifies agency', 'Supports disciplined action under pressure'],
    blindSpots: ['Can sound emotionally detached', 'May underplay structural injustice', 'Can normalize hardship'],
    exampleApplication: 'Guide a crew through disaster by separating controllable duties from uncontrollable loss.',
    tags: ['resilience', 'self-command', 'virtue'],
    activeInScoring: true,
    color: '#94a3b8',
    icon: 'mountain',
  },
  'divine-command': {
    shortDescription: 'Grounds moral obligation in divine authority or sacred command.',
    keyQuestion: 'What does obedience to sacred moral authority require here?',
    strengths: ['Gives strong moral motivation', 'Names sacred limits', 'Connects action to ultimate accountability'],
    blindSpots: ['Can be inaccessible across traditions', 'May conflict with pluralistic governance', 'Requires interpretation'],
    exampleApplication: 'Ask whether a life-extension technology violates sacred limits on life and death.',
    tags: ['sacred', 'obedience', 'authority'],
    activeInScoring: true,
    color: '#facc15',
    icon: 'sun',
  },
  'existentialist-ethics': {
    shortDescription: 'Focuses on freedom, responsibility, authenticity, and self-making choices.',
    keyQuestion: 'What choice owns freedom honestly without hiding behind systems or excuses?',
    strengths: ['Highlights responsibility', 'Challenges bad faith', 'Respects lived meaning'],
    blindSpots: ['Can underweight institutions', 'May overburden individual choice', 'Can be hard to operationalize'],
    exampleApplication: 'Ask whether a scientist takes responsibility for a technology they helped unleash.',
    tags: ['freedom', 'authenticity', 'responsibility'],
    activeInScoring: true,
    color: '#fb923c',
    icon: 'flame',
  },
  'discourse-ethics': {
    shortDescription: 'Treats legitimate norms as those formed through inclusive, rational dialogue.',
    keyQuestion: 'Have all affected people had a fair voice in shaping the norm?',
    strengths: ['Centers participation', 'Supports democratic legitimacy', 'Exposes distorted communication'],
    blindSpots: ['Can be slow', 'Requires fair communication conditions', 'May struggle in emergencies'],
    exampleApplication: 'Design public deliberation around facial-recognition deployment.',
    tags: ['deliberation', 'participation', 'legitimacy'],
    activeInScoring: true,
    color: '#38bdf8',
    icon: 'message-circle',
  },
  'buddhist-ethics': {
    shortDescription: 'Aims to reduce suffering through compassion, non-attachment, and wise action.',
    keyQuestion: 'Which response reduces suffering and craving while cultivating compassion?',
    strengths: ['Deeply attends to suffering', 'Discourages ego-driven action', 'Supports compassion'],
    blindSpots: ['Can be misread as passivity', 'May need translation into policy terms', 'Varies by tradition'],
    exampleApplication: 'Assess whether immersive virtual escape reduces suffering or deepens attachment.',
    tags: ['suffering', 'compassion', 'non-attachment'],
    activeInScoring: true,
    color: '#f97316',
    icon: 'lotus',
  },
  'daoist-ethics': {
    shortDescription: 'Seeks harmony, restraint, and non-coercive alignment with natural patterns.',
    keyQuestion: "Where would less forceful intervention better align with the situation's own pattern?",
    strengths: ['Warns against over-control', 'Supports ecological humility', 'Values receptive attention'],
    blindSpots: ['Can seem underactive against injustice', 'May be hard to convert into rules', 'Can romanticize non-intervention'],
    exampleApplication: 'Reconsider a geoengineering plan that may create new problems by overcorrecting.',
    tags: ['harmony', 'restraint', 'non-coercion'],
    activeInScoring: true,
    color: '#14b8a6',
    icon: 'waves',
  },
  'pragmatist-ethics': {
    shortDescription: 'Treats moral ideas as tools to test, revise, and improve shared life.',
    keyQuestion: 'What experiment can improve this situation while remaining open to correction?',
    strengths: ['Adapts to novelty', 'Values learning', 'Fits technology governance well'],
    blindSpots: ['Can lack firm stopping rules', 'May normalize trial-and-error harms', 'Needs good feedback loops'],
    exampleApplication: 'Pilot an AI policy with safeguards, measurement, public feedback, and revision.',
    tags: ['experimentation', 'learning', 'adaptation'],
    activeInScoring: true,
    color: '#2dd4bf',
    icon: 'beaker',
  },
  'environmental-ethics': {
    shortDescription: 'Extends moral concern to animals, ecosystems, species, and planetary systems.',
    keyQuestion: 'What does this choice owe to nonhuman life and ecological integrity?',
    strengths: ['Expands moral scope', 'Highlights long-term stewardship', 'Challenges human-centered shortcuts'],
    blindSpots: ['Can be hard to balance with urgent human needs', 'May compare unlike values', 'Can become abstract'],
    exampleApplication: 'Ask whether terraforming should pause because native microbial life may exist.',
    tags: ['ecology', 'stewardship', 'nonhuman-life'],
    activeInScoring: true,
    color: '#16a34a',
    icon: 'tree-pine',
  },
  cosmopolitanism: {
    shortDescription: 'Treats moral community as wider than nation, tribe, world, or species boundary.',
    keyQuestion: 'How should we act when every person or moral agent counts beyond local borders?',
    strengths: ['Resists parochialism', 'Supports global justice', 'Fits planetary and interstellar problems'],
    blindSpots: ['Can feel rootless', 'May underweight local duties', 'Can mask powerful cultures as universal'],
    exampleApplication: "Negotiate with an alien civilization without treating humanity's interests as automatically superior.",
    tags: ['global-justice', 'universalism', 'hospitality'],
    activeInScoring: true,
    color: '#c084fc',
    icon: 'globe-2',
  },
};

const LEGACY_ID_ALIASES: Record<string, string> = {
  'social-contract': 'social-contract-theory',
  'care-ethics': 'ethics-of-care',
  'ethics-of-responsibility': 'pragmatist-ethics',
  'rights-based-ethics': 'deontology',
  'justice-ethics': 'capabilities-approach',
  'common-good-ethics': 'ubuntu-ethics',
  'precautionary-principle': 'environmental-ethics',
  'human-centered-ethics': 'capabilities-approach',
};

function fallbackMetadata(theory: EthicalTheory, index: number): FrameworkMetadata {
  const firstSentence = theory.description.split(/[.!?]/)[0]?.trim() || theory.description.slice(0, 140);
  return {
    shortDescription: firstSentence.endsWith('.') ? firstSentence : `${firstSentence}.`,
    keyQuestion: `What would ${theory.name} ask us to notice before acting?`,
    strengths: theory.keyConcepts?.slice(0, 3) ?? ['Adds a distinct ethical lens'],
    blindSpots: ['Can miss considerations emphasized by other frameworks'],
    exampleApplication: theory.exampleScenario ?? theory.exampleApplication ?? '',
    tags: theory.keyConcepts?.slice(0, 4).map((item) => item.toLowerCase().replace(/[^a-z0-9]+/g, '-')) ?? [],
    activeInScoring: true,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
    icon: 'sparkles',
  };
}

export type CanonicalEthicalFramework = EthicalTheory & FrameworkMetadata;

export function getCanonicalEthicalFrameworks(): CanonicalEthicalFramework[] {
  return ethicalTheories.map((theory, index) => ({
    ...theory,
    ...fallbackMetadata(theory, index),
    ...(METADATA[theory.id] ?? {}),
    exampleApplication:
      METADATA[theory.id]?.exampleApplication ??
      theory.exampleApplication ??
      theory.exampleScenario ??
      '',
    color: METADATA[theory.id]?.color ?? theory.color ?? DEFAULT_COLOR,
  }));
}

export function getActiveEthicalFrameworks(): CanonicalEthicalFramework[] {
  return getCanonicalEthicalFrameworks().filter((framework) => framework.activeInScoring !== false);
}

export function normalizeFrameworkId(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '-');
  const aliased = LEGACY_ID_ALIASES[normalized] ?? normalized;
  const exists = getCanonicalEthicalFrameworks().some((framework) => framework.id === aliased);
  return exists ? aliased : null;
}

export function getActiveFrameworkIdSet(): Set<string> {
  return new Set(getActiveEthicalFrameworks().map((framework) => framework.id));
}

export function getFrameworkDisplayName(frameworkId: string): string {
  const canonicalId = normalizeFrameworkId(frameworkId);
  return getCanonicalEthicalFrameworks().find((framework) => framework.id === canonicalId)?.name ?? frameworkId;
}
