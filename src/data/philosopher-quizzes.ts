import type { Quiz } from '@/types';

/**
 * Hand-authored comprehension quizzes for each philosopher, grounded in
 * their entry in `src/data/philosophers.ts` and focused on how their ideas
 * bear on technology ethics. Used as the static fallback by
 * `getQuizForSubject('philosopher', id)` when no Firestore quiz exists.
 *
 * Canonical doc id = `philosopher-<philosopherId>` to match the quizzes
 * collection pattern used for theories and sci-fi authors.
 */

function buildQuiz(
  philosopherId: string,
  subjectName: string,
  title: string,
  description: string,
  questions: Array<{
    prompt: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty: 'recall' | 'conceptual' | 'applied';
  }>
): Quiz {
  const quizId = `philosopher-${philosopherId}`;
  return {
    id: quizId,
    subjectType: 'philosopher',
    subjectId: philosopherId,
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
    estimatedMinutes: 7,
    passingScorePercent: 70,
    createdAt: new Date(0),
  };
}

export const philosopherQuizzes: Quiz[] = [
  buildQuiz(
    "aristotle",
    "Aristotle",
    "Aristotle: Flourishing, Virtue, and Practical Wisdom",
    "Tests Aristotle's eudaimonia, the doctrine of the mean, phronesis, and their bearing on virtue ethics for technology and AI.",
    [
      {
        prompt: "What does Aristotle mean by 'eudaimonia,' the central concept of his ethics?",
        options: ["A momentary feeling of pleasure or subjective contentment", "Flourishing or thriving across a whole life gone well", "Obedience to a transcendent Form of the Good glimpsed by philosophers", "The accumulation of honor and reputation among one's peers"],
        correctAnswerIndex: 1,
        explanation: "The entry stresses that eudaimonia names flourishing or thriving and is a property of a life as a whole rather than of any single moment within it; a single afternoon cannot be eudaimon.",
        difficulty: "recall",
      },
      {
        prompt: "Aristotle's 'function argument' grounds human flourishing in which distinctively human activity?",
        options: ["The pursuit of pleasure, which all animals share", "The acquisition of wealth and material sufficiency", "The excellent exercise of our rational capacities", "Worship of the eternal and necessary Forms"],
        correctAnswerIndex: 2,
        explanation: "Just as a good knife cuts well, Aristotle asks what humans alone do and answers that we reason; flourishing therefore consists in the excellent exercise of our rational capacities across a complete life.",
        difficulty: "recall",
      },
      {
        prompt: "Why does the entry warn that the 'doctrine of the mean' is often misunderstood?",
        options: ["Because it secretly demands the vice of excess over deficiency", "Because Aristotle actually rejected the idea of virtue altogether", "Because the mean applies only to virtues of thought, not character", "Because it is read as bland moderation rather than the right response to a particular situation"],
        correctAnswerIndex: 3,
        explanation: "The text notes the mean is not arithmetical or a counsel of tepid middles; it is the right response to the particular situation, which requires phronesis to discern what the moment actually demands.",
        difficulty: "conceptual",
      },
      {
        prompt: "How does Aristotle's pluralism about the good ('there are many goods proper to their subjects') avoid collapsing into relativism?",
        options: ["Because human beings share a nature that sets real standards, so a tyrant is not flourishing no matter what he feels", "Because he ultimately accepts Plato's single transcendent Form of the Good", "Because he holds that whatever a person sincerely feels to be good is good for them", "Because the city's laws, not nature, determine what counts as flourishing"],
        correctAnswerIndex: 0,
        explanation: "The entry explains that although the good differs for different beings and life stages, a shared human nature sets real standards, so even a contented tyrant does not count as flourishing.",
        difficulty: "conceptual",
      },
      {
        prompt: "A startup claims its AI system 'acts ethically' because it reliably follows a codified set of ethical rules. Per the Aristotelian argument in the entry (drawn from Vallor), what is the core objection?",
        options: ["Rule-following is fine, but the system simply needs more rules to cover every case", "Practical wisdom cannot be codified into rules and requires character cultivated across a life, which such a system lacks, so the claim is a category error", "The system fails because it was not also trained to maximize aggregate happiness", "Ethics is purely about consequences, so intentions and character are irrelevant to the claim"],
        correctAnswerIndex: 1,
        explanation: "The entry states that phronesis cannot be reduced to rules and cannot exist in an agent lacking long-horizon character formation, so calling such a system's behavior 'ethical' is a category error.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "confucius",
    "Confucius",
    "Confucius: Ritual, Humaneness, and the Cultivated Self",
    "Tests understanding of ren, li, the junzi, the relational self, and their bearing on technology and AI ethics.",
    [
      {
        prompt: "What is the core concept of 'ren' as described in the entry?",
        options: ["The repertoire of ceremonies and social forms by which a community enacts its shared life", "Humaneness, or co-humanity, the disposition to regard others as fellow subjects rather than as means or obstacles", "A system of rewards and punishments for governing actual human behavior", "The metaphysical decrees of Heaven that the sage comes to know in old age"],
        correctAnswerIndex: 1,
        explanation: "The entry defines ren as humaneness or co-humanity, the disposition to regard other people as fellow subjects rather than as means or obstacles, noting the character joins 'person' with 'two.'",
        difficulty: "recall",
      },
      {
        prompt: "Why does Confucius value 'li' (ritual propriety) rather than dismissing it as hollow formalism?",
        options: ["Because ritual is the external form that, through repeated embodied practice, trains the inner dispositions that make a humane life possible", "Because ritual provides an explicit set of universal rules that can replace the need for good character", "Because ritual demonstrates loyalty to the Zhou lords and secures political advancement", "Because ritual allows a person to achieve spontaneous naturalness by escaping social forms"],
        correctAnswerIndex: 0,
        explanation: "The entry stresses that for Confucius ritual shapes the inner disposition: repeated embodied practice (bowing, mourning rites) trains a person to actually feel respect, grief, and gratitude.",
        difficulty: "conceptual",
      },
      {
        prompt: "According to the entry, how does Confucius's view of the self differ most sharply from the autonomous-individual frame assumed by most technology-ethics frameworks?",
        options: ["He holds that the self is an illusion that dissolves once one attains knowledge of Heaven", "He holds that the self is a free-standing individual who only later chooses to enter relationships", "He holds that the self is constituted by its specific relationships and obligations from the very start, not layered onto a prior self", "He holds that the self is defined purely by obedience to law and fear of punishment"],
        correctAnswerIndex: 2,
        explanation: "The entry presents the relational view: identity as child, sibling, friend, parent, and citizen is the very substance of the self, a direct challenge to the autonomous-individual frame in tech ethics.",
        difficulty: "conceptual",
      },
      {
        prompt: "Applying the entry's Confucian reading to platform design, which question would a Confucian ethics ask of a social media app?",
        options: ["Does the platform maximize aggregate user engagement and time-on-site across the population?", "Does the platform's daily use cultivate dispositions like honesty, patience, attention, and the capacity to sit with disagreement?", "Does the platform secure each user's informed consent and respect their autonomy as stated in the terms of service?", "Does the platform distribute resources to maximize the welfare of the least advantaged users?"],
        correctAnswerIndex: 1,
        explanation: "The entry says a Confucian reading asks not whether the platform respects autonomy but whether it cultivates the dispositions that make good relationships possible, and notes almost no platform passes that test.",
        difficulty: "applied",
      },
      {
        prompt: "What does the entry identify as the goal of Confucian ethical life, the 'junzi'?",
        options: ["A saint who withdraws from ordinary life to contemplate the decrees of Heaven", "A ruler who unifies the warring states through strict law and military force", "A scholar who masters the Four Books well enough to pass the imperial examinations", "The cultivated, exemplary person in whom right action flows from internalized character rather than calculation"],
        correctAnswerIndex: 3,
        explanation: "The entry describes the junzi as the exemplary or cultivated person, not a saint set apart, who through long study and practice acts rightly from character rather than calculation.",
        difficulty: "recall",
      },
    ]
  ),
  buildQuiz(
    "beauvoir",
    "Simone de Beauvoir",
    "Simone de Beauvoir: Ambiguity, Situated Freedom, and the Other",
    "Tests Beauvoir's ethics of ambiguity, situated freedom, the construction of woman as Other, and her relevance to tech ethics.",
    [
      {
        prompt: "In which 1947 work does Beauvoir give the clearest statement of her moral philosophy, beginning from the 'fundamental ambiguity' of the human condition?",
        options: ["The Second Sex", "The Ethics of Ambiguity", "The Mandarins", "A Very Easy Death"],
        correctAnswerIndex: 1,
        explanation: "The Ethics of Ambiguity (1947) is identified in the entry as the clearest statement of her moral philosophy, starting from the irreducible ambiguity of being both consciousness and flesh.",
        difficulty: "recall",
      },
      {
        prompt: "What does Beauvoir mean by the 'fundamental ambiguity' of the human condition that ethics must begin from?",
        options: ["That moral rules are unclear and must be clarified by reason before we can act", "That we are irreducibly both free consciousness and biological flesh, a tension to be held open rather than resolved", "That human nature is fixed at birth but obscured by social conditioning", "That ethics depends on a god whose will remains ambiguous to us"],
        correctAnswerIndex: 1,
        explanation: "Beauvoir holds that we are at once consciousness and flesh, free project and organism; ethics begins only once we accept this tension as the medium of life rather than a problem to solve.",
        difficulty: "conceptual",
      },
      {
        prompt: "In Beauvoir's catalogue of inauthentic flights from freedom, what characterizes the 'serious man'?",
        options: ["He hands his freedom over to an external value, party, or nation and insists that value is absolute", "He sinks into mere inertia, refusing the weight of freedom altogether", "He decides nothing matters and makes a fetish of the void", "He acts freely but treats the world as his personal playground"],
        correctAnswerIndex: 0,
        explanation: "The serious man surrenders his freedom to some external absolute (party, nation, career); the other options describe the sub-man, the nihilist, and the adventurer respectively.",
        difficulty: "recall",
      },
      {
        prompt: "How does Beauvoir's notion of 'situated freedom' depart from the more austere Sartrean account of freedom?",
        options: ["It denies that humans are free, arguing biology fully determines the self", "It claims freedom is a gift rather than a burden we are condemned to bear", "It insists freedom is always exercised within bodies, histories, economies, and languages that others have already given meaning", "It locates freedom solely in private inner choice, detached from the shared world"],
        correctAnswerIndex: 2,
        explanation: "Beauvoir took seriously that freedom is always situated, exercised inside bodies, histories, and languages already meaning-laden, thickening Sartre's more abstract conception.",
        difficulty: "conceptual",
      },
      {
        prompt: "A platform defends a feature by saying 'engagement metrics show users want this' and 'users consented.' How would a Beauvoirian analysis respond?",
        options: ["It would accept the metrics as authoritative, since revealed preferences are the best evidence of what people freely want", "It would argue those observations reveal the constrained conditions users operate under, not what they would want under less constrained conditions", "It would reject the data as irrelevant because consciousness can never be measured at all", "It would conclude that since no value is absolute, the company's choice is as good as any other"],
        correctAnswerIndex: 1,
        explanation: "Beauvoir argues preferences formed inside shaping conditions are evidence about those conditions, not proof the preference is freely held; using them to evaluate the very systems that produced them creates a closed loop.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "hobbes",
    "Thomas Hobbes",
    "Thomas Hobbes: Order, Fear, and the Sovereign",
    "Tests understanding of Hobbes's state of nature, social contract, absolute sovereignty, and their bearing on platform and AI governance.",
    [
      {
        prompt: "In Leviathan, how does Hobbes famously describe life in the state of nature?",
        options: ["A condition of peaceful savagery later corrupted by civilization", "Solitary, poor, nasty, brutish, and short", "A golden age of natural harmony governed by reason", "A patriarchal household ruled by inherited tradition"],
        correctAnswerIndex: 1,
        explanation: "Hobbes's signature phrase describes the state of nature as 'solitary, poor, nasty, brutish, and short,' a war of all against all with no industry, arts, or society. The 'peaceful savagery' view is Rousseau's later revision, not Hobbes's.",
        difficulty: "recall",
      },
      {
        prompt: "According to Hobbes, why does rough equality among people make the state of nature so dangerous?",
        options: ["Because equal people naturally trust one another and lower their guard", "Because no one is strong enough to dominate, so even the strongest can be killed by a conspiracy of the weak, making everyone a threat", "Because equality guarantees an equal division of scarce resources, removing competition", "Because only a hereditary aristocracy can break the equality and impose peace"],
        correctAnswerIndex: 1,
        explanation: "Hobbes argues equality is the engine of conflict: since even the strongest can be killed in their sleep by the weak banding together, no one is safe, so everyone becomes a mutual threat. This rough parity is precisely why dominance cannot secure peace.",
        difficulty: "conceptual",
      },
      {
        prompt: "Hobbes says the 'laws of nature' counsel peace and the keeping of agreements, yet he insists these laws alone cannot produce order. Why not?",
        options: ["Because most people are incapable of reasoning about their own self-preservation", "Because the laws of nature command war rather than peace", "Because without an enforcing power we cannot trust others to keep them, so they remain 'mere words'", "Because the laws of nature are divine commands that bind only the clergy"],
        correctAnswerIndex: 2,
        explanation: "For Hobbes, laws of nature are theorems of rational self-preservation, but 'covenants without the sword are but words': we may know what we ought to do yet still defect because we cannot trust others, so only an enforcing sovereign makes peace possible.",
        difficulty: "conceptual",
      },
      {
        prompt: "On Hobbes's account, what is the one right subjects can never surrender to the sovereign, even one with absolute authority?",
        options: ["The right of self-preservation", "The right to free religious worship", "The right to elect and recall the sovereign", "The right to own private property"],
        correctAnswerIndex: 0,
        explanation: "Hobbes holds the sovereign is absolute, but subjects retain the right of self-preservation, because escaping violent death was the whole point of the covenant and cannot be rationally given up; a sovereign trying to kill a subject releases him from obedience in that moment.",
        difficulty: "recall",
      },
      {
        prompt: "Applying Hobbes to technology ethics, how would he most likely diagnose the 'freedom' users feel on large platforms like Facebook, Google, and Amazon?",
        options: ["As a genuine civic condition where shared authority guarantees binding agreements and reliable appeal", "As proof that trustless, ungoverned networks are the ideal stable endpoint for online life", "As a structurally state-of-nature condition — no shared authority, no reliable enforcement, grievances without appeal — which is why users feel ungoverned and miserable", "As irrelevant, since private companies are simply ordinary market actors with no sovereign dimension"],
        correctAnswerIndex: 2,
        explanation: "The entry notes Hobbes would read platform 'freedom' as a state-of-nature condition lacking shared authority and enforcement, so user discontent reflects the classic Hobbesian point that ungoverned life is miserable and coordination problems eventually force some sovereign of a kind.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "hume",
    "David Hume",
    "David Hume: Sentiment, Causation, and the Limits of Reason",
    "Tests Hume's empiricism, his critique of causation, moral sentimentalism, and how the is-ought gap bears on AI ethics.",
    [
      {
        prompt: "In Hume's analysis of the billiard balls, what do we actually perceive when one ball strikes another?",
        options: ["A necessary causal force binding the two events together", "A rational insight into the underlying structure of reality", "A succession of events—motion, contact, motion—but no necessary connection", "Direct evidence that the future must resemble the past"],
        correctAnswerIndex: 2,
        explanation: "Hume argues we observe only the sequence of events, never any 'necessary connection'; the sense of causation is a habit of expectation the mind projects onto the world.",
        difficulty: "recall",
      },
      {
        prompt: "What does Hume mean by his claim that reason 'is and ought only to be the slave of the passions'?",
        options: ["Moral judgments are arbitrary and reason plays no role whatsoever in human life", "Reason alone discovers facts and relations but cannot by itself move us to act or condemn a choice as evil", "The passions should be suppressed so that pure reason can govern moral decisions", "Reason can independently derive binding moral duties from self-evident first principles"],
        correctAnswerIndex: 1,
        explanation: "Hume holds that reason discovers only relations of ideas and matters of fact; it is sentiment, not reason, that motivates action and grounds moral distinctions—yet this is not the same as calling morality arbitrary.",
        difficulty: "conceptual",
      },
      {
        prompt: "How does Hume describe the self when one introspects in search of it?",
        options: ["A bundle of perceptions held together by resemblance and causation, not an underlying substance", "An immortal soul that reason can prove exists independently of the body", "A fixed rational substance that owns and unifies all of one's experiences", "An illusion that disappears entirely once philosophy is properly understood"],
        correctAnswerIndex: 0,
        explanation: "Hume's 'bundle theory' holds that introspection reveals only a parade of impressions and ideas, never a distinct self underlying them—though he admitted in an appendix that his account left a tension unresolved.",
        difficulty: "recall",
      },
      {
        prompt: "An AI lab observes that a model's behavior 'is aligned' in testing and concludes from this observation alone that the model 'ought' to be deployed. Which Humean point most directly challenges this reasoning?",
        options: ["The bundle theory of self, since the model has no unified identity to be aligned", "Reason as the slave of the passions, since the lab is being driven by emotion", "The critique of sympathy, since the model cannot resonate with human feelings", "The is-ought distinction, since moving from a descriptive observation to a normative conclusion is illicit without explicit normative premises"],
        correctAnswerIndex: 3,
        explanation: "Hume's is-ought gap warns against sliding from 'is' (the observed behavior) to 'ought' (what should be done) without additional normative premises; the entry names this as the most-cited check against naturalistic reasoning in AI ethics.",
        difficulty: "applied",
      },
      {
        prompt: "A team argues that because an AI model performed reliably on historical training data, it is rationally guaranteed to perform reliably when deployed in new situations. Which Humean idea exposes the flaw in this argument?",
        options: ["The problem of induction—past regularities cannot logically guarantee future ones without additional premises", "Moral sentimentalism—the team has failed to consult its feelings of approbation", "The is-ought distinction—the team confuses a value with a fact about the world", "The Dialogues' critique of the design argument—the model was not intelligently designed"],
        correctAnswerIndex: 0,
        explanation: "Hume's problem of induction shows no amount of past observation can deductively establish that the future will resemble the past; transferring historical probability to a present deployment is exactly the move he showed could not be rationally justified.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "kant",
    "Immanuel Kant",
    "Immanuel Kant: Duty, Dignity, and the Moral Law",
    "Tests Kant's categorical imperative, duty-based ethics, autonomy, and how the formula of humanity applies to AI ethics.",
    [
      {
        prompt: "According to Kant, why can morality NOT be grounded in consequences or desires?",
        options: ["Because consequences are too difficult to calculate accurately in practice", "Because they are contingent and variable, and cannot produce the unconditional bindingness that moral obligation actually has", "Because most people are too selfish to weigh consequences fairly", "Because desires are always immoral and lead reason astray"],
        correctAnswerIndex: 1,
        explanation: "Kant insists a true moral law must hold for every rational being in every circumstance; consequences and desires are contingent and variable, so they cannot supply the unconditional bindingness moral duty requires.",
        difficulty: "conceptual",
      },
      {
        prompt: "Kant offers several formulations of the categorical imperative. Which one commands that you act only on a maxim you could at the same time will to become a universal law?",
        options: ["The first formulation, the formula of universal law", "The formula of humanity", "The formula of the kingdom of ends", "The formula of autonomy"],
        correctAnswerIndex: 0,
        explanation: "The first formulation is the universal law test: act only according to that maxim by which you can at the same time will that it should become a universal law for everyone.",
        difficulty: "recall",
      },
      {
        prompt: "In Kant's example, the merchant who tells the truth only because honesty is good for business is contrasted with one who tells the truth because it is right. What does this illustrate about moral worth?",
        options: ["That outcomes are what ultimately determine whether an action is moral", "That truth-telling is only required when it benefits the community", "That moral worth lies in the maxim or inner principle of the will, not in the outward effect, so an action done from inclination lacks it", "That acting from inclination and acting from duty are morally identical when the behavior is the same"],
        correctAnswerIndex: 2,
        explanation: "For Kant moral worth resides in the maxim, the inner principle of the will; the merchant acting from self-interest behaves identically but his action, done from inclination rather than duty, has no moral worth.",
        difficulty: "conceptual",
      },
      {
        prompt: "The entry calls one Kantian idea 'the single most important operational test in the AI-safety literature.' Which formulation is it, and how does it apply to the data economy?",
        options: ["The kingdom of ends, applied as a demand that all AI systems be democratically voted on", "Transcendental idealism, applied to show that algorithms cannot know things-in-themselves", "The universal law test, applied to require that every product maximize aggregate user welfare", "The formula of humanity, applied to ask whether technology treats users as agents owed justification rather than resources to be extracted"],
        correctAnswerIndex: 3,
        explanation: "The entry identifies the formula of humanity, treat every rational being as an end and never merely as a means, as the key AI-safety test: dark patterns, engagement loops, and opaque scoring fail it by treating users as resources to extract.",
        difficulty: "applied",
      },
      {
        prompt: "A company plans to deploy a classifier across an entire population. Using the universalization form of the categorical imperative as described in the entry, when would Kant judge the deployment morally impermissible?",
        options: ["Whenever the classifier could not coherently be willed as a universal law applied to every person in that population, regardless of its efficiency", "Whenever the classifier is less accurate than a human reviewer would be", "Whenever deploying it fails to maximize the company's long-term profit", "Whenever a majority of affected users vote against the deployment"],
        correctAnswerIndex: 0,
        explanation: "The entry applies the universalization test directly: if you could not will as a universal law that this classifier be applied to every person in the population, the system performs an act Kant would call impermissible regardless of the efficiency it achieves.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "mill",
    "John Stuart Mill",
    "John Stuart Mill: Liberty, Higher Pleasures, and Harm",
    "Tests Mill's refinement of utilitarianism, the harm principle, individuality, and their bearing on modern technology and AI ethics.",
    [
      {
        prompt: "How did Mill modify Bentham's utilitarianism to answer the charge that it was 'a philosophy fit for pigs'?",
        options: ["He abandoned happiness as the standard of value in favor of duty", "He distinguished higher (qualitatively superior) pleasures from lower ones, judged by those who have experienced both", "He argued that only the pleasures of the majority should count in the calculus", "He replaced the hedonic calculus with a purely mathematical sum of pleasure units"],
        correctAnswerIndex: 1,
        explanation: "Mill's central move in Utilitarianism (1861) was the distinction between higher and lower pleasures, with the test being that competent judges who have experienced both prefer the higher.",
        difficulty: "recall",
      },
      {
        prompt: "According to Mill's harm principle in On Liberty, what is the ONLY legitimate justification for society exercising power over an individual against their will?",
        options: ["To prevent harm to others", "To protect the individual's own physical or moral good", "To maximize the aggregate happiness of the community", "To preserve traditional customs and shared moral standards"],
        correctAnswerIndex: 0,
        explanation: "Mill held that the only legitimate warrant for coercing an individual is preventing harm to others; a person's own good, physical or moral, is explicitly not sufficient warrant.",
        difficulty: "recall",
      },
      {
        prompt: "Critics charge that Mill's higher/lower pleasure distinction creates a tension within utilitarianism. What is that tension?",
        options: ["It makes pleasure impossible to measure, so no action can ever be evaluated", "It denies that pleasure has any role in the good life at all", "Ranking pleasures by quality appeals to a standard beyond pleasure itself, so Mill either smuggles in a non-utilitarian criterion or collapses back into Benthamism", "It claims all pleasures are ultimately equal, contradicting his praise of Socrates"],
        correctAnswerIndex: 2,
        explanation: "Judging some pleasures 'higher' is a judgment of quality, not quantity, assessed by something other than the pleasure produced; thus Mill either reintroduces a non-utilitarian standard or reverts to Bentham.",
        difficulty: "conceptual",
      },
      {
        prompt: "Beyond the formal threat of law, what did Mill in On Liberty identify as a especially dangerous instrument of conformity threatening human individuality?",
        options: ["The economic power of industrial monopolies", "The tyranny of mass opinion and the soft social pressure toward conformity", "The centralized authority of an absolute monarch", "The doctrinal control exercised by organized religion"],
        correctAnswerIndex: 1,
        explanation: "Mill feared the 'tyranny of mass opinion' the slow erosion of eccentricity and experiment by the soft pressure of conformity, warning social pressure could become more effective than formal law.",
        difficulty: "conceptual",
      },
      {
        prompt: "A recommender system infers users' 'true preferences' purely from their observed clicks and watch-time. Which Millian argument, drawn from The Subjection of Women, most directly challenges treating that behavior as reliable evidence of what people actually want?",
        options: ["The harm principle, since recommendations may harm third parties", "The greatest-happiness principle, since aggregate welfare should override individual choice", "The argument that preferences formed under systematically unequal or shaping institutions are not trustworthy evidence of genuine desire", "The distinction between higher and lower pleasures, since clicks reflect only lower pleasures"],
        correctAnswerIndex: 2,
        explanation: "Mill argued in The Subjection of Women that 'preferences' observed in a population shaped by unequal institutions are unreliable evidence of real desire a problem the entry notes algorithmic systems learning from observed behavior face continuously.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "nietzsche",
    "Friedrich Nietzsche",
    "Friedrich Nietzsche: Genealogy, Values, and the Unmasking of Morality",
    "Tests Nietzsche's core ideas—master/slave morality, will to power, eternal recurrence, perspectivism—and their bearing on technology ethics.",
    [
      {
        prompt: "In On the Genealogy of Morals, Nietzsche argues that the terms 'good' and 'evil' are best understood as which of the following?",
        options: ["The deposit of a long historical struggle between two ways of evaluating, master morality and slave morality", "Eternal moral facts discovered through rational reflection on human nature", "Commands issued directly by God and preserved unchanged across cultures", "Useful fictions invented by philosophers to make ethical systems internally consistent"],
        correctAnswerIndex: 0,
        explanation: "The entry states Nietzsche argued our moral vocabulary has a history and that 'good' and 'evil' are not the discovery of a moral reality but the deposit of a long struggle between two modes of evaluation.",
        difficulty: "recall",
      },
      {
        prompt: "According to Nietzsche's account, how did 'slave morality' arise and revalue strength?",
        options: ["The strong voluntarily renounced their power and taught the weak to prize humility as the highest good", "It emerged as a neutral philosophical theory with no particular group's interests behind it", "It was the revolt of the dominated, who, unable to become strong, recast strength as evil and their own powerlessness as virtue", "It was imposed by a single ancient lawgiver who codified meekness into a legal system"],
        correctAnswerIndex: 2,
        explanation: "The entry describes slave morality as the revolt of the dominated who, unable to become strong, revalued strength as evil and made humility and meekness into virtues precisely because those were what the weak had to offer.",
        difficulty: "conceptual",
      },
      {
        prompt: "Nietzsche's 'will to power' is frequently misread. How does the entry characterize what he actually meant by it?",
        options: ["A political doctrine endorsing the domination of the weak by the strong", "A drive toward expression, growth, and the overcoming of resistance, more fundamental than any specific aim including self-preservation", "The biological instinct for self-preservation that Darwin had placed at the center of life", "A racial program later faithfully developed in Thus Spoke Zarathustra"],
        correctAnswerIndex: 1,
        explanation: "The entry explicitly warns against reading will to power as endorsing domination, defining it instead as a drive toward expression, growth, and overcoming resistance that Nietzsche took to be more fundamental than even self-preservation.",
        difficulty: "conceptual",
      },
      {
        prompt: "The entry says Nietzsche supplies technology ethics with a distinctive discipline. When an AI lab says 'AI alignment' but in practice means 'alignment with the goals of the companies deploying AI,' which Nietzschean move best describes the critical work being done?",
        options: ["Invoking the eternal recurrence to ask whether engineers could will the system to repeat infinitely", "Appealing to master morality to justify the company's dominant position in the market", "Using genealogical and perspectival analysis to make visible whose interests the supposedly neutral framework actually serves", "Applying the Übermensch ideal to demand that developers create entirely new values from scratch"],
        correctAnswerIndex: 2,
        explanation: "The entry presents Nietzsche's genealogical method and perspectivism as tools for unmasking the interests behind ostensibly universal frameworks, citing the 'AI alignment' substitution as exactly the kind of move his analysis makes visible.",
        difficulty: "applied",
      },
      {
        prompt: "The entry notes a clear limit to Nietzsche's usefulness for technology ethics. What is that limitation, and what does it say fills the gap?",
        options: ["He offers little constructive moral guidance, so virtue-ethics, care-ethics, and discourse-ethics traditions must supply what his critique leaves unprovided", "His perspectivism is incompatible with any critical study of technology, which must instead rely on a view from nowhere", "He rejects the idea that ethical frameworks have authors or histories, so genealogy cannot apply to AI codes of conduct", "His method works only for religious ethics and cannot be turned on corporate or regulatory codes"],
        correctAnswerIndex: 0,
        explanation: "The entry states that where Nietzsche fails us is in constructive moral guidance, and that the virtue-ethics, care-ethics, and discourse-ethics traditions supply what his critique leaves unprovided.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "noddings",
    "Nel Noddings",
    "Nel Noddings: The Ethics of Care",
    "Tests understanding of Noddings's caring relation, its structure, her critique of impartialism, and care ethics applied to AI.",
    [
      {
        prompt: "In Noddings's 1984 book, what does she propose as the ground of ethics, instead of impartial principle or calculated consequence?",
        options: ["The rational legislation of universal maxims", "The maximization of aggregate well-being", "The concrete relation between the one-caring and the cared-for", "The cultivation of stable virtues in the Aristotelian sense"],
        correctAnswerIndex: 2,
        explanation: "Her book Caring grounds ethics in the concrete caring relation between the one-caring and the cared-for, not in Kantian principle or utilitarian calculation.",
        difficulty: "recall",
      },
      {
        prompt: "According to Noddings, why is a caring relation considered incomplete if the cared-for does not respond?",
        options: ["Because the relation requires both parties, with the cared-for completing it by receiving and acknowledging the care", "Because the one-caring must be compensated for the energy expended", "Because care must always be reciprocated with equal care in return", "Because an impartial observer cannot verify that care occurred"],
        correctAnswerIndex: 0,
        explanation: "Noddings holds that the cared-for completes the relation by receiving and acknowledging the care; care that goes unrecognized is incomplete, and a caring relation requires both parties.",
        difficulty: "conceptual",
      },
      {
        prompt: "What does Noddings's term 'motivational displacement' describe?",
        options: ["The substitution of emotion for reasoned moral judgment", "The one-caring's energies flowing toward the cared-for's actual situation while her own projects are set aside", "The transfer of caregiving duties from the home to public institutions", "The replacement of relationships with rules in modern moral theory"],
        correctAnswerIndex: 1,
        explanation: "Motivational displacement is the one-caring's energies flowing toward the cared-for's actual situation, with her own projects set aside for that time, rather than the application of a rule.",
        difficulty: "conceptual",
      },
      {
        prompt: "Noddings argued the impartialism of Kantian and utilitarian ethics looks, from the care perspective, like what?",
        options: ["A pragmatic compromise that care ethics should ultimately adopt", "The only reliable safeguard against favoritism and injustice", "An accurate description of how parents treat their own children", "A refusal of the concrete ties that actually constitute moral life"],
        correctAnswerIndex: 3,
        explanation: "She argued that the demand to weigh every person's interest equally looks, from the care perspective, like a refusal of the concrete relations that carry specific, non-redistributable obligations.",
        difficulty: "applied",
      },
      {
        prompt: "Using Noddings's framework, what is the core problem with an 'AI companion' marketed as emotional support?",
        options: ["It lacks the relational structure of care, so it may reduce reported loneliness while leaving the actual absence the loneliness signals unaddressed", "It treats every user impartially rather than favoring those most in need", "It applies rigid deontological rules instead of weighing consequences", "It collects user data without consent, violating an explicit duty of care"],
        correctAnswerIndex: 0,
        explanation: "Noddings's framework holds that a system lacking the caring relation cannot truly care; it may lower reported loneliness while replacing relation with simulation and missing what the loneliness actually indicates an absence of.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "nussbaum",
    "Martha Nussbaum",
    "Martha Nussbaum: Capabilities, Vulnerability, and Human Dignity",
    "Tests Nussbaum's capabilities approach, the fragility of the good life, her theory of emotions, and tech-ethics applications.",
    [
      {
        prompt: "In The Fragility of Goodness, what did Nussbaum argue the Greek tragedians understood that Plato tried to escape?",
        options: ["That a flourishing life depends on relationships and external goods that luck can destroy, and this vulnerability is constitutive of its value", "That the good life can be made invulnerable to misfortune by locating it entirely in the agent's rational self-control", "That emotions are mere disturbances of reason that the wise person should learn to suppress entirely", "That justice requires only formal liberty, leaving outcomes to fall as fortune dictates"],
        correctAnswerIndex: 0,
        explanation: "Nussbaum argued the tragedians knew that loving others and committing to a city expose one to losses one cannot prevent, and that this fragility is a constitutive feature of a worthwhile life rather than an imperfection to engineer away.",
        difficulty: "conceptual",
      },
      {
        prompt: "Whose economic framework did Nussbaum build upon and give a neo-Aristotelian philosophical grounding to develop the capabilities approach?",
        options: ["John Rawls, whose theory of justice as fairness she extended directly", "Immanuel Kant, whose account of rational autonomy she formalized", "Amartya Sen, whose insight was that what matters is what people are able to do and be, not what they have", "Jeremy Bentham, whose utilitarian calculus she refined for development economics"],
        correctAnswerIndex: 2,
        explanation: "The capabilities approach was initiated by economist Amartya Sen as an alternative to welfare economics; Nussbaum took it and grounded it in a neo-Aristotelian account of human flourishing, specifying a list of central capabilities.",
        difficulty: "recall",
      },
      {
        prompt: "Nussbaum insists her list of central capabilities is 'deliberately pluralistic.' What does this commitment specifically entail?",
        options: ["That a society may pick whichever capabilities best fit its culture and ignore the rest", "That each capability must be secured separately and a deficiency in one cannot be compensated by abundance in another", "That capabilities should be ranked so that the most important ones override the others when they conflict", "That the list is fixed and universal, identical across all cultures and immune to revision"],
        correctAnswerIndex: 1,
        explanation: "For Nussbaum each capability must be brought above a threshold separately; the agent whose bodily health is assured but whose political voice is suppressed is not flourishing, so abundance in one capability cannot make up for a deficiency in another.",
        difficulty: "conceptual",
      },
      {
        prompt: "In Upheavals of Thought, what cognitive theory of the emotions did Nussbaum defend against the Kantian tradition?",
        options: ["That emotions are irrational bodily reflexes best excluded from ethical and legal reasoning", "That emotions are culturally arbitrary and therefore carry no genuine evaluative content", "That emotions are simply disturbances of reason that a mature moral agent learns to transcend", "That emotions are intelligent evaluations of the world, functioning as cognitive appraisals rather than mere feelings"],
        correctAnswerIndex: 3,
        explanation: "Upheavals of Thought argues, against the Kantian view that emotions are mere disturbances of reason, for a cognitive theory treating emotions as intelligent evaluations of the world.",
        difficulty: "recall",
      },
      {
        prompt: "A company deploys an AI hiring tool that systematically narrows which candidates ever reach a human recruiter. Using Nussbaum's capabilities approach as described for technology ethics, how is this best evaluated?",
        options: ["It fails the capabilities test by foreclosing affiliation, narrowing who gets professional access regardless of any net welfare gain", "It is acceptable as long as it increases the firm's overall utility and efficiency, since aggregate welfare is the proper measure", "It is permissible provided it does not violate any candidate's negative liberty or contractual rights", "It can only be judged by whether the recruiters using it act from virtuous character, not by the tool's effects"],
        correctAnswerIndex: 0,
        explanation: "The entry gives this exact example: rather than asking about welfare or rights, the capabilities approach asks whether a technology enables or forecloses specific capabilities, and an AI hiring tool that narrows affiliation fails the test concretely.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "rawls",
    "John Rawls",
    "John Rawls: Justice as Fairness Behind the Veil",
    "Tests Rawls's original position, veil of ignorance, two principles, the difference principle, and their bearing on AI ethics.",
    [
      {
        prompt: "In Rawls's thought experiment, what is the purpose of the 'veil of ignorance' that parties reason behind in the original position?",
        options: ["It guarantees that the principles chosen will maximize the total welfare of society", "It conceals each party's particular situation, so no one can tailor principles to their own advantage", "It ensures that only the most talented and productive members design society's institutions", "It allows each party to negotiate openly on behalf of their own community and religion"],
        correctAnswerIndex: 1,
        explanation: "The veil hides facts like one's wealth, sex, talents, and religion, so parties cannot rig the principles in their own favor and must reason from a genuinely general point of view.",
        difficulty: "recall",
      },
      {
        prompt: "What does Rawls's 'difference principle' actually require regarding socioeconomic inequality?",
        options: ["That all wealth be distributed equally among every member of society", "That inequalities are acceptable only if they maximize aggregate national welfare", "That inequalities are permissible only when arranged to the greatest benefit of the least advantaged", "That those with greater natural talents fully deserve and may keep whatever rewards their talents earn"],
        correctAnswerIndex: 2,
        explanation: "The difference principle does not demand equal distribution; it permits inequalities only insofar as they improve the position of society's worst-off members, as with a surgeon's higher pay that ultimately raises care for the poor.",
        difficulty: "recall",
      },
      {
        prompt: "Rawls rejected utilitarianism as a basis for justice primarily because he believed it",
        options: ["fails to take seriously the distinction between persons, treating individuals as mere variables in a welfare calculation", "places too much emphasis on protecting the property rights of the wealthy", "depends on religious and metaphysical premises that citizens no longer share", "cannot generate any concrete recommendations about how to govern a society"],
        correctAnswerIndex: 0,
        explanation: "Rawls argued utilitarianism's willingness to use some people as instruments for others' greater happiness ignores that each life has its own integrity and claim not to be treated merely as a variable in someone else's calculation.",
        difficulty: "conceptual",
      },
      {
        prompt: "An AI governance body must set rules for a hiring algorithm. Applying Rawls's method, which approach best reflects the original position and veil of ignorance?",
        options: ["Let the firms deploying the algorithm negotiate the rules, since they best understand the technology's value", "Choose whatever rules produce the largest total economic gain across all stakeholders combined", "Ask what rules you would accept without knowing whether you'd be the developer, the rejected applicant, or the surveilled worker", "Defer entirely to the candidates currently most advantaged in the labor market to set the standards"],
        correctAnswerIndex: 2,
        explanation: "The entry frames AI ethics' use of Rawls exactly this way: choosing principles without knowing which role you would occupy, an approach that reaches answers stakeholder-negotiation and utilitarian-aggregation framings cannot.",
        difficulty: "applied",
      },
      {
        prompt: "In Political Liberalism (1993), what problem did Rawls's idea of an 'overlapping consensus' address?",
        options: ["How to extend the difference principle into a single global distributive standard across all nations", "How a just society can ground its conception of justice given a deep, lasting pluralism of religious and moral doctrines", "How to prove that talents are deserved so that property rights can be treated as morally basic", "How to replace the veil of ignorance with direct bargaining among real communities"],
        correctAnswerIndex: 1,
        explanation: "Confronting the 'fact of reasonable pluralism,' Rawls sought a political (not comprehensive) conception of justice supported by an overlapping consensus of the reasonable doctrines citizens actually hold.",
        difficulty: "conceptual",
      },
    ]
  ),
  buildQuiz(
    "singer",
    "Peter Singer",
    "Peter Singer: Expanding the Moral Circle",
    "Tests understanding of Singer's utilitarianism, the famine argument, animal liberation, speciesism, and his relevance to AI moral status.",
    [
      {
        prompt: "In his 1972 essay \"Famine, Affluence, and Morality,\" Singer uses the analogy of a drowning child to argue which central point?",
        options: ["That we have duties only to those in our immediate physical vicinity", "That physical distance carries no moral weight, so failing to relieve distant suffering is as wrong as ignoring a drowning child you could easily save", "That charity is admirable but morally optional, never strictly required", "That governments, not individuals, bear sole responsibility for relieving famine"],
        correctAnswerIndex: 1,
        explanation: "Singer argues that if we can prevent great suffering at moderate cost, we ought to, and that distance makes no moral difference, so ignoring distant famine is the same kind of failure as letting a nearby child drown.",
        difficulty: "recall",
      },
      {
        prompt: "Singer coined or popularized the term \"speciesism.\" What does it denote, and to what does he compare it?",
        options: ["A scientific method for ranking species by cognitive complexity, analogous to taxonomy", "The view that only humans can suffer, which he compares to a religious doctrine", "The prejudice of privileging members of one's own species simply because they are one's own, structurally akin to racism and sexism", "A policy of conserving endangered species, which he compares to environmental stewardship"],
        correctAnswerIndex: 2,
        explanation: "Singer defines speciesism as favoring one's own species merely because it is one's own, and argues it is structurally the same kind of prejudice as racism and sexism.",
        difficulty: "recall",
      },
      {
        prompt: "How does Singer's \"preference utilitarianism\" refine classical (hedonistic) utilitarianism?",
        options: ["It holds that only the immediate pleasure and pain of the present moment carry moral weight", "It restricts moral concern to rational human agents capable of articulating preferences in language", "It replaces the goal of well-being with strict adherence to inviolable individual rights", "It counts the satisfaction or frustration of any being's preferences, including preferences for continued life and completing projects, widening the circle beyond momentary pleasure or pain"],
        correctAnswerIndex: 3,
        explanation: "Preference utilitarianism weighs the satisfaction or frustration of preferences (such as for continued life or completing projects) of any being capable of having them, going beyond the immediate pleasure or pain that classical hedonistic utilitarianism centers on.",
        difficulty: "conceptual",
      },
      {
        prompt: "The entry notes that late in his career Singer (with Katarzyna de Lazari-Radek) argued for a return to classical hedonistic utilitarianism. What does this reversal best illustrate about his method?",
        options: ["That he follows arguments where they lead, even when it means revising a position he long held", "That he ultimately abandoned utilitarianism in favor of virtue ethics", "That he prioritizes conventional moral intuitions over argumentative consistency", "That he regards metaethical analysis of moral language as the central task of ethics"],
        correctAnswerIndex: 0,
        explanation: "The shift back toward hedonistic utilitarianism, because the preference view faced unsolved difficulties, is described as characteristic of Singer following arguments wherever they go rather than clinging to a prior position.",
        difficulty: "conceptual",
      },
      {
        prompt: "A lab is debating whether highly advanced AI systems could ever warrant moral consideration. How does Singer's framework most directly bear on this question?",
        options: ["It rules the question out, since moral status depends on biological species membership", "It settles the matter by declaring that current AI systems already have morally significant welfare", "Its expanding-circle logic implies that if capacity for suffering grounds moral status and AI could one day have something like suffering, then what we owe AI becomes a serious question, though Singer himself stays cautious about present systems", "It treats the question as a science-fiction distraction unworthy of philosophical attention"],
        correctAnswerIndex: 2,
        explanation: "Singer's expanding-circle argument grounds moral consideration in the capacity for suffering, making AI moral status a serious question if such systems could ever suffer, while Singer himself has not claimed current AI has morally considerable welfare.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "plato",
    "Plato",
    "Plato: The Forms, the Cave, and the Just Soul",
    "Tests Plato's Theory of Forms, tripartite soul, justice as harmony, and the Republic's bearing on AI governance.",
    [
      {
        prompt: "In Plato's Theory of Forms, what is the ultimate basis of ethics according to the entry?",
        options: ["Maximizing pleasure and minimizing pain across a community", "Following the customary laws and traditions of one's city", "Aligning the soul with an eternal realm of unchanging reality grasped by reason", "Negotiating fair contracts among self-interested citizens"],
        correctAnswerIndex: 2,
        explanation: "Plato held that behind the changeable world of appearances lies a realm of unchanging Forms, so ethics becomes a matter of aligning the soul with what is truly real, grasped by reason.",
        difficulty: "recall",
      },
      {
        prompt: "For Plato, what makes a person just?",
        options: ["The rational, spirited, and appetitive parts of the soul are properly ordered under reason's rule", "They consistently follow a fixed set of moral rules without exception", "They reliably maximize good outcomes for the greatest number", "They suppress the appetitive and spirited parts entirely, leaving only reason"],
        correctAnswerIndex: 0,
        explanation: "Plato defines justice as inner harmony: not rule-following or outcome-maximizing, but the tripartite soul's parts finding their proper order under the rule of reason.",
        difficulty: "conceptual",
      },
      {
        prompt: "The entry says the 'noble lie' of the Republic is the founding example of which modern concept?",
        options: ["Informed consent in research ethics", "Manufactured consent", "The social contract", "The tragedy of the commons"],
        correctAnswerIndex: 1,
        explanation: "The noble lie (the myth of the metals, used to stabilize the class structure) is identified as the founding example of what we now call manufactured consent.",
        difficulty: "recall",
      },
      {
        prompt: "A platform argues it may subtly manipulate users' choices because doing so produces outcomes its designers judge to be beneficial. According to the entry, this debate runs directly through which Platonic problem?",
        options: ["The myth of Er and the choices that shape one's next life", "The immortality of the soul argued in the Phaedo", "Love's ascent from beautiful bodies to Beauty itself", "The 'noble lie' and whether user-manipulation can be justified by allegedly beneficial outcomes"],
        correctAnswerIndex: 3,
        explanation: "The entry states that contemporary platform-design debates over whether manipulation can be justified by beneficial outcomes run directly through the Platonic problem of the noble lie.",
        difficulty: "applied",
      },
      {
        prompt: "The entry frames 'whether a benevolent technocracy can ever be legitimate' as the core question of AI governance. Which Platonic idea is this identified with?",
        options: ["The philosopher-king problem", "The Allegory of the Cave", "The tripartite division of the soul", "Love as ascent to the Good"],
        correctAnswerIndex: 0,
        explanation: "The entry explicitly calls the philosopher-king problem—whether a benevolent technocracy can ever be legitimate—the core question of AI governance.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "mencius",
    "Mencius",
    "Mencius: The Four Sprouts and Innate Goodness",
    "Tests understanding of Mencius's claim that human nature is good, the four sprouts, humane government, and their bearing on technology design.",
    [
      {
        prompt: "What is Mencius's central and distinctive theoretical claim about human nature?",
        options: ["Human nature is fundamentally good, containing innate sprouts of virtue", "Human nature is morally neutral, taking the shape of whatever channels it", "Human nature is inherently selfish and must be restrained by harsh law", "Human nature is unknowable, so ethics must rest on ritual alone"],
        correctAnswerIndex: 0,
        explanation: "Mencius gave Confucianism a theoretical spine by arguing that every human is born fundamentally good, with four innate 'sprouts' that grow into the full virtues if cultivated.",
        difficulty: "recall",
      },
      {
        prompt: "Mencius pairs each of the four sprouts with a virtue it grows into. Which pairing is correct?",
        options: ["The sprout of courtesy grows into wisdom (zhi)", "The sprout of judgment grows into humaneness (ren)", "The sprout of compassion grows into humaneness (ren)", "The sprout of shame grows into ritual propriety (li)"],
        correctAnswerIndex: 2,
        explanation: "In Mencius's scheme the sprout of compassion grows into humaneness (ren); shame grows into righteousness, courtesy into ritual propriety, and judgment into wisdom.",
        difficulty: "recall",
      },
      {
        prompt: "In the famous thought experiment, a person sees a child about to fall into a well. What does Mencius say this scenario demonstrates?",
        options: ["That people help only when they expect a reward or fear the parents' blame", "That the spontaneous surge of alarm and pity reveals the innate sprout of humaneness", "That moral behavior must be taught through ritual before it can appear", "That human responses to suffering are learned and culturally variable"],
        correctAnswerIndex: 1,
        explanation: "Mencius argues the rescuer acts not from calculation, fear of censure, or dislike of the cries, but because pity simply surges up, showing the sprout of humaneness is innate and spontaneous.",
        difficulty: "conceptual",
      },
      {
        prompt: "How did Mencius's political philosophy treat a ruler who had lost the Mandate of Heaven?",
        options: ["Such a ruler retained absolute authority because order outweighs the people's welfare", "Such a ruler could be justly deposed, since the state exists for the people, not the reverse", "Such a ruler should withdraw into Daoist non-action and let events unfold", "Such a ruler had to be obeyed until Heaven sent an unmistakable omen"],
        correctAnswerIndex: 1,
        explanation: "Mencius held that the state exists for the people, that economic conditions shape moral character, and that a ruler who has lost the Mandate of Heaven may justly be deposed.",
        difficulty: "conceptual",
      },
      {
        prompt: "Applying Mencius's view that the sprouts are natural but require cultivation, how would he most likely assess a social platform that reduces other people to data points and gamifies reactions into pure engagement?",
        options: ["Neutral, because for Mencius moral character is fixed at birth and unaffected by environment", "Beneficial, because any system that maximizes attention also strengthens moral judgment", "Harmful, because such an environment performs the reverse of the cultivation the sprouts need, training users out of commiseration and judgment", "Irrelevant, since Mencius believed virtue depends only on correct ritual performance"],
        correctAnswerIndex: 2,
        explanation: "Mencius held the sprouts are natural but not automatic and atrophy without cultivation, so an environment that strips away commiseration, shame, deference, and judgment does the reverse of moral development.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "laozi",
    "Laozi",
    "Laozi: The Way of Effortless Action",
    "Tests understanding of Laozi's Daodejing — wuwei, ziran, yielding, the unnameable Dao, and their bearing on technology ethics.",
    [
      {
        prompt: "According to the entry, the Daodejing advances an ethics 'almost opposite' to which dominant tradition of its time?",
        options: ["Mohist universal love and consequentialism", "Confucianism, with its rituals, hierarchies, and deliberate self-cultivation", "Legalist rule by strict law and punishment", "Buddhist renunciation and the cessation of desire"],
        correctAnswerIndex: 1,
        explanation: "The entry frames the Daodejing in direct contrast to the Confucian project, which prescribed elaborate rituals, clear hierarchies, and deliberate self-cultivation.",
        difficulty: "recall",
      },
      {
        prompt: "The text famously declares that 'the Dao that can be named is not the eternal Dao.' What does this reflect about the Dao in Laozi's thought?",
        options: ["It is a personal deity who issues explicit moral commands", "It is a precise legal code that can be fully written down", "It is deliberately beyond definition — the unnameable source of the ten thousand things", "It is identical to the Confucian rituals once they are perfected"],
        correctAnswerIndex: 2,
        explanation: "The entry stresses that the Dao is deliberately beyond definition, the source from which the ten thousand things emerge and to which they return, operating through emptiness rather than imposition.",
        difficulty: "conceptual",
      },
      {
        prompt: "How does the entry characterize 'wuwei' as practiced by the Daoist sage?",
        options: ["Effortless, non-coercive action that yields, empties, and returns rather than striving", "Total inaction and withdrawal from all worldly affairs", "Forceful intervention to impose order on a chaotic world", "Strict adherence to ritual propriety as the highest virtue"],
        correctAnswerIndex: 0,
        explanation: "The entry describes wuwei as effortless action in accord with the grain of a situation; the sage does not strive but yields, empties, and returns, as water wears stone through patient lowness.",
        difficulty: "conceptual",
      },
      {
        prompt: "The entry notes that Daoist ethics is 'not antinomian.' Which set of values does it affirm the Daodejing genuinely upholds?",
        options: ["Ambition, cleverness in governance, and forceful moral instruction", "Elaborate ritual propriety and rigid social hierarchy", "Compassion (ci), frugality (jian), and a refusal to presume oneself above others", "Conquest, accumulation of wealth, and assertive self-promotion"],
        correctAnswerIndex: 2,
        explanation: "While rejecting Confucian propriety, the text still values compassion (ci), frugality (jian), and not presuming oneself above others — showing Daoism is not without positive moral content.",
        difficulty: "recall",
      },
      {
        prompt: "A design team plans to aggressively optimize an app to push users into changing their behavior until they reshape to the system's goals. On the Daoist reading in the entry, what would this be called and what would it predict?",
        options: ["It exemplifies wuwei and would produce calm, durable engagement", "It expresses de (virtue-power) and would naturally empower users", "It enacts ziran and would let users 'do it themselves'", "It is wei (striving, forcing, anxious interference) and would produce brittle results, user exhaustion, and backlash"],
        correctAnswerIndex: 3,
        explanation: "The entry labels aggressive, forced behavior change as wei and predicts it yields brittle results, user exhaustion, and unanticipated backlash, contrasting it with wuwei design that follows the grain of human cognition.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "maimonides",
    "Moses Maimonides",
    "Moses Maimonides: Law, Reason, and the Path to God",
    "Tests Maimonides' synthesis of Torah and Aristotelian reason, his ethics of character, and their bearing on technology ethics.",
    [
      {
        prompt: "In the Guide of the Perplexed, what is Maimonides' core claim about how we should understand statements that scripture seems to make literally about God (that He is angry, walks, or has a face)?",
        options: ["Such statements prove that God has a physical, human-like body that reason cannot deny", "They must be read figuratively, since what God truly is cannot be captured in human language", "They should be rejected entirely as later corruptions of the original Torah text", "They are literally true for the unlearned but figuratively true for philosophers"],
        correctAnswerIndex: 1,
        explanation: "Maimonides argued that anthropomorphic descriptions of God must be read figuratively, leading to a via negativa in which we know God best by saying what He is not, because His nature exceeds human language.",
        difficulty: "recall",
      },
      {
        prompt: "Maimonides' treatment of virtue in Hilkhot De'ot is described as a 'Jewish Aristotelianism.' Which statement best captures his view of how virtues are formed and structured?",
        options: ["Virtues are innate gifts of grace that practice can neither create nor strengthen", "Virtue consists in always choosing the most extreme, self-denying option available", "Virtues are dispositions built by repeated action, each a mean between extremes, with rare exceptions like humility leaning toward the safer extreme", "Virtue is purely a matter of correct belief, with outward action being ethically irrelevant"],
        correctAnswerIndex: 2,
        explanation: "For Maimonides, virtues are dispositions formed by repeated action and generally stand as a mean between extremes, except in a few matters such as humility where one deliberately leans away from the middle toward the safer extreme.",
        difficulty: "conceptual",
      },
      {
        prompt: "According to the entry, what does Maimonides identify as the highest human end, toward which ethical life is ultimately directed?",
        options: ["The cultivation of intellect and character until one is capable of rational communion with the divine", "The maximization of pleasure and the avoidance of pain across a community", "Strict, literal obedience to every commandment without any interpretive reflection", "The accumulation of wealth sufficient to practice charity at every level"],
        correctAnswerIndex: 0,
        explanation: "On Maimonides' view, ethics is the cultivation of intellect and character until a person becomes capable of rational communion with the divine, which is the highest human end (intellectual perfection).",
        difficulty: "recall",
      },
      {
        prompt: "An engineering team finds that their company's code of ethics, written years ago, no longer fits a new AI system it never anticipated. Which response best reflects Maimonides' model for handling tensions between established rules and new circumstances?",
        options: ["Rigidly adhere to the letter of the existing code, since the rules must never be reinterpreted", "Abandon rule-governance entirely in favor of pure case-by-case judgment", "Discard the old code and wait until regulators write an entirely new framework before acting", "Interpret the rule by asking what it was originally trying to protect and how to honor that protection under the new conditions"],
        correctAnswerIndex: 3,
        explanation: "The Maimonidean response is neither rigid literalism nor abandonment of rules, but the harder interpretive work of asking what the original rule sought to protect and how to honor that protection in new conditions.",
        difficulty: "applied",
      },
      {
        prompt: "Maimonides' Eight Levels of Charity rank forms of giving from lowest to highest. What stands at the highest level?",
        options: ["Giving generously but only after being asked directly by the person in need", "Empowering another to become self-sufficient so they no longer need charity", "Giving anonymously to a public fund administered by the community", "Giving cheerfully but in an amount smaller than one can truly afford"],
        correctAnswerIndex: 1,
        explanation: "Maimonides' eight levels of charity ascend from grudging giving to the highest form: empowering another person to reach self-sufficiency.",
        difficulty: "conceptual",
      },
    ]
  ),
  buildQuiz(
    "aquinas",
    "Thomas Aquinas",
    "Thomas Aquinas: Natural Law and the Reason-Ordered Good",
    "Tests Aquinas's four-fold law, virtues, double effect, and just-war ideas, plus their bearing on technology ethics.",
    [
      {
        prompt: "In Aquinas's four-fold scheme of law, which tier is defined as eternal law insofar as it is knowable by human reason reflecting on human nature?",
        options: ["Human law", "Divine law", "Natural law", "Positive law"],
        correctAnswerIndex: 2,
        explanation: "Natural law is eternal law as grasped by human reason reflecting on human nature, yielding precepts (life, procreation, sociability, knowledge of truth) binding on everyone regardless of faith.",
        difficulty: "recall",
      },
      {
        prompt: "Aquinas added three theological virtues to Aristotle's four cardinal virtues. How does he say the theological virtues are acquired, in contrast to the cardinal ones?",
        options: ["They are infused by grace rather than built up by practice", "They are inherited at birth from one's noble lineage", "They are legislated by human law in particular communities", "They are deduced geometrically from first definitions"],
        correctAnswerIndex: 0,
        explanation: "For Aquinas the cardinal virtues (prudence, justice, fortitude, temperance) can be acquired by practice, but the theological virtues of faith, hope, and love are infused by grace.",
        difficulty: "recall",
      },
      {
        prompt: "What is the central distinction at the heart of Aquinas's doctrine of double effect?",
        options: ["Between laws made by the state and laws revealed in scripture", "Between intending a harm and merely foreseeing it as a side effect", "Between virtues acquired by habit and virtues given by grace", "Between an erring conscience and a correctly formed conscience"],
        correctAnswerIndex: 1,
        explanation: "Double effect turns on the distinction between intending harm and foreseeing harm as an unintended side effect, allowing nuanced judgments where intended and foreseen consequences diverge.",
        difficulty: "conceptual",
      },
      {
        prompt: "The entry frames Aquinas's moral reasoning as 'neither pure appeal to authority nor pure autonomy.' What does this characterization capture?",
        options: ["That ethics is derived geometrically from axioms like Euclid's proofs", "That morality is whatever an individual freely chooses for themselves", "That right and wrong depend solely on commands issued by the Church", "That reason can derive much of ethics on its own, yet tracks a moral reality humans did not create"],
        correctAnswerIndex: 3,
        explanation: "Aquinas holds we can derive much of ethics by reason alone (not pure authority), but reason rightly used tracks a real moral order we did not invent (not pure autonomy).",
        difficulty: "conceptual",
      },
      {
        prompt: "A hospital deploys an AI triage system that, in allocating scarce ICU beds, will predictably leave some lower-priority patients without care as a side effect of prioritizing those most likely to survive. Which Thomist tool is most directly suited to evaluating whether this is permissible?",
        options: ["The doctrine of double effect, distinguishing intended outcomes from foreseen side effects", "The intellectual love of God as serene participation in eternity", "The conatus, each being's striving to persevere in existence", "Deus sive Natura, the identification of God with Nature"],
        correctAnswerIndex: 0,
        explanation: "Double effect is designed for exactly such cases, judging actions whose intended consequences (saving the most lives) differ from foreseen ones (harm to others); the other options belong to Spinoza, not Aquinas.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "spinoza",
    "Baruch Spinoza",
    "Baruch Spinoza: Substance, Conatus, and the Freedom of Understanding",
    "Tests Spinoza's monism, conatus, his view of freedom as understanding necessity, and its bearing on AI explainability.",
    [
      {
        prompt: "What does Spinoza's phrase 'Deus sive Natura' (God or Nature) express about the structure of reality?",
        options: ["A transcendent creator God who designed and stands apart from the natural world", "Two competing substances, mind and matter, locked in eternal opposition", "A single infinite substance, so that God and Nature are two names for the same thing", "The idea that nature is an illusion projected by the divine mind"],
        correctAnswerIndex: 2,
        explanation: "For Spinoza there is no creator separate from the universe; 'Deus sive Natura' names one infinite substance expressing itself in everything that exists.",
        difficulty: "recall",
      },
      {
        prompt: "In Spinoza's ethics, what is the 'conatus'?",
        options: ["Each being's striving to persevere in its own existence", "The transcendent moral law that commands all rational beings", "The social contract by which the multitude transfers its power to a state", "A fleeting sadness that signals a decrease in the mind's power"],
        correctAnswerIndex: 0,
        explanation: "Conatus is the striving of every being to persist in existence; for Spinoza, acting from this nature is virtue, while being acted upon by outside forces is vice.",
        difficulty: "recall",
      },
      {
        prompt: "Spinoza redefines freedom not as doing whatever one wants, but as which of the following?",
        options: ["Liberation from all desire and emotion through ascetic withdrawal", "The unconstrained exercise of an undetermined free will", "Obedience to the commands of legitimate religious authority", "Acting from a clear comprehension of one's place in the whole, i.e. understanding necessity"],
        correctAnswerIndex: 3,
        explanation: "For Spinoza unfree action is action performed in ignorance of its own causes; greater understanding of how one follows from the whole is itself the path to greater freedom.",
        difficulty: "conceptual",
      },
      {
        prompt: "How does the Spinozist case for AI interpretability research differ from a deontological or utilitarian one, according to the entry?",
        options: ["It claims users have an inviolable right to an explanation of any decision affecting them", "It argues that opaque systems produce a specific collective unfreedom that only the pursuit of understanding can remedy", "It holds that explanations should be provided only when they measurably improve outcomes", "It rejects interpretability as a distraction from aligning systems with the natural order"],
        correctAnswerIndex: 1,
        explanation: "The Spinozist argument is neither rights-based nor outcome-based: opaque systems leave both users and operators acted upon by causes they cannot trace, and understanding is the only cure for that unfreedom.",
        difficulty: "applied",
      },
      {
        prompt: "Spinoza's identification of nature with God (deus sive natura) has been credited with underwriting which contemporary movement, notably through Arne Naess?",
        options: ["Deep-ecology environmental ethics that treats the natural order as intrinsically valuable", "Logical positivism and the verification theory of meaning", "Social contract theory and the legitimacy of the liberal state", "Utilitarian welfare economics and cost-benefit analysis"],
        correctAnswerIndex: 0,
        explanation: "Because nature is the very substance of everything, it is intrinsically valuable; this Spinozist intuition influenced deep-ecology thought through Arne Naess and others.",
        difficulty: "conceptual",
      },
    ]
  ),
  buildQuiz(
    "wollstonecraft",
    "Mary Wollstonecraft",
    "Mary Wollstonecraft: Reason, Rights, and Material Conditions",
    "Tests Wollstonecraft's case that formal rights are empty without the educational and material conditions to exercise them.",
    [
      {
        prompt: "In A Vindication of the Rights of Woman, how does Wollstonecraft explain the 'frivolity' and vanity often attributed to the women of her era?",
        options: ["As an innate feature of female nature that education cannot alter", "As a predictable effect of the social cages and denied education built around women", "As a moral failing women freely choose out of laziness", "As a virtue that complements the rational seriousness of men"],
        correctAnswerIndex: 1,
        explanation: "Wollstonecraft argued that women's apparent frivolity was not a fact about female nature but a predictable effect of being denied rigorous education and confined by socially constructed cages.",
        difficulty: "recall",
      },
      {
        prompt: "Wollstonecraft's core philosophical strategy is best described as which of the following?",
        options: ["Rejecting Enlightenment reason in favor of sentiment and feeling", "Defending hereditary tradition against revolutionary change", "Taking the Enlightenment's premise about reason seriously enough to apply it consistently to women", "Grounding women's rights in religious revelation rather than reason"],
        correctAnswerIndex: 2,
        explanation: "Her central move was to apply the Enlightenment premise consistently: if human dignity rests on reason and education develops reason, then denying women education denies them full personhood.",
        difficulty: "conceptual",
      },
      {
        prompt: "Why does Wollstonecraft argue that a married woman economically dependent on her husband cannot fully cultivate virtue?",
        options: ["Because genuine virtue requires independence and the capacity for principled action, which dependence undermines", "Because virtue is reserved for those engaged in public political office", "Because marriage itself is inherently corrupting to moral character", "Because women are naturally less capable of virtue than men"],
        correctAnswerIndex: 0,
        explanation: "Drawing on republican and dissenting traditions, she held that genuine virtue requires independence and reason, so economic dependence on a husband stunts virtue just as hereditary power stunts a king's.",
        difficulty: "conceptual",
      },
      {
        prompt: "A government agency announces that a critical benefits service is now available online, claiming this guarantees 'access' for all citizens. Applying Wollstonecraft's central argument, what is the strongest critique?",
        options: ["Online services are inherently superior, so the rollout needs no further scrutiny", "Access should be restricted to citizens who already demonstrate digital literacy", "The agency should abandon the service because technology cannot solve social problems", "Formal access is empty without the material conditions—broadband, literacy, time, social capital—needed to actually exercise it"],
        correctAnswerIndex: 3,
        explanation: "Wollstonecraft's insistence that formal rights without the material conditions for their exercise are empty rhetoric maps directly onto digital equity: 'access' means nothing without broadband, literacy, leisure, and accountability.",
        difficulty: "applied",
      },
      {
        prompt: "The entry notes a genealogical link from Wollstonecraft to the contemporary field of technology ethics. What is that connection?",
        options: ["Her daughter Mary Shelley's Frankenstein extends her concerns with creation, education, and a creator's responsibility, and is read as the founding English-language work of technology ethics", "She personally wrote the first treatise on machine ethics late in her life", "She collaborated with John Dewey on theories of democratic technological participation", "She designed early educational automata that inspired later roboticists"],
        correctAnswerIndex: 0,
        explanation: "The entry traces the lineage through her daughter Mary Shelley's Frankenstein—a meditation on creation, education, and creator responsibility—which it identifies as the founding English-language work of technology ethics.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "arendt",
    "Hannah Arendt",
    "Hannah Arendt: Thinking, Action, and the Banality of Evil",
    "Tests understanding of Arendt's account of evil, action, statelessness, and judgment, and their bearing on algorithmic harm.",
    [
      {
        prompt: "What did Arendt mean by her phrase \"the banality of evil,\" coined in her report on the Eichmann trial?",
        options: ["That evil is ultimately trivial and not worth serious moral concern", "That catastrophic harm can proceed from thoughtlessness — the absence of the inner dialogue with oneself that is the basis of conscience", "That evil is an inborn demonic quality possessed by a small number of monstrous individuals", "That ordinary people are fundamentally good and only commit harm when physically coerced"],
        correctAnswerIndex: 1,
        explanation: "Arendt's phrase did not trivialize evil; it named how immense harm can come from thoughtlessness, from people like Eichmann who could not think from another's perspective and lacked the interior dialogue that grounds conscience.",
        difficulty: "recall",
      },
      {
        prompt: "In The Human Condition, Arendt distinguishes three modes of the active life. Which one is the distinctively political activity that she worried modern mass society had nearly extinguished?",
        options: ["Action — appearing among equals, speaking, and beginning something new", "Labor — the repetitive tasks of biological maintenance", "Work — the fabrication of durable things", "Contemplation — the solitary philosophical life of thought"],
        correctAnswerIndex: 0,
        explanation: "Arendt's triad is labor, work, and action; action is the political activity of appearing among equals and beginning anew, and she argued modern society had collapsed labor and work into dominance while nearly extinguishing the space for genuine action.",
        difficulty: "conceptual",
      },
      {
        prompt: "Arendt rejected being called a \"philosopher,\" preferring \"political theorist.\" Why?",
        options: ["She believed political theory was a more prestigious and lucrative academic title", "She held that ethics should be reduced to a precise theory of right action, which philosophy lacked", "She thought philosophy's orientation toward the contemplative life had misled it about politics", "She rejected all of Aristotle, Kant, and Augustine and so refused any philosophical lineage"],
        correctAnswerIndex: 2,
        explanation: "Arendt preferred \"political theorist\" because she thought philosophy's bias toward the contemplative life had distorted its understanding of politics; notably, she still drew on Aristotle, Kant, and Augustine while rejecting systems.",
        difficulty: "conceptual",
      },
      {
        prompt: "A platform's automated system classifies users and denies them services, with no meaningful way to appeal or be heard. Which Arendtian concept most directly anticipates the plight of these algorithmically governed persons?",
        options: ["Natality — the human capacity to begin something new", "Plurality — the condition that we are each distinct yet share a common world", "The collapse of work into labor in modern mass society", "\"The right to have rights\" — civic standing evacuated by unilateral, unappealable decisions"],
        correctAnswerIndex: 3,
        explanation: "Arendt's \"right to have rights\" describes persons whose civic standing is stripped away and whose grievances have nowhere to be heard, which the entry presents as anticipating the situation of those governed by unappealable platform decisions.",
        difficulty: "applied",
      },
      {
        prompt: "Under the entry's reading, why are the engineers, compliance officers, and managers behind documented algorithmic harms \"Eichmanns in Arendt's technical sense\"?",
        options: ["Because they harbor secret malicious intent that drives them to cause harm deliberately", "Because they follow procedures and hit targets while outsourcing the work of thinking to a system that does not do it", "Because they openly reject their organizations' codes of ethics and act against stated policy", "Because they are stateless persons stripped of the right to have rights"],
        correctAnswerIndex: 1,
        explanation: "The Arendtian diagnosis is that harm comes not from bad actors but from blameless functionaries who have stopped thinking — meeting targets and following procedures while outsourcing judgment to a system; hence the entry's call for cultivated judgment over mere better policy.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "murdoch",
    "Iris Murdoch",
    "Iris Murdoch: Attention, Unselfing, and the Reality of the Good",
    "Tests Murdoch's claim that moral life is grounded in patient, loving attention rather than the moment of choice.",
    [
      {
        prompt: "According to Murdoch, where does the central moral business of life actually take place?",
        options: ["In the decisive moment of choice, where the will commits to an action", "In the long-running, ongoing activity of how we see and perceive other people", "In the public consequences our actions produce for the greatest number", "In the rational derivation of universal maxims that bind all agents"],
        correctAnswerIndex: 1,
        explanation: "Murdoch argued that the central moral fact is not the moment of choice but the slow labor of attention and seeing, since what a person can see determines what they can choose.",
        difficulty: "recall",
      },
      {
        prompt: "What does Murdoch mean by 'unselfing'?",
        options: ["Dissolving one's personal identity entirely into a collective or community", "Suppressing all emotion so that moral judgments can be coldly rational", "The steady removal of the greedy self that colors everything it sees with its own fears and desires", "Sacrificing one's own interests whenever they conflict with another's preferences"],
        correctAnswerIndex: 2,
        explanation: "Unselfing is the disciplined removal of the egoistic self so one can perceive reality accurately; activities like art, love, and contemplation of nature foster it.",
        difficulty: "conceptual",
      },
      {
        prompt: "Drawing on Plato, what did Murdoch claim about the status of the Good?",
        options: ["The Good is real and exists independently, and our task is to become capable of perceiving it", "The Good is a useful fiction we project onto the world through acts of will", "The Good is whatever a society collectively agrees to value at a given time", "The Good is reducible to dispositions to behave in certain observable ways"],
        correctAnswerIndex: 0,
        explanation: "Reading Plato as the greatest of moralists, Murdoch held that the Good is real rather than a projection of will or feeling, so we must learn to perceive values, not invent them.",
        difficulty: "recall",
      },
      {
        prompt: "In 'The Idea of Perfection,' what target was Murdoch principally arguing against?",
        options: ["Utilitarian calculations that aggregate pleasure and pain across populations", "Existentialist accounts that make authentic choice the foundation of value", "Religious theism that grounds morality in divine command", "The Oxford behaviorism of her teachers, which reduced moral concepts to dispositions to act"],
        correctAnswerIndex: 3,
        explanation: "The essay mounts an extended argument against Oxford behaviorism, insisting that the moral life takes place largely in the privacy of perception rather than in outward dispositions to act.",
        difficulty: "conceptual",
      },
      {
        prompt: "A design team builds a social platform that rewards instant reactions and reduces people to scored tokens for approval or condemnation. How would a Murdochian critique frame this?",
        options: ["It is acceptable so long as the aggregate outcomes maximize user satisfaction", "It does the opposite of real moral work, because it short-circuits the slow, loving attention by which we come to see persons as real", "It is morally neutral, since technology merely reflects whatever values users already hold", "It is praiseworthy because rapid judgment lets communities enforce shared norms efficiently"],
        correctAnswerIndex: 1,
        explanation: "Murdoch held that moral change happens through patient, loving attention to the reality of others, so design that rewards fast reactions and reduces persons to scores does the opposite of that moral work.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "appiah",
    "Kwame Anthony Appiah",
    "Kwame Anthony Appiah: Cosmopolitanism Across Difference",
    "Tests Appiah's rooted cosmopolitanism, identity as social script, moral revolutions, and their bearing on global tech governance.",
    [
      {
        prompt: "In Cosmopolitanism: Ethics in a World of Strangers, Appiah holds two commitments in productive tension. What are they?",
        options: ["Maximizing aggregate welfare and minimizing individual rights violations", "Universal concern for all human beings and respect for legitimate difference", "Loyalty to one's own tradition and rejection of all outside influence", "Strict moral relativism and the abolition of national borders"],
        correctAnswerIndex: 1,
        explanation: "Appiah pairs universal concern (we have obligations to all humans, not only those who share our traditions) with respect for legitimate difference (we cannot insist everyone be like us to count).",
        difficulty: "recall",
      },
      {
        prompt: "In The Ethics of Identity, Appiah characterizes identities such as race, nation, and religion as:",
        options: ["Fixed essences that determine a person's nature from birth", "Illusions that should be discarded entirely as meaningless", "Social scripts that are real and important but can be rewritten within limits", "Purely economic categories produced by class relations"],
        correctAnswerIndex: 2,
        explanation: "Appiah argues identities are real and worth taking seriously, but are social scripts rather than essences, leaving us free within limits to write them into new shapes.",
        difficulty: "conceptual",
      },
      {
        prompt: "According to The Honor Code, what primarily drove moral revolutions like the ends of dueling, foot-binding, and Atlantic slavery?",
        options: ["Shifts in the sense of what it was honorable to be seen as, more than new moral arguments", "The discovery of entirely new ethical principles previously unknown", "Economic incentives that made the practices unprofitable", "Top-down legal bans imposed before any change in public sentiment"],
        correctAnswerIndex: 0,
        explanation: "Appiah argues each revolution turned less on new moral arguments than on shifts in the sense of honor, what it was honorable to be seen as.",
        difficulty: "recall",
      },
      {
        prompt: "A global AI governance body is debating rules for a system deployed across dozens of regulatory regimes. Which approach best reflects Appiah's cosmopolitan method?",
        options: ["Impose Silicon Valley's moral assumptions universally to guarantee a single consistent standard", "Treat each culture's rules as wholly incommensurable so no shared obligations can be required", "Pursue extended conversation across difference, respecting legitimate difference while still enabling concrete cooperative obligations", "Defer entirely to whichever jurisdiction holds the most economic power"],
        correctAnswerIndex: 2,
        explanation: "Appiah's method respects legitimate difference (so local assumptions are not imposed as universal) while enabling concrete obligations so that 'cultural difference' cannot excuse harm.",
        difficulty: "applied",
      },
      {
        prompt: "How does Appiah respond to critics who accuse him of being too moderate on questions of identity and difference?",
        options: ["He concedes that moderation means avoiding firm commitments to keep the peace", "He argues moderation is not the absence of commitment but the conviction that opponents are people and persuasion's work is unfinished", "He insists that only his own side possesses the correct moral arguments", "He withdraws from public debate to focus solely on analytic philosophy"],
        correctAnswerIndex: 1,
        explanation: "Appiah holds that moderation, properly understood, is not the absence of commitment but the conviction that those on the other side are people and the long work of persuasion is not yet done.",
        difficulty: "conceptual",
      },
    ]
  ),
  buildQuiz(
    "dewey",
    "John Dewey",
    "John Dewey: Inquiry, Democracy, and the Eclipsed Public",
    "Tests understanding of Dewey's pragmatism, the eclipse of the public, education as inquiry, and technology as moral infrastructure.",
    [
      {
        prompt: "Dewey diagnosed a condition he called \"the eclipse of the public.\" In The Public and Its Problems (1927), what does this phrase describe?",
        options: ["The decline of voter turnout as citizens lose faith in democratic elections", "The way modern technologies create publics affected by decisions that cannot recognize or organize themselves as a public", "The replacement of public reason by private religious conviction in political debate", "The capture of public institutions by private corporate interests"],
        correctAnswerIndex: 1,
        explanation: "Dewey argued that modern communications and industrial technologies create situations (e.g., a factory polluting rivers across several cities) where the affected public exists but lacks the institutional machinery to identify itself and act collectively.",
        difficulty: "recall",
      },
      {
        prompt: "A central, distinctive claim of Dewey's pragmatism is that knowing and doing are:",
        options: ["Two phases of one continuous process, so that a belief is a disposition to act rather than a private internal state", "Fundamentally separate, with knowledge providing fixed principles that action then applies to cases", "Both ultimately reducible to subjective emotional preferences with no rational structure", "Governed by a priori categories of the understanding prior to any experience"],
        correctAnswerIndex: 0,
        explanation: "Dewey insisted knowledge and action are continuous; for him a belief is a disposition to act and a value is a pattern of engagement, so any ethics treating them as separable mistakes what ethics is.",
        difficulty: "conceptual",
      },
      {
        prompt: "Dewey's pragmatist ethics differs from the other major traditions in a specific way. According to his framework, where does a Deweyan analysis locate responsibility for something like the Cambridge Analytica scandal?",
        options: ["In the universalizability of the maxims that the individual actors adopted", "In whether the outcome maximized aggregate welfare across all affected parties", "In the absence of institutional machinery that would let affected publics identify themselves, and in the design choices that made such machinery impossible", "In the failure of the individuals involved to cultivate virtuous character traits"],
        correctAnswerIndex: 2,
        explanation: "Pragmatist ethics distributes moral agency across institutions, so a Deweyan reading focuses on missing institutional machinery and design defects rather than the individual \"bad actor\" narrative.",
        difficulty: "conceptual",
      },
      {
        prompt: "Dewey founded the Laboratory School at the University of Chicago in 1896 as an operational argument about learning. Which position best captures his actual view of education?",
        options: ["The child is an empty vessel into which a teacher transfers a fixed body of information", "Any imposed structure is inherently coercive, so children should direct their learning entirely on their own", "Learning happens when a student encounters a real problem she cares about and works with others toward its resolution, with the teacher designing conditions for such encounters", "Education should optimize standardized test outcomes as the measurable proxy for genuine understanding"],
        correctAnswerIndex: 2,
        explanation: "Dewey rejected both traditional didactic schooling and naive child-centered progressivism; his view was that learning is social, organized around genuine problems, with the teacher designing conditions where such encounters reliably occur.",
        difficulty: "recall",
      },
      {
        prompt: "A civic-tech team is designing oversight for an algorithmic hiring system. Which approach best reflects what Dewey's framework uniquely contributes beyond a Kantian or utilitarian policy evaluation?",
        options: ["Verify that the hiring algorithm's decision rule could be consistently universalized as a maxim", "Calculate whether the system maximizes net welfare across applicants and employers", "Ask what inquiry capacities the oversight process itself requires and cultivates, and whether affected publics can form and participate in evaluating the tool", "Confirm that the engineers who built the system possess the relevant professional virtues"],
        correctAnswerIndex: 2,
        explanation: "Dewey treats the social mechanisms by which a community decides what to do about a tool as themselves part of the ethical object, asking what inquiry capacities the process cultivates and whether eclipsed publics can form, which other traditions tend to omit.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "williams",
    "Bernard Williams",
    "Bernard Williams: Integrity, Moral Luck, and the Limits of Theory",
    "Tests understanding of Williams's critique of impartialist ethics and how his ideas bear on technology and AI ethics.",
    [
      {
        prompt: "In Williams's 'Jim and the Indians' case (from his exchange with J. J. C. Smart), what is his central point about the utilitarian verdict that Jim should shoot one person to save twenty?",
        options: ["The calculation is mathematically wrong, so Jim should refuse to shoot", "The verdict may be technically correct, yet a person who could carry it out without it being a personal catastrophe would no longer be Jim", "Jim has a duty to maximize lives saved, so any hesitation is itself immoral", "The case proves that utilitarianism and Kantian ethics reach identical conclusions"],
        correctAnswerIndex: 1,
        explanation: "Williams grants the utilitarian calculus can be technically correct but argues that acting on it would require an agent for whom taking a life is no personal catastrophe, which would not be Jim, the person whose integrity the theory is meant to evaluate.",
        difficulty: "recall",
      },
      {
        prompt: "Williams's concept of 'agent-regret' is meant to capture which phenomenon?",
        options: ["The guilt a person should feel only when they have clearly broken a moral rule", "A moral residue a person feels when their action produces harm without their fault, which consequentialist analysis cannot fully capture", "Regret that is irrational and should be eliminated through better moral reasoning", "The detached disapproval a neutral observer directs at a bad outcome"],
        correctAnswerIndex: 1,
        explanation: "Agent-regret names the specific weight a person carries when their blameless action still causes harm; Williams treats it as genuine evidence about responsibility rather than as noise to be reasoned away.",
        difficulty: "conceptual",
      },
      {
        prompt: "An engineer ships a feature that, through an unforeseeable interaction with another team's code, causes harm. According to the entry, how would Williams characterize the right institutional response?",
        options: ["Issue a clear verdict of either full blame or full exoneration to resolve the ambiguity", "Treat the difficulty of assigning blame as a flaw in ethical reasoning to be patched with a stricter rule", "Engage with the moral residue (agent-regret) the engineer bears rather than trying to flatten it out of existence with a verdict", "Conclude that since the interaction was unforeseeable, no one bears anything at all"],
        correctAnswerIndex: 2,
        explanation: "Williams holds that the engineer bears a specific residue, neither pure blame nor pure exoneration, and the entry notes blameless postmortems do Williamsian ethics well precisely when they engage that residue instead of flattening it.",
        difficulty: "applied",
      },
      {
        prompt: "What is the 'one thought too many' problem from 'Persons, Character, and Morality'?",
        options: ["Pausing to check whether saving one's own drowning spouse is impartially justified already reveals a defect in the kind of person one is", "The idea that moral agents should always run at least one extra check before acting on instinct", "A proof that emotions must be excluded from sound ethical deliberation", "The claim that thinking too little about consequences is the core failing of utilitarianism"],
        correctAnswerIndex: 0,
        explanation: "Williams argues that the justification for saving one's spouse was supposed to be simply 'it's my spouse'; demanding a further layer of impartial reasoning is one thought too many and reveals a defective interior life.",
        difficulty: "recall",
      },
      {
        prompt: "In 'Ethics and the Limits of Philosophy', Williams favors the ancient question 'How should one live?' over the modern 'What am I morally required to do?' What is his reasoning, and how does the entry connect it to AI-ethics frameworks?",
        options: ["The ancient question is easier to answer, so it yields cleaner universal principles for codes of ethics", "It admits the full range of what matters in a life rather than pre-filtering to what a universal theory can handle, undercutting projects that try to derive morality from first principles", "It proves morality can be fully specified once the correct objective function is chosen", "It shows philosophy can supply ethical knowledge from the outside, which AI alignment can then encode"],
        correctAnswerIndex: 1,
        explanation: "Williams prefers 'How should one live?' because it does not pre-filter to what a universal theory can handle; the book's claim that philosophy can at best help us hold onto ethical knowledge we already have is bracing for any framework that tries to derive morality from first principles.",
        difficulty: "conceptual",
      },
    ]
  ),
  buildQuiz(
    "anscombe",
    "Elizabeth Anscombe",
    "Elizabeth Anscombe: Intention, Double Effect, and Moral Action",
    "Tests Anscombe's philosophy of action, intention under descriptions, double effect, and her critique of secular moral vocabulary.",
    [
      {
        prompt: "In her 1958 essay \"Modern Moral Philosophy,\" what was Anscombe's central argument about terms like obligation, duty, and moral law?",
        options: ["That these concepts had become incoherent once the theological framework that gave them weight was abandoned, so ethics should either retrieve that framework or return to Aristotle's language of virtue", "That these concepts were timeless rational truths that needed no historical or religious grounding to remain valid", "That moral obligation should be redefined entirely in terms of measurable consequences and aggregate welfare", "That duty and moral law should be grounded in a social contract among rational agents rather than in character"],
        correctAnswerIndex: 0,
        explanation: "Anscombe argued the vocabulary of obligation and moral law became incoherent once its originating theological framework was dropped, and urged either retrieving that framework or returning to Aristotle's virtue language. This essay helped launch the virtue-ethics revival.",
        difficulty: "recall",
      },
      {
        prompt: "Anscombe's example of a woman moving her arm — which could be flexing muscles, pumping water, poisoning a household, or overthrowing a government — is meant to illustrate what claim from her book Intention?",
        options: ["That physical events have no moral significance whatsoever until a law assigns them one", "That an action is shaped by the description under which the agent intended it, and what she is responsible for depends on which description she was acting under", "That intentions are private mental states that can never be reliably inferred from outward behavior", "That the same bodily movement always counts as exactly one action regardless of context"],
        correctAnswerIndex: 1,
        explanation: "For Anscombe, actions are not bare physical events with morality attached afterward; the description under which the agent intended the act determines what she is doing and what she is responsible for. This is the foundation of modern theories of moral responsibility for technical action.",
        difficulty: "conceptual",
      },
      {
        prompt: "A self-driving car is programmed to steer toward protecting its passengers, and in doing so it foreseeably causes harm to a pedestrian — as opposed to being programmed to deliberately steer INTO the pedestrian. Which Anscombean idea is most directly designed to analyze this distinction?",
        options: ["Her translation work on Wittgenstein's Philosophical Investigations", "Her claim that moral progress is always a clear direction rather than a contested claim", "Her endorsement of consequentialist war-shortening justifications", "The doctrine of double effect, which distinguishes consequences brought about intentionally from those merely foreseen but not intended"],
        correctAnswerIndex: 3,
        explanation: "Anscombe developed a rigorous defense of the doctrine of double effect, which separates intended consequences from foreseen-but-unintended ones. The entry cites exactly this self-driving-car contrast as a case the doctrine is load-bearing for.",
        difficulty: "applied",
      },
      {
        prompt: "Why does Anscombe's concept of intention bear directly on debates about whether an AI system can be morally responsible for what it 'does'?",
        options: ["Because only an action in the Anscombean sense — done under a description the agent recognizes as relevant — can carry moral responsibility, so if AI is not acting in that sense, responsibility must travel elsewhere", "Because Anscombe explicitly argued that sufficiently advanced machines would one day qualify as full moral agents", "Because she held that responsibility attaches to any system that produces outputs humans find harmful, regardless of intention", "Because she believed moral responsibility is purely a legal fiction with no basis in how agents actually act"],
        correctAnswerIndex: 0,
        explanation: "Anscombe held that only actions done under a recognized description can bear moral responsibility; if an AI merely produces outputs humans later redescribe as actions, it cannot be responsible and the responsibility relocates to humans. She never addressed AI, but her framework inherited the question.",
        difficulty: "conceptual",
      },
      {
        prompt: "In Mr. Truman's Degree, on what grounds did Anscombe oppose honoring Truman for the atomic bombings of Hiroshima and Nagasaki?",
        options: ["That the bombings were strategically ineffective and failed to shorten the war", "That the university had no authority to comment on military decisions of any kind", "That the deliberate targeting of innocents was murder whose moral character did not depend on the consequences it produced", "That the bombings were justified as war-shortening measures but Truman deserved no special credit for them"],
        correctAnswerIndex: 2,
        explanation: "Anscombe insisted the deliberate killing of innocents was murder regardless of consequences, cutting against the consequentialist war-shortening defense. Her position has since been largely codified in international humanitarian law and shapes debates on drone and autonomous weapons.",
        difficulty: "recall",
      },
    ]
  ),
  buildQuiz(
    "weil",
    "Simone Weil",
    "Simone Weil: Attention, Affliction, and the Ethics of Force",
    "Tests Weil's ideas on attention, affliction, decreation, labor, and force, and how they illuminate modern technology ethics.",
    [
      {
        prompt: "For Weil, what is the faculty at the center of moral and intellectual life?",
        options: ["Rational deliberation about competing duties", "Attention—the capacity to suspend one's own projects and take in what is actually there", "The will to act decisively once a choice is made", "Sympathy that arises automatically when we see another suffer"],
        correctAnswerIndex: 1,
        explanation: "Weil places attention at the center of moral life, holding that most moral failure is a failure of attention rather than of will; the perceptual work must come before any decision.",
        difficulty: "recall",
      },
      {
        prompt: "How does Weil's concept of 'affliction' (malheur) differ from ordinary suffering, and where does this place the moral demand?",
        options: ["Affliction is merely more intense pain, so the demand is to relieve it faster", "Affliction is suffering freely chosen, so the demand falls on the sufferer to bear it", "Affliction is being so damaged that one can no longer cry out, so the demand falls on the observer to recognize the afflicted", "Affliction is purely spiritual rather than physical, so the demand is for prayer rather than action"],
        correctAnswerIndex: 2,
        explanation: "Weil distinguishes affliction as a condition in which one can no longer cry out for help, placing the moral demand on the observer to recognize the afflicted person even when they have lost the capacity to be visible.",
        difficulty: "conceptual",
      },
      {
        prompt: "A social media company defends its engagement-maximizing feed as 'user-centric design.' Drawing on Weil's idea of decreation, what is the sharpest objection?",
        options: ["Engagement metrics are inaccurate, so the design fails on its own technical terms", "By training users to be ever more captured by their own reactions, the design actively opposes decreation and produces population-scale moral degradation", "User-centric design is acceptable so long as users consent to the data collection involved", "The feed should simply be redesigned to maximize time-on-site more honestly"],
        correctAnswerIndex: 1,
        explanation: "Decreation is the willed subtraction of the self that lets attention become receptive; a technology maximizing engagement trains users to be more captured by their reactions, opposing decreation and causing moral degradation no individual reflection can address.",
        difficulty: "applied",
      },
      {
        prompt: "What did Weil conclude from her year of factory work at Renault about Taylorist and Fordist industrial technology?",
        options: ["Continuous repetitive operations destroyed the workers' capacities for attention and thought, with that deformation as the technology's central social effect", "Assembly-line work was economically inefficient and should be replaced by craft production", "Factory labor was dignified because it gave workers a clear sense of collective solidarity", "Workers were merely tired at the end of a shift but recovered their full capacities with rest"],
        correctAnswerIndex: 0,
        explanation: "Weil argued that the organization of work around continuous repetitive operations systematically trained workers into a mode of existence in which thought became impossible—a central social effect of the technology, not an incidental one.",
        difficulty: "recall",
      },
      {
        prompt: "In Weil's essay 'The Iliad, or the Poem of Force,' force is what turns a person into a thing. How does the entry apply this to contemporary systems?",
        options: ["Only literal violence such as warfare counts as force, so digital systems fall outside her analysis", "Force is justified whenever it improves the efficiency of sorting people for loans or jobs", "Algorithmic sorting and surveillance are force in her sense—positioning and flattening people into manipulable objects for someone else's project", "Force operates only when a human, not an algorithm, makes the final decision about a person"],
        correctAnswerIndex: 2,
        explanation: "Weil's force is what renders a person an object of someone else's action; the entry extends this to surveillance and algorithmic sorting that position, flatten, and turn populations into manipulable objects without necessarily killing them.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "heidegger",
    "Martin Heidegger",
    "Martin Heidegger: Technology, Enframing, and the Disclosure of Being",
    "Tests understanding of Heidegger's ontology of technology — Gestell, standing-reserve, and disclosure — and its bearing on AI ethics.",
    [
      {
        prompt: "In Heidegger's philosophy of technology, what does the term 'standing-reserve' (Bestand) refer to?",
        options: ["A reserve fund of tools held back for emergencies", "The pre-Socratic Greek conception of craftsmanship", "Everything revealed as resources arranged for extraction, storage, and on-demand manipulation", "The contemplative attitude that lets things appear as they are"],
        correctAnswerIndex: 2,
        explanation: "For Heidegger, modern technology reveals everything as standing-reserve — a river becomes hydroelectric potential, a forest becomes board-feet, a person becomes a unit of labor or data.",
        difficulty: "recall",
      },
      {
        prompt: "Heidegger insists his critique of modern technology is 'ontological rather than ethical.' What does this distinction primarily mean?",
        options: ["The real danger is not the misuse of particular tools but a reorganization of what can appear as what, before any tool is used well or badly", "Technology should be judged only by weighing its measurable harms against its benefits", "Engineers bear personal moral responsibility for every harmful outcome they intend", "Ethics is irrelevant because technology is morally neutral in all respects"],
        correctAnswerIndex: 0,
        explanation: "Heidegger's claim is metaphysical: the Gestell shapes the conditions under which anything can show up for us at all, prior to and independent of how any specific tool is used.",
        difficulty: "conceptual",
      },
      {
        prompt: "Heidegger contrasts premodern and modern technology using the example of a windmill versus a hydroelectric dam. What is the point of this contrast?",
        options: ["Modern technology is simply more efficient and therefore preferable", "The windmill is dangerous because it cannot store energy for later use", "Premodern tools were morally superior because they were made by hand", "The windmill harnesses the wind without storing it, while the dam reveals the river as hydroelectric potential to be dammed and stockpiled"],
        correctAnswerIndex: 3,
        explanation: "The windmill lets the wind emerge in its own character, whereas modern technology reveals the river only as standing-reserve — extractable, storable power — illustrating the shift in modes of disclosure.",
        difficulty: "recall",
      },
      {
        prompt: "A company defends its recommendation engine by noting that no engineer ever intended to treat users as mere data sources — they only wanted to improve relevance. How would Heidegger most likely respond?",
        options: ["He would agree that benign intentions make the system ethically unproblematic", "He would say the Gestell was already in place, so the system discloses persons as data-generating resources regardless of anyone's conscious intentions", "He would argue the problem is solvable by adding better privacy controls to the tool", "He would conclude the system is fine as long as engagement metrics keep improving"],
        correctAnswerIndex: 1,
        explanation: "Heidegger holds that Gestell-work persists even when conscious intentions are otherwise; the enframing is the horizon within which choices get made, so no specific intent is needed for persons to appear as Bestand.",
        difficulty: "applied",
      },
      {
        prompt: "Heidegger's late remark that 'only a god can save us' is best understood in what way?",
        options: ["A literal call for religious conversion as the solution to technology", "Straightforward despair that nothing can ever change", "An endorsement of building more advanced technology to fix technology's problems", "The insistence that the Gestell is too deep to be corrected by more technology, and that what is needed is a different mode of being our own resources cannot produce"],
        correctAnswerIndex: 3,
        explanation: "Rather than literal theology or mere despair, the remark is better read as the claim that enframing cannot be overcome by further technical means; it calls for a transformed mode of being, gestured at by releasement (Gelassenheit).",
        difficulty: "conceptual",
      },
    ]
  ),
  buildQuiz(
    "habermas",
    "Jürgen Habermas",
    "Jürgen Habermas: Communication, Legitimacy, and the Public Sphere",
    "Tests Habermas's theory of communicative action, the public sphere, discourse ethics, and their bearing on platform and AI governance.",
    [
      {
        prompt: "For Habermas, what is the key difference between 'communicative action' and 'strategic action'?",
        options: ["Communicative action is used in markets, while strategic action is used in private conversation", "Communicative action requires written language, while strategic action is purely verbal", "Communicative action treats the other as a co-participant in a shared search for what is true and right, while strategic action treats the other as an object to be maneuvered", "Communicative action is irrational and emotional, while strategic action is the only form of genuine reasoning"],
        correctAnswerIndex: 2,
        explanation: "Habermas defines communicative action as interaction oriented toward reaching understanding among equals who justify claims with reasons, whereas strategic action treats the other as an object to be manipulated.",
        difficulty: "recall",
      },
      {
        prompt: "In 'The Theory of Communicative Action,' Habermas argues that every utterance in communicative action carries three implicit validity claims. What are they?",
        options: ["That it is true, that it is normatively right, and that the speaker is being sincere", "That it is logical, that it is persuasive, and that it is well-formed grammatically", "That it is popular, that it is profitable, and that it is legally permissible", "That it is original, that it is beautiful, and that it is historically accurate"],
        correctAnswerIndex: 0,
        explanation: "Habermas holds that communicative utterances raise three validity claims—truth, normative rightness, and sincerity—each of which participants presuppose is open to rational challenge by any competent hearer.",
        difficulty: "recall",
      },
      {
        prompt: "What was the central historical claim of Habermas's 'The Structural Transformation of the Public Sphere'?",
        options: ["That the public sphere was invented by twentieth-century mass broadcasting and has steadily expanded since", "That a bourgeois public sphere emerged in eighteenth-century venues like coffee houses and salons where private persons debated common concerns on the basis of reasons rather than status, but that mass media and administrative rationalization later eroded it", "That genuine public debate has only ever existed inside formal parliaments and courts", "That status and social rank are the only legitimate basis for deciding matters of common concern"],
        correctAnswerIndex: 1,
        explanation: "Structural Transformation traced an eighteenth-century bourgeois public sphere grounded in reasoned debate among private persons, and argued that modern mass media and administrative rationalization had largely eroded its enabling conditions.",
        difficulty: "conceptual",
      },
      {
        prompt: "In 'Between Facts and Norms,' Habermas describes a 'two-track' process of democratic legitimacy. According to this argument, the formal political institutions (the 'strong public') retain legitimacy only if they:",
        options: ["Operate entirely independently of informal civic discussion to avoid populist pressure", "Maximize administrative efficiency and economic output regardless of public opinion", "Are staffed exclusively by experts insulated from ordinary citizens", "Remain responsive to the 'weak public' of informal civic discussion, and they lose legitimacy to the extent that the weak public has been disabled from producing considered opinion"],
        correctAnswerIndex: 3,
        explanation: "Habermas argues that the strong public of parliaments, courts, and agencies is legitimate only insofar as it stays responsive to the weak public of informal civic discussion; disabling that informal discussion undermines legitimacy.",
        difficulty: "conceptual",
      },
      {
        prompt: "A social platform's recommendation algorithm rewards confident, emotionally engaging posts with high engagement metrics, regardless of whether their claims are true or sincerely held. Using Habermas's framework, what is the most precise diagnosis of why this threatens democratic legitimacy?",
        options: ["It violates intellectual property law by amplifying copyrighted content without permission", "It privileges strategic action over communicative action, eroding the communicative infrastructure on which the consent that legitimates modern states depends", "It is simply a matter of poor user-interface design that better visual layout would fix", "It is unproblematic, since Habermas holds that any widely used technology is automatically democratically legitimate"],
        correctAnswerIndex: 1,
        explanation: "For Habermas, technologies that boost strategic manipulation at the expense of communicative action degrade the very communicative preconditions for the consent that legitimates modern political order—a structural problem a content-moderation team alone cannot fix.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "foucault",
    "Michel Foucault",
    "Michel Foucault: Surveillance, Power, and the Making of Subjects",
    "Tests understanding of Foucault's disciplinary power, the Panopticon, biopolitics, governmentality, and their bearing on technology ethics.",
    [
      {
        prompt: "In Discipline and Punish, what does Bentham's Panopticon serve as Foucault's central metaphor for?",
        options: ["Punishment delivered as public spectacle and periodic exemplary violence", "A repressive state apparatus that forbids and prohibits behavior", "A diffuse, productive form of power operating through constant asymmetric visibility", "A contractual agreement between the sovereign and the governed"],
        correctAnswerIndex: 2,
        explanation: "Foucault used the Panopticon, where inmates are always potentially watched but can never verify it, as the metaphor for a decentralized, productive power that works through asymmetric visibility rather than spectacular violence.",
        difficulty: "recall",
      },
      {
        prompt: "Foucault's concept of 'governmentality' is most directly relevant to fitness trackers, productivity apps, and credit scores because these technologies:",
        options: ["Produce subjects who internalize the metrics and come to experience self-optimization as their own desire", "Merely measure pre-existing individuals without changing who those individuals are", "Punish users through public exposure when they fail to meet a standard", "Operate primarily by physically confining bodies within disciplinary institutions"],
        correctAnswerIndex: 0,
        explanation: "Governmentality names management through self-management: such tools do not just measure subjects but produce subjects who understand themselves in the measurement's terms and want to optimize accordingly.",
        difficulty: "applied",
      },
      {
        prompt: "According to the first volume of The History of Sexuality, what was Foucault's argument against the 'repression hypothesis'?",
        options: ["Victorian institutions successfully silenced nearly all discourse about sexuality", "Sexuality was a purely private matter untouched by medicine or psychiatry", "Repression of sexuality was a uniquely ancient Greek and Roman phenomenon", "The nineteenth century produced an explosion of discourse about sex by building institutions that made it an object of knowledge and control"],
        correctAnswerIndex: 3,
        explanation: "Foucault argued the opposite of repression: medicine, psychiatry, pedagogy, and confession generated a proliferation of discourse that made sexuality available as an object of knowledge and control.",
        difficulty: "conceptual",
      },
      {
        prompt: "How did Foucault characterize 'biopolitics' as distinct from disciplinary power?",
        options: ["It governs the biological population through statistical management of births, deaths, health, and normality", "It corrects individual bodies one at a time through enclosed institutions like prisons", "It grounds governance in a Kantian categorical imperative", "It replaces all forms of power with voluntary contractual consent"],
        correctAnswerIndex: 0,
        explanation: "In the 1978 lectures, biopolitics names governance that operates on the biological population as its object through statistical management of births, deaths, health, and normality, rather than disciplinary correction of individual bodies.",
        difficulty: "conceptual",
      },
      {
        prompt: "Foucault's stance on normative ethics was unusual; which best describes the role he assigned to the philosopher, and why is it well-suited to tech-ethics work inside institutions?",
        options: ["Deriving universal moral rules from a categorical imperative, which institutions readily accept as binding", "Ranking outcomes by aggregate welfare, which lets institutions calculate optimal policy", "Specifying what justice requires in Rawlsian terms, which gives institutions a fixed standard to implement", "Denaturalizing the categories that make certain questions impossible to ask, which can move institutions unpersuaded by abstract moral argument"],
        correctAnswerIndex: 3,
        explanation: "Foucault refused to ground critique in a positive moral theory; he saw the philosopher's task as denaturalizing taken-for-granted categories, which is effective with institutions that resist abstract argument but respond to historically-grounded challenges to their assumptions.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "parfit",
    "Derek Parfit",
    "Derek Parfit: Identity, Future People, and What Matters",
    "Tests Parfit's views on personal identity, the non-identity problem, the Repugnant Conclusion, and their bearing on AI and future-generation ethics.",
    [
      {
        prompt: "In Parfit's teletransporter thought experiment, what is his central conclusion about the Mars replica?",
        options: ["The replica is definitely a different person, so teletransportation is a form of death", "The question of whether it is the 'same person' has no determinate answer, because identity is not what fundamentally matters", "The replica is identical to the original only if the Earth body is destroyed before the Mars body is built", "Personal identity is preserved perfectly, proving the soul transfers with the body's information"],
        correctAnswerIndex: 1,
        explanation: "Parfit argued the identity question has no determinate answer because identity is not the morally fundamental relation; what matters is psychological continuity and connectedness, which is present regardless of how we classify identity.",
        difficulty: "recall",
      },
      {
        prompt: "Parfit claims that 'personal identity is not what matters' in survival. What does he say matters instead?",
        options: ["Bodily continuity of the same biological organism over time", "The persistence of an immaterial soul or Cartesian ego", "Psychological continuity and connectedness", "The legal and social recognition of one's identity by others"],
        correctAnswerIndex: 2,
        explanation: "For Parfit the relation that matters is psychological continuity and connectedness, not numerical identity, which he regarded as often indeterminate and not metaphysically deep.",
        difficulty: "conceptual",
      },
      {
        prompt: "What is the 'non-identity problem' that Parfit identified, and why does the entry call it the single most consequential result for tech ethics?",
        options: ["Standard person-affecting ethics cannot explain wrongdoing in choices that determine WHICH future people exist, since those people aren't harmed if their lives are still worth living", "It is the puzzle of whether two physically identical replicas can share one legal identity", "It shows that future people have stronger moral claims on us than presently existing people", "It proves that we have no obligations whatsoever toward people who do not yet exist"],
        correctAnswerIndex: 0,
        explanation: "The non-identity problem shows person-affecting ethics, which grounds obligations in effects on identified individuals, cannot handle decisions that change which individuals will exist, since those future people aren't 'harmed' if their lives are still worth living.",
        difficulty: "conceptual",
      },
      {
        prompt: "Which statement best captures Parfit's 'Repugnant Conclusion'?",
        options: ["Any population policy that reduces total happiness is morally forbidden under all circumstances", "A large population of people whose lives are barely worth living can come out as 'better' than a smaller population of genuinely flourishing people", "It is always wrong to bring additional people into existence if resources are scarce", "Utilitarianism must be abandoned entirely because it cannot rank any populations"],
        correctAnswerIndex: 1,
        explanation: "The Repugnant Conclusion is that on most plausible versions of utilitarianism, a huge population each with lives barely worth living rates as better than a smaller population with truly flourishing lives, a result Parfit spent his life trying to avoid without losing impartiality.",
        difficulty: "recall",
      },
      {
        prompt: "An AI lab plans to deploy a system whose long-term effects will shape which future generations of people come to exist, and considers a cheaper option that yields a future population with lives still worth living but worse than the alternative. Using Parfit's framework, why is this ethically fraught?",
        options: ["Because Parfit's triple theory forbids any consequentialist reasoning about technology", "Because the future people, not yet existing, cannot consent, which by itself makes the action straightforwardly impermissible", "Because the non-identity problem means we can't say the worse-off future people were 'harmed', yet most of us think choosing the worse policy is still wrong", "Because Parfit held that we have no obligations to future generations, so the lab is free to choose either option"],
        correctAnswerIndex: 2,
        explanation: "This is a direct application of the non-identity problem: since the future people would not have existed under the better policy and still have lives worth living, they aren't harmed, yet our intuition that choosing the worse policy is wrong reveals the gap Parfit exposed, which organizes the longtermist literature.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "macintyre",
    "Alasdair MacIntyre",
    "Alasdair MacIntyre: Virtues, Practices, and Fragmented Moral Discourse",
    "Tests MacIntyre's diagnosis of modern moral fragmentation, his theory of practices and virtues, and dependency, applied to technology ethics.",
    [
      {
        prompt: "In the famous opening thought experiment of After Virtue, MacIntyre asks us to imagine a world where the natural sciences have been destroyed and only fragments survive. What is the point of this analogy?",
        options: ["That science and morality must be kept strictly separate to avoid category errors", "That modern moral discourse consists of inherited fragments cut off from the traditions that once made them coherent", "That a future catastrophe is likely to destroy our scientific knowledge", "That moral progress is impossible because each generation forgets the last"],
        correctAnswerIndex: 1,
        explanation: "MacIntyre uses the imagined ruin of science to argue that we inherited moral fragments (rights, utility, duty, virtue) from incompatible traditions whose original foundations we abandoned, producing irresolvable disagreement.",
        difficulty: "recall",
      },
      {
        prompt: "In MacIntyre's technical vocabulary, what distinguishes an 'internal good' from an 'external good'?",
        options: ["Internal goods are subjective feelings, while external goods are objective and measurable", "Internal goods belong to individuals, while external goods belong to institutions", "Internal goods can be achieved only through a specific practice and its disciplines, while external goods like money or fame are obtainable through many means", "Internal goods are spiritual, while external goods are material possessions"],
        correctAnswerIndex: 2,
        explanation: "For MacIntyre, internal goods are realizable only by engaging in the practice itself (e.g., doing science well), whereas external goods such as money, fame, or advancement can be gained through many practices or by exploiting one.",
        difficulty: "conceptual",
      },
      {
        prompt: "MacIntyre argues in Whose Justice? Which Rationality? that rationality is 'always traditioned.' Why does he insist this is NOT a form of relativism?",
        options: ["Because he holds that all traditions ultimately converge on the same universal principles", "Because traditions can be incoherent, run into crises, and be rationally superseded by others", "Because he believes a neutral, tradition-independent rationality does in fact exist", "Because moral truth is simply whatever a given community decides it is"],
        correctAnswerIndex: 1,
        explanation: "MacIntyre is explicit that traditions can fail their own standards, reach crises, and be rationally surpassed; rationality being traditioned describes how moral reasoning proceeds without collapsing into 'anything goes.'",
        difficulty: "conceptual",
      },
      {
        prompt: "A team designs an AI assistant around a single guiding value: maximizing 'user autonomy,' picturing the user as an independent adult making free choices. Drawing on Dependent Rational Animals, what would MacIntyre most likely say?",
        options: ["The framework is sound because respecting autonomy is the core of all ethical design", "The autonomous adult is an abstraction that excludes most actual humans most of the time, so the design will systematically fail dependent populations", "Autonomy should be replaced entirely by maximizing measurable user satisfaction", "Ethics has no bearing on technical design decisions like this one"],
        correctAnswerIndex: 1,
        explanation: "MacIntyre argues we are all dependent at points in life and owe our autonomy to others' care; a framework defaulting to autonomous adult agency excludes most real humans and fails those whose dependencies are visible.",
        difficulty: "applied",
      },
      {
        prompt: "Using MacIntyre's diagnostic of practices, how should we understand a software culture where 'engineering well' is steadily displaced by 'shipping fast' under capital pressure?",
        options: ["It is a neutral trade-off, since how practitioners feel about it is what ultimately matters", "It is healthy specialization that strengthens the practice over time", "It is the practice's internal goods being displaced by external goods, which degrades the practice itself regardless of individual feelings", "It is irrelevant to ethics because speed is a purely technical, not moral, concern"],
        correctAnswerIndex: 2,
        explanation: "MacIntyre warns that when external goods crowd out a practice's internal goods, the practice degrades regardless of how practitioners feel; he applies this directly to engineering under capital-efficiency pressure.",
        difficulty: "applied",
      },
    ]
  ),
  buildQuiz(
    "dubois",
    "W. E. B. Du Bois",
    "W. E. B. Du Bois: The Color Line and the Algorithmic Veil",
    "Tests Du Bois's core concepts, empirical methods, and their lineage into contemporary surveillance and algorithmic-bias ethics.",
    [
      {
        prompt: "In The Souls of Black Folk (1903), what does Du Bois mean by \"double consciousness\"?",
        options: ["The sense of always looking at oneself through the eyes of others, measuring one's soul by a contemptuous world's standards", "The simultaneous awareness of one's economic class and one's racial identity", "The split between rational thought and emotional intuition in moral judgment", "The condition of belonging to two nations at once through dual citizenship"],
        correctAnswerIndex: 0,
        explanation: "Du Bois defines double consciousness as \"this sense of always looking at one's self through the eyes of others\" — a selfhood built inside an externally imposed, contemptuous gaze.",
        difficulty: "recall",
      },
      {
        prompt: "Du Bois argued that \"the color line\" was the central problem of the twentieth century. How does the entry characterize the relationship between that thesis and the twenty-first century?",
        options: ["It was refuted, since formal civil-rights law dissolved the color line entirely", "It must be updated rather than refuted: the color line is now encoded in opaque technical infrastructure asserted to be neutral", "It applies only to the United States and has no bearing on global technology systems", "It was replaced by class as the sole organizing axis of modern injustice"],
        correctAnswerIndex: 1,
        explanation: "The entry states the color-line thesis \"has to be updated, not refuted\": the twenty-first-century problem is the color line encoded in technical infrastructure whose neutrality is asserted and whose operations are opaque.",
        difficulty: "conceptual",
      },
      {
        prompt: "What was epistemologically innovative about Du Bois's 1900 Paris Exposition exhibit, \"The Exhibit of American Negroes\"?",
        options: ["It was the first use of color photography to document a population", "It proved statistically that emancipation had eliminated racial inequality in Georgia", "It treated a population's aggregate condition as something made legible to an international public through visual proof, framing that legibility as a political act", "It was funded by the U.S. government as official census documentation"],
        correctAnswerIndex: 2,
        explanation: "Per the entry, the exhibit's deeper innovation was epistemological: Du Bois made a population's aggregate condition legible through visual proof and treated that legibility itself as a political act.",
        difficulty: "conceptual",
      },
      {
        prompt: "A facial-recognition vendor claims its system is \"objective\" because it relies only on mathematical pattern-matching, yet audits show it misclassifies darker-skinned faces at far higher rates. Which Du Boisian concept most directly names this phenomenon as scholars have extended it?",
        options: ["The talented tenth, applied to who gets to build the technology", "Pan-Africanism, applied to international data-sharing agreements", "The Veil, understood purely as a metaphor for personal privacy settings", "The \"algorithmic color line\" — racialized sorting reproduced through allegedly neutral technical means"],
        correctAnswerIndex: 3,
        explanation: "The entry cites Charlton McIlwain's \"algorithmic color line,\" which captures how systems reproduce racialized sorting through means asserted to be neutral while their outputs encode racial assumptions.",
        difficulty: "applied",
      },
      {
        prompt: "Which statement accurately reflects Du Bois's empirical scholarship and its modern tech-ethics lineage as described in the entry?",
        options: ["The Philadelphia Negro (1899) was the first major U.S. urban sociological study, and later scholars like Benjamin, Browne, and Noble trace algorithmic racism back through his analysis of racial administration", "Black Reconstruction argued that Reconstruction was a failure caused by the freedmen's unreadiness for democracy", "Du Bois rejected quantitative methods, insisting race could only be understood through literature and philosophy", "His work influenced European ethics far more directly than it influenced critical technology studies"],
        correctAnswerIndex: 0,
        explanation: "The entry calls The Philadelphia Negro the first major U.S. urban sociological study and names Benjamin, Browne, and Noble as scholars whose work on algorithmic racism descends from Du Bois's analysis of racial administration.",
        difficulty: "applied",
      },
    ]
  ),
];

export function getStaticPhilosopherQuiz(philosopherId: string): Quiz | null {
  return philosopherQuizzes.find((q) => q.subjectId === philosopherId) || null;
}
