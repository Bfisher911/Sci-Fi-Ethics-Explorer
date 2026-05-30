import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 4 — Design Ethics and User Experience
 * Difficulty 2–4. Persuasive design, accessibility, attention, dark
 * patterns, nudging, user autonomy, and product choices.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'Your cancellation flow can be a single clear button, or a multi-step "are you sure?" gauntlet that measurably reduces churn by wearing people down. Both are legal. Which do you build?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'The single button; making people fight to leave defeats their will rather than informing it.', frameworkWeights: { autonomy: 3 } },
      { id: 'b', text: 'The single button; a company that traps users is not one worth building.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'One honest retention offer, then an easy exit — persuasion is fine, coercion is not.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'The gauntlet; retained users often stay glad they did, and friction is a normal business tool.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'An infinite-scroll feed keeps users engaged far longer than a paginated one. Many users later say they "wasted time," but in the moment they keep scrolling. Which design do you ship?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Add natural stopping points; respecting people\'s considered preferences over their in-the-moment pull.', frameworkWeights: { autonomy: 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Add stopping points; a design that leaves people feeling worse is failing them whatever the metric.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'c', text: 'Keep infinite scroll but give users easy time-awareness and limits they control.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Keep it; people are free to stop, and engagement is what the product is judged on.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Adding full screen-reader accessibility to your app is expensive and benefits a small fraction of users. Skipping it lets you ship more features faster for everyone else. How do you weigh it?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Prioritize accessibility; the capability to use the product at all outweighs marginal features for others.', frameworkWeights: { capabilities-approach: 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Prioritize it; excluding disabled users from participation is a fairness failure, not a cost-benefit line.', frameworkWeights: { 'justice-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Do the high-impact accessibility basics now and stage the rest pragmatically.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Treat access for excluded people as a duty, not a feature to be out-prioritized.', frameworkWeights: { deontology: 2 } },
    ],
  },
  {
    questionText:
      'A "nudge" defaulting users into organ-donor registration (with easy opt-out) dramatically raises donor rates and saves lives. Critics call it manipulation of a deeply personal choice. Use the default nudge?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Use it; the lives saved by a reversible default vastly outweigh the mild steer.', frameworkWeights: { utilitarianism: 3 } },
      { id: 'b', text: 'Avoid it for so personal a matter; defaults that exploit inertia on identity-level choices overstep.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Use a mandated-choice design instead, prompting an active decision without a hidden default.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Decide it democratically; how a society sets such defaults is a question for the public, not designers.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'Your game monetizes with loot boxes — randomized paid rewards that some players find thrilling and a few pursue compulsively, spending heavily. Revenue is strong. Do you keep the mechanic?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Remove or cap it; profiting from the few who spiral is not a business worth running.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Keep it with hard spending limits and self-exclusion tools to protect the vulnerable few.', frameworkWeights: { 'justice-ethics': 1, 'pragmatist-ethics': 2 } },
      { id: 'c', text: 'Keep it; most players enjoy it freely and adults can manage their own spending.', frameworkWeights: { autonomy: 2, consequentialism: 1 } },
      { id: 'd', text: 'Remove it; designing reward loops that prey on compulsion treats players as marks, not people.', frameworkWeights: { 'rights-based-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A signup form pre-checks the "email me offers" box (legal in your market). Unchecking is easy but most won\'t. Pre-check it for higher opt-in, or leave it blank for genuine choice?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 1,
    options: [
      { id: 'a', text: 'Leave it blank; a pre-checked box manufactures consent the person never actually gave.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'b', text: 'Leave it blank; honest opt-in is simply the decent way to treat people who trust your form.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Pre-check it; recipients can opt out instantly and most are fine with relevant offers.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Leave it blank and make the value of subscribing clear, earning the opt-in honestly.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'You can personalize prices, quietly showing higher prices to users who appear willing to pay more. It is legal and lifts revenue. Some would call it efficient; others, exploitative. Implement it?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — charging people more for being detectable as desperate or loyal is a betrayal of fair dealing.', frameworkWeights: { 'justice-ethics': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'No — covertly extracting more from individuals based on profiling treats them as objects to optimize.', frameworkWeights: { 'rights-based-ethics': 2, deontology: 1 } },
      { id: 'c', text: 'Only if pricing logic is transparent, so people know prices vary and why.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Yes — differential pricing can fund lower prices for those who need them, like sliding scales.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Your onboarding could front-load a thorough but tedious permissions explanation (lower completion, better-informed users) or a slick fast path (higher completion, less understanding). Which experience do you design?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Informed over slick; completions you got by keeping people in the dark are not worth having.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'b', text: 'A layered design — fast path with clear, inviting depth available — tested for real comprehension.', frameworkWeights: { 'pragmatist-ethics': 3 } },
      { id: 'c', text: 'Slick; most users prefer speed and the permissions are reasonable defaults anyway.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Whatever leaves users genuinely able to understand and control what they enabled.', frameworkWeights: { capabilities-approach: 2 } },
    ],
  },
  {
    questionText:
      'A social app could add a subtle "X friends are active now" cue that increases visits but also intensifies fear-of-missing-out for some users. The cue is truthful. Include it?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'No — even true signals engineered to exploit anxiety are not what a good product should lean on.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'b', text: 'No — manufacturing social pressure to drive visits manipulates rather than serves the user.', frameworkWeights: { autonomy: 2 } },
      { id: 'c', text: 'Yes, optionally — let users decide whether to see presence cues at all.', frameworkWeights: { autonomy: 1, 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Yes — it is honest, useful for coordination, and most users are not harmed by it.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A "streak" or daily-login reward makes your app stickier but punishes people for normal life interruptions (illness, travel) by resetting progress. Keep the punishing reset, soften it, or drop streaks?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Soften it with grace periods; design should bend to human life, not punish it.', frameworkWeights: { 'ethics-of-care': 2, 'pragmatist-ethics': 1 } },
      { id: 'b', text: 'Drop punishing mechanics; motivating people by fear of loss is the wrong thing to cultivate.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Keep it; loss aversion works and most users find streaks motivating, not cruel.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Let users opt into hardcore streaks or relaxed mode, honoring different temperaments.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'You can ship a beautiful interface that works only on the latest devices, or a plainer one that runs well on old, low-end hardware many users actually have. Resources allow only one focus now. Which?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'The inclusive plain version; a product people cannot run is no product for them at all.', frameworkWeights: { capabilities-approach: 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'The inclusive version; serving users the market overlooks is where responsibility points.', frameworkWeights: { cosmopolitanism: 1, 'justice-ethics': 2 } },
      { id: 'c', text: 'A baseline that runs everywhere first, polish for newer devices later.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'The premium version; delighting the core users best grows the product to help more later.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A child-facing app could use bright rewards and autoplay to keep kids engaged for "educational" content, or deliberately design for natural stopping and parent control at the cost of engagement. Which?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Design for stopping and parent control; children warrant protection from engagement-maximizing design.', frameworkWeights: { 'ethics-of-care': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Design for stopping; cultivating healthy attention habits is the point of anything calling itself educational.', frameworkWeights: { 'virtue-ethics': 2, capabilities-approach: 1 } },
      { id: 'c', text: 'Keep some engagement hooks but bounded; learning needs motivation and total austerity loses kids.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Give parents the controls and let families decide their own balance.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'Your accessibility audit finds the new design fails colorblind users on a key status indicator. Fixing it slightly compromises the brand\'s signature look the design team fought for. What wins?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Accessibility; no one should be locked out of essential information for a brand aesthetic.', frameworkWeights: { 'justice-ethics': 2, capabilities-approach: 1 } },
      { id: 'b', text: 'Accessibility; the duty not to exclude outranks visual preference.', frameworkWeights: { deontology: 2 } },
      { id: 'c', text: 'Find a design that satisfies both — usually possible with effort rather than a binary tradeoff.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Accessibility; the brand is not served by a look that fails the people using it.', frameworkWeights: { 'ethics-of-care': 1, 'virtue-ethics': 1, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A confirmshaming pattern ("No thanks, I don\'t want to save money") boosts opt-ins by making the decline feel foolish. It is common and effective. Do you use it?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'No — guilt-tripping people for a legitimate choice is manipulation, however common.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'b', text: 'No — shaming your own users is beneath the kind of product you want to make.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'No — and the short-term lift is not worth the trust it quietly burns.', frameworkWeights: { consequentialism: 1, 'ethics-of-care': 1 } },
      { id: 'd', text: 'Use neutral, respectful copy that states the offer plainly and lets people decline with dignity.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'You can make your product\'s data export genuinely easy (helping users leave for competitors) or technically compliant but cumbersome (locking them in). Both meet the letter of portability rules. Which?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Genuinely easy; people own their data and should be able to walk with it freely.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Genuinely easy; competing by trapping people rather than serving them is a hollow win.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Genuinely easy; an interoperable ecosystem is better for everyone, including you long-term.', frameworkWeights: { consequentialism: 1, cosmopolitanism: 1, 'justice-ethics': 1 } },
      { id: 'd', text: 'Compliant-but-cumbersome; retaining users is a legitimate goal and you met the legal bar.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A subscription could auto-renew silently (standard, higher retention) or send a clear reminder before each charge (lower retention, fewer surprise charges and refund requests). Which do you choose?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Send the reminder; charging people who have forgotten they subscribed is not consent worth keeping.', frameworkWeights: { autonomy: 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Send it; treating people as you would want to be treated builds the trust the business runs on.', frameworkWeights: { 'ethics-of-care': 1, 'virtue-ethics': 1, deontology: 1 } },
      { id: 'c', text: 'Silent renewal; it is industry-standard, users agreed, and reminders just prompt cancellations.', frameworkWeights: { consequentialism: 2, 'social-contract-theory': 1 } },
      { id: 'd', text: 'Remind for large or annual charges, silent for small recurring ones — proportionate to surprise.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A meditation app could use mild guilt and notification pressure to build a habit, or trust users to return on their own with gentler design — fitting the product\'s calm philosophy but reducing usage. Which?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Gentle design; a calm product that agitates people to use it contradicts its own purpose.', frameworkWeights: { 'virtue-ethics': 2, daoist-ethics: 1 } },
      { id: 'b', text: 'Gentle design; let people come and go freely rather than engineering compulsion.', frameworkWeights: { autonomy: 1, daoist-ethics: 2 } },
      { id: 'c', text: 'Gentle nudges only — supportive reminders without pressure, tested for genuine wellbeing.', frameworkWeights: { 'ethics-of-care': 2, 'pragmatist-ethics': 1 } },
      { id: 'd', text: 'Some habit pressure; the benefit of an established practice can justify a firmer hand.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'You can ship a feature that helps power users a lot but adds complexity that confuses newcomers, or keep things simple and underserve advanced users. The two groups genuinely conflict. How do you decide?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Design progressive disclosure so each group gets what it needs without harming the other.', frameworkWeights: { 'pragmatist-ethics': 3 } },
      { id: 'b', text: 'Favor newcomers; not excluding the less-expert is the more important fairness.', frameworkWeights: { 'justice-ethics': 1, capabilities-approach: 2 } },
      { id: 'c', text: 'Favor whichever serves the larger or higher-need group on the evidence.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'd', text: 'Ask both groups and let their stated needs guide the call.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A notification could be honest ("we have nothing urgent, but here\'s a suggestion") or framed to look time-sensitive to drive opens. The honest version gets ignored; the urgent-looking one works. Which do you send?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'The honest one; faking urgency trains people to distrust you and is simply a lie.', frameworkWeights: { deontology: 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'The honest one; respecting attention you have no real claim on is the decent default.', frameworkWeights: { autonomy: 2 } },
      { id: 'c', text: 'Neither — earn opens with genuinely valuable content rather than manipulating framing.', frameworkWeights: { 'pragmatist-ethics': 2, 'virtue-ethics': 1 } },
      { id: 'd', text: 'The urgent framing occasionally; attention is scarce and a nudge is within normal marketing.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Your team debates whether to let users fully turn off algorithmic ranking and see a plain chronological feed, which most won\'t use but a vocal minority demands as a matter of control. Offer the option?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Offer it; people should be able to choose how their own feed is ordered.', frameworkWeights: { autonomy: 3 } },
      { id: 'b', text: 'Offer it; control over the system shaping your attention is a reasonable thing to be owed.', frameworkWeights: { 'rights-based-ethics': 2 } },
      { id: 'c', text: 'Offer it as a clear toggle; the cost is low and meeting the demand respects the community.', frameworkWeights: { 'pragmatist-ethics': 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Skip it; few will use it and the ranked feed genuinely serves most people better.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
];

export const module04 = buildModule(
  {
    id: 'framework_module_04',
    moduleNumber: 4,
    title: 'Design Ethics and User Experience',
    description:
      'How interface choices shape — or override — the autonomy and wellbeing of the people using them.',
    focus:
      'Dark patterns, defaults, persuasive design, accessibility, attention, and respect for user choice.',
    technologyTopic: 'Design and Attention',
  },
  seeds,
);
