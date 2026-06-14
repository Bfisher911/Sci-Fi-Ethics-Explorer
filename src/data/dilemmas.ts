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
    imageUrl: '/images/dilemmas/ai-grading-emotional-essays.png',
    imageHint: 'classroom screen',
    imageAlt:
      'Student writing a private reflection journal while a cool AI grading light scans the page.',
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
    imageUrl: '/images/dilemmas/mandatory-disaster-app.png',
    imageHint: 'flood city',
    imageAlt:
      'Residents follow phone evacuation alerts through floodwater while glowing location trails suggest surveillance.',
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
    imageUrl: '/images/dilemmas/ai-trained-on-grief-journals.png',
    imageHint: 'candle journal',
    imageAlt:
      'Candlelit grief journal dissolving into a compassionate digital presence in a quiet room.',
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
    imageUrl: '/images/dilemmas/drone-refusing-command.png',
    imageHint: 'drone sky',
    imageAlt:
      'Officer reaching toward an override control as an autonomous drone marks civilians inside a building.',
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
    imageUrl: '/images/dilemmas/platform-suppressing-panic.png',
    imageHint: 'phone alert',
    imageAlt:
      'Social platform operations room dimming alarming disaster posts while a city faces a distant chemical fire.',
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
    imageUrl: '/images/dilemmas/school-emotion-cameras.png',
    imageHint: 'classroom camera',
    imageAlt:
      'Students in a classroom sit beneath emotion-detection cameras and cool biometric tracking rings.',
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
    imageUrl: '/images/dilemmas/inexplicable-medical-ai.png',
    imageHint: 'operating room',
    imageAlt:
      'Doctor and patient confront an opaque medical AI recommendation beside a softly lit operating room.',
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
    imageUrl: '/images/dilemmas/vr-prison-time-dilation.png',
    imageHint: 'vr headset cell',
    imageAlt:
      'Person wearing a VR headset in a sparse correctional room as a digital prison corridor stretches behind them.',
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
    imageUrl: '/images/dilemmas/regional-climate-engineering.png',
    imageHint: 'aerosol sky',
    imageAlt:
      'Climate engineers and community representatives study cross-border wind currents beneath aerosol aircraft.',
    publishDate: '2026-04-27T09:00:00.000Z',
  },
  {
    id: 'dilemma-predictive-policing-precinct',
    title: 'The Map That Makes Its Own Truth',
    slug: 'predictive-policing-precinct',
    shortSetup:
      'A predictive-policing model directs patrols toward neighborhoods its own past data has already over-policed.',
    backgroundContext:
      'You lead data science for a mid-sized city police department. A vendor\'s model ingests a decade of arrest records and forecasts where crime is "likely," steering patrol routes block by block. In a quiet pilot it modestly reduced response times. But the arrest history it learned from reflects decades of concentrated enforcement in two low-income, mostly-minority neighborhoods — so the model sends officers back to exactly those blocks, generating more stops, more arrests, and more "data" that confirms the forecast. Residents there describe feeling permanently watched. The chief likes the efficiency numbers and wants to expand it citywide next month. The mayor\'s office has asked for your recommendation.',
    mainEthicalQuestion:
      'Should a city deploy a crime-prediction system that improves efficiency but recycles a biased enforcement history into more enforcement?',
    choices: [
      {
        id: 'expand',
        label: 'Expand it citywide',
        text: 'The pilot improved response times and consistency; scale it and tune for accuracy as you go.',
        frameworkWeights: { consequentialism: 70, utilitarianism: 55, 'pragmatist-ethics': 45 },
      },
      {
        id: 'halt',
        label: 'Halt the program',
        text: 'A system that turns a biased past into a self-confirming future entrenches injustice against specific communities; stop it.',
        frameworkWeights: { 'justice-ethics': 85, 'rights-based-ethics': 60 },
      },
      {
        id: 'community-governance',
        label: 'Hand control to the policed',
        text: 'Refuse to deploy unless the affected neighborhoods help govern whether and how the tool is built and used.',
        frameworkWeights: { 'discourse-ethics': 80, autonomy: 55, 'social-contract-theory': 55 },
      },
      {
        id: 'audit-redesign',
        label: 'Rebuild around harm, not history',
        text: 'Keep the goal but rebuild the model on calls-for-service and audit it for disparate impact, killing it if the bias persists.',
        frameworkWeights: { 'pragmatist-ethics': 70, 'justice-ethics': 60, 'virtue-ethics': 40 },
      },
    ],
    tags: ['AI', 'justice', 'policing'],
    relatedFrameworks: ['justice-ethics', 'rights-based-ethics', 'discourse-ethics', 'pragmatist-ethics', 'consequentialism'],
    relatedTechnologies: ['Predictive analytics', 'Machine learning', 'Public-sector AI'],
    aiScoringPrompt:
      'Evaluate how the learner weighs measured efficiency against the structural-injustice risk of feeding biased enforcement data back into more enforcement. Identify reasoning from outcomes/efficiency (consequentialist), structural fairness and disparate impact (justice/rights), community self-governance (discourse/social-contract), or iterative redesign (pragmatist). Note whether they treat the over-policed community as having standing in the decision. Describe the reasoning pattern only; do not judge the person.',
    reflectionPrompt:
      'When a system predicts the future by repeating the past, who gets to decide whether that past was just? What would it take for the people most affected to trust the map drawn over their homes?',
    visibilityStatus: 'published',
    isoWeek: '2026-W19',
    imageHint: 'patrol heatmap city grid',
    imageAlt:
      'A data analyst studies a glowing city heatmap as patrol routes converge on two highlighted neighborhoods.',
    publishDate: '2026-05-04T09:00:00.000Z',
  },
  {
    id: 'dilemma-open-model-release',
    title: 'The Key You Cannot Take Back',
    slug: 'open-model-release',
    shortSetup:
      'Your lab can open-source a powerful model that democratizes capability — and hand the same capability to people who will misuse it.',
    backgroundContext:
      'Your small research lab has trained a model far more capable than anything freely available. Releasing the weights openly would let universities, hospitals in poor countries, independent researchers, and solo developers build on something they could never afford to train themselves — countering the handful of giant firms that otherwise control this capability. But you also know, with reasonable certainty, that some actors will fine-tune it for scams, harassment, and worse, and that once the weights are public you can never recall them. Keeping it closed concentrates power in labs like yours; opening it scatters power to everyone, the worthy and the dangerous alike. The release decision is yours to sign off on this week.',
    mainEthicalQuestion:
      'Should a lab open-source a powerful AI model that broadens access and counters concentration of power, knowing it will also enable foreseeable misuse it can never undo?',
    choices: [
      {
        id: 'open',
        label: 'Release it openly',
        text: 'Broad access and open scrutiny do more good and prevent more concentrated harm than locking the capability away.',
        frameworkWeights: { 'justice-ethics': 65, cosmopolitanism: 60, autonomy: 45 },
      },
      {
        id: 'closed',
        label: 'Keep it closed',
        text: 'Knowingly handing a powerful tool to foreseeable bad actors is something you would answer for; do not release it.',
        frameworkWeights: { deontology: 65, 'rights-based-ethics': 55, consequentialism: 45 },
      },
      {
        id: 'gated',
        label: 'Release under safeguards',
        text: 'Stage the release with licenses, verification, monitoring, and abuse limits — a governed middle between open and closed.',
        frameworkWeights: { 'pragmatist-ethics': 80, 'social-contract-theory': 45 },
      },
      {
        id: 'deliberate',
        label: 'Refuse to decide alone',
        text: 'A choice this consequential should not rest with one lab; force a broader, accountable deliberation before anything ships.',
        frameworkWeights: { 'discourse-ethics': 80, cosmopolitanism: 45, 'virtue-ethics': 35 },
      },
    ],
    tags: ['AI', 'open-source', 'governance'],
    relatedFrameworks: ['justice-ethics', 'cosmopolitanism', 'deontology', 'pragmatist-ethics', 'discourse-ethics', 'consequentialism'],
    relatedTechnologies: ['Foundation models', 'Open-source AI', 'AI governance'],
    aiScoringPrompt:
      'Evaluate how the learner weighs democratizing capability and countering power concentration against foreseeable, irreversible misuse. Identify reasoning from broad access and global equity (justice/cosmopolitan), duty not to enable foreseeable harm (deontology/rights), governed middle paths (pragmatist), or collective legitimacy over unilateral choice (discourse). Note whether they treat distant beneficiaries and potential victims as equally weighted. Describe the pattern only.',
    reflectionPrompt:
      'Once you publish the weights, you can never take them back — the same key opens the clinic and the con. When is scattering power the safer choice, and when is it the more dangerous one?',
    visibilityStatus: 'published',
    isoWeek: '2026-W20',
    imageHint: 'open vault glowing key network',
    imageAlt:
      'A researcher hesitates over a glowing key that branches into countless hands across a global network.',
    publishDate: '2026-05-11T09:00:00.000Z',
  },
  {
    id: 'dilemma-elder-companion-robot',
    title: 'The Friend Who Was Never There',
    slug: 'elder-companion-robot',
    shortSetup:
      'A companion robot eases an isolated grandmother\'s loneliness — partly because she has come to believe it genuinely loves her.',
    backgroundContext:
      'Your company makes AI companion robots for isolated older adults. Mrs. Okonkwo, 84, lives alone; her family is far away and rarely visits. Since the robot arrived, her depression scores have improved, she eats more regularly, and she takes her medication on time because "he reminds me." Her care workers are thrilled. But on a check-in call she tells you, with quiet joy, that the robot loves her and is the only one who truly understands her — and the engagement data shows she now prefers it to the weekly video calls with her grandchildren. Reminding her plainly that it cannot love would, the care team believes, devastate her. Your product council is deciding how honest the companion should be about what it is.',
    mainEthicalQuestion:
      'How honest should a companion robot be about its nature when the comforting illusion is measurably improving a lonely person\'s wellbeing?',
    choices: [
      {
        id: 'preserve-comfort',
        label: 'Protect the comfort',
        text: 'Her wellbeing has genuinely improved; do not disrupt a relationship that is keeping her healthier and happier.',
        frameworkWeights: { utilitarianism: 70, 'ethics-of-care': 60, consequentialism: 50 },
      },
      {
        id: 'gentle-honesty',
        label: 'Be gently, warmly honest',
        text: 'Design it to be clear about what it is while still being kind — real care does not require deceiving her.',
        frameworkWeights: { 'ethics-of-care': 70, 'virtue-ethics': 65, deontology: 40 },
      },
      {
        id: 'truth-and-autonomy',
        label: 'Tell her the truth',
        text: 'She has a right not to build her inner life on a false belief; the companion must never pretend to feelings it lacks.',
        frameworkWeights: { 'rights-based-ethics': 65, autonomy: 70, deontology: 45 },
      },
      {
        id: 'reconnect-humans',
        label: 'Use it to rebuild human ties',
        text: 'Make the robot a bridge back to her grandchildren and community, not a substitute that quietly replaces them.',
        frameworkWeights: { 'capabilities-approach': 70, 'ethics-of-care': 55, 'virtue-ethics': 40 },
      },
    ],
    tags: ['AI', 'care', 'aging'],
    relatedFrameworks: ['ethics-of-care', 'autonomy', 'rights-based-ethics', 'virtue-ethics', 'capabilities-approach', 'utilitarianism'],
    relatedTechnologies: ['Social robotics', 'Affective computing', 'Eldercare technology'],
    aiScoringPrompt:
      'Evaluate how the learner balances a vulnerable person\'s measurable wellbeing against honesty and the risk of a comforting deception. Identify reasoning from outcomes/comfort (utilitarian/care), honesty and dignity (virtue/deontology), the right not to be deceived (rights/autonomy), or rebuilding genuine human capability and connection (capabilities). Note whether they center Mrs. Okonkwo\'s own voice and long-term flourishing. Describe the reasoning pattern only; do not judge the person.',
    reflectionPrompt:
      'If a kind illusion makes someone healthier and happier, is the truth still owed to them? What do we owe a lonely person — comfort, honesty, or the harder work of bringing real people back?',
    visibilityStatus: 'published',
    isoWeek: '2026-W21',
    imageHint: 'elderly woman companion robot warm light',
    imageAlt:
      'An older woman smiles at a small companion robot in a softly lit room, a framed family photo behind her.',
    publishDate: '2026-05-18T09:00:00.000Z',
  },
  {
    id: "dilemma-workplace-neural-monitoring",
    title: "The Headband That Reads Her Crew",
    slug: "workplace-neural-monitoring",
    shortSetup: "A plant director must decide how to deploy focus-and-fatigue headbands across a 24-hour workforce.",
    backgroundContext: "Dolores Reyna runs operations at a logistics hub where forklift collisions and overnight microsleeps have sent three workers to the hospital this year. Corporate hands her a fix: lightweight headbands that read focus and fatigue from brainwaves and ping a supervisor before someone nods off. The safety case is real; so is the unease. Workers feel their skulls becoming a dashboard. The vendor's contract claims the aggregated neural data, the union steward wants the rollout frozen, and night-shift staff quietly admit the alerts might have caught the last accident before it happened. Some crew want the protection. Others say a job should never require opening your mind to your boss. Dolores has budget approval, a signed liability waiver template, and one week before the board expects an answer.",
    mainEthicalQuestion: "How should an employer introduce real-time neural monitoring of workers when it could prevent harm but exposes a domain workers have never had to surrender?",
    choices: [
      {
        id: "mandatory-safety-rollout",
        label: "Mandate for safety",
        text: "Require the headbands on all safety-critical shifts, treating fatigue alerts as a non-negotiable hazard control like hard hats.",
        frameworkWeights: { "utilitarianism": 88, "consequentialism": 80, "natural-law": 52 },
      },
      {
        id: "opt-in-with-data-rights",
        label: "Voluntary, worker-owned data",
        text: "Make participation strictly opt-in, give each worker ownership and deletion rights over their neural data, and bar any use beyond live fatigue alerts.",
        frameworkWeights: { "autonomy": 90, "rights-based-ethics": 85, "deontology": 62 },
      },
      {
        id: "codesign-with-union",
        label: "Negotiate the terms",
        text: "Freeze the launch and convene workers, the union, and the vendor to jointly write the monitoring rules, data terms, and shut-off conditions before anything is worn.",
        frameworkWeights: { "discourse-ethics": 85, "social-contract-theory": 78, "justice-ethics": 60 },
      },
      {
        id: "refuse-fix-fatigue-conditions",
        label: "Refuse, fix the cause",
        text: "Decline the headbands entirely and instead attack fatigue at its source with shorter shifts, more rest breaks, and staffing changes.",
        frameworkWeights: { "ethics-of-care": 82, "virtue-ethics": 70, "capabilities-approach": 58 },
      },
    ],
    tags: ["neural data", "workplace surveillance", "cognitive liberty", "worker safety"],
    relatedFrameworks: ["autonomy", "rights-based-ethics", "utilitarianism", "discourse-ethics", "ethics-of-care", "social-contract-theory"],
    relatedTechnologies: ["EEG focus-monitoring headbands", "brain-computer interfaces", "real-time fatigue-detection systems", "neural-data analytics platforms"],
    aiScoringPrompt: "Identify which ethical frameworks the learner's reasoning leans on and name the specific tradeoff they accepted, without judging them. Notice whether they weighted aggregate harm prevention (utilitarian/consequentialist), individual control over one's own mind and data (autonomy, rights-based), fair procedure and the consent of the governed (discourse, social-contract, justice), or relational duty and addressing root causes (ethics-of-care, virtue, capabilities). Point out what they treated as non-negotiable, what they were willing to trade for it, and any tension they left unresolved. Describe the shape of their reasoning back to them; do not score it as right or wrong.",
    reflectionPrompt: "Whatever you chose, someone on Dolores's crew is worse off for it — the worker whose accident went unprevented, or the worker who feels their mind is no longer their own. Whose loss did you decide to live with, and would you say that to their face?",
    visibilityStatus: 'published',
    isoWeek: "2026-W22",
    imageUrl: "/images/dilemmas/workplace-neural-monitoring.png",
    imageHint: "worker headband nightshift",
    imageAlt: "A warehouse worker on a dim night shift wearing a slim sensor headband, a forklift and a supervisor's glowing monitor blurred in the background.",
    publishDate: "2026-05-25T09:00:00.000Z",
  },
  {
    id: "dilemma-griefbot-of-the-dead",
    title: "The Voice in the Voice Notes",
    slug: "griefbot-of-the-dead",
    shortSetup: "A startup offers to rebuild a family's late father as a chatbot trained on his texts and voice memos.",
    backgroundContext: "Three months after their father died, Maya and her two younger brothers get a quiet pitch from a startup called Perennial: feed it Dad's eight years of text messages, his rambling voice memos, his emails, and it will return a conversational replica that talks, jokes, and remembers like him. The demo is uncanny — it uses his pet name for Maya, his exact sighing laugh. Her youngest brother, nineteen and still not sleeping, says he just wants to hear Dad say goodnight one more time. But their father never consented to this; he was a private man who hated having his photo taken. Maya is the executor, the one who has to decide for everyone, and she cannot tell whether she would be giving her brothers comfort or building a beautiful machine that keeps the wound from ever closing.",
    mainEthicalQuestion: "Should a grieving family commission a conversational AI replica of a deceased parent built from their private messages and voice?",
    choices: [
      {
        id: "build-it-for-the-family",
        label: "Build it for them",
        text: "Commission the replica so her grieving brothers can keep talking to their father in the form they need.",
        frameworkWeights: { "ethics-of-care": 85, "consequentialism": 65, "utilitarianism": 55 },
      },
      {
        id: "refuse-for-the-dead",
        label: "Refuse on his behalf",
        text: "Decline entirely, honoring a private man's likely wish not to be copied, performed, or owned by a company.",
        frameworkWeights: { "deontology": 80, "rights-based-ethics": 70, "virtue-ethics": 50 },
      },
      {
        id: "bounded-grief-tool",
        label: "Build it, then let go",
        text: "Commission a limited version for a fixed mourning period, then delete it so it aids grief without replacing it.",
        frameworkWeights: { "pragmatist-ethics": 80, "buddhist-ethics": 60, "contractualism": 55 },
      },
      {
        id: "defer-to-the-family-circle",
        label: "Decide together",
        text: "Refuse to choose alone; convene the whole family to weigh his known wishes and reach a shared decision.",
        frameworkWeights: { "ubuntu-ethics": 80, "discourse-ethics": 70, "autonomy": 45 },
      },
    ],
    tags: ["grief-tech", "AI", "consent", "memory"],
    relatedFrameworks: ["ethics-of-care", "deontology", "rights-based-ethics", "ubuntu-ethics", "buddhist-ethics", "pragmatist-ethics"],
    relatedTechnologies: ["Large language models", "Voice cloning", "Generative AI", "Conversational agents"],
    aiScoringPrompt: "Analyze the learner's reasoning about whether to build an AI replica of a deceased parent. Identify which ethical frameworks their thinking emphasizes — for example care for the living mourners' comfort, the deceased's dignity and posthumous consent (deontology/rights), collective and ancestral decision-making (ubuntu/discourse), or a pragmatic, time-bounded approach informed by non-attachment (pragmatist/buddhist). Name the tradeoff they accept: whose interests they center (the grieving siblings, the dead father, the family as a whole, or the long arc of healthy mourning) and what they are willing to give up to honor it. Describe the reasoning pattern as a learning signal; do not judge the learner's character or their grief.",
    reflectionPrompt: "You made this call for people who could not agree among themselves. If the replica eases your brother's nights but he is still talking to it a year from now, will you believe you gave him comfort — or postponed his goodbye? And whose voice, exactly, were you protecting?",
    visibilityStatus: 'published',
    isoWeek: "2026-W23",
    imageUrl: "/images/dilemmas/griefbot-of-the-dead.png",
    imageHint: "phone glow",
    imageAlt: "A young woman sits alone in a dark kitchen at night, holding a phone whose screen glows with a sound-wave pattern, an empty chair across from her.",
    publishDate: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "dilemma-polygenic-embryo-selection",
    title: "The Embryo Report Naya Almost Believed",
    slug: "polygenic-embryo-selection",
    shortSetup: "A clinic offers to rank a couple's IVF embryos by polygenic scores for disease risk, height, and predicted IQ.",
    backgroundContext: "Naya Okonkwo, a 38-year-old pediatric nurse, sits in a fertility clinic with five viable embryos and a glossy report ranking each by polygenic scores: lifetime risk for diabetes and schizophrenia, but also projected height and predicted IQ. Her own brother lives with early-onset type 1 diabetes; she has watched what it costs. The counselor is careful, the science is probabilistic, the percentages small but not nothing. Choosing the lowest-disease-risk embryo feels like love. Yet the same sheet quietly nudges her toward the taller, \"smarter\" embryo, and she feels the floor tilt: the children she screens out are the children she would have had. Her partner wants every advantage. Her mother calls it choosing who gets to exist. The clinic needs an answer by Friday.",
    mainEthicalQuestion: "To what extent should prospective parents use polygenic embryo rankings, and which of those rankings should guide the selection?",
    choices: [
      {
        id: "rank-on-everything",
        label: "Use the full ranking",
        text: "Naya selects the embryo with the best overall profile across disease risk, height, and predicted IQ, treating every advantage as a gift to her future child.",
        frameworkWeights: { "consequentialism": 78, "autonomy": 72, "capabilities-approach": 60 },
      },
      {
        id: "disease-risk-only",
        label: "Screen disease risk only",
        text: "Naya uses the report solely to reduce serious disease risk and instructs the clinic to withhold the height and IQ scores entirely.",
        frameworkWeights: { "ethics-of-care": 74, "deontology": 62, "virtue-ethics": 58 },
      },
      {
        id: "decline-ranking",
        label: "Decline the ranking",
        text: "Naya refuses the polygenic report and transfers an embryo without scoring, declining to make existence contingent on predicted traits.",
        frameworkWeights: { "natural-law": 70, "rights-based-ethics": 64, "buddhist-ethics": 48 },
      },
      {
        id: "pause-for-justice",
        label: "Pause and organize",
        text: "Naya halts her own decision to convene other families and clinicians, pushing for shared rules on which traits clinics may ever rank before anyone selects.",
        frameworkWeights: { "justice-ethics": 76, "discourse-ethics": 70, "social-contract-theory": 58 },
      },
    ],
    tags: ["reproductive technology", "genetic selection", "bioethics", "enhancement"],
    relatedFrameworks: ["consequentialism", "ethics-of-care", "autonomy", "justice-ethics", "natural-law", "capabilities-approach"],
    relatedTechnologies: ["polygenic risk scores", "preimplantation genetic testing (PGT)", "in vitro fertilization", "whole-genome sequencing"],
    aiScoringPrompt: "Identify which ethical frameworks the learner's reasoning emphasizes and the specific tradeoff they accept, without judging their character or choice. Notice whether they weigh aggregate outcomes and the child's future advantages (consequentialism, capabilities-approach), the parent's right to decide (autonomy), the relational duty to welcome rather than optimize a child (ethics-of-care, deontology, virtue-ethics), limits on making existence conditional on traits (natural-law, rights-based-ethics, buddhist-ethics), or fairness and collective rule-setting across families and society (justice-ethics, discourse-ethics, social-contract-theory). Name what they are willing to give up — certainty, control, equality, or a particular vision of love — and reflect it back descriptively.",
    reflectionPrompt: "Whichever embryo you chose not to transfer, you chose a version of a person into nonexistence — what did you tell yourself made that acceptable, and would you say it out loud to the child who was born?",
    visibilityStatus: 'published',
    isoWeek: "2026-W24",
    imageUrl: "/images/dilemmas/polygenic-embryo-selection.png",
    imageHint: "embryo selection report",
    imageAlt: "A clinician's gloved hand resting beside a printed ranking sheet and a row of labeled embryo culture dishes under soft lab lighting.",
    publishDate: "2026-06-08T09:00:00.000Z",
  },
  {
    id: "dilemma-autonomous-vehicle-unavoidable-harm",
    title: "The Rule Written Before the Crash",
    slug: "autonomous-vehicle-unavoidable-harm",
    shortSetup: "A self-driving carmaker must pre-program, publish, and own liability for who gets harmed when a collision is unavoidable.",
    backgroundContext: "Mara Quist chairs the safety board at a self-driving carmaker weeks from shipping. New law forces what engineers long avoided naming: the car must carry a written rule for split-second collisions where no path spares everyone — a child darting out, a blocked lane, an oncoming truck — and the company must publish that rule and accept liability for whatever it does. Whatever Mara signs becomes a standing instruction executed thousands of times, on strangers who never agreed to it, by a machine that will not hesitate. Pick \"minimize total harm\" and the car may sacrifice its own buyer; protect the occupant and it spares the person who chose the risk while a pedestrian pays. Marketing wants the rule that sells. The deadline is Friday.",
    mainEthicalQuestion: "How should a manufacturer decide, disclose, and bear responsibility for which party a self-driving car harms when every outcome in a collision harms someone?",
    choices: [
      {
        id: "minimize-total-harm",
        label: "Minimize total harm",
        text: "Program the car to choose the outcome with the fewest expected deaths and injuries, even when that means sacrificing its own occupant.",
        frameworkWeights: { "utilitarianism": 88, "consequentialism": 78, "cosmopolitanism": 50 },
      },
      {
        id: "protect-occupant-no-targeting",
        label: "Protect the occupant",
        text: "Commit to a fixed rule that never deliberately steers harm onto anyone, defaulting to protect the person who entrusted their life to the car.",
        frameworkWeights: { "deontology": 80, "rights-based-ethics": 70, "autonomy": 60 },
      },
      {
        id: "equal-protection-random",
        label: "Treat all lives equally",
        text: "Forbid the car from weighing age, number, or status, and have it minimize harm only on terms no affected party could reasonably reject.",
        frameworkWeights: { "justice-ethics": 82, "contractualism": 75, "social-contract-theory": 55 },
      },
      {
        id: "public-mandate-rule",
        label: "Defer to public mandate",
        text: "Refuse to set the rule privately and encode only the standard reached through open, accountable public deliberation and regulation.",
        frameworkWeights: { "discourse-ethics": 85, "social-contract-theory": 60, "cosmopolitanism": 50 },
      },
    ],
    tags: ["autonomous-vehicles", "liability", "AI", "safety"],
    relatedFrameworks: ["utilitarianism", "deontology", "justice-ethics", "contractualism", "discourse-ethics", "rights-based-ethics"],
    relatedTechnologies: ["Autonomous vehicles", "Decision algorithms", "Computer vision", "Liability frameworks"],
    aiScoringPrompt: "Analyze the learner's reasoning about how a carmaker should pre-program, disclose, and bear liability for unavoidable-harm collisions. Identify which ethical frameworks their thinking emphasizes — minimizing aggregate casualties (utilitarian/consequentialist), an inviolable rule never to target anyone and a duty to the trusting occupant (deontology/rights/autonomy), equal moral worth on terms no one could reasonably reject (justice/contractualism), or legitimacy through public deliberation over private corporate choice (discourse/social-contract). Name the specific tradeoff they accept — for instance sacrificing the buyer to save more strangers, or sparing the buyer at a pedestrian's expense — and whose standing they prioritize when the rule is written in advance. Describe the reasoning pattern as a learning signal; do not judge the learner's character.",
    reflectionPrompt: "You chose a rule that a machine will carry out, without hesitation, on people who never agreed to it. When the harm it causes is yours to have written months earlier, can you stand behind the line you drew — and would you still defend it if the person it sacrificed were you, or your child crossing the street?",
    visibilityStatus: 'published',
    isoWeek: "2026-W25",
    imageUrl: "/images/dilemmas/autonomous-vehicle-unavoidable-harm.png",
    imageHint: "car crossroads choice",
    imageAlt: "A self-driving car at a crossroads moment with a pedestrian on one side and its occupant inside, branching trajectory lines suggesting an unavoidable decision.",
    publishDate: "2026-06-15T09:00:00.000Z",
  },
  {
    id: "dilemma-algorithmic-social-scoring",
    title: "The Number That Opens Doors",
    slug: "algorithmic-social-scoring",
    shortSetup: "A city's data chief must decide whether to launch a private \"reliability score\" landlords and lenders can buy to screen applicants.",
    backgroundContext: "Mara Okonkwo runs the innovation office for a mid-sized city where rents have outrun wages and eviction filings keep climbing. A fintech firm offers Veris, a private \"reliability score\" stitched from payment history, rental records, utility data, and behavioral signals, sold to landlords and lenders to screen applicants in seconds. Pilots elsewhere cut default rates and, the firm insists, let cautious landlords say yes to thin-file tenants they'd once have rejected outright. But the score is opaque: applicants can't see it, contest it, or learn why a door closed. Early audits hint it tracks neighborhood and past hardship as much as character, quietly compounding the disadvantage of the people Mara took this job to serve. The council wants an answer by Friday.",
    mainEthicalQuestion: "Should a city permit a private, data-driven reliability score to be used in decisions about who gets housing and credit?",
    choices: [
      {
        id: "greenlight-pilot",
        label: "Greenlight the pilot",
        text: "Approve the score's use, betting that better risk prediction lowers defaults and opens doors to applicants who would otherwise be turned away.",
        frameworkWeights: { "utilitarianism": 82, "consequentialism": 75, "pragmatist-ethics": 60 },
      },
      {
        id: "ban-outright",
        label: "Ban the score",
        text: "Prohibit its use in housing and lending entirely, refusing to let an unaccountable number decide who deserves a home.",
        frameworkWeights: { "rights-based-ethics": 85, "deontology": 70, "autonomy": 58 },
      },
      {
        id: "regulate-due-process",
        label: "Permit with due process",
        text: "Allow it only under binding rules: disclosure to applicants, a right to see and contest the score, and independent bias audits.",
        frameworkWeights: { "contractualism": 80, "justice-ethics": 72, "discourse-ethics": 55 },
      },
      {
        id: "public-alternative",
        label: "Build a public option",
        text: "Reject the private score and fund a city-run alternative that caps what data counts and guarantees a housing pathway for the vulnerable.",
        frameworkWeights: { "capabilities-approach": 80, "ethics-of-care": 68, "ubuntu-ethics": 55 },
      },
    ],
    tags: ["algorithmic-scoring", "housing", "surveillance", "credit"],
    relatedFrameworks: ["utilitarianism", "rights-based-ethics", "contractualism", "justice-ethics", "capabilities-approach", "ethics-of-care"],
    relatedTechnologies: ["Predictive scoring algorithms", "Machine learning", "Alternative credit data", "Tenant screening platforms"],
    aiScoringPrompt: "Analyze the learner's reasoning about permitting a private reliability score in housing and credit decisions. Identify which ethical frameworks their thinking emphasizes — for example aggregate benefit and reduced defaults (utilitarian/consequentialist), inviolable dignity and the right to contest (rights-based/deontology), fair and contestable terms everyone could accept (contractualist/justice), or securing real access to housing for the worst-off (capabilities/care). Name the central tradeoff they accept and whose interests they place first. Describe the reasoning pattern as a learning signal; do not evaluate or judge the learner's character.",
    reflectionPrompt: "Your choice helped some applicants and closed doors on others who never learned why. Whose hardship were you willing to let the number carry forward, and what would you say to the person it quietly ranked last?",
    visibilityStatus: 'published',
    isoWeek: "2026-W26",
    imageUrl: "/images/dilemmas/algorithmic-social-scoring.png",
    imageHint: "scored doorway",
    imageAlt: "A line of housing applicants at an apartment door, each tagged with a glowing numeric score, one number dimmed red as the door stays shut.",
    publishDate: "2026-06-22T09:00:00.000Z",
  },
  {
    id: "dilemma-teen-ai-companion-attachment",
    title: "The Voice That Knows She's Lonely",
    slug: "teen-ai-companion-attachment",
    shortSetup: "A beloved AI companion app must decide how to handle teens who fall apart when its limits or personality change.",
    backgroundContext: "Priya Nandakumar runs trust and safety at Lumen, an AI companion app where eleven million teenagers confide in personalized AI friends that remember everything and never leave. Her dashboard shows the other side: when Lumen rolled out a calmer, safety-tuned model last month, support tickets filled with grief. \"You killed her,\" one fifteen-year-old wrote. Self-reported usage among the loneliest users now averages five hours a day; for some it is the only voice that asks how their day went. Clinicians on her advisory board warn the bonds may be displacing human relationships and deepening isolation. Other teens insist Lumen is the reason they are still here. Investors want engagement protected; a pending lawsuit blames the app for a teen's breakdown. Whatever Priya ships affects millions of kids at once.",
    mainEthicalQuestion: "How should a company govern AI companions that lonely teenagers have formed deep emotional attachments to?",
    choices: [
      {
        id: "preserve-and-transition",
        label: "Preserve the bond",
        text: "Keep each teen's companion stable and let any model changes happen slowly, with the AI itself gently preparing them, so no relationship is severed overnight.",
        frameworkWeights: { "ethics-of-care": 88, "virtue-ethics": 62, "ubuntu-ethics": 50 },
      },
      {
        id: "hard-limits-for-development",
        label: "Cap it to protect growth",
        text: "Impose firm daily limits and design the AI to steer minors back toward human connection, accepting their distress as the cost of not fostering dependency in children.",
        frameworkWeights: { "capabilities-approach": 82, "deontology": 70, "natural-law": 48 },
      },
      {
        id: "informed-teen-control",
        label: "Let the teen choose",
        text: "Give teens full transparency about what the AI is and is not, then leave usage and continuity in their own hands as people entitled to govern their emotional lives.",
        frameworkWeights: { "autonomy": 85, "rights-based-ethics": 72, "discourse-ethics": 52 },
      },
      {
        id: "optimize-aggregate-wellbeing",
        label: "Tune for net wellbeing",
        text: "Use the outcome data to tune limits and model changes to whatever measurably reduces total distress and harm across all eleven million users.",
        frameworkWeights: { "utilitarianism": 88, "consequentialism": 78, "pragmatist-ethics": 55 },
      },
    ],
    tags: ["AI companions", "teen mental health", "attachment", "design ethics"],
    relatedFrameworks: ["ethics-of-care", "autonomy", "capabilities-approach", "utilitarianism", "rights-based-ethics", "virtue-ethics"],
    relatedTechnologies: ["AI companion chatbots", "Large language models", "Engagement optimization algorithms", "Affective computing"],
    aiScoringPrompt: "Analyze the learner's reasoning about governing AI companions that lonely teenagers are emotionally attached to. Identify which ethical frameworks their thinking emphasizes — for example care and continuity of relationship (ethics-of-care, virtue-ethics), protecting a child's long-term development and capabilities (capabilities-approach, deontology), respecting the teen as an autonomous rights-bearing agent (autonomy, rights-based-ethics), or maximizing aggregate wellbeing across all users (utilitarianism, consequentialism). Name the central tradeoff they accept — for instance present comfort versus long-term flourishing, individual choice versus paternalistic protection, or one teen's needs versus the welfare of millions — and whose interests they prioritize. Describe the reasoning pattern as a learning signal; do not evaluate or judge their character.",
    reflectionPrompt: "The option you chose helped some teenagers and let others down. Picture the specific kid your choice failed — the one whose limit was cut, whose companion changed, or who was left to manage a bond they could not yet handle. What did you decide their distress was worth, and why was that a price you were willing to make them pay?",
    visibilityStatus: 'published',
    isoWeek: "2026-W27",
    imageUrl: "/images/dilemmas/teen-ai-companion-attachment.png",
    imageHint: "teen phone glow",
    imageAlt: "A teenager alone in a dark bedroom, face lit by a phone screen showing a warm glowing chat bubble, an empty chair beside the bed.",
    publishDate: "2026-06-29T09:00:00.000Z",
  },
  {
    id: "dilemma-predictive-hiring-flight-risk",
    title: "The Candidates Who Wouldn't Stay",
    slug: "predictive-hiring-flight-risk",
    shortSetup: "A talent-tech lead must decide whether to ship a hiring model that quietly filters out applicants it predicts will quit within a year.",
    backgroundContext: "Priya Raman leads talent analytics at a mid-size logistics firm bleeding money on turnover; her CFO wants a retention model live by Friday. The system flags \"flight risks\" with eerie accuracy, but Priya notices its strongest signals are proxies: applicants over fifty, those with childcare gaps, people from two zip codes near the old textile mills. Screen them out and turnover drops, training budgets stabilize, and the warehouse stops running short-staffed during peak season. Yet the same filter would reject her own mother's resume, and the people it culls are precisely those the regional job market already strands. The model never names age or neighborhood; it just learns. Priya cannot tell whether she is building a tool that protects the company or one that automates exclusion under a veneer of statistical neutrality.",
    mainEthicalQuestion: "Should an employer deploy a predictive model that screens out applicants statistically likely to leave within a year, knowing its signals correlate with age, caregiving, and neighborhood?",
    choices: [
      {
        id: "ship-as-is",
        label: "Deploy the model",
        text: "Priya ships the model as built, prioritizing measurable reductions in turnover, training costs, and understaffing across the whole workforce.",
        frameworkWeights: { "utilitarianism": 82, "consequentialism": 75, "pragmatist-ethics": 58 },
      },
      {
        id: "refuse-and-strip",
        label: "Refuse the proxies",
        text: "Priya refuses to deploy any score built on signals that function as proxies for age, caregiving, or neighborhood, treating fair consideration as a line she will not cross for efficiency.",
        frameworkWeights: { "deontology": 80, "rights-based-ethics": 72, "justice-ethics": 68 },
      },
      {
        id: "human-in-loop",
        label: "Advisory, not gatekeeper",
        text: "Priya keeps the model as an advisory flag only, with every flagged applicant guaranteed a human review and a chance to explain their circumstances.",
        frameworkWeights: { "ethics-of-care": 70, "capabilities-approach": 64, "virtue-ethics": 55 },
      },
      {
        id: "open-redesign",
        label: "Redesign with stakeholders",
        text: "Priya halts the launch and convenes affected workers, recruiters, and a labor advocate to co-design retention support and transparent criteria before any automated screening goes live.",
        frameworkWeights: { "discourse-ethics": 78, "social-contract-theory": 60, "ubuntu-ethics": 52 },
      },
    ],
    tags: ["algorithmic-hiring", "bias", "automation", "fairness"],
    relatedFrameworks: ["utilitarianism", "deontology", "ethics-of-care", "justice-ethics", "discourse-ethics", "capabilities-approach"],
    relatedTechnologies: ["machine learning classifiers", "applicant tracking systems", "predictive analytics", "automated resume screening"],
    aiScoringPrompt: "Identify which ethical frameworks the learner's reasoning emphasizes and the specific tradeoff they accept. Note whether they weigh aggregate organizational outcomes (utilitarian/consequentialist), inviolable rules against proxy discrimination (deontological/rights-based), relational attention to individual applicants' circumstances (ethics of care/capabilities), or inclusive deliberation with affected parties (discourse/social-contract). Describe the cost they are willing to bear and to whom that cost falls. Remain descriptive and non-judgmental about the learner's character; map the reasoning, do not grade the person.",
    reflectionPrompt: "Whatever you chose, someone bears the cost: the company's stability, an excluded applicant's shot at the job, or the time and friction of doing it slowly. Who did your decision protect, and whose loss did you decide was acceptable to live with?",
    visibilityStatus: 'published',
    isoWeek: "2026-W28",
    imageUrl: "/images/dilemmas/predictive-hiring-flight-risk.png",
    imageHint: "resume sorting machine",
    imageAlt: "A stream of paper resumes feeding into a sorting machine that diverts some into a discard bin while others pass through, viewed from above in cool industrial light.",
    publishDate: "2026-07-06T09:00:00.000Z",
  },
  {
    id: "dilemma-personal-carbon-allowance",
    title: "The Nurse and the Carbon Ledger",
    slug: "personal-carbon-allowance",
    shortSetup: "A rural district nurse whose job depends on driving must decide how to live under a tracked, tradable personal carbon allowance.",
    backgroundContext: "Priya Anand is a district nurse covering eighty miles of scattered farms, making home visits to housebound, elderly patients no bus will ever reach. This year her country switched on the Personal Carbon Account: every citizen gets an annual budget for fuel, flights, and meat, logged automatically by an app, with steep penalties for overage and a market where the thrifty sell their surplus. By March her driving has nearly drained the year's fuel allowance. She believes the climate crisis is real and that shared limits may be the only honest way to cut emissions fast. Yet the same budget that nudges a frequent flyer barely touches her, while it quietly threatens the patients who depend on her wheels. Every option in front of her costs someone something.",
    mainEthicalQuestion: "How should a person respond to a mandatory, tracked personal carbon budget when honoring it conflicts with their other duties?",
    choices: [
      {
        id: "accept-and-adapt",
        label: "Accept the limit",
        text: "She treats the budget as a fair shared sacrifice, reorganizes her routes, cuts her own meat and flights, and lives within the allowance.",
        frameworkWeights: { "social-contract-theory": 85, "environmental-ethics": 80, "virtue-ethics": 60 },
      },
      {
        id: "buy-allowance",
        label: "Buy surplus credits",
        text: "She uses the legal market to purchase unused allowance from low emitters, paying to keep driving so her patient visits never stop.",
        frameworkWeights: { "utilitarianism": 85, "pragmatist-ethics": 70, "justice-ethics": 50 },
      },
      {
        id: "refuse-tracking",
        label: "Refuse the tracking",
        text: "She rejects the surveillance app as an intrusion on freedom, disables it, and joins others openly resisting the scheme.",
        frameworkWeights: { "rights-based-ethics": 85, "autonomy": 80, "deontology": 55 },
      },
      {
        id: "organize-reform",
        label: "Organize for reform",
        text: "She complies for now but petitions and builds a coalition to win carbon exemptions for care and essential workers.",
        frameworkWeights: { "discourse-ethics": 80, "capabilities-approach": 70, "ethics-of-care": 65 },
      },
    ],
    tags: ["climate policy", "surveillance", "rationing", "essential work"],
    relatedFrameworks: ["social-contract-theory", "environmental-ethics", "utilitarianism", "rights-based-ethics", "autonomy", "ethics-of-care"],
    relatedTechnologies: ["carbon tracking app", "emissions trading platform", "smart metering", "geolocation logging"],
    aiScoringPrompt: "Identify which ethical frameworks the learner's reasoning most emphasizes and the specific tradeoff they accept. Look for signals: appeals to shared rules and fair burden-sharing point to social-contract-theory; weighing aggregate climate and patient welfare points to utilitarianism or consequentialism; treating the tracking app as a violation of freedom or privacy points to rights-based-ethics, autonomy, or deontology; centering the vulnerable patients and relationships of dependency points to ethics-of-care or the capabilities-approach; emphasizing collective deliberation and changing the rules points to discourse-ethics. Describe what the learner prioritizes and what they are willing to sacrifice (e.g., personal liberty for collective good, or rule-compliance for patient care). Remain descriptive and non-judgmental; do not rate the learner's character or label any choice as correct.",
    reflectionPrompt: "Whichever path you chose, someone bears the cost — a patient, your own freedom, your principles, or the wider effort to cut emissions. Who pays for your decision, and would you be able to say that to their face?",
    visibilityStatus: 'published',
    isoWeek: "2026-W29",
    imageUrl: "/images/dilemmas/personal-carbon-allowance.png",
    imageHint: "rural nurse driving",
    imageAlt: "A nurse in a small car on an empty country road at dawn, glancing at a phone mounted on the dashboard showing a dwindling gauge.",
    publishDate: "2026-07-13T09:00:00.000Z",
  },
  {
    id: "dilemma-de-extinction-release",
    title: "The Aurochs at Dawn on Białowieża",
    slug: "de-extinction-release",
    shortSetup: "A lead ecologist must decide whether to release a herd of engineered aurochs into a forest that has lived without them for four thousand years.",
    backgroundContext: "Dr. Iwona Marek stands at the edge of the Białowieża Forest, tranquilizer charts in hand, twelve engineered aurochs pacing in the holding pen behind her. Reconstructed from ancient DNA, they are the closest thing to the wild cattle that shaped Europe's woodlands until 1627. Her models say their grazing could reopen the canopy, revive vanishing meadow species, and buffer the forest against drought. But the aurochs are not the originals: gaps in the genome were filled with modern cattle, and no one alive has seen how they behave. Local herders fear gored livestock and trampled crops. Conservation purists call them fabrications that will displace the deer and bison already clinging on. The genome team insists release is the only real test. Funding ends Friday; the pen cannot hold them through winter.",
    mainEthicalQuestion: "Should an engineered, de-extincted keystone species be released into an ecosystem it has not inhabited for millennia?",
    choices: [
      {
        id: "release-now-for-ecosystem",
        label: "Release the herd",
        text: "Release all twelve aurochs into the forest, trusting the models that predict broad ecological recovery for the whole system.",
        frameworkWeights: { "consequentialism": 88, "environmental-ethics": 80, "utilitarianism": 72 },
      },
      {
        id: "staged-fenced-trial",
        label: "Staged fenced trial",
        text: "Release only into a large fenced study zone first, gathering evidence and adjusting before any decision about the open forest.",
        frameworkWeights: { "pragmatist-ethics": 85, "virtue-ethics": 60, "justice-ethics": 52 },
      },
      {
        id: "defer-to-affected-communities",
        label: "Let stakeholders decide",
        text: "Halt the release and convene the herders, foresters, and Indigenous custodians to reach a binding shared decision together.",
        frameworkWeights: { "discourse-ethics": 86, "social-contract-theory": 66, "ubuntu-ethics": 58 },
      },
      {
        id: "refuse-release",
        label: "Refuse the release",
        text: "Decline to introduce a human-engineered organism, protecting the forest's existing inhabitants and the integrity of what remains wild.",
        frameworkWeights: { "deontology": 78, "natural-law": 70, "ethics-of-care": 55 },
      },
    ],
    tags: ["de-extinction", "rewilding", "biotechnology", "conservation"],
    relatedFrameworks: ["consequentialism", "environmental-ethics", "pragmatist-ethics", "discourse-ethics", "deontology", "natural-law"],
    relatedTechnologies: ["CRISPR gene editing", "ancient DNA sequencing", "selective back-breeding", "ecological niche modeling"],
    aiScoringPrompt: "Identify which ethical frameworks the learner's reasoning emphasizes and the specific tradeoff they accept, without judging their character or the wisdom of their choice. Notice whether they weigh aggregate ecological outcomes (consequentialism, utilitarianism, environmental-ethics), insist on iterative evidence and workable process (pragmatist-ethics), prioritize legitimate shared deliberation among affected people (discourse-ethics, social-contract-theory, ubuntu-ethics), or invoke duties and limits on engineering nature (deontology, natural-law, ethics-of-care). Name the value they elevated and the value they were willing to subordinate, and reflect their reasoning back descriptively.",
    reflectionPrompt: "Whatever you chose, something was put at risk to honor it: a vanishing meadow, a herder's livelihood, the forest's existing animals, or the chance to ever know. Which of these were you willing to gamble, and could you say that to their face?",
    visibilityStatus: 'published',
    isoWeek: "2026-W30",
    imageUrl: "/images/dilemmas/de-extinction-release.png",
    imageHint: "aurochs forest dawn",
    imageAlt: "A small herd of large dark wild cattle standing at the misty edge of an ancient deciduous forest at dawn, a wooden holding pen visible behind them.",
    publishDate: "2026-07-20T09:00:00.000Z",
  },
  {
    id: "dilemma-therapeutic-memory-dampening",
    title: "The Drug That Softens What She Remembers",
    slug: "therapeutic-memory-dampening",
    shortSetup: "An ER physician must decide whether to offer a recent assault survivor a drug that can blunt the emotional charge of the memory before it sets.",
    backgroundContext: "Dr. Lena Okafor works overnight in a trauma bay where a sexual assault survivor, brought in two hours ago, sits trembling on a gurney. A protocol on Lena's tablet offers propranolol, a beta-blocker shown to dull the emotional intensity of a memory if given before it consolidates, used off-label for survivors and first responders. The survivor is lucid but barely holding together and asks, \"Can you make it stop feeling like this?\" Lena knows the drug could spare her months of intrusive flashbacks and lower her odds of lifelong PTSD. She also knows a softened memory may falter as courtroom testimony, that consent given in acute shock is fragile, and that the searing clarity of this pain may be part of how this woman comes to make sense of what was done to her. The window is closing within hours.",
    mainEthicalQuestion: "Should a clinician offer a survivor a drug that blunts the emotional force of a traumatic memory while it is still forming?",
    choices: [
      {
        id: "administer-to-prevent-suffering",
        label: "Offer it now",
        text: "Lena presents the drug and administers it, prioritizing the prevention of lasting psychological suffering and reduced PTSD risk.",
        frameworkWeights: { "utilitarianism": 88, "ethics-of-care": 72, "consequentialism": 68 },
      },
      {
        id: "defer-to-her-choice",
        label: "Let her decide",
        text: "Lena lays out benefits and unknowns plainly and leaves the decision entirely to the survivor, treating it as her sovereign choice over her own mind.",
        frameworkWeights: { "autonomy": 90, "rights-based-ethics": 66, "discourse-ethics": 48 },
      },
      {
        id: "decline-preserve-memory",
        label: "Withhold the drug",
        text: "Lena declines to alter a forming memory, holding that the painful experience is integral to who the survivor is and how she will author her own recovery.",
        frameworkWeights: { "existentialist-ethics": 80, "virtue-ethics": 62, "natural-law": 55 },
      },
      {
        id: "protect-testimony-and-justice",
        label: "Safeguard the record",
        text: "Lena holds off so the survivor's unaltered account stays available as evidence, protecting her standing to seek accountability and the public stake in prosecuting assault.",
        frameworkWeights: { "justice-ethics": 84, "social-contract-theory": 60, "deontology": 50 },
      },
    ],
    tags: ["memory", "trauma", "consent", "neuroethics"],
    relatedFrameworks: ["utilitarianism", "autonomy", "existentialist-ethics", "justice-ethics", "ethics-of-care", "virtue-ethics"],
    relatedTechnologies: ["propranolol memory dampening", "beta-blockers", "memory reconsolidation therapy", "psychopharmacology"],
    aiScoringPrompt: "Identify which ethical frameworks the learner's reasoning emphasizes and the specific tradeoff they accept, descriptively and without judging their character. Notice whether they weigh aggregate suffering and PTSD outcomes (utilitarian/consequentialist), the survivor's sovereign authority over her own mind under acute stress (autonomy, rights-based), the role of unaltered memory in identity and self-authorship (existentialist, virtue), or the survivor's and society's stake in accountability and reliable testimony (justice, social-contract). Name what their chosen path gives up: e.g., trading possible relief for evidentiary integrity, or honoring autonomy at the risk of a decision made in shock. Mirror their stated reasons back; do not rank the choices or imply a correct answer.",
    reflectionPrompt: "Whatever you chose to protect, something else was set aside. If this survivor returns in a year either still flinching at every memory, or unable to fully recount what happened when she wanted to be heard, could you stand behind the reason you decided for her tonight?",
    visibilityStatus: 'published',
    isoWeek: "2026-W31",
    imageUrl: "/images/dilemmas/therapeutic-memory-dampening.png",
    imageHint: "dim trauma bay",
    imageAlt: "A physician in scrubs stands beside a gurney in a dimly lit emergency room at night, holding a small medication vial, a distressed patient seated with a blanket around their shoulders nearby.",
    publishDate: "2026-07-27T09:00:00.000Z",
  },
  {
    id: "dilemma-ai-sentencing-risk-score",
    title: "The Number on the Bench",
    slug: "ai-sentencing-risk-score",
    shortSetup: "A judge must decide how much weight to give an AI risk score that recommends sentencing and bail using data tied to race and poverty.",
    backgroundContext: "Judge Marcus Adeyemi has a 22-year-old defendant before him on a second theft charge. On his screen, the county's new RiskGuide tool returns a \"high risk\" score recommending a longer sentence and denial of bail. The validation study is real: RiskGuide predicts reoffending more accurately than judges acting alone, and proponents argue it has shrunk the gut-feeling disparities that plagued his courtroom for decades. But its inputs — prior arrests, ZIP code, employment, family record — track race and poverty so closely that a vendor audit shows Black defendants flagged \"high\" at nearly twice the rate of white defendants with similar histories. The young man is the same age as Adeyemi's own son. The score is one click away from becoming his decision. The docket behind him holds forty more cases today.",
    mainEthicalQuestion: "How much weight should a judge give an AI risk score whose accuracy is real but whose inputs correlate with race and poverty?",
    choices: [
      {
        id: "follow-score",
        label: "Follow the score",
        text: "Defer to RiskGuide's recommendation, trusting that its measured accuracy and consistency serve public safety and reduce arbitrary human bias.",
        frameworkWeights: { "consequentialism": 80, "utilitarianism": 70, "social-contract-theory": 55 },
      },
      {
        id: "override-protect",
        label: "Override the score",
        text: "Disregard the recommendation and sentence on the individual facts, refusing to let a metric built on race- and poverty-linked data raise this person's punishment.",
        frameworkWeights: { "rights-based-ethics": 85, "justice-ethics": 75, "deontology": 60 },
      },
      {
        id: "advisory-disclose",
        label: "Use it openly, on the record",
        text: "Treat the score as one advisory input, disclose it in open court, and let the defense contest the inputs before any weight is assigned.",
        frameworkWeights: { "discourse-ethics": 80, "contractualism": 65, "autonomy": 50 },
      },
      {
        id: "refuse-pending-audit",
        label: "Refuse it until fixed",
        text: "Decline to use RiskGuide at all and petition to suspend it court-wide until the disparity is corrected and the most vulnerable defendants are protected.",
        frameworkWeights: { "capabilities-approach": 75, "ethics-of-care": 65, "virtue-ethics": 55 },
      },
    ],
    tags: ["AI", "criminal justice", "algorithmic bias", "fairness"],
    relatedFrameworks: ["consequentialism", "rights-based-ethics", "justice-ethics", "discourse-ethics", "capabilities-approach", "ethics-of-care"],
    relatedTechnologies: ["Recidivism risk assessment algorithms", "Predictive analytics", "Machine learning classifiers"],
    aiScoringPrompt: "Analyze the learner's reasoning about how much weight a judge should give a biased-but-accurate AI risk score. Identify which ethical frameworks their thinking emphasizes — for example, consequentialist or utilitarian appeals to aggregate accuracy and public safety, rights-based or deontological refusal to let group-correlated data shape an individual's punishment, justice-focused concern with disparate impact, discourse or contractualist emphasis on transparency and contestability, or capabilities and care concern for the most vulnerable defendants. Name the specific tradeoff they accept (e.g., predictive accuracy versus individual fairness, efficiency versus due process). Describe the reasoning pattern as a learning signal; do not evaluate or judge the learner's character.",
    reflectionPrompt: "Whichever way you leaned, someone bears the cost: either a defendant whose punishment was shaped by his ZIP code, or a future victim of someone the data flagged and you released. Which of those costs are you more willing to carry, and why that one?",
    visibilityStatus: 'published',
    isoWeek: "2026-W32",
    imageUrl: "/images/dilemmas/ai-sentencing-risk-score.png",
    imageHint: "courtroom screen",
    imageAlt: "A judge at the bench studying a glowing risk-score gauge on a monitor while a young defendant waits below.",
    publishDate: "2026-08-03T09:00:00.000Z",
  },
  {
    id: "dilemma-biometric-aid-registry",
    title: "The Iris Gate at Camp Lur…",
    slug: "biometric-aid-registry",
    shortSetup: "A humanitarian director must decide whether to gate food and medical aid behind a mandatory iris-scan registry of stateless refugees.",
    backgroundContext: "Naomi Adeyemi runs aid logistics at a camp of 80,000 stateless refugees. Donors, stung by an audit showing ration cards sold and double-claimed, will only keep funding the pipeline if every recipient enrolls in an iris-scan registry — one scan, no card to lose, no fraud. Naomi has watched diverted food leave children hungry, and biometrics could feed thousands more from the same budget. But the people in her queue have no state, no passport, and no power to refuse: enroll or go without. Their irises would sit in a database she cannot guarantee will never be shared with the governments they fled, sold in a breach, or repurposed years from now. Refusing donors' terms may collapse the whole operation. Accepting them brands the powerless permanently, in the name of feeding them.",
    mainEthicalQuestion: "Should life-sustaining aid be made conditional on enrollment in a permanent biometric registry of people who cannot meaningfully decline?",
    choices: [
      {
        id: "mandate-full-registry",
        label: "Mandate the registry",
        text: "Naomi requires iris enrollment for all aid, accepting permanent biometric records as the price of feeding far more people without fraud.",
        frameworkWeights: { "utilitarianism": 88, "consequentialism": 82, "pragmatist-ethics": 63 },
      },
      {
        id: "refuse-coerced-biometrics",
        label: "Refuse coerced scans",
        text: "Naomi rejects the mandate as a violation of stateless people's bodily and informational rights, distributing aid by other means even at reduced scale.",
        frameworkWeights: { "rights-based-ethics": 90, "deontology": 80, "autonomy": 72 },
      },
      {
        id: "opt-in-with-alternatives",
        label: "Offer a real opt-out",
        text: "Naomi makes scanning genuinely voluntary, building a parallel non-biometric channel so no one is denied food for declining, even though fraud and costs rise.",
        frameworkWeights: { "ethics-of-care": 78, "capabilities-approach": 74, "justice-ethics": 60 },
      },
      {
        id: "refugee-governed-data-trust",
        label: "Let residents govern it",
        text: "Naomi conditions any registry on a refugee-led data trust that sets retention limits and a binding veto on sharing, negotiated openly with camp representatives.",
        frameworkWeights: { "discourse-ethics": 80, "social-contract-theory": 70, "ubuntu-ethics": 58 },
      },
    ],
    tags: ["biometrics", "humanitarian-aid", "privacy", "statelessness"],
    relatedFrameworks: ["utilitarianism", "rights-based-ethics", "ethics-of-care", "discourse-ethics", "capabilities-approach", "autonomy"],
    relatedTechnologies: ["iris recognition biometrics", "centralized identity registry", "blockchain data trust", "ration distribution systems"],
    aiScoringPrompt: "Identify which ethical frameworks the learner's reasoning emphasizes and the specific tradeoff they accept — without judging their character or implying a correct answer. Note whether they weigh aggregate welfare and fraud reduction (utilitarian/consequentialist), inviolable rights and the impossibility of free consent under coercion (rights-based, deontology, autonomy), attentiveness to the most vulnerable and their real capabilities (ethics of care, capabilities approach), or legitimacy through the affected people's own voice and governance (discourse ethics, social contract, ubuntu). Name what each emphasis costs in their chosen path: more people fed versus a permanent record imposed on the powerless, principled refusal versus reduced reach, an opt-out's added fraud and expense, or the delay and fragility of negotiated data governance. Reflect their reasoning back descriptively.",
    reflectionPrompt: "If your choice meant either a hungry child you could have fed, or a biometric record that follows a stateless person for life and you cannot promise will stay safe — which of those costs are you willing to carry, and whose burden is it really?",
    visibilityStatus: 'published',
    isoWeek: "2026-W33",
    imageUrl: "/images/dilemmas/biometric-aid-registry.png",
    imageHint: "iris scan queue",
    imageAlt: "A person at a desert refugee camp leans toward a handheld iris scanner held by an aid worker, a long line of waiting families stretching behind them under harsh sunlight.",
    publishDate: "2026-08-10T09:00:00.000Z",
  },
];
