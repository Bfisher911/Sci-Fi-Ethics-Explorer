import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 2 — Data, Privacy, and Consent
 * Difficulty 1–3. Data collection, surveillance, anonymization, user
 * agreements, secondary use, and informed consent.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'A health app discovers that its anonymized user data could help public-health researchers detect an emerging disease outbreak earlier. Users agreed to data use for "improving the app," not outside research. What should the company do?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Share it — earlier outbreak detection could save many lives, and the data is anonymized.', frameworkWeights: { utilitarianism: 3, consequentialism: 1 } },
      { id: 'b', text: 'Do not share until users are asked; consent given for one purpose does not extend to another.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'c', text: 'Share only what could be justified to each user as something they would not reasonably reject.', frameworkWeights: { contractualism: 3 } },
      { id: 'd', text: 'Offer a clear opt-in for research use and share the data of those who agree.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A "fully anonymized" dataset your team wants to publish could, combined with other public data, re-identify some individuals with effort. The research value is real. The re-identification risk is small but nonzero. Publish?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Publish; the realistic benefit to research outweighs a low-probability re-identification risk.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
      { id: 'b', text: 'Do not publish; people did not consent to a residual chance of being unmasked.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Publish only through controlled access to vetted researchers, not openly.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Hold it to a standard you could defend to the person most likely to be re-identified.', frameworkWeights: { contractualism: 2, 'ethics-of-care': 1 } },
    ],
  },
  {
    questionText:
      'Your company can buy a rich third-party data broker feed to better target ads. It is legal and competitors do it. The people in that data never knowingly agreed to be in a broker\'s file. Do you buy it?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'No — building on data gathered without people\'s knowledge makes you complicit in that violation.', frameworkWeights: { deontology: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'No — relying on a shadow market is not the kind of company worth becoming.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Yes — the data already exists and your use of it changes nothing about how it was collected.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Only if you can verify the broker obtained consent and gives people a way to opt out.', frameworkWeights: { autonomy: 1, 'justice-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A government agency requests user records from your platform under a lawful but broad order. Complying is legal; some of the requested data exceeds what seems necessary. How do you respond?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Comply fully; lawful orders from legitimate authority are owed compliance.', frameworkWeights: { 'social-contract-theory': 2, deontology: 1 } },
      { id: 'b', text: 'Comply only with the narrowest reading and legally contest the overbroad portion.', frameworkWeights: { 'rights-based-ethics': 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Push back; protecting users from excessive demands is part of stewarding their trust.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'd', text: 'Weigh the public interest the order serves against the user harm and act on the balance.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
    ],
  },
  {
    questionText:
      'Your app\'s privacy policy is accurate but 9,000 words long and almost no one reads it. A one-screen plain-language summary would be clearer but legally less complete. What do you put in front of users?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Lead with the plain-language summary; consent is meaningless if no one can understand what they agreed to.', frameworkWeights: { autonomy: 3 } },
      { id: 'b', text: 'Lead with the summary and link the full text; honest communication matters more than legal exhaustiveness.', frameworkWeights: { 'virtue-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Keep the full policy primary; precise disclosure is a duty regardless of readership.', frameworkWeights: { deontology: 2 } },
      { id: 'd', text: 'Test both and use whatever actually leaves users better informed in practice.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
    ],
  },
  {
    questionText:
      'A user asks you to delete all their data. Doing so is straightforward, but their data is woven into aggregate models and backups, and full erasure is costly and imperfect. How do you handle the request?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Honor it as fully and promptly as technically possible; it is their data and their call.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Delete the identifiable data and be transparent about what cannot be fully purged and why.', frameworkWeights: { deontology: 1, 'virtue-ethics': 2 } },
      { id: 'c', text: 'Delete what materially matters; chasing every backup fragment is cost without real benefit.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'd', text: 'Treat the request as a promise you owe them, and keep working until it is genuinely fulfilled.', frameworkWeights: { 'ethics-of-care': 2 } },
    ],
  },
  {
    questionText:
      'A wearable you make collects far more biometric data than its features use, "for future products." Storing it creates a tempting target and an ongoing liability. The data might enable great features later. Keep collecting it?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Stop; collect only what current features need. Restraint with data you do not yet use is the wiser posture.', frameworkWeights: { 'virtue-ethics': 2, 'daoist-ethics': 1 } },
      { id: 'b', text: 'Stop; hoarding data people did not consent to fuel future products oversteps the original agreement.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'c', text: 'Keep collecting; the option value of the data likely outweighs the manageable risk.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Keep collecting only with explicit consent for that future use, stored separately and minimally.', frameworkWeights: { contractualism: 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A school district wants your analytics on a learning app to flag students "at risk" of dropping out. The flags could trigger support — or follow students as a stigmatizing label. Do you build the feature?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Build it; early support for struggling students is worth the risk if used well.', frameworkWeights: { utilitarianism: 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Build it only with strict limits on who sees flags, how long they persist, and what they trigger.', frameworkWeights: { 'justice-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Decline unless students and families have a voice in whether and how they are labeled.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Decline; reducing a child to a risk score can shape their future in ways no benefit repays.', frameworkWeights: { 'rights-based-ethics': 2, 'capabilities-approach': 1 } },
    ],
  },
  {
    questionText:
      'Your team can infer users\' likely health conditions from their ordinary shopping and browsing behavior, enabling helpful nudges. Users never disclosed these conditions and might not want them inferred. Use the inference?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No — inferring intimate facts people chose not to share crosses a line consent never authorized.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'No — a company that quietly profiles people\'s health becomes something users cannot trust.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Yes, if the nudges genuinely help people and the inferences are never sold or exposed.', frameworkWeights: { consequentialism: 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'Only if you tell people you make such inferences and let them turn it off.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A long-time user dies. Their family asks for access to the account\'s private messages and photos. The user never specified what should happen to their data after death. What is the right approach?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Protect the deceased\'s privacy as they kept it in life, absent explicit instructions otherwise.', frameworkWeights: { deontology: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Attend to the grieving family\'s real needs while honoring what the person likely would have wanted.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Follow a clear, pre-published policy that everyone agrees to about post-mortem data.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'd', text: 'Provide a limited memorialized view rather than full access, balancing the competing claims.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your platform lets users see "why am I seeing this ad?" but the honest answer ("we inferred you are a new parent") may feel invasive. A vaguer answer is more comfortable but less truthful. What do you show?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Show the real reason; people are owed the truth about how they are being targeted.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'b', text: 'Show the real reason; transparency you might be embarrassed by is exactly the transparency that matters.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Show a softened reason; needless discomfort serves no one and could drive people away.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Show the real reason and pair it with an easy control to change or stop the targeting.', frameworkWeights: { autonomy: 1, 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A free national-ID-linked service would streamline access to benefits for millions but would also create a centralized record of who used what. Convenience and inclusion are real; so is the surveillance potential. Support it?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Support it; the inclusion gains for people currently shut out of benefits are transformative.', frameworkWeights: { 'capabilities-approach': 2, utilitarianism: 1 } },
      { id: 'b', text: 'Oppose it; a centralized record of citizens\' lives is a standing danger no convenience justifies.', frameworkWeights: { 'rights-based-ethics': 2, deontology: 1 } },
      { id: 'c', text: 'Support it only with strong legal firewalls, decentralization, and citizen oversight built in.', frameworkWeights: { 'social-contract-theory': 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Insist the decision belongs to the affected public through real deliberation, not to technologists.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'You can A/B test whether showing users their own data-sharing settings reduces sharing (and thus your revenue). The test itself is harmless, but you suspect transparency will cost the company money. Run it?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Run it and act on the result by making settings clearer, even if sharing and revenue fall.', frameworkWeights: { 'virtue-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Run it; people choosing to share less when they understand more is the system working correctly.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Run it but weigh the revenue impact against user benefit before committing to changes.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Skip the test and simply make the settings transparent because it is the right default.', frameworkWeights: { deontology: 2 } },
    ],
  },
  {
    questionText:
      'A researcher offers to buy access to your users\' aggregated mental-health chat patterns to study loneliness. The work could genuinely help people. The subject matter is unusually sensitive. How do you respond?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Decline outright; some categories of data are too intimate to become a research commodity.', frameworkWeights: { 'rights-based-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Proceed only with explicit, specific consent from the users whose patterns are involved.', frameworkWeights: { autonomy: 2, contractualism: 1 } },
      { id: 'c', text: 'Proceed under strict ethical review; the potential to ease real suffering is significant.', frameworkWeights: { utilitarianism: 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'Bring affected users into the decision rather than deciding their sensitive data\'s fate for them.', frameworkWeights: { 'discourse-ethics': 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your messaging app could add end-to-end encryption, protecting users from surveillance but also making it impossible to assist investigations into serious crimes conducted on the platform. Do you ship strong encryption?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Ship it; private communication is a fundamental protection that should not be conditional.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Ship it; on balance, universal private communication prevents far more harm than it enables.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
      { id: 'c', text: 'Hold off; a tool that can fully shield serious crime carries a public-safety duty you cannot ignore.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'd', text: 'Ship it but invest heavily in lawful, non-content tools to address abuse without breaking encryption.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A genealogy/DNA service you advise is asked by police to search its database for a relative of an unknown suspect in a cold murder case. Users consented to ancestry matching, not criminal investigation. Cooperate?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Cooperate; helping solve a murder is a weighty public good that can justify the intrusion.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'b', text: 'Refuse without a warrant; relatives who never consented should not be searched through this back door.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Cooperate only within a clear legal process the public has agreed governs such requests.', frameworkWeights: { 'social-contract-theory': 2, deontology: 1 } },
      { id: 'd', text: 'Decline; using people\'s genetic data against their relatives betrays the trust the service was built on.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
    ],
  },
  {
    questionText:
      'Your team can make consent "frictionless" with a single Accept-All button, which most users will click, or require granular choices that slow signup and reduce conversions but yield real consent. Which do you build?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Granular choices; a single Accept-All is consent in name only and respects no one\'s real will.', frameworkWeights: { autonomy: 3 } },
      { id: 'b', text: 'Granular choices; meaningful consent is a duty even when it costs conversions.', frameworkWeights: { deontology: 2 } },
      { id: 'c', text: 'A smart default with easy granular controls one tap away, balancing usability and real choice.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Accept-All; most people genuinely prefer speed, and forcing choices on the uninterested helps no one.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A multinational rollout means your app must comply with strict privacy law in one region and lax law in another. You could build one strong global standard or tailor protections to each region\'s legal floor. Which?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'One strong global standard; a user\'s protection should not depend on the accident of where they live.', frameworkWeights: { cosmopolitanism: 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'One strong standard; treating everyone to the same high bar is simply the right way to operate.', frameworkWeights: { deontology: 1, 'virtue-ethics': 2 } },
      { id: 'c', text: 'Tailor to each region; meeting each jurisdiction\'s democratic choices respects local self-governance.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'd', text: 'Tailor pragmatically, exceeding the legal floor where cheap to do so and feasible to maintain.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
    ],
  },
  {
    questionText:
      'You learn your company suffered a data breach exposing emails and hashed passwords. Disclosure is legally required within a window, but disclosing immediately—before full facts—could cause panic and stock damage. When do you tell users?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Immediately, with what is known; people have a right to protect themselves without delay.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Promptly and honestly, accepting the business pain as the cost of being trustworthy.', frameworkWeights: { 'virtue-ethics': 2, deontology: 1 } },
      { id: 'c', text: 'As soon as you can give accurate, actionable guidance—rushed half-information can harm more than help.', frameworkWeights: { consequentialism: 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'On the schedule and in the manner the law and your user agreement establish.', frameworkWeights: { 'social-contract-theory': 2 } },
    ],
  },
  {
    questionText:
      'A charity you support wants your platform\'s donor data to find "lookalike" donors elsewhere. Donors gave to the charity, not permission to be modeled and targeted across the web. Do you enable it?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'No — using donors as seeds to hunt strangers exceeds what they agreed to and treats them as instruments.', frameworkWeights: { deontology: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Yes — the charity\'s mission is good and lookalike modeling is standard, low-harm practice.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Only with donor opt-in; even a good cause should not repurpose people\'s data silently.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Decline; sustaining a charity by quietly trading on donor trust corrodes the goodwill it runs on.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
    ],
  },
];

export const module02 = buildModule(
  {
    id: 'framework_module_02',
    moduleNumber: 2,
    title: 'Data, Privacy, and Consent',
    description:
      'When data collected for one purpose could be used for another — and what consent really requires.',
    focus:
      'Secondary use, anonymization limits, lawful requests, deletion, sensitive inference, and meaningful consent.',
    technologyTopic: 'Data and Consent',
  },
  seeds,
);
