import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 6 — Work, Labor, and Automation
 * Difficulty 2–4. Workplace monitoring, AI productivity tools, job
 * displacement, hiring algorithms, and employee fairness.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'Productivity software can track employees\' keystrokes, active windows, and idle time to measure output. It would catch the few who slack and reassure managers, but most workers would feel surveilled. Deploy it?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — blanket surveillance treats every worker as a suspect and corrodes the trust good work needs.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'No — monitoring people\'s every keystroke violates a dignity that productivity gains cannot buy.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Measure outcomes, not keystrokes; judge work by results rather than constant observation.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Only with worker input on what is tracked and why, agreed rather than imposed.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'An AI tool would let your team do the work of five people with two, saving the company a lot. The other three would likely be laid off. The efficiency is real; the people are real. What do you do?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Adopt it but retrain and redeploy the affected workers rather than discarding them.', frameworkWeights: { 'ethics-of-care': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Adopt it; refusing efficiency to preserve roles ultimately weakens the whole organization.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Adopt it only with a fair transition the affected workers had a voice in shaping.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1 } },
      { id: 'd', text: 'Treat the people you employ as owed more than a severance line; let that constrain the rollout.', frameworkWeights: { deontology: 1, 'ubuntu-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A hiring algorithm screens resumes faster and more consistently than humans, but candidates cannot tell why they were rejected and cannot easily contest it. Use it to manage the application flood?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Use it only with explanation and a human-appeal path; people\'s livelihoods deserve contestable decisions.', frameworkWeights: { 'rights-based-ethics': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Use it for ranking, not final rejection; keep a human accountable for who is cut.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'c', text: 'Use it; consistent screening of huge volumes is fairer than overwhelmed, erratic human review.', frameworkWeights: { 'justice-ethics': 1, consequentialism: 1 } },
      { id: 'd', text: 'Decline; gating people\'s careers behind an unexplainable filter is not defensible to those it rejects.', frameworkWeights: { contractualism: 2 } },
    ],
  },
  {
    questionText:
      'Your gig platform\'s algorithm sets pay and assigns work. A tweak would raise company margins by paying workers slightly less per task, which they would likely accept given few alternatives. Make the change?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — extracting more from workers because they lack options is exploitation, not a market signal.', frameworkWeights: { 'justice-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'No — squeezing the people the platform depends on is not the kind of company to build.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'No — fair terms are those workers could accept as free equals, not under quiet coercion.', frameworkWeights: { contractualism: 2 } },
      { id: 'd', text: 'Only if paired with transparency and worker input on how pay is set.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'An AI writing assistant makes your junior staff far more productive but also means they stop developing certain skills they used to build by doing the work themselves. Encourage heavy use, or limit it for growth?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Limit it in early roles so people still build the capabilities that make them capable professionals.', frameworkWeights: { 'capabilities-approach': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Encourage it; resisting a tool that boosts output to preserve old skill-building is sentimental.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Blend it; use the tool while deliberately preserving practice on foundational skills.', frameworkWeights: { 'pragmatist-ethics': 3 } },
      { id: 'd', text: 'Let each person choose how to develop, with honest guidance about the tradeoff.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'A "wellness" program offers insurance discounts to employees who wear company fitness trackers. It is voluntary, but opting out is conspicuous and may signal something to managers. Is the program acceptable?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — "voluntary" surveillance with a real penalty for declining is coercion in soft clothing.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'No — tying health data to employment pressures the vulnerable and is unfair to those who decline.', frameworkWeights: { 'justice-ethics': 2 } },
      { id: 'c', text: 'Only if opting out is truly costless and invisible to management.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Yes — adults can weigh a discount against sharing data, and many will value the incentive.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'You can deploy an AI that schedules shift workers with "just-in-time" precision, cutting labor costs but giving workers chaotic, unpredictable hours that wreck their ability to plan life. Deploy it?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — stable, predictable hours are part of what people need to live decent lives.', frameworkWeights: { 'capabilities-approach': 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'No — optimizing labor cost by destabilizing workers\' lives treats them as inputs, not people.', frameworkWeights: { 'rights-based-ethics': 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Use it with humane constraints — advance notice, stability guarantees — even at some efficiency cost.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Deploy it; lower costs keep the business competitive and preserve the jobs that exist.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'An employee uses an unauthorized AI tool to do great work faster. It violates company policy but produced excellent results and broke no law. As their manager, how do you respond?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Address the policy openly; rules exist for reasons, and quietly winking at violations erodes them.', frameworkWeights: { deontology: 1, 'social-contract-theory': 1 } },
      { id: 'b', text: 'Reward the initiative and fix the policy if it was the obstacle; judge by good judgment, not rule-literalism.', frameworkWeights: { 'virtue-ethics': 2, 'pragmatist-ethics': 1 } },
      { id: 'c', text: 'Focus on the outcome and what it teaches about updating tools and policy productively.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Talk with them to understand the pressure that led to it, then decide together.', frameworkWeights: { 'ethics-of-care': 2, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Automating a dangerous factory job would protect workers from injury but eliminate well-paid positions in a town with few alternatives. Safety and livelihood point in opposite directions. What do you prioritize?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Automate the danger but invest in the town\'s transition; protecting bodies and livelihoods both matter.', frameworkWeights: { 'ethics-of-care': 1, 'justice-ethics': 2 } },
      { id: 'b', text: 'Automate it; no one should be maimed for a paycheck, and safety is the higher duty.', frameworkWeights: { 'rights-based-ethics': 2 } },
      { id: 'c', text: 'Weigh the injuries prevented against the economic devastation and choose the lesser total harm.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'd', text: 'Let the affected workers and community help decide the pace and terms of automation.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'An emotion-recognition AI in interviews claims to flag "culture fit" and "engagement." Its science is shaky and could penalize neurodivergent or culturally different candidates. HR wants it for efficiency. Approve it?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'No — judging people by pseudo-scientific affect reading discriminates against those who differ.', frameworkWeights: { 'justice-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'No — gating careers on a tool whose validity you doubt is reckless and unfair to candidates.', frameworkWeights: { 'virtue-ethics': 1, deontology: 1 } },
      { id: 'c', text: 'No — it cannot be justified to a candidate told they "seemed disengaged" by an unproven model.', frameworkWeights: { contractualism: 2 } },
      { id: 'd', text: 'No — but address the real need (consistent interviews) with validated, contestable methods.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'Your company can offshore a software function to much lower-paid workers abroad, cutting costs and giving those workers good jobs by local standards, while eliminating higher-paid domestic roles. Is this the right move?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Yes — a worker abroad has the same claim to opportunity as one at home; borders are morally arbitrary.', frameworkWeights: { cosmopolitanism: 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Yes — it expands real opportunity for people with fewer of them, on balance a good.', frameworkWeights: { utilitarianism: 1, 'capabilities-approach': 1 } },
      { id: 'c', text: 'Only with responsibility to the displaced domestic workers, not a cost-only calculation.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'd', text: 'Prioritize obligations to your existing employees and community first.', frameworkWeights: { 'social-contract-theory': 1, deontology: 1 } },
    ],
  },
  {
    questionText:
      'A manager asks you to build a dashboard ranking employees by an AI "productivity score" for layoff decisions. The score is plausible but crude and misses much of what people contribute. Build it as asked?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Push back; reducing people to a crude score for layoffs is a misuse you should not enable.', frameworkWeights: { 'virtue-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Build it only as one input among several with human judgment, never the sole basis.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Refuse; you could not justify a layoff to someone by pointing to a metric you know is crude.', frameworkWeights: { contractualism: 2 } },
      { id: 'd', text: 'Build it; transparent, consistent criteria may be fairer than opaque managerial favoritism.', frameworkWeights: { consequentialism: 1, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Remote-work software can verify presence with periodic webcam check-ins. It deters time-fraud but feels invasive to honest employees working from home. Implement check-ins?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'No — surveilling people in their homes to catch a few cheats wrongs the honest majority.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'No — manage by trust and output; a culture of webcam policing produces compliance, not good work.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'No — measure deliverables instead; presence is a poor and intrusive proxy for contribution.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Only if the team agrees to it as a shared norm rather than having it imposed.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'An AI can predict which employees are likely to quit soon. Managers could use it to proactively retain valued people — or to quietly sideline "flight risks" from key projects. You build the tool. What guardrails?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Restrict it to supportive interventions; predictions must not become grounds to penalize people.', frameworkWeights: { 'ethics-of-care': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Forbid adverse uses contractually and audit for them; the line must be enforced, not hoped for.', frameworkWeights: { deontology: 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Be transparent with employees that it exists and how it may be used.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Weigh whether the retention benefit justifies the tool at all given foreseeable misuse.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'You can give workers a real voice in how a new automation system is designed and rolled out (slower, messier) or design it efficiently from the top and inform them after. Which process do you choose?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Involve workers; those whose work is being reshaped have a rightful say in how.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Involve them; legitimate change is change the affected could endorse, not have done to them.', frameworkWeights: { 'social-contract-theory': 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Involve them; their on-the-ground knowledge usually makes the system better anyway.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Design top-down for speed; well-meant efficiency now beats a drawn-out process.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A warehouse AI sets aggressive pick-rate targets that most workers can hit but that cause repetitive strain for some over time. Lowering targets reduces throughput. Where do you set the targets?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'At a sustainable, injury-avoiding pace; a target that quietly injures some workers is set too high.', frameworkWeights: { 'ethics-of-care': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'At a level workers could accept knowing the health risks, not one imposed for throughput.', frameworkWeights: { contractualism: 2 } },
      { id: 'c', text: 'At a humane level with rotation and breaks engineered in; design out the strain, don\'t price it in.', frameworkWeights: { 'pragmatist-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'd', text: 'At a level that maximizes total output while keeping injury rates within accepted norms.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Your platform\'s rating system lets customers rate gig workers, but ratings are often biased (against accents, names, neighborhoods) and a low score can end someone\'s income. Keep ratings, reform them, or drop them?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Reform them to correct for bias; livelihoods should not hinge on prejudiced scores.', frameworkWeights: { 'justice-ethics': 2 } },
      { id: 'b', text: 'Reform them; a person\'s income deserves protection from arbitrary, biased customer whims.', frameworkWeights: { 'rights-based-ethics': 2 } },
      { id: 'c', text: 'Keep but de-weight and audit them, balancing useful signal against documented harm.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'd', text: 'Give workers a real appeals process and a say in how the system is run.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'A subordinate confides they used AI to fake productivity metrics during a hard personal stretch and have since recovered. No lasting harm occurred. They ask you not to report it. What do you do?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Handle it with compassion and a path forward; people deserve room to recover from a low point.', frameworkWeights: { 'ethics-of-care': 2, 'buddhist-ethics': 1 } },
      { id: 'b', text: 'Address it honestly per policy; selective enforcement based on sympathy is its own unfairness.', frameworkWeights: { deontology: 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Weigh the lack of harm and their recovery against the precedent of looking away.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Use judgment a fair-minded person would: acknowledge the wrong, but temper the response to the whole situation.', frameworkWeights: { 'virtue-ethics': 2 } },
    ],
  },
  {
    questionText:
      'Your company can adopt a four-day week enabled by AI efficiency gains (better for workers, unproven for output) or bank those gains as profit and headcount cuts. The board wants the latter. What do you advocate?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Share the gains with workers; those who enabled the efficiency have a claim on its benefits.', frameworkWeights: { 'justice-ethics': 2, 'ubuntu-ethics': 1 } },
      { id: 'b', text: 'Advocate the four-day week; flourishing employees are part of what a good company is for.', frameworkWeights: { 'capabilities-approach': 1, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Pilot the four-day week and let the measured results decide, rather than assuming.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Bank the gains; the company\'s duty to its viability and shareholders comes first.', frameworkWeights: { consequentialism: 1, deontology: 1 } },
    ],
  },
  {
    questionText:
      'A code-generation AI you provide lets a few experts replace a whole team. You could price it to maximize revenue from those experts, or price it low to broaden access for small developers and the self-taught. Which?',
    technologyTopic: 'Work and Labor',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Price for access; broadening who can build things expands real opportunity widely.', frameworkWeights: { 'capabilities-approach': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Price for access; tools that empower the many over the well-resourced few are worth more than margin.', frameworkWeights: { cosmopolitanism: 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Tiered pricing — affordable for individuals, premium for enterprises — to serve both.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Price to maximize revenue; a sustainable, profitable tool can invest in helping more people later.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
];

export const module06 = buildModule(
  {
    id: 'framework_module_06',
    moduleNumber: 6,
    title: 'Work, Labor, and Automation',
    description:
      'How workplace technology reshapes dignity, livelihood, and power between employers and workers.',
    focus:
      'Monitoring, displacement, hiring algorithms, gig pay, scheduling, and worker voice.',
    technologyTopic: 'Work and Labor',
  },
  seeds,
);
