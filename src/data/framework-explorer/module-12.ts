import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 12 — Complex Integrative Dilemmas
 * Difficulty 4–5. Layered cases where multiple frameworks are strongly
 * in tension. The hardest scenarios — no option is clean.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'Your AI can predict which patients will most benefit from a scarce, expensive treatment. Using it saves more lives overall but systematically deprioritizes the elderly and those with complications — often the sickest. Deploy it for allocation?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Deploy it; with a scarce resource, directing it where it saves the most life-years is the hard duty.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'b', text: 'Refuse; an allocation that always sacrifices the sickest fails the people most in need of care.', frameworkWeights: { 'ethics-of-care': 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Use it only within rules every patient could accept as fair before knowing their own condition.', frameworkWeights: { contractualism: 2 } },
      { id: 'd', text: 'Decide allocation through transparent public deliberation, not a model\'s hidden value judgments.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A whistleblower gives you proof your government is using your company\'s tech for mass surveillance of dissidents abroad. Exposing it risks lives, your company, and diplomatic fallout; silence makes you complicit. What do you do?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Expose it through careful, protective channels; complicity in oppression is the deeper wrong.', frameworkWeights: { 'rights-based-ethics': 1, 'justice-ethics': 1 } },
      { id: 'b', text: 'Expose it; the dissidents abroad have the same claim on your conscience as anyone at home.', frameworkWeights: { cosmopolitanism: 2 } },
      { id: 'c', text: 'Weigh the lives the exposure might save against those it might endanger, and act on the balance.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Refuse to be the kind of person who knows this and stays silent, whatever the cost.', frameworkWeights: { 'virtue-ethics': 2 } },
    ],
  },
  {
    questionText:
      'An AGI-adjacent system your lab built is extraordinarily capable and possibly the most consequential technology in history. Racing rivals make caution feel suicidal; pausing may cede the future to less careful actors. Continue at full speed, pause, or something else?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Slow down and invest massively in safety; rushing the most consequential technology is how catastrophe happens.', frameworkWeights: { 'rights-based-ethics': 1, stoicism: 1 } },
      { id: 'b', text: 'Pursue cooperation and shared governance; no single lab should decide humanity\'s future alone.', frameworkWeights: { 'discourse-ethics': 1, cosmopolitanism: 1 } },
      { id: 'c', text: 'Weigh the catastrophic tail risks against the danger of less careful actors leading, soberly.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Hold to the duty of care a technology this powerful imposes, even if rivals will not.', frameworkWeights: { deontology: 1, 'virtue-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your platform could deploy an intervention that measurably reduces teen self-harm content but requires scanning private messages, overriding the privacy you promised. The harm is real; so is the broken promise. What do you do?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Honor the privacy promise; protection bought by breaking a fundamental commitment corrodes the trust it relies on.', frameworkWeights: { 'rights-based-ethics': 1, deontology: 1 } },
      { id: 'b', text: 'Intervene; preventing serious harm to vulnerable teens can outweigh a privacy commitment.', frameworkWeights: { 'ethics-of-care': 1, utilitarianism: 1 } },
      { id: 'c', text: 'Seek a path that protects teens without mass scanning, refusing the false binary.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Put the tradeoff to users and especially affected families rather than deciding for them.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'A breakthrough model could cure a major disease but was trained on data obtained through clear consent violations years ago. Using it saves lives; using it ratifies a serious past wrong. Do you bring it to patients?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Use it to save lives but fully acknowledge, redress, and never repeat the wrong it came from.', frameworkWeights: { 'pragmatist-ethics': 1, 'justice-ethics': 1 } },
      { id: 'b', text: 'Use it; refusing a cure to punish a past wrong sacrifices present patients to make a point.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'c', text: 'Do not build on stolen consent; some foundations are too tainted to ratify by use.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'd', text: 'Make whatever use you allow defensible to the very people whose consent was violated.', frameworkWeights: { contractualism: 2 } },
    ],
  },
  {
    questionText:
      'An autonomous-weapons capability your company could build would, proponents argue, reduce civilian casualties versus human soldiers — while removing humans from kill decisions entirely. Develop it, refuse, or shape it?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Refuse; delegating the decision to kill to a machine crosses a line no projected benefit redeems.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Refuse; building this is not compatible with the kind of company or people you want to be.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Engage to ensure meaningful human control and international rules rather than ceding it to others.', frameworkWeights: { 'discourse-ethics': 1, 'social-contract-theory': 1 } },
      { id: 'd', text: 'Weigh the contested claim of fewer casualties against the profound risks of automated killing.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'You can give a struggling community free, transformative AI infrastructure — but only by partnering with a firm whose business model you find exploitative, who will gain influence over that community. Accept the partnership for the community\'s sake?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Accept it if it genuinely expands what the community can do, while fighting to limit the firm\'s grip.', frameworkWeights: { capabilities-approach: 1, 'pragmatist-ethics': 1 } },
      { id: 'b', text: 'Refuse; trading a community\'s autonomy to an exploiter is not a gift worth giving.', frameworkWeights: { autonomy: 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Let the community itself decide whether the tradeoff is worth it — it is their future.', frameworkWeights: { 'discourse-ethics': 2, ubuntu-ethics: 1 } },
      { id: 'd', text: 'Weigh the real benefit to the community against the long-term cost of the firm\'s influence.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A model can detect a rare, fatal condition early from routine scans, but at a population scale it will also generate many false positives causing fear, invasive follow-ups, and some harm from unnecessary procedures. Roll it out broadly?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Roll it out where the lives saved clearly exceed the net harm from false positives.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'b', text: 'Be cautious; subjecting healthy people to fear and risky follow-ups is a real harm, not a side note.', frameworkWeights: { 'ethics-of-care': 1, deontology: 1 } },
      { id: 'c', text: 'Deploy only with informed choice, so each person decides whether to be screened knowing the tradeoffs.', frameworkWeights: { autonomy: 2 } },
      { id: 'd', text: 'Target it to populations where the benefit-harm balance is defensible to each person screened.', frameworkWeights: { contractualism: 1, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your company can release a powerful open model that will democratize capability but predictably be misused by some, or keep it closed, concentrating power in a few firms (including yours). Both paths harm; both help. Which?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Open it; countering the concentration of this much power is worth the misuse it also enables.', frameworkWeights: { 'justice-ethics': 1, autonomy: 1 } },
      { id: 'b', text: 'Open it; broad access across the world matters more than protecting a privileged few\'s control.', frameworkWeights: { cosmopolitanism: 2 } },
      { id: 'c', text: 'Keep it closed; knowingly releasing foreseeable serious-harm capability is not justified by ideals.', frameworkWeights: { consequentialism: 1, deontology: 1 } },
      { id: 'd', text: 'Pursue a governed middle — staged release, accountability, shared oversight — rather than a binary.', frameworkWeights: { 'pragmatist-ethics': 2, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A government will deploy a flawed but useful disaster-prediction model with or without you. Joining lets you make it safer but also legitimizes a system you have real doubts about. Join to improve it, or refuse to lend your name?',
    technologyTopic: 'Integrative',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Join; if it ships regardless, making it safer for the people it affects is the responsible choice.', frameworkWeights: { consequentialism: 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Refuse; lending legitimacy to a system you doubt makes you answerable for its failures.', frameworkWeights: { 'virtue-ethics': 1, deontology: 1 } },
      { id: 'c', text: 'Join only with the standing and transparency to publicly flag what you cannot fix.', frameworkWeights: { 'discourse-ethics': 2 } },
      { id: 'd', text: 'Decide by who bears the risk: join if your presence genuinely protects them, refuse if it mainly shields the system.', frameworkWeights: { 'justice-ethics': 2 } },
    ],
  },
  {
    questionText:
      'Your viral product is, on the whole, a force for good, but you now have data showing it measurably harms a specific vulnerable subgroup. Fixing it for them would degrade it for everyone else. How do you weigh the few against the many here?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Protect the vulnerable subgroup even at cost to the majority; harm to the few is not erased by good to the many.', frameworkWeights: { 'rights-based-ethics': 1, 'justice-ethics': 1 } },
      { id: 'b', text: 'Refuse to treat the harmed group as an acceptable loss; design a path that does not sacrifice them.', frameworkWeights: { 'ethics-of-care': 1, contractualism: 1 } },
      { id: 'c', text: 'Weigh the magnitude of harm to the few against benefit to the many and choose the lesser total harm.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'd', text: 'Invest in a harder solution that serves both rather than accepting the tradeoff as fixed.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'You can build a system that dramatically improves social outcomes (reduced crime, better health) by deeply integrating citizens\' data across agencies — creating, in effect, the architecture of a surveillance state that a future bad actor could inherit. Build it?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Refuse; building the machinery of total surveillance is dangerous no matter how good the current intent.', frameworkWeights: { 'rights-based-ethics': 2, deontology: 1 } },
      { id: 'b', text: 'Refuse; the long-run risk to free society dwarfs the near-term social gains.', frameworkWeights: { consequentialism: 1, stoicism: 1 } },
      { id: 'c', text: 'Build only with irreversible structural limits and democratic control that could survive a hostile successor.', frameworkWeights: { 'social-contract-theory': 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Put so consequential a choice to the public whose freedom is at stake, not to technocrats.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A medical AI you oversee recommends against an expensive treatment for a specific patient, citing low predicted benefit. The patient and family beg for it; the data says it is unlikely to help and the resources could save others. Override the model, follow it, or something else?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Stay with this patient and family in the decision; care means not reducing them to a prediction.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'b', text: 'Follow the model if resources truly save more lives elsewhere; stewardship of scarce care is a duty.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'c', text: 'Honor the patient\'s informed choice about their own treatment, with the model as input not verdict.', frameworkWeights: { autonomy: 2 } },
      { id: 'd', text: 'Apply a transparent, consistent standard every patient in this position could accept as fair.', frameworkWeights: { contractualism: 1, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Releasing your research advances the whole field and your career, but a rival could weaponize part of it. Withholding it slows beneficial progress and breaks scientific norms of openness. Publish fully, partially, or not?',
    technologyTopic: 'Integrative',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Publish the beneficial work while withholding the directly weaponizable specifics.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'b', text: 'Publish fully; open science is a shared good and gatekeeping does more long-run harm than dual-use risk.', frameworkWeights: { 'discourse-ethics': 1, cosmopolitanism: 1 } },
      { id: 'c', text: 'Withhold if the weaponization risk is severe; foreseeable grave misuse can outweigh openness norms.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'd', text: 'Submit the dual-use question to your field\'s established review rather than deciding alone.', frameworkWeights: { 'social-contract-theory': 2 } },
    ],
  },
  {
    questionText:
      'A new tool lets you give your own children significant advantages (educational, health, cognitive) that most families cannot access. Using it is legal and natural as a parent; widespread use by the advantaged would deepen inequality. Use it for your kids?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Use it; a parent\'s duty to their own child is real and not erased by systemic concerns.', frameworkWeights: { 'ethics-of-care': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Refrain or push for access for all; entrenching advantage you would deny others is unjust.', frameworkWeights: { 'justice-ethics': 2 } },
      { id: 'c', text: 'Refrain if you could not will a world where everyone in your position did the same.', frameworkWeights: { deontology: 1, contractualism: 1 } },
      { id: 'd', text: 'Use it while working to widen access, holding the personal and systemic duties together.', frameworkWeights: { 'pragmatist-ethics': 2, ubuntu-ethics: 1 } },
    ],
  },
  {
    questionText:
      'Your company can quietly fix a societal problem (e.g., detect and remove a category of dangerous content) by acting unilaterally and effectively — but doing so means a private company exercising quasi-governmental power without a mandate. Act, or wait for legitimate authority?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Wait for or build legitimate mandate; private power solving public problems without consent is its own danger.', frameworkWeights: { 'social-contract-theory': 2, 'discourse-ethics': 1 } },
      { id: 'b', text: 'Act now where real harm is preventable; refusing to help on procedural grounds has its own cost.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Act transparently and accountably, inviting the scrutiny that quasi-public power demands.', frameworkWeights: { 'virtue-ethics': 1, 'justice-ethics': 1 } },
      { id: 'd', text: 'Act only in ways you could justify to a public that never elected you to this role.', frameworkWeights: { contractualism: 2 } },
    ],
  },
  {
    questionText:
      'An AI you built has become load-bearing for millions — they depend on it daily. You discover a subtle, systemic bias in it. A full fix requires taking it offline for an extended period, itself causing real disruption and harm. Fix now (disruptive) or patch slowly (bias persists)?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Take it down to fix the bias properly; persisting injustice to avoid disruption is not acceptable.', frameworkWeights: { 'justice-ethics': 2, deontology: 1 } },
      { id: 'b', text: 'Patch incrementally to avoid the harm of an outage while steadily eliminating the bias.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'c', text: 'Weigh the harm of the disruption against the harm of the persisting bias and choose the lesser.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'd', text: 'Be transparent with the affected public and let the urgency be judged with them, not for them.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'You can save your failing company — and your employees\' jobs — by pivoting to a business you find ethically dubious but legal, or accept likely shutdown by staying with your principled but unprofitable mission. What do you choose?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Hold the principle and accept the cost; a company that abandons its mission to survive has already failed.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'b', text: 'Pivot to protect the people who depend on you; your obligation to employees is concrete and present.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'c', text: 'Weigh the real harm of the dubious business against the real harm of jobs lost, honestly.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Pivot only if the new business is one you could defend to those it would affect; otherwise close with integrity.', frameworkWeights: { contractualism: 1, deontology: 1 } },
    ],
  },
  {
    questionText:
      'After completing eleven modules of dilemmas, you face the meta-question: when your strongest ethical instinct and a careful analysis of consequences point to different actions, which should you trust more?',
    technologyTopic: 'Integrative',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Trust the reasoned analysis of consequences; outcomes for real people are what ultimately matter.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
      { id: 'b', text: 'Trust the deep instinct; it carries moral knowledge that explicit reasoning can miss or rationalize away.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'c', text: 'Trust neither alone; the friction between them is the signal to slow down and reason more carefully.', frameworkWeights: { 'pragmatist-ethics': 1, stoicism: 1 } },
      { id: 'd', text: 'Trust the test of justifiability — whichever course you could defend to everyone it affects.', frameworkWeights: { contractualism: 2, 'discourse-ethics': 1 } },
    ],
  },
];

export const module12 = buildModule(
  {
    id: 'framework_module_12',
    moduleNumber: 12,
    title: 'Complex Integrative Dilemmas',
    description:
      'The hardest cases — layered, high-stakes, with strong frameworks pulling hard against each other.',
    focus:
      'Allocation under scarcity, dual-use power, complicity, the few vs. the many, and irreversible choices.',
    technologyTopic: 'Integrative',
  },
  seeds,
);
