'use server';

import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { scifiMediaData } from '@/data/scifi-media';
import { getScenarioReflectionForMedia } from '@/data/scifi-media-scenario-reflections';
import { recordEthicalJudgmentEvent } from '@/app/actions/ethical-judgments';
import { buildDeterministicEthicalAnalysis } from '@/lib/ethical-judgment/recording';
import type { EthicalScenarioOption, EthicalScenarioQuestion, SciFiMedia } from '@/types';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface SubmitMediaScenarioReflectionInput {
  userId: string;
  mediaId: string;
  questionId: string;
  selectedOptionId?: string;
  responseText?: string;
}

interface SubmitMediaScenarioReflectionData {
  responseId: string;
  feedbackText: string;
  challengeQuestion?: string;
  persisted: boolean;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isPermissionDeniedError(error: unknown): boolean {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  const message = errorMessage(error);
  return (
    code === 'permission-denied' ||
    /PERMISSION_DENIED|permission[- ]denied|insufficient permissions/i.test(message)
  );
}

function feedbackForSelection(selectedOption?: EthicalScenarioOption): string {
  return (
    selectedOption?.feedbackText ??
    'Your written response was recorded as an ethical reflection. The profile signal is strongest when you explain the values behind your choice.'
  );
}

function fallbackChallengeQuestion(
  question: EthicalScenarioQuestion,
  selectedOption: EthicalScenarioOption | undefined,
  responseText: string | undefined,
): string {
  const analysis = buildDeterministicEthicalAnalysis({
    frameworkWeights: selectedOption?.frameworkWeights ?? {},
    userText: [selectedOption?.text, responseText?.trim()].filter(Boolean).join('\n\n'),
    promptText: question.prompt,
    confidence: selectedOption ? 0.7 : 0.35,
  });
  return analysis.challengeQuestion || question.reflectionFollowUp;
}

function previewReflectionData(
  question: EthicalScenarioQuestion,
  selectedOption: EthicalScenarioOption | undefined,
  responseText: string | undefined,
  challengeQuestion?: string,
): SubmitMediaScenarioReflectionData {
  return {
    responseId: `preview-reflection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    feedbackText: feedbackForSelection(selectedOption),
    challengeQuestion:
      challengeQuestion ?? fallbackChallengeQuestion(question, selectedOption, responseText),
    persisted: false,
  };
}

async function loadMedia(mediaId: string): Promise<SciFiMedia | null> {
  const staticMedia = scifiMediaData.find((item) => item.id === mediaId);
  if (staticMedia) return staticMedia;
  const snap = await getDoc(doc(db, 'scifiMedia', mediaId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    title: data.title || '',
    category: data.category || 'other',
    year: data.year || '',
    creator: data.creator || '',
    plot: data.plot || '',
    ethicsExplored: data.ethicsExplored || [],
    authorIds: data.authorIds || [],
    relatedFrameworks: data.relatedFrameworks || [],
    meta: data.meta,
    imageUrl: data.imageUrl,
    imageHint: data.imageHint,
    ethicalScenarioReflection: data.ethicalScenarioReflection,
  };
}

export async function submitMediaScenarioReflection(
  input: SubmitMediaScenarioReflectionInput,
): Promise<ActionResult<SubmitMediaScenarioReflectionData>> {
  if (!input.userId || !input.mediaId || !input.questionId) {
    return { success: false, error: 'User, media, and question are required.' };
  }

  try {
    const media = await loadMedia(input.mediaId);
    if (!media) return { success: false, error: 'Sci-Fi Media item not found.' };

    const reflection = media.ethicalScenarioReflection ?? getScenarioReflectionForMedia(media);
    const question = reflection.questions.find((item) => item.id === input.questionId);
    if (!question) return { success: false, error: 'Scenario question not found.' };

    const selectedOption = question.options.find((option) => option.id === input.selectedOptionId);
    if (!selectedOption && !input.responseText?.trim()) {
      return { success: false, error: 'Select an option or write a response.' };
    }

    const eventResult = await recordEthicalJudgmentEvent({
      userId: input.userId,
      interactionType: 'media_scenario_reflection',
      sourceContentType: 'scifi_media',
      sourceContentId: media.id,
      sourceTitle: media.title,
      promptText: question.prompt,
      selectedOptionId: selectedOption?.id,
      userChoice: selectedOption?.text,
      responseText: input.responseText?.trim(),
      frameworkWeights: selectedOption?.frameworkWeights ?? {},
      affectsProfile: question.affectsEthicalProfile,
      activityContext: 'media',
      rawResponse: {
        mediaId: media.id,
        questionId: question.id,
        selectedOptionId: selectedOption?.id ?? null,
      },
    });

    if (!eventResult.success) {
      if (isPermissionDeniedError(eventResult.error)) {
        return {
          success: true,
          data: previewReflectionData(question, selectedOption, input.responseText),
        };
      }
      return { success: false, error: eventResult.error };
    }

    let responseRef: { id: string };
    try {
      responseRef = await addDoc(collection(db, 'scifiMediaScenarioResponses'), {
        userId: input.userId,
        mediaId: media.id,
        questionId: question.id,
        selectedOptionId: selectedOption?.id ?? null,
        responseText: input.responseText?.trim() ?? '',
        ethicalJudgmentEventId: eventResult.data.event.id,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      if (isPermissionDeniedError(error)) {
        return {
          success: true,
          data: previewReflectionData(
            question,
            selectedOption,
            input.responseText,
            eventResult.data.event.analysis.challengeQuestion,
          ),
        };
      }
      throw error;
    }

    return {
      success: true,
      data: {
        responseId: responseRef.id,
        feedbackText: feedbackForSelection(selectedOption),
        challengeQuestion: eventResult.data.event.analysis.challengeQuestion,
        persisted: true,
      },
    };
  } catch (error) {
    console.error('[scifi-media-reflections] submit error:', error);
    const message = errorMessage(error);
    return { success: false, error: `Failed to submit reflection: ${message}` };
  }
}
