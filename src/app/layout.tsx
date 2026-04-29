import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { SiteFooter } from '@/components/layout/site-footer';
import { cn } from '@/lib/utils';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sci-Fi Ethics Explorer | Navigate the Moral Maze of the Future',
    template: '%s | Sci-Fi Ethics Explorer'
  },
  description: 'Dive into thought-provoking ethical dilemmas inspired by science fiction. Analyze scenarios, explore theories, and ponder the consequences of technological advancement.',
  keywords: ['science fiction', 'ethics', 'moral dilemmas', 'philosophy', 'AI ethics', 'future technologies'],
  authors: [{ name: 'Sci-Fi Ethics Explorer Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Sci-Fi Ethics Explorer',
    title: 'Sci-Fi Ethics Explorer | Navigate the Moral Maze of the Future',
    description: 'Explore the intersection of technology and morality through the lens of science fiction.',
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: 'Sci-Fi Ethics Explorer Hero',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sci-Fi Ethics Explorer',
    description: 'Navigate the Moral Maze of the Future.',
    images: ['/images/hero.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background text-foreground flex flex-col')} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          {/* Site-wide footer. The (app) shell's SidebarProvider fills
              the viewport with `min-h-svh`, so this footer sits below
              the fold for signed-in users (who already have all
              navigation in the sidebar). Marketing / legal pages
              outside the (app) shell get the footer immediately under
              their content — that's the primary surface for legal /
              changelog discoverability. */}
          <SiteFooter />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
