
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import type { Certificate, CertificateTier } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { requireAdmin } from '@/lib/admin';
import { resolveCertificateTier } from '@/lib/certificate-tier';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function fromDoc(id: string, data: Record<string, any>): Certificate {
  const tier =
    data.tier === 'official' || data.tier === 'community'
      ? (data.tier as CertificateTier)
      : undefined;
  return {
    id,
    userId: data.userId,
    userName: data.userName || '',
    curriculumId: data.curriculumId,
    curriculumTitle: data.curriculumTitle || '',
    verificationHash: data.verificationHash || '',
    tier,
    issuerName: data.issuerName || undefined,
    issuedAt: timestampToDate(data.issuedAt) ?? new Date(),
    revokedAt: timestampToDate(data.revokedAt),
    revokedBy: data.revokedBy,
    revokeReason: data.revokeReason,
  };
}

function makeHash(): string {
  // Short, alphanumeric, sufficient for verification anchor URLs
  return Array.from({ length: 12 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32))
  ).join('');
}

export async function issueCertificate(input: {
  userId: string;
  userName: string;
  curriculumId: string;
  curriculumTitle: string;
  /** Creator of the curriculum (when known). The server resolves their
   *  email via the users collection and decides tier server-side so the
   *  client cannot claim official status. Textbook/master paths omit
   *  this — the curriculumId prefix identifies them as official. */
  creatorId?: string | null;
}): Promise<ActionResult<Certificate>> {
  try {
    // Avoid duplicates
    const existingQ = query(
      collection(db, 'certificates'),
      where('userId', '==', input.userId),
      where('curriculumId', '==', input.curriculumId)
    );
    const existing = await getDocs(existingQ);
    if (!existing.empty) {
      const d = existing.docs[0];
      return { success: true, data: fromDoc(d.id, d.data()) };
    }

    // Resolve the creator's email + display name server-side. This is
    // the one and only input that decides official vs community; we
    // refuse to trust a client-supplied tier.
    let creatorEmail: string | null = null;
    let issuerName: string | null = null;
    if (input.creatorId) {
      try {
        const creatorSnap = await getDoc(doc(db, 'users', input.creatorId));
        if (creatorSnap.exists()) {
          const cd = creatorSnap.data();
          creatorEmail = (cd?.email as string) || null;
          issuerName =
            (cd?.displayName as string) ||
            [cd?.firstName, cd?.lastName].filter(Boolean).join(' ') ||
            null;
        }
      } catch (lookupErr) {
        // Missing profile doc should fail closed (community), not crash.
        console.warn(
          '[certificates] creator lookup failed, defaulting to community tier:',
          lookupErr
        );
      }
    }

    const tier = resolveCertificateTier({
      curriculumId: input.curriculumId,
      creatorEmail,
    });
    const verificationHash = makeHash();
    const ref = await addDoc(collection(db, 'certificates'), {
      userId: input.userId,
      userName: input.userName,
      curriculumId: input.curriculumId,
      curriculumTitle: input.curriculumTitle,
      verificationHash,
      tier,
      issuerName,
      issuedAt: serverTimestamp(),
    });

    const created = await getDoc(ref);
    return { success: true, data: fromDoc(created.id, created.data() || {}) };
  } catch (error) {
    console.error('[certificates] issueCertificate error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getUserCertificates(userId: string): Promise<ActionResult<Certificate[]>> {
  try {
    const q = query(
      collection(db, 'certificates'),
      where('userId', '==', userId),
      orderBy('issuedAt', 'desc')
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => fromDoc(d.id, d.data())) };
  } catch (error) {
    console.error('[certificates] getUserCertificates error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getCertificateByHash(hash: string): Promise<ActionResult<Certificate | null>> {
  try {
    const q = query(
      collection(db, 'certificates'),
      where('verificationHash', '==', hash)
    );
    const snap = await getDocs(q);
    if (snap.empty) return { success: true, data: null };
    const d = snap.docs[0];
    return { success: true, data: fromDoc(d.id, d.data()) };
  } catch (error) {
    console.error('[certificates] getCertificateByHash error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getCertificate(certId: string): Promise<ActionResult<Certificate | null>> {
  try {
    const snap = await getDoc(doc(db, 'certificates', certId));
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: fromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[certificates] getCertificate error:', error);
    return { success: false, error: String(error) };
  }
}

export async function getAllCertificates(adminUid: string): Promise<ActionResult<Certificate[]>> {
  try {
    await requireAdmin(adminUid);
    const snap = await getDocs(query(collection(db, 'certificates'), orderBy('issuedAt', 'desc')));
    return { success: true, data: snap.docs.map((d) => fromDoc(d.id, d.data())) };
  } catch (error: any) {
    console.error('[certificates] getAllCertificates error:', error);
    return { success: false, error: error.message };
  }
}

export async function revokeCertificate(
  certId: string,
  adminUid: string,
  reason?: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin(adminUid);
    await updateDoc(doc(db, 'certificates', certId), {
      revokedAt: serverTimestamp(),
      revokedBy: adminUid,
      revokeReason: reason || null,
    });
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[certificates] revokeCertificate error:', error);
    return { success: false, error: error.message };
  }
}
