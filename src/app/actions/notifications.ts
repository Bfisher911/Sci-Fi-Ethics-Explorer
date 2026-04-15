
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit as fsLimit, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import type { AppNotification, NotificationType } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function notifFromDoc(id: string, data: Record<string, any>): AppNotification {
  return {
    id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    body: data.body,
    link: data.link,
    read: data.read ?? false,
    createdAt: timestampToDate(data.createdAt) ?? new Date(),
    metadata: data.metadata,
  };
}

/**
 * Create a notification for a single user.
 */
export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, any>;
}): Promise<ActionResult<string>> {
  try {
    const ref = await addDoc(collection(db, 'notifications'), {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link || null,
      read: false,
      metadata: input.metadata || null,
      createdAt: serverTimestamp(),
    });
    return { success: true, data: ref.id };
  } catch (error) {
    console.error('[notifications] createNotification error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Create the same notification for many users (e.g., all admins).
 */
export async function createNotificationsForUsers(
  userIds: string[],
  payload: Omit<Parameters<typeof createNotification>[0], 'userId'>
): Promise<ActionResult<number>> {
  try {
    const batch = writeBatch(db);
    for (const userId of userIds) {
      const ref = doc(collection(db, 'notifications'));
      batch.set(ref, {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        link: payload.link || null,
        read: false,
        metadata: payload.metadata || null,
        createdAt: serverTimestamp(),
      });
    }
    await batch.commit();
    return { success: true, data: userIds.length };
  } catch (error) {
    console.error('[notifications] createNotificationsForUsers error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch the most recent notifications for a user.
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<ActionResult<AppNotification[]>> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      fsLimit(limit)
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((d) => notifFromDoc(d.id, d.data())),
    };
  } catch (error) {
    console.error('[notifications] getUserNotifications error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Count unread notifications for a user.
 */
export async function getUnreadCount(
  userId: string
): Promise<ActionResult<number>> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.size };
  } catch (error) {
    console.error('[notifications] getUnreadCount error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(
  notificationId: string
): Promise<ActionResult> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[notifications] markNotificationRead error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Mark all notifications for a user as read.
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<ActionResult<number>> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    if (snap.empty) return { success: true, data: 0 };

    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
    return { success: true, data: snap.size };
  } catch (error) {
    console.error('[notifications] markAllNotificationsRead error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a notification.
 */
export async function deleteNotification(
  notificationId: string
): Promise<ActionResult> {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[notifications] deleteNotification error:', error);
    return { success: false, error: String(error) };
  }
}
