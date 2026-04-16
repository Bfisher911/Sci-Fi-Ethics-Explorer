import type { Quiz } from '@/types';

/**
 * Hand-authored comprehension quizzes for each ethical theory in the
 * glossary. Mirrors the pattern established by
 * `src/data/scifi-author-quizzes.ts` — static `Quiz` objects served as
 * the fallback from `getQuizForSubject('theory', id)` when no Firestore
 * record exists.
 *
 * Canonical doc id = `theory-<theoryId>` to match the quizzes
 * collection convention used elsewhere on the platform.
 *
 * Every one of the 18 theories in `src/data/ethical-theories.ts` has a
 * quiz here. If you add a new theory to that file, add a matching
 * entry below.
 */

type QuizQuestionSpec = {
  prompt: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'recall' | 'conceptual' | 'applied';
};

function buildQuiz(
  theoryId: string,
  subjectName: string,
  title: string,
  description: string,
  questions: QuizQuestionSpec[]
): Quiz {
  const quizId = `theory-${theoryId}`;
  return {
    id: quizId,
    subjectType: 'theory',
    subjectId: theoryId,
    subjectName,
    title,
    description,
    questions: questions.map((q, i) => ({
      id: `${quizId}-q${i + 1}`,
      prompt: q.prompt,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
    })),
    estimatedMinutes: 6,
    passingScorePercent: 70,
    createdAt: new Date(0),
  };
}

export const ethicalTheoryQuizzes: Quiz[] = [
  buildQuiz(
    'utilitarianism',
    'Utilitarianism',
    'Utilitarianism: Consequences and the Greatest Good',
    'Five questions on how utilitarians weigh outcomes, and on the problems the view raises for modern technology.',
    [
      {
        prompt:
          "According to utilitarianism, an action is right to the degree that it:",
        options: [
          'Conforms to a universal moral law regardless of consequences',
          'Produces the greatest overall well-being for those affected',
          'Reflects the agent\'s character and virtues',
          'Satisfies the divine commands given to humanity',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Utilitarianism is a form of consequentialism: the moral value of an act is fixed by how much well-being (happiness, preference satisfaction, welfare) it produces, aggregated across everyone affected.',
        difficulty: 'recall',
      },
      {
        prompt:
          "Mill's distinction between \"higher\" and \"lower\" pleasures was meant to address which objection to Bentham?",
        options: [
          "That utilitarianism ignores duties to oneself",
          "That a theory built on pleasure reduces human life to the level of mere sensation",
          'That Bentham was insufficiently religious',
          "That utility can't be quantified at all",
        ],
        correctAnswerIndex: 1,
        explanation:
          'Critics said Bentham\'s "pig philosophy" equated poetry with pushpin. Mill introduced qualitative differences — the pleasures of the competent judge — to preserve the rich texture of a worthwhile human life inside a utilitarian framework.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'An autonomous vehicle is programmed to maximize expected total survival across all road users in a crash. This is most directly an application of:',
        options: [
          'Virtue ethics',
          'Deontological rule-following',
          'Act utilitarianism',
          'Divine command theory',
        ],
        correctAnswerIndex: 2,
        explanation:
          'The design treats each individual crash as its own decision point and optimizes the outcome. That is act utilitarianism in code.',
        difficulty: 'applied',
      },
      {
        prompt:
          "A central objection to utilitarianism is the \"separateness of persons\" — the charge that:",
        options: [
          'Utilitarian reasoning is too demanding for ordinary agents',
          'Aggregating welfare across people treats them as mere sites where utility occurs, ignoring the fact that benefits and burdens fall on distinct lives',
          "Utilitarians wrongly believe pleasure is the only intrinsic good",
          "The math of utilitarianism is too hard to compute",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Rawls and others argue that summing welfare across persons lets large gains for the many justify serious losses for the few — ignoring that no one actually experiences the aggregate.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Rule utilitarianism differs from act utilitarianism primarily in that it:',
        options: [
          'Rejects consequentialism altogether',
          'Evaluates whole policies or rules by their expected utility, rather than evaluating each individual act',
          'Requires belief in an afterlife',
          "Insists that only the agent's pleasure counts",
        ],
        correctAnswerIndex: 1,
        explanation:
          'Rule utilitarianism asks which rule, if generally followed, would produce the best outcomes — and then says to follow that rule even when a one-off deviation might seem to produce more utility in the moment.',
        difficulty: 'conceptual',
      },
    ]
  ),

  buildQuiz(
    'deontology',
    'Deontology (Kantian Ethics)',
    'Deontology: Duty, Dignity, and the Categorical Imperative',
    'Five questions on Kantian ethics and the deontological tradition.',
    [
      {
        prompt: "Kant's Categorical Imperative, in its first formulation, tells us to:",
        options: [
          "Act only on maxims you could will to become a universal law",
          'Maximize happiness across everyone affected',
          "Cultivate the virtues appropriate to your role in society",
          'Obey the commands of God without question',
        ],
        correctAnswerIndex: 0,
        explanation:
          "The Formula of Universal Law tests whether the principle behind your action could be adopted by everyone without contradiction. It is the Categorical Imperative's most famous formulation.",
        difficulty: 'recall',
      },
      {
        prompt: "The \"Humanity\" formulation of the Categorical Imperative forbids:",
        options: [
          'Using any technology that could cause harm',
          'Treating rational beings merely as means to your own ends',
          'Lying under any circumstances, even about the weather',
          "Enjoying anything that gives you pleasure",
        ],
        correctAnswerIndex: 1,
        explanation:
          'The formulation commands us to treat humanity — in ourselves and others — always also as an end, never merely as a means. It is the deontological core of consent, dignity, and respect for persons.',
        difficulty: 'conceptual',
      },
      {
        prompt: "Deontologists typically reject utilitarian trade-offs because:",
        options: [
          'They think consequences are unknowable',
          "They believe some actions are wrong in themselves, regardless of how much good they produce",
          'They reject the idea of moral rules',
          "They think only God's commands matter",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Deontology identifies certain constraints — don't lie, don't use persons merely as means, respect rights — as binding even when violating them would produce more overall good.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          "W. D. Ross proposed \"prima facie duties\" to address which weakness in Kant?",
        options: [
          'Kant was too focused on consequences',
          "Kant's absolutism left no room for genuine moral conflict between duties",
          'Kant rejected the possibility of lying',
          'Kant was indifferent to friendship',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Ross's list of prima facie duties (fidelity, reparation, gratitude, non-maleficence, etc.) acknowledges that duties can conflict and that moral judgment requires weighing them in context.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          "A company builds a persuasive-design system that subtly manipulates users into habits they would not endorse if informed. Which Kantian concept most directly condemns this?",
        options: [
          'The Greatest Happiness Principle',
          'Eudaimonia',
          'Treating persons merely as means, bypassing their rational consent',
          'The Golden Mean',
        ],
        correctAnswerIndex: 2,
        explanation:
          "Manipulation works precisely by routing around a person's capacity for rational deliberation. On Kant's view, that fails to respect the user as an autonomous end-in-themselves.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'virtue-ethics',
    'Virtue Ethics',
    'Virtue Ethics: Character, Flourishing, and Practical Wisdom',
    'Five questions on Aristotle and the virtue tradition.',
    [
      {
        prompt: "For Aristotle, eudaimonia is best translated as:",
        options: [
          'Happiness understood as pleasant feeling',
          'Flourishing — a well-lived human life over time',
          'Duty perfectly performed',
          'Obedience to God',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Eudaimonia names a flourishing life as a whole, not a passing mood. It depends on the active exercise of the virtues in accord with reason.',
        difficulty: 'recall',
      },
      {
        prompt: "The \"Golden Mean\" describes virtue as:",
        options: [
          'A perfect balance scale',
          'A midpoint, relative to us, between an excess and a deficiency',
          'The average of community opinion',
          'A universal command',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Virtue lies between extremes. Courage, for instance, is between cowardice and recklessness — and where that midpoint falls depends on the situation and the person.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Phronesis (practical wisdom) is the virtue that:",
        options: [
          'Chooses the right action in particular circumstances',
          'Memorizes moral rules',
          'Calculates maximum utility',
          'Obeys divine commands',
        ],
        correctAnswerIndex: 0,
        explanation:
          "Phronesis is the reasoning capacity that perceives what a given situation calls for. Rules and theories help, but phronesis is the judgment that applies them wisely.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Which sci-fi example best illustrates a virtue-ethical concern about technology?",
        options: [
          'A maxim that could be universalized',
          'A product that makes courage, patience, and honesty harder to cultivate over time',
          'A policy whose utility calculations are suspect',
          'A system that violates divine commands',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Virtue ethics asks what kinds of people our tools make us. A social feed optimized for outrage corrodes patience and fairness whether or not any single interaction was 'wrong'.",
        difficulty: 'applied',
      },
      {
        prompt: "Anscombe's famous 1958 essay argued that:",
        options: [
          'Ethics should abandon talk of obligation unless it re-grounds itself in a philosophy of human nature and flourishing',
          'Modern deontology is superior to ancient virtue theory',
          "Utilitarianism solves all ethical puzzles",
          'Ethics is nothing more than emotive expression',
        ],
        correctAnswerIndex: 0,
        explanation:
          "Elizabeth Anscombe's \"Modern Moral Philosophy\" helped revive virtue ethics by arguing that Enlightenment duty-talk had lost its moorings and ethics needed to return to character and human flourishing.",
        difficulty: 'recall',
      },
    ]
  ),

  buildQuiz(
    'social-contract-theory',
    'Social Contract Theory',
    'Social Contract Theory: Consent, Legitimacy, and the State',
    'Five questions on Hobbes, Locke, Rousseau, Rawls, and the social contract tradition.',
    [
      {
        prompt: "For Hobbes, life in the state of nature would be:",
        options: [
          'A peaceable community of equals',
          'Solitary, poor, nasty, brutish, and short',
          'A perfect expression of natural virtue',
          'Guided by unanimous divine revelation',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Hobbes argued that without a common power to keep people in awe, rational self-interest alone would produce a war of all against all. The social contract exists to escape that condition.",
        difficulty: 'recall',
      },
      {
        prompt: "Locke differs most sharply from Hobbes in holding that:",
        options: [
          'The state of nature is a state of total war',
          'Individuals have natural rights — to life, liberty, and property — that precede and constrain the government',
          'Government legitimacy rests only on divine right',
          'No social contract is ever valid',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Locke's state of nature is inconvenient but not hellish. His contract is conditional: governments that violate natural rights forfeit their legitimacy.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Rawls's \"original position\" is a thought experiment designed to:",
        options: [
          "Maximize aggregate utility",
          "Model a fair procedure by stripping parties of knowledge about their own social position behind a veil of ignorance",
          'Reveal the dictates of God',
          "Identify the Golden Mean",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Rawls asks what principles of justice rational people would choose if they didn't know their own class, race, gender, or talents. The veil forces impartiality into the procedure.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Which feature of a user EULA is most in tension with classical social-contract theory?',
        options: [
          'It is written in English',
          "It is a take-it-or-leave-it offer with vast informational asymmetry, undermining meaningful consent",
          'It requires account creation',
          'It grants refund rights',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Consent is the moral engine of the contract tradition. Sixty-page EULAs that no one reads approximate the form of consent without its substance.',
        difficulty: 'applied',
      },
      {
        prompt: 'Carole Pateman\'s "sexual contract" critique argued that:',
        options: [
          'Classical contract theory is entirely unsalvageable',
          "Canonical social contracts presupposed a prior, unexamined contract subordinating women — so the gendered structure of political life is part of the original story, not an accident",
          'Women should sign their own contracts',
          'Social contracts are purely economic',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Pateman argued that the founding social contract implicitly rested on a sexual contract that distributed patriarchal authority before the political contract was even drawn up.',
        difficulty: 'conceptual',
      },
    ]
  ),

  buildQuiz(
    'ethics-of-care',
    'Ethics of Care',
    'Ethics of Care: Relationships, Responsibility, and Dependency',
    'Five questions on care ethics and its challenge to impartialist traditions.',
    [
      {
        prompt: 'The ethics of care emerged most directly from:',
        options: [
          "Scholastic debates about divine command",
          "Carol Gilligan's research showing a relational voice underrepresented in dominant moral psychology",
          'Hobbes\'s political philosophy',
          'Utilitarian welfare economics',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Gilligan's \"In a Different Voice\" (1982) argued that a relational, care-oriented mode of moral reasoning had been systematically devalued by frameworks centered on abstract rights and principles.",
        difficulty: 'recall',
      },
      {
        prompt:
          "Nel Noddings's care ethics places the center of moral life in:",
        options: [
          'Universal rules applying equally to strangers and intimates',
          'The particular caring relation between the one-caring and the cared-for',
          'Aggregate social welfare',
          "God's commands",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Noddings grounds ethics in the concrete caring relation. Responsibilities extend outward from there, but abstraction is secondary to the relational encounter.",
        difficulty: 'conceptual',
      },
      {
        prompt: "A key care-ethical critique of impartialist theories is that they:",
        options: [
          'Are insufficiently rigorous',
          "Treat dependency and relational obligations as exceptions to be minimized, rather than central features of moral life",
          'Require too much math',
          "Ignore God",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Care theorists argue that every person begins life dependent and ends it dependent. Any ethics that idealizes the self-sufficient, equal contractor misdescribes how moral life actually works.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          "Joan Tronto identifies four phases of care. Which is NOT on her list?",
        options: [
          'Attentiveness',
          'Responsibility',
          'Competence',
          'Maximization',
        ],
        correctAnswerIndex: 3,
        explanation:
          "Tronto's phases are caring about (attentiveness), caring for (responsibility), caregiving (competence), and care-receiving (responsiveness). \"Maximization\" is utilitarian vocabulary.",
        difficulty: 'recall',
      },
      {
        prompt:
          "You are designing an AI eldercare companion. A care-ethics lens most directly asks you to:",
        options: [
          'Maximize total user-minutes of engagement',
          "Consider how the system supports or replaces the caring relations in which recipients are already embedded — and what honest presence means in that context",
          'Ensure every interaction is a provable duty',
          'Obey its divine commands',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Care ethics foregrounds the relational texture of caregiving — responsiveness, competence, vulnerability, the risk of simulated intimacy. Metric-first design misses the thing itself.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'contractualism',
    'Contractualism',
    'Contractualism: Principles No One Could Reasonably Reject',
    'Five questions on Scanlon\'s contractualism and its tradition.',
    [
      {
        prompt:
          "Scanlon's core contractualist criterion holds that an act is wrong if it violates principles that:",
        options: [
          'Produce less than maximum utility',
          "No one could reasonably reject as the basis for general, informed, unforced agreement",
          'Violate divine commands',
          'Require more virtue than most people possess',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Scanlon relocates moral justification: the test is whether reasonable, informed people could each reject a given principle for general regulation of behavior.',
        difficulty: 'recall',
      },
      {
        prompt: "Contractualism differs from utilitarianism most importantly in that it:",
        options: [
          'Rejects consequences entirely',
          "Evaluates principles against each individual's reasons for rejecting them, not against the aggregate welfare of everyone at once",
          "Privileges the agent's character",
          'Grounds morality in God',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Scanlon's \"individualist restriction\" forbids trading large losses to one person against small gains spread across many. Each claim is considered one person at a time.",
        difficulty: 'conceptual',
      },
      {
        prompt: 'The "reasonable rejection" test explicitly rules out:',
        options: [
          'All disagreement',
          'Selfish or partial objections that ignore the legitimate interests of others',
          'Consideration of consequences',
          'The possibility of binding moral principles',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Rejection must be reasonable — grounded in generic reasons that others could in principle recognize as legitimate, not in bare preference or advantage-seeking.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          "A contractualist evaluating a privacy-preserving design feature would ask:",
        options: [
          'Does it maximize total user happiness?',
          "Is there a principle allowing this data practice that no affected party could reasonably reject?",
          "Does it expand the agent's virtues?",
          "Is it commanded by God?",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Contractualism forces designers to imagine the strongest legitimate objection from any affected individual — and to justify the principle in those terms.",
        difficulty: 'applied',
      },
      {
        prompt: "Derek Parfit\'s \"triple theory\" famously argued that:",
        options: [
          'Kantian, contractualist, and rule-consequentialist principles converge on the same outer boundaries of morality',
          'Contractualism refutes consequentialism',
          'Ethics has no stable foundation',
          'Morality is only about divine will',
        ],
        correctAnswerIndex: 0,
        explanation:
          'In "On What Matters," Parfit argued that the strongest versions of Kant, Scanlon, and rule consequentialism converge — "climbing the same mountain on different sides."',
        difficulty: 'conceptual',
      },
    ]
  ),

  buildQuiz(
    'capabilities-approach',
    'Capabilities Approach',
    'Capabilities Approach: Substantive Freedom and Human Development',
    'Five questions on Sen, Nussbaum, and the capabilities framework.',
    [
      {
        prompt: 'The capabilities approach evaluates human well-being primarily in terms of:',
        options: [
          'Resources held',
          "What a person is actually able to do and to be",
          'Aggregate utility',
          'Virtue scores',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Sen and Nussbaum argue that resources matter only instrumentally. What really counts is substantive freedom — the real opportunities a person has to live a recognizably human life.',
        difficulty: 'recall',
      },
      {
        prompt: 'The distinction between capabilities and functionings is:',
        options: [
          'A difference between math and logic',
          "Capabilities are real opportunities; functionings are the actual doings and beings a person has realized",
          "A technical term for pleasure",
          "The same as the rule/act distinction in utilitarianism",
        ],
        correctAnswerIndex: 1,
        explanation:
          'A functioning is what a person is or does (being well-nourished, traveling safely). A capability is the substantive freedom to achieve valued functionings — including the option not to.',
        difficulty: 'conceptual',
      },
      {
        prompt: "\"Conversion factors\" refer to:",
        options: [
          "How efficiently a person transforms resources into real opportunities — shaped by their body, social context, and environment",
          'The exchange rate between currencies',
          'The conversion of ideas into actions',
          'Pleasure into money',
        ],
        correctAnswerIndex: 0,
        explanation:
          'A wheelchair user and a non-disabled user converting the same \"resource\" (a flight of stairs) into the capability of mobility face radically different conversion factors. That matters for justice.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Nussbaum\'s central list of capabilities is meant to:',
        options: [
          'Replace all other ethical theories',
          "Provide a politically usable minimum threshold below which a life fails to be fully human",
          "Maximize utility across nations",
          'Describe divine law',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Nussbaum offers ten central capabilities (life, bodily health, affiliation, practical reason, and so on) as a cross-cultural basis for constitutional guarantees and development policy.',
        difficulty: 'recall',
      },
      {
        prompt:
          "\"Adaptive preferences\" is the problem where:",
        options: [
          "People's reported preferences underestimate what they would want under fairer conditions, because they have adapted to injustice or deprivation",
          'Preferences shift over a lifetime',
          "Users can't change their settings",
          'Preferences are always rational',
        ],
        correctAnswerIndex: 0,
        explanation:
          "Sen and Nussbaum both emphasize that satisfaction scores can normalize oppression. The capabilities framework asks not what people settle for, but what they are genuinely free to pursue.",
        difficulty: 'conceptual',
      },
    ]
  ),

  buildQuiz(
    'ubuntu-ethics',
    'Ubuntu Ethics',
    'Ubuntu Ethics: Personhood Through Others',
    'Five questions on Ubuntu as an African moral tradition.',
    [
      {
        prompt: 'The phrase "umuntu ngumuntu ngabantu" translates roughly to:',
        options: [
          'Each person stands alone',
          'A person is a person through other persons',
          'God is the measure of all things',
          'The greatest happiness for the greatest number',
        ],
        correctAnswerIndex: 1,
        explanation:
          'This Zulu/Xhosa saying captures Ubuntu\'s relational ontology: selfhood is constituted by recognition in and by a human community.',
        difficulty: 'recall',
      },
      {
        prompt: 'Ubuntu ethics places central moral weight on:',
        options: [
          'Radical individual autonomy',
          'Relational personhood, communal harmony, and mutual responsibility',
          'The divine command tradition',
          'Act-by-act utility calculation',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Personhood is not a solitary achievement but a communal one. Moral life is lived with and for others — solidarity, hospitality, and restorative justice are central.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Ubuntu\'s characteristic approach to wrongdoing tends toward:',
        options: [
          'Retributive punishment',
          'Restorative justice — repairing relationships torn by harm',
          'Lifetime banishment',
          'No response at all',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Ubuntu-inspired processes, visible in South Africa\'s Truth and Reconciliation Commission, seek to restore the community disrupted by harm rather than inflict proportional suffering.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Thaddeus Metz has argued that Ubuntu grounds moral obligations in:',
        options: [
          "The capacity for pleasure",
          "A relational good — identifying with others and exhibiting solidarity with them",
          'Sovereign command',
          'Kant\'s categorical imperative',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Metz's reconstruction offers Ubuntu as a distinctive moral theory: right action promotes community, understood as shared identity and solidarity.",
        difficulty: 'recall',
      },
      {
        prompt:
          'An Ubuntu-inspired critique of a purely individualist data privacy framework would note that:',
        options: [
          'Privacy harms are felt only by isolated atomic selves',
          "A person's data is always entangled with family, ancestors, and community — and frameworks that treat it as purely individual miss the relational harms",
          "Ubuntu ethics has no view about data",
          'Only utilitarians care about privacy',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Genetic data, speech patterns, and social graphs implicate communities, not just individuals. Ubuntu foregrounds that relational texture.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'natural-law',
    'Natural Law Theory',
    'Natural Law: Basic Goods and Practical Reason',
    'Five questions on natural law ethics from Aquinas to Finnis.',
    [
      {
        prompt: "Natural law theory holds that moral norms can be derived from:",
        options: [
          'The will of a sovereign',
          "Features of human nature and the goods toward which it is oriented",
          "Aggregate welfare calculations",
          'Arbitrary social convention',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Natural law reasons from a substantive account of human flourishing — the goods that constitute a genuinely human life — to norms that protect and promote those goods.',
        difficulty: 'recall',
      },
      {
        prompt: "For Aquinas, the first principle of practical reason is:",
        options: [
          "\"Do good and avoid evil.\"",
          "\"Maximize pleasure.\"",
          "\"Obey every divine command.\"",
          "\"Follow the law of the land.\"",
        ],
        correctAnswerIndex: 0,
        explanation:
          "Aquinas takes this as the self-evident starting point: as reason perceives something as a human good, it perceives it as something to be pursued.",
        difficulty: 'recall',
      },
      {
        prompt: "John Finnis\'s \"new natural law\" identifies several basic goods. An example is:",
        options: [
          'Wealth',
          "Knowledge",
          'Social status',
          "Victory over enemies",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Finnis lists goods such as life, knowledge, play, aesthetic experience, sociability, practical reasonableness, and religion as incommensurable and intrinsic aspects of human flourishing.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Natural law and divine command can be distinguished because:",
        options: [
          'They are identical traditions',
          "Natural law insists that moral norms are grounded in rationally discernible human nature, independent of any particular revelation",
          "Natural law rejects all religion",
          "Divine command ignores duties",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Classical natural law thinkers hold that reason can in principle discern moral truths without revelation, even if revelation confirms and extends them.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          "A critic charges natural law theory with the \"naturalistic fallacy.\" The charge is that:",
        options: [
          'It relies too much on surveys',
          "Moving from what is natural to what is morally required is illegitimate without further argument",
          "It ignores biology entirely",
          'It\'s too math-heavy',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Hume's is/ought gap and Moore's naturalistic fallacy both press natural law to show how descriptive facts about human nature generate normative conclusions.",
        difficulty: 'conceptual',
      },
    ]
  ),

  buildQuiz(
    'stoicism',
    'Stoicism',
    'Stoicism: Virtue, Logos, and the Dichotomy of Control',
    'Five questions on ancient and modern Stoic ethics.',
    [
      {
        prompt: 'The Stoic "dichotomy of control" distinguishes between:',
        options: [
          'Pleasure and pain',
          "What is up to us (judgment, intention, response) and what is not (external events, health, reputation)",
          'God and the world',
          'Rules and outcomes',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Epictetus\' Enchiridion opens with this dichotomy: tranquility comes from attending scrupulously to what is genuinely up to us and accepting the rest with equanimity.',
        difficulty: 'recall',
      },
      {
        prompt: "Stoic ethics holds that the only true good is:",
        options: [
          "Virtue (a well-functioning rational soul)",
          'Pleasure',
          'Wealth',
          'Social approval',
        ],
        correctAnswerIndex: 0,
        explanation:
          "Everything else — health, reputation, money — is at best a \"preferred indifferent.\" Only virtue is good without qualification, because only virtue is fully within our power.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Stoic cosmopolitanism holds that:',
        options: [
          "Nation and tribe are the bedrock of moral identity",
          "All rational beings are fellow-citizens of a single world-community governed by the logos",
          'Only Greeks can be wise',
          'The self has no moral standing',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Marcus Aurelius and Hierocles drew the circles of concern outward from the self to family to city to all humanity. That "citizen of the world" posture is the root of later cosmopolitan ethics.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Stoic apatheia refers to:',
        options: [
          'Indifference to others',
          "Freedom from destructive passions — not the absence of feeling, but the regulation of emotion by reason",
          'Laziness',
          'Disregarding duty',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Apatheia does not mean being unfeeling. It means not being enslaved by passions that override judgment. Stoics cultivate \"eupatheiai\" (good, rational affects) in their place.',
        difficulty: 'recall',
      },
      {
        prompt: 'A Stoic responding to algorithmic amplification of outrage would most likely:',
        options: [
          'Embrace outrage as useful fuel',
          "Focus on what is up to them — their own judgment, attention, and response — while seeking platform designs that don't exploit the passions",
          "Call for the platform's destruction",
          "Ignore the technology entirely",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Classic Stoic counsel: your rational response is yours to govern. But Stoics also recognized that social structures shape character formation, so they cared about the environments that make virtue easier or harder.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'divine-command',
    'Divine Command Theory',
    'Divine Command Theory and the Euthyphro Dilemma',
    'Five questions on ethics grounded in God\'s commands.',
    [
      {
        prompt: 'Divine command theory holds that an action is morally right because:',
        options: [
          "It maximizes utility",
          "It is commanded (or willed) by God",
          'It expresses virtue',
          "It could be universalized",
        ],
        correctAnswerIndex: 1,
        explanation:
          'On strong versions of DCT, divine command is not merely one source of moral knowledge but the very ground of moral obligation itself.',
        difficulty: 'recall',
      },
      {
        prompt: "Plato\'s Euthyphro dilemma asks:",
        options: [
          'Is virtue teachable?',
          "Is something good because God commands it, or does God command it because it is good?",
          'What is the meaning of courage?',
          "Are the Forms eternal?",
        ],
        correctAnswerIndex: 1,
        explanation:
          "The dilemma is the classic challenge to divine command theory. Each horn — arbitrariness or external standard — has been debated for more than two millennia.",
        difficulty: 'recall',
      },
      {
        prompt: "The \"arbitrariness horn\" of the Euthyphro dilemma worries that:",
        options: [
          "If God's commands constitute the good, then God could have commanded cruelty and it would have been good — which seems absurd",
          "God would be bound by an external moral law",
          'Ethics would become impossible',
          'People would stop praying',
        ],
        correctAnswerIndex: 0,
        explanation:
          "Pure DCT seems to make morality arbitrary: there is no reason why kindness is good beyond a contingent divine decision that could, in principle, have gone otherwise.",
        difficulty: 'conceptual',
      },
      {
        prompt: 'Robert Adams\' "modified divine command theory" responds by:',
        options: [
          "Abandoning theism",
          "Grounding morality in the commands of a specifically loving God, so that commands to cruelty are ruled out by God's nature, not by an external standard",
          "Rejecting the Euthyphro dilemma outright",
          "Replacing God with the community",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Adams argues that God\'s nature is essentially loving. Moral obligations derive from the commands of such a being — so cruelty isn't just uncommanded; it is un-commandable.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          "A system engineer reading the Euthyphro dilemma about their AI rulebook should most directly ask:",
        options: [
          "How fast does the rule engine run?",
          "Is this rule good simply because our system enforces it, or does the system enforce it because it is good — and which answer do we want to stand behind?",
          "Does it compress well?",
          'Can users jailbreak it?',
        ],
        correctAnswerIndex: 1,
        explanation:
          "The structural question transfers: when we move moral authority into a system, we inherit the same fork. Either the rules are arbitrary fiat, or they answer to a deeper moral reality the system is trying to track.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'existentialist-ethics',
    'Existentialist Ethics',
    'Existentialist Ethics: Freedom, Authenticity, and Ambiguity',
    'Five questions on existentialist moral thought.',
    [
      {
        prompt: "Sartre\'s claim \"existence precedes essence\" means that:",
        options: [
          "Human beings have no essential nature fixed in advance; we create ourselves through our choices",
          "The universe existed before meaning",
          'God exists before creation',
          'Minds precede bodies',
        ],
        correctAnswerIndex: 0,
        explanation:
          "Unlike paper knives or hammers, humans have no prior essence that determines what they are. We define ourselves through the choices we actually make — and are therefore radically responsible.",
        difficulty: 'recall',
      },
      {
        prompt: 'Sartrean "bad faith" is:',
        options: [
          'Lying about other people',
          "Self-deception about one\'s freedom — pretending to be a fixed role rather than owning one\'s open-ended choices",
          'Refusing to believe in God',
          'Breaking a promise',
        ],
        correctAnswerIndex: 1,
        explanation:
          "A waiter playing too perfectly at being \"a waiter\" hides from the fact that they are a free being choosing this role. Bad faith is the flight from that freedom.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Beauvoir\'s \"ethics of ambiguity\" argues that:",
        options: [
          "We must freely choose in the face of the fact that we are both subjects (free) and objects (embedded, limited)",
          "Ethics is impossible",
          'Only women can be ethical',
          'Rules are always clear',
        ],
        correctAnswerIndex: 0,
        explanation:
          "Beauvoir takes the ambiguity of being-free-but-situated as the condition of ethics, not an obstacle to it. Genuine freedom requires willing the freedom of others too.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Kierkegaard\'s \"teleological suspension of the ethical\" treats ethics:",
        options: [
          'As identical to religion',
          "As something that can, in extreme cases, be outranked by a higher religious command — a fraught idea illustrated by Abraham and Isaac",
          'As merely customary',
          'As identical to utilitarian calculation',
        ],
        correctAnswerIndex: 1,
        explanation:
          "In Fear and Trembling, Kierkegaard confronts the horror that religious commitment might demand what ethics forbids. He neither endorses nor refutes it — he forces the reader to sit with it.",
        difficulty: 'recall',
      },
      {
        prompt: 'A designer taking existentialist ethics seriously when shipping a recommender would:',
        options: [
          "Assume users' preferences are fixed and just deliver more of the same",
          "Design for the user as a self-authoring agent, wary of patterns that lock them into roles they did not choose",
          'Maximize engagement metrics',
          'Delegate all decisions to the algorithm',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Existentialist ethics cares about systems that either support or subvert human self-authorship. Predictive personalization that collapses a person into their past behaviors is ethically suspect.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'discourse-ethics',
    'Discourse Ethics',
    'Discourse Ethics: Communication, Legitimacy, and Reason',
    'Five questions on Habermas and the discourse tradition.',
    [
      {
        prompt: "Habermas\'s discourse ethics grounds moral legitimacy in:",
        options: [
          "What a sovereign commands",
          "Principles that could be agreed to by all affected parties in an ideal speech situation free of coercion",
          'Aggregate utility',
          'The virtues of the ruler',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Discourse ethics is a proceduralist theory: moral norms are valid only to the extent they could meet with the reasoned assent of everyone concerned under conditions of genuine communicative freedom.',
        difficulty: 'recall',
      },
      {
        prompt: 'The "ideal speech situation" is:',
        options: [
          'A real-world legislature',
          "A regulative ideal in which all competent speakers can raise any relevant point, and only the force of the better argument prevails",
          'A courtroom',
          'A town hall meeting',
        ],
        correctAnswerIndex: 1,
        explanation:
          'It is counterfactual — never fully realized — but operative as a standard for critiquing real discourses distorted by power, manipulation, or exclusion.',
        difficulty: 'conceptual',
      },
      {
        prompt: "Habermas distinguishes communicative from strategic action on the basis of whether:",
        options: [
          'The speakers are friendly',
          "Speakers aim at mutual understanding vs. aim at influencing others to achieve one\'s own ends",
          'The topic is political',
          "The message is true",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Communicative action is oriented to reaching agreement. Strategic action treats interlocutors as means. Many political pathologies arise when strategic action hides behind communicative form.",
        difficulty: 'conceptual',
      },
      {
        prompt: 'The "colonization of the lifeworld" refers to:',
        options: [
          "Space settlement",
          "The encroachment of money and administrative power into domains (family, education, civic life) that should be coordinated through communication and mutual understanding",
          'A colonial empire',
          "A metaphor for friendship",
        ],
        correctAnswerIndex: 1,
        explanation:
          'Habermas argues that when systems like markets and bureaucracies crowd out genuine discourse in the lifeworld, the communicative bases of solidarity erode.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          "A discourse-ethics critique of a content-moderation system might focus on:",
        options: [
          'Whether the system is profitable',
          "Who is able to raise legitimate objections, who is silenced, and whether the system\'s decisions track the force of the better argument or the asymmetric power of the operator",
          "Whether the system is fast",
          "Whether the operator has good intentions",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Discourse ethics foregrounds procedural legitimacy: moderation systems produce defensible decisions only when they enable genuine argumentation across affected parties, not merely efficient enforcement.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'buddhist-ethics',
    'Buddhist Ethics',
    'Buddhist Ethics: Suffering, Compassion, and Interdependence',
    'Five questions on Buddhist moral thought.',
    [
      {
        prompt: "The First Noble Truth is that:",
        options: [
          "There is suffering (dukkha) inherent in ordinary conditioned existence",
          'Desire is the only good',
          "All religions agree",
          'The self is eternal',
        ],
        correctAnswerIndex: 0,
        explanation:
          'The diagnosis of dukkha — dissatisfactoriness running through birth, aging, illness, loss, and even pleasure — opens Buddhist ethical reflection.',
        difficulty: 'recall',
      },
      {
        prompt: 'Anatta (non-self) is the teaching that:',
        options: [
          'The self is immortal',
          "There is no permanent, independent self behind experience; what we call \"I\" is a shifting stream of processes",
          'Only monks have selves',
          'Desire is always good',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Anatta is a foundational Buddhist insight with deep ethical implications: clinging to a reified self is a source of suffering, and letting go reshapes how we hold claims, possessions, and grievances.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Karuna and metta are Buddhist terms for:",
        options: [
          "Compassion and loving-kindness — cultivated attitudes extending to all beings",
          'Two kinds of merit',
          'Political virtues',
          'Types of meditation technology',
        ],
        correctAnswerIndex: 0,
        explanation:
          'These "Four Immeasurables" (with mudita and upekkha) are practices of systematically training the heart toward kindness and care across the boundaries of self and tribe.',
        difficulty: 'recall',
      },
      {
        prompt: "The Buddhist doctrine of dependent origination (pratityasamutpada) implies that:",
        options: [
          "Phenomena arise in mutually conditioning relationships, with no independent substances",
          'Karma is a simple reward system',
          'The self is permanent',
          'Suffering is illusory',
        ],
        correctAnswerIndex: 0,
        explanation:
          'Things exist relationally. Ethically, this dissolves the neat separation of agent and effect and foregrounds our entanglement with all beings and conditions.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'An engineer reflecting on an AI system through a Buddhist lens might ask:',
        options: [
          "Only how to maximize attention",
          "How the system produces or relieves dukkha for users, non-users, and the broader web of beings it touches",
          "Whether the model has high parameter count",
          'Whether the code is beautiful',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Buddhist ethics invites a wide-angle account of harm and benefit — craving amplified, attention captured, compassion strengthened or eroded — across the interdependent field of affected beings.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'daoist-ethics',
    'Daoist Ethics',
    'Daoist Ethics: Wuwei, Ziran, and the Way',
    'Five questions on the moral vision of the Daoist tradition.',
    [
      {
        prompt: 'The Daoist concept of wuwei is often translated as:',
        options: [
          "\"Effortless action\" or non-coercive action in accord with the Dao",
          "\"Doing nothing at all\"",
          "\"Winning at all costs\"",
          "\"Maximizing resources\"",
        ],
        correctAnswerIndex: 0,
        explanation:
          "Wuwei is not passivity. It is the skillful responsiveness that does not strain against the grain of a situation — the way water flows around stones without trying.",
        difficulty: 'recall',
      },
      {
        prompt: 'Ziran (spontaneity/naturalness) is valued because it:',
        options: [
          'Lets people be lazy',
          "Names the way a thing is when it is allowed to unfold without forced imposition",
          "Rejects all rules",
          "Is identical to duty",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Ziran is the self-so of things. Daoist ethics prizes action and governance that honor the characteristic unfolding of beings rather than conscript them into alien patterns.",
        difficulty: 'conceptual',
      },
      {
        prompt: "\"Yielding as strength\" in Daoist thought suggests that:",
        options: [
          "Soft, receptive postures (water, the valley) often outlast and outmatch brittle, aggressive ones",
          'Weakness is cowardice',
          "Only strength matters",
          "Self-defense is forbidden",
        ],
        correctAnswerIndex: 0,
        explanation:
          "The Daodejing repeatedly inverts expected hierarchies: the soft overcomes the hard, the low supports the high. Daoist ethics cultivates this paradoxical sense of effective action.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Zhuangzi\'s \"butterfly dream\" primarily challenges:",
        options: [
          'The value of sleep',
          "Rigid boundaries between self and other, real and imagined — suggesting modest epistemic and moral humility",
          "The existence of dreams",
          'The authority of tradition',
        ],
        correctAnswerIndex: 1,
        explanation:
          "The famous passage destabilizes confident self-identification. Zhuangzi\'s ethics carries this uncertainty into our judgments about what is natural, what is good, and what we are.",
        difficulty: 'conceptual',
      },
      {
        prompt: "A Daoist reading of heavy-handed AI moderation policies would likely:",
        options: [
          'Praise them for maximizing control',
          "Warn that coercive, prescriptive rule-heaps often produce more distortion than the problems they solve, and recommend lighter, more responsive approaches",
          "Demand total deregulation",
          "Be indifferent to technology",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Daoist political ethics is skeptical of over-regulation. It favors the ruler who does little so that things can find their own balance — an orientation worth considering in platform design.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'pragmatist-ethics',
    'Pragmatist Ethics',
    'Pragmatist Ethics: Inquiry, Growth, and Experimental Moral Life',
    'Five questions on the pragmatist moral tradition.',
    [
      {
        prompt: 'Pragmatist ethics treats moral problems primarily as:',
        options: [
          "Occasions for deducing timeless laws",
          "Situations calling for experimental inquiry, where ends and means are revised together in light of consequences",
          "Opportunities to apply divine commands",
          "Exercises in pure logic",
        ],
        correctAnswerIndex: 1,
        explanation:
          'Dewey modeled ethical reasoning on scientific inquiry: gather the situation, form hypotheses about how to act, test, revise. There is no Archimedean point outside experience.',
        difficulty: 'recall',
      },
      {
        prompt: 'For John Dewey, growth is:',
        options: [
          'Merely getting bigger',
          "The criterion of value — the continuing capacity to learn, reconstruct habits, and expand meaning",
          "A goal for institutions only",
          "Morally neutral",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Dewey rejected fixed ends in favor of growth as the ongoing criterion: a life, an institution, or a technology is better to the degree it enables further growth rather than foreclosing it.",
        difficulty: 'conceptual',
      },
      {
        prompt: 'William James\'s pragmatic account of truth emphasizes that:',
        options: [
          'Truth is whatever we want',
          "A belief's truth is bound up with the difference it makes in experience — its \"cash value\" for prediction and action",
          "Only mathematical claims are true",
          'Truth is decided by authority',
        ],
        correctAnswerIndex: 1,
        explanation:
          "James does not reduce truth to convenience. He ties truth to consequences in experience: which hypotheses let us move through the world well and anticipate it accurately.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Pragmatist ethics rejects a sharp separation of:",
        options: [
          "Means and ends",
          "Pleasure and pain",
          'Thought and feeling',
          'Rules and rewards',
        ],
        correctAnswerIndex: 0,
        explanation:
          "Because ends are tested through the means we use to pursue them, Dewey denies any clean separation. Shoddy means corrupt the ends; good means reshape the ends in turn.",
        difficulty: 'conceptual',
      },
      {
        prompt:
          "A pragmatist assessing a new AI feature would ask most directly:",
        options: [
          'What would Kant say?',
          "What difference does this make in lived practice — in habits formed, problems solved, relationships shaped — and what adjustments do we make when evidence comes in?",
          'Has it been blessed?',
          "Does it maximize engagement?",
        ],
        correctAnswerIndex: 1,
        explanation:
          'Pragmatist ethics is experimental: ship, observe, revise. What matters is the difference the technology makes in the ongoing reconstruction of individual and collective experience.',
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'environmental-ethics',
    'Environmental Ethics',
    'Environmental Ethics: Beyond the Human',
    'Five questions on moral consideration for the non-human world.',
    [
      {
        prompt: 'Anthropocentrism, biocentrism, and ecocentrism differ in:',
        options: [
          "Whether moral standing is confined to humans, extended to individual living things, or extended to whole ecological systems",
          "The number of philosophers endorsing them",
          "Their views about God",
          'The language they use',
        ],
        correctAnswerIndex: 0,
        explanation:
          "These three positions mark an expanding circle of moral concern: from only humans, to all living beings, to the ecosystems that sustain life.",
        difficulty: 'recall',
      },
      {
        prompt: 'Aldo Leopold\'s "Land Ethic" famously holds that a thing is right:',
        options: [
          "When it tends to preserve the integrity, stability, and beauty of the biotic community",
          'When it satisfies the most humans',
          "When it is permitted by national law",
          "When it maximizes production",
        ],
        correctAnswerIndex: 0,
        explanation:
          "Leopold's criterion, from A Sand County Almanac, is the most-quoted one-liner in environmental ethics. It shifts moral weight from the human actor alone to the larger living community.",
        difficulty: 'recall',
      },
      {
        prompt: "Arne Naess\'s \"deep ecology\" is deep because it:",
        options: [
          "Concerns deep-sea issues only",
          "Questions the underlying worldview (metaphysical and ethical) that treats nature as resource, not just its surface symptoms",
          'Uses difficult math',
          "Requires years of training",
        ],
        correctAnswerIndex: 1,
        explanation:
          'Deep ecology contrasts itself with "shallow" environmentalism that merely patches the damage of an untouched anthropocentric worldview. It aims at transforming that worldview.',
        difficulty: 'conceptual',
      },
      {
        prompt: "Robin Wall Kimmerer\'s work contributes an ethical framing centered on:",
        options: [
          "Reciprocity and kinship — Indigenous traditions that understand humans as participants in gift relationships with other species",
          "Pure cost-benefit analysis",
          'Global trade economics',
          "Religious legalism",
        ],
        correctAnswerIndex: 0,
        explanation:
          "Braiding Sweetgrass weaves Potawatomi knowledge with botanical science to articulate an ethics of reciprocal responsibility with the more-than-human world.",
        difficulty: 'recall',
      },
      {
        prompt:
          'Environmental justice adds to classical environmental ethics an emphasis on:',
        options: [
          'Only aesthetic considerations',
          "The uneven distribution of environmental burdens and benefits across human communities, often along lines of race, class, and Indigeneity",
          'Technical engineering only',
          'National boundaries',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Environmental justice insists that harms (pollution, climate risk) and goods (access to clean water, green space) are not distributed neutrally. Those who contribute least to damage often bear the most.",
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'cosmopolitanism',
    'Cosmopolitanism',
    'Cosmopolitanism: Obligations Across Borders',
    'Five questions on the ethics of global responsibility.',
    [
      {
        prompt: 'Cosmopolitanism, broadly, holds that:',
        options: [
          "Moral obligations extend to all human beings in virtue of their humanity, not just to co-nationals",
          "Only one's tribe matters",
          "Ethics is impossible across borders",
          'Duties track linguistic groups',
        ],
        correctAnswerIndex: 0,
        explanation:
          'From Diogenes\' "I am a citizen of the world" to Kant\'s perpetual peace, cosmopolitans insist the circle of moral concern cannot stop at the border.',
        difficulty: 'recall',
      },
      {
        prompt: "Kant\'s essay on perpetual peace defends:",
        options: [
          "A cosmopolitan right of hospitality — the right of a stranger not to be treated with hostility upon arrival",
          "Permanent war",
          'Elimination of national borders',
          'The divine right of kings',
        ],
        correctAnswerIndex: 0,
        explanation:
          'Kant\'s "hospitality" was a limited but crucial cosmopolitan right, rooted in the shared possession of the earth\'s surface and our shared vulnerability to strangers\' cruelty.',
        difficulty: 'conceptual',
      },
      {
        prompt: "Appiah\'s \"rooted\" or \"partial\" cosmopolitanism holds that:",
        options: [
          "Local attachments and universal concern are both legitimate and can be held together",
          "All local attachments are morally suspect",
          'Only strangers matter',
          'Cosmopolitanism is a religion',
        ],
        correctAnswerIndex: 0,
        explanation:
          "Appiah resists both the narrow nationalist and the tone-deaf globalist. Cosmopolitan ethics, for him, is a conversation across difference — neither dismissing particularity nor mistaking it for the whole story.",
        difficulty: 'conceptual',
      },
      {
        prompt: "Thomas Pogge has prominently argued that affluent nations:",
        options: [
          "Have only charitable obligations toward the global poor",
          "Have duties of justice, not mere charity, because the global institutional order they shape contributes to severe poverty elsewhere",
          "Owe nothing to foreigners",
          "Should ignore international institutions",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Pogge\'s claim is that the rules of the global economic order — trade, tax, pharmaceutical patents — are not neutral, so wealthy states bear responsibility for poverty their system helps produce.",
        difficulty: 'conceptual',
      },
      {
        prompt: 'Designers of a globally deployed AI system inspired by cosmopolitan ethics should most directly:',
        options: [
          "Optimize only for their largest market",
          "Consider the legitimate interests, norms, and vulnerabilities of users across every jurisdiction where the system operates — while resisting the temptation to flatten local moral detail",
          "Refuse to deploy anywhere",
          'Obey each country\'s government uncritically',
        ],
        correctAnswerIndex: 1,
        explanation:
          "Cosmopolitanism pushes against treating the default user as your home market. It asks designers to hold global responsibility and particular attachment in the same frame.",
        difficulty: 'applied',
      },
    ]
  ),
];

/**
 * Static fallback lookup used by `getQuizForSubject('theory', id)`
 * when no Firestore quiz exists. Mirrors the pattern exported by
 * `src/data/scifi-author-quizzes.ts` and `src/data/textbook/quizzes.ts`.
 */
export function getStaticEthicalTheoryQuiz(theoryId: string): Quiz | null {
  return ethicalTheoryQuizzes.find((q) => q.subjectId === theoryId) ?? null;
}
