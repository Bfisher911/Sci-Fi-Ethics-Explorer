'use server';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  getUserEthicalJudgmentEvents,
  getUserEthicalProfile,
} from '@/app/actions/ethical-judgments';
import { getFrameworkDisplayName } from '@/lib/ethical-framework-registry';
import type { EthicsLearningReport } from '@/types';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

const CHALLENGE_QUESTIONS = [
  'What tradeoff do you keep accepting without noticing it?',
  'Whose perspective tends to disappear when you make fast decisions?',
  'When do you protect rules, and when do you bend them for outcomes?',
  'What kinds of harm feel visible to you, and what kinds feel abstract?',
  'Which ethical framework makes you uncomfortable, and why?',
  'What would change your mind in a similar scenario?',
  'Which decision would you defend publicly, and which one would you quietly revise?',
];

function sentenceList(items: string[]): string {
  if (items.length === 0) return 'none yet';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export async function generateEthicsLearningReport(
  userId: string,
): Promise<ActionResult<EthicsLearningReport>> {
  if (!userId) return { success: false, error: 'User ID is required.' };

  const profileResult = await getUserEthicalProfile(userId);
  if (!profileResult.success) return { success: false, error: profileResult.error };
  const eventsResult = await getUserEthicalJudgmentEvents(userId);
  if (!eventsResult.success) return { success: false, error: eventsResult.error };

  const profile = profileResult.data;
  const events = eventsResult.data.filter((event) => event.affectsProfile);
  const strongest = profile.strongestFrameworks
    .filter((item) => item.score > 0)
    .slice(0, 4)
    .map((item) => `${getFrameworkDisplayName(item.frameworkId)} (${Math.round(item.score)})`);
  const leastUsed = profile.leastUsedFrameworks
    .slice(0, 4)
    .map((item) => getFrameworkDisplayName(item.frameworkId));
  const examples = events.slice(0, 4).map((event) => {
    const choice = event.userChoice || event.responseText || event.explanation || 'Open-ended response';
    return `- ${event.sourceTitle}: ${choice.toString().slice(0, 180)}`;
  });
  const tensions = profile.frameworkTensions.slice(0, 4).map((tension) => {
    return `- ${tension.frameworks.map(getFrameworkDisplayName).join(' vs. ')}: ${tension.description}`;
  });

  const markdown = `# Ethics Learning Report

Generated: ${new Date().toLocaleDateString()}

This report summarizes patterns in your OffWorld Clause activity. It is an interpretive learning signal, not a fixed label about who you are.

## Activity Included

${profile.eventCount} ethical judgment event${profile.eventCount === 1 ? '' : 's'} analyzed across ${sentenceList(profile.contentAreasIncluded)}.

## Overall Pattern

Your responses in these activities tend to emphasize ${sentenceList(strongest.length ? strongest : ['emerging ethical reasoning patterns'])}. This means your choices often foreground those values in the scenarios you have completed so far.

## Frameworks Used Less Often

Frameworks appearing less often in your current pattern: ${sentenceList(leastUsed)}. These are good places to stretch, not weaknesses.

## Ethical Tensions

${tensions.length ? tensions.join('\n') : '- No recurring framework tensions have enough evidence yet.'}

## Decisions That Shaped This Profile

${examples.length ? examples.join('\n') : '- Complete more stories, debates, media reflections, or Weekly Clause responses to generate examples.'}

## How Your Choices Shift By Context

Your profile combines stories, debates, media scenarios, framework exploration, and weekly dilemmas when available. As more contexts appear, the system can distinguish whether your reasoning changes between personal care, public policy, rights, long-term risk, and uncertain technology.

## Questions To Challenge Your Pattern

${CHALLENGE_QUESTIONS.map((question) => `- ${question}`).join('\n')}

## Recommended Next Moves

- Revisit one framework you used less often and apply it to a decision you already made.
- Try a Sci-Fi Media Ethical Scenario Reflection and answer against your first instinct.
- Reply to a Weekly Clause peer whose answer makes a different tradeoff than yours.

## Closing Reflection

The goal is not to become a single framework. The goal is to notice what your reasoning protects, what it risks overlooking, and how your judgment changes when the stakes, voices, and time horizon change.`;

  const reportRef = await addDoc(collection(db, 'ethicalReports'), {
    userId,
    title: 'Ethics Learning Report',
    generatedAt: serverTimestamp(),
    eventCount: profile.eventCount,
    contentAreasIncluded: profile.contentAreasIncluded,
    markdown,
    profileSnapshot: profile,
  });

  return {
    success: true,
    data: {
      id: reportRef.id,
      userId,
      title: 'Ethics Learning Report',
      generatedAt: new Date(),
      eventCount: profile.eventCount,
      contentAreasIncluded: profile.contentAreasIncluded,
      markdown,
      profileSnapshot: profile,
    },
  };
}
