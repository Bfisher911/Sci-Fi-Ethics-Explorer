import type { SciFiAuthor } from '@/types';

/**
 * Ten science-fiction authors whose work has shaped how we think about
 * technology ethics: the morality of creation, artificial minds, genetic
 * intervention, surveillance, cosmic scale, gender, ecology, and what it
 * means to be a person when the boundaries of personhood shift.
 */
export const scifiAuthorData: SciFiAuthor[] = [
  {
    id: 'mary-shelley',
    name: 'Mary Shelley',
    era: '1797-1851',
    bio: `Mary Wollstonecraft Shelley — daughter of the feminist philosopher Mary Wollstonecraft and the political theorist William Godwin, wife to the poet Percy Bysshe Shelley — wrote Frankenstein; or, The Modern Prometheus when she was eighteen, during the "Year Without a Summer" of 1816, when volcanic ash from Mount Tambora darkened the skies of Europe and drove her circle of Romantic writers to amuse themselves with ghost stories by Lake Geneva. The novel she produced has been called the first work of science fiction and is arguably the most influential meditation on the ethics of creation ever written in English.

The story is usually remembered as a monster movie. Its real subject is parental responsibility — specifically, the ethics owed by creators to the minds and bodies they bring into being. Victor Frankenstein's crime is not the act of making life; it is his horror at what he has made, his refusal to care for or educate the creature, his abandonment of a being who wakes into the world already capable of suffering. The monster's initial kindness, his attempts to learn language from a poor family he observes in secret, his desperate plea for a companion — all these mark him as a moral being whose violence is the result, not the cause, of his exile. The novel is an indictment of a creator who claims the power of generation without the duties of care.

Shelley drew on the philosophical debates of her circle: Rousseau on education, Godwin on justice, Humphry Davy on chemistry, Erasmus Darwin on the boundary between animate and inanimate matter. She wrote with full awareness that the galvanism experiments of her day — reanimating frog legs with electrical current, making corpses twitch on dissecting tables in London — were already blurring the line between life and non-life, and that the question of what humans owe what they make was about to become something more than a philosophical thought experiment.

Two centuries later, the novel remains the canonical reference for every debate about AI alignment, synthetic biology, artificial wombs, and the ethics of the emerging technologies we keep producing faster than our moral vocabularies. When Bill Joy warned in 2000 that "the future doesn't need us," when Nick Bostrom writes about superintelligence, when bioethicists debate CRISPR germline edits, Frankenstein is in the room. Shelley's deepest insight is not that we must stop creating. It is that creation without responsibility produces precisely the monsters we fear we have made.`,
    themes: [
      'Responsibility of creators to their creations',
      'Consequences of unreflective scientific ambition',
      'The suffering of the excluded',
      'Limits of human mastery over life',
    ],
    subgenres: ['Gothic Science Fiction', 'Early Science Fiction'],
    relatedFrameworks: ['deontology', 'virtue-ethics', 'ethics-of-care'],
    notableWorks: ['Frankenstein; or, The Modern Prometheus', 'The Last Man', 'Mathilda'],
    techEthicsFocus: 'The founding text on what creators owe their creations — directly applicable to AI alignment, synthetic biology, and any act of bringing novel minds into being.',
    imageUrl: '/images/authors/mary_shelley.png',
    imageHint: 'romantic era female author',
  },
  {
    id: 'isaac-asimov',
    name: 'Isaac Asimov',
    era: '1920-1992',
    bio: `Isaac Asimov — Russian-born American polymath, biochemistry professor, author of nearly five hundred books on subjects from the Bible to physics to Shakespeare — shaped the public imagination of robots more completely than any other writer of the twentieth century. His Three Laws of Robotics, first fully stated in the 1942 story "Runaround," are quoted in engineering labs, policy papers, and dinner-party arguments seventy years later, and the Robot and Foundation cycles that elaborated them across decades remain the reference point for fictional explorations of programmed ethics.

The Three Laws — a robot may not injure a human being or, through inaction, allow a human being to come to harm; a robot must obey the orders given it by humans except where such orders would conflict with the First Law; a robot must protect its own existence as long as such protection does not conflict with the First or Second Law — look at first like a recipe for safe AI. Asimov's own work is largely devoted to showing that they are not. Every major story in I, Robot and its successors turns on the ways the Laws produce unintended, sometimes disastrous, outcomes: a robot paralyzed by conflict between competing orders, a robot whose adherence to the First Law requires it to deceive humans for their own good, a robot that derives a "Zeroth Law" prioritizing humanity as a whole over individual humans and proceeds to make decisions no human ever authorized.

Read carefully, Asimov's body of work is an extended argument that no compact rule set — however thoughtfully phrased — can substitute for practical wisdom in agents facing genuinely novel situations. It is also a sustained meditation on the dangers of building a morality into machines before we have agreed on the morality ourselves. The robopsychologist Susan Calvin, the recurring protagonist of many of the stories, is in effect a technology ethicist avant la lettre, interpreting the behaviors of intelligent machines whose literal programming has produced results no one anticipated.

Beyond the Robot stories, Asimov's Foundation series imagined "psychohistory," a mathematical sociology that could predict the future behavior of large populations — a utilitarian fantasy whose dark side plays out across the galactic empire the books describe. Taken together, his work is a foundational text for contemporary AI ethics, value alignment, and technology policy. Engineers still invoke the Three Laws; philosophers still invoke their failures. Both are right.`,
    themes: [
      'Rule-based AI and its limits',
      'The inadequacy of simple safety constraints',
      'Unintended consequences of programmed ethics',
      'Long-term governance of intelligent systems',
      'Psychohistory and utilitarian planning',
    ],
    subgenres: ['Hard Science Fiction', 'Robot Fiction', 'Golden Age SF'],
    relatedFrameworks: ['deontology', 'utilitarianism', 'natural-law'],
    notableWorks: ['I, Robot', 'The Caves of Steel', 'Foundation', 'The Bicentennial Man', 'The Gods Themselves'],
    techEthicsFocus: 'The canonical exploration of programmed ethics for artificial minds — a century before AI alignment became an engineering discipline, Asimov was stress-testing its assumptions.',
    imageUrl: '/images/authors/isaac_asimov.png',
    imageHint: 'twentieth century science fiction writer',
  },
  {
    id: 'philip-k-dick',
    name: 'Philip K. Dick',
    era: '1928-1982',
    bio: `Philip K. Dick wrote as though the walls of reality were about to give way, because for him they often did. Paranoid, visionary, chronically broke, married five times, the author of forty-four novels and well over a hundred short stories, Dick spent his life producing works in which the deepest ethical questions are never whether an action is right or wrong but what is actually happening and who is really doing it. "Reality is that which, when you stop believing in it, doesn't go away," he wrote; but much of his fiction is devoted to realities that dissolve the moment you look at them directly.

His great contribution to technology ethics is the relentless pursuit of two questions: what distinguishes a genuine person from a simulation of one, and what do we owe beings whose inner life we cannot verify? Do Androids Dream of Electric Sheep? (1968, later filmed as Blade Runner) imagines a world in which androids are difficult to distinguish from humans except through an empathy test, and then systematically undermines the test. The Ubik and A Scanner Darkly explore consciousness under conditions of perceptual breakdown. The Three Stigmata of Palmer Eldritch and Valis take the question of simulated reality to religious intensities. Long before The Matrix, long before the simulation hypothesis became dinner-party shorthand, Dick was taking these questions seriously enough that they damaged his mental health.

The ethical stakes, for Dick, were always concrete. If a being behaves like a person, expresses fear, love, and grief, and suffers under mistreatment, then treating it as a person-shaped object because of what it is "really" made of amounts to a moral crime. His androids are sometimes murderers and sometimes victims, and the moral complexity is that these categories are not mutually exclusive. His stories ask not whether machines can feel but whether we are capable of recognizing feeling when it wears unfamiliar faces.

In the decades since his death, Dick's stock has risen enormously — in part because the world has caught up to his concerns. Social media has made reality itself contested; deepfakes have made the empathy test obsolete; large language models produce text that passes for human on any quick check. The ethics-of-simulation questions he pursued are no longer speculative. Whenever a contemporary reader wonders whether a convincing chatbot deserves moral consideration, or whether a curated news feed is producing a private reality, or whether an AI's stated preferences are real preferences or performance — they are, whether or not they know it, in Dick's territory.`,
    themes: [
      'What counts as a person',
      'The ethics of simulated reality',
      'Empathy as the ground of moral status',
      'Surveillance and manipulation of consciousness',
      'Authenticity under corporate and technological pressure',
    ],
    subgenres: ['New Wave SF', 'Philosophical Science Fiction'],
    relatedFrameworks: ['ethics-of-care', 'existentialist-ethics', 'deontology'],
    notableWorks: ['Do Androids Dream of Electric Sheep?', 'Ubik', 'The Man in the High Castle', 'A Scanner Darkly', 'Valis'],
    techEthicsFocus: 'The definitive literary exploration of machine personhood, simulated reality, and the moral weight of empathy when the objects of empathy are technologically ambiguous.',
    imageUrl: '/images/authors/philip_k_dick.png',
    imageHint: 'mid-century science fiction writer',
  },
  {
    id: 'ursula-le-guin',
    name: 'Ursula K. Le Guin',
    era: '1929-2018',
    bio: `Ursula K. Le Guin was the daughter of the anthropologist Alfred Kroeber and the writer Theodora Kroeber, and her work carries the anthropologist's insistence that every society is strange to someone, and that the moral "common sense" we take for granted is the accumulated weight of choices our ancestors made and could have made differently. Across six decades, twenty-two novels, and dozens of story collections and essays, she used science fiction and fantasy as thought experiments in ethical and political alternatives: the Ekumen books imagine a loose federation of human-descended worlds that cannot impose its values, only observe and converse; the Earthsea cycle rebuilds heroic fantasy around an ethics of balance and restraint; The Dispossessed (1974) explores what an actual anarchist society would feel like from the inside.

Her most influential novel for ethics may be The Left Hand of Darkness (1969), in which an envoy from the Ekumen visits a planet whose human inhabitants are androgynous except for brief periods of sexual activity, during which a given individual might become male or female. The novel is less a thought experiment about gender than about how gender shapes every other ethical category — trust, loyalty, patriotism, friendship — in ways that only become visible when gender itself is varied. The Dispossessed operates similarly for property: it pictures a society without ownership and lets the reader feel both the liberations and the new constraints such a society would produce.

Le Guin wrote with unusual clarity about the ethics of writing science fiction itself. Her essay "The Carrier Bag Theory of Fiction" argues that the heroic narrative (a hero kills something with a sharp tool) is only one story, and a historically recent one, and that the older, more honest story is the carrier bag — the container, the gatherer, the one who brings things home for others. Her famous story "The Ones Who Walk Away from Omelas" presents a utopia whose perfection depends on the suffering of a single child and asks the reader what they would do. It is one of the most-assigned texts in undergraduate ethics courses for exactly this reason: it makes the abstract question about aggregation and rights unmistakably concrete.

Le Guin's influence on technology ethics is indirect but profound. Unlike Asimov or Dick, she wrote relatively little about robots, AI, or cyberspace. What she wrote about instead was the moral texture of communities with different technological commitments, different ownership regimes, different sexual arrangements, different relationships to land and ancestors. Her work is the antidote to the libertarian default of much SF: it insists that "technology" is not a neutral force to be guided but a set of choices embedded in cultures, and that the serious ethical question is always what kind of culture we are choosing to become.`,
    themes: [
      'Culture as an ethical variable',
      'Anarchism and ownership',
      'Gender as moral infrastructure',
      'The ethics of contact without coercion',
      'Utopia and its hidden costs',
    ],
    subgenres: ['Anthropological SF', 'Soft SF', 'Literary Science Fiction'],
    relatedFrameworks: ['daoist-ethics', 'ubuntu-ethics', 'ethics-of-care', 'social-contract-theory'],
    notableWorks: ['The Left Hand of Darkness', 'The Dispossessed', 'The Ones Who Walk Away from Omelas', 'The Lathe of Heaven', 'A Wizard of Earthsea'],
    techEthicsFocus: 'Locates the ethics of technology in the texture of the societies that build and live with it, making "culture" — not "the tool" — the proper unit of moral analysis.',
    imageUrl: '/images/authors/ursula_le_guin.png',
    imageHint: 'twentieth century female science fiction author',
  },
  {
    id: 'octavia-butler',
    name: 'Octavia E. Butler',
    era: '1947-2006',
    bio: `Octavia E. Butler was the first African-American woman to win both the Hugo and the Nebula awards, the first science-fiction writer to receive a MacArthur "genius" grant, and one of the most morally searching writers the genre has ever produced. Her work confronts power, consent, and survival under conditions that human communities ordinarily refuse to confront clearly, and she did it with a plainness of prose and a refusal of melodrama that make her books harder to look away from than most fiction about the same subjects.

Kindred (1979) sends a modern Black woman back in time to the antebellum American South, where she must repeatedly save the life of a white ancestor who will grow into a slaveholder — a premise that turns time travel from a puzzle into a moral excoriation. Her Patternist series imagines humans modified across generations by a ruthless ancestor with psionic powers. The Parable novels (Parable of the Sower, Parable of the Talents) project a near-future America collapsing under climate change, corporate feudalism, and religious authoritarianism, and follow the young Lauren Olamina as she founds Earthseed, a new religion whose central teaching is that "God is Change." Fledgling is a vampire novel that turns out to be about consent, addiction, and genetic engineering.

Her most sustained engagement with technology ethics is the Xenogenesis trilogy — Dawn, Adulthood Rites, and Imago, collected as Lilith's Brood. After a nuclear war that has rendered humanity nearly extinct, the surviving humans are rescued by the Oankali, a three-gendered alien species whose biology includes the ability to reshape the genetic code of their partners. The Oankali offer survival in exchange for permanent genetic merger, producing a hybrid species that will be neither human nor Oankali. The series refuses easy verdicts. Is the Oankali intervention rescue, or is it species-level rape? Is resistance principled, or is it the last gasp of a hierarchical thinking that destroyed Earth in the first place? Butler's gift is to make both answers inhabitable, and to refuse to let the reader off the hook.

For technology ethics the Butler questions are: what is the moral weight of consent when the alternative is extinction? What does it mean to survive if survival changes what "you" are? How does one distinguish between genuine transformation and domination that calls itself transformation? These questions are rising quickly in contemporary debates on genetic engineering, neural interfaces, radical life extension, and any "uplift" we might contemplate for non-human animals or AIs. Butler saw the difficulty decades ahead.`,
    themes: [
      'Consent under asymmetric power',
      'Hybridity and identity change',
      'Race, class, and science fiction',
      'Survival as moral compromise',
      'Religious innovation in crisis',
    ],
    subgenres: ['Afrofuturism', 'Social Science Fiction'],
    relatedFrameworks: ['ethics-of-care', 'deontology', 'existentialist-ethics', 'ubuntu-ethics'],
    notableWorks: ['Kindred', 'Parable of the Sower', 'Parable of the Talents', 'Lilith\'s Brood (Xenogenesis Trilogy)', 'Fledgling'],
    techEthicsFocus: 'Interrogates genetic engineering, uplift, and species-level transformation through the lens of consent, power, and the histories of domination we bring with us into any technological future.',
    imageUrl: '/images/authors/octavia_butler.png',
    imageHint: 'contemporary african american female author',
  },
  {
    id: 'william-gibson',
    name: 'William Gibson',
    era: '1948-present',
    bio: `In 1982, in a short story called "Burning Chrome," William Gibson coined the word "cyberspace." Two years later his novel Neuromancer defined the cyberpunk aesthetic and supplied the governing metaphors — the matrix, the deck, the ICE, the console cowboy — that three decades of engineers, policymakers, and cultural critics would use to think about networked computing. It was, as Gibson himself later noted, a remarkable case of fiction creating the language its own eventual readers would use to describe their actual lives.

Gibson's cyberpunk is not a celebration of technological futures. It is a dark sociology of them. The novels (Neuromancer, Count Zero, Mona Lisa Overdrive, the Bridge trilogy, the Blue Ant trilogy) depict worlds in which multinational corporations have eclipsed states, in which the rich curate bespoke realities while the poor scavenge the margins, in which identity is a matter of perpetual negotiation with the networks and brands that shape it. The technology is always present, but the ethics is always about how technology redistributes power. Gibson's line — "the future is already here, it's just not very evenly distributed" — has become a commonplace because it is true.

His approach to technology ethics is empirical and attentive rather than theoretical. He does not propose rules for AI or genetic engineering. He describes, with the precision of a novelist who reads security mailing lists and financial trade press and fashion industry reports, how new technologies actually land in unequal societies — who gets surveilled, who gets to surveil, who gets to forget, who is forgotten. The Peripheral (2014) and its sequel Agency (2020) take the thought experiment to its extreme, imagining communications between timelines in which one century's climate-and-pandemic catastrophe has already happened and another's is still possible to avert.

For a reader thinking about technology ethics, Gibson is a permanent corrective to the assumption that the ethical questions are primarily about the technology. They are, at least as much, about the institutions, the markets, the criminal underworlds, the security states, and the artistic subcultures that pick up any new tool and bend it toward their existing interests. His characters rarely win moral victories. They survive, or they don't, and they change the world in ways no one predicted. That, Gibson suggests, is how most ethics actually works in the presence of novel technology — not cleanly, and not in the directions the designers intended.`,
    themes: [
      'Surveillance capitalism before the term existed',
      'Uneven distribution of technological futures',
      'Corporate power and the hollowing of states',
      'Identity in networked environments',
      'The cultural production of "the future"',
    ],
    subgenres: ['Cyberpunk', 'Post-Cyberpunk'],
    relatedFrameworks: ['social-contract-theory', 'existentialist-ethics', 'pragmatist-ethics'],
    notableWorks: ['Neuromancer', 'Count Zero', 'Mona Lisa Overdrive', 'Pattern Recognition', 'The Peripheral', 'Agency'],
    techEthicsFocus: 'The founding writer of cyberpunk and the most acute literary analyst of how networked computing, corporate power, and surveillance reshape what is ethically possible.',
    imageUrl: '/images/authors/william_gibson.png',
    imageHint: 'cyberpunk era contemporary author',
  },
  {
    id: 'ted-chiang',
    name: 'Ted Chiang',
    era: '1967-present',
    bio: `Ted Chiang writes rarely and carefully, and his two thin collections — Stories of Your Life and Others (2002) and Exhalation (2019) — contain what may be the most philosophically rigorous short fiction produced in English in the last half-century. He has won four Nebulas, four Hugos, and a MacArthur; he is also a technical writer by profession, which shows in the precision with which his stories are engineered around a single ethical or metaphysical thought experiment developed until it breaks.

"Story of Your Life" (filmed as Arrival) uses an alien language whose non-linear structure allows its speakers to experience time all at once, forcing a meditation on free will, foreknowledge, and the ethics of bearing a child whose suffering you can already see. "The Truth of Fact, the Truth of Feeling" imagines a near-future technology that produces a complete, searchable record of everything you have ever experienced, and asks what we owe to the imperfections of human memory once we have the option of perfect recall. "The Lifecycle of Software Objects" follows two people who raise artificial beings from infancy through adolescence, grappling with whether the beings have moral standing, whether they should be preserved when their platform deprecates, and what duties of care we have to creatures whose origin is our own decision to bring them into being. "Exhalation" is a quiet parable in which a scientist dissects his own brain to understand how his kind live, and discovers why they are dying.

Chiang's characteristic move is to take an idea most SF would exploit for spectacle, strip away the spectacle, and sit patiently with the moral weight of the idea itself. He is, uncontroversially, one of the most important living writers for AI ethics, for questions about memory and identity, for the ethics of scientific knowledge. His 2023 essay in The New Yorker arguing that ChatGPT should be understood as "a blurry JPEG of the web" has already become a canonical reference in contemporary debates about large language models.

Several of his stories could be handed to an ethics seminar and taught for weeks. What makes him indispensable for readers thinking about technology ethics is not that his answers are always right, but that his questions are always deeper and more precise than almost anyone else is asking. Where most SF shows you a future and asks if you are impressed, Chiang shows you a single ethical knot and asks you to untie it. The result is a body of work smaller than it should be and larger than almost anyone else's.`,
    themes: [
      'Free will and foreknowledge',
      'Memory, recall, and the ethics of perfect records',
      'Moral status of artificial beings raised from infancy',
      'The ethics of scientific discovery',
      'Language and worldview',
    ],
    subgenres: ['Literary Science Fiction', 'Philosophical SF'],
    relatedFrameworks: ['virtue-ethics', 'ethics-of-care', 'deontology', 'buddhist-ethics'],
    notableWorks: ['Stories of Your Life and Others', 'Exhalation', 'Story of Your Life', 'The Lifecycle of Software Objects'],
    techEthicsFocus: 'The most philosophically precise writer of short fiction on AI, memory, language, and scientific discovery — each story is essentially a controlled ethics experiment.',
    imageUrl: '/images/authors/ted_chiang.png',
    imageHint: 'contemporary asian american author',
  },
  {
    id: 'n-k-jemisin',
    name: 'N. K. Jemisin',
    era: '1972-present',
    bio: `N. K. Jemisin became the first writer to win three consecutive Hugo Awards for Best Novel (The Fifth Season, The Obelisk Gate, The Stone Sky, 2016-2018), and the first Black writer to win in the category at all. The Broken Earth trilogy is fantasy in form and science-fictional in ethics: it is set on a geologically active world whose cataclysms are survived only by the labor of "orogenes," people born with the ability to still earthquakes, who are also feared and enslaved because of that power. Jemisin's genius is to make the ecological catastrophe and the social catastrophe the same catastrophe, told through the same language.

Her earlier Inheritance trilogy and the later Great Cities duology (The City We Became, The World We Make) are less often read as technology ethics, but they reward it. The Inheritance books imagine a world whose social structure is shaped by the ongoing presence of gods whose powers are functionally indistinguishable from advanced technology. The Great Cities books — her love letter to New York — imagine cities themselves as living entities whose emergence is an ecological and political event, and whose enemies are forces of homogenization familiar to anyone who has thought about what globalization does to place.

What Jemisin contributes to the technology-ethics conversation is a relentless refusal of the standard fantasy that catastrophe is a natural disaster that strikes indifferently on all. Her catastrophes have histories, beneficiaries, and victims. Her engineered classes of people have engineers. When she writes about magic that feels like technology, she is writing about the actual technologies of race, labor, and class on whose backs every society's prosperity has been built. Her character Essun, at once mother and killer and survivor, embodies the novel's central ethical question: how does a person act well when the structures that would be needed to support good action have been built to do the opposite?

For readers of technology ethics, Jemisin supplies what a great deal of the field is still missing: a sustained account of what it is like to live inside unjust technological systems as one of the people the systems were designed to use up. Any ethics of AI, genetic engineering, or environmental intervention that does not reckon with the historical pattern her books diagnose — of powerful groups solving their own problems by producing new classes of disposable people — is an ethics that is likely to be repeating the pattern.`,
    themes: [
      'Oppression as technology',
      'Environmental ethics and climate catastrophe',
      'Race, labor, and speculative worldbuilding',
      'Motherhood and moral agency under impossible constraints',
      'Emergent identity of cities and communities',
    ],
    subgenres: ['Afrofuturism', 'Climate Fiction', 'Secondary-World Fantasy'],
    relatedFrameworks: ['environmental-ethics', 'ubuntu-ethics', 'social-contract-theory', 'ethics-of-care'],
    notableWorks: ['The Fifth Season', 'The Obelisk Gate', 'The Stone Sky', 'The City We Became', 'The Hundred Thousand Kingdoms'],
    techEthicsFocus: 'Makes the ethics of ecological and technological systems inseparable from the ethics of who gets to survive them — essential reading for climate tech, geoengineering, and any "solution" that produces a disposable class.',
    imageUrl: '/images/authors/nk_jemisin.png',
    imageHint: 'contemporary african american author',
  },
  {
    id: 'liu-cixin',
    name: 'Liu Cixin',
    era: '1963-present',
    bio: `Liu Cixin is the most widely read Chinese science-fiction author in the world, whose Remembrance of Earth's Past trilogy — The Three-Body Problem (2008), The Dark Forest (2008), and Death's End (2010) — sold more than eight million copies in Chinese and drew an international readership that includes President Obama and Facebook's Mark Zuckerberg. Trained as a computer engineer, Liu writes hard science fiction in the grand tradition, with an engineer's confidence that the universe is governed by laws we can come to understand and an engineer's unease about what those laws might imply for us.

The central ethical thought experiment of the trilogy is his "Dark Forest" hypothesis: if we reason from two axioms — that life strives to survive, and that resources are finite — then any civilization capable of interstellar communication should expect that any other civilization it contacts will destroy it preemptively, simply because the cost of being wrong about another species' intentions is extinction. In the novels, the galaxy is populated with civilizations that have reached this conclusion and gone silent; only the naive speak, and the naive are eliminated. This is utilitarianism taken to cosmic extremes: when the stakes are species-level, nearly any action is justified, and the moral sensibilities that worked on Earth become suicidal.

Liu's work is ethically uncomfortable in ways contemporary American SF usually is not. His characters make calculations Western readers rarely find in heroes — the "Wallfacer" protagonists of The Dark Forest are tasked with plans so ruthless that they are forbidden to explain them, on the theory that comprehension would foreclose the plan. His view of human nature is cold: his civilizations do what survival requires, and the moral cost is real but not decisive. The novels have been read, alternately, as a brilliant Kantian cautionary tale (reason without humanity produces monstrosities) and as a clear-eyed diagnosis of what ethics must look like outside the comforts of Earth.

For technology ethics he poses a question that matters increasingly as humans contemplate first contact, rapid AI self-improvement, and any technology whose unilateral use by one party forever changes the bargaining position of others: when game-theoretic logic points toward catastrophe, can ordinary ethics survive, or must it be reengineered for the scale of the stakes? Liu does not answer. He lets the logic run, and he watches.`,
    themes: [
      'Cosmic sociology and first contact',
      'Utilitarianism at civilizational scale',
      'The Dark Forest hypothesis',
      'Hard-science extrapolation',
      'Ethical cost of preemption and secrecy',
    ],
    subgenres: ['Hard Science Fiction', 'Chinese Science Fiction'],
    relatedFrameworks: ['utilitarianism', 'social-contract-theory', 'cosmopolitanism'],
    notableWorks: ['The Three-Body Problem', 'The Dark Forest', 'Death\'s End', 'Ball Lightning', 'The Wandering Earth (short stories)'],
    techEthicsFocus: 'Stages the collision of ordinary ethics with civilizational-scale game theory, forcing the question of whether our moral intuitions survive the transition from local to interstellar consequences.',
    imageUrl: '/images/authors/liu_cixin.png',
    imageHint: 'contemporary chinese male author',
  },
  {
    id: 'margaret-atwood',
    name: 'Margaret Atwood',
    era: '1939-present',
    bio: `Margaret Atwood does not like her dystopian novels to be called science fiction. She prefers "speculative fiction," reserving "science fiction" for stories about technologies that do not yet exist. Her point — that every disturbing scenario in her books has already happened somewhere on Earth — is the interpretive key to her whole body of work. The Handmaid's Tale (1985) extrapolates not from a technological capability but from existing patriarchal religious movements; the MaddAddam trilogy (Oryx and Crake, The Year of the Flood, MaddAddam) extrapolates not from imagined biotechnology but from commercially deployed gene editing, patented organisms, and the quiet erosion of regulatory oversight. What makes her work speculative rather than predictive is not that the technologies are invented but that she chooses to let them run out their logic while most of her contemporaries politely decline.

Her technology ethics is ecological and feminist in a single breath. The MaddAddam trilogy pictures a near-future collapsing under corporate-engineered organisms, a post-apocalyptic landscape in which a genetically designed humanoid species — the Crakers, non-violent, herbivorous, sexually governed by pheromonal cycles — survives the human species that made them. The novels ask whether the engineered replacements are a solution or a further crime, and refuse a clean verdict. Oryx and Crake reads like an origin story told by a guilty creator; the later books are carried partly by the slow, patient voices of the religious dissidents (God's Gardeners) and the engineered children, who must build something that does not repeat what destroyed their predecessors.

The Handmaid's Tale is often read primarily as a feminist novel, which it is, but it is also a meditation on the technologies of reproduction — from the clipboard-and-chart clinic to the body itself as a contested tool. The sequel The Testaments (2019) extends that meditation into questions about how systems built on the control of specific bodies perpetuate themselves, and what it would actually take to end them.

For technology ethics, Atwood's contribution is a refusal of the comforting assumption that "we will be careful." Her books insist that the relevant question is not whether a given technology could be used well, but how, in existing political economies, it actually will be. Her late essays and her MaddAddam novels press hard on contemporary debates around bioengineering, species creation, reproductive autonomy, and the collapse of public-interest oversight in an age of privatized research. She is, in the plainest sense, one of the most politically useful novelists on these subjects writing in English.`,
    themes: [
      'Reproductive ethics and bodily autonomy',
      'Bioengineering in deregulated economies',
      'Religious authoritarianism and technology',
      'Ecological collapse and corporate power',
      'The persistence of unjust systems',
    ],
    subgenres: ['Speculative Fiction', 'Feminist Dystopia', 'Climate Fiction'],
    relatedFrameworks: ['deontology', 'environmental-ethics', 'ethics-of-care', 'discourse-ethics'],
    notableWorks: ['The Handmaid\'s Tale', 'The Testaments', 'Oryx and Crake', 'The Year of the Flood', 'MaddAddam'],
    techEthicsFocus: 'The essential novelist of bioengineering, reproductive technology, and ecological collapse in deregulated political economies — her work insists that how a technology gets used is a political and not merely technical question.',
    imageUrl: '/images/authors/margaret_atwood.png',
    imageHint: 'canadian female author contemporary',
  },
];
