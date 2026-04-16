/**
 * import-textbook.ts
 *
 * One-shot content extractor. Reads the source Word document for
 * "The Ethics of Technology Through Science Fiction" and emits:
 *
 *   - src/data/textbook/chapters/{NN-slug}.ts        (one file per chapter)
 *   - src/data/textbook/index.ts                      (aggregated registry)
 *   - src/data/textbook/quizzes.ts                    (12 chapter quizzes + final)
 *   - src/data/textbook/interlinks.ts                 (entity registry)
 *
 * The generated `.ts` files ARE committed to the repo — the script is
 * re-runnable but builds don't depend on it.
 *
 * Usage:
 *   npx tsx src/scripts/import-textbook.ts
 *
 * The source .docx path defaults to the project parent directory. Override
 * with TEXTBOOK_DOCX=/path/to/file.docx.
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mammoth = require('mammoth');

// ─── Paths ──────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_DOCX = path.resolve(
  REPO_ROOT,
  '..',
  'The Ethics of Technology Through Science Fiction.docx'
);
const SOURCE_DOCX = process.env.TEXTBOOK_DOCX || DEFAULT_DOCX;

const CHAPTERS_DIR = path.join(
  REPO_ROOT,
  'src',
  'data',
  'textbook',
  'chapters'
);
const TEXTBOOK_DIR = path.join(REPO_ROOT, 'src', 'data', 'textbook');

// ─── Types (local shadow of src/types/textbook.ts) ──────────────────

type EntityKind = 'philosopher' | 'theory' | 'scifi-author' | 'scifi-media';

interface ParaStyle {
  name: string;
  /** Whether the first run (and thus usually the whole paragraph) is italic. */
  italic: boolean;
}

interface RawParagraph {
  style: ParaStyle;
  text: string;
}

// ─── Chapter slug & per-chapter metadata --------------------------------

/**
 * Canonical chapter slugs in order. Title matching is tolerant to
 * punctuation and case.
 */
const CHAPTER_META: Array<{
  slug: string;
  number: number;
  matcher: RegExp;
  subtitle: string;
  summary: string;
  learningGoals: string[];
  relatedFrameworkIds: string[];
  relatedPhilosopherIds: string[];
  relatedAuthorIds: string[];
  relatedMediaIds: string[];
  shortStoryHeadingMatch: RegExp;
  shortStoryTitle: string;
}> = [
  {
    slug: '01-architecture-of-moral-reasoning',
    number: 1,
    matcher: /Architecture of Moral Reasoning/i,
    subtitle: 'How deontology, consequentialism, and virtue ethics collide in a world of algorithms.',
    summary:
      'An opening tour of the major ethical frameworks — rules, outcomes, character — read through the science fiction stories that have rehearsed them longest.',
    learningGoals: [
      'Locate the three major ethical lenses (deontology, utilitarianism, virtue ethics) inside familiar sci-fi dilemmas.',
      'See how rigid rule systems interact, conflict, and fail under real-world pressure.',
      'Recognize the way metrics, feedback loops, and predictive systems can harden human fallacies into infrastructure.',
    ],
    relatedFrameworkIds: ['utilitarianism', 'deontology', 'virtue-ethics'],
    relatedPhilosopherIds: ['kant', 'mill', 'aristotle', 'singer'],
    relatedAuthorIds: [
      'mary-shelley', 'isaac-asimov', 'philip-k-dick', 'ursula-le-guin', 'william-gibson',
    ],
    relatedMediaIds: [
      'frankenstein-book', 'blade-runner', '2001-a-space-odyssey', 'do-androids-dream',
      'black-mirror', 'gattaca', 'neuromancer-book',
    ],
    shortStoryHeadingMatch: /^The Ledger of Forgetting$/i,
    shortStoryTitle: 'The Ledger of Forgetting',
  },
  {
    slug: '02-ethical-relativism',
    number: 2,
    matcher: /Navigating Ethical Relativism/i,
    subtitle: 'When cultural values collide with globally deployed technology.',
    summary:
      'A deep dive on ethical relativism — what it means, why it is tempting, and where it buckles when technology crosses every border at once.',
    learningGoals: [
      'Distinguish descriptive from normative relativism.',
      'Identify when "local norms" are a considered position vs. a political cover.',
      'Reason about global deployments (platforms, models, autonomous systems) across jurisdictions with different moral commitments.',
    ],
    relatedFrameworkIds: [
      'cosmopolitanism', 'discourse-ethics', 'capabilities-approach', 'ubuntu-ethics',
    ],
    relatedPhilosopherIds: ['appiah', 'nussbaum', 'confucius', 'mencius'],
    relatedAuthorIds: ['ursula-le-guin', 'octavia-butler', 'n-k-jemisin', 'liu-cixin'],
    relatedMediaIds: [
      'left-hand-of-darkness', 'parable-of-the-sower', 'three-body-problem-book', 'the-expanse',
    ],
    shortStoryHeadingMatch: /^The Prime Patch$/i,
    shortStoryTitle: 'The Prime Patch',
  },
  {
    slug: '03-divine-command-and-euthyphro',
    number: 3,
    matcher: /Divine Command Theory/i,
    subtitle: 'What Plato\'s oldest question about morality has to say to modern machines.',
    summary:
      'The Euthyphro dilemma, divine command theory, and what happens when we outsource moral authority to either gods or code.',
    learningGoals: [
      'State the Euthyphro dilemma in precise form and apply it to algorithmic rule systems.',
      'See why "the system said so" inherits the same structural problems as "the gods said so."',
      'Evaluate the conditions under which deferring moral authority to an external oracle is legitimate.',
    ],
    relatedFrameworkIds: ['divine-command', 'natural-law', 'deontology', 'virtue-ethics'],
    relatedPhilosopherIds: ['plato', 'aquinas', 'maimonides', 'spinoza', 'kant'],
    relatedAuthorIds: ['mary-shelley', 'margaret-atwood', 'ted-chiang'],
    relatedMediaIds: ['handmaids-tale-book', 'i-robot-book', 'the-matrix', 'westworld'],
    shortStoryHeadingMatch: /^Proposed, Not Ordained$/i,
    shortStoryTitle: 'Proposed, Not Ordained',
  },
  {
    slug: '04-social-media-and-ethical-egoism',
    number: 4,
    matcher: /Social Media, Manipulation, and Ethical Egoism/i,
    subtitle: 'Feeds that optimize for the self, and what self-interest costs at scale.',
    summary:
      'Ethical egoism as a framework — and as a de facto operating principle of attention platforms. Who benefits, who pays, and how the math hides it.',
    learningGoals: [
      'Distinguish psychological egoism, ethical egoism, and rational self-interest.',
      'Analyze recommendation systems as aggregations of individual-utility optimizers.',
      'Identify the externalities that emerge when every actor "just plays their part."',
    ],
    relatedFrameworkIds: [
      'utilitarianism', 'contractualism', 'discourse-ethics', 'virtue-ethics',
    ],
    relatedPhilosopherIds: ['hobbes', 'hume', 'mill', 'nussbaum'],
    relatedAuthorIds: ['philip-k-dick', 'william-gibson', 'ted-chiang'],
    relatedMediaIds: ['black-mirror', 'the-stanley-parable', 'soma-game', 'severance'],
    shortStoryHeadingMatch: /^Afterglow$/i,
    shortStoryTitle: 'Afterglow',
  },
  {
    slug: '05-utilitarianism-and-warfare',
    number: 5,
    matcher: /Utilitarianism and the Ethics of Warfare/i,
    subtitle: 'Counting lives, measuring outcomes, deploying drones.',
    summary:
      'Classical utilitarianism meets autonomous weapons. The calculus, its temptations, and the places where "the greatest good for the greatest number" breaks.',
    learningGoals: [
      'Apply act and rule utilitarianism to concrete deployment decisions.',
      'Identify who the "greatest number" includes — and whom the math quietly excludes.',
      'Evaluate the moral implications of automating lethality at scale.',
    ],
    relatedFrameworkIds: ['utilitarianism', 'deontology', 'virtue-ethics'],
    relatedPhilosopherIds: ['mill', 'singer', 'kant', 'rawls'],
    relatedAuthorIds: ['isaac-asimov', 'liu-cixin', 'octavia-butler', 'philip-k-dick'],
    relatedMediaIds: [
      'three-body-problem-book', 'i-robot-book', 'the-expanse', 'soma-game',
    ],
    shortStoryHeadingMatch: /^The Greater Good Bureau$/i,
    shortStoryTitle: 'The Greater Good Bureau',
  },
  {
    slug: '06-animals-and-technology',
    number: 6,
    matcher: /Technology Use on Non-Human Animals/i,
    subtitle: 'Moral status beyond the human, and what we owe the minds we farm, track, and engineer.',
    summary:
      'A reckoning with technology deployed on animals — factory farming, gene editing, brain interfaces — and what the circle of moral concern looks like once you draw it honestly.',
    learningGoals: [
      'Articulate the strongest arguments for extending moral consideration to non-human animals.',
      'Evaluate technological interventions (gene editing, neural interfaces, surveillance) through a non-anthropocentric lens.',
      'Assess when "humane" engineering is real progress vs. moral laundering.',
    ],
    relatedFrameworkIds: ['utilitarianism', 'capabilities-approach', 'environmental-ethics', 'ethics-of-care'],
    relatedPhilosopherIds: ['singer', 'nussbaum', 'aristotle'],
    relatedAuthorIds: ['margaret-atwood', 'octavia-butler', 'philip-k-dick'],
    relatedMediaIds: [
      'do-androids-dream', 'parable-of-the-sower', 'handmaids-tale-book', 'the-expanse',
    ],
    shortStoryHeadingMatch: /^The Last Ranch on Mars$/i,
    shortStoryTitle: 'The Last Ranch on Mars',
  },
  {
    slug: '07-kantianism-utopias-dystopias',
    number: 7,
    matcher: /Kantianism, Utopias, and Dystopias/i,
    subtitle: 'Treating people as ends — when design does it, and when it quietly refuses.',
    summary:
      'Kant\'s categorical imperative read through science fiction\'s utopias and dystopias: what a world that took persons-as-ends seriously would actually look like.',
    learningGoals: [
      'Apply the categorical imperative to product, policy, and platform design decisions.',
      'Distinguish genuine respect for persons from its bureaucratic simulation.',
      'Read utopias and dystopias as arguments about what technology protects or corrodes.',
    ],
    relatedFrameworkIds: ['deontology', 'contractualism', 'virtue-ethics', 'utilitarianism'],
    relatedPhilosopherIds: ['kant', 'rawls', 'beauvoir', 'arendt', 'wollstonecraft'],
    relatedAuthorIds: [
      'ursula-le-guin', 'margaret-atwood', 'octavia-butler', 'n-k-jemisin',
    ],
    relatedMediaIds: [
      'handmaids-tale-book', 'left-hand-of-darkness', 'parable-of-the-sower', 'black-mirror',
      'the-matrix',
    ],
    shortStoryHeadingMatch: /^The Red Apartment$/i,
    shortStoryTitle: 'The Red Apartment',
  },
  {
    slug: '08-virtue-ethics-and-technology',
    number: 8,
    matcher: /Aristotelian Virtue Theory/i,
    subtitle: 'What character looks like when your tools shape your habits.',
    summary:
      'Virtue ethics — courage, practical wisdom, temperance — applied to a life mediated by technology. What a good user, a good engineer, and a good institution look like.',
    learningGoals: [
      'Articulate core Aristotelian concepts (eudaimonia, phronesis, the mean) in modern terms.',
      'Evaluate how digital tools cultivate or corrode specific virtues.',
      'Design environments that make virtuous default behaviors easier than vicious ones.',
    ],
    relatedFrameworkIds: ['virtue-ethics', 'ethics-of-care', 'stoicism', 'daoist-ethics'],
    relatedPhilosopherIds: [
      'aristotle', 'confucius', 'nussbaum', 'murdoch', 'laozi',
    ],
    relatedAuthorIds: ['ursula-le-guin', 'ted-chiang', 'octavia-butler'],
    relatedMediaIds: ['her', 'arrival-film', 'exhalation-book', 'severance'],
    shortStoryHeadingMatch: /^Slow Love$/i,
    shortStoryTitle: 'Slow Love',
  },
  {
    slug: '09-surveillance-privacy-social-contract',
    number: 9,
    matcher: /Surveillance, Privacy, and Social Contract/i,
    subtitle: 'What we give up, to whom, and on what terms.',
    summary:
      'Social contract theory meets pervasive sensing. What consent means when the EULA is fifty pages and the sensor never turns off.',
    learningGoals: [
      'Trace social contract theory from Hobbes through Rawls and into platform terms of service.',
      'Identify the structural asymmetries of consent in surveillance-mediated environments.',
      'Evaluate privacy regimes as negotiated settlements, not absolutes.',
    ],
    relatedFrameworkIds: [
      'social-contract-theory', 'contractualism', 'capabilities-approach', 'deontology',
    ],
    relatedPhilosopherIds: ['hobbes', 'rawls', 'arendt', 'kant'],
    relatedAuthorIds: ['philip-k-dick', 'william-gibson', 'margaret-atwood'],
    relatedMediaIds: [
      'black-mirror', 'devs', 'severance', 'neuromancer-book', 'handmaids-tale-book',
    ],
    shortStoryHeadingMatch: /^Terms and Conditions Apply$/i,
    shortStoryTitle: 'Terms and Conditions Apply',
  },
  {
    slug: '10-bioengineering-enhancement-justice',
    number: 10,
    matcher: /Bioengineering, Human Enhancement/i,
    subtitle: 'What happens to equal moral standing when bodies are upgradable.',
    summary:
      'Enhancement, engineering, and the question of justice: when uplift technologies exist, who gets them, who decides, and what we owe the un-enhanced.',
    learningGoals: [
      'Distinguish therapy from enhancement — and evaluate why the line keeps shifting.',
      'Apply Rawlsian and capabilities-based theories of justice to enhancement access.',
      'Think through intergenerational equity when biology itself becomes a market.',
    ],
    relatedFrameworkIds: [
      'capabilities-approach', 'deontology', 'utilitarianism', 'contractualism',
    ],
    relatedPhilosopherIds: ['rawls', 'nussbaum', 'singer', 'kant'],
    relatedAuthorIds: ['margaret-atwood', 'octavia-butler', 'ted-chiang'],
    relatedMediaIds: ['gattaca', 'exhalation-book', 'parable-of-the-sower', 'black-mirror'],
    shortStoryHeadingMatch: /^The Sleevecard$/i,
    shortStoryTitle: 'The Sleevecard',
  },
  {
    slug: '11-virtual-reality-and-personhood',
    number: 11,
    matcher: /Ethics of Virtual Reality and Personhood/i,
    subtitle: 'What it means to act well inside a world that dissolves on command.',
    summary:
      'Virtual reality — from Nozick\'s experience machine to persistent metaverses — raises old questions about reality, personhood, and moral weight in new immersive forms.',
    learningGoals: [
      'Reason about Nozick\'s experience machine and its modern variants.',
      'Evaluate the moral status of actions taken inside simulations — and of the beings we meet there.',
      'Design immersive systems with explicit stances on identity, consent, and exit.',
    ],
    relatedFrameworkIds: [
      'virtue-ethics', 'existentialist-ethics', 'utilitarianism', 'deontology',
    ],
    relatedPhilosopherIds: ['beauvoir', 'nietzsche', 'nussbaum', 'murdoch'],
    relatedAuthorIds: ['william-gibson', 'philip-k-dick', 'ted-chiang'],
    relatedMediaIds: [
      'the-matrix', 'neuromancer-book', 'her', 'exhalation-book', 'soma-game',
      'the-stanley-parable',
    ],
    shortStoryHeadingMatch: /^The Experience Broker$/i,
    shortStoryTitle: 'The Experience Broker',
  },
  {
    slug: '12-ai-care-ethics',
    number: 12,
    matcher: /Artificial Intelligence, Care Ethics/i,
    subtitle: 'When the machine you ask for help is also the one that sees you most clearly.',
    summary:
      'Care ethics as a lens for AI systems that mediate emotional, medical, and educational life. What caregivers owe, what recipients need, and what code can carry.',
    learningGoals: [
      'Articulate care ethics as a distinct ethical tradition with its own core commitments.',
      'Evaluate AI caregiving systems on attentiveness, responsibility, competence, and responsiveness.',
      'Design AI services whose relationship to the user is honest, bounded, and nourishing.',
    ],
    relatedFrameworkIds: [
      'ethics-of-care', 'virtue-ethics', 'capabilities-approach', 'ubuntu-ethics',
    ],
    relatedPhilosopherIds: [
      'noddings', 'nussbaum', 'murdoch', 'beauvoir',
    ],
    relatedAuthorIds: ['ted-chiang', 'ursula-le-guin', 'octavia-butler'],
    relatedMediaIds: [
      'her', 'humans-tv', 'exhalation-book', 'detroit-become-human', 'ex-machina',
    ],
    shortStoryHeadingMatch: /^Room 414$/i,
    shortStoryTitle: 'Room 414',
  },
];

// ─── Entity registry (built once, reused) ────────────────────────────

/**
 * Phrase -> destination. Match is case-insensitive, word-boundary-aware,
 * longest-first. Populated below from the existing data files' slugs + a
 * hand-curated alias list.
 */
const ENTITY_REGISTRY: Record<string, { kind: EntityKind; slug: string }> = {
  // Philosophers — formal name and common aliases
  'Aristotle': { kind: 'philosopher', slug: 'aristotle' },
  'Confucius': { kind: 'philosopher', slug: 'confucius' },
  'Simone de Beauvoir': { kind: 'philosopher', slug: 'beauvoir' },
  'Beauvoir': { kind: 'philosopher', slug: 'beauvoir' },
  'Thomas Hobbes': { kind: 'philosopher', slug: 'hobbes' },
  'Hobbes': { kind: 'philosopher', slug: 'hobbes' },
  'David Hume': { kind: 'philosopher', slug: 'hume' },
  'Hume': { kind: 'philosopher', slug: 'hume' },
  'Immanuel Kant': { kind: 'philosopher', slug: 'kant' },
  'Kant': { kind: 'philosopher', slug: 'kant' },
  'John Stuart Mill': { kind: 'philosopher', slug: 'mill' },
  'Mill': { kind: 'philosopher', slug: 'mill' },
  'Friedrich Nietzsche': { kind: 'philosopher', slug: 'nietzsche' },
  'Nietzsche': { kind: 'philosopher', slug: 'nietzsche' },
  'Nel Noddings': { kind: 'philosopher', slug: 'noddings' },
  'Noddings': { kind: 'philosopher', slug: 'noddings' },
  'Martha Nussbaum': { kind: 'philosopher', slug: 'nussbaum' },
  'Nussbaum': { kind: 'philosopher', slug: 'nussbaum' },
  'John Rawls': { kind: 'philosopher', slug: 'rawls' },
  'Rawls': { kind: 'philosopher', slug: 'rawls' },
  'Peter Singer': { kind: 'philosopher', slug: 'singer' },
  'Plato': { kind: 'philosopher', slug: 'plato' },
  'Mencius': { kind: 'philosopher', slug: 'mencius' },
  'Laozi': { kind: 'philosopher', slug: 'laozi' },
  'Lao Tzu': { kind: 'philosopher', slug: 'laozi' },
  'Maimonides': { kind: 'philosopher', slug: 'maimonides' },
  'Thomas Aquinas': { kind: 'philosopher', slug: 'aquinas' },
  'Aquinas': { kind: 'philosopher', slug: 'aquinas' },
  'Baruch Spinoza': { kind: 'philosopher', slug: 'spinoza' },
  'Spinoza': { kind: 'philosopher', slug: 'spinoza' },
  'Mary Wollstonecraft': { kind: 'philosopher', slug: 'wollstonecraft' },
  'Wollstonecraft': { kind: 'philosopher', slug: 'wollstonecraft' },
  'Hannah Arendt': { kind: 'philosopher', slug: 'arendt' },
  'Arendt': { kind: 'philosopher', slug: 'arendt' },
  'Iris Murdoch': { kind: 'philosopher', slug: 'murdoch' },
  'Murdoch': { kind: 'philosopher', slug: 'murdoch' },
  'Kwame Anthony Appiah': { kind: 'philosopher', slug: 'appiah' },
  'Appiah': { kind: 'philosopher', slug: 'appiah' },

  // Sci-fi authors
  'Mary Shelley': { kind: 'scifi-author', slug: 'mary-shelley' },
  'Shelley': { kind: 'scifi-author', slug: 'mary-shelley' },
  'Isaac Asimov': { kind: 'scifi-author', slug: 'isaac-asimov' },
  'Asimov': { kind: 'scifi-author', slug: 'isaac-asimov' },
  'Philip K. Dick': { kind: 'scifi-author', slug: 'philip-k-dick' },
  'Philip K Dick': { kind: 'scifi-author', slug: 'philip-k-dick' },
  'Dick': { kind: 'scifi-author', slug: 'philip-k-dick' },
  'Ursula K. Le Guin': { kind: 'scifi-author', slug: 'ursula-le-guin' },
  'Ursula Le Guin': { kind: 'scifi-author', slug: 'ursula-le-guin' },
  'Le Guin': { kind: 'scifi-author', slug: 'ursula-le-guin' },
  'Octavia Butler': { kind: 'scifi-author', slug: 'octavia-butler' },
  'Butler': { kind: 'scifi-author', slug: 'octavia-butler' },
  'William Gibson': { kind: 'scifi-author', slug: 'william-gibson' },
  'Gibson': { kind: 'scifi-author', slug: 'william-gibson' },
  'Ted Chiang': { kind: 'scifi-author', slug: 'ted-chiang' },
  'Chiang': { kind: 'scifi-author', slug: 'ted-chiang' },
  'N. K. Jemisin': { kind: 'scifi-author', slug: 'n-k-jemisin' },
  'N.K. Jemisin': { kind: 'scifi-author', slug: 'n-k-jemisin' },
  'Jemisin': { kind: 'scifi-author', slug: 'n-k-jemisin' },
  'Liu Cixin': { kind: 'scifi-author', slug: 'liu-cixin' },
  'Cixin Liu': { kind: 'scifi-author', slug: 'liu-cixin' },
  'Margaret Atwood': { kind: 'scifi-author', slug: 'margaret-atwood' },
  'Atwood': { kind: 'scifi-author', slug: 'margaret-atwood' },

  // Sci-fi works
  'Blade Runner': { kind: 'scifi-media', slug: 'blade-runner' },
  'Ex Machina': { kind: 'scifi-media', slug: 'ex-machina' },
  '2001: A Space Odyssey': { kind: 'scifi-media', slug: '2001-a-space-odyssey' },
  'The Matrix': { kind: 'scifi-media', slug: 'the-matrix' },
  'Gattaca': { kind: 'scifi-media', slug: 'gattaca' },
  'Arrival': { kind: 'scifi-media', slug: 'arrival-film' },
  'Her': { kind: 'scifi-media', slug: 'her' },
  'Frankenstein': { kind: 'scifi-media', slug: 'frankenstein-book' },
  'I, Robot': { kind: 'scifi-media', slug: 'i-robot-book' },
  'Do Androids Dream of Electric Sheep': { kind: 'scifi-media', slug: 'do-androids-dream' },
  'Do Androids Dream of Electric Sheep?': { kind: 'scifi-media', slug: 'do-androids-dream' },
  'The Left Hand of Darkness': { kind: 'scifi-media', slug: 'left-hand-of-darkness' },
  'Left Hand of Darkness': { kind: 'scifi-media', slug: 'left-hand-of-darkness' },
  'Parable of the Sower': { kind: 'scifi-media', slug: 'parable-of-the-sower' },
  'Neuromancer': { kind: 'scifi-media', slug: 'neuromancer-book' },
  'The Three-Body Problem': { kind: 'scifi-media', slug: 'three-body-problem-book' },
  'Three-Body Problem': { kind: 'scifi-media', slug: 'three-body-problem-book' },
  'Exhalation': { kind: 'scifi-media', slug: 'exhalation-book' },
  "The Handmaid's Tale": { kind: 'scifi-media', slug: 'handmaids-tale-book' },
  'Handmaids Tale': { kind: 'scifi-media', slug: 'handmaids-tale-book' },
  'Black Mirror': { kind: 'scifi-media', slug: 'black-mirror' },
  'Westworld': { kind: 'scifi-media', slug: 'westworld' },
  'The Expanse': { kind: 'scifi-media', slug: 'the-expanse' },
  'Severance': { kind: 'scifi-media', slug: 'severance' },
  'Humans': { kind: 'scifi-media', slug: 'humans-tv' },
  'Devs': { kind: 'scifi-media', slug: 'devs' },
  'Detroit: Become Human': { kind: 'scifi-media', slug: 'detroit-become-human' },
  'SOMA': { kind: 'scifi-media', slug: 'soma-game' },
  'The Stanley Parable': { kind: 'scifi-media', slug: 'the-stanley-parable' },
  'Portal': { kind: 'scifi-media', slug: 'portal-game' },

  // Ethical theories
  'utilitarianism': { kind: 'theory', slug: 'utilitarianism' },
  'Utilitarianism': { kind: 'theory', slug: 'utilitarianism' },
  'deontology': { kind: 'theory', slug: 'deontology' },
  'Deontology': { kind: 'theory', slug: 'deontology' },
  'virtue ethics': { kind: 'theory', slug: 'virtue-ethics' },
  'Virtue ethics': { kind: 'theory', slug: 'virtue-ethics' },
  'Virtue Ethics': { kind: 'theory', slug: 'virtue-ethics' },
  'social contract theory': { kind: 'theory', slug: 'social-contract-theory' },
  'Social Contract Theory': { kind: 'theory', slug: 'social-contract-theory' },
  'ethics of care': { kind: 'theory', slug: 'ethics-of-care' },
  'Ethics of Care': { kind: 'theory', slug: 'ethics-of-care' },
  'care ethics': { kind: 'theory', slug: 'ethics-of-care' },
  'contractualism': { kind: 'theory', slug: 'contractualism' },
  'capabilities approach': { kind: 'theory', slug: 'capabilities-approach' },
  'Capabilities Approach': { kind: 'theory', slug: 'capabilities-approach' },
  'ubuntu ethics': { kind: 'theory', slug: 'ubuntu-ethics' },
  'Ubuntu': { kind: 'theory', slug: 'ubuntu-ethics' },
  'natural law': { kind: 'theory', slug: 'natural-law' },
  'Natural Law': { kind: 'theory', slug: 'natural-law' },
  'stoicism': { kind: 'theory', slug: 'stoicism' },
  'Stoicism': { kind: 'theory', slug: 'stoicism' },
  'divine command theory': { kind: 'theory', slug: 'divine-command' },
  'Divine Command Theory': { kind: 'theory', slug: 'divine-command' },
  'existentialist ethics': { kind: 'theory', slug: 'existentialist-ethics' },
  'discourse ethics': { kind: 'theory', slug: 'discourse-ethics' },
  'Buddhist ethics': { kind: 'theory', slug: 'buddhist-ethics' },
  'Daoist ethics': { kind: 'theory', slug: 'daoist-ethics' },
  'pragmatist ethics': { kind: 'theory', slug: 'pragmatist-ethics' },
  'environmental ethics': { kind: 'theory', slug: 'environmental-ethics' },
  'Environmental Ethics': { kind: 'theory', slug: 'environmental-ethics' },
  'cosmopolitanism': { kind: 'theory', slug: 'cosmopolitanism' },
  'Cosmopolitanism': { kind: 'theory', slug: 'cosmopolitanism' },
};

// ─── Helpers ──────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

function tsString(value: string): string {
  return '`' + esc(value) + '`';
}

function stringArray(values: string[]): string {
  if (values.length === 0) return '[]';
  return '[' + values.map((v) => tsString(v)).join(', ') + ']';
}

function slugIdSegment(chapterSlug: string, hint: string): string {
  return `${chapterSlug}-${hint}`;
}

/** Classify a paragraph inside a Knowledge Check as question stem vs. option. */
function isOptionLine(text: string): boolean {
  return /^[A-D]\)\s/.test(text.trim());
}
function isTrueFalseLine(text: string): boolean {
  return /^\s*True\s*\/\s*False\s*$/i.test(text.trim());
}

function stripDocxQuotes(text: string): string {
  return text.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");
}

/**
 * Detect a pull quote inside a body paragraph. The source formats them as
 * italic runs beginning with a quote character, typically with author
 * attribution immediately appended with no space. e.g.:
 *   "A robot may not injure…"Isaac Asimov, "Runaround" (1942)
 */
function matchPullQuote(raw: string): { text: string; attribution?: string } | null {
  const text = stripDocxQuotes(raw.trim());
  // Match opening quote, content, closing quote, optional attribution
  const m = text.match(/^"([^"]{10,})"\s*(.*)$/);
  if (!m) return null;
  const quote = m[1].trim();
  const rest = m[2].trim();
  return rest ? { text: quote, attribution: rest } : { text: quote };
}

/**
 * Find every entity that appears in `text` and emit EntityRef records for
 * the FIRST occurrence of each unique slug. Longer phrase keys are matched
 * first to prefer "Mary Shelley" over the standalone "Shelley".
 */
function extractEntityRefs(
  text: string
): Array<{ name: string; kind: EntityKind; slug: string }> {
  const keys = Object.keys(ENTITY_REGISTRY).sort((a, b) => b.length - a.length);
  const found = new Map<string, { name: string; kind: EntityKind; slug: string }>();
  let working = text;
  for (const key of keys) {
    if (found.has(ENTITY_REGISTRY[key].slug)) continue;
    const pattern = new RegExp(
      `(?:^|[^A-Za-z0-9])(${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=$|[^A-Za-z0-9])`
    );
    const m = working.match(pattern);
    if (m) {
      const slug = ENTITY_REGISTRY[key].slug;
      if (!found.has(slug)) {
        found.set(slug, {
          name: m[1],
          kind: ENTITY_REGISTRY[key].kind,
          slug,
        });
      }
    }
  }
  return Array.from(found.values());
}

// ─── Reading the docx ──────────────────────────────────────────────────

async function readParagraphs(docxPath: string): Promise<RawParagraph[]> {
  const { value: html } = await mammoth.convertToHtml({ path: docxPath });
  // We parse by regex on the HTML — mammoth produces a very predictable tree:
  // <h1>Heading</h1>, <h2>Heading</h2>, <p><em>...</em></p>, <p>body</p>.
  // That's plenty for our needs; we don't need a real DOM.
  const paragraphs: RawParagraph[] = [];
  const tagRe = /<(h1|h2|h3|p)[^>]*>([\s\S]*?)<\/\1>/g;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(html))) {
    const tag = match[1];
    const inner = match[2];
    const italic = /^<em>[\s\S]*<\/em>$/.test(inner.trim());
    const text = inner
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();
    if (!text) continue;
    const styleName =
      tag === 'h1' ? 'Heading 1' : tag === 'h2' ? 'Heading 2' : tag === 'h3' ? 'Heading 3' : '';
    paragraphs.push({ style: { name: styleName, italic }, text });
  }
  return paragraphs;
}

// ─── Chapter slicing ──────────────────────────────────────────────────

interface ChapterSlice {
  number: number;
  slug: string;
  title: string;
  /** Paragraphs between this chapter's Heading 1 and the next Heading 1. */
  paragraphs: RawParagraph[];
}

function sliceChapters(all: RawParagraph[]): ChapterSlice[] {
  const h1Indices: number[] = [];
  all.forEach((p, i) => {
    if (p.style.name === 'Heading 1') h1Indices.push(i);
  });

  const slices: ChapterSlice[] = [];
  h1Indices.forEach((start, idx) => {
    const end = h1Indices[idx + 1] ?? all.length;
    const title = all[start].text.trim();
    const meta = CHAPTER_META.find((m) => m.matcher.test(title));
    if (!meta) return; // Skip unknown H1s (e.g. appendices)
    slices.push({
      number: meta.number,
      slug: meta.slug,
      title,
      paragraphs: all.slice(start + 1, end),
    });
  });

  slices.sort((a, b) => a.number - b.number);
  return slices;
}

// ─── Sub-slicing: each chapter into its 9 Heading-2 sections ──────────

interface SectionSlice {
  heading: string;
  paragraphs: RawParagraph[];
}

/**
 * Split a chapter's paragraphs into its intro (before the first Heading 2)
 * and a map of Heading-2 blocks afterwards.
 */
function splitChapterIntoSections(paragraphs: RawParagraph[]): {
  intro: RawParagraph[];
  sections: SectionSlice[];
} {
  const firstH2 = paragraphs.findIndex((p) => p.style.name === 'Heading 2');
  const intro = firstH2 === -1 ? paragraphs : paragraphs.slice(0, firstH2);
  const sections: SectionSlice[] = [];
  if (firstH2 >= 0) {
    const h2Indices: number[] = [];
    paragraphs.forEach((p, i) => {
      if (p.style.name === 'Heading 2') h2Indices.push(i);
    });
    h2Indices.forEach((start, idx) => {
      const end = h2Indices[idx + 1] ?? paragraphs.length;
      sections.push({
        heading: paragraphs[start].text.trim(),
        paragraphs: paragraphs.slice(start + 1, end),
      });
    });
  }
  return { intro, sections };
}

// ─── Intro & prose block conversion ────────────────────────────────────

interface ContentBlockShape {
  type: 'paragraph' | 'list' | 'heading' | 'quote';
  text?: string;
  level?: 3 | 4;
  ordered?: boolean;
  items?: string[];
  attribution?: string;
}

function paragraphsToBlocks(
  paragraphs: RawParagraph[],
  options: { allowPullQuotes?: boolean } = {}
): { blocks: ContentBlockShape[]; refs: Array<{ name: string; kind: EntityKind; slug: string }> } {
  const allowPullQuotes = options.allowPullQuotes !== false;
  const blocks: ContentBlockShape[] = [];
  const seenSlugs = new Set<string>();
  const refs: Array<{ name: string; kind: EntityKind; slug: string }> = [];
  for (const p of paragraphs) {
    const text = stripDocxQuotes(p.text.trim());
    if (!text) continue;
    // Pull-quote detection is for essays / cited material — not for the
    // chapter's original short stories, where dialogue tags begin with
    // quotation marks but should render as ordinary prose.
    if (allowPullQuotes) {
      if (p.style.italic) {
        const q = matchPullQuote(text);
        if (q) {
          blocks.push({ type: 'quote', text: q.text, attribution: q.attribution });
          continue;
        }
      }
      // Fallback: unrecognized italic paragraph still becomes a pull quote if
      // it starts with a quote mark.
      if (text.startsWith('"') && text.length < 500) {
        const q = matchPullQuote(text);
        if (q) {
          blocks.push({ type: 'quote', text: q.text, attribution: q.attribution });
          continue;
        }
      }
    }
    blocks.push({ type: 'paragraph', text });
    // Collect entity refs per unique slug (first occurrence wins)
    for (const r of extractEntityRefs(text)) {
      if (seenSlugs.has(r.slug)) continue;
      seenSlugs.add(r.slug);
      refs.push(r);
    }
  }
  return { blocks, refs };
}

// ─── Section-specific parsers ──────────────────────────────────────────

function parsePrimerCache(
  paragraphs: RawParagraph[]
): {
  heading: string;
  blocks: ContentBlockShape[];
  primerEntries: Array<{ name: string; kind: EntityKind; slug: string }>;
} {
  const entries: Array<{ name: string; kind: EntityKind; slug: string }> = [];
  const seen = new Set<string>();
  const blocks: ContentBlockShape[] = [];
  for (const p of paragraphs) {
    const text = stripDocxQuotes(p.text.trim());
    if (!text) continue;
    blocks.push({ type: 'paragraph', text });
    // Heuristic: primer entry takes form "<Title/Author Stuff>: <description>"
    // — grab candidate tokens before the colon, match against registry
    const preColon = text.split(':')[0];
    const candidates: string[] = [];
    // Author+work pattern: "Author, Title" → try the whole pre-colon, then author, then title
    candidates.push(preColon);
    if (preColon.includes(',')) {
      const [a, ...rest] = preColon.split(',');
      candidates.push(a.trim());
      candidates.push(rest.join(',').trim());
      // Strip parenthetical year from title candidate
      candidates.push(rest.join(',').replace(/\([^)]*\)/g, '').trim());
    }
    // Plain single: strip parenthetical year
    candidates.push(preColon.replace(/\([^)]*\)/g, '').trim());
    for (const c of candidates) {
      for (const key of Object.keys(ENTITY_REGISTRY)) {
        if (c.toLowerCase() === key.toLowerCase()) {
          const entry = ENTITY_REGISTRY[key];
          if (!seen.has(entry.slug)) {
            seen.add(entry.slug);
            entries.push({ name: key, kind: entry.kind, slug: entry.slug });
          }
        }
      }
    }
  }
  return { heading: 'Primer Cache', blocks, primerEntries: entries };
}

interface QuizSpec {
  questions: Array<{
    prompt: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty: 'recall' | 'conceptual' | 'applied';
  }>;
}

/**
 * Parse the Knowledge Check paragraphs. Each question is a stem paragraph
 * followed by 4 A)..D) option paragraphs OR a stem followed by a single
 * "True / False" paragraph.
 */
function parseKnowledgeCheck(paragraphs: RawParagraph[]): QuizSpec {
  const qs: QuizSpec['questions'] = [];
  let i = 0;
  while (i < paragraphs.length) {
    const stem = paragraphs[i].text.trim();
    if (!stem) { i++; continue; }
    // Look ahead for options
    const j = i + 1;
    // Multiple-choice: next 4 lines are A) B) C) D)
    if (
      j + 3 < paragraphs.length &&
      isOptionLine(paragraphs[j].text) &&
      isOptionLine(paragraphs[j + 1].text) &&
      isOptionLine(paragraphs[j + 2].text) &&
      isOptionLine(paragraphs[j + 3].text)
    ) {
      const options = [
        paragraphs[j].text.replace(/^[A-D]\)\s*/, '').trim(),
        paragraphs[j + 1].text.replace(/^[A-D]\)\s*/, '').trim(),
        paragraphs[j + 2].text.replace(/^[A-D]\)\s*/, '').trim(),
        paragraphs[j + 3].text.replace(/^[A-D]\)\s*/, '').trim(),
      ];
      qs.push({
        prompt: stripDocxQuotes(stem),
        options,
        correctAnswerIndex: 0, // placeholder — filled in by answer key pass
        explanation: '',
        difficulty: 'conceptual',
      });
      i = j + 4;
      continue;
    }
    // True/False
    if (j < paragraphs.length && isTrueFalseLine(paragraphs[j].text)) {
      qs.push({
        prompt: stripDocxQuotes(stem),
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        explanation: '',
        difficulty: 'recall',
      });
      i = j + 1;
      continue;
    }
    // If we can't classify, skip
    i++;
  }
  return { questions: qs };
}

/**
 * Apply the Answer Key (a list of one-letter or True/False paragraphs) to a
 * parsed quiz spec. Letters A/B/C/D -> 0..3; True -> 0; False -> 1.
 */
function applyAnswerKey(spec: QuizSpec, answerParagraphs: RawParagraph[]): void {
  const answers = answerParagraphs
    .map((p) => p.text.trim())
    .filter(Boolean);
  for (let k = 0; k < Math.min(spec.questions.length, answers.length); k++) {
    const a = answers[k].trim();
    if (/^[A-D]$/i.test(a)) {
      spec.questions[k].correctAnswerIndex = 'ABCD'.indexOf(a.toUpperCase());
    } else if (/^true$/i.test(a)) {
      spec.questions[k].correctAnswerIndex = 0;
    } else if (/^false$/i.test(a)) {
      spec.questions[k].correctAnswerIndex = 1;
    }
    // Tone explanation based on question
    spec.questions[k].explanation =
      `See the chapter discussion for the reasoning behind this answer.`;
  }
}

/**
 * Parse the Promise vs Reality section. Items are groups of 5 lines:
 *   <Tech name>
 *   Promise (stated/implicit): …
 *   Reality observed in story: …
 *   Fulfillment (0–5): N
 *   Gap to close (one-line fix): …
 */
function parsePromiseVsReality(
  paragraphs: RawParagraph[]
): Array<{ id: string; label: string; description: string }> {
  const items: Array<{ id: string; label: string; description: string }> = [];
  let i = 0;
  let idx = 0;
  while (i < paragraphs.length) {
    const label = paragraphs[i].text.trim();
    if (!label) { i++; continue; }
    if (
      i + 4 < paragraphs.length &&
      /^Promise/i.test(paragraphs[i + 1].text) &&
      /^Reality/i.test(paragraphs[i + 2].text) &&
      /^Fulfillment/i.test(paragraphs[i + 3].text) &&
      /^Gap to close/i.test(paragraphs[i + 4].text)
    ) {
      idx++;
      const promise = paragraphs[i + 1].text.replace(/^Promise[^:]*:\s*/i, '').trim();
      const reality = paragraphs[i + 2].text.replace(/^Reality[^:]*:\s*/i, '').trim();
      items.push({
        id: `pvr-${idx}`,
        label,
        description: `Promise: ${promise} — Reality: ${reality}`,
      });
      i += 5;
    } else {
      i++;
    }
  }
  return items;
}

function parseNumberedList(paragraphs: RawParagraph[]): string[] {
  return paragraphs
    .map((p) => stripDocxQuotes(p.text.trim()))
    .filter(Boolean);
}

// ─── Main chapter assembly ────────────────────────────────────────────

interface AssembledChapter {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  learningGoals: string[];
  shortStoryTitle: string;
  heroImage: string;
  heroImageAlt: string;
  relatedFrameworkIds: string[];
  relatedPhilosopherIds: string[];
  relatedAuthorIds: string[];
  relatedMediaIds: string[];
  wordCount: number;
  estimatedReadingMinutes: number;
  sections: Array<{
    id: string;
    kind: string;
    heading?: string;
    blocks: ContentBlockShape[];
    entityRefs?: Array<{ name: string; kind: EntityKind; slug: string }>;
    prompts?: Array<{ id: string; prompt: string }>;
    scoringItems?: Array<{ id: string; label: string; description?: string }>;
    primerEntries?: Array<{ name: string; kind: EntityKind; slug: string }>;
  }>;
  knowledgeCheck: QuizSpec;
}

function assembleChapter(slice: ChapterSlice): AssembledChapter {
  const meta = CHAPTER_META.find((m) => m.slug === slice.slug)!;
  const { intro, sections: rawSections } = splitChapterIntoSections(slice.paragraphs);

  const assembledSections: AssembledChapter['sections'] = [];

  // 1. Intro section — body essay
  const introBlocks = paragraphsToBlocks(intro);
  assembledSections.push({
    id: slugIdSegment(slice.slug, 'intro'),
    kind: 'intro',
    heading: undefined,
    blocks: introBlocks.blocks,
    entityRefs: introBlocks.refs,
  });

  // Prepare helpers to find each Heading 2 block
  function findSection(matcher: RegExp): SectionSlice | undefined {
    return rawSections.find((s) => matcher.test(s.heading));
  }

  // 2. Primer Cache
  const primer = findSection(/^Primer Cache/i);
  if (primer) {
    const { blocks, primerEntries } = parsePrimerCache(primer.paragraphs);
    assembledSections.push({
      id: slugIdSegment(slice.slug, 'primer'),
      kind: 'primer-cache',
      heading: 'Primer Cache: Works Introduced in This Chapter',
      blocks,
      primerEntries,
    });
  }

  // 3. Knowledge Check (parsed but stored in the quiz bundle, not the chapter)
  const kc = findSection(/^Knowledge Check/i);
  const ak = findSection(/^Answer Key/i);
  const quiz: QuizSpec = kc ? parseKnowledgeCheck(kc.paragraphs) : { questions: [] };
  if (ak) applyAnswerKey(quiz, ak.paragraphs);

  // 4. Short Story (dialogue stays as prose — no pull-quote extraction)
  const story = findSection(meta.shortStoryHeadingMatch);
  if (story) {
    const storyBlocks = paragraphsToBlocks(story.paragraphs, { allowPullQuotes: false });
    assembledSections.push({
      id: slugIdSegment(slice.slug, 'story'),
      kind: 'short-story',
      heading: meta.shortStoryTitle,
      blocks: storyBlocks.blocks,
      entityRefs: storyBlocks.refs,
    });
  }

  // 5. After-Story Discussion
  const discussion = findSection(/^After-Story Discussion/i);
  if (discussion) {
    const { blocks, refs } = paragraphsToBlocks(discussion.paragraphs);
    assembledSections.push({
      id: slugIdSegment(slice.slug, 'after-story'),
      kind: 'discussion',
      heading: 'After-Story Discussion',
      blocks,
      entityRefs: refs,
    });
  }

  // 6. Counterfactual Lab
  const cf = findSection(/^Counterfactual Lab/i);
  if (cf) {
    const { blocks, refs } = paragraphsToBlocks(cf.paragraphs);
    assembledSections.push({
      id: slugIdSegment(slice.slug, 'counterfactual'),
      kind: 'counterfactual',
      heading: 'Counterfactual Lab',
      blocks,
      entityRefs: refs,
    });
  }

  // 7. Practical Takeaways
  const tk = findSection(/^Practical Takeaways/i);
  if (tk) {
    const { blocks, refs } = paragraphsToBlocks(tk.paragraphs);
    assembledSections.push({
      id: slugIdSegment(slice.slug, 'takeaways'),
      kind: 'takeaways',
      heading: 'Practical Takeaways for Builders and Policymakers',
      blocks,
      entityRefs: refs,
    });
  }

  // 8. Discussion Questions
  const dq = findSection(/^Discussion Questions/i);
  if (dq) {
    const prompts = parseNumberedList(dq.paragraphs).map((p, i) => ({
      id: slugIdSegment(slice.slug, `dq-${i + 1}`),
      prompt: p,
    }));
    assembledSections.push({
      id: slugIdSegment(slice.slug, 'discussion-questions'),
      kind: 'discussion-questions',
      heading: 'Discussion Questions',
      blocks: [],
      prompts,
    });
  }

  // 9. Promise vs. Reality
  const pvr = findSection(/^Promise vs\. Reality/i);
  if (pvr) {
    const items = parsePromiseVsReality(pvr.paragraphs);
    assembledSections.push({
      id: slugIdSegment(slice.slug, 'promise-reality'),
      kind: 'promise-vs-reality',
      heading: 'Promise vs. Reality',
      blocks: [],
      scoringItems: items,
    });
  }

  // Word count approximation
  const allText = slice.paragraphs.map((p) => p.text).join(' ');
  const wordCount = (allText.match(/\S+/g) || []).length;
  // Reading speed: 230 wpm prose, but add some padding for the story pacing
  const estimatedReadingMinutes = Math.max(12, Math.round(wordCount / 220));

  return {
    slug: slice.slug,
    number: slice.number,
    title: slice.title,
    subtitle: meta.subtitle,
    summary: meta.summary,
    learningGoals: meta.learningGoals,
    shortStoryTitle: meta.shortStoryTitle,
    heroImage: `/textbook/chapter-${String(slice.number).padStart(2, '0')}.svg`,
    heroImageAlt: `Illustration for ${slice.title}`,
    relatedFrameworkIds: meta.relatedFrameworkIds,
    relatedPhilosopherIds: meta.relatedPhilosopherIds,
    relatedAuthorIds: meta.relatedAuthorIds,
    relatedMediaIds: meta.relatedMediaIds,
    wordCount,
    estimatedReadingMinutes,
    sections: assembledSections,
    knowledgeCheck: quiz,
  };
}

// ─── TypeScript emitters ──────────────────────────────────────────────

function emitBlock(b: ContentBlockShape): string {
  switch (b.type) {
    case 'paragraph':
      return `{ type: 'paragraph', text: ${tsString(b.text || '')} }`;
    case 'quote':
      return b.attribution
        ? `{ type: 'quote', text: ${tsString(b.text || '')}, attribution: ${tsString(b.attribution)} }`
        : `{ type: 'quote', text: ${tsString(b.text || '')} }`;
    case 'heading':
      return `{ type: 'heading', level: ${b.level || 3}, text: ${tsString(b.text || '')} }`;
    case 'list':
      return `{ type: 'list', ordered: ${b.ordered ? 'true' : 'false'}, items: [${(b.items || []).map(tsString).join(', ')}] }`;
  }
}

function emitEntityRef(ref: { name: string; kind: EntityKind; slug: string }): string {
  return `{ name: ${tsString(ref.name)}, kind: '${ref.kind}', slug: '${ref.slug}' }`;
}

function emitSection(section: AssembledChapter['sections'][number]): string {
  const parts: string[] = [
    `id: '${section.id}'`,
    `kind: '${section.kind}'`,
  ];
  if (section.heading) parts.push(`heading: ${tsString(section.heading)}`);
  parts.push(`blocks: [\n    ${section.blocks.map(emitBlock).join(',\n    ')}\n  ]`);
  if (section.entityRefs && section.entityRefs.length > 0) {
    parts.push(
      `entityRefs: [\n    ${section.entityRefs.map(emitEntityRef).join(',\n    ')}\n  ]`
    );
  }
  if (section.primerEntries && section.primerEntries.length > 0) {
    parts.push(
      `primerEntries: [\n    ${section.primerEntries.map(emitEntityRef).join(',\n    ')}\n  ]`
    );
  }
  if (section.prompts && section.prompts.length > 0) {
    parts.push(
      `prompts: [\n    ${section.prompts
        .map((p) => `{ id: '${p.id}', prompt: ${tsString(p.prompt)} }`)
        .join(',\n    ')}\n  ]`
    );
  }
  if (section.scoringItems && section.scoringItems.length > 0) {
    parts.push(
      `scoringItems: [\n    ${section.scoringItems
        .map(
          (it) =>
            `{ id: '${it.id}', label: ${tsString(it.label)}${it.description ? `, description: ${tsString(it.description)}` : ''} }`
        )
        .join(',\n    ')}\n  ]`
    );
  }
  return `{\n  ${parts.join(',\n  ')}\n}`;
}

function emitChapterModule(chapter: AssembledChapter): string {
  const header =
    `/* AUTO-GENERATED by src/scripts/import-textbook.ts — do not edit by hand. */\n` +
    `import type { Chapter } from '@/types/textbook';\n\n`;
  const body =
    `export const chapter: Chapter = {\n` +
    `  slug: '${chapter.slug}',\n` +
    `  number: ${chapter.number},\n` +
    `  title: ${tsString(chapter.title)},\n` +
    `  subtitle: ${tsString(chapter.subtitle)},\n` +
    `  summary: ${tsString(chapter.summary)},\n` +
    `  learningGoals: ${stringArray(chapter.learningGoals)},\n` +
    `  shortStoryTitle: ${tsString(chapter.shortStoryTitle)},\n` +
    `  heroImage: '${chapter.heroImage}',\n` +
    `  heroImageAlt: ${tsString(chapter.heroImageAlt)},\n` +
    `  wordCount: ${chapter.wordCount},\n` +
    `  estimatedReadingMinutes: ${chapter.estimatedReadingMinutes},\n` +
    `  relatedFrameworkIds: ${stringArray(chapter.relatedFrameworkIds)},\n` +
    `  relatedPhilosopherIds: ${stringArray(chapter.relatedPhilosopherIds)},\n` +
    `  relatedAuthorIds: ${stringArray(chapter.relatedAuthorIds)},\n` +
    `  relatedMediaIds: ${stringArray(chapter.relatedMediaIds)},\n` +
    `  sections: [\n    ${chapter.sections
      .map((s) => emitSection(s).replace(/\n/g, '\n    '))
      .join(',\n    ')}\n  ],\n` +
    `};\n\nexport default chapter;\n`;
  return header + body;
}

function emitQuizModule(chapters: AssembledChapter[]): string {
  const header =
    `/* AUTO-GENERATED by src/scripts/import-textbook.ts — do not edit by hand. */\n` +
    `import type { Quiz } from '@/types';\n\n`;

  function buildQuiz(ch: AssembledChapter): string {
    const quizId = `book-chapter-${ch.slug}`;
    const questionsCode = ch.knowledgeCheck.questions
      .map(
        (q, i) =>
          `    {\n` +
          `      id: '${quizId}-q${i + 1}',\n` +
          `      prompt: ${tsString(q.prompt)},\n` +
          `      options: [${q.options.map(tsString).join(', ')}],\n` +
          `      correctAnswerIndex: ${q.correctAnswerIndex},\n` +
          `      explanation: ${tsString(q.explanation)},\n` +
          `      difficulty: '${q.difficulty}',\n` +
          `    }`
      )
      .join(',\n');
    return (
      `  {\n` +
      `    id: '${quizId}',\n` +
      `    subjectType: 'book-chapter',\n` +
      `    subjectId: '${ch.slug}',\n` +
      `    subjectName: ${tsString('Chapter ' + ch.number + ': ' + ch.title)},\n` +
      `    title: ${tsString('Chapter ' + ch.number + ' Knowledge Check')},\n` +
      `    description: ${tsString('Check your understanding of Chapter ' + ch.number + ' before earning your completion certificate.')},\n` +
      `    estimatedMinutes: 6,\n` +
      `    passingScorePercent: 70,\n` +
      `    questions: [\n${questionsCode}\n    ],\n` +
      `    createdAt: new Date(0),\n` +
      `  }`
    );
  }

  // Final exam: two sampled questions per chapter (first and last), renumbered
  const finalId = 'book-final-textbook';
  const finalQuestions: string[] = [];
  let qIdx = 0;
  chapters.forEach((ch) => {
    const sampled = [ch.knowledgeCheck.questions[0], ch.knowledgeCheck.questions[ch.knowledgeCheck.questions.length - 1]].filter(
      Boolean
    );
    sampled.forEach((q) => {
      qIdx++;
      finalQuestions.push(
        `    {\n` +
          `      id: '${finalId}-q${qIdx}',\n` +
          `      prompt: ${tsString('[Ch. ' + ch.number + '] ' + q.prompt)},\n` +
          `      options: [${q.options.map(tsString).join(', ')}],\n` +
          `      correctAnswerIndex: ${q.correctAnswerIndex},\n` +
          `      explanation: ${tsString(q.explanation + ' (From Chapter ' + ch.number + ': ' + ch.title + ')')},\n` +
          `      difficulty: '${q.difficulty}',\n` +
          `    }`
      );
    });
  });

  const finalQuizCode =
    `  {\n` +
    `    id: '${finalId}',\n` +
    `    subjectType: 'book-final',\n` +
    `    subjectId: 'textbook',\n` +
    `    subjectName: 'The Ethics of Technology Through Science Fiction — Final Exam',\n` +
    `    title: 'Cumulative Final Exam',\n` +
    `    description: 'The master assessment. Pass with 75% or higher to earn the Master Certificate.',\n` +
    `    estimatedMinutes: 20,\n` +
    `    passingScorePercent: 75,\n` +
    `    questions: [\n${finalQuestions.join(',\n')}\n    ],\n` +
    `    createdAt: new Date(0),\n` +
    `  }`;

  const body =
    `export const chapterQuizzes: Quiz[] = [\n` +
    chapters.map(buildQuiz).join(',\n') +
    `,\n];\n\n` +
    `export const finalExamQuiz: Quiz = ${finalQuizCode};\n\n` +
    `export function getStaticTextbookQuiz(subjectId: string): Quiz | null {\n` +
    `  if (subjectId === 'textbook') return finalExamQuiz;\n` +
    `  return chapterQuizzes.find((q) => q.subjectId === subjectId) ?? null;\n` +
    `}\n`;

  return header + body;
}

function emitIndexModule(chapters: AssembledChapter[]): string {
  const totalWords = chapters.reduce((s, c) => s + c.wordCount, 0);
  const totalMinutes = chapters.reduce((s, c) => s + c.estimatedReadingMinutes, 0);
  const header =
    `/* AUTO-GENERATED by src/scripts/import-textbook.ts — do not edit by hand. */\n` +
    `import type { Chapter, BookMeta } from '@/types/textbook';\n`;
  const imports = chapters
    .map((c) => `import ch${c.number} from './chapters/${c.slug}';`)
    .join('\n');
  const list = `export const chapters: Chapter[] = [${chapters.map((c) => 'ch' + c.number).join(', ')}];`;
  const meta =
    `export const bookMeta: BookMeta = {\n` +
    `  title: 'The Ethics of Technology Through Science Fiction',\n` +
    `  subtitle: 'Rehearsing tomorrow\\'s moral decisions in the space sci-fi opened up for us.',\n` +
    `  author: 'Dr. Blaine Fisher',\n` +
    `  copyright: 'Copyright © 2025 by Blaine Fisher',\n` +
    `  totalChapters: ${chapters.length},\n` +
    `  totalWordCount: ${totalWords},\n` +
    `  estimatedReadingHours: ${Math.round((totalMinutes / 60) * 10) / 10},\n` +
    `  heroImage: '/textbook/hero.svg',\n` +
    `  overview: ${tsString(
      "A twelve-chapter course that reads technology's hardest ethical questions through the science fiction stories that have been rehearsing them for two centuries. Each chapter pairs a plain-language essay on an ethical tradition with an original short story that puts the ideas under pressure, followed by a Knowledge Check, reflection prompts, and practical takeaways for builders and policymakers."
    )},\n` +
    `  learnerOutcomes: [\n` +
    `    'Name and apply the major ethical traditions to live technology decisions.',\n` +
    `    'Read science fiction as a rehearsal space for real-world ethical dilemmas.',\n` +
    `    'Diagnose where systems fail — at the levels of rules, outcomes, character, and power.',\n` +
    `    'Write, design, and govern technology with sharper moral vocabulary and better instincts.',\n` +
    `  ],\n` +
    `};\n`;
  const helpers =
    `\nexport function getChapterBySlug(slug: string): Chapter | undefined {\n` +
    `  return chapters.find((c) => c.slug === slug);\n` +
    `}\n\n` +
    `export function getChapterByNumber(n: number): Chapter | undefined {\n` +
    `  return chapters.find((c) => c.number === n);\n` +
    `}\n\n` +
    `export function nextChapter(slug: string): Chapter | undefined {\n` +
    `  const idx = chapters.findIndex((c) => c.slug === slug);\n` +
    `  return idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : undefined;\n` +
    `}\n\n` +
    `export function prevChapter(slug: string): Chapter | undefined {\n` +
    `  const idx = chapters.findIndex((c) => c.slug === slug);\n` +
    `  return idx > 0 ? chapters[idx - 1] : undefined;\n` +
    `}\n`;
  return header + '\n' + imports + '\n\n' + list + '\n\n' + meta + helpers;
}

function emitInterlinksModule(): string {
  const entries = Object.entries(ENTITY_REGISTRY)
    .sort((a, b) => b[0].length - a[0].length)
    .map(
      ([key, v]) => `  ${JSON.stringify(key)}: { kind: '${v.kind}', slug: '${v.slug}' },`
    )
    .join('\n');
  return (
    `/* AUTO-GENERATED by src/scripts/import-textbook.ts — do not edit by hand. */\n` +
    `import type { EntityKind } from '@/types/textbook';\n\n` +
    `/** Map of phrase -> destination. Keys are matched case-insensitively, longest-first, word-boundary-aware. */\n` +
    `export const ENTITY_REGISTRY: Record<string, { kind: EntityKind; slug: string }> = {\n${entries}\n};\n\n` +
    `export function entityRoute(kind: EntityKind, slug: string): string {\n` +
    `  switch (kind) {\n` +
    `    case 'philosopher': return '/philosophers/' + slug;\n` +
    `    case 'theory': return '/glossary/' + slug;\n` +
    `    case 'scifi-author': return '/scifi-authors/' + slug;\n` +
    `    case 'scifi-media': return '/scifi-media/' + slug;\n` +
    `  }\n` +
    `}\n`
  );
}

// ─── Driver ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`[import-textbook] Reading: ${SOURCE_DOCX}`);
  await fs.mkdir(CHAPTERS_DIR, { recursive: true });

  const paragraphs = await readParagraphs(SOURCE_DOCX);
  console.log(`[import-textbook] Total paragraphs: ${paragraphs.length}`);

  const slices = sliceChapters(paragraphs);
  console.log(`[import-textbook] Chapters detected: ${slices.length}`);

  const assembled: AssembledChapter[] = [];
  for (const slice of slices) {
    const chapter = assembleChapter(slice);
    assembled.push(chapter);
    const file = path.join(CHAPTERS_DIR, `${chapter.slug}.ts`);
    await fs.writeFile(file, emitChapterModule(chapter), 'utf8');
    console.log(
      `[import-textbook]   ch.${chapter.number} ${chapter.slug} — ${chapter.wordCount} words, ${chapter.sections.length} sections, ${chapter.knowledgeCheck.questions.length} quiz questions`
    );
  }

  await fs.writeFile(path.join(TEXTBOOK_DIR, 'index.ts'), emitIndexModule(assembled), 'utf8');
  await fs.writeFile(path.join(TEXTBOOK_DIR, 'quizzes.ts'), emitQuizModule(assembled), 'utf8');
  await fs.writeFile(path.join(TEXTBOOK_DIR, 'interlinks.ts'), emitInterlinksModule(), 'utf8');

  console.log(`[import-textbook] ✅ Wrote:
  - src/data/textbook/chapters/*.ts (${assembled.length})
  - src/data/textbook/index.ts
  - src/data/textbook/quizzes.ts
  - src/data/textbook/interlinks.ts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
