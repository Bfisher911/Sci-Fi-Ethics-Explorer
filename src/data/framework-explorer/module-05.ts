import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 5 — Platforms, Speech, and Moderation
 * Difficulty 3–4. Content moderation, misinformation, political speech,
 * harassment, platform rules, and public harm.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'A post spreading a false but not clearly dangerous health claim is going viral on your platform. Removing it risks accusations of censorship; leaving it risks real-world harm. What is the right call?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Add authoritative context and reduce its spread rather than remove it outright.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Remove it; preventing foreseeable harm to people outweighs one poster\'s reach.', frameworkWeights: { utilitarianism: 2, 'ethics-of-care': 1 } },
      { id: 'c', text: 'Leave it up; the remedy for bad speech is more speech, not a platform deciding truth.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'd', text: 'Apply whatever the published, consistently enforced policy says, so rules are not ad hoc.', frameworkWeights: { 'social-contract-theory': 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A political leader posts something that violates your harassment policy. Enforcing the rule means removing a head of state; not enforcing it means the rule does not apply equally. What do you do?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Enforce equally; a rule that bends for the powerful is not a rule at all.', frameworkWeights: { 'justice-ethics': 2, deontology: 1 } },
      { id: 'b', text: 'Enforce; consistent application is what makes the platform\'s terms a fair shared agreement.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'c', text: 'Weigh the public\'s interest in hearing a leader against the harm of the post, case by case.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Refer it to an independent review body so one company is not unilaterally silencing a leader.', frameworkWeights: { 'discourse-ethics': 2, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your moderation AI flags a satirical post as hate speech. Appeals take days during which the post stays down. Tuning the model to under-remove would let more real hate slip through. Which error do you bias toward?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Toward leaving speech up; wrongly silencing protected expression is the graver error.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Toward removing harm; protecting targets of hate matters more than a delayed satire.', frameworkWeights: { 'ethics-of-care': 2, utilitarianism: 1 } },
      { id: 'c', text: 'Toward neither bias; invest in fast human appeals so the tradeoff is less forced.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
      { id: 'd', text: 'Toward whatever rule the community has agreed governs ambiguous cases.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A coordinated harassment campaign targets a user through technically rule-abiding posts (no single post breaks policy, but the pattern is abuse). Your rules are post-by-post. How do you respond?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Act on the pattern; protecting a real person from coordinated harm outranks rule literalism.', frameworkWeights: { 'ethics-of-care': 2, utilitarianism: 1 } },
      { id: 'b', text: 'Update rules to recognize coordinated abuse, then enforce — fix the gap rather than ignore it.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Hold to post-by-post rules; punishing speech that breaks no stated rule is its own injustice.', frameworkWeights: { deontology: 2, 'rights-based-ethics': 1 } },
      { id: 'd', text: 'Give the targeted user strong tools to filter and document, centering their agency.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'Your recommendation engine, optimizing engagement, is funneling some users toward increasingly extreme content. No single piece violates policy. The pattern is the harm. What do you change?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Change the objective; a system that radicalizes people to boost engagement is doing harm by design.', frameworkWeights: { utilitarianism: 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Change it; the platform is responsible for the pathways it builds, not just individual posts.', frameworkWeights: { 'rights-based-ethics': 1, 'justice-ethics': 1, deontology: 1 } },
      { id: 'c', text: 'Add friction and diverse exposure to the recommendation path, tested for real effect.', frameworkWeights: { 'pragmatist-ethics': 3 } },
      { id: 'd', text: 'Give users visibility and control over why they see what they see.', frameworkWeights: { autonomy: 2, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A government asks you to remove content it calls "destabilizing" but which appears to be legitimate dissent. Refusing risks your service being blocked there, cutting millions off entirely. Comply, refuse, or partly?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Refuse; complicity in silencing dissent is a line not worth crossing to keep market access.', frameworkWeights: { 'rights-based-ethics': 2, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Refuse the dissent takedowns but fight to keep access, weighing the cost of total blockage.', frameworkWeights: { 'pragmatist-ethics': 2, utilitarianism: 1 } },
      { id: 'c', text: 'Comply minimally to preserve access; staying online to serve millions is its own moral weight.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Make the demand public and let the affected users and the world judge, refusing to act in the dark.', frameworkWeights: { 'discourse-ethics': 2, cosmopolitanism: 1 } },
    ],
  },
  {
    questionText:
      'Your platform could fact-check posts using an internal team (consistent but you become an arbiter of truth) or crowd-sourced community notes (decentralized but gameable). Which model do you favor?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Community notes; truth-finding should be distributed, not centralized in one company.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Community notes; people governing their own information space respects their agency.', frameworkWeights: { 'social-contract-theory': 2 } },
      { id: 'c', text: 'Internal team; clear accountability for accuracy beats a crowd that can be manipulated.', frameworkWeights: { 'virtue-ethics': 1, deontology: 1, 'rights-based-ethics': 1 } },
      { id: 'd', text: 'Whichever demonstrably reduces real-world harm from falsehoods, tested rigorously.', frameworkWeights: { consequentialism: 2, 'pragmatist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A whistleblower posts leaked documents on your platform exposing corporate wrongdoing — but the documents also contain private data of uninvolved employees. Host it, redact it, or remove it?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Host the public-interest revelations but require redaction of uninvolved people\'s private data.', frameworkWeights: { 'justice-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Host it; the public\'s interest in exposing wrongdoing outweighs the incidental privacy cost.', frameworkWeights: { utilitarianism: 2, consequentialism: 1 } },
      { id: 'c', text: 'Remove it pending a process; you should not unilaterally publish others\' private data without care.', frameworkWeights: { deontology: 1, 'ethics-of-care': 2 } },
      { id: 'd', text: 'Host it under a clear, pre-agreed policy on leaks balancing disclosure and bystander privacy.', frameworkWeights: { 'social-contract-theory': 2 } },
    ],
  },
  {
    questionText:
      'A meme format on your platform is harmless to most but is being used in a few regions to incite violence against a minority. The same content is benign in one place and dangerous in another. How do you moderate it?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Moderate by local context and risk; protecting people from incitement must account for where they are.', frameworkWeights: { 'ethics-of-care': 1, consequentialism: 1, 'justice-ethics': 1 } },
      { id: 'b', text: 'Act decisively where lives are at risk; preventing violence outweighs uniformity of rules.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'c', text: 'Bring in local civil-society voices to judge context rather than ruling from headquarters.', frameworkWeights: { 'discourse-ethics': 2, cosmopolitanism: 1 } },
      { id: 'd', text: 'Apply one global rule; inconsistent regional enforcement invites abuse and confusion.', frameworkWeights: { deontology: 1, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'Your platform can detect and label AI-generated political content, but labeling is imperfect and may wrongly tag real footage as fake, or miss sophisticated fakes. Deploy labeling, or hold off?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Deploy with humility — clear "uncertain" labels — since the public deserves what signal exists.', frameworkWeights: { autonomy: 2, 'pragmatist-ethics': 1 } },
      { id: 'b', text: 'Deploy; on balance, surfacing likely synthetic media reduces deception even if imperfect.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Hold off; false "fake" labels on real footage could discredit truth and erode trust further.', frameworkWeights: { 'rights-based-ethics': 1, 'virtue-ethics': 1 } },
      { id: 'd', text: 'Convene experts and the public on labeling standards before unilaterally deploying.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A user posts genuine, graphic documentation of a human-rights atrocity. It violates your graphic-violence policy but is vital evidence. Remove it per policy, or preserve it as a record?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Preserve it (with warnings); bearing witness to atrocity can outweigh a blanket graphic-content rule.', frameworkWeights: { 'justice-ethics': 2, cosmopolitanism: 1 } },
      { id: 'b', text: 'Preserve it; the world\'s interest in documented truth outweighs the discomfort it causes.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'c', text: 'Remove from public feed but archive for investigators — balancing exposure and dignity of victims.', frameworkWeights: { 'pragmatist-ethics': 2, 'ethics-of-care': 1 } },
      { id: 'd', text: 'Follow the policy; carve-outs for "important" content invite inconsistent, biased exceptions.', frameworkWeights: { deontology: 2 } },
    ],
  },
  {
    questionText:
      'A small community on your platform has harmful but legal norms (e.g., promoting extreme dieting). Members are consenting adults. Banning it is paternalistic; allowing it may worsen real harm. What do you do?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Allow it but add resources and limits on amplification; adults may associate, but not be pushed deeper.', frameworkWeights: { autonomy: 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Allow it; consenting adults\' associations are not the platform\'s to police absent illegality.', frameworkWeights: { 'rights-based-ethics': 2 } },
      { id: 'c', text: 'Restrict it; foreseeable serious harm to members can justify limiting the space.', frameworkWeights: { 'ethics-of-care': 1, utilitarianism: 1 } },
      { id: 'd', text: 'Let the broader community and experts shape the norms for such spaces, not the platform alone.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'Your platform profits more when divisive content spreads. A redesign that rewards constructive dialogue would reduce revenue but improve discourse quality. Do you make the change?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Make it; profiting from division is not the kind of institution worth running.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'b', text: 'Make it; healthier public discourse is a large social good worth the revenue cost.', frameworkWeights: { utilitarianism: 2, 'discourse-ethics': 1 } },
      { id: 'c', text: 'Make it; a platform shaping public conversation owes that conversation more than ad revenue.', frameworkWeights: { 'social-contract-theory': 1, 'justice-ethics': 1, deontology: 1 } },
      { id: 'd', text: 'Pilot the redesign and scale it as the discourse and business effects become clear.', frameworkWeights: { 'pragmatist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A user requests removal of an old, true news article about a minor offense they committed years ago, now haunting their job search ("right to be forgotten"). The article is accurate and public-record. Delist it?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Delist it; people deserve the capacity to move past an old, minor mistake and rebuild their lives.', frameworkWeights: { 'capabilities-approach': 2, 'ethics-of-care': 1 } },
      { id: 'b', text: 'Delist it; mercy and the chance at redemption are part of treating a person well.', frameworkWeights: { 'virtue-ethics': 1, 'buddhist-ethics': 1 } },
      { id: 'c', text: 'Keep it; accurate public records should not be quietly erased to suit individuals.', frameworkWeights: { 'rights-based-ethics': 1, deontology: 1 } },
      { id: 'd', text: 'Apply a clear, fair standard (severity, age, public role) consistently across all such requests.', frameworkWeights: { 'justice-ethics': 2, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'Two of your platform\'s communities are in conflict; each reports the other\'s content en masse to weaponize your moderation tools. Your automated systems are being gamed. How do you respond?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Redesign reporting to resist brigading and judge content on merits, not report volume.', frameworkWeights: { 'pragmatist-ethics': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Apply rules to actual violations regardless of who reports, refusing to be a weapon.', frameworkWeights: { deontology: 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Bring representatives of both communities into setting fairer reporting norms.', frameworkWeights: { 'discourse-ethics': 2 } },
      { id: 'd', text: 'Prioritize de-escalation and protecting bystanders caught in the crossfire.', frameworkWeights: { 'ethics-of-care': 2 } },
    ],
  },
  {
    questionText:
      'You can give users a one-click "block and forget" or nudge them toward reporting abuse so the platform can act against repeat offenders. Blocking is easier for the user; reporting helps the community. Which do you center?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 2,
    options: [
      { id: 'a', text: 'Center the user\'s immediate relief; their wellbeing is not theirs to sacrifice for the system.', frameworkWeights: { autonomy: 1, 'ethics-of-care': 2 } },
      { id: 'b', text: 'Encourage reporting; collective protection depends on people surfacing abuse.', frameworkWeights: { utilitarianism: 1, 'ubuntu-ethics': 1, 'social-contract-theory': 1 } },
      { id: 'c', text: 'Offer both seamlessly so the user can protect themselves and the community at once.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Let the user decide what role they want to play, never pressuring them to relive abuse by reporting.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'An algorithm could automatically hide low-quality or "toxic" replies, cleaning up conversations but also quietly suppressing some legitimate dissenting voices it misjudges. Enable automatic hiding?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'No automatic hiding; quietly suppressing voices, even by mistake, is too costly to free expression.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Enable it but make hidden content one tap to reveal, never truly silenced.', frameworkWeights: { 'pragmatist-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Enable it; cleaner conversations benefit far more people than the occasional misjudged reply harms.', frameworkWeights: { utilitarianism: 2 } },
      { id: 'd', text: 'Let each user choose their own filtering strength rather than imposing one standard.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'A viral post is technically true but stripped of context in a way that will predictably inflame and mislead. It breaks no rule. Do you intervene?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Add the missing context rather than remove; restore understanding without suppressing speech.', frameworkWeights: { 'discourse-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Reduce its amplification; you are not obligated to supercharge predictably misleading framing.', frameworkWeights: { consequentialism: 2 } },
      { id: 'c', text: 'Leave it fully alone; once you police "misleading but true," you are deciding acceptable framing.', frameworkWeights: { 'rights-based-ethics': 2 } },
      { id: 'd', text: 'Treat it under a consistent, published standard for decontextualized content.', frameworkWeights: { 'justice-ethics': 1, 'social-contract-theory': 1 } },
    ],
  },
  {
    questionText:
      'Moderators on your platform are exposed to traumatic content daily. You can invest heavily in their mental health (costly) or rely on cheaper, higher-turnover contractors (standard industry practice). What do you owe them?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Invest in their wellbeing; the people absorbing this harm on everyone\'s behalf deserve real care.', frameworkWeights: { 'ethics-of-care': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Invest; exploiting disposable labor for a traumatic job is not a defensible way to operate.', frameworkWeights: { 'rights-based-ethics': 1, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Invest and reduce exposure with better tooling; their flourishing is part of the product\'s real cost.', frameworkWeights: { 'capabilities-approach': 2 } },
      { id: 'd', text: 'Treat their protection as a duty owed for the harm the role imposes, not an optional perk.', frameworkWeights: { deontology: 2 } },
    ],
  },
  {
    questionText:
      'Your platform could adopt transparent, published moderation rules (predictable but gameable by bad actors) or keep them partly secret (harder to game but unaccountable). Which approach is more legitimate?',
    technologyTopic: 'Platforms and Speech',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Transparent rules; people governed by a system deserve to know the rules they live under.', frameworkWeights: { 'social-contract-theory': 2, 'discourse-ethics': 1 } },
      { id: 'b', text: 'Transparent rules; accountability you could defend to any user outweighs the gaming risk.', frameworkWeights: { contractualism: 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Mostly transparent with limited operational secrecy where openness would directly enable serious abuse.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Whatever configuration actually minimizes net harm, secrecy included where it demonstrably helps.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
];

export const module05 = buildModule(
  {
    id: 'framework_module_05',
    moduleNumber: 5,
    title: 'Platforms, Speech, and Moderation',
    description:
      'Governing public conversation at scale — where free expression, safety, and consistency collide.',
    focus:
      'Misinformation, harassment, political speech, amplification, transparency, and public harm.',
    technologyTopic: 'Platforms and Speech',
  },
  seeds,
);
