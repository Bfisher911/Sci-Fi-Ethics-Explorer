import type { CurriculumPath } from '@/types';
import {
  OFFICIAL_AUTHOR_NAME,
  OFFICIAL_AUTHOR_UID,
} from '@/lib/official-author';

/**
 * "Official Learning Paths" — curated, textbook-aligned curricula authored
 * by the platform. Each path:
 *   - is marked `isOfficial: true` so we can distinguish it from
 *     community-built paths in the listing UI
 *   - awards a certificate on completion
 *   - exercises the richer artifact types: instructions headers,
 *     textbook chapters, philosopher pages, ethical theories, stories,
 *     analyzer starter prompts, perspective comparisons, reflections
 *
 * These are merged into `getCurricula()` via the same fallthrough pattern
 * used by `presetCurricula` — see src/app/actions/curriculum.ts.
 */
export const officialLearningPaths: CurriculumPath[] = [
  {
    id: 'official-moral-foundations',
    title: 'Official Path — Moral Foundations for a Digital Age',
    description:
      "The platform's foundational path. You'll read Chapter 1 of the textbook, meet the philosophers it draws on, explore the ethical frameworks it names, play an original sci-fi story, analyze a scenario of your own, and reflect on what changed.",
    creatorId: OFFICIAL_AUTHOR_UID,
    creatorName: OFFICIAL_AUTHOR_NAME,
    isPublic: true,
    isTemplate: true,
    isOfficial: true,
    certificate: {
      enabled: true,
      title: 'Moral Foundations for a Digital Age',
      description:
        'Awarded for completing the platform\'s foundational learning path on the architecture of moral reasoning in technology.',
    },
    modules: [
      {
        id: 'ofmf-m1',
        title: 'Module 1 — The Architecture of Moral Reasoning',
        description:
          'Start with the textbook chapter, then meet the thinkers behind the frameworks it uses.',
        order: 1,
        items: [
          {
            id: 'ofmf-m1-i0',
            type: 'instructions',
            referenceId: '',
            title: 'Before you begin',
            order: 0,
            isRequired: false,
            instructions:
              "This path mirrors Chapter 1 of the course textbook. Read at your own pace — every item cross-references something you'll use later in the path. Expect to spend 90–120 minutes end to end.",
          },
          {
            id: 'ofmf-m1-i1',
            type: 'textbook-chapter',
            referenceId: '01-architecture-of-moral-reasoning',
            title: 'Read: Chapter 1 — The Architecture of Moral Reasoning',
            order: 1,
            isRequired: true,
            instructions:
              'Read the essay and the original short story "The Ledger of Forgetting." Take the end-of-chapter Knowledge Check before moving on.',
          },
          {
            id: 'ofmf-m1-i2',
            type: 'philosopher',
            referenceId: 'kant',
            title: 'Read: Immanuel Kant',
            order: 2,
            isRequired: true,
            instructions:
              'The chapter leans on Kant for its deontological framing. Read the Kant page and note how his "treat persons as ends" principle shows up in the story.',
          },
          {
            id: 'ofmf-m1-i3',
            type: 'philosopher',
            referenceId: 'mill',
            title: 'Read: John Stuart Mill',
            order: 3,
            isRequired: true,
            instructions:
              'Mill is the counterweight — outcomes over rules. Compare his frame against the Kantian one.',
          },
          {
            id: 'ofmf-m1-i4',
            type: 'theory',
            referenceId: 'utilitarianism',
            title: 'Glossary: Utilitarianism',
            order: 4,
            isRequired: true,
          },
          {
            id: 'ofmf-m1-i5',
            type: 'theory',
            referenceId: 'deontology',
            title: 'Glossary: Deontology',
            order: 5,
            isRequired: true,
          },
          {
            id: 'ofmf-m1-i6',
            type: 'theory',
            referenceId: 'virtue-ethics',
            title: 'Glossary: Virtue Ethics',
            order: 6,
            isRequired: true,
          },
          {
            id: 'ofmf-m1-i7',
            type: 'quiz',
            referenceId: 'book-chapter-01-architecture-of-moral-reasoning',
            title: 'Chapter 1 Knowledge Check',
            order: 7,
            isRequired: true,
            instructions:
              'Pass this at 70% or higher. Unlimited retakes are allowed.',
          },
        ],
      },
      {
        id: 'ofmf-m2',
        title: 'Module 2 — Read a Story, Feel the Tension',
        description: 'Sci-fi puts the frameworks under pressure.',
        order: 2,
        items: [
          {
            id: 'ofmf-m2-i1',
            type: 'story',
            referenceId: 'the-algernon-gambit',
            title: 'Play: The Algernon Gambit',
            order: 1,
            isRequired: true,
            instructions:
              'A branching story about a lab-born AI asking for recognition. Play through at least one ending — every choice records the framework you leaned on.',
          },
          {
            id: 'ofmf-m2-i2',
            type: 'scifi-author',
            referenceId: 'philip-k-dick',
            title: 'Author: Philip K. Dick',
            order: 2,
            isRequired: false,
            instructions:
              'The story is in dialogue with Dick\'s work on reality, memory, and manipulated perception.',
          },
          {
            id: 'ofmf-m2-i3',
            type: 'scifi-media',
            referenceId: 'blade-runner',
            title: 'Watch / Read: Blade Runner',
            order: 3,
            isRequired: false,
            instructions:
              'Explore the cultural touchstone closest to the story you just played.',
          },
        ],
      },
      {
        id: 'ofmf-m3',
        title: 'Module 3 — Put It To Work',
        description: 'Bring what you just learned into the tools.',
        order: 3,
        items: [
          {
            id: 'ofmf-m3-i1',
            type: 'analysis',
            referenceId: '',
            title: 'Analyzer: Design a hiring algorithm audit',
            order: 1,
            isRequired: true,
            prompt:
              'A Fortune-500 company wants to audit its AI-based hiring pipeline. Draft the audit: what deontological, utilitarian, and virtue-ethics questions must it answer before shipping the next version? Paste your draft into the Scenario Analyzer.',
          },
          {
            id: 'ofmf-m3-i2',
            type: 'perspective',
            referenceId: '',
            title: 'Perspective Comparison: Autonomous triage',
            order: 2,
            isRequired: true,
            prompt:
              'A rural ER rolls out autonomous triage for patients with chest pain. Compare how a Kantian, a utilitarian, and a virtue ethicist would each evaluate its deployment.',
          },
          {
            id: 'ofmf-m3-i3',
            type: 'reflection',
            referenceId: '',
            title: 'Reflection: What moved you?',
            order: 3,
            isRequired: true,
            instructions:
              'Write at least 3–4 sentences on which framework felt most alive to you by the end of this path — and which one you are now more suspicious of. If you are enrolled through a community, you can optionally share your reflection with your instructor.',
            prompt:
              "Which framework felt most alive to you by the end of this path — and which are you now more suspicious of? Use specific moments from the story or the textbook to back up your answer.",
          },
        ],
      },
    ],
    createdAt: new Date('2026-04-01'),
  },
  {
    id: 'official-ai-personhood',
    title: 'Official Path — AI, Personhood & the Ethics of Care',
    description:
      'What do we owe the minds we build? This path walks you through the philosophers, fiction, and ethical frameworks that wrestle with AI personhood, and culminates in your own scenario analysis and reflection.',
    creatorId: OFFICIAL_AUTHOR_UID,
    creatorName: OFFICIAL_AUTHOR_NAME,
    isPublic: true,
    isTemplate: true,
    isOfficial: true,
    certificate: {
      enabled: true,
      title: 'AI, Personhood & the Ethics of Care',
      description:
        "Awarded for completing the platform's path on AI personhood, care ethics, and what we owe the minds we create.",
    },
    modules: [
      {
        id: 'ofap-m1',
        title: 'Module 1 — The Question of Personhood',
        description: 'Start with the textbook chapter on AI + care ethics.',
        order: 1,
        items: [
          {
            id: 'ofap-m1-i0',
            type: 'instructions',
            referenceId: '',
            title: 'Before you begin',
            order: 0,
            isRequired: false,
            instructions:
              "This path pairs Chapter 12 of the textbook with the care-ethics tradition, a classic film, and a story that tests your intuitions. Budget ~2 hours.",
          },
          {
            id: 'ofap-m1-i1',
            type: 'textbook-chapter',
            referenceId: '12-ai-care-ethics',
            title: 'Read: Chapter 12 — Artificial Intelligence & Care Ethics',
            order: 1,
            isRequired: true,
          },
          {
            id: 'ofap-m1-i2',
            type: 'theory',
            referenceId: 'ethics-of-care',
            title: 'Glossary: Ethics of Care',
            order: 2,
            isRequired: true,
          },
          {
            id: 'ofap-m1-i3',
            type: 'philosopher',
            referenceId: 'noddings',
            title: 'Read: Nel Noddings',
            order: 3,
            isRequired: true,
          },
          {
            id: 'ofap-m1-i4',
            type: 'quiz',
            referenceId: 'book-chapter-12-ai-care-ethics',
            title: 'Chapter 12 Knowledge Check',
            order: 4,
            isRequired: true,
          },
        ],
      },
      {
        id: 'ofap-m2',
        title: 'Module 2 — Fiction as Pressure Test',
        description: 'Run the frameworks against a concrete story.',
        order: 2,
        items: [
          {
            id: 'ofap-m2-i1',
            type: 'story',
            referenceId: 'synthetic-souls',
            title: 'Play: Synthetic Souls',
            order: 1,
            isRequired: true,
            instructions:
              'A humanoid AI enters an ethics hearing. Every choice nudges one framework against another.',
          },
          {
            id: 'ofap-m2-i2',
            type: 'scifi-media',
            referenceId: 'ex-machina',
            title: 'Watch: Ex Machina',
            order: 2,
            isRequired: false,
          },
          {
            id: 'ofap-m2-i3',
            type: 'scifi-author',
            referenceId: 'ted-chiang',
            title: 'Author: Ted Chiang',
            order: 3,
            isRequired: false,
            instructions:
              "Chiang's 'The Lifecycle of Software Objects' is the closest literary relative of this path's arguments.",
          },
        ],
      },
      {
        id: 'ofap-m3',
        title: 'Module 3 — Build & Reflect',
        description: 'Apply the frameworks to a live design scenario.',
        order: 3,
        items: [
          {
            id: 'ofap-m3-i1',
            type: 'analysis',
            referenceId: '',
            title: 'Analyzer: Care-ethics review of an AI companion',
            order: 1,
            isRequired: true,
            prompt:
              "A startup is launching an AI companion marketed to isolated elders. Apply the four care-ethics dimensions (attentiveness, responsibility, competence, responsiveness) to evaluate whether it ships ethically. Paste your write-up into the Scenario Analyzer.",
          },
          {
            id: 'ofap-m3-i2',
            type: 'reflection',
            referenceId: '',
            title: 'Reflection: What we owe the minds we build',
            order: 2,
            isRequired: true,
            prompt:
              "If one of your future products turned out to have the kind of inner life Chiang's digients had, what would you actually do — and why? Ground your answer in specific frameworks from this path.",
          },
        ],
      },
    ],
    createdAt: new Date('2026-04-02'),
  },

  // ─── Official Path 3 — Surveillance, Privacy & Social Contract ─────
  // Pairs textbook Chapter 9 with classic film / TV studies of the
  // panopticon and the philosophers who built the concept of consent.
  {
    id: 'official-surveillance-privacy',
    title: 'Official Path — Surveillance, Privacy & the Social Contract',
    description:
      'What is the line between safety and the panopticon? Pair the textbook chapter on surveillance with the philosophers who built the concept of consent, two fictional case studies, and your own scenario analysis.',
    creatorId: OFFICIAL_AUTHOR_UID,
    creatorName: OFFICIAL_AUTHOR_NAME,
    isPublic: true,
    isTemplate: true,
    isOfficial: true,
    certificate: {
      enabled: true,
      title: 'Surveillance, Privacy & the Social Contract',
      description:
        "Awarded for completing the platform's path on surveillance, consent, and the social contract in a networked age.",
    },
    modules: [
      {
        id: 'ofsp-m1',
        title: 'Module 1 — The Foucauldian Frame',
        description:
          'Read the chapter, meet the philosophers, and walk through the theories of consent and discipline the chapter draws on.',
        order: 1,
        items: [
          {
            id: 'ofsp-m1-i0',
            type: 'instructions',
            referenceId: '',
            title: 'Before you begin',
            order: 0,
            isRequired: false,
            instructions:
              'This path traces Chapter 9 through Foucault, Hobbes, and two stories that test your intuitions about consent and constant observation. Budget ~90 minutes end to end.',
          },
          {
            id: 'ofsp-m1-i1',
            type: 'textbook-chapter',
            referenceId: '09-surveillance-privacy-social-contract',
            title:
              'Read: Chapter 9 — Surveillance, Privacy & the Social Contract',
            order: 1,
            isRequired: true,
          },
          {
            id: 'ofsp-m1-i2',
            type: 'philosopher',
            referenceId: 'foucault',
            title: 'Read: Michel Foucault',
            order: 2,
            isRequired: true,
            instructions:
              'Focus on the panopticon and the internalization of surveillance. What does Foucault say happens to selves that never stop being watched?',
          },
          {
            id: 'ofsp-m1-i3',
            type: 'philosopher',
            referenceId: 'hobbes',
            title: 'Read: Thomas Hobbes',
            order: 3,
            isRequired: true,
            instructions:
              "Hobbes is the opposite pole — you trade privacy for safety willingly. Note where his argument rhymes with modern terms-of-service consent.",
          },
          {
            id: 'ofsp-m1-i4',
            type: 'theory',
            referenceId: 'social-contract-theory',
            title: 'Glossary: Social Contract Theory',
            order: 4,
            isRequired: true,
          },
        ],
      },
      {
        id: 'ofsp-m2',
        title: 'Module 2 — Apply and Reflect',
        description:
          'Pair the theory with fiction, run your own scenario, and close with a reflection that forces you to take a position.',
        order: 2,
        items: [
          {
            id: 'ofsp-m2-i1',
            type: 'scifi-media',
            referenceId: 'person-of-interest-tv',
            title: 'Watch: Person of Interest',
            order: 1,
            isRequired: true,
            instructions:
              'Study the show\u2019s core premise \u2014 a surveillance state that works perfectly, only sometimes. At what point does the act of watching, even with benevolent intent, become a moral problem in itself?',
          },
          {
            id: 'ofsp-m2-i2',
            type: 'scifi-media',
            referenceId: 'black-mirror',
            title: 'Watch: Black Mirror (select one episode)',
            order: 2,
            isRequired: true,
            instructions:
              'Pick any Black Mirror episode that centers observation or memory (e.g., "The Entire History of You", "Nosedive", "Shut Up and Dance"). Identify the social-contract argument the episode makes.',
          },
          {
            id: 'ofsp-m2-i3',
            type: 'analyzer-prompt',
            referenceId: '',
            title: 'Analyze: Your own scenario',
            order: 3,
            isRequired: true,
            prompt:
              "A city deploys AI-driven predictive policing in a neighborhood that petitions for more police presence. Using utilitarianism, Kantian deontology, and Foucauldian analysis, evaluate whether deployment is ethically justified.",
          },
          {
            id: 'ofsp-m2-i4',
            type: 'reflection',
            referenceId: '',
            title: "Reflection: Where's your line?",
            order: 4,
            isRequired: true,
            prompt:
              'Where is *your* consent-vs-safety line? Ground your answer in something specific from this path — a Hobbes line, a Foucault image, or a moment in the film / episode you watched.',
          },
        ],
      },
    ],
    createdAt: new Date('2026-04-18'),
  },

  // ─── Official Path 4 — Bioengineering, Enhancement & Justice ───────
  {
    id: 'official-bioengineering-justice',
    title: 'Official Path — Bioengineering, Enhancement & Justice',
    description:
      "From Gattaca to CRISPR: when the technology to edit human bodies gets cheap and good, who is allowed to use it, for what, and on whom? Pair the textbook chapter on enhancement ethics with the philosophers and fiction that argue the hardest cases.",
    creatorId: OFFICIAL_AUTHOR_UID,
    creatorName: OFFICIAL_AUTHOR_NAME,
    isPublic: true,
    isTemplate: true,
    isOfficial: true,
    certificate: {
      enabled: true,
      title: 'Bioengineering, Enhancement & Justice',
      description:
        "Awarded for completing the platform's path on bioengineering, human enhancement, and the justice claims that govern who gets to be upgraded.",
    },
    modules: [
      {
        id: 'ofbj-m1',
        title: 'Module 1 — The Enhancement Question',
        description:
          'Read the chapter, meet the capabilities-approach tradition, and walk through the philosophers it draws on.',
        order: 1,
        items: [
          {
            id: 'ofbj-m1-i1',
            type: 'textbook-chapter',
            referenceId: '10-bioengineering-enhancement-justice',
            title:
              'Read: Chapter 10 — Bioengineering, Enhancement & Justice',
            order: 1,
            isRequired: true,
          },
          {
            id: 'ofbj-m1-i2',
            type: 'philosopher',
            referenceId: 'rawls',
            title: 'Read: John Rawls',
            order: 2,
            isRequired: true,
            instructions:
              "Focus on the difference principle. How does it change when the 'least advantaged' is redefined by genetic engineering?",
          },
          {
            id: 'ofbj-m1-i3',
            type: 'philosopher',
            referenceId: 'nussbaum',
            title: 'Read: Martha Nussbaum',
            order: 3,
            isRequired: true,
            instructions:
              'Nussbaum gives you the capabilities approach. What gets counted as a capability when the floor keeps rising?',
          },
          {
            id: 'ofbj-m1-i4',
            type: 'theory',
            referenceId: 'capabilities-approach',
            title: 'Glossary: Capabilities Approach',
            order: 4,
            isRequired: true,
          },
        ],
      },
      {
        id: 'ofbj-m2',
        title: 'Module 2 — Fiction and Your Own Case',
        description:
          'Test your intuitions against two canonical enhancement stories, then propose a real-world deployment and evaluate it.',
        order: 2,
        items: [
          {
            id: 'ofbj-m2-i1',
            type: 'scifi-media',
            referenceId: 'gattaca',
            title: 'Watch: Gattaca',
            order: 1,
            isRequired: true,
            instructions:
              'Track where Gattaca is clearly about JUSTICE, not just biology. Who is being denied capabilities, and on what grounds?',
          },
          {
            id: 'ofbj-m2-i2',
            type: 'analyzer-prompt',
            referenceId: '',
            title: 'Analyze: A real enhancement policy',
            order: 2,
            isRequired: true,
            prompt:
              'A national health service proposes covering CRISPR-based deafness correction for adults, but not for pre-implantation embryos. Compare Rawlsian, Kantian, and capabilities-approach analyses. Is the distinction defensible?',
          },
          {
            id: 'ofbj-m2-i3',
            type: 'perspective',
            referenceId: '',
            title: 'Perspective: Compare frameworks on enhancement',
            order: 3,
            isRequired: true,
            instructions:
              'Use the Perspectives page to run a side-by-side comparison of at least three frameworks on the same enhancement question you analyzed above. Save the comparison to your profile.',
          },
          {
            id: 'ofbj-m2-i4',
            type: 'reflection',
            referenceId: '',
            title: 'Reflection: Your redline',
            order: 4,
            isRequired: true,
            prompt:
              "Is there an enhancement you would never deploy — even if it were safe, consensual, and cheap? Why? Name the moral claim that holds the redline in place.",
          },
        ],
      },
    ],
    createdAt: new Date('2026-04-18'),
  },

  // ─── Official Path 5 — Utilitarianism, Warfare & Autonomous Systems ─
  {
    id: 'official-utilitarianism-warfare',
    title: 'Official Path — Utilitarianism, Warfare & Autonomous Systems',
    description:
      'Autonomous weapons are already here. Walk through the utilitarian calculus that authorizes them, the deontological arguments that constrain them, and a pair of fictional stress tests that push both traditions.',
    creatorId: OFFICIAL_AUTHOR_UID,
    creatorName: OFFICIAL_AUTHOR_NAME,
    isPublic: true,
    isTemplate: true,
    isOfficial: true,
    certificate: {
      enabled: true,
      title: 'Utilitarianism, Warfare & Autonomous Systems',
      description:
        "Awarded for completing the platform's path on utilitarianism, just-war theory, and the ethics of autonomous weapons.",
    },
    modules: [
      {
        id: 'ofuw-m1',
        title: 'Module 1 — The Utilitarian Calculus',
        description:
          'Read the chapter, meet Mill and Singer, and learn the just-war vocabulary.',
        order: 1,
        items: [
          {
            id: 'ofuw-m1-i1',
            type: 'textbook-chapter',
            referenceId: '05-utilitarianism-and-warfare',
            title: 'Read: Chapter 5 — Utilitarianism & Warfare',
            order: 1,
            isRequired: true,
          },
          {
            id: 'ofuw-m1-i2',
            type: 'philosopher',
            referenceId: 'mill',
            title: 'Read: John Stuart Mill',
            order: 2,
            isRequired: true,
          },
          {
            id: 'ofuw-m1-i3',
            type: 'philosopher',
            referenceId: 'singer',
            title: 'Read: Peter Singer',
            order: 3,
            isRequired: true,
            instructions:
              "Singer takes utilitarianism into the 21st century. Pay attention to his expanding-circle argument — it matters for autonomous-weapons debates.",
          },
          {
            id: 'ofuw-m1-i4',
            type: 'theory',
            referenceId: 'utilitarianism',
            title: 'Glossary: Utilitarianism',
            order: 4,
            isRequired: true,
          },
        ],
      },
      {
        id: 'ofuw-m2',
        title: 'Module 2 — Stress Tests',
        description:
          'Test utilitarianism against two canonical warfare stories, then run your own scenario.',
        order: 2,
        items: [
          {
            id: 'ofuw-m2-i1',
            type: 'scifi-media',
            referenceId: 'dune-book',
            title: 'Read: Dune (Herbert)',
            order: 1,
            isRequired: true,
            instructions:
              "Dune is the utilitarian calculation under maximum stress: Paul Atreides sees every possible future and picks the one with the lowest body count. Note what the math still can't account for \u2014 the moral residue of being the person who made the choice.",
          },
          {
            id: 'ofuw-m2-i2',
            type: 'analyzer-prompt',
            referenceId: '',
            title: 'Analyze: Autonomous weapon deployment',
            order: 2,
            isRequired: true,
            prompt:
              'An autonomous drone swarm can end a civil war 40% faster than conventional troops, with projected civilian casualties 15% lower. International law prohibits its use because there is no human in the loop for the final kill decision. Analyze the tension between utilitarian calculation and Kantian / jus in bello constraints.',
          },
          {
            id: 'ofuw-m2-i3',
            type: 'reflection',
            referenceId: '',
            title: 'Reflection: The number and the principle',
            order: 3,
            isRequired: true,
            prompt:
              'Name one place you refuse to follow the utilitarian calculation even when the numbers win. What is your grounding principle — and from whom did you get it?',
          },
        ],
      },
    ],
    createdAt: new Date('2026-04-18'),
  },

  // ─── Official Path 6 — Virtue Ethics & Technology Craft ─────────────
  // The "one additional new learning path beyond what currently exists."
  {
    id: 'official-virtue-ethics-craft',
    title: 'Official Path — Virtue Ethics & the Craft of Technology',
    description:
      'What makes a technologist good — not merely effective? Walk through the Aristotelian tradition, the craft-ethics argument, and two case studies in how the character of the builder shapes what the tool ends up being.',
    creatorId: OFFICIAL_AUTHOR_UID,
    creatorName: OFFICIAL_AUTHOR_NAME,
    isPublic: true,
    isTemplate: true,
    isOfficial: true,
    certificate: {
      enabled: true,
      title: 'Virtue Ethics & the Craft of Technology',
      description:
        "Awarded for completing the platform's path on virtue ethics, character-based evaluation, and the craft tradition in technology.",
    },
    modules: [
      {
        id: 'ofve-m1',
        title: 'Module 1 — The Character Question',
        description:
          'Read the chapter, meet Aristotle and MacIntyre, and learn to see technology as a practice with internal goods.',
        order: 1,
        items: [
          {
            id: 'ofve-m1-i1',
            type: 'textbook-chapter',
            referenceId: '08-virtue-ethics-and-technology',
            title: 'Read: Chapter 8 — Virtue Ethics & Technology',
            order: 1,
            isRequired: true,
          },
          {
            id: 'ofve-m1-i2',
            type: 'philosopher',
            referenceId: 'aristotle',
            title: 'Read: Aristotle',
            order: 2,
            isRequired: true,
            instructions:
              'Focus on phronesis (practical wisdom) and the doctrine of the mean. What does it mean to be a virtuous engineer?',
          },
          {
            id: 'ofve-m1-i3',
            type: 'philosopher',
            referenceId: 'macintyre',
            title: 'Read: Alasdair MacIntyre',
            order: 3,
            isRequired: true,
            instructions:
              "MacIntyre gives you 'practice' as a technical term — a shared pursuit with internal goods. Is software a practice in his sense?",
          },
          {
            id: 'ofve-m1-i4',
            type: 'theory',
            referenceId: 'virtue-ethics',
            title: 'Glossary: Virtue Ethics',
            order: 4,
            isRequired: true,
          },
        ],
      },
      {
        id: 'ofve-m2',
        title: 'Module 2 — The Built World',
        description:
          'Pair the theory with two stories about character-shaped technology, then write your own craft manifesto.',
        order: 2,
        items: [
          {
            id: 'ofve-m2-i1',
            type: 'scifi-media',
            referenceId: 'all-systems-red-book',
            title: "Read: All Systems Red (Wells' Murderbot)",
            order: 1,
            isRequired: true,
            instructions:
              "Murderbot is phronesis in action \u2014 practical wisdom solving novel problems with whatever is on hand, shaped by a character that resists the role the system assigns it. Track where its character enables (and constrains) its engineering.",
          },
          {
            id: 'ofve-m2-i2',
            type: 'scifi-media',
            referenceId: 'arrival-film',
            title: 'Watch: Arrival',
            order: 2,
            isRequired: true,
            instructions:
              "Louise embodies intellectual virtue against institutional pressure. Where does her character *change* what the technology (the translation tool, her own cognition) ends up doing?",
          },
          {
            id: 'ofve-m2-i3',
            type: 'analyzer-prompt',
            referenceId: '',
            title: 'Analyze: A technologist\u2019s choice',
            order: 3,
            isRequired: true,
            prompt:
              'A senior engineer discovers their team\u2019s recommender system is radicalizing a small fraction of users, at high engagement lift. The CEO frames the question as a utility tradeoff. Analyze what a virtue ethicist would say the engineer should do — and why the framing itself is the problem.',
          },
          {
            id: 'ofve-m2-i4',
            type: 'reflection',
            referenceId: '',
            title: 'Reflection: Your craft manifesto',
            order: 4,
            isRequired: true,
            prompt:
              'Write a three-sentence craft manifesto: what are the virtues of a good technologist, in your view? Name one specific practice you will adopt to develop at least one of them.',
          },
        ],
      },
    ],
    createdAt: new Date('2026-04-18'),
  },
];
