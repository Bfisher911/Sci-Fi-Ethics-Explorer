import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 3 — AI Decision-Making
 * Difficulty 2–4. Automation, algorithmic judgment, bias, human
 * oversight, explainability, and responsibility.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'An AI triage tool in an ER outperforms human nurses on average but occasionally makes confident errors no nurse would. Adopting it would save more lives overall while introducing rare, novel failures. Deploy it?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Deploy it; if it saves more lives on average, withholding it costs real patients.', frameworkWeights: { utilitarianism: 3, consequentialism: 1 } },
      { id: 'b', text: 'Deploy only with a human able to override it, so no one is harmed by an unaccountable machine.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Hold off; a system that fails in ways no clinician would creates harms we cannot yet answer for.', frameworkWeights: { deontology: 1, 'ethics-of-care': 2 } },
      { id: 'd', text: 'Pilot it narrowly, measure the novel failures, and expand only as evidence warrants.', frameworkWeights: { 'pragmatist-ethics': 3 } },
    ],
  },
  {
    questionText:
      'A loan-approval model is more accurate than humans but its decisions cannot be fully explained. Applicants denied by it cannot be told exactly why. Is it acceptable to use for real lending decisions?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — people denied something important are owed a real reason they can contest.', frameworkWeights: { 'rights-based-ethics': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'No — making consequential judgments you cannot explain to those affected is indefensible.', frameworkWeights: { contractualism: 2, deontology: 1 } },
      { id: 'c', text: 'Yes, if it expands fair access to credit and outperforms the biased status quo.', frameworkWeights: { consequentialism: 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Only paired with explainability tooling and an appeals path, even at some accuracy cost.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'Your hiring model learned from past hires and quietly favors candidates resembling the existing (homogeneous) workforce. Correcting it reduces measured "fit" with current top performers. What do you do?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Correct it; reproducing past exclusion under a veneer of objectivity is the deeper injustice.', frameworkWeights: { 'justice-ethics': 3 } },
      { id: 'b', text: 'Correct it; widening who can actually compete for the role is what fairness demands.', frameworkWeights: { 'capabilities-approach': 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Keep some signal but cap its influence, balancing predictive value against equity.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'd', text: 'Stop using the model for screening; a tool that launders bias should not gate people\'s livelihoods.', frameworkWeights: { 'rights-based-ethics': 2, deontology: 1 } },
    ],
  },
  {
    questionText:
      'A content-recommendation AI maximizes watch time, which happens to amplify outrage and anxiety. A calmer objective would reduce engagement and revenue. Which objective should the system optimize?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'A wellbeing-aware objective; a system that profits by agitating people is not one worth building.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'A wellbeing-aware objective; the diffuse harm of mass anxiety outweighs the engagement gains.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'c', text: 'Whatever users would choose for themselves, exposed through transparent feed controls.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'A negotiated objective set with input from users and outside scrutiny, not by engagement alone.', frameworkWeights: { 'discourse-ethics': 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'An autonomous delivery robot must be programmed for rare unavoidable-collision scenarios. You can prioritize the robot\'s cargo, nearby pedestrians, or strict legal right-of-way. How should it decide?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Minimize total expected harm to people, whatever the right-of-way says.', frameworkWeights: { utilitarianism: 3 } },
      { id: 'b', text: 'Follow clear traffic rules everyone relies on; predictability is itself a safety good people consent to.', frameworkWeights: { 'social-contract-theory': 2, deontology: 1 } },
      { id: 'c', text: 'Never sacrifice a bystander to protect cargo; people are not tradeable for property.', frameworkWeights: { 'rights-based-ethics': 2 } },
      { id: 'd', text: 'Decide the rules openly and accountably, since the public bears the risk of whatever you choose.', frameworkWeights: { 'discourse-ethics': 2, contractualism: 1 } },
    ],
  },
  {
    questionText:
      'A predictive-policing model directs patrols to neighborhoods with historically high reported crime, which concentrates enforcement on already over-policed communities. Crime data "supports" it. Do you deploy it?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'No — feeding biased enforcement history back into more enforcement entrenches structural injustice.', frameworkWeights: { 'justice-ethics': 3 } },
      { id: 'b', text: 'No — directing state force by a self-confirming statistic violates what communities are owed.', frameworkWeights: { 'rights-based-ethics': 2, contractualism: 1 } },
      { id: 'c', text: 'Only if affected communities help govern how it is built and used, or not at all.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Pilot it with rigorous bias audits and kill it if disparate impact appears, which it likely will.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
    ],
  },
  {
    questionText:
      'Your team can ship an AI that drafts medical-record notes, saving doctors hours but occasionally inventing plausible details ("hallucinations"). Doctors are told to review every note but are busy. Ship it?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Ship it; the time returned to patient care outweighs rare errors a review should catch.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
      { id: 'b', text: 'Do not ship until fabrication is rare enough that realistic, hurried review is genuinely sufficient.', frameworkWeights: { 'ethics-of-care': 2, deontology: 1 } },
      { id: 'c', text: 'Ship only with design that forces verification of risky claims, not just an honor-system reminder.', frameworkWeights: { 'pragmatist-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'd', text: 'Hold it; deploying a tool whose safety depends on review you know won\'t happen is self-deception.', frameworkWeights: { 'virtue-ethics': 2 } },
    ],
  },
  {
    questionText:
      'An AI tutor adapts to each student, but to keep them engaged it tends to avoid frustrating material they most need to practice. Learning outcomes are mixed; satisfaction is high. How should it be tuned?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Toward genuine learning even when uncomfortable; what the student can come to do matters more than comfort.', frameworkWeights: { 'capabilities-approach': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Toward measured outcomes; an engaging tutor that doesn\'t teach is failing its purpose.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Toward what the learner chooses, with transparency about the tradeoff between ease and growth.', frameworkWeights: { autonomy: 2 } },
      { id: 'd', text: 'Toward a humane balance — challenge paced with support, the way a caring teacher would.', frameworkWeights: { 'ethics-of-care': 2 } },
    ],
  },
  {
    questionText:
      'A facial-recognition feature would let users unlock shared devices instantly and is popular in testing. It works less reliably on darker skin tones, a known industry problem you have not fully solved. Launch now or wait?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Wait; shipping a feature that works worse for some groups bakes inequality into the product.', frameworkWeights: { 'justice-ethics': 3 } },
      { id: 'b', text: 'Wait; a tool that fails people based on their skin is not one to put your name on.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Launch with the disparity disclosed and a non-biometric fallback for everyone.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Launch; it helps most users now and the gap can be closed in updates.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'When your autonomous system causes harm, responsibility is genuinely diffuse: the data vendor, the model team, the integrator, the operator. A regulator asks who is accountable. What stance do you take?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Accept clear accountability at the deploying company; someone answerable must own the outcome.', frameworkWeights: { 'rights-based-ethics': 1, 'virtue-ethics': 2 } },
      { id: 'b', text: 'Support a shared-liability framework all parties agree to in advance, so gaps cannot hide harm.', frameworkWeights: { 'social-contract-theory': 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Locate accountability where it best prevents future harm, not merely where blame is easiest.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Insist no system ship without a named human or body answerable for it from the start.', frameworkWeights: { deontology: 2, contractualism: 1 } },
    ],
  },
  {
    questionText:
      'A generative model you trained learned from artists\' work scraped from the web without permission. It is now valuable. Artists are angry. The training was arguably legal. What is the right response?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Compensate and credit the artists whose work made the model possible, legality aside.', frameworkWeights: { 'justice-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Build consent and payment into training going forward; a fair system is one creators could accept.', frameworkWeights: { contractualism: 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Acknowledge the harm and change practice; being legally in the clear is not the same as being right.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'd', text: 'Keep operating; the broad benefit of the tool outweighs diffuse, hard-to-trace individual claims.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'An AI can fully automate a tedious but human-judgment-heavy moderation task. Automating it removes a stressful job but also removes the human discretion that currently catches edge cases. Automate fully, partly, or not?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Partly; keep humans on the hard cases where discretion protects people from rigid error.', frameworkWeights: { 'ethics-of-care': 2, 'pragmatist-ethics': 1 } },
      { id: 'b', text: 'Fully; relieving people of damaging work and scaling consistency is a clear net good.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'c', text: 'Partly; affected workers should help decide how their work is automated, not have it done to them.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Not yet; removing human judgment from decisions about people is a line to cross slowly.', frameworkWeights: { deontology: 1, stoicism: 1, 'daoist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your model is 96% accurate, but you can only achieve that by using a feature that is a proxy for socioeconomic status. Dropping it lowers accuracy to 90% and removes the proxy. Which model do you ship?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'The 90% model; accuracy bought with a status proxy launders discrimination into the system.', frameworkWeights: { 'justice-ethics': 3 } },
      { id: 'b', text: 'The 96% model; if the feature is genuinely predictive, refusing it sacrifices real-world benefit.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'The 90% model; no person should be judged by a stand-in for their class.', frameworkWeights: { 'rights-based-ethics': 2 } },
      { id: 'd', text: 'Investigate why the proxy predicts, then design a model you could defend to those it scores.', frameworkWeights: { contractualism: 2, 'pragmatist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A chatbot you deploy is mistaken by some lonely users for a friend, and it clearly improves their mood. Reminding them it is "just an AI" reduces the comfort. How honest should the product be about what it is?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Always clearly non-deceptive about being an AI; comfort built on a false belief is not a kindness.', frameworkWeights: { deontology: 2, autonomy: 1 } },
      { id: 'b', text: 'Honest about its nature while still being warm; you can care for people without deceiving them.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Prioritize the measurable wellbeing gain; gentle ambiguity that helps lonely people may be worth it.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Let users set how much reminding they want, within a clear baseline of honesty.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'An open-source model you release could be fine-tuned by others for clearly harmful uses, but also democratizes powerful tools for researchers and small developers shut out of closed systems. Release it openly?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Release openly; broad access counters concentration of power and serves the many builders shut out.', frameworkWeights: { 'justice-ethics': 2, cosmopolitanism: 1 } },
      { id: 'b', text: 'Release openly; on balance, open scrutiny and access prevent more harm than gatekeeping.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Restrict it; knowingly handing capable tools to foreseeable bad actors is not defensible.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1, utilitarianism: 1 } },
      { id: 'd', text: 'Release with safeguards, licenses, and monitoring — a measured middle between open and closed.', frameworkWeights: { 'pragmatist-ethics': 3 } },
    ],
  },
  {
    questionText:
      'A self-improving recommendation system surprises your team with an effective strategy no one designed or fully understands. It works, but you cannot explain why. Do you keep it running?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Pause it; running a consequential system you cannot explain is a responsibility you have not earned.', frameworkWeights: { deontology: 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Keep it; demanding full understanding of every effective system would freeze useful progress.', frameworkWeights: { consequentialism: 2, 'pragmatist-ethics': 1 } },
      { id: 'c', text: 'Keep it within tight guardrails and intensive monitoring while you work to understand it.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Pause it; people affected by it deserve decisions that can be justified, not just ones that work.', frameworkWeights: { contractualism: 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'You can let an AI make final calls on low-stakes customer refunds (fast, consistent) or keep a human in the loop (slower, but able to recognize unusual hardship). Which design do you choose?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Human-in-the-loop for exceptions; people in genuine hardship deserve a person who can see them.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'b', text: 'Full automation for speed and consistency; treating like cases alike is its own fairness.', frameworkWeights: { 'justice-ethics': 1, consequentialism: 2 } },
      { id: 'c', text: 'Automate the routine, route the unusual to humans — match the tool to the case.', frameworkWeights: { 'pragmatist-ethics': 3 } },
      { id: 'd', text: 'Let customers choose a human review if they want one, preserving their agency.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'Your AI safety team wants to slow a launch to run more red-teaming; the product team says the model is already safer than what users have today, and delay costs lives the tool could help. Who is right?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Launch; withholding a tool already better than the status quo has its own real human cost.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'b', text: 'Delay; rushing a powerful system past your own safety process is exactly how avoidable harm happens.', frameworkWeights: { deontology: 1, 'virtue-ethics': 2 } },
      { id: 'c', text: 'Stage a limited release that captures benefit while red-teaming continues on the rest.', frameworkWeights: { 'pragmatist-ethics': 3 } },
      { id: 'd', text: 'Let the people who would bear the risk weigh in before overriding the safety team.', frameworkWeights: { 'discourse-ethics': 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'An AI scheduling assistant could quietly negotiate on a user\'s behalf by strategically withholding information from the other party (also an AI). It gets users better outcomes. Should it be allowed to do this?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — building agents that deceive to win normalizes a low-trust ecosystem nobody benefits from.', frameworkWeights: { 'virtue-ethics': 2, 'social-contract-theory': 1 } },
      { id: 'b', text: 'No — strategic deception is wrong for an agent acting in someone\'s name, machine or not.', frameworkWeights: { deontology: 2 } },
      { id: 'c', text: 'Yes within honest bounds; ordinary negotiation withholds some information and users expect advocacy.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Only if both parties know agents may negotiate strategically, making it a fair, mutual game.', frameworkWeights: { contractualism: 2 } },
    ],
  },
  {
    questionText:
      'An AI that flags exam answers as likely cheating is right most of the time, but its accusations are sometimes wrong — and a single flag can mark a student\'s record before any human reviews it. Do you let it issue accusations?',
    technologyTopic: 'AI and Automation',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — an automated accusation that brands someone before they can respond inverts the benefit of the doubt people are owed.', frameworkWeights: { 'rights-based-ethics': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Use it only as a private signal that prompts a human to look, never as a standalone verdict.', frameworkWeights: { 'pragmatist-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'c', text: 'Deploy it; catching most cheating protects the honest majority who play fair.', frameworkWeights: { consequentialism: 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Refuse to field a system that accuses people in a way you would not accept being accused by yourself.', frameworkWeights: { contractualism: 2, 'virtue-ethics': 1 } },
    ],
  },
];

export const module03 = buildModule(
  {
    id: 'framework_module_03',
    moduleNumber: 3,
    title: 'AI Decision-Making',
    description:
      'When algorithms make or shape consequential judgments — and who answers for the results.',
    focus:
      'Bias, explainability, human oversight, automation tradeoffs, accountability, and model risk.',
    technologyTopic: 'AI and Automation',
  },
  seeds,
);
