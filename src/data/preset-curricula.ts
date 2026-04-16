import type { CurriculumPath } from '@/types';

/**
 * Pre-built learning paths available to all users. These are seeded into
 * Firestore via the curriculum actions or rendered from static data if
 * no Firestore version exists. Each references real content on the platform
 * by type + referenceId.
 *
 * `referenceId` values use the IDs from stories, philosophers, theories,
 * scifi-authors, and scifi-media data files.
 */
export const presetCurricula: CurriculumPath[] = [
  {
    id: 'intro-to-tech-ethics',
    title: 'Introduction to Technology Ethics',
    description:
      'A beginner-friendly path covering the foundations: what ethical frameworks exist, how they apply to technology, and why science fiction has been thinking about these problems longer than Silicon Valley has. Complete all required items and earn your certificate.',
    creatorId: 'system',
    creatorName: 'Sci-Fi Ethics Explorer',
    isPublic: true,
    isTemplate: true,
    modules: [
      {
        id: 'ite-m1',
        title: 'Ethical Foundations',
        description: 'Meet the major ethical frameworks.',
        order: 1,
        items: [
          { id: 'ite-m1-i1', type: 'story', referenceId: 'the-algernon-gambit', title: 'Read: The Algernon Gambit', order: 1, isRequired: true },
          { id: 'ite-m1-i2', type: 'quiz', referenceId: 'theory-utilitarianism', title: 'Quiz: Utilitarianism', order: 2, isRequired: true },
          { id: 'ite-m1-i3', type: 'quiz', referenceId: 'theory-deontology', title: 'Quiz: Deontology', order: 3, isRequired: true },
          { id: 'ite-m1-i4', type: 'quiz', referenceId: 'theory-virtue-ethics', title: 'Quiz: Virtue Ethics', order: 4, isRequired: false },
        ],
      },
      {
        id: 'ite-m2',
        title: 'AI & Machine Minds',
        description: 'What do we owe the minds we create?',
        order: 2,
        items: [
          { id: 'ite-m2-i1', type: 'story', referenceId: 'synthetic-souls', title: 'Read: Synthetic Souls', order: 1, isRequired: true },
          { id: 'ite-m2-i2', type: 'quiz', referenceId: 'scifi-author-isaac-asimov', title: 'Quiz: Isaac Asimov', order: 2, isRequired: true },
          { id: 'ite-m2-i3', type: 'quiz', referenceId: 'scifi-author-mary-shelley', title: 'Quiz: Mary Shelley', order: 3, isRequired: true },
        ],
      },
      {
        id: 'ite-m3',
        title: 'Reflection',
        description: 'Apply what you have learned.',
        order: 3,
        items: [
          { id: 'ite-m3-i1', type: 'analysis', referenceId: '', title: 'Analyze a scenario of your choice', order: 1, isRequired: true },
        ],
      },
    ],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'ai-rights-deep-dive',
    title: 'AI Rights & Machine Personhood',
    description:
      'A focused path on the most contested question in tech ethics: when (if ever) does a machine deserve moral consideration? Covers philosophical foundations, literary explorations, and film depictions.',
    creatorId: 'system',
    creatorName: 'Sci-Fi Ethics Explorer',
    isPublic: true,
    isTemplate: true,
    modules: [
      {
        id: 'aird-m1',
        title: 'Philosophical Groundwork',
        description: 'Frameworks that bear on machine minds.',
        order: 1,
        items: [
          { id: 'aird-m1-i1', type: 'quiz', referenceId: 'theory-deontology', title: 'Quiz: Deontology (Treating Persons as Ends)', order: 1, isRequired: true },
          { id: 'aird-m1-i2', type: 'quiz', referenceId: 'theory-ethics-of-care', title: 'Quiz: Ethics of Care', order: 2, isRequired: true },
          { id: 'aird-m1-i3', type: 'quiz', referenceId: 'theory-existentialist-ethics', title: 'Quiz: Existentialist Ethics', order: 3, isRequired: false },
        ],
      },
      {
        id: 'aird-m2',
        title: 'Literary Explorations',
        description: 'How science fiction has staged the question.',
        order: 2,
        items: [
          { id: 'aird-m2-i1', type: 'quiz', referenceId: 'scifi-author-philip-k-dick', title: 'Quiz: Philip K. Dick (Empathy & Personhood)', order: 1, isRequired: true },
          { id: 'aird-m2-i2', type: 'quiz', referenceId: 'scifi-author-ted-chiang', title: 'Quiz: Ted Chiang (Lifecycle of Software Objects)', order: 2, isRequired: true },
          { id: 'aird-m2-i3', type: 'story', referenceId: 'synthetic-souls', title: 'Read: Synthetic Souls', order: 3, isRequired: true },
        ],
      },
      {
        id: 'aird-m3',
        title: 'On Screen',
        description: 'Film and television treatments.',
        order: 3,
        items: [
          { id: 'aird-m3-i1', type: 'discussion', referenceId: 'ex-machina', title: 'Discuss: Ex Machina', order: 1, isRequired: false },
          { id: 'aird-m3-i2', type: 'discussion', referenceId: 'blade-runner', title: 'Discuss: Blade Runner', order: 2, isRequired: false },
          { id: 'aird-m3-i3', type: 'analysis', referenceId: '', title: 'Final Analysis: Should AIs have rights?', order: 3, isRequired: true },
        ],
      },
    ],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'surveillance-and-privacy',
    title: 'Surveillance, Privacy & Digital Identity',
    description:
      'From Orwell to social credit scores: a path through the ethics of watching, being watched, and the data trails we leave behind. Covers philosophical arguments, dystopian fiction, and modern TV depictions.',
    creatorId: 'system',
    creatorName: 'Sci-Fi Ethics Explorer',
    isPublic: true,
    isTemplate: true,
    modules: [
      {
        id: 'sp-m1',
        title: 'Foundations',
        description: 'Ethical frameworks most relevant to privacy.',
        order: 1,
        items: [
          { id: 'sp-m1-i1', type: 'quiz', referenceId: 'theory-social-contract-theory', title: 'Quiz: Social Contract Theory', order: 1, isRequired: true },
          { id: 'sp-m1-i2', type: 'quiz', referenceId: 'theory-discourse-ethics', title: 'Quiz: Discourse Ethics', order: 2, isRequired: true },
        ],
      },
      {
        id: 'sp-m2',
        title: 'Fiction as Warning',
        description: 'Stories that saw it coming.',
        order: 2,
        items: [
          { id: 'sp-m2-i1', type: 'quiz', referenceId: 'scifi-author-william-gibson', title: 'Quiz: William Gibson (Cyberspace & Surveillance Capitalism)', order: 1, isRequired: true },
          { id: 'sp-m2-i2', type: 'quiz', referenceId: 'scifi-author-margaret-atwood', title: 'Quiz: Margaret Atwood (Speculative Dystopia)', order: 2, isRequired: true },
          { id: 'sp-m2-i3', type: 'discussion', referenceId: 'black-mirror', title: 'Discuss: Black Mirror (Nosedive, White Bear)', order: 3, isRequired: false },
          { id: 'sp-m2-i4', type: 'discussion', referenceId: 'severance', title: 'Discuss: Severance', order: 4, isRequired: false },
        ],
      },
      {
        id: 'sp-m3',
        title: 'Capstone',
        description: 'Apply your learning.',
        order: 3,
        items: [
          { id: 'sp-m3-i1', type: 'analysis', referenceId: '', title: 'Analyze: Is mass surveillance ever justified?', order: 1, isRequired: true },
        ],
      },
    ],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'environmental-ethics-and-scifi',
    title: 'Environmental Ethics Through Sci-Fi',
    description:
      'Climate change, terraforming, and the moral status of ecosystems. This path connects environmental philosophy to the science-fiction writers and stories that imagine ecological futures.',
    creatorId: 'system',
    creatorName: 'Sci-Fi Ethics Explorer',
    isPublic: true,
    isTemplate: true,
    modules: [
      {
        id: 'ee-m1',
        title: 'The Frameworks',
        description: 'Philosophical grounding for environmental ethics.',
        order: 1,
        items: [
          { id: 'ee-m1-i1', type: 'quiz', referenceId: 'theory-environmental-ethics', title: 'Quiz: Environmental Ethics', order: 1, isRequired: true },
          { id: 'ee-m1-i2', type: 'quiz', referenceId: 'theory-daoist-ethics', title: 'Quiz: Daoist Ethics', order: 2, isRequired: false },
          { id: 'ee-m1-i3', type: 'quiz', referenceId: 'theory-ubuntu-ethics', title: 'Quiz: Ubuntu Ethics', order: 3, isRequired: false },
        ],
      },
      {
        id: 'ee-m2',
        title: 'Writers on Ecology',
        description: 'Authors who imagine ecological futures.',
        order: 2,
        items: [
          { id: 'ee-m2-i1', type: 'quiz', referenceId: 'scifi-author-ursula-le-guin', title: 'Quiz: Ursula K. Le Guin', order: 1, isRequired: true },
          { id: 'ee-m2-i2', type: 'quiz', referenceId: 'scifi-author-n-k-jemisin', title: 'Quiz: N. K. Jemisin', order: 2, isRequired: true },
          { id: 'ee-m2-i3', type: 'quiz', referenceId: 'scifi-author-octavia-butler', title: 'Quiz: Octavia Butler', order: 3, isRequired: true },
        ],
      },
      {
        id: 'ee-m3',
        title: 'Stories & Screen',
        description: 'Ecological narratives.',
        order: 3,
        items: [
          { id: 'ee-m3-i1', type: 'story', referenceId: 'the-river-we-offered', title: 'Read: The River We Offered', order: 1, isRequired: true },
          { id: 'ee-m3-i2', type: 'discussion', referenceId: 'the-expanse', title: 'Discuss: The Expanse (Resource Scarcity)', order: 2, isRequired: false },
          { id: 'ee-m3-i3', type: 'analysis', referenceId: '', title: 'Final Analysis: Should we terraform Mars?', order: 3, isRequired: true },
        ],
      },
    ],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'cosmic-ethics-and-first-contact',
    title: 'Cosmic Ethics & First Contact',
    description:
      'What do we owe aliens? What do they owe us? A path through cosmopolitanism, game theory, and the science fiction that stages the encounter with radically different minds.',
    creatorId: 'system',
    creatorName: 'Sci-Fi Ethics Explorer',
    isPublic: true,
    isTemplate: true,
    modules: [
      {
        id: 'ce-m1',
        title: 'Philosophical Foundations',
        description: 'Frameworks for thinking across radical difference.',
        order: 1,
        items: [
          { id: 'ce-m1-i1', type: 'quiz', referenceId: 'theory-cosmopolitanism', title: 'Quiz: Cosmopolitanism', order: 1, isRequired: true },
          { id: 'ce-m1-i2', type: 'quiz', referenceId: 'theory-social-contract-theory', title: 'Quiz: Social Contract Theory', order: 2, isRequired: true },
          { id: 'ce-m1-i3', type: 'quiz', referenceId: 'theory-stoicism', title: 'Quiz: Stoicism', order: 3, isRequired: false },
        ],
      },
      {
        id: 'ce-m2',
        title: 'The Dark Forest & Beyond',
        description: 'Science fiction on cosmic stakes.',
        order: 2,
        items: [
          { id: 'ce-m2-i1', type: 'quiz', referenceId: 'scifi-author-liu-cixin', title: 'Quiz: Liu Cixin (Dark Forest Hypothesis)', order: 1, isRequired: true },
          { id: 'ce-m2-i2', type: 'quiz', referenceId: 'scifi-author-ursula-le-guin', title: 'Quiz: Ursula K. Le Guin (Contact Without Coercion)', order: 2, isRequired: true },
          { id: 'ce-m2-i3', type: 'discussion', referenceId: 'arrival-film', title: 'Discuss: Arrival (Language & First Contact)', order: 3, isRequired: false },
        ],
      },
      {
        id: 'ce-m3',
        title: 'Capstone',
        description: 'Synthesize what you have learned.',
        order: 3,
        items: [
          { id: 'ce-m3-i1', type: 'analysis', referenceId: '', title: 'Final Analysis: Draft a first-contact protocol', order: 1, isRequired: true },
        ],
      },
    ],
    createdAt: new Date('2026-01-01'),
  },
];
