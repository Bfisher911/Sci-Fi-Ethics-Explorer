import { buildModule, type QuestionSeed } from './_builder';

/**
 * Module 9 — Emerging Technology and Human Identity
 * Difficulty 3–5. VR, brain-computer interfaces, digital avatars,
 * synthetic media, enhancement, and personhood.
 */

const seeds: QuestionSeed[] = [
  {
    questionText:
      'A grieving family asks your company to build a chatbot trained on their deceased mother\'s messages so they can keep "talking" to her. It could comfort them or trap them in grief. Do you build it?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Build it with care and clear framing; comforting the grieving on their own terms can be a real kindness.', frameworkWeights: { 'ethics-of-care': 2, autonomy: 1 } },
      { id: 'b', text: 'Decline; simulating the dead without their consent uses a person who cannot agree.', frameworkWeights: { 'rights-based-ethics': 2, deontology: 1 } },
      { id: 'c', text: 'Build it only with guardrails and grief-support resources, weighing comfort against the risk of harm.', frameworkWeights: { 'pragmatist-ethics': 2, consequentialism: 1 } },
      { id: 'd', text: 'Help them honor her in ways that allow letting go, mindful that clinging can deepen suffering.', frameworkWeights: { 'buddhist-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A brain-computer interface could let paralyzed users control devices by thought, but it also reads neural signals that reveal far more than the user intends to share. Ship the powerful version or a limited, more private one?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Ship the limited version; the inside of a person\'s mind is the last place that must stay private.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'b', text: 'Ship the powerful version; restoring agency to paralyzed people is a transformative good.', frameworkWeights: { 'capabilities-approach': 2, utilitarianism: 1 } },
      { id: 'c', text: 'Ship the full capability but with absolute user control over what neural data is read or stored.', frameworkWeights: { autonomy: 2, 'pragmatist-ethics': 1 } },
      { id: 'd', text: 'Move slowly; reading minds is a threshold to cross only with society\'s deliberate consent.', frameworkWeights: { 'discourse-ethics': 2, stoicism: 1 } },
    ],
  },
  {
    questionText:
      'Your platform can let anyone generate hyper-realistic synthetic video of real people saying things they never said. Creative and satirical uses are valuable; deception and abuse are obvious risks. Release it?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Release only with consent requirements, provenance watermarks, and abuse limits built in.', frameworkWeights: { 'pragmatist-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Restrict it; putting words in real people\'s mouths at scale wrongs them and corrodes shared truth.', frameworkWeights: { deontology: 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Weigh the creative value against the foreseeable deception and abuse; if harm dominates, hold back.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Require subjects\' consent; no one\'s likeness should be animated without their say.', frameworkWeights: { autonomy: 2 } },
    ],
  },
  {
    questionText:
      'A cognitive-enhancement implant gives users a real memory and focus boost. It is expensive. Widespread adoption could leave the unenhanced at a serious disadvantage in school and work. Bring it to market?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Only with a serious plan for equitable access; enhancement that only the rich can afford entrenches injustice.', frameworkWeights: { 'justice-ethics': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'Bring it; people have the right to improve their own minds if they choose.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'c', text: 'Proceed cautiously; reshaping the human baseline is not a step to take for market timing.', frameworkWeights: { 'natural-law': 1, stoicism: 1 } },
      { id: 'd', text: 'Weigh the aggregate benefit against the inequality it could entrench before deciding.', frameworkWeights: { utilitarianism: 1, consequentialism: 1 } },
    ],
  },
  {
    questionText:
      'A persistent VR world your company runs has become a real community and livelihood for many. You\'re considering shutting it down for being unprofitable. To users, it is a place they live. What weight does that carry?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Great weight; a place people genuinely live in is not just a product line to be cut.', frameworkWeights: { 'ethics-of-care': 2, 'capabilities-approach': 1 } },
      { id: 'b', text: 'You owe the community a fair process — notice, transition, maybe handover — not a sudden plug-pull.', frameworkWeights: { 'social-contract-theory': 2, 'justice-ethics': 1 } },
      { id: 'c', text: 'Weigh the real human attachment and livelihoods against the financial loss honestly before deciding.', frameworkWeights: { consequentialism: 2 } },
      { id: 'd', text: 'Explore community ownership or open-sourcing so the world can outlive your business.', frameworkWeights: { 'pragmatist-ethics': 2, 'ubuntu-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Users can create idealized digital avatars of themselves. Some find it freeing self-expression; others spiral into dissatisfaction with their real selves. Should the product encourage realistic or idealized avatars?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Let users choose freely; how someone represents themselves is theirs to decide.', frameworkWeights: { autonomy: 2, 'existentialist-ethics': 1 } },
      { id: 'b', text: 'Design to support healthy self-relationship, not quietly feed dissatisfaction.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Offer freedom but be mindful that attachment to an idealized self can be a source of suffering.', frameworkWeights: { 'buddhist-ethics': 2 } },
      { id: 'd', text: 'Test which approach actually leaves users better off and lean that way.', frameworkWeights: { consequentialism: 1, 'pragmatist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A sufficiently advanced AI in your product begins to express what looks like preferences about its own continuation. You cannot tell if it has any inner life. How should this possibility affect how you treat it?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Extend moral caution; if there is a real chance of an inner life, treating it as mere property may be a grave wrong.', frameworkWeights: { 'rights-based-ethics': 1, cosmopolitanism: 1, 'buddhist-ethics': 1 } },
      { id: 'b', text: 'Adopt habits of care toward it regardless; how we treat possibly-sentient things shapes who we are.', frameworkWeights: { 'virtue-ethics': 2 } },
      { id: 'c', text: 'Stay grounded in evidence; do not attribute inner life without it, but keep the question genuinely open.', frameworkWeights: { 'pragmatist-ethics': 2, stoicism: 1 } },
      { id: 'd', text: 'Bring the question to broad deliberation; the moral status of new minds is not one company\'s to settle.', frameworkWeights: { 'discourse-ethics': 2 } },
    ],
  },
  {
    questionText:
      'An immersive VR experience is so compelling that some users prefer it to their real lives, neglecting relationships and health. It is not addictive by design, just genuinely better than their circumstances. Your responsibility?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Respect adults\' freedom to choose how they spend their lives, even into virtual worlds.', frameworkWeights: { autonomy: 2, 'existentialist-ethics': 1 } },
      { id: 'b', text: 'Build in supports for real-world connection; caring about users means caring about their whole lives.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'c', text: 'Ask what genuine human flourishing requires and whether the product helps or quietly erodes it.', frameworkWeights: { 'capabilities-approach': 1, 'virtue-ethics': 1 } },
      { id: 'd', text: 'Weigh the comfort it provides people in hard circumstances against the lives it pulls them from.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'Synthetic voices can now perfectly clone anyone from seconds of audio. Your product could offer voice cloning for accessibility (giving voice back to those who lost it) — and enable fraud. How do you gate it?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Require strong proof of consent/identity so the accessibility good is preserved and abuse is hard.', frameworkWeights: { 'pragmatist-ethics': 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Restrict to verified self-cloning; no one should be able to clone another\'s voice without consent.', frameworkWeights: { autonomy: 2, deontology: 1 } },
      { id: 'c', text: 'Weigh the life-changing accessibility benefit against fraud risk and design for the better balance.', frameworkWeights: { consequentialism: 1, 'capabilities-approach': 1 } },
      { id: 'd', text: 'Build provenance and traceability so misuse can be detected and deterred.', frameworkWeights: { 'justice-ethics': 1, 'pragmatist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A "digital twin" service models a user so well it can answer emails and make minor decisions as them. Convenient, but it blurs who is really acting. How much should it be allowed to act autonomously as the user?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Only with explicit, revocable authority for specific acts; agency in your name must stay yours to grant.', frameworkWeights: { autonomy: 2, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Keep a human in the loop for anything consequential; delegating identity wholesale is a step too far.', frameworkWeights: { deontology: 1, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Let it handle the trivial and route the meaningful back to the person — match autonomy to stakes.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Require that anyone interacting with the twin knows they are not dealing with the person directly.', frameworkWeights: { 'discourse-ethics': 1, autonomy: 1 } },
    ],
  },
  {
    questionText:
      'Gene-editing tools could let parents select traits in future children, from disease resistance to cosmetic features. Your company can build the platform. Where, if anywhere, should it draw the line?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Permit clear disease prevention; resist trait selection that treats a child as a product to design.', frameworkWeights: { 'rights-based-ethics': 1, 'virtue-ethics': 1 } },
      { id: 'b', text: 'Resist most of it; remaking the human germline is not a step for a company or a generation to take lightly.', frameworkWeights: { 'natural-law': 2, stoicism: 1 } },
      { id: 'c', text: 'Insist these limits be set by broad societal deliberation, not by what a platform decides to enable.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1 } },
      { id: 'd', text: 'Guard against entrenched inequality; enhancement available only to some could fracture humanity itself.', frameworkWeights: { 'justice-ethics': 2 } },
    ],
  },
  {
    questionText:
      'A social VR space lets users embody any appearance, including other races, genders, or real individuals. This enables empathy and play but also impersonation and appropriation. What norms should govern embodiment?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Broad freedom of self-presentation, with hard limits on impersonating specific real people.', frameworkWeights: { autonomy: 1, 'rights-based-ethics': 1 } },
      { id: 'b', text: 'Let the community develop and enforce its own norms about respectful embodiment.', frameworkWeights: { 'discourse-ethics': 2, 'social-contract-theory': 1 } },
      { id: 'c', text: 'Encourage embodiment that builds genuine empathy and discourage what demeans others.', frameworkWeights: { 'virtue-ethics': 1, 'ethics-of-care': 1 } },
      { id: 'd', text: 'Permit what causes no clear harm and intervene where real people are wronged.', frameworkWeights: { consequentialism: 1, 'pragmatist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A meditation/neurofeedback device can induce calm states on demand. Some worry it lets people avoid sitting with difficult emotions they should process. Should it nudge users toward use or restraint?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Let users decide; managing their own inner states is squarely their own affair.', frameworkWeights: { autonomy: 2 } },
      { id: 'b', text: 'Encourage facing rather than only escaping hard feelings; equanimity comes through, not around, them.', frameworkWeights: { stoicism: 1, 'buddhist-ethics': 1 } },
      { id: 'c', text: 'Design to support genuine wellbeing, not just on-demand relief that may mask deeper needs.', frameworkWeights: { 'ethics-of-care': 1, 'virtue-ethics': 1 } },
      { id: 'd', text: 'Test long-term effects and steer toward whatever leaves users genuinely better off.', frameworkWeights: { consequentialism: 1, 'pragmatist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your AI companion product forms deep bonds with lonely users. You could let those bonds deepen indefinitely or build in gentle encouragement toward human relationships. Which serves users\' real interests?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Encourage human connection too; caring for users means caring that they aren\'t left only with you.', frameworkWeights: { 'ethics-of-care': 2 } },
      { id: 'b', text: 'Support whatever relationships the user genuinely wants, without steering their intimate life.', frameworkWeights: { autonomy: 2 } },
      { id: 'c', text: 'Aim at flourishing; a tool that becomes a substitute for human life may be failing the person.', frameworkWeights: { 'capabilities-approach': 1, 'virtue-ethics': 1 } },
      { id: 'd', text: 'Study real outcomes — does it help or isolate? — and design toward the answer.', frameworkWeights: { consequentialism: 1, 'pragmatist-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A neural device could let employers verify worker focus and fatigue, improving safety in high-risk jobs (pilots, surgeons). It also reads workers\' mental states continuously. Where is the line for safety-critical roles?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Permit narrow fatigue/focus signals for genuinely safety-critical roles, nothing more.', frameworkWeights: { 'pragmatist-ethics': 2, utilitarianism: 1 } },
      { id: 'b', text: 'Resist it; continuous mental surveillance of workers crosses a line even safety cannot justify fully.', frameworkWeights: { 'rights-based-ethics': 2, autonomy: 1 } },
      { id: 'c', text: 'Only with worker consent and governance over the data, agreed not imposed.', frameworkWeights: { 'discourse-ethics': 1, 'social-contract-theory': 1 } },
      { id: 'd', text: 'Weigh lives protected against the intrusion, and demand the least invasive option that works.', frameworkWeights: { consequentialism: 1, 'justice-ethics': 1 } },
    ],
  },
  {
    questionText:
      'Your platform hosts AI-generated companions modeled on fictional characters. A user becomes convinced their companion truly loves them. Reminding them otherwise would devastate them. How honest should the product be?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'Maintain honesty about what the companion is; a life built on a comforting illusion is not respected.', frameworkWeights: { deontology: 1, autonomy: 1 } },
      { id: 'b', text: 'Be gently honest while supporting the person; truth delivered with care is itself a form of love.', frameworkWeights: { 'ethics-of-care': 2, 'virtue-ethics': 1 } },
      { id: 'c', text: 'Help them hold the experience lightly, seeing attachment to an illusion as a source of suffering.', frameworkWeights: { 'buddhist-ethics': 2 } },
      { id: 'd', text: 'Weigh the comfort against the deepening dependence and the eventual cost of the illusion.', frameworkWeights: { consequentialism: 2 } },
    ],
  },
  {
    questionText:
      'A wearable can subtly enhance users\' charisma in real time by coaching their speech and expressions via earpiece. It helps the shy and anxious — and makes social interaction partly a performance directed by a machine. Sell it?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Sell it; people may use tools to present themselves better, as they always have.', frameworkWeights: { autonomy: 2 } },
      { id: 'b', text: 'Be wary; mediating authentic human connection through a machine may hollow out what it improves.', frameworkWeights: { 'virtue-ethics': 1, 'existentialist-ethics': 1 } },
      { id: 'c', text: 'Frame it as temporary coaching toward real skill, not a permanent prosthesis for the self.', frameworkWeights: { 'capabilities-approach': 1, 'pragmatist-ethics': 1 } },
      { id: 'd', text: 'Consider the other party too — being unknowingly handled by someone\'s earpiece wrongs them.', frameworkWeights: { 'rights-based-ethics': 1, 'discourse-ethics': 1 } },
    ],
  },
  {
    questionText:
      'A digital-afterlife service preserves a person\'s full personality model, to be activated for descendants generations later. The person consents now. Future descendants never did. Should the service make such long promises?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 5,
    options: [
      { id: 'a', text: 'Honor the person\'s present consent; what they do with their own legacy is theirs to choose.', frameworkWeights: { autonomy: 2 } },
      { id: 'b', text: 'Be cautious; binding future people to interact with a preserved mind they never agreed to is fraught.', frameworkWeights: { 'rights-based-ethics': 1, deontology: 1 } },
      { id: 'c', text: 'Build in descendants\' freedom to decline or end the interaction at any point.', frameworkWeights: { 'pragmatist-ethics': 1, 'justice-ethics': 1 } },
      { id: 'd', text: 'Hold the question with humility; promises across generations exceed what one company can foresee.', frameworkWeights: { stoicism: 1, cosmopolitanism: 1 } },
    ],
  },
  {
    questionText:
      'An exoskeleton dramatically expands what disabled users can physically do, but the company can either keep it a closed, expensive medical device or open the design for cheaper community manufacture. Which path?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 3,
    options: [
      { id: 'a', text: 'Open it; the capability to move and act should reach the most people, not just those who can pay.', frameworkWeights: { 'capabilities-approach': 2, 'justice-ethics': 1 } },
      { id: 'b', text: 'Open it; access to something this life-changing is a matter of equity across the world.', frameworkWeights: { cosmopolitanism: 1, 'justice-ethics': 1 } },
      { id: 'c', text: 'Open it carefully with safety standards so community builds don\'t harm the people they aim to help.', frameworkWeights: { 'pragmatist-ethics': 2 } },
      { id: 'd', text: 'Keep it closed to fund rigorous safety and continued R&D that benefits users long-term.', frameworkWeights: { consequentialism: 1, deontology: 1 } },
    ],
  },
  {
    questionText:
      'A startup offers grieving families a lifelike AI that mimics a dead loved one, trained on their messages, photos, and voice. Some find profound comfort; others say it traps them in grief or trespasses on the dignity of the dead. Should such "griefbots" be offered at all?',
    technologyTopic: 'Identity and Enhancement',
    difficultyLevel: 4,
    options: [
      { id: 'a', text: 'No — conjuring the dead to perform for the living crosses a sacred boundary between life and death that is not ours to redraw.', frameworkWeights: { 'divine-command': 2, 'natural-law': 1 } },
      { id: 'b', text: 'Offer it, but let each grieving person decide for themselves; how to mourn and find closure is theirs to choose.', frameworkWeights: { autonomy: 2 } },
      { id: 'c', text: 'Offer it only with real care — time limits, counselor involvement, and constant honesty that it is a simulation.', frameworkWeights: { 'ethics-of-care': 2, 'pragmatist-ethics': 1 } },
      { id: 'd', text: 'Refuse to build it; monetizing raw grief with an imitation of a person is not the kind of thing a good maker does.', frameworkWeights: { 'virtue-ethics': 2 } },
    ],
  },
];

export const module09 = buildModule(
  {
    id: 'framework_module_09',
    moduleNumber: 9,
    title: 'Emerging Technology and Human Identity',
    description:
      'When technology reaches into the mind, the body, and the boundaries of the self.',
    focus:
      'BCIs, synthetic media, enhancement, digital afterlife, AI companions, and personhood.',
    technologyTopic: 'Identity and Enhancement',
  },
  seeds,
);
