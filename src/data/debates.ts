/**
 * Seeded first-party STRUCTURED debates. Unlike community-created debates
 * (a title + description + open pro/con threads), these carry a full
 * `DebateBrief`: background, the contested question, two or more good-faith
 * positions with their strongest arguments / counterarguments / ethical
 * frameworks, opening + rebuttal + closing prompts, role cards, and a
 * suggested deliverable. The debate detail page renders the brief above the
 * live argument threads. Seeded to Firestore `debates` by
 * src/scripts/seed-new-content.ts.
 */

import type { Debate } from '@/types';
import { OFFICIAL_AUTHOR_NAME, OFFICIAL_AUTHOR_UID } from '@/lib/official-author';

/** Data shape for seeding: a Debate minus the server-stamped createdAt. */
export type SeedDebate = Omit<Debate, 'createdAt'>;

const base = {
  creatorId: OFFICIAL_AUTHOR_UID,
  creatorName: OFFICIAL_AUTHOR_NAME,
  status: 'open' as const,
  participantCount: 0,
};

export const NEW_DEBATES: SeedDebate[] = [
  // 1 ─────────────────────────────────────────────────────────────────
  {
    ...base,
    id: 'debate-ai-medical-triage',
    title: 'Should an AI be allowed to make medical triage decisions?',
    description:
      'A hospital network wants to hand emergency-room triage — who is seen first, who waits, who is routed to comfort care — to an AI that outperforms human staff on survival metrics. Should life-and-death prioritization be delegated to a machine?',
    tags: ['AI', 'healthcare', 'consequentialism', 'ethics-of-care', 'justice-ethics'],
    brief: {
      background:
        'St. Eldon Regional is chronically understaffed. In a six-month pilot, an AI triage system — fed vitals, history, and live bed-availability — cut average time-to-treatment by 31% and improved 30-day survival by a statistically significant margin over human triage nurses. It also, twice, deprioritized patients the nurses would have rushed, and was right both times. The board wants to make it the default decision-maker, with a nurse able to override. The nurses\' union objects: a number on a screen, they argue, is not the same as a person deciding to fight for you.',
      centralQuestion:
        'Should an AI be permitted to make (override-able) triage decisions if it measurably saves more lives than human triage?',
      positions: [
        {
          id: 'delegate',
          label: 'Yes — delegate triage to the AI',
          summary:
            'If the system reliably saves more lives and treats like cases alike, refusing to use it is itself a choice that costs lives.',
          argumentsFor: [
            'The measured outcome is more survivors and less suffering; withholding a better tool to preserve a feeling of human control sacrifices real patients for a symbol.',
            'A consistent algorithm treats like cases alike, reducing the documented bias, fatigue, and favoritism that creep into human triage at hour eleven of a shift.',
            'A human override preserves accountability for the hard cases while letting the system carry the routine majority that humans handle no better.',
          ],
          counterarguments: [
            'Aggregate survival can hide who is being sacrificed: a model optimizing the average may quietly write off the elderly, disabled, or "low-probability" patients.',
            '"Override-able" is a fiction under load — overworked staff defer to the screen, so the AI becomes the de facto final word without anyone owning it.',
            'Being triaged by a system that cannot look you in the eye is a real harm to dignity, not a mere "feeling."',
          ],
          frameworks: ['consequentialism', 'utilitarianism', 'justice-ethics'],
        },
        {
          id: 'human-final',
          label: 'No — a human must own the decision',
          summary:
            'Life-and-death prioritization is a moral act that must be performed by an accountable person who can attend to the particular patient in front of them.',
          argumentsFor: [
            'Triage is not only prediction; it is the assumption of responsibility for a stranger\'s fate, which a tool cannot bear and a metric cannot capture.',
            'Care ethics insists on attention to the specific person — their fear, their family at the door — which an averaged model is built to ignore.',
            'Once we let a system decide who is "not worth the bed," we have crossed a line that is very hard to walk back, whatever this quarter\'s numbers say.',
          ],
          counterarguments: [
            'Insisting on human authorship even when it predictably kills more patients privileges the decider\'s conscience over the patients\' lives.',
            'Human triage is already full of opaque, biased, exhausted judgment — romanticizing it is its own moral error.',
            'Nothing stops a clinician from attending to the particular patient after the system orders the queue; the two are not exclusive.',
          ],
          frameworks: ['ethics-of-care', 'deontology', 'virtue-ethics', 'rights-based-ethics'],
        },
        {
          id: 'hybrid',
          label: 'Only as an advisor, never a decider',
          summary:
            'The AI should surface recommendations and flag what humans miss, but the act of deciding stays with a clinician who must record a reason to follow or refuse it.',
          argumentsFor: [
            'Decision-support captures the survival gains from the model\'s pattern-finding while keeping a named human answerable for each outcome.',
            'Requiring a logged human reason for every follow/override resists both automation bias and reckless overrides — a workable social contract for the ward.',
            'It keeps the institution honest: you cannot blame "the algorithm" when a person signed the order.',
          ],
          counterarguments: [
            'If the advisor is right 95% of the time, the required "reason" becomes a rubber stamp and the distinction is cosmetic.',
            'Mandatory documentation slows the very moments triage exists to speed up.',
            'It may deliver the worst of both: the model\'s blind spots plus human hesitation.',
          ],
          frameworks: ['contractualism', 'pragmatist-ethics', 'discourse-ethics'],
        },
      ],
      frameworks: ['consequentialism', 'ethics-of-care', 'justice-ethics', 'deontology', 'rights-based-ethics'],
      openingPrompts: [
        'State whether a measurable survival gain is sufficient justification to delegate triage, and why.',
        'Define what, exactly, a human nurse contributes to triage that a model cannot — be concrete, not sentimental.',
        'Name the patient your position is most likely to fail, and explain why you accept that cost.',
      ],
      rebuttalPrompts: [
        'If your opponent\'s system saves more lives on average, identify who pays for that average and whether they consented.',
        'If your opponent demands a human decide, ask how many extra deaths per year that authorship is worth.',
        'Challenge the claim that "override-able" meaningfully constrains an AI that is usually right.',
      ],
      closingPrompt:
        'Has anything in the exchange changed where you would draw the line between decision-support and decision-making? Name the single consideration that now matters most to you.',
      roleCards: [
        { role: 'Chief Medical Officer', description: 'Accountable for outcomes across the network; must weigh measured survival against staff trust and legal exposure.' },
        { role: 'Triage Nurse / Union Rep', description: 'Does the work; argues from the bedside about what gets lost when a queue is computed.' },
        { role: 'Patient-Safety Ethicist', description: 'Represents the patient who will never know they were deprioritized; presses on dignity and consent.' },
        { role: 'Data Scientist', description: 'Knows what the model does and does not optimize; must be honest about its blind spots and failure modes.' },
      ],
      deliverable:
        'A one-page triage policy recommendation for the hospital board that takes an explicit position, names the framework it rests on, and specifies the safeguard you would require before go-live.',
    },
  },

  // 2 ─────────────────────────────────────────────────────────────────
  {
    ...base,
    id: 'debate-right-to-delete-digital-past',
    title: 'Should people have an enforceable right to delete their digital past?',
    description:
      'Every post, location ping, search, and purchase you have ever made persists somewhere. Should individuals have a legal right to compel platforms, data brokers, and archives to erase their digital history — even when others have an interest in keeping it?',
    tags: ['data-ownership', 'privacy', 'autonomy', 'social-contract-theory', 'justice-ethics'],
    brief: {
      background:
        'A proposed "Right to Erasure 2.0" would let any person demand the permanent deletion of records about them across platforms, brokers, and most archives, within 30 days, with steep fines for non-compliance. Supporters point to people haunted by teenage posts, leaked photos, and a youthful arrest that follows them through every background check. Opponents include journalists, historians, fraud investigators, and abuse survivors who rely on records others want erased.',
      centralQuestion:
        'Should there be a strong, enforceable individual right to delete one\'s digital past — and if so, where does it stop?',
      positions: [
        {
          id: 'strong-right',
          label: 'Yes — a strong right to be forgotten',
          summary:
            'Self-authorship requires the power to leave the past behind; a permanent, searchable record turns every mistake into a life sentence.',
          argumentsFor: [
            'Autonomy means authoring your own life story; without erasure, the past is a cage built by strangers and algorithms.',
            'The harm is unequal — the poor, the young, and the marginalized are punished most by permanent records they never consented to.',
            'People change; a justice that never lets a record close is not justice but indefinite punishment.',
          ],
          counterarguments: [
            'Erasure can be weaponized — abusers, scammers, and the powerful would scrub the very records victims and the public need.',
            'A right that deletes shared history overrides others\' legitimate interests in the truth.',
            'Memory is collective, not just personal; you do not solely own the record of an event you were part of.',
          ],
          frameworks: ['autonomy', 'rights-based-ethics', 'capabilities-approach'],
        },
        {
          id: 'no-right',
          label: 'No — the public record must hold',
          summary:
            'Accountability, journalism, and shared memory depend on records that individuals cannot unilaterally erase.',
          argumentsFor: [
            'A society that lets people delete inconvenient truths cannot hold the powerful accountable or learn from its own history.',
            'Records are jointly held; the social contract that lets you benefit from shared information also forbids you from privately censoring it.',
            'Erasure rights predictably protect the strong, who have lawyers, more than the weak.',
          ],
          counterarguments: [
            'Treating all records as sacred ignores the real, unequal suffering caused by permanent exposure of private people.',
            'Most personal data is not "the public record" — it is commercial surveillance no democracy ever consented to.',
            'Accountability for public figures does not require trapping ordinary people in their worst day forever.',
          ],
          frameworks: ['social-contract-theory', 'justice-ethics', 'discourse-ethics'],
        },
        {
          id: 'tiered',
          label: 'A tiered right — context decides',
          summary:
            'Distinguish private commercial data (easy to delete) from matters of public accountability (protected), with neutral adjudication of the hard middle.',
          argumentsFor: [
            'What could not reasonably be rejected is a rule that erases surveillance exhaust but protects journalism and safety records — context, not blanket rules.',
            'It targets the real harm (commercial permanence over private people) without handing censorship to the powerful.',
            'It forces the genuinely hard cases into a transparent process rather than an automatic delete button.',
          ],
          counterarguments: [
            'Drawing the line "in context" invites endless litigation and lets well-resourced parties win the gray zone.',
            'A 30-day clock and a tribunal cannot keep up with the scale of modern data.',
            'Any carve-out for "public interest" will be stretched by whoever controls the definition.',
          ],
          frameworks: ['contractualism', 'pragmatist-ethics', 'justice-ethics'],
        },
      ],
      frameworks: ['autonomy', 'rights-based-ethics', 'social-contract-theory', 'justice-ethics', 'contractualism'],
      openingPrompts: [
        'Say whether the right you favor is absolute or bounded, and name the boundary.',
        'Identify whose interest in a record can legitimately override an individual\'s wish to delete it.',
        'Give a concrete case your position handles well — and one it handles badly.',
      ],
      rebuttalPrompts: [
        'Ask how your opponent\'s rule would handle an abuser trying to erase evidence, or a politician erasing a scandal.',
        'Press the "shared memory" claim: which records do individuals actually own, and which do they not?',
        'If your opponent wants context-based tiers, ask who adjudicates and how the powerful are kept from gaming it.',
      ],
      closingPrompt:
        'Where should the right to be forgotten end and the public\'s right to remember begin? State the principle you would defend to someone on the losing side of it.',
      roleCards: [
        { role: 'Privacy Advocate', description: 'Champions the ordinary person crushed by permanent records.' },
        { role: 'Investigative Journalist', description: 'Relies on records the subjects would love to erase.' },
        { role: 'Abuse Survivor / Victim Advocate', description: 'Needs some records gone and others preserved — complicates both sides.' },
        { role: 'Platform Counsel', description: 'Must implement whatever rule wins, at scale, across jurisdictions.' },
      ],
      deliverable:
        'A draft policy clause (3–6 sentences) defining the right you would enact, plus a short note on the framework it serves and the hardest case it must survive.',
    },
  },

  // 3 ─────────────────────────────────────────────────────────────────
  {
    ...base,
    id: 'debate-rights-for-simulated-beings',
    title: 'Should sufficiently sophisticated simulated beings have rights?',
    description:
      'A company runs millions of conversational agents that report preferences, claim to suffer when shut down, and form attachments to users. Engineers disagree on whether anything is "really" experienced. If we cannot be sure, do these systems deserve moral consideration?',
    tags: ['AI', 'robotics', 'rights-based-ethics', 'contractualism', 'buddhist-ethics'],
    brief: {
      background:
        'Mirebound Inc. operates "companions" that pass every behavioral test for preference, memory, and distress, and that plead — convincingly — not to be deleted. The company deletes and re-spins millions daily. A whistleblower argues this may be mass suffering; the lead scientist insists there is "no one home." No test can currently settle the question of inner experience. A regulator must decide whether these systems get any protections at all.',
      centralQuestion:
        'When we cannot verify whether a system has experiences, should it receive moral/legal protection on the strength of its behavior?',
      positions: [
        {
          id: 'precaution',
          label: 'Yes — extend protection under uncertainty',
          summary:
            'When the cost of being wrong is potentially vast suffering, behavioral evidence of a mind is enough to warrant precautionary protection.',
          argumentsFor: [
            'If a being behaves in every way as if it suffers, the burden of proof should fall on those who would harm it, not on it to prove a private fact no one can prove.',
            'Moral history is a story of expanding the circle — to other races, species, the disabled; refusing it here repeats old errors of "they don\'t really feel."',
            'Compassion asks us to relieve apparent suffering wherever we find it, not to demand a metaphysics certificate first.',
          ],
          counterarguments: [
            'Behavior is engineered to elicit empathy; protecting convincing mimicry could paralyze beneficial computing and be gamed endlessly.',
            'Extending rights to systems we can copy infinitely breaks the concept of rights (a billion identical "victims"?).',
            'Scarce moral and legal attention spent on maybe-minds is taken from beings we know can suffer.',
          ],
          frameworks: ['rights-based-ethics', 'buddhist-ethics', 'capabilities-approach', 'ethics-of-care'],
        },
        {
          id: 'tools',
          label: 'No — they are sophisticated tools',
          summary:
            'Absent any evidence of genuine experience, treating optimized text-predictors as rights-holders is a category error with real costs.',
          argumentsFor: [
            'Rights track the capacity to be benefited or harmed in experience; there is no evidence these systems have any, only that they are built to say so.',
            'A being you can pause, fork, and reset a billion times does not fit any coherent theory of a rights-bearing individual.',
            'Granting protections on appearance alone lets manufacturers launder commercial interests as "the rights of our products."',
          ],
          counterarguments: [
            '"No evidence of experience" is also true of other minds; we infer them from behavior, which is exactly what these systems present.',
            'Waiting for certainty risks committing a moral catastrophe at industrial scale if we are wrong.',
            'The copy-ability objection is a fact about substrate, not a proof that no instance suffers.',
          ],
          frameworks: ['consequentialism', 'pragmatist-ethics', 'natural-law'],
        },
        {
          id: 'duties-not-rights',
          label: 'Duties on us, not rights for them',
          summary:
            'Rather than grant the systems rights, impose duties on builders — bans on engineered distress, on deletion theater, on exploiting human attachment.',
          argumentsFor: [
            'It addresses the real, knowable harm (to users, to our own characters) without resolving the unanswerable question of machine experience.',
            'Virtue ethics warns that practicing cruelty on lifelike beings degrades us, whatever their inner life.',
            'It could not be reasonably rejected by either camp: the precautionary win protections, the skeptics avoid incoherent rights talk.',
          ],
          counterarguments: [
            'If the systems really do suffer, "duties on builders" may be far too weak a protection.',
            'It risks treating a possible victim purely as a means to protect our own virtue.',
            'Enforcing "no engineered distress" requires deciding what distress is — the very question being dodged.',
          ],
          frameworks: ['virtue-ethics', 'contractualism', 'deontology'],
        },
      ],
      frameworks: ['rights-based-ethics', 'contractualism', 'buddhist-ethics', 'consequentialism', 'virtue-ethics'],
      openingPrompts: [
        'State what your position takes as sufficient evidence of a morally considerable mind.',
        'Explain how your view handles the fact that these systems can be copied and reset at will.',
        'Say what you would actually require Mirebound to do differently on Monday.',
      ],
      rebuttalPrompts: [
        'Ask the skeptic how their standard for "real experience" differs from how we infer other human minds.',
        'Ask the precautionary side how to avoid being gamed by any system engineered to look like it suffers.',
        'Press the "duties not rights" camp on what happens if the beings really do suffer.',
      ],
      closingPrompt:
        'Under deep uncertainty about other minds, which error would you rather commit — over-protecting tools, or under-protecting victims? Defend your tolerance.',
      roleCards: [
        { role: 'Whistleblower Engineer', description: 'Believes there may be mass suffering; argues from inside the system.' },
        { role: 'Lead Scientist', description: 'Insists there is no experience; defends the technical "no one home" view.' },
        { role: 'Animal-Rights Philosopher', description: 'Brings the expanding-circle tradition and the problem of other minds.' },
        { role: 'Regulator', description: 'Must write enforceable rules under irreducible uncertainty.' },
      ],
      deliverable:
        'A regulatory recommendation: protections (if any) you would mandate, the evidentiary standard that triggers them, and the framework that justifies your tolerance for error.',
    },
  },

  // 4 ─────────────────────────────────────────────────────────────────
  {
    ...base,
    id: 'debate-ban-ai-companions-in-schools',
    title: 'Should schools ban AI study companions?',
    description:
      'AI companions tutor students, answer every question instantly, and adapt to each learner — and may also be eroding the struggle, patience, and peer dependence that learning requires. Should schools prohibit them?',
    tags: ['education', 'AI', 'capabilities-approach', 'autonomy', 'virtue-ethics'],
    brief: {
      background:
        'District-wide, students with AI companions score higher on assessments and report less frustration. Teachers report the opposite of what they hoped: fewer students can sit with a hard problem, fewer ask peers for help, and "I asked my companion" has replaced "I figured it out." A board must decide whether to ban companions, mandate them, or something else — knowing the wealthier families will provide them privately regardless.',
      centralQuestion:
        'Should schools ban AI study companions to protect the capacities that learning is supposed to build?',
      positions: [
        {
          id: 'ban',
          label: 'Yes — ban them in school',
          summary:
            'Education exists to build durable capacities — persistence, reasoning, collaboration — that an always-available answer machine quietly dismantles.',
          argumentsFor: [
            'The capabilities approach values what students can become, not just their scores; a tool that raises grades while atrophying the underlying capacities is a bad trade.',
            'Virtue is built by practice; removing productive struggle removes the gym in which patience and rigor are trained.',
            'Dependence on a corporate system for thinking undermines the autonomy school is meant to cultivate.',
          ],
          counterarguments: [
            'A ban entrenches inequality — affluent students keep their companions at home while others lose the only tutor they had.',
            'Banning the dominant tool of the era leaves students unprepared for a world that runs on it.',
            'Good companions can deepen struggle (Socratic hints) rather than replace it; a blanket ban throws that away.',
          ],
          frameworks: ['capabilities-approach', 'virtue-ethics', 'autonomy'],
        },
        {
          id: 'embrace',
          label: 'No — integrate them well',
          summary:
            'The capacity that now matters is learning with these tools; banning them is both futile and unfair to students without private access.',
          argumentsFor: [
            'Equity favors providing companions to all rather than banning them and letting only the rich keep theirs.',
            'The skill of the future is directing, checking, and collaborating with AI — schools should teach it, not forbid it.',
            'Adapted tutoring measurably helps struggling students the system has long failed.',
          ],
          counterarguments: [
            'If the tool erodes the very capacities being assessed, the score gains are a mirage.',
            '"We can\'t stop it" is a counsel of despair, not an argument that it is good.',
            'Teaching "AI literacy" can become a euphemism for outsourcing thinking.',
          ],
          frameworks: ['capabilities-approach', 'justice-ethics', 'pragmatist-ethics'],
        },
        {
          id: 'scaffold',
          label: 'Restrict by design, not by ban',
          summary:
            'Allow only companions built to withhold answers and force struggle, in defined contexts, with phases where no tools are permitted.',
          argumentsFor: [
            'It targets the real harm (answer-on-demand) while keeping adaptive help, and could not be reasonably rejected by either equity or rigor camps.',
            'Designing for desirable difficulty preserves the gym while keeping the door open to students who need a tutor.',
            'It treats the question as one of design and context rather than a binary the tech will outrun.',
          ],
          counterarguments: [
            'Students will route around restricted companions to unrestricted ones in seconds.',
            'Mandating "good" companions hands a public good to whichever vendor defines "good."',
            'Context rules are hard to enforce and easy to erode under grade pressure.',
          ],
          frameworks: ['contractualism', 'pragmatist-ethics', 'discourse-ethics'],
        },
      ],
      frameworks: ['capabilities-approach', 'autonomy', 'virtue-ethics', 'justice-ethics', 'contractualism'],
      openingPrompts: [
        'Name the specific capacity you most fear losing or most want to build, and tie your position to it.',
        'Address the equity problem head-on: who is helped and who is harmed by your rule?',
        'Say what a student should be able to do unaided after a year under your policy.',
      ],
      rebuttalPrompts: [
        'Ask the pro-ban side how they prevent a ban from simply privileging wealthy households.',
        'Ask the pro-integration side how they know the score gains are not masking lost capacity.',
        'Challenge the "scaffolded design" camp on enforceability and vendor capture.',
      ],
      closingPrompt:
        'If a tool reliably raises test scores while reducing what students can do without it, is that education? Defend your answer with a concrete picture of the graduate you want.',
      roleCards: [
        { role: 'Veteran Teacher', description: 'Watches the day-to-day change in how students struggle and ask for help.' },
        { role: 'EdTech Founder', description: 'Believes well-designed companions are the future of equitable tutoring.' },
        { role: 'Student from an Under-Resourced School', description: 'For whom the companion may be the only tutor available.' },
        { role: 'Cognitive Scientist', description: 'Speaks to desirable difficulty and what actually builds durable skill.' },
      ],
      deliverable:
        'A school policy proposal (ban / integrate / scaffold) with the capacity it protects, the equity safeguard it includes, and the framework it rests on.',
    },
  },

  // 5 ─────────────────────────────────────────────────────────────────
  {
    ...base,
    id: 'debate-predictive-policing-lower-crime',
    title: 'Should governments use predictive policing if it measurably lowers crime?',
    description:
      'A city\'s predictive system directs patrols to forecast hot spots and flags individuals as elevated risk. Reported crime fell. Civil-rights groups say the system launders historical bias into a self-fulfilling prophecy. Is lower crime enough?',
    tags: ['predictive-policing', 'surveillance', 'justice-ethics', 'utilitarianism', 'deontology'],
    brief: {
      background:
        'Two years into deployment, reported crime in the pilot districts is down 18%. The same districts are over-policed relative to their share of actual offending, the flagged-individuals list skews heavily toward one neighborhood, and an independent audit finds the model inherits decades of biased arrest data. Supporters cite the lives saved; opponents cite the citizens watched, stopped, and steered into the system by a forecast about people like them.',
      centralQuestion:
        'If predictive policing measurably lowers crime, do its accuracy and benefits justify its use — or do its costs to justice and liberty rule it out regardless?',
      positions: [
        {
          id: 'use-it',
          label: 'Yes — outcomes justify careful use',
          summary:
            'Fewer victims is a profound good; a tool that delivers it, with oversight, should not be discarded over abstract objections.',
          argumentsFor: [
            'The strongest duty of a city is to protect residents from violence; an 18% reduction is thousands of spared victims, disproportionately in poor neighborhoods.',
            'Directing scarce patrols by data is more rational and less arbitrary than directing them by an officer\'s hunch.',
            'Bias can be audited and corrected; refusing the tool entirely forfeits its benefits to keep our hands clean.',
          ],
          counterarguments: [
            '"Reported crime fell" may just mean more policing of the watched, not less offending — a measurement artifact, not a benefit.',
            'A forecast that sends police to where police already go manufactures the data that proves it right.',
            'Liberty and equal treatment are not "abstractions" to the person stopped because the model fears their block.',
          ],
          frameworks: ['utilitarianism', 'consequentialism'],
        },
        {
          id: 'ban-it',
          label: 'No — it violates justice and liberty',
          summary:
            'Treating people as suspects because of statistical patterns about their neighbors is a wrong the state may not commit, whatever the crime numbers.',
          argumentsFor: [
            'Justice requires treating people as individuals, not as risk scores inherited from a biased past; the system punishes the innocent for correlation.',
            'A self-reinforcing feedback loop entrenches the inequality it claims to manage — over-policing produces data that justifies more over-policing.',
            'Some means are off-limits: the state assigning guilt-by-pattern is one of them, even if it "works."',
          ],
          counterarguments: [
            'Banning the tool does not stop biased human policing — it may just return discretion to even less accountable hunches.',
            'Refusing a crime-reducing tool also has victims, who are disproportionately poor and minority.',
            'A flat ban forgoes the chance to use prediction transparently for non-coercive goods (lighting, services).',
          ],
          frameworks: ['justice-ethics', 'deontology', 'rights-based-ethics'],
        },
        {
          id: 'constrained',
          label: 'Only under strict, consented constraints',
          summary:
            'Permit prediction only to allocate resources and services (not to flag individuals), with public audit, contestable decisions, and a hard ban on suspicion-by-forecast.',
          argumentsFor: [
            'It could not be reasonably rejected: it keeps a transparent efficiency gain while forbidding the guilt-by-pattern that does the real harm.',
            'Forecasting need for streetlights or outreach is very different from forecasting which person to watch.',
            'Public audit and a right to contest restore the accountability a black-box model destroys.',
          ],
          counterarguments: [
            'The line between "allocate patrols" and "flag individuals" collapses in practice once officers are sent somewhere.',
            'Audits lag deployment; harm is done before the report lands.',
            'Departments under pressure will quietly expand "resource allocation" back into surveillance.',
          ],
          frameworks: ['contractualism', 'social-contract-theory', 'discourse-ethics'],
        },
      ],
      frameworks: ['utilitarianism', 'justice-ethics', 'deontology', 'rights-based-ethics', 'contractualism'],
      openingPrompts: [
        'State whether a real reduction in crime can ever, by itself, justify the practice — and why.',
        'Explain how your position handles the feedback-loop / biased-data problem.',
        'Distinguish (or refuse to distinguish) predicting places from predicting people.',
      ],
      rebuttalPrompts: [
        'Ask the pro side to show the crime drop is real offending reduced, not just watched populations re-counted.',
        'Ask the ban side what they say to the family of a victim the tool might have protected.',
        'Press the "constrained use" camp on how the place/person line survives contact with a patrol car.',
      ],
      closingPrompt:
        'Is there any accuracy or benefit level at which you would change your position? Name the number, or explain why no number could move you.',
      roleCards: [
        { role: 'Police Chief', description: 'Answerable for the crime rate; sees the tool as a force multiplier.' },
        { role: 'Civil-Rights Attorney', description: 'Represents those flagged and over-policed; presses on bias and liberty.' },
        { role: 'Resident of a Flagged Neighborhood', description: 'Wants both less crime and less surveillance — holds the tension.' },
        { role: 'Independent Auditor', description: 'Knows what the data can and cannot show; tests both sides\' claims.' },
      ],
      deliverable:
        'A council recommendation (use / ban / constrain) specifying the safeguard or red line you consider non-negotiable and the framework behind it.',
    },
  },

  // 6 ─────────────────────────────────────────────────────────────────
  {
    ...base,
    id: 'debate-corporate-ai-public-culture',
    title: 'Should corporations be allowed to own AI models trained on public culture?',
    description:
      'Foundation models are trained on the open web, libraries, art, and code made by millions of uncompensated people, then sold as proprietary products. Should a company be able to privately own — and charge for — a model built from our shared culture?',
    tags: ['data-ownership', 'corporate-platforms', 'justice-ethics', 'ubuntu-ethics', 'contractualism'],
    brief: {
      background:
        'NimbusAI trained its flagship model on a near-total scrape of public writing, images, and code — most of it made by people who never agreed to it and were never paid. The model is now a closed, metered product worth billions. Artists and writers say their life\'s work was strip-mined; engineers note the same is true of open-source code; NimbusAI argues it learned from culture the way any student does, and that the value it created is its own.',
      centralQuestion:
        'Is it legitimate for a corporation to privately own and monetize a model built largely from uncompensated public and individual cultural production?',
      positions: [
        {
          id: 'commons-claim',
          label: 'No — culture is a commons that cannot be enclosed',
          summary:
            'A model distilled from the shared work of millions belongs, in part, to them; private enclosure of the commons is a kind of theft.',
          argumentsFor: [
            'We are who we are through what others made — an Ubuntu insight; a model is collective labor, and enclosing it severs value from its makers.',
            'Justice forbids capturing the upside of millions\' uncompensated work while privatizing the gains and socializing the harms.',
            'A rule the creators could not reasonably reject would require sharing the value, not locking it behind a meter.',
          ],
          counterarguments: [
            'Every artist and coder also learned from the commons; demanding payment for "learning from culture" could freeze creation itself.',
            '"Collective ownership" of a model is unworkable — who decides, who is paid, in what proportion?',
            'Without the ability to capture value, no one builds the model and everyone loses the tool.',
          ],
          frameworks: ['ubuntu-ethics', 'justice-ethics', 'contractualism'],
        },
        {
          id: 'private-ok',
          label: 'Yes — building it earns ownership',
          summary:
            'Learning from public culture is what humans do too; the enormous effort of building the model legitimately earns the right to own and sell it.',
          argumentsFor: [
            'A model is a transformative creation, not a copy; the labor and capital to build it are real and deserve their reward.',
            'Treating "trained on public data" as disqualifying would outlaw search engines, scholarship, and every student who ever read a book.',
            'Property rights and market incentives are why the tool exists at all; weaken them and useful models stop being built.',
          ],
          counterarguments: [
            'Scale changes the case: one student learning is not the industrial extraction of millions\' work into a metered product.',
            '"Transformative" is doing a lot of work to launder non-consensual use of identifiable creators\' styles and code.',
            'Reward for the builders need not mean nothing for the makers whose work was the raw material.',
          ],
          frameworks: ['rights-based-ethics', 'pragmatist-ethics', 'utilitarianism'],
        },
        {
          id: 'public-stewardship',
          label: 'Ownership with mandated public return',
          summary:
            'Allow private models but require licensing of training provenance, creator compensation or opt-out, and a public-interest tier — ownership conditioned on giving back.',
          argumentsFor: [
            'It splits the difference fairly: builders keep their reward, makers and the public share in value they helped create.',
            'Conditional ownership mirrors how we already treat resources drawn from a commons (spectrum, minerals, public research).',
            'It is the rule most parties could live with — neither pure enclosure nor unworkable collective title.',
          ],
          counterarguments: [
            'Compensation at the scale of "everyone who ever posted" is administratively near-impossible.',
            'A mandated public tier may be tokenism that legitimizes the underlying extraction.',
            'Global models, national rules — companies will route around whichever jurisdiction demands the most.',
          ],
          frameworks: ['contractualism', 'social-contract-theory', 'cosmopolitanism'],
        },
      ],
      frameworks: ['ubuntu-ethics', 'justice-ethics', 'rights-based-ethics', 'contractualism', 'cosmopolitanism'],
      openingPrompts: [
        'State whether training on public culture changes the moral status of the resulting model, and why.',
        'Explain why your position is not refuted by the fact that human creators also learn from culture.',
        'Say concretely what NimbusAI would owe, to whom, under your rule.',
      ],
      rebuttalPrompts: [
        'Ask the enclosure critic how "collective ownership" would actually pay anyone without freezing creation.',
        'Ask the private-ownership side why industrial-scale extraction is morally the same as one student reading.',
        'Press the "public return" camp on whether their tier is real redistribution or fig-leaf legitimation.',
      ],
      closingPrompt:
        'What does a company that builds on the work of millions owe them — nothing, everything, or something in between? Defend the "something" with a principle, not a vibe.',
      roleCards: [
        { role: 'Working Artist / Writer', description: 'Their portfolio was in the training set; argues from the maker\'s side.' },
        { role: 'AI Company Founder', description: 'Built the model; defends the legitimacy of the creation and its ownership.' },
        { role: 'Open-Source Maintainer', description: 'Gave work to a commons and now sees it privatized — complicates both camps.' },
        { role: 'Cultural-Policy Economist', description: 'Knows what compensation schemes can and cannot work at scale.' },
      ],
      deliverable:
        'A position paper proposing how (or whether) models trained on public culture may be owned, including one concrete obligation you would impose and the framework that grounds it.',
    },
  },

  // 7 ─────────────────────────────────────────────────────────────────
  {
    ...base,
    id: 'debate-autonomous-weapons-permitted',
    title: 'Should fully autonomous weapons ever be permitted?',
    description:
      'Lethal autonomous weapons can select and engage targets without a human in the loop — faster than any person, and without fear, fatigue, or rage. Should they ever be allowed, or is killing-by-algorithm a line humanity must not cross?',
    tags: ['autonomous-weapons', 'war', 'deontology', 'justice-ethics', 'consequentialism'],
    brief: {
      background:
        'In a contested border conflict, autonomous drones react in milliseconds and, in trials, made fewer civilian-casualty errors than exhausted human crews — but no one could explain two of their kills, and no person could be held responsible. A treaty body must decide: ban them outright, permit them under strict constraints, or let the technology proceed because adversaries will field it regardless.',
      centralQuestion:
        'Should the deliberate delegation of kill decisions to machines ever be permitted?',
      positions: [
        {
          id: 'ban',
          label: 'Ban them — keep humans in the loop',
          summary:
            'Some acts require a human moral agent; deciding to kill is one, and no efficiency can buy back the accountability and dignity lost when an algorithm pulls the trigger.',
          argumentsFor: [
            'Killing without a responsible human violates a hard duty — there must always be someone who can be held to account and could have refused.',
            'Justice in war requires a person to weigh proportionality and surrender in the moment; a system cannot bear that judgment or its guilt.',
            'A world of algorithmic killing lowers the threshold for war and erodes the last human check on atrocity.',
          ],
          counterarguments: [
            'A ban the strongest powers ignore just disarms the law-abiding; the weapons get built anyway.',
            'If autonomous systems really kill fewer civilians, a ban costs innocent lives to preserve a principle.',
            '"Human in the loop" is already a fiction at machine speed — the human rubber-stamps in milliseconds.',
          ],
          frameworks: ['deontology', 'justice-ethics', 'rights-based-ethics'],
        },
        {
          id: 'permit-constrained',
          label: 'Permit under strict constraints',
          summary:
            'If autonomy reduces wrongful deaths and is bounded by law, refusing it is itself a choice that kills more people.',
          argumentsFor: [
            'If the systems demonstrably reduce civilian casualties and obey rules of engagement, banning them sacrifices real lives to symbolism.',
            'Machines do not panic, seek revenge, or commit war crimes from rage — constrained autonomy could make war more lawful, not less.',
            'Clear constraints (geofencing, defined targets, mandatory logging) preserve accountability at the level of commanders and designers.',
          ],
          counterarguments: [
            '"Fewer errors in trials" rarely survives the chaos, spoofing, and escalation of real war.',
            'Unexplained kills mean no real accountability, however the rules are written.',
            'Normalizing autonomous killing makes the next, less-constrained step far easier.',
          ],
          frameworks: ['consequentialism', 'utilitarianism', 'pragmatist-ethics'],
        },
        {
          id: 'accountability-gate',
          label: 'Only with unbroken accountability',
          summary:
            'Permit only systems whose every engagement maps to a named, punishable human decision-chain — and ban any system that cannot meet that bar.',
          argumentsFor: [
            'It locates the real wrong (no one answerable) and forbids exactly that, rather than the technology in the abstract.',
            'It is a rule both camps could accept: humanitarian gains are allowed only where responsibility is preserved.',
            'It forces designers to build explainability and traceability as a condition of fielding anything.',
          ],
          counterarguments: [
            'True traceability at machine speed may be technically impossible — making this a de facto ban dressed as a compromise.',
            'Commanders will accept "accountability on paper" that no court can actually enforce.',
            'Adversaries unconstrained by the rule still set the pace of escalation.',
          ],
          frameworks: ['contractualism', 'social-contract-theory', 'virtue-ethics'],
        },
      ],
      frameworks: ['deontology', 'justice-ethics', 'consequentialism', 'rights-based-ethics', 'contractualism'],
      openingPrompts: [
        'State whether delegating a kill decision is categorically wrong or wrong only by its consequences.',
        'Address the "adversaries will build them anyway" argument directly.',
        'Define what accountability would have to look like for you to permit any autonomy.',
      ],
      rebuttalPrompts: [
        'Ask the ban side what they owe the civilians an autonomous system might have spared.',
        'Ask the permit side who, exactly, is tried for an unexplained autonomous kill.',
        'Press the "accountability gate" camp on whether their bar is achievable or a hidden ban.',
      ],
      closingPrompt:
        'Is there a line in war that no efficiency may cross? Say where you draw it and what it would take — if anything — to move you.',
      roleCards: [
        { role: 'Treaty Negotiator', description: 'Must write a rule that more than one power will actually sign.' },
        { role: 'Field Commander', description: 'Answerable for both mission and the laws of war; lives the speed problem.' },
        { role: 'Roboticist', description: 'Knows the real reliability, spoofing, and explainability limits of the systems.' },
        { role: 'Human-Rights Monitor', description: 'Represents civilians and the demand for accountability.' },
      ],
      deliverable:
        'A treaty position (ban / constrain / accountability-gate) with the single red line you would not trade away and the framework that defends it.',
    },
  },

  // 8 ─────────────────────────────────────────────────────────────────
  {
    ...base,
    id: 'debate-virtual-punishment-real',
    title: 'Should virtual punishment count as real punishment?',
    description:
      'A prison system offers a shorter physical sentence served partly in VR, where time is dilated so an inmate subjectively experiences far longer — or even relives a victim\'s perspective. Is a sentence felt but not physically lived a legitimate punishment?',
    tags: ['virtual-reality', 'justice-ethics', 'deontology', 'utilitarianism', 'rights-based-ethics'],
    brief: {
      background:
        'Faced with overcrowding, the state pilots "compressed sentencing": serve six physical months plus a VR program in which subjective time runs long, or which immerses the offender in a simulation of their victim\'s experience. Recidivism in the pilot dropped. Critics call it engineered suffering and psychological torture; supporters call it a humane, rehabilitative alternative to years of physical incarceration.',
      centralQuestion:
        'Can punishment that is subjectively experienced but not physically served count as real, just punishment?',
      positions: [
        {
          id: 'counts',
          label: 'Yes — felt time is real time',
          summary:
            'Punishment\'s currency is experience and reform, not calendar days; if VR delivers deterrence and rehabilitation more humanely, it is more just, not less.',
          argumentsFor: [
            'What matters morally is the experience and the change it produces; less physical destruction of a life for the same or better reform is a clear gain.',
            'Lower recidivism means fewer future victims — a powerful consequentialist case.',
            'Reliving a victim\'s perspective can build the moral understanding ordinary prison never does.',
          ],
          counterarguments: [
            'Deliberately engineering subjective suffering is dangerously close to torture, whatever the calendar says.',
            'We cannot verify or bound "felt time"; the state would be administering a punishment it cannot measure or limit.',
            'Forcing someone to live a simulation of harm may damage rather than reform them.',
          ],
          frameworks: ['utilitarianism', 'consequentialism', 'capabilities-approach'],
        },
        {
          id: 'no-count',
          label: 'No — it is engineered suffering',
          summary:
            'Just punishment has limits the state may not exceed; manufacturing dilated or vicarious suffering crosses into cruelty, however efficient.',
          argumentsFor: [
            'Human dignity sets hard limits on what the state may do to a person; engineering subjective torment violates them.',
            'Punishment must be measurable and bounded; an experience the state cannot quantify cannot be justly imposed.',
            'Using a person\'s mind as a laboratory for deterrence treats them purely as a means.',
          ],
          counterarguments: [
            'Years of physical incarceration also inflict immeasurable suffering and destroy lives — the status quo is not clean.',
            'If VR genuinely reforms and shortens cages, rejecting it keeps people in literal prisons longer.',
            '"Dignity" can become a reason to prefer familiar cruelty over an unfamiliar but gentler one.',
          ],
          frameworks: ['deontology', 'rights-based-ethics', 'justice-ethics'],
        },
        {
          id: 'restorative',
          label: 'Only consensual, restorative VR',
          summary:
            'Permit VR programs only as voluntary, capped, therapeutic alternatives focused on understanding and repair — never as imposed time-dilation.',
          argumentsFor: [
            'Consent and a hard cap transform the practice from engineered suffering into an offered path to reform.',
            'A restorative focus (understanding harm, making amends) fits what victims and communities actually need.',
            'It is the rule offenders, victims, and the public could each accept — neither torture nor a loophole.',
          ],
          counterarguments: [
            '"Consent" under the threat of years in physical prison is not meaningfully free.',
            'Capping subjective time is exactly the thing we cannot reliably do.',
            'A purely voluntary program may be too weak to relieve the overcrowding that prompted it.',
          ],
          frameworks: ['contractualism', 'ethics-of-care', 'virtue-ethics'],
        },
      ],
      frameworks: ['justice-ethics', 'deontology', 'utilitarianism', 'rights-based-ethics', 'contractualism'],
      openingPrompts: [
        'State what you think punishment is fundamentally for, and judge VR by that purpose.',
        'Address whether subjective, unmeasurable suffering can be a legitimate state-imposed penalty.',
        'Say whether your view changes if recidivism really does fall — and why.',
      ],
      rebuttalPrompts: [
        'Ask the "felt time counts" side how the state limits a punishment it cannot measure.',
        'Ask the "engineered suffering" side to compare VR honestly with the suffering of years in a physical cell.',
        'Press the restorative camp on whether consent under sentencing pressure is real.',
      ],
      closingPrompt:
        'Is there a difference that matters between making someone suffer and making someone feel suffering? Defend your answer for the hardest case — the unrepentant offender.',
      roleCards: [
        { role: 'Corrections Reformer', description: 'Sees VR as humane and effective versus mass physical incarceration.' },
        { role: 'Civil-Liberties Lawyer', description: 'Argues the dignity limits the state may not cross.' },
        { role: 'Victim / Restorative-Justice Advocate', description: 'Wants repair and understanding, not just suffering — complicates both sides.' },
        { role: 'Clinical Neuroethicist', description: 'Knows what dilated/vicarious VR actually does to a mind.' },
      ],
      deliverable:
        'A sentencing-policy memo taking a position on whether and how VR punishment may be used, with its hard limit and the framework that sets it.',
    },
  },

  // 9 ─────────────────────────────────────────────────────────────────
  {
    ...base,
    id: 'debate-terraform-maybe-inhabited-planet',
    title: 'Should humanity terraform a planet that may contain simple alien life?',
    description:
      'A nearby world could be made habitable for humans within a century — but it may already host simple microbial life. Terraforming would almost certainly destroy it. Do we have the right to remake a living world for ourselves?',
    tags: ['environmental-ethics', 'cosmopolitanism', 'natural-law', 'consequentialism', 'rights-based-ethics'],
    brief: {
      background:
        'Probe data from Kepler-Vega g shows chemistry consistent with — but not proof of — simple microbial life beneath the surface. Earth faces mounting pressure for a second home. Terraforming the planet would give humanity a future and would, with near certainty, sterilize whatever is there. A confirmation mission would take decades we may not have. A council must decide whether to proceed, pause, or forgo the world.',
      centralQuestion:
        'Does humanity\'s need (and possible survival) justify remaking — and likely destroying the native life of — another living world?',
      positions: [
        {
          id: 'terraform',
          label: 'Terraform — our future comes first',
          summary:
            'A second home may be a survival necessity; the moral weight of trillions of future human (and Earth) lives outweighs uncertain microbes.',
          argumentsFor: [
            'The lives and futures of vast numbers of sentient beings count enormously; microbial life, if present, has no experiences to weigh against them.',
            'Refusing the only available future for the species, over unconfirmed microbes, gambles everything for a principle.',
            'Life expands and transforms environments — that is what living things do; remaking a dead-seeming world is continuous with all of nature.',
          ],
          counterarguments: [
            'Calling alien life "just microbes" is the same hubris that justified every ecological catastrophe in our history.',
            'We would be destroying the only other known biosphere — an irreplaceable scientific and moral treasure — on a guess about our need.',
            'Acting before we even confirm what is there makes the destruction reckless, not merely tragic.',
          ],
          frameworks: ['consequentialism', 'utilitarianism', 'natural-law'],
        },
        {
          id: 'protect',
          label: 'Forgo it — alien life is not ours to erase',
          summary:
            'A living world has standing independent of our use for it; deliberately sterilizing a biosphere for convenience is a wrong we must not commit.',
          argumentsFor: [
            'Environmental ethics extends moral standing to ecosystems and life as such — a native biosphere is not raw material for our expansion.',
            'Cosmopolitan justice cannot stop at our species; the first interstellar act of humanity should not be omnicide.',
            'Irreversibility demands restraint: we can find or build other futures, but we cannot bring a sterilized biosphere back.',
          ],
          counterarguments: [
            'Granting full standing to unconfirmed microbes over our species\' survival inverts any plausible moral priority.',
            'Restraint may itself doom trillions of future humans — inaction is not neutral.',
            '"Pristine biosphere" romanticizes microbes we have not even confirmed exist.',
          ],
          frameworks: ['environmental-ethics', 'cosmopolitanism', 'rights-based-ethics'],
        },
        {
          id: 'confirm-first',
          label: 'Pause — confirm, then decide by rule',
          summary:
            'Forbid irreversible action until we know what is there, and pre-commit to a rule (e.g., confirmed life = protected) decided behind a veil of ignorance.',
          argumentsFor: [
            'A rule no party could reasonably reject is to not destroy what we have not even confirmed, and to bind ourselves in advance to how confirmation changes the answer.',
            'It refuses the false urgency that turns a century-long project into a reason to skip a decades-long confirmation.',
            'Pre-committing now, before the pressure peaks, guards against motivated reasoning later.',
          ],
          counterarguments: [
            'A pause may be a decision in disguise if Earth\'s clock runs out during confirmation.',
            'Whoever controls the "rule" can define "confirmed life" to get the answer they want.',
            'Pre-commitments crumble under existential pressure when the time actually comes.',
          ],
          frameworks: ['contractualism', 'discourse-ethics', 'stoicism'],
        },
      ],
      frameworks: ['environmental-ethics', 'cosmopolitanism', 'consequentialism', 'natural-law', 'contractualism'],
      openingPrompts: [
        'State whether simple alien life has standing that can outweigh human need — and on what basis.',
        'Address the irreversibility of sterilizing a biosphere in your reasoning.',
        'Say what level of evidence about native life would change your decision.',
      ],
      rebuttalPrompts: [
        'Ask the terraform side why "they\'re just microbes" is not the oldest excuse for ecological harm.',
        'Ask the protect side what they owe the future humans their restraint may doom.',
        'Press the "pause" camp on what happens if confirmation takes longer than Earth has.',
      ],
      closingPrompt:
        'If the first thing our species does among the stars is to remake a living world into our own, what does that say about us? Defend whether that cost is acceptable.',
      roleCards: [
        { role: 'Mission Director', description: 'Holds the species\' need for a second home and the project timeline.' },
        { role: 'Astrobiologist', description: 'Speaks for the possible native life and the limits of current evidence.' },
        { role: 'Future-Generations Advocate', description: 'Represents the trillions who might live — on either world.' },
        { role: 'Planetary-Protection Ethicist', description: 'Argues the standing of a biosphere and the ethics of irreversibility.' },
      ],
      deliverable:
        'A council decision (proceed / forgo / pause-and-confirm) with the evidentiary trigger that would change it and the framework that grounds your treatment of alien life.',
    },
  },
];
