/**
 * Dialogue personas — the data-driven "ChatbotProfile" model.
 *
 * Every library entry (philosopher, sci-fi author, sci-fi media work,
 * ethical framework) gets a conversational persona derived from the
 * entry's existing data record. Nothing here is hand-authored per
 * persona except the small CURATED_SCENARIOS map; adding a new library
 * entry automatically yields a working dialogue.
 *
 * This module is PURE DATA + pure functions (no Firestore, no AI calls)
 * so it stays unit-testable. System prompts are assembled server-side
 * in `prompts.ts` — personas returned to the client must go through
 * `toPublicPersona()` so prompt-relevant fields stay out of the payload
 * clients could mine.
 */

import { philosopherData } from '@/data/philosophers';
import { scifiAuthorData } from '@/data/scifi-authors';
import { scifiMediaData } from '@/data/scifi-media';
import {
  getActiveEthicalFrameworks,
  getFrameworkDisplayName,
} from '@/lib/ethical-framework-registry';
import {
  DIALOGUE_CATEGORIES,
  DIALOGUE_CATEGORY_LABELS,
  isDialogueCategory,
  personaActivityId,
  personaCertificateId,
  type DialogueCategory,
  type DialogueMode,
  type PublicDialoguePersona,
} from '@/lib/dialogues/types';

// Re-export the client-safe pieces so server modules can import
// everything from one place.
export {
  DIALOGUE_CATEGORIES,
  DIALOGUE_CATEGORY_LABELS,
  isDialogueCategory,
  personaActivityId,
  personaCertificateId,
};
export type { DialogueCategory, DialogueMode, PublicDialoguePersona };

export interface DialoguePersona {
  /** Entry id within its category (matches the library entry id). */
  id: string;
  category: DialogueCategory;
  displayName: string;
  /** One-or-two sentence student-friendly description. */
  shortDescription: string;
  /** Historical or fictional context, trimmed for prompt use. */
  context: string;
  /** How this persona connects to modern technology ethics. */
  technologyEthicsFocus: string;
  coreIdeas: string[];
  /** Canonical framework ids this persona engages with. */
  relatedFrameworks: string[];
  /** Seed for the assessment-mode scenario. */
  scenarioSeed: string;
  /**
   * True when the persona is (or may be) a living person. Triggers
   * stricter guardrails: no first-person roleplay, no voice imitation,
   * explicit no-endorsement framing.
   */
  isLivingPerson: boolean;
  imageUrl?: string;
  /** Route back to the library entry's profile page. */
  libraryHref: string;
}

// ─── Prompt-economy helpers ──────────────────────────────────────────

/** Trim long prose to ~maxChars, cutting at a sentence boundary. */
export function trimForPrompt(text: string, maxChars = 1400): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= maxChars) return collapsed;
  const slice = collapsed.slice(0, maxChars);
  const lastSentence = slice.lastIndexOf('. ');
  return lastSentence > maxChars * 0.5
    ? slice.slice(0, lastSentence + 1)
    : slice;
}

/**
 * Authors whose era string lacks a closing death year are treated as
 * living (e.g. "1948-present", "1965-"). Erring toward "living" is the
 * safe default: it only tightens guardrails.
 */
export function isLikelyLiving(era: string): boolean {
  return !/\d{3,4}\s*[-–—]\s*\d{3,4}\s*(BCE|CE)?$/i.test(era.trim());
}

// ─── Curated assessment scenarios ────────────────────────────────────

/**
 * Hand-tuned scenario seeds for flagship personas. Everything else gets
 * a generated seed from its category template. Key: `${category}:${id}`.
 */
const CURATED_SCENARIOS: Record<string, string> = {
  'philosopher:plato':
    'Place the student inside a "digital cave": an AI-curated platform decides what an entire city sees, believes, and debates. Most citizens have never seen unfiltered information. The student advises the city. Probe what truth, education, leadership, and moral responsibility require, drawing on the cave, the divided line, and the philosopher-ruler — translated into algorithmic governance.',
  'philosopher:aristotle':
    'A company offers a "virtue companion" app that nudges users toward courage, temperance, and honesty using behavioral data. The student must evaluate whether outsourced habituation can produce genuine virtue, what practical wisdom requires of the designers, and where the mean lies between technophobia and techno-optimism.',
  'philosopher:kant':
    'A hospital deploys an AI triage system that maximizes lives saved but sometimes deprioritizes patients in ways they were never told about. The student must analyze consent, the humanity formula, and universalizability — and decide what the hospital owes each patient as an end in themselves.',
  'philosopher:mill':
    'A city can cut traffic deaths 40% with pervasive surveillance-based enforcement. The student must weigh aggregate welfare against liberty, apply the harm principle to algorithmic enforcement, and confront whether minority burdens can be justified by majority gains.',
  'scifi-author:mary-shelley':
    "A biotech startup is about to release a self-improving synthetic organism it cannot fully predict. Using Frankenstein's themes of creation and abandonment, the student must articulate what creators owe their creations and the public, and where responsibility lies when knowledge outruns care.",
  'framework:utilitarianism':
    'A delivery-drone network can be optimized to save the most total time, but routes concentrate noise and risk over the poorest neighborhoods. The student must run a utilitarian analysis honestly — including its blind spots — and defend or revise the optimization.',
};

// ─── Category templates ──────────────────────────────────────────────

function philosopherScenarioSeed(name: string, ideas: string[]): string {
  return `Construct a concrete, modern technology-ethics scenario (AI, surveillance, platforms, automation, biotech, or social media) that puts the central commitments of ${name} under genuine pressure — especially: ${ideas
    .slice(0, 3)
    .join('; ')}. The student must reason from within and against this perspective.`;
}

function authorScenarioSeed(name: string, themes: string[]): string {
  return `Build a scenario inspired by the recurring themes of ${name}'s work (${themes
    .slice(0, 3)
    .join('; ')}) but set in the near future of the real world. The student must use those themes as an ethical rehearsal space for a concrete technology decision.`;
}

function mediaScenarioSeed(title: string, ethics: string[]): string {
  return `Adapt the central dilemma of ${title} (themes: ${ethics
    .slice(0, 3)
    .join('; ')}) into a present-day technology decision a student could realistically face as a citizen, builder, or policymaker. Do not retell the plot — transfer the dilemma.`;
}

function frameworkScenarioSeed(name: string, keyQuestion: string): string {
  return `Present a technology-ethics scenario where ${name} gives clear guidance AND where its blind spots matter. The student must apply the framework's key question ("${keyQuestion}"), reach a position, and then confront the framework's limits.`;
}

function scenarioFor(category: DialogueCategory, id: string, fallback: string): string {
  return CURATED_SCENARIOS[`${category}:${id}`] ?? fallback;
}

// ─── Builders ────────────────────────────────────────────────────────

function buildPhilosopherPersonas(): DialoguePersona[] {
  return philosopherData.map((p) => ({
    id: p.id,
    category: 'philosopher' as const,
    displayName: p.name,
    shortDescription: `Explore technology ethics through the ideas of ${p.name} (${p.era}).`,
    context: trimForPrompt(p.bio),
    technologyEthicsFocus: `Translate ${p.name}'s central commitments — ${p.keyIdeas
      .slice(0, 3)
      .join('; ')} — into questions about AI, surveillance, platforms, automation, data privacy, biotechnology, and social media.`,
    coreIdeas: p.keyIdeas,
    relatedFrameworks: p.relatedFrameworks,
    scenarioSeed: scenarioFor(
      'philosopher',
      p.id,
      philosopherScenarioSeed(p.name, p.keyIdeas)
    ),
    isLivingPerson: isLikelyLiving(p.era),
    imageUrl: p.imageUrl,
    libraryHref: `/philosophers/${p.id}`,
  }));
}

function buildAuthorPersonas(): DialoguePersona[] {
  return scifiAuthorData.map((a) => ({
    id: a.id,
    category: 'scifi-author' as const,
    displayName: a.name,
    shortDescription:
      a.techEthicsFocus ||
      `Explore technology ethics through the themes of ${a.name}'s science fiction.`,
    context: trimForPrompt(a.bio),
    technologyEthicsFocus:
      a.techEthicsFocus ||
      `Use the recurring themes of ${a.name}'s work (${a.themes
        .slice(0, 3)
        .join('; ')}) as an ethical rehearsal space for real technology decisions.`,
    coreIdeas: a.themes,
    relatedFrameworks: a.relatedFrameworks,
    scenarioSeed: scenarioFor(
      'scifi-author',
      a.id,
      authorScenarioSeed(a.name, a.themes)
    ),
    isLivingPerson: isLikelyLiving(a.era),
    imageUrl: a.imageUrl,
    libraryHref: `/scifi-authors/${a.id}`,
  }));
}

function buildMediaPersonas(): DialoguePersona[] {
  return scifiMediaData.map((m) => ({
    id: m.id,
    category: 'scifi-media' as const,
    displayName: m.title,
    shortDescription: `Step into the moral world of ${m.title} (${m.year}) and test its dilemmas against real technology.`,
    context: trimForPrompt(m.plot),
    technologyEthicsFocus: `Connect the dilemmas of ${m.title} — ${m.ethicsExplored
      .slice(0, 3)
      .join('; ')} — to present-day decisions about real technologies.`,
    coreIdeas: m.ethicsExplored,
    relatedFrameworks: m.relatedFrameworks,
    scenarioSeed: scenarioFor(
      'scifi-media',
      m.id,
      mediaScenarioSeed(m.title, m.ethicsExplored)
    ),
    // A fictional work is never a living person, but its creators may be —
    // media personas always use the interpretive-guide framing anyway.
    isLivingPerson: false,
    imageUrl: m.imageUrl,
    libraryHref: `/scifi-media/${m.id}`,
  }));
}

function buildFrameworkPersonas(): DialoguePersona[] {
  return getActiveEthicalFrameworks().map((f) => ({
    id: f.id,
    category: 'framework' as const,
    displayName: getFrameworkDisplayName(f.id),
    shortDescription: f.shortDescription,
    context: `${f.shortDescription} Key question: ${f.keyQuestion} Strengths: ${f.strengths.join(
      '; '
    )}. Blind spots: ${f.blindSpots.join('; ')}. Example application: ${f.exampleApplication}`,
    technologyEthicsFocus: `Apply ${getFrameworkDisplayName(
      f.id
    )} to modern technology questions, while keeping its blind spots visible: ${f.blindSpots.join(
      '; '
    )}.`,
    coreIdeas: [f.keyQuestion, ...f.strengths],
    relatedFrameworks: [f.id],
    scenarioSeed: scenarioFor(
      'framework',
      f.id,
      frameworkScenarioSeed(getFrameworkDisplayName(f.id), f.keyQuestion)
    ),
    isLivingPerson: false,
    libraryHref: `/glossary/${f.id}`,
  }));
}

// ─── Public API ──────────────────────────────────────────────────────

let cache: DialoguePersona[] | null = null;

export function getAllDialoguePersonas(): DialoguePersona[] {
  if (!cache) {
    cache = [
      ...buildPhilosopherPersonas(),
      ...buildAuthorPersonas(),
      ...buildMediaPersonas(),
      ...buildFrameworkPersonas(),
    ];
  }
  return cache;
}

export function getDialoguePersona(
  category: DialogueCategory,
  id: string
): DialoguePersona | undefined {
  return getAllDialoguePersonas().find(
    (p) => p.category === category && p.id === id
  );
}

export function getPersonasByCategory(
  category: DialogueCategory
): DialoguePersona[] {
  return getAllDialoguePersonas().filter((p) => p.category === category);
}

export function toPublicPersona(p: DialoguePersona): PublicDialoguePersona {
  return {
    id: p.id,
    category: p.category,
    displayName: p.displayName,
    shortDescription: p.shortDescription,
    technologyEthicsFocus: p.technologyEthicsFocus,
    relatedFrameworks: p.relatedFrameworks,
    imageUrl: p.imageUrl,
    libraryHref: p.libraryHref,
  };
}
