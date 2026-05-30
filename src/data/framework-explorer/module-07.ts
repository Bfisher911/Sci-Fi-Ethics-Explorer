import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 7 — Education, Creativity, and Intellectual Work
 * Difficulty 2–4. AI in education, authorship, student work, plagiarism,
 * creative tools, and human learning.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'A student submits an excellent essay you suspect was largely AI-written, but you cannot prove it and detectors are unreliable. The work meets the rubric. How do you handle the grade?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Grade the work as submitted; accusing without proof wrongs the student more than a possible cheat helps.', frameworkWeights: { 'rights-based-ethics': 2, deontology: 1 } },
      { id: 'b', text: 'Have an honest conversation to understand their process before judging, treating them as a person not a case.', frameworkWeights: { 'ethics-of-care': 2, 'discourse-ethics': 1 } },
      { id: 'c', text: 'Redesign assessment so the question becomes moot — oral defense, in-class work, process artifacts.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Apply the academic-integrity policy\'s standard of evidence consistently, whatever it yields here.', frameworkWeights: { 'justice-ethics': 1, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'An AI tutor could give students answers instantly or withhold them to force productive struggle. Students prefer instant answers and rate the app higher for it, but learn less deeply. How do you design it?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Design for productive struggle; what students become able to do matters more than their satisfaction.', frameworkWeights: { 'capabilities-approach': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Scaffold hints toward the answer rather than giving or withholding it outright.', frameworkWeights: { 'pragmatist-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'c', text: 'Let learners choose their mode, with honest framing of the learning tradeoff.', frameworkWeights: { autonomy: 2 } },
      { id: 'd', text: 'Optimize for measured learning gains even if ratings dip; the tool exists to teach.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Your university can adopt AI proctoring that watches students via webcam during exams, flagging "suspicious" behavior. It deters cheating but is invasive, error-prone, and stressful, especially for some students. Adopt it?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — surveilling students in their bedrooms and flagging the anxious treats them all as suspects.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'No — error-prone flags that fall hardest on already-stressed students are unjust.', frameworkWeights: { 'justice-ethics': 2 } },
      { id: 'c', text: 'No — redesign assessment to be cheat-resistant rather than police it through surveillance.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Only with student input and meaningful alternatives for those who object.', frameworkWeights: { 'discourse-ethics': 2, 'ethics-of-care': 1 } },
    ],
  },
  {
    questionText:
      'A generative tool lets students produce polished art/music/writing far beyond their own skill. Some teachers say it democratizes creativity; others say it short-circuits the growth that creating is supposed to build. Allow it in class?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Allow it as a tool while keeping assignments that build the underlying craft and judgment.', frameworkWeights: { 'pragmatist-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'Allow it; expanding who can express themselves creatively is a genuine good.', frameworkWeights: { 'capabilities-approach': 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Limit it early; the struggle of making something yourself is part of what education is for.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'd', text: 'Let students and teachers decide together what role it plays in their learning.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'You build an AI grader that scores essays consistently and instantly, freeing teachers\' time. It judges structure well but cannot recognize a brilliant, rule-breaking essay the way a great teacher would. Deploy it?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Use it for routine feedback but never as the final judge of a student\'s creative work.', frameworkWeights: { 'pragmatist-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Avoid it for grading; reducing a student\'s thinking to what a rubric-bot can see fails them.', frameworkWeights: { 'capabilities-approach': 2, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Deploy it; consistent, instant feedback at scale helps far more students than the rare genius it misses.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'd', text: 'Deploy only with a clear path for students to appeal to a human reader.', frameworkWeights: { 'justice-ethics': 1, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'A famous author\'s style can be perfectly imitated by a model trained on their books. A startup wants to sell "write in their voice" as a feature. The author objects but the training was legal. Should the feature ship?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'No — appropriating a living creator\'s distinctive voice over their objection wrongs them.', frameworkWeights: { 'rights-based-ethics': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'No — a fair system is one the author could accept; selling their voice without consent fails that test.', frameworkWeights: { contractualism: 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Only with the author\'s consent and a share of the revenue.', frameworkWeights: { 'justice-ethics': 1, autonomy: 1 } },
      { id: 'd', text: 'Yes — style is not ownable, and imitation has always been part of how culture works.', frameworkWeights: { consequentialism: 1, 'pragmatist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'An AI can write a student\'s college recommendation letter from a few prompts, saving an overworked teacher hours. The letter would be polished but generic, and the student would never know it was AI-drafted. Use it?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'No — a recommendation is a personal vouching; outsourcing it secretly hollows out its meaning.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'b', text: 'Use it as a first draft you then make genuinely personal and true to the student.', frameworkWeights: { 'pragmatist-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'c', text: 'No — the student and colleges are owed an honest, human attestation, not a generated one.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'd', text: 'Use it; a polished letter helps the student and the time saved goes back to teaching.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A school wants to give every student an AI learning companion that remembers everything about their academic struggles for years. It could personalize beautifully — and create a permanent record of every weakness. Build it?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Only with strict limits on retention and who can see it; a child\'s every struggle should not become a file.', frameworkWeights: { 'rights-based-ethics': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Build it; deep personalization could genuinely transform learning for many children.', frameworkWeights: { 'capabilities-approach': 2, utilitarianism: 1 } },
      { id: 'c', text: 'Give students and families control over the memory — what is kept, seen, and forgotten.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Be cautious; a permanent record of a child\'s weaknesses can shape their path in ways we cannot foresee.', frameworkWeights: { 'ethics-of-care': 1, stoicism: 1 } },
    ],
  },
  {
    questionText:
      'Researchers on your team want to use an AI to generate dozens of paper drafts and submit the most promising, accelerating output. It is not fabrication, but it industrializes authorship. Is this acceptable scholarship?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — scholarship is about understanding, and gaming volume corrupts what research is for.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'b', text: 'Acceptable only with full disclosure of the method so the community can judge the work fairly.', frameworkWeights: { 'discourse-ethics': 2, deontology: 1 } },
      { id: 'c', text: 'Acceptable if the resulting work is genuinely sound and adds knowledge, however it was drafted.', frameworkWeights: { consequentialism: 2, 'pragmatist-ethics': 1 } },
      { id: 'd', text: 'No — flooding the literature degrades a shared resource everyone relies on.', frameworkWeights: { 'justice-ethics': 1, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'Your ed-tech product could be free for under-resourced schools (subsidized by wealthy districts) or priced uniformly (simpler, but leaving poor schools unable to afford it). Which pricing serves education better?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Subsidized access; learning tools should reach the students who need them most, not just those who can pay.', frameworkWeights: { 'justice-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'Subsidized; a child\'s opportunity should not hinge on their district\'s wealth.', frameworkWeights: { cosmopolitanism: 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Subsidized via a sustainable cross-subsidy model that keeps the company viable.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Uniform pricing; simplicity and viability let you serve the most schools reliably over time.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A student with a learning disability uses AI assistance that levels the playing field for them, but the same tool would be "cheating" for others. Where do you draw the line on permitted assistance?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Permit assistance that restores fair access to learning, distinguishing accommodation from shortcut.', frameworkWeights: { 'justice-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'Focus on each student\'s genuine needs rather than a blanket rule that fits no one well.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'c', text: 'Define clear, consistent norms for tool use the whole class understands and agrees to.', frameworkWeights: { 'social-contract-theory': 1, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Redesign assessment so the tool helps everyone learn rather than gatekeeping who may use it.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'An AI can summarize any book so well students rarely need to read the original. Comprehension scores stay high; the experience of deep reading fades. Should your platform offer one-click full summaries?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Offer summaries as a study aid but design coursework that still requires real engagement with texts.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'b', text: 'Be cautious; the slow work of reading shapes minds in ways a summary cannot replace.', frameworkWeights: { 'virtue-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'c', text: 'Offer them; what matters is whether students learn, and summaries can support that.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Let learners decide how to engage, with honesty about what deep reading offers.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'A teacher wants to publicly post AI-generated "exemplary" versions of student assignments as models. It helps learners see quality but may make their own honest attempts feel inadequate. Post them?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Use real, attainable student work as models; AI "perfection" sets a discouraging false bar.', frameworkWeights: { 'ethics-of-care': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'Post AI exemplars clearly labeled, so students learn from them without mistaking them for peer work.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Avoid it; modeling growth honestly matters more than showcasing machine-made polish.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'd', text: 'Post them; clear models of quality help most students improve, on balance.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Your platform can detect when students collaborate on assignments meant to be individual. Strict enforcement catches cheating but also penalizes healthy peer learning that blurs the line. How strict do you make it?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Lenient and educational; healthy collaboration is so valuable that over-policing it harms learning.', frameworkWeights: { 'ethics-of-care': 1, 'capabilities-approach': 1 } },
      { id: 'b', text: 'Clear shared norms about what counts as collaboration vs. cheating, set with students.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1 } },
      { id: 'c', text: 'Redesign assignments so collaboration is either fully allowed or genuinely unnecessary.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Consistent enforcement of the stated rule; fairness to honest students requires it.', frameworkWeights: { 'justice-ethics': 1, deontology: 1 } },
    ],
  },
  {
    questionText:
      'An AI can write personalized encouragement to every struggling student daily — warm, attentive messages indistinguishable from a caring teacher\'s, but not actually from a person. Deploy it to support overwhelmed students?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — care that the student believes is human but is not is a quiet deception about something tender.', frameworkWeights: { deontology: 1, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Deploy it transparently as AI support, supplementing not impersonating human care.', frameworkWeights: { autonomy: 1, 'ethics-of-care': 1 } },
      { id: 'c', text: 'Deploy it; many students get no encouragement at all, and real comfort delivered is real good.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Use it to prompt and free up human teachers to give the care, not to replace them.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A coding bootcamp can use AI to let students "complete" projects they could not build themselves, boosting graduation and placement stats — but graduates may lack the skills employers expect. What do you prioritize?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Genuine skill; graduating people who cannot do the work fails them and their future employers.', frameworkWeights: { 'capabilities-approach': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Honesty about what graduates can actually do; inflated stats are a form of deception.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Teach AI-augmented work realistically — the skill is now working well WITH these tools.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Weigh placement outcomes against skill gaps and aim for what serves graduates long-term.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Your research lab can release a dataset that would accelerate everyone\'s work, but it took years to build and releasing it surrenders your competitive edge. Open it, embargo it, or keep it private?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Open it; shared knowledge advances the whole field and others\' learning more than your edge is worth.', frameworkWeights: { cosmopolitanism: 1, utilitarianism: 1 } },
      { id: 'b', text: 'Open it; contributing to the commons is part of what it means to be a good member of a field.', frameworkWeights: { 'virtue-ethics': 1, 'ubuntu-ethics': 1 } },
      { id: 'c', text: 'Embargo briefly to publish first, then open it — balancing fair credit with shared benefit.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Keep your edge; the resources to build it earn you the right to its advantage.', frameworkWeights: { 'rights-based-ethics': 1, consequentialism: 1 } },
    ],
  },
  {
    questionText:
      'An AI can generate endless practice problems tuned to each student, but always in the styles it has seen, subtly narrowing what students are exposed to. Rely on it for curriculum, or keep human-curated breadth?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Keep human-curated breadth; a curriculum that quietly narrows what students meet impoverishes them.', frameworkWeights: { 'capabilities-approach': 2 } },
      { id: 'b', text: 'Blend them; use AI for volume and humans to guard breadth and surprise.', frameworkWeights: { 'pragmatist-ethics': 3 } },
      { id: 'c', text: 'Rely on it; personalized practice at scale helps most students more than curated breadth they skip.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Let teachers and students shape the balance for their own goals.', frameworkWeights: { autonomy: 1, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A student asks you to keep their use of mental-health-related AI tools confidential, but you suspect they may be in crisis. Educational privacy and duty-of-care pull against each other. What do you do?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Prioritize their safety; when someone may be in crisis, care outweighs strict confidentiality.', frameworkWeights: { 'ethics-of-care': 2, utilitarianism: 1 } },
      { id: 'b', text: 'Honor confidentiality except where there is genuine, serious risk, the established ethical line.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Talk with them first, seeking their consent to involve help rather than acting over their head.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Follow the institution\'s clear, pre-agreed protocol for exactly this situation.', frameworkWeights: { 'social-contract-theory': 2 } },
    ],
  },
  {
    questionText:
      'Your platform can let creators train custom AI on their own past work to scale their output, but this could flood their field with derivative "their-style" content and devalue original work, including their own. Offer it?',
    technologyTopic: 'Education and Creativity',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Offer it; creators have the right to use their own work however they choose.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Offer it but help creators see the long-term risk to the value of their craft.', frameworkWeights: { 'ethics-of-care': 1, 'pragmatist-ethics': 1 } },
      { id: 'c', text: 'Be cautious; flooding a creative field with derivatives degrades a shared cultural good.', frameworkWeights: { 'virtue-ethics': 1, 'justice-ethics': 1 } },
      { id: 'd', text: 'Offer it; the productivity and reach it gives creators outweigh speculative field-level harms.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
];

export const module07 = buildModule(
  {
    id: 'framework_module_07',
    moduleNumber: 7,
    title: 'Education, Creativity, and Intellectual Work',
    description:
      'When AI reshapes learning, authorship, and creative growth — what is gained and quietly lost.',
    focus:
      'Academic integrity, productive struggle, proctoring, authorship, access, and human learning.',
    technologyTopic: 'Education and Creativity',
  },
  seeds,
);
