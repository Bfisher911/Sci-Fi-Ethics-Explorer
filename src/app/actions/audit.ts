'use server';

import { getAuditLog } from '@/lib/audit-log';
import { requireAdmin } from '@/lib/admin';
import type { AuditLogEntry } from '@/types';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface FetchAuditLogOptions {
  limit?: number;
  actorId?: string;
  targetType?: string;
}

/**
 * Admin-only wrapper around the audit log reader. Serializes timestamps so the
 * result is safely marshaled across the server/client boundary.
 */
export async function fetchAuditLog(
  adminUid: string,
  options: FetchAuditLogOptions = {}
): Promise<ActionResult<AuditLogEntry[]>> {
  try {
    await requireAdmin(adminUid);
    const entries = await getAuditLog({
      limit: options.limit ?? 200,
      actorId: options.actorId,
      targetType: options.targetType,
    });

    // Ensure createdAt is serializable (Date or ISO string).
    const serialized: AuditLogEntry[] = entries.map((e) => ({
      ...e,
      createdAt:
        e.createdAt instanceof Date
          ? e.createdAt.toISOString()
          : (e.createdAt ?? null),
    }));

    return { success: true, data: serialized };
  } catch (error: any) {
    console.error('[audit action] fetchAuditLog error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch audit log',
    };
  }
}
