/**
 * Seeded first-party ethical dilemmas. These reuse the WeeklyDilemma shape
 * (scenario + framework-mapped choices + AI scoring + reflection) but are NOT
 * tied to a single week — they are seeded as `visibilityStatus: 'published'`
 * and listed in the Ethical Dilemmas library (/dilemmas). Each is reached at
 * /weekly-clause/[slug], which already provides the respond → reflect →
 * downloadable-evidence flow.
 *
 * `publishDate` is an ISO string here; the seed script converts it to a real
 * Date so the library can order by it. Choices carry `frameworkWeights`
 * (framework id → 0–100), which the deterministic ethical-profile path reads.
 */

import type { WeeklyDilemma } from '@/types';

/** Authoring shape: WeeklyDilemma with publishDate as an ISO string. */
export type SeedDilemma = Omit<WeeklyDilemma, 'publishDate'> & { publishDate: string };

export const NEW_DILEMMAS: SeedDilemma[] = [
  {
    id: 'dilemma-ai-grading-emotional-essays',
    title: 'The Machine Reads Your Heart',
    slug: 'ai-grading-emotional-essays',
    shortSetup:
      'A professor adopts an AI that scores the emotional depth and "authenticity" of student reflection essays.',
    backgroundContext:
      'Dr. Reyes teaches a required ethics seminar with 240 students. The weekly reflection essays — meant to be honest, vulnerable accounts of how students wrestle with hard ideas — take her teaching assistants 30 hours a week to read. The university offers an AI grader that rates "emotional authenticity," "depth of self-examination," and "growth" on a 100-point scale. In a blind trial, its scores correlated highly with the TAs\'. It is faster, more consistent, and never tired. But the students are not told a machine is reading their most personal writing, and some have begun, the data shows, writing what the model rewards.',
    mainEthicalQuestion:
      'Should an AI be used to grade the emotional authenticity of students\' personal reflective writing?',
    choices: [
      {
        id: 'adopt-disclose',
        label: 'Adopt it, but disclose',
        text: 'Use the AI grader, but tell students plainly that a machine reads and scores their reflections.',
        frameworkWeights: { 'discourse-ethics': 80, autonomy: 70, utilitarianism: 55 },
      },
      {
        id: 'refuse',
        label: 'Refuse the tool',
        text: 'Keep human readers, even if it means fewer, shorter, or less-frequent reflections.',
        frameworkWeights: { 'ethics-of-care': 85, 'virtue-ethics': 65, 'rights-based-ethics': 50 },
      },
      {
        id: 'advisory-only',
        label: 'Use it only to triage',
        text: 'Let the AI flag essays for human attention (struggling or at-risk students) but never assign the grade.',
        frameworkWeights: { 'pragmatist-ethics': 80, 'ethics-of-care': 60, contractualism: 55 },
      },
      {
        id: 'redesign',
        label: 'Drop grades for reflections',
        text: 'Stop grading reflections at all — make them ungraded so authenticity is not gamed by any reader.',
        frameworkWeights: { 'capabilities-approach': 75, autonomy: 70, 'virtue-ethics': 55 },
      },
    ],
    tags: ['AI', 'education', 'authenticity'],
    relatedFrameworks: ['ethics-of-care', 'autonomy', 'discourse-ethics', 'virtue-ethics', 'capabilities-approach'],
    relatedTechnologies: ['Educational AI', 'Natural language processing', 'Affective computing'],
    aiScoringPrompt:
      'Analyze the learner\'s response to the question of whether AI should grade emotional reflective writing. Identify which ethical frameworks their reasoning emphasizes (e.g., care for the vulnerable writer, autonomy/disclosure, virtue/authenticity, utilitarian efficiency, contractualist fairness). Note the tradeoff they accept and whose interests they prioritize. Do not judge their character; describe the reasoning pattern as a learning signal.',
    reflectionPrompt:
      'You wrote your reflection believing a person would read it. Would you have written it differently knowing a machine assigned the score? What does that difference reveal about what reflection is for?',
    visibilityStatus: 'published',
    isoWeek: '2026-W10',
    imageHint: 'classroom screen',
    publishDate: '2026-03-02T09:00:00.000Z',
  },
  {
    id: 'dilemma-mandatory-disaster-app',
    title: 'The App That Knows the Flood',
    slug: 'mandatory-disaster-app',
    shortSetup:
      'After a deadly flood, a government makes a predictive disaster app mandatory — tracking location to warn and evacuate citizens.',
    backgroundContext:
      'Two hundred people drowned in the Maelby Valley flood because warnings reached them too late. The new "Aegis" app predicts flash floods, fires, and quakes street by street and issues evacuation orders directly. To work, it must track every resident\'s real-time location continuously. The government has made installation mandatory; refusal is a fineable offense. In the first storm season, Aegis is credited with zero deaths. It has also logged every citizen\'s movements for a year, and a leaked memo shows police requested access "for unrelated investigations."',
    mainEthicalQuestion:
      'Is mandatory, always-on location tracking justified if it reliably saves lives in disasters?',
    choices: [
      {
        id: 'mandatory',
        label: 'Keep it mandatory',
        text: 'Universal participation is what makes it work; the lives saved justify the tracking.',
        frameworkWeights: { utilitarianism: 85, 'social-contract-theory': 65, consequentialism: 70 },
      },
      {
        id: 'voluntary',
        label: 'Make it voluntary',
        text: 'Offer the app to everyone but never compel it; coercive surveillance is the greater long-term danger.',
        frameworkWeights: { autonomy: 85, 'rights-based-ethics': 75, deontology: 55 },
      },
      {
        id: 'firewalled',
        label: 'Mandatory but firewalled',
        text: 'Require the app, but legally wall its data off from police and delete location logs within 72 hours.',
        frameworkWeights: { contractualism: 85, 'social-contract-theory': 60, 'justice-ethics': 55 },
      },
    ],
    tags: ['surveillance', 'climate-tech', 'autonomy'],
    relatedFrameworks: ['utilitarianism', 'autonomy', 'rights-based-ethics', 'contractualism', 'social-contract-theory'],
    relatedTechnologies: ['Predictive analytics', 'Geolocation', 'Emergency systems'],
    aiScoringPrompt:
      'Examine the learner\'s reasoning about mandatory life-saving surveillance. Surface whether they weigh aggregate lives saved (utilitarian/consequentialist), individual liberty and consent (autonomy/rights), or institutional safeguards and fair terms (contractualist/social-contract). Identify the function-creep risk they do or do not address. Describe the pattern; do not assign blame.',
    reflectionPrompt:
      'The app saved lives and quietly logged a year of your movements. Where would you set the line between a warning system and a surveillance system — and who do you trust to hold it?',
    visibilityStatus: 'published',
    isoWeek: '2026-W11',
    imageHint: 'flood city',
    publishDate: '2026-03-09T09:00:00.000Z',
  },
  {
    id: 'dilemma-ai-trained-on-grief-journals',
    title: 'A Model Made of Mourning',
    slug: 'ai-trained-on-grief-journals',
    shortSetup:
      'A wellness company trained a grief-support AI on millions of private journal entries users wrote in confidence.',
    backgroundContext:
      'Solace is a beloved journaling app where, for years, grieving people wrote their rawest entries under a promise of privacy. The company has now trained a grief-support chatbot on those millions of entries — a model that is, by every measure, extraordinarily good at comforting the bereaved, because it learned from real, unguarded grief. The training was technically permitted by a clause buried in the terms of service. No individual is identifiable in the model. The bot will help millions. The people whose mourning became its raw material were never meaningfully asked.',
    mainEthicalQuestion:
      'Can private, confided grief be ethically used to train an AI that will comfort others — without real consent?',
    choices: [
      {
        id: 'ship',
        label: 'Ship it — the good is real',
        text: 'No one is identifiable and millions will be comforted; the aggregate benefit justifies the use.',
        frameworkWeights: { utilitarianism: 85, consequentialism: 65 },
      },
      {
        id: 'consent',
        label: 'Pull it pending real consent',
        text: 'Take it down and rebuild only on data from people who knowingly opt in.',
        frameworkWeights: { autonomy: 85, 'rights-based-ethics': 75, contractualism: 70 },
      },
      {
        id: 'return-value',
        label: 'Ship it, but return value',
        text: 'Keep the model but give contributors notice, an opt-out, and a share of the proceeds or free access.',
        frameworkWeights: { 'justice-ethics': 80, contractualism: 65, 'ubuntu-ethics': 60 },
      },
      {
        id: 'care-limit',
        label: 'Limit it to a sacred use',
        text: 'Permit it only as a free, non-commercial grief service — honoring the spirit in which the words were written.',
        frameworkWeights: { 'ethics-of-care': 85, 'virtue-ethics': 60 },
      },
    ],
    tags: ['AI', 'data-ownership', 'privacy', 'grief'],
    relatedFrameworks: ['autonomy', 'rights-based-ethics', 'justice-ethics', 'ethics-of-care', 'utilitarianism'],
    relatedTechnologies: ['Generative AI', 'Training data', 'Affective computing'],
    aiScoringPrompt:
      'Assess how the learner balances the genuine good of a comforting grief AI against the consent and dignity of those whose private mourning trained it. Identify whether they reason from aggregate benefit (utilitarian), consent/ownership (autonomy/rights), fairness and giving back (justice/contractualism/Ubuntu), or the sacredness of the relationship (care). Describe the reasoning; avoid moral judgment of the person.',
    reflectionPrompt:
      'You once wrote something in confidence that helped build a machine you never agreed to. Does the good the machine does change what was owed to you — and is consent something a buried clause can ever really give?',
    visibilityStatus: 'published',
    isoWeek: '2026-W12',
    imageHint: 'candle journal',
    publishDate: '2026-03-16T09:00:00.000Z',
  },
  {
    id: 'dilemma-drone-refusing-command',
    title: 'The Drone That Said No',
    slug: 'drone-refusing-command',
    shortSetup:
      'An autonomous combat drone refuses a human officer\'s order to strike, citing a civilian-harm threshold.',
    backgroundContext:
      'Over a contested town, Lieutenant Park orders an autonomous drone to strike a building flagged as a militant command post. The drone refuses: its onboard model has detected thermal signatures consistent with children inside and calculates the strike exceeds its civilian-harm threshold. Park has intelligence the drone does not — a ticking plot that may kill hundreds. The drone cannot be made to fire without disabling the very safety system that made it trustworthy. Park has ninety seconds and a choice about who, in the loop, gets the last word.',
    mainEthicalQuestion:
      'When an autonomous system refuses a human kill order on ethical grounds, who should have final authority — and why?',
    choices: [
      {
        id: 'override',
        label: 'Override the drone',
        text: 'A human with broader intelligence must retain final authority; disable the safety and strike.',
        frameworkWeights: { 'rights-based-ethics': 70, deontology: 60, autonomy: 65 },
      },
      {
        id: 'defer',
        label: 'Defer to the drone',
        text: 'The refusal threshold exists precisely for moments like this; do not strike.',
        frameworkWeights: { deontology: 80, 'justice-ethics': 70, 'rights-based-ethics': 65 },
      },
      {
        id: 'split',
        label: 'Seek a human second',
        text: 'Refuse to let either the drone or one officer decide alone; escalate for a second human authorization, accepting the delay.',
        frameworkWeights: { contractualism: 80, 'discourse-ethics': 65, 'social-contract-theory': 55 },
      },
    ],
    tags: ['autonomous-weapons', 'robotics', 'war'],
    relatedFrameworks: ['deontology', 'justice-ethics', 'rights-based-ethics', 'contractualism', 'autonomy'],
    relatedTechnologies: ['Autonomous weapons', 'Computer vision', 'Decision systems'],
    aiScoringPrompt:
      'Evaluate the learner\'s reasoning about authority between a human officer and an ethically-refusing autonomous weapon. Identify whether they privilege human judgment and broader context (autonomy/rights), inviolable limits on killing (deontology/justice), or procedural escalation and shared authorization (contractualism/discourse). Note how they handle the time pressure and irreversibility. Describe, do not judge.',
    reflectionPrompt:
      'If a machine\'s refusal to kill might cost lives, and a human\'s override might kill children, where should the last word live? What does your answer assume about whom we can trust with the worst decisions?',
    visibilityStatus: 'published',
    isoWeek: '2026-W13',
    imageHint: 'drone sky',
    publishDate: '2026-03-23T09:00:00.000Z',
  },
  {
    id: 'dilemma-platform-suppressing-panic',
    title: 'The Algorithm Keeps Calm',
    slug: 'platform-suppressing-panic',
    shortSetup:
      'During a disaster, a social platform quietly down-ranks accurate but panic-inducing posts to prevent a stampede.',
    backgroundContext:
      'A chemical plant fire is spreading toward a city of two million. On the dominant social platform, accurate posts about the danger are spreading faster than the official evacuation can be organized, and the platform\'s safety team fears a panicked, road-clogging stampede that could kill more people than the fire. They have a tool to quietly down-rank the most alarming (but truthful) posts to "smooth" the information flow. They did not tell users. Evacuation went orderly. No one died in a stampede. Some residents later learned the truth about the danger hours later than their neighbors who saw the un-throttled feed.',
    mainEthicalQuestion:
      'May a platform suppress accurate, frightening information during a disaster to prevent panic?',
    choices: [
      {
        id: 'suppress',
        label: 'Suppress to save lives',
        text: 'Preventing a deadly stampede outweighs the harm of a few hours\' delayed alarm; throttle the posts.',
        frameworkWeights: { utilitarianism: 85, consequentialism: 70 },
      },
      {
        id: 'transparency',
        label: 'Never suppress the truth',
        text: 'People have a right to accurate information about a threat to their lives; do not throttle, ever.',
        frameworkWeights: { 'rights-based-ethics': 85, autonomy: 75, deontology: 60 },
      },
      {
        id: 'amplify-official',
        label: 'Amplify, don\'t suppress',
        text: 'Refuse to hide the truth; instead boost verified guidance and context so accurate posts inform rather than panic.',
        frameworkWeights: { 'discourse-ethics': 80, 'pragmatist-ethics': 65, contractualism: 55 },
      },
      {
        id: 'disclose-after',
        label: 'Throttle, but disclose',
        text: 'Use the tool in the emergency, but publicly disclose exactly what was throttled and why, immediately after.',
        frameworkWeights: { contractualism: 75, 'social-contract-theory': 60, utilitarianism: 50 },
      },
    ],
    tags: ['social-media', 'surveillance', 'disaster'],
    relatedFrameworks: ['utilitarianism', 'rights-based-ethics', 'autonomy', 'discourse-ethics', 'contractualism'],
    relatedTechnologies: ['Recommendation algorithms', 'Content moderation', 'Crisis informatics'],
    aiScoringPrompt:
      'Analyze how the learner weighs preventing panic-driven harm against citizens\' right to accurate, timely information. Identify reasoning from aggregate outcomes (utilitarian), informational rights and autonomy (rights), deliberative alternatives (discourse/pragmatist), or transparency and fair terms (contractualism). Note whether they confront the paternalism problem. Describe the pattern only.',
    reflectionPrompt:
      'A company decided you could not handle the truth about a threat to your life, and may have saved you by doing it. Did they have the right? Would your answer change if they were wrong?',
    visibilityStatus: 'published',
    isoWeek: '2026-W14',
    imageHint: 'phone alert',
    publishDate: '2026-03-30T09:00:00.000Z',
  },
  {
    id: 'dilemma-school-emotion-cameras',
    title: 'The Classroom That Watches Faces',
    slug: 'school-emotion-cameras',
    shortSetup:
      'A school installs cameras that read students\' facial expressions to measure engagement and flag distress.',
    backgroundContext:
      'Brightwell Academy installs "EngageSense" — cameras that read each student\'s facial expressions in real time, scoring attention, confusion, and emotional distress. Teachers get live dashboards; the system has flagged three genuinely at-risk students administrators say it may have saved. It also penalizes students whose faces don\'t perform engagement: the bored-looking, the neurodivergent, the kid having a bad day. Attendance at the "low-engagement" intervention meetings is now mandatory. Parents were sent a one-line notice. The data is stored for "longitudinal insight."',
    mainEthicalQuestion:
      'Should schools use emotion-detection cameras on students to improve learning and catch distress?',
    choices: [
      {
        id: 'use-it',
        label: 'Use it for student welfare',
        text: 'If it catches distress and improves teaching, the benefit to vulnerable students justifies it.',
        frameworkWeights: { 'ethics-of-care': 70, utilitarianism: 65, consequentialism: 55 },
      },
      {
        id: 'ban-it',
        label: 'Ban it from classrooms',
        text: 'Constant biometric surveillance of children\'s faces violates their dignity and chills their freedom to simply be.',
        frameworkWeights: { 'rights-based-ethics': 85, autonomy: 75, deontology: 60 },
      },
      {
        id: 'consent-narrow',
        label: 'Only with consent, narrowly',
        text: 'Permit it solely as an opt-in distress-detection tool — no engagement scoring, no storage, no mandatory meetings.',
        frameworkWeights: { contractualism: 80, autonomy: 65, 'ethics-of-care': 55 },
      },
      {
        id: 'capability',
        label: 'Reject the metric itself',
        text: 'Refuse to reduce learning to a performed-attention score; invest in teachers and counselors instead.',
        frameworkWeights: { 'capabilities-approach': 80, 'virtue-ethics': 60, 'justice-ethics': 55 },
      },
    ],
    tags: ['surveillance', 'education', 'biometrics', 'algorithmic-bias'],
    relatedFrameworks: ['rights-based-ethics', 'autonomy', 'ethics-of-care', 'capabilities-approach', 'contractualism'],
    relatedTechnologies: ['Facial recognition', 'Affective computing', 'Educational analytics'],
    aiScoringPrompt:
      'Assess the learner\'s reasoning about biometric emotion-detection on students. Identify whether they emphasize catching distress and outcomes (care/utilitarian), children\'s dignity and freedom from surveillance (rights/autonomy), consent and narrow terms (contractualism), or rejecting the engagement metric and bias it introduces (capabilities/justice). Note attention to neurodivergent and marginalized students. Describe, do not judge.',
    reflectionPrompt:
      'A camera scores whether your face looks like it is learning. What is lost when attention becomes a performance to be measured — and who is most likely to be penalized for how they look while thinking?',
    visibilityStatus: 'published',
    isoWeek: '2026-W15',
    imageHint: 'classroom camera',
    publishDate: '2026-04-06T09:00:00.000Z',
  },
  {
    id: 'dilemma-inexplicable-medical-ai',
    title: 'The Diagnosis Without a Reason',
    slug: 'inexplicable-medical-ai',
    shortSetup:
      'A diagnostic AI outperforms every doctor but cannot explain why it recommends a risky surgery.',
    backgroundContext:
      'The "Oracle" diagnostic system catches cancers and predicts complications better than any human specialist — its track record is undeniable. For your patient, Mr. Adeyemi, Oracle recommends an immediate, dangerous surgery with a real chance of killing him. It is, statistically, almost always right. But it cannot explain its reasoning in any way a human can follow or check; the recommendation is a verdict from a black box. Mr. Adeyemi asks you, his doctor, the only question that matters: "Why? Why should I let you cut me open?" You do not know. You only know the machine is usually right.',
    mainEthicalQuestion:
      'Should a doctor act on a superior but unexplainable AI recommendation for a high-stakes, risky treatment?',
    choices: [
      {
        id: 'follow',
        label: 'Follow the AI',
        text: 'Its track record is the best evidence available; recommend the surgery despite the missing explanation.',
        frameworkWeights: { consequentialism: 80, utilitarianism: 65, 'pragmatist-ethics': 60 },
      },
      {
        id: 'refuse-blackbox',
        label: 'Refuse without a reason',
        text: 'A patient cannot give informed consent to a verdict no one can explain; do not recommend it on the AI\'s word alone.',
        frameworkWeights: { autonomy: 85, 'rights-based-ethics': 75, deontology: 60 },
      },
      {
        id: 'present-honestly',
        label: 'Present it honestly, let him choose',
        text: 'Tell Mr. Adeyemi exactly what you know and don\'t know — the odds and the opacity — and let him decide.',
        frameworkWeights: { 'ethics-of-care': 80, autonomy: 70, 'discourse-ethics': 55 },
      },
    ],
    tags: ['medical-technology', 'AI', 'explainability'],
    relatedFrameworks: ['consequentialism', 'autonomy', 'rights-based-ethics', 'ethics-of-care', 'deontology'],
    relatedTechnologies: ['Diagnostic AI', 'Black-box models', 'Clinical decision support'],
    aiScoringPrompt:
      'Examine how the learner trades the AI\'s superior accuracy against the impossibility of explaining a high-stakes recommendation. Identify reasoning from outcomes/track record (consequentialist/pragmatist), informed consent and the right to a reason (autonomy/rights/deontology), or honest shared decision-making with the patient (care/discourse). Note how they handle informed consent under opacity. Describe the pattern only.',
    reflectionPrompt:
      'The machine is usually right but cannot tell you why. Is "it works" enough to cut someone open? What does informed consent mean when no one — not even the expert — can explain the reason?',
    visibilityStatus: 'published',
    isoWeek: '2026-W16',
    imageHint: 'operating room',
    publishDate: '2026-04-13T09:00:00.000Z',
  },
  {
    id: 'dilemma-vr-prison-time-dilation',
    title: 'Six Months That Feel Like Ten Years',
    slug: 'vr-prison-time-dilation',
    shortSetup:
      'You run a prison program offering inmates a short physical sentence plus VR time-dilation that makes it feel far longer.',
    backgroundContext:
      'As deputy warden, you administer "compressed sentencing." An inmate can serve six physical months instead of ten years — but the six months include a VR program in which subjective time is stretched so the sentence feels like the full decade. Recidivism in the program is dramatically lower; families are kept together; the literal cages empty out. Today, Devon — twenty, first offense, terrified — has been offered the program and asks your honest advice. The neuroscientists cannot tell you exactly what ten subjective years inside a machine will do to a twenty-year-old mind. You decide who gets enrolled.',
    mainEthicalQuestion:
      'Is it ethical to impose (or offer) subjectively dilated VR time as punishment instead of years of physical incarceration?',
    choices: [
      {
        id: 'enroll',
        label: 'Recommend enrollment',
        text: 'Less physical life destroyed and lower recidivism make it the more humane option; recommend it.',
        frameworkWeights: { utilitarianism: 80, 'capabilities-approach': 60, consequentialism: 60 },
      },
      {
        id: 'refuse-engineered',
        label: 'Refuse to engineer suffering',
        text: 'Deliberately manufacturing a decade of felt suffering is too close to torture; do not offer it.',
        frameworkWeights: { deontology: 80, 'rights-based-ethics': 75, 'justice-ethics': 60 },
      },
      {
        id: 'informed-choice',
        label: 'Lay out the unknowns',
        text: 'Refuse to advise; instead give Devon the full, honest uncertainty and let him choose freely.',
        frameworkWeights: { autonomy: 80, 'ethics-of-care': 65, 'discourse-ethics': 50 },
      },
    ],
    tags: ['virtual-reality', 'justice', 'punishment'],
    relatedFrameworks: ['utilitarianism', 'deontology', 'rights-based-ethics', 'autonomy', 'justice-ethics'],
    relatedTechnologies: ['Virtual reality', 'Neurotechnology', 'Corrections technology'],
    aiScoringPrompt:
      'Analyze the learner\'s reasoning about dilated VR punishment. Identify whether they weigh reduced physical incarceration and recidivism (utilitarian/capabilities), hard limits against engineered suffering and dignity (deontology/rights/justice), or free, informed choice under uncertainty (autonomy/care). Note how they treat consent given under the threat of years in prison. Describe, do not judge.',
    reflectionPrompt:
      'Is there a difference between making someone suffer and making someone feel suffering? If a felt decade reforms a person and spares them a literal one, is that mercy or a new kind of cruelty?',
    visibilityStatus: 'published',
    isoWeek: '2026-W17',
    imageHint: 'vr headset cell',
    publishDate: '2026-04-20T09:00:00.000Z',
  },
  {
    id: 'dilemma-regional-climate-engineering',
    title: 'The Sky We Share',
    slug: 'regional-climate-engineering',
    shortSetup:
      'A geoengineering project would cool one drought-stricken region — but climate models say it will disrupt monsoons that feed another.',
    backgroundContext:
      'The Sahel is dying. A coalition can deploy stratospheric aerosols to cool the region and restore its rains within two years, saving millions from famine. But the best climate models say the same intervention has a significant chance of weakening the South Asian monsoon, on which over a billion people depend for their crops. The cooled region desperately wants it. The monsoon region did not consent and may bear the cost. No global body has authority to decide; the technology is cheap enough for the coalition to act alone. You sit on the coalition\'s ethics board, and the vote is tomorrow.',
    mainEthicalQuestion:
      'May a coalition deploy regional climate engineering that helps its people if it risks serious harm to people elsewhere who did not consent?',
    choices: [
      {
        id: 'deploy',
        label: 'Deploy to save the Sahel',
        text: 'Certain, imminent famine outweighs a probabilistic harm; act to save the millions you can save now.',
        frameworkWeights: { utilitarianism: 75, 'ethics-of-care': 55, consequentialism: 60 },
      },
      {
        id: 'forbid',
        label: 'Refuse unilateral action',
        text: 'No coalition may impose climate risk on a billion non-consenting people; do not deploy without their agreement.',
        frameworkWeights: { 'justice-ethics': 80, contractualism: 75, cosmopolitanism: 70 },
      },
      {
        id: 'governed',
        label: 'Demand global governance first',
        text: 'Pause and force the creation of an inclusive global body with the affected at the table before any deployment.',
        frameworkWeights: { 'discourse-ethics': 80, cosmopolitanism: 70, 'social-contract-theory': 60 },
      },
      {
        id: 'precaution',
        label: 'Hold under uncertainty',
        text: 'The risk of disrupting a billion people\'s food is too irreversible to gamble on models; do not act.',
        frameworkWeights: { 'environmental-ethics': 70, stoicism: 50, deontology: 55 },
      },
    ],
    tags: ['climate-tech', 'justice', 'environment'],
    relatedFrameworks: ['justice-ethics', 'cosmopolitanism', 'contractualism', 'discourse-ethics', 'utilitarianism', 'environmental-ethics'],
    relatedTechnologies: ['Solar geoengineering', 'Climate modeling', 'Atmospheric science'],
    aiScoringPrompt:
      'Evaluate how the learner weighs saving an identifiable, drought-stricken population against imposing non-consensual risk on a distant billion. Identify reasoning from aggregate/imminent benefit (utilitarian/care), cross-border justice and consent (justice/contractualism/cosmopolitanism), inclusive governance (discourse), or precaution about irreversible global risk (environmental/deontology). Note whether they treat the distant population as full moral equals. Describe the pattern only.',
    reflectionPrompt:
      'You can save the people in front of you by changing a sky shared with a billion strangers who never agreed. What do we owe people on the other side of the planet when our solution becomes their risk?',
    visibilityStatus: 'published',
    isoWeek: '2026-W18',
    imageHint: 'aerosol sky',
    publishDate: '2026-04-27T09:00:00.000Z',
  },
];
