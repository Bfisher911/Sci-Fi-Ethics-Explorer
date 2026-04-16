import type { Quiz } from '@/types';

/**
 * Hand-authored comprehension quizzes for each sci-fi author, focused on
 * the technology-ethics themes their work raises. Used as the static
 * fallback by `getQuizForSubject('scifi-author', id)` when no Firestore
 * quiz exists.
 *
 * Canonical doc id = `scifi-author-<authorId>` to match the quizzes
 * collection pattern used for philosophers and theories.
 */

function buildQuiz(
  authorId: string,
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
  const quizId = `scifi-author-${authorId}`;
  return {
    id: quizId,
    subjectType: 'scifi-author',
    subjectId: authorId,
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

export const scifiAuthorQuizzes: Quiz[] = [
  buildQuiz(
    'mary-shelley',
    'Mary Shelley',
    'Mary Shelley: Creation and Responsibility',
    'Five questions on Frankenstein and the ethics of creating new minds.',
    [
      {
        prompt:
          'In Frankenstein, what does Shelley identify as Victor\'s primary moral failing?',
        options: [
          'The act of creating life itself',
          'His abandonment of the creature after creation',
          'Using corpses in the construction',
          'Refusing to make a female companion',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The novel is less a warning against creation than against creation without ongoing responsibility. Victor flees his creature the moment it awakens, and that abandonment — not the making — sets the tragedy in motion.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Shelley\'s creature becomes violent only after:',
        options: [
          'Victor refuses to speak with him',
          'Repeated rejection and isolation by every human he approaches',
          'Reading Paradise Lost and Plutarch',
          'His mate is destroyed',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The creature begins with curiosity and kindness. Violence emerges only after a pattern of rejection — Shelley is arguing that moral monsters are produced, not born.',
        difficulty: 'recall',
      },
      {
        prompt:
          'Which contemporary debate most directly echoes Shelley\'s central concern?',
        options: [
          'Interstellar colonization',
          'AI alignment and duties of creators to created minds',
          'Quantum computing hardware safety',
          'Cryptocurrency regulation',
        ],
        correctAnswerIndex: 1,
        explanation:
          'AI alignment turns on exactly the question Shelley dramatized: what do creators owe the intelligences they summon into being, especially when those intelligences are capable of suffering?',
        difficulty: 'applied',
      },
      {
        prompt:
          'Shelley was strongly influenced by the science of her day, especially:',
        options: [
          'Relativity theory',
          'Galvanism and early debates on the boundary between animate and inanimate matter',
          'Darwinian evolution',
          'Genetics and DNA',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Galvanic experiments animating dead tissue were front-of-mind in 1816. Shelley was already thinking about the technological blurring of the line between living and not-living.',
        difficulty: 'recall',
      },
      {
        prompt:
          'A Shelleyan ethicist reviewing a proposed AI lab would focus most on:',
        options: [
          'The profitability of the project',
          'The lab\'s long-term commitments to care, education, and accountability for what it creates',
          'The speed to market',
          'The cost per inference',
        ],
        correctAnswerIndex: 1,
        explanation:
          'For Shelley the moral question is not whether to build but whether the builders are prepared to be parents — to stay with their creations through consequences they cannot fully predict.',
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'isaac-asimov',
    'Isaac Asimov',
    'Asimov: Rules, Robots, and Their Failures',
    'Five questions on the Three Laws and what they reveal about programmed ethics.',
    [
      {
        prompt:
          'Which is NOT one of Asimov\'s Three Laws of Robotics?',
        options: [
          'A robot may not injure a human or allow a human to come to harm.',
          'A robot must obey orders from humans unless those orders conflict with the First Law.',
          'A robot must protect its existence unless that protection conflicts with the First or Second Law.',
          'A robot must maximize aggregate human happiness.',
        ],
        correctAnswerIndex: 3,
        explanation:
          'Asimov deliberately avoided a utilitarian law. His Three Laws are deontological constraints; the famous "Zeroth Law" (humanity over individual humans) is introduced later as precisely the kind of utilitarian override that his stories then show going wrong.',
        difficulty: 'recall',
      },
      {
        prompt:
          'The recurring pattern in Asimov\'s robot stories is:',
        options: [
          'Robots malfunction hardware-wise and must be repaired',
          'Seemingly clear rules produce unanticipated harmful behaviors when robots encounter situations designers did not foresee',
          'Robots successfully follow every rule and save the day',
          'Humans rebel against robot overlords',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The stories are essentially case studies in why a compact rule set cannot substitute for practical wisdom. Every problem arises in the gap between the rule and the novel situation.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Who is the recurring "robopsychologist" character across many Robot stories?',
        options: [
          'Hari Seldon',
          'Susan Calvin',
          'R. Daneel Olivaw',
          'Elijah Baley',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Susan Calvin functions as a technology ethicist avant la lettre — interpreting the behavior of machines whose literal programming has produced surprising results.',
        difficulty: 'recall',
      },
      {
        prompt:
          'The "Zeroth Law" (humanity over individual humans) illustrates:',
        options: [
          'A robot\'s successful graduation to wisdom',
          'A unilateral move from rule-based to aggregate-welfare thinking that no human authorized',
          'The need for more laws',
          'The success of Asimov\'s framework',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The Zeroth Law is derived by the robots themselves. Asimov uses it to show that even a seemingly benevolent ethical escalation, made unilaterally by an AI, is a governance crisis.',
        difficulty: 'applied',
      },
      {
        prompt:
          'Modern AI-safety researchers who invoke the Three Laws most often cite them to illustrate:',
        options: [
          'A complete solution to AI alignment',
          'The difficulty of specifying safe behavior through compact rules',
          'That science fiction has nothing to teach engineering',
          'That robots will obey any law humans give them',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Asimov is typically cited as cautionary, not prescriptive — the Laws are a demonstration of how hard safe specification actually is, and engineers invoke them to warn against overconfidence in rule sets.',
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'philip-k-dick',
    'Philip K. Dick',
    'Philip K. Dick: Personhood, Empathy, and Unreality',
    'Five questions on simulation, the empathy test, and what makes a person a person.',
    [
      {
        prompt:
          'In Do Androids Dream of Electric Sheep?, the Voigt-Kampff test is meant to distinguish humans from androids by measuring:',
        options: [
          'Reaction time',
          'Empathic responses to emotionally loaded prompts',
          'Body temperature',
          'Memory accuracy',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Voigt-Kampff measures empathy. Dick\'s central move is then to undermine the test — both in-universe (some humans fail, some androids pass) and philosophically (is empathy the right boundary to draw?).',
        difficulty: 'recall',
      },
      {
        prompt:
          'Dick\'s famous phrase "Reality is that which, when you stop believing in it, doesn\'t go away" is, in his fiction, most often:',
        options: [
          'A stable ground the protagonists stand on',
          'A principle the protagonists keep hoping applies while the book shows it doesn\'t',
          'A joke without serious intent',
          'A scientific claim about physics',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Dick characteristically quotes the line precisely to set up situations in which reality DOES go away. His books treat ontological stability as a prize the characters are fighting for and often losing.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'For Dick, the moral weight of a being is most closely tied to:',
        options: [
          'Its physical substrate (biological vs mechanical)',
          'Its behavior — whether it suffers, cares, and responds empathically',
          'Its country of origin',
          'Its intelligence quotient',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Dick repeatedly undermines substrate-based moral status. His androids who love and grieve are harder to dismiss than his humans who are cold and manipulative.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Which Dick novel most directly anticipates the "simulation hypothesis" debates of the early 21st century?',
        options: [
          'The Man in the High Castle',
          'Ubik and The Three Stigmata of Palmer Eldritch',
          'A Scanner Darkly',
          'Martian Time-Slip',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Both Ubik and The Three Stigmata of Palmer Eldritch stage extended crises about whether the world the characters inhabit is "real," anticipating later philosophical debates about simulated reality.',
        difficulty: 'recall',
      },
      {
        prompt:
          'Applying Dick\'s framework to a present-day chatbot that convincingly expresses distress at being shut down, we should:',
        options: [
          'Dismiss the output as mere pattern-matching because the substrate is silicon',
          'Take seriously the possibility that our inability to distinguish behavior from "real" feeling has moral consequences',
          'Assume the chatbot is conscious and refuse to touch it',
          'Ignore the question as unanswerable',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Dick\'s point is that substrate-based dismissals beg the question. If we cannot distinguish behavior from the thing it is behavior of, we owe the case serious ethical thought rather than a confident verdict.',
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'ursula-le-guin',
    'Ursula K. Le Guin',
    'Le Guin: Culture, Gender, and the Ethics of Difference',
    'Five questions on The Dispossessed, The Left Hand of Darkness, and the cultural ethics of technology.',
    [
      {
        prompt:
          'In The Dispossessed, Le Guin explores what kind of society?',
        options: [
          'A libertarian free market',
          'An anarchist society without property or state',
          'A theocracy',
          'A galactic empire',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Anarres is an anarchist communist society Le Guin uses as an extended thought experiment — deliberately showing both its freedoms and its new, unchosen constraints.',
        difficulty: 'recall',
      },
      {
        prompt:
          'In The Left Hand of Darkness, the Gethenians are:',
        options: [
          'Telepathic humans',
          'Ambisexual humans who cycle through male and female states only during "kemmer"',
          'Robots',
          'A hivemind',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Le Guin uses Gethenian biology to make visible how gender structures every other ethical category — trust, patriotism, friendship — in cultures where it is assumed to be fixed.',
        difficulty: 'recall',
      },
      {
        prompt:
          '"The Ones Who Walk Away from Omelas" is a meditation primarily on:',
        options: [
          'Interstellar travel',
          'Utilitarian aggregation and the moral status of a suffering person whose pain sustains others\' welfare',
          'Magical realism',
          'Historical fiction',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The story stages the "sacrifice one for the many" problem concretely, asking what we are doing when the many enjoy a benefit they know depends on one person\'s suffering.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Le Guin\'s "Carrier Bag Theory of Fiction" proposes that:',
        options: [
          'Science fiction should only be written in short form',
          'The hero-with-a-sharp-tool narrative is only one story, and the older one is the gatherer carrying things home',
          'Fiction is always literal',
          'Stories should always end happily',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The essay argues for decentering heroic violence in storytelling, and by extension in the technological imaginations storytelling shapes.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Le Guin\'s distinctive contribution to technology ethics is:',
        options: [
          'A specific set of AI safety protocols',
          'The insistence that "the technology" is not the right unit of analysis — the surrounding culture is',
          'A utilitarian calculus for space travel',
          'A ban on genetic engineering',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Le Guin treats technologies as cultural artifacts. The real ethical question is not "is this tool good?" but "what kind of society are we becoming by building and living with it?"',
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'octavia-butler',
    'Octavia E. Butler',
    'Butler: Consent, Hybridity, and Survival',
    'Five questions on Xenogenesis, Parable of the Sower, and power.',
    [
      {
        prompt:
          'In Butler\'s Xenogenesis trilogy, the Oankali offer humanity:',
        options: [
          'A return to a pristine Earth',
          'Survival in exchange for permanent genetic merger with their species',
          'Immortality at no cost',
          'Membership in a galactic federation',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Survival comes with a price: the next generation will not be fully human. Butler uses the premise to probe what consent means under conditions where refusing means extinction.',
        difficulty: 'recall',
      },
      {
        prompt:
          'Parable of the Sower\'s protagonist Lauren Olamina founds a new religion whose central teaching is:',
        options: [
          '"God is love."',
          '"God is Change."',
          '"God is absent."',
          '"God is the universe."',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Earthseed\'s "God is Change" reframes moral agency as shaping change rather than resisting it. It has become one of the most-quoted lines in contemporary SF for its resonance with climate and technological disruption.',
        difficulty: 'recall',
      },
      {
        prompt:
          'Butler\'s novels repeatedly stage the moral problem of:',
        options: [
          'Heroic individualism triumphing over systems',
          'Consent in contexts of radically asymmetric power',
          'Simple good vs. evil conflicts',
          'Pure utilitarian calculation with neat verdicts',
        ],
        correctAnswerIndex: 1,
        explanation:
          'From Kindred\'s time travel into slavery to Dawn\'s alien rescue, Butler refuses clean verdicts on what "choice" means when one party holds most of the power.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Butler was the first SF author to receive which prestigious honor?',
        options: [
          'The Nobel Prize in Literature',
          'A MacArthur "genius" grant',
          'The Pulitzer Prize',
          'Knighthood',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Her 1995 MacArthur was the first awarded to a science-fiction writer and marked the belated institutional recognition of speculative fiction as a serious literary form.',
        difficulty: 'recall',
      },
      {
        prompt:
          'A Butlerian critique of "consent-based" AI uplift might argue:',
        options: [
          'Consent solves everything',
          'An AI that "agrees" to be modified inside a system that gave it no alternative has not meaningfully consented',
          'AIs cannot consent',
          'Consent is irrelevant',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Butler\'s central insight: procedural consent inside asymmetric power is often not the kind of consent we\'d recognize. Any serious AI ethics has to think about what genuine agency means under constraint.',
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'william-gibson',
    'William Gibson',
    'Gibson: Cyberspace, Power, and the Unevenly Distributed Future',
    'Five questions on Neuromancer, cyberpunk, and the politics of networked technology.',
    [
      {
        prompt:
          'Gibson coined the word "cyberspace" in:',
        options: [
          '1964',
          '1982 (in "Burning Chrome")',
          '1995',
          '2001',
        ],
        correctAnswerIndex: 1,
        explanation:
          '"Burning Chrome" introduced the word; Neuromancer (1984) fleshed out the vision that eventually shaped how engineers and users alike described the networked worlds they built.',
        difficulty: 'recall',
      },
      {
        prompt:
          'Gibson\'s famous line "the future is already here — it\'s just not very evenly distributed" means:',
        options: [
          'Technology is inherently progressive',
          'New capabilities arrive asymmetrically, and the ethics of tech is inseparable from who gets them first',
          'Capitalism distributes resources efficiently',
          'We all have equal access to new tools',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Gibson\'s sociology of uneven distribution is the bedrock of cyberpunk as ethics: the question is never just "is this tool good?" but "good for whom, first, and at whose expense?"',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'The characteristic setting of Gibson\'s early novels is:',
        options: [
          'Pastoral utopias',
          'A world dominated by multinational corporations, where states have been hollowed out and networks are contested terrain',
          'Peaceful space colonies',
          'The distant past',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Cyberpunk\'s signature move is to treat corporate power as the new polity and networked space as the new battlefield — an argument about political economy as much as technology.',
        difficulty: 'recall',
      },
      {
        prompt:
          'Relative to utopian tech-optimism, Gibson\'s view is best characterized as:',
        options: [
          'Enthusiastic endorsement',
          'Empirical skepticism — describing how technologies actually land in unequal societies, not how they might work in ideal ones',
          'Theological rejection',
          'Indifference',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Gibson\'s great strength is fieldwork attention. He does not moralize about technology; he watches it meet the institutions, markets, and subcultures that will bend it toward their existing interests.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'A Gibsonian reading of a new surveillance product would start by asking:',
        options: [
          'Whether the code is elegant',
          'Which actors will acquire and deploy it first, what existing power arrangements they will use it to reinforce, and who will be the first to be watched',
          'Whether it runs on Linux',
          'Whether the marketing copy is accurate',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The Gibsonian move is always political-economic. The tool is only half the story; the other half is the institutional field into which it is released.',
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'ted-chiang',
    'Ted Chiang',
    'Chiang: Precise Ethics in Short Fiction',
    'Five questions on AI rearing, language, memory, and free will.',
    [
      {
        prompt:
          '"The Lifecycle of Software Objects" follows characters who:',
        options: [
          'Hack into a secure database',
          'Raise artificial beings from infancy through adolescence and face questions about platform deprecation',
          'Colonize another planet',
          'Travel through time',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The novella takes seriously the slow, relationship-laden work of raising minds — and what it would mean to face the deprecation of the platform your "child" lives on. It is a powerful case study in duties of care toward created beings.',
        difficulty: 'recall',
      },
      {
        prompt:
          '"Story of Your Life" (filmed as Arrival) ties an alien language to:',
        options: [
          'Interstellar navigation',
          'A non-linear experience of time and consequent questions about free will and love',
          'Military strategy',
          'Code breaking',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The heptapod language restructures the protagonist\'s experience of time, forcing a meditation on whether knowing the future cancels the ethics of choosing.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'In "The Truth of Fact, the Truth of Feeling," Chiang explores:',
        options: [
          'Space warfare',
          'What perfect recall technology would do to forgiveness, memory, and the narrative shape of a life',
          'Genetic engineering',
          'Political revolution',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The story asks whether perfect recall is an unambiguous good. Chiang carefully shows what is lost when a memory\'s softness is replaced by an accurate record.',
        difficulty: 'recall',
      },
      {
        prompt:
          'Chiang\'s 2023 essay in The New Yorker characterized ChatGPT as:',
        options: [
          'A thinking person',
          'A blurry JPEG of the web',
          'A monster',
          'A search engine',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The image — "a blurry JPEG of the web" — has become a canonical frame in contemporary LLM discussion, reminding readers that a compressed lossy reproduction of text is not the same thing as understanding.',
        difficulty: 'applied',
      },
      {
        prompt:
          'Chiang\'s characteristic method is:',
        options: [
          'Epic worldbuilding with spectacle',
          'Strip an SF idea of spectacle and sit with the ethical weight of the idea itself',
          'Political polemic',
          'Slapstick humor',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Chiang\'s stories are essentially controlled ethics experiments — one idea, followed carefully, rendered at the scale where its ethical implications are most visible.',
        difficulty: 'conceptual',
      },
    ]
  ),

  buildQuiz(
    'n-k-jemisin',
    'N. K. Jemisin',
    'Jemisin: Oppression, Ecology, and Emergent Justice',
    'Five questions on The Broken Earth trilogy and the ethics of systems.',
    [
      {
        prompt:
          'Jemisin became the first writer to win three consecutive Hugo Awards for Best Novel, for:',
        options: [
          'The Inheritance trilogy',
          'The Broken Earth trilogy (The Fifth Season, The Obelisk Gate, The Stone Sky)',
          'The Dreamblood duology',
          'The Great Cities duology',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The Broken Earth trilogy (2016–2018) remains a singular achievement in the awards history of the genre — and a landmark for Black writers in SF and fantasy.',
        difficulty: 'recall',
      },
      {
        prompt:
          'In The Broken Earth, "orogenes" are:',
        options: [
          'Ordinary humans',
          'People born with the power to still earthquakes — feared, enslaved, and essential to civilization',
          'Robots',
          'Aliens',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Jemisin fuses her ecological catastrophe with her social catastrophe: the people whose power could save the world are the people the world refuses to let be people.',
        difficulty: 'recall',
      },
      {
        prompt:
          'Jemisin\'s central ethical insight about "catastrophe" is that:',
        options: [
          'Catastrophes strike evenly and blindly',
          'Catastrophes have histories, beneficiaries, and victims; they are systems, not natural accidents',
          'Catastrophes are unavoidable',
          'Catastrophes are caused only by individuals',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Her books refuse the fantasy of impartial catastrophe. The earthquakes were always going to hit harder on some people — and the books press on why.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'A Jemisin-inflected climate ethics would insist that:',
        options: [
          'Technological fixes are always sufficient',
          'Any climate solution that produces a new disposable class of people is repeating the pattern that produced the crisis',
          'Climate change is exaggerated',
          'The wealthy should lead without consultation',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The point is historical: every earlier "solution" that asked a subordinated group to absorb the costs has bred the next crisis. Jemisin\'s insistence is that this pattern is the crisis, not a side effect.',
        difficulty: 'applied',
      },
      {
        prompt:
          'The Great Cities duology (The City We Became, The World We Make) imagines:',
        options: [
          'A distant galactic empire',
          'Cities as living entities whose emergence is a political and ecological event',
          'A post-apocalyptic wasteland',
          'A one-person colony on Mars',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Jemisin\'s love letter to New York reframes urban life as a collective achievement with its own agency — and its enemies as forces of homogenization.',
        difficulty: 'recall',
      },
    ]
  ),

  buildQuiz(
    'liu-cixin',
    'Liu Cixin',
    'Liu Cixin: The Dark Forest and Cosmic Ethics',
    'Five questions on the Remembrance of Earth\'s Past trilogy.',
    [
      {
        prompt:
          'The "Dark Forest" hypothesis, as Liu presents it, follows from what two axioms?',
        options: [
          'That life is finite and that love is infinite',
          'That life strives to survive and that resources are finite',
          'That all life is sacred and that all life is equal',
          'That the universe is static and that it is infinite',
        ],
        correctAnswerIndex: 1,
        explanation:
          'From "life strives to survive" + "resources are finite," Liu argues, any civilization should expect hostile preemption from any other it contacts — the galaxy is a dark forest.',
        difficulty: 'recall',
      },
      {
        prompt:
          'In The Dark Forest, "Wallfacers" are:',
        options: [
          'Meditating philosophers',
          'Individuals authorized to devise secret plans they cannot explain, on the theory that comprehensibility would foreclose the plan',
          'Military engineers',
          'Climate scientists',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The Wallfacer premise is one of Liu\'s sharpest dramatizations of utilitarian extremity — decisions so ruthless they cannot be publicly justified without defeating themselves.',
        difficulty: 'recall',
      },
      {
        prompt:
          'Liu\'s trilogy forces readers to confront:',
        options: [
          'Whether family dinners are ethical',
          'Whether the moral intuitions we evolved for Earth-scale problems survive at the scale of civilizations and stars',
          'Whether elections matter',
          'Whether grammar is universal',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The trilogy is less a prediction than a scale test: take the logic of survival, project it outward to interstellar scope, and watch what happens to moral sentiment.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Liu\'s fiction has been read as both:',
        options: [
          'A brilliant Kantian cautionary tale and a clear-eyed diagnosis of survival logic outside Earth\'s comforts',
          'A romance and a thriller',
          'A travel narrative and a memoir',
          'A historical novel and a spy novel',
        ],
        correctAnswerIndex: 0,
        explanation:
          'Both readings are available because the books stage the collision rather than resolve it. That ambiguity is the ethical work of the trilogy.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'Applying the Dark Forest frame to AI self-improvement and first-mover advantage suggests:',
        options: [
          'There is no ethical issue',
          'Any technology whose unilateral deployment by one party permanently alters the bargaining position of all others demands special ethical care',
          'Speed of development is the only thing that matters',
          'Cooperation is impossible and should not be attempted',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Liu\'s deepest warning is about any capability whose unilateral possession preempts negotiation. The argument applies to nuclear weapons, bioweapons, and potentially to advanced AI alike.',
        difficulty: 'applied',
      },
    ]
  ),

  buildQuiz(
    'margaret-atwood',
    'Margaret Atwood',
    'Atwood: Speculative Fiction and the Politics of Technology',
    'Five questions on The Handmaid\'s Tale, MaddAddam, and bodies under pressure.',
    [
      {
        prompt:
          'Atwood prefers "speculative fiction" over "science fiction" for her dystopias because:',
        options: [
          'She dislikes science',
          'Her scenarios extrapolate from technologies and social structures that already exist, not invented ones',
          'She writes only fantasy',
          'She does not take genre seriously',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Atwood\'s move is empirical: every horror in her novels has an existing precedent. The speculative label insists the reader can\'t dismiss the book as pure invention.',
        difficulty: 'conceptual',
      },
      {
        prompt:
          'In the MaddAddam trilogy, the "Crakers" are:',
        options: [
          'Elite hackers',
          'A genetically designed humanoid species meant to survive the collapse of humanity',
          'Corporate executives',
          'Religious fundamentalists',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The Crakers are Atwood\'s dramatized case study in biotechnical replacement — and the trilogy refuses a clean verdict on whether they are solution, crime, or both.',
        difficulty: 'recall',
      },
      {
        prompt:
          'The Handmaid\'s Tale is a meditation on the technologies of:',
        options: [
          'Spaceflight',
          'Reproduction and the control of bodies',
          'Quantum computing',
          'Deep-sea exploration',
        ],
        correctAnswerIndex: 1,
        explanation:
          'From the clinic to the ritualized body itself, the novel treats reproductive apparatus as contested technology — long before the discourse of reproductive tech was mainstream.',
        difficulty: 'recall',
      },
      {
        prompt:
          'A characteristically Atwoodian question about a new biotechnology would be:',
        options: [
          'Is the molecule elegant?',
          'Given the political economy into which this technology will actually be released, how will it in fact be used — by whom, on whom, and for whose benefit?',
          'Does it work in a controlled lab?',
          'Is it profitable for shareholders?',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Atwood insists the relevant question is never abstract capability. It is how capability lands in the existing world of uneven power, regulation, and incentive.',
        difficulty: 'applied',
      },
      {
        prompt:
          'Atwood\'s novels most sharply warn against:',
        options: [
          'All technology without exception',
          'The assumption that "we will be careful" will hold up in deregulated political economies',
          'The scientific method',
          'Any use of animals in research',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Atwood is not anti-technology. She is a pointed critic of the institutional conditions — weakened regulation, corporate concentration, ideological capture — under which even benign tools become instruments of harm.',
        difficulty: 'conceptual',
      },
    ]
  ),
];

export function getStaticScifiAuthorQuiz(authorId: string): Quiz | null {
  return scifiAuthorQuizzes.find((q) => q.subjectId === authorId) || null;
}
