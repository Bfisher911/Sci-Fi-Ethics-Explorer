import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 10 — Environmental and Global Technology Ethics
 * Difficulty 3–4. E-waste, climate cost, infrastructure inequality,
 * global labor, extractive technology, and access.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'Training your next AI model would consume enormous energy and water. It could also accelerate climate research that helps the planet. The footprint is certain; the benefit is probable. Train the model?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Train it only if the expected environmental benefit credibly exceeds the certain footprint.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
      { id: 'b', text: 'Minimize first; a certain, irreversible cost to the planet demands restraint before grand justifications.', frameworkWeights: { 'environmental-ethics': 2, stoicism: 1 } },
      { id: 'c', text: 'Train it but commit to clean energy, efficiency, and offsets as a condition of doing so.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Weigh the burden on future generations and distant communities who bear climate costs they did not cause.', frameworkWeights: { 'justice-ethics': 1, cosmopolitanism: 1 } },
    ],
  },
  {
    questionText:
      'Your devices are cheaper and sleeker if glued shut (not repairable), which increases sales and e-waste, or modular and repairable (pricier, longer-lasting). The market rewards the disposable design. Which do you build?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Repairable; designing for the landfill treats the planet as a free dumping ground.', frameworkWeights: { 'environmental-ethics': 2 } },
      { id: 'b', text: 'Repairable; people have a right to fix what they own, and durability respects them.', frameworkWeights: { 'rights-based-ethics': 1, autonomy: 1 } },
      { id: 'c', text: 'Repairable; longevity serves users and the world better than a sales-maximizing disposability.', frameworkWeights: { 'virtue-ethics': 1, 'justice-ethics': 1 } },
      { id: 'd', text: 'Repairable, and make the long-term cost case to the market rather than chasing the disposable trend.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A cheap supply of a critical mineral for your hardware comes from mines with poor labor and environmental conditions. A cleaner source costs much more and would raise your prices. Which do you source from?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'The cleaner source; profiting from exploited labor and ruined land is not defensible at any margin.', frameworkWeights: { 'justice-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'The cleaner source; distant workers and ecosystems have the same claim on us as nearby ones.', frameworkWeights: { cosmopolitanism: 1, 'environmental-ethics': 1 } },
      { id: 'c', text: 'Engage the cheaper source to improve conditions while sourcing, rather than just walking away.', frameworkWeights: { 'pragmatist-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'The cleaner source; being a company complicit in harm is not who you want to be.', frameworkWeights: { 'virtue-ethics': 2 } },
    ],
  },
  {
    questionText:
      'You can deploy low-cost internet to an underserved region via a closed system that locks users into your platform, or a slower open one that they control. Connectivity transforms lives either way. Which model?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'The open model; people deserve infrastructure they govern, not dependence on a foreign platform.', frameworkWeights: { autonomy: 1, 'justice-ethics': 1 } },
      { id: 'b', text: 'The open model; genuine empowerment means capability and self-determination, not just access.', frameworkWeights: { 'capabilities-approach': 2 } },
      { id: 'c', text: 'The closed model now if it connects people faster, then transition toward openness.', frameworkWeights: { consequentialism: 1, 'pragmatist-ethics': 1 } },
      { id: 'd', text: 'Decide with the communities themselves rather than choosing their infrastructure for them.', frameworkWeights: { 'discourse-ethics': 2, 'ubuntu-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your data centers could be sited in a poorer region that wants the jobs but has strained water and power that residents also need. The community is divided. Do you build there?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Only if residents\' essential water and power are genuinely protected first.', frameworkWeights: { 'justice-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'Let the community decide through a real, informed process, not a deal struck over their heads.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Weigh the jobs and investment against the strain on shared resources and residents\' needs.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Build only as a good guest — sharing benefits and bearing your own resource costs.', frameworkWeights: { 'ubuntu-ethics': 1, 'environmental-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A feature would let users offset their digital carbon footprint with one tap, but the offsets are of uncertain quality and may give a false sense of having "solved" the problem. Ship the offset feature?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Only with rigorously verified offsets and honest framing about their real limits.', frameworkWeights: { 'pragmatist-ethics': 2, deontology: 1 } },
      { id: 'b', text: 'Avoid it if it mostly buys comfort; the planet needs real reduction, not the feeling of action.', frameworkWeights: { 'environmental-ethics': 2 } },
      { id: 'c', text: 'Ship it if net effect is positive engagement with the issue, even if imperfect.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Don\'t let it become greenwashing; honesty about what it does and doesn\'t do is the real test.', frameworkWeights: { 'virtue-ethics': 2 } },
    ],
  },
  {
    questionText:
      'Your global product\'s default settings (always-on sync, high-res media) consume lots of data and energy, costly for users on metered, dirty-grid connections in poorer regions. Optimize defaults for them, or for your wealthiest users?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Default to efficient, low-data modes so the product serves those with the least, not just the most.', frameworkWeights: { 'justice-ethics': 2, 'environmental-ethics': 1 } },
      { id: 'b', text: 'Default to efficiency; a user\'s experience should not depend on the accident of where they live.', frameworkWeights: { cosmopolitanism: 2 } },
      { id: 'c', text: 'Detect context and adapt defaults to each user\'s real conditions.', frameworkWeights: { 'pragmatist-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'Default to the experience most users prefer and let others adjust.', frameworkWeights: { consequentialism: 1, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'A buyback program for old devices reduces e-waste but is expensive and most returned devices are just shredded, not reused. A reuse-and-repair program is greener but logistically hard and slow. Which do you fund?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'The reuse-and-repair program; extending devices\' lives is what actually serves the planet.', frameworkWeights: { 'environmental-ethics': 2 } },
      { id: 'b', text: 'Reuse-and-repair, channeling working devices to people who need affordable technology.', frameworkWeights: { 'justice-ethics': 1, 'capabilities-approach': 1 } },
      { id: 'c', text: 'Whichever measurably reduces total environmental harm per dollar, tracked honestly.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Start with reuse and iterate on the logistics rather than defaulting to easy shredding.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'Your AI agriculture tool boosts yields for large farms that can afford it, widening the gap with smallholders who feed much of the developing world. Sell to whoever pays, or design for smallholder access?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Design for smallholder access; tech that only widens the gap fails the people most in need.', frameworkWeights: { 'justice-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'Prioritize the global food system\'s most vulnerable producers across borders.', frameworkWeights: { cosmopolitanism: 2 } },
      { id: 'c', text: 'Serve paying farms to fund a smallholder version — sustainable cross-subsidy over pure mission or pure market.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Maximize total food produced; feeding more people is the dominant good.', frameworkWeights: { utilitarianism: 2 } },
    ],
  },
  {
    questionText:
      'A geoengineering simulation tool your team built could inform climate intervention — but publishing it might embolden reckless unilateral action by a single nation or actor. Release it openly, restrict it, or withhold it?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Restrict it to legitimate, accountable international bodies; planetary intervention needs collective governance.', frameworkWeights: { 'social-contract-theory': 1, cosmopolitanism: 1 } },
      { id: 'b', text: 'Insist any use be subject to broad global deliberation, never one actor\'s unilateral choice.', frameworkWeights: { 'discourse-ethics': 2 } },
      { id: 'c', text: 'Weigh the value of better-informed climate response against the risk of reckless deployment.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Proceed with deep caution; the power to alter the whole planet\'s systems demands humility.', frameworkWeights: { 'environmental-ethics': 1, stoicism: 1 } },
    ],
  },
  {
    questionText:
      'You can make your cloud service carbon-neutral by relocating compute to regions with clean grids — which happen to have weaker labor protections for the workers who build and run the facilities. Two goods conflict. What weighs more?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Neither at the other\'s expense; pursue clean energy and decent labor conditions together or not at all.', frameworkWeights: { 'justice-ethics': 2, 'environmental-ethics': 1 } },
      { id: 'b', text: 'Workers\' rights cannot be traded for emissions targets; protect the people first.', frameworkWeights: { 'rights-based-ethics': 2 } },
      { id: 'c', text: 'Engage to lift labor standards where you operate rather than choosing one good over the other.', frameworkWeights: { 'pragmatist-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'Weigh the climate benefit against the labor harm honestly and minimize the larger wrong.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Your free app is wildly popular in low-income regions but those users generate little revenue. Keeping it free there is a cost; charging would cut off millions. How do you justify the ongoing free access internally?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Frame it as obligation: access for those with the least is a duty, not charity to be cut when convenient.', frameworkWeights: { 'justice-ethics': 1, cosmopolitanism: 1 } },
      { id: 'b', text: 'Frame it as capability-building; what these users can do with the tool is worth real investment.', frameworkWeights: { 'capabilities-approach': 2 } },
      { id: 'c', text: 'Build a sustainable cross-subsidy so free access doesn\'t depend on goodwill that erodes under pressure.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Justify by total human benefit; reaching millions is itself a powerful good.', frameworkWeights: { utilitarianism: 2 } },
    ],
  },
  {
    questionText:
      'An emerging market wants your technology but also wants you to localize data and operations under a government with a poor human-rights record. Entering grows access and your business but risks complicity. Enter?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Decline if entry requires complicity in rights abuses; some markets cost too much to win.', frameworkWeights: { 'rights-based-ethics': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Weigh the benefit to ordinary users against the risk of enabling an abusive state, case by case.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Enter only with firm, public red lines about what you will and won\'t do under pressure.', frameworkWeights: { deontology: 1, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Consider the people who would gain access as equals whose interests count fully in the decision.', frameworkWeights: { cosmopolitanism: 2 } },
    ],
  },
  {
    questionText:
      'You can design your product to nudge users toward lower-carbon choices (less streaming, fewer flights) — a mild paternalism for the planet\'s sake — or stay neutral and respect their autonomy. Which?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Nudge gently; the planetary stakes justify making the greener choice the easier one.', frameworkWeights: { 'environmental-ethics': 1, consequentialism: 1 } },
      { id: 'b', text: 'Inform, don\'t nudge; respect people\'s freedom to make their own tradeoffs with honest information.', frameworkWeights: { autonomy: 2 } },
      { id: 'c', text: 'Make the impact visible and let users decide, trusting transparency over steering.', frameworkWeights: { 'discourse-ethics': 1, autonomy: 1 } },
      { id: 'd', text: 'Frame it as shared responsibility to future generations, inviting rather than imposing.', frameworkWeights: { 'justice-ethics': 1, 'ubuntu-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A cheaper manufacturing process for your product is significantly more polluting locally (affecting a specific community) but lowers global price, expanding access. Concentrated local harm vs. diffuse global benefit. Which?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Reject concentrating harm on one community for diffuse benefit; that community\'s burden is not yours to impose.', frameworkWeights: { 'justice-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Reject it; a defensible choice is one the burdened community could accept, which this is not.', frameworkWeights: { contractualism: 2 } },
      { id: 'c', text: 'Weigh the concentrated harm against the broad benefit and choose the lesser total harm.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'd', text: 'Seek a cleaner process; treating any community as a sacrifice zone is the deeper failure.', frameworkWeights: { 'environmental-ethics': 1, 'virtue-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your company could lobby for strong global e-waste regulations (good for the planet, costly for you and competitors) or quietly oppose them to protect margins. Both are legal corporate strategy. Which do you pursue?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Support strong regulation; the shared environment is a responsibility, not a cost to externalize.', frameworkWeights: { 'environmental-ethics': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Support it; using your influence for the public good is part of being a good corporate citizen.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Support a rule the whole industry and affected publics could accept as fair.', frameworkWeights: { 'social-contract-theory': 1, contractualism: 1 } },
      { id: 'd', text: 'Weigh long-term planetary and reputational benefit against short-term margin and act on the balance.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A "digital divide" grant lets you give free devices to students without internet at home. The cheapest devices are locked-down and data-harvesting; pricier ones are open and private. The grant covers only the cheap ones. What do you do?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Refuse to hand poor students surveilling devices; access should not come at the price of their privacy.', frameworkWeights: { 'justice-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Seek more funding or partners for decent devices rather than accept a harmful shortcut.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'c', text: 'Provide the cheap devices now; connection these students lack is itself transformative and urgent.', frameworkWeights: { 'capabilities-approach': 1, utilitarianism: 1 } },
      { id: 'd', text: 'Be honest with families about the tradeoff and let them choose.', frameworkWeights: { autonomy: 1, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your AI translation tool serves major languages superbly but ignores hundreds of smaller languages because they are unprofitable, accelerating their decline. Invest in low-resource languages, or focus where the users are?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Invest in endangered languages; preserving the capability to live in one\'s own language matters deeply.', frameworkWeights: { 'capabilities-approach': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Invest; a language is a culture, and letting tech hasten its loss is a real harm.', frameworkWeights: { 'environmental-ethics': 1, cosmopolitanism: 1 } },
      { id: 'c', text: 'Partner with those communities so the work is done with them, not for or to them.', frameworkWeights: { 'discourse-ethics': 1, 'ubuntu-ethics': 1 } },
      { id: 'd', text: 'Focus where users are; serving the most speakers does the most good with limited resources.', frameworkWeights: { utilitarianism: 2 } },
    ],
  },
  {
    questionText:
      'A breakthrough lets your devices last twice as long, which is great for users and the planet but would roughly halve your replacement sales. Releasing it threatens the business model the company depends on. Release it?',
    technologyTopic: 'Environment and Global',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Release it; making people buy more often than they need is not a model worth protecting.', frameworkWeights: { 'environmental-ethics': 1, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Release it and reinvent the business around durability; the right thing forces the better model.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'c', text: 'Release it; the benefit to users and planet outweighs the company\'s preference for repeat sales.', frameworkWeights: { utilitarianism: 1, 'justice-ethics': 1 } },
      { id: 'd', text: 'Release it; durable goods are what people are actually owed, not engineered obsolescence.', frameworkWeights: { 'rights-based-ethics': 1, deontology: 1 } },
    ],
  },
];

export const module10 = buildModule(
  {
    id: 'framework_module_10',
    moduleNumber: 10,
    title: 'Environmental and Global Technology Ethics',
    description:
      'The planetary and global-justice costs of technology — who pays, who benefits, and what we owe the future.',
    focus:
      'Climate footprint, e-waste, supply chains, the digital divide, and cross-border responsibility.',
    technologyTopic: 'Environment and Global',
  },
  seeds,
);
