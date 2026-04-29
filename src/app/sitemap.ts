import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { chapters as TEXTBOOK_CHAPTERS } from '@/data/textbook';
import { philosopherData } from '@/data/philosophers';
import { ethicalTheories } from '@/data/ethical-theories';
import { scifiAuthorData } from '@/data/scifi-authors';
import { scifiMediaData } from '@/data/scifi-media';
import { mockStories } from '@/data/stories';

/**
 * Sitemap. Built statically from the seeded data files — only public,
 * crawlable surfaces. Skips the authenticated app shell (/me, /profile,
 * /communities, …) since those are personal and not useful to index.
 *
 * Per Next.js App Router conventions, exported as the default function
 * from `src/app/sitemap.ts`. Output is `/sitemap.xml`.
 *
 * Frequencies and priorities are honest signals to crawlers, not
 * marketing chest-thumping: the textbook is updated occasionally and
 * is the platform's biggest SEO asset, so it gets weekly + 0.9; the
 * static reference entries are nearly-evergreen so they get monthly.
 */

const NOW = new Date();

function url(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly',
  priority: number = 0.5,
  lastModified: Date = NOW,
): MetadataRoute.Sitemap[number] {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return {
    url: `${SITE_URL}${cleanPath}`,
    lastModified,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // ─── Static surfaces ──────────────────────────────────────────────
  entries.push(url('/', 'weekly', 1.0));
  entries.push(url('/about', 'monthly', 0.6));
  entries.push(url('/pricing', 'monthly', 0.7));
  entries.push(url('/privacy', 'yearly', 0.3));
  entries.push(url('/terms', 'yearly', 0.3));
  entries.push(url('/whats-new', 'weekly', 0.6));
  entries.push(url('/blog', 'weekly', 0.7));

  // ─── Textbook ─────────────────────────────────────────────────────
  entries.push(url('/textbook', 'weekly', 0.9));
  for (const ch of TEXTBOOK_CHAPTERS) {
    entries.push(url(`/textbook/chapters/${ch.slug}`, 'monthly', 0.8));
  }

  // ─── Reference entities ───────────────────────────────────────────
  entries.push(url('/philosophers', 'monthly', 0.7));
  for (const p of philosopherData) {
    entries.push(url(`/philosophers/${p.id}`, 'monthly', 0.6));
  }
  entries.push(url('/glossary', 'monthly', 0.7));
  for (const t of ethicalTheories) {
    entries.push(url(`/glossary/${t.id}`, 'monthly', 0.6));
  }
  entries.push(url('/scifi-authors', 'monthly', 0.7));
  for (const a of scifiAuthorData) {
    entries.push(url(`/scifi-authors/${a.id}`, 'monthly', 0.6));
  }
  entries.push(url('/scifi-media', 'monthly', 0.7));
  for (const m of scifiMediaData) {
    entries.push(url(`/scifi-media/${m.id}`, 'monthly', 0.6));
  }

  // ─── Stories ──────────────────────────────────────────────────────
  // Seeded site stories only — user-submitted dilemmas would need a
  // server-side fetch and aren't included to keep sitemap generation
  // pure-static.
  entries.push(url('/stories', 'weekly', 0.8));
  for (const s of mockStories) {
    entries.push(url(`/stories/${s.id}`, 'monthly', 0.5));
  }

  return entries;
}
