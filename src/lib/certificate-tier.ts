/**
 * Decide which tier a certificate should be issued at.
 *
 * Policy:
 *   - A curriculum owned by a super-admin (see SUPER_ADMIN_EMAILS)
 *     issues OFFICIAL certificates.
 *   - Every other curriculum issues COMMUNITY certificates.
 *   - The textbook + master-exam paths are owned by the platform
 *     author and are always official; their curriculum IDs are listed
 *     in PLATFORM_OFFICIAL_CURRICULUM_IDS below.
 *
 * This module is the single source of truth. All issuance callers
 * (curriculum, textbook, master-exam) route through `resolveCertificateTier`
 * so the answer is consistent everywhere.
 */

import { isSuperAdminEmail } from '@/lib/super-admins';
import type { CertificateTier, Certificate } from '@/types';

/**
 * Curriculum IDs that represent the platform's own capstone credentials
 * (not user-created paths). These always issue official certs.
 */
export const PLATFORM_OFFICIAL_CURRICULUM_IDS: ReadonlyArray<string> = [
  // Textbook chapter certificates — id pattern `textbook-chapter-{slug}`
  // are matched by prefix. The singletons below are matched by exact id.
  'textbook-master',
  'master-technology-ethicist',
] as const;

export function isPlatformOfficialCurriculumId(id: string): boolean {
  if (!id) return false;
  if (id.startsWith('textbook-chapter-')) return true;
  return PLATFORM_OFFICIAL_CURRICULUM_IDS.includes(id);
}

/**
 * Resolve the certificate tier for an issuance.
 *
 * Precedence:
 *   1. Platform-official curriculum IDs → 'official' unconditionally.
 *   2. Creator email on SUPER_ADMIN_EMAILS → 'official'.
 *   3. Everything else → 'community'.
 */
export function resolveCertificateTier(args: {
  curriculumId: string;
  creatorEmail?: string | null;
}): CertificateTier {
  if (isPlatformOfficialCurriculumId(args.curriculumId)) return 'official';
  if (isSuperAdminEmail(args.creatorEmail)) return 'official';
  return 'community';
}

/**
 * Best-effort backfill for certificates persisted before the `tier`
 * field existed. Returns the stored tier when present, otherwise
 * infers from the curriculum id.
 */
export function effectiveTier(cert: Pick<Certificate, 'tier' | 'curriculumId'>): CertificateTier {
  if (cert.tier) return cert.tier;
  if (isPlatformOfficialCurriculumId(cert.curriculumId)) return 'official';
  return 'community';
}
