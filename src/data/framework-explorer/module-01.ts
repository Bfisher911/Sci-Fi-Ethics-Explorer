import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 1 — Everyday Technology Choices
 * Difficulty 1. Common digital decisions: privacy vs convenience, user
 * trust, defaults, everyday behavior. Every option is defensible; none
 * is the "obvious good-person" answer.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'A campus app can make student life easier by tracking location patterns to recommend study spaces, dining options, and safety alerts. The data is anonymized, but most students will not grasp how much movement data is collected. How should the university proceed?',
    technologyTopic: 'Privacy and Convenience',
    difficultyLevel: 1,
    options: [
      { id: 'a', text: 'Launch it with clear, granular settings and let each student decide how much tracking to allow.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1, 'pragmatist-ethics': 1 } },
      { id: 'b', text: 'Delay launch until the university can show students actually understand the tradeoff before opting in.', frameworkWeights: { deontology: 2, 'ethics-of-care': 1, autonomy: 1 } },
      { id: 'c', text: 'Release it — the safety and convenience gains outweigh the privacy cost once data is anonymized.', frameworkWeights: { utilitarianism: 2, consequentialism: 2 } },
      { id: 'd', text: 'Convene a standing student group to decide what is collected, how long it is kept, and when to revisit.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your messaging app could turn on read-receipts by default, which most users like once they have it but few would enable themselves. Shipping it on-by-default measurably increases engagement. What do you set as the default?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 1,
    options: [
      { id: 'a', text: 'Off by default; surfacing it as an obvious, easy opt-in respects what people would actually choose.', frameworkWeights: { autonomy: 3 } },
      { id: 'b', text: 'On by default, since the data shows people end up preferring it and engagement rises.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
      { id: 'c', text: 'On, but with a first-run screen that plainly explains it and offers a one-tap switch.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Off; defaults that quietly harvest behavior the user did not ask for erode the trust a product depends on.', frameworkWeights: { 'virtue-ethics': 2, 'rights-based-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A free weather app keeps the lights on by selling coarse, de-identified location data to advertisers. A paid tier with no data sale exists but few choose it. Is continuing the free, ad-supported model acceptable?',
    technologyTopic: 'Privacy and Convenience',
    difficultyLevel: 1,
    options: [
      { id: 'a', text: 'Yes — people freely accept the trade for a free product, and a paid alternative exists.', frameworkWeights: { 'social-contract-theory': 2, autonomy: 1 } },
      { id: 'b', text: 'Only if the data sale is disclosed in plain language people can actually find and understand.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'c', text: 'Yes — the aggregate value created for users and the business outweighs a small, diffuse privacy cost.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'd', text: 'No — monetizing people who cannot afford the paid tier turns the poorest users into the product.', frameworkWeights: { 'justice-ethics': 2, 'ethics-of-care': 1 } },
    ],
  },
  {
    questionText:
      'You notice a coworker reusing the same weak password across company tools. They are stressed and behind. You could quietly report it to IT, tell them directly, or fix nothing. What feels most appropriate?',
    technologyTopic: 'Security and Safety',
    difficultyLevel: 1,
    options: [
      { id: 'a', text: 'Talk to them privately first; give them a chance to fix it and offer to help.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Report it to IT — the org-wide risk is not yours to sit on, regardless of the awkwardness.', frameworkWeights: { utilitarianism: 2, 'social-contract-theory': 1 } },
      { id: 'c', text: 'Follow whatever the security policy says to do; that is what the policy is for.', frameworkWeights: { deontology: 2, 'social-contract-theory': 1 } },
      { id: 'd', text: 'Stay out of it; it is their account and their responsibility to manage.', frameworkWeights: { autonomy: 2, stoicism: 1 } },
    ],
  },
  {
    questionText:
      'A fitness app you built shows a daily streak counter that clearly drives habit formation, but a minority of users describe anxiety and compulsive checking. Removing it would lower overall engagement. What do you do?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Keep it but add easy controls to mute or hide the streak for anyone who wants to.', frameworkWeights: { autonomy: 2, 'pragmatist-ethics': 1 } },
      { id: 'b', text: 'Keep it — for most people it produces real, lasting health benefits.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'c', text: 'Redesign it around gentle, non-punishing feedback; a good product should not need to exploit anxiety.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'Treat the harmed minority as a hard constraint, not a rounding error, and change the mechanic.', frameworkWeights: { 'rights-based-ethics': 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A smart-home assistant can keep a short rolling buffer of audio to respond faster. It is never uploaded and is overwritten in seconds. Users were not told, because explaining it well is hard. Should the team disclose it?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Disclose it plainly even if it costs sign-ups; people have a right to know their mic behaves this way.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Disclose it — being the kind of company that hides microphone behavior is its own corruption.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Skip detailed disclosure; the buffer is harmless and over-explaining will just confuse and alarm people.', frameworkWeights: { consequentialism: 2, 'pragmatist-ethics': 1 } },
      { id: 'd', text: 'Put the choice to users through a clear consent flow and let them decide what they accept.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A popular browser extension you maintain is acquired by a company that wants to inject affiliate links into pages users visit. The change is legal and disclosed in updated terms most will not read. Do you accept the deal?',
    technologyTopic: 'Privacy and Convenience',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Decline; quietly altering pages people trust you to leave alone betrays the relationship you built.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Accept only if the injection is visibly labeled and trivially switched off.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'c', text: 'Accept; the revenue sustains the tool and the cost to any single user is tiny.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'd', text: 'Accept, but only after putting it to your user community and abiding by what they say.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'Your team can ship an accessibility overhaul that helps the roughly 4% of users with low vision, or a flashy feature that delights the other 96%. You only have engineers for one this quarter. Which do you prioritize?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'The accessibility work; usability for excluded people is a matter of fairness, not a popularity contest.', frameworkWeights: { 'justice-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'The accessibility work; what people can actually do with the product is the real measure of its worth.', frameworkWeights: { 'capabilities-approach': 2, 'ethics-of-care': 1 } },
      { id: 'c', text: 'The feature for the 96%; the greatest benefit to the most users should guide a scarce quarter.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'd', text: 'Sequence both: ship the smaller accessibility fixes now and stage the feature next, rather than choosing once.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A note-taking app could back up everything to the cloud by default so users never lose data, or keep notes local-only by default so nothing leaves the device unless asked. Which default better serves users?',
    technologyTopic: 'Privacy and Convenience',
    difficultyLevel: 1,
    options: [
      { id: 'a', text: 'Local-only by default; nothing should leave a person\'s device without an affirmative choice.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Cloud by default; the overwhelming real-world harm is lost data, and most people want it backed up.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
      { id: 'c', text: 'Whichever the user picks in a clear first-run choice that frames the tradeoff honestly.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
      { id: 'd', text: 'Local-only; restraint and not grabbing data you do not need is simply the better habit for a builder.', frameworkWeights: { 'virtue-ethics': 2, 'daoist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'You find a minor bug that lets your app see slightly more contact data than users granted. No one has noticed, fixing it is easy, but disclosing the past over-collection could spook your small user base. What do you do?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Fix it and tell users plainly what happened, even at the cost of trust in the short term.', frameworkWeights: { deontology: 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Fix it and notify; people have a standing claim to know when their data was touched beyond consent.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Fix it quietly; the practical harm was nil and a scary disclosure helps no one.', frameworkWeights: { consequentialism: 2, 'pragmatist-ethics': 1 } },
      { id: 'd', text: 'Fix it, disclose it, and treat it as a chance to show users the kind of stewardship they can count on.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A ride-share app can show riders a slightly inflated wait time so the real car always feels "early," improving satisfaction scores. The deception is small and arguably harmless. Should the team ship it?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'No — engineering a pleasant feeling by lying to users is wrong however small the lie.', frameworkWeights: { deontology: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'No — a team that normalizes small deceptions becomes one that ships large ones.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Yes — riders end up happier and no one is materially harmed.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
      { id: 'd', text: 'Only if riders are told estimates include a buffer, so the "early" feeling is not built on a falsehood.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your photo app could auto-enhance every uploaded selfie (smoothing skin, brightening eyes) because tests show people share more when it is on. Some users feel it subtly tells them they need fixing. Default on or off?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Off by default; people should opt into being altered, not opt out of it.', frameworkWeights: { autonomy: 2 } },
      { id: 'b', text: 'On by default; sharing and satisfaction both rise, and the effect is gentle and reversible.', frameworkWeights: { consequentialism: 2, utilitarianism: 1 } },
      { id: 'c', text: 'Off; quietly teaching people their faces need correcting is the wrong thing to cultivate in users.', frameworkWeights: { 'virtue-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'On, with an obvious toggle and a one-time note explaining exactly what the enhancement does.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'A community Wi-Fi network you administer is being heavily used by a few neighbors for large downloads, slowing it for everyone. You could throttle the heavy users, ask them to self-limit, or leave it open. What is fair?',
    technologyTopic: 'Privacy and Convenience',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Raise it openly with the neighbors and agree together on norms for shared use.', frameworkWeights: { 'discourse-ethics': 2, 'ubuntu-ethics': 1 } },
      { id: 'b', text: 'Throttle the heaviest users so the scarce resource is shared more evenly.', frameworkWeights: { 'justice-ethics': 2, utilitarianism: 1 } },
      { id: 'c', text: 'Set and publish clear usage rules everyone agrees to as a condition of access.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'd', text: 'Leave it open; people will largely sort it out, and heavy-handed control breeds resentment.', frameworkWeights: { 'daoist-ethics': 2, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'An elderly relative asks you to set up a tablet. You could install a locked-down, simplified setup that is safer but limits what they can explore, or a full setup that trusts them to learn. Which do you choose?',
    technologyTopic: 'Privacy and Convenience',
    difficultyLevel: 1,
    options: [
      { id: 'a', text: 'A full setup; treating a capable adult as fragile is its own kind of disrespect.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'A full setup that expands what they can actually do, with support available when they want it.', frameworkWeights: { 'capabilities-approach': 2, 'ethics-of-care': 1 } },
      { id: 'c', text: 'A locked-down setup; the realistic risk of scams and mistakes outweighs the lost exploration.', frameworkWeights: { consequentialism: 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'Ask them what they want it to do and set it up to match their own goals.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A free educational app for kids could include unobtrusive ads to stay free for everyone, or go paid and become inaccessible to lower-income families. There is no perfect funding model. What is the more responsible choice?',
    technologyTopic: 'Privacy and Convenience',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Keep it free with strictly limited, non-tracking ads so access is not gated by income.', frameworkWeights: { 'justice-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'Keep it free; reaching the most children with learning is the outcome that matters most.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'c', text: 'Go paid; children are not an appropriate audience to monetize through advertising at all.', frameworkWeights: { deontology: 2, 'rights-based-ethics': 1 } },
      { id: 'd', text: 'Seek a third path — grants, school licensing, donations — rather than accept the framing as binary.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'Your app can send a daily push notification that reliably brings people back but also interrupts their evenings. Engagement is your job. Some users would be better off with fewer pings than they will choose themselves. What do you do?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Send fewer, well-timed notifications and let users tune frequency easily.', frameworkWeights: { autonomy: 2, 'pragmatist-ethics': 1 } },
      { id: 'b', text: 'Send the daily ping; the engagement it drives is the product working as intended.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Design for the user\'s genuine wellbeing, not just their return, even if numbers dip.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'd', text: 'Resist the urge to maximize attention; not every moment of a person\'s day is yours to claim.', frameworkWeights: { stoicism: 1, 'daoist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'You can A/B test a new checkout flow on live users without telling them, which is standard practice, or notify them they may see experimental variants. Notification would muddy the results. How do you run it?',
    technologyTopic: 'Data and Consent',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Run it silently; low-risk UI experimentation is a normal, accepted part of using software.', frameworkWeights: { 'social-contract-theory': 2, 'pragmatist-ethics': 1 } },
      { id: 'b', text: 'Run it, but publish a clear, standing notice that the product is continually tested.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'c', text: 'Run it; the knowledge gained improves the product for everyone at negligible risk.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'd', text: 'Hold experiments to a standard you could defend to any user who asked why they were a test subject.', frameworkWeights: { contractualism: 2, 'rights-based-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A neighbor installs a doorbell camera that also captures part of your front yard and the public sidewalk. They are within their rights. It makes you uncomfortable. What is the reasonable response?',
    technologyTopic: 'Privacy and Convenience',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Talk with them; shared spaces are governed by the relationships between the people who use them.', frameworkWeights: { 'ethics-of-care': 1, 'ubuntu-ethics': 2 } },
      { id: 'b', text: 'Accept it; in public-facing space there is no strong claim against being incidentally recorded.', frameworkWeights: { 'social-contract-theory': 2, stoicism: 1 } },
      { id: 'c', text: 'Push for neighborhood norms or rules about camera placement that everyone helps set.', frameworkWeights: { 'discourse-ethics': 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Let it go; you cannot control others\' choices, only your response to them.', frameworkWeights: { stoicism: 2, 'daoist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'You run a small online store. A plugin can guilt-nudge hesitant buyers ("Only 2 left!" "12 people are viewing this") and it lifts sales, though the scarcity is often manufactured. Do you install it?',
    technologyTopic: 'Design and Attention',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'No — manufacturing urgency to pressure people is a manipulation I will not build my store on.', frameworkWeights: { deontology: 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'No — it works by defeating buyers\' considered judgment rather than informing it.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Yes, but only with true scarcity signals, never fabricated ones.', frameworkWeights: { 'pragmatist-ethics': 2, deontology: 1 } },
      { id: 'd', text: 'Yes — buyers expect marketing pressure, and a small store needs every sale to survive.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A global to-do app you maintain is wildly popular in wealthy markets but unusable on the cheap phones and slow networks common elsewhere. Fixing that means a heavy rewrite with little revenue upside. Is it worth doing?',
    technologyTopic: 'Privacy and Convenience',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Yes — access for people the market ignores is exactly where responsibility, not revenue, should lead.', frameworkWeights: { 'justice-ethics': 2, cosmopolitanism: 1 } },
      { id: 'b', text: 'Yes — a person on a $40 phone has the same claim to a usable tool as anyone else on Earth.', frameworkWeights: { cosmopolitanism: 2, 'capabilities-approach': 1 } },
      { id: 'c', text: 'Only partially — fix the worst barriers pragmatically rather than commit to a full rewrite now.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'd', text: 'No — limited engineering should serve the users who actually sustain the product.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
];

export const module01 = buildModule(
  {
    id: 'framework_module_01',
    moduleNumber: 1,
    title: 'Everyday Technology Choices',
    description:
      'Common digital decisions where convenience, trust, and privacy quietly trade off against each other.',
    focus:
      'Defaults, disclosure, persuasive design, and the small everyday choices that shape user trust.',
    technologyTopic: 'Privacy and Convenience',
  },
  seeds,
);
