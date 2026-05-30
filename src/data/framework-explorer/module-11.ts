import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 11 — Leadership and Institutional Decisions
 * Difficulty 3–4. Executive decisions, policy tradeoffs, organizational
 * responsibility, transparency, and public accountability.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'As CEO, you learn a shipped product has a flaw that harms a small number of users in ways most will never notice. A recall is expensive and would damage the company; quiet patching leaves some already harmed. What do you do?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Disclose and make affected users whole, whatever the cost; accountability is non-negotiable.', frameworkWeights: { 'rights-based-ethics': 1, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Disclose; people harmed by your product are owed the truth and a remedy, not silence.', frameworkWeights: { deontology: 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Weigh the harm already done and the company\'s survival, and choose the course with least total harm.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Handle it as you\'d want a company to handle harm done to you or your family.', frameworkWeights: { 'ethics-of-care': 2 } },
    ],
  },
  {
    questionText:
      'Your board pressures you to hit quarterly numbers by delaying a costly but important ethics-and-safety investment. You can comply, push back, or threaten to resign. What is the responsible move?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Push back firmly with the case; a leader\'s job includes protecting what the numbers tempt you to cut.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'b', text: 'Make the long-term risk and obligation explicit to the board so the decision is fully informed.', frameworkWeights: { 'discourse-ethics': 2, deontology: 1 } },
      { id: 'c', text: 'Argue it on consequences: deferring safety usually costs far more than it saves.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Hold the line on a duty you cannot defer, even at personal cost to your position.', frameworkWeights: { 'rights-based-ethics': 1, deontology: 1 } },
    ],
  },
  {
    questionText:
      'A major client wants a feature that would technically comply with the law but enable behavior you find ethically troubling. Refusing loses significant revenue your team\'s jobs may depend on. Build it?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Refuse; legal cover does not make enabling harm something you should build.', frameworkWeights: { 'virtue-ethics': 2, deontology: 1 } },
      { id: 'b', text: 'Refuse, but work hard to protect the team affected by the lost revenue.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'c', text: 'Weigh the troubling use against the jobs and revenue, and decide by the larger harm or good.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Decline what you could not justify to the people the feature would ultimately affect.', frameworkWeights: { contractualism: 2 } },
    ],
  },
  {
    questionText:
      'An internal audit reveals your company\'s celebrated diversity metrics are misleading — technically true but spun. Correcting the record is embarrassing and could hurt recruiting. Do you set it straight publicly?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Correct it; integrity means owning uncomfortable truths, not just convenient ones.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'b', text: 'Correct it; stakeholders relied on those numbers and are owed accuracy.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Correct it and use it to drive real change, since honest accounting is how injustice gets fixed.', frameworkWeights: { 'justice-ethics': 2 } },
      { id: 'd', text: 'Correct it transparently; trust lost to a quiet cover-up costs more than the embarrassment.', frameworkWeights: { consequentialism: 1, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'You can set company policy to either move fast and fix harms as they emerge, or move slowly with heavy review that prevents harms but lets competitors win the market. Which institutional posture do you choose?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Cautious review; preventing foreseeable harm to people outweighs winning a market race.', frameworkWeights: { 'rights-based-ethics': 1, deontology: 1 } },
      { id: 'b', text: 'A calibrated pace — fast on low-risk work, careful on high-stakes — rather than one blanket rule.', frameworkWeights: { 'pragmatist-ethics': 3 } },
      { id: 'c', text: 'Weigh harms prevented against the good of leading the market and choose the better expected outcome.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Build the kind of organization whose culture takes care before speed as a matter of character.', frameworkWeights: { 'virtue-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A government offers your company a lucrative contract to build surveillance infrastructure with legitimate public-safety uses and obvious potential for abuse by future administrations. Take the contract?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Decline; building tools whose abuse you can foresee makes you responsible for that abuse.', frameworkWeights: { 'rights-based-ethics': 2, deontology: 1 } },
      { id: 'b', text: 'Take it only with binding, enforceable limits on use that survive a change of government.', frameworkWeights: { 'social-contract-theory': 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Weigh genuine public-safety benefit against the long-run risk of authoritarian misuse.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Subject the decision to open scrutiny rather than deciding behind closed doors.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'An employee raises a serious ethical concern about a product through internal channels and is being quietly sidelined by their manager. As a senior leader who hears about it, how do you respond?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Protect the employee and investigate the concern; punishing conscience destroys an ethical culture.', frameworkWeights: { 'virtue-ethics': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Ensure the concern gets a fair, real hearing on its merits, separate from office politics.', frameworkWeights: { 'discourse-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Stand with the person at personal risk; that\'s what someone who is being wronged needs from you.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'd', text: 'Recognize that how the company treats this case shapes whether anyone ever speaks up again.', frameworkWeights: { consequentialism: 1, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'Your organization can publish a detailed, honest "what we got wrong" retrospective after a product failure (rare, builds long-term trust, invites criticism) or a polished spin. Which do you authorize?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'The honest retrospective; institutions earn trust by owning failure, not by managing it away.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'b', text: 'The honest version; the public and users affected deserve a truthful account.', frameworkWeights: { 'rights-based-ethics': 1, deontology: 1 } },
      { id: 'c', text: 'The honest version; transparency drives the learning that prevents the next failure.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'The honest version; long-run trust is worth more than short-run reputation management.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'You are designing your company\'s AI ethics governance. You can build a strong independent board with real veto power (slows things, may clash with execs) or an advisory one (smoother, easily overridden). Which?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'A board with real power; oversight you can override at will is theater, not accountability.', frameworkWeights: { 'social-contract-theory': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Real power; binding yourself to genuine checks is exactly what integrity under pressure requires.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Real, structured authority with clear scope so it constrains without paralyzing.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Real power including affected outside voices, since those impacted deserve a say in the checks.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A crisis forces layoffs. You can be fully transparent about the criteria (painful, invites disputes) or vague (smoother, less accountable). You can also cut deepest where it is easiest or where it is fairest. What guides you?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Transparent, fair criteria applied consistently; people losing jobs deserve a process they can trust.', frameworkWeights: { 'justice-ethics': 2, 'discourse-ethics': 1 } },
      { id: 'b', text: 'Treat departing people with dignity and real support; how you let people go reveals who you are.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Cut to preserve the most jobs and the company\'s ability to recover and rehire.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Honor commitments made to employees as far as possible, not just what is legally minimal.', frameworkWeights: { deontology: 1, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'Your company\'s lobbying could shape regulation in your favor at the public\'s expense, or you could advocate for rules that are good for society even where they constrain you. How should your government-affairs strategy be set?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Advocate for rules good for the public; influence is a stewardship, not just a weapon for self-interest.', frameworkWeights: { 'virtue-ethics': 1, 'justice-ethics': 1 } },
      { id: 'b', text: 'Support rules that could be justified to everyone affected, not just to shareholders.', frameworkWeights: { contractualism: 2 } },
      { id: 'c', text: 'Recognize that capturing regulation erodes the institutions everyone, including you, depends on.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'd', text: 'Weigh the long-run societal and reputational costs of self-serving lobbying against the short gain.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A beloved long-term employee is no longer performing as the company\'s technology has changed. You can invest heavily in retraining them (costly, uncertain) or let them go (cleaner, colder). What is right?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Invest in retraining; loyalty given over years creates obligations a company should honor.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Invest in their capability to adapt; people are worth developing, not just deploying.', frameworkWeights: { 'capabilities-approach': 2 } },
      { id: 'c', text: 'Make a genuine, time-bounded effort, then decide honestly if it isn\'t working.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Weigh the cost and odds of retraining against the company\'s and team\'s needs.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Investors want you to adopt an addictive engagement model that would boost growth and valuation. You believe it harms users but it is legal and standard. As founder, what do you do with your influence?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Refuse to build harm into the product; growth bought by hurting users is not success.', frameworkWeights: { 'virtue-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Refuse; you could not justify it to the users whose wellbeing it trades away.', frameworkWeights: { contractualism: 2 } },
      { id: 'c', text: 'Make the case that user harm is long-run business risk, aligning ethics with the numbers.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'd', text: 'Use your founder leverage to protect users even against investor pressure.', frameworkWeights: { 'ethics-of-care': 1, deontology: 1 } },
    ],
  },
  {
    questionText:
      'A nation in crisis asks your company to keep services running there at a loss to avoid cutting millions off, even though staying exposes you to legal and political risk. Stay, leave responsibly, or leave fast?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Stay if you safely can; people in crisis depending on your service have a real claim on you.', frameworkWeights: { 'ethics-of-care': 1, cosmopolitanism: 1 } },
      { id: 'b', text: 'Leave responsibly if you must, with notice and transition, never abandoning users abruptly.', frameworkWeights: { 'social-contract-theory': 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Weigh the good of continued service against the real risks to the company and its other users.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Treat the affected millions as people whose interests count as fully as your own exposure.', frameworkWeights: { cosmopolitanism: 2 } },
    ],
  },
  {
    questionText:
      'You can structure your company\'s data practices to be genuinely privacy-protective by design (a competitive handicap) or merely compliant (industry-standard, more profitable). What standard do you set as a leader?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Privacy by design; treating people\'s data with real respect is a duty, not a market position.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Privacy by design; be the kind of company you would trust with your own family\'s data.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Privacy by design; make it a differentiator and prove ethics and business can align.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Privacy by design; a standard you could defend to every user is the only legitimate one.', frameworkWeights: { contractualism: 2 } },
    ],
  },
  {
    questionText:
      'A rival is cutting ethical corners and winning. Your team is demoralized watching it pay off. As a leader, how do you respond to the pressure to match them?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Hold your standards and make the case that they are the company\'s real long-term moat.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'b', text: 'Compete hard within your principles; you do not have to become them to beat them.', frameworkWeights: { deontology: 1, 'pragmatist-ethics': 1 } },
      { id: 'c', text: 'Advocate for industry rules and transparency that make corner-cutting unprofitable for everyone.', frameworkWeights: { 'social-contract-theory': 1, 'justice-ethics': 1 } },
      { id: 'd', text: 'Trust that durable success comes from what you build well, not from chasing a rival\'s shortcuts.', frameworkWeights: { stoicism: 1, 'daoist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'You can make your company\'s algorithms auditable by outside researchers (accountability, but exposes trade secrets and flaws) or keep them closed (protects IP, avoids scrutiny). What is the responsible default for systems that affect the public?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Enable external audit; systems shaping public life must be answerable to more than their owners.', frameworkWeights: { 'discourse-ethics': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Enable it; accountability you submit to voluntarily is the mark of a trustworthy institution.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Audited access under safeguards — real scrutiny without needlessly exposing every secret.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Submit to scrutiny you could defend declining to no one affected by the system.', frameworkWeights: { contractualism: 2 } },
    ],
  },
  {
    questionText:
      'A decision must be made about a high-stakes deployment with deep uncertainty. You can decide decisively yourself (fast, clear ownership) or build broad consensus (slower, more legitimate, diffuses accountability). Which?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Build legitimacy through inclusive deliberation; high-stakes calls deserve more than one person\'s judgment.', frameworkWeights: { 'discourse-ethics': 2 } },
      { id: 'b', text: 'Decide decisively but own it fully; clear accountability matters when stakes are high.', frameworkWeights: { 'virtue-ethics': 1, deontology: 1 } },
      { id: 'c', text: 'Match the process to the stakes — consult widely, then take clear, owned responsibility for the call.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Ensure those who will bear the consequences have a real voice before you decide.', frameworkWeights: { 'justice-ethics': 1, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'Your company discovers it can quietly influence public opinion through its platform in ways that would benefit a cause you sincerely believe is good. The power is real and the cause is just. Do you use it?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'No — covertly steering public opinion is illegitimate power even in a good cause.', frameworkWeights: { 'rights-based-ethics': 2, deontology: 1 } },
      { id: 'b', text: 'No — a platform that manipulates the public it serves betrays the trust that legitimizes it.', frameworkWeights: { 'social-contract-theory': 1, 'virtue-ethics': 1 } },
      { id: 'c', text: 'No — manipulation bypasses people\'s reason; persuade openly or not at all.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'No — the precedent of "good causes justify hidden influence" leads somewhere very dark.', frameworkWeights: { consequentialism: 1, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'You can tie executive bonuses (including your own) to ethical and safety outcomes, not just financial ones — binding leadership to values at real personal cost. Or keep the standard profit-based incentives. Which?',
    technologyTopic: 'Leadership and Institutions',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Tie pay to ethics and safety; aligning incentives with values is how good intentions survive pressure.', frameworkWeights: { 'pragmatist-ethics': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Tie them; binding yourself to the standards you preach is the test of real commitment.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Tie them; accountability for harms must reach the people with the most power to prevent them.', frameworkWeights: { 'justice-ethics': 1, 'social-contract-theory': 1 } },
      { id: 'd', text: 'Tie them; incentives shaped this way produce better outcomes for users and society over time.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
];

export const module11 = buildModule(
  {
    id: 'framework_module_11',
    moduleNumber: 11,
    title: 'Leadership and Institutional Decisions',
    description:
      'The hardest calls fall to those with power — where accountability, transparency, and pressure collide.',
    focus:
      'Executive tradeoffs, governance, whistleblowers, lobbying, recalls, and institutional accountability.',
    technologyTopic: 'Leadership and Institutions',
  },
  seeds,
);
