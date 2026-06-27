/**
 * /welcome — standalone, immersive campaign landing page (sales funnel).
 *
 * Deliberately chrome-free: no app sidebar, no marketing nav, no global
 * footer (opted out in <SiteFooterGate/>). One job — convert a cold
 * visitor into a signup. Every primary CTA points at `/signup`.
 *
 * This server shell keeps the page's metadata; all the interactive,
 * animated craft lives in <WelcomeExperience/> (a client component) so
 * effects load on the client behind reduced-motion + device guards while
 * the copy still server-renders for SEO and no-JS users.
 */

import type { Metadata } from 'next';
import { WelcomeExperience } from '@/components/welcome/welcome-experience';

export const metadata: Metadata = {
  title: 'Start exploring the ethics of the future',
  description:
    'Read science fiction, decide real dilemmas, defend your reasoning, and build a personal ethics profile. Free to begin — no credit card required.',
};

export default function WelcomePage() {
  return <WelcomeExperience />;
}
