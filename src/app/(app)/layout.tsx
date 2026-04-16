
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

/**
 * Path prefixes that are readable without authentication. Anonymous users
 * land here from the marketing site (Explore / Archive footer links) and
 * see a slim public shell rather than getting bounced to /login.
 */
const PUBLIC_PATH_PREFIXES = ['/stories', '/philosophers', '/scifi-authors', '/scifi-media', '/glossary', '/blog', '/community-blog', '/textbook'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { subscriptionStatus, loading: subLoading } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const publicPath = isPublicPath(pathname);

  const showOnboardingBanner =
    !subLoading &&
    user &&
    subscriptionStatus === 'none' &&
    pathname !== '/onboarding';

  useEffect(() => {
    // Redirect unauthenticated users to /login UNLESS they are visiting a
    // public-readable path (stories/philosophers/glossary) — those render
    // in a slim anonymous shell instead.
    if (
      !loading &&
      !user &&
      pathname !== '/login' &&
      pathname !== '/signup' &&
      !publicPath
    ) {
      router.push('/login');
    }
  }, [user, loading, router, pathname, publicPath]);

  if (loading) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-muted-foreground">Loading Sci-Fi Ethics Explorer...</p>
          </div>
       </div>
    );
  }

  // Anonymous user on a public-readable path: render a slim public shell
  // instead of the full app sidebar. No auth required.
  if (!user && publicPath) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-6 w-1 bg-primary rounded-full group-hover:h-8 transition-all" />
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-headline font-bold text-base tracking-tight">
                Sci-Fi Ethics Explorer
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
                  Login
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link href={`/signup?next=${encodeURIComponent(pathname)}`}>
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
        <footer className="border-t border-border/60 bg-card/30 py-4">
          <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
            Free reading • <Link href="/pricing" className="text-primary hover:underline">Subscribe</Link> to unlock interactive tools, communities, and more.
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated check: anyone hitting a non-public path without a session
  // gets the loader while the redirect takes effect.
  if (!user && pathname !== '/login' && pathname !== '/signup') {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
       </div>
    );
  }
  
  // 🔁 PATCH: Remove direct rendering of old /auth page within this layout (BF 2025-06-06)
  // The (auth) layout will handle /login and /signup
  // if (pathname === '/auth') {
  //   return <>{children}</>; 
  // }
  // 🔁 END PATCH


  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {showOnboardingBanner && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <span>
                Complete your setup to unlock all features.
              </span>
              <Link
                href="/onboarding"
                className="ml-4 shrink-0 font-medium text-primary hover:underline"
              >
                Finish setup
              </Link>
            </div>
          )}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
