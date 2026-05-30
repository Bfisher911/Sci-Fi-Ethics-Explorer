import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 8 — Security, Safety, and Risk
 * Difficulty 3–4. Cybersecurity, emergency decisions, responsible
 * disclosure, public safety, and competing harms.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'You discover a severe vulnerability in a widely used system. Disclosing it publicly pressures a slow vendor to fix it but also hands the exploit to attackers before a patch exists. How do you disclose?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Private coordinated disclosure with a firm deadline, then public — balancing pressure and protection.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'b', text: 'Disclose privately and wait; releasing a live exploit endangers innocent users.', frameworkWeights: { 'ethics-of-care': 1, deontology: 1 } },
      { id: 'c', text: 'Disclose publicly; users have a right to know they are exposed so they can protect themselves.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Follow the established responsible-disclosure norms the security community has agreed on.', frameworkWeights: { 'social-contract-theory': 2 } },
    ],
  },
  {
    questionText:
      'Your company can pay a ransomware demand to quickly restore hospital systems, or refuse on principle and endure a longer, dangerous outage. Paying funds criminals and invites future attacks. What do you do?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Pay; with patients at immediate risk, restoring care now outweighs the systemic harm.', frameworkWeights: { utilitarianism: 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Refuse; funding criminals to attack the next hospital is a line that must hold.', frameworkWeights: { deontology: 1, 'social-contract-theory': 1 } },
      { id: 'c', text: 'Refuse if at all survivable; rewarding extortion guarantees more victims down the line.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Make the call by what protects the actual people in front of you right now, then fix the systemic issue.', frameworkWeights: { 'ethics-of-care': 2 } },
    ],
  },
  {
    questionText:
      'A security researcher demands a large "bounty" to reveal a flaw in your product, hinting they may sell it otherwise. Paying rewards near-extortion; not paying risks the flaw going to attackers. How do you respond?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Offer the standard bounty and engage in good faith; reward disclosure but refuse to be extorted.', frameworkWeights: { 'social-contract-theory': 1, 'justice-ethics': 1 } },
      { id: 'b', text: 'Refuse coercion on principle while racing to find and fix the flaw independently.', frameworkWeights: { deontology: 2 } },
      { id: 'c', text: 'Do whatever most reliably keeps the flaw out of attackers\' hands, including paying if necessary.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Engage honestly and firmly; how you handle this shapes whether you\'re a company researchers respect.', frameworkWeights: { 'virtue-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A safety feature in your product would prevent rare but severe accidents, but it adds friction that frustrates the vast majority who never face danger. Most users would disable it if they could. How do you set it?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Keep it on with no easy off-switch; preventing rare catastrophe outweighs routine annoyance.', frameworkWeights: { 'rights-based-ethics': 1, deontology: 1 } },
      { id: 'b', text: 'On by default, but let informed adults disable it for themselves.', frameworkWeights: { autonomy: 2 } },
      { id: 'c', text: 'Redesign to reduce friction so safety and usability stop being a tradeoff.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Weigh total expected harm prevented against aggregate frustration and set accordingly.', frameworkWeights: { utilitarianism: 2 } },
    ],
  },
  {
    questionText:
      'During a live security incident you can either be fully transparent with users in real time (causing panic and tipping off attackers) or communicate carefully once you understand the situation. Which do you choose?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Communicate once you can give accurate, actionable guidance; premature alarms can harm more than help.', frameworkWeights: { consequentialism: 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Tell users promptly what they need to protect themselves, even amid uncertainty.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Be as transparent as the situation safely allows; honesty under pressure is what earns trust.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'd', text: 'Follow your pre-agreed incident-communication policy so decisions aren\'t improvised under stress.', frameworkWeights: { 'social-contract-theory': 1, deontology: 1 } },
    ],
  },
  {
    questionText:
      'You build dual-use security tooling: it helps defenders test their systems but can also be used by attackers. Restricting access limits both. How widely do you distribute it?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Distribute openly; defenders need these tools, and secrecy mostly disadvantages the good actors.', frameworkWeights: { 'justice-ethics': 1, pragmatist-ethics: 1 } },
      { id: 'b', text: 'Restrict to verified defenders; knowingly arming attackers is not justified by convenience.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Distribute in whatever way the evidence shows reduces net real-world harm.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Follow community norms for dual-use release rather than deciding unilaterally.', frameworkWeights: { 'social-contract-theory': 1, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'An emergency-alert AI can warn a city of a possible disaster. It will sometimes issue false alarms (eroding trust, causing costly evacuations) and sometimes miss real events. How do you tune its sensitivity?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Toward catching real events even at the cost of false alarms; a missed disaster costs lives.', frameworkWeights: { 'ethics-of-care': 1, utilitarianism: 1 } },
      { id: 'b', text: 'Toward minimizing total expected harm across both error types, modeled honestly.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Toward whatever the affected public, informed of the tradeoffs, would choose for itself.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Toward preserving long-run trust; an alert system people stop believing protects no one.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'You find that a colleague shipped code with a known security shortcut under deadline pressure. It hasn\'t caused harm yet. Reporting it could end their job; staying silent leaves users exposed. What do you do?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Raise it directly with them first, giving them the chance to fix it before escalating.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Escalate it; user safety is not something to trade for a colleague\'s comfort.', frameworkWeights: { 'rights-based-ethics': 1, utilitarianism: 1 } },
      { id: 'c', text: 'Report it through the proper channel the organization has established for exactly this.', frameworkWeights: { 'social-contract-theory': 2, deontology: 1 } },
      { id: 'd', text: 'Act to get it fixed fastest with least collateral harm to anyone involved.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A government safety agency wants a backdoor into your encryption "only for emergencies." It could help in genuine crises but creates a vulnerability that could be abused or stolen. Cooperate?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Refuse; a backdoor is a permanent weakness whose abuse potential dwarfs its emergency value.', frameworkWeights: { consequentialism: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Refuse; deliberately weakening everyone\'s security betrays the protection you owe users.', frameworkWeights: { deontology: 1, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Refuse the backdoor but build lawful, targeted assistance that doesn\'t break encryption for all.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Insist any such decision be made openly through democratic process, not a private deal.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'Your team can spend its limited security budget hardening against a likely-but-minor threat (frequent small breaches) or an unlikely-but-catastrophic one (a rare total compromise). You can\'t do both well. Which?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Hedge against catastrophe; even low-probability ruin warrants protecting people from the worst case.', frameworkWeights: { 'rights-based-ethics': 1, stoicism: 1 } },
      { id: 'b', text: 'Compute expected harm (probability × severity) and protect against the larger figure.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Address the frequent harms users actually suffer now rather than a speculative tail risk.', frameworkWeights: { 'ethics-of-care': 1, pragmatist-ethics: 1 } },
      { id: 'd', text: 'Find the layered approach that reduces both meaningfully rather than betting on one.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A safety-critical system you maintain could be made far safer with a costly redesign, or kept at "acceptable" current risk levels that meet regulations but that you privately believe are too lax. What do you push for?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Push for the redesign; meeting the legal minimum is not the same as doing right by the people at risk.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Push for it; if you believe the standard is too lax, deferring to it makes you complicit in the harm.', frameworkWeights: { deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Quantify the additional risk and make the case on expected lives or harm, not just intuition.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Surface your concern transparently so the decision is made with full information, not buried.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'You can collect detailed telemetry to detect attacks early, but the same telemetry is a privacy intrusion and a juicy target if breached. More data means better defense and bigger risk. How much do you collect?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Collect the minimum that materially improves defense; restraint reduces both intrusion and liability.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Limit it; surveilling users to protect them can become the very harm you meant to prevent.', frameworkWeights: { 'rights-based-ethics': 2 } },
      { id: 'c', text: 'Collect what demonstrably lowers total expected harm, security and privacy risk together.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Decide collection limits with user input and transparency, not unilaterally.', frameworkWeights: { 'discourse-ethics': 1, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'A user is clearly being targeted by a sophisticated attacker (stalkerware, account takeover attempts). Intervening proactively means examining their account closely — itself a privacy intrusion. Do you intervene?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Reach out to the user and act with their consent rather than examining their account unilaterally.', frameworkWeights: { autonomy: 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Intervene to protect them; an active threat to a person justifies a careful, limited look.', frameworkWeights: { 'ethics-of-care': 2, utilitarianism: 1 } },
      { id: 'c', text: 'Act within a clear, pre-published policy for threat response that users have agreed to.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'd', text: 'Intervene only as far as you could justify to the user afterward as necessary and minimal.', frameworkWeights: { contractualism: 2 } },
    ],
  },
  {
    questionText:
      'An autonomous safety system (e.g., automatic braking) will, in a genuinely unavoidable crash, have to act in a way that distributes harm. You set its policy. What principle governs its split-second choice?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Minimize total harm to human life across everyone involved.', frameworkWeights: { utilitarianism: 3 } },
      { id: 'b', text: 'Never deliberately sacrifice an uninvolved bystander, even to reduce total harm.', frameworkWeights: { 'rights-based-ethics': 2, deontology: 1 } },
      { id: 'c', text: 'Behave predictably by clear public rules people can understand and rely on.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'd', text: 'Set the policy through open, accountable process since the public bears its consequences.', frameworkWeights: { 'discourse-ethics': 2, contractualism: 1 } },
    ],
  },
  {
    questionText:
      'You can warn the public about a security threat in technical, precise language (accurate but ignored) or simplified, slightly alarmist language (less precise but actually heeded). Which serves safety better?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Clear, actionable language that people will heed; a warning no one acts on protects no one.', frameworkWeights: { consequentialism: 2, 'pragmatist-ethics': 1 } },
      { id: 'b', text: 'Accurate language without alarmism; manipulating people through fear, even for safety, is wrong.', frameworkWeights: { deontology: 1, autonomy: 1 } },
      { id: 'c', text: 'Plain and honest — clear enough to act on, truthful enough to respect people\'s judgment.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'd', text: 'Tailored to the audience\'s real needs and capacities, meeting people where they are.', frameworkWeights: { 'ethics-of-care': 2 } },
    ],
  },
  {
    questionText:
      'Your bug-bounty program received a report of a flaw, but fixing it properly will take months and break a feature users love. A quick partial fix leaves some risk. How do you proceed?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Do the proper fix; a known flaw left partly open is a risk you are choosing to impose on users.', frameworkWeights: { 'rights-based-ethics': 1, deontology: 1 } },
      { id: 'b', text: 'Ship the partial fix now and the full fix as fast as possible — reduce live risk immediately.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'c', text: 'Be transparent with users about the residual risk so they can protect themselves meanwhile.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Weigh the probability and severity of exploitation against the feature loss and decide on that.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A disaster-response app you built is being overwhelmed in a real emergency. You can prioritize requests by severity (utilitarian triage) or by order received (first-come fairness). The system can only do one. Which?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Triage by severity; in a true emergency, directing help where it saves the most is the duty.', frameworkWeights: { utilitarianism: 3 } },
      { id: 'b', text: 'First-come, equal treatment; severity assessments can be biased and erode trust in a crisis.', frameworkWeights: { 'justice-ethics': 2, deontology: 1 } },
      { id: 'c', text: 'Triage, but with transparent, defensible criteria everyone could accept as fair.', frameworkWeights: { contractualism: 2 } },
      { id: 'd', text: 'Whatever responders on the ground judge best; honor their situated discretion over a fixed rule.', frameworkWeights: { 'pragmatist-ethics': 1, 'ethics-of-care': 1 } },
    ],
  },
  {
    questionText:
      'You learn a competitor\'s product has a serious safety flaw they seem unaware of. Telling them helps their users but aids a rival; staying quiet protects your position but leaves their users at risk. What do you do?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Tell them; people\'s safety does not stop mattering because they use a competitor.', frameworkWeights: { 'ethics-of-care': 1, cosmopolitanism: 1, utilitarianism: 1 } },
      { id: 'b', text: 'Tell them; being the kind of company (and person) who warns even a rival is who you want to be.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Tell them through responsible-disclosure channels, as the security community expects of everyone.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'd', text: 'Tell them; you would want a rival to warn you, and that reciprocity is the fair rule.', frameworkWeights: { contractualism: 1, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A penetration test you are running has unexpectedly given you access to extremely sensitive real user data. Your scope allowed the access path but not viewing the data. You\'ve already glimpsed some. What now?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Stop immediately, document the exposure, and report it without examining further.', frameworkWeights: { deontology: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Treat the data as you would want yours treated — look no further and disclose honestly.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'c', text: 'Follow the engagement\'s rules of engagement to the letter for exactly this situation.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'd', text: 'Report fully so the real exposure is fixed; the value is in closing the hole, not the peek.', frameworkWeights: { consequentialism: 1, pragmatist-ethics: 1 } },
    ],
  },
  {
    questionText:
      'Your company can publish a transparency report detailing security incidents and government requests (building public trust but exposing weaknesses) or keep quiet (safer competitively, less accountable). Publish?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Publish; people affected by your systems are owed an account of how you handle their safety.', frameworkWeights: { 'rights-based-ethics': 1, 'discourse-ethics': 1 } },
      { id: 'b', text: 'Publish; transparency you might prefer to avoid is exactly the transparency that builds real trust.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Publish; the public-trust and ecosystem benefits outweigh the competitive exposure.', frameworkWeights: { consequentialism: 1, 'social-contract-theory': 1 } },
      { id: 'd', text: 'Publish at a level of detail useful to users without itself creating new attack surface.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
];

export const module08 = buildModule(
  {
    id: 'framework_module_08',
    moduleNumber: 8,
    title: 'Security, Safety, and Risk',
    description:
      'High-stakes calls under uncertainty, where protecting some people can expose others.',
    focus:
      'Responsible disclosure, ransomware, emergency triage, dual-use tools, and competing harms.',
    technologyTopic: 'Security and Safety',
  },
  seeds,
);
