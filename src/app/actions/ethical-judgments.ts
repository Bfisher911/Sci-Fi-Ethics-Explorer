'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import {
  recordEthicalJudgmentEvent as recordEthicalJudgmentWithStore,
  type RecordEthicalJudgmentInput,
} from '@/lib/ethical-judgment/recording';
import { aggregateEthicalProfile } from '@/lib/ethical-judgment/aggregation';
import { scoreEthicalJudgment } from '@/ai/flows/score-ethical-judgment';
import type { EthicalJudgmentEvent, EthicalProfileAggregate } from '@/types';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function toDate(field: Timestamp | Date | string | number | undefined | null): Date {
  if (!field) return new Date();
  if (field instanceof Date) return field;
  if (typeof (field as Timestamp).toDate === 'function') return (field as Timestamp).toDate();
  if (typeof field !== 'string' && typeof field !== 'number') return new Date();
  const parsed = new Date(field);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function eventFromDoc(id: string, data: Record<string, any>): EthicalJudgmentEvent {
  return {
    id,
    userId: data.userId,
    interactionType: data.interactionType,
    sourceContentType: data.sourceContentType,
    sourceContentId: data.sourceContentId,
    sourceTitle: data.sourceTitle,
    promptText: data.promptText,
    userChoice: data.userChoice,
    responseText: data.responseText,
    selectedOptionId: data.selectedOptionId,
    explanation: data.explanation,
    analysis: data.analysis,
    affectsProfile: data.affectsProfile === true,
    activityContext: data.activityContext,
    courseId: data.courseId,
    moduleId: data.moduleId,
    modelUsed: data.modelUsed,
    promptVersion: data.promptVersion,
    rawResponse: data.rawResponse,
    createdAt: toDate(data.createdAt),
  };
}

export async function getUserEthicalJudgmentEvents(
  userId: string,
): Promise<ActionResult<EthicalJudgmentEvent[]>> {
  if (!userId) return { success: false, error: 'User ID is required.' };
  try {
    const q = query(
      collection(db, 'ethicalJudgmentEvents'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((docSnap) => eventFromDoc(docSnap.id, docSnap.data())),
    };
  } catch (error) {
    console.error('[ethical-judgments] getUserEthicalJudgmentEvents error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to fetch ethical judgment events: ${message}` };
  }
}

export async function getUserEthicalProfile(
  userId: string,
): Promise<ActionResult<EthicalProfileAggregate>> {
  if (!userId) return { success: false, error: 'User ID is required.' };
  try {
    const profileSnap = await getDoc(doc(db, 'ethicalProfiles', userId));
    if (profileSnap.exists()) {
      return {
        success: true,
        data: {
          ...(profileSnap.data() as EthicalProfileAggregate),
          userId,
          updatedAt: toDate(profileSnap.data().updatedAt),
        },
      };
    }
    const events = await getUserEthicalJudgmentEvents(userId);
    if (!events.success) return events;
    const profile = aggregateEthicalProfile(userId, events.data);
    await setDoc(doc(db, 'ethicalProfiles', userId), {
      ...profile,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: profile };
  } catch (error) {
    console.error('[ethical-judgments] getUserEthicalProfile error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to fetch ethical profile: ${message}` };
  }
}

export async function recordEthicalJudgmentEvent(
  input: RecordEthicalJudgmentInput,
): Promise<ActionResult<{ event: EthicalJudgmentEvent; profile: EthicalProfileAggregate }>> {
  if (!input.userId) return { success: false, error: 'User ID is required.' };
  try {
    let enrichedInput = input;
    if (!input.analysis) {
      const scoring = await scoreEthicalJudgment({
        promptText: input.promptText,
        userChoice: input.userChoice,
        responseText: input.responseText,
        explanation: input.explanation,
        sourceTitle: input.sourceTitle,
        interactionType: input.interactionType,
        frameworkWeights: input.frameworkWeights,
      });
      if (scoring.success) {
        enrichedInput = {
          ...input,
          analysis: scoring.analysis,
          modelUsed: scoring.modelUsed,
          promptVersion: scoring.promptVersion,
        };
      }
    }

    const result = await recordEthicalJudgmentWithStore(enrichedInput, {
      writeEvent: async (event) => {
        await setDoc(doc(db, 'ethicalJudgmentEvents', event.id), {
          ...event,
          createdAt: serverTimestamp(),
        });
      },
      loadUserEvents: async (userId) => {
        const events = await getUserEthicalJudgmentEvents(userId);
        if (!events.success) return [];
        return events.data;
      },
      writeProfile: async (profile) => {
        await setDoc(
          doc(db, 'ethicalProfiles', profile.userId),
          {
            ...profile,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      },
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('[ethical-judgments] recordEthicalJudgmentEvent error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to record ethical judgment: ${message}` };
  }
}

export async function recalculateEthicalProfileForUser(
  userId: string,
): Promise<ActionResult<EthicalProfileAggregate>> {
  const events = await getUserEthicalJudgmentEvents(userId);
  if (!events.success) return events;
  const profile = aggregateEthicalProfile(userId, events.data);
  await setDoc(
    doc(db, 'ethicalProfiles', userId),
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return { success: true, data: profile };
}
