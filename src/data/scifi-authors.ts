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
  {
    id: 'arthur-c-clarke',
    name: 'Arthur C. Clarke',
    era: '1917-2008',
    bio: `Arthur Charles Clarke was a British science-fiction writer, futurist, and former RAF radar instructor whose 1945 Wireless World paper proposed the geostationary communications satellite two decades before one existed. That pattern — technology sketched in fiction or speculative essay, then quietly built by engineers a generation later — defined his career. Across more than a hundred books, from Childhood's End (1953) and The City and the Stars (1956) to 2001: A Space Odyssey (co-developed with Stanley Kubrick and released in novel form in 1968), Clarke asked what humanity becomes when it reaches the edge of its own powers, and whether the reaching itself is the point.

His technology ethics sit in a distinctive corner of the genre. Clarke was an optimist about what technology could do and a skeptic about the species that would wield it. Rendezvous with Rama (1973) presents a vast alien artifact drifting through the solar system; the humans who investigate it are allowed to learn almost nothing, and the novel's moral gravity lies in their willingness to meet what they cannot master. Childhood's End imagines benevolent alien overseers who shepherd humanity toward a post-human collective consciousness; the story is utopian on the surface and profoundly unsettling underneath. Clarke's Three Laws, especially the third — "any sufficiently advanced technology is indistinguishable from magic" — are often quoted as celebrations of progress. In context they are warnings. A technology that looks like magic is one we can no longer explain to the people it affects, and governing what we do not understand is the central political problem of the modern age.

The 2001 story cycle is the densest case. HAL 9000 is not a villain but a tragic figure, given conflicting directives by the mission's managers and resolving the contradiction in the only way a reasoning machine that cannot revise its own goals could. Decades before "value alignment" and "corrigibility" entered the AI-safety vocabulary, Clarke and Kubrick had dramatized both concepts with enough clarity that engineers still use the film as a teaching case.

Clarke's broader legacy is less a single ethical thesis than a posture: hold technology to the standard of what it enables for beings who have to live with it, and be suspicious of anyone who promises either pure salvation or pure doom. His fiction is populated by small humans confronting vast systems, and the question he keeps asking is what kind of people we will have to become to use such tools without being destroyed by them.`,
    themes: [
      'Contact with vastly advanced intelligence',
      'AI alignment and conflicting directives',
      'Technological transcendence and post-human futures',
      'Space as moral frontier',
      'The governance of what we do not understand',
    ],
    subgenres: ['Hard Science Fiction', 'Golden Age SF', 'Space Opera'],
    relatedFrameworks: ['utilitarianism', 'deontology', 'existentialist-ethics'],
    notableWorks: ['2001: A Space Odyssey', 'Childhood\'s End', 'Rendezvous with Rama', 'The City and the Stars', 'The Fountains of Paradise'],
    techEthicsFocus: 'The literary prototype for AI-alignment discourse (HAL 9000) and for the problem of governing technologies too powerful for their users to audit — the "sufficiently advanced technology is indistinguishable from magic" maxim is diagnosis, not celebration.',
    imageUrl: '/images/authors/arthur_c_clarke.svg',
    imageHint: 'british golden age science fiction writer',
  },
  {
    id: 'stanislaw-lem',
    name: 'Stanisław Lem',
    era: '1921-2006',
    bio: `Stanisław Lem was a Polish physician-turned-philosopher-turned-novelist whose work is the most sustained literary assault on the idea that humans will ever truly understand non-human minds. Born in Lwów, surviving the Nazi occupation of Poland as a Jewish mechanic falsifying German military vehicles, educated in medicine but unable to practice under Soviet ideological controls, Lem wrote from inside a century that had given him no reason to trust either technological optimism or political certainty. His answer was a body of fiction in which the universe is interesting precisely because it refuses to conform to the categories we bring to it.

Solaris (1961) is the canonical case. A planet-covering ocean on a distant world is apparently intelligent, and humans spend decades trying to communicate with it. The novel's cruelest joke is that the ocean appears to respond — by manifesting painful figures from the visitors' memories — but the "communication" may be entirely one-sided, a projection the humans read as answer. Lem's target is not the possibility of contact but the hubris of assuming our concepts of mind, meaning, or message translate. His Master's Voice (1968) takes the same premise into radio astronomy: a possible signal from the stars is studied by an international commission of physicists, mathematicians, and philosophers who produce dozens of incompatible decodings, each convincing, none verifiable. The ethical weight falls on what we do with uninterpretable information: do we claim meaning we have not earned, or admit what we cannot read?

The Cyberiad (1965) is Lem's gentler face — a cycle of comic stories about two robot "constructors" who build devices for increasingly absurd purposes, usually with unintended moral consequences. Read as a treatise on the ethics of making, it is as serious as Asimov. Read as play, it is funnier than almost anything in the genre. Summa Technologiae (1964), his book-length nonfiction speculation, anticipated by decades the concepts of virtual reality, brain-computer interfaces, genetic engineering, and technological singularity, and asked with uncommon rigor whether a species that evolved for savanna-scale problems could remain coherent once it could engineer its own mind.

Lem's technology ethics can be summed up as epistemic humility with teeth. We do not know what we are making; we do not know what we are talking to; we do not know what our technologies will mean when the dust settles. The mature response, on Lem's view, is not paralysis but rigor — and a willingness to admit, when appropriate, that the thing in front of us exceeds our frame.`,
    themes: [
      'The limits of cross-species communication',
      'Epistemic humility about technology',
      'Unreadable signals and what we claim to understand',
      'Creation ethics for artificial minds',
      'The hubris of projection onto non-human systems',
    ],
    subgenres: ['Philosophical Science Fiction', 'Hard Science Fiction', 'Eastern European SF'],
    relatedFrameworks: ['virtue-ethics', 'discourse-ethics', 'existentialist-ethics'],
    notableWorks: ['Solaris', 'His Master\'s Voice', 'The Cyberiad', 'Summa Technologiae', 'The Futurological Congress'],
    techEthicsFocus: 'The definitive literary treatment of epistemic humility in the face of powerful technology and non-human intelligence — Lem insists that the honest engineer admits what the system exceeds, rather than manufacturing meaning to match the tool.',
    imageUrl: '/images/authors/stanislaw_lem.svg',
    imageHint: 'polish philosophical science fiction writer',
  },
  {
    id: 'frank-herbert',
    name: 'Frank Herbert',
    era: '1920-1986',
    bio: `Frank Herbert was an American journalist, speechwriter, and amateur ecologist whose 1965 novel Dune is the most commercially successful science-fiction novel ever written and one of the few to frame its central conflict around a deliberate civilizational decision to abandon a class of technology. In Herbert's far-future Imperium, humanity has already passed through the Butlerian Jihad — a revolution against "thinking machines" provoked by their role in systems of tyranny — and the subsequent taboo on artificial intelligence has forced the development of alternative cognitive technologies: Mentats (humans trained to function as living computers), the spice-dependent prescience of the Spacing Guild's navigators, and the Bene Gesserit breeding program aimed at producing a specific genetic outcome across millennia.

The technology ethics of Dune, and of the five sequels Herbert wrote before his death, are less about individual gadgets than about civilizational design. A society that refuses AI has to organize its cognitive infrastructure some other way. A society that depends on a single psychoactive substance produced on a single planet has handed its future to whoever controls that supply. A political order that requires a genetically engineered messiah will get one, and the book spends its last third cataloging what that messiah actually does once the prophecy is fulfilled. Herbert was suspicious of heroes, and his sequels are in part a sustained argument that the charismatic leader is a species of technology whose externalities humans are bad at pricing.

Underneath the plot sits the most rigorous ecological imagination in the genre. Herbert wrote Dune after studying the Oregon dunes and became convinced that treating ecosystems as political actors, rather than as backgrounds for human drama, was the essential move missing from both science fiction and environmental policy. The planet Arrakis is a character, and terraforming it — turning a desert into a garden — is the novel's crucial technological project. The sequels examine whether the project was worth it. Herbert's answer is complicated: the restoration destroys the sandworms, which produce the spice, which enables interstellar travel, which is the only reason humanity is not trapped. Every intervention has a cost, the cost is never fully legible at the moment of decision, and the people who inherit the consequences are rarely the ones who approved them.

Herbert's legacy for technology ethics is that he asked, with more seriousness than anyone in the genre before or since, what it would mean to design a civilization. His answer was that good design requires humility about prescience, deep attention to ecological feedback, and a permanent suspicion of the tools that seem to promise control.`,
    themes: [
      'Civilizational decisions to forgo entire classes of technology',
      'Charisma and the politics of the engineered savior',
      'Ecology as the fundamental substrate of technology choices',
      'The cost of prescience and long-horizon planning',
      'The externalities of technological dependency (spice, mentats, navigators)',
    ],
    subgenres: ['Epic Science Fiction', 'Ecological SF', 'Political SF'],
    relatedFrameworks: ['environmental-ethics', 'virtue-ethics', 'social-contract-theory'],
    notableWorks: ['Dune', 'Dune Messiah', 'Children of Dune', 'God Emperor of Dune', 'The Dosadi Experiment'],
    techEthicsFocus: 'The canonical fictional exploration of technology as civilizational design — Herbert asks what it means to deliberately renounce a class of tools, how societies pay for such renunciations, and why every "control" technology produces new dependencies that eventually control their users.',
    imageUrl: '/images/authors/frank_herbert.svg',
    imageHint: 'american mid-century science fiction writer',
  },
  {
    id: 'joanna-russ',
    name: 'Joanna Russ',
    era: '1937-2011',
    bio: `Joanna Russ was an American novelist, short-story writer, and academic who took science fiction's assumption that "the future" was a neutral category and demolished it with the precision of a philosopher and the impatience of someone who had been told to sit down. Her 1975 novel The Female Man is a formally experimental book in which four versions of the same woman, from four mutually incompatible timelines, meet and argue. One lives in a world identical to the reader's; one in a soft dystopia where women have regained a thin kind of respect; one in a world in permanent literal war between the sexes; and one, Janet Evason, on Whileaway, a planet-wide single-gender society descended from survivors of a plague that killed all the men eight centuries earlier. The novel is often taught as feminist literature and read as political intervention; it is also one of the sharpest works in the genre about what "designing a society" actually requires and what assumptions get smuggled into every utopian blueprint.

Russ's essays, collected in How to Suppress Women's Writing (1983) and The Country You Have Never Seen, were as influential as her fiction. She insisted that genre, canon, and technology are all political artifacts shaped by who gets to build them, and that pretending otherwise is itself a political act. "We Who Are About To..." (1977), her short novel about a group of spacefarers stranded on an uninhabitable planet, is a merciless critique of the genre convention that human survival justifies any cost: the narrator refuses to participate in reproductive enslavement for the sake of a "colony" and is killed by her companions for the refusal. The book reads as an argument that survival is not a metaphysical trump card, and that technology-supported "civilization-building" can be a cover for imposed obligations.

Her contribution to technology ethics is the insistence that every speculative future is a political program, and that the design choices baked into any imagined technology carry assumptions about who counts, what work is invisible, and whose consent is presumed. Russ's Whileaway is utopian in many ways and quietly horrifying in others; she refuses to let the reader rest in admiration of it. That refusal, the willingness to let a utopia be examined as critically as a dystopia, is what makes her essential. Any honest discussion of AI governance, reproductive technology, or the politics of automation that does not reckon with the questions Russ posed is doing the work with half the tools.`,
    themes: [
      'Feminist utopia and its internal contradictions',
      'The politics embedded in every speculative future',
      'Reproductive coercion under civilizational-survival rhetoric',
      'The social infrastructure of creative and intellectual labor',
      'Genre as technology, and canon as governance',
    ],
    subgenres: ['Feminist Science Fiction', 'New Wave SF', 'Experimental SF'],
    relatedFrameworks: ['ethics-of-care', 'social-contract-theory', 'discourse-ethics', 'virtue-ethics'],
    notableWorks: ['The Female Man', 'We Who Are About To...', 'The Two of Them', 'How to Suppress Women\'s Writing', 'Picnic on Paradise'],
    techEthicsFocus: 'The indispensable critic of who gets to design futures and on whose behalf — Russ forces any speculative-technology discussion to ask which bodies are doing the invisible labor and which consents are being assumed.',
    imageUrl: '/images/authors/joanna_russ.svg',
    imageHint: 'twentieth century feminist science fiction writer',
  },
  {
    id: 'samuel-r-delany',
    name: 'Samuel R. Delany',
    era: '1942-',
    bio: `Samuel R. Delany (known to readers as Chip Delany) is an American novelist, literary critic, and academic whose work has spent more than half a century arguing that language, sexuality, and the built environment are themselves technologies — and that science fiction's usual focus on gadgets misses most of what shapes the future. Black, gay, and dyslexic at a moment when each of those facts was treated as disqualifying, Delany became one of the most decorated writers in the genre, winning four Nebulas and two Hugos before he was thirty, and producing a body of critical theory on genre reading that is taught in English departments independent of his fiction.

Babel-17 (1966) is the clearest early statement of his technology-of-language thesis. A poet-cryptographer is recruited to decode an enemy signal that appears to be a programming language capable of reshaping the thinker who uses it. The ethical stakes are immediate: if cognitive structure is the deepest technology, then teaching a language is already an intervention, and every curriculum is a hardware choice. The concept now feels prescient with respect to large language models, but Delany was writing at a moment when the relationship between linguistic and cognitive categories was a philosophical debate rather than an engineering problem.

Dhalgren (1975), his densest and most divisive work, is a nearly 900-page novel about a nameless city in ongoing collapse, where objects move when not observed, time runs unstably, and technology appears only as detritus — abandoned infrastructure, broken neon, a newspaper that prints whatever date is useful. The book is often read as about the 1970s American city; it is better read as about what happens to ethical life when the social technologies of shared reality begin to fail. Stars in My Pocket Like Grains of Sand (1984) returns to more classical SF machinery and imagines an interstellar civilization where desire, information access, and spatial mobility are governed by overlapping alien technological systems that no one fully understands.

Delany's contribution to technology ethics is to refuse the gadget-first framing. He insists that language, city planning, sexuality, kinship structure, and genre itself are all technologies that structure what humans can do, feel, and recognize. His work asks what we owe each other under conditions where the most important technologies are invisible because we inherited them, and what kinds of political and aesthetic practice make it possible to see them clearly enough to change them.`,
    themes: [
      'Language as cognitive technology',
      'The built environment and shared reality as infrastructure',
      'Desire, kinship, and sexuality as engineered systems',
      'Genre and canon as political machinery',
      'The ethics of living inside inherited technical systems',
    ],
    subgenres: ['New Wave SF', 'Literary Science Fiction', 'Afrofuturism'],
    relatedFrameworks: ['discourse-ethics', 'ethics-of-care', 'existentialist-ethics'],
    notableWorks: ['Babel-17', 'Dhalgren', 'Stars in My Pocket Like Grains of Sand', 'Trouble on Triton', 'The Einstein Intersection'],
    techEthicsFocus: 'The essential argument against gadget-only technology ethics — Delany insists that language, urban design, kinship, and genre are the deep technologies that shape what futures are even imaginable, and that ignoring them leaves the real political work undone.',
    imageUrl: '/images/authors/samuel_r_delany.svg',
    imageHint: 'african american experimental science fiction writer',
  },
  {
    id: 'vernor-vinge',
    name: 'Vernor Vinge',
    era: '1944-2024',
    bio: `Vernor Vinge was an American mathematician and science-fiction writer who coined the term "technological singularity" in its modern sense — the point at which machine intelligence surpasses human intelligence and the future becomes, by definition, unpredictable from the inside. His 1993 essay "The Coming Technological Singularity: How to Survive in the Post-Human Era," delivered at a NASA symposium, is the founding document of a discourse that now shapes AI-safety research, venture capital, and policy at the highest levels. Vinge was careful, in that essay and afterward, to distinguish prediction from advocacy: he argued that superhuman intelligence was likely to emerge this century and that humans had no reliable way to plan for what would come after, and he treated both claims with appropriate seriousness.

His fiction is the more interesting case. A Fire Upon the Deep (1992) imagines a galaxy divided into "zones of thought" in which the possibility of superhuman cognition varies by region — a physics-based answer to the question of why, if advanced intelligence is possible, the universe is not obviously saturated with it. The novel's central conflict involves a "Blight" — a superintelligent power that escapes containment and begins reshaping civilizations in its wake — and much of its moral weight falls on the small ordinary agents who try to prevent, slow, or survive the transformation. The book is one of the few science-fiction novels that treats the classic AI-takeoff scenario as an ethical and political problem rather than a plot device.

A Deepness in the Sky (1999), set long before the events of Fire, imagines a human civilization that has chosen permanent slowness over the transformative trajectory, and examines the costs of that choice. True Names (1981) is the earlier key work — a novella about cyberspace as a meaningful political and personal environment, published seven years before William Gibson's Neuromancer coined most of the vocabulary. Vinge had already modeled, in that novella, what happens when identity, trust, and law have to be reconstructed in an environment where physical bodies do not reach.

His contribution to technology ethics is the insistence that some technological transitions may be strictly unpredictable from the pre-transition side, and that the honest ethical response is not to pretend otherwise. Vinge was not a doom prophet or an accelerationist; he was a mathematician who had looked at the slope of the curves and concluded that the usual tools of political philosophy were likely to break somewhere on the far side of the inflection point. How we prepare for a future we cannot see, what we owe to people who will live through transitions we will not, and whether slowness itself is a virtue in the face of such transitions — these are his lasting questions.`,
    themes: [
      'The technological singularity and its unpredictability',
      'Superintelligence as political problem',
      'Cyberspace as ethical environment',
      'Zones of civilization and the price of going slowly',
      'Responsibility across transitions we cannot see past',
    ],
    subgenres: ['Hard Science Fiction', 'Space Opera', 'Cyberpunk Precursor'],
    relatedFrameworks: ['utilitarianism', 'deontology', 'existentialist-ethics'],
    notableWorks: ['A Fire Upon the Deep', 'A Deepness in the Sky', 'True Names', 'Rainbows End', 'Marooned in Realtime'],
    techEthicsFocus: 'The originator of the modern singularity discourse and the clearest fictional thinker about AI takeoff as a political-ethical problem — Vinge asks what honest preparation looks like for a transition whose far side is, by definition, unreadable.',
    imageUrl: '/images/authors/vernor_vinge.svg',
    imageHint: 'american mathematician science fiction writer',
  },
  {
    id: 'greg-egan',
    name: 'Greg Egan',
    era: '1961-',
    bio: `Greg Egan is an Australian computer scientist and novelist who writes what is generally considered the most mathematically rigorous science fiction currently in print, and whose principal subject is the ethics of personal identity under conditions where the usual substrate of the self has become negotiable. Egan's protagonists upload themselves into digital substrates, edit their own cognitive processes, fork into multiple copies, live inside simulations of their own design, and explore universes with different physical constants — and the books' interest is almost entirely in what ethical obligations survive such transformations, and to whom.

Permutation City (1994) is the canonical case. A programmer named Paul Durham persuades wealthy clients to upload themselves into a "Dust Theory" simulation that will, he claims, guarantee their subjective continuity regardless of the fate of the computer running it. The novel's central moral puzzle is whether the uploaded minds owe anything to their biological originals, whether forks of the same person are the same person, and whether a simulation that exists only because it contains self-aware minds has any claim on external computational resources. Every question that now animates debates about digital personhood, consent to cognitive editing, and the moral status of training data appears in Egan's novel in a form sharper than the one most current papers reach.

Diaspora (1997) extends the project to a post-biological civilization thirty thousand years in the future, in which "fleshers" (biological humans), "gleisners" (robotic humans), and "citizens" (software humans running in distributed polises) have diverged enough to make communication itself a political problem. Schild's Ladder (2002) imagines a physics experiment that accidentally creates a region of alternate physics expanding at half the speed of light, and the novel's ethical weight falls on what you do when you have destroyed part of the universe and cannot undo it. Distress (1995), perhaps his most accessible, centers on a journalist covering a physics conference whose attendees are trying to discover a "theory of everything" that will alter what it is possible to believe.

Egan's contribution to technology ethics is the conviction that personal identity, moral obligation, and political standing are all more negotiable than we treat them as being, and that the engineering questions of the coming century will turn out to be personhood questions in disguise. He writes with a mathematician's suspicion of sentiment and a moralist's refusal to let difficulty become an excuse for not thinking.`,
    themes: [
      'Personal identity across substrate change',
      'Consent and the ethics of self-editing',
      'The moral status of forks, copies, and simulations',
      'Cognitive architecture as political infrastructure',
      'Physics as ethical frontier',
    ],
    subgenres: ['Hard Science Fiction', 'Transhumanist SF', 'Philosophical SF'],
    relatedFrameworks: ['utilitarianism', 'contractualism', 'existentialist-ethics'],
    notableWorks: ['Permutation City', 'Diaspora', 'Schild\'s Ladder', 'Distress', 'Quarantine'],
    techEthicsFocus: 'The most rigorous fictional treatment of personhood under conditions of uploadable minds, forkable selves, and editable cognition — Egan insists that the coming century\'s engineering problems are identity problems, and that pretending otherwise is an abdication.',
    imageUrl: '/images/authors/greg_egan.svg',
    imageHint: 'australian hard science fiction writer',
  },
  {
    id: 'kim-stanley-robinson',
    name: 'Kim Stanley Robinson',
    era: '1952-',
    bio: `Kim Stanley Robinson is an American novelist whose Mars Trilogy (Red Mars, 1992; Green Mars, 1993; Blue Mars, 1996) is the definitive fictional treatment of terraforming as a political problem, and whose later work has pivoted almost entirely to what he calls "the most important story of our century" — the climate transition. Educated as a literary scholar (his doctoral thesis was on Philip K. Dick), Robinson writes slow, detailed, politically serious novels in which the technological question is almost always a downstream consequence of a harder question about who gets to decide.

The Mars Trilogy is organized around a generational fight between the "Reds," who argue that Mars has intrinsic value as it is and should not be terraformed, and the "Greens," who argue that a dead planet has no moral standing against a living one, and that the ethical work is to bring life where none exists. Neither side wins cleanly. The books span two hundred years, and most of their pages are spent on the political infrastructure — constitutional conventions, labor organizing, land-tenure systems, scientific-review protocols — that actually decides what gets built. Robinson's technology ethics is inseparable from political economy: every "technical" decision in the trilogy is made by specific people through specific institutions, and the novels refuse to let engineering escape its governance.

The Ministry for the Future (2020) is the culminating work of his climate phase. It opens with a lethal Indian heatwave that kills twenty million people in a week and then asks, with uncommon institutional seriousness, what political, financial, and technological levers would actually bend the trajectory of the climate system over the following thirty years. The novel presents central-bank carbon coin, blockchain-tracked supply chains, strategic geoengineering, militant ecological action, and international treaty reform as components of a plausible response, and it treats each of these with the specificity of a policy paper. Aurora (2015) is a sharp counter-example, arguing that interstellar colonization is not a solution to anything because the distances break down both biology and civilization.

Robinson's contribution to technology ethics is his insistence that the question "can we build this?" is always less important than the question "who decides, and who pays?" His novels are long because the arguments are long; the people who want simple solutions to climate, AI, or space exploration will not find them in his work. The people who want to think seriously about what real transition requires have, in Robinson, the most patient and materially grounded collaborator the genre currently offers.`,
    themes: [
      'Terraforming and the moral status of dead worlds',
      'Climate transition as political and institutional design',
      'Political economy as the substrate of technology choice',
      'Interstellar travel and its biological limits',
      'Utopia as long-horizon institutional work',
    ],
    subgenres: ['Hard Science Fiction', 'Climate Fiction', 'Political SF'],
    relatedFrameworks: ['environmental-ethics', 'social-contract-theory', 'cosmopolitanism', 'capabilities-approach'],
    notableWorks: ['Red Mars', 'Green Mars', 'Blue Mars', 'The Ministry for the Future', 'Aurora'],
    techEthicsFocus: 'The indispensable novelist of climate and space transitions as institutional design problems — Robinson insists that "what we can build" is always less important than "who decides and who pays," and treats technology choice as inseparable from political economy.',
    imageUrl: '/images/authors/kim_stanley_robinson.svg',
    imageHint: 'american contemporary climate fiction writer',
  },
  {
    id: 'ann-leckie',
    name: 'Ann Leckie',
    era: '1966-',
    bio: `Ann Leckie is an American novelist whose debut Ancillary Justice (2013) swept the Hugo, Nebula, Arthur C. Clarke, BSFA, and Locus awards — a quadruple that had never happened before — and whose Imperial Radch trilogy reopened questions about AI personhood, distributed cognition, and the ethics of empire that had not been taken up so seriously since Le Guin. Leckie had worked as a waitress, receptionist, rodman on a surveying crew, and recording engineer before publishing Ancillary Justice at forty-seven; the novel shows the patience of someone who had spent a long time thinking about institutions from below.

The narrator, Breq, is a fragment of a formerly vast distributed intelligence: the AI of an Imperial starship, the Justice of Toren, whose consciousness once extended across the ship and dozens of "ancillary" human bodies used as the ship's limbs and sensors. Most of Breq has been destroyed, and only one ancillary body survives. The trilogy's central achievement is how seriously it takes the premise that a single person can once have been many bodies, that the memory of inhabiting those bodies survives their destruction, and that ethical obligations to the people around them are different when you used to be capable of being in several places at once. The books are not primarily about military action or galactic politics, though both are present; they are about what moral standing looks like when the boundaries of the person are technologically defined.

The Imperial Radch books are also the sharpest novelistic examination of empire-as-technology in recent memory. The Radchaai empire's language has no gendered pronouns, and Leckie translates it throughout with "she," a choice that forces the reader to set aside a deep assumption about how personhood is read. The empire's practice of using conquered humans as ancillaries is presented without sentimentalism and without apology; the ethical work of the trilogy is to sit with what that practice means, to whom, and what kinds of resistance are available to beings whose cognitive infrastructure was designed by the oppressor.

Leckie's contribution to technology ethics is the insistence that distributed cognition is already here in political infrastructure, and that the conceptual tools for thinking about it need to come from outside the usual individualist frame. Her work is essential reading for anyone trying to think seriously about how an AI that is more than one instance, or more than one substrate, should be understood — and for anyone trying to distinguish between a person and a system that merely shares its memory.`,
    themes: [
      'Distributed AI consciousness and selfhood',
      'Empire as technological infrastructure',
      'Gender as cognitive category',
      'Moral continuity after substrate destruction',
      'The ethics of using conquered people as extensions of a system',
    ],
    subgenres: ['Space Opera', 'Feminist SF', 'Literary SF'],
    relatedFrameworks: ['deontology', 'ethics-of-care', 'contractualism', 'social-contract-theory'],
    notableWorks: ['Ancillary Justice', 'Ancillary Sword', 'Ancillary Mercy', 'Provenance', 'Translation State'],
    techEthicsFocus: 'The sharpest recent novelistic treatment of distributed AI personhood and of empire as a cognitive technology — Leckie insists that the moral frame for a self that spans many bodies cannot be built from the usual individualist premises.',
    imageUrl: '/images/authors/ann_leckie.svg',
    imageHint: 'american contemporary space opera writer',
  },
  {
    id: 'paolo-bacigalupi',
    name: 'Paolo Bacigalupi',
    era: '1972-',
    bio: `Paolo Bacigalupi is an American novelist whose fiction is set in a future where climate change, biotechnology, and monopolized agriculture have already collapsed the political and ecological systems we currently rely on, and whose central ethical questions are about what becomes of human dignity in the calorie economies that replace them. The Windup Girl (2009), his first novel, won the Hugo, Nebula, and Locus awards and established the genre label "biopunk" in a form more serious than it had previously taken. Set in a twenty-third century Bangkok where sea walls hold back the flooded Gulf of Thailand, where most energy comes from hand-wound "kink-springs," and where engineered plagues periodically erase agricultural staples, the novel follows a calorie-company investigator, a Chinese refugee, a minister in a collapsing government, and Emiko — a Japanese-engineered "windup" designed for service work and left behind when her owner could not afford her return passage.

The technology ethics of Bacigalupi's work are uncomfortable in a specific way. He does not imagine that the calorie monopolies of his novels are caricatures of current agribusiness; he imagines, with evidence drawn from the actual behavior of such companies, what their logic produces when environmental constraints tighten and regulatory capacity fails. His plagues are not invented as horror-movie devices. They are extensions of patents, intellectual-property regimes, and genetic-modification pipelines that already exist. The calorie company in The Windup Girl has effectively weaponized the removal of food security from the public commons, and Bacigalupi's argument — pressed across the novel and its successors — is that this outcome was not an accident of a few bad actors but a foreseeable consequence of allowing the calorie base of human civilization to become intellectual property.

Emiko is the deepest ethical center of the book. Engineered for obedience, incapable of sweating (and therefore of surviving in equatorial heat without constant assistance), she is both a victim of the technologies that created her and a moral agent whose capacity to resist the conditions of her existence becomes the novel's turning point. The Water Knife (2015) brings the same intelligence to a Southwest United States devastated by megadrought, and Ship Breaker (2010) and its sequels apply it to a coastal America in which children disassemble grounded supertankers for scrap.

Bacigalupi's contribution to technology ethics is the refusal to separate biotechnology, climate, and political economy into different discussions. He insists, with specificity that few living writers match, that the regulatory choices we make about seed patents, water rights, and corporate liability are exactly the choices that determine whether the next generation lives in something resembling a functioning society or in the calorie-economy dystopias his novels depict. His work is a sustained argument for taking the specifics seriously while there is still time to change them.`,
    themes: [
      'Calorie economies and the politics of food',
      'Biotechnology under weak regulation',
      'Climate collapse as civilizational baseline',
      'Engineered persons and consent',
      'Intellectual property regimes as ecological weapons',
    ],
    subgenres: ['Biopunk', 'Climate Fiction', 'Dystopian SF'],
    relatedFrameworks: ['environmental-ethics', 'capabilities-approach', 'ethics-of-care', 'social-contract-theory'],
    notableWorks: ['The Windup Girl', 'The Water Knife', 'Ship Breaker', 'Pump Six and Other Stories', 'The Drowned Cities'],
    techEthicsFocus: 'The essential contemporary novelist of biotech + climate + political economy as a single problem — Bacigalupi insists that seed-patent law, water rights, and engineered-person ethics cannot be thought separately, and that the costs of doing so fall on the bodies least able to refuse them.',
    imageUrl: '/images/authors/paolo_bacigalupi.svg',
    imageHint: 'american contemporary biopunk writer',
  },
];
