'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import type { Debate, DebateArgument, DebateVote } from '@/types';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Create Debate ─────────────────────────────────────────────────

export async function createDebate(data: {
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  tags?: string[];
  dilemmaId?: string;
  storyId?: string;
}): Promise<ActionResult<string>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const debateData = {
      title: data.title,
      description: data.description,
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      status: 'open' as const,
      participantCount: 0,
      tags: data.tags || [],
      dilemmaId: data.dilemmaId || null,
      storyId: data.storyId || null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'debates'), debateData);
    return { success: true, data: docRef.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] createDebate error:', message);
    return { success: false, error: `Could not create debate. ${message}` };
  }
}

// ─── Get All Debates ───────────────────────────────────────────────

export async function getDebates(): Promise<ActionResult<Debate[]>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const q = query(
      collection(db, 'debates'),
      where('status', 'in', ['open', 'voting']),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const debates: Debate[] = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        title: d.title,
        description: d.description,
        creatorId: d.creatorId,
        creatorName: d.creatorName,
        status: d.status,
        participantCount: d.participantCount ?? 0,
        tags: d.tags ?? [],
        dilemmaId: d.dilemmaId,
        storyId: d.storyId,
        createdAt: d.createdAt?.toDate?.() ?? new Date(),
        closesAt: d.closesAt?.toDate?.() ?? undefined,
      } as Debate;
    });
    return { success: true, data: debates };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] getDebates error:', message);
    return { success: false, error: `Could not fetch debates. ${message}` };
  }
}

// ─── Get Single Debate ─────────────────────────────────────────────

export async function getDebateById(debateId: string): Promise<ActionResult<Debate | null>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const docRef = doc(db, 'debates', debateId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: true, data: null };
    }

    const d = docSnap.data();
    const debate: Debate = {
      id: docSnap.id,
      title: d.title,
      description: d.description,
      creatorId: d.creatorId,
      creatorName: d.creatorName,
      status: d.status,
      participantCount: d.participantCount ?? 0,
      tags: d.tags ?? [],
      dilemmaId: d.dilemmaId,
      storyId: d.storyId,
      createdAt: d.createdAt?.toDate?.() ?? new Date(),
      closesAt: d.closesAt?.toDate?.() ?? undefined,
    };
    return { success: true, data: debate };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] getDebateById error:', message);
    return { success: false, error: `Could not fetch debate. ${message}` };
  }
}

// ─── Submit Argument ───────────────────────────────────────────────

export async function submitArgument(data: {
  debateId: string;
  authorId: string;
  authorName: string;
  position: 'pro' | 'con';
  content: string;
  parentArgumentId?: string;
}): Promise<ActionResult<string>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const argumentData = {
      debateId: data.debateId,
      authorId: data.authorId,
      authorName: data.authorName,
      position: data.position,
      content: data.content,
      parentArgumentId: data.parentArgumentId || null,
      upvotes: 0,
      downvotes: 0,
      status: 'active' as const,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, 'debates', data.debateId, 'arguments'),
      argumentData
    );

    // Increment participant count on the debate
    const debateRef = doc(db, 'debates', data.debateId);
    await updateDoc(debateRef, { participantCount: increment(1) });

    // Record that this user participated in this debate on their
    // userProgress doc. The Master Exam prereq ("Participate in 5
    // debates") + the leaderboard's debate weighting both read from
    // this field, so failing to record would silently zero out a
    // real signal. Fire-and-forget so a failure here doesn't block
    // the argument write that's already committed above.
    try {
      const { recordDebateParticipation } = await import('@/app/actions/progress');
      void recordDebateParticipation(data.authorId, data.debateId).catch(
        (err) => console.warn('[debates] recordDebateParticipation failed:', err),
      );
    } catch (err) {
      console.warn('[debates] recordDebateParticipation import failed:', err);
    }

    return { success: true, data: docRef.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] submitArgument error:', message);
    return { success: false, error: `Could not submit argument. ${message}` };
  }
}

// ─── Get Arguments ─────────────────────────────────────────────────

export async function getArguments(debateId: string): Promise<ActionResult<DebateArgument[]>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const q = query(
      collection(db, 'debates', debateId, 'arguments'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const args: DebateArgument[] = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        debateId: d.debateId,
        authorId: d.authorId,
        authorName: d.authorName,
        position: d.position,
        content: d.content,
        parentArgumentId: d.parentArgumentId,
        upvotes: d.upvotes ?? 0,
        downvotes: d.downvotes ?? 0,
        status: d.status ?? 'active',
        createdAt: d.createdAt?.toDate?.() ?? new Date(),
      } as DebateArgument;
    });
    return { success: true, data: args };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] getArguments error:', message);
    return { success: false, error: `Could not fetch arguments. ${message}` };
  }
}

// ─── Vote on Argument ──────────────────────────────────────────────

export async function voteOnArgument(data: {
  debateId: string;
  argumentId: string;
  userId: string;
  voteType: 'up' | 'down';
}): Promise<ActionResult<undefined>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const votesRef = collection(db, 'debates', data.debateId, 'votes');

    // Check if user already voted on this argument
    const existingVoteQuery = query(
      votesRef,
      where('argumentId', '==', data.argumentId),
      where('userId', '==', data.userId)
    );
    const existingVotes = await getDocs(existingVoteQuery);

    const argRef = doc(db, 'debates', data.debateId, 'arguments', data.argumentId);

    if (!existingVotes.empty) {
      const existingVote = existingVotes.docs[0];
      const oldVoteType = existingVote.data().voteType as 'up' | 'down';

      if (oldVoteType === data.voteType) {
        // Remove vote (toggle off)
        await deleteDoc(existingVote.ref);
        if (data.voteType === 'up') {
          await updateDoc(argRef, { upvotes: increment(-1) });
        } else {
          await updateDoc(argRef, { downvotes: increment(-1) });
        }
      } else {
        // Switch vote
        await updateDoc(existingVote.ref, {
          voteType: data.voteType,
          createdAt: serverTimestamp(),
        });
        if (data.voteType === 'up') {
          await updateDoc(argRef, { upvotes: increment(1), downvotes: increment(-1) });
        } else {
          await updateDoc(argRef, { upvotes: increment(-1), downvotes: increment(1) });
        }
      }
    } else {
      // New vote
      await addDoc(votesRef, {
        debateId: data.debateId,
        argumentId: data.argumentId,
        userId: data.userId,
        voteType: data.voteType,
        createdAt: serverTimestamp(),
      });
      if (data.voteType === 'up') {
        await updateDoc(argRef, { upvotes: increment(1) });
      } else {
        await updateDoc(argRef, { downvotes: increment(1) });
      }
    }

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] voteOnArgument error:', message);
    return { success: false, error: `Could not record vote. ${message}` };
  }
}

// ─── Close Debate ──────────────────────────────────────────────────

export async function closeDebate(
  debateId: string,
  userId: string
): Promise<ActionResult<undefined>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const debateRef = doc(db, 'debates', debateId);
    const debateSnap = await getDoc(debateRef);

    if (!debateSnap.exists()) {
      return { success: false, error: 'Debate not found.' };
    }

    if (debateSnap.data().creatorId !== userId) {
      return { success: false, error: 'Only the debate creator can close this debate.' };
    }

    await updateDoc(debateRef, { status: 'closed' });
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] closeDebate error:', message);
    return { success: false, error: `Could not close debate. ${message}` };
  }
}
