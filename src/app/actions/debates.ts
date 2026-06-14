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
import { buildChoiceFrameworkWeights } from '@/lib/choice-frameworks';
import { shouldScoreDebateReply } from '@/lib/ethical-judgment/aggregation';
import { NEW_DEBATES } from '@/data/debates';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function seededDebateFallback(id: string) {
  return NEW_DEBATES.find((debate) => debate.id === id);
}

/**
 * Static fallback: the first-party structured debates (src/data/debates.ts),
 * mapped to the Debate runtime shape (createdAt stamped now), for use when
 * the Firestore `debates` collection is empty (not yet seeded) so the
 * Debate Arena is never blank when content exists in code.
 */
function staticDebates(): Debate[] {
  return NEW_DEBATES.filter(
    (d) => d.status === 'open' || d.status === 'voting',
  ).map((d) => ({ ...d, createdAt: new Date() }) as Debate);
}

function staticDebateById(id: string): Debate | null {
  const seed = NEW_DEBATES.find((d) => d.id === id);
  return seed ? ({ ...seed, createdAt: new Date() } as Debate) : null;
}

// ─── Create Debate ─────────────────────────────────────────────────

export async function createDebate(data: {
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  tags?: string[];
  dilemmaId?: string;
  storyId?: string;
  imageUrl?: string;
  imageHint?: string;
  imageAlt?: string;
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
      imageUrl: data.imageUrl || null,
      imageHint: data.imageHint || null,
      imageAlt: data.imageAlt || null,
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
      const fallback = seededDebateFallback(docSnap.id);
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
        imageUrl: d.imageUrl ?? fallback?.imageUrl,
        imageHint: d.imageHint ?? fallback?.imageHint,
        imageAlt: d.imageAlt ?? fallback?.imageAlt,
        brief: d.brief ?? undefined,
        createdAt: d.createdAt?.toDate?.() ?? new Date(),
        closesAt: d.closesAt?.toDate?.() ?? undefined,
      } as Debate;
    });
    // No seeded debates in Firestore yet → serve the static first-party set
    // so the Debate Arena lists the authored structured debates.
    if (debates.length === 0) {
      return { success: true, data: staticDebates() };
    }
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
      // Not in Firestore — fall back to the static first-party debate so its
      // detail page (with the full brief) still renders.
      return { success: true, data: staticDebateById(debateId) };
    }

    const d = docSnap.data();
    const fallback = seededDebateFallback(docSnap.id);
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
      imageUrl: d.imageUrl ?? fallback?.imageUrl,
      imageHint: d.imageHint ?? fallback?.imageHint,
      imageAlt: d.imageAlt ?? fallback?.imageAlt,
      brief: d.brief ?? undefined,
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
    const debateSnap = await getDoc(debateRef);
    const debateData = debateSnap.exists() ? debateSnap.data() : null;

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

    const shouldCreateEthicalEvent =
      !data.parentArgumentId || shouldScoreDebateReply(data.content);
    if (shouldCreateEthicalEvent) {
      try {
        const { recordEthicalJudgmentEvent } = await import('@/app/actions/ethical-judgments');
        void recordEthicalJudgmentEvent({
          userId: data.authorId,
          interactionType: data.parentArgumentId ? 'debate_reply' : 'debate_stance',
          sourceContentType: 'debate',
          sourceContentId: data.debateId,
          sourceTitle: debateData?.title ?? 'Debate',
          promptText: debateData?.description ?? 'Debate position and reasoning.',
          userChoice: data.position,
          responseText: data.content,
          frameworkWeights: buildChoiceFrameworkWeights(`${data.position} ${data.content}`),
          affectsProfile: true,
          activityContext: 'debate',
          rawResponse: {
            argumentId: docRef.id,
            parentArgumentId: data.parentArgumentId ?? null,
          },
        }).catch((err) => console.warn('[debates] ethical judgment event failed:', err));
      } catch (err) {
        console.warn('[debates] ethical judgment import failed:', err);
      }
    }

    // Notify the parent argument's author that someone replied (only
    // when this is a reply, not a top-level argument). Best-effort —
    // notification failure never blocks the debate write.
    if (data.parentArgumentId) {
      try {
        const parentSnap = await getDoc(
          doc(db, 'debates', data.debateId, 'arguments', data.parentArgumentId),
        );
        const parent = parentSnap.exists() ? parentSnap.data() : null;
        if (parent && parent.authorId && parent.authorId !== data.authorId) {
          const { createNotification } = await import('@/app/actions/notifications');
          await createNotification({
            userId: parent.authorId,
            type: 'debate_reply',
            title: `${data.authorName} replied to your argument`,
            body:
              data.content.length > 140
                ? data.content.slice(0, 140).trim() + '…'
                : data.content,
            link: `/debate-arena/${data.debateId}`,
            metadata: {
              debateId: data.debateId,
              debateTitle: debateData?.title ?? null,
              argumentId: docRef.id,
            },
          });
        }
      } catch (err) {
        console.warn('[debates] reply notification failed:', err);
      }
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
