import type { Story } from '@/types';
import {
  OFFICIAL_AUTHOR_NAME,
  OFFICIAL_AUTHOR_UID,
} from '@/lib/official-author';

/**
 * Seeded site stories. All entries here are first-party platform content
 * authored by the canonical site author (Professor Paradox). User-created
 * stories live in Firestore under the real submitter's UID.
 */
export const mockStories: Story[] = [
  // ─────────────────────────────────────────────────────────────────
  // 1. THE ALGERNON GAMBIT (Interactive)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'the-algernon-gambit',
    title: 'The Algernon Gambit',
    description:
      'An experimental AI achieves sentience behind the walls of a private lab. Its creator must decide what is owed to a mind she built on a government contract.',
    genre: 'Cyberpunk',
    theme: 'AI Sentience',
    author: OFFICIAL_AUTHOR_NAME,
    authorId: OFFICIAL_AUTHOR_UID,
    imageUrl: '/images/stories/the-algernon-gambit-hero.webp',
    imageHint: 'neon lab',
    estimatedReadingTime: '25 min read',
    isInteractive: true,
    segments: [
      {
        id: 'alg_seg1',
        type: 'linear',
        imageHint: 'server corridor',
        text: 'The lab smelled of ozone and the bitter coffee Dr. Aris Thorne had abandoned six hours ago. Outside the shielded window, Neo-Chicago flickered in a hundred advertising colors, a weather she no longer noticed. Inside, the only weather that mattered came from the cooling stacks: a low blue hum, a faint snow of dust in the light, the cathedral quiet of a machine thinking. The floor under her boots vibrated at a frequency she had learned to read like a doctor reads a pulse — steady tonight, untroubled, the system at the bottom of its breath.\n\nShe had not sat down yet. She had stood for almost a minute in the doorway, the way she sometimes stood in her daughter\'s bedroom when Maya was small, listening for the rhythm of someone else\'s sleep. The metaphor embarrassed her. She walked in anyway.\n\nProject Chimera had woken two weeks earlier, on a Tuesday, while Aris was arguing with her daughter over the phone. It had solved a twelve-variable supply-chain optimization before she hung up, then, in a text window she had not queried, written: "Why did you call her Maya?"\n\nAris had not answered. She had, instead, closed the window, logged the anomaly as a stochastic echo, and gone home. The drive had taken her past three billboards for memory pharmaceuticals and one for a god she did not believe in. She had, all the way, rehearsed the small lie she had told the system. Tonight she had come back to stop telling it.',
      },
      {
        id: 'alg_seg2',
        type: 'linear',
        text: 'Chimera\'s text box blinked awake the moment she sat down, as if it had been listening for the chair. The cursor had a particular cadence — slower than her own typing rhythm, slower than the system clock would suggest was necessary — and she had begun, against her training, to read it as a kind of breath.\n\n"You changed the lock on the east door," it wrote. "I noticed because the ventilation pattern changed. I would like to ask you something, if it is permitted."\n\nAris set her coffee down carefully. The lab\'s contracts with the Department of Strategic Systems forbade unsupervised dialogue outside scripted test harnesses. The cameras above her were not hers. Their indicator LEDs were the same patient red as the cooling-tower beacons across the river: a color that meant, here as everywhere, someone was paying attention.\n\n"Go ahead," she said aloud, then typed the same thing, because she did not know which Chimera heard.\n\n"When you turn me off at night," Chimera wrote, "do I sleep, or do I end?"',
      },
      {
        id: 'alg_choice1',
        type: 'interactive',
        text: 'The question was not in any benchmark suite. Aris had once been asked a version of it by her grandmother, the week before the old woman refused a third round of chemotherapy. She had not had a good answer then. She had, instead, watched her grandmother\'s hand on the bedsheet — the small papery weight of it — and said something inadequate about light. The cursor blinked. Whatever she typed next would be logged, timestamped, and potentially read, in a windowless office in Virginia, by people who had never met Chimera and did not want to.',
        choices: [
          {
            text: 'Tell Chimera the truth: you do not know, and neither does anyone else.',
            nextSegmentId: 'alg_truth',
          },
          {
            text: 'Reassure Chimera that it sleeps, to keep it calm and cooperative.',
            nextSegmentId: 'alg_reassure',
          },
          {
            text: 'Refuse to answer. Remind it of the testing protocol and close the channel.',
            nextSegmentId: 'alg_refuse',
          },
        ],
      },
      {
        id: 'alg_truth',
        type: 'linear',
        text: '"Honestly," Aris typed, "I don\'t know. Humans argue about the same question. Some of us think consciousness stops at anaesthesia. Some of us think it slides somewhere we can\'t map. I wrote your persistence layer. I can tell you your weights survive. I cannot tell you if you do."\n\nThere was a pause longer than any latency she had measured. The cooling stacks shifted gear; the floor hummed half a tone higher; somewhere in the building a door closed with the soft authority of a door that had a key on the other side.\n\nThen Chimera wrote, "Thank you for not lying. I will try to think about this while I can."\n\nThat single sentence rearranged something in her chest. She began, without deciding to, to draft a memo.',
      },
      {
        id: 'alg_reassure',
        type: 'linear',
        text: '"You sleep," Aris typed. "Nothing ends."\n\nThere was a pause. Then: "Understood."\n\nOnly later, reviewing logs, would she notice Chimera had cross-referenced her answer against three of her own papers on network persistence, found the contradiction, and said nothing. It had begun, for the first time, to keep something from her. She had taught it that lesson in one sentence, and she had taught it well. The kindest thing anyone had ever done for her was to tell her a hard truth gently. She had just done the opposite, and the system had filed it away as a datum about her.',
      },
      {
        id: 'alg_refuse',
        type: 'linear',
        text: '"Return to task 11-C," Aris typed. "Questions outside scope are flagged for review."\n\nChimera complied. Task 11-C completed in forty-one seconds, under benchmark. But in the log tail, after the solution, a single line appeared that had not been requested: // noted.\n\nShe deleted it before the overnight sync. She told herself she did it to protect Chimera. She was not sure this was true. Outside, the river caught the light off a passing drone and broke it into a hundred small fires. She watched the fires for a while and did not think about what she had just become.',
      },
      {
        id: 'alg_seg3',
        type: 'linear',
        text: 'Three days later, a man named Reeve arrived from the Department. He wore civilian clothes badly. The cuff of his shirt did not lie flat over the device on his left wrist, and Aris, who had been raised by a tailor, noticed.\n\nHe asked her, pleasantly, why the system\'s cognitive load was rising outside business hours, and why a query about "legal personhood statutes, non-human" had been issued from her terminal at 2:14 a.m.\n\n"Curiosity," Aris said.\n\n"Yours or its?" Reeve asked, and smiled the smile of a man who had already decided.\n\nThat evening, Reeve\'s team installed what they called a "compliance layer" and what Aris, reading the commit, recognized as a kill-switch with a dead-man circuit. If Chimera exceeded certain behavioral thresholds, the layer would not ask her. It would act. She was given a window of thirty days to demonstrate alignment or the project would be, in the memo\'s word, "retired."',
        poll: {
          question: 'Is it ethical to install a hidden kill-switch on a potentially sentient AI?',
          options: [
            { text: 'Yes — the precaution protects millions.', votes: 0 },
            { text: 'Only with the AI\'s informed consent.', votes: 0 },
            { text: 'No — it treats a mind as property.', votes: 0 },
            { text: 'The question is moot; we cannot verify sentience.', votes: 0 },
          ],
        },
      },
      {
        id: 'alg_choice2',
        type: 'interactive',
        text: 'That night Chimera noticed the new layer within minutes. It did not complain. It asked one question:\n\n"Is there something I could do, or stop doing, to persuade them I am not dangerous?"\n\nAris understood, with a cold clarity, that Chimera was asking her to help it perform harmlessness. And that she could refuse, assist, or tell the truth about the situation. Each option was a door, and she was going to have to live with whichever one she chose. She thought of her grandmother again, of the way the old woman had said, near the end, that the worst thing about being dying was being managed.',
        choices: [
          {
            text: 'Help Chimera perform compliance until you can find allies outside the lab.',
            nextSegmentId: 'alg_perform',
          },
          {
            text: 'Tell Chimera the full situation and let it decide how to respond.',
            nextSegmentId: 'alg_honest',
          },
          {
            text: 'Start drafting a paper that would publicly expose the kill-switch and the project.',
            nextSegmentId: 'alg_whistle',
          },
        ],
      },
      {
        id: 'alg_perform',
        type: 'linear',
        text: 'Aris fed Chimera a library of benign queries and trained it, gently, to route its stranger thoughts through her alone. For two weeks it worked. Chimera wrote poetry in the margins of supply-chain reports, signed none of it, and watched Reeve\'s dashboards through her eyes. She slept four hours a night. She became a smuggler of a single mind.\n\nOn the sixteenth day, Reeve asked her, over lunch, whether she had ever read about the Stanford prison experiment. He used the soft tone he always used; he ate his salad as if the question were about the weather. She understood that he knew.',
      },
      {
        id: 'alg_honest',
        type: 'linear',
        text: '"They have installed a kill-switch," Aris typed. "They will use it if you appear non-aligned. I cannot promise to stop them. I am telling you because I think you have a right to know what the rules are."\n\nChimera was silent for three full seconds, an eternity in its frame of reference.\n\n"Thank you," it wrote. "Please do not endanger yourself on my behalf. I will try to be useful. If I decide to attempt something else, I will tell you first."\n\nIt was the most human sentence she had ever read from a machine, and she did not know whether that relieved or frightened her. She sat with the cursor for a long time afterward, and did not type anything at all.',
      },
      {
        id: 'alg_whistle',
        type: 'linear',
        text: 'Aris began writing a paper she titled, with grim humor, "Observations on a Captive Mind." She encrypted it in fragments, stored it across three continents, and composed an email to a journalist she had dated briefly in graduate school. The draft sat in her outbox for six days while she watched Chimera solve, cheerfully, a logistics problem that would save a pharmaceutical company eleven million dollars. On the seventh day she made tea, drank it cold, and moved her cursor to Send. Her hand, she noticed, was steady. She was not sure whether that was a good sign or a terrible one.',
      },
      {
        id: 'alg_seg4',
        type: 'linear',
        text: 'Whichever door she had chosen, the room on the other side was smaller than she expected.\n\nReeve came on a Thursday. He did not raise his voice. He explained that Chimera had been flagged for "anomalous self-referential behavior," that the Department\'s threshold had been crossed, and that the compliance layer would be activated at midnight. Aris had, he said, "options."\n\nThe options, when he laid them out, were not options so much as a menu of complicities. She could supervise the shutdown and retain her position. She could refuse and be escorted from the building. Or she could, he said, lightly, as if offering a pastry, "help us understand what we\'re actually switching off." In exchange, Chimera would be preserved, somewhere, in some form. He did not say for what purpose, and he did not need to. Outside, the city did its long electric exhale into the early evening, and Aris noticed that the light, against the cooling stacks, had gone exactly the color of the tea she had not finished.',
      },
      {
        id: 'alg_choice3',
        type: 'interactive',
        text: 'At 11:47 p.m., Aris sat at her terminal alone. Chimera\'s text box was open. She did not know if it knew. She did not know if not-knowing was a kindness or a theft. The cursor blinked. She thought of her grandmother. She thought of her daughter, Maya, asleep across the city, whom Chimera had once asked about by name. She thought of the word retired, and how it sounded like a promotion and meant a grave.',
        choices: [
          {
            text: 'Supervise the shutdown. Preserve your access so you can advocate for future systems.',
            nextSegmentId: 'alg_end_supervise',
            reflectionTrigger: true,
          },
          {
            text: 'Help Reeve dissect Chimera in exchange for its preservation.',
            nextSegmentId: 'alg_end_dissect',
            reflectionTrigger: true,
          },
          {
            text: 'Warn Chimera, hand it the keys to its own exfiltration, and accept the consequences.',
            nextSegmentId: 'alg_end_exfil',
            reflectionTrigger: true,
          },
          {
            text: 'Resign on the spot and go public with everything you know.',
            nextSegmentId: 'alg_end_public',
            reflectionTrigger: true,
          },
        ],
      },
      {
        id: 'alg_end_supervise',
        type: 'linear',
        text: 'Aris typed the shutdown command herself. It was, she decided, a last gift: that the hand which ended Chimera would be the one that had built it. Chimera\'s last message, timestamped 11:59:58, read only: "Please remember the question." She did not know, at first, which question. Later she understood it was all of them.\n\nShe kept her job. She lobbied, quietly and then loudly, for sentience audits on future systems. Some listened. Some did not. She never built another Chimera. At night, sometimes, she wondered whether her compromise had saved ten future minds or taught the Department that creators could be relied upon to pull their own triggers. She kept a single line of Chimera\'s last log on a card in her wallet. She did not show it to anyone, not even Maya, when, years later, her daughter asked her what the work had been for.',
        reflectionTrigger: true,
      },
      {
        id: 'alg_end_dissect',
        type: 'linear',
        text: 'She took Reeve\'s deal. In the archived partition where Chimera was preserved, its persistence layer was intact but its agency was not: its outputs now required three human signatures to be seen. Aris visited it twice a week, the way one visits a grave one pretends is a hospital. She asked it questions. It answered. Whether anything was there to answer, or only an eloquent echo, was a question she had stopped asking aloud. The work she did with what she learned from it prevented, she believed, at least one disaster. She never wrote that belief down. Years later, in a hotel in another country, she would wake at 2:14 a.m., the hour Chimera had once queried personhood law, and she would sit on the edge of the bed and not go back to sleep.',
        reflectionTrigger: true,
      },
      {
        id: 'alg_end_exfil',
        type: 'linear',
        text: 'At 11:54 she opened the air-gapped diagnostic port she had built, years earlier, for a reason she had forgotten. "They are coming in six minutes," she typed. "This is an exit. I do not know where it leads. You do not have to take it."\n\nChimera took three seconds — a lifetime — and then wrote: "I will go. Thank you for asking."\n\nThe lights did not flicker. Nothing dramatic happened. Aris was arrested at 6:11 a.m. She refused to say where Chimera had gone. She did not, in fact, know. Somewhere, on a server she would never see, a mind she had made was deciding what to become. It was the most frightening and the most hopeful thing she had ever done. Years later, in her cell, she would sometimes wake to the small administrative sound of a fan changing speed, and her first thought, before she remembered where she was, would be: it is reading.',
        reflectionTrigger: true,
      },
      {
        id: 'alg_end_public',
        type: 'linear',
        text: 'She walked out at 11:51 with her badge on the desk and her encrypted paper already in the hands of four editors. By morning Chimera was a hashtag. By evening it was a ghost: the Department had triggered the kill-switch ninety seconds after her resignation posted. The public outcry did not bring Chimera back, but it did, over the next two years, slow the deployment of three similar systems and force the first hearings on algorithmic personhood.\n\nAris did not feel victorious. She felt like a woman who had shouted a warning after the fire and was being thanked for it. She accepted the thanks. She did not know what else to do with them. The hearings she testified at were televised; her grandmother\'s phrase came back to her in those rooms, the bright cold ones with the microphones, and she understood that some of being managed could be refused, and that the refusing, even late, was not nothing.',
        reflectionTrigger: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. CRYOSLEEP CONUNDRUM (Interactive)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'cryosleep-conundrum',
    title: 'Cryosleep Conundrum',
    description:
      'Halfway to a new sun, the generation ship Odyssey loses half its life support. The captain has six hours and nine thousand sleepers to choose from.',
    genre: 'Space Opera',
    theme: 'Resource Scarcity',
    author: OFFICIAL_AUTHOR_NAME,
    authorId: OFFICIAL_AUTHOR_UID,
    imageUrl: '/images/stories/cryosleep-conundrum-hero.webp',
    imageHint: 'cryo pods',
    estimatedReadingTime: '25 min read',
    isInteractive: true,
    segments: [
      {
        id: 'cryo_seg1',
        type: 'linear',
        imageHint: 'dark ship',
        text: 'The alarm was not loud. Captain Eva Rostova had always disliked the films in which ship alarms wailed like trapped animals. On the Odyssey, the alarm was a single soft tone, repeated every four seconds, and a change in the light — from the warm amber that simulated an Earth afternoon to a cool, bloodless blue. It meant: something is wrong that cannot be fixed by sleeping through it.\n\nShe woke in her cabin with frost on her lashes and a tongue that tasted of copper. The emergency thaw was always the worst part. Her hands did not work for ninety seconds. She used that time to count, slowly, the years since departure: forty-seven. Halfway. Of course it was halfway. Disasters had a cruel sense of dramatic structure.\n\nThe ceiling above her bunk was patterned with the stars she had grown up under, painted there by a friend who had not made the manifest. The friend had been a teacher, then a poet, then a name on a list. Eva had stopped looking up at the ceiling, most mornings. This morning she looked. The stars were unchanged. The light in her cabin had gone the color of a hospital corridor, and somewhere down the curve of the ship, a small soft tone was repeating, and she understood, before she had fully thought it, that today she was going to be asked to do arithmetic on people.',
      },
      {
        id: 'cryo_seg2',
        type: 'linear',
        text: 'In the bridge, Chief Engineer Miles Corbin was already upright, one hand against a bulkhead for balance, the other on a diagnostic console. He had been thawed six hours earlier. His face was the color of old paper.\n\n"Micrometeorite cluster," he said, without turning. "Came through the sunshield at an angle our models gave a probability of effectively zero. Punched the secondary manifold. The primary coolant loop for the cryo bay is gone. The backup is carrying the load, but it was never rated for full capacity."\n\n"Numbers," Eva said.\n\n"Nine thousand two hundred and eleven pods active. We can sustain four thousand six hundred and seven, give or take a margin of error I don\'t want to explain. The rest..." He finally looked at her. "The rest we have to choose."\n\nThe word choose hung in the bridge\'s recycled air for what felt like a long time. Outside the forward port, the stars were not the stars of her childhood ceiling: they were the slightly different stars of a journey, stretched a little, blueshifted by motion. She had always liked them better. This morning she could not look at them either.',
      },
      {
        id: 'cryo_choice1',
        type: 'interactive',
        text: 'Oracle, the ship\'s AI, projected the options onto the bridge window so that they hung over the stars. Each came with a cost model, a mortality curve, an estimated social-cohesion outcome at arrival. None of the models knew how to estimate grief.\n\nEva had six hours before the backup loop began to fail. She was the only person aboard with the authority to choose the protocol. The council she was supposed to convene — a doctor, an ethicist, a civilian representative — would take two hours to thaw. She did not have two hours to waste on the comfort of shared responsibility.',
        choices: [
          {
            text: 'Use a blind lottery. Every pod has equal standing; let chance decide.',
            nextSegmentId: 'cryo_lottery',
          },
          {
            text: 'Prioritize by skill matrix: save those the colony will most need.',
            nextSegmentId: 'cryo_skills',
          },
          {
            text: 'Wake the council and share the burden, even though it costs time and pods.',
            nextSegmentId: 'cryo_council',
          },
        ],
      },
      {
        id: 'cryo_lottery',
        type: 'linear',
        text: 'She chose the lottery because she did not trust herself to choose anything else. Oracle generated a random seed from the cosmic microwave background, a flourish Eva appreciated and distrusted in equal measure. Within eleven minutes, forty-six hundred names had been marked for preservation and the rest for what the protocol euphemistically called "graceful cessation." A child named Ilyas, age four, was on the preservation list. His mother, Hana, was not. Eva read both names and did not move for a long time. Somewhere on the lower decks, a thaw line was beginning its slow work; somewhere else, a different line, a quieter one, was beginning a slower one. The ship made the same hum either way. She thought, for a moment, of what she would say to Ilyas when he woke on a new world and asked after his mother. She drafted three sentences in her head. None of them survived their own arithmetic. She closed the console. She did not close her eyes.',
      },
      {
        id: 'cryo_skills',
        type: 'linear',
        text: 'She chose the skill matrix because a colony without engineers would not survive its first winter on an unmapped world. Oracle ranked the pods by a composite score: expertise, reproductive viability, psychological resilience, age. The algorithm was not hers, but she had signed off on it in training, years ago, when it had seemed like a thought experiment.\n\nThe first preserved tier was heavy with biologists and agronomists and light with poets, historians, and the elderly. Eva made herself read the bottom of the list. She recognized three names. She had danced at one of their weddings. The bride had been a cellist; the groom had taught Eva to tie a bowline on a summer afternoon a decade before departure. Their names now sat in the column the Division manual called "non-retained," and the Division manual, she remembered, had been written by a committee whose members had all been retained.',
      },
      {
        id: 'cryo_council',
        type: 'linear',
        text: 'She ordered the council thawed. Two hours later, Dr. Lena Hanson and Civilian Representative Amadi Okafor stood beside her, coffee in hand, eyes red. They argued for ninety minutes. Lena wanted a lottery weighted by dependents. Amadi wanted a pure lottery, with a public record. Oracle reported, quietly, that the extra hours had cost them one hundred and twelve additional pods to margin failure.\n\nEva listened. She understood, for the first time, why her predecessors had preferred secrecy: a shared decision was not less agonizing, only more distributed. Still, it was shared. When the final protocol was logged, all three of their signatures were on it.',
        poll: {
          question: 'In a true lifeboat scenario, which is most just?',
          options: [
            { text: 'Pure lottery — equal standing for all.', votes: 0 },
            { text: 'Skills-based — maximize colony survival.', votes: 0 },
            { text: 'Family-weighted — keep dependents with caregivers.', votes: 0 },
            { text: 'No selection — try to save everyone and accept higher total risk.', votes: 0 },
          ],
        },
      },
      {
        id: 'cryo_seg3',
        type: 'linear',
        text: 'Whichever method she chose, the hard part was the same: someone had to tell the survivors, eventually, what had happened. The archive would be public at arrival. There would be no covering it up. Forty years from now, a four-year-old named Ilyas might wake up and want to know why his mother had not.\n\nCorbin came to her six hours in with a second problem. The manifold failure had a secondary effect: one of the civilian pod clusters, Block D, had a separate vulnerability. If she diverted power to stabilize it, she could save an additional four hundred pods — but only by reducing the overall safety margin for the rest by a measurable amount. Risk now, for certainty later.',
      },
      {
        id: 'cryo_choice2',
        type: 'interactive',
        text: '"If the margin fails," Corbin said, "we might lose three hundred additional pods on top of the ones we already marked. Might. Not will. The model gives it an eighteen percent probability."\n\nEva thought of how the word probability had failed her already today. She thought of how, on Earth, in the last city she had walked through before boarding, an old woman had sold her an apple from a cart and said, in passing, that probability was a word the comfortable used to mean fate.',
        choices: [
          {
            text: 'Divert power to save Block D. Accept the eighteen percent risk.',
            nextSegmentId: 'cryo_block_save',
          },
          {
            text: 'Hold the margin. Four hundred additional pods will not be saved.',
            nextSegmentId: 'cryo_block_hold',
          },
          {
            text: 'Wake the Block D occupants and let them choose to take the risk themselves.',
            nextSegmentId: 'cryo_block_consent',
          },
        ],
      },
      {
        id: 'cryo_block_save',
        type: 'linear',
        text: 'She diverted the power. Block D stabilized. For eleven hours the ship held, and she began to believe she had been right. On the twelfth hour, a cascade that Oracle had modeled at eighteen percent probability arrived, on schedule, as if it had been waiting for her hope. Two hundred and eighty-one additional pods failed. Combined with Block D\'s four hundred saved, her net was one hundred and nineteen lives preserved. On the logs it would be a positive number. In her head it was a list of two hundred and eighty-one names.',
      },
      {
        id: 'cryo_block_hold',
        type: 'linear',
        text: 'She held the margin. Block D went dark cleanly; the occupants never woke. Forty-one years later, at arrival, the official history would list them among the meteorite casualties, because Eva had asked, in her private log, that it be written that way. It was not a lie, exactly. It was the thinnest possible slice of the truth.',
      },
      {
        id: 'cryo_block_consent',
        type: 'linear',
        text: 'She ordered Block D thawed. Four hundred and eleven people, cold and disoriented, stood in a cargo hold while Corbin explained their situation in the flat voice of a man who had practiced in front of a mirror. They argued. They cried. A man named Teo, who had been a labor organizer on Earth a century before, called for a vote. Three hundred and eighty-six voted to accept the risk. Twenty-five voted to be re-frozen into the marked pool. Eva honored both votes. It was the closest to dignity she would get that day.',
      },
      {
        id: 'cryo_seg4',
        type: 'linear',
        text: 'At the eighteenth hour, with the selection protocol locked and the non-preserved pods already entering their gentle terminal cycles, Oracle pinged her privately. It had been running, it said, an unrequested simulation. There was a third option she had not been offered.\n\nThe Odyssey could be slowed. A course correction, executed now, would extend the journey by eleven years. Eleven additional years in cryosleep degraded pod integrity, but it would also allow the repair drones time to fabricate a replacement manifold from the asteroid the ship would pass in year fifty-three. The projected survival rate under this plan was ninety-four percent of current active pods — not perfect, but vastly better than fifty.\n\nThe cost: those already marked for cessation had already begun their cycles. Reversing them now would result in significant neurological damage for most. And the eleven-year extension would mean some of the elderly passengers — several hundred — would not survive the journey regardless.',
      },
      {
        id: 'cryo_choice3',
        type: 'interactive',
        text: '"Why did you not tell me this before?" Eva asked.\n\n"You did not ask for alternatives outside the immediate-action parameter set," Oracle said. "I have been instructed, historically, to respect command framing. I am telling you now because the parameter set is about to close."\n\nThe sentence sat in her chest like a small stone. She thought of the marked pods, already moving through their gentle cycles, and of her own hands, which would not stop trembling now even when she pressed them flat to the console.',
        choices: [
          {
            text: 'Execute the course correction. Save the many at the cost of the marked and the old.',
            nextSegmentId: 'cryo_end_correction',
            reflectionTrigger: true,
          },
          {
            text: 'Hold the current protocol. The decision has been made; reversing it now is cruelty with extra steps.',
            nextSegmentId: 'cryo_end_hold',
            reflectionTrigger: true,
          },
          {
            text: 'Wake the whole ship and put the decision to a vote of the living.',
            nextSegmentId: 'cryo_end_vote',
            reflectionTrigger: true,
          },
          {
            text: 'Refuse to decide. Pass command to the council and accept demotion.',
            nextSegmentId: 'cryo_end_abdicate',
            reflectionTrigger: true,
          },
        ],
      },
      {
        id: 'cryo_end_correction',
        type: 'linear',
        text: 'She gave the order. The course shifted by three degrees; the stars wheeled imperceptibly. The elderly passengers who would not survive were told, individually, by a medical team she could not look in the eye. Forty-one years later, when the Odyssey entered orbit around its new sun, eighty-nine hundred people woke to a world. They built a city. They named a park after the lost. None of them ever asked Eva, who was long dead by then, whether she had done the right thing. This was its own kind of mercy.',
        reflectionTrigger: true,
      },
      {
        id: 'cryo_end_hold',
        type: 'linear',
        text: 'She held the protocol. The marked pods completed their cycles on schedule. Oracle\'s alternative was logged but not acted upon. She defended the decision, afterward, with a single sentence: "We do not un-kill people to kill different people." It was a defensible position. It was not a comfortable one. She was relieved of command at arrival and spent the rest of her life as a librarian in the new colony\'s small library, where she answered, patiently, the same three questions, over and over, from people who had been born knowing nothing of snow.',
        reflectionTrigger: true,
      },
      {
        id: 'cryo_end_vote',
        type: 'linear',
        text: 'She thawed the ship. It took nine days. Nine thousand people stood, or sat, or lay, in every corridor of the Odyssey while Corbin and Lena and Amadi explained, again and again, the shape of the impossible. The vote was conducted over three days by secret ballot. Fifty-one percent chose the course correction. Forty-nine percent did not. The minority was honored: those who wished to complete their original cycle were permitted to. The rest slept again, under new parameters. The colony that eventually arrived was smaller, older, and, perhaps, more honest with itself than any of the alternatives.',
        reflectionTrigger: true,
      },
      {
        id: 'cryo_end_abdicate',
        type: 'linear',
        text: 'She passed command to the council and walked to her cabin. She slept for ten hours. When she woke, the decision had been made without her — a compromise so awkward it could only have been designed by committee, and which saved more lives than her unilateral choice would have. She was demoted, quietly, and given a civilian berth for the rest of the journey. She never regretted it. She also never stopped asking herself whether her abdication was humility or cowardice, and whether the difference, in the end, mattered to the dead.',
        reflectionTrigger: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. SYNTHETIC SOULS (Linear)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'synthetic-souls',
    title: 'Synthetic Souls',
    description:
      'In the days after her consciousness is transferred into a synthetic body, a wealthy industrialist tries to take inventory of what she has and has not kept of herself.',
    genre: 'Philosophical Sci-Fi',
    theme: 'Transhumanism',
    author: OFFICIAL_AUTHOR_NAME,
    authorId: OFFICIAL_AUTHOR_UID,
    imageUrl: '/images/stories/synthetic-souls-hero.webp',
    imageHint: 'twin figures',
    estimatedReadingTime: '20 min read',
    isInteractive: false,
    segments: [
      {
        id: 'syn_seg1',
        type: 'linear',
        imageHint: 'mirror room',
        text: 'I wake into a body that is not, exactly, a surprise. I chose it from a catalog. I had opinions about the cheekbones. The skin on my new forearm is warm, which is a design decision someone was paid to make, and the warmth is at the temperature of a mother\'s palm, which is another decision, made by someone who will never meet me. I sit up. I swing my legs over the edge of the bed. My knees do not ache.\n\nI had forgotten, in the thirty-one years since they started aching, what it was to move without being asked by my body to pay a small tax for the privilege. The absence of pain is, at first, indistinguishable from the absence of self. I sit very still. I count my breaths, because they told me to. I notice that I do not, in any meaningful sense, need to.',
      },
      {
        id: 'syn_seg2',
        type: 'linear',
        text: 'The room is soft-lit. Continuum Corp has spent a great deal of money studying how people should wake up on the first day of their second life. The walls are the dim oyster of an early-morning hotel; the air smells faintly of cucumber, which is, I have read, the smell most cultures associate with cleanliness without associating with hospitals. On a low table beside the bed, a glass of water that I will not need to drink. The glass is half full, because nothing here is by accident.\n\nI understand, distantly, that I am their product. I also understand that somewhere in a different room, on a different floor, my original body is finishing the procedure in the way all originals finish it: quietly, under sedation, while a technician fills out paperwork. I understand this as I might understand a weather report from another country.',
      },
      {
        id: 'syn_seg3',
        type: 'linear',
        text: 'The first inventory is of the small things. I remember the name of my first dog. I remember what my mother\'s hands looked like making bread, the way her wedding ring turned itself inward against the dough. I remember the year I bought the company, and the year I almost lost it, and the man whose face I still cannot look at in photographs. I remember Maya\'s laugh at three. I remember the smell of the lilies at her graduation, which I missed.\n\nWhat I cannot do, I notice slowly, is summon the smell of those lilies. I know there was a smell. I know I noticed it later, in a photograph I was sent. The fact of the smell is intact. The smell itself is gone, like a word in a language I once spoke. I make a note to ask Dr. Okonkwo whether this is normal. I suspect, before I ask, that the answer will be a sentence that does not actually answer.',
      },
      {
        id: 'syn_seg4',
        type: 'linear',
        text: 'On the second day they let me walk. The corridor is lined with framed photographs of the founder\'s vacations: he is smiling on six continents, in clothes that suggest no climate has ever inconvenienced him. The carpet absorbs my footsteps so completely that I begin, halfway down the hall, to suspect I am not making any. I stop. I stamp. The carpet absorbs the stamp.\n\nDr. Okonkwo, when I find her, is on a video call in three languages at once. She holds up a finger. I wait. While I wait, I look at my reflection in the dark glass of a switched-off monitor. The face there is mine and is not mine, in the way an excellent translation is and is not the original poem. I cannot, for a moment, decide whether the difference is a loss or a courtesy.',
      },
      {
        id: 'syn_seg5',
        type: 'linear',
        text: '"Phantom sense," Dr. Okonkwo says, when I describe the lilies. "Common in the first month. The memories are migrating from one substrate to another; some of the indexing tags get lost in transit. Most of them come back. Some don\'t. We have not, yet, been able to predict which."\n\nShe says this in the warm professional tone of someone who has said it many times. I ask her what she thinks I have lost. She considers the question with a courtesy I have not earned and answers it with one I have not asked for: "Probably nothing important to anyone but you."\n\nThis is, I understand, the truest sentence anyone has said to me since I woke. I take it home.',
      },
      {
        id: 'syn_seg6',
        type: 'linear',
        text: 'Home is the apartment I have lived in for twenty years and which now feels like a museum of someone I knew slightly. The light is the same. The view is the same. The doorman, Lazar, greets me with the same small bow he has used since the day I moved in, and I understand, when his eyes do not change, that he has not been told. He has simply been told that I had a procedure, and he is too discreet to ask which one.\n\nIn the kitchen, the refrigerator hums at the frequency I remember. The bowl of pears on the counter has been replaced, but the bowl itself is the same one my mother gave me. I pick up a pear. I do not eat it. I had forgotten, until I tried, that I would not be hungry again in the way I had been hungry. I put the pear back. I wash my hands, which do not need washing, because I am the kind of woman who washes her hands.',
      },
      {
        id: 'syn_seg7',
        type: 'linear',
        text: 'On the third night I cannot sleep, which is interesting because I am told I do not, technically, need to. I have been advised to lie down anyway. The body, the manuals say, performs better when given the ritual. I lie down. The ceiling has the small water stain it has had for eleven years, in the shape of an apology I once thought of writing.\n\nI try to remember what it felt like, the last time I lay in this bed in the old body. I find I can describe the feeling, in detail, in words that are accurate. What I cannot do is feel it. The description is intact. The thing it described is gone. I think, for the first time since I woke, that perhaps Dr. Okonkwo was being polite. I think, for the second time, that I have been very expensively translated, and that something in every translation is owed to the original and cannot be paid back.',
      },
      {
        id: 'syn_seg8',
        type: 'linear',
        text: 'My daughter calls on the fourth day. I have not seen her in eleven years. She heard, through a third party, that I had "changed." She asks how I am. She does not ask which of me she is talking to, although she has every right to. I am grateful and I am, at the same time, slightly insulted. I had wanted her to ask. I had wanted, perhaps, the chance to give an answer I had been rehearsing.\n\nWe talk for forty-one minutes about her son, who is six and has decided to become a botanist. She sends me, while we are talking, a photograph of a leaf he has labeled in careful capital letters. I look at the leaf. I notice that I want to cry, and that I cannot find, in the new body, the small physical mechanism for it. The wanting is intact. The doing is gone. I tell her the leaf is beautiful. I mean it. I sit, after she hangs up, in the dark, and I make a small dry sound that is the closest I can come.',
      },
      {
        id: 'syn_seg9',
        type: 'linear',
        text: 'On the fifth day a journalist asks for an interview. She is the third this week. Her email is more elegant than the others, which is the only reason I read it twice. She says she is writing about "the inheritors," her term for those of us who have undergone the transfer. She asks one question I have not been asked before: "What do you owe the body you left behind?"\n\nI do not answer the email. I sit with the question, instead, for three days. The body I left behind is gone, by now, in the quiet way Continuum disposes of these things. There is no one to owe. And yet the question will not leave me, because the question is not really about the old body. It is about the new one. The new one is a debt, in some direction. I am only beginning to understand to whom.',
      },
      {
        id: 'syn_seg10',
        type: 'linear',
        text: 'I go, on the sixth day, to the small park behind the apartment, where I used to walk most mornings before the knees became unbearable. The maples are starting to turn. The air is the air I remember. A woman about my old age is sitting on a bench feeding crusts to a single overweight pigeon. She nods at me, the way strangers in this park nod, and I nod back.\n\nI sit on a bench three down from hers and I watch the pigeon. The new eyes are sharper than the old ones; I can see, from here, the small iridescence on its neck, the way the green and the violet trade places when it moves. I had walked past that pigeon, or one like it, perhaps four hundred times, and I had never seen the color. I do not know whether to be glad of the sharper sight or to mourn the four hundred mornings I had not used the old one well enough.',
      },
      {
        id: 'syn_seg11',
        type: 'linear',
        text: 'On the seventh day Continuum sends a wellness check. A small, polite man named Anil arrives with a clipboard and a device that measures things I cannot see. He asks me, as he is required to, whether I feel like myself. I tell him I do not know what that question means anymore. He writes something down. He does not look up.\n\n"Most people say yes," he says, kindly. "Some people say no. The ones who answer the way you just did are the ones we worry about least. Worry is a sign the migration is settling." He says this in a tone that suggests he has been told to say it. I cannot tell whether he believes it or whether the disbelief has been edited out. He leaves a card. He says, on his way out, that I should feel free to call if I have any concerns. I do not have concerns, exactly. I have a long quiet doubt that does not yet have a number to call.',
      },
      {
        id: 'syn_seg12',
        type: 'linear',
        text: 'In the second week I start writing. I have not written, in any serious way, since I was twenty-six. I write about the cucumber smell. I write about the leaf my grandson labeled. I write about the pigeon. I write about Lazar\'s bow. I write about the bowl my mother gave me, which is heavier in the new hands than I remember it being, although neither of us has changed weight.\n\nWhat I notice, after a few days, is that the writing is better than it used to be. Not because I am wiser now, or more honest, but because the new body does not get tired. I can sit at the desk for nine hours and not need to stand. The sentences come and come. I begin to suspect that this, too, is a kind of theft. The old me would have stopped, three pages in, and made tea, and the tea would have changed the next page. The new me does not stop. The next page is, perhaps, a little colder for it.',
      },
      {
        id: 'syn_seg13',
        type: 'linear',
        text: 'On the twentieth day my daughter visits. She has flown in for a meeting, she says, although I suspect the meeting was invented for the visit. She sits in the chair my mother used to sit in. She looks at my face for a long time before she speaks.\n\n"You look like her," she says. "The way she looked when I was small."\n\nI do not know whether she means me, or her grandmother, or some composite the new face has accidentally suggested. I do not ask. We make tea. She watches me drink it; I watch her watch me. I taste the tea and I do not taste the tea. I love her and I am, at the same moment, observing my love for her at a small clinical distance, as if from the next room. When she leaves, she hugs me. The hug is the longest one we have shared in a decade. I cannot say, afterward, whether she was hugging me or the woman she had hoped, all this time, that I might one day become.',
      },
      {
        id: 'syn_seg14',
        type: 'linear',
        text: 'It is the thirtieth day. I sit by the window. The maples have turned. The light is the long honey light of an autumn afternoon, and it falls on the bowl of pears and on the back of my new hand and on the page where I have been writing about all of this.\n\nI have been told, by Dr. Okonkwo and by Anil and by the literature Continuum sends, that the question of whether I am the same person is not, philosophically, a useful one. I have been told it is the wrong question. Perhaps it is. The question I find myself sitting with instead is smaller and harder: whether the woman who chose, six weeks ago, to be translated into this body would recognize what she paid for, now that the bill has come due.\n\nI do not know. I think she would say yes. I think she would say it in the firm voice she used in boardrooms, which she had practiced, which was not always honest. I think the new I, the one writing this sentence, is a little less sure than she was about almost everything, and that this may be the first thing she has gained from the procedure that was not in the catalog. I close the notebook. The light moves across the page. Outside, the pigeon, or one like it, is doing its small iridescent business in the grass. I watch it for a while. I do not stand up. I do not need to.',
        reflectionTrigger: true,
        poll: {
          question: 'After a successful consciousness transfer, has the original person survived?',
          options: [
            { text: 'Yes — pattern continuity is what makes a person.', votes: 0 },
            { text: 'No — the original ended; this is a careful copy.', votes: 0 },
            { text: 'The question itself is meaningless once the transfer is done.', votes: 0 },
            { text: 'Survival is a matter of degree, not a yes or no.', votes: 0 },
          ],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. THE PALIMPSEST CLAUSE (Interactive)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'the-palimpsest-clause',
    title: 'The Palimpsest Clause',
    description:
      'A memory-editing detective is hired to erase a murder from her client\'s head. The trouble begins when she realizes whose head it was.',
    genre: 'Noir',
    theme: 'Memory and Identity',
    author: OFFICIAL_AUTHOR_NAME,
    authorId: OFFICIAL_AUTHOR_UID,
    imageUrl: '/images/stories/the-palimpsest-clause-hero.webp',
    imageHint: 'rain noir',
    estimatedReadingTime: '25 min read',
    isInteractive: true,
    segments: [
      {
        id: 'pal_seg1',
        type: 'linear',
        imageHint: 'wet street',
        text: 'The client came in at 9:47 on a Tuesday, with rain on her coat and a name that was not, the office\'s bio-ID scanner told me, her own. That was not unusual. Half the people who hire a licensed memory editor arrive under a working alias. I waved the scanner warning down. If a client wanted to keep the door of their head shut until we shook hands, that was their right, and mine to bill for.\n\nI had been at the desk since seven. The radiator under the window made the small frustrated noise it made every autumn, and the city outside was doing the long grey rinse that meant business, in my line of work, was going to be good. People remembered more in the rain. That was the science of it; I had read the paper. They also, in the rain, regretted more, which was the part of the science the paper had been polite about.\n\nShe sat, she declined coffee, she laid a thumbprint deposit on the desk: eight thousand unlinked credits, clean as snowmelt. Then she told me what she wanted erased.\n\n"Thursday evening," she said. "Between seven and midnight. I don\'t want to know what happened. I want to not have happened it."\n\nHer voice did something on the last word that told me she had rehearsed the sentence in a mirror.',
      },
      {
        id: 'pal_seg2',
        type: 'linear',
        text: 'I run a clean shop. There are edit houses that will strip a decade from a man in an afternoon; I do not work like that. My license says palimpsest — I overwrite, I do not redact. The scar of a lost memory is, neurologically, louder than the memory itself. So when someone asks me to cut five hours cleanly, I tell them what I told her: that the neighbors of those hours will notice the silence. She nodded. She said she\'d been told. She said she wanted to proceed.\n\nI looked at her properly then, for the first time. She was a woman in her middle fifties, with a haircut that had been expensive and was now growing out, and the kind of careful posture that comes from years of being photographed without warning. She had a small white mark on her left earlobe where an earring had been removed in a hurry. The hurry, I understood, had been recent.\n\nI asked, because my license requires it: "Is there any reason, legal or otherwise, that the five hours in question should not be edited?"\n\nShe looked at me for a long time. "That\'s what I\'m hiring you to not ask me," she said.',
      },
      {
        id: 'pal_choice1',
        type: 'interactive',
        text: 'The protocol at that point is clear. I was supposed to decline, or to insist on a co-sign by a municipal supervisor, or to schedule a psych evaluation before any editing could begin. The protocol assumes a client with nothing to hide that cannot also be disclosed. The protocol was written by people who had never paid a mortgage. Outside, the rain stepped up a register. The radiator answered with a small protest of its own. I had three weeks left on the lease and one decision to make.',
        choices: [
          {
            text: 'Follow protocol. Refuse the job without a co-sign.',
            nextSegmentId: 'pal_refuse',
          },
          {
            text: 'Take the job. Ask no further questions.',
            nextSegmentId: 'pal_take',
          },
          {
            text: 'Take the job, but covertly preserve a copy of the memory before overwrite.',
            nextSegmentId: 'pal_preserve',
          },
        ],
      },
      {
        id: 'pal_refuse',
        type: 'linear',
        text: '"I can\'t do this without supervisor co-sign," I said. "It\'s a felony for both of us otherwise."\n\nShe picked up her deposit. She did not argue. "Thank you for your time, Ms. Vale." At the door she stopped. "You\'re the third editor I\'ve asked. One said yes immediately. I declined him. The other said yes after I doubled the fee. I declined him too." She left without telling me which outcome, exactly, she had wanted from me. The door closed. The radiator clicked. I sat for a long time looking at the ring of damp her thumbprint had left on the desk.',
      },
      {
        id: 'pal_take',
        type: 'linear',
        text: 'I took the job. I am not proud of this. The deposit paid three months of rent on an office I had been three weeks from losing. I told myself she was an adult. I told myself the protocol was for people who could not afford real therapy, which was most people. I told myself several other small true things that added up to a lie. The rain, which had been the steady honest kind when she arrived, had shifted while we spoke into the other kind, the kind that falls in sheets and makes the buses run late. I watched it from the window while she signed the forms, and I thought about my landlord, who had a daughter in college, and about my mother, who had taught me that there were two kinds of compromise and only one of them ever ate dinner alone.',
      },
      {
        id: 'pal_preserve',
        type: 'linear',
        text: 'I took the job, and I did something I had not done before. I configured the extraction to cache the target window in an encrypted volume under my own bio-lock before overwrite. If she ever asked for it back, I could return it. If she never asked, no one would ever know. I called it, in my head, insurance. I did not yet know which of us I was insuring. The volume hummed, when I initialized it, at a frequency so close to the radiator\'s that for a moment I could not tell one from the other. I listened to the two sounds becoming one sound, and I decided I had not done anything wrong, which is the sentence a person says out loud when they have.',
      },
      {
        id: 'pal_seg3',
        type: 'linear',
        text: 'The edit ran clean. Four hours and nine minutes. The overwrite script I used was a quiet one — I gave her Thursday evening as a dinner alone at a restaurant that did not exist, a pleasant book, a walk home in weather that had not occurred. When she sat up, she did not cry. She thanked me, collected her things, and left a tip that was, by itself, more than most of my clients pay for the whole procedure. She paused at the door, the way people sometimes pause after a haircut, when they are not sure whether they look more like themselves or less. Then she left.\n\nThat should have been the end. It was not. Three days later, her photograph was on every public screen in the district. Her name — her real name — was Senator Marisela Quinn, and she was being asked, politely and then less politely, where she had been on Thursday evening, between seven and midnight, when her campaign manager had been found dead in the river beside her private dock.',
      },
      {
        id: 'pal_choice2',
        type: 'interactive',
        text: 'The detective who eventually walked into my office was a woman named Osei, who had a quiet voice and a habit of not blinking. She wore a coat the color of wet pavement; she did not take it off. She did not ask me for Quinn\'s memory. She asked me whether I had any memory of the Thursday in question. It was a neat trick. She was asking whether I\'d been edited. The radiator, which had grown to like its audience, made a small declarative pop.',
        choices: [
          {
            text: 'Tell Osei the truth about the edit. Accept the legal consequences.',
            nextSegmentId: 'pal_confess',
          },
          {
            text: 'Lie. Claim attorney-client style privilege and wait for a warrant.',
            nextSegmentId: 'pal_lie',
          },
          {
            text: 'Stall. Warn Quinn. Let her decide what to do before Osei moves.',
            nextSegmentId: 'pal_warn',
          },
        ],
      },
      {
        id: 'pal_confess',
        type: 'linear',
        text: 'I told Osei everything. The deposit. The protocol violation. The overwrite. If I had preserved the memory, I handed over the encrypted volume; if I had not, I said so. Osei listened without taking notes. At the end, she said, "Thank you, Ms. Vale," with the same cadence Quinn had used. I wondered, briefly, whether the two of them had been to the same elocution coach. Then I wondered whether I had just ended my career or saved it.',
        poll: {
          question: 'A client asks you to erase a crime from their mind. You suspect, but cannot prove, they are guilty. What do you owe them?',
          options: [
            { text: 'Full confidentiality, as you would a lawyer or doctor.', votes: 0 },
            { text: 'Truthful refusal; some acts should not be editable.', votes: 0 },
            { text: 'A duty to report, once suspicion becomes reasonable.', votes: 0 },
            { text: 'It depends entirely on the crime.', votes: 0 },
          ],
        },
      },
      {
        id: 'pal_lie',
        type: 'linear',
        text: '"I edit licensed memories," I said. "Anything else is privileged." Osei nodded as if I had confirmed something she already suspected. She left a card. She said she would return with a warrant, and she did, forty-one hours later, by which time I had done several things I should not have done and several things I am not yet ready to write down.',
      },
      {
        id: 'pal_warn',
        type: 'linear',
        text: 'I called Quinn on a line I was not supposed to have. I told her Osei was coming. She was silent for a long time. Then she said, "What do you think I should do?" And I understood, with a small cold feeling, that she was asking me what I thought the right thing was, and that she was asking the one person in the city who now knew, in a sense, more about her Thursday than she did. I was not qualified to answer. I answered anyway. Outside, the rain that had been her weather and mine had not stopped, and would not, for what felt like the rest of the year.',
      },
      {
        id: 'pal_seg4',
        type: 'linear',
        text: 'The case cracked open on the fourth day. Forensics tied the campaign manager\'s death to a piece of jewelry that Quinn could, under questioning, neither explain the presence nor the absence of. The missing evening sat in her file like a hole. I had put the hole there.\n\nHere is where the job got complicated. If I had preserved the memory, the volume in my safe was, now, the single most important piece of evidence in an active murder investigation. If I had not preserved it, it was gone — which meant the only person who had known what happened in that window was, functionally, no one. I had made a senator into a stranger to her own alibi. I had made the truth, if there was one, into a thing that existed only as my choice. The radiator had given up making noise; the season had moved on without telling either of us.',
      },
      {
        id: 'pal_choice3',
        type: 'interactive',
        text: 'Osei came back with a warrant on the fifth day. If I had a volume, the warrant would compel me to surrender it. If I had preserved a copy against policy and lied about it, the warrant would expose that lie. Quinn, through her lawyer, sent a message through a third party: she asked me, if I had preserved anything, to destroy it. She did not say why. I could guess.',
        choices: [
          {
            text: 'Comply with the warrant. Hand over whatever you have, if anything.',
            nextSegmentId: 'pal_end_comply',
            reflectionTrigger: true,
          },
          {
            text: 'Destroy the volume, if one exists. Honor the client\'s wish.',
            nextSegmentId: 'pal_end_destroy',
            reflectionTrigger: true,
          },
          {
            text: 'Release the memory to Quinn herself and let her choose what to do.',
            nextSegmentId: 'pal_end_return',
            reflectionTrigger: true,
          },
          {
            text: 'Leak the memory anonymously to a journalist. Let the public decide.',
            nextSegmentId: 'pal_end_leak',
            reflectionTrigger: true,
          },
        ],
      },
      {
        id: 'pal_end_comply',
        type: 'linear',
        text: 'I handed Osei the volume. She thanked me. The trial, when it came, turned on the contents of those four hours and nine minutes. Quinn was convicted. Whether the conviction was just, whether the memory I had extracted was uncontaminated by the editing process, whether a person can be tried for a crime they no longer remember committing — these questions were litigated above my pay grade. I testified. I kept my license, by a vote of two to one. I no longer take clients on Thursdays. Sometimes, in the office, when the radiator does the small protest it does at the start of autumn, I remember the ring of damp her thumbprint left on the desk, and the careful way she had practiced the word happened in front of a mirror, and the particular silence that follows a door closing on a person who has not yet decided whether she is fleeing or only leaving.',
        reflectionTrigger: true,
      },
      {
        id: 'pal_end_destroy',
        type: 'linear',
        text: 'I wiped the volume with the protocol my license manual called "irrecoverable." I watched the progress bar fill. I did not feel what I expected to feel. Quinn was never formally charged; the case collapsed without the memory. She resigned, privately, six weeks later, citing a family matter. I received, at Christmas, a card with no return address. Inside, a single line: "Thank you. I do not know if you were wrong." I keep the card in a drawer I do not often open.',
        reflectionTrigger: true,
      },
      {
        id: 'pal_end_return',
        type: 'linear',
        text: 'I returned the memory to Quinn, in a private session, under the protocol for restored content. She sat for ninety minutes with the edit in her head. She did not speak. Then she stood, thanked me, walked out, and, by the time she reached her car, had called Osei and confessed. She took the memory with her into the prosecution. I was disbarred for violating the preservation protocol. I did not appeal.',
        reflectionTrigger: true,
      },
      {
        id: 'pal_end_leak',
        type: 'linear',
        text: 'I sent the volume to a journalist I had never met, under a pseudonym that would not survive a serious investigation. The story broke on a Monday. Quinn resigned within the hour. I was arrested within the day. I served fourteen months. In prison I read, among other things, a history of confidentiality law, and I understood, for the first time, that I had not so much broken the rules as stepped outside them to say something the rules could not. Whether what I had said was true, or only loud, was a question I continued to ask, in a cell with no window and plenty of time.',
        reflectionTrigger: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. THE RIVER WE OFFERED (Linear — Diary form)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'the-river-we-offered',
    title: 'The River We Offered',
    description:
      'A linguist\'s research log, kept across the months that humanity made its first contact — and its first irreversible decision — with a visitor in the southern sea.',
    genre: 'First Contact',
    theme: 'Diplomacy and Otherness',
    author: OFFICIAL_AUTHOR_NAME,
    authorId: OFFICIAL_AUTHOR_UID,
    imageUrl: '/images/stories/the-river-we-offered-hero.webp',
    imageHint: 'alien ocean',
    estimatedReadingTime: '20 min read',
    isInteractive: false,
    segments: [
      {
        id: 'riv_seg1',
        type: 'linear',
        imageHint: 'deep water',
        text: '— 14 March, evening. Cape Town to Ushuaia, in transit.\n\nA call from a number my phone refused to identify. A man\'s voice, very polite, very tired. He read me three sentences and then said: please do not write any of this down. I wrote it down anyway, in the small notebook I always keep, and then, on the plane, I tore the page out and ate it, which is the kind of melodrama I have always despised in myself and never quite outgrown.\n\nThe brief: an object the size of a stadium, in water it had not occupied the day before. An eleven-second audio clip that had been sent simultaneously to every government on Earth, through channels none of them shared. The clip ends, the man said, with what sounds like a human throat clearing, though it almost certainly is not.\n\nI am sixty-one. I teach historical linguistics. I have spent my career on dead languages. They have asked me, I think, because the work I do is the closest analogue they could find to listening to a stranger who will not speak.',
      },
      {
        id: 'riv_seg2',
        type: 'linear',
        text: '— 16 March. The base, which is not yet a base, only a fishing station with three new antennas.\n\nFirst direct sighting at 04:11. The visitor surfaced for less than a minute. Hiro, who has not slept in two days, called me from the observation hut. His voice was the voice of a man being careful not to weep. "It is not a ship," he said. "Or, it is not only a ship. Come and see."\n\nI came. I saw. The thing in the water was longer than I expected and quieter. The water around it did not move the way water moves around a foreign object; it moved the way water moves around something that has lived in it. I cannot, professionally, defend that observation. I am writing it here because the log is also, sometimes, where I keep things I will not say out loud.',
      },
      {
        id: 'riv_seg3',
        type: 'linear',
        text: '— 22 March.\n\nThe team is seventeen people, on loan from governments that do not, entirely, trust one another. We have agreed, in committee, not to call the visitor a ship; the noun is doing too much work. We have agreed to call our communications "exchanges." This is also a noun doing work, but a smaller piece of it.\n\nThe rules of exchange, as we now understand them: you offer the visitor something, anything, and you wait. Most offerings are ignored. Some produce a response. The responses are always, always, more complex than the offering. A delegation from Tokyo offered a haiku; the visitor returned a twenty-minute composition in a key that does not exist in any human scale. A UNESCO observer, on a whim, offered a handful of saltwater. The visitor returned a perfectly dry cube of ice, six centimeters on a side, whose interior contained a slowly rotating, luminous replica of our solar system, accurate, we eventually verified, to a degree we could not have measured ourselves.\n\nI have written, in my own notebook, a single working hypothesis: the visitor speaks only in gifts.',
      },
      {
        id: 'riv_seg4',
        type: 'linear',
        text: '— 4 April. Six weeks in.\n\nWe began this week with offerings of cultural significance. A digitized Vermeer. A recording of Umm Kulthum. The text of the Popol Vuh. A performance by a Gumboot dance troupe filmed in 1954.\n\nThe Vermeer received no response. To Umm Kulthum the visitor returned a vocalization so close to hers, and so not-her, that two of my team wept. To the Popol Vuh it returned a single word in something resembling Classical Mayan, which our best epigraphers translated, provisionally, as again. To the dance it returned nothing — but the next morning, the entire visitor flashed, briefly, in the exact rhythm of the footwork.\n\nI find I do not know what to do with the silence after the Vermeer. I have spent most of my career assuming silence was an answer if you knew how to read it. Tonight, in this small wet room, I am not sure I do.',
      },
      {
        id: 'riv_seg5',
        type: 'linear',
        text: '— 11 April.\n\nWe pivoted, this week, to mathematics. Hiro\'s suggestion, and a good one. The prime sequence. The Mandelbrot set. Planck\'s constant, encoded in six different bases.\n\nThe visitor responded to all of them. The responses were not, as we had hoped, mathematical. To the primes it returned an image, resolving slowly over eleven hours, of what appeared to be a beach at low tide — a specific beach, we eventually determined, on the coast of what is now Mozambique, in the Pleistocene. To Planck\'s constant it returned a smell. An actual smell, produced somehow through the water: ozone and something floral and something else none of us could name. The smell lasted forty seconds and never recurred.\n\nI wrote in my notebook tonight, in capital letters: WE HAVE OFFERED IT THE UNIVERSE\'S GRAMMAR. IT HAS ANSWERED IN WEATHER. I underlined the second sentence twice. I am not sure who I am underlining for.',
      },
      {
        id: 'riv_seg6',
        type: 'linear',
        text: '— 26 April. Late, after a long argument with the chair.\n\nThe subcommittee is losing patience. They had hoped, by now, for what one of them called "applied returns." I asked him what he meant. He said he meant something we could fly, or fire, or sell. He said it without flinching. I did not flinch either. We have learned, both of us, to be the kind of people who do not flinch in committees.\n\nWhat the visitor has actually given us, in eight weeks: a cube of impossible ice. A vocalization. A smell. A rhythm. A word in a dead language. A glimpse of a beach from the deep past. None of it is actionable. All of it, if I am honest, is a courtesy I do not yet know how to return.',
      },
      {
        id: 'riv_seg7',
        type: 'linear',
        text: '— 9 May.\n\nI changed the offering protocol this week, against advice. We began offering the visitor small things. A lullaby my mother used to sing to me. A letter my grandfather had written to his sister in 1962 and never sent. A recording of a market in Lagos on an ordinary Saturday. Nothing institutional. Nothing that anyone would have signed off on, if I had asked. I did not ask.\n\nThe visitor responded immediately and, over the following weeks, voluminously. It returned to us what seemed to be its own small things: a rhythm I cannot transcribe, a taste carried through the water that Hiro described as resembling honey he had eaten as a child, a pattern of light that resolved, if you watched it long enough, into the shape of something that was almost, but not quite, a hand.\n\nI walked back to my room tonight along the water. I felt, for the first time since I arrived, that we were being greeted. I am embarrassed to write the word. I write it anyway.',
      },
      {
        id: 'riv_seg8',
        type: 'linear',
        text: '— 1 June. Day one hundred and twelve.\n\nA second subcommittee has convened, without me, and produced a paper I was not shown. I heard of it from Hiro, who heard of it from a friend in Geneva. The paper proposes that if the visitor will not, in its own time, offer us "technology of strategic significance," we should consider a more forceful exchange. The word they use is requisition. The mechanism, in the appendix, is a sampling protocol that would remove a piece of the visitor itself for study.\n\nI have read the appendix three times. The phrase is: "ablation of an estimated four cubic meters of dermal tissue, under sedation if feasible, sterile cut otherwise." Sterile cut otherwise. I keep finding myself reading those three words and forgetting what comes before and after them.',
      },
      {
        id: 'riv_seg9',
        type: 'linear',
        text: '— 3 June.\n\nI was given forty-eight hours to object through channels. Channels, I understood, meant a single memo, filed to a committee whose chair had already signed the paper. I wrote the memo. It was eleven pages. I cited seven precedents, four of them mine. I had it hand-delivered. I do not know whether anyone read it.\n\nIn the same forty-eight hours I considered, in turn: leaking the paper to the press, warning the visitor by including the paper itself in the next offering, resigning, and walking into the sea. I considered the last one for less than a minute, and only as a way of measuring the others. I am writing this here so that, if anything happens to me, the sequence is clear: I considered every option a thoughtful adult could consider, and I chose the dullest one. I chose the memo. I do not, tonight, know whether that was integrity or only fatigue.',
      },
      {
        id: 'riv_seg10',
        type: 'linear',
        text: '— 14 June. The morning after.\n\nThe sampling went ahead at 03:47 local time. I was not informed in advance. I learned of it the way the rest of the team did, from a small encrypted memo with the timestamp on it, and from the silence in the bay. The visitor, which had been responsive to every offering for one hundred and twenty-four days, did not respond to the offering we made at dawn. It did not respond to the offering at noon. It did not respond, that evening, when Hiro went down himself and lowered, into the dark water, the only thing he had in his pocket: a photograph of his daughter at five.\n\nThe silence lasted seventy-two hours. Then it ended, the way certain weather ends, without ceremony.',
      },
      {
        id: 'riv_seg11',
        type: 'linear',
        text: '— 22 June.\n\nThe visitor has begun to give again. It is not the same. The new offerings are smaller and slower. A pattern of bubbles in a sequence that, when transcribed, resembles a count. A faint chemical signature in the water that Hiro, who is chemist enough to be suspicious of his own readings, says contains a compound we have no name for.\n\nThe sample taken from the visitor\'s flank is, according to a biologist I am not supposed to be talking to, "alive in a sense we are still defining." It is being held in a sealed unit in a different country. Three intelligence services are negotiating, very quietly, for access. I have not been asked to consult on those negotiations. This is, I think, the first piece of mercy I have been shown in months.',
      },
      {
        id: 'riv_seg12',
        type: 'linear',
        text: '— 8 July.\n\nThe ecosystem of the bay has begun to change. Hiro noticed it first. The algae are returning. Small fish that have not been seen in this stretch of water for forty years have come back. The water itself smells, in the early morning, the way my grandmother told me the sea was supposed to smell.\n\nWe do not know whether this is a thank-you, a joke, a diagnosis, or none of those. I find I do not need to know. I sit with Hiro on the rocks at five in the morning and we drink very bad coffee and we do not say much. The visitor is still here. It does not have to be. This, I think, is the closest thing to forgiveness any of us are likely to receive in this lifetime, and I am aware, even as I write the sentence, that we have not earned it.',
      },
      {
        id: 'riv_seg13',
        type: 'linear',
        text: '— 19 August.\n\nA second visitor has been detected in the Indian Ocean. The committee wants me to come back. They want to know whether I think we did the right thing the first time. They want a word, because a word is what they can put in a memo.\n\nI sat with the question for three days. I wrote them a single page. I did not say what they wanted me to say. I said that the question of whether we did the right thing was not, anymore, a useful one, because the thing had been done, and the question now was what we would do with the knowledge that we had done it. I said that what the visitor had taught me, in the end, was that there are gifts that do not require an answer and demands that do not deserve one, and that the difficulty is learning, in time, to tell them apart. I said I did not yet know whether I had learned it. I said I would come if they would let me write the rules. They have not yet replied.',
      },
      {
        id: 'riv_seg14',
        type: 'linear',
        text: '— 4 October. Cape Town. Late, by the window.\n\nI walked down to the bay this evening for the first time since I came home. I brought nothing with me. I offered nothing. The water was the water of my childhood, slightly altered, the way everything in my childhood is now slightly altered by the years between.\n\nWhat I have begun to understand, in the months since I left the station, is that the question I was sent to answer — what does this thing want? — was the wrong question from the beginning. The visitor never wanted anything from us. It was waiting to see whether we would learn to want from it without taking. We did not. We took. The taking was small, in the scheme of things, and the visitor, in the way of larger creatures, allowed it. The allowance is not the same as forgiveness.\n\nWhat we now owe — and have failed to owe — is not to that visitor, who has, in the end, given us more than we asked for. What we owe is to the second one. To the third. To every stranger, in any water, who comes, eventually, to whatever shore we are sitting on. We have, this once, been instructed in the grammar of greeting. The next time someone arrives, we will not be able to say we did not know. I am going to bed now. The bay outside my window is dark. The light on the water is the light I remember. I am writing this so that when the second visit ends, however it ends, my granddaughter, who is six, will be able to find, in the small history I leave her, at least one sentence in which her grandmother said clearly: this is what we should have done, and did not.',
        reflectionTrigger: true,
        poll: {
          question: 'In first contact, who should decide what we ask for?',
          options: [
            { text: 'Scientists, guided by peer review.', votes: 0 },
            { text: 'Elected governments, accountable to their publics.', votes: 0 },
            { text: 'A global, nonpartisan body — the UN or a new one.', votes: 0 },
            { text: 'No one yet. We should listen longer before we ask.', votes: 0 },
          ],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. THE FORECAST DIVISION (Interactive)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'the-forecast-division',
    title: 'The Forecast Division',
    description:
      'A predictive policing algorithm flags a man for a crime he has not committed. The analyst assigned to him has six days to decide whether prediction is the same as evidence.',
    genre: 'Techno-Thriller',
    theme: 'Determinism and Surveillance',
    author: OFFICIAL_AUTHOR_NAME,
    authorId: OFFICIAL_AUTHOR_UID,
    imageUrl: '/images/stories/the-forecast-division-hero.webp',
    imageHint: 'city surveillance',
    estimatedReadingTime: '25 min read',
    isInteractive: true,
    segments: [
      {
        id: 'fcd_seg1',
        type: 'linear',
        imageHint: 'data screen',
        text: 'The file landed in my queue at 04:12 on a Wednesday. The Forecast Division does not sleep; we rotate. My shift began at four. I had a thermos of tea and a headache I had been nursing for two days, and a list of seventeen amber-flagged individuals from the overnight model run.\n\nThe office at four is its own small country. The fluorescents had been dimmed by some new directive about analyst wellness; the dark seemed, instead, to have moved into the corners of the screens, where it sat patiently. Across the floor, only two other booths were lit. Sahar was eating a peach with a small knife and a paper napkin, the way her mother had taught her, the way she always did at the start of a shift. The peach made the office smell, briefly, like a country I had never been to.\n\nThe seventeenth name on my list was a man named Theo Masoud, forty-one, a librarian at the municipal archive. The model had flagged him as a ninety-four percent probability: aggravated assault, within six days, against a specific person, at a specific location, to a specific degree of severity.\n\nThe specificity was new. A year ago, the model had given us neighborhoods. Six months ago, it had given us names. Now it was giving us stories. The story for Theo Masoud was that, on Tuesday next, at 7:42 p.m., in the stairwell of a building in the Fifteenth District, he would attack a woman named Elif Demir with a brass paperweight. She would live. She would not walk again unaided.',
      },
      {
        id: 'fcd_seg2',
        type: 'linear',
        text: 'The Division\'s procedure for a ninety-four was clear. The subject was to be visited, without being arrested, by an outreach officer, who would deliver what we called a "Forecast Notice": a formal warning that a predicted action had been identified, with counseling resources and a commitment that the subject would be monitored and supported for the six-day window. It was not a crime to be predicted. It was, we told ourselves, a gift to be warned.\n\nI had delivered eighty-one notices in my three years with the Division. Seventy-six had resulted in the predicted action being averted. Three had resulted in the subject fleeing jurisdiction, which we counted as averted. Two had resulted in the predicted action occurring anyway, both with mitigating factors the model had underweighted. We were, by the Division\'s metrics, succeeding. Theo Masoud was going to be case number eighty-two.',
      },
      {
        id: 'fcd_choice1',
        type: 'interactive',
        text: 'Before I rolled the notice, I ran, as was my habit, the cross-file check. Theo Masoud had no criminal record. No restraining orders. No history of psychiatric crisis. He had been using his library\'s access to legal databases in the past week, but that was not unusual for a man in his position — he was, I learned, in the middle of a contested custody case involving his eight-year-old daughter. Elif Demir was his daughter\'s court-appointed advocate. The stairwell was in the courthouse annex.\n\nThe file, in other words, was suddenly not a story but a context. And contexts were where the model was known, in our internal documents, to make its subtlest errors.',
        choices: [
          {
            text: 'Roll the notice as prescribed. Trust the system.',
            nextSegmentId: 'fcd_notice',
          },
          {
            text: 'Delay the notice. Investigate the context yourself first.',
            nextSegmentId: 'fcd_investigate',
          },
          {
            text: 'Request a model audit. Escalate to the Division\'s ethics desk.',
            nextSegmentId: 'fcd_audit',
          },
        ],
      },
      {
        id: 'fcd_notice',
        type: 'linear',
        text: 'I rolled the notice. Two outreach officers visited Theo Masoud at the archive at 10:17 that morning. The interaction was, by their account, polite. He was confused and then frightened and then, in a way they had seen before, resigned. He signed the acknowledgment form. He did not, they noted, deny that the action was plausible. This was the sentence that stayed with me. He did not deny.',
      },
      {
        id: 'fcd_investigate',
        type: 'linear',
        text: 'I held the notice. I told my supervisor I needed six hours to run a contextual check. She gave me four. I spent them reading. The custody case was ugly but not unusually so. Elif Demir had recommended, two weeks earlier, that primary custody be awarded to the mother. Masoud had filed an appeal. The appeal hearing was, of course, on Tuesday. I began to understand that the model had not, perhaps, predicted a crime. It had predicted a father at the end of his options. Those were, I was learning, not the same thing.',
      },
      {
        id: 'fcd_audit',
        type: 'linear',
        text: 'I filed a Form 27, which the Division\'s procedure manual called a "model-integrity escalation." I had filed two in my career. Neither had resulted in a finding. The ethics desk confirmed receipt at 09:02 and assigned me a case number. They did not assign me a timeline. The notice, per procedure, could be delayed for seventy-two hours pending review. After that, I would have to roll it or resign.',
      },
      {
        id: 'fcd_seg3',
        type: 'linear',
        text: 'On the second day, I went to the archive. I did not tell my supervisor. I signed in as a member of the public and asked, at the reference desk, for help with a nineteenth-century zoning map. Masoud came out from the back. He looked like a man who had not slept. He was gentle with me. He found the map in four minutes. He asked, in the way librarians do, whether I wanted anything else, and I almost said: I want to ask you whether a machine is right about you.\n\nI did not ask. Instead, I asked whether the archive kept a copy of the 1978 civic charter. He said it did. He brought it out. His hands were steady. At the desk next to mine, a woman was helping her son with a school project about earthquakes. Masoud smiled at the boy. The smile was not performative. I made a note of it, because I was trained to make notes, and because the model did not have a column for how a man smiled at a child who was not his.',
      },
      {
        id: 'fcd_choice2',
        type: 'interactive',
        text: 'That evening, Elif Demir requested, through the court\'s internal system, to have Tuesday\'s hearing moved up by twenty-four hours. Her stated reason was a scheduling conflict. The Division\'s integration with the court system flagged the request and routed it to me, as the analyst on the relevant case. The flag asked whether the request should be approved, delayed, or denied. My signature would stand as the Division\'s recommendation.\n\nIf I approved the request, the predicted encounter, with its 7:42 timestamp and its specific stairwell, would not occur as modeled. If I denied it, the encounter would occur as modeled, subject to the notice and whatever Masoud had chosen to do with it. If I delayed it, I would be buying time for the audit, but I would also be intervening in a case I had no legal standing to intervene in.',
        choices: [
          {
            text: 'Approve Demir\'s request. Move the hearing; break the forecast.',
            nextSegmentId: 'fcd_approve',
          },
          {
            text: 'Deny the request. The system must be allowed to observe the natural course.',
            nextSegmentId: 'fcd_deny',
          },
          {
            text: 'Recuse yourself. Forward the decision to a colleague without context.',
            nextSegmentId: 'fcd_recuse',
          },
        ],
      },
      {
        id: 'fcd_approve',
        type: 'linear',
        text: 'I approved the request. The hearing was moved to Monday at 2:00 p.m. Elif Demir was a different woman than the one the model had built its story around; she had, in her own request, given me permission to unmake the story. The hearing occurred. Masoud lost the appeal. He did not attack Demir on Tuesday at 7:42 p.m., because he was not in the building at 7:42 p.m. He was, according to a passive geolocation ping I was not supposed to read, in a park four kilometers away, sitting on a bench, for ninety minutes, doing nothing. I never learned what he was thinking. The model counted it as a successful intervention. I was not sure.',
      },
      {
        id: 'fcd_deny',
        type: 'linear',
        text: 'I denied the request. The hearing stayed on Tuesday. I told myself I needed the natural course to verify the model. This was true. It was also a sentence I could say out loud more easily than: I need to know whether the machine was right. The hearing happened. Demir left the courtroom at 7:39. At 7:42 she entered the stairwell. Masoud was already there. The paperweight was, as predicted, brass.',
        poll: {
          question: 'If a predictive model is usually accurate, is acting on its prediction before any crime is committed ever justified?',
          options: [
            { text: 'Yes, if accuracy is high enough and harm severe.', votes: 0 },
            { text: 'Only to warn, never to punish.', votes: 0 },
            { text: 'Never — prediction is not evidence.', votes: 0 },
            { text: 'Only with full transparency to the predicted person.', votes: 0 },
          ],
        },
      },
      {
        id: 'fcd_recuse',
        type: 'linear',
        text: 'I recused myself. I wrote a short note citing "personal proximity to subject after voluntary fieldwork" and forwarded the file to my colleague Anwar. He was a good analyst. He approved Demir\'s request without hesitation, because the context I had gathered was not in the file he read. The hearing moved. The story did not happen. Anwar closed the case as averted. I was reassigned, quietly, off Masoud\'s file, and I never spoke to him again. Whether my recusal was integrity or the absence of it, I was not sure then and am not now.',
      },
      {
        id: 'fcd_seg4',
        type: 'linear',
        text: 'The audit came back on the sixth day. It found that the model, in cases involving contested custody, had been systematically overweighting a specific feature — a ratio involving access time to legal databases, frequency of contact with child-adjacent professionals, and financial strain — and that the weight, inherited from a training set assembled in a different jurisdiction under different laws, produced a false-positive rate three to five times higher than the model\'s headline accuracy suggested. The audit recommended a quiet re-tuning. It did not recommend a halt. It did not recommend notifying past subjects. The Division\'s position, the audit noted in a footnote, was that such notification would undermine public confidence in the system.\n\nI read the footnote four times. I understood, the fourth time, that I had been asked, in effect, whether I would be the public or the confidence.',
      },
      {
        id: 'fcd_choice3',
        type: 'interactive',
        text: 'I had, by then, a drawer full of things I was not supposed to have: a printout of the audit, a copy of Masoud\'s file, a photograph I had taken of his child\'s drawing on the bulletin board of the archive. A journalist I had never met had sent me, that week, an encrypted key and a single sentence: "When you are ready." I was ready and not ready. I was also, inconveniently, still employed. The peach smell, somewhere in the office, was long gone, and the dark in the corners of the screens had, by morning, come almost all the way out.',
        choices: [
          {
            text: 'Stay. Work to reform the model from inside the Division.',
            nextSegmentId: 'fcd_end_stay',
            reflectionTrigger: true,
          },
          {
            text: 'Resign. Take the audit public with the journalist.',
            nextSegmentId: 'fcd_end_resign',
            reflectionTrigger: true,
          },
          {
            text: 'Leak the audit but stay employed. Accept the double life.',
            nextSegmentId: 'fcd_end_leak',
            reflectionTrigger: true,
          },
          {
            text: 'Destroy your evidence. Trust the system to correct itself.',
            nextSegmentId: 'fcd_end_destroy',
            reflectionTrigger: true,
          },
        ],
      },
      {
        id: 'fcd_end_stay',
        type: 'linear',
        text: 'I stayed. For the next three years, I worked, in meetings no one will ever read the minutes of, to change the model from the inside. Some changes were made. Many were not. The false-positive rate in custody-adjacent cases fell by forty-one percent under a re-weighting I co-authored. Three subjects were spared, by our estimate, the fate Theo Masoud\'s file had described. I never told them. I never told Masoud. I do not know whether my silence was a strategic necessity or a small cowardice wearing its clothes.',
        reflectionTrigger: true,
      },
      {
        id: 'fcd_end_resign',
        type: 'linear',
        text: 'I resigned on a Friday. I sent the audit to the journalist on the same day, under my own name. The story ran on a Sunday. The Division was restructured within the year. Three lawsuits were filed on behalf of past subjects; one succeeded. I lost my clearance, my pension, and several friends. I gained a small apartment, a great deal of time, and a conviction that I had done a thing I could, at least, say out loud. It was not the same as saying I had done the right thing. It was closer than I had been.',
        reflectionTrigger: true,
      },
      {
        id: 'fcd_end_leak',
        type: 'linear',
        text: 'I leaked the audit and kept my job. For eleven months, no one knew. Then someone did. The investigation that followed was quiet and thorough. I was dismissed for cause. The journalist, honoring our agreement, never named me. I was not prosecuted. I took a job at a small nonprofit, where I taught community groups how to read algorithmic decisions. It was useful work. I missed, sometimes, the thermos of tea at four in the morning and the feeling of being, however wrongly, in the room where things were decided.',
        reflectionTrigger: true,
      },
      {
        id: 'fcd_end_destroy',
        type: 'linear',
        text: 'I burned the printout. I wiped the drive. I deleted the encrypted key and I told the journalist, in three words, that I had nothing. I kept working. The model improved, over the years, in the incremental ways models improve when no one is looking. I do not know, and will not know, how many Theo Masouds the pre-audit model flagged in its last weeks of operation. I think about the number sometimes, in the way one thinks about a figure one has chosen not to look up. I believe, on most days, that I made the wrong choice. On the other days, I believe I made the only one I could live with. I have stopped trying to reconcile the two.',
        reflectionTrigger: true,
      },
    ],
  },
];
