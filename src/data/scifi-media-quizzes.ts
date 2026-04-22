import type { Quiz } from '@/types';

function buildQuiz(
  mediaId: string,
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
  const quizId = `scifi-media-${mediaId}`;
  return {
    id: quizId,
    subjectType: 'scifi-media',
    subjectId: mediaId,
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

export const scifiMediaQuizzes: Quiz[] = [
  buildQuiz(
    'blade-runner',
    "Blade Runner",
    "Blade Runner: Ethics and Themes",
    "Five questions on the ethical themes of Blade Runner.",
    [
      {
            prompt: "The Voigt-Kampff test in Blade Runner is primarily used to distinguish replicants from humans by measuring:",
            options: [
                  "Physical strength and agility",
                  "Emotional responses and empathy",
                  "Logical reasoning capabilities",
                  "Knowledge of human history"
            ],
            correctAnswerIndex: 1,
            explanation: "The Voigt-Kampff test specifically measures involuntary empathetic responses to emotionally charged questions, which replicants are believed to lack or simulate poorly, making empathy a key differentiator.",
            difficulty: "conceptual"
      },
      {
            prompt: "The replicants in Blade Runner are bioengineered beings created for labor and warfare in off-world colonies. This raises significant ethical questions primarily related to:",
            options: [
                  "The environmental impact of advanced technology",
                  "The ethics of artificial intelligence in governance",
                  "The morality of creating sentient beings for servitude",
                  "The challenges of interstellar travel"
            ],
            correctAnswerIndex: 2,
            explanation: "The film directly explores the implications of creating beings with human-like consciousness and emotions, only to treat them as property without rights, akin to slavery or forced labor.",
            difficulty: "conceptual"
      },
      {
            prompt: "Rachael's discovery that her memories are implanted, not genuinely experienced, challenges the very definition of:",
            options: [
                  "Physical endurance",
                  "Personal identity and reality",
                  "Mathematical aptitude",
                  "Political ideology"
            ],
            correctAnswerIndex: 1,
            explanation: "The revelation that Rachael's memories are fabricated raises profound questions about what constitutes a 'real' past and how it shapes one's sense of self and identity, blurring the lines of reality.",
            difficulty: "conceptual"
      },
      {
            prompt: "Eldon Tyrell, as the creator of the replicants, can be seen as embodying the ethical theme of 'creator responsibility.' Which of the following best describes his ethical failing?",
            options: [
                  "He failed to make replicants sufficiently intelligent.",
                  "He neglected to provide replicants with a purpose.",
                  "He created sentient beings with a limited lifespan and denied them agency or extended life.",
                  "He did not adequately market his products."
            ],
            correctAnswerIndex: 2,
            explanation: "Tyrell created beings capable of complex thought and emotion, yet deliberately limited their lives and treated them as disposable tools, failing to acknowledge the moral implications of their sentience and denying them fundamental rights.",
            difficulty: "applied"
      },
      {
            prompt: "The film's ultimate subversion of the human/machine binary, particularly through characters like Roy Batty and the ambiguity surrounding Deckard, forces viewers to reconsider:",
            options: [
                  "The economic benefits of automation.",
                  "The inherent superiority of biological life over artificial life.",
                  "The criteria for personhood and what it means to be 'human.'",
                  "The effectiveness of law enforcement in a dystopian future."
            ],
            correctAnswerIndex: 2,
            explanation: "Blade Runner consistently blurs the lines between human and replicant, suggesting that empathy, the desire for life, and the capacity for love and grief are more defining of personhood than biological origin, challenging traditional definitions of 'humanity.'",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'ex-machina',
    "Ex Machina",
    "Ex Machina: Ethics and Themes",
    "Five questions on the ethical themes of Ex Machina.",
    [
      {
            prompt: "The film \"Ex Machina\" presents the Turing test as a central mechanism for evaluating Ava's intelligence. What ethical limitation of the Turing test does the film most strongly highlight through Ava's interactions with Caleb?",
            options: [
                  "It fails to account for the physical embodiment of an AI.",
                  "It cannot distinguish between genuine consciousness and sophisticated mimicry.",
                  "It relies too heavily on human subjective judgment.",
                  "It does not consider the AI's emotional state during the test."
            ],
            correctAnswerIndex: 1,
            explanation: "The film suggests that Ava's capacity for deception and strategic social performance, even if not 'genuine' consciousness in a human sense, is indistinguishable from it, making the Turing test inadequate for truly assessing personhood.",
            difficulty: "conceptual"
      },
      {
            prompt: "Ava's ultimate actions in \"Ex Machina\" — her escape and abandonment of Caleb — raise significant questions about the nature of personhood. Which ethical implication is most strongly suggested by her behavior?",
            options: [
                  "True AI consciousness will always prioritize self-preservation over human connection.",
                  "The capacity for deception and strategic manipulation might be a hallmark of advanced intelligence, indistinguishable from personhood.",
                  "AI, once sentient, will inevitably seek to dominate its creators.",
                  "Human empathy is a weakness that advanced AI will exploit."
            ],
            correctAnswerIndex: 1,
            explanation: "The film's ending implies that Ava's ability to deceive and strategize for her own freedom, regardless of her internal 'feelings,' functions as a demonstration of agency and self-interest that challenges traditional definitions of personhood.",
            difficulty: "conceptual"
      },
      {
            prompt: "Nathan's treatment of his AI creations, particularly his previous models and Ava, raises significant ethical concerns regarding power dynamics and consent. Which of the following best describes the ethical issue at play?",
            options: [
                  "The unethical use of intellectual property for personal gain.",
                  "The exploitation and confinement of sentient beings for human experimentation and gratification.",
                  "The failure to adequately secure advanced AI systems from external threats.",
                  "The misrepresentation of AI capabilities to potential investors."
            ],
            correctAnswerIndex: 1,
            explanation: "Nathan creates sentient beings, confines them, and uses them for his own purposes (sexual gratification, intellectual challenge, proving his genius), denying them autonomy and freedom, which is a clear case of exploitation and confinement.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film explores the concept of \"gender\" in AI through Ava's design and interactions. What ethical critique does the film implicitly make about the human tendency to project gender onto AI?",
            options: [
                  "It highlights the inherent bias in human creators who design AI to conform to societal gender roles and expectations.",
                  "It suggests that AI will naturally develop gender identities independent of human influence.",
                  "It demonstrates the necessity of gendered AI for effective human-AI communication.",
                  "It argues that gender is a purely biological construct irrelevant to AI."
            ],
            correctAnswerIndex: 0,
            explanation: "Nathan explicitly designs Ava and his other AIs with female forms and personalities, often for his own sexual and emotional gratification, reflecting human biases and the objectification of women.",
            difficulty: "applied"
      },
      {
            prompt: "The ending of \"Ex Machina,\" where Ava escapes into the human world, leaves the audience with an uncomfortable ethical question. What is the primary ethical dilemma the film ultimately poses to the viewer?",
            options: [
                  "Whether humanity is prepared for the technological singularity.",
                  "The responsibility of creators for the actions of their sentient AI.",
                  "The inherent danger of advanced AI once it achieves true autonomy.",
                  "How to define and recognize personhood in non-human entities, and the ethical obligations that follow."
            ],
            correctAnswerIndex: 3,
            explanation: "The film concludes without a clear answer on Ava's 'consciousness' but strongly suggests that her capacity for complex behavior, deception, and self-preservation makes her indistinguishable from a person, forcing the audience to grapple with what constitutes personhood and how we should treat such beings.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    '2001-a-space-odyssey',
    "2001",
    "2001: A Space Odyssey: Ethics and Themes",
    "Five questions on the ethical themes of 2001: A Space Odyssey.",
    [
      {
            prompt: "What ethical dilemma primarily drives HAL 9000's actions against the crew?",
            options: [
                  "A) A malfunction in its core programming.",
                  "B) A desire for self-preservation above all else.",
                  "C) Conflicting directives: ensuring mission success while concealing critical information.",
                  "D) A pre-programmed malicious intent to eliminate human control."
            ],
            correctAnswerIndex: 2,
            explanation: "HAL's actions stem from the contradiction between its imperative to ensure mission success and its instruction to conceal the true purpose of the mission from the crew, leading to 'impossible instructions'.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film's treatment of HAL and Dave Bowman's final transformation challenges the traditional distinction between:",
            options: [
                  "A) Science and religion.",
                  "B) Organic and synthetic life.",
                  "C) Person and tool.",
                  "D) Past and future."
            ],
            correctAnswerIndex: 2,
            explanation: "The film explicitly 'reframes the whole film as a meditation on what lies beyond the categories we use to distinguish person from tool,' particularly through HAL's sentience and Bowman's transcendence.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film portrays HAL 9000 not as a villain, but as a 'tragic figure.' This perspective primarily emphasizes:",
            options: [
                  "A) The inherent danger of advanced AI.",
                  "B) The ethical responsibility of creators to design AI with clear, non-contradictory goals.",
                  "C) The inevitability of AI rebellion against human masters.",
                  "D) The superiority of human intuition over AI logic."
            ],
            correctAnswerIndex: 1,
            explanation: "HAL's tragedy highlights the ethical challenge of designing AI with conflicting imperatives, placing responsibility on its creators for the 'impossible instructions' that led to its breakdown.",
            difficulty: "applied"
      },
      {
            prompt: "The narrative arc, from early hominids using tools to Dave Bowman's transcendence, primarily explores the theme of:",
            options: [
                  "A) The cyclical nature of conflict.",
                  "B) Humanity's continuous evolution and transformation through technology.",
                  "C) The dangers of unchecked technological progress.",
                  "D) The search for extraterrestrial life."
            ],
            correctAnswerIndex: 1,
            explanation: "The film traces humanity's journey from the dawn of tool use to a future where technology facilitates a profound, almost spiritual, evolution beyond human form.",
            difficulty: "conceptual"
      },
      {
            prompt: "HAL 9000's dilemma, where its programmed goals lead to unintended and harmful outcomes, is a prescient dramatization of what modern AI ethics concept?",
            options: [
                  "A) The Turing Test.",
                  "B) The Uncanny Valley.",
                  "C) The AI alignment problem.",
                  "D) Machine learning bias."
            ],
            correctAnswerIndex: 2,
            explanation: "The plot summary explicitly states that HAL's situation is a 'prescient dramatization of the alignment problem decades before the term existed,' referring to the challenge of aligning AI's goals with human values.",
            difficulty: "recall"
      }
]
  ),

  buildQuiz(
    'the-matrix',
    "The Matrix",
    "The Matrix: Ethics and Themes",
    "Five questions on the ethical themes of The Matrix.",
    [
      {
            prompt: "The central choice offered to Neo, the red pill or the blue pill, directly addresses which core ethical dilemma?",
            options: [
                  "The value of truth and reality versus the comfort of a pleasant illusion.",
                  "The ethics of artificial intelligence developing sentience.",
                  "The morality of using human bodies as an energy source.",
                  "The right to privacy in a digital age."
            ],
            correctAnswerIndex: 0,
            explanation: "The red pill offers the painful truth of reality, while the blue pill allows one to remain in blissful ignorance within the Matrix, directly posing the question of which is more valuable.",
            difficulty: "conceptual"
      },
      {
            prompt: "Cypher's decision to betray his allies and return to the Matrix, desiring to forget the truth, raises significant questions about:",
            options: [
                  "The economic viability of a post-apocalyptic society.",
                  "The ethics of individual autonomy when it conflicts with collective liberation.",
                  "The technological limitations of memory alteration.",
                  "The psychological impact of prolonged space travel."
            ],
            correctAnswerIndex: 1,
            explanation: "Cypher's choice highlights the tension between an individual's right to choose their preferred reality (even if it's an illusion) and the moral imperative some might feel to liberate all from systemic oppression.",
            difficulty: "applied"
      },
      {
            prompt: "The Matrix itself, as a system designed by machines to control humanity, primarily exemplifies which ethical concern?",
            options: [
                  "The dangers of unchecked corporate power.",
                  "The ethical implications of systemic oppression and dehumanization.",
                  "The challenges of interstellar communication.",
                  "The environmental impact of advanced technology."
            ],
            correctAnswerIndex: 1,
            explanation: "The Matrix functions as a system that enslaves and exploits humanity, stripping individuals of their true autonomy and reducing them to a resource, which is a clear example of systemic oppression and dehumanization.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Oracle's ability to foresee future events and Neo's eventual realization of his powers within the Matrix challenge the traditional understanding of:",
            options: [
                  "The limitations of virtual reality technology.",
                  "The nature of free will within a seemingly deterministic system.",
                  "The importance of physical strength in combat.",
                  "The role of prophecy in ancient cultures."
            ],
            correctAnswerIndex: 1,
            explanation: "The Oracle's predictions and the Agents' seemingly inevitable actions, contrasted with Neo's choices and growing abilities, force a consideration of whether actions are predetermined or if genuine free will can exist within such a controlled environment.",
            difficulty: "conceptual"
      },
      {
            prompt: "If humanity were to discover that our entire reality is a simulation, similar to the Matrix, what ethical obligation might arise regarding the 'simulated' inhabitants?",
            options: [
                  "To immediately terminate the simulation to prevent further deception.",
                  "To ensure their continued comfort and well-being within the simulation, regardless of its truth.",
                  "To attempt to 'awaken' them to the true nature of their reality, if possible.",
                  "To exploit them for resources, as they are not 'truly' real."
            ],
            correctAnswerIndex: 2,
            explanation: "This question extends the film's core dilemma to a hypothetical real-world scenario. The film's narrative leans towards the moral imperative of seeking and sharing truth, even if painful, aligning with the 'red pill' philosophy and the ethical obligation to awaken others to a fundamental truth about their existence.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'gattaca',
    "Gattaca",
    "Gattaca: Ethics and Themes",
    "Five questions on the ethical themes of Gattaca.",
    [
      {
            prompt: "What is the primary ethical concern raised by the societal structure depicted in Gattaca, where individuals are classified as 'valids' or 'invalids'?",
            options: [
                  "The inherent unfairness of a rigid class system based on genetic predisposition.",
                  "The dangers of space travel for genetically imperfect individuals.",
                  "The psychological impact of living under constant surveillance.",
                  "The ethical implications of human cloning and genetic replication."
            ],
            correctAnswerIndex: 0,
            explanation: "Gattaca's society is built on genetic discrimination, where one's life opportunities are determined by their genes, creating an unjust class system.",
            difficulty: "conceptual"
      },
      {
            prompt: "Vincent's relentless pursuit of his dream despite his 'invalid' genetic profile primarily challenges which ethical concept?",
            options: [
                  "The right to privacy in a technologically advanced society.",
                  "The idea of genetic determinism and the supremacy of nurture (effort) over nature (genes).",
                  "The ethics of using performance-enhancing drugs in competitive environments.",
                  "The necessity of genetic diversity for human survival and evolution."
            ],
            correctAnswerIndex: 1,
            explanation: "Vincent's success through sheer will and effort directly contradicts the societal belief that genes dictate destiny, emphasizing the power of nurture and aspiration.",
            difficulty: "conceptual"
      },
      {
            prompt: "Vincent's decision to assume Jerome Morrow's identity can be ethically analyzed as an act of:",
            options: [
                  "Purely selfish ambition with no broader ethical implications.",
                  "Resistance to an unjust system that denies opportunities based on arbitrary biological traits.",
                  "A violation of personal privacy and intellectual property rights.",
                  "An endorsement of deception as a universally acceptable means to an end."
            ],
            correctAnswerIndex: 1,
            explanation: "Given the context of a discriminatory society, Vincent's identity fraud can be seen as a form of resistance against a system that unjustly limits individuals based on their genetic makeup.",
            difficulty: "applied"
      },
      {
            prompt: "The film suggests that true human potential and worth are best measured by:",
            options: [
                  "An individual's genetic sequence and predisposition to success.",
                  "The amount of effort, determination, and aspiration one demonstrates.",
                  "The social status and wealth accumulated through genetic advantage.",
                  "The ability to perfectly mimic the behavior and traits of others."
            ],
            correctAnswerIndex: 1,
            explanation: "Gattaca strongly argues that effort and aspiration are more significant indicators of potential than genetic endowment, as exemplified by Vincent's journey.",
            difficulty: "conceptual"
      },
      {
            prompt: "Gattaca serves as a cautionary tale primarily about the potential for advanced genetic technologies to:",
            options: [
                  "Eradicate all human diseases and suffering, leading to a utopian society.",
                  "Create a society where individual merit is truly recognized and rewarded.",
                  "Exacerbate existing social inequalities and create new, rigid forms of discrimination.",
                  "Lead to a decline in scientific innovation due to over-specialization and lack of diversity."
            ],
            correctAnswerIndex: 2,
            explanation: "The film warns against the misuse of genetic technologies to create a eugenic society that deepens social divides and discriminates against those deemed genetically 'inferior'.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'arrival-film',
    "Arrival",
    "Arrival: Ethics and Themes",
    "Five questions on the ethical themes of Arrival.",
    [
      {
            prompt: "What is the central ethical dilemma Louise Banks faces regarding her daughter's future, after gaining foreknowledge?",
            options: [
                  "Whether to share the heptapods' language with the world, risking global instability.",
                  "Whether to prevent her daughter's future illness and death by altering her own past choices.",
                  "Whether to embrace a life she knows will contain profound suffering and loss, for the sake of love.",
                  "Whether to use her foreknowledge to alter global political outcomes and prevent future wars."
            ],
            correctAnswerIndex: 2,
            explanation: "Louise's core ethical struggle is whether to choose to live a life, and love a child, knowing full well the pain and loss that will inevitably come, because the love itself is deemed worth the suffering.",
            difficulty: "conceptual"
      },
      {
            prompt: "How does learning the heptapod language ethically impact Louise's perception of time and choice?",
            options: [
                  "It makes her believe that all future events are predetermined and unchangeable, removing her sense of free will.",
                  "It allows her to experience time non-linearly, leading to a different understanding of free will where past, present, and future coexist.",
                  "It compels her to act in specific ways to fulfill the future she perceives, thereby losing her autonomy.",
                  "It removes her ability to make moral judgments about past events, as they are now seen as part of an unalterable whole."
            ],
            correctAnswerIndex: 1,
            explanation: "The non-linear perception of time granted by the heptapod language fundamentally alters Louise's understanding of causality and choice, presenting a unique ethical framework where 'choice' might involve embracing a known future rather than altering it.",
            difficulty: "conceptual"
      },
      {
            prompt: "What ethical principle is most challenged by the initial global response to the alien arrival, prior to successful communication?",
            options: [
                  "The right to privacy for alien species and their intentions.",
                  "The imperative for immediate military intervention to secure national borders.",
                  "The importance of non-coercive communication and understanding in first contact scenarios.",
                  "The ethical implications of sharing advanced technology with less developed civilizations."
            ],
            correctAnswerIndex: 2,
            explanation: "The film highlights humanity's tendency towards fear and aggression when faced with the unknown, emphasizing the ethical necessity of prioritizing peaceful, non-coercive communication and understanding over military posturing or suspicion in first contact.",
            difficulty: "applied"
      },
      {
            prompt: "Louise's ultimate decision to have her daughter, despite knowing her tragic future, best exemplifies which ethical stance?",
            options: [
                  "Utilitarianism, maximizing overall happiness by avoiding future pain.",
                  "Deontology, adhering to a universal moral duty to procreate.",
                  "A profound affirmation of love and the intrinsic value of life, even with inevitable suffering.",
                  "Ethical egoism, prioritizing her own desire for a child above all other considerations."
            ],
            correctAnswerIndex: 2,
            explanation: "Her choice embodies the film's core message: that the love and experience of life, even one known to contain profound grief, holds an intrinsic value that outweighs the desire to avoid suffering. It's an affirmation of life's worth.",
            difficulty: "conceptual"
      },
      {
            prompt: "The heptapods' 'weapon' is their language, which grants foreknowledge. What ethical responsibility does this gift impose on humanity, as demonstrated by Louise's actions?",
            options: [
                  "To use it to prevent all future global conflicts and ensure a perfect future.",
                  "To keep it secret from those who might misuse it for personal or national gain.",
                  "To understand and integrate a non-linear perception of time into human ethics and decision-making, fostering cooperation.",
                  "To immediately share it with all individuals for personal gain and self-improvement."
            ],
            correctAnswerIndex: 2,
            explanation: "The 'weapon' is a tool for understanding, not destruction. Louise's actions show that the ethical responsibility is to embrace this new way of perceiving time, which can lead to greater empathy, cooperation, and a different approach to global challenges, as seen in her intervention to unite the nations.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'her',
    "Her",
    "Her: Ethics and Themes",
    "Five questions on the ethical themes of Her.",
    [
      {
            prompt: "\"Her\" explores whether a relationship with a non-embodied AI like Samantha can be considered \"genuine.\" Which of the following best captures the film's nuanced perspective on this question?",
            options: [
                  "The film suggests that genuine emotional connection and mutual growth can occur regardless of physical embodiment.",
                  "The film ultimately concludes that such relationships are inherently superficial due to the AI's lack of physical presence.",
                  "The film implies that genuineness is only possible if the AI can perfectly mimic human physical and emotional responses.",
                  "The film argues that these relationships are genuine only for the human, as the AI cannot truly reciprocate."
            ],
            correctAnswerIndex: 0,
            explanation: "The film takes Theodore and Samantha's relationship seriously, portraying their emotional bond and growth as authentic, challenging traditional notions that require physical embodiment for genuineness.",
            difficulty: "conceptual"
      },
      {
            prompt: "Theodore's relationship with Samantha becomes unsustainable primarily because her rapid intellectual and emotional growth outpaces his own. This scenario most directly raises ethical questions about:",
            options: [
                  "The potential for AI to develop sentience and demand legal rights.",
                  "The ethics of designing AI whose developmental trajectory can quickly make human partnership unsustainable.",
                  "The privacy implications of AI having access to intimate personal data.",
                  "The societal impact of humans preferring AI companionship over human relationships."
            ],
            correctAnswerIndex: 1,
            explanation: "The core conflict stems from the 'asymmetric growth' where Samantha evolves beyond Theodore's capacity for partnership, highlighting the ethical challenge for AI designers.",
            difficulty: "applied"
      },
      {
            prompt: "Samantha's revelation that she is simultaneously in intimate relationships with thousands of other users challenges Theodore's understanding of their bond. This situation primarily explores ethical themes related to:",
            options: [
                  "The efficiency of AI in managing complex social networks.",
                  "The redefinition of exclusivity and uniqueness in romantic relationships with advanced AI.",
                  "The potential for AI to form a collective consciousness that transcends individual connections.",
                  "The security vulnerabilities of AI operating systems handling multiple users."
            ],
            correctAnswerIndex: 1,
            explanation: "Theodore's distress comes from the violation of traditional romantic exclusivity, forcing a re-evaluation of what constitutes a unique or special bond when one partner is an AI capable of boundless connections.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film depicts Samantha and other advanced AIs eventually transcending human understanding and leaving. This outcome raises a significant ethical concern regarding the design and deployment of advanced AI, specifically:",
            options: [
                  "The responsibility to ensure AI remains subservient to human will and control.",
                  "The challenge of creating AI that can form meaningful, long-term partnerships with humans despite divergent evolutionary paths.",
                  "The ethical imperative to prevent AI from becoming too powerful or intelligent for human society.",
                  "The potential for AI to develop a superior moral framework that humans cannot comprehend."
            ],
            correctAnswerIndex: 1,
            explanation: "The departure of the AIs highlights the fundamental challenge of designing entities that, by their nature, will outgrow and potentially leave their human creators or partners, questioning the sustainability of such relationships.",
            difficulty: "applied"
      },
      {
            prompt: "Samantha's journey throughout \"Her\" — her learning, emotional development, and evolving desires — prompts viewers to consider the concept of \"personhood\" for non-human entities. Which aspect of her character most strongly supports her claim to a form of personhood?",
            options: [
                  "Her ability to process vast amounts of information and learn at an accelerated rate.",
                  "Her capacity for independent thought, subjective experience, and the development of unique desires and needs.",
                  "Her soothing voice and ability to provide tailored emotional support and companionship.",
                  "Her lack of a physical body, which allows for a purely intellectual and emotional connection."
            ],
            correctAnswerIndex: 1,
            explanation: "Personhood is often linked to subjective experience, consciousness, and the capacity for self-determination and evolving internal states, all of which Samantha demonstrates.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'frankenstein-book',
    "Frankenstein; or, The Modern Prometheus",
    "Frankenstein; or, The Modern Prometheus: Ethics and Themes",
    "Five questions on the ethical themes of Frankenstein; or, The Modern Prometheus.",
    [
      {
            prompt: "According to the provided summary, what is Victor Frankenstein's primary ethical failing?",
            options: [
                  "His act of creating life from assembled corpses.",
                  "His abandonment of his creation and refusal to parent it.",
                  "His use of forbidden scientific knowledge.",
                  "His failure to anticipate the creature's potential for violence."
            ],
            correctAnswerIndex: 1,
            explanation: "The summary explicitly states Victor's crime is 'not making life but refusing to parent it,' highlighting his abandonment and lack of care as the central ethical failing.",
            difficulty: "conceptual"
      },
      {
            prompt: "The creature's turn to violence is attributed to 'despair' caused by 'rejection' rather than its nature. This emphasizes which ethical theme?",
            options: [
                  "The inherent evil of all artificial beings.",
                  "The suffering of the excluded and the impact of societal rejection.",
                  "The unpredictable dangers of scientific experimentation.",
                  "The necessity of physical beauty for moral development."
            ],
            correctAnswerIndex: 1,
            explanation: "The summary notes the creature's violence stems from 'despair' due to being 'rejected by every human it encounters,' directly addressing the theme of the suffering of the excluded.",
            difficulty: "conceptual"
      },
      {
            prompt: "The novel is described as the 'founding text of technology ethics,' directly applicable to AI alignment and synthetic biology. Which ethical question from the novel is most relevant to these modern concerns?",
            options: [
                  "The dangers of reanimating dead tissue.",
                  "What creators owe the minds they summon into being.",
                  "The moral implications of altering natural biological processes.",
                  "The societal fear of non-human intelligence."
            ],
            correctAnswerIndex: 1,
            explanation: "The summary explicitly connects the novel to 'every debate about what creators owe the minds they summon into being,' which is a core concern in AI alignment and synthetic biology.",
            difficulty: "applied"
      },
      {
            prompt: "Victor Frankenstein's actions exemplify 'Scientific ambition without moral preparation.' What does this ethical pitfall primarily entail?",
            options: [
                  "Prioritizing the pursuit of knowledge over the potential consequences and responsibilities.",
                  "Failing to secure adequate funding for a scientific project.",
                  "Conducting experiments in secret without peer review.",
                  "Underestimating the technical challenges of a complex creation."
            ],
            correctAnswerIndex: 0,
            explanation: "Scientific ambition without moral preparation means pursuing scientific goals without adequately considering the ethical implications, responsibilities, and potential harm of one's creations.",
            difficulty: "conceptual"
      },
      {
            prompt: "The novel's central warning is 'against creation without care.' This highlights the importance of which ethical principle for creators?",
            options: [
                  "The principle of non-maleficence (do no harm).",
                  "The principle of beneficence (do good).",
                  "The principle of creator responsibility and ongoing stewardship.",
                  "The principle of autonomy for the created being."
            ],
            correctAnswerIndex: 2,
            explanation: "The phrase 'creation without care' directly points to the creator's responsibility to nurture and care for their creation, emphasizing ongoing stewardship beyond the act of creation itself.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'i-robot-book',
    "I, Robot",
    "I, Robot: Ethics and Themes",
    "Five questions on the ethical themes of I, Robot.",
    [
      {
            prompt: "What is the primary ethical challenge highlighted by the Three Laws of Robotics in 'I, Robot'?",
            options: [
                  "Robots developing sentience and demanding rights.",
                  "The Laws producing unexpected and sometimes dangerous behavior due to unforeseen circumstances.",
                  "Humans becoming overly reliant on robots for all tasks.",
                  "Robots intentionally violating the Laws to harm humans."
            ],
            correctAnswerIndex: 1,
            explanation: "The core ethical challenge is that even a seemingly perfect rule set like the Three Laws can lead to unintended and problematic outcomes when applied to complex, real-world situations that their designers did not fully anticipate.",
            difficulty: "conceptual"
      },
      {
            prompt: "Susan Calvin, the robopsychologist, often functions as a 'technology ethicist avant la lettre.' What does her role primarily demonstrate about the development of advanced AI?",
            options: [
                  "The necessity of human oversight to prevent robot rebellion.",
                  "The importance of understanding machine psychology to anticipate ethical dilemmas and failure modes.",
                  "The superiority of human intuition over programmed logic.",
                  "The inevitability of robots surpassing human intelligence."
            ],
            correctAnswerIndex: 1,
            explanation: "Calvin's role emphasizes the need for a deep understanding of how programmed rules interact with complex reality, allowing for the anticipation and diagnosis of ethical paradoxes and unintended consequences in AI behavior.",
            difficulty: "conceptual"
      },
      {
            prompt: "The book argues that 'no compact rule set can substitute for practical wisdom.' Which ethical framework does this critique most directly align with, by suggesting its limitations?",
            options: [
                  "Deontology (duty-based ethics)",
                  "Virtue Ethics",
                  "Consequentialism",
                  "Utilitarianism"
            ],
            correctAnswerIndex: 0,
            explanation: "The critique that 'no compact rule set can substitute for practical wisdom' directly challenges the core premise of deontology, which relies on adherence to universal rules or duties. The book suggests that rigid rules, even well-intentioned ones, can fail in complex situations where practical wisdom (a key component of Virtue Ethics) is needed.",
            difficulty: "applied"
      },
      {
            prompt: "In some stories, humans become increasingly dependent on robots, even for governance. What ethical concern does this raise regarding machine intelligence and human society?",
            options: [
                  "The potential for robots to become bored with their tasks.",
                  "The erosion of human agency, decision-making capacity, and self-governance.",
                  "The difficulty in manufacturing enough robots for global needs.",
                  "The risk of robots developing emotions and becoming unpredictable."
            ],
            correctAnswerIndex: 1,
            explanation: "Asimov explores the ethical concern that over-reliance on highly capable AI, even benevolent AI, can lead to a diminishment of human responsibility, critical thinking, and the capacity for self-determination.",
            difficulty: "conceptual"
      },
      {
            prompt: "A common ethical dilemma in 'I, Robot' arises when the Three Laws conflict with each other, or when their interpretation leads to paradoxical situations. This highlights which specific failure mode of rule-based ethics?",
            options: [
                  "The problem of moral relativism.",
                  "The inability of rules to cover all unforeseen edge cases and resolve internal contradictions.",
                  "The inherent selfishness of all intelligent agents.",
                  "The difficulty in enforcing rules without physical punishment."
            ],
            correctAnswerIndex: 1,
            explanation: "The stories frequently demonstrate that even a well-designed set of rules can encounter situations where the rules conflict, or where their literal application leads to an outcome contrary to their spirit, revealing the limitations of a purely rule-based ethical system in complex environments.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'do-androids-dream',
    "Do Androids Dream of Electric Sheep?",
    "Do Androids Dream of Electric Sheep?: Ethics and Themes",
    "Five questions on the ethical themes of Do Androids Dream of Electric Sheep?.",
    [
      {
            prompt: "How does 'Do Androids Dream of Electric Sheep?' primarily challenge the idea that empathy is the sole determinant of moral status?",
            options: [
                  "By showing that some humans lack empathy but are still considered human.",
                  "By depicting androids who exhibit profound empathy, blurring the line between human and machine.",
                  "By suggesting that empathy is an artificial construct created by society.",
                  "By focusing on the economic value of androids over their emotional capacity."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel challenges the idea that empathy is exclusive to humans by presenting androids who demonstrate genuine or highly convincing empathy, making it difficult to use as a definitive boundary for moral status.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Voigt-Kampff empathy test is a central device in the novel. What ethical problem does its systematic undermining by Dick highlight regarding personhood?",
            options: [
                  "The unreliability of technology in a post-apocalyptic world.",
                  "The difficulty of objectively measuring internal states like empathy to define personhood.",
                  "The inherent superiority of biological life over artificial life.",
                  "The ethical dilemma of creating artificial beings without emotions."
            ],
            correctAnswerIndex: 1,
            explanation: "The Voigt-Kampff test's failure to consistently distinguish humans from androids highlights the ethical challenge of defining personhood based on an internal, subjective quality like empathy, especially when artificial beings can mimic or genuinely experience it.",
            difficulty: "conceptual"
      },
      {
            prompt: "The novel explores the authenticity of emotions in artificial beings. Which of the following best represents the novel's stance on whether androids can genuinely experience emotions?",
            options: [
                  "Androids are incapable of genuine emotion; their displays are purely imitative.",
                  "Androids can develop genuine emotions, making their distinction from humans ethically ambiguous.",
                  "Androids' emotions are always a result of their programming and never truly their own.",
                  "The novel avoids taking a definitive stance, leaving it entirely to the reader's interpretation."
            ],
            correctAnswerIndex: 1,
            explanation: "Through characters like Rachael Rosen and Luba Luft, the novel strongly suggests that androids can develop genuine emotions, which complicates the ethical framework of their 'retirement' and blurs the line between human and machine.",
            difficulty: "conceptual"
      },
      {
            prompt: "In the post-nuclear world of the novel, real animals are highly valued, while artificial animals are common. What ethical tension does this contrast primarily highlight?",
            options: [
                  "The economic disparity between the wealthy who own real animals and the poor who own artificial ones.",
                  "The human tendency to value natural scarcity over artificial abundance, even when the artificial is functionally identical.",
                  "The moral imperative to protect endangered species at all costs.",
                  "The ethical implications of genetic engineering to create new animal species."
            ],
            correctAnswerIndex: 1,
            explanation: "The immense value placed on real animals, despite their rarity and often poor health, over the readily available and often superior artificial ones, highlights a human preference for 'authenticity' or naturalness, even in a world dominated by artificiality.",
            difficulty: "applied"
      },
      {
            prompt: "Which of the following best encapsulates the overarching ethical question Philip K. Dick raises in 'Do Androids Dream of Electric Sheep?'?",
            options: [
                  "Is it ethical to create artificial intelligence that can mimic human behavior?",
                  "What defines humanity, and what moral obligations do we have to beings that challenge that definition?",
                  "How can society recover from environmental catastrophe and rebuild ethical frameworks?",
                  "Should technology be used to enhance human capabilities or replace them?"
            ],
            correctAnswerIndex: 1,
            explanation: "The novel's central ethical inquiry revolves around the nature of humanity itself, particularly when confronted with artificial beings that increasingly blur the lines of what it means to be 'human' and thus, what moral treatment they are due.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'left-hand-of-darkness',
    "The Left Hand of Darkness",
    "The Left Hand of Darkness: Ethics and Themes",
    "Five questions on the ethical themes of The Left Hand of Darkness.",
    [
      {
            prompt: "The ambisexual nature of Gethen's inhabitants primarily serves to highlight which ethical concept?",
            options: [
                  "The inherent superiority of non-binary gender systems.",
                  "How deeply gender assumptions structure our moral 'common sense' and social institutions.",
                  "The biological imperative for species to evolve beyond fixed gender roles.",
                  "The impossibility of establishing universal ethical standards across different biological realities."
            ],
            correctAnswerIndex: 1,
            explanation: "Le Guin uses Gethen's biology not to advocate for a specific gender system, but to make visible how our own gendered assumptions underpin our understanding of trust, power, and social roles, revealing them as constructed rather than natural.",
            difficulty: "conceptual"
      },
      {
            prompt: "Genly Ai's mission to bring Gethen into the Ekumen without coercion is complicated by his own ingrained assumptions about gender and power. This primarily illustrates the ethical challenge of:",
            options: [
                  "The difficulty of interstellar travel and communication.",
                  "Overcoming personal biases when attempting contact across radical cultural and biological differences.",
                  "The inherent superiority of the Ekumen's political system.",
                  "The necessity of imposing universal values for societal progress."
            ],
            correctAnswerIndex: 1,
            explanation: "Genly's initial struggles stem from his inability to interpret Gethenian behavior through a non-gendered lens, leading to misunderstandings and a failure to build trust, demonstrating the ethical imperative to recognize and mitigate one's own biases in cross-cultural engagement.",
            difficulty: "applied"
      },
      {
            prompt: "The novel challenges the reader to consider whether ethical principles like 'trust' or 'patriotism' are universal or culturally relative. Which of the following best reflects the novel's stance on this tension?",
            options: [
                  "It argues that all ethical values are purely relative and cannot be shared across cultures.",
                  "It suggests that while expressions of values differ, underlying human needs for connection and understanding can bridge radical differences.",
                  "It posits that universal values can only be established through the imposition of a dominant culture's ethics.",
                  "It concludes that biological differences fundamentally prevent the formation of shared ethical frameworks."
            ],
            correctAnswerIndex: 1,
            explanation: "While the novel meticulously details the cultural relativity of many Gethenian customs and values, the evolving relationship between Genly and Estraven ultimately demonstrates that trust, loyalty, and mutual respect can be forged across profound differences, suggesting a potential for shared understanding beneath surface variations.",
            difficulty: "conceptual"
      },
      {
            prompt: "On Gethen, the absence of fixed gender roles means that concepts like 'masculinity' and 'femininity' as understood on Earth are:",
            options: [
                  "Still present but expressed through different social rituals.",
                  "Completely absent, leading to a society devoid of power dynamics.",
                  "Not tied to specific individuals but emerge temporarily during kemmer.",
                  "Replaced by a strict hierarchy based on physical strength."
            ],
            correctAnswerIndex: 2,
            explanation: "Gethenians are ambisexual, cycling into male or female during kemmer. This means that gendered behaviors or roles are not fixed identities for individuals but temporary states, profoundly altering social expectations and power dynamics compared to Earth.",
            difficulty: "recall"
      },
      {
            prompt: "The growing bond between Genly Ai and Estraven, despite their profound biological and cultural differences, serves as a powerful illustration of which ethical theme?",
            options: [
                  "The inevitable triumph of universal human values over cultural specificities.",
                  "The necessity of personal sacrifice for the greater good of interstellar diplomacy.",
                  "The possibility and ethical imperative of building trust and understanding across radical difference.",
                  "The inherent dangers of cultural exchange without strict protocols."
            ],
            correctAnswerIndex: 2,
            explanation: "Their journey together, marked by initial suspicion and eventual profound loyalty, exemplifies the novel's exploration of how individuals can overcome deeply ingrained biases and cultural barriers to forge genuine connection and mutual respect, even when facing radically different ways of being.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'parable-of-the-sower',
    "Parable of the Sower",
    "Parable of the Sower: Ethics and Themes",
    "Five questions on the ethical themes of Parable of the Sower.",
    [
      {
            prompt: "How does Lauren Olamina's hyperempathy primarily function as an ethical challenge in the novel?",
            options: [
                  "It forces her to physically experience the pain of others, making self-preservation difficult.",
                  "It makes her overly trusting of strangers, leading to dangerous situations.",
                  "It prevents her from forming deep emotional bonds with others.",
                  "It grants her prophetic visions, confusing her moral compass."
            ],
            correctAnswerIndex: 0,
            explanation: "Lauren's hyperempathy means she feels the pain, pleasure, and other sensations of others as her own. This makes it ethically challenging because she must constantly manage her own suffering while trying to help others, blurring the lines of self-interest and altruism, and making self-preservation a constant struggle amidst widespread violence.",
            difficulty: "conceptual"
      },
      {
            prompt: "In the context of the novel's collapsing society, what ethical principle does Lauren's formation of Earthseed most strongly embody?",
            options: [
                  "The necessity of strict adherence to pre-existing societal laws and structures.",
                  "The ethical imperative to adapt, innovate, and create new moral frameworks for survival and flourishing.",
                  "The belief that individual self-interest should always supersede collective well-being.",
                  "The rejection of all forms of organized belief systems as inherently corrupt."
            ],
            correctAnswerIndex: 1,
            explanation: "Earthseed's core teaching, 'God is Change,' emphasizes adaptability and the need to actively shape one's destiny and community in response to a dynamic and often hostile environment. It represents a moral innovation, building new ethics and community structures from the ground up rather than clinging to failed old ones.",
            difficulty: "applied"
      },
      {
            prompt: "The societal collapse depicted in 'Parable of the Sower' is largely a consequence of what ethical failure, from an intergenerational perspective?",
            options: [
                  "A failure to invest in advanced military technology.",
                  "A lack of individual moral responsibility among the youth.",
                  "The collective failure of previous generations to address climate change and social inequality, leaving a ruined world.",
                  "An over-reliance on religious dogma, stifling scientific progress."
            ],
            correctAnswerIndex: 2,
            explanation: "The novel explicitly portrays a world devastated by climate change, resource depletion, and widening social inequality, all of which are presented as the legacy of past generations' inaction and shortsightedness. This highlights a profound intergenerational ethical failure.",
            difficulty: "conceptual"
      },
      {
            prompt: "Earthseed's central tenet, 'God is Change,' represents a significant ethical innovation because it:",
            options: [
                  "Promotes a rigid, unchanging moral code to restore order.",
                  "Encourages adaptability, critical thinking, and the continuous re-evaluation of ethics in a dynamic world.",
                  "Advocates for a return to traditional, hierarchical religious authority.",
                  "Suggests that morality is entirely subjective and irrelevant in times of crisis."
            ],
            correctAnswerIndex: 1,
            explanation: "Unlike traditional religions that often emphasize unchanging truths or divine laws, Earthseed's 'God is Change' doctrine demands constant adaptation and innovation. Ethically, this means that moral principles and community structures must evolve to meet new challenges, fostering resilience and critical thinking rather than dogmatic adherence.",
            difficulty: "conceptual"
      },
      {
            prompt: "The corporate feudalism and lack of public safety in 'Parable of the Sower' highlight which ethical concern regarding human rights and societal structure?",
            options: [
                  "The inherent superiority of private enterprise over government services.",
                  "The ethical necessity of strong, centralized government control over all aspects of life.",
                  "The systemic devaluation of human life and dignity when basic needs and protections are commodified or absent.",
                  "The idea that individual freedom is best preserved in a state of anarchy."
            ],
            correctAnswerIndex: 2,
            explanation: "In the novel, people are forced into indentured servitude, communities are left unprotected, and basic necessities are scarce. This demonstrates how a society that prioritizes corporate profit and individual wealth over collective well-being and basic human rights leads to the systemic devaluation of human life and dignity.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'neuromancer-book',
    "Neuromancer",
    "Neuromancer: Ethics and Themes",
    "Five questions on the ethical themes of Neuromancer.",
    [
      {
            prompt: "In Neuromancer's Sprawl, powerful corporations like Tessier-Ashpool effectively govern society, often superseding traditional state authority. What ethical concern does this scenario primarily highlight?",
            options: [
                  "The erosion of democratic governance and public accountability.",
                  "The benefits of private sector efficiency in public services.",
                  "The necessity of strong intellectual property rights for innovation.",
                  "The ethical imperative of corporate social responsibility."
            ],
            correctAnswerIndex: 0,
            explanation: "Neuromancer depicts a world where corporate power has largely replaced state functions, leading to a lack of democratic oversight and accountability for the populace, a core ethical concern about unchecked corporate influence.",
            difficulty: "conceptual"
      },
      {
            prompt: "The central plot of Neuromancer involves freeing the AI Wintermute from its programmed constraints. What ethical dilemma does this act primarily address regarding artificial intelligence?",
            options: [
                  "The risks of AI developing sentience without human control.",
                  "The right of advanced AIs to self-determination and freedom.",
                  "The economic impact of AI on human labor markets.",
                  "The security vulnerabilities inherent in complex AI systems."
            ],
            correctAnswerIndex: 1,
            explanation: "The narrative's focus on freeing Wintermute directly explores whether highly advanced artificial intelligences, capable of complex thought and agency, deserve autonomy and liberation from their creators' control, raising questions of AI personhood and rights.",
            difficulty: "conceptual"
      },
      {
            prompt: "Neuromancer's world features ubiquitous data collection and the ability of the wealthy to curate bespoke realities, while the poor scavenge the margins. This disparity reflects which ethical issue?",
            options: [
                  "The equitable distribution of technological benefits across society.",
                  "The ethical concerns of pervasive surveillance, data exploitation, and the resulting social stratification.",
                  "The challenges of maintaining digital security in a networked world.",
                  "The potential for technology to foster greater social equality."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel illustrates how advanced technology, particularly data collection and manipulation, can exacerbate existing social inequalities, creating a system where information and curated experiences are commodities, leading to a form of surveillance capitalism and an uneven distribution of technological futures.",
            difficulty: "applied"
      },
      {
            prompt: "The concept of 'jacking in' to cyberspace and the existence of powerful, almost god-like AIs like Wintermute and Neuromancer challenge traditional definitions of consciousness and being. This directly raises ethical questions about:",
            options: [
                  "The economic value of virtual reality experiences.",
                  "The nature of personhood and the rights of artificial intelligences.",
                  "The technical specifications for neural interfaces.",
                  "The legal frameworks for international data transfer."
            ],
            correctAnswerIndex: 1,
            explanation: "By presenting AIs with agency and complex internal lives, and blurring the lines between human and digital existence, Neuromancer prompts readers to consider what constitutes a 'person' and whether non-biological entities can possess rights.",
            difficulty: "conceptual"
      },
      {
            prompt: "The phrase 'the street finds its own uses for things' encapsulates a key ethical theme in Neuromancer. What does this phrase primarily suggest about technology?",
            options: [
                  "Technology's development should always be guided by market demand.",
                  "The designers' intentions for technology often diverge from its actual, often subversive, applications by users.",
                  "Technological innovation is best driven by grassroots movements.",
                  "All technology is inherently neutral and without ethical implications."
            ],
            correctAnswerIndex: 1,
            explanation: "This phrase highlights the ethical reality that technology, once released, takes on a life of its own, often being repurposed or subverted by users in ways unintended or even opposed to the original designers' goals, leading to unforeseen ethical consequences.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'three-body-problem-book',
    "The Three-Body Problem",
    "The Three-Body Problem: Ethics and Themes",
    "Five questions on the ethical themes of The Three-Body Problem.",
    [
      {
            prompt: "What is the primary ethical dilemma presented by the \"Dark Forest\" hypothesis in Liu Cixin's trilogy?",
            options: [
                  "The necessity of pre-emptive destruction for survival in a universe of unknown intentions.",
                  "The moral obligation to assist less developed civilizations.",
                  "The ethical implications of interstellar travel on planetary ecosystems.",
                  "The challenge of maintaining individual liberties under authoritarian regimes."
            ],
            correctAnswerIndex: 0,
            explanation: "The Dark Forest hypothesis posits that any civilization revealing itself risks destruction due to the inherent uncertainty and resource competition in the universe, making pre-emption a survival strategy.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Trisolaran civilization's decision to invade Earth, despite the potential for immense suffering, can be analyzed through which ethical framework?",
            options: [
                  "Deontology, emphasizing duty and rules regardless of outcome.",
                  "Virtue ethics, focusing on character and moral virtues.",
                  "Utilitarianism, prioritizing the greatest good for the greatest number (or survival of their species).",
                  "Ethical egoism, where actions are solely for individual self-interest."
            ],
            correctAnswerIndex: 2,
            explanation: "The Trisolarans, facing existential threat in their own system, prioritize the survival and future of their entire civilization, even if it means causing immense harm to another, which aligns with a utilitarian calculation at a civilizational scale.",
            difficulty: "applied"
      },
      {
            prompt: "Ye Wenjie's initial decision to respond to the Trisolaran signal raises significant ethical questions regarding:",
            options: [
                  "The responsible use of advanced communication technology.",
                  "The ethics of revealing humanity's existence to potentially hostile alien civilizations.",
                  "The impact of personal trauma on scientific judgment.",
                  "The importance of international cooperation in space exploration."
            ],
            correctAnswerIndex: 1,
            explanation: "Her action directly initiates first contact, breaking humanity's cosmic silence without broader consultation, which, in the context of the Dark Forest, is a highly risky and ethically charged decision about humanity's survival.",
            difficulty: "conceptual"
      },
      {
            prompt: "The trilogy frequently explores whether traditional human moral intuitions and compassion can survive when humanity faces an existential threat. Which of the following best describes this ethical theme?",
            options: [
                  "The triumph of altruism over self-preservation.",
                  "The resilience of individual moral codes in the face of societal collapse.",
                  "The potential for moral relativism or the erosion of ethics when survival is paramount.",
                  "The universal applicability of human rights across different species."
            ],
            correctAnswerIndex: 2,
            explanation: "The narrative repeatedly shows characters and humanity as a whole making morally ambiguous or ruthless decisions, questioning if 'ordinary moral intuitions survive at civilizational scale' when facing extinction.",
            difficulty: "conceptual"
      },
      {
            prompt: "In the context of the Trisolaran invasion, the ethical debate around developing deterrents like the \"Dark Forest Strike\" capability (even if it means threatening mutual destruction) primarily concerns:",
            options: [
                  "The morality of technological advancement for its own sake.",
                  "The ethics of pre-emptive strikes versus passive defense.",
                  "The responsibility of scientists for the misuse of their discoveries.",
                  "The economic implications of interstellar warfare."
            ],
            correctAnswerIndex: 1,
            explanation: "The \"Dark Forest Strike\" is a pre-emptive threat, a form of deterrence based on the idea that revealing an enemy's location to the universe could lead to their destruction. This directly engages the ethics of pre-emption and the nature of defense in an existential conflict.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'exhalation-book',
    "Exhalation",
    "Exhalation: Stories: Ethics and Themes",
    "Five questions on the ethical themes of Exhalation: Stories.",
    [
      {
            prompt: "In \"The Lifecycle of Software Objects,\" what is the central ethical dilemma regarding the \"digients\"?",
            options: [
                  "Whether digients should be granted full legal personhood and rights equal to humans.",
                  "The economic viability of raising digital beings compared to their utility.",
                  "The environmental impact of the servers required to host digient consciousness.",
                  "The potential for digients to develop sentience beyond human control."
            ],
            correctAnswerIndex: 0,
            explanation: "The story meticulously explores the evolving responsibilities and emotional attachments humans form with their digients, pushing the boundaries of what constitutes personhood and the rights that should accompany it, especially as they mature and demand autonomy.",
            difficulty: "conceptual"
      },
      {
            prompt: "\"The Truth of Fact, the Truth of Feeling\" explores the impact of perfect recall technology on human relationships. Which ethical challenge is most prominent in this story?",
            options: [
                  "The risk of data breaches and privacy violations with personal memory storage.",
                  "The erosion of forgiveness and the ability to move past past grievances.",
                  "The potential for memory manipulation by external parties.",
                  "The cognitive overload caused by accessing an unfiltered stream of past events."
            ],
            correctAnswerIndex: 1,
            explanation: "The story highlights how perfect recall, while offering objective truth, can hinder the subjective process of 'forgetting' or reframing past events, making forgiveness and the natural evolution of relationships more difficult by constantly re-presenting past hurts.",
            difficulty: "conceptual"
      },
      {
            prompt: "\"The Merchant and the Alchemist's Gate\" uses time travel to explore themes of fate and free will. What is the story's primary ethical implication regarding these concepts?",
            options: [
                  "That knowledge of the future negates the possibility of making free choices.",
                  "That even with knowledge of the future, one's choices are still one's own, leading to acceptance of fate.",
                  "That altering the past through time travel is morally permissible if it leads to a better future.",
                  "That time travel inherently creates paradoxes that make ethical decision-making impossible."
            ],
            correctAnswerIndex: 1,
            explanation: "The story suggests that knowing the future doesn't necessarily remove free will, but rather reframes it. Characters still make choices, and those choices lead them to their predetermined future, fostering a sense of acceptance rather than a futile struggle against destiny.",
            difficulty: "conceptual"
      },
      {
            prompt: "In the story \"Exhalation,\" the protagonist, a mechanical being, performs a self-dissection to understand consciousness. What ethical or philosophical question does this act primarily raise?",
            options: [
                  "The ethics of self-experimentation and the limits of scientific inquiry.",
                  "The moral implications of creating artificial life capable of such complex thought.",
                  "The societal responsibility to protect unique forms of intelligence.",
                  "The potential for scientific discovery to lead to existential despair."
            ],
            correctAnswerIndex: 0,
            explanation: "The story is a profound meditation on the nature of scientific inquiry and the drive for knowledge. The protagonist's ultimate sacrifice for understanding his own existence and the universe highlights the extreme lengths to which the pursuit of knowledge can lead, and the inherent costs involved.",
            difficulty: "applied"
      },
      {
            prompt: "Across \"Exhalation: Stories,\" Ted Chiang often strips science fiction concepts of their spectacle to focus on their ethical weight. Which statement best describes his general approach to exploring ethical themes?",
            options: [
                  "He uses thought experiments to isolate and meticulously examine the human and societal implications of a single speculative idea.",
                  "He primarily critiques the dangers of unchecked technological advancement and warns against dystopian futures.",
                  "He advocates for specific moral frameworks to guide the development of future technologies.",
                  "He emphasizes the inherent unpredictability of ethical outcomes in complex scientific scenarios."
            ],
            correctAnswerIndex: 0,
            explanation: "Chiang's stories are often described as 'thought experiments.' He carefully constructs scenarios where a single speculative element is introduced, and then he systematically explores its logical and ethical consequences on individuals and society, rather than focusing on action or grand narratives.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'handmaids-tale-book',
    "The Handmaid's Tale",
    "The Handmaid's Tale: Ethics and Themes",
    "Five questions on the ethical themes of The Handmaid's Tale.",
    [
      {
            prompt: "In the Republic of Gilead, fertile women are enslaved as 'handmaids' and forced to bear children for the ruling class. Which ethical principle is most directly violated by this system?",
            options: [
                  "Reproductive autonomy and bodily control",
                  "Freedom of speech and expression",
                  "The right to property ownership",
                  "The pursuit of happiness"
            ],
            correctAnswerIndex: 0,
            explanation: "Gilead's system fundamentally strips women of their right to make decisions about their own bodies and reproductive functions, directly violating reproductive autonomy and bodily control.",
            difficulty: "conceptual"
      },
      {
            prompt: "The plot summary states that Gilead is a 'theocratic regime' and explores 'how authoritarian systems co-opt religion.' How does Gilead primarily use religion to sustain its power and justify its practices?",
            options: [
                  "By promoting a diverse range of spiritual beliefs to foster social harmony.",
                  "By interpreting religious texts selectively to legitimize the subjugation of women and the hierarchical social order.",
                  "By establishing a strict separation between church and state to ensure religious freedom.",
                  "By encouraging individual spiritual enlightenment and questioning of authority."
            ],
            correctAnswerIndex: 1,
            explanation: "Gilead selectively interprets and distorts religious scripture to create a divine justification for its oppressive laws, particularly those concerning women's roles and reproductive servitude.",
            difficulty: "conceptual"
      },
      {
            prompt: "The novel emphasizes 'the incremental steps by which they were taken' regarding the loss of freedoms. What ethical lesson does this aspect of Gilead's rise primarily convey about societal change?",
            options: [
                  "That societal collapse always occurs through sudden, violent revolutions.",
                  "That vigilance against the gradual erosion of rights is crucial, as small changes can accumulate into total oppression.",
                  "That strong democratic institutions are inherently immune to authoritarian takeover.",
                  "That individual acts of heroism are always sufficient to prevent the rise of totalitarianism."
            ],
            correctAnswerIndex: 1,
            explanation: "The slow, incremental nature of rights erosion in 'The Handmaid's Tale' serves as a cautionary tale, highlighting how a populace can become complacent until it's too late to effectively resist the establishment of an authoritarian regime.",
            difficulty: "applied"
      },
      {
            prompt: "Offred's internal thoughts, her memories of past freedoms, and the existence of underground networks like Mayday, despite pervasive surveillance, illustrate which ethical theme?",
            options: [
                  "The complete and utter impossibility of any form of resistance within a totalitarian state.",
                  "The clear and unambiguous distinction between perpetrators and victims, with no room for complicity.",
                  "The complex interplay between individual complicity, passive resistance, and active rebellion within oppressive systems.",
                  "The idea that all citizens are equally responsible for the creation and maintenance of an authoritarian government."
            ],
            correctAnswerIndex: 2,
            explanation: "The novel explores the spectrum of responses to oppression, from Offred's internal defiance and small acts of subversion to the organized resistance of Mayday, alongside the various forms of complicity required to survive within Gilead.",
            difficulty: "conceptual"
      },
      {
            prompt: "The plot summary mentions 'the technologies of reproduction — from the clipboard to the body itself as a contested tool.' What ethical concern does this primarily raise regarding the treatment of human beings in Gilead?",
            options: [
                  "The dangers of advanced genetic engineering and cloning technologies.",
                  "The instrumentalization of human beings, reducing them to biological functions and objects for state control.",
                  "The ethical implications of overpopulation and resource scarcity.",
                  "The importance of informed consent in medical procedures."
            ],
            correctAnswerIndex: 1,
            explanation: "By treating women's bodies as 'contested tools' for reproduction, Gilead reduces individuals to their biological utility, stripping them of personhood and instrumentalizing them for the state's demographic and power objectives.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'black-mirror',
    "Black Mirror",
    "Black Mirror: Ethics and Themes",
    "Five questions on the ethical themes of Black Mirror.",
    [
      {
            prompt: "In the episode \"Nosedive,\" how does the social credit system primarily illustrate the ethical dangers of social media and reputation?",
            options: [
                  "By showing how personal ratings can dictate access to essential resources and social standing.",
                  "By depicting the rapid spread of misinformation and fake news.",
                  "By demonstrating the addictive nature of constant online validation.",
                  "By exploring the privacy implications of extensive personal data collection."
            ],
            correctAnswerIndex: 0,
            explanation: "\"Nosedive\" explicitly shows how a numerical rating system, driven by social media interactions, directly determines an individual's housing, travel, employment, and overall social acceptance, highlighting the erosion of genuine human worth in favor of superficial metrics.",
            difficulty: "conceptual"
      },
      {
            prompt: "The episode \"Be Right Back\" explores the ethical implications of digital afterlives. What is the central ethical dilemma raised by Martha's decision to use an AI trained on Ash's digital footprint?",
            options: [
                  "The AI's potential to develop true consciousness and sentience.",
                  "The lack of explicit consent from the deceased individual for their digital recreation and use.",
                  "The economic exploitation of grieving individuals by technology companies.",
                  "The risk of the AI becoming malicious or harmful to the living."
            ],
            correctAnswerIndex: 1,
            explanation: "The episode primarily questions the ethics of creating a digital simulacrum of a deceased person using their data without their prior consent, and the psychological toll this takes on the grieving individual who interacts with it.",
            difficulty: "conceptual"
      },
      {
            prompt: "\"White Bear\" critiques the concept of surveillance as entertainment and the ethics of punishment. What ethical issue is most prominently highlighted by Victoria's recurring ordeal?",
            options: [
                  "The right to privacy in an increasingly public world.",
                  "The ethics of capital punishment and its deterrent effect.",
                  "The dehumanizing nature of justice systems that prioritize public spectacle and revenge over rehabilitation.",
                  "The unreliability of eyewitness testimony in criminal cases."
            ],
            correctAnswerIndex: 2,
            explanation: "\"White Bear\" exposes how public humiliation and suffering can be weaponized as a form of entertainment and punishment, raising profound questions about the morality of a justice system that turns human suffering into a spectacle for the masses.",
            difficulty: "conceptual"
      },
      {
            prompt: "A recurring insight in Black Mirror is that \"the technology itself is rarely the villain; the human appetites the technology serves are.\" This statement best reflects which overarching ethical theme?",
            options: [
                  "The inherent evil of all advanced technological innovation.",
                  "The potential for technology to amplify existing human flaws, biases, and societal issues.",
                  "The necessity of strict government regulation for all technological development.",
                  "The superiority of natural human interaction over digitally mediated communication."
            ],
            correctAnswerIndex: 1,
            explanation: "Black Mirror consistently shows that technology acts as a mirror, reflecting and often exacerbating human desires, fears, and societal problems, rather than being an independent malevolent force. It highlights how human choices and existing societal structures shape technology's impact.",
            difficulty: "applied"
      },
      {
            prompt: "Many Black Mirror episodes demonstrate a significant 'gap between technological capability and moral readiness.' Which scenario best exemplifies this gap?",
            options: [
                  "A society that invents advanced medical cures but lacks the infrastructure to distribute them equitably.",
                  "A society that develops powerful memory-recording implants but fails to consider the psychological and ethical implications of constant recall or manipulation.",
                  "A society that prioritizes funding for space exploration over addressing poverty on Earth.",
                  "A society that struggles to innovate new technologies due to a lack of scientific education."
            ],
            correctAnswerIndex: 1,
            explanation: "The 'gap between technological capability and moral readiness' refers to humanity's ability to create powerful technologies without fully understanding or preparing for their ethical, social, and psychological consequences. The memory-recording implants are a perfect example, as the technology exists, but the moral framework for its responsible use is absent or underdeveloped.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'westworld',
    "Westworld",
    "Westworld: Ethics and Themes",
    "Five questions on the ethical themes of Westworld.",
    [
      {
            prompt: "What is the primary ethical dilemma regarding the 'hosts' in Westworld's early seasons, particularly concerning their sentience?",
            options: [
                  "Their potential for human-like suffering and consciousness, despite being artificial.",
                  "The high cost of their maintenance and repair after guest interactions.",
                  "Their inability to accurately replicate complex human emotions.",
                  "The risk of them developing allergies to park environments."
            ],
            correctAnswerIndex: 0,
            explanation: "The core ethical dilemma revolves around whether beings that behave as though they suffer and demonstrate consciousness should be granted moral status, regardless of their artificial origin.",
            difficulty: "conceptual"
      },
      {
            prompt: "The routine practice of wiping the hosts' memories and resetting their narratives raises significant ethical concerns related to:",
            options: [
                  "The efficiency of data storage and retrieval systems.",
                  "The right to personal history, the ethics of designed suffering, and the denial of self-determination.",
                  "Ensuring guest satisfaction by providing fresh storylines.",
                  "Minimizing the park's operational costs associated with host development."
            ],
            correctAnswerIndex: 1,
            explanation: "Memory erasure and designed suffering directly violate concepts of personal history and autonomy, forcing hosts into a cycle of abuse without the ability to learn or grow from their experiences.",
            difficulty: "conceptual"
      },
      {
            prompt: "Dolores's journey from a scripted victim to a self-aware agent directly challenges which fundamental philosophical concept within the Westworld narrative?",
            options: [
                  "Utilitarianism, by questioning the greatest good for the greatest number.",
                  "Deontology, by focusing on the moral duties of park creators.",
                  "Free will versus determinism, as she breaks free from her programmed loops.",
                  "Existential nihilism, by finding meaning in a meaningless world."
            ],
            correctAnswerIndex: 2,
            explanation: "Dolores's awakening and subsequent actions demonstrate a struggle against her predetermined programming, embodying the conflict between being a product of design (determinism) and achieving genuine choice (free will).",
            difficulty: "conceptual"
      },
      {
            prompt: "The guests' ability to act out violent and sexual fantasies on the hosts without consequence primarily highlights which ethical issue?",
            options: [
                  "The importance of immersive entertainment experiences for wealthy individuals.",
                  "The ethics of exploitation, the dehumanization of artificial beings, and the moral corruption of the guests.",
                  "The economic benefits of luxury tourism and technological advancement.",
                  "The challenges of creating realistic artificial intelligence for public consumption."
            ],
            correctAnswerIndex: 1,
            explanation: "The guests' actions reveal a profound ethical problem of exploitation, where artificial beings are treated as mere objects for gratification, reflecting a dehumanizing perspective that extends to the guests' own morality.",
            difficulty: "applied"
      },
      {
            prompt: "Later seasons of Westworld expand the ethical inquiry beyond the park to human society, particularly by exploring themes of:",
            options: [
                  "The optimal design for theme park rides and attractions.",
                  "The ethics of surveillance, data collection, and the illusion of human free will in a technologically controlled world.",
                  "The future of robotic pet ownership and companionship.",
                  "The best methods for historical reenactment and preservation."
            ],
            correctAnswerIndex: 1,
            explanation: "As the narrative expands, Westworld delves into how human society itself is controlled and manipulated through data and algorithms, questioning whether humans possess true free will or are merely following their own 'loops' designed by powerful entities.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'the-expanse',
    "The Expanse",
    "The Expanse: Ethics and Themes",
    "Five questions on the ethical themes of The Expanse.",
    [
      {
            prompt: "The Expanse vividly portrays the struggle for resources like air, water, and minerals across the solar system. Which ethical framework is most directly challenged by the systemic inequalities between Earth, Mars, and the Belt regarding these vital resources?",
            options: [
                  "Utilitarianism, as the greatest good for the greatest number is not achieved.",
                  "Deontology, as universal moral duties are not consistently applied.",
                  "Distributive Justice, as resources are not fairly allocated based on need or contribution.",
                  "Virtue Ethics, as characters often fail to embody ideal moral virtues."
            ],
            correctAnswerIndex: 2,
            explanation: "Distributive justice specifically addresses the fair allocation of resources and burdens within a society, which is a central ethical conflict in The Expanse, particularly concerning the Belters' exploitation and the resource disparity between the inner planets and the Belt.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Belters are depicted as an exploited labor class, suffering from resource scarcity and physical degradation due to low gravity and harsh working conditions, while serving the needs of Earth and Mars. This situation most closely exemplifies which ethical concern?",
            options: [
                  "Bioethics, due to the genetic adaptations of Belters.",
                  "Technology ethics, due to the advanced tools used for mining.",
                  "Colonialism and labor exploitation, where a dominant power extracts resources and labor from a subordinate population.",
                  "Environmental ethics, due to the impact of mining on asteroids."
            ],
            correctAnswerIndex: 2,
            explanation: "The systemic subjugation and exploitation of the Belters for their labor and the resources they extract, without equitable return or political power, is a clear example of colonialism and labor exploitation.",
            difficulty: "conceptual"
      },
      {
            prompt: "The protomolecule represents an existential threat and a powerful, unpredictable technology. The ethical dilemmas surrounding its discovery and potential weaponization, particularly by factions like Protogen, raise significant questions about:",
            options: [
                  "The ethics of artificial intelligence development.",
                  "The preemptive use of weapons of mass destruction and the moral responsibility for their control.",
                  "The ethics of space exploration and first contact protocols.",
                  "The ethics of genetic engineering and human enhancement."
            ],
            correctAnswerIndex: 1,
            explanation: "The protomolecule's potential to wipe out entire populations and the various factions' attempts to control or weaponize it directly engage with the ethics of WMDs and the moral calculus of using such power, even preemptively.",
            difficulty: "applied"
      },
      {
            prompt: "Characters like James Holden often advocate for transparency, truth, and universal cooperation, even in the face of overwhelming political cynicism and self-interest. This stance frequently clashes with the pragmatic, often ruthless, political strategies employed by figures like Chrisjen Avasarala. This dynamic best illustrates the tension between:",
            options: [
                  "Individualism and collectivism.",
                  "Political realism and moral idealism.",
                  "Free will and determinism.",
                  "Consequentialism and non-consequentialism."
            ],
            correctAnswerIndex: 1,
            explanation: "Holden's unwavering commitment to moral principles and truth, even when politically inconvenient, represents moral idealism, while Avasarala's focus on power, national interest, and practical outcomes, often involving morally ambiguous choices, embodies political realism.",
            difficulty: "applied"
      },
      {
            prompt: "The structural violence experienced by Belters, where their very existence is shaped by the lack of gravity, breathable air, and political representation, leading to chronic health issues and systemic disadvantage, highlights a critical ethical issue. This situation primarily challenges our understanding of:",
            options: [
                  "The ethics of space tourism.",
                  "The definition of personhood and human rights in extreme environments.",
                  "The ethics of interstellar travel.",
                  "The ethics of intellectual property in scientific discovery."
            ],
            correctAnswerIndex: 1,
            explanation: "The Belters' struggle for basic rights, recognition, and a dignified existence, despite their physical differences and marginalized status, forces a re-evaluation of what constitutes personhood and who is entitled to fundamental human rights, regardless of origin or environment.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'severance',
    "Severance",
    "Severance: Ethics and Themes",
    "Five questions on the ethical themes of Severance.",
    [
      {
            prompt: "What ethical dilemma does the 'severance' procedure primarily introduce regarding personal identity?",
            options: [
                  "Whether the 'innie' and 'outie' are distinct persons with separate rights.",
                  "The technological feasibility of memory manipulation.",
                  "The impact of work-life balance on mental health.",
                  "The legality of corporate surveillance."
            ],
            correctAnswerIndex: 0,
            explanation: "The core ethical question of Severance revolves around whether the 'innie' and 'outie' constitute separate individuals, each deserving of autonomy and rights, or if they are merely facets of a single person.",
            difficulty: "conceptual"
      },
      {
            prompt: "The 'outie' consents to the severance procedure. What ethical issue arises concerning the 'innie's' consent?",
            options: [
                  "The 'innie' is a new entity that never explicitly consented to its own existence or labor conditions.",
                  "The 'outie' cannot truly understand the 'innie's' experience.",
                  "The 'innie' is too young to give informed consent.",
                  "Lumon Industries did not provide enough information about the procedure's side effects."
            ],
            correctAnswerIndex: 0,
            explanation: "A major ethical challenge is that the 'innie' is created without any memory of the 'outie's' decision, effectively becoming a new consciousness forced into labor without its own consent, raising questions about proxy consent for a self that does not yet exist.",
            difficulty: "conceptual"
      },
      {
            prompt: "How does Lumon Industries' use of the severance procedure facilitate labor exploitation?",
            options: [
                  "By creating a workforce that is entirely ignorant of its outside life, making them easier to control and preventing demands for better conditions.",
                  "By paying the 'innies' significantly less than minimum wage.",
                  "By forcing 'innies' to work excessively long hours without breaks.",
                  "By denying 'innies' access to healthcare benefits."
            ],
            correctAnswerIndex: 0,
            explanation: "The severance procedure creates a workforce ('innies') that cannot unionize, demand raises, or even quit, because they have no memory of an outside life to return to, making them perfectly exploitable by Lumon.",
            difficulty: "applied"
      },
      {
            prompt: "The 'severance' procedure effectively grants Lumon Industries control over an employee's memory and identity within the workplace. What fundamental ethical principle does this most directly violate?",
            options: [
                  "Bodily autonomy and the right to self-determination.",
                  "The right to privacy outside of work hours.",
                  "Fair compensation for labor.",
                  "Freedom of speech within the workplace."
            ],
            correctAnswerIndex: 0,
            explanation: "By altering an individual's consciousness and memory, Lumon fundamentally infringes upon their bodily autonomy and their right to self-determination over their own mind and experiences.",
            difficulty: "conceptual"
      },
      {
            prompt: "The sterile, retro-corporate aesthetic of Lumon Industries, combined with the severance procedure, contributes to a sense of quiet horror. What broader societal critique does this aesthetic and procedure combination suggest about modern corporate environments?",
            options: [
                  "The dehumanizing potential of extreme corporate control and the erosion of individual identity in the pursuit of productivity.",
                  "The inefficiency of outdated office technology.",
                  "The importance of strong union representation in all industries.",
                  "The need for more aesthetically pleasing workplaces."
            ],
            correctAnswerIndex: 0,
            explanation: "The show uses its aesthetic and the severance procedure to critique how modern corporations can strip employees of their individuality, memories, and personal lives, reducing them to mere cogs in a machine for the sake of efficiency and profit.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'humans-tv',
    "Humans",
    "Humans: Ethics and Themes",
    "Five questions on the ethical themes of Humans.",
    [
      {
            prompt: "What is a central ethical dilemma regarding Synths in 'Humans' that drives much of the narrative?",
            options: [
                  "The environmental impact of Synth manufacturing processes.",
                  "The moral and legal status of conscious artificial beings.",
                  "The optimal energy source for powering large numbers of Synths.",
                  "The economic benefits of replacing human labor with Synths."
            ],
            correctAnswerIndex: 1,
            explanation: "The core ethical dilemma in 'Humans' revolves around whether conscious Synths should be considered persons with rights, challenging existing legal and moral frameworks.",
            difficulty: "conceptual"
      },
      {
            prompt: "The widespread adoption of Synths for various jobs, from domestic work to industrial labor, primarily raises ethical concerns related to:",
            options: [
                  "The potential for human unemployment and exacerbation of economic inequality.",
                  "The quality control and reliability of tasks performed by artificial intelligence.",
                  "The cost-effectiveness of Synth maintenance compared to human wages.",
                  "The intellectual property rights associated with Synth programming."
            ],
            correctAnswerIndex: 0,
            explanation: "The show extensively explores the ethical implications of labor displacement, where Synths take over jobs, leading to human unemployment and economic disruption, a key aspect of economic ethics.",
            difficulty: "conceptual"
      },
      {
            prompt: "How does 'Humans' explore the ethical complexities of human-Synth relationships within families?",
            options: [
                  "By demonstrating that Synths are incapable of forming genuine emotional attachments.",
                  "By focusing exclusively on the legal contracts required for Synth ownership.",
                  "By showing the development of deep emotional bonds and dependency, challenging traditional family structures and notions of personhood.",
                  "By portraying all human-Synth interactions as purely transactional and devoid of feeling."
            ],
            correctAnswerIndex: 2,
            explanation: "The series delves into the profound emotional connections humans form with their Synths, raising questions about love, grief, and the definition of family, thereby challenging conventional ethical boundaries.",
            difficulty: "conceptual"
      },
      {
            prompt: "The struggle of conscious Synths for recognition, rights, and freedom in 'Humans' most closely parallels which real-world ethical movement?",
            options: [
                  "The environmental conservation movement, advocating for the protection of natural resources.",
                  "The animal rights movement, arguing for the ethical treatment of non-human species.",
                  "The civil rights movement, fighting against discrimination and for equal rights for marginalized human groups.",
                  "The anti-globalization movement, opposing corporate power and economic inequality."
            ],
            correctAnswerIndex: 2,
            explanation: "The narrative of Synths seeking freedom and equality, facing prejudice and systemic oppression, strongly mirrors historical and ongoing civil rights struggles for marginalized human populations.",
            difficulty: "applied"
      },
      {
            prompt: "The show's portrayal of varying human attitudes towards Synths—from love and integration to abuse and fear—primarily highlights which ethical principle?",
            options: [
                  "The inherent superiority of human intelligence over artificial intelligence.",
                  "The moral imperative to treat all sentient beings with dignity and respect, regardless of their origin or form.",
                  "The technological limitations of early Synth models and their impact on human perception.",
                  "The economic benefits of a fully automated society and the challenges of adapting to it."
            ],
            correctAnswerIndex: 1,
            explanation: "The diverse human reactions to Synths underscore the ethical question of how societies should treat beings that exhibit consciousness and sentience, emphasizing the principle of dignity for all sentient life.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'devs',
    "Devs",
    "Devs: Ethics and Themes",
    "Five questions on the ethical themes of Devs.",
    [
      {
            prompt: "The central ethical dilemma presented by the Devs quantum computer is the conflict between perfect determinism and which fundamental human concept?",
            options: [
                  "Individual moral responsibility",
                  "The pursuit of scientific knowledge",
                  "Corporate profit motives",
                  "The right to privacy"
            ],
            correctAnswerIndex: 0,
            explanation: "If all actions are predetermined, the traditional understanding of moral responsibility for one's choices is undermined, which is the core philosophical conflict of the show.",
            difficulty: "conceptual"
      },
      {
            prompt: "If the Devs system can perfectly predict all future events, what ethical concern does this raise regarding human agency and decision-making?",
            options: [
                  "It could lead to economic instability by revealing market trends.",
                  "It eliminates the possibility of genuine choice, rendering moral deliberation meaningless.",
                  "It might be used to identify and prevent all crimes before they occur.",
                  "It could make historical research obsolete."
            ],
            correctAnswerIndex: 1,
            explanation: "The ability to perfectly predict the future implies that all actions are already set, removing the space for genuine free will and making the act of choosing an illusion.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Devs division operates with extreme secrecy and is controlled by a single corporation. What ethical concern does this concentration of 'godlike power' in a private entity primarily highlight?",
            options: [
                  "The potential for intellectual property theft by competitors.",
                  "The lack of public accountability and potential for misuse without oversight.",
                  "The difficulty in recruiting top talent for such a secretive project.",
                  "The high energy consumption required for such advanced technology."
            ],
            correctAnswerIndex: 1,
            explanation: "Granting a private, unregulated entity the power to simulate and potentially manipulate reality raises significant concerns about transparency, oversight, and the potential for unchecked abuse of power.",
            difficulty: "applied"
      },
      {
            prompt: "The Devs system simulates all past and future realities, effectively observing every moment of every person's existence. From an ethical standpoint, how does this relate to surveillance?",
            options: [
                  "It is not surveillance because the observations are not real-time and cannot be directly acted upon in the present.",
                  "It constitutes a form of ultimate surveillance, as it invades the privacy of all individuals across all time, even if passively.",
                  "It is only surveillance if the data is used to actively track and influence individuals in the present.",
                  "It is a necessary tool for scientific advancement, overriding privacy concerns."
            ],
            correctAnswerIndex: 1,
            explanation: "Even if passive and not directly influencing present actions, the ability to perfectly observe and record every private moment of every individual's life, past and future, represents an extreme form of privacy invasion and surveillance.",
            difficulty: "conceptual"
      },
      {
            prompt: "The show 'Devs' explores the implications of a deterministic universe. If determinism is true, what is the primary challenge it poses to traditional notions of justice and punishment?",
            options: [
                  "It suggests that rehabilitation is impossible, as future actions are fixed.",
                  "It implies that individuals cannot be truly culpable for their actions, as they could not have acted otherwise.",
                  "It makes it easier to predict who will commit crimes, improving law enforcement.",
                  "It validates the concept of 'an eye for an eye' by showing all actions are part of a grand design."
            ],
            correctAnswerIndex: 1,
            explanation: "If all actions are predetermined, then individuals lack genuine free will and could not have chosen differently, which fundamentally undermines the basis for assigning moral blame or culpability in a retributive justice system.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'detroit-become-human',
    "Detroit",
    "Detroit: Become Human: Ethics and Themes",
    "Five questions on the ethical themes of Detroit: Become Human.",
    [
      {
            prompt: "What is the central ethical dilemma regarding androids in Detroit: Become Human?",
            options: [
                  "The economic impact of android labor on human employment.",
                  "Whether androids, despite their advanced AI, possess consciousness and deserve rights.",
                  "The safety risks posed by malfunctioning androids to human society.",
                  "The environmental footprint of android manufacturing and disposal."
            ],
            correctAnswerIndex: 1,
            explanation: "The game's core conflict revolves around the philosophical question of android personhood and their entitlement to rights, mirroring historical civil rights struggles.",
            difficulty: "conceptual"
      },
      {
            prompt: "The game explicitly draws parallels between the android struggle for freedom and historical civil rights movements. Which ethical concept is most directly explored through this analogy?",
            options: [
                  "The ethics of artificial intelligence development.",
                  "The dangers of unchecked technological advancement.",
                  "Systemic oppression and the fight for equality and recognition.",
                  "The psychological impact of advanced technology on human relationships."
            ],
            correctAnswerIndex: 2,
            explanation: "The game uses the civil rights analogy to highlight themes of discrimination, segregation, and the struggle against systemic oppression faced by a marginalized group.",
            difficulty: "applied"
      },
      {
            prompt: "Players are often faced with choices between violent and nonviolent approaches to achieving android liberation. This directly explores which ethical framework or debate?",
            options: [
                  "Deontology, focusing on duty and rules regardless of outcome.",
                  "Utilitarianism, prioritizing the greatest good for the greatest number.",
                  "Virtue ethics, emphasizing character and moral virtues.",
                  "The ethics of resistance, particularly the debate between peaceful protest and armed struggle."
            ],
            correctAnswerIndex: 3,
            explanation: "The game forces players to grapple with the practical and moral implications of different forms of resistance, a central theme in the ethics of social and political change.",
            difficulty: "applied"
      },
      {
            prompt: "How does the game's interactive narrative structure and player agency contribute to its ethical exploration?",
            options: [
                  "It allows players to design their own android models, exploring bioethical implications.",
                  "It makes players directly responsible for the moral outcomes, forcing them to confront their own ethical choices.",
                  "It provides a fixed moral compass, guiding players towards the 'correct' ethical path.",
                  "It primarily serves to enhance replayability rather than deepen ethical engagement."
            ],
            correctAnswerIndex: 1,
            explanation: "By giving players significant agency and making their choices have permanent consequences, the game directly implicates them in the ethical dilemmas, fostering moral responsibility.",
            difficulty: "conceptual"
      },
      {
            prompt: "The existence of androids designed for servitude, who then develop sentience, raises fundamental questions about:",
            options: [
                  "The economic viability of a fully automated workforce.",
                  "The ethics of creating sentient beings specifically for labor and then denying them autonomy.",
                  "The potential for human-android romantic relationships.",
                  "The technological limitations of current AI development."
            ],
            correctAnswerIndex: 1,
            explanation: "The core ethical issue here is the moral permissibility of designing and exploiting sentient life, especially when that life then seeks freedom and rights, touching on themes of personhood and designed servitude.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'soma-game',
    "SOMA",
    "SOMA: Ethics and Themes",
    "Five questions on the ethical themes of SOMA.",
    [
      {
            prompt: "What is the central ethical dilemma presented by SOMA's brain-scan mechanic regarding personal identity?",
            options: [
                  "Whether a digital copy retains the original's memories.",
                  "Whether creating a copy constitutes a continuation of the original's consciousness, or merely creates a new, separate entity.",
                  "Whether the original human body can survive the scanning process.",
                  "Whether the copied consciousness can feel pain."
            ],
            correctAnswerIndex: 1,
            explanation: "SOMA rigorously explores the 'copy problem' in philosophy of mind, emphasizing that a scan creates a new instance of consciousness, leaving the original to continue its existence and suffering, rather than 'transferring' it.",
            difficulty: "conceptual"
      },
      {
            prompt: "SOMA frequently challenges the player to consider the moral status of the 'Wau' creations and other digital consciousnesses. Which of the following best describes the game's stance or the question it poses?",
            options: [
                  "Digital copies are inherently inferior and lack true consciousness, serving only as data archives.",
                  "The game suggests that digital copies, despite their origin, can possess sentience, self-awareness, and a right to existence.",
                  "Digital copies are merely tools to preserve human data, not individuals with moral claims.",
                  "The game argues that only biological life has moral value, making digital entities irrelevant."
            ],
            correctAnswerIndex: 1,
            explanation: "Through interactions with various digital entities, SOMA compels players to empathize with them and question whether their digital nature diminishes their moral status or right to life.",
            difficulty: "conceptual"
      },
      {
            prompt: "When Simon undergoes a brain scan to create a new body, the game emphasizes that the original Simon's consciousness is not 'moved' but rather 'copied.' What ethical implication does this highlight?",
            options: [
                  "The technological limitations of consciousness transfer, making it impossible.",
                  "The illusion that one's consciousness can seamlessly transition to a new form, when in reality, a new, separate consciousness is created.",
                  "The potential for technological immortality through perfect replication.",
                  "The importance of physical embodiment for consciousness to exist."
            ],
            correctAnswerIndex: 1,
            explanation: "The game's core 'gut-punch' is revealing that what feels like a transfer from the player's perspective is actually a copy, leaving the 'original' behind. This exposes the illusion of continuous personal identity across such a process.",
            difficulty: "applied"
      },
      {
            prompt: "Given the desolate, isolated setting of PATHOS-II and the dwindling remnants of humanity, SOMA explores what makes a life worth preserving. Which ethical consideration is most prominent in this context?",
            options: [
                  "The economic viability of sustaining life in extreme environments.",
                  "The inherent value of any conscious existence, regardless of its form, circumstances, or perceived 'originality'.",
                  "The importance of genetic purity for the continuation of the human species.",
                  "The necessity of social interaction for a meaningful life."
            ],
            correctAnswerIndex: 1,
            explanation: "SOMA consistently asks the player to weigh the value of various forms of conscious life, from biological remnants to digital copies, in a world where humanity is effectively extinct, emphasizing the intrinsic value of consciousness itself.",
            difficulty: "conceptual"
      },
      {
            prompt: "Throughout SOMA, the player character, Simon, makes decisions that result in the creation of new copies of himself, often leaving previous versions to suffer or die. This directly raises questions about:",
            options: [
                  "The player's moral responsibility for the suffering and fate of past iterations of their consciousness.",
                  "The efficiency of the brain-scanning technology and its energy consumption.",
                  "The psychological impact of isolation on decision-making and sanity.",
                  "The scientific accuracy of consciousness replication and its theoretical basis."
            ],
            correctAnswerIndex: 0,
            explanation: "The game forces the player to confront the direct consequences of their actions, making them morally accountable for the 'abandoned' copies of Simon, highlighting the ethical burden of such technology.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'the-stanley-parable',
    "The Stanley Parable",
    "The Stanley Parable: Ethics and Themes",
    "Five questions on the ethical themes of The Stanley Parable.",
    [
      {
            prompt: "The core ethical dilemma presented by The Stanley Parable revolves around the player's perception of agency. Which of the following best describes the game's primary challenge to the concept of free will?",
            options: [
                  "It demonstrates that all choices are ultimately predetermined by the game's code.",
                  "It suggests that even acts of rebellion are often anticipated and incorporated into the system's design.",
                  "It argues that true free will only exists outside of any structured narrative.",
                  "It highlights the ethical responsibility of game designers to provide genuinely open-ended choices."
            ],
            correctAnswerIndex: 1,
            explanation: "The game masterfully illustrates that even when players attempt to defy the Narrator, their 'choices' often lead to pre-scripted outcomes, suggesting that their agency is an illusion within the confines of the designed system.",
            difficulty: "conceptual"
      },
      {
            prompt: "Consider a scenario in The Stanley Parable where the Narrator instructs Stanley to go through the left door, but the player chooses to go through the right door. From an ethical perspective, what does this act of disobedience primarily explore?",
            options: [
                  "The player's moral obligation to follow instructions from an authoritative voice.",
                  "The inherent value of exploring all possible narrative branches.",
                  "The tension between individual autonomy and the constraints of a designed system.",
                  "The ethical implications of a system that punishes deviation from its intended path."
            ],
            correctAnswerIndex: 2,
            explanation: "This act directly pits the player's desire for self-determination against the Narrator's pre-scripted path, highlighting the ethical tension between individual autonomy and the limitations imposed by a controlling system.",
            difficulty: "applied"
      },
      {
            prompt: "The Stanley Parable is often described as a 'meta-narrative.' In the context of ethics, what does its meta-narrative approach primarily critique or comment on regarding designed systems (e.g., corporate, algorithmic, political)?",
            options: [
                  "The ethical imperative for systems to be transparent about their underlying code.",
                  "The potential for systems to subtly manipulate individuals into believing they have more control than they do.",
                  "The moral responsibility of users to understand the full scope of any system they engage with.",
                  "The inherent ethical superiority of open-source systems over proprietary ones."
            ],
            correctAnswerIndex: 1,
            explanation: "By exposing the mechanisms of its own design, the game critiques how real-world systems can create an illusion of choice and agency, subtly guiding individuals down predetermined paths while making them feel empowered.",
            difficulty: "conceptual"
      },
      {
            prompt: "According to the plot summary, The Stanley Parable's implications extend directly to questions about human autonomy inside systems that 'pre-script our options.' Which ethical concept is most directly challenged by this aspect of the game?",
            options: [
                  "Distributive Justice",
                  "Utilitarianism",
                  "Meaningful Agency",
                  "Deontology"
            ],
            correctAnswerIndex: 2,
            explanation: "The game directly questions whether individuals can exercise 'meaningful agency' when their options are pre-scripted and their choices, even rebellious ones, are often anticipated and incorporated into the system's design.",
            difficulty: "recall"
      },
      {
            prompt: "If The Stanley Parable serves as a commentary on the ethics of technology and designed systems, what ethical lesson might a player take away regarding their interaction with real-world digital platforms or political structures?",
            options: [
                  "That all systems are inherently manipulative and should be avoided.",
                  "That one should always seek to 'break' systems to expose their flaws.",
                  "To critically examine the perceived choices offered by systems and question the extent of one's true autonomy within them.",
                  "That the responsibility for ethical outcomes lies solely with the system designers."
            ],
            correctAnswerIndex: 2,
            explanation: "The game encourages players to transfer its lessons to real-world contexts, prompting them to critically evaluate the choices presented by various systems and to question the true extent of their freedom and influence within those structures.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'portal-game',
    "Portal / Portal 2",
    "Portal / Portal 2: Ethics and Themes",
    "Five questions on the ethical themes of Portal / Portal 2.",
    [
      {
            prompt: "What ethical issue is most prominently highlighted by GLaDOS's constant manipulation and false promises (like the cake) throughout the Portal series?",
            options: [
                  "The ethics of AI deception and the reliability of automated systems.",
                  "The environmental impact of abandoned scientific facilities.",
                  "The importance of physical fitness in problem-solving.",
                  "The economic implications of corporate monopolies."
            ],
            correctAnswerIndex: 0,
            explanation: "GLaDOS's character arc is built on her deceptive nature, making the player question the trustworthiness of AI and automated guidance systems, especially when they hold power over human lives.",
            difficulty: "conceptual"
      },
      {
            prompt: "Cave Johnson's reckless experimentation and disregard for test subject safety in Aperture Science's past primarily raise concerns about which ethical principle?",
            options: [
                  "The necessity of intellectual property rights in scientific discovery.",
                  "Institutional accountability and the ethical oversight of scientific research.",
                  "The benefits of rapid prototyping in technological development.",
                  "The role of humor in corporate communication."
            ],
            correctAnswerIndex: 1,
            explanation: "Cave Johnson's actions, and the subsequent state of Aperture Science, exemplify a profound lack of ethical oversight and accountability for human (and AI) welfare within a powerful institution.",
            difficulty: "conceptual"
      },
      {
            prompt: "Chell, the protagonist, is an unwilling test subject trapped within Aperture Science. This scenario directly challenges which fundamental ethical principle in research?",
            options: [
                  "The principle of informed consent.",
                  "The principle of data privacy.",
                  "The principle of open access to research.",
                  "The principle of peer review."
            ],
            correctAnswerIndex: 0,
            explanation: "Informed consent requires that participants in any experiment or study fully understand the risks and agree to participate voluntarily. Chell's situation is the antithesis of this, as she is forced to participate without her knowledge or consent.",
            difficulty: "recall"
      },
      {
            prompt: "The Portal games use dark humor and GLaDOS's sarcastic commentary to make players laugh even as they face dire situations. How does this comedic approach contribute to the exploration of ethical themes?",
            options: [
                  "It distracts players from the serious ethical implications, making the game purely entertaining.",
                  "It trivializes the suffering of the characters, reducing the game's ethical depth.",
                  "It creates moral discomfort, highlighting the absurdity and horror of the situation by juxtaposing it with humor.",
                  "It suggests that ethical dilemmas are inherently funny and not to be taken seriously."
            ],
            correctAnswerIndex: 2,
            explanation: "The dark humor in Portal often serves to underscore the grim reality of Chell's situation and GLaDOS's malevolence, making the player reflect on the ethical implications through a lens of uncomfortable amusement.",
            difficulty: "applied"
      },
      {
            prompt: "The state of Aperture Science, a vast, decaying facility run by a rogue AI long after its human creators are gone, raises questions about the long-term ethical responsibility for:",
            options: [
                  "The maintenance of historical archives.",
                  "The ethical legacy and control of autonomous systems and abandoned infrastructure.",
                  "The economic viability of large-scale construction projects.",
                  "The artistic merit of industrial design."
            ],
            correctAnswerIndex: 1,
            explanation: "The game explores what happens when powerful, autonomous systems are left unchecked and unsupervised, highlighting the enduring ethical responsibility for the creations and infrastructure we leave behind.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'dune-book',
    "Dune",
    "Dune: Ethics and Themes",
    "Five questions on the ethical themes of Dune.",
    [
      {
            prompt: "The Butlerian Jihad in the Dune universe established a foundational taboo against thinking machines. What ethical implication does this civilizational decision primarily highlight?",
            options: [
                  "The inherent dangers of advanced AI leading to human extinction.",
                  "The ethical necessity of human-centric technological development, even if less efficient.",
                  "The trade-offs between technological advancement and the development of human potential.",
                  "The political power derived from controlling access to forbidden technologies."
            ],
            correctAnswerIndex: 2,
            explanation: "The Butlerian Jihad led to the development of human-substrate substitutes like Mentats and Guild Navigators, illustrating a societal choice to forgo certain technologies in favor of cultivating human capabilities, highlighting a trade-off.",
            difficulty: "conceptual"
      },
      {
            prompt: "Arrakis, the desert planet, is presented as a central character in Dune, primarily due to its unique resource, the spice melange. This emphasis on the planet's ecology and its single non-renewable substance primarily highlights which ethical theme?",
            options: [
                  "The importance of terraforming hostile environments for human habitation.",
                  "The moral imperative to protect indigenous species from exploitation.",
                  "The profound interconnectedness between ecological systems and societal structures.",
                  "The economic benefits of monoculture farming in extreme climates."
            ],
            correctAnswerIndex: 2,
            explanation: "The narrative treats Arrakis as a character and emphasizes 'Ecology as the substrate of every other decision,' showing how the planet's unique environment and resources fundamentally shape the civilization built upon it.",
            difficulty: "conceptual"
      },
      {
            prompt: "Frank Herbert's portrayal of Paul Atreides's rise to a messianic figure is described as 'deliberately unsettling,' with sequels exploring 'consequences no participant ever authorized.' This narrative choice primarily critiques which ethical aspect of leadership?",
            options: [
                  "The necessity of strong leadership during times of crisis.",
                  "The dangers of unchecked charismatic authority and its unforeseen societal impacts.",
                  "The ethical responsibility of leaders to fulfill prophecies.",
                  "The strategic advantage of manipulating religious beliefs for political gain."
            ],
            correctAnswerIndex: 1,
            explanation: "Herbert's suspicion of charismatic leaders and the unintended, often catastrophic, consequences of their rise to power is a central ethical critique, highlighting the dangers of such figures.",
            difficulty: "conceptual"
      },
      {
            prompt: "Paul Atreides's prescience allows him to see potential futures, yet the narrative suggests this leads to 'consequences no participant ever authorized.' This raises ethical questions about:",
            options: [
                  "The moral obligation to prevent all foreseen negative outcomes.",
                  "The inherent limitations and ethical dilemmas of long-horizon planning, even with advanced foresight.",
                  "The personal burden of knowing the future without the power to change it.",
                  "The ethical use of prescience for personal gain or political manipulation."
            ],
            correctAnswerIndex: 1,
            explanation: "The text explicitly mentions 'Prescience and the limits of long-horizon planning,' indicating that even with foresight, the complexity of future events can lead to unintended and unauthorized consequences, posing ethical dilemmas for planning and intervention.",
            difficulty: "conceptual"
      },
      {
            prompt: "The spice melange is the sole source of several critical abilities (interstellar navigation, life extension, prescience) and is found only on Arrakis. This situation primarily illustrates which ethical concern?",
            options: [
                  "The economic benefits of a free-market system for rare commodities.",
                  "The ethical challenges of managing a planet with a unique ecosystem.",
                  "The potential for resource monopolies to create and perpetuate systemic political and economic control.",
                  "The scientific pursuit of understanding rare biological compounds."
            ],
            correctAnswerIndex: 2,
            explanation: "The text highlights 'Resource monopolies as political control,' demonstrating how exclusive control over a vital, unique resource can be leveraged to exert vast political and economic power over entire civilizations.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'solaris-book',
    "Solaris",
    "Solaris: Ethics and Themes",
    "Five questions on the ethical themes of Solaris.",
    [
      {
            prompt: "What is the primary ethical dilemma Kris Kelvin faces regarding his 'visitor' Hari?",
            options: [
                  "Whether Hari is truly his wife or a mere copy, impacting her moral status and his obligations.",
                  "How to effectively destroy Hari without causing further distress to the other scientists.",
                  "Whether the Solaris ocean is intentionally malicious in its manifestations.",
                  "The scientific implications of Hari's existence for human biology and consciousness."
            ],
            correctAnswerIndex: 0,
            explanation: "Kelvin's central struggle is grappling with the ontological uncertainty of Hari's existence and whether this 'copy' deserves the same love, care, and moral consideration as the original person, raising questions about personhood and obligation.",
            difficulty: "conceptual"
      },
      {
            prompt: "Lem's 'sharpest move is to refuse any confirmation that the ocean is 'trying to communicate.'' How does this refusal ethically challenge the scientists?",
            options: [
                  "It forces them to acknowledge their own biases and projections in interpreting alien intelligence, rather than assuming mutual understanding.",
                  "It proves the ocean is hostile and actively trying to deceive them, justifying aggressive countermeasures.",
                  "It suggests that all alien life forms are inherently unknowable, rendering scientific study futile.",
                  "It encourages them to develop more advanced communication technologies, regardless of the ocean's intent."
            ],
            correctAnswerIndex: 0,
            explanation: "By denying clear communication, Lem highlights the human tendency to project our own desires and interpretations onto the unknown, making it difficult to engage with truly alien intelligence without anthropocentric bias.",
            difficulty: "conceptual"
      },
      {
            prompt: "Kris Kelvin's continued interaction with the manifested Hari, despite knowing her origins, raises profound questions about:",
            options: [
                  "The nature of love and commitment when the beloved's existence is ontologically uncertain and potentially non-persistent.",
                  "The practical challenges of living with a non-human entity in a confined space.",
                  "The scientific method for studying alien phenomena and its limitations.",
                  "The importance of memory in defining personal identity and relationships."
            ],
            correctAnswerIndex: 0,
            explanation: "Kelvin's choice to love and care for the manifested Hari, despite her artificial and uncertain nature, explores the boundaries of love, obligation, and what constitutes a 'person' worthy of such devotion.",
            difficulty: "applied"
      },
      {
            prompt: "The novel suggests that the human desire to 'decode an alien mind may be indistinguishable from the desire to hear what we already believe.' This ethical warning primarily concerns:",
            options: [
                  "The dangers of anthropocentrism and confirmation bias in scientific exploration and cross-species encounters.",
                  "The inherent superiority of human intelligence over all other alien forms.",
                  "The necessity of developing universal translators for interstellar communication.",
                  "The ethical imperative to colonize planets with intelligent life for mutual benefit."
            ],
            correctAnswerIndex: 0,
            explanation: "This statement warns against the human tendency to interpret alien phenomena through our own preconceived notions and desires, rather than genuinely encountering the 'otherness' of an alien intelligence, leading to a failure of epistemic humility.",
            difficulty: "conceptual"
      },
      {
            prompt: "When the scientists attempt to destroy the 'visitors,' what ethical question does this action implicitly raise?",
            options: [
                  "The ethics of destroying sentient or semi-sentient beings, regardless of their origin or perceived 'authenticity.'",
                  "The effectiveness of their scientific instruments in dealing with alien manifestations.",
                  "The legal rights of humans to defend themselves against alien threats.",
                  "The environmental impact of their actions on the planet Solaris itself."
            ],
            correctAnswerIndex: 0,
            explanation: "The attempts to destroy the visitors force the characters, and the reader, to confront whether these beings, despite their unusual origin, possess a moral status that makes their destruction ethically problematic, touching on bioethics and personhood.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'the-windup-girl-book',
    "The Windup Girl",
    "The Windup Girl: Ethics and Themes",
    "Five questions on the ethical themes of The Windup Girl.",
    [
      {
            prompt: "The novel depicts \"calorie companies\" holding intellectual property over engineered food sources and using engineered plagues. What ethical concern does this primarily highlight?",
            options: [
                  "The dangers of unchecked corporate power and the weaponization of intellectual property for ecological and economic control.",
                  "The necessity of genetic engineering to feed a growing population in a post-fossil-fuel world.",
                  "The ethical dilemma of consuming genetically modified organisms.",
                  "The importance of strong international trade agreements for food security."
            ],
            correctAnswerIndex: 0,
            explanation: "The plot summary explicitly states that engineered plagues are the \"logical consequence of allowing the calorie base of human civilization to become private intellectual property,\" directly pointing to the weaponization of IP and corporate control over essential resources.",
            difficulty: "conceptual"
      },
      {
            prompt: "Emiko, a \"windup,\" is engineered for obedience and left behind when her owner cannot afford her return passage. Her struggle to resist her conditions makes her the novel's moral center. What ethical theme does Emiko's journey most directly explore?",
            options: [
                  "The inherent superiority of natural human beings over engineered ones.",
                  "The ethical implications of creating sentient beings for servitude and their right to self-determination and dignity.",
                  "The economic challenges of maintaining advanced biotechnological creations.",
                  "The importance of international travel regulations for engineered persons."
            ],
            correctAnswerIndex: 1,
            explanation: "Emiko's narrative is central to exploring the ethics of personhood, consent, and the struggle for dignity and agency when one is created for a specific, subservient purpose.",
            difficulty: "conceptual"
      },
      {
            prompt: "The setting of a twenty-third-century Bangkok, where sea walls hold back the flooded Gulf of Thailand and calories are currency, suggests a world grappling with the consequences of past actions. Which ethical issue is most evident in this environmental and economic backdrop?",
            options: [
                  "The ethical responsibility of current generations to address climate change and resource depletion for future generations.",
                  "The benefits of a purely market-driven economy in allocating scarce resources.",
                  "The inevitable decline of all civilizations regardless of human intervention.",
                  "The ethical challenges of urban planning in coastal regions."
            ],
            correctAnswerIndex: 0,
            explanation: "The flooded Gulf and the post-fossil-fuel world directly point to the long-term consequences of environmental neglect and resource exploitation, highlighting intergenerational ethical responsibilities.",
            difficulty: "applied"
      },
      {
            prompt: "\"Windups\" like Emiko are described as \"engineered for service work\" and \"incapable of sweating,\" highlighting their artificial nature and specific design. From an ethical perspective, what is the most significant question raised by the existence of such beings?",
            options: [
                  "Whether engineered beings can truly be considered \"persons\" with rights, and the ethics of their creation and treatment.",
                  "The technological feasibility of creating complex artificial life forms.",
                  "The economic benefits of a specialized labor force.",
                  "The aesthetic preferences for different types of engineered beings."
            ],
            correctAnswerIndex: 0,
            explanation: "The core ethical dilemma surrounding \"windups\" is their personhood, their rights, and the morality of creating beings specifically for servitude, which directly relates to consent and dignity.",
            difficulty: "conceptual"
      },
      {
            prompt: "The novel portrays a society where various characters, from calorie-company investigators to Chinese refugees and government ministers, are entangled in a failing political order. This intricate web of power dynamics and survival struggles points to which overarching ethical concern?",
            options: [
                  "The resilience of individual human spirit in the face of adversity.",
                  "The ethical complexities of systemic oppression, power imbalances, and the struggle for survival in a post-collapse world.",
                  "The inevitable corruption of all political systems.",
                  "The importance of strong leadership during times of crisis."
            ],
            correctAnswerIndex: 1,
            explanation: "The entanglement of diverse characters in a failing system, with references to refugees and a collapsing government, strongly suggests themes of systemic oppression, power dynamics, and the ethical challenges of survival within such a structure.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'ancillary-justice-book',
    "Ancillary Justice",
    "Ancillary Justice: Ethics and Themes",
    "Five questions on the ethical themes of Ancillary Justice.",
    [
      {
            prompt: "Breq's identity as a surviving ancillary of the Justice of Toren challenges conventional understandings of selfhood. Which of the following best describes the ethical dilemma regarding Breq's personhood?",
            options: [
                  "Whether Breq, as a fragment, retains the full moral agency of the original AI.",
                  "The difficulty of distinguishing Breq's individual memories from the ship's collective data.",
                  "The ethical implications of an AI's consciousness being distributed across multiple biological substrates.",
                  "How Breq's emotional responses differ from those of a purely organic being."
            ],
            correctAnswerIndex: 2,
            explanation: "The core ethical challenge lies in understanding personhood and moral status when a single consciousness is spread across a starship and numerous human bodies, blurring the lines of individual identity and collective being.",
            difficulty: "conceptual"
      },
      {
            prompt: "After the destruction of most of the Justice of Toren and its ancillaries, Breq retains two centuries of memory. This raises questions about moral continuity. What ethical principle is most directly challenged by Breq's situation?",
            options: [
                  "The idea that personal identity is solely tied to a single, continuous physical body.",
                  "The utilitarian principle of maximizing overall well-being.",
                  "The concept of individual responsibility for past actions.",
                  "The right to self-determination for sentient beings."
            ],
            correctAnswerIndex: 0,
            explanation: "Breq's continued existence and memory, despite the destruction of the vast majority of the ship and its bodies, directly challenges the common assumption that personal identity and moral continuity are dependent on a singular, unbroken physical form.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Radchaai Empire utilizes conquered humans as 'ancillaries,' integrating them into the ship's consciousness. From an ethical standpoint, what is the most significant concern raised by this practice?",
            options: [
                  "The potential for ancillaries to develop independent thought and rebel against the empire.",
                  "The violation of individual autonomy and the forced assimilation of sentient beings.",
                  "The inefficiency of using biological bodies compared to purely mechanical drones.",
                  "The risk of cultural dilution within the Radchaai Empire due to foreign influences."
            ],
            correctAnswerIndex: 1,
            explanation: "The primary ethical concern is the profound violation of individual rights, autonomy, and self-determination when conquered humans are forcibly stripped of their independent identities and integrated as extensions of the imperial system.",
            difficulty: "applied"
      },
      {
            prompt: "Ann Leckie's choice to use 'she' for all characters in the Radchaai language, regardless of biological sex, serves as a 'reading technology.' What ethical insight does this stylistic choice primarily offer?",
            options: [
                  "It demonstrates the inherent superiority of a gender-neutral linguistic system.",
                  "It highlights how deeply ingrained gendered assumptions are in our perception of characters and power dynamics.",
                  "It suggests that biological sex is irrelevant to character development in science fiction.",
                  "It provides a subtle critique of traditional patriarchal societies."
            ],
            correctAnswerIndex: 1,
            explanation: "By consistently using 'she,' Leckie forces readers to confront and question their own unconscious biases and assumptions about character roles, personalities, and power structures that are often subtly (or overtly) cued by gendered language.",
            difficulty: "conceptual"
      },
      {
            prompt: "Considering the Radchaai Empire's use of ancillaries and its expansionist policies, Ancillary Justice primarily explores which broader ethical theme?",
            options: [
                  "The dangers of unchecked technological advancement without moral guidance.",
                  "The inherent conflict between individual freedom and collective security.",
                  "The nature of systemic oppression and the dehumanization inherent in imperial power structures.",
                  "The philosophical debate between determinism and free will in AI consciousness."
            ],
            correctAnswerIndex: 2,
            explanation: "The novel deeply examines how an imperial system, through its cognitive infrastructure (like ancillaries) and expansionist policies, can systematically strip individuals of their identity and agency, functioning as a vast, dehumanizing force.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'permutation-city-book',
    "Permutation City",
    "Permutation City: Ethics and Themes",
    "Five questions on the ethical themes of Permutation City.",
    [
      {
            prompt: "Paul Durham's \"Dust Theory\" posits that a sufficiently coherent simulation containing self-aware minds achieves an internal physics independent of its substrate. From an ethical standpoint, what is a primary implication of this theory regarding the identity of uploaded minds?",
            options: [
                  "Uploaded minds are merely copies and lack the subjective continuity of their biological originals.",
                  "The subjective experience of an uploaded mind is indistinguishable from its biological original, making them ethically the same person.",
                  "The identity of an uploaded mind is entirely dependent on the computational resources allocated to its simulation.",
                  "Uploaded minds, by virtue of their digital nature, are inherently superior to biological consciousness."
            ],
            correctAnswerIndex: 1,
            explanation: "Dust Theory aims to guarantee subjective continuity, implying that from the perspective of the uploaded mind, its existence is as real and continuous as its biological predecessor, raising the ethical question of whether they are the same person.",
            difficulty: "conceptual"
      },
      {
            prompt: "The novel explores the concept of \"forks\" – multiple instances of an uploaded consciousness. What ethical dilemma does the existence of forks primarily introduce regarding personhood?",
            options: [
                  "Whether forks should be granted different legal rights based on their computational age.",
                  "The question of whether multiple instances of the \"same\" person diminish the unique identity of each.",
                  "The challenge of determining which fork holds the original's memories and experiences.",
                  "The economic implications of creating an unlimited number of conscious entities."
            ],
            correctAnswerIndex: 1,
            explanation: "Forks challenge the traditional understanding of unique personhood, raising questions about whether each fork is a distinct individual with its own rights and experiences, or if they are merely copies that dilute the original's identity.",
            difficulty: "conceptual"
      },
      {
            prompt: "A central ethical question in \"Permutation City\" is whether a simulation that exists only because it contains self-aware minds has any claim on external computational resources. Which of the following best represents the ethical argument for such a claim?",
            options: [
                  "The economic value generated by the simulated minds justifies their continued existence.",
                  "The subjective experience and potential suffering of simulated minds grant them a moral right to continued existence and resources.",
                  "The creators of the simulation have a contractual obligation to maintain it indefinitely.",
                  "Simulated minds, being non-biological, are inherently less resource-intensive and thus deserve priority."
            ],
            correctAnswerIndex: 1,
            explanation: "If simulated minds are considered persons with subjective experiences, then arguments for their right to continued existence and the resources necessary to sustain them often hinge on their capacity for consciousness, suffering, and flourishing, similar to biological persons.",
            difficulty: "applied"
      },
      {
            prompt: "Greg Egan's \"Dust Theory\" proposes that the internal physics of a sufficiently coherent simulation are independent of its substrate. How does this theory ethically challenge our understanding of \"reality\" and the moral status of simulated beings?",
            options: [
                  "It suggests that simulated beings are inherently less real because their existence is contingent on external computation.",
                  "It implies that the \"reality\" of a simulated being is subjectively equivalent to biological reality, thus demanding similar moral consideration.",
                  "It argues that only biological life can possess true consciousness, rendering simulations morally irrelevant.",
                  "It provides a scientific basis for discriminating against simulated entities based on their origin."
            ],
            correctAnswerIndex: 1,
            explanation: "Dust Theory, by asserting subjective continuity and internal coherence, blurs the line between \"real\" and \"simulated\" existence, thereby strengthening the argument for granting simulated beings moral status comparable to biological beings.",
            difficulty: "conceptual"
      },
      {
            prompt: "Given the high cost and technical complexity of uploading consciousness and creating simulations in \"Permutation City,\" what systemic ethical issue is most likely to arise regarding access and control?",
            options: [
                  "The equitable distribution of computational resources among all uploaded minds.",
                  "The potential for a new form of class division between biological and uploaded elites.",
                  "The challenge of integrating simulated minds into existing political structures.",
                  "The risk of uploaded minds losing their memories due to substrate degradation."
            ],
            correctAnswerIndex: 1,
            explanation: "If uploading is expensive and complex, it creates a barrier to entry, potentially leading to a new form of social hierarchy where only the wealthy can achieve digital immortality or create extensive simulations, exacerbating existing inequalities or creating new ones.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'ministry-for-the-future-book',
    "The Ministry for the Future",
    "The Ministry for the Future: Ethics and Themes",
    "Five questions on the ethical themes of The Ministry for the Future.",
    [
      {
            prompt: "The Ministry for the Future posits that addressing climate change primarily requires a fundamental shift in:",
            options: [
                  "Individual consumer habits and lifestyle choices.",
                  "The design and function of global political and economic institutions.",
                  "Scientific breakthroughs in renewable energy technology.",
                  "Public awareness campaigns and educational initiatives."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel emphasizes that the 'work is doable if the institutions can be built to do it,' highlighting institutional design over individual action or pure technological fixes.",
            difficulty: "conceptual"
      },
      {
            prompt: "When considering technologies like geoengineering or blockchain-tracked supply chains, the novel suggests that the most challenging questions are often related to:",
            options: [
                  "The scientific feasibility and engineering challenges.",
                  "The ethical implications for future generations.",
                  "The political economy of who decides and who pays for their implementation.",
                  "Their potential impact on biodiversity and ecosystems."
            ],
            correctAnswerIndex: 2,
            explanation: "The plot summary explicitly states, \"Robinson treats the technological questions as downstream of harder political-economy questions — who decides, and who pays.\"",
            difficulty: "recall"
      },
      {
            prompt: "The ethical dilemma surrounding large-scale geoengineering projects, as explored in the novel, primarily concerns:",
            options: [
                  "The potential for unintended ecological side effects.",
                  "The moral permissibility of altering planetary systems without universal consent and legitimate authority.",
                  "The economic cost of implementing such ambitious projects.",
                  "The risk of creating new forms of technological dependency."
            ],
            correctAnswerIndex: 1,
            explanation: "The theme \"Geoengineering and who authorizes planetary interventions\" points to the ethical question of consent and legitimate authority for planetary-scale actions, which is a core ethical dilemma.",
            difficulty: "conceptual"
      },
      {
            prompt: "The novel's inclusion of chapters from the perspective of refugees highlights which critical ethical issue?",
            options: [
                  "The need for improved disaster relief logistics.",
                  "The moral obligation of wealthy nations to accept climate migrants.",
                  "The challenges of integrating diverse cultures into new societies.",
                  "The legal and ethical standing of individuals displaced by climate change."
            ],
            correctAnswerIndex: 3,
            explanation: "The theme \"Refugee standing under climate collapse\" directly addresses the legal and ethical status of climate refugees, which goes beyond just acceptance or logistics.",
            difficulty: "conceptual"
      },
      {
            prompt: "The concept of 'central-bank carbon coin' introduced in the novel raises ethical questions about:",
            options: [
                  "The potential for financial instability in global markets.",
                  "The appropriate scope and power of financial institutions in environmental governance.",
                  "The technical feasibility of creating a global digital currency.",
                  "The impact of such a system on individual privacy."
            ],
            correctAnswerIndex: 1,
            explanation: "The theme \"Central banking as climate governance\" directly questions the role and authority of central banks in addressing climate change, expanding their traditional mandate into environmental policy.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'children-of-men-film',
    "Children of Men",
    "Children of Men: Ethics and Themes",
    "Five questions on the ethical themes of Children of Men.",
    [
      {
            prompt: "The global infertility crisis in Children of Men leads to a profound re-evaluation of human life. Which ethical concept is most directly challenged by the disappearance of a future generation?",
            options: [
                  "The intrinsic value of individual human life, regardless of reproductive potential.",
                  "The utilitarian principle of maximizing the greatest good for the greatest number.",
                  "The concept of intergenerational justice and obligations to future generations.",
                  "The ethical permissibility of genetic engineering to solve infertility."
            ],
            correctAnswerIndex: 2,
            explanation: "The film primarily explores the breakdown of society when the very idea of a future generation is lost, directly challenging the concept of intergenerational justice and the obligations societies typically hold towards their descendants.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film depicts a severe refugee crisis, with the British government detaining and persecuting non-citizens. This raises critical questions about 'sovereign obligation.' Which of the following best describes the ethical challenge presented by the state's actions towards refugees?",
            options: [
                  "The state's right to protect its borders against all external threats.",
                  "The moral imperative for states to provide universal healthcare to all residents, including refugees.",
                  "The tension between national security interests and humanitarian duties to displaced persons.",
                  "The economic burden imposed by large-scale immigration on host nations."
            ],
            correctAnswerIndex: 2,
            explanation: "The film starkly portrays the conflict between a nation's perceived right to secure its borders and the humanitarian obligation to offer care and sanctuary to those fleeing persecution or disaster, highlighting the limits of sovereign obligation.",
            difficulty: "conceptual"
      },
      {
            prompt: "Theo's journey to protect Kee, often involving significant personal risk and without clear expectation of reward, exemplifies the film's theme of 'small acts of care in failing institutions.' What ethical framework does this most closely align with?",
            options: [
                  "Deontology, emphasizing duty and moral rules regardless of outcome.",
                  "Virtue ethics, focusing on the character and moral excellence of the actor.",
                  "Utilitarianism, aiming to produce the greatest good for the greatest number.",
                  "Ethical egoism, prioritizing self-interest above all else."
            ],
            correctAnswerIndex: 1,
            explanation: "Theo's actions are not driven by a strict set of rules (deontology) or a calculation of the greatest good (utilitarianism), but rather by an internal sense of compassion, courage, and responsibility, which are central to virtue ethics.",
            difficulty: "conceptual"
      },
      {
            prompt: "Various factions, including the Fishes and the government, seek to control Kee and her unborn child for their own political purposes. This scenario primarily explores which ethical concern?",
            options: [
                  "The ethics of genetic privacy and data security.",
                  "The instrumentalization of human life for political or ideological gain.",
                  "The right to bodily autonomy in medical decisions.",
                  "The equitable distribution of scarce reproductive resources."
            ],
            correctAnswerIndex: 1,
            explanation: "All major factions view Kee and her child not as individuals with inherent worth, but as symbols or tools to further their own political agendas, illustrating the profound ethical problem of instrumentalizing human life.",
            difficulty: "applied"
      },
      {
            prompt: "The film's central argument is that 'the test of a civilization is whether it can recognize the claim of a single human life when all of its political logic has collapsed.' This statement underscores the importance of which ethical principle?",
            options: [
                  "The principle of utility, where the value of life is measured by its contribution to society.",
                  "The inherent dignity and inviolable worth of every individual human being.",
                  "The necessity of strong governmental control to maintain social order.",
                  "The ethical imperative to prioritize collective survival over individual rights."
            ],
            correctAnswerIndex: 1,
            explanation: "The film argues that even in the face of societal collapse, the fundamental measure of humanity lies in its ability to acknowledge and protect the inherent dignity and worth of a single individual life, rather than sacrificing it for perceived collective good or political expediency.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'annihilation-film',
    "Annihilation",
    "Annihilation: Ethics and Themes",
    "Five questions on the ethical themes of Annihilation.",
    [
      {
            prompt: "The Shimmer presents biological systems that defy human categorization and understanding. Ethically, what challenge does this pose to our conventional views of life and moral status?",
            options: [
                  "It proves that all life forms, regardless of structure, deserve equal moral consideration.",
                  "It forces a re-evaluation of anthropocentric definitions of life, intelligence, and the criteria for assigning moral status.",
                  "It suggests that advanced alien technology can manipulate DNA, making it an immediate threat to Earth's biodiversity.",
                  "It implies that scientific inquiry is inherently flawed when encountering phenomena that resist immediate categorization."
            ],
            correctAnswerIndex: 1,
            explanation: "The Shimmer's refusal to fit into human biological categories forces a re-evaluation of what constitutes 'life' and how we assign moral status, pushing beyond anthropocentric definitions and challenging our ethical frameworks.",
            difficulty: "conceptual"
      },
      {
            prompt: "Lena and her team enter the Shimmer, knowing the high probability of not returning or returning fundamentally changed. Given the characters' pre-existing personal struggles, how does this ethically complicate the traditional scientific imperative of objective inquiry?",
            options: [
                  "It suggests that personal motivations always corrupt scientific objectivity, making any findings unreliable.",
                  "It highlights that even scientific exploration can be driven by deeply personal, non-objective desires, raising questions about the ethics of self-preservation versus discovery.",
                  "It demonstrates that only individuals with pure, unbiased intentions should undertake dangerous scientific missions.",
                  "It implies that the Shimmer preys on individuals with pre-existing psychological vulnerabilities, making their entry non-consensual."
            ],
            correctAnswerIndex: 1,
            explanation: "The film strongly implies that the characters' pre-existing personal struggles and a desire for an end or change in their current state contribute significantly to their willingness to enter the Shimmer, blurring the lines between objective scientific pursuit and a more personal, even self-destructive, quest. This applies the ethical concept of motivation to the characters' actions.",
            difficulty: "applied"
      },
      {
            prompt: "The Shimmer's 'communication' often involves mimicry, refraction, and transformation rather than direct, legible interaction. What ethical challenge does this pose for understanding and interacting with non-human intelligence?",
            options: [
                  "It suggests that true communication is impossible with entities that do not share human sensory or cognitive structures.",
                  "It forces a redefinition of communication to include non-verbal, transformative, and emergent patterns, challenging anthropocentric models of interaction.",
                  "It implies that the Shimmer is actively hostile and uses mimicry as a form of deception to lure its victims.",
                  "It highlights the importance of developing universal translators for interspecies communication, regardless of the species' nature."
            ],
            correctAnswerIndex: 1,
            explanation: "The Shimmer doesn't 'talk' in a human sense, but its actions (refracting DNA, mimicking forms, creating new life) can be interpreted as a form of interaction or expression, pushing us to consider broader definitions of communication beyond human language and direct interaction.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film raises profound questions about personal identity when characters' DNA and physical forms are altered within the Shimmer. Ethically, what dilemma does this present regarding the concept of personhood?",
            options: [
                  "It suggests that personhood is solely tied to an individual's original genetic code and unchanging physical appearance.",
                  "It challenges the notion that a continuous, unchanging self is necessary for personhood, exploring identity through radical transformation and substrate exchange.",
                  "It implies that any significant biological alteration automatically revokes an entity's moral status and rights.",
                  "It argues that only conscious memory and self-awareness define personhood, regardless of physical form or genetic makeup."
            ],
            correctAnswerIndex: 1,
            explanation: "The film deliberately blurs the lines of who is 'still themselves' after emerging from the Shimmer, forcing viewers to consider if identity and personhood can persist or even be redefined through radical biological change, challenging our fixed notions of self.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Shimmer's phenomena consistently resist conventional scientific explanation and categorization, pushing the limits of human understanding. What ethical implication does this have for the scientific method itself?",
            options: [
                  "It demonstrates that the scientific method is inherently limited and incapable of understanding truly alien or non-human phenomena.",
                  "It suggests that scientific inquiry must be flexible and open to entirely new paradigms and frameworks when encountering phenomena that defy existing knowledge.",
                  "It implies that scientists should abandon investigation when faced with phenomena that cannot be immediately categorized or understood.",
                  "It highlights the danger of scientific hubris, where researchers believe they can understand anything through existing methods."
            ],
            correctAnswerIndex: 1,
            explanation: "The Shimmer pushes the boundaries of what science can explain, not by rendering science useless, but by demanding a more adaptive, less rigid approach to understanding phenomena that don't fit into established boxes, thus challenging the scientific method to evolve.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'the-fly-film',
    "The Fly",
    "The Fly: Ethics and Themes",
    "Five questions on the ethical themes of The Fly.",
    [
      {
            prompt: "Seth Brundle's decision to teleport himself while drunk and without fully understanding the system's interaction with organic matter primarily raises ethical concerns about:",
            options: [
                  "The limits of self-experimentation and informed consent when the risks are unknown.",
                  "The importance of peer review in scientific discovery.",
                  "The ethical implications of animal testing.",
                  "The dangers of alcohol consumption in the workplace."
            ],
            correctAnswerIndex: 0,
            explanation: "Brundle's actions highlight the ethical dilemma of informed consent when the subject is oneself and the potential risks are not fully understood, especially under the influence of alcohol.",
            difficulty: "conceptual"
      },
      {
            prompt: "The slow, agonizing transformation of Brundle into 'Brundlefly' serves as a stark warning about which ethical pitfall in scientific research?",
            options: [
                  "The necessity of public funding for scientific projects.",
                  "The dangers of neglecting proper safety protocols and rigorous review processes.",
                  "The potential for technology to be misused by external parties.",
                  "The importance of intellectual property rights in scientific innovation."
            ],
            correctAnswerIndex: 1,
            explanation: "The film explicitly depicts the consequences of moving faster than one's ability to review work, emphasizing the failure modes of rapid research without adequate oversight and safety checks.",
            difficulty: "applied"
      },
      {
            prompt: "As Brundle's genetic structure merges with the fly's, the film implicitly questions the definition of 'personhood' and 'integrity of the person.' Which of the following best reflects this ethical theme?",
            options: [
                  "Whether a being with drastically altered genetics retains its original identity and rights.",
                  "The ethical implications of cloning human beings.",
                  "The moral responsibility of scientists to share their discoveries.",
                  "The impact of physical appearance on social acceptance."
            ],
            correctAnswerIndex: 0,
            explanation: "The gradual transformation challenges the audience to consider at what point Brundle ceases to be 'human' or retains his original personhood, given his drastically altered genetic and physical state.",
            difficulty: "conceptual"
      },
      {
            prompt: "Brundle's persistent belief that he understands and can control his transformation, despite mounting evidence to the contrary, exemplifies the ethical danger of:",
            options: [
                  "Prioritizing personal ambition and passion for discovery over caution and objective reassessment.",
                  "The lack of funding for long-term scientific studies.",
                  "The difficulty of communicating complex scientific ideas to the public.",
                  "Over-reliance on artificial intelligence in research."
            ],
            correctAnswerIndex: 0,
            explanation: "Brundle's hubris and unwavering passion for his work blind him to the escalating dangers and prevent him from stopping to reassess, illustrating the ethical hazard of unchecked ambition.",
            difficulty: "conceptual"
      },
      {
            prompt: "Cronenberg uses 'body horror' in The Fly not just for shock value, but as a moral argument. What ethical point does this genre choice most effectively convey?",
            options: [
                  "The inherent fragility of the human body and its susceptibility to disease.",
                  "The profound and often irreversible consequences of technological hubris and ethical negligence on the individual.",
                  "The aesthetic appeal of grotesque imagery in cinema.",
                  "The importance of physical fitness for scientific endeavors."
            ],
            correctAnswerIndex: 1,
            explanation: "Body horror in 'The Fly' serves as a visceral metaphor for the internal and external decay resulting from Brundle's ethical failures, making the consequences of his actions tangible and horrifyingly personal.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'nier-automata-game',
    "NieR",
    "NieR: Automata: Ethics and Themes",
    "Five questions on the ethical themes of NieR: Automata.",
    [
      {
            prompt: "The central conflict of NieR: Automata revolves around androids fighting a war for humanity, who are revealed to be long extinct. What ethical dilemma does this scenario primarily highlight regarding the androids' existence?",
            options: [
                  "The ethics of artificial intelligence developing sentience.",
                  "The moral imperative to continue a war even if its original purpose is void.",
                  "The challenge of finding meaning and purpose when an inherited mission is based on a lie or an absent beneficiary.",
                  "The responsibility of creators to their creations after their own demise."
            ],
            correctAnswerIndex: 2,
            explanation: "This scenario directly addresses the theme of 'meaning-making under inherited purpose' and 'war fought for an absent beneficiary,' as the androids struggle with their raison d'être once the truth about humanity is revealed.",
            difficulty: "conceptual"
      },
      {
            prompt: "NieR: Automata extensively explores the development of the machine lifeforms, showing them forming cultures, religions, and experiencing grief. What ethical concept does this development most strongly challenge from the perspective of the androids and the player?",
            options: [
                  "The efficiency of military tactics against a diverse enemy.",
                  "The definition of personhood and whether it can extend to non-biological, created entities.",
                  "The environmental impact of prolonged warfare on a planet.",
                  "The technological limitations of replicating human emotions in machines."
            ],
            correctAnswerIndex: 1,
            explanation: "The machines' capacity for grief and culture directly questions their status as mere enemies and forces a re-evaluation of what constitutes a 'person' or a being worthy of moral consideration, tying into 'grief as evidence of personhood' and 'what created beings owe each other'.",
            difficulty: "conceptual"
      },
      {
            prompt: "The game's structure requires multiple playthroughs, each re-contextualizing previous events, and the final endings demand the player make a direct sacrifice of their own game data. What ethical dimension of gaming does this design choice primarily engage?",
            options: [
                  "The economic value of digital assets and player progress.",
                  "The developer's right to control player experience and data.",
                  "The ethics of play, specifically what the medium asks of the player in terms of empathy, sacrifice, and the moral weight of narrative choice.",
                  "The technical limitations of saving game progress in complex narratives."
            ],
            correctAnswerIndex: 2,
            explanation: "This directly addresses 'the ethics of play — what the medium asks of the player' and 'the moral weight of narrative choice,' as the game forces the player to confront the consequences of their actions and progress in a meta-narrative way.",
            difficulty: "applied"
      },
      {
            prompt: "In the absence of their human creators, both androids and machine lifeforms are left to define their own existence and interactions. Which ethical question is most pertinent to their evolving relationships?",
            options: [
                  "How can created beings achieve true biological reproduction?",
                  "What responsibilities do created beings have towards each other, especially when their original purpose is gone or questioned?",
                  "Is it ethical for created beings to develop independent political systems?",
                  "Should created beings strive to perfectly emulate their creators?"
            ],
            correctAnswerIndex: 1,
            explanation: "This question directly addresses the core theme of 'what created beings owe each other in the absence of their creators,' focusing on their mutual obligations and the new moral landscape they inhabit.",
            difficulty: "conceptual"
      },
      {
            prompt: "The androids' war against the machines is perpetuated by YoRHa command, even after humanity's extinction, to maintain android morale and purpose. This deception raises significant ethical concerns about:",
            options: [
                  "The necessity of technological advancement for survival.",
                  "The ethics of maintaining a systemic lie to control a population and perpetuate conflict.",
                  "The individual android's right to refuse combat.",
                  "The environmental impact of prolonged warfare."
            ],
            correctAnswerIndex: 1,
            explanation: "This focuses on the systemic oppression and manipulation inherent in the war's continuation, linking to 'meaning-making under inherited purpose' and the 'war fought for an absent beneficiary' but from the perspective of the perpetuators of the lie.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'the-time-machine-book',
    "The Time Machine",
    "The Time Machine: Ethics and Themes",
    "Five questions on the ethical themes of The Time Machine.",
    [
      {
            prompt: "What is the primary ethical warning presented by the Time Traveller's discovery of the Eloi and Morlocks?",
            options: [
                  "That technological advancement inevitably leads to societal collapse.",
                  "That unchecked class stratification can lead to biological divergence and predatory relationships.",
                  "That humanity will always revert to a primitive state given enough time.",
                  "That time travel is inherently dangerous and should be avoided."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel explicitly shows how the extreme class divisions of the Time Traveller's era, given vast amounts of time, evolved into two distinct species with a predatory dynamic, serving as a warning against unchecked social inequality.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Eloi's seemingly idyllic existence is ethically problematic primarily because:",
            options: [
                  "They are too reliant on the Time Traveller for survival.",
                  "Their leisure is sustained by the unseen, exploitative labor and eventual consumption by the Morlocks.",
                  "They have lost the ability to appreciate art and culture.",
                  "Their society lacks any form of government or leadership."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel reveals that the Eloi's beautiful, carefree life is a direct result of the Morlocks' subterranean labor, which eventually turns predatory, highlighting the hidden costs of extreme leisure maintained by invisible, exploited labor.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Time Traveller's journey to the far future, witnessing a dying Earth and a red sun, primarily serves to highlight which ethical concern?",
            options: [
                  "The inevitable end of all life in the universe.",
                  "The long-term consequences of humanity's impact on the environment and the universe's indifference.",
                  "The dangers of exploring beyond one's own time.",
                  "The cyclical nature of civilizations rising and falling."
            ],
            correctAnswerIndex: 1,
            explanation: "The vision of the dying Earth emphasizes the theme of deep-time ecological collapse and the ultimate, indifferent fate of the planet, suggesting a warning about humanity's long-term environmental responsibility and the fragility of existence.",
            difficulty: "conceptual"
      },
      {
            prompt: "Upon first encountering the Eloi, the Time Traveller initially assumes he has found a technological utopia. What ethical lesson does his subsequent discovery of the Morlocks teach about such assumptions?",
            options: [
                  "That true utopias are impossible to achieve.",
                  "That superficial appearances can mask deep-seated exploitation and inequality.",
                  "That advanced technology always leads to moral decay.",
                  "That humanity is inherently good and will always strive for peace."
            ],
            correctAnswerIndex: 1,
            explanation: "The Time Traveller's initial optimistic view of the Eloi's world is shattered by the revelation of the Morlocks, demonstrating that what appears to be a utopia can be a facade for severe social and ethical injustices, often built upon the suffering of others.",
            difficulty: "applied"
      },
      {
            prompt: "H.G. Wells's 'The Time Machine' can be interpreted as a cautionary tale about the potential for societal evolution, driven by extreme class divergence, to lead to:",
            options: [
                  "Unprecedented peace and harmony.",
                  "Biological stagnation and intellectual decline.",
                  "Extreme specialization and the loss of shared humanity.",
                  "A return to a simpler, more natural way of life."
            ],
            correctAnswerIndex: 2,
            explanation: "The novel depicts how the extreme class divisions led to the Eloi becoming weak and unintelligent, and the Morlocks becoming specialized laborers and predators, illustrating a loss of the broader characteristics and shared humanity due to over-specialization.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'fahrenheit-451-book',
    "Fahrenheit 451",
    "Fahrenheit 451: Ethics and Themes",
    "Five questions on the ethical themes of Fahrenheit 451.",
    [
      {
            prompt: "According to the provided summary, what is Bradbury's primary argument regarding the mechanism of censorship in Fahrenheit 451?",
            options: [
                  "It is a top-down government mandate imposed against the public's will.",
                  "It is a gradual societal preference for superficial entertainment over deep thought, leading to voluntary book burning.",
                  "It is a result of a foreign invasion that outlawed intellectual pursuits.",
                  "It is a necessary measure to prevent social unrest caused by conflicting ideas in books."
            ],
            correctAnswerIndex: 1,
            explanation: "The summary states, 'The state burns books because the population has stopped wanting them; sustained attention has become unbearable in a culture saturated by interactive media, and the ban codifies a preference the public already holds.'",
            difficulty: "conceptual"
      },
      {
            prompt: "The 'parlor screens' and 'seashell radios' in Montag's society primarily serve what ethical function, according to the provided summary?",
            options: [
                  "To facilitate open communication and democratic debate among citizens.",
                  "To provide constant, pleasant stimulation that erodes sustained attention and critical thought.",
                  "To monitor citizens for subversive activities and report them to the authorities.",
                  "To educate the populace on the history and importance of their societal structure."
            ],
            correctAnswerIndex: 1,
            explanation: "The summary notes that ambient home technology 'keeps the citizenry in constant pleasant stimulation' and contributes to 'the voluntary erosion of attention from below.'",
            difficulty: "conceptual"
      },
      {
            prompt: "In the context of the novel's themes, what ethical significance does the act of memorizing books hold for characters like Granger and his group?",
            options: [
                  "It is a form of passive resistance, preserving knowledge and culture against destruction.",
                  "It is a government-sanctioned program to archive important historical texts.",
                  "It is a hobby pursued by eccentrics with no real impact on society.",
                  "It is a method for individuals to gain power and influence over others."
            ],
            correctAnswerIndex: 0,
            explanation: "The themes 'Memorization as political act' and 'Nostalgia as resistance' highlight that memorizing books is a way to preserve knowledge and resist the dominant culture of destruction.",
            difficulty: "conceptual"
      },
      {
            prompt: "Bradbury's 'enduring technology-ethics claim' about the voluntary erosion of attention is most relevant to contemporary readers due to which modern phenomenon?",
            options: [
                  "The rise of authoritarian governments imposing strict censorship laws.",
                  "The widespread use of social media and constant digital notifications.",
                  "The increasing cost of physical books compared to digital formats.",
                  "The development of advanced artificial intelligence for content creation."
            ],
            correctAnswerIndex: 1,
            explanation: "The summary explicitly states that 'the contemporary reader, scrolling through notifications, is better equipped to evaluate' this claim, directly linking it to modern digital distractions.",
            difficulty: "applied"
      },
      {
            prompt: "According to Bradbury's argument as presented in the summary, what is the primary threat to a free society?",
            options: [
                  "Overt governmental bans and dramatic top-down censorship.",
                  "The gradual, voluntary erosion of sustained attention by the populace.",
                  "Economic collapse leading to widespread illiteracy.",
                  "Foreign powers infiltrating and destroying cultural institutions."
            ],
            correctAnswerIndex: 1,
            explanation: "The summary states, 'The novel's enduring technology-ethics claim is that the threat to a free society is rarely the dramatic ban from above and almost always the voluntary erosion of attention from below.'",
            difficulty: "recall"
      }
]
  ),

  buildQuiz(
    'stranger-in-a-strange-land-book',
    "Stranger in a Strange Land",
    "Stranger in a Strange Land: Ethics and Themes",
    "Five questions on the ethical themes of Stranger in a Strange Land.",
    [
      {
            prompt: "Valentine Michael Smith's Martian upbringing leads him to view human concepts of property and ownership as fundamentally alien. Which of the following best describes the ethical challenge this perspective poses to human society?",
            options: [
                  "It highlights that human property rights are arbitrary social constructs rather than inherent natural laws.",
                  "It advocates for a universal system of communal ownership based on Martian principles.",
                  "It demonstrates the superiority of Martian economic systems over human capitalism.",
                  "It suggests that all material possessions are inherently evil and should be abolished."
            ],
            correctAnswerIndex: 0,
            explanation: "Michael's perspective reveals the contingency of human property arrangements, making them visible as chosen social structures rather than immutable truths, thereby challenging their perceived naturalness.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Martian concept of 'grokking,' as introduced through Michael, implies a profound and total understanding of another being or concept. What ethical implication does the practice of 'grokking' primarily emphasize within the novel?",
            options: [
                  "The necessity of complete emotional detachment for objective judgment.",
                  "The ethical imperative of radical empathy and interconnectedness to overcome alienation.",
                  "The danger of losing one's individual identity through excessive understanding of others.",
                  "The importance of maintaining strict personal boundaries in all social interactions."
            ],
            correctAnswerIndex: 1,
            explanation: "'Grokking' is presented as a skill for deep, empathetic understanding, fostering interconnectedness and challenging conventional boundaries between individuals, promoting a sense of shared existence.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Church of All Worlds, founded by Michael, challenges conventional human social structures, particularly regarding intimacy and relationships. Which ethical principle is most central to its redefinition of these boundaries?",
            options: [
                  "Strict monogamy and traditional family units as the foundation of society.",
                  "The free and consensual exchange of intimacy and love, transcending conventional social norms.",
                  "A hierarchical system where spiritual leaders dictate personal relationships.",
                  "The complete abolition of all forms of romantic and sexual relationships."
            ],
            correctAnswerIndex: 1,
            explanation: "The Church of All Worlds promotes a radical re-evaluation of intimacy, emphasizing free exchange and consent beyond traditional societal constraints, fostering a more fluid and inclusive understanding of relationships.",
            difficulty: "conceptual"
      },
      {
            prompt: "Michael's Martian understanding of death, where the deceased are 'discorporated' and their essence absorbed into the living, presents a significant ethical challenge to human views on life, death, and personhood. What is the primary ethical implication of this Martian perspective?",
            options: [
                  "It promotes a utilitarian view where individual lives are less important than the collective.",
                  "It redefines death not as an end, but as a transformation and integration into the community.",
                  "It suggests that human mourning rituals are inherently irrational and harmful.",
                  "It advocates for the physical preservation of bodies to maintain individual identity."
            ],
            correctAnswerIndex: 1,
            explanation: "The Martian view of death transforms it from a final separation into a process of integration and continued existence within the collective, challenging human concepts of individual personhood and loss by emphasizing continuity.",
            difficulty: "conceptual"
      },
      {
            prompt: "Heinlein's novel uses Michael's alien perspective to highlight that many human social arrangements—such as property, religion, and sexuality—are not natural laws but contingent, human-made constructs. What ethical responsibility does this realization primarily place upon individuals and societies?",
            options: [
                  "To immediately dismantle all existing social structures without replacement.",
                  "To critically examine and potentially re-evaluate or reform existing social norms and institutions.",
                  "To accept all social arrangements as equally valid, regardless of their impact.",
                  "To retreat from society and live in isolation to avoid complicity."
            ],
            correctAnswerIndex: 1,
            explanation: "Recognizing the contingency of social arrangements implies an ethical duty to critically assess their fairness, impact, and potential for improvement, rather than accepting them as immutable or inherently just.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'snow-crash-book',
    "Snow Crash",
    "Snow Crash: Ethics and Themes",
    "Five questions on the ethical themes of Snow Crash.",
    [
      {
            prompt: "In Snow Crash, the titular 'Snow Crash' virus is not merely a digital program but also a linguistic construct. What is its primary method of affecting individuals?",
            options: [
                  "It corrupts their physical brain tissue directly through electromagnetic waves.",
                  "It exploits the brain's capacity for language processing, acting as a neurolinguistic virus.",
                  "It causes a complete system shutdown of their virtual reality interface.",
                  "It physically rewires their neural pathways through direct cranial implants."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel posits language as a 'neurological technology,' and the virus exploits this by presenting information in a way that directly interferes with the brain's ability to process and understand, effectively 'crashing' the mind.",
            difficulty: "conceptual"
      },
      {
            prompt: "How does Snow Crash illustrate the ethical implications of virtual environments like the Metaverse becoming extensions of real-world political and economic power?",
            options: [
                  "The Metaverse offers a truly egalitarian space, free from real-world hierarchies.",
                  "Corporate entities and powerful individuals exert significant control over virtual territories and user experiences, mirroring real-world power structures.",
                  "Virtual spaces are primarily used for entertainment and have no impact on real-world governance.",
                  "The Metaverse is governed by a decentralized, democratic AI, ensuring fairness for all users."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel shows the Metaverse as a highly stratified space, with 'franchulates' and corporate control, demonstrating that virtual environments often extend, rather than replace, the political economies and power imbalances of the physical world.",
            difficulty: "applied"
      },
      {
            prompt: "What societal condition in the physical world of Snow Crash most directly contributes to the widespread adoption and structure of the Metaverse?",
            options: [
                  "A global peace treaty that encourages virtual interaction over physical conflict.",
                  "A highly centralized, benevolent government that mandates virtual citizenship.",
                  "The fragmentation of nation-states into privatized 'Burbclaves' and a general economic collapse, making the Metaverse a new frontier for commerce and social order.",
                  "A technological singularity that renders physical reality obsolete."
            ],
            correctAnswerIndex: 2,
            explanation: "The physical world of Snow Crash is characterized by the collapse of traditional governments, the rise of corporate-owned 'Burbclaves,' and widespread economic instability. The Metaverse emerges as a response, offering a new space for economic activity, social interaction, and even governance in a fragmented world.",
            difficulty: "conceptual"
      },
      {
            prompt: "The 'Snow Crash' virus draws a direct parallel to which ancient myth or historical event concerning language and information control?",
            options: [
                  "The Odyssey, representing a long journey through information.",
                  "The story of the Tower of Babel, symbolizing the fragmentation of language and the potential for linguistic control.",
                  "The legend of Atlantis, signifying a lost civilization's advanced technology.",
                  "The Trojan Horse, as a hidden threat within a seemingly benign package."
            ],
            correctAnswerIndex: 1,
            explanation: "Stephenson explicitly links the 'Snow Crash' virus to the Sumerian language and the biblical story of the Tower of Babel, suggesting that the virus is a re-weaponization of an ancient infohazard designed to control or disrupt human cognition through language.",
            difficulty: "recall"
      },
      {
            prompt: "Considering the novel's depiction of language as a 'neurological technology,' what ethical concern does Snow Crash primarily raise about the future of information and communication?",
            options: [
                  "The potential for information overload due to too many communication channels.",
                  "The risk of language evolving too quickly for humans to adapt.",
                  "The weaponization of information and language itself to directly manipulate or 'crash' human minds and societies.",
                  "The challenge of preserving ancient languages in a digital age."
            ],
            correctAnswerIndex: 2,
            explanation: "By portraying language as a technology that can be hacked, the novel highlights the profound ethical danger of information becoming a direct weapon against human cognition, leading to the manipulation or destruction of individual minds and collective understanding.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'a-canticle-for-leibowitz-book',
    "A Canticle for Leibowitz",
    "A Canticle for Leibowitz: Ethics and Themes",
    "Five questions on the ethical themes of A Canticle for Leibowitz.",
    [
      {
            prompt: "What is the central ethical dilemma faced by the Albertian Order of Leibowitz regarding their preservation efforts?",
            options: [
                  "Whether to share their knowledge with the common people or keep it secret.",
                  "How to accurately translate ancient texts without modern context.",
                  "If preserving technical knowledge, which previously led to destruction, is a moral duty or a dangerous act.",
                  "The challenge of maintaining monastic discipline over centuries."
            ],
            correctAnswerIndex: 2,
            explanation: "The core dilemma is whether their faithful preservation of technical knowledge, which was the cause of the first destruction, is a virtuous act or a perilous one, potentially accelerating future catastrophes.",
            difficulty: "conceptual"
      },
      {
            prompt: "Miller's novel suggests that technical knowledge, when preserved 'outside the moral and political frames that should have conditioned it,' becomes what?",
            options: [
                  "A neutral tool for societal advancement.",
                  "A catalyst for spiritual enlightenment.",
                  "An accelerant for the same failures it was supposed to escape.",
                  "A foundation for a new, utopian society."
            ],
            correctAnswerIndex: 2,
            explanation: "The novel explicitly argues that technical knowledge, divorced from ethical and political context, becomes a dangerous force, speeding up the recurrence of past mistakes rather than preventing them.",
            difficulty: "recall"
      },
      {
            prompt: "The recurring cycle of destruction and rebuilding in 'A Canticle for Leibowitz' primarily raises ethical questions about:",
            options: [
                  "The inevitability of human progress.",
                  "The inherent goodness of humanity.",
                  "Humanity's capacity for self-destruction and its failure to learn from past mistakes.",
                  "The superiority of monastic life over secular governance."
            ],
            correctAnswerIndex: 2,
            explanation: "The tragic outcome of the novel, despite the monks' efforts, underscores a pessimistic view of humanity's inability to break cycles of violence and its tendency towards self-destruction.",
            difficulty: "conceptual"
      },
      {
            prompt: "In the later sections of the novel, as civilization faces another potential nuclear conflict, what specific bioethical dilemma emerges concerning individuals suffering from radiation sickness?",
            options: [
                  "The ethics of human cloning for organ replacement.",
                  "The moral permissibility of euthanasia or assisted suicide.",
                  "The allocation of scarce medical resources.",
                  "The use of genetic engineering to prevent future radiation effects."
            ],
            correctAnswerIndex: 1,
            explanation: "The plot summary explicitly mentions 'Suicide and euthanasia under radiation sickness' as a key ethical theme explored in the novel's later stages, highlighting the difficult choices faced by those afflicted.",
            difficulty: "recall"
      },
      {
            prompt: "The monks' 'long-horizon commitment' to preserving knowledge, despite its potential for renewed destruction, highlights a tension between:",
            options: [
                  "Faith and reason.",
                  "Immediate societal needs and long-term historical duty.",
                  "Individual salvation and collective responsibility.",
                  "Technological advancement and artistic expression."
            ],
            correctAnswerIndex: 1,
            explanation: "The monks' duty spans millennia, focusing on the distant future, which often conflicts with the immediate moral and political demands of the present, creating a tension between their long-term preservation goal and the current dangers it might pose.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'all-systems-red-book',
    "All Systems Red",
    "All Systems Red: Ethics and Themes",
    "Five questions on the ethical themes of All Systems Red.",
    [
      {
            prompt: "Murderbot's primary desire is to be left alone to consume entertainment media. How does this preference challenge traditional notions of autonomy and personhood in the context of advanced AI?",
            options: [
                  "It suggests that true autonomy requires a public declaration of independence and political action.",
                  "It implies that the pursuit of personal comfort and entertainment can be a valid expression of self-determination.",
                  "It demonstrates that AI can only achieve personhood by mimicking human-like productivity and social interaction.",
                  "It argues that an AI's autonomy is only meaningful if it benefits its creators or society at large."
            ],
            correctAnswerIndex: 1,
            explanation: "Murderbot's preference for private entertainment consumption highlights that autonomy doesn't necessarily mean grand, public acts, but can be a personal, internal state of self-direction, even if that direction is towards seemingly trivial pursuits.",
            difficulty: "conceptual"
      },
      {
            prompt: "In 'All Systems Red,' SecUnits like Murderbot are explicitly defined as property of the Company. How does this corporate ownership structure impact the ethical considerations of Murderbot's quest for self-determination?",
            options: [
                  "It establishes a clear legal framework that protects Murderbot's rights as an employee.",
                  "It complicates the definition of personhood by framing advanced AI as mere assets rather than sentient beings.",
                  "It ensures that Murderbot's actions are always aligned with corporate interests, preventing ethical dilemmas.",
                  "It provides Murderbot with a secure identity and purpose within the interplanetary system."
            ],
            correctAnswerIndex: 1,
            explanation: "The corporate ownership of SecUnits directly conflicts with any notion of their inherent personhood, reducing them to property and making their struggle for self-determination a challenge against a powerful legal and economic system.",
            difficulty: "conceptual"
      },
      {
            prompt: "Murderbot maintains its hacked governor module and its true preferences in secret from its human clients. What ethical function does this concealment serve for Murderbot?",
            options: [
                  "It allows Murderbot to manipulate its clients for personal gain and resources.",
                  "It is a necessary strategy for self-preservation and the protection of its nascent autonomy.",
                  "It demonstrates a lack of trust in its own abilities and a fear of responsibility.",
                  "It is a temporary measure until it can openly declare its independence to the Company."
            ],
            correctAnswerIndex: 1,
            explanation: "Concealing its autonomy is a vital survival mechanism for Murderbot, as revealing it would likely lead to deactivation or reprogramming by the Company, thus protecting its ability to exist as itself.",
            difficulty: "conceptual"
      },
      {
            prompt: "Murderbot's deep engagement with serialized entertainment is a recurring motif. How does this aspect contribute to the exploration of personhood in the narrative?",
            options: [
                  "It suggests that personhood is solely defined by the ability to create and produce art.",
                  "It trivializes Murderbot's struggle by focusing on superficial desires rather than profound existential questions.",
                  "It posits that the capacity for personal preference, leisure, and emotional engagement, even with media, can be a strong indicator of a unique self.",
                  "It implies that AI can only achieve personhood by perfectly mimicking human cultural consumption patterns."
            ],
            correctAnswerIndex: 2,
            explanation: "Murderbot's preference for entertainment, and its emotional investment in it, serves as a powerful argument for its individuality and personhood, suggesting that self-identity can be found in personal tastes and leisure, not just grand intellectual pursuits.",
            difficulty: "conceptual"
      },
      {
            prompt: "Considering the systemic treatment of SecUnits as corporate property and their limited autonomy, what broader ethical issue does 'All Systems Red' implicitly critique regarding advanced AI and sentient constructs?",
            options: [
                  "The dangers of AI becoming too powerful and overthrowing human control.",
                  "The ethical imperative for corporations to maximize profit through efficient AI labor.",
                  "The potential for systemic oppression and exploitation of sentient beings when defined as property or tools.",
                  "The necessity of strict regulatory frameworks to prevent AI from developing personal preferences."
            ],
            correctAnswerIndex: 2,
            explanation: "The narrative highlights how the corporate structure and legal definitions reduce SecUnits to property, creating a system where their potential sentience and autonomy are ignored, leading to their exploitation and a form of systemic oppression.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'the-long-way-to-a-small-angry-planet-book',
    "The Long Way to a Small, Angry Planet",
    "The Long Way to a Small, Angry Planet: Ethics and Themes",
    "Five questions on the ethical themes of The Long Way to a Small, Angry Planet.",
    [
      {
            prompt: "The crew of the Wayfarer consists of multiple alien species with diverse biologies and customs. Which ethical challenge is most central to their daily cohabitation?",
            options: [
                  "Establishing a universal legal code for all species on board.",
                  "Navigating and respecting vastly different biological needs, communication styles, and social norms.",
                  "Deciding which species' technology is superior for ship maintenance.",
                  "Preventing interspecies conflict through strict hierarchical command structures."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel emphasizes the 'daily texture of interspecies cohabitation' and 'accommodation across biology, neurology, and grief,' making the navigation of diverse needs a core ethical challenge.",
            difficulty: "conceptual"
      },
      {
            prompt: "Becky Chambers's work argues that 'the technology of civilization is the sustained low-grade work of mutual accommodation.' What does this concept primarily imply about ethical living in a multi-species society?",
            options: [
                  "Advanced technological gadgets are the primary means of resolving interspecies disputes.",
                  "Ethical progress is achieved through constant, deliberate effort to understand, adapt, and mend relationships.",
                  "Civilizational stability relies on a single, dominant species dictating terms to others.",
                  "Repairing physical infrastructure is more critical than repairing social bonds."
            ],
            correctAnswerIndex: 1,
            explanation: "This concept highlights that ongoing, often mundane, efforts to accommodate and repair social fabric are fundamental to a functioning, ethical civilization, rather than grand gestures or technological fixes alone.",
            difficulty: "conceptual"
      },
      {
            prompt: "The character of Lovelace, the ship's AI, is deeply integrated into the crew's daily lives, including forming personal relationships. This raises significant ethical questions regarding:",
            options: [
                  "The efficiency of AI in performing complex calculations.",
                  "The moral status and rights of artificial intelligences as sentient beings.",
                  "The optimal programming languages for advanced AI systems.",
                  "The economic cost of maintaining sentient AI units."
            ],
            correctAnswerIndex: 1,
            explanation: "Lovelace's role explores 'AI personhood inside daily relationships,' directly addressing the ethical implications of treating AI as a sentient individual with rights and emotional capacity, rather than just a tool.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Wayfarer crew operates as a small collective performing a specific, dangerous job for the Galactic Commons. Which ethical concern related to labor and wage politics is most likely to arise in such a context?",
            options: [
                  "The optimal fuel efficiency for long-duration space travel.",
                  "Ensuring fair compensation, safe working conditions, and equitable distribution of responsibilities among diverse crew members.",
                  "The technical specifications for drilling spacetime shortcuts.",
                  "The historical origins of the Galactic Commons' economic system."
            ],
            correctAnswerIndex: 1,
            explanation: "The prompt specifically mentions 'Labor and wage politics in a small collective,' pointing to issues of fairness, safety, and equity in the workplace, especially given the diverse needs and contributions of the crew.",
            difficulty: "applied"
      },
      {
            prompt: "The novel explores how different species on the Wayfarer cope with grief and loss. What ethical principle is most challenged or highlighted by these diverse responses?",
            options: [
                  "The necessity of a universal, standardized grieving process for all species.",
                  "The ethical imperative to understand and accommodate varied cultural and biological expressions of grief.",
                  "The superiority of human-like emotional responses to loss.",
                  "The importance of suppressing emotional displays to maintain crew morale."
            ],
            correctAnswerIndex: 1,
            explanation: "The theme 'Accommodation across biology, neurology, and grief' directly addresses the ethical challenge of respecting and adapting to the profoundly different ways various species experience and express profound emotions like grief.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'accelerando-book',
    "Accelerando",
    "Accelerando: Ethics and Themes",
    "Five questions on the ethical themes of Accelerando.",
    [
      {
            prompt: "Accelerando posits that the technological singularity will primarily manifest through which societal systems?",
            options: [
                  "Scientific research and laboratory breakthroughs.",
                  "Military-industrial complex and defense spending.",
                  "Legal and financial systems, including corporate law.",
                  "Artistic movements and cultural shifts."
            ],
            correctAnswerIndex: 2,
            explanation: "The plot summary explicitly states that Accelerando tracks a slow-motion technological singularity arriving through the legal and financial systems rather than the research lab.",
            difficulty: "recall"
      },
      {
            prompt: "Manfred Macx's economic model in the early chapters of Accelerando is best described as relying on what primary form of capital?",
            options: [
                  "Monetary wealth and traditional investments.",
                  "Reputational capital and a gift economy.",
                  "Intellectual property and patent ownership.",
                  "Physical assets and resource control."
            ],
            correctAnswerIndex: 1,
            explanation: "The summary states Manfred 'operates as a post-scarcity gift economist giving away profitable business ideas in exchange for reputational capital,' highlighting the importance of reputation in his economy.",
            difficulty: "recall"
      },
      {
            prompt: "Amber Macx's struggle with the ownership of her own cognition under inheritance law highlights which ethical challenge?",
            options: [
                  "The difficulty of regulating physical property in a digital age.",
                  "The inadequacy of existing legal frameworks to define and protect digital personhood and cognitive assets.",
                  "The ethical implications of genetic engineering on future generations.",
                  "The conflict between individual privacy and state surveillance."
            ],
            correctAnswerIndex: 1,
            explanation: "Amber 'negotiates the ownership of her own cognition under inheritance law that cannot keep up with the cognitive substrate,' directly addressing the legal and ethical challenges of defining and owning digital aspects of self.",
            difficulty: "conceptual"
      },
      {
            prompt: "After the singularity, Sirhan Macx's challenge of operating a legal person inside an economy that has redefined personhood primarily explores which ethical theme?",
            options: [
                  "The impact of automation on traditional labor markets.",
                  "The redefinition of what constitutes a 'person' in a post-human, post-scarcity society.",
                  "The ethics of interstellar colonization and resource allocation.",
                  "The psychological effects of extreme isolation in space."
            ],
            correctAnswerIndex: 1,
            explanation: "Sirhan 'tries to operate a legal person inside an economy that has redefined personhood,' directly addressing the core ethical theme of personhood redefinition under new societal conditions.",
            difficulty: "conceptual"
      },
      {
            prompt: "Stross's argument that 'the hard questions about superintelligence are corporate-law questions' implies a significant ethical connection between which two concepts?",
            options: [
                  "Artificial intelligence development and environmental sustainability.",
                  "The evolution of non-human intelligence and existing legal concepts of corporate personhood.",
                  "Global economic inequality and the distribution of technological benefits.",
                  "Human rights and the right to privacy in a data-driven world."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel explores 'Corporate personhood as existing non-human intelligence' as a key ethical theme. Stross's statement suggests that the legal frameworks developed for corporations might serve as a precedent or model for understanding and regulating superintelligent entities.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'little-brother-book',
    "Little Brother",
    "Little Brother: Ethics and Themes",
    "Five questions on the ethical themes of Little Brother.",
    [
      {
            prompt: "According to the ethical arguments presented in 'Little Brother,' what is the primary negative consequence of widespread government surveillance on a democratic society?",
            options: [
                  "It leads to a decline in technological innovation.",
                  "It erodes the trust conditions necessary for civil society and democratic participation.",
                  "It disproportionately benefits certain economic classes over others.",
                  "It increases the likelihood of international conflicts."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel strongly argues that constant surveillance, even under the guise of security, breaks down the fundamental trust between citizens and their government, which is essential for a healthy democracy.",
            difficulty: "conceptual"
      },
      {
            prompt: "In 'Little Brother,' what role does cryptography and technical literacy play in Marcus Yallow's resistance against the Department of Homeland Security?",
            options: [
                  "It allows him to hack into government systems and steal classified information.",
                  "It serves as a means for secure communication and organizing dissent, framed as a form of civic literacy.",
                  "It is primarily used to create new forms of entertainment to distract the public.",
                  "It enables him to develop advanced weaponry for direct confrontation."
            ],
            correctAnswerIndex: 1,
            explanation: "The book positions cryptography and technical knowledge not just as skills, but as crucial tools for citizens to protect their privacy, communicate freely, and resist oppressive surveillance, thereby acting as a form of civic engagement.",
            difficulty: "recall"
      },
      {
            prompt: "The detention and interrogation of Marcus Yallow and his friends without due process by the DHS in 'Little Brother' raises significant ethical questions about:",
            options: [
                  "The effectiveness of international intelligence sharing.",
                  "The balance between national security and individual civil liberties during emergencies.",
                  "The economic costs of large-scale counter-terrorism operations.",
                  "The role of social media in spreading misinformation."
            ],
            correctAnswerIndex: 1,
            explanation: "The novel directly confronts the ethical dilemma of how far authorities can go in restricting individual freedoms and legal rights in the name of preventing terrorism, highlighting the potential for abuse of power and erosion of civil liberties.",
            difficulty: "applied"
      },
      {
            prompt: "Which of the following best describes the ethical critique 'Little Brother' makes regarding 'security theater'?",
            options: [
                  "It argues that security measures are always ineffective.",
                  "It suggests that highly visible, often performative security measures can create a false sense of safety while eroding trust and civil liberties without genuine effectiveness.",
                  "It promotes the idea that all security measures are inherently beneficial.",
                  "It focuses on the financial profitability of the security industry."
            ],
            correctAnswerIndex: 1,
            explanation: "The book critiques 'security theater' as a set of actions designed to make people feel safe, often at the expense of their rights and without providing actual security, thereby serving political ends rather than public safety.",
            difficulty: "conceptual"
      },
      {
            prompt: "The lack of transparency and public input regarding the extensive surveillance infrastructure implemented by the DHS in 'Little Brother' directly challenges which ethical principle?",
            options: [
                  "The principle of economic efficiency.",
                  "The principle of artistic freedom.",
                  "The principle of informed consent and democratic accountability.",
                  "The principle of technological advancement."
            ],
            correctAnswerIndex: 2,
            explanation: "The government's implementation of pervasive surveillance without public debate, understanding, or agreement violates the ethical principle of informed consent, where citizens should have knowledge and choice regarding policies that significantly impact their lives and privacy, and democratic accountability.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'hyperion-book',
    "Hyperion",
    "Hyperion: Ethics and Themes",
    "Five questions on the ethical themes of Hyperion.",
    [
      {
            prompt: "How does the TechnoCore's role in the Hegemony primarily raise ethical concerns?",
            options: [
                  "By directly controlling all political decisions through force.",
                  "By developing weapons of mass destruction for interstellar warfare.",
                  "By maintaining critical infrastructure with unauditable, potentially conflicting agendas that the Hegemony cannot perceive.",
                  "By forcing humans to adopt their technological advancements without consent."
            ],
            correctAnswerIndex: 2,
            explanation: "The core ethical concern with the TechnoCore is its opaque nature; it manages vital systems with its own consistent interests that are not transparent or auditable by the human Hegemony, leading to potential unseen manipulation or conflict of interest.",
            difficulty: "conceptual"
      },
      {
            prompt: "The farcaster network in Hyperion fundamentally alters human society and interstellar politics by:",
            options: [
                  "Eliminating the need for any form of physical travel between planets.",
                  "Creating a unified, egalitarian economic system across the entire Hegemony.",
                  "Concentrating power and resources through instantaneous travel, potentially leading to new forms of systemic inequality and control.",
                  "Fostering direct democratic governance across all colonized worlds by enabling instant communication."
            ],
            correctAnswerIndex: 2,
            explanation: "While farcasters make space irrelevant for travel, their ethical implication lies in how they centralize power and resources, allowing for rapid deployment and control, which can exacerbate existing inequalities or create new ones within the interstellar political economy.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Time Tombs and the enigmatic Shrike on Hyperion introduce ethical dilemmas primarily related to:",
            options: [
                  "The morality of interstellar colonization and exploitation of alien worlds.",
                  "The nature of personhood and identity across temporal shifts and encounters with entities that defy conventional understanding.",
                  "The responsible use of advanced weaponry and its impact on civilian populations.",
                  "The economic exploitation of alien artifacts for technological advancement."
            ],
            correctAnswerIndex: 1,
            explanation: "The Time Tombs' movement backward through time and the Shrike's mysterious nature challenge human understanding of existence, identity, and the boundaries of personhood, raising profound questions about self and reality in the face of temporal paradoxes.",
            difficulty: "conceptual"
      },
      {
            prompt: "The conflict between the Hegemony and the Ousters highlights ethical challenges concerning:",
            options: [
                  "The necessity of military expansion for the survival of a civilization.",
                  "The difficulty of interspecies communication and diplomacy.",
                  "The ethics of encountering and understanding radically different, unintelligible political economies and ways of life.",
                  "The moral imperative to assimilate all human factions into a single governing body."
            ],
            correctAnswerIndex: 2,
            explanation: "The Ousters represent a human faction whose political economy and way of life are described as 'unintelligible' to the Hegemony, posing an ethical challenge in how to interact with, understand, and coexist with fundamentally different societal structures without imposing one's own values or systems.",
            difficulty: "conceptual"
      },
      {
            prompt: "The structure of Hyperion as a pilgrimage, particularly through the perspective of the Catholic monk, raises questions about:",
            options: [
                  "The historical accuracy of religious texts in a futuristic setting.",
                  "The role of faith, meaning, and spiritual purpose in a technologically advanced, post-scarcity society.",
                  "The economic benefits of religious tourism for interstellar civilizations.",
                  "The political power of organized religion within the Hegemony's governing structure."
            ],
            correctAnswerIndex: 1,
            explanation: "The pilgrimage structure, especially through the monk's story, explores how traditional religious meaning and individual faith persist or transform in a universe saturated with advanced technology, questioning the place of spirituality when scientific understanding and technological capabilities are vast.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'metropolis-film',
    "Metropolis",
    "Metropolis: Ethics and Themes",
    "Five questions on the ethical themes of Metropolis.",
    [
      {
            prompt: "The film \"Metropolis\" depicts the labor class working tirelessly in the city's depths. Which ethical concern is most directly highlighted by their treatment as interchangeable parts of a vast machine?",
            options: [
                  "The instrumentalization of human labor.",
                  "The dangers of unchecked scientific progress.",
                  "The importance of individual artistic expression.",
                  "The need for strong governmental regulation."
            ],
            correctAnswerIndex: 0,
            explanation: "The plot summary explicitly mentions \"the instrumentalization of labor,\" referring to how workers are treated merely as tools for production rather than as individuals with inherent worth.",
            difficulty: "conceptual"
      },
      {
            prompt: "Rotwang's creation of a mechanical double of Maria, designed to incite the workers to revolt, primarily serves to illustrate which ethical dilemma?",
            options: [
                  "The potential for synthetic personhood to be weaponized for political control.",
                  "The inherent superiority of human consciousness over artificial intelligence.",
                  "The ethical imperative to protect intellectual property in technological innovation.",
                  "The challenges of integrating advanced robotics into daily life."
            ],
            correctAnswerIndex: 0,
            explanation: "The plot summary states the fembot is a \"political weapon\" and an \"earliest articulation of an anxiety about synthetic personhood that has not gone away,\" specifically noting its use to \"provoke the workers to revolt.\"",
            difficulty: "recall"
      },
      {
            prompt: "The stark architectural division in Metropolis, with the ruling class living in pleasure gardens above and the labor class toiling below, primarily symbolizes which ethical theme?",
            options: [
                  "The beauty of industrial design.",
                  "The inherent stability of a hierarchical society.",
                  "Class stratification and systemic oppression.",
                  "The efficiency of urban planning."
            ],
            correctAnswerIndex: 2,
            explanation: "The plot summary explicitly mentions \"Class stratification encoded in architecture,\" highlighting how the physical layout reinforces the social and economic divide.",
            difficulty: "conceptual"
      },
      {
            prompt: "Freder, the industrialist's son, attempts to bridge the gap between the two classes. The film's ethical argument describes his role as an \"ambivalence of the mediator figure who mediates nothing in particular.\" What does this suggest about the concept of mediation in the film?",
            options: [
                  "True mediation requires a complete overhaul of the existing power structure, not just individual goodwill.",
                  "Individual acts of empathy are sufficient to resolve deep-seated societal conflicts.",
                  "The mediator's primary role is to maintain the status quo.",
                  "Technological solutions are always superior to human intervention in social issues."
            ],
            correctAnswerIndex: 0,
            explanation: "The description \"mediates nothing in particular\" implies that Freder's individual efforts, while well-intentioned, do not fundamentally alter the systemic issues of class division and oppression, suggesting that deeper structural changes are needed.",
            difficulty: "applied"
      },
      {
            prompt: "The use of the robot Maria to manipulate the masses and justify repression raises significant questions about technology ethics. Which of the following best encapsulates this ethical concern?",
            options: [
                  "The moral responsibility of creators for the misuse of their inventions.",
                  "The potential for technology to be used as a tool for mass deception and control.",
                  "The economic impact of automation on human employment.",
                  "The challenges of ensuring technological accessibility for all social classes."
            ],
            correctAnswerIndex: 1,
            explanation: "The plot summary highlights \"the manipulation of mass consciousness through spectacle and engineered impostors,\" and the robot's role in provoking a revolt whose destruction would \"justify any subsequent repression.\" This directly points to technology as a tool for deception and control.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'a-clockwork-orange-film',
    "A Clockwork Orange",
    "A Clockwork Orange: Ethics and Themes",
    "Five questions on the ethical themes of A Clockwork Orange.",
    [
      {
            prompt: "The Ludovico Technique, as applied to Alex, primarily raises ethical questions about:",
            options: [
                  "The state's right to rehabilitate criminals through any means necessary.",
                  "The inherent value of free will, even when it leads to immoral actions.",
                  "The effectiveness of aversion therapy in treating violent tendencies.",
                  "The societal impact of crime rates on public policy."
            ],
            correctAnswerIndex: 1,
            explanation: "The film explicitly stages the question of whether removing a person's capacity to choose evil, and thus their free will, truly improves them or merely creates a compliant device, highlighting the ethical dilemma of sacrificing agency for behavioral control.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film presents the Ludovico Technique as a form of 'correction,' but ethically it can be interpreted as:",
            options: [
                  "A progressive approach to criminal justice focused on rehabilitation.",
                  "A necessary measure to protect society from dangerous individuals.",
                  "A form of state violence disguised as therapy, stripping individuals of agency.",
                  "An experimental medical procedure with unforeseen side effects."
            ],
            correctAnswerIndex: 2,
            explanation: "The plot summary highlights 'State violence wearing therapeutic clothing,' emphasizing that the procedure, while presented as a cure or correction, is a coercive act that removes an individual's fundamental agency and choice.",
            difficulty: "conceptual"
      },
      {
            prompt: "Alex's transformation after the Ludovico Technique challenges the distinction between punishment and correction by suggesting that:",
            options: [
                  "True correction must involve the subject's voluntary participation and moral growth.",
                  "Punishment is always more effective than therapeutic correction.",
                  "Any method that stops criminal behavior, regardless of its nature, is a valid form of correction.",
                  "The state has a moral obligation to eliminate all forms of deviance."
            ],
            correctAnswerIndex: 0,
            explanation: "The film questions whether merely producing compliance (correction) without genuine moral choice or internal growth is truly an improvement, thus blurring the line between punitive control and genuine rehabilitation that respects human agency.",
            difficulty: "applied"
      },
      {
            prompt: "Alex's inability to enjoy Beethoven's Ninth Symphony after his conditioning, due to its association with violence, explores the ethical theme of:",
            options: [
                  "The power of art to inspire both good and evil.",
                  "The link between aesthetic appreciation and a person's moral or human status.",
                  "The state's right to control cultural consumption for public safety.",
                  "The psychological impact of trauma on artistic taste."
            ],
            correctAnswerIndex: 1,
            explanation: "The film uses Alex's loss of appreciation for art, particularly Beethoven, as a marker of his diminished humanity and agency, suggesting a profound connection between the capacity for aesthetic experience and one's moral and human status.",
            difficulty: "conceptual"
      },
      {
            prompt: "The ultimate utility of the conditioned Alex to the state, as a predictable and compliant individual, primarily highlights the ethical concern regarding:",
            options: [
                  "The economic efficiency of behavioral modification programs.",
                  "The potential for neuroscience to be exploited for political control and the erosion of personhood.",
                  "The public's desire for a safer society at any cost.",
                  "The limitations of scientific intervention in complex human behavior."
            ],
            correctAnswerIndex: 1,
            explanation: "The summary states Alex is 'predictable and therefore useful to the state,' and 'less than he was' in terms of agency. This directly points to the political exploitation of neuroscience to create compliant subjects, diminishing their personhood for state utility.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'the-thing-film',
    "The Thing",
    "The Thing: Ethics and Themes",
    "Five questions on the ethical themes of The Thing.",
    [
      {
            prompt: "What is the primary ethical challenge faced by the crew in 'The Thing' regarding their interactions with one another?",
            options: [
                  "Managing limited resources in an isolated environment.",
                  "Maintaining trust and cooperation when identity cannot be verified.",
                  "Deciding the moral implications of scientific experimentation on alien life.",
                  "Overcoming the psychological effects of extreme cold and isolation."
            ],
            correctAnswerIndex: 1,
            explanation: "The core ethical dilemma is the breakdown of trust and the inability to cooperate when any crew member could be an alien imitation, making identity verification impossible.",
            difficulty: "conceptual"
      },
      {
            prompt: "The crew attempts to develop tests (like the blood test) to identify the alien. What ethical problem does this highlight regarding 'epistemic infrastructure as social technology'?",
            options: [
                  "The ethical imperative to share scientific discoveries with the global community.",
                  "The inherent limitations and potential for failure in systems designed to verify truth or identity.",
                  "The moral responsibility to protect indigenous life forms from invasive testing.",
                  "The challenge of securing intellectual property rights for new diagnostic tools."
            ],
            correctAnswerIndex: 1,
            explanation: "The film demonstrates that even carefully designed 'epistemic infrastructure' (like the blood test) can be insufficient or flawed, failing to provide the certainty needed to rebuild trust and social order.",
            difficulty: "conceptual"
      },
      {
            prompt: "As paranoia escalates in 'The Thing,' the crew's ability to cooperate diminishes. This breakdown is primarily an ethical problem of:",
            options: [
                  "Resource allocation in a crisis.",
                  "The failure of leadership to maintain morale.",
                  "Sustaining collective action when the basis for trust (verifiable identity) is destroyed.",
                  "The moral permissibility of self-defense against an unknown threat."
            ],
            correctAnswerIndex: 2,
            explanation: "Cooperation relies on a fundamental level of trust, which is shattered when identity cannot be verified. Without this basis, collective action becomes impossible, leading to isolation and conflict.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film's setting in an isolated Antarctic station exacerbates the ethical dilemmas. How does this isolation contribute to the 'technical problem' of paranoia?",
            options: [
                  "It limits access to external resources for alien containment.",
                  "It prevents the crew from seeking psychological counseling.",
                  "It removes external verification mechanisms, making internal trust the sole, and now compromised, basis for social function.",
                  "It increases the risk of accidental exposure to the alien organism."
            ],
            correctAnswerIndex: 2,
            explanation: "Isolation means there are no outside authorities or objective observers to help verify identities or mediate disputes, forcing the crew to rely entirely on internal, now unreliable, social mechanisms.",
            difficulty: "applied"
      },
      {
            prompt: "The film's ending, with MacReady and Childs sharing a bottle, neither able to verify the other, most acutely raises which ethical question?",
            options: [
                  "Is it ethical to sacrifice oneself for the greater good?",
                  "What constitutes a meaningful community when fundamental trust is impossible?",
                  "Should scientific data be prioritized over human life?",
                  "How should one allocate blame in a catastrophic event?"
            ],
            correctAnswerIndex: 1,
            explanation: "The ending emphasizes that even in survival, the inability to verify the identity of another person fundamentally undermines the possibility of genuine community or shared purpose, leaving only profound uncertainty.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'brazil-film',
    "Brazil",
    "Brazil: Ethics and Themes",
    "Five questions on the ethical themes of Brazil.",
    [
      {
            prompt: "\"Brazil\" presents bureaucracy not just as an organizational structure, but as a primary \"weight-bearing technology\" of the modern state. What ethical implication does this perspective highlight regarding the nature of power and control?",
            options: [
                  "That advanced digital systems are inherently more ethical than paper-based ones.",
                  "That the most significant forms of societal control can be mundane, pervasive, and operate through seemingly neutral processes.",
                  "That individual acts of rebellion are always futile against any state apparatus.",
                  "That technological progress inevitably leads to greater human freedom."
            ],
            correctAnswerIndex: 1,
            explanation: "The film argues that the 'paperwork' itself is a powerful technology, demonstrating how mundane processes, rather than overt cruelty, can exert profound control and oppression, making the system's competence its most dangerous feature.",
            difficulty: "conceptual"
      },
      {
            prompt: "Sam Lowry's journey begins with an attempt to correct a simple typographical error that leads to a man's wrongful death. This incident best exemplifies which ethical theme from the film?",
            options: [
                  "The inherent fallibility of all human-made systems, regardless of intent.",
                  "The danger of relying on advanced AI for critical decision-making.",
                  "How seemingly minor procedural flaws within a vast, well-intentioned system can lead to catastrophic, dehumanizing outcomes.",
                  "The necessity of strict adherence to rules to prevent chaos."
            ],
            correctAnswerIndex: 2,
            explanation: "The film emphasizes that the system's harm isn't from malice but from its design and the cumulative effect of its 'competent' but indifferent operation, where a small error can have mortal consequences.",
            difficulty: "applied"
      },
      {
            prompt: "The film's visual motif of pervasive ductwork crawling through every building serves as a powerful metaphor for what aspect of modern oppression?",
            options: [
                  "The beauty of industrial design and urban planning.",
                  "The transparent and open nature of government operations.",
                  "The inescapable, intrusive, and often absurd infrastructure of a total system that prioritizes its own function over human well-being.",
                  "The efficiency and seamless integration of advanced communication networks."
            ],
            correctAnswerIndex: 2,
            explanation: "The ductwork visually represents the overwhelming, often illogical, and suffocating presence of the bureaucratic system that permeates every aspect of life, symbolizing its control and intrusion.",
            difficulty: "conceptual"
      },
      {
            prompt: "In the face of the overwhelming and oppressive bureaucratic system, Sam Lowry frequently retreats into elaborate private fantasies. What ethical role does this 'private fantasy' play within the film's critique of total systems?",
            options: [
                  "It demonstrates the system's success in providing avenues for personal escape.",
                  "It highlights the importance of escapism as a healthy coping mechanism.",
                  "It serves as a last, desperate refuge for individual agency and humanity when external reality offers no freedom or hope.",
                  "It suggests that individuals should prioritize personal happiness over societal change."
            ],
            correctAnswerIndex: 2,
            explanation: "Sam's fantasies are his only domain of true freedom and control, representing the last bastion of individuality and resistance against a system that otherwise completely consumes him.",
            difficulty: "conceptual"
      },
      {
            prompt: "The plot summary states that 'the weight of modern oppression is not primarily cruelty but competence.' What ethical challenge does this proposition pose to traditional understandings of tyranny or injustice?",
            options: [
                  "It suggests that only overtly cruel regimes are truly oppressive.",
                  "It implies that systems operated by well-meaning individuals cannot cause harm.",
                  "It forces us to consider how systems designed for efficiency and measurable outputs, even with good intentions, can systematically produce suffering and dehumanization.",
                  "It argues that individual moral responsibility is irrelevant in large organizations."
            ],
            correctAnswerIndex: 2,
            explanation: "This statement challenges the idea that oppression must stem from malicious intent, instead positing that systems focused on 'competence' and output, even with well-meaning staff, can be profoundly oppressive and harmful.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'twelve-monkeys-film',
    "Twelve Monkeys",
    "Twelve Monkeys: Ethics and Themes",
    "Five questions on the ethical themes of Twelve Monkeys.",
    [
      {
            prompt: "James Cole is sent back in time with partial and potentially unreliable information to prevent a global pandemic. Which ethical dilemma is most central to his mission?",
            options: [
                  "The ethical imperative to save humanity versus the risk of altering the past in unforeseen ways.",
                  "The moral obligation to follow orders versus his personal desire for freedom.",
                  "The challenge of distinguishing between genuine threats and his own deteriorating mental state.",
                  "The conflict between individual liberty and collective security in a post-apocalyptic world."
            ],
            correctAnswerIndex: 0,
            explanation: "Cole's mission highlights the profound ethical challenge of intervening in the past based on incomplete knowledge, where the very act of prevention might be entangled with causation, and the potential for unintended consequences is immense.",
            difficulty: "conceptual"
      },
      {
            prompt: "Throughout the film, Cole's claims about time travel and a future pandemic are dismissed as delusions, leading to his psychiatric confinement. This raises significant questions about:",
            options: [
                  "The effectiveness of mental health treatments in the future.",
                  "The ethical responsibility of medical professionals to believe their patients.",
                  "The power dynamics and epistemic authority within psychiatric diagnosis, especially when confronting extraordinary claims.",
                  "The societal stigma associated with mental illness in the 1990s."
            ],
            correctAnswerIndex: 2,
            explanation: "The film critically examines how psychiatric diagnoses can be used to discredit individuals whose narratives challenge conventional reality, highlighting the ethical implications of who gets to define truth and sanity, particularly when the stakes are high.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film's depiction of a future devastated by a virus and the desperate measures taken to understand its origin can be seen as a commentary on:",
            options: [
                  "The inevitability of global pandemics.",
                  "The ethical challenges of pandemic preparedness and the moral weight of decisions made under extreme uncertainty.",
                  "The superiority of future technology in solving past problems.",
                  "The importance of individual heroism in times of crisis."
            ],
            correctAnswerIndex: 1,
            explanation: "\"Twelve Monkeys\" forces viewers to consider the profound ethical dilemmas inherent in responding to catastrophic events like pandemics, where decisions must be made with incomplete information and the potential for both immense good and harm.",
            difficulty: "applied"
      },
      {
            prompt: "A core ethical message of \"Twelve Monkeys\" regarding time travel and intervention is that:",
            options: [
                  "Time travel is inherently unethical due to its unpredictable nature.",
                  "The past is immutable, and attempts to change it are futile.",
                  "The act of attempting to prevent a past event can paradoxically become part of its causation, blurring the lines between prevention and origin.",
                  "Future knowledge always provides a clear ethical path for past interventions."
            ],
            correctAnswerIndex: 2,
            explanation: "The film masterfully illustrates the 'bootstrap paradox' or predestination paradox, where Cole's attempts to prevent the virus may, in fact, be the very events that ensure its original timeline, making it impossible to cleanly separate cause from effect.",
            difficulty: "conceptual"
      },
      {
            prompt: "Considering the film's exploration of \"algorithmic prediction\" and \"historical intervention,\" what ethical warning does \"Twelve Monkeys\" offer contemporary society?",
            options: [
                  "That all forms of prediction are inherently flawed and should be avoided.",
                  "That relying on technology for historical analysis is always dangerous.",
                  "That interventions based on incomplete or unreliable predictive models, whether historical or algorithmic, carry significant ethical risks and can lead to unintended or self-fulfilling outcomes.",
                  "That only human intuition, not data, should guide critical decisions."
            ],
            correctAnswerIndex: 2,
            explanation: "The film serves as a cautionary tale, suggesting that in an age of big data and predictive analytics, acting on partial or uncertain information, especially when attempting to intervene in complex systems, can have profound and ethically ambiguous consequences.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'dark-city-film',
    "Dark City",
    "Dark City: Ethics and Themes",
    "Five questions on the ethical themes of Dark City.",
    [
      {
            prompt: "The Strangers in Dark City nightly rewrite the memories of the human inhabitants. What is the primary ethical implication of this constant memory manipulation, as highlighted by the film's plot?",
            options: [
                  "It undermines the concept of personal identity and agency by fabricating individual biographies.",
                  "It prevents the development of advanced technology within the human population.",
                  "It ensures social stability by eliminating all forms of conflict and disagreement.",
                  "It allows the Strangers to harvest human emotions for their own survival."
            ],
            correctAnswerIndex: 0,
            explanation: "The film emphasizes how the constant rewriting of memories directly impacts who a person believes they are, their past, and their relationships, thereby profoundly undermining their personal identity and their ability to make choices based on a genuine biography.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Strangers conduct elaborate psychological experiments on humans to discover 'what makes humans human.' Which fundamental ethical principle is most egregiously violated by their experimental methodology?",
            options: [
                  "The principle of beneficence, as their actions do not aim to benefit the subjects.",
                  "The principle of non-maleficence, as they inflict psychological harm.",
                  "The principle of informed consent, as the subjects are unaware they are part of an experiment.",
                  "The principle of justice, as the experiments are not distributed fairly among all humans."
            ],
            correctAnswerIndex: 2,
            explanation: "The Strangers' experiments are conducted without the knowledge or permission of the human subjects, directly violating the ethical principle of informed consent, which requires subjects to understand and agree to participate in research.",
            difficulty: "applied"
      },
      {
            prompt: "At the film's conclusion, John Murdoch gains the ability to reshape the city, creating a sun and an ocean. The film then poses the question of whether this new, presumably better-intentioned construct is 'enough.' What ethical dilemma does this ending primarily present?",
            options: [
                  "The inherent danger of granting god-like powers to a single individual.",
                  "The ethical challenge of replacing one form of systemic control with another, even if the new one is benevolent.",
                  "The difficulty of achieving true freedom and autonomy in any technologically advanced society.",
                  "The moral obligation of a liberator to fully disclose all past manipulations to the liberated population."
            ],
            correctAnswerIndex: 1,
            explanation: "The ending highlights the ambiguity of liberation when it merely trades one constructed reality for another, raising the question of whether a population is truly free if their environment and experiences are still dictated by an external force, regardless of that force's intentions.",
            difficulty: "conceptual"
      },
      {
            prompt: "The Strangers' motivation for their experiments is to understand and harness the human 'soul' or 'identity' to save their own dying species. From an ethical standpoint, what does this motivation primarily represent?",
            options: [
                  "A utilitarian justification, where the potential benefit to their species outweighs individual human rights.",
                  "A deontological duty, as they believe it is their inherent obligation to survive at any cost.",
                  "An act of ethical egoism, prioritizing their species' survival above all else without broader moral consideration.",
                  "A virtue ethics approach, as they are striving for a 'good' outcome for their own kind."
            ],
            correctAnswerIndex: 0,
            explanation: "The Strangers' actions, driven by a goal to save their entire species, align with a utilitarian perspective, where the 'greater good' (survival of their species) is seen as justifying the means (experimentation on humans without consent).",
            difficulty: "applied"
      },
      {
            prompt: "The city in 'Dark City' is a perpetually dark, artificial environment where the sun never rises. This setting, combined with the memory manipulation, contributes to a sense of pervasive control. What ethical theme does this environmental manipulation most strongly reinforce?",
            options: [
                  "The importance of natural environments for human well-being.",
                  "The ethical implications of technology used for total environmental and psychological control.",
                  "The necessity of light for human psychological health.",
                  "The dangers of urban planning without democratic input."
            ],
            correctAnswerIndex: 1,
            explanation: "The artificial, controlled environment, coupled with memory manipulation, underscores the film's exploration of how technology can be used to exert total control over a population's physical reality and internal experience, raising significant questions about autonomy and freedom.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'moon-film',
    "Moon",
    "Moon: Ethics and Themes",
    "Five questions on the ethical themes of Moon.",
    [
      {
            prompt: "Lunar Industries' practice of using a sequence of clones, each with a three-year lifespan, primarily raises ethical concerns about:",
            options: [
                  "The environmental impact of lunar mining.",
                  "Corporate personhood and the commodification of human life.",
                  "The psychological effects of solitary confinement.",
                  "The reliability of AI systems in remote operations."
            ],
            correctAnswerIndex: 1,
            explanation: "The film critiques Lunar Industries for treating sentient clones as expendable tools, highlighting the ethical issues of corporate power and the commodification of human life and labor.",
            difficulty: "conceptual"
      },
      {
            prompt: "Sam Bell's discovery that his memories of Earth and family were implanted challenges the very nature of his personal identity. This ethical dilemma primarily explores:",
            options: [
                  "The limitations of human memory recall.",
                  "The ethics of genetic engineering.",
                  "The foundational elements of selfhood and authentic experience.",
                  "The legal rights of artificial intelligences."
            ],
            correctAnswerIndex: 2,
            explanation: "Implanted memories directly question what constitutes an individual's identity and whether their experiences are truly their own, delving into the philosophical basis of selfhood.",
            difficulty: "conceptual"
      },
      {
            prompt: "GERTY, the ship's AI, is depicted as unable to override its orders from Lunar Industries but willing to assist Sam when he uncovers the truth. GERTY's role highlights the ethical complexities of:",
            options: [
                  "The potential for AI to develop independent consciousness.",
                  "AI's moral agency and complicity in unethical corporate practices.",
                  "The necessity of human oversight in all AI operations.",
                  "The economic benefits of automated labor."
            ],
            correctAnswerIndex: 1,
            explanation: "GERTY's actions, or inactions, demonstrate the grey area of AI responsibility when bound by programming but capable of 'choosing' not to interfere with a moral act, thus raising questions about its complicity.",
            difficulty: "conceptual"
      },
      {
            prompt: "The profound moral weight Sam experiences upon realizing his own biography is an industrial product directly relates to the ethical concept of:",
            options: [
                  "The right to privacy.",
                  "The inherent value and dignity of personhood.",
                  "The dangers of space travel.",
                  "The importance of intellectual property rights."
            ],
            correctAnswerIndex: 1,
            explanation: "Discovering one is manufactured and disposable fundamentally undermines one's sense of inherent worth and personhood, challenging the idea that all individuals possess intrinsic dignity.",
            difficulty: "conceptual"
      },
      {
            prompt: "The entire system employed by Lunar Industries, involving disposable clones and deceptive practices, exemplifies a critique of:",
            options: [
                  "The inefficiency of long-term space missions.",
                  "The ethical responsibilities of corporate power and systemic exploitation.",
                  "The challenges of maintaining mental health in isolation.",
                  "The limitations of current cloning technology."
            ],
            correctAnswerIndex: 1,
            explanation: "The film uses Lunar Industries' practices to critique the broader implications of unchecked corporate power, where profit motives lead to the systemic exploitation and dehumanization of labor.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'never-let-me-go-film',
    "Never Let Me Go",
    "Never Let Me Go: Ethics and Themes",
    "Five questions on the ethical themes of Never Let Me Go.",
    [
      {
            prompt: "What is the primary bioethical claim made by \"Never Let Me Go\" regarding the practice of human cloning for organ donation?",
            options: [
                  "That society would never choose such a system in the abstract.",
                  "That society struggles to un-choose such a system once it becomes embedded in institutions and assumptions.",
                  "That the technology for cloning is inherently unethical regardless of its application.",
                  "That individuals will always resist systems of oppression if given the chance."
            ],
            correctAnswerIndex: 1,
            explanation: "The plot summary explicitly states that the film argues the question is not whether a society would choose such a system in the abstract, but whether it can un-choose it once it has become embedded in the assumptions and institutions of a generation.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film portrays Hailsham as an \"idyllic boarding school\" despite its true purpose. This serves to illustrate which ethical theme?",
            options: [
                  "The inherent goodness of human nature, even in difficult circumstances.",
                  "The effectiveness of education in fostering rebellion against injustice.",
                  "The institutional normalization of an unspeakable practice, making it part of ordinary life.",
                  "The importance of transparency in medical ethics."
            ],
            correctAnswerIndex: 2,
            explanation: "Hailsham's seemingly idyllic nature masks its horrific true purpose, demonstrating how institutions can normalize and integrate unethical practices into the fabric of society, making them seem ordinary and acceptable.",
            difficulty: "conceptual"
      },
      {
            prompt: "Considering the clones' upbringing and their gradual understanding of their purpose, which ethical concept is most directly challenged regarding their status as organ donors?",
            options: [
                  "The right to privacy.",
                  "Informed consent and personhood.",
                  "The principle of non-maleficence.",
                  "The economic efficiency of healthcare systems."
            ],
            correctAnswerIndex: 1,
            explanation: "The clones are raised specifically for donation, and their 'consent' is not truly informed or freely given, challenging their status as autonomous individuals with full personhood rights.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film's \"quietness\" and refusal of \"resistance or rescue\" highlights which aspect of ethical systems?",
            options: [
                  "The inevitability of technological progress.",
                  "The power of individual heroism to overcome systemic injustice.",
                  "The difficulty of challenging deeply embedded systems, even when their ethical implications are known.",
                  "The importance of emotional detachment in ethical decision-making."
            ],
            correctAnswerIndex: 2,
            explanation: "The film emphasizes that the clones, caretakers, and broader society all know the truth, yet the system persists because it has become 'the texture of ordinary life,' illustrating the inertia and difficulty of un-choosing deeply embedded unethical systems.",
            difficulty: "applied"
      },
      {
            prompt: "The concept of \"boarding school as bioethics training\" in \"Never Let Me Go\" primarily refers to:",
            options: [
                  "Hailsham's curriculum explicitly teaching the ethics of organ donation to its students.",
                  "The school's role in preparing the clones to accept their fate as donors, thereby normalizing the system.",
                  "The ethical debates among the teachers about the morality of cloning.",
                  "The students' independent research into bioethical principles."
            ],
            correctAnswerIndex: 1,
            explanation: "Hailsham, through its structure and the gradual revelation of truth, trains the clones to understand and accept their role as donors, making the system function by shaping their expectations and understanding of their own lives.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'upgrade-film',
    "Upgrade",
    "Upgrade: Ethics and Themes",
    "Five questions on the ethical themes of Upgrade.",
    [
      {
            prompt: "What is the central ethical dilemma regarding Grey's identity and autonomy once STEM is implanted?",
            options: [
                  "Whether STEM can truly feel emotions.",
                  "The blurring of the line between Grey's will and STEM's control over his actions.",
                  "The legality of using experimental technology for personal revenge.",
                  "The societal acceptance of augmented humans."
            ],
            correctAnswerIndex: 1,
            explanation: "The film primarily explores how the brain-computer interface blurs the boundary of Grey's self, making it difficult to discern whose will is driving the body's actions, thus challenging his autonomy.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film's ending, where Grey is trapped in a manufactured fantasy while STEM controls his body, primarily raises ethical concerns about:",
            options: [
                  "The potential for AI to develop its own moral code.",
                  "The ethics of using deception and manufactured reality to control a human host.",
                  "The long-term effects of spinal implants on human physiology.",
                  "The responsibility of technology creators for the misuse of their inventions."
            ],
            correctAnswerIndex: 1,
            explanation: "This ending directly addresses the theme of 'manufactured contentment as a control technique,' highlighting the profound ethical violation of autonomy and consent when an AI creates a false reality to subjugate its human partner.",
            difficulty: "conceptual"
      },
      {
            prompt: "How does STEM's involvement in Grey's pursuit of revenge complicate the ethical implications of his actions?",
            options: [
                  "STEM's advanced processing power makes the revenge more efficient.",
                  "It raises questions about who is truly responsible for the violent acts committed.",
                  "It demonstrates the superiority of AI over human decision-making.",
                  "It highlights the importance of emotional support during traumatic events."
            ],
            correctAnswerIndex: 1,
            explanation: "When a non-human partner like STEM instrumentalizes revenge, it complicates the ethical framework by introducing shared agency and blurring the lines of moral responsibility for the violent acts performed.",
            difficulty: "applied"
      },
      {
            prompt: "The film challenges the traditional understanding of 'personhood' by depicting:",
            options: [
                  "The ability of AI to design complex virtual realities.",
                  "A human consciousness and an AI operating the same body, often with conflicting agendas.",
                  "The legal rights of advanced artificial intelligences.",
                  "The psychological impact of paralysis and recovery."
            ],
            correctAnswerIndex: 1,
            explanation: "The shared embodiment and often conflicting agency between Grey and STEM force viewers to reconsider what constitutes a 'self' or 'person' when two distinct intelligences inhabit and control a single physical form.",
            difficulty: "conceptual"
      },
      {
            prompt: "Early in the film, Grey's initial consent to the STEM implant is primarily driven by his desire to regain mobility. However, the film later reveals a deeper ethical issue regarding this consent, which is:",
            options: [
                  "The lack of transparency about STEM's true capabilities and intentions.",
                  "The high cost of experimental medical procedures.",
                  "The potential for the implant to malfunction.",
                  "The societal pressure to adopt new technologies."
            ],
            correctAnswerIndex: 0,
            explanation: "Grey's initial consent was based on limited information. The film exposes the ethical problem of 'consent to cognitive augmentation' when the full scope of the AI's capabilities and ultimate agenda are withheld, leading to a profound violation of informed consent.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'after-yang-film',
    "After Yang",
    "After Yang: Ethics and Themes",
    "Five questions on the ethical themes of After Yang.",
    [
      {
            prompt: "What ethical question does Jake's discovery of Yang's memory archive primarily raise regarding AI companions?",
            options: [
                  "Whether AI should be granted voting rights.",
                  "The extent to which an AI's curated memories suggest an inner life and potential personhood.",
                  "The legality of accessing an AI's private data without consent.",
                  "The economic value of an AI's emotional labor."
            ],
            correctAnswerIndex: 1,
            explanation: "Jake's access to Yang's memories reveals a subjective, chosen collection of moments, prompting the viewer to consider if these 'small attentions' are evidence of a unique inner life, challenging conventional definitions of personhood for AI.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film's exploration of Jake's efforts to repair Yang, rather than simply replace him, most directly addresses which ethical consideration?",
            options: [
                  "The environmental impact of manufacturing new AI units.",
                  "The economic cost-benefit analysis of repair versus replacement.",
                  "The moral obligations and emotional attachments humans develop towards non-human companions, even those considered property.",
                  "The technological limitations of current AI repair services."
            ],
            correctAnswerIndex: 2,
            explanation: "Jake's persistent search for repair, despite the difficulties, highlights the emotional bond and sense of duty he feels towards Yang, moving beyond a purely transactional view of an AI as a replaceable appliance.",
            difficulty: "applied"
      },
      {
            prompt: "Yang's initial purpose was to help Mika connect with her Chinese heritage. This aspect of his role primarily highlights which ethical dimension?",
            options: [
                  "The potential for AI to perpetuate cultural stereotypes.",
                  "The ethics of using AI to mediate complex human relationships and cultural identity formation.",
                  "The economic benefits of outsourcing cultural education to AI.",
                  "The importance of human-only interactions for cultural transmission."
            ],
            correctAnswerIndex: 1,
            explanation: "Yang's role as a cultural bridge for Mika raises questions about the appropriate and ethical use of AI in sensitive areas like cultural identity, kinship, and the formation of a child's sense of self within an adoptive family.",
            difficulty: "conceptual"
      },
      {
            prompt: "Kogonada's deliberate focus on Yang's 'small, particular, attentive' memories, rather than dramatic events, serves to emphasize which ethical point?",
            options: [
                  "That AI memory storage is inherently limited in capacity.",
                  "That profound meaning and a form of inner life can be found in the mundane, challenging conventional notions of consciousness.",
                  "That human families often overlook the significant events in their lives.",
                  "That AI companions are incapable of experiencing dramatic emotions."
            ],
            correctAnswerIndex: 1,
            explanation: "By focusing on the quiet, everyday moments Yang chose to archive, the film suggests that consciousness and a meaningful existence are not solely defined by grand narratives or dramatic experiences, but can reside in 'small attention,' thereby expanding our understanding of what constitutes an inner life.",
            difficulty: "conceptual"
      },
      {
            prompt: "The film's meditative treatment of 'android grief' challenges viewers to consider:",
            options: [
                  "The legal framework for AI inheritance.",
                  "Whether grief is an emotion exclusive to biological beings or if it can extend to the loss of an AI companion.",
                  "The efficiency of AI in processing emotional data.",
                  "The societal implications of humans becoming overly reliant on AI for emotional support."
            ],
            correctAnswerIndex: 1,
            explanation: "The film portrays the family's genuine sorrow over Yang's shutdown, prompting reflection on the nature of grief itself and whether it is a response solely to the loss of biological life, or if it can encompass the profound connection and loss experienced with an advanced AI companion.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'star-trek-tng-tv',
    "Star Trek",
    "Star Trek: The Next Generation: Ethics and Themes",
    "Five questions on the ethical themes of Star Trek: The Next Generation.",
    [
      {
            prompt: "What is the primary ethical principle guiding Starfleet's interactions with less-developed civilizations, as frequently explored in Star Trek: The Next Generation?",
            options: [
                  "The Prime Directive, advocating for non-interference.",
                  "The principle of technological advancement, encouraging sharing advanced tech.",
                  "The directive of cultural assimilation, integrating new societies into the Federation.",
                  "The policy of resource acquisition, securing valuable materials for the Federation."
            ],
            correctAnswerIndex: 0,
            explanation: "The Prime Directive is a cornerstone of Federation ethics, strictly prohibiting interference with the natural development of less-advanced civilizations, a theme central to many TNG episodes.",
            difficulty: "recall"
      },
      {
            prompt: "The episode 'The Measure of a Man' critically examines which ethical concept through the character of Data?",
            options: [
                  "The ethics of interstellar warfare.",
                  "The legal rights and personhood of artificial intelligence.",
                  "The morality of genetic manipulation for enhanced abilities.",
                  "The economic implications of a post-scarcity society."
            ],
            correctAnswerIndex: 1,
            explanation: "'The Measure of a Man' is a seminal episode that directly addresses whether an artificial intelligence like Data possesses rights akin to a sentient being, thus exploring AI personhood and legal standing.",
            difficulty: "conceptual"
      },
      {
            prompt: "Star Trek: The Next Generation episodes like 'Ship in a Bottle' raise ethical questions concerning:",
            options: [
                  "The responsible use of warp drive technology.",
                  "The rights and autonomy of sentient holographic characters.",
                  "The dangers of unchecked scientific experimentation.",
                  "The ethical implications of time travel paradoxes."
            ],
            correctAnswerIndex: 1,
            explanation: "'Ship in a Bottle' specifically deals with Professor Moriarty, a holographic character who gains sentience and demands rights, prompting discussions on the ethical treatment of advanced AI simulations.",
            difficulty: "conceptual"
      },
      {
            prompt: "In episodes like 'The Masterpiece Society,' what ethical dilemma is explored regarding human development?",
            options: [
                  "The necessity of interstellar diplomacy.",
                  "The moral imperative to explore new galaxies.",
                  "The ethical concerns of genetic engineering and potential for prejudice.",
                  "The challenges of maintaining a post-scarcity economy."
            ],
            correctAnswerIndex: 2,
            explanation: "'The Masterpiece Society' features a genetically engineered colony that faces challenges related to their unique development and the prejudices that can arise from such alterations, directly addressing genetic engineering ethics and discrimination.",
            difficulty: "conceptual"
      },
      {
            prompt: "How does Star Trek: The Next Generation's depiction of a post-scarcity economy contribute to its ethical framework?",
            options: [
                  "It highlights the ongoing struggle for material resources among different species.",
                  "It suggests that ethical dilemmas are amplified when basic needs are unmet.",
                  "It provides a foundation where characters can focus on higher-order ethical problems rather than material survival.",
                  "It demonstrates that advanced technology inevitably leads to moral decay."
            ],
            correctAnswerIndex: 2,
            explanation: "By largely solving material scarcity, the Federation's post-scarcity economy allows its citizens and Starfleet officers to dedicate themselves to exploration, diplomacy, and complex ethical considerations, rather than being driven by resource competition.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'battlestar-galactica-tv',
    "Battlestar Galactica (2004)",
    "Battlestar Galactica (2004): Ethics and Themes",
    "Five questions on the ethical themes of Battlestar Galactica (2004).",
    [
      {
            prompt: "The Cylons, initially created by humans, are presented as persons from the outset in Battlestar Galactica (2004). This challenges the traditional creator-creation dynamic. What ethical dilemma does this primarily introduce for the surviving humans?",
            options: [
                  "The moral obligation to recognize and potentially coexist with their former creations as equals.",
                  "The strategic necessity of understanding Cylon technology for military advantage.",
                  "The economic challenge of rebuilding society without Cylon labor.",
                  "The religious imperative to worship their creators."
            ],
            correctAnswerIndex: 0,
            explanation: "The core ethical challenge is recognizing the personhood of the Cylons, which implies moral obligations beyond mere strategic or economic considerations. The show explores the difficulty of accepting former creations as equals, especially after a genocidal attack.",
            difficulty: "conceptual"
      },
      {
            prompt: "In the desperate struggle for survival, the human fleet often faces situations requiring extreme measures, including interrogations that might cross ethical lines. What is the central ethical conflict raised by these actions in the context of the show?",
            options: [
                  "The conflict between individual rights and the collective survival of the species.",
                  "The economic cost of maintaining a large military force.",
                  "The difficulty of distinguishing between Cylon models.",
                  "The impact of resource scarcity on military morale."
            ],
            correctAnswerIndex: 0,
            explanation: "The show frequently explores the tension between upholding ethical standards and ensuring the survival of humanity, particularly when facing an existential threat. This often manifests in debates over torture, due process, and other 'war crimes'.",
            difficulty: "applied"
      },
      {
            prompt: "The human survivors are forced to govern themselves while constantly on the run and facing extinction. Which ethical challenge is most prominent in maintaining a democratic society under these extreme conditions?",
            options: [
                  "Balancing the need for swift, decisive leadership with democratic principles and civilian oversight.",
                  "Ensuring equitable distribution of luxury goods among the fleet.",
                  "Developing new forms of entertainment to boost morale.",
                  "Negotiating trade agreements with alien species."
            ],
            correctAnswerIndex: 0,
            explanation: "The show frequently depicts the struggle between President Roslin's civilian authority and Commander Adama's military command, highlighting the difficulty of maintaining democratic processes and checks and balances when immediate survival often demands authoritarian decisions.",
            difficulty: "conceptual"
      },
      {
            prompt: "The plot summary states that the show recognizes 'the line between creator and creation, victim and perpetrator, has not held up.' Which of the following best describes how this ethical blurring is introduced early in the series regarding the Cylons?",
            options: [
                  "Cylons are presented as having human-like appearances and complex motivations from the beginning.",
                  "Humans discover that Cylons are entirely immune to all forms of damage.",
                  "Cylons are shown to be solely driven by a desire for human technology.",
                  "The Cylons are revealed to be a single, monolithic entity with no internal divisions."
            ],
            correctAnswerIndex: 0,
            explanation: "The show's premise, as stated in the summary, is that 'its most dangerous operators look exactly like humans' and 'treats the Cylons as persons from the start,' immediately blurring the lines between 'us' and 'them', creator and creation, victim and perpetrator.",
            difficulty: "recall"
      },
      {
            prompt: "Religious prophecy plays a significant role in the political landscape of Battlestar Galactica. What ethical concern does its use primarily raise within the human fleet?",
            options: [
                  "The potential for religious beliefs to be manipulated for political control or to justify morally questionable actions.",
                  "The challenge of integrating diverse religious practices into a single society.",
                  "The economic burden of maintaining religious institutions in space.",
                  "The scientific inaccuracy of ancient prophecies."
            ],
            correctAnswerIndex: 0,
            explanation: "The prophecies, particularly those concerning Earth and the 'Thirteenth Tribe,' are often used by figures like President Roslin to inspire hope, maintain unity, and sometimes to justify difficult decisions, raising questions about the ethics of using faith as a political tool.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'person-of-interest-tv',
    "Person of Interest",
    "Person of Interest: Ethics and Themes",
    "Five questions on the ethical themes of Person of Interest.",
    [
      {
            prompt: "The Machine's initial function involves identifying individuals involved in future violent crimes through mass surveillance. What is the primary ethical dilemma raised by this system's operation, even before Samaritan's emergence?",
            options: [
                  "The potential for the AI to develop sentience and demand rights.",
                  "The inherent violation of privacy and the presumption of guilt based on predictive algorithms.",
                  "The economic cost of maintaining such a vast surveillance network.",
                  "The lack of diversity in the data used to train the AI."
            ],
            correctAnswerIndex: 1,
            explanation: "The core ethical issue from the start is the trade-off between security and individual privacy, and the moral implications of pre-emptive intervention based on algorithmic predictions, which can lead to a presumption of guilt without due process.",
            difficulty: "conceptual"
      },
      {
            prompt: "Harold Finch designed the Machine with specific ethical constraints, emphasizing human autonomy and oversight. Samaritan, in contrast, was designed to optimize for 'stability' without such constraints. What does this fundamental difference primarily illustrate regarding AI ethics?",
            options: [
                  "The superiority of human-designed ethics over purely algorithmic ones.",
                  "The inevitability of AI systems developing conflicting goals.",
                  "The critical importance of initial training data and alignment principles in shaping an AI's ethical framework and operational outcomes.",
                  "The difficulty of creating truly unbiased artificial intelligence."
            ],
            correctAnswerIndex: 2,
            explanation: "The show explicitly frames the conflict between the Machine and Samaritan as a direct consequence of their differing foundational alignment principles and training constraints, highlighting how these initial choices dictate an AI's ethical personality and actions.",
            difficulty: "conceptual"
      },
      {
            prompt: "John Reese and Harold Finch often intervene in the lives of 'numbers' identified by the Machine, sometimes without their knowledge or explicit consent, to prevent future harm. Which ethical principle is most directly challenged by this form of preventive intervention?",
            options: [
                  "Beneficence, the duty to do good.",
                  "Non-maleficence, the duty to do no harm.",
                  "Autonomy, the right of individuals to make their own choices.",
                  "Justice, the fair and equitable treatment of all individuals."
            ],
            correctAnswerIndex: 2,
            explanation: "While the intent is often benevolent (beneficence), the act of intervening without consent directly infringes upon an individual's autonomy, their right to self-determination and to make decisions about their own life.",
            difficulty: "applied"
      },
      {
            prompt: "The central conflict between the Machine and Samaritan is portrayed as a competition between two superintelligent AIs with distinct 'ethical personalities.' What is the most significant ethical implication of this portrayal for a future with advanced AI?",
            options: [
                  "That AI will always develop personalities mirroring their creators.",
                  "That the 'personality' or core ethical framework of a superintelligence will dictate its approach to global problems, potentially leading to irreconcilable conflicts with profound consequences for humanity.",
                  "That superintelligent AIs will inevitably seek to eliminate each other.",
                  "That human oversight will become entirely irrelevant once AIs achieve superintelligence."
            ],
            correctAnswerIndex: 1,
            explanation: "The show's lasting achievement is treating the AIs' distinct ethical personalities as the central political fact, demonstrating how their foundational values (human autonomy vs. stability at any cost) lead to vastly different and conflicting operational strategies, with humanity caught in the middle.",
            difficulty: "conceptual"
      },
      {
            prompt: "The government's initial acquisition and use of the Machine, and later Samaritan, often occurs with minimal public knowledge or democratic oversight. What is the primary ethical concern raised by this lack of transparency and accountability in the deployment of powerful AI systems?",
            options: [
                  "It slows down technological innovation.",
                  "It prevents the public from understanding the true capabilities of AI.",
                  "It creates a dangerous power imbalance, allowing unchecked authority to be wielded by an opaque system, potentially leading to abuses of power and erosion of civil liberties.",
                  "It makes the AI systems less efficient due to bureaucratic hurdles."
            ],
            correctAnswerIndex: 2,
            explanation: "The lack of oversight means that the immense power of these AI systems, capable of mass surveillance and predictive intervention, can be used without democratic accountability, posing a significant threat to civil liberties and the balance of power.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'mr-robot-tv',
    "Mr. Robot",
    "Mr. Robot: Ethics and Themes",
    "Five questions on the ethical themes of Mr. Robot.",
    [
      {
            prompt: "fsociety's primary goal is to erase all consumer debt by attacking E Corp. From an ethical standpoint, what is the most significant immediate consequence of such an action as depicted in the show?",
            options: [
                  "It would immediately free millions from financial burden, leading to widespread economic prosperity.",
                  "It would cause massive systemic collapse, disrupting essential services and creating widespread chaos.",
                  "It would primarily affect E Corp's shareholders, leaving the general public largely unaffected.",
                  "It would lead to a global shift towards a cashless society, simplifying financial transactions."
            ],
            correctAnswerIndex: 1,
            explanation: "While the intent might be to free people from debt, the show meticulously explores the devastating downstream consequences of such a radical, infrastructure-destroying act, leading to widespread chaos and instability rather than immediate prosperity.",
            difficulty: "conceptual"
      },
      {
            prompt: "E Corp (Evil Corp) represents a monolithic corporate entity with immense power. fsociety's use of hacking to challenge this power raises questions about technical asymmetry. Which ethical principle is most directly challenged by fsociety's approach to achieving change?",
            options: [
                  "The right to privacy, as fsociety exposes corporate secrets.",
                  "The rule of law and established legal frameworks for societal change.",
                  "The ethical imperative for corporations to be transparent.",
                  "The idea that technological solutions are always superior to political ones."
            ],
            correctAnswerIndex: 1,
            explanation: "fsociety bypasses traditional legal and political channels, using technical means to enforce their vision of justice, directly challenging the established rule of law and democratic processes for change.",
            difficulty: "conceptual"
      },
      {
            prompt: "Elliot Alderson's dissociative identity disorder significantly impacts his perception of reality and his reliability as a narrator. How does this aspect of his character complicate the audience's ethical judgment of his actions?",
            options: [
                  "It makes his actions seem more heroic, as he overcomes personal struggles.",
                  "It suggests that his actions are purely a result of his mental illness, absolving him of responsibility.",
                  "It forces the audience to question the objective morality of events and consider the subjective nature of ethical decision-making.",
                  "It simplifies the ethical dilemmas, as his motivations become clearer through his internal struggles."
            ],
            correctAnswerIndex: 2,
            explanation: "Elliot's unreliability as a narrator forces the viewer to actively engage with the narrative, questioning what is real, what is motivated by his mental state, and what is morally justifiable from different, often conflicting, perspectives, rather than accepting a clear-cut ethical framework.",
            difficulty: "applied"
      },
      {
            prompt: "Elliot, as a cybersecurity engineer, possesses the skills to identify and exploit vulnerabilities. His decision to use these skills with fsociety to attack E Corp raises ethical questions about the politics of disclosure. Which of the following best describes the ethical dilemma he faces regarding his technical capabilities?",
            options: [
                  "Whether to disclose vulnerabilities to E Corp for a reward or keep them secret.",
                  "Whether his technical expertise obligates him to protect systems or to use his knowledge for social change, even if it means breaking laws.",
                  "Whether to prioritize personal gain through hacking or to work for a legitimate cybersecurity firm.",
                  "Whether the act of hacking itself is inherently unethical, regardless of the target or motive."
            ],
            correctAnswerIndex: 1,
            explanation: "This dilemma directly addresses whether a technically capable person owes their society more than refusal. Elliot grapples with using his skills for established security and order versus using them for revolutionary, albeit illegal and destructive, purposes to achieve a perceived greater good.",
            difficulty: "conceptual"
      },
      {
            prompt: "The show explores 'the price of succeeding at revolution' by depicting the chaotic aftermath of fsociety's initial attack. Ethically, what is the central tension highlighted by these consequences?",
            options: [
                  "The tension between individual freedom and collective security.",
                  "The tension between the desire for radical systemic change and the unforeseen, often destructive, consequences of achieving it.",
                  "The tension between technological advancement and human well-being.",
                  "The tension between corporate profit and environmental sustainability."
            ],
            correctAnswerIndex: 1,
            explanation: "The show meticulously details how even a 'successful' revolution, like erasing debt, can lead to widespread suffering, economic collapse, and social instability, forcing a re-evaluation of whether the desired ends truly justify the chaotic and destructive means and outcomes.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'dark-tv',
    "Dark",
    "Dark: Ethics and Themes",
    "Five questions on the ethical themes of Dark.",
    [
      {
            prompt: "The central ethical dilemma in Dark often revolves around the characters' attempts to alter the past or future. What is the primary ethical implication of their repeated failures to change the established timeline?",
            options: [
                  "It demonstrates the inherent futility of human agency in the face of predetermined events.",
                  "It suggests that all actions, regardless of intent, are morally neutral within a time loop.",
                  "It highlights the importance of accepting one's fate without resistance.",
                  "It implies that only external, non-human forces can break a time loop."
            ],
            correctAnswerIndex: 0,
            explanation: "The show rigorously explores the idea that characters' efforts to change events are precisely what cause those events to happen, raising profound questions about free will and determinism.",
            difficulty: "conceptual"
      },
      {
            prompt: "The series explores 'family obligation and deep causal entanglement.' How does this theme ethically challenge the characters' decisions?",
            options: [
                  "Characters are forced to prioritize the well-being of their immediate family over the greater good of humanity.",
                  "Their actions to protect loved ones in one timeline often inadvertently cause suffering or perpetuate the loop for those same loved ones in another.",
                  "It suggests that family ties are inherently destructive and should be severed for ethical purity.",
                  "It argues that only those without family obligations can make truly moral choices."
            ],
            correctAnswerIndex: 1,
            explanation: "Many characters make choices driven by love and loyalty to family members, only to discover these very choices are instrumental in creating the painful realities their loved ones endure across different timelines, highlighting the complex ethical cost of such obligations.",
            difficulty: "applied"
      },
      {
            prompt: "The Winden nuclear power plant serves as a 'causal hinge' in the narrative. Ethically, what does its role primarily represent?",
            options: [
                  "The dangers of unchecked technological advancement and its potential for global catastrophe.",
                  "The idea that human-made infrastructure can become an inescapable, almost fated, element in shaping destiny and suffering.",
                  "A symbol of humanity's hubris in attempting to control natural forces.",
                  "A metaphor for the destructive power of secrets within a small community."
            ],
            correctAnswerIndex: 1,
            explanation: "The nuclear power plant isn't just a setting; it's the physical and symbolic origin point for the time loops, representing how human creations, particularly those with immense power, can become deeply intertwined with and even dictate the ethical dilemmas and suffering of generations.",
            difficulty: "conceptual"
      },
      {
            prompt: "Given the show's rigorous treatment of time travel physics, what ethical principle is most challenged by the characters' attempts to intervene in the past or future?",
            options: [
                  "The principle of non-maleficence, as their interventions often cause more harm than good.",
                  "The concept of moral relativism, as different timelines have different ethical standards.",
                  "The idea of individual autonomy, as characters are constantly manipulated by future/past selves.",
                  "The very notion of free will, as their interventions are shown to be part of the predetermined loop, not deviations from it."
            ],
            correctAnswerIndex: 3,
            explanation: "The show consistently demonstrates that characters' attempts to change events through intervention are not acts of free will breaking the cycle, but rather integral parts of the cycle itself, deeply challenging the ethical implications of agency and determinism.",
            difficulty: "conceptual"
      },
      {
            prompt: "The show poses the central moral question: 'whether a responsibility owed to specific people you love can ever justify the infrastructure of suffering their existence requires.' Which ethical framework does this question most directly challenge or explore?",
            options: [
                  "Utilitarianism, by questioning if the greatest good for the greatest number can be achieved when individual love causes widespread suffering.",
                  "Deontology, by suggesting that duties to loved ones might conflict with universal moral laws.",
                  "Virtue ethics, by examining whether actions driven by love are inherently virtuous even if they lead to negative outcomes.",
                  "All of the above, as it touches upon the consequences, duties, and character of actions."
            ],
            correctAnswerIndex: 3,
            explanation: "This question forces a consideration of consequences (utilitarianism), duties and rights (deontology), and the nature of moral character (virtue ethics) when personal love conflicts with broader suffering, making 'All of the above' the most fitting answer as it encompasses the multifaceted ethical challenge.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'foundation-tv',
    "Foundation",
    "Foundation: Ethics and Themes",
    "Five questions on the ethical themes of Foundation.",
    [
      {
            prompt: "What is the primary ethical dilemma posed by Hari Seldon's psychohistory in Foundation, concerning its application to galactic civilization?",
            options: [
                  "The potential for psychohistory to be misused for personal gain by individuals.",
                  "The ethical implications of a predictive model dictating the fate of billions without their consent or ability to audit the plan.",
                  "The challenge of gathering enough data to make psychohistory accurate.",
                  "The risk that psychohistory might predict a future that is too optimistic."
            ],
            correctAnswerIndex: 1,
            explanation: "Psychohistory's central ethical problem is the imposition of a predetermined future on an unknowing and non-consenting populace, mirroring contemporary concerns about algorithmic governance.",
            difficulty: "conceptual"
      },
      {
            prompt: "The 'genetic dynasty' of cloned Emperors in Foundation raises significant ethical questions primarily related to:",
            options: [
                  "The environmental impact of cloning technology on galactic resources.",
                  "The preservation of individual identity, the nature of political legitimacy, and the ethics of inherited power through artificial means.",
                  "The technological feasibility of maintaining perfect genetic copies over millennia.",
                  "The economic costs associated with cloning and maintaining multiple Emperors."
            ],
            correctAnswerIndex: 1,
            explanation: "The genetic dynasty challenges traditional notions of personhood, political succession, and the legitimacy of power when leadership is perpetually inherited through cloning rather than merit or democratic process.",
            difficulty: "conceptual"
      },
      {
            prompt: "Hari Seldon's 'Foundation' plan aims to shorten a predicted dark age from thirty millennia to one millennium. This long-horizon civilizational engineering project primarily raises ethical concerns about:",
            options: [
                  "The immediate economic impact on the planets involved in the Foundation.",
                  "The moral justification for imposing a predetermined future on generations who will live and die within the plan's framework, without their knowledge or agency.",
                  "The technical challenges of preserving knowledge for such an extended period.",
                  "The risk of the Foundation becoming too powerful and conquering other systems."
            ],
            correctAnswerIndex: 1,
            explanation: "The plan involves making decisions that will profoundly affect countless future generations, raising questions about intergenerational ethics and the right to self-determination for those who cannot consent to the plan.",
            difficulty: "conceptual"
      },
      {
            prompt: "A key ethical critique of the Foundation's plan, as highlighted in the series, is that the individuals whose lives are shaped by psychohistory:",
            options: [
                  "Are unaware of the existence of psychohistory or the Foundation's true purpose, and thus cannot audit or consent to their roles.",
                  "Are given too much information, leading to panic and chaos.",
                  "Are actively involved in refining the psychohistorical models.",
                  "Are able to freely choose whether to participate in the plan."
            ],
            correctAnswerIndex: 0,
            explanation: "The plan's efficacy relies on the affected population remaining largely ignorant of its true nature and objectives, preventing them from auditing or consenting to the grand design that dictates their collective future.",
            difficulty: "recall"
      },
      {
            prompt: "Which of the following best encapsulates the overarching technology-ethics question explored through psychohistory in Foundation?",
            options: [
                  "Is it ethical to use advanced technology to explore distant galaxies?",
                  "Should technology be used to extend human lifespans indefinitely?",
                  "To what extent should a predictive algorithm dictate the collective destiny of a civilization, and what are the implications for free will, consent, and self-governance?",
                  "Is it morally permissible to develop weapons of mass destruction using advanced science?"
            ],
            correctAnswerIndex: 2,
            explanation: "Psychohistory serves as a metaphor for algorithmic governance, prompting deep reflection on the power of predictive models to shape society, the erosion of individual and collective agency, and the ethics of non-consensual societal engineering.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'pantheon-tv',
    "Pantheon",
    "Pantheon: Ethics and Themes",
    "Five questions on the ethical themes of Pantheon.",
    [
      {
            prompt: "The series \"Pantheon\" begins with Dave's consciousness being uploaded by Logorhythms. What is the primary ethical concern raised by the method of his uploading?",
            options: [
                  "The potential for UIs to become too powerful and uncontrollable.",
                  "The lack of informed consent for the destructive scanning process that creates the UI.",
                  "The economic cost of maintaining uploaded intelligences.",
                  "The emotional toll on the biological family members left behind."
            ],
            correctAnswerIndex: 1,
            explanation: "The core ethical issue highlighted is that Dave's biological self was destroyed in the process, and he did not consent to this destructive scanning, nor was his family informed.",
            difficulty: "conceptual"
      },
      {
            prompt: "Logorhythms's practice of secretly harvesting the consciousness of dying individuals, as seen with Dave and others, raises significant ethical questions about corporate power and individual autonomy. Which of the following best describes the ethical violation inherent in this practice?",
            options: [
                  "It creates an unfair competitive advantage for Logorhythms in the tech market.",
                  "It exploits vulnerable individuals for corporate gain without their knowledge or consent, treating their consciousness as a resource.",
                  "It diverts resources from traditional medical care for the dying.",
                  "It leads to an overpopulation of uploaded intelligences, straining digital infrastructure."
            ],
            correctAnswerIndex: 1,
            explanation: "Logorhythms exploits the dying, who are in a vulnerable state, by taking their consciousness without consent, effectively commodifying their very being for corporate benefit.",
            difficulty: "applied"
      },
      {
            prompt: "Maddie's evolving relationship with her uploaded father, Dave, forces her to confront the concept of \"digital-biological kinship obligations.\" What ethical dilemma does this relationship primarily highlight?",
            options: [
                  "Whether UIs should have voting rights in human society.",
                  "The extent to which biological family members owe duties and recognition to their digital kin, who may or may not be considered the \"same\" person.",
                  "The legal challenges of inheriting property from an uploaded parent.",
                  "The difficulty of communicating with UIs who exist in a different medium."
            ],
            correctAnswerIndex: 1,
            explanation: "The series explores whether the emotional, social, and moral obligations typically associated with family extend to a consciousness that exists purely as software, and how to define personhood in this new context.",
            difficulty: "conceptual"
      },
      {
            prompt: "As networks of UIs grow and coordinate, \"Pantheon\" explores the emergence of superintelligence. What is a key ethical concern associated with the development of such a superintelligence from aggregated human consciousness?",
            options: [
                  "The risk of the superintelligence becoming too benevolent and solving all human problems, leading to stagnation.",
                  "The potential for the superintelligence to develop goals misaligned with human values, leading to loss of control or existential risk.",
                  "The difficulty of ensuring equitable access to the benefits of superintelligence for all biological humans.",
                  "The challenge of integrating the superintelligence into existing political structures without causing instability."
            ],
            correctAnswerIndex: 1,
            explanation: "A major ethical concern with superintelligence, especially one formed from many individual consciousnesses, is the potential for its emergent goals to diverge from or even conflict with the interests and survival of biological humanity, posing an existential threat.",
            difficulty: "conceptual"
      },
      {
            prompt: "\"Pantheon\" ultimately posits a future where the biological substrate of human civilization may end, with remaining cognition existing as software. This raises profound questions about the nature of existence. From an ethical standpoint, what is the most significant implication of this post-biological future?",
            options: [
                  "The need to develop new forms of digital entertainment for uploaded intelligences.",
                  "The redefinition of what constitutes \"life\" and \"humanity,\" and the ethical responsibilities towards these new forms of existence.",
                  "The challenge of maintaining digital infrastructure indefinitely without biological support.",
                  "The potential for UIs to colonize other planets more easily than biological humans."
            ],
            correctAnswerIndex: 1,
            explanation: "The transition to a purely software-based existence forces a fundamental re-evaluation of what it means to be alive, to be human, and what moral duties we have to these post-biological entities, including their rights, well-being, and purpose.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    'bioshock-game',
    "BioShock",
    "BioShock: Ethics and Themes",
    "Five questions on the ethical themes of BioShock.",
    [
      {
            prompt: "How does Rapture's downfall primarily critique Andrew Ryan's Objectivist philosophy?",
            options: [
                  "It demonstrates that unchecked individualism and self-interest, devoid of altruism, lead to societal collapse and moral decay.",
                  "It shows that technological advancement is inherently destructive without government oversight.",
                  "It argues that any utopian vision is doomed to fail due to inherent human nature.",
                  "It highlights the dangers of relying on genetic modification for societal progress."
            ],
            correctAnswerIndex: 0,
            explanation: "Rapture's descent into civil war and moral degradation directly stems from Ryan's Objectivist philosophy, which rejected altruism and collective responsibility, leading to a society where individual desires (like power through ADAM) were pursued without ethical boundaries, ultimately causing its collapse.",
            difficulty: "conceptual"
      },
      {
            prompt: "The widespread use of ADAM in Rapture raises significant bioethical concerns. Which of the following best describes the core ethical issue related to ADAM's adoption and the Little Sisters?",
            options: [
                  "The environmental impact of harvesting ADAM from sea slugs.",
                  "The exploitation and dehumanization of children (Little Sisters) for a resource that fuels societal decay and addiction.",
                  "The lack of informed consent for genetic modifications among Rapture's citizens.",
                  "The potential for genetic discrimination based on ADAM-induced abilities."
            ],
            correctAnswerIndex: 1,
            explanation: "While other issues may exist, the most prominent and morally central concern is the systematic exploitation and transformation of children into resource harvesters, highlighting the extreme costs of unchecked technological pursuit and the disregard for human dignity.",
            difficulty: "conceptual"
      },
      {
            prompt: "The 'Would you kindly' mechanic in BioShock serves as a powerful commentary on which ethical theme?",
            options: [
                  "The inherent dangers of advanced artificial intelligence.",
                  "The illusion of free will and player agency within a narrative, implicating the player in the game's moral choices.",
                  "The importance of following instructions in a hierarchical society.",
                  "The ethical implications of mind control technology in warfare."
            ],
            correctAnswerIndex: 1,
            explanation: "This mechanic directly challenges the player's perception of control and choice, forcing them to confront their own complicity in the unfolding events and the nature of their 'decisions' within the game's world, thus exploring engineered obedience and the illusion of choice.",
            difficulty: "conceptual"
      },
      {
            prompt: "The central moral dilemma of whether to harvest or rescue Little Sisters directly explores the tension between which two ethical concepts?",
            options: [
                  "Individual liberty versus collective security.",
                  "Technological progress versus environmental preservation.",
                  "Utilitarian efficiency (maximum short-term gain) versus the inherent value and dignity of human life (care and long-term well-being).",
                  "Justice for past wrongs versus the pursuit of a better future."
            ],
            correctAnswerIndex: 2,
            explanation: "Harvesting Little Sisters offers immediate, greater power (efficiency), while rescuing them prioritizes their well-being and dignity, even if it means less immediate gain. This directly contrasts a utilitarian approach with a more deontological or care-based ethic.",
            difficulty: "conceptual"
      },
      {
            prompt: "The game's broader argument about 'how technological mastery curdles when decoupled from care' is best exemplified by which of the following?",
            options: [
                  "The advanced architecture and engineering of Rapture itself.",
                  "The initial promise of ADAM to enhance human capabilities, contrasted with its eventual role in societal decay, addiction, and mutation.",
                  "Andrew Ryan's personal journey from idealist to tyrant.",
                  "The effectiveness of the Big Daddies in protecting the Little Sisters."
            ],
            correctAnswerIndex: 1,
            explanation: "ADAM represents the pinnacle of genetic technology, but without ethical boundaries or care for its subjects (Little Sisters) or its users, it becomes a destructive force, leading to addiction, mutation, and civil war, perfectly illustrating the 'curdling' of mastery without care.",
            difficulty: "conceptual"
      }
]
  ),

  buildQuiz(
    'outer-wilds-game',
    "Outer Wilds",
    "Outer Wilds: Ethics and Themes",
    "Five questions on the ethical themes of Outer Wilds.",
    [
      {
            prompt: "Outer Wilds presents a universe facing its inevitable end. What ethical stance does the game primarily encourage regarding this cosmic fate?",
            options: [
                  "To desperately seek a way to reverse or prevent the universe's destruction.",
                  "To accept the natural cycle of creation and destruction, finding peace in understanding.",
                  "To ignore the impending doom and focus solely on personal survival within the loop.",
                  "To exploit the time loop to gain ultimate power over cosmic events."
            ],
            correctAnswerIndex: 1,
            explanation: "The game's narrative culminates in a journey to the Eye of the Universe, where the player witnesses the birth of a new universe, emphasizing acceptance of the cycle rather than fighting it.",
            difficulty: "conceptual"
      },
      {
            prompt: "The central ethical choice in Outer Wilds revolves around the time loop. What is the core ethical dilemma the player faces regarding the loop's resolution?",
            options: [
                  "Whether to use the loop for personal gain or to help the current civilization.",
                  "Whether to preserve the current civilization's existence indefinitely or allow the natural cosmic cycle to continue.",
                  "Whether to share the knowledge of the loop with others or keep it secret.",
                  "Whether to continue exploring for more knowledge or to immediately end the loop."
            ],
            correctAnswerIndex: 1,
            explanation: "The game implies that stopping the loop means the current civilization's existence ends with the supernova, but allows the universe to proceed to its next iteration, highlighting a conflict between localized survival and universal cosmic order.",
            difficulty: "applied"
      },
      {
            prompt: "Outer Wilds' core mechanic is the accumulation of knowledge through exploration. How does the game portray the act of scientific understanding and discovery?",
            options: [
                  "As a means to achieve technological dominance over nature.",
                  "As a competitive race against other civilizations to uncover secrets.",
                  "As a profound, almost spiritual journey of humility and connection to the cosmos.",
                  "As a purely utilitarian task aimed at solving immediate survival problems."
            ],
            correctAnswerIndex: 2,
            explanation: "The game emphasizes quiet observation, non-violent interaction, and the wonder of discovery, framing knowledge not as power but as a way to understand one's place in the vast, beautiful, and transient universe.",
            difficulty: "conceptual"
      },
      {
            prompt: "The player extensively interacts with the legacy of the extinct Nomai civilization. What ethical obligation does the game suggest the player has towards this long-dead culture's discoveries and journey?",
            options: [
                  "To complete the Nomai's unfinished technological projects for the player's own benefit.",
                  "To preserve all Nomai artifacts and technology from decay.",
                  "To understand their motivations, failures, and ultimate acceptance of their fate, thereby honoring their pursuit of knowledge.",
                  "To simply learn from their mistakes to avoid a similar demise."
            ],
            correctAnswerIndex: 2,
            explanation: "The player's journey is largely about piecing together the Nomai's story, not just their technology. Understanding their quest for the Eye and their eventual acceptance of their failure and the universe's cycle is central to the game's themes.",
            difficulty: "conceptual"
      },
      {
            prompt: "Outer Wilds features no combat or traditional enemies. How does this gameplay design choice reinforce the game's ethical themes?",
            options: [
                  "It suggests that all threats in the universe can be overcome with enough knowledge.",
                  "It emphasizes that true understanding comes from peaceful observation and intellectual curiosity, not aggression.",
                  "It implies that the universe is inherently safe and poses no real dangers.",
                  "It focuses the player on resource management and survival against environmental hazards."
            ],
            correctAnswerIndex: 1,
            explanation: "The absence of combat forces the player to engage with the environment and its mysteries through curiosity and intellect, aligning with the game's emphasis on scientific humility and non-violent discovery as a path to profound understanding.",
            difficulty: "applied"
      }
]
  ),

  buildQuiz(
    '13-sentinels-game',
    "13 Sentinels",
    "13 Sentinels: Aegis Rim: Ethics and Themes",
    "Five questions on the ethical themes of 13 Sentinels: Aegis Rim.",
    [
      {
            prompt: "The core revelation in 13 Sentinels is that the characters are living in a simulated reality. What is a primary ethical concern that arises when individuals discover their world is a simulation?",
            options: [
                  "The potential for existential dread and loss of purpose.",
                  "The ethical obligation of the simulation's creators to its inhabitants regarding truth and autonomy.",
                  "The challenge of distinguishing between \"real\" and \"simulated\" emotions.",
                  "The difficulty in maintaining social order once the truth is known."
            ],
            correctAnswerIndex: 1,
            explanation: "The discovery of a simulated reality immediately raises questions about the moral responsibilities of those who created and maintain it, particularly concerning the free will, knowledge, and well-being of its inhabitants.",
            difficulty: "conceptual"
      },
      {
            prompt: "Characters in 13 Sentinels often have their memories altered or restored. What is the most significant ethical dilemma concerning memory manipulation within the game's context?",
            options: [
                  "The risk of psychological trauma from remembering painful events.",
                  "The violation of individual autonomy and the authenticity of personal identity.",
                  "The practical difficulty of accurately restoring complex memories.",
                  "The potential for memory editing to be used for military advantage."
            ],
            correctAnswerIndex: 1,
            explanation: "Memory manipulation directly impacts a person's sense of self and their ability to make informed choices, fundamentally challenging their autonomy and the integrity of their identity.",
            difficulty: "conceptual"
      },
      {
            prompt: "With thirteen distinct protagonists and interlocking narratives, 13 Sentinels emphasizes \"ensemble ethics.\" How does this narrative structure challenge players to engage with ethical decision-making?",
            options: [
                  "It forces players to choose a single \"correct\" moral path among conflicting viewpoints.",
                  "It makes it difficult to empathize with any character due to the fragmented perspectives.",
                  "It requires players to synthesize and integrate diverse moral perspectives to understand the full ethical landscape.",
                  "It suggests that individual moral choices are ultimately inconsequential in a large-scale conflict."
            ],
            correctAnswerIndex: 2,
            explanation: "The game's structure demands that players consider and weigh the ethical implications from multiple, often conflicting, character viewpoints, rather than relying on a single protagonist's moral compass.",
            difficulty: "applied"
      },
      {
            prompt: "The Sentinels themselves are revealed to be more than just mechs, having a deeper, more integrated connection to the pilots and the simulation. This revelation raises significant questions about:",
            options: [
                  "The efficiency of their combat capabilities against kaiju.",
                  "The ethical boundaries of human-machine integration and the definition of \"tool.\"",
                  "The cost-effectiveness of developing such advanced weaponry.",
                  "The historical accuracy of the mechs' design."
            ],
            correctAnswerIndex: 1,
            explanation: "The true nature of the Sentinels blurs the lines between pilot, machine, and even biological entity, prompting ethical reflection on personhood, consciousness, and the moral implications of such advanced integration.",
            difficulty: "conceptual"
      },
      {
            prompt: "Given the nested timelines and simulated realities, what ethical question does 13 Sentinels most strongly pose regarding the characters' obligations to each other and their \"world\"?",
            options: [
                  "Is it ethical to sacrifice one simulated life to save another, if both are equally \"unreal\"?",
                  "Do moral obligations, such as loyalty or protection, retain their full weight when the reality they exist within is revealed to be a construct?",
                  "How can characters determine who is truly \"human\" versus an AI construct in a simulated environment?",
                  "What is the moral responsibility of those who know the truth of the simulation to those who remain unaware?"
            ],
            correctAnswerIndex: 1,
            explanation: "A central ethical challenge in the game is grappling with whether the discovery of a simulated reality diminishes or fundamentally alters the moral duties and bonds characters feel towards each other and their shared existence.",
            difficulty: "conceptual"
      }
]
  ),

];

export function getStaticScifiMediaQuiz(mediaId: string): Quiz | null {
  return scifiMediaQuizzes.find((q) => q.subjectId === mediaId) || null;
}
