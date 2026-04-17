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
];
