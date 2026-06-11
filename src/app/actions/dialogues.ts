'use server';

/**
 * Dialogue server actions — persona library reads, conversation
 * persistence, and assessment submission.
 *
 * Assessment submission is the only path that can award a dialogue
 * certificate: the AI evaluation, the pass decision
 * (`computeAssessmentResult`), the activity report, the ethical-journey
 * event, and certificate issuance all run server-side in this module.
 * The client only ever receives the result.
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getAllDialoguePersonas,
  getDialoguePersona,
  isDialogueCategory,
  personaActivityId,
  personaCertificateId,
  toPublicPersona,
  type DialogueCategory,
  type DialogueMode,
  type PublicDialoguePersona,
} from '@/lib/dialogues/personas';
import {
  computeAssessmentResult,
  MIN_ASSESSMENT_STUDENT_TURNS,
  type AssessmentResult,
} from '@/lib/dialogues/rubric';
import {
  evaluatePersonaAssessment,
  type PersonaAssessmentEvaluation,
} from '@/ai/flows/evaluate-persona-assessment';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; errorCode?: string };

const SESSIONS = 'dialogueSessions';

export interface DialogueMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DialogueSession {
  id: string;
  userId: string;
  category: DialogueCategory;
  personaId: string;
  personaName: string;
  mode: DialogueMode;
  messages: DialogueMessage[];
  updatedAt: Date | null;
}

export interface DialogueProgressEntry {
  activityId: string;
  category: DialogueCategory;
  personaId: string;
  passed: boolean;
  scorePercent?: number;
  attempts: number;
}

function sanitizeId(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function sessionDocId(
  userId: string,
  category: DialogueCategory,
  personaId: string,
  mode: DialogueMode
): string {
  return sanitizeId(`${userId}__${category}__${personaId}__${mode}`);
}

// ─── Library reads ───────────────────────────────────────────────────

/**
 * Client-safe persona list (no prompt material) plus, when a user id is
 * provided, that user's dialogue progress derived from activity reports.
 */
export async function getDialogueLibrary(userId?: string): Promise<
  ActionResult<{
    personas: PublicDialoguePersona[];
    progress: Record<string, DialogueProgressEntry>;
  }>
> {
  try {
    const personas = getAllDialoguePersonas().map(toPublicPersona);
    const progress: Record<string, DialogueProgressEntry> = {};
    if (userId) {
      const snap = await getDocs(
        query(
          collection(db, 'activityReports'),
          where('userId', '==', userId),
          where('activityType', '==', 'dialogue')
        )
      );
      for (const d of snap.docs) {
        const data = d.data();
        if (data.voided === true) continue;
        const activityId = String(data.activityId || '');
        const match = /^dialogue-(philosopher|scifi-author|scifi-media|framework)-(.+)$/.exec(
          activityId
        );
        if (!match) continue;
        const prev = progress[activityId];
        progress[activityId] = {
          activityId,
          category: match[1] as DialogueCategory,
          personaId: match[2],
          passed: prev?.passed || data.passed === true,
          scorePercent: Math.max(
            prev?.scorePercent ?? 0,
            typeof data.score === 'number' ? data.score : 0
          ),
          attempts: (prev?.attempts ?? 0) + (data.attempt ?? 1),
        };
      }
    }
    return { success: true, data: { personas, progress } };
  } catch (error) {
    console.error('[dialogues] getDialogueLibrary error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getPublicDialoguePersona(
  category: string,
  personaId: string
): Promise<ActionResult<PublicDialoguePersona>> {
  if (!isDialogueCategory(category)) {
    return { success: false, error: 'Unknown dialogue category.' };
  }
  const persona = getDialoguePersona(category, personaId);
  if (!persona) {
    return { success: false, error: 'This dialogue does not exist.' };
  }
  return { success: true, data: toPublicPersona(persona) };
}

// ─── Conversation persistence ────────────────────────────────────────

const MAX_STORED_MESSAGES = 80;

export async function saveDialogueSession(input: {
  userId: string;
  category: string;
  personaId: string;
  mode: DialogueMode;
  messages: DialogueMessage[];
}): Promise<ActionResult> {
  try {
    if (!input.userId) return { success: false, error: 'Sign in to save dialogues.' };
    if (!isDialogueCategory(input.category)) {
      return { success: false, error: 'Unknown dialogue category.' };
    }
    const persona = getDialoguePersona(input.category, input.personaId);
    if (!persona) return { success: false, error: 'This dialogue does not exist.' };

    const id = sessionDocId(input.userId, input.category, input.personaId, input.mode);
    await setDoc(
      doc(db, SESSIONS, id),
      {
        userId: input.userId,
        category: input.category,
        personaId: input.personaId,
        personaName: persona.displayName,
        mode: input.mode,
        messages: input.messages.slice(-MAX_STORED_MESSAGES),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[dialogues] saveDialogueSession error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getDialogueSession(
  userId: string,
  category: string,
  personaId: string,
  mode: DialogueMode
): Promise<ActionResult<DialogueSession | null>> {
  try {
    if (!userId || !isDialogueCategory(category)) {
      return { success: true, data: null };
    }
    const id = sessionDocId(userId, category, personaId, mode);
    const snap = await getDoc(doc(db, SESSIONS, id));
    if (!snap.exists()) return { success: true, data: null };
    const d = snap.data();
    // Defense in depth: the deterministic doc id embeds the userId, but
    // verify ownership anyway in case of a crafted id collision.
    if (d.userId !== userId) return { success: true, data: null };
    return {
      success: true,
      data: {
        id: snap.id,
        userId: d.userId,
        category: d.category,
        personaId: d.personaId,
        personaName: d.personaName || '',
        mode: d.mode === 'assessment' ? 'assessment' : 'open',
        messages: Array.isArray(d.messages)
          ? d.messages.filter(
              (m: any) =>
                m &&
                (m.role === 'user' || m.role === 'assistant') &&
                typeof m.content === 'string'
            )
          : [],
        updatedAt: timestampToDate(d.updatedAt) ?? null,
      },
    };
  } catch (error) {
    console.error('[dialogues] getDialogueSession error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Assessment submission ───────────────────────────────────────────

export interface SubmitAssessmentResult {
  result: AssessmentResult;
  evaluation: PersonaAssessmentEvaluation;
  certificateAwarded: boolean;
  certificateHash?: string;
}

export async function submitPersonaAssessment(input: {
  userId: string;
  userName: string;
  category: string;
  personaId: string;
  messages: DialogueMessage[];
}): Promise<ActionResult<SubmitAssessmentResult>> {
  try {
    if (!input.userId) {
      return { success: false, error: 'Sign in to submit an assessment.' };
    }
    if (!isDialogueCategory(input.category)) {
      return { success: false, error: 'Unknown dialogue category.' };
    }
    const persona = getDialoguePersona(input.category, input.personaId);
    if (!persona) {
      return { success: false, error: 'This dialogue does not exist.' };
    }
    const studentTurns = input.messages.filter((m) => m.role === 'user').length;
    if (studentTurns < MIN_ASSESSMENT_STUDENT_TURNS) {
      return {
        success: false,
        errorCode: 'too_short',
        error: `Engage with the scenario a bit longer first — the evaluation needs at least ${MIN_ASSESSMENT_STUDENT_TURNS} substantive responses from you.`,
      };
    }

    // 1. AI evaluation (server-side; no deterministic pass fallback).
    const evalOut = await evaluatePersonaAssessment({
      category: input.category,
      personaId: input.personaId,
      messages: input.messages,
    });
    if (!evalOut.evaluation) {
      return {
        success: false,
        errorCode: evalOut.errorCode,
        error: evalOut.error || 'Evaluation failed. Try again.',
      };
    }
    const evaluation = evalOut.evaluation;

    // 2. Pass decision lives in the tested rubric module, not the model.
    const result = computeAssessmentResult(
      evaluation.scores,
      evaluation.criticalMisunderstanding
    );

    const activityId = personaActivityId(input.category, input.personaId);

    // 3. Activity report (idempotent evidence record; retakes keep history).
    try {
      const { generateActivityReport } = await import('./activity-reports');
      await generateActivityReport({
        userId: input.userId,
        userName: input.userName || 'A student',
        activityType: 'dialogue',
        activitySubtype: input.category,
        activityId,
        activityTitle: `Dialogue assessment: ${persona.displayName}`,
        score: result.scorePercent,
        passed: result.passed,
        content: {
          rubricVersion: result.rubricVersion,
          scores: evaluation.scores,
          frameworksUsed: evaluation.frameworksUsed,
          strengths: evaluation.strengths,
          growthAreas: evaluation.growthAreas,
          summary: evaluation.summary,
        },
      });
    } catch (reportErr) {
      console.warn('[dialogues] activity report failed (non-fatal):', reportErr);
    }

    // 4. Ethical-journey event so the profile/moral-map reflects the work.
    try {
      const { recordEthicalJudgmentEvent } = await import('./ethical-judgments');
      const lastStudentTurn =
        [...input.messages].reverse().find((m) => m.role === 'user')?.content ?? '';
      const frameworkWeights: Record<string, number> = {};
      for (const f of evaluation.frameworksUsed) frameworkWeights[f] = 100;
      await recordEthicalJudgmentEvent({
        userId: input.userId,
        eventId: `dialogue_${sanitizeId(activityId)}_${input.userId}`,
        interactionType: 'persona_dialogue',
        sourceContentType: 'dialogue',
        sourceContentId: activityId,
        sourceTitle: `Dialogue: ${persona.displayName}`,
        promptText: `Assessment dialogue with ${persona.displayName}`,
        responseText: lastStudentTurn.slice(0, 2000),
        frameworkWeights,
        affectsProfile: true,
        activityContext: 'dialogue_assessment',
        modelUsed: 'gemini',
        promptVersion: result.rubricVersion,
      });
    } catch (journeyErr) {
      console.warn('[dialogues] journey event failed (non-fatal):', journeyErr);
    }

    // 5. Certificate — only on a pass, only server-side, idempotent.
    let certificateAwarded = false;
    let certificateHash: string | undefined;
    if (result.passed) {
      const { issueCertificate } = await import('./certificates');
      const certRes = await issueCertificate({
        userId: input.userId,
        userName: input.userName || 'A student',
        curriculumId: personaCertificateId(input.category, input.personaId),
        curriculumTitle: `Dialogue Certificate: ${persona.displayName}`,
        certificateType: 'achievement',
        description: `Awarded for passing the goal-based assessment dialogue with ${persona.displayName}.`,
        criteria:
          'Demonstrate understanding, application, tradeoff reasoning, reflection, evidence, and transfer in an assessed dialogue.',
        metadata: {
          dialogueCategory: input.category,
          personaId: input.personaId,
          scorePercent: result.scorePercent,
          rubricVersion: result.rubricVersion,
          frameworksDemonstrated: evaluation.frameworksUsed,
        },
      });
      if (certRes.success) {
        certificateAwarded = true;
        certificateHash = certRes.data.verificationHash;
      }

      // Category + master Explorer certificates piggyback on the
      // standard achievement engine.
      try {
        const { checkAndAwardCertificates } = await import(
          './achievement-certificates'
        );
        await checkAndAwardCertificates(input.userId);
      } catch (engineErr) {
        console.warn('[dialogues] category cert check failed (non-fatal):', engineErr);
      }
    }

    return {
      success: true,
      data: { result, evaluation, certificateAwarded, certificateHash },
    };
  } catch (error) {
    console.error('[dialogues] submitPersonaAssessment error:', error);
    return {
      success: false,
      error: 'Something went wrong submitting your assessment. Your conversation is saved — try again.',
    };
  }
}
