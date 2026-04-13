
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

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { subscriptionStatus, loading: subLoading } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();

  const showOnboardingBanner =
    !subLoading &&
    user &&
    subscriptionStatus === 'none' &&
    pathname !== '/onboarding';

  useEffect(() => {
    // 🔁 PATCH: Redirect to new /login page if unauthenticated (BF 2025-06-06)
    // Also ensure /auth (old page) is not accessible within this layout
    if (!loading && !user && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login'); 
    }
    // 🔁 END PATCH
  }, [user, loading, router, pathname]);

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

  // 🔁 PATCH: Condition to redirect to /login if unauthenticated (BF 2025-06-06)
  if (!user && pathname !== '/login' && pathname !== '/signup') {
  // 🔁 END PATCH
    // Still loading or redirecting, show loader
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
