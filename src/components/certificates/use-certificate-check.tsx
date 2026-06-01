'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { checkAndAwardCertificates } from '@/app/actions/achievement-certificates';
import type { CertificateCategory } from '@/lib/certificates/registry';

/**
 * Shared hook every activity-completion screen uses to "let the certificate
 * system check" after recording progress. It runs the idempotent award engine
 * and, for any newly-earned certificate, shows a congratulatory toast with a
 * View button. Reusable so no screen re-implements certificate logic.
 *
 * Usage (fire-and-forget after the activity finishes):
 *   const checkCertificates = useCertificateCheck();
 *   checkCertificates(user?.uid, { categories: ['stories'] });
 */
export function useCertificateCheck() {
  const { toast } = useToast();
  const router = useRouter();

  return useCallback(
    async (
      userId?: string | null,
      opts?: { categories?: CertificateCategory[]; communityId?: string }
    ): Promise<void> => {
      if (!userId) return;
      try {
        const res = await checkAndAwardCertificates(userId, opts);
        if (!res.success) return;
        for (const cert of res.data.newlyEarned) {
          toast({
            title: '🎉 Certificate earned!',
            description: `You earned the ${cert.curriculumTitle}.`,
            action: (
              <ToastAction
                altText="View your new certificate"
                onClick={() =>
                  router.push(`/certificates/${cert.verificationHash}`)
                }
              >
                View
              </ToastAction>
            ),
          });
        }
        for (const badge of res.data.newlyEarnedBadges) {
          toast({
            title: '🎉 New badge!',
            description: `You earned the "${badge.name}" badge.`,
            action: (
              <ToastAction
                altText="View your badges"
                onClick={() => router.push('/profile')}
              >
                View
              </ToastAction>
            ),
          });
        }
      } catch (err) {
        // Never let a certificate check disrupt the activity flow.
        console.warn('[certificates] check failed:', err);
      }
    },
    [toast, router]
  );
}
