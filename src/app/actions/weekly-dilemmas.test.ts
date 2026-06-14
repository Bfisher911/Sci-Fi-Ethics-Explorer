// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NEW_DILEMMAS } from '@/data/dilemmas';

/**
 * Regression coverage for getPublishedDilemmas, which backs the /dilemmas
 * library. The library's content is the first-party authored catalog (it lives
 * in code); Firestore only *adds* weekly-published dilemmas on top. So a
 * Firestore read failure must never blank the page — it must still serve the
 * static catalog. See https://github.com/Bfisher911/Sci-Fi-Ethics-Explorer/pull/5
 */

const mocks = vi.hoisted(() => ({
  getAdminDb: vi.fn(),
}));

// Mock the Admin SDK accessor — the action's only Firestore dependency here.
vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: mocks.getAdminDb,
  getAdminAuth: vi.fn(() => null),
  verifyIdTokenFromRequest: vi.fn(),
}));

// Cut the transitive client-SDK import chain (this action module imports the
// ethical-judgments action, which initializes the client Firebase app).
vi.mock('@/app/actions/ethical-judgments', () => ({
  recordEthicalJudgmentEvent: vi.fn(),
}));

import { getPublishedDilemmas } from './weekly-dilemmas';

const PUBLISHED_STATIC_COUNT = NEW_DILEMMAS.filter(
  (d) => d.visibilityStatus === 'published',
).length;

/** A chainable Admin query whose terminal .get() resolves to `snapshot` or rejects with `error`. */
function fakeDb({ snapshot, error }: { snapshot?: { docs: unknown[] }; error?: Error }) {
  const queryChain = {
    where: vi.fn(() => queryChain),
    orderBy: vi.fn(() => queryChain),
    limit: vi.fn(() => queryChain),
    get: vi.fn(() => (error ? Promise.reject(error) : Promise.resolve(snapshot))),
  };
  return { collection: vi.fn(() => queryChain) };
}

describe('getPublishedDilemmas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('serves the static catalog when the Firestore query throws a missing-index error', async () => {
    // The exact production failure: a composite index error (NOT the
    // missing-credentials sentinel). Previously this returned success:false and
    // blanked the library; it must now degrade to the authored catalog.
    mocks.getAdminDb.mockReturnValue(
      fakeDb({ error: new Error('9 FAILED_PRECONDITION: The query requires an index.') }),
    );

    const result = await getPublishedDilemmas();

    expect(result.success).toBe(true);
    expect(result.success && result.data.length).toBe(PUBLISHED_STATIC_COUNT);
    expect(PUBLISHED_STATIC_COUNT).toBeGreaterThanOrEqual(12);
    // Every served dilemma is a fully-formed authored case, not an empty stub.
    expect(result.success && result.data.every((d) => d.slug && d.title)).toBe(true);
  });

  it('serves the static catalog when Admin credentials are missing', async () => {
    mocks.getAdminDb.mockReturnValue(null); // weeklyDb() throws the credentials sentinel

    const result = await getPublishedDilemmas();

    expect(result.success).toBe(true);
    expect(result.success && result.data.length).toBe(PUBLISHED_STATIC_COUNT);
  });

  it('merges Firestore-published dilemmas on top of the static catalog (deduped by slug)', async () => {
    const novelDoc = {
      id: 'fs-weekly-1',
      data: () => ({
        title: 'A Brand New Weekly Dilemma',
        slug: 'a-brand-new-weekly-dilemma',
        visibilityStatus: 'published',
        publishDate: new Date('2099-01-01'),
      }),
    };
    mocks.getAdminDb.mockReturnValue(fakeDb({ snapshot: { docs: [novelDoc] } }));

    const result = await getPublishedDilemmas();

    expect(result.success).toBe(true);
    if (!result.success) return;
    // A unique slug adds one entry; newest publishDate sorts it first.
    expect(result.data.length).toBe(PUBLISHED_STATIC_COUNT + 1);
    expect(result.data[0].slug).toBe('a-brand-new-weekly-dilemma');
  });
});
