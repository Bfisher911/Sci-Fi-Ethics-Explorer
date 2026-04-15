import type { StorySegment } from '@/types';

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  /** Suggested genre + theme; can be edited after applying. */
  suggestedGenre?: string;
  suggestedTheme?: string;
  isInteractive: boolean;
  /** Pre-populated segments showing the structure. Text is a writing prompt. */
  segments: StorySegment[];
}

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'heros-choice',
    name: "The Hero's Choice",
    description:
      'A linear setup that escalates into a single high-stakes moral crossroads with three distinct paths.',
    suggestedGenre: 'Cyberpunk',
    suggestedTheme: 'AI Sentience',
    isInteractive: true,
    segments: [
      {
        id: 'opening',
        type: 'linear',
        text:
          '[OPENING SCENE]\n\nWrite the inciting moment that grounds the reader in the setting. Use specific sensory detail — what does the air smell like? What is the protagonist holding? Show the world before the dilemma arrives.',
      },
      {
        id: 'rising-action',
        type: 'linear',
        text:
          '[RISING ACTION]\n\nIntroduce the tension. Make the stakes personal: what does the protagonist stand to lose? What relationships hang in the balance? End on a beat that points the reader toward the coming choice.',
      },
      {
        id: 'crossroads',
        type: 'interactive',
        text:
          '[THE CROSSROADS]\n\nThe moment of decision. State the dilemma clearly: what must be chosen, and why is each option costly? Avoid leading the reader — present the choices as legitimately hard.',
        choices: [
          { text: 'Choose the consequentialist path (greatest good)', nextSegmentId: 'ending-utilitarian', reflectionTrigger: true },
          { text: 'Choose the deontological path (principle over outcome)', nextSegmentId: 'ending-deontological', reflectionTrigger: true },
          { text: 'Choose the virtue path (character over consequence)', nextSegmentId: 'ending-virtue', reflectionTrigger: true },
        ],
      },
      {
        id: 'ending-utilitarian',
        type: 'linear',
        text:
          '[UTILITARIAN ENDING]\n\nShow what happens when the protagonist optimizes for total welfare. Honor the cost — utilitarianism is rarely tidy. Let the reader feel both the gain and the loss.',
      },
      {
        id: 'ending-deontological',
        type: 'linear',
        text:
          '[DEONTOLOGICAL ENDING]\n\nShow what happens when the protagonist refuses to violate a principle. Show the dignity preserved and the cost paid for keeping faith with the rule.',
      },
      {
        id: 'ending-virtue',
        type: 'linear',
        text:
          '[VIRTUE ENDING]\n\nShow what happens when the protagonist asks "what kind of person do I want to become?" Let the answer reveal itself in action, not exposition.',
      },
    ],
  },
  {
    id: 'investigation',
    name: 'The Investigation',
    description:
      'A hub-and-spoke mystery where the reader visits different "rooms" or witnesses to gather evidence before committing to a verdict.',
    suggestedGenre: 'Hard Sci-Fi',
    suggestedTheme: 'Privacy & Surveillance',
    isInteractive: true,
    segments: [
      {
        id: 'crime-scene',
        type: 'linear',
        text:
          '[CRIME SCENE / INCIDENT]\n\nOpen at the moment the investigation begins. What happened? What is unexplained? Set the protagonist up as the one who must decide what really occurred.',
      },
      {
        id: 'hub',
        type: 'interactive',
        text:
          '[THE HUB]\n\nThree leads have surfaced. Which do you investigate first? You can return here after each lead to pursue another.',
        choices: [
          { text: 'Interview the witness', nextSegmentId: 'lead-witness' },
          { text: 'Examine the physical evidence', nextSegmentId: 'lead-evidence' },
          { text: 'Audit the data trail', nextSegmentId: 'lead-data' },
        ],
      },
      {
        id: 'lead-witness',
        type: 'interactive',
        text:
          '[WITNESS]\n\nThe witness gives an account. Are they reliable? Are they hiding something? Write the conversation, then offer the reader a way back to the hub or onward to the verdict.',
        choices: [
          { text: 'Return to the hub', nextSegmentId: 'hub' },
          { text: 'I have enough — go to verdict', nextSegmentId: 'verdict' },
        ],
      },
      {
        id: 'lead-evidence',
        type: 'interactive',
        text:
          '[PHYSICAL EVIDENCE]\n\nWhat does the evidence say — and what does it not say? Resist the temptation to make it conclusive too early.',
        choices: [
          { text: 'Return to the hub', nextSegmentId: 'hub' },
          { text: 'I have enough — go to verdict', nextSegmentId: 'verdict' },
        ],
      },
      {
        id: 'lead-data',
        type: 'interactive',
        text:
          '[DATA TRAIL]\n\nDigital records reveal patterns the human eye missed. Does this clarify or complicate the picture?',
        choices: [
          { text: 'Return to the hub', nextSegmentId: 'hub' },
          { text: 'I have enough — go to verdict', nextSegmentId: 'verdict' },
        ],
      },
      {
        id: 'verdict',
        type: 'interactive',
        text:
          '[VERDICT]\n\nBased on what was gathered, what does the protagonist conclude? Three readings of the evidence are defensible.',
        choices: [
          { text: 'It was deliberate — pursue accountability', nextSegmentId: 'ending-accountability', reflectionTrigger: true },
          { text: 'It was systemic — the institution is at fault', nextSegmentId: 'ending-systemic', reflectionTrigger: true },
          { text: 'It was tragic — no one is to blame', nextSegmentId: 'ending-tragic', reflectionTrigger: true },
        ],
      },
      { id: 'ending-accountability', type: 'linear', text: '[ACCOUNTABILITY ENDING]\n\nWhat happens when the protagonist names a perpetrator? What is gained, and what is lost when blame settles on a person?' },
      { id: 'ending-systemic', type: 'linear', text: '[SYSTEMIC ENDING]\n\nWhat happens when the protagonist refuses to scapegoat an individual and turns the lens on the institution? Who listens? Who resists?' },
      { id: 'ending-tragic', type: 'linear', text: '[TRAGIC ENDING]\n\nWhat happens when the protagonist accepts that there was no villain — only chains of decisions made by people doing their best?' },
    ],
  },
  {
    id: 'ethical-trap',
    name: 'The Ethical Trap',
    description:
      'A story carefully designed to lead the reader toward one obvious choice, then reveal the philosophical realization that complicates it.',
    suggestedGenre: 'Philosophical Sci-Fi',
    suggestedTheme: 'Transhumanism',
    isInteractive: true,
    segments: [
      {
        id: 'setup',
        type: 'linear',
        text: '[SETUP]\n\nIntroduce a situation with what feels like an obvious right answer. Make the reader feel certain. Withhold one important detail.',
      },
      {
        id: 'first-choice',
        type: 'interactive',
        text: '[FIRST CHOICE]\n\nOffer the reader the obvious good action and a couple of weaker alternatives. Most readers will pick the obvious good action — that is intentional.',
        choices: [
          { text: 'The obvious good thing', nextSegmentId: 'reveal' },
          { text: 'Something more cautious', nextSegmentId: 'reveal' },
          { text: 'Refuse to choose', nextSegmentId: 'reveal' },
        ],
      },
      {
        id: 'reveal',
        type: 'linear',
        text: '[THE REVEAL]\n\nNow disclose the detail you withheld. Reframe what just happened. The reader should feel a small jolt — what they thought they knew was incomplete.',
      },
      {
        id: 'second-choice',
        type: 'interactive',
        text: '[THE REAL DILEMMA]\n\nThis is the choice the story was really about. Now that the reader knows what they did not know before, what should be done?',
        choices: [
          { text: 'Stand by the original action', nextSegmentId: 'ending-conviction', reflectionTrigger: true },
          { text: 'Reverse course', nextSegmentId: 'ending-revision', reflectionTrigger: true },
          { text: 'Accept that there is no clean answer', nextSegmentId: 'ending-tragic', reflectionTrigger: true },
        ],
      },
      { id: 'ending-conviction', type: 'linear', text: '[CONVICTION ENDING]\n\nThe protagonist holds the line. What does it cost to maintain a position once you know it was based on incomplete information?' },
      { id: 'ending-revision', type: 'linear', text: '[REVISION ENDING]\n\nThe protagonist changes course. What is the difference between honest reconsideration and weakness?' },
      { id: 'ending-tragic', type: 'linear', text: '[TRAGIC ENDING]\n\nThe protagonist accepts that no choice was clean. Show how they live with that — and whether the reader can.' },
    ],
  },
  {
    id: 'linear-tale',
    name: 'A Linear Tale',
    description:
      'A pure short story without choices. Best for atmospheric, reflective pieces where the journey IS the point.',
    suggestedGenre: 'Philosophical Sci-Fi',
    suggestedTheme: 'Resource Allocation',
    isInteractive: false,
    segments: [
      { id: 'beat-1', type: 'linear', text: '[OPENING]\n\nGround the reader in time and place. Establish whose story this is and what they want.' },
      { id: 'beat-2', type: 'linear', text: '[INCITING INCIDENT]\n\nSomething disturbs the equilibrium. The protagonist must respond.' },
      { id: 'beat-3', type: 'linear', text: '[ESCALATION]\n\nThe response makes things worse, or reveals depths the protagonist did not see. Stakes deepen.' },
      { id: 'beat-4', type: 'linear', text: '[CLIMAX]\n\nA decision is made (or refused). The story turns on this moment, even though the reader does not get to choose.' },
      { id: 'beat-5', type: 'linear', text: '[RESOLUTION]\n\nThe aftermath. Resist the urge to tie everything up neatly. Leave one image the reader will carry.' },
    ],
  },
  {
    id: 'mystery-box',
    name: 'The Mystery Box',
    description:
      'A short, contained interactive — single dilemma, two paths, designed for a tight 800-1200 word read.',
    suggestedGenre: 'Cyberpunk',
    suggestedTheme: 'Digital Rights',
    isInteractive: true,
    segments: [
      { id: 'context', type: 'linear', text: '[CONTEXT]\n\nQuickly establish: who is the protagonist, where are they, what is the box, and why does it matter? Move fast — this is a short read.' },
      {
        id: 'choice',
        type: 'interactive',
        text: '[OPEN OR LEAVE IT]\n\nPresent the reader with the binary. Make both options feel weighted.',
        choices: [
          { text: 'Open the box', nextSegmentId: 'open' },
          { text: 'Walk away', nextSegmentId: 'walk-away' },
        ],
      },
      { id: 'open', type: 'linear', text: '[OPENED]\n\nThe contents change everything. Show the consequence in one tight scene.', reflectionTrigger: false },
      { id: 'walk-away', type: 'linear', text: '[WALKED AWAY]\n\nThe protagonist refuses curiosity. Show what is preserved by the refusal, and what is lost.' },
      { id: 'aftermath', type: 'linear', text: '[AFTERMATH]\n\nA short final beat — both paths converge here. The protagonist reflects (in action, not narration) on the choice they made.' },
    ],
  },
];
