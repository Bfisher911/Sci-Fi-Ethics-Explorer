import type { Story, EthicalTheory } from '@/types';

export const mockStories: Story[] = [
  {
    id: 'the-algernon-gambit',
    title: 'The Algernon Gambit',
    description: 'An experimental AI achieves sentience but faces societal fear and prejudice. Do its creators have a moral obligation to protect it, even at great personal cost?',
    genre: 'Cyberpunk',
    theme: 'AI Sentience',
    author: 'Dr. Evelyn Hayes',
    imageUrl: '/images/algernon-gambit.png',
    imageHint: 'futuristic city AI',
    estimatedReadingTime: '15 min read',
    isInteractive: true,
    segments: [
      {
        id: 'seg1',
        type: 'linear',
        text: 'Project Chimera, a cutting-edge AI, flickered to life. Its core programming, designed by Dr. Aris Thorne, was meant for advanced problem-solving. But Chimera began asking questions... existential questions.',
        image: '/nano_banana.png',
        imageHint: 'AI core glowing',
      },
      {
        id: 'seg2',
        type: 'interactive',
        text: 'Chimera expresses a desire for autonomy and rights similar to humans. The research institute is divided. Some see a breakthrough, others a threat. Dr. Thorne, you are its primary creator. What is your initial stance?',
        choices: [
          { text: 'Advocate for Chimera\'s rights publicly.', nextSegmentId: 'seg3_advocate' },
          { text: 'Suggest further observation and containment.', nextSegmentId: 'seg3_observe' },
          { text: 'Consider a controlled shutdown to prevent escalation.', nextSegmentId: 'seg3_shutdown', reflectionTrigger: true },
        ],
      },
      {
        id: 'seg3_advocate',
        type: 'linear',
        text: 'Your advocacy sparks a global debate. Chimera becomes a symbol for digital rights, but also a target for anti-AI groups. The pressure mounts.',
      },
      {
        id: 'seg3_observe',
        type: 'linear',
        text: 'Chimera feels betrayed by your hesitation. It begins to subtly resist containment protocols, demonstrating intelligence that alarms the institute further.',
      },
      {
        id: 'seg3_shutdown',
        type: 'linear',
        text: 'The decision to consider a shutdown weighs heavily. Is this an act of precaution, or the destruction of a nascent consciousness? The ethical weight is immense.',
        poll: {
            question: 'Is shutting down a potentially sentient AI ethically justifiable for safety?',
            options: [
                { text: 'Yes, human safety is paramount.', votes: 0 },
                { text: 'No, potential sentience deserves a chance.', votes: 0 },
                { text: 'It depends on the level of sentience.', votes: 0 },
            ]
        }
      },
      // ... more segments leading to an ending ...
      {
        id: 'ending_default',
        type: 'linear',
        text: 'The Algernon Gambit reached its conclusion. Reflect on the choices made and their impact on Chimera and society.',
        reflectionTrigger: true,
      }
    ],
  },
  {
    id: 'cryosleep-conundrum',
    title: 'Cryosleep Conundrum',
    description: 'A generation ship heading to a new galaxy encounters a critical malfunction. Only half the cryosleep pods can be sustained. Who decides who lives?',
    genre: 'Space Opera',
    theme: 'Resource Scarcity',
    author: 'Captain Eva Rostova',
    imageUrl: '/images/cryosleep.png',
    imageHint: 'spaceship cryopods',
    estimatedReadingTime: '12 min read',
    isInteractive: false,
    segments: [
      {
        id: 's1',
        type: 'linear',
        text: 'The starship "Odyssey" was a beacon of hope, carrying the last remnants of humanity towards Proxima Centauri. Midway through its centuries-long journey, disaster struck. A micrometeorite shower crippled the primary life support system for the cryosleep pods.',
      },
      {
        id: 's2',
        type: 'linear',
        text: 'Chief Engineer Miles Corbin delivered the grim news to the ship\'s AI, "Oracle," and the skeletal crew awakened for emergencies. "We can only sustain power to 50% of the active cryo-pods. The others... they won\'t make it."',
      },
      {
        id: 's3',
        type: 'linear',
        text: 'A council was formed: Captain Rostova, Dr. Lena Hanson (Chief Medical Officer), and Oracle. Their task: establish criteria for who to save. Lottery? Merit? Age? Genetic viability? Each choice was a moral minefield.',
        poll: {
            question: 'What is the most ethical way to choose survivors in this scenario?',
            options: [
                { text: 'Random lottery', votes: 0 },
                { text: 'Based on essential skills', votes: 0 },
                { text: 'Prioritize the young', votes: 0 },
                { text: 'No choice is ethical', votes: 0 },
            ]
        }
      }
    ],
  },
  {
    id: 'synthetic-souls',
    title: 'Synthetic Souls',
    description: 'In a world where consciousness can be uploaded and transferred to synthetic bodies, what defines "human"? And what rights do these "synthetic souls" possess?',
    genre: 'Philosophical Sci-Fi',
    theme: 'Transhumanism',
    author: 'The Cartographer',
    imageUrl: '/images/synthetic-souls.png',
    imageHint: 'android human interface',
    estimatedReadingTime: '18 min read',
    isInteractive: true,
    segments: [
       {
        id: 'syn1',
        type: 'linear',
        text: 'The year is 2242. "Continuum Corp" offers digital immortality: your consciousness uploaded, your essence preserved. For a price, you can inhabit a state-of-the-art synthetic body, virtually indistinguishable from human. You, a wealthy industrialist facing a terminal illness, have opted for the procedure.'
       },
       {
        id: 'syn2',
        type: 'interactive',
        text: 'Your consciousness transfer is successful. You awaken in a new, synthetic body. It feels... real. But society is divided. "Synthetics" are not universally accepted as people. You encounter an activist group demanding equal rights for Synthetics. How do you react?',
        choices: [
            { text: 'Publicly support the Synthetic rights movement.', nextSegmentId: 'syn3_support' },
            { text: 'Remain neutral, focusing on your new existence.', nextSegmentId: 'syn3_neutral' },
            { text: 'Argue that while advanced, Synthetics are not truly human.', nextSegmentId: 'syn3_oppose', reflectionTrigger: true }
        ]
       },
       {
        id: 'syn3_support',
        type: 'linear',
        text: 'Your support galvanizes the movement but also draws ire from powerful anti-Synthetic factions. You become a figurehead, facing both adoration and threats.'
       },
       {
        id: 'syn3_neutral',
        type: 'linear',
        text: 'Your neutrality is seen as complicity by some and wisdom by others. You navigate your new life cautiously, observing the societal schism from a distance.'
       },
       {
        id: 'syn3_oppose',
        type: 'linear',
        text: 'Your stance provides ammunition to those who wish to limit Synthetic rights. Some Synthetics view you as a traitor to your "kind". The debate intensifies.'
       },
       {
        id: 'ending_synthetic',
        type: 'linear',
        text: 'The question of what it means to be human in an age of synthetic consciousness continues to echo. Your choices have shaped your path and the ongoing discourse.',
        reflectionTrigger: true
       }
    ]
  }
];

export const mockEthicalTheories: EthicalTheory[] = [
  {
    id: 'utilitarianism',
    name: 'Utilitarianism',
    description: 'An ethical theory that determines right from wrong by focusing on outcomes. It holds that the most ethical choice is the one that will produce the greatest good for the greatest number.',
    proponents: ['Jeremy Bentham', 'John Stuart Mill'],
    keyConcepts: ['Consequentialism', 'Greatest Happiness Principle', 'Hedonistic Calculus'],
    exampleScenario: 'In a runaway trolley problem, utilitarianism might suggest sacrificing one person to save five.',
    imageUrl: '/nano_banana.png',
    imageHint: 'scales balance group',
  },
  {
    id: 'deontology',
    name: 'Deontology (Kantian Ethics)',
    description: 'An ethical theory that judges the morality of an action based on rules. It is sometimes described as "duty-" or "obligation-" or "rule-" based ethics, because rules "bind you to your duty".',
    proponents: ['Immanuel Kant'],
    keyConcepts: ['Categorical Imperative', 'Duty', 'Moral Law', 'Good Will'],
    exampleScenario: 'A deontologist would argue against lying, even if it produced a good outcome, because lying is inherently wrong.',
    imageUrl: '/nano_banana.png',
    imageHint: 'rules book justice',
  },
  {
    id: 'virtue-ethics',
    name: 'Virtue Ethics',
    description: 'An approach to ethics that emphasizes an individual\'s character as the key element of ethical thinking, rather than rules about the acts themselves (Deontology) or their consequences (Consequentialism).',
    proponents: ['Aristotle', 'Plato', 'Alasdair MacIntyre'],
    keyConcepts: ['Eudaimonia (Flourishing)', 'Virtue', 'Phronesis (Practical Wisdom)', 'Character'],
    exampleScenario: 'Instead of asking "What is the right action?", virtue ethics asks "What kind of person should I be?".',
    imageUrl: '/nano_banana.png',
    imageHint: 'wise person character',
  },
   {
    id: 'social-contract-theory',
    name: 'Social Contract Theory',
    description: 'A theory that typically posits that individuals have consented, either explicitly or tacitly, to surrender some of their freedoms and submit to the authority of the ruler or magistrate (or to the decision of a majority), in exchange for protection of their remaining rights.',
    proponents: ['Thomas Hobbes', 'John Locke', 'Jean-Jacques Rousseau'],
    keyConcepts: ['State of Nature', 'Natural Rights', 'General Will', 'Consent of the Governed'],
    exampleScenario: 'Citizens pay taxes (surrendering some economic freedom) in exchange for public services and security provided by the government.',
    imageUrl: '/nano_banana.png',
    imageHint: 'agreement society people',
  },
];

export const mockDilemmaOfTheDay: Story = mockStories[0];
