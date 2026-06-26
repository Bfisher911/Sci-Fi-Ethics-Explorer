'use client';

/**
 * SiteFooterGate — renders the global <SiteFooter/> everywhere EXCEPT on
 * routes that are intentionally chrome-free (distraction-free campaign /
 * funnel landing pages). The footer is mounted once in the root layout,
 * so this client gate is how we opt specific routes out of it without
 * making the root layout itself a client component.
 *
 * Keep this list tight — it's only for self-contained conversion pages
 * that supply their own minimal header and CTA.
 */

import { usePathname } from 'next/navigation';
import { SiteFooter } from '@/components/layout/site-footer';

/** Path prefixes that should NOT show the global footer. */
const FOOTERLESS_PREFIXES = ['/welcome'];

export function SiteFooterGate(): JSX.Element | null {
  const pathname = usePathname();
  const hidden = FOOTERLESS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (hidden) return null;
  return <SiteFooter />;
}
