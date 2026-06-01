'use server';

import { getAdminDb } from '@/lib/firebase/admin';
import { recordEthicalJudgmentEvent } from '@/app/actions/ethical-judgments';
import {
  buildWeeklyDilemmaSlug,
  canViewWeeklyDilemmaPeerResponses,
  createEmptyWeeklyDilemmaLoadData,
  getIsoWeek,
  isMissingWeeklyDilemmaAdminCredentialsError,
  shouldCreateWeeklyDilemmaForWeek,
  WEEKLY_DILEMMA_ADMIN_CREDENTIALS_ERROR,
} from '@/lib/weekly-dilemmas';
import { shouldScoreDebateReply } from '@/lib/ethical-judgment/aggregation';
import type { WeeklyDilemma, WeeklyDilemmaReply, WeeklyDilemmaResponse } from '@/types';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function weeklyDb() {
  const adminDb = getAdminDb();
  if (!adminDb) {
    throw new Error(WEEKLY_DILEMMA_ADMIN_CREDENTIALS_ERROR);
  }
  return adminDb;
}

/**
 * Count how many weekly dilemmas a user has responded to. Powers the
 * "Ethical Dilemma Certificate" (respond to 12 dilemmas). Single-field
 * query — no composite index required. Returns 0 (never throws) when admin
 * credentials are unavailable so the certificate engine degrades gracefully.
 */
export async function countUserDilemmaResponses(userId: string): Promise<number> {
  if (!userId) return 0;
  try {
    const snap = await weeklyDb()
      .collection('weeklyDilemmaResponses')
      .where('userId', '==', userId)
      .get();
    return snap.size;
  } catch (error) {
    console.warn('[weekly-dilemmas] countUserDilemmaResponses failed:', error);
    return 0;
  }
}

function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function responseDocId(dilemmaId: string, userId: string): string {
  return `${dilemmaId}_${userId}`.replace(/[^\w.-]+/g, '_');
}

function dilemmaFromDoc(id: string, data: Record<string, any>): WeeklyDilemma {
  return {
    id,
    title: data.title || '',
    slug: data.slug || id,
    shortSetup: data.shortSetup || '',
    backgroundContext: data.backgroundContext || '',
    mainEthicalQuestion: data.mainEthicalQuestion || '',
    choices: data.choices || [],
    tags: data.tags || [],
    relatedFrameworks: data.relatedFrameworks || [],
    relatedTechnologies: data.relatedTechnologies || [],
    aiScoringPrompt: data.aiScoringPrompt || '',
    reflectionPrompt: data.reflectionPrompt || '',
    publishDate: toDate(data.publishDate),
    closeDate: data.closeDate ? toDate(data.closeDate) : undefined,
    visibilityStatus: data.visibilityStatus || 'draft',
    isoWeek: data.isoWeek || getIsoWeek(toDate(data.publishDate)),
    imageUrl: data.imageUrl,
    imageHint: data.imageHint,
    generatedAt: data.generatedAt ? toDate(data.generatedAt) : undefined,
  };
}

function responseFromDoc(id: string, data: Record<string, any>): WeeklyDilemmaResponse {
  return {
    id,
    dilemmaId: data.dilemmaId,
    userId: data.userId,
    userName: data.userName,
    selectedChoiceId: data.selectedChoiceId,
    responseText: data.responseText || '',
    ethicalJudgmentEventId: data.ethicalJudgmentEventId,
    createdAt: toDate(data.createdAt),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
  };
}

function replyFromDoc(id: string, data: Record<string, any>): WeeklyDilemmaReply {
  return {
    id,
    dilemmaId: data.dilemmaId,
    responseId: data.responseId,
    parentReplyId: data.parentReplyId,
    userId: data.userId,
    userName: data.userName,
    replyText: data.replyText || '',
    ethicalJudgmentEventId: data.ethicalJudgmentEventId,
    moderationFlag: data.moderationFlag,
    createdAt: toDate(data.createdAt),
  };
}

function buildGeneratedWeeklyDilemma(publishDate = new Date()): Omit<WeeklyDilemma, 'id'> {
  const topics = [
    {
      title: 'Neural Data in Public Schools',
      technology: 'brain-computer interfaces',
      setup: 'A school district is considering attention-monitoring headbands for high-stakes tutoring.',
      background:
        'The vendor says the devices can identify confusion, fatigue, and stress in real time. Parents are split: some see targeted help, while others worry that neural data will become another permanent student record.',
      question:
        'Should the district run a pilot program, reject the devices, or require a different governance model first?',
      tags: ['education', 'neural-data', 'privacy'],
    },
    {
      title: 'Synthetic Voices After Death',
      technology: 'voice cloning',
      setup: 'A hospital grief program can generate conversations with a deceased patient using old recordings.',
      background:
        'Clinicians say it may help some families process loss. Critics warn that consent, dependency, and commercial pressure are not yet understood.',
      question: 'Who should decide whether a synthetic voice can be used after someone dies?',
      tags: ['voice-cloning', 'grief-tech', 'consent'],
    },
    {
      title: 'Autonomous Delivery in Extreme Heat',
      technology: 'delivery robotics',
      setup: 'A city wants to replace gig-worker deliveries with autonomous robots during dangerous heat waves.',
      background:
        'The policy could reduce worker heat exposure, but it may also eliminate income for workers who need those shifts and increase surveillance on public sidewalks.',
      question: 'What would make this policy ethically acceptable, if anything?',
      tags: ['labor', 'automation', 'climate'],
    },
  ];
  const seed = getIsoWeek(publishDate).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const topic = topics[Math.abs(seed) % topics.length];
  return {
    title: topic.title,
    slug: buildWeeklyDilemmaSlug(topic.title, publishDate),
    shortSetup: topic.setup,
    backgroundContext: topic.background,
    mainEthicalQuestion: topic.question,
    choices: [
      {
        id: 'pilot-with-guardrails',
        label: 'A',
        text: 'Run a limited pilot with strict opt-outs, oversight, and public reporting.',
        frameworkWeights: { 'pragmatist-ethics': 85, utilitarianism: 65, 'social-contract-theory': 55 },
      },
      {
        id: 'reject-for-now',
        label: 'B',
        text: 'Reject the proposal until rights, consent, and long-term harms are clearer.',
        frameworkWeights: { deontology: 85, 'environmental-ethics': 45, contractualism: 70 },
      },
      {
        id: 'community-control',
        label: 'C',
        text: 'Let affected communities design the rules before any deployment.',
        frameworkWeights: { 'discourse-ethics': 85, 'social-contract-theory': 80, 'ethics-of-care': 55 },
      },
      {
        id: 'repair-existing-harms',
        label: 'D',
        text: 'Invest first in people already harmed by the current system before adding new technology.',
        frameworkWeights: { 'ethics-of-care': 85, 'capabilities-approach': 75, 'ubuntu-ethics': 65 },
      },
    ],
    tags: topic.tags,
    relatedFrameworks: [
      'utilitarianism',
      'deontology',
      'social-contract-theory',
      'ethics-of-care',
      'pragmatist-ethics',
    ],
    relatedTechnologies: [topic.technology],
    aiScoringPrompt:
      'Analyze the response across all active ethical frameworks. Focus on the tradeoff the learner accepts and whose interests receive priority.',
    reflectionPrompt:
      'What tradeoff are you accepting here, and whose perspective could disappear if the decision moves too fast?',
    publishDate,
    visibilityStatus: process.env.FACTUAL_DILEMMA_AUTO_PUBLISH === 'true' ? 'published' : 'draft',
    isoWeek: getIsoWeek(publishDate),
    imageHint: `${topic.technology} ethics classroom`,
    generatedAt: new Date(),
  };
}

export async function generateWeeklyDilemmaDraft(
  publishDate = new Date(),
): Promise<ActionResult<WeeklyDilemma>> {
  try {
    const db = weeklyDb();
    const isoWeek = getIsoWeek(publishDate);
    const existingSnap = await db
      .collection('weeklyDilemmas')
      .where('isoWeek', '==', isoWeek)
      .limit(5)
      .get();
    const existingIsoWeeks = existingSnap.docs.map((docSnap) => docSnap.data().isoWeek as string);
    if (!shouldCreateWeeklyDilemmaForWeek({ targetIsoWeek: isoWeek, existingIsoWeeks })) {
      const existing = existingSnap.docs[0];
      return { success: true, data: dilemmaFromDoc(existing.id, existing.data()) };
    }

    const generated = buildGeneratedWeeklyDilemma(publishDate);
    const ref = db.collection('weeklyDilemmas').doc();
    await ref.set({ ...generated, generatedAt: new Date() });
    return { success: true, data: { ...generated, id: ref.id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getCurrentWeeklyDilemma(userId?: string) {
  try {
    const db = weeklyDb();
    const snap = await db
      .collection('weeklyDilemmas')
      .where('visibilityStatus', '==', 'published')
      .orderBy('publishDate', 'desc')
      .limit(1)
      .get();
    if (snap.empty) {
      const generated = await generateWeeklyDilemmaDraft(new Date());
      if (!generated.success) return { success: false, error: generated.error } as const;
      return {
        success: true,
        data: { dilemma: generated.data, ownResponse: null, peerResponses: [], replies: [], peersLocked: true },
      } as const;
    }
    return getWeeklyDilemmaBySlug(snap.docs[0].data().slug, userId);
  } catch (error) {
    if (isMissingWeeklyDilemmaAdminCredentialsError(error)) {
      console.warn('[weekly-dilemmas] Firebase Admin credentials are missing; returning empty read state.');
      return { success: true, data: createEmptyWeeklyDilemmaLoadData() } as const;
    }
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message } as const;
  }
}

export async function getWeeklyDilemmaBySlug(slug: string, userId?: string) {
  try {
    const db = weeklyDb();
    const dilemmaSnap = await db.collection('weeklyDilemmas').where('slug', '==', slug).limit(1).get();
    if (dilemmaSnap.empty) {
      return {
        success: true,
        data: { dilemma: null, ownResponse: null, peerResponses: [], replies: [], peersLocked: true },
      } as const;
    }
    const dilemma = dilemmaFromDoc(dilemmaSnap.docs[0].id, dilemmaSnap.docs[0].data());
    let ownResponse: WeeklyDilemmaResponse | null = null;
    if (userId) {
      const ownDoc = await db
        .collection('weeklyDilemmaResponses')
        .doc(responseDocId(dilemma.id, userId))
        .get();
      if (ownDoc.exists) ownResponse = responseFromDoc(ownDoc.id, ownDoc.data() ?? {});
    }

    const canViewPeers = canViewWeeklyDilemmaPeerResponses({
      hasSubmitted: Boolean(ownResponse),
      responseRequiredToViewPeers:
        process.env.WEEKLY_DILEMMA_RESPONSE_REQUIRED_TO_VIEW_PEERS !== 'false',
    });
    if (!canViewPeers) {
      return {
        success: true,
        data: { dilemma, ownResponse, peerResponses: [], replies: [], peersLocked: true },
      } as const;
    }

    const peerSnap = await db
      .collection('weeklyDilemmaResponses')
      .where('dilemmaId', '==', dilemma.id)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    const replySnap = await db
      .collection('weeklyDilemmaReplies')
      .where('dilemmaId', '==', dilemma.id)
      .orderBy('createdAt', 'asc')
      .limit(100)
      .get();
    return {
      success: true,
      data: {
        dilemma,
        ownResponse,
        peerResponses: peerSnap.docs.map((docSnap) => responseFromDoc(docSnap.id, docSnap.data())),
        replies: replySnap.docs.map((docSnap) => replyFromDoc(docSnap.id, docSnap.data())),
        peersLocked: false,
      },
    } as const;
  } catch (error) {
    if (isMissingWeeklyDilemmaAdminCredentialsError(error)) {
      console.warn('[weekly-dilemmas] Firebase Admin credentials are missing; returning empty read state.');
      return { success: true, data: createEmptyWeeklyDilemmaLoadData() } as const;
    }
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message } as const;
  }
}

export async function submitWeeklyDilemmaResponse(input: {
  userId: string;
  userName?: string;
  dilemmaId: string;
  selectedChoiceId?: string;
  responseText: string;
}): Promise<ActionResult<{ responseId: string }>> {
  if (!input.userId || !input.dilemmaId || !input.responseText.trim()) {
    return { success: false, error: 'User, dilemma, and response text are required.' };
  }
  try {
    const db = weeklyDb();
    const dilemmaDoc = await db.collection('weeklyDilemmas').doc(input.dilemmaId).get();
    if (!dilemmaDoc.exists) return { success: false, error: 'Weekly dilemma not found.' };
    const dilemma = dilemmaFromDoc(dilemmaDoc.id, dilemmaDoc.data() ?? {});
    const responseId = responseDocId(dilemma.id, input.userId);
    const responseRef = db.collection('weeklyDilemmaResponses').doc(responseId);
    const existing = await responseRef.get();
    if (existing.exists) return { success: false, error: 'You already submitted a response.' };

    const selectedChoice = dilemma.choices.find((choice) => choice.id === input.selectedChoiceId);
    const eventResult = await recordEthicalJudgmentEvent({
      userId: input.userId,
      interactionType: 'weekly_dilemma_response',
      sourceContentType: 'weekly_dilemma',
      sourceContentId: dilemma.id,
      sourceTitle: dilemma.title,
      promptText: `${dilemma.shortSetup}\n\n${dilemma.mainEthicalQuestion}`,
      selectedOptionId: selectedChoice?.id,
      userChoice: selectedChoice?.text,
      responseText: input.responseText.trim(),
      frameworkWeights: selectedChoice?.frameworkWeights ?? {},
      affectsProfile: process.env.WEEKLY_DILEMMA_PROFILE_SCORING !== 'false',
      activityContext: 'weekly_dilemma',
      rawResponse: { dilemmaId: dilemma.id, selectedChoiceId: selectedChoice?.id ?? null },
    });
    if (!eventResult.success) return { success: false, error: eventResult.error };

    await responseRef.set({
      dilemmaId: dilemma.id,
      userId: input.userId,
      userName: input.userName ?? 'Anonymous Explorer',
      selectedChoiceId: selectedChoice?.id ?? null,
      responseText: input.responseText.trim(),
      ethicalJudgmentEventId: eventResult.data.event.id,
      createdAt: new Date(),
    });
    return { success: true, data: { responseId } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function submitWeeklyDilemmaReply(input: {
  userId: string;
  userName?: string;
  dilemmaId: string;
  responseId: string;
  parentReplyId?: string;
  replyText: string;
}): Promise<ActionResult<{ replyId: string }>> {
  if (!input.userId || !input.dilemmaId || !input.responseId || !input.replyText.trim()) {
    return { success: false, error: 'Reply text is required.' };
  }
  try {
    const db = weeklyDb();
    let ethicalJudgmentEventId: string | undefined;
    if (shouldScoreDebateReply(input.replyText)) {
      const eventResult = await recordEthicalJudgmentEvent({
        userId: input.userId,
        interactionType: 'weekly_dilemma_reply',
        sourceContentType: 'weekly_dilemma',
        sourceContentId: input.dilemmaId,
        sourceTitle: 'Weekly Clause Reply',
        promptText: 'Reply to a peer response in the weekly factual ethics dilemma.',
        responseText: input.replyText.trim(),
        frameworkWeights: {},
        affectsProfile: process.env.WEEKLY_DILEMMA_PROFILE_SCORING !== 'false',
        activityContext: 'weekly_dilemma',
        rawResponse: { responseId: input.responseId, parentReplyId: input.parentReplyId ?? null },
      });
      if (eventResult.success) ethicalJudgmentEventId = eventResult.data.event.id;
    }

    const replyRef = await db.collection('weeklyDilemmaReplies').add({
      dilemmaId: input.dilemmaId,
      responseId: input.responseId,
      parentReplyId: input.parentReplyId ?? null,
      userId: input.userId,
      userName: input.userName ?? 'Anonymous Explorer',
      replyText: input.replyText.trim(),
      ethicalJudgmentEventId: ethicalJudgmentEventId ?? null,
      createdAt: new Date(),
    });
    return { success: true, data: { replyId: replyRef.id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
