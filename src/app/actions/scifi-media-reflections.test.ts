// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((database, path) => ({ database, path })),
  doc: vi.fn((database, path, id) => ({ database, path, id })),
  getDoc: vi.fn(),
  recordEthicalJudgmentEvent: vi.fn(),
  serverTimestamp: vi.fn(() => ({ __type: 'serverTimestamp' })),
}));

vi.mock('@/lib/firebase/config', () => ({
  db: { __type: 'mock-firestore' },
}));

vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc,
  collection: mocks.collection,
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  serverTimestamp: mocks.serverTimestamp,
}));

vi.mock('@/app/actions/ethical-judgments', () => ({
  recordEthicalJudgmentEvent: mocks.recordEthicalJudgmentEvent,
}));

import { submitMediaScenarioReflection } from './scifi-media-reflections';

describe('submitMediaScenarioReflection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns preview feedback instead of a save failure when ethical event persistence is permission denied', async () => {
    mocks.recordEthicalJudgmentEvent.mockResolvedValue({
      success: false,
      error:
        'Failed to record ethical judgment: 7 PERMISSION_DENIED: Missing or insufficient permissions.',
    });

    const result = await submitMediaScenarioReflection({
      userId: 'learner-1',
      mediaId: 'blade-runner',
      questionId: 'blade-runner-public-release',
      selectedOptionId: 'release-with-monitoring',
      responseText: 'A limited pilot creates evidence, but only with a clear stop rule.',
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error);
    expect(result.data.responseId).toMatch(/^preview-reflection-/);
    expect(result.data.persisted).toBe(false);
    expect(result.data.feedbackText).toContain('tries to learn from reality');
    expect(result.data.challengeQuestion).toBeTruthy();
    expect(mocks.addDoc).not.toHaveBeenCalled();
  });

  it('returns preview feedback when the response-history write is permission denied after scoring succeeds', async () => {
    mocks.recordEthicalJudgmentEvent.mockResolvedValue({
      success: true,
      data: {
        event: {
          id: 'ethical-event-1',
          analysis: {
            challengeQuestion: 'What would make you pause the pilot?',
          },
        },
        profile: {},
      },
    });
    mocks.addDoc.mockRejectedValue({
      code: 'permission-denied',
      message: 'Missing or insufficient permissions.',
    });

    const result = await submitMediaScenarioReflection({
      userId: 'learner-1',
      mediaId: 'blade-runner',
      questionId: 'blade-runner-public-release',
      selectedOptionId: 'release-with-monitoring',
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error);
    expect(result.data.persisted).toBe(false);
    expect(result.data.responseId).toMatch(/^preview-reflection-/);
    expect(result.data.challengeQuestion).toBe('What would make you pause the pilot?');
  });
});
