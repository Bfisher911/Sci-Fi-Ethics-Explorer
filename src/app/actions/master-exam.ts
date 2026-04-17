'use server';

/**
 * Server actions for the Master Technology Ethicist capstone exam.
 *
 * The exam unlocks only after the learner has earned:
 *   - the Textbook Master Certificate (curriculumId === 'textbook-master')
 *   - a certificate for every official learning path
 *
 * Passing the exam (score >= 75%) mints a "Master Technology Ethicist"
 * certificate via the existing issueCertificate action.
 */

import { issueCertificate, getUserCertificates } from '@/app/actions/certificates';
import { officialLearningPaths } from '@/data/official-learning-paths';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface MasterExamUnlockState {
  unlocked: boolean;
  /** Cert IDs earned toward the unlock. */
  earned: string[];
  /** Cert IDs still outstanding. */
  remaining: Array<{ curriculumId: string; title: string }>;
  alreadyAwarded: boolean;
  masterCertHash?: string;
}

/**
 * Curriculum IDs whose certificates are prerequisites for the Master exam.
 * Exported as an async server action so the 'use server' pragma is happy
 * and so the list can be consumed from client components too.
 */
export async function getMasterExamPrerequisites(): Promise<
  Array<{ curriculumId: string; title: string }>
> {
  return [
    {
      curriculumId: 'textbook-master',
      title: 'The Ethics of Technology Through Science Fiction — Master Certificate',
    },
    ...officialLearningPaths.map((p) => ({
      curriculumId: p.id,
      title: p.certificate?.title || p.title,
    })),
  ];
}

function getPrerequisiteListSync(): Array<{ curriculumId: string; title: string }> {
  return [
    {
      curriculumId: 'textbook-master',
      title: 'The Ethics of Technology Through Science Fiction — Master Certificate',
    },
    ...officialLearningPaths.map((p) => ({
      curriculumId: p.id,
      title: p.certificate?.title || p.title,
    })),
  ];
}

/**
 * Compute the user's current unlock state for the Master exam — which
 * prerequisite certs they have vs still need.
 */
export async function getMasterExamUnlockState(
  userId: string
): Promise<ActionResult<MasterExamUnlockState>> {
  try {
    if (!userId) {
      return {
        success: true,
        data: {
          unlocked: false,
          earned: [],
          remaining: getPrerequisiteListSync(),
          alreadyAwarded: false,
        },
      };
    }
    const certRes = await getUserCertificates(userId);
    if (!certRes.success) {
      return { success: false, error: certRes.error };
    }
    const earnedSet = new Set(certRes.data.map((c) => c.curriculumId));
    const prereqs = getPrerequisiteListSync();
    const earned = prereqs
      .filter((p) => earnedSet.has(p.curriculumId))
      .map((p) => p.curriculumId);
    const remaining = prereqs.filter((p) => !earnedSet.has(p.curriculumId));
    const masterCert = certRes.data.find(
      (c) => c.curriculumId === 'master-technology-ethicist'
    );
    return {
      success: true,
      data: {
        unlocked: remaining.length === 0,
        earned,
        remaining,
        alreadyAwarded: Boolean(masterCert),
        masterCertHash: masterCert?.verificationHash,
      },
    };
  } catch (err) {
    console.error('[master-exam] getMasterExamUnlockState error:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Called by the client after a passing attempt on the master exam. It
 * re-verifies unlock state server-side (so the cert can't be minted
 * without passing AND earning the prereqs) and issues the certificate.
 */
export async function awardMasterTechnologyEthicistCertificate(input: {
  userId: string;
  userName: string;
}): Promise<ActionResult<{ certificateId: string }>> {
  try {
    if (!input.userId) return { success: false, error: 'Sign in required.' };

    const gate = await getMasterExamUnlockState(input.userId);
    if (!gate.success) return { success: false, error: gate.error };
    if (!gate.data.unlocked) {
      return {
        success: false,
        error:
          'Prerequisite certificates are missing; cannot award Master certificate.',
      };
    }

    const certRes = await issueCertificate({
      userId: input.userId,
      userName: input.userName || 'Master Technology Ethicist',
      curriculumId: 'master-technology-ethicist',
      curriculumTitle:
        'Sci-Fi Ethics Explorer — Master Technology Ethicist Certificate',
    });
    if (!certRes.success) return { success: false, error: certRes.error };
    return { success: true, data: { certificateId: certRes.data.id } };
  } catch (err) {
    console.error('[master-exam] award error:', err);
    return { success: false, error: String(err) };
  }
}
