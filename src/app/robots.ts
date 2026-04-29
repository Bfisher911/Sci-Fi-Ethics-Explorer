import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Robots policy. Allows public surfaces (textbook, stories, philosophers,
 * authors, media, glossary, blog, marketing pages) and disallows the
 * authenticated app shell + admin tooling + API endpoints.
 *
 * Generated at build time per Next.js conventions — no runtime cost.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/dashboard',
          '/dashboard/*',
          '/profile',
          '/profile/*',
          '/me',
          '/me/*',
          '/billing',
          '/billing/*',
          '/onboarding',
          '/login',
          '/signup',
          '/verify/*',
          // Bookmarks, classroom, communities, etc. exist for signed-in
          // users only — no value in indexing them.
          '/bookmarks',
          '/communities/*',
          '/classroom/*',
          '/curriculum/*',
          '/workshops/*',
          '/messages/*',
          '/studio',
          '/notifications',
          '/leaderboard',
          // Don't index Google's auth callback or any *_*-style internal
          // utility paths.
          '/_next/*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
