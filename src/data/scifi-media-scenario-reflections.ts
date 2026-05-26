import type {
  EthicalScenarioOption,
  EthicalScenarioQuestion,
  EthicalScenarioReflection,
  SciFiMedia,
} from '@/types';
import { normalizeFrameworkId } from '@/lib/ethical-framework-registry';

function keepKnownFrameworks(frameworkIds: string[]): string[] {
  return Array.from(
    new Set(
      frameworkIds
        .map((frameworkId) => normalizeFrameworkId(frameworkId))
        .filter((frameworkId): frameworkId is string => Boolean(frameworkId)),
    ),
  );
}

function option(
  id: string,
  label: string,
  text: string,
  frameworkWeights: Record<string, number>,
  possibleStrengths: string[],
  possibleRisks: string[],
  feedbackText: string,
): EthicalScenarioOption {
  return {
    id,
    label,
    text,
    frameworkWeights,
    likelyFrameworkAlignments: Object.keys(frameworkWeights),
    possibleStrengths,
    possibleRisks,
    feedbackText,
  };
}

function buildQuestion(
  media: SciFiMedia,
  id: string,
  title: string,
  prompt: string,
  options: EthicalScenarioOption[],
  relatedFrameworkIds: string[],
): EthicalScenarioQuestion {
  return {
    id,
    title,
    prompt,
    options,
    allowFreeResponse: true,
    scoringPrompt:
      'Score the learner response across every active ethical framework. Focus on reasoning, not personal labels.',
    feedbackPrompt:
      'Explain why multiple options are defensible and name the tradeoffs the learner accepted.',
    reflectionFollowUp: 'What would change your mind if the same situation affected someone with less power?',
    affectsEthicalProfile: true,
    relatedFrameworkIds: keepKnownFrameworks([...relatedFrameworkIds, ...(media.relatedFrameworks ?? [])]),
  };
}

export function getScenarioReflectionForMedia(media: SciFiMedia): EthicalScenarioReflection {
  const related = keepKnownFrameworks(media.relatedFrameworks ?? []);
  const primary = related[0] ?? 'utilitarianism';
  const secondary = related[1] ?? 'deontology';
  const themes = media.ethicsExplored?.slice(0, 3).join(', ') || 'technology ethics';

  return {
    mediaId: media.id,
    title: 'Ethical Scenario Reflection',
    description: `Ambiguous decisions inspired by ${media.title}, focused on ${themes}.`,
    questions: [
      buildQuestion(
        media,
        `${media.id}-public-release`,
        'Release Under Uncertainty',
        `A team has built a technology inspired by the ethical tensions in ${media.title}. Early evidence suggests it could help many people, but the harms are uncertain and may fall unevenly on vulnerable groups. What should the team do first?`,
        [
          option(
            'release-with-monitoring',
            'A',
            'Release it in a limited pilot with strong monitoring and the ability to stop quickly.',
            { utilitarianism: 80, 'pragmatist-ethics': 85, [primary]: 55 },
            ['Creates evidence while limiting exposure', 'Can reveal real harms earlier'],
            ['May treat affected people as test subjects', 'Pilot harms can still be serious'],
            'This option is defensible because it tries to learn from reality while limiting scale. Its risk is that a pilot can still shift burdens onto people with less power.',
          ),
          option(
            'pause-for-consent',
            'B',
            'Pause until the people most likely to be affected can give meaningful consent or refusal.',
            { deontology: 85, contractualism: 80, [secondary]: 55 },
            ['Protects autonomy', 'Makes affected people part of the decision'],
            ['May delay benefits', 'Consent processes can exclude quiet stakeholders'],
            'This option foregrounds respect and justification. Its blind spot is that delay can also harm people who need the benefit now.',
          ),
          option(
            'public-governance',
            'C',
            'Move the decision to a public body with transparent rules and representation.',
            { 'social-contract-theory': 85, 'discourse-ethics': 80 },
            ['Builds legitimacy', 'Creates shared accountability'],
            ['Can move slowly', 'Representation can become symbolic'],
            'This option treats legitimacy as part of the ethics, not an administrative detail. Its risk is that process can become a substitute for protection.',
          ),
          option(
            'care-first',
            'D',
            'Start with direct support for the people already harmed instead of scaling the technology.',
            { 'ethics-of-care': 85, 'ubuntu-ethics': 70, 'capabilities-approach': 65 },
            ['Notices concrete needs', 'Resists abstract tradeoff math'],
            ['May not solve the wider problem', 'Can underweight distant beneficiaries'],
            'This option values attention and repair before expansion. Its tradeoff is that broader benefits may wait while immediate relationships receive priority.',
          ),
        ],
        [primary, secondary, 'pragmatist-ethics', 'ethics-of-care'],
      ),
      buildQuestion(
        media,
        `${media.id}-moral-status`,
        'Moral Status at the Edge',
        `A new system or lifeform connected to the themes of ${media.title} shows signs of preference, distress, or agency, but experts disagree about what those signs mean. How should the community treat it while uncertainty remains?`,
        [
          option(
            'grant-provisional-rights',
            'A',
            'Grant provisional protections until there is better evidence.',
            { deontology: 85, contractualism: 65, 'buddhist-ethics': 55 },
            ['Avoids irreversible disrespect', 'Errs toward protection under uncertainty'],
            ['May grant rights too broadly', 'Can make urgent action harder'],
            'This option treats uncertainty as a reason for restraint. It may overprotect, but it avoids acting as if moral status must be proven beyond all doubt.',
          ),
          option(
            'measure-suffering',
            'B',
            'Prioritize evidence about suffering and welfare, then adjust protections as evidence improves.',
            { utilitarianism: 85, 'pragmatist-ethics': 75 },
            ['Targets concrete harm', 'Allows revision as evidence changes'],
            ['May miss dignity claims', 'Measurement can lag behind harm'],
            'This option is strong when the main concern is preventable suffering. Its risk is that what cannot be measured may still matter ethically.',
          ),
          option(
            'community-recognition',
            'C',
            'Create a deliberative process where affected groups decide what recognition is owed.',
            { 'discourse-ethics': 85, 'social-contract-theory': 70, cosmopolitanism: 60 },
            ['Builds shared reasons', 'Includes more than expert authority'],
            ['Can politicize recognition', 'May leave the vulnerable waiting'],
            'This option makes moral recognition a public question. It is defensible, but the process must not become a way to postpone protection.',
          ),
          option(
            'relationship-test',
            'D',
            'Begin with caretaking relationships and observe whether mutual responsibility develops.',
            { 'ethics-of-care': 85, 'ubuntu-ethics': 75, 'virtue-ethics': 55 },
            ['Attends to lived interaction', 'Sees moral status through relationship'],
            ['May privilege nearby cases', 'Can be less clear for law or policy'],
            'This option asks what relationship reveals. It may see things abstract tests miss, while still needing safeguards against favoritism.',
          ),
        ],
        ['deontology', 'utilitarianism', 'discourse-ethics', 'ethics-of-care'],
      ),
      buildQuestion(
        media,
        `${media.id}-future-costs`,
        'Costs Shifted Forward',
        `A decision around ${media.title}'s themes would benefit people now but transfer risk, maintenance, or ecological cost to future communities. Which position would you defend?`,
        [
          option(
            'future-welfare',
            'A',
            'Choose the path with the best long-term balance of welfare, including future people.',
            { utilitarianism: 80, cosmopolitanism: 65 },
            ['Counts distant and future lives', 'Keeps scale visible'],
            ['Can justify present sacrifice too easily', 'Forecasts can be fragile'],
            'This option keeps future people in the moral calculation. Its danger is treating present communities as numbers in a forecast.',
          ),
          option(
            'hard-limits',
            'B',
            'Set hard limits on what present people may impose on future people or ecosystems.',
            { deontology: 70, 'environmental-ethics': 85, 'natural-law': 55 },
            ['Protects against irreversible harm', 'Names duties across generations'],
            ['Can block beneficial innovation', 'Hard limits can be hard to define'],
            'This option refuses to treat future harm as merely discounted cost. The hard part is deciding which limits are truly nonnegotiable.',
          ),
          option(
            'adaptive-review',
            'C',
            'Proceed only with staged review, reversal plans, and public evidence thresholds.',
            { 'pragmatist-ethics': 85, 'social-contract-theory': 65, 'daoist-ethics': 55 },
            ['Keeps learning loops open', 'Builds accountability into the decision'],
            ['May not prevent irreversible thresholds', 'Can become procedural theater'],
            'This option fits uncertain technologies because it expects revision. It still needs clear stop points before damage becomes permanent.',
          ),
          option(
            'stewardship-first',
            'D',
            'Protect ecological and communal continuity even if the immediate benefit is smaller.',
            { 'environmental-ethics': 90, 'ubuntu-ethics': 65, 'ethics-of-care': 55 },
            ['Values more than present convenience', 'Protects relationships across time'],
            ['May underweight urgent present suffering', 'Can be difficult to compare against direct benefits'],
            'This option treats stewardship as a central duty. Its challenge is explaining when present suffering should override preservation.',
          ),
        ],
        ['environmental-ethics', 'utilitarianism', 'pragmatist-ethics', 'cosmopolitanism'],
      ),
    ],
  };
}
