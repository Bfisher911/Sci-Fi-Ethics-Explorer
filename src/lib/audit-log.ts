
'use server';

import { db } from '@/lib/firebase/config';
import { collection, addDoc, getDocs, query, orderBy, where, limit as fsLimit, serverTimestamp } from 'firebase/firestore';
import type { AuditAction, AuditLogEntry } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

/**
 * Append an audit log entry. Fire-and-forget; never throws to avoid
 * blocking the caller.
 */
export async function logAdminAction(input: {
  action: AuditAction;
  actorId: string;
  actorName?: string;
  targetType: string;
  targetId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  note?: string;
}): Promise<void> {
  try {
    await addDoc(collection(db, 'auditLog'), {
      action: input.action,
      actorId: input.actorId,
      actorName: input.actorName || null,
      targetType: input.targetType,
      targetId: input.targetId,
      before: input.before || null,
      after: input.after || null,
      note: input.note || null,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('[audit] logAdminAction failed:', err);
  }
}

export async function getAuditLog(options: {
  limit?: number;
  actorId?: string;
  targetType?: string;
} = {}): Promise<AuditLogEntry[]> {
  try {
    const constraints: any[] = [orderBy('createdAt', 'desc')];
    if (options.actorId) constraints.push(where('actorId', '==', options.actorId));
    if (options.targetType) constraints.push(where('targetType', '==', options.targetType));
    constraints.push(fsLimit(options.limit ?? 100));

    const snap = await getDocs(query(collection(db, 'auditLog'), ...constraints));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        action: data.action,
        actorId: data.actorId,
        actorName: data.actorName,
        targetType: data.targetType,
        targetId: data.targetId,
        before: data.before,
        after: data.after,
        note: data.note,
        createdAt: timestampToDate(data.createdAt) ?? new Date(),
      } as AuditLogEntry;
    });
  } catch (err) {
    console.error('[audit] getAuditLog failed:', err);
    return [];
  }
}
