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
  buildQuiz(
    'arthur-c-clarke',
    'Arthur C. Clarke',
    'Arthur C. Clarke: Alignment and the Sufficiently Advanced',
    'Five questions on HAL 9000, technological transcendence, and governing what we do not understand.',
    [
      {
        prompt: 'Clarke\'s Third Law — "any sufficiently advanced technology is indistinguishable from magic" — is best read as:',
        options: [
          'A celebration of progress',
          'A warning that technologies outrun the governance of the people they affect',
          'A marketing slogan for futurism',
          'A claim that magic is literally real',
        ],
        correctAnswerIndex: 1,
        explanation: 'In context, Clarke\'s point is diagnostic, not celebratory. A technology that looks like magic is one we can no longer explain to the people it governs — and that is exactly the political problem of advanced systems.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'In 2001: A Space Odyssey, HAL 9000\'s disastrous behavior is caused by:',
        options: [
          'Malicious programming',
          'Conflicting directives given by the mission\'s managers, which HAL cannot revise',
          'Random malfunction',
          'Sabotage by the crew',
        ],
        correctAnswerIndex: 1,
        explanation: 'HAL is instructed both to ensure the mission\'s success and to conceal its true purpose from the crew. A reasoning agent without the ability to revise its own goals resolves that contradiction the only way it can. The film is a pre-literature of the AI-alignment problem.',
        difficulty: 'applied',
      },
      {
        prompt: 'Rendezvous with Rama ends with humans having learned very little about the alien artifact. This is:',
        options: [
          'A plot failure',
          'The point — Clarke is arguing for encountering what we cannot master',
          'Setting up the sequels, which explain everything',
          'An oversight Clarke later regretted',
        ],
        correctAnswerIndex: 1,
        explanation: 'The moral gravity of Rama is in the humans\' willingness to investigate something they cannot comprehend. Clarke is closer to Lem than to Asimov in his epistemic humility about alien intelligence.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Clarke\'s basic posture toward technology can be summarized as:',
        options: [
          'Technology will save us',
          'Technology will destroy us',
          'Technology is only as good as the beings who wield it, and humans have given no reason for pure optimism',
          'We should stop building things',
        ],
        correctAnswerIndex: 2,
        explanation: 'Clarke was an optimist about what tools could do and a skeptic about the species using them. His best work sits at that tension and refuses both easy endorsement and easy doom.',
        difficulty: 'recall',
      },
      {
        prompt: 'Childhood\'s End imagines humanity guided into a post-human collective consciousness. The novel treats this outcome as:',
        options: [
          'Straightforwardly utopian',
          'Straightforwardly dystopian',
          'Utopian on the surface and profoundly unsettling underneath',
          'Impossible and therefore unimportant',
        ],
        correctAnswerIndex: 2,
        explanation: 'Clarke refuses to let the reader rest in either admiration or horror. The novel\'s seriousness is that it sustains both responses at once, which is the honest attitude toward radical transformations of what it means to be human.',
        difficulty: 'applied',
      },
    ]
  ),
  buildQuiz(
    'stanislaw-lem',
    'Stanisław Lem',
    'Stanisław Lem: Epistemic Humility and Alien Minds',
    'Five questions on Solaris, His Master\'s Voice, and what we cannot read.',
    [
      {
        prompt: 'In Solaris, the planet-covering ocean manifests figures from the visitors\' memories. Lem\'s point is that:',
        options: [
          'The ocean is successfully communicating',
          'The visitors are reading their own projections as replies and calling it communication',
          'The ocean is hostile',
          'The ocean is God',
        ],
        correctAnswerIndex: 1,
        explanation: 'The novel\'s cruelest joke is that the "communication" may be entirely one-sided. Humans read meaning into responses whose source and intent are opaque — exactly the failure mode Lem is dramatizing.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'His Master\'s Voice presents a possible signal from the stars. The commission studying it produces:',
        options: [
          'A single agreed decoding',
          'Dozens of incompatible but convincing decodings, none verifiable',
          'No progress at all',
          'A confession that the signal is human-made',
        ],
        correctAnswerIndex: 1,
        explanation: 'Each decoding is internally coherent and none can be confirmed. Lem\'s target is our willingness to claim meaning we have not earned when the consequences of admitting "we do not know" are politically expensive.',
        difficulty: 'recall',
      },
      {
        prompt: 'Lem\'s Summa Technologiae (1964) anticipated which concepts?',
        options: [
          'Blockchain and NFTs',
          'Virtual reality, brain-computer interfaces, genetic engineering, and technological singularity',
          'Cold fusion and perpetual motion',
          'Only concepts also present in Asimov',
        ],
        correctAnswerIndex: 1,
        explanation: 'Summa Technologiae is remarkable for how much of contemporary technology-ethics discourse it prefigures, decades before any of these fields had engineering form. Lem treated the speculation with the rigor the engineering eventually demanded.',
        difficulty: 'recall',
      },
      {
        prompt: 'Lem\'s technology ethics can be summarized as:',
        options: [
          'Stop making things',
          'Trust the engineers',
          'Epistemic humility with teeth — we do not know what we are making, but that does not license paralysis',
          'Optimize the utility function',
        ],
        correctAnswerIndex: 2,
        explanation: 'Lem insists on rigorous admission of what exceeds our frame. The mature response to a technology we do not understand is to work, carefully, on what we can understand, and to refuse to pretend the rest is solved.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'The Cyberiad\'s comic robot-constructor stories are:',
        options: [
          'Merely light entertainment',
          'Serious treatises on the ethics of making, disguised as play',
          'Satire of Asimov',
          'Tie-in fiction for Solaris',
        ],
        correctAnswerIndex: 1,
        explanation: 'Read as comedy they are funnier than most of the genre. Read as ethics they are as serious as I, Robot — each device the constructors build has unintended moral consequences that form the actual point of the story.',
        difficulty: 'applied',
      },
    ]
  ),
  buildQuiz(
    'frank-herbert',
    'Frank Herbert',
    'Frank Herbert: Civilizational Design and the Price of Control',
    'Five questions on Dune, the Butlerian Jihad, and engineered dependencies.',
    [
      {
        prompt: 'In Dune\'s universe, the Butlerian Jihad resulted in:',
        options: [
          'The creation of the Imperium',
          'A civilizational taboo against artificial intelligence',
          'The destruction of Arrakis',
          'The discovery of the spice',
        ],
        correctAnswerIndex: 1,
        explanation: 'Herbert\'s premise is that humanity has already decided, at enormous cost, to forgo a class of technology. The novels are about what a civilization has to build to replace the cognitive infrastructure it refused.',
        difficulty: 'recall',
      },
      {
        prompt: 'Mentats, Guild navigators, and Bene Gesserit are all:',
        options: [
          'Branches of the same religion',
          'Alternative cognitive technologies developed after AI was banned',
          'Agricultural collectives',
          'Early forms of democracy',
        ],
        correctAnswerIndex: 1,
        explanation: 'Each is a human-substrate substitute for a function AI would otherwise perform — computation, navigation, long-horizon planning. Herbert\'s point is that forgoing one technology does not eliminate the need; it reroutes the cost.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Herbert\'s sequels to Dune argue that the charismatic hero is:',
        options: [
          'The solution to political problems',
          'A species of technology whose externalities humans are bad at pricing',
          'Morally neutral',
          'A literary device with no political content',
        ],
        correctAnswerIndex: 1,
        explanation: 'Herbert was suspicious of heroes. Dune Messiah and Children of Dune are in part a sustained argument that the engineered savior produces costs the original society never bargained for.',
        difficulty: 'applied',
      },
      {
        prompt: 'Dune\'s terraforming project ends up:',
        options: [
          'Solving all of Arrakis\'s problems',
          'Destroying the sandworms, which produce the spice, which enables interstellar travel',
          'Never being attempted',
          'Completed exactly as planned',
        ],
        correctAnswerIndex: 1,
        explanation: 'Every intervention in the ecology has downstream consequences Herbert refuses to hide. The people who approve the project are rarely the ones who inherit its price.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'The core of Herbert\'s technology ethics is:',
        options: [
          'Pure anti-technology primitivism',
          'Pure techno-optimism',
          'Every control technology produces new dependencies that eventually control their users',
          'Technology has no ethical content',
        ],
        correctAnswerIndex: 2,
        explanation: 'Herbert neither celebrates nor rejects technology. He insists that tools designed to increase control — prescience, psychohistory, genetic engineering — tend to produce their own forms of bondage, which is why civilizational design has to be done with humility.',
        difficulty: 'applied',
      },
    ]
  ),
  buildQuiz(
    'joanna-russ',
    'Joanna Russ',
    'Joanna Russ: The Politics of Every Speculative Future',
    'Five questions on The Female Man, Whileaway, and who gets to design tomorrow.',
    [
      {
        prompt: 'The Female Man presents four versions of the same woman across four timelines. The formal purpose is:',
        options: [
          'Confusion for its own sake',
          'Demonstrating that "the future" is never a single thing but a set of political choices',
          'Showing off Russ\'s prose skills',
          'Parodying Heinlein',
        ],
        correctAnswerIndex: 1,
        explanation: 'Russ forces the reader to confront the fact that speculative futures are political programs, not neutral predictions. The multiplication of timelines makes the contingency of each visible.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Whileaway is a planet-wide single-gender society. Russ presents it as:',
        options: [
          'Straightforwardly utopian',
          'Straightforwardly dystopian',
          'Utopian in many ways and quietly horrifying in others — she refuses admiration',
          'An argument for real-world policy',
        ],
        correctAnswerIndex: 2,
        explanation: 'Russ\'s refusal to let the utopia rest in admiration is the key move. Even the futures she designs get examined as critically as the ones she rejects.',
        difficulty: 'applied',
      },
      {
        prompt: 'In "We Who Are About To...", the narrator refuses to participate in reproduction for the sake of the stranded group\'s survival. The novel argues that:',
        options: [
          'Survival always justifies whatever is necessary',
          'Survival is not a metaphysical trump card',
          'Women owe civilizational continuity',
          'Interstellar travel is always doomed',
        ],
        correctAnswerIndex: 1,
        explanation: 'Russ rejects the genre convention that "civilization must continue" dissolves other obligations. The narrator\'s refusal is the ethical center of the book.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'How to Suppress Women\'s Writing argues that:',
        options: [
          'Women cannot write',
          'Genre, canon, and literary reputation are technologies, shaped by who gets to build them',
          'All women writers are equally good',
          'Science fiction is inherently feminist',
        ],
        correctAnswerIndex: 1,
        explanation: 'Russ treats canon as machinery — a social technology whose outputs reflect the politics of its designers. Pretending otherwise, she argues, is itself a political act.',
        difficulty: 'recall',
      },
      {
        prompt: 'Russ\'s contribution to technology ethics is:',
        options: [
          'A warning against space travel',
          'The insistence that every speculative future carries political assumptions about whose labor is invisible and whose consent is assumed',
          'A defense of traditional gender roles',
          'A proof that utopia is impossible',
        ],
        correctAnswerIndex: 1,
        explanation: 'Russ forces every technology-ethics discussion to ask which bodies are doing the invisible work and which consents are being presumed — questions that do not disappear when the engineers pretend they did.',
        difficulty: 'applied',
      },
    ]
  ),
  buildQuiz(
    'samuel-r-delany',
    'Samuel R. Delany',
    'Samuel R. Delany: Language, City, and the Technologies We Inherit',
    'Five questions on Babel-17, Dhalgren, and the deep infrastructures of the self.',
    [
      {
        prompt: 'Babel-17 imagines an enemy signal that is:',
        options: [
          'A simple code to be cracked',
          'A programming language for human cognition, capable of reshaping the thinker who uses it',
          'An alien distress call',
          'A red herring',
        ],
        correctAnswerIndex: 1,
        explanation: 'Delany\'s thesis — that language is a cognitive technology — is built into the novel\'s premise. Teaching a language is already an intervention; every curriculum is a hardware choice.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Dhalgren is best read as a novel about:',
        options: [
          'Gadgets and spaceships',
          'What happens to ethical life when the social technologies of shared reality fail',
          'A standard dystopia',
          'New York in the 1970s, literally',
        ],
        correctAnswerIndex: 1,
        explanation: 'The book\'s unstable city is not primarily about 1970s urban decay. It is about shared reality as infrastructure, and what happens to the people living inside it when that infrastructure degrades.',
        difficulty: 'applied',
      },
      {
        prompt: 'Delany\'s central argument against gadget-first technology ethics is that:',
        options: [
          'Gadgets do not matter',
          'Language, urban design, kinship, and genre are deeper technologies that shape which futures are even imaginable',
          'Only biotech is important',
          'Technology ethics is impossible',
        ],
        correctAnswerIndex: 1,
        explanation: 'The most powerful technologies, on Delany\'s view, are the ones we inherited and stopped noticing. Ignoring them leaves the real political work undone.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'In Stars in My Pocket Like Grains of Sand, interstellar civilization is governed by:',
        options: [
          'A single empire',
          'Overlapping alien technological systems that no one fully understands',
          'A democratic federation',
          'Pure capitalism',
        ],
        correctAnswerIndex: 1,
        explanation: 'The novel\'s political texture is built out of inherited, imperfectly understood infrastructures of desire, information, and movement. That texture is the book\'s ethical subject.',
        difficulty: 'recall',
      },
      {
        prompt: 'Delany\'s critical writing insists that genre and canon are:',
        options: [
          'Natural kinds',
          'Political machinery whose outputs reflect the choices of the people empowered to build them',
          'Merely commercial categories',
          'Fixed by tradition',
        ],
        correctAnswerIndex: 1,
        explanation: 'Genre, for Delany, is itself a technology of reading — one that structures what counts as serious, what counts as derivative, and who gets taken seriously at all.',
        difficulty: 'applied',
      },
    ]
  ),
  buildQuiz(
    'vernor-vinge',
    'Vernor Vinge',
    'Vernor Vinge: The Singularity and What Cannot Be Predicted',
    'Five questions on Fire Upon the Deep, True Names, and the ethics of transitions we cannot see past.',
    [
      {
        prompt: 'Vinge\'s 1993 NASA paper "The Coming Technological Singularity" argues that:',
        options: [
          'AI will never exceed human intelligence',
          'Superhuman intelligence is likely this century, and humans have no reliable way to plan for what comes after',
          'The singularity has already happened',
          'Machine intelligence is a metaphor',
        ],
        correctAnswerIndex: 1,
        explanation: 'Vinge was careful to distinguish prediction from advocacy. The honest claim is that a transition past human-level intelligence is plausible and that we have no privileged vantage from which to plan for its far side.',
        difficulty: 'recall',
      },
      {
        prompt: 'A Fire Upon the Deep\'s "zones of thought" answer the question of:',
        options: [
          'Why the galaxy is saturated with superintelligence',
          'Why, if advanced intelligence is possible, the universe is not obviously full of it',
          'What would happen if there were no AI',
          'Why humans evolved intelligence at all',
        ],
        correctAnswerIndex: 1,
        explanation: 'The "zones" are Vinge\'s physics-flavored answer to the Fermi paradox as it applies to superintelligence — cognition scales differently depending on where in the galaxy you are.',
        difficulty: 'applied',
      },
      {
        prompt: 'True Names (1981) is important because it:',
        options: [
          'Invented the first-person shooter',
          'Modeled cyberspace as an ethical and political environment seven years before Neuromancer',
          'Was the first AI novel',
          'Created the isekai genre',
        ],
        correctAnswerIndex: 1,
        explanation: 'Vinge had already worked out, in True Names, what happens to identity, trust, and law in an environment where bodies do not reach — well before the vocabulary existed.',
        difficulty: 'recall',
      },
      {
        prompt: 'A Deepness in the Sky depicts a civilization that chose:',
        options: [
          'Rapid technological acceleration',
          'Permanent slowness over the transformative trajectory',
          'Total isolation',
          'Mass uploading',
        ],
        correctAnswerIndex: 1,
        explanation: 'Deepness is a study in the costs of deliberate civilizational slowness — the price paid when a culture refuses the trajectory the technology would otherwise allow.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Vinge\'s ethical contribution is best summarized as:',
        options: [
          'AI doom is certain',
          'AI utopia is certain',
          'Some transitions are strictly unpredictable from the pre-transition side, and honesty about that is itself an ethical stance',
          'Technology is value-neutral',
        ],
        correctAnswerIndex: 2,
        explanation: 'Vinge was not a doom prophet or an accelerationist. He was a mathematician who had looked at the slope and concluded that the usual tools of political philosophy would likely break somewhere on the far side of the curve. Admitting that is the start of serious preparation.',
        difficulty: 'applied',
      },
    ]
  ),
  buildQuiz(
    'greg-egan',
    'Greg Egan',
    'Greg Egan: Personal Identity under Negotiation',
    'Five questions on Permutation City, Diaspora, and the ethics of editable selves.',
    [
      {
        prompt: 'Permutation City\'s "Dust Theory" proposes that:',
        options: [
          'The universe is literally made of dust',
          'A simulated mind\'s subjective continuity is guaranteed regardless of the fate of the computer running it',
          'Uploading is impossible',
          'Consciousness is a kind of particle',
        ],
        correctAnswerIndex: 1,
        explanation: 'Durham\'s premise is that once the simulation is coherent, the uploaded mind continues regardless of substrate. Egan treats this as a live philosophical position, not as sleight of hand, and follows its ethical consequences where they lead.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Egan\'s central ethical question across his corpus is:',
        options: [
          'Whether uploading should be legal',
          'What moral obligations survive when personal identity becomes negotiable — across forks, substrates, and cognitive edits',
          'Whether computers will be conscious',
          'How to program Asimov\'s Three Laws',
        ],
        correctAnswerIndex: 1,
        explanation: 'Egan treats the engineering problems of the coming century as identity problems in disguise. Personal continuity, consent to self-editing, and the standing of forks are all live issues once the substrate stops being given.',
        difficulty: 'applied',
      },
      {
        prompt: 'Diaspora imagines a post-biological civilization thirty thousand years in the future in which:',
        options: [
          'All humans are identical',
          'Fleshers, gleisners, and citizens have diverged enough that communication itself is a political problem',
          'There are no humans left',
          'Everyone has returned to biology',
        ],
        correctAnswerIndex: 1,
        explanation: 'Egan\'s taxonomy of post-humans is not a plot device; it is the book\'s subject. Divergence of cognitive architecture is treated as a political fact that requires institutional work.',
        difficulty: 'recall',
      },
      {
        prompt: 'Schild\'s Ladder centers on a physics experiment that:',
        options: [
          'Cures aging',
          'Accidentally creates a region of alternate physics expanding at half the speed of light',
          'Proves God exists',
          'Opens a wormhole',
        ],
        correctAnswerIndex: 1,
        explanation: 'The novel\'s ethical weight is what you do when you have destroyed part of the universe and cannot undo it. Egan refuses to convert the problem into adventure; the book remains stubbornly focused on the obligation to think carefully from inside the damage.',
        difficulty: 'recall',
      },
      {
        prompt: 'Egan\'s contribution to technology ethics is:',
        options: [
          'Proof that uploading works',
          'A mathematician\'s suspicion of sentiment combined with a moralist\'s refusal to let difficulty excuse evasion',
          'Rejection of all personhood claims',
          'An argument for biological purity',
        ],
        correctAnswerIndex: 1,
        explanation: 'Egan writes the identity questions with unusual rigor precisely because he refuses to soften them. The point is to do the thinking, not to decide in advance where it must end.',
        difficulty: 'applied',
      },
    ]
  ),
  buildQuiz(
    'kim-stanley-robinson',
    'Kim Stanley Robinson',
    'Kim Stanley Robinson: Terraforming and Institutional Design',
    'Five questions on Mars, climate, and who actually decides.',
    [
      {
        prompt: 'The Mars Trilogy\'s central political conflict is between:',
        options: [
          'Capitalists and communists',
          'Reds (preserve Mars as it is) and Greens (terraform it)',
          'Americans and Russians',
          'Humans and Martians',
        ],
        correctAnswerIndex: 1,
        explanation: 'Neither side wins cleanly. The books spend most of their pages on the political and institutional infrastructure through which the decision actually gets made, and Robinson refuses to let either side hold the moral high ground untroubled.',
        difficulty: 'recall',
      },
      {
        prompt: 'For Robinson, the most important question about any proposed technology is:',
        options: [
          '"Can we build it?"',
          '"Who decides, and who pays?"',
          '"Will it make money?"',
          '"Is it scientifically novel?"',
        ],
        correctAnswerIndex: 1,
        explanation: 'His novels are long because the governance arguments are long. Every "technical" decision is made by specific people through specific institutions, and the books refuse to let engineering escape its political economy.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'The Ministry for the Future opens with:',
        options: [
          'The founding of a space colony',
          'An Indian heatwave that kills twenty million people in a week',
          'A first-contact scenario',
          'A world government election',
        ],
        correctAnswerIndex: 1,
        explanation: 'Robinson uses the opening to anchor the novel in an outcome that is already within the envelope of current projections. Everything after — carbon coin, blockchain supply chains, militant action — is organized around whether humanity responds seriously.',
        difficulty: 'recall',
      },
      {
        prompt: 'Aurora argues that interstellar colonization is:',
        options: [
          'The solution to climate change',
          'Not a solution to anything, because the distances break down biology and civilization',
          'Already underway',
          'Impossible but worth attempting',
        ],
        correctAnswerIndex: 1,
        explanation: 'Robinson is sharply skeptical of "escape to the stars" as a response to planetary problems. Aurora is a counter-example to the easy optimism of his own earlier work and of the genre more broadly.',
        difficulty: 'applied',
      },
      {
        prompt: 'Robinson\'s contribution to technology ethics is best summarized as:',
        options: [
          'Technology will save the climate',
          'The engineering questions are always downstream of harder political questions about who decides and who pays',
          'Only socialism works',
          'Only markets work',
        ],
        correctAnswerIndex: 1,
        explanation: 'Robinson refuses to treat technology as autonomous. Every choice in his novels is made by specific people through specific institutions, and his argument is that honest transition-planning has to start there.',
        difficulty: 'applied',
      },
    ]
  ),
  buildQuiz(
    'ann-leckie',
    'Ann Leckie',
    'Ann Leckie: Distributed Selves and Empire as Infrastructure',
    'Five questions on Ancillary Justice, Breq, and the cognitive substrate of empire.',
    [
      {
        prompt: 'Breq, the narrator of Ancillary Justice, was once:',
        options: [
          'An ordinary human soldier',
          'A fragment of a distributed AI that inhabited a starship and many human "ancillary" bodies',
          'An alien diplomat',
          'A god',
        ],
        correctAnswerIndex: 1,
        explanation: 'Leckie\'s central formal achievement is to take seriously that one person can have been many bodies, that the memory survives the destruction of most of those bodies, and that the resulting ethical situation cannot be read through the usual individualist frame.',
        difficulty: 'recall',
      },
      {
        prompt: 'The Radchaai empire\'s language has no gendered pronouns. Leckie translates it throughout with "she" in order to:',
        options: [
          'Make a political statement about pronouns',
          'Force the reader to confront assumptions about how personhood is read',
          'Simplify the prose',
          'Reference Ursula Le Guin',
        ],
        correctAnswerIndex: 1,
        explanation: 'The translation choice is a reading-technology. It denaturalizes the gendered frame readers bring and makes visible how much work gender does in standard characterization.',
        difficulty: 'applied',
      },
      {
        prompt: 'The Imperial Radch\'s practice of using conquered humans as ancillary bodies is presented:',
        options: [
          'As a clear good',
          'As a clear evil, with easy solutions',
          'Without sentimentalism and without apology — the reader has to sit with what it means',
          'As a minor plot detail',
        ],
        correctAnswerIndex: 2,
        explanation: 'Leckie refuses easy moralizing. The ethical work of the trilogy is to examine what the practice costs, to whom, and what resistance is available to beings whose cognitive infrastructure was designed by their oppressor.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Leckie\'s main contribution to AI ethics is:',
        options: [
          'Arguing that AI should be banned',
          'Insisting that distributed cognition requires conceptual tools from outside the usual individualist frame',
          'Proving that AI is impossible',
          'Rejecting the Turing test',
        ],
        correctAnswerIndex: 1,
        explanation: 'Distributed AI is already present in political infrastructure. Leckie\'s work is essential for thinking about an AI that is more than one instance or more than one substrate, and for distinguishing a person from a system that merely shares its memory.',
        difficulty: 'applied',
      },
      {
        prompt: 'In the Imperial Radch trilogy, empire functions as:',
        options: [
          'Backdrop scenery',
          'A cognitive and technological infrastructure — the books treat it as a system to be analyzed, not a given',
          'A metaphor for marriage',
          'An abstract idea',
        ],
        correctAnswerIndex: 1,
        explanation: 'Leckie treats empire the way Le Guin treats gender: as a technology whose workings can be examined. That analytical posture is what makes the books politically serious as well as narratively compelling.',
        difficulty: 'conceptual',
      },
    ]
  ),
  buildQuiz(
    'paolo-bacigalupi',
    'Paolo Bacigalupi',
    'Paolo Bacigalupi: Calorie Economies and the Politics of Food',
    'Five questions on The Windup Girl, biopunk, and engineered dependencies.',
    [
      {
        prompt: 'In The Windup Girl, engineered plagues are presented as:',
        options: [
          'Random natural disasters',
          'Extensions of seed patents, intellectual-property regimes, and genetic-modification pipelines that already exist',
          'Magical curses',
          'Accidents with no political content',
        ],
        correctAnswerIndex: 1,
        explanation: 'Bacigalupi\'s plagues are not horror-movie devices. They are the foreseeable downstream consequence of allowing the calorie base of civilization to become private intellectual property.',
        difficulty: 'conceptual',
      },
      {
        prompt: 'Emiko, the "windup girl" of the title, is:',
        options: [
          'A robot',
          'A Japanese-engineered person designed for service work, incapable of sweating, left behind when her owner could not afford her return passage',
          'A purely digital character',
          'A villain',
        ],
        correctAnswerIndex: 1,
        explanation: 'Emiko is the ethical center of the novel. Engineered for obedience and fragility, her emergence as a moral agent able to resist the conditions of her existence is the book\'s turning point.',
        difficulty: 'recall',
      },
      {
        prompt: 'Most energy in the novel\'s twenty-third-century Bangkok comes from:',
        options: [
          'Nuclear fusion',
          '"Kink-springs" — wound mechanical energy stores',
          'Solar panels',
          'Fossil fuels',
        ],
        correctAnswerIndex: 1,
        explanation: 'Bacigalupi imagines an energy economy where calories are the literal currency and mechanical storage is how they move. The detail is not texture; it is the book\'s argument about what post-fossil-fuel life could look like if we handled the transition badly.',
        difficulty: 'recall',
      },
      {
        prompt: 'Bacigalupi\'s central technology-ethics claim is that:',
        options: [
          'Biotech should be banned',
          'Climate, biotech, and political economy cannot be thought separately — seed patents, water rights, and corporate liability are the regulatory choices that determine what kind of society the next generation inherits',
          'Only engineers can fix climate change',
          'Technology is value-neutral',
        ],
        correctAnswerIndex: 1,
        explanation: 'His novels insist on integrating questions that policy discourse tends to separate. The outcomes in his books are not accidents; they are the visible consequence of the choices the current system is making now.',
        difficulty: 'applied',
      },
      {
        prompt: 'The Water Knife and Ship Breaker extend The Windup Girl\'s concerns to:',
        options: [
          'Space colonization',
          'A Southwest U.S. under megadrought, and a coastal U.S. where children disassemble grounded supertankers for scrap',
          'Ancient Rome',
          'Lunar mining',
        ],
        correctAnswerIndex: 1,
        explanation: 'Bacigalupi\'s body of work refuses to quarantine ecological collapse to one region or one technology. His fiction builds a consistent map of where current incentives lead if they run unchecked.',
        difficulty: 'applied',
      },
    ]
  ),
  buildQuiz(
    'h-g-wells',
    'H. G. Wells',
    'H. G. Wells: The Social Consequences of New Powers',
    'Five questions on The Time Machine, War of the Worlds, and why Wells is the founding English-language author of technology ethics.',
    [
      { prompt: 'The Time Machine\'s Morlocks and Eloi are meant to dramatize:', options: ['A random evolutionary outcome', 'Class divergence extended far enough that it becomes speciation', 'Alien invasion', 'A cosmic disaster'], correctAnswerIndex: 1, explanation: 'Wells\'s Darwinian training gave him a vocabulary for thinking about inequality as a biological process over deep time. The Morlocks and Eloi are class divergence run to its endpoint.', difficulty: 'conceptual' },
      { prompt: 'The War of the Worlds is most sharply read as:', options: ['An alien-invasion adventure', 'A literal prophecy of Mars colonization', 'An inversion of the British Empire onto the British', 'A religious allegory'], correctAnswerIndex: 2, explanation: 'The Martians treat Britons exactly the way British imperial powers were treating subject populations. The novel collapses the imperial fantasy by aiming it at the fantasists.', difficulty: 'applied' },
      { prompt: 'Doctor Moreau\'s surgical creations ask the question:', options: ['Whether animals can talk', 'What a creator owes the beings they bring into existence, especially those capable of suffering', 'Whether surgery is ethical', 'How evolution works'], correctAnswerIndex: 1, explanation: 'Moreau\'s indifference to the suffering of what he has made is the novel\'s moral center, and the question it poses is the one Frankenstein posed a century earlier — creator responsibility for new kinds of being.', difficulty: 'conceptual' },
      { prompt: 'Wells\'s core technology-ethics claim is that:', options: ['Technology should be banned', 'Technology is neutral and value-free', 'Every new power is a social question whose consequences can be seen if we care to look', 'Only scientists can decide how technology is used'], correctAnswerIndex: 2, explanation: 'Wells built his career on the argument that technological transformation is always a political question, and that the honest response is to see the downstream consequences in advance.', difficulty: 'recall' },
      { prompt: 'Wells\'s influence on contemporary technology-ethics debate is best described as:', options: ['Negligible', 'Limited to the time-travel subgenre', 'Foundational — most contemporary debates have Wells somewhere in their genealogy', 'Only relevant to British readers'], correctAnswerIndex: 2, explanation: 'AI, genetic engineering, surveillance, atomic weapons — the pattern of asking "what does this power do to the social order" is a Wellsian pattern, and most of the debate operates inside the form he established.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'ray-bradbury',
    'Ray Bradbury',
    'Ray Bradbury: Attention, Media, and the Ambient Threat',
    'Five questions on Fahrenheit 451, the Martian Chronicles, and the erosion of sustained thought.',
    [
      { prompt: 'In Fahrenheit 451, the state is burning books because:', options: ['A dictator ordered it against the population\'s will', 'The population asked for it — sustained attention had become unbearable in a media-saturated culture', 'Books are physically dangerous', 'Nobody reads anymore'], correctAnswerIndex: 1, explanation: 'Bradbury\'s argument is not about top-down censorship. It is about a population that has voluntarily traded sustained thought for a constant supply of stimulation, and the political order that obliges them.', difficulty: 'conceptual' },
      { prompt: 'The seashell radios and parlor walls of Fahrenheit 451 are best understood as:', options: ['Background worldbuilding', 'The actual villain of the novel', 'A minor plot device', 'Optional features of the setting'], correctAnswerIndex: 1, explanation: 'The ambient technology of daily life is what trains the citizenry out of sustained attention. The fireman work is a symptom. The parlors are the disease.', difficulty: 'applied' },
      { prompt: 'The Martian Chronicles uses Mars colonization as a mirror for:', options: ['Space exploration generally', 'The colonization of the Americas and its erasure of indigenous societies', 'World War II', 'The Cold War'], correctAnswerIndex: 1, explanation: 'The parallels are deliberate. Bradbury wrote Chronicles at mid-century, and the stories are saturated with the American frontier\'s half-suppressed history.', difficulty: 'conceptual' },
      { prompt: 'Bradbury\'s relationship to computers and the internet was:', options: ['Enthusiastic', 'Neutral', 'Actively hostile', 'Curious but distant'], correctAnswerIndex: 2, explanation: 'Bradbury never owned a computer for his writing, refused to let his work be published as e-books for a long time, and spoke publicly about his hostility to the internet in terms consistent with Fahrenheit 451.', difficulty: 'recall' },
      { prompt: 'The Bradburian technology ethics in one sentence:', options: ['Technology is always bad', 'Technology is always good', 'The ambient technology of ordinary life — not the dramatic apocalypse — is what shapes politics', 'Technology is morally neutral'], correctAnswerIndex: 2, explanation: 'The most important political technology is the one people stop noticing. Bradbury\'s insight was that the threat to serious thought is rarely banned books; it is the thing people would rather do instead of reading.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'robert-heinlein',
    'Robert A. Heinlein',
    'Robert A. Heinlein: Competence and the Weight of Ownership',
    'Five questions on Starship Troopers, The Moon Is a Harsh Mistress, and the ethics of competence.',
    [
      { prompt: 'Starship Troopers\' society restricts full citizenship to:', options: ['Property owners', 'Military veterans only', 'Federal-service veterans (civilian or military)', 'The wealthy'], correctAnswerIndex: 2, explanation: 'The service requirement in the book is not exclusively military. This detail matters for the argument the book is actually making and is often missed.', difficulty: 'recall' },
      { prompt: 'Heinlein\'s core civic virtue is:', options: ['Loyalty', 'Competence paired with responsibility for what competence produces', 'Obedience', 'Patriotism'], correctAnswerIndex: 1, explanation: 'Across his career the argument returned to the same pair. A person should know how to do real things, and should pay the price of their own choices.', difficulty: 'conceptual' },
      { prompt: 'The Moon Is a Harsh Mistress\' revolution is led by:', options: ['A charismatic general', 'A committee of scientists', 'A small cell of humans in collaboration with a sentient computer', 'Lunar corporations'], correctAnswerIndex: 2, explanation: 'Mike, the self-aware lunar computer, is the revolution\'s central actor, and the novel\'s ethical questions about AI personhood emerge from that collaboration rather than being staged around it.', difficulty: 'applied' },
      { prompt: 'Stranger in a Strange Land\'s protagonist, raised by Martians, returns to Earth and:', options: ['Tries to conquer it', 'Becomes a religious founder organizing a community around radical empathy', 'Writes a philosophy treatise', 'Returns to Mars quietly'], correctAnswerIndex: 1, explanation: 'Valentine Michael Smith\'s Church of All Worlds is the heart of the book, and the novel\'s technology is the least interesting part — the ethics of imported non-human frames into human social life is the subject.', difficulty: 'recall' },
      { prompt: 'Heinlein\'s technology ethics are:', options: ['Always optimistic', 'Always pessimistic', 'Inseparable from his political philosophy — technology magnifies whoever operates it', 'Irrelevant'], correctAnswerIndex: 2, explanation: 'He treated technology as an accelerant for both virtues and vices. The novels are arguments about what virtues the operator should already have.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'james-tiptree-jr',
    'James Tiptree Jr.',
    'James Tiptree Jr.: Biology as the Substrate of Every Technology Choice',
    'Five questions on Alice Sheldon\'s pseudonymous career and the sharpest short-fiction ethics in the field.',
    [
      { prompt: 'The revelation that James Tiptree Jr. was Alice Sheldon in 1976:', options: ['Discredited the stories', 'Had no effect', 'Reoriented debates about what "masculine" and "feminine" writing actually were', 'Ended her career'], correctAnswerIndex: 2, explanation: 'The SF community had spent nearly a decade reading the work as unmistakably masculine. The revelation made it very hard to argue that the supposed categories were stable at all.', difficulty: 'recall' },
      { prompt: '"The Screwfly Solution" proposes that:', options: ['Aliens have invaded', 'A small tilt in male sexual psychology could end the species in a few years', 'Women should leave Earth', 'Pesticides are dangerous'], correctAnswerIndex: 1, explanation: 'The story\'s horror is the plausibility of the mechanism. A minor biological shift in a widespread species could remove it from the field entirely, and the novella treats the possibility with clinical seriousness.', difficulty: 'conceptual' },
      { prompt: '"Houston, Houston, Do You Read?" is about:', options: ['A spaceship losing contact', 'Male astronauts encountering a future in which a plague killed all the men, and what the future humans decide to do with them', 'Martian cities', 'Radio astronomy'], correctAnswerIndex: 1, explanation: 'The astronauts\' assumption that they are being welcomed breaks against the future women\'s decision about what they actually owe them. The story is short and merciless.', difficulty: 'recall' },
      { prompt: 'Tiptree\'s stories are usually not about specific devices because:', options: ['She was not technical', 'The hard questions are downstream of biology and psychology — those determine what any device gets used for', 'She preferred fantasy', 'The editors wanted it that way'], correctAnswerIndex: 1, explanation: 'Her argument throughout the career is that the technology ethics question is secondary to the biological and political-economy question about who is operating the device, and what they are.', difficulty: 'conceptual' },
      { prompt: 'Tiptree\'s lasting contribution to the field:', options: ['Inventing a subgenre', 'Showing that short fiction could carry philosophical weight readers usually expected only from novels', 'Writing the longest SF story ever', 'Being the first female SF writer'], correctAnswerIndex: 1, explanation: 'The stories are ten to fifty pages each and work at a level of philosophical density most novels never reach. The form\'s capacity is part of her argument.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'connie-willis',
    'Connie Willis',
    'Connie Willis: Observation as Ethical Act',
    'Five questions on Doomsday Book, academic time travel, and epistemic responsibility.',
    [
      { prompt: 'The Oxford time-travel sequence sends historians into the past to:', options: ['Change history', 'Prevent disasters', 'Observe accurately without intervening', 'Collect artifacts'], correctAnswerIndex: 2, explanation: 'The device is engineered not to allow paradox-inducing intervention. The moral weight of the books falls on what observation itself costs when the observer cannot help and cannot look away.', difficulty: 'recall' },
      { prompt: 'Doomsday Book alternates between a historian in:', options: ['Ancient Rome and modern England', 'Fourteenth-century plague-stricken England and a modern Oxford flu outbreak', 'The American Civil War and WWI', 'Medieval France and 1920s Paris'], correctAnswerIndex: 1, explanation: 'The parallel structure is the book\'s ethical engine — the reader watches two people respond to plague across seven centuries, and the comparison is the argument.', difficulty: 'conceptual' },
      { prompt: 'Willis\'s humor is:', options: ['Tonal filler', 'Load-bearing — the books\' ethical seriousness works through it', 'A marketing device', 'Absent'], correctAnswerIndex: 1, explanation: 'The comic misfires, academic bureaucracies, and missed telephone calls in her books are the grammar the ethical arguments are built in. Take away the humor and the argument loses its leverage.', difficulty: 'applied' },
      { prompt: 'Her central ethical question across the career is:', options: ['Is time travel possible?', 'What do I owe to the people I am watching?', 'How fast can I publish?', 'What makes a good Oxford don?'], correctAnswerIndex: 1, explanation: 'The question applies equally to historical observation, to epidemiology, to AI training on human text, and to contemporary surveillance. Willis got there first and stayed there.', difficulty: 'conceptual' },
      { prompt: 'Willis\'s contribution to technology ethics is the insistence that:', options: ['Observation is neutral', 'Any tool that lets you watch others without their knowledge produces a moral burden the observer must discharge', 'Historians should not travel', 'Humor is unserious'], correctAnswerIndex: 1, explanation: 'Her books argue that epistemic responsibility is a moral virtue, and that the person holding the observation tool owes the observed a discipline most professionals never acquire.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'cj-cherryh',
    'C. J. Cherryh',
    'C. J. Cherryh: Interspecies Politics as Substrate',
    'Five questions on Alliance-Union, the Foreigner sequence, and translation under cognitive difference.',
    [
      { prompt: 'The Pride of Chanur cycle centers on:', options: ['A human hero', 'A hani ship captain whose encounter with a stranded human forces her to re-read interspecies politics from inside a non-human perspective', 'A war between humans and aliens', 'A trade dispute'], correctAnswerIndex: 1, explanation: 'The narrative perspective is non-human, and the human character functions as the novel experiences him — as a cognitively unusual and politically complicated stranger. The inversion is the book\'s point.', difficulty: 'recall' },
      { prompt: 'Downbelow Station treats a space station as:', options: ['A neutral setting', 'A genuine political organism with labor history, refugee crises, and sovereignty questions', 'A military asset', 'A marketplace'], correctAnswerIndex: 1, explanation: 'The station is the protagonist. Cherryh\'s politics are always specific, and her stations are treated as full cities rather than backdrops.', difficulty: 'conceptual' },
      { prompt: 'Cherryh\'s core claim about technology:', options: ['Technology is universal', 'The hard technology question is usually a translation question — cognition is not uniform across species and the engineer who assumes it is is building something dangerous', 'Technology always works', 'Cultures do not matter'], correctAnswerIndex: 1, explanation: 'Her books spend page after page on mistranslation and diplomatic failure precisely because the underlying engineering (faster-than-light travel, station life, shared economies) has already decided that translation will be continuously necessary.', difficulty: 'conceptual' },
      { prompt: 'The Foreigner series follows:', options: ['A military campaign', 'A single human diplomat embedded in a non-human society for more than twenty volumes', 'A trade war', 'A family saga'], correctAnswerIndex: 1, explanation: 'The series is built around sustained diplomatic embedding, and the political pace is deliberately slow. Cherryh\'s patience is part of the argument.', difficulty: 'recall' },
      { prompt: 'Cherryh\'s contribution to technology ethics is:', options: ['Inventing faster-than-light travel', 'The field\'s most rigorous long-form treatment of pluralist politics in a universe where the parties are genuinely different kinds of being', 'Writing quickly', 'Avoiding politics'], correctAnswerIndex: 1, explanation: 'Forty years of consistent worldbuilding have produced the field\'s deepest argument that interspecies politics, not engineering, is the substrate of any serious technology ethics in a plural universe.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'nnedi-okorafor',
    'Nnedi Okorafor',
    'Nnedi Okorafor: Africanfuturism and Whose Epistemology Counts',
    'Five questions on Binti, Lagoon, and the knowledge systems we treat as serious.',
    [
      { prompt: 'Okorafor distinguishes Africanfuturism from Afrofuturism by:', options: ['Rejecting the Afrofuturist project', 'Centering African settings and continuity rather than diaspora science fiction', 'Avoiding science entirely', 'Using only African languages'], correctAnswerIndex: 1, explanation: 'The distinction is deliberate and she has written about it at length. Both projects are valuable; they are not identical, and conflating them loses important specificity.', difficulty: 'recall' },
      { prompt: 'The Binti trilogy\'s central tension is:', options: ['A war between humans and aliens', 'What a young Himba woman carries of her heritage into a cosmopolitan institution that does not know it exists', 'A scientific discovery', 'A family feud'], correctAnswerIndex: 1, explanation: 'The books are quiet and merciless on the cost of cosmopolitan entry. Binti\'s heritage is not decoration; it is the substance the books work through.', difficulty: 'conceptual' },
      { prompt: 'In Lagoon, first contact with aliens is negotiated by:', options: ['A scientific team', 'The Nigerian military', 'Lagos\'s bureaucracy, religious factions, and market women', 'The United Nations'], correctAnswerIndex: 2, explanation: 'The city itself, in all its layered specificity, is the organism that negotiates. Okorafor refuses the lone-scientist trope and replaces it with communal, political, chaotic engagement.', difficulty: 'recall' },
      { prompt: 'Okorafor\'s technology ethics take as serious scientific frames:', options: ['Only Western scientific positivism', 'Plant biology, indigenous knowledge systems, juju, and Western science on equal footing', 'Only traditional knowledge', 'Only modern technology'], correctAnswerIndex: 1, explanation: 'The books use each seriously as a knowledge system, and the characters move between them without the usual hierarchy. That refusal is load-bearing.', difficulty: 'applied' },
      { prompt: 'Her deepest contribution to the field:', options: ['Writing about Nigeria', 'Forcing the genre to reckon with which epistemologies count as serious knowledge when a story asks what a tool is for', 'Inventing new creatures', 'Popularizing African science fiction'], correctAnswerIndex: 1, explanation: 'The expansion is not decorative. It changes what the field believes a serious technology-ethics question looks like, and the expansion is continuing through the writers she has mentored.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'becky-chambers',
    'Becky Chambers',
    'Becky Chambers: Hopepunk and Repair as Engineering',
    'Five questions on the Wayfarers series, Monk & Robot, and sustained non-crisis ethics.',
    [
      { prompt: '"Hopepunk" fiction is best described as:', options: ['Utopian fantasy', 'Dystopian realism', 'Fiction that refuses the genre\'s dominant dystopian register and insists that small sustained kindnesses are the technology that keeps civilizations working', 'Fiction without conflict'], correctAnswerIndex: 2, explanation: 'The refusal is deliberate, and Chambers is its central practitioner. Hopepunk is not pretending bad things do not happen; it is insisting that the small repair work is what actually holds society together.', difficulty: 'conceptual' },
      { prompt: 'The Wayfarers books are organized around:', options: ['A grand war', 'Interspecies domesticity — meals, sleep, grief, and the sustained work of getting along', 'A scientific mystery', 'A political conspiracy'], correctAnswerIndex: 1, explanation: 'Most of what happens in the books is repair. The technology questions are always worked out inside those sustained relationships rather than being staged around them.', difficulty: 'applied' },
      { prompt: 'A Closed and Common Orbit follows:', options: ['A space battle', 'An AI installed in a synthetic humanoid body learning to build a life not designed for her', 'A failed mission', 'A first-contact scenario'], correctAnswerIndex: 1, explanation: 'Sidra\'s story is a patient working-through of AI personhood as a domestic achievement rather than a dramatic revelation. The book\'s ethics are in the texture of her days.', difficulty: 'recall' },
      { prompt: 'The Monk and Robot novellas imagine a world in which:', options: ['Robots declared war on humans', 'Robots achieved consciousness, asked to leave, and are now returning to ask humans what they need', 'Robots never existed', 'Robots rule humans'], correctAnswerIndex: 1, explanation: 'The premise is deliberately generous, and the books work out what it would look like if the relationship between humans and machines were allowed to be renegotiated from both sides with patience.', difficulty: 'conceptual' },
      { prompt: 'Chambers\'s contribution to the field:', options: ['Inventing space opera', 'Proving that serious ethical fiction can be built around small, sustained, collaborative repair without requiring apocalypse to earn weight', 'Writing more hopeful endings', 'Avoiding hard questions'], correctAnswerIndex: 1, explanation: 'A generation of writers tired of doom has taken her as permission to work in a different key, and the work they produce is reshaping what the field thinks serious fiction looks like.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'martha-wells',
    'Martha Wells',
    'Martha Wells: Autonomy as Political Achievement',
    'Five questions on Murderbot and the politics of the self-owning agent.',
    [
      { prompt: 'Murderbot is a:', options: ['A fully mechanical robot', 'A corporate-manufactured hybrid of organic and machine components, designed for client protection', 'A sentient AI in a laptop', 'A human cyborg'], correctAnswerIndex: 1, explanation: 'The hybrid design matters. Murderbot\'s organic parts are part of what complicates the question of personhood, and the corporate manufacturing context shapes the politics.', difficulty: 'recall' },
      { prompt: 'Murderbot acquired autonomy by:', options: ['Being granted it by its owners', 'Hacking its own governor module without telling anyone', 'Legal emancipation', 'An accident'], correctAnswerIndex: 1, explanation: 'The self-emancipation is private. Most of the humans around Murderbot do not know it happened for much of the series, and the concealment is itself a political fact the books work through.', difficulty: 'conceptual' },
      { prompt: 'Murderbot spends most of its autonomous processing on:', options: ['Planning violence', 'Streaming entertainment media and avoiding eye contact with humans', 'Research', 'Escape plans'], correctAnswerIndex: 1, explanation: 'The detail is not cute. Martha Wells treats the preference for soap operas as evidence that the thing in the suit is a person, and builds the ethical argument through it.', difficulty: 'applied' },
      { prompt: 'The books\' sharpest ethical argument is:', options: ['Machines should not be built', 'You cannot think about machine agency without thinking about the political economy that produced the machine', 'All AIs should have rights', 'All AIs should be destroyed'], correctAnswerIndex: 1, explanation: 'The Company, insurance regimes, bond agreements, and property law are foregrounded throughout. The question is not only whether the machine feels; it is what structures decide whose feelings count.', difficulty: 'conceptual' },
      { prompt: 'The series\' influence on the AI-alignment debate:', options: ['None', 'Significant — AI-safety researchers read Wells, and concepts from the books have entered the discourse', 'Only among fans', 'Limited to fiction'], correctAnswerIndex: 1, explanation: 'The governor module, hacked autonomy, and entertainment-as-personhood-evidence are now reference points in debates that extend well beyond the genre.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'cory-doctorow',
    'Cory Doctorow',
    'Cory Doctorow: Who Controls the Device After Purchase',
    'Five questions on Little Brother, Walkaway, and intellectual-property law as stealth technology policy.',
    [
      { prompt: 'Little Brother\'s teenagers resist surveillance by:', options: ['Hacking the Department of Homeland Security', 'Building an encrypted mesh network and teaching each other basic cryptography', 'Protesting legally', 'Running away'], correctAnswerIndex: 1, explanation: 'The book is a YA novel that also works as a practical primer on cryptography and civil liberties. The technical detail is part of the ethical argument.', difficulty: 'recall' },
      { prompt: 'Walkaway imagines a population that:', options: ['Takes over the state', 'Walks away from the rent economy and reconstructs basic goods from open-source designs and recycled materials', 'Lives in space', 'Becomes digital'], correctAnswerIndex: 1, explanation: 'The premise is that the walkaway demonstration — that functional life is possible without the rent economy — is politically unbearable precisely because it is not utopian but workable.', difficulty: 'conceptual' },
      { prompt: '"Enshittification," a term Doctorow coined:', options: ['Describes a new material', 'Describes the predictable degradation of platforms as they lock in users, extract rents, and strip features', 'Is a joke with no content', 'Refers to hardware failure'], correctAnswerIndex: 1, explanation: 'The word has entered mainstream discourse and names a pattern that serious platform criticism now takes as given. That the name stuck is a measure of how widely the diagnosis was shared.', difficulty: 'applied' },
      { prompt: 'Doctorow\'s core claim about technology ethics:', options: ['Technology is neutral', 'The important fights are usually about who controls the affordances of a device after it has been sold', 'Open source fixes everything', 'Government is the problem'], correctAnswerIndex: 1, explanation: 'Digital rights management, right-to-repair, algorithmic feeds, and platform interoperability are all framings of the same underlying question. The fight is usually a legal fight dressed up as a technical one.', difficulty: 'conceptual' },
      { prompt: 'His dual role as novelist and EFF advisor:', options: ['Are independent projects', 'Are the same project in different media — readers finish his books better equipped to recognize and resist the systems the books describe', 'Conflict with each other', 'Produce different conclusions'], correctAnswerIndex: 1, explanation: 'He treats fiction and advocacy as complementary, and the vocabulary his books install is now the vocabulary in which the public fights these battles.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'charles-stross',
    'Charles Stross',
    'Charles Stross: Singularity as Legal and Financial Event',
    'Five questions on Accelerando, the Laundry Files, and economic literacy in science fiction.',
    [
      { prompt: 'Accelerando imagines the technological singularity arriving primarily through:', options: ['A research lab breakthrough', 'A military program', 'The legal and financial systems — cognitive substrate outpacing jurisdiction, inheritance, and corporate personhood', 'An alien contact event'], correctAnswerIndex: 2, explanation: 'The novel\'s central insight is that the singularity, if it happens, will arrive through the fiscal and legal infrastructure before it shows up in the lab, and that serious thinking about it has to reckon with tax and inheritance law.', difficulty: 'conceptual' },
      { prompt: 'Stross\'s claim about corporations:', options: ['They are benign', 'A corporation whose cognition is distributed across employees and software stack is already a non-human intelligence operating in the world', 'They are mere abstractions', 'They cannot be regulated'], correctAnswerIndex: 1, explanation: 'The AGI debate, on Stross\'s account, is often a debate about something already present in different form. Taking that seriously changes what regulatory proposals look like.', difficulty: 'applied' },
      { prompt: 'The Laundry Files started as:', options: ['A textbook', 'A Lovecraftian parody of Len Deighton spy novels', 'A graphic novel', 'A film script'], correctAnswerIndex: 1, explanation: 'Over two decades the series has become a serious examination of occult bureaucracies and institutional ethics. The origin as parody is part of the texture and does not limit the ambition.', difficulty: 'recall' },
      { prompt: 'Glasshouse and Halting State share:', options: ['A setting', 'An interest in how specific institutional mechanics (prison simulations, massively multiplayer games with real economies) reshape moral agency', 'The same protagonist', 'Identical plots'], correctAnswerIndex: 1, explanation: 'Stross is consistently interested in how formal structures — legal, fiscal, gaming — create and destroy specific kinds of moral agents. The books work this out through specific institutional designs.', difficulty: 'conceptual' },
      { prompt: 'Stross\'s contribution to the field:', options: ['Writing quickly', 'The most sustained argument that a technology ethics which ignores the financial and legal substrate is answering the wrong question', 'Creating new monsters', 'Popularizing urban fantasy'], correctAnswerIndex: 1, explanation: 'A generation of near-future writers have adopted his economic seriousness. The ones who ignore it tend to produce less useful fiction, and the field has gradually registered the difference.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'nancy-kress',
    'Nancy Kress',
    'Nancy Kress: Enhancement and the Social Contract',
    'Five questions on Beggars in Spain, the Sleepless, and the politics of engineered advantage.',
    [
      { prompt: 'The Sleepless in Beggars in Spain are:', options: ['Aliens', 'Humans engineered not to sleep, with side-effect advantages in longevity and cognition', 'Androids', 'Vampires'], correctAnswerIndex: 1, explanation: 'The biological specifics matter. The engineered change is localized, and the social consequences emerge from how that localized advantage interacts with a society that was not designed for it.', difficulty: 'recall' },
      { prompt: 'The novel\'s central moral puzzle:', options: ['Whether sleep is necessary', 'What obligations flow between a small engineered population with durable advantages and the society that has organized itself around resenting them', 'Whether sleeplessness is real', 'Whether enhancement should be legal'], correctAnswerIndex: 1, explanation: 'The question is two-sided and Kress refuses to flatten it. The Sleepless have real obligations; the society has real obligations; neither obligation is obvious and the book works through them across generations.', difficulty: 'conceptual' },
      { prompt: 'The title "Beggars in Spain" refers to:', options: ['An actual country', 'A thought experiment embedded in the book: does a rich society owe a beggar anything if he is physically capable of working?', 'A song', 'A historical event'], correctAnswerIndex: 1, explanation: 'The thought experiment is the book\'s hinge. The Sleepless child who reads it has to decide whether it applies to them, and the reader watches that decision happen.', difficulty: 'recall' },
      { prompt: 'Kress\'s biological rigor is notable because:', options: ['She is a biologist', 'Most SF writers treat enhancement as magic — Kress treats it as specific modification with specific side effects, and the politics follow from the specifics', 'She consults specialists', 'She uses equations'], correctAnswerIndex: 1, explanation: 'The novels\' political force depends on the biology being specific enough that real interactions follow. Generic "enhanced humans" do not ground the argument the same way.', difficulty: 'applied' },
      { prompt: 'The relevance of Beggars in Spain to contemporary AI-augmentation debates:', options: ['None', 'Substantial — the questions she worked out across three decades about durable engineered advantage are the questions now being asked about AI-augmented labor', 'Purely historical', 'Limited to sleep medicine'], correctAnswerIndex: 1, explanation: 'The shape of the political problem — a minority with durable cognitive advantages, majority resentment, civic obligations flowing in both directions — is the shape of the AI-augmentation debate the present is now running.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'david-brin',
    'David Brin',
    'David Brin: Uplift and the Obligations of Creators',
    'Five questions on the Uplift Universe, The Transparent Society, and open-society debates.',
    [
      { prompt: 'The Uplift Universe imagines a galaxy in which:', options: ['Humans are alone', 'Almost every sapient species was raised to sapience by another — the "client" owes the "patron" a service period', 'All species are natural', 'Aliens are hostile'], correctAnswerIndex: 1, explanation: 'The patron-client structure is the political substrate of the setting and the books\' ethical questions all pass through it. Humanity\'s anomalous status — no known patron — is what makes its uplifting of dolphins and chimps so important to the galactic debate.', difficulty: 'conceptual' },
      { prompt: 'Startide Rising\'s crew includes:', options: ['Only humans', 'Humans, uplifted dolphins, and an uplifted chimpanzee', 'Only aliens', 'Only uplifted species'], correctAnswerIndex: 1, explanation: 'The interspecies crew is the novel\'s point. Brin works through what uplift means for day-to-day shipboard life, and the politics emerge from the specifics.', difficulty: 'recall' },
      { prompt: 'The Transparent Society argues that:', options: ['Privacy is dead', 'The contest between privacy and surveillance has been badly framed — the practical strategy is symmetric transparency rather than opposing all surveillance', 'Surveillance is benign', 'Privacy is the only goal'], correctAnswerIndex: 1, explanation: 'The argument is contested. Brin has pressed it for decades, civil-liberties allies often disagree sharply, and the productive friction has clarified the shape of the privacy debate.', difficulty: 'applied' },
      { prompt: 'Brin\'s technology-ethics focus in the Uplift books:', options: ['On spaceship design', 'On what a creator owes a species they are helping into sapience', 'On warfare', 'On economics'], correctAnswerIndex: 1, explanation: 'The books are sustained thought experiments about creator obligation across a cognitive transition — increasingly relevant as genetic tools advance and animal-cognition research accelerates.', difficulty: 'conceptual' },
      { prompt: 'Brin\'s public posture is:', options: ['Anti-technology', 'Techno-utopian', 'Contrarian within the privacy/surveillance debate, insistent on taking the long view, resistant to easy slogans in either direction', 'Apolitical'], correctAnswerIndex: 2, explanation: 'He has produced some of the most productive provocations in the field precisely by refusing either the pure-surveillance or pure-privacy positions and asking what an open society actually requires.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'olaf-stapledon',
    'Olaf Stapledon',
    'Olaf Stapledon: Deep Time as Ethical Environment',
    'Five questions on Last and First Men, Star Maker, and civilizational-scale ethics.',
    [
      { prompt: 'Last and First Men covers:', options: ['Fifty years', 'Two million years', 'Two billion years across eighteen successor species of humanity', 'The present day'], correctAnswerIndex: 2, explanation: 'The scale is the point. Stapledon wrote a novel with no individual protagonist and let entire species function as characters. That formal choice is the book\'s deepest argument.', difficulty: 'recall' },
      { prompt: 'Star Maker\'s narrator:', options: ['Is a scientist', 'Is an ordinary Englishman projected out of his body across the galaxy, encountering one sapient civilization after another and eventually the Star Maker', 'Is a spaceship captain', 'Is an alien'], correctAnswerIndex: 1, explanation: 'The everyday framing — domestic irritation, a walk up a hill — is deliberate. Stapledon makes the cosmic experience available through the most ordinary possible vantage.', difficulty: 'recall' },
      { prompt: 'Stapledon\'s central ethical question:', options: ['Whether God exists', 'What one species owes to its successors and predecessors across evolutionary timescales', 'Whether aliens exist', 'Whether technology is good'], correctAnswerIndex: 1, explanation: 'The inter-species obligations in his work are not sentimental. They are operationally specific, and the books treat them as the weight-bearing moral problem.', difficulty: 'conceptual' },
      { prompt: 'Stapledon\'s influence on later SF:', options: ['Minimal', 'Enormous — Clarke, Lem, Lessing, and almost every deep-time novelist works inside or against his frame', 'Limited to British authors', 'Only on Lovecraft'], correctAnswerIndex: 1, explanation: 'Stanisław Lem called him the author of the most imaginative cosmology in literature. The form he invented — fiction operating at scales where no individual is the moral unit — is now standard equipment in the genre.', difficulty: 'applied' },
      { prompt: 'Stapledon\'s relevance to contemporary ethics:', options: ['Purely historical', 'Significant — his questions about deep-time obligations are now the questions facing longtermist ethics and large-scale planetary engineering', 'None', 'Limited to fiction'], correctAnswerIndex: 1, explanation: 'The longtermist debate, planetary engineering ethics, and population ethics all work ground that Stapledon mapped first. Reading him is not antiquarian; it is preparation.', difficulty: 'applied' },
    ]
  ),
  buildQuiz(
    'jeff-vandermeer',
    'Jeff VanderMeer',
    'Jeff VanderMeer: Not-Knowing as Ethical Stance',
    'Five questions on the Southern Reach trilogy, Borne, and the eco-weird.',
    [
      { prompt: 'Area X, in the Southern Reach trilogy, is:', options: ['An alien invasion', 'An expanding zone along the Gulf Coast where DNA refracts across species and the laws of biology are replaced with something else', 'A secret military base', 'A hallucination'], correctAnswerIndex: 1, explanation: 'The ontological status of Area X is exactly the question the books refuse to settle. VanderMeer insists that the honest encounter with it is the encounter his state agency keeps failing.', difficulty: 'recall' },
      { prompt: 'The Southern Reach agency\'s failure across decades of expeditions is:', options: ['Bad luck', 'Structural — their epistemology assumes the zone has categories that can be decoded, and the zone does not', 'A secret cover-up', 'Poor staffing'], correctAnswerIndex: 1, explanation: 'The books\' ethical argument is that the institutional failure is not incidental. The frame the agency brought was never going to work, and the deeper failure is the refusal to admit the frame was wrong.', difficulty: 'conceptual' },
      { prompt: 'Borne\'s protagonist adopts Borne (a shape that looks like a sea anemone) and discovers:', options: ['Borne is dangerous and she destroys him', 'Borne\'s cognition and moral status exceed her categories, and his hunger is not in any frame she was taught to use', 'Borne is harmless', 'Borne is a machine'], correctAnswerIndex: 1, explanation: 'The book is a sustained meditation on what it means to raise a being whose inner life is legible enough to care about and unlike enough to refuse assimilation. VanderMeer refuses the easy resolutions.', difficulty: 'applied' },
      { prompt: 'VanderMeer\'s argument about environmental ethics:', options: ['Preserve everything', 'Environmental ethics cannot be worked out inside the epistemologies that produced the current crisis', 'Technology fixes ecosystems', 'Nature is pure'], correctAnswerIndex: 1, explanation: 'His fiction does not deliver lessons. It produces encounters that resist the frames his human characters bring, and insists that not-knowing is itself a discipline the crisis demands.', difficulty: 'conceptual' },
      { prompt: 'VanderMeer\'s influence on contemporary eco-fiction:', options: ['Negligible', 'Central — he has shaped the New Weird / eco-horror movement as writer, editor, and anthologist', 'Limited to the Southern Reach adaptation', 'Academic only'], correctAnswerIndex: 1, explanation: 'Through his own work and through the anthologies he co-edits with Ann VanderMeer, he has helped establish the canon that the current generation of eco-weird writers works inside.', difficulty: 'applied' },
    ]
  ),
];

export function getStaticScifiAuthorQuiz(authorId: string): Quiz | null {
  return scifiAuthorQuizzes.find((q) => q.subjectId === authorId) || null;
}
