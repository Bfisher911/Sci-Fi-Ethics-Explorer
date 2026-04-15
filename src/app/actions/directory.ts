'use server';

import { db } from '@/lib/firebase/config';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export interface DirectoryUser {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  dominantFramework?: string;
  bio?: string;
}

export interface DirectoryFilters {
  /** Case-insensitive substring match against displayName. */
  search?: string;
  /** If provided, only returns users whose dominantFramework matches. */
  framework?: string;
  /** Max number of users to load. Defaults to 200. */
  max?: number;
}

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Loads a page of users eligible for the People Directory.
 *
 * Filters out any user whose `isPublicProfile` field is explicitly false. Users
 * with the field unset are treated as public.
 */
export async function getDirectoryUsers(
  filters: DirectoryFilters = {}
): Promise<ActionResult<DirectoryUser[]>> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  const max = filters.max ?? 200;

  try {
    const q = query(collection(db, 'users'), limit(max));
    const snap = await getDocs(q);

    const searchLower = filters.search?.trim().toLowerCase();
    const frameworkFilter = filters.framework?.trim();

    const users: DirectoryUser[] = [];
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (data.isPublicProfile === false) continue;

      const displayName: string =
        data.name || data.displayName || data.email || 'Anonymous Explorer';

      if (searchLower && !displayName.toLowerCase().includes(searchLower)) {
        continue;
      }

      const dominantFramework: string | undefined = data.dominantFramework || undefined;
      if (frameworkFilter && dominantFramework !== frameworkFilter) {
        continue;
      }

      users.push({
        uid: data.uid || docSnap.id,
        displayName,
        avatarUrl: data.avatarUrl || undefined,
        dominantFramework,
        bio: data.bio || undefined,
      });
    }

    // Sort: users with a framework first, then alphabetical by name.
    users.sort((a, b) => {
      const aHas = a.dominantFramework ? 0 : 1;
      const bHas = b.dominantFramework ? 0 : 1;
      if (aHas !== bHas) return aHas - bHas;
      return a.displayName.localeCompare(b.displayName);
    });

    return { success: true, data: users };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ACTION] getDirectoryUsers error:', message);
    return { success: false, error: `Failed to load directory: ${message}` };
  }
}
