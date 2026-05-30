'use server';

/**
 * Framework Explorer persistence + progressive unlock + unified
 * scoring.
 *
 * Two Firestore collections:
 *   - frameworkResponses/{userId_questionId}   raw answers (recalculable)
 *   - frameworkExplorerProgress/{userId}       module completion + unlock
 *
 * Responses also feed the UNIFIED ethical profile: each FE response is
 * convertible to the same EthicsJourneyEntry shape used by stories /
 * dilemmas / debates, so one scoring engine (src/lib/ethics/journey.ts)
 * aggregates every source. Raw responses are kept separate from any
 * generated report so profiles can always be recomputed from scratch.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import type {
  FrameworkExplorerProgress,
  FrameworkResponse,
  TechnologyTopic,
} from '@/types/framework-explorer';
import {
  QUESTIONS_PER_MODULE,
  TOTAL_MODULES,
  unlockedModuleNumbers,
  highestUnlocked,
} from '@/data/framework-explorer';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const RESPONSES = 'frameworkResponses';
const PROGRESS = 'frameworkExplorerProgress';

function sanitizeId(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export interface RecordFrameworkResponseInput {
  userId: string;
  questionId: string;
  moduleId: string;
  moduleNumber: number;
  optionId: string;
  frameworkWeights: Record<string, number>;
  technologyTopic: TechnologyTopic;
}

/**
 * Record (or overwrite) a single answer. Doc id is userId_questionId so
 * changing an answer updates rather than duplicates. Returns the
 * updated progress so the UI can react.
 */
export async function recordFrameworkResponse(
  input: RecordFrameworkResponseInput,
): Promise<ActionResult<{ moduleCompleted: boolean }>> {
  try {
    if (!input.userId || !input.questionId) {
      return { success: false, error: 'Missing user or question id.' };
    }
    const id = sanitizeId(`${input.userId}_${input.questionId}`);
    await setDoc(
      doc(db, RESPONSES, id),
      {
        userId: input.userId,
        questionId: input.questionId,
        moduleId: input.moduleId,
        moduleNumber: input.moduleNumber,
        optionId: input.optionId,
        frameworkWeights: input.frameworkWeights || {},
        technologyTopic: input.technologyTopic,
        recordedAt: serverTimestamp(),
      },
      { merge: true },
    );

    // Recompute module progress from raw responses (source of truth).
    const answered = await countAnsweredInModule(
      input.userId,
      input.moduleNumber,
    );
    const moduleCompleted = answered >= QUESTIONS_PER_MODULE;
    await updateProgressDoc(input.userId, input.moduleNumber, answered);

    return { success: true, data: { moduleCompleted } };
  } catch (error) {
    console.error('[framework-explorer] recordFrameworkResponse error:', error);
    return { success: false, error: String(error) };
  }
}

async function countAnsweredInModule(
  userId: string,
  moduleNumber: number,
): Promise<number> {
  const q = query(
    collection(db, RESPONSES),
    where('userId', '==', userId),
    where('moduleNumber', '==', moduleNumber),
  );
  const snap = await getDocs(q);
  return snap.size;
}

async function updateProgressDoc(
  userId: string,
  moduleNumber: number,
  answeredInModule: number,
): Promise<void> {
  const ref = doc(db, PROGRESS, userId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const completedModules: number[] = Array.isArray(data.completedModules)
    ? [...data.completedModules]
    : [];
  const moduleCompletedAt: Record<number, string> =
    (data.moduleCompletedAt as Record<number, string>) || {};
  const moduleProgress: Record<number, number> =
    (data.moduleProgress as Record<number, number>) || {};

  moduleProgress[moduleNumber] = answeredInModule;

  if (answeredInModule >= QUESTIONS_PER_MODULE) {
    if (!completedModules.includes(moduleNumber)) {
      completedModules.push(moduleNumber);
      moduleCompletedAt[moduleNumber] = new Date().toISOString();
    }
  }

  await setDoc(
    ref,
    {
      userId,
      completedModules,
      moduleCompletedAt,
      moduleProgress,
      unlockedThrough: highestUnlocked(completedModules),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getFrameworkProgress(
  userId: string,
): Promise<ActionResult<FrameworkExplorerProgress>> {
  try {
    if (!userId) {
      return {
        success: true,
        data: {
          userId: '',
          completedModules: [],
          moduleCompletedAt: {},
          moduleProgress: {},
          unlockedThrough: 1,
        },
      };
    }
    const snap = await getDoc(doc(db, PROGRESS, userId));
    const d = snap.exists() ? snap.data() : {};
    const completedModules: number[] = Array.isArray(d.completedModules)
      ? d.completedModules
      : [];
    return {
      success: true,
      data: {
        userId,
        completedModules,
        moduleCompletedAt: (d.moduleCompletedAt as Record<number, string>) || {},
        moduleProgress: (d.moduleProgress as Record<number, number>) || {},
        unlockedThrough: highestUnlocked(completedModules),
        updatedAt: timestampToDate(d.updatedAt as any)?.toISOString(),
      },
    };
  } catch (error) {
    console.error('[framework-explorer] getFrameworkProgress error:', error);
    return { success: false, error: String(error) };
  }
}

/** Which option (if any) the user already chose for each question in a module. */
export async function getModuleResponses(
  userId: string,
  moduleNumber: number,
): Promise<ActionResult<Record<string, string>>> {
  try {
    if (!userId) return { success: true, data: {} };
    const q = query(
      collection(db, RESPONSES),
      where('userId', '==', userId),
      where('moduleNumber', '==', moduleNumber),
    );
    const snap = await getDocs(q);
    const out: Record<string, string> = {};
    snap.forEach((dd) => {
      const data = dd.data() as { questionId?: string; optionId?: string };
      if (data.questionId && data.optionId) out[data.questionId] = data.optionId;
    });
    return { success: true, data: out };
  } catch (error) {
    console.error('[framework-explorer] getModuleResponses error:', error);
    return { success: false, error: String(error) };
  }
}

/** All of a user's FE responses (for unified scoring + recalculation). */
export async function getAllFrameworkResponses(
  userId: string,
): Promise<ActionResult<FrameworkResponse[]>> {
  try {
    if (!userId) return { success: true, data: [] };
    const q = query(collection(db, RESPONSES), where('userId', '==', userId));
    const snap = await getDocs(q);
    const out: FrameworkResponse[] = [];
    snap.forEach((dd) => {
      const data = dd.data() as Record<string, any>;
      out.push({
        questionId: String(data.questionId || ''),
        moduleId: String(data.moduleId || ''),
        moduleNumber: Number(data.moduleNumber ?? 0),
        optionId: String(data.optionId || ''),
        frameworkWeights: (data.frameworkWeights as Record<string, number>) || {},
        technologyTopic: data.technologyTopic as TechnologyTopic,
        recordedAt:
          timestampToDate(data.recordedAt as any)?.toISOString() ??
          new Date(0).toISOString(),
      });
    });
    return { success: true, data: out };
  } catch (error) {
    console.error('[framework-explorer] getAllFrameworkResponses error:', error);
    return { success: false, error: String(error) };
  }
}

/** Convenience: the set of unlocked module numbers for a user. */
export async function getUnlockedModules(
  userId: string,
): Promise<ActionResult<number[]>> {
  const res = await getFrameworkProgress(userId);
  if (!res.success) return res;
  return {
    success: true,
    data: unlockedModuleNumbers(res.data.completedModules).filter(
      (n) => n <= TOTAL_MODULES,
    ),
  };
}
