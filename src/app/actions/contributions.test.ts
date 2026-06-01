// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((database: unknown, ...path: string[]) => ({ database, path })),
  doc: vi.fn((database: unknown, ...path: string[]) => ({ database, path })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn((...args: unknown[]) => ({ __query: args })),
  where: vi.fn((field: string, op: string, value: unknown) => ({ field, op, value })),
  orderBy: vi.fn((field: string, dir: string) => ({ field, dir })),
  serverTimestamp: vi.fn(() => ({ __type: 'serverTimestamp' })),
  increment: vi.fn((n: number) => ({ __type: 'increment', n })),
}));

vi.mock('@/lib/firebase/config', () => ({ db: { __type: 'mock-firestore' } }));

vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc,
  collection: mocks.collection,
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  getDocs: mocks.getDocs,
  updateDoc: mocks.updateDoc,
  deleteDoc: mocks.deleteDoc,
  query: mocks.query,
  where: mocks.where,
  orderBy: mocks.orderBy,
  serverTimestamp: mocks.serverTimestamp,
  increment: mocks.increment,
}));

vi.mock('@/lib/firebase/firestore-helpers', () => ({
  timestampToDate: (v: unknown) =>
    v instanceof Date ? v : v ? new Date(v as string) : undefined,
}));

import {
  createContribution,
  getContributions,
  getUserContributions,
} from './contributions';

function snap(data: Record<string, unknown> | null) {
  return { exists: () => data !== null, data: () => data };
}

const community = {
  name: 'Ethics 101',
  ownerId: 'owner1',
  instructorIds: ['owner1'],
  memberIds: ['member1'],
};

describe('createContribution membership enforcement', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects a user who does not belong to the community', async () => {
    mocks.getDoc.mockResolvedValue(snap(community));

    const result = await createContribution({
      communityId: 'c1',
      type: 'quiz_result',
      contributorId: 'stranger',
      contributorName: 'Stranger',
      title: 'My score',
      summary: '',
    });

    expect(result.success).toBe(false);
    expect(mocks.addDoc).not.toHaveBeenCalled();
  });

  it('allows a member to submit and returns the new id', async () => {
    mocks.getDoc.mockResolvedValue(snap(community));
    mocks.addDoc.mockResolvedValue({ id: 'contrib-9' });

    const result = await createContribution({
      communityId: 'c1',
      type: 'quiz_result',
      contributorId: 'member1',
      contributorName: 'Member One',
      title: 'My score',
      summary: 'looking for tips',
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error);
    expect(result.data).toBe('contrib-9');
    expect(mocks.addDoc).toHaveBeenCalledTimes(1);
  });

  it('rejects submitting to a community that no longer exists', async () => {
    mocks.getDoc.mockResolvedValue(snap(null));

    const result = await createContribution({
      communityId: 'gone',
      type: 'reflection',
      contributorId: 'member1',
      contributorName: 'Member One',
      title: 'Reflection',
      summary: '',
    });

    expect(result.success).toBe(false);
    expect(mocks.addDoc).not.toHaveBeenCalled();
  });
});

describe('getContributions read gating', () => {
  beforeEach(() => vi.clearAllMocks());

  it('blocks a non-member, non-admin requester', async () => {
    mocks.getDoc.mockImplementation((ref: { path: string[] }) => {
      if (ref.path[0] === 'communities') return Promise.resolve(snap(community));
      if (ref.path[0] === 'users') return Promise.resolve(snap({ isAdmin: false }));
      return Promise.resolve(snap(null));
    });

    const result = await getContributions('c1', { requesterId: 'stranger' });

    expect(result.success).toBe(false);
    expect(mocks.getDocs).not.toHaveBeenCalled();
  });

  it('allows an instructor to read the feed', async () => {
    mocks.getDoc.mockResolvedValue(snap(community));
    mocks.getDocs.mockResolvedValue({ docs: [] });

    const result = await getContributions('c1', { requesterId: 'owner1' });

    expect(result.success).toBe(true);
    expect(mocks.getDocs).toHaveBeenCalledTimes(1);
  });
});

describe('getUserContributions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the user submissions newest-first', async () => {
    mocks.getDocs.mockResolvedValue({
      docs: [
        {
          id: 'older',
          data: () => ({
            communityId: 'c1',
            type: 'quiz_result',
            contributorId: 'u1',
            contributorName: 'U',
            title: 'Older',
            summary: '',
            createdAt: new Date('2024-01-01'),
          }),
        },
        {
          id: 'newer',
          data: () => ({
            communityId: 'c1',
            type: 'reflection',
            contributorId: 'u1',
            contributorName: 'U',
            title: 'Newer',
            summary: '',
            createdAt: new Date('2024-06-01'),
          }),
        },
      ],
    });

    const result = await getUserContributions('u1');

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error);
    expect(result.data.map((c) => c.id)).toEqual(['newer', 'older']);
  });
});
