
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
  query, where, orderBy, serverTimestamp, increment,
} from 'firebase/firestore';
import type { MessageThread, DirectMessage } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function threadFromDoc(id: string, data: Record<string, any>): MessageThread {
  return {
    id,
    participantIds: data.participantIds || [],
    participants: data.participants || {},
    lastMessage: data.lastMessage,
    lastMessageAt: timestampToDate(data.lastMessageAt),
    lastMessageFrom: data.lastMessageFrom,
    unreadCounts: data.unreadCounts || {},
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
  };
}

function messageFromDoc(id: string, data: Record<string, any>): DirectMessage {
  return {
    id,
    threadId: data.threadId,
    senderId: data.senderId,
    senderName: data.senderName || 'Anonymous',
    content: data.content || '',
    attachedArtifact: data.attachedArtifact,
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
  };
}

/** Deterministic thread ID from two UIDs (sorted). */
function threadIdFor(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('__');
}

/**
 * Get or create a thread between two users.
 */
export async function getOrCreateThread(
  selfId: string,
  selfName: string,
  selfAvatarUrl: string | undefined,
  otherId: string,
  otherName: string,
  otherAvatarUrl: string | undefined
): Promise<ActionResult<MessageThread>> {
  try {
    if (selfId === otherId) {
      return { success: false, error: 'Cannot start a thread with yourself.' };
    }

    // Check if either user has blocked the other
    try {
      const [selfBlocks, otherBlocks] = await Promise.all([
        getDoc(doc(db, 'userBlocks', selfId)),
        getDoc(doc(db, 'userBlocks', otherId)),
      ]);
      const selfBlockedThem = selfBlocks.exists() && (selfBlocks.data().blockedIds || []).includes(otherId);
      const theyBlockedSelf = otherBlocks.exists() && (otherBlocks.data().blockedIds || []).includes(selfId);
      if (selfBlockedThem || theyBlockedSelf) {
        return { success: false, error: 'You cannot message this user.' };
      }
    } catch {
      // non-fatal
    }

    const id = threadIdFor(selfId, otherId);
    const ref = doc(db, 'messageThreads', id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return { success: true, data: threadFromDoc(snap.id, snap.data()) };
    }

    const data = {
      participantIds: [selfId, otherId].sort(),
      participants: {
        [selfId]: { name: selfName, avatarUrl: selfAvatarUrl || null },
        [otherId]: { name: otherName, avatarUrl: otherAvatarUrl || null },
      },
      unreadCounts: { [selfId]: 0, [otherId]: 0 },
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, data);
    const created = await getDoc(ref);
    return { success: true, data: threadFromDoc(created.id, created.data() || {}) };
  } catch (error) {
    console.error('[messages] getOrCreateThread error:', error);
    return { success: false, error: String(error) };
  }
}

export async function listUserThreads(userId: string): Promise<ActionResult<MessageThread[]>> {
  try {
    const q = query(
      collection(db, 'messageThreads'),
      where('participantIds', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => threadFromDoc(d.id, d.data())) };
  } catch (error) {
    console.error('[messages] listUserThreads error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getThread(threadId: string): Promise<ActionResult<MessageThread | null>> {
  try {
    const snap = await getDoc(doc(db, 'messageThreads', threadId));
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: threadFromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[messages] getThread error:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendMessage(input: {
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachedArtifact?: DirectMessage['attachedArtifact'];
}): Promise<ActionResult<string>> {
  try {
    if (!input.content.trim() && !input.attachedArtifact) {
      return { success: false, error: 'Message cannot be empty.' };
    }

    const threadRef = doc(db, 'messageThreads', input.threadId);
    const threadSnap = await getDoc(threadRef);
    if (!threadSnap.exists()) return { success: false, error: 'Thread not found.' };
    const thread = threadSnap.data();

    if (!thread.participantIds.includes(input.senderId)) {
      return { success: false, error: 'Not a participant in this thread.' };
    }

    const ref = await addDoc(
      collection(db, 'messageThreads', input.threadId, 'messages'),
      {
        threadId: input.threadId,
        senderId: input.senderId,
        senderName: input.senderName,
        content: input.content.trim(),
        attachedArtifact: input.attachedArtifact || null,
        createdAt: serverTimestamp(),
      }
    );

    // Update thread metadata + unread count for the other participant
    const otherIds: string[] = (thread.participantIds || []).filter((p: string) => p !== input.senderId);
    const unreadUpdates: Record<string, any> = {};
    for (const otherId of otherIds) {
      unreadUpdates[`unreadCounts.${otherId}`] = increment(1);
    }

    await updateDoc(threadRef, {
      lastMessage: input.content.trim().slice(0, 200) || (input.attachedArtifact ? `[Shared: ${input.attachedArtifact.title}]` : ''),
      lastMessageAt: serverTimestamp(),
      lastMessageFrom: input.senderId,
      ...unreadUpdates,
    });

    return { success: true, data: ref.id };
  } catch (error) {
    console.error('[messages] sendMessage error:', error);
    return { success: false, error: String(error) };
  }
}

export async function listMessages(threadId: string): Promise<ActionResult<DirectMessage[]>> {
  try {
    const q = query(
      collection(db, 'messageThreads', threadId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => messageFromDoc(d.id, d.data())) };
  } catch (error) {
    console.error('[messages] listMessages error:', error);
    return { success: false, error: String(error) };
  }
}

export async function markThreadRead(threadId: string, userId: string): Promise<ActionResult<void>> {
  try {
    await updateDoc(doc(db, 'messageThreads', threadId), {
      [`unreadCounts.${userId}`]: 0,
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[messages] markThreadRead error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getUnreadMessageCount(userId: string): Promise<ActionResult<number>> {
  try {
    const q = query(
      collection(db, 'messageThreads'),
      where('participantIds', 'array-contains', userId)
    );
    const snap = await getDocs(q);
    let total = 0;
    snap.docs.forEach((d) => {
      const counts = d.data().unreadCounts || {};
      total += counts[userId] || 0;
    });
    return { success: true, data: total };
  } catch (error) {
    console.error('[messages] getUnreadMessageCount error:', error);
    return { success: false, error: String(error) };
  }
}
