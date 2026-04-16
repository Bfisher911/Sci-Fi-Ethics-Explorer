'use server';

/**
 * Server actions that maintain Professor Paradox authorship invariants
 * across the platform's content collections.
 *
 *   - normalizeOfficialAuthorship — bulk pass that scans the major content
 *     collections (stories, blogPosts, debates, submittedDilemmas,
 *     curricula, workshops) and rewrites legacy/inconsistent author
 *     fields to the canonical Professor Paradox identity *only* for items
 *     that already point at the official UID (or the legacy 'system' UID
 *     used by some pre-existing seed data). Real community content is
 *     never touched.
 *
 *   - tagAsOfficial — admin-only single-item override. Forcibly attributes
 *     a specific document to Professor Paradox. Use sparingly, e.g. to
 *     mark seeded demo content created before the canonical author existed.
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { requireAdmin } from '@/lib/admin';
import { logAdminAction } from '@/lib/audit-log';
import {
  OFFICIAL_AUTHOR_NAME,
  OFFICIAL_AUTHOR_UID,
  isOfficialAuthor,
} from '@/lib/official-author';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Per-collection (id field) → (display name field) mapping. Listing the
 * shape here keeps the bulk normalizer compact and explicit.
 */
const COLLECTION_AUTHORSHIP: Record<
  string,
  { idField: string; nameField: string }
> = {
  stories: { idField: 'authorId', nameField: 'author' },
  blogPosts: { idField: 'authorId', nameField: 'authorName' },
  debates: { idField: 'creatorId', nameField: 'creatorName' },
  submittedDilemmas: { idField: 'authorId', nameField: 'authorName' },
  curricula: { idField: 'creatorId', nameField: 'creatorName' },
  workshops: { idField: 'hostId', nameField: 'hostName' },
};

interface NormalizeReport {
  collection: string;
  scanned: number;
  rewritten: number;
  rewrittenIds: string[];
}

/**
 * Walk every official-eligible collection and rewrite documents whose
 * author identity already points at Professor Paradox (or the legacy
 * `'system'` UID) so their display-name fields render canonically.
 *
 * Idempotent and safe to re-run. Community content (any document with a
 * non-official authorId) is left untouched.
 */
export async function normalizeOfficialAuthorship(
  adminUid: string
): Promise<ActionResult<NormalizeReport[]>> {
  try {
    await requireAdmin(adminUid);

    const reports: NormalizeReport[] = [];

    for (const [coll, { idField, nameField }] of Object.entries(
      COLLECTION_AUTHORSHIP
    )) {
      const report: NormalizeReport = {
        collection: coll,
        scanned: 0,
        rewritten: 0,
        rewrittenIds: [],
      };

      let snap;
      try {
        snap = await getDocs(collection(db, coll));
      } catch (err) {
        // If a collection doesn't exist yet, just skip it.
        console.warn(`[official-author] skipping ${coll}:`, err);
        reports.push(report);
        continue;
      }

      for (const d of snap.docs) {
        report.scanned++;
        const data = d.data() as Record<string, unknown>;
        const id = data[idField] as string | undefined;
        const name = data[nameField] as string | undefined;
        // Only rewrite items already attributed to the official identity.
        if (!isOfficialAuthor(id) && !isOfficialAuthor(name)) continue;
        // Skip if the doc is already canonical.
        if (id === OFFICIAL_AUTHOR_UID && name === OFFICIAL_AUTHOR_NAME) {
          continue;
        }
        await updateDoc(doc(db, coll, d.id), {
          [idField]: OFFICIAL_AUTHOR_UID,
          [nameField]: OFFICIAL_AUTHOR_NAME,
          updatedAt: serverTimestamp(),
        });
        report.rewritten++;
        report.rewrittenIds.push(d.id);
      }

      reports.push(report);
    }

    await logAdminAction({
      action: 'tag_edit',
      actorId: adminUid,
      targetType: 'official-author',
      targetId: 'normalize',
      after: { reports },
      note: 'Bulk normalize official authorship to Professor Paradox',
    });

    return { success: true, data: reports };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[official-author] normalizeOfficialAuthorship error:', message);
    return { success: false, error: message };
  }
}

/**
 * Force-attribute a single document in a known collection to Professor
 * Paradox. Useful for retroactively claiming seed-demo content as
 * platform-owned. Admin-only and audit-logged.
 */
export async function tagAsOfficial(
  adminUid: string,
  contentType: keyof typeof COLLECTION_AUTHORSHIP,
  contentId: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin(adminUid);
    const cfg = COLLECTION_AUTHORSHIP[contentType];
    if (!cfg) {
      return {
        success: false,
        error: `Unknown content type: ${contentType}`,
      };
    }
    const ref = doc(db, contentType, contentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, error: `${contentType} ${contentId} not found.` };
    }
    const before = snap.data();
    await updateDoc(ref, {
      [cfg.idField]: OFFICIAL_AUTHOR_UID,
      [cfg.nameField]: OFFICIAL_AUTHOR_NAME,
      updatedAt: serverTimestamp(),
    });
    await logAdminAction({
      action: 'tag_edit',
      actorId: adminUid,
      targetType: contentType,
      targetId: contentId,
      before: {
        [cfg.idField]: before[cfg.idField],
        [cfg.nameField]: before[cfg.nameField],
      },
      after: {
        [cfg.idField]: OFFICIAL_AUTHOR_UID,
        [cfg.nameField]: OFFICIAL_AUTHOR_NAME,
      },
      note: `Tagged ${contentType} ${contentId} as official (Professor Paradox)`,
    });
    return { success: true, data: undefined };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[official-author] tagAsOfficial error:', message);
    return { success: false, error: message };
  }
}
